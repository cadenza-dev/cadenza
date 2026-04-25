#!/usr/bin/env bash
# Install repo-local git hooks. This is intentionally dependency-free so it can
# run from package manager prepare scripts and from a fresh checkout.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v git >/dev/null 2>&1; then
  echo "install-git-hooks: git not found; skipped" >&2
  exit 0
fi

cd "$REPO_ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "install-git-hooks: not inside a git worktree; skipped" >&2
  exit 0
fi

if git config core.hooksPath .githooks; then
  echo "install-git-hooks: core.hooksPath=.githooks"
else
  echo "install-git-hooks: could not update git config; run scripts/install-git-hooks.sh manually if local hooks are not active" >&2
fi
