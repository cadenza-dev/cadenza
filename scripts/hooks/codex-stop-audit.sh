#!/usr/bin/env bash
# Codex Stop wrapper. Stop hooks require JSON stdout, so this adapts the shared
# advisory stop audit into a Codex systemMessage.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

audit=$(bash "$REPO_ROOT/scripts/hooks/session-stop-audit.sh" 2>&1 >/dev/null || true)

if command -v jq >/dev/null 2>&1; then
  if [ -n "$audit" ]; then
    jq -n --arg audit "$audit" '{ continue: true, systemMessage: $audit }'
  else
    jq -n '{ continue: true }'
  fi
else
  echo '{"continue":true}'
fi
