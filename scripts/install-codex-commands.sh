#!/usr/bin/env bash
# One-time per-developer setup for Codex slash commands on Cadenza.
# Symlinks commands/*.md to ~/.codex/prompts/cadenza-*.md .
# Safe to re-run: it replaces existing cadenza-* symlinks and prunes orphans.
#
# Why this exists:
#   Codex custom prompts are user-scope only (openai/codex#7480). To share
#   project-level slash commands across a team, each developer installs
#   project symlinks into ~/.codex/prompts/. The "cadenza-" prefix keeps
#   this project's commands from colliding with other projects.
#
# After running, invoke commands in Codex as:
#   /prompts:cadenza-onboard
#   /prompts:cadenza-phase-status
#   /prompts:cadenza-spec-lint

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/commands"
CODEX_DIR="${CODEX_HOME:-$HOME/.codex}/prompts"
PREFIX="cadenza-"

if [ ! -d "$SRC" ]; then
  echo "error: no commands/ directory at $SRC" >&2
  exit 1
fi

mkdir -p "$CODEX_DIR"

# ------------------------------------------------------------------
# Install current symlinks
# ------------------------------------------------------------------
declare -A expected=()
count=0

for src_file in "$SRC"/*.md; do
  [ -f "$src_file" ] || continue
  name=$(basename "$src_file" .md)
  case "$name" in README | .*) continue ;; esac

  dst="$CODEX_DIR/${PREFIX}${name}.md"
  ln -sfn "$src_file" "$dst"
  expected["${PREFIX}${name}.md"]=1
  count=$((count + 1))
done

# ------------------------------------------------------------------
# Prune orphan cadenza-* symlinks (commands deleted from the project)
# ------------------------------------------------------------------
pruned=0
for f in "$CODEX_DIR/${PREFIX}"*.md; do
  [ -L "$f" ] || continue
  name=$(basename "$f")
  if [ -z "${expected[$name]:-}" ]; then
    rm -f "$f"
    echo "pruned: $name"
    pruned=$((pruned + 1))
  fi
done

# ------------------------------------------------------------------
# Report
# ------------------------------------------------------------------
echo ""
echo "install-codex-commands: done"
echo "  installed: $count symlink(s) into $CODEX_DIR (prefix: $PREFIX)"
[ "$pruned" -gt 0 ] && echo "  pruned:    $pruned orphan(s)"
echo ""
echo "Invocation in Codex:"
for src_file in "$SRC"/*.md; do
  [ -f "$src_file" ] || continue
  name=$(basename "$src_file" .md)
  case "$name" in README | .*) continue ;; esac
  echo "  /prompts:${PREFIX}${name}"
done
echo ""
echo "Restart Codex (CLI or IDE) to pick up new prompts."
