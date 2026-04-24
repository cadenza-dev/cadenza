#!/usr/bin/env bash
# One-time per-developer setup for Codex slash commands on Cadenza.
# Symlinks .codex/prompts/cadenza-*.md to ~/.codex/prompts/ .
# Safe to re-run: it replaces existing cadenza-* symlinks and prunes orphans.
#
# Why this exists:
#   Codex custom prompts are user-scope only. The repo keeps generated Codex
#   prompt artifacts under .codex/prompts/, and each developer installs
#   symlinks into ~/.codex/prompts/. The "cadenza-" prefix keeps this
#   project's commands from colliding with other projects.
#
# After running, invoke commands in Codex as:
#   /prompts:cadenza-onboard
#   /prompts:cadenza-phase-status
#   /prompts:cadenza-spec-lint

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/.codex/prompts"
CODEX_DIR="${CODEX_HOME:-$HOME/.codex}/prompts"
PREFIX="cadenza-"

if [ -x "$REPO_ROOT/scripts/commands-sync.sh" ]; then
  "$REPO_ROOT/scripts/commands-sync.sh" --codex-only >/dev/null
fi

if [ ! -d "$SRC" ]; then
  echo "error: no Codex prompt source directory at $SRC" >&2
  echo "hint: run scripts/commands-sync.sh --codex-only from the repo root" >&2
  exit 1
fi

mkdir -p "$CODEX_DIR"

# ------------------------------------------------------------------
# Install current symlinks
# ------------------------------------------------------------------
declare -A expected=()
count=0

for src_file in "$SRC/${PREFIX}"*.md; do
  [ -f "$src_file" ] || continue
  name=$(basename "$src_file")

  dst="$CODEX_DIR/$name"
  ln -sfn "$src_file" "$dst"
  expected["$name"]=1
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  echo "error: no Codex prompts found at $SRC/${PREFIX}*.md" >&2
  exit 1
fi

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
for src_file in "$SRC/${PREFIX}"*.md; do
  [ -f "$src_file" ] || continue
  name=$(basename "$src_file" .md)
  echo "  /prompts:${name}"
done
echo ""
echo "Restart Codex (CLI or IDE) to pick up new prompts."
