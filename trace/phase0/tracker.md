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
