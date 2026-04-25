# Phase 0 Tracker

## 2026-04-25 23:16 +0800 — CI matrix expanded for platform coverage

- Updated `.github/workflows/ci.yml` from a single Ubuntu runner to a pinned OS matrix: `ubuntu-24.04`, `windows-2025`, and `macos-15`.
- Replaced the Ubuntu-only `apt-get` shfmt install with a Go-based `shfmt@v3.8.0` install that works across Linux, Windows, and macOS runners.
- Upgraded first-party GitHub setup actions to Node 24-compatible majors and moved the shell format step to `pnpm lint:shell` so CI matches the repository script surface.
- Used `bash` as the workflow run shell to keep existing shell snippets portable across all matrix jobs.

## 2026-04-25 23:07 +0800 — Phase check made transition-aware

- Updated `scripts/phase-check.ts` so it dispatches by `STATUS.yaml current_phase` instead of always expecting Phase 0.
- Preserved the Phase 0 close/infra gate and added a Phase 1 initial gate that allows `trace/phase1/` to be created by the first Phase 1 Builder batch.
- Verified current Phase 0 `pnpm phase:check` and a simulated `current_phase: "1"` run both pass.
- Left `check:role-boundary` unset-role behavior unchanged for now; explicit `CADENZA_AGENT_ROLE=builder|architect` checks already pass and further hardening can happen later.

## 2026-04-25 22:25 +0800 — Phase 0 infra CI stabilized

- Pushed the Phase 0 Builder bootstrap to `main` through commit `817baa7`.
- Fixed CI-only runner issues in `.github/workflows/ci.yml`: pnpm is installed before `actions/setup-node` requests pnpm cache, and Markdown lint now resolves through `pnpm exec`.
- Verified GitHub Actions CI run `24933022951` passed all workflow steps: frozen contract check, typecheck, test, lint, format check, Markdown lint, shell format check, spec lint, phase check, and whitespace check.
- Note: GitHub Actions emitted a Node.js 20 action deprecation annotation for upstream actions; it did not fail the run and does not block Phase 0 Builder bootstrap.

## 2026-04-25 21:53 +0800 — Phase 0 infra bootstrap completed

- Added the root pnpm workspace skeleton (`package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `vitest.config.ts`, `pnpm-lock.yaml`) with runnable `typecheck`, `test`, `lint`, `format:check`, `spec:lint`, and `phase:check` scripts.
- Added executable Phase 0 gates: `scripts/lint-specs.ts`, `scripts/phase-check.ts`, `scripts/check-contract-frozen.ts`, and `scripts/check-role-boundary.ts`.
- Added local git hook surface via `.githooks/pre-commit`, `.githooks/commit-msg`, `scripts/pre-commit.sh`, and `scripts/install-git-hooks.sh`; current checkout has `core.hooksPath=.githooks`.
- Added CI at `.github/workflows/ci.yml` mirroring the verification stack.
- Added Codex project hook support under `.codex/` for `SessionStart`, Bash `PreToolUse`, Bash `PermissionRequest`, and `Stop`, reusing shared scripts through Codex-specific wrappers.
- Preserved Phase 0 boundaries: no `packages/**/src/**` production code, no Phase 1 runtime/API/compiler/player/validation implementation, and no frozen spec or Accepted ADR edits.
- Verification passed: `pnpm typecheck`, `pnpm test` (no tests yet, pass-with-no-tests), `pnpm lint`, `pnpm format:check`, `pnpm spec:lint`, `pnpm phase:check`, `markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `git diff --check`, JSON/YAML parse checks, Codex hook simulations, and `pnpm -s precommit`.
- Note: `phase:check` reports `phase_pointer_advanced_to_1` as pending human phase close; this is expected and does not block the Builder bootstrap.

## 2026-04-25 21:27 +0800 — Builder identity approved for infra bootstrap

- Launched as Phase 0 Builder via `prompt/PHASE0_KICK_BUILDER.md`.
- Detected identity: `gpt-5.x/codex`; maintainer confirmed the active model is `gpt-5.5` with extra-high thinking effort and approved proceeding as Builder.
- Proceeding with Phase 0 infrastructure bootstrap from `PHASE0_KICK_BUILDER.md` after the AGENTS.md Startup Protocol gate.

## 2026-04-25 21:02 +0800 — M4 Remotion notification sent and recorded

- Maintainer sent the Remotion notification email to `hi@remotion.dev` at approximately 2026-04-25 21:00 +0800.
- Added `docs/adr/0011-remotion-notification-outcome.md` to record the sent-awaiting-response outcome and follow-up rules.
- Updated `docs/adr/README.md` and `trace/phase0/status.yaml`; M4 is now complete.

## 2026-04-25 20:50 +0800 — M4 notification draft ready for send approval

- Verified `https://github.com/cadenza-dev/cadenza` and the compiler-design blob URL now return HTTP 200 to unauthenticated requests.
- Updated ignored local draft `docs/communications/remotion-notification-email.md` to Draft v3 with softened upstream-roadmap language and clearer Remotion licensing intent.
- Marked M4 as ready for explicit maintainer send approval; no external email has been sent.

## 2026-04-25 20:25 +0800 — M4 notification draft prepared, send blocked

- Updated `docs/communications/remotion-notification-email.md` to Draft v2 after compiler/spec freeze.
- Verified Remotion's official contact page and public GitHub organization email path.
- Confirmed `https://github.com/cadenza-dev` is public, but `https://github.com/cadenza-dev/cadenza` and the compiler-design blob URL return HTTP 404 to unauthenticated access.
- Marked M4 blocked until the repository and linked design document are publicly visible.

## 2026-04-25 20:15 +0800 — M6 Builder handoffs authored

- Updated `prompt/PHASE0_KICK_ARCHITECT.md` so M6 hands off to Builder rather than a redundant Phase 1 Architect Stage B pass.
- Added `prompt/PHASE0_KICK_BUILDER.md` for project infrastructure bootstrap before Phase 1 implementation.
- Added `prompt/PHASE1_KICK_BUILDER.md` for implementation from the frozen Phase 1 specs.
- Marked M6 complete and updated `STATUS.yaml` owners so Phase 0 includes Builder infra work and Phase 1 starts with Builder.

## 2026-04-25 20:12 +0800 — M5 workflow close-out accepted

- Maintainer approved closing M5 after the WIP future-support workflow loop was committed and pushed.
- Marked `M5_agentic_workflow_finalize` complete and `agentic_workflow_finalized` met in `trace/phase0/status.yaml`.
- Remaining Phase 0 Architect focus is M4 Remotion notification, M6 downstream handoff files, M7 trace closure, and M8 phase close.

## 2026-04-25 19:56 +0800 — Workflow updated for WIP follow-up loop

- Updated `AGENTS.md` so Architects read current-phase `wip/future-support/` entries at phase start.
- Added the post-freeze rule that Architects record deferred enhancement topics under `wip/future-support/`, grouped by future planning horizon.
- Synced the long-form workflow in `docs/agentic-workflow.md` and marked M5 as in-progress in `trace/phase0/status.yaml`.

## 2026-04-25 19:51 +0800 — Future-support notes split by planning horizon

- Split `wip/future-support/frozen-decision-followups.md` into an index plus separate planning files for Phase 2, Phase 3, and conditional/later candidates.
- Updated `trace/phase0/status.yaml` so the future-support follow-up exit criterion points at the file set instead of a single content file.

## 2026-04-25 19:43 +0800 — Phase 1 specs frozen and future-support WIP recorded

- Maintainer approved all listed Phase 1 Freeze Candidate leanings, including the test-matrix Stage B review note.
- Updated all eight `spec/phase1/` files from `CONTRACT_DRAFT` / Stage A to `CONTRACT_FROZEN` / Stage B.
- Replaced Freeze Candidate sections with frozen decisions and rationales.
- Added `wip/README.md` and `wip/future-support/frozen-decision-followups.md` to track features intentionally deferred or softened by the frozen decisions.
- Updated `trace/phase0/status.yaml`: M3 is now `stage_b_frozen`, with future-support follow-ups recorded.

## 2026-04-25 07:09 +0800 — Phase 1 Stage A specs drafted

- Created `spec/phase1/` with eight Stage A `CONTRACT_DRAFT` specs: typed API, compiler, render-safe layer, player runtime, validation, skills, test matrix, and traceability.
- Added 44 requirement IDs, 14 acceptance scenarios, and 13 Freeze Candidates / Stage B review items.
- Kept all Phase 1 specs unfrozen; they are ready for maintainer review before Stage B.
- Bundled spec fallback passed after moving the test-matrix-only review note out of Freeze Candidate ID syntax to avoid false traceability errors in the Phase 0 fallback script.

## 2026-04-25 07:09 +0800 — M1 frozen and pending ADRs captured

- Maintainer approved all five compiler-design OQ recommendations and authorized continuing Phase 0 Architect work.
- Marked `docs/design/compiler-design.md` and `docs/design/compiler-design.zh.md` as `CONTRACT_FROZEN`, with v0.3 version history entries.
- Drafted and accepted ADR 0006-0010: dual OSS + hosted tier, two-stage Remotion engagement, single-maintainer + AI-agent decision loop, advisory role binding, and Cadenza / `cadenza-dev` naming.
- Updated `docs/adr/README.md` so the ADR index now references 0001-0010.
- Updated `trace/phase0/status.yaml`: M1 is frozen, M2 is complete, and the corresponding exit criteria are marked met.

## 2026-04-25 06:37 +0800 — Compiler design bilingual OQ refinement

- Integrated `docs/design/compiler-design.zh.md` into the M1 review loop after maintainer feedback that the English resolution pass was too one-sided.
- Updated both English and Chinese compiler-design documents to use "recommended resolution / 建议决议" language, preserving the fact that maintainer approval is still required before freezing.
- Added decision notes for all five open questions so the trade-off and reopen condition are visible before the maintainer decides.
- Synced the Chinese review copy to `v0.2 Review-ready` instead of leaving it at the older `v0.1 Draft` state.

## 2026-04-25 06:37 +0800 — Compiler design advanced to review-ready

- Re-read `docs/design/compiler-design.md` top to bottom against `prompt/PHASE0_KICK_ARCHITECT.md` M1.
- Advanced the compiler design from `Draft` to `Review-ready`, without marking `CONTRACT_FROZEN`.
- Resolved all five §8 open questions: single deck-wide FPS, semantic `onCursorChange` events, 60-minute warning without hard cap, Phase 1 i18n exclusion with reopen condition, and offline export TimelineMap rules for Remotion Lambda parity.
- Verified all seven §9 Phase 0 review checklist items and recorded the M1 state in `trace/phase0/status.yaml`.
- Next required human checkpoint: maintainer review and explicit approval before any freeze marker is added.

## 2026-04-25 06:37 +0800 — Architect identity approved for Phase 0

- Launched as Phase 0 Architect via `prompt/PHASE0_KICK_ARCHITECT.md`.
- Detected identity: `gpt-5.x/codex`; maintainer clarified the active model is effectively `gpt-5.5` and approved `gpt-5.x/codex` as the preferred Architect pairing for this session.
- Proceeding with Phase 0 Architect work from M1 after the AGENTS.md Startup Protocol gate.

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
