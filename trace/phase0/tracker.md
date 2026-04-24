# Phase 0 Tracker

## 2026-04-25 06:28 +0800 — Architect kick file handoff cleanup

- Updated `prompt/PHASE0_KICK_ARCHITECT.md` so it can safely serve as the sole next-session handoff pointer.
- Added a tracker read step for fresh Architect sessions so newest operational history is visible before Phase 0 work begins.
- Marked absent `PHASE0_KICK_BUILDER.md` as valid until M6 decides Builder infrastructure work is needed, and corrected M7 trace instructions to use newest-first head insertion.

## 2026-04-25 06:10 +0800 — Tracker ordering rule clarification

- Reordered this tracker to newest-first so cold-start agents encounter the latest operational state before superseded history.
- Renamed tracker headings to include local time and timezone using `YYYY-MM-DD HH:MM +ZZZZ — Title`.
- Updated `AGENTS.md`, `docs/agentic-workflow.md`, and `trace/README.md` to make head insertion and timestamped headings the tracker writing rule.

## 2026-04-25 06:00 +0800 — Markdown and shell formatter hook coverage

- Confirmed existing Claude Code hooks already ran Markdown advisory lint through `scripts/hooks/post-md-edit.sh`, but did not have a dedicated formatting hook and did not cover shell formatting with `shfmt`.
- Added root `.editorconfig` so plain `shfmt` applies the repo shell style (`indent_size = 2`, `switch_case_indent = true`), including VSCode integrations that bridge to shfmt.
- Added `scripts/hooks/post-format-edit.sh` for PostToolUse formatting: `markdownlint-cli2 --fix` on `*.md` and `shfmt -w` on `*.sh`, both fail-open when optional tools are unavailable.
- Registered the formatter hook before spec/ADR/Markdown reporting hooks in `.claude/settings.json` so reporting sees post-format file contents.
- Updated `AGENTS.md`, `scripts/hooks/README.md`, and `docs/design/cross-agent-hook-architecture.md` to document Markdown lint/format and shell format checks.
- Verification run: `bash -n` for hook scripts, `jq empty` for JSON configs, `markdownlint-cli2` on touched docs, plain `shfmt -d` across `scripts/` and `.agents/`, `scripts/commands-sync.sh`, bundled spec fallback, hook simulations on Markdown and shell files, and `git diff --check` passed.

## 2026-04-25 04:59 +0800 — Agent skills migration for command-like workflows

- Migrated the three command-like workflows from `commands/` into project skills under `.agents/skills/`: `cadenza-onboard`, `cadenza-phase-status`, and `cadenza-spec-lint`.
- Added a bundled Phase 0 fallback script for `cadenza-spec-lint` so spec hygiene can run without `package.json` / `pnpm spec:lint`.
- Replaced the previous cross-CLI bridge with `scripts/commands-sync.sh`, which now mirrors `.agents/skills/cadenza-*` into `.claude/skills/cadenza-*` as relative symlinks.
- Removed the retired generated bridge artifacts for Claude Code, Gemini CLI, Codex, and the old source/install paths.
- Updated `AGENTS.md`, `.claude/README.md`, and `.gitignore` to describe `.agents/skills` as the skill source of truth and `.claude/skills` as the Claude Code mirror.
- Verification run: `bash -n scripts/commands-sync.sh`, `bash -n .agents/skills/cadenza-spec-lint/scripts/spec-lint-fallback.sh`, `scripts/commands-sync.sh`, bundled spec fallback, and `git diff --check` passed. `pnpm` remains unavailable in this checkout, so repo-level `pnpm ...` gates could not run.

## 2026-04-25 02:27 +0800 — Cross-agent hook architecture note

- Added bilingual design notes under `docs/design/cross-agent-hook-architecture.md` and `docs/design/cross-agent-hook-architecture.zh.md`.
- Captured the shared-policy plus per-agent-adapter architecture for Claude Code, Codex, Gemini CLI, OpenCode, and later agent tools.
- Recorded implementation priority: universal hard gates first, then Codex hooks, Gemini hooks, OpenCode plugin adapter, and additional agents only when used.

## 2026-04-25 01:33 +0800 — Verification gate clarification

- Added `pnpm format:check` as an explicit AGENTS.md completion gate so code formatting is checked independently from `pnpm lint`.
- Updated the Phase 0 exception text to require `format:check`, `spec:lint`, and `phase:check` to be runnable and green.

## 2026-04-25 01:00 +0800 — Analysis path cleanup

- Replaced stale English analysis path references with `docs/analysis/analysis-final.md`; the English report now lives at that path.
- Corrected Chinese analysis references to `docs/analysis/analysis-final.zh.md` where the index needs both language variants.
- Re-ran the then-current sync bridge so generated onboarding workflow artifacts pointed at the current analysis path. That bridge has since been superseded by project skills.

## 2026-04-25 01:00 +0800 — Codex command bridge maintenance

- Superseded by the later "Agent skills migration for command-like workflows" entry in this tracker.
- Historical note: this maintenance pass briefly added a Codex prompt bridge for `onboard`, `phase-status`, and `spec-lint`, then verified the bridge scripts.
- Current state: command-like workflows now live as project skills under `.agents/skills/cadenza-*`; Claude Code receives relative symlinks under `.claude/skills/`.
- Completion gate note: `pnpm` is not installed in this checkout, so `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm spec:lint`, and `pnpm phase:check` could not run.
