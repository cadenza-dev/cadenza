#!/usr/bin/env bash
# PreToolUse hook (Write|Edit): enforce the architect's file-write boundary.
# Architect sessions must not write into packages/**/src/** (Builder territory).
# Behavior is tied to CADENZA_AGENT_ROLE (default: architect).
# Exit 2 = block; exit 0 = allow.

set -uo pipefail

SESSION_ROLE="${CADENZA_AGENT_ROLE:-architect}"

# Only architect sessions are constrained by this hook.
if [ "$SESSION_ROLE" != "architect" ]; then
  exit 0
fi

# Requires jq for JSON parsing. Fail-open if missing.
if ! command -v jq >/dev/null 2>&1; then
  echo "warning: jq not installed; architect boundary check skipped" >&2
  exit 0
fi

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Block writes to packages/<anything>/src/**
if echo "$FILE_PATH" | grep -qE '(^|/)packages/[^/]+/src/'; then
  cat >&2 <<BLOCK
Cadenza role boundary (advisory):
  You are operating as architect (CADENZA_AGENT_ROLE=$SESSION_ROLE),
  but the target is Builder territory:

      $FILE_PATH

Options:
  1. Reconsider placement — architect artifacts belong under docs/design/,
     spec/, or docs/adr/.
  2. If you genuinely need to write code as Builder, either:
       (a) launch codex (Builder's suggested tool), or
       (b) override for this session:
             CADENZA_AGENT_ROLE=builder claude
  3. If this boundary is wrong for the project, open an ADR that supersedes
     the current AGENTS.md §3 mapping.

This hook is the advisory enforcement layer for the suggested role binding
documented in AGENTS.md §3–§4.
BLOCK
  exit 2
fi

# Also block direct writes to spec/ if role is explicitly builder
# (caught by a different code path: builder's own hook in Phase 1+).
# Architect writing to spec/ is allowed; no action here.

exit 0
