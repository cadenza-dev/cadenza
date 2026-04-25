#!/usr/bin/env bash
# Codex SessionStart wrapper. Emits JSON additionalContext so Codex can inject
# the existing Cadenza session brief without treating plain text as hook output.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

brief=$(bash "$REPO_ROOT/scripts/hooks/session-brief.sh" 2>&1 || true)

if command -v jq >/dev/null 2>&1; then
  jq -n --arg brief "$brief" '{
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: $brief
    }
  }'
else
  printf "%s\n" "$brief"
fi
