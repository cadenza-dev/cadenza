#!/usr/bin/env bash
# Phase 0 fallback hygiene for Cadenza spec files.

set -euo pipefail

target="${1:-}"

if [ -n "$target" ]; then
  if [ ! -f "$target" ]; then
    echo "Scope:         $target"
    echo "Tool used:     bundled fallback"
    echo "Files scanned: 0"
    echo "Findings:"
    echo "  - $target : error : file not found"
    echo ""
    echo "Summary:      1 errors"
    echo "Exit:         1"
    exit 1
  fi
  files=("$target")
else
  shopt -s globstar nullglob
  files=(spec/**/*.md)
fi

errors=0
warnings=0
findings=()

for file in "${files[@]}"; do
  if ! grep -Eq 'CONTRACT_DRAFT|CONTRACT_FROZEN|DEPRECATED' "$file"; then
    findings+=("$file : error : missing status marker")
    errors=$((errors + 1))
  fi

  if ! grep -Eq '[A-Z][A-Z0-9_]*-[0-9]+' "$file"; then
    findings+=("$file : warn : no requirement IDs found")
    warnings=$((warnings + 1))
  fi

  case "$(basename "$file")" in
    SPEC_TEST_MATRIX.md)
      while IFS= read -r req_id; do
        [ -n "$req_id" ] || continue
        phase_dir="$(dirname "$file")"
        if ! grep -R --exclude='SPEC_TEST_MATRIX.md' -q "$req_id" "$phase_dir"; then
          findings+=("$file : error : requirement $req_id has no originating spec in $phase_dir")
          errors=$((errors + 1))
        fi
      done < <(grep -Eo '[A-Z][A-Z0-9_]*-[0-9]+' "$file" | sort -u)
      ;;
  esac
done

scope="all specs"
[ -n "$target" ] && scope="$target"

echo "Scope:         $scope"
echo "Tool used:     bundled fallback"
echo "Files scanned: ${#files[@]}"
echo "Findings:"
if [ "${#findings[@]}" -eq 0 ]; then
  echo "  - none : info : no findings"
else
  for finding in "${findings[@]}"; do
    echo "  - $finding"
  done
fi
echo ""

if [ "$errors" -gt 0 ]; then
  echo "Summary:      $errors errors"
  echo "Exit:         1"
  exit 1
fi

if [ "$warnings" -gt 0 ]; then
  echo "Summary:      $warnings warnings"
else
  echo "Summary:      OK"
fi
echo "Exit:         0"
