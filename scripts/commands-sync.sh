#!/usr/bin/env bash
# Sync Cadenza project skills:
#   - skills/cadenza                  (public authoring mono-skill source)
#   - .agents/skills/cadenza-*        (operational skills + generated public mirror)
#   - .claude/skills/cadenza-*        (relative symlinks for Claude Code)
#
# Safe to re-run. Removes stale Claude skill symlinks for Cadenza skills that no
# longer exist in .agents/skills/.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/.agents/skills"
CLAUDE_DIR="$REPO_ROOT/.claude/skills"
PREFIX="cadenza-"
PUBLIC_SKILL_NAME="cadenza-best-practices"
PUBLIC_SKILL_SRC="$REPO_ROOT/skills/cadenza"
PUBLIC_SKILL_AGENT_LINK="$SRC/$PUBLIC_SKILL_NAME"

case "${1:-}" in
  "" | --all | --skills-only) ;;
  -h | --help)
    cat <<'USAGE'
Usage: scripts/commands-sync.sh [--all|--skills-only]

Sync Cadenza skills into .agents/skills/ and .claude/skills/.

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

mkdir -p "$SRC" "$CLAUDE_DIR"

if [ ! -f "$PUBLIC_SKILL_SRC/SKILL.md" ]; then
  echo "error: missing public mono-skill at skills/cadenza/SKILL.md" >&2
  exit 1
fi

if [ -e "$PUBLIC_SKILL_AGENT_LINK" ] || [ -L "$PUBLIC_SKILL_AGENT_LINK" ]; then
  if [ ! -L "$PUBLIC_SKILL_AGENT_LINK" ]; then
    echo "error: .agents/skills/$PUBLIC_SKILL_NAME exists and is not a symlink" >&2
    echo "hint: move or remove it before syncing from skills/cadenza/" >&2
    exit 1
  fi
fi

ln -sfn "../../skills/cadenza" "$PUBLIC_SKILL_AGENT_LINK"

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
