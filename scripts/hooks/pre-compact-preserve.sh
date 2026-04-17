#!/usr/bin/env bash
# PreCompact hook: emit the smallest critical context slab that must survive /compact.
# stdout is injected back into the agent's context after compaction completes.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATUS_FILE="$REPO_ROOT/STATUS.yaml"

cat <<HEADER

=== Cadenza — preserved context across /compact ===

After compaction, re-read in AGENTS.md §1 Read Order:
  1. AGENTS.md in full — especially §2 (Authority), §4 (Startup Protocol), §7 (Hard Constraints)
  2. STATUS.yaml (below, inline for convenience)
  3. docs/adr/README.md (ADR index)
  4. docs/analysis/analysis-final.en.md §0 (Executive Summary only)
  5. prompt/PHASE<N>_KICK_<ROLE>.md (your role brief)
  6. trace/<current-phase>/tracker.md (if resuming mid-batch)

HEADER

if [ -f "$STATUS_FILE" ]; then
  echo "--- STATUS.yaml ---"
  cat "$STATUS_FILE"
  echo "--- end STATUS.yaml ---"
else
  echo "(STATUS.yaml absent — likely Phase 0 pre-init)"
fi

cat <<FOOTER

Before taking any write action after compaction, re-confirm:
  - Your role per AGENTS.md §3 and that §4 Startup Protocol was already run
    in this session (do not re-run if you already have user approval).
  - The current phase's exit criteria (STATUS.yaml + trace/<phase>/status.yaml).
  - Any CONTRACT_FROZEN files relevant to your task.

=== end preserved context ===

FOOTER

exit 0
