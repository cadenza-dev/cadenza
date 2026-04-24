#!/usr/bin/env bash
# PostToolUse hook (Write|Edit): apply local formatters to files that have
# deterministic, safe formatters in the repo workflow.
#
# - Markdown: markdownlint-cli2 --fix
# - Shell: shfmt -w (options come from repo .editorconfig)
#
# This hook is advisory and fail-open. It never blocks the tool call that
# already succeeded, and it skips gracefully when optional tools are absent.

set -uo pipefail

if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

checksum() {
  cksum "$1" 2>/dev/null | awk '{print $1 ":" $2}'
}

format_markdown() {
  if ! command -v markdownlint-cli2 >/dev/null 2>&1; then
    exit 0
  fi

  before=$(checksum "$FILE_PATH")
  output=$(cd "$REPO_ROOT" && markdownlint-cli2 --fix "$FILE_PATH" 2>&1)
  status=$?
  after=$(checksum "$FILE_PATH")

  if [ "$before" != "$after" ]; then
    echo "format (markdownlint-cli2 --fix): $FILE_PATH" >&2
  fi

  if [ "$status" -ne 0 ] && [ -n "$output" ]; then
    echo "$output" | sed 's/^/markdown-format: /' >&2
  fi
}

format_shell() {
  if ! command -v shfmt >/dev/null 2>&1; then
    exit 0
  fi

  before=$(checksum "$FILE_PATH")
  output=$(shfmt -w "$FILE_PATH" 2>&1)
  status=$?
  after=$(checksum "$FILE_PATH")

  if [ "$before" != "$after" ]; then
    echo "format (shfmt -w): $FILE_PATH" >&2
  fi

  if [ "$status" -ne 0 ] && [ -n "$output" ]; then
    echo "$output" | sed 's/^/shfmt: /' >&2
  fi
}

case "$FILE_PATH" in
  *.md) format_markdown ;;
  *.sh) format_shell ;;
esac

exit 0
