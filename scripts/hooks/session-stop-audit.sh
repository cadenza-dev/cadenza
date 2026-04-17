#!/usr/bin/env bash
# Stop hook: audit session exit state. Never block the stop itself.
# Writes advisory notes to stderr when it detects suspicious terminal state.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if ! command -v git >/dev/null 2>&1; then
  exit 0
fi

cd "$REPO_ROOT" 2>/dev/null || exit 0

# Git must be inside a repo; if not, skip silently.
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# 1. Uncommitted-work flag
UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [ "${UNCOMMITTED:-0}" -gt 0 ]; then
  cat >&2 <<NOTE
note (stop-audit): session ends with $UNCOMMITTED uncommitted file(s).
  - If mid-batch pause: fine.
  - If batch is complete: (a) update trace/<phase>/tracker.md, (b) commit.
NOTE
fi

# 2. spec/ or packages/ touched but trace/ not touched → likely missed tracker update
PORCELAIN=$(git status --porcelain 2>/dev/null)
if echo "$PORCELAIN" | grep -qE '(^|\s)(spec/|packages/)' \
   && ! echo "$PORCELAIN" | grep -qE '(^|\s)trace/'; then
  cat >&2 <<NOTE
note (stop-audit): spec/ or packages/ was modified, but trace/<phase>/ was not.
  Per AGENTS.md §7.3, trace/<phase>/tracker.md must be updated when a batch completes.
NOTE
fi

# 3. CONTRACT_FROZEN file touched without explicit override intent
FROZEN_TOUCHED=$(echo "$PORCELAIN" | awk '{print $2}' | while read -r f; do
  [ -f "$f" ] && grep -lE '^[[:space:]]*-?[[:space:]]*\*\*?Status\*\*?:[[:space:]]*CONTRACT_FROZEN' "$f" 2>/dev/null || true
done)
if [ -n "$FROZEN_TOUCHED" ]; then
  cat >&2 <<NOTE
note (stop-audit): modified CONTRACT_FROZEN file(s):
$FROZEN_TOUCHED
  per AGENTS.md §7.1, frozen files require explicit user approval — confirm this
  change was approved in the current session before committing.
NOTE
fi

exit 0
