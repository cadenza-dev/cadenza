#!/usr/bin/env bash
# PostToolUse hook (Write|Edit): if a numbered ADR was added/modified,
# warn if docs/adr/README.md does not yet reference it.
# Phase 0: warning only. Phase 1+: a real script will regenerate the index automatically.

set -uo pipefail

if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Match only docs/adr/NNNN-*.md (exclude README.md and template.md)
case "$FILE_PATH" in
  */docs/adr/[0-9][0-9][0-9][0-9]-*.md)
    ;;
  *)
    exit 0
    ;;
esac

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INDEX_FILE="$REPO_ROOT/docs/adr/README.md"

if [ ! -f "$INDEX_FILE" ]; then
  exit 0
fi

ADR_BASENAME=$(basename "$FILE_PATH" .md)
ADR_NUMBER=$(echo "$ADR_BASENAME" | cut -c1-4)

if ! grep -q "$ADR_BASENAME" "$INDEX_FILE"; then
  cat >&2 <<NOTE
note (adr-index): docs/adr/$ADR_BASENAME.md is not referenced in docs/adr/README.md.
  Please add an entry to the index table before ending the session. Template row:

    | [$ADR_NUMBER](./$ADR_BASENAME.md) | <title> | Accepted | $(date +%Y-%m-%d) |
NOTE
fi

exit 0
