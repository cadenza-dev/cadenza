#!/usr/bin/env bash
# PostToolUse hook (Write|Edit): if a markdown file was edited,
# run markdownlint-cli2 on it and surface results. Track which rule IDs
# have fired across the session; once a rule's count crosses a threshold,
# emit a ONE-TIME suggestion to relax it at the project config level
# (.markdownlint-cli2.jsonc) rather than keep fixing every file.
#
# Rationale: some warnings are genuine bugs (missing h1, empty links)
# that deserve per-file fixes; others are stylistic preferences
# (line length, bare URLs) that are cheaper to settle once project-wide.
# This hook distinguishes structural vs stylistic rules and biases its
# suggestion accordingly.
#
# Never blocks — PostToolUse is advisory by design. Fail-open on missing
# tools. State persists in .claude/local/md-lint-counts.json (gitignored),
# cleared at SessionStart by session-brief.sh.

set -uo pipefail

# --- Prelude ---
if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

case "$FILE_PATH" in
*.md) ;;
*) exit 0 ;;
esac

[ -f "$FILE_PATH" ] || exit 0

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATE_DIR="$REPO_ROOT/.claude/local"
STATE_FILE="$STATE_DIR/md-lint-counts.json"
THRESHOLD="${CADENZA_MD_LINT_THRESHOLD:-3}"

mkdir -p "$STATE_DIR"
[ -f "$STATE_FILE" ] || echo '{"counts":{},"suggested":[]}' >"$STATE_FILE"

# --- Gracefully skip if markdownlint-cli2 not installed (Phase 0 pre-B-M3) ---
if ! command -v markdownlint-cli2 >/dev/null 2>&1; then
  exit 0
fi

# --- Run lint on the edited file ---
lint_output=$(markdownlint-cli2 "$FILE_PATH" 2>&1 || true)
if [ -z "$lint_output" ] || ! echo "$lint_output" | grep -qE 'MD[0-9]{2,4}'; then
  exit 0
fi

# Extract rule IDs (markdownlint-cli2 format: "path:L:C MD040/rule-name ...")
rule_ids=$(echo "$lint_output" | grep -oE 'MD[0-9]{2,4}' | sort -u)
[ -z "$rule_ids" ] && exit 0

# --- Surface lint summary (always, for every md edit with findings) ---
{
  echo "markdown-lint on: $FILE_PATH"
  echo "$lint_output" | grep -E 'MD[0-9]{2,4}' | sed 's/^/  /' | head -n 12
} >&2

# --- Update per-rule counts ---
for rule in $rule_ids; do
  current=$(jq -r --arg r "$rule" '.counts[$r] // 0' "$STATE_FILE")
  new=$((current + 1))
  tmp=$(mktemp)
  jq --arg r "$rule" --argjson n "$new" '.counts[$r] = $n' "$STATE_FILE" >"$tmp" && mv "$tmp" "$STATE_FILE"
done

# --- Identify rules newly over threshold AND not yet suggested ---
new_suggestions=$(jq -r \
  --argjson threshold "$THRESHOLD" \
  '[.counts | to_entries[] | select(.value >= $threshold) | .key] as $over |
   ($over - .suggested)[]' \
  "$STATE_FILE")

[ -z "$new_suggestions" ] && exit 0

# --- Classify: structural rules → suggest fixing; stylistic → suggest relaxing ---
is_structural() {
  # Heuristic: rules that enforce document structure / safety are
  # usually better fixed than disabled. Adjust per project experience.
  case "$1" in
  MD001 | MD003 | MD022 | MD025 | MD032 | MD042 | MD047) return 0 ;;
  *) return 1 ;;
  esac
}

for rule in $new_suggestions; do
  count=$(jq -r --arg r "$rule" '.counts[$r]' "$STATE_FILE")
  if is_structural "$rule"; then
    cat >&2 <<STRUCTURAL

cadenza-md-lint — recurring STRUCTURAL warning:

  Rule $rule has fired $count times this session. This is a structural
  rule (heading levels, blanks around headings/lists, empty links,
  trailing newline) and is usually better fixed than relaxed.

  Auto-fix across the repo in one pass:

    pnpm exec markdownlint-cli2 --fix "**/*.md" "#node_modules"

  Then review the diff before committing.

STRUCTURAL
  else
    cat >&2 <<STYLISTIC

cadenza-md-lint — recurring STYLISTIC warning:

  Rule $rule has fired $count times this session. If this pattern reflects
  a deliberate Cadenza style choice (not bugs to fix), consider relaxing
  the rule at the project level instead of patching each file:

    Edit .markdownlint-cli2.jsonc at the repo root:

      {
        "config": {
          "$rule": false
        }
      }

    (or with an options object if the rule accepts tuning — see the
    markdownlint rule reference: https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)

  Commit with a one-line rationale in the commit message explaining why
  Cadenza's style permits this pattern. Verify with:

    pnpm lint:md

STYLISTIC
  fi
done

# --- Mark suggestions as emitted so we don't re-prompt this session ---
tmp=$(mktemp)
jq --argjson rules "$(printf '"%s"\n' $new_suggestions | jq -s .)" \
  '.suggested |= (. + $rules | unique)' "$STATE_FILE" >"$tmp" && mv "$tmp" "$STATE_FILE"

exit 0
