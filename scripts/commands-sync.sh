#!/usr/bin/env bash
# Sync commands/*.md to per-tool bridge locations:
#   - .claude/commands/<name>.md   (relative symlinks; OpenCode also reads these as fallback)
#   - .gemini/commands/<name>.toml (generated TOML)
#   - .codex/prompts/cadenza-<name>.md (generated Codex custom prompts)
#
# Safe to re-run. Removes stale symlinks/artifacts for commands that no longer exist in commands/.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/commands"
CC_DIR="$REPO_ROOT/.claude/commands"
GEM_DIR="$REPO_ROOT/.gemini/commands"
CODEX_DIR="$REPO_ROOT/.codex/prompts"
CODEX_PREFIX="cadenza-"

sync_claude=1
sync_gemini=1
sync_codex=1

case "${1:-}" in
"" | --all)
  ;;
--codex-only)
  sync_claude=0
  sync_gemini=0
  ;;
-h | --help)
  cat <<'USAGE'
Usage: scripts/commands-sync.sh [--all|--codex-only]

Sync commands/*.md to tool-specific bridge artifacts.

  --all          Sync Claude Code, Gemini CLI, and Codex artifacts (default).
  --codex-only   Sync only .codex/prompts/cadenza-*.md artifacts.
USAGE
  exit 0
  ;;
*)
  echo "error: unknown argument: $1" >&2
  exit 1
  ;;
esac

if [ ! -d "$SRC" ]; then
  echo "error: no commands/ directory at $SRC" >&2
  exit 1
fi

[ "$sync_claude" -eq 1 ] && mkdir -p "$CC_DIR"
[ "$sync_gemini" -eq 1 ] && mkdir -p "$GEM_DIR"
[ "$sync_codex" -eq 1 ] && mkdir -p "$CODEX_DIR"

is_command_file() {
  local name="$1"
  # Exclude documentation indexes and anything dot-prefixed.
  case "$name" in
  README.md | INDEX.md | .*) return 1 ;;
  *.md) return 0 ;;
  *) return 1 ;;
  esac
}

frontmatter_field() {
  local field="$1"
  local file="$2"

  awk -v field="$field" '
    BEGIN { in_fm = 0; line_num = 0; prefix = "^" field ":" }
    /^---[[:space:]]*$/ {
      line_num++
      if (line_num == 1) { in_fm = 1; next }
      if (line_num == 2) { in_fm = 0; exit }
    }
    in_fm && $0 ~ prefix {
      sub(prefix "[[:space:]]*", "")
      gsub(/^["\x27]|["\x27]$/, "")
      print
      exit
    }
  ' "$file"
}

command_body() {
  local file="$1"

  awk '
    BEGIN { in_fm = 0; past_fm = 0; fm_seen = 0 }
    NR == 1 && /^---[[:space:]]*$/ { in_fm = 1; fm_seen = 1; next }
    fm_seen && in_fm && /^---[[:space:]]*$/ { in_fm = 0; past_fm = 1; next }
    past_fm || !fm_seen { print }
  ' "$file"
}

toml_basic_escape() {
  sed 's/\\/\\\\/g; s/"/\\"/g'
}

yaml_double_escape() {
  sed 's/\\/\\\\/g; s/"/\\"/g'
}

# ------------------------------------------------------------------
# Pass 1 — Claude Code: relative symlinks
# ------------------------------------------------------------------
cc_count=0
declare -A kept_cc=()

if [ "$sync_claude" -eq 1 ]; then
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
fi

# ------------------------------------------------------------------
# Pass 2 — Gemini CLI: generated TOML
# ------------------------------------------------------------------
gem_count=0
declare -A kept_gem=()

if [ "$sync_gemini" -eq 1 ]; then
  for src_file in "$SRC"/*.md; do
    [ -f "$src_file" ] || continue
    name_noext=$(basename "$src_file" .md)
    is_command_file "$(basename "$src_file")" || continue

    dst="$GEM_DIR/$name_noext.toml"

    desc=$(frontmatter_field "description" "$src_file")
    [ -z "$desc" ] && desc="Cadenza command: $name_noext"

    body=$(command_body "$src_file")

    # Translate $ARGUMENTS / $1..$9 → {{args}} for Gemini.
    body_tr=$(printf '%s' "$body" | sed -E 's/\$ARGUMENTS/{{args}}/g; s/\$[1-9]/{{args}}/g')

    # Write TOML. Use literal multi-line strings ('''...''') to avoid escape issues.
    {
      printf '# GENERATED — do not edit by hand.\n'
      printf '# Source: commands/%s.md\n' "$name_noext"
      printf '# Regenerate: scripts/commands-sync.sh\n\n'
      desc_esc=$(printf '%s' "$desc" | toml_basic_escape)
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
fi

# ------------------------------------------------------------------
# Pass 3 — Codex: generated custom prompts
# ------------------------------------------------------------------
codex_count=0
declare -A kept_codex=()

if [ "$sync_codex" -eq 1 ]; then
  for src_file in "$SRC"/*.md; do
    [ -f "$src_file" ] || continue
    name_noext=$(basename "$src_file" .md)
    is_command_file "$(basename "$src_file")" || continue

    dst="$CODEX_DIR/${CODEX_PREFIX}${name_noext}.md"
    desc=$(frontmatter_field "description" "$src_file")
    arg_hint=$(frontmatter_field "argument-hint" "$src_file")
    body=$(command_body "$src_file")
    [ -z "$desc" ] && desc="Cadenza command: $name_noext"

    {
      printf '%s\n' '---'
      desc_esc=$(printf '%s' "$desc" | yaml_double_escape)
      printf 'description: "%s"\n' "$desc_esc"
      if [ -n "$arg_hint" ]; then
        arg_hint_esc=$(printf '%s' "$arg_hint" | yaml_double_escape)
        printf 'argument-hint: "%s"\n' "$arg_hint_esc"
      fi
      printf '%s\n\n' '---'
      printf '%s' "$body"
      case "$body" in *$'\n') ;; *) printf '\n' ;; esac
    } >"$dst"

    kept_codex["${CODEX_PREFIX}${name_noext}.md"]=1
    codex_count=$((codex_count + 1))
  done

  # Prune stale generated Codex prompt artifacts.
  for f in "$CODEX_DIR/${CODEX_PREFIX}"*.md; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    if [ -z "${kept_codex[$name]:-}" ]; then
      rm -f "$f"
      echo "pruned stale artifact: .codex/prompts/$name"
    fi
  done
fi

# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------
echo ""
echo "commands-sync: done"
if [ "$sync_claude" -eq 1 ]; then
  echo "  Claude Code (.claude/commands/): $cc_count symlink(s)"
fi
if [ "$sync_gemini" -eq 1 ]; then
  echo "  Gemini CLI  (.gemini/commands/): $gem_count TOML artifact(s)"
fi
if [ "$sync_codex" -eq 1 ]; then
  echo "  Codex       (.codex/prompts/):   $codex_count Markdown prompt(s)"
fi
echo ""
if [ "$sync_codex" -eq 1 ]; then
  echo "Run scripts/install-codex-commands.sh once per dev machine to symlink Codex prompts into ~/.codex/prompts/."
fi
