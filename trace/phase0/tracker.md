# Phase 0 Tracker

## 2026-04-25 — Codex command bridge maintenance

- Added repo-local Codex prompt artifacts under `.codex/prompts/cadenza-*.md` for `onboard`, `phase-status`, and `spec-lint`.
- Updated `scripts/commands-sync.sh` to generate Codex prompt artifacts alongside Claude Code symlinks and Gemini TOML artifacts, with `--codex-only` support.
- Updated `scripts/install-codex-commands.sh` to install from `.codex/prompts/` into user-scope `~/.codex/prompts/`.
- Verification run: `bash -n` passed for both scripts; `scripts/commands-sync.sh`, `scripts/commands-sync.sh --codex-only`, and temp `CODEX_HOME=/tmp/cadenza-codex-home scripts/install-codex-commands.sh` installed 3 prompts.
- Completion gate note: `pnpm` is not installed in this checkout, so `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm spec:lint`, and `pnpm phase:check` could not run.

## 2026-04-25 — Analysis path cleanup

- Replaced stale English analysis path references with `docs/analysis/analysis-final.md`; the English report now lives at that path.
- Corrected Chinese analysis references to `docs/analysis/analysis-final.zh.md` where the index needs both language variants.
- Re-ran `scripts/commands-sync.sh` so generated onboard commands now point at the current analysis path.

## 2026-04-25 — Verification gate clarification

- Added `pnpm format:check` as an explicit AGENTS.md completion gate so code formatting is checked independently from `pnpm lint`.
- Updated the Phase 0 exception text to require `format:check`, `spec:lint`, and `phase:check` to be runnable and green.

## 2026-04-25 — Cross-agent hook architecture note

- Added bilingual design notes under `docs/design/cross-agent-hook-architecture.md` and `docs/design/cross-agent-hook-architecture.zh.md`.
- Captured the shared-policy plus per-agent-adapter architecture for Claude Code, Codex, Gemini CLI, OpenCode, and later agent tools.
- Recorded implementation priority: universal hard gates first, then Codex hooks, Gemini hooks, OpenCode plugin adapter, and additional agents only when used.

## 2026-04-25 — Agent skills migration for command-like workflows

- Migrated the three command-like workflows from `commands/` into project skills under `.agents/skills/`: `cadenza-onboard`, `cadenza-phase-status`, and `cadenza-spec-lint`.
- Added a bundled Phase 0 fallback script for `cadenza-spec-lint` so spec hygiene can run without `package.json` / `pnpm spec:lint`.
- Replaced the previous cross-CLI custom command bridge with `scripts/commands-sync.sh`, which now mirrors `.agents/skills/cadenza-*` into `.claude/skills/cadenza-*` as relative symlinks.
- Removed legacy command bridge artifacts from `.claude/commands/`, `.gemini/commands/`, `.codex/prompts/`, `commands/`, and `scripts/install-codex-commands.sh`.
- Updated `AGENTS.md`, `.claude/README.md`, and `.gitignore` to describe `.agents/skills` as the skill source of truth and `.claude/skills` as the Claude Code mirror.
- Verification run: `bash -n scripts/commands-sync.sh`, `bash -n .agents/skills/cadenza-spec-lint/scripts/spec-lint-fallback.sh`, `scripts/commands-sync.sh`, bundled spec fallback, and `git diff --check` passed. `pnpm` remains unavailable in this checkout, so repo-level `pnpm ...` gates could not run.
