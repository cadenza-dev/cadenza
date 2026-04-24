#!/usr/bin/env bash
# SessionStart hook: print current phase, suggested role mapping,
# and remind the agent to run AGENTS.md §4 Startup Protocol.
# stdout is injected into the agent's context. Exit 0 always.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATUS_FILE="$REPO_ROOT/STATUS.yaml"

# Reset session-local lint counters used by post-md-edit.sh.
# These track recurring markdown-lint warnings for a single session only,
# so the threshold-based "suggest project-level config" prompt fires at
# most once per rule per session.
rm -f "$REPO_ROOT/.claude/local/md-lint-counts.json" 2>/dev/null || true

echo ""
echo "=== Cadenza — Session Brief ==="

# Current phase (best-effort YAML parse; no `yq` dependency)
if [ -f "$STATUS_FILE" ]; then
  CURRENT_PHASE=$(awk -F: '/^[[:space:]]*current_phase[[:space:]]*:/ { gsub(/^[[:space:]"\047]+|[[:space:]"\047]+$/, "", $2); print $2; exit }' "$STATUS_FILE")
  [ -z "${CURRENT_PHASE:-}" ] && CURRENT_PHASE="(not set)"
  echo "Current phase:  $CURRENT_PHASE"
else
  echo "Current phase:  (STATUS.yaml not found — likely Phase 0 pre-init)"
fi

echo ""
echo "Suggested role → model/tool mapping (advisory, NOT enforced):"
echo "  scout      →  gemini-3-1-pro    via  gemini-cli"
echo "  architect  →  claude-opus-4-7   via  claude-code"
echo "       (or)  →  gpt-5-5           via  codex"
echo "  builder    →  gpt-5-5           via  codex"

echo ""
if [ -n "${CADENZA_AGENT_ROLE:-}" ]; then
  echo "CADENZA_AGENT_ROLE is set to: ${CADENZA_AGENT_ROLE}"
else
  echo "CADENZA_AGENT_ROLE is unset — boundary hooks default to 'architect'."
fi

echo ""
echo ">>> MANDATORY before any write: follow AGENTS.md §4 Startup Protocol."
echo "    1. Self-report model + tool"
echo "    2. Compare to §3 suggested mapping"
echo "    3. If mismatch OR uncertain → STOP and ask user"
echo "    4. Proceed only on explicit user approval"
echo ""
echo "Read order (AGENTS.md §1):"
echo "  AGENTS.md → STATUS.yaml → docs/adr/README.md → analysis-final.md §0"
echo "  → prompt/PHASE<N>_KICK_<ROLE>.md → spec/<phase>/ → trace/<phase>/tracker.md"
echo "==============================="
echo ""

exit 0
