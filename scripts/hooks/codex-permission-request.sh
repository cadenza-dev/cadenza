#!/usr/bin/env bash
# Codex PermissionRequest wrapper for Bash approval prompts. It denies requests
# only when the shared dangerous-bash policy identifies a hard violation.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INPUT=$(cat)
TMP_ERR=$(mktemp)

printf "%s" "$INPUT" | bash "$REPO_ROOT/scripts/hooks/block-dangerous-bash.sh" 2>"$TMP_ERR"
status=$?
message=$(cat "$TMP_ERR")
rm -f "$TMP_ERR"

if [ "$status" -eq 2 ]; then
  if command -v jq >/dev/null 2>&1; then
    jq -n --arg message "$message" '{
      hookSpecificOutput: {
        hookEventName: "PermissionRequest",
        decision: {
          behavior: "deny",
          message: $message
        }
      }
    }'
  else
    echo "$message" >&2
    exit 2
  fi
fi

exit 0
