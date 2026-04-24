#!/usr/bin/env bash
# Sync Cadenza project skills from the cross-agent source directory:
#   - .agents/skills/cadenza-*        (source of truth)
#   - .claude/skills/cadenza-*        (relative symlinks for Claude Code)
#
# Safe to re-run. Removes stale Claude skill symlinks for Cadenza skills that
# no longer exist in .agents/skills/.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/.agents/skills"
CLAUDE_DIR="$REPO_ROOT/.claude/skills"
PREFIX="cadenza-"

case "${1:-}" in
  "" | --all | --skills-only) ;;
  -h | --help)
    cat <<'USAGE'
Usage: scripts/commands-sync.sh [--all|--skills-only]

Sync .agents/skills/cadenza-* to .claude/skills/ as relative symlinks.

  --all           Sync all supported skill bridges (default).
  --skills-only   Same as --all; kept for explicit caller intent.
USAGE
    exit 0
    ;;
  *)
    echo "error: unknown argument: $1" >&2
    exit 1
    ;;
esac

if [ ! -d "$SRC" ]; then
  echo "error: no skill source directory at $SRC" >&2
  exit 1
fi

mkdir -p "$CLAUDE_DIR"

count=0
declare -A expected=()

for src_dir in "$SRC/${PREFIX}"*; do
  [ -d "$src_dir" ] || continue

  name="$(basename "$src_dir")"
  skill_file="$src_dir/SKILL.md"

  if [ ! -f "$skill_file" ]; then
    echo "warning: skipped .agents/skills/$name because SKILL.md is missing" >&2
    continue
  fi

  dst="$CLAUDE_DIR/$name"
  if [ -e "$dst" ] || [ -L "$dst" ]; then
    if [ ! -L "$dst" ]; then
      echo "error: .claude/skills/$name exists and is not a symlink" >&2
      echo "hint: move or remove it before syncing from .agents/skills/" >&2
      exit 1
    fi
  fi

  ln -sfn "../../.agents/skills/$name" "$dst"
  expected["$name"]=1
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  echo "error: no Cadenza skills found at $SRC/${PREFIX}*/SKILL.md" >&2
  exit 1
fi

pruned=0
for dst in "$CLAUDE_DIR/${PREFIX}"*; do
  [ -e "$dst" ] || [ -L "$dst" ] || continue
  name="$(basename "$dst")"

  if [ -z "${expected[$name]:-}" ] && [ -L "$dst" ]; then
    rm -f "$dst"
    echo "pruned stale symlink: .claude/skills/$name"
    pruned=$((pruned + 1))
  fi
done

echo ""
echo "commands-sync: done"
echo "  Source skills (.agents/skills/): $count Cadenza skill(s)"
echo "  Claude mirror (.claude/skills/): $count symlink(s)"
if [ "$pruned" -gt 0 ]; then
  echo "  Pruned stale Claude symlink(s): $pruned"
fi
