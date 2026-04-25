#!/usr/bin/env bash
# Local pre-commit gate. CI mirrors the same verification stack.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

pnpm -s check:role-boundary
pnpm -s typecheck
pnpm -s test
pnpm -s lint
pnpm -s format:check
pnpm -s spec:lint
pnpm -s phase:check
markdownlint-cli2 "**/*.md"
find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d
git diff --check --cached
