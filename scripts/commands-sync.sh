#!/usr/bin/env bash
# Sync commands/*.md to per-tool bridge locations:
#   - .claude/commands/<name>.md   (relative symlinks; OpenCode also reads these as fallback)
#   - .gemini/commands/<name>.toml (generated TOML)
#
# Codex is NOT synced here — Codex prompts live user-scope only. Use
# scripts/install-codex-commands.sh (run once per developer machine).
#
# Safe to re-run. Removes stale symlinks/artifacts for commands that no longer exist in commands/.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/commands"
CC_DIR="$REPO_ROOT/.claude/commands"
GEM_DIR="$REPO_ROOT/.gemini/commands"

if [ ! -d "$SRC" ]; then
  echo "error: no commands/ directory at $SRC" >&2
  exit 1
fi

mkdir -p "$CC_DIR" "$GEM_DIR"

is_command_file() {
  local name="$1"
  # Exclude READMEs and anything dot-prefixed
  case "$name" in
  README.md | .*) return 1 ;;
  *.md) return 0 ;;
  *) return 1 ;;
  esac
}

# ------------------------------------------------------------------
# Pass 1 — Claude Code: relative symlinks
# ------------------------------------------------------------------
cc_count=0
declare -A kept_cc=()

for src_file in "$SRC"/*.md; do
  [ -f "$src_file" ] || continue
  name=$(basename "$src_file")
  is_command_file "$name" || continue

  dst="$CC_DIR/$name"
  ln -sfn "../../commands/$name" "$dst"
  kept_cc["$name"]=1
  cc_count=$((cc_count + 1))
done

# Prune any .claude/commands/*.md symlinks that no longer have a source.
for f in "$CC_DIR"/*.md; do
  [ -e "$f" ] || [ -L "$f" ] || continue
  name=$(basename "$f")
  if [ -z "${kept_cc[$name]:-}" ] && [ -L "$f" ]; then
    rm -f "$f"
    echo "pruned stale symlink: .claude/commands/$name"
  fi
done

# ------------------------------------------------------------------
# Pass 2 — Gemini CLI: generated TOML
# ------------------------------------------------------------------
gem_count=0
declare -A kept_gem=()

for src_file in "$SRC"/*.md; do
  [ -f "$src_file" ] || continue
  name_noext=$(basename "$src_file" .md)
  is_command_file "$(basename "$src_file")" || continue

  dst="$GEM_DIR/$name_noext.toml"

  # Extract description from YAML frontmatter (between leading --- markers).
  desc=$(awk '
    BEGIN { in_fm = 0; line_num = 0 }
    /^---[[:space:]]*$/ {
      line_num++
      if (line_num == 1) { in_fm = 1; next }
      if (line_num == 2) { in_fm = 0; exit }
    }
    in_fm && /^description:/ {
      sub(/^description:[[:space:]]*/, "")
      gsub(/^["\x27]|["\x27]$/, "")
      print
      exit
    }
  ' "$src_file")
  [ -z "$desc" ] && desc="Cadenza command: $name_noext"

  # Extract body — everything after the closing --- of frontmatter, or whole file if no frontmatter.
  body=$(awk '
    BEGIN { in_fm = 0; past_fm = 0; fm_seen = 0 }
    NR == 1 && /^---[[:space:]]*$/ { in_fm = 1; fm_seen = 1; next }
    fm_seen && in_fm && /^---[[:space:]]*$/ { in_fm = 0; past_fm = 1; next }
    past_fm || !fm_seen { print }
  ' "$src_file")

  # Translate $ARGUMENTS / $1..$9 → {{args}} for Gemini.
  body_tr=$(printf '%s' "$body" | sed -E 's/\$ARGUMENTS/{{args}}/g; s/\$[1-9]/{{args}}/g')

  # Write TOML. Use literal multi-line strings ('''...''') to avoid escape issues.
  {
    printf '# GENERATED — do not edit by hand.\n'
    printf '# Source: commands/%s.md\n' "$name_noext"
    printf '# Regenerate: scripts/commands-sync.sh\n\n'
    # Escape double-quotes and backslashes in description for TOML basic string.
    desc_esc=$(printf '%s' "$desc" | sed 's/\\/\\\\/g; s/"/\\"/g')
    printf 'description = "%s"\n' "$desc_esc"
    printf "prompt = '''\n"
    printf '%s' "$body_tr"
    # Ensure trailing newline before closing delimiter.
    case "$body_tr" in *$'\n') ;; *) printf '\n' ;; esac
    printf "'''\n"
  } >"$dst"

  kept_gem["$name_noext.toml"]=1
  gem_count=$((gem_count + 1))
done

# Prune stale TOML artifacts.
for f in "$GEM_DIR"/*.toml; do
  [ -f "$f" ] || continue
  name=$(basename "$f")
  if [ -z "${kept_gem[$name]:-}" ]; then
    rm -f "$f"
    echo "pruned stale artifact: .gemini/commands/$name"
  fi
done

# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------
echo ""
echo "commands-sync: done"
echo "  Claude Code (.claude/commands/): $cc_count symlink(s)"
echo "  Gemini CLI  (.gemini/commands/): $gem_count TOML artifact(s)"
echo ""
echo "Codex is not synced by this script. Run scripts/install-codex-commands.sh once per dev machine."
