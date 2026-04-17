#!/usr/bin/env bash
# PostToolUse hook (Write|Edit): if the edited file is in spec/, run structural sanity.
# Phase 0: in-script hygiene only. Phase 1+: delegates to `pnpm spec:lint`.
# Exit 0 always — this hook is advisory, it does not retroactively block a successful tool call.

set -uo pipefail

if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Scope: trigger only for spec/**/*.md
case "$FILE_PATH" in
  */spec/*.md|*/spec/*/*.md)
    ;;
  *)
    exit 0
    ;;
esac

if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Contract status marker check
if ! grep -qE 'CONTRACT_FROZEN|CONTRACT_DRAFT|^[[:space:]]*-?[[:space:]]*\*\*?Status\*\*?:' "$FILE_PATH"; then
  cat >&2 <<WARN
note (post-spec-edit): $FILE_PATH
  missing a Status / CONTRACT marker. Add one of:
    - **Status**: CONTRACT_DRAFT
    - **Status**: CONTRACT_FROZEN
  Specs without a status marker are ambiguous and fail the Phase 0 review checklist.
WARN
fi

# Requirement-ID hygiene (best-effort): look for obviously malformed IDs
BAD_IDS=$(grep -oE '^\s*\*\*?ID\*\*?:\s*\S+' "$FILE_PATH" 2>/dev/null \
  | grep -vE '\*\*?ID\*\*?:\s*[A-Z]{2,6}-[0-9]{3,4}$' || true)
if [ -n "$BAD_IDS" ]; then
  cat >&2 <<WARN
note (post-spec-edit): $FILE_PATH contains potentially malformed requirement IDs:
$BAD_IDS
  expected format: <PREFIX>-<DIGITS>  e.g.  TAPI-001  COMP-042
WARN
fi

# Delegate to pnpm spec:lint if the project has been scaffolded
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [ -f "$REPO_ROOT/package.json" ] && command -v pnpm >/dev/null 2>&1; then
  pnpm_output=$(cd "$REPO_ROOT" && pnpm -s spec:lint -- "$FILE_PATH" 2>&1 || true)
  if [ -n "$pnpm_output" ]; then
    echo "$pnpm_output" | sed 's/^/spec:lint: /' >&2
  fi
fi

exit 0
