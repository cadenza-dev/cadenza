#!/usr/bin/env bash
# PreToolUse hook (Bash): block commands that are destructive or trust-violating.
# Overridable via env vars where appropriate. Exit 2 to block; exit 0 to allow.

set -uo pipefail

if ! command -v jq >/dev/null 2>&1; then
  # Without jq we cannot reliably parse the command. Fail-open to avoid
  # blocking legitimate work, but emit a warning.
  echo "warning: jq not installed; dangerous-bash check skipped" >&2
  exit 0
fi

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

if [ -z "$CMD" ]; then
  exit 0
fi

block() {
  local reason="$1"
  cat >&2 <<BLOCK
Cadenza safety gate — command blocked:

  command : $CMD
  reason  : $reason

If this is genuinely intended, STOP here and explicitly ask the user for
approval before re-running. Do NOT silently set environment overrides to
bypass this gate.
BLOCK
  exit 2
}

# --- Pattern checks (conservative; false positives > false negatives) ---

# rm -rf targeting root or home
if echo "$CMD" | grep -qE '\brm[[:space:]]+(-[a-zA-Z]*[rRf][a-zA-Z]*[[:space:]]+)+((/|~|\$HOME|\$\{HOME\})($|[[:space:]/]))'; then
  block "rm -rf targeting /, ~ or \$HOME"
fi

# git push --force (with or without --force-with-lease, still destructive on shared branches)
if echo "$CMD" | grep -qE '\bgit[[:space:]]+push\b.*(--force|--force-with-lease|[[:space:]]-f($|[[:space:]]))'; then
  block "git push --force / -f can overwrite published history — requires explicit user approval"
fi

# git reset --hard
if [ "${CADENZA_ALLOW_RESET:-0}" != "1" ] && echo "$CMD" | grep -qE '\bgit[[:space:]]+reset\b.*--hard\b'; then
  block "git reset --hard discards uncommitted work; set CADENZA_ALLOW_RESET=1 only with user approval"
fi

# git checkout . / git restore . (mass discard of working tree)
if echo "$CMD" | grep -qE '\bgit[[:space:]]+(checkout|restore)[[:space:]]+(\.|\*)($|[[:space:]])'; then
  block "git checkout/restore . discards all uncommitted changes"
fi

# git clean -f / -fd
if echo "$CMD" | grep -qE '\bgit[[:space:]]+clean\b.*[[:space:]]-[a-zA-Z]*f'; then
  block "git clean -f deletes untracked files — confirm the list first"
fi

# git branch -D (force delete)
if echo "$CMD" | grep -qE '\bgit[[:space:]]+branch[[:space:]]+-D\b'; then
  block "git branch -D force-deletes potentially unmerged branches; use -d if the branch is merged"
fi

# package publish
if [ "${CADENZA_ALLOW_PUBLISH:-0}" != "1" ] && echo "$CMD" | grep -qE '\b(npm|pnpm|yarn)[[:space:]]+publish\b'; then
  block "package publish requires explicit user approval; set CADENZA_ALLOW_PUBLISH=1 only after user confirmation"
fi

# Hook/signing bypass flags
if echo "$CMD" | grep -qE '(--no-verify|--no-gpg-sign)'; then
  block "hook/signing bypass flags (--no-verify / --no-gpg-sign); fix the root cause instead"
fi

# Low-level filesystem destruction
if echo "$CMD" | grep -qE '\b(mkfs|shred)\b|\bdd[[:space:]]+[^|&;]*[[:space:]]of=/dev/'; then
  block "low-level filesystem operation detected (mkfs / dd to device / shred)"
fi

# sudo / root escalation
if echo "$CMD" | grep -qE '(^|[[:space:]])sudo[[:space:]]'; then
  block "sudo in an agent-run command requires user approval; execute such commands manually"
fi

exit 0
