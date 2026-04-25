# Phase 1 Tracker

## 2026-04-26 06:30 +0800 — B1.4-B1 compiler/runtime semantics green

- Startup identity: continued as Builder with maintainer approval already granted in this session.
- Batch scope: `B1.4-B1`; closed compiler/runtime semantic gaps identified by B1.4-A for `COMP-005`, `COMP-006`, `COMP-009`, and `COMP-010` without modifying frozen specs or Accepted ADRs.
- RED/GREEN: added `packages/core/src/compiler-runtime.closeout.test.ts` and implemented one vertical slice at a time for wait-for-event runtime expansion/offline `exportDuration`, unresolved computed-step loading/offline fatal export diagnostics, 60-minute warning metadata, and semantic-only `onCursorChange`.
- Implementation links: `packages/core/src/typed-api/primitives.ts`, `packages/core/src/compiler/compile.ts`, `packages/core/src/compiler/cursor.ts`, `packages/core/src/runtime/createRuntime.ts`.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm test:browser`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, `pnpm phase:check`, and `git diff --check` all passed.
- Next B1.4 batch: `B1.4-B2`, closing readiness timeout and browser-depth gaps.

## 2026-04-26 06:11 +0800 — B1.4-A requirement coverage audit complete

- Startup identity: continued as Builder with maintainer approval already granted in this session.
- Batch scope: `B1.4-A`; updated `prompt/PHASE1_KICK_BUILDER.md` with the durable B1.4-A through B1.4-D closeout path, then completed a repo-grounded requirement coverage audit without modifying frozen specs or Accepted ADRs.
- Audit artifact: `trace/phase1/requirement-coverage-audit.md`.
- Result: `SPEC_TEST_MATRIX.md` scenarios remain green, but phase closeout still has semantic gaps before the all-domain fixture and phase-exit demo can be honestly marked complete.
- Highest-priority gaps: `COMP-005` runtime interval expansion / offline `exportDuration`, `COMP-006` computed-step loading / export failure, `COMP-009` 60-minute warnings, `COMP-010` semantic-only `onCursorChange`, and `VAL-005` readiness timeout diagnostics.
- Additional verification-depth gaps: browser-level keyboard coverage for `PLAY-001`, no-fallback font flash coverage for `RSAF-003`, delayed video metadata / timeout coverage for `RSAF-004`, and shallow DOM/visual depth for `RSAF-006`.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm test:browser`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, `pnpm phase:check`, and `git diff --check` all passed.
- Recommended next batch: `B1.4-B1`, closing compiler/runtime semantic gaps before building the all-domain MVP fixture.

## 2026-04-26 05:47 +0800 — B1.3 TC-VAL-006 green

- Startup identity: proceeded as Builder with `GPT-5-family` / `codex` after maintainer approval in this session.
- Batch scope: `B1.3` / `TC-VAL-006`; covered requirement IDs `VAL-006` and `SKIL-005` without modifying frozen specs or Accepted ADRs.
- RED 1: `pnpm test -- packages/core/src/validation.report.test.ts` failed because `createValidationReport` was not exposed as a public API function.
- GREEN 1: added a machine-readable validation report with `schemaVersion`, `ok`, diagnostic summary, preserved diagnostics, and an ordered `repairQueue` grouped by severity, requirement, code, and source.
- RED 2: `pnpm test -- packages/core/src/skill-pack.test.ts` failed because `render-debugging` did not point repair workflows at the validation report API.
- GREEN 2: updated `render-debugging` guidance to use `createValidationReport` and its `repairQueue` before falling back to manual diagnostic grouping.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm test:browser`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, `pnpm phase:check`, and `git diff --check` all passed.
- Test and code links: `packages/core/src/validation.report.test.ts`, `packages/core/src/validation/report.ts`, `packages/core/src/index.ts`, `packages/core/src/skill-pack.test.ts`, `.agents/skills/render-debugging/SKILL.md`, `trace/phase1/status.yaml`.
- B1.3 P1/P2 completion path is complete; no next scenario remains in the Phase 1 frozen test matrix. Phase-exit demo and all-domain MVP fixture criteria remain separate follow-up work.

## 2026-04-26 05:20 +0800 — B1.3 browser preview harness green

- Startup identity: continued as Builder with maintainer approval in the same session; maintainer explicitly scoped this turn to review/remediate the advanced B1.3 slices, not to start `TC-VAL-006`.
- Review gate: prior read-only review marked `TC-RSAF-005` and `TC-PLAY-004` browser/preview coverage as too narrow because they only used synthetic/unit fixtures.
- Batch scope: B1.3 verification remediation for `TC-RSAF-005` and `TC-PLAY-004`; covered `RSAF-005`, `VAL-004`, `PLAY-004`, and `PLAY-005` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm exec playwright test tests/browser/render-safe-preview.spec.ts` failed because no Chromium browser binary was installed, proving the repo did not yet have a runnable browser harness.
- GREEN: added `@playwright/test`, a Chromium Playwright config, an esbuild-bundled browser fixture entry, three-platform CI coverage, and browser tests that run the core API inside a real DOM for `TypographyBox` overflow, click-region coordinate routing, and fullscreen capability smoke.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm test:browser`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, `pnpm phase:check`, and `git diff --check` all passed.
- Test and infrastructure links: `tests/browser/render-safe-preview.spec.ts`, `tests/browser/cadenza-browser-entry.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`, `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `.gitignore`, `trace/phase1/status.yaml`.
- Next B1.3/P2 scenario remains `TC-VAL-006`, pending maintainer approval for the next Builder batch.

## 2026-04-26 04:51 +0800 — B1.3 TC-RSAF-005 remediation green

- Startup identity: proceeded as Builder with `gpt-5.5-family` / `codex` after maintainer approval; a read-only sub-agent verification review ran before any `TC-VAL-006` implementation.
- Review gate: the sub-agent found a blocking `TC-RSAF-005` traceability gap: `RSAF-006` / `MediaFrame` was mapped to `TC-RSAF-005` in the frozen traceability matrix but was absent from tests, public exports, implementation, and phase status.
- Batch scope: `B1.3` remediation for `TC-RSAF-005`; covered requirement ID `RSAF-006` without modifying frozen specs or Accepted ADRs. The browser/Playwright-depth concerns for `TC-RSAF-005` and `TC-PLAY-004` remain non-blocking residual risk unless the maintainer asks to expand the test stack.
- RED: `pnpm test -- packages/core/src/render-safe.typography.test.ts` failed because `MediaFrame` was not exposed as a public API function.
- GREEN: added render-safe `MediaFrame` node support with aspect-ratio metadata and deterministic poster/first-frame export snapshot metadata, then exported its public types and constructor.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and code links: `packages/core/src/render-safe.typography.test.ts`, `packages/core/src/render-safe/resources.ts`, `packages/core/src/index.ts`, `trace/phase1/status.yaml`.
- Next B1.3/P2 scenario: `TC-VAL-006`, pending maintainer approval for the next Builder batch.

## 2026-04-26 04:29 +0800 — B1.3 TC-SKIL-004 green

- Startup identity: continued as Builder with `gpt-5.5` / `codex`; maintainer explicitly requested the next vertical slice after the `TC-PLAY-006` commit and push.
- Batch scope: `B1.3` / `TC-SKIL-004`; covered requirement IDs `SKIL-004` and `SKIL-005` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/skill-pack.test.ts` failed because the skill pack did not explicitly cover required anti-patterns or a validate-and-repair loop.
- GREEN: added skill guidance for overflow, asset loading, timing, direct frame-coordinate manipulation, and a structured diagnostics validate-and-repair workflow.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and artifact links: `packages/core/src/skill-pack.test.ts`, `.agents/skills/layout-composition/SKILL.md`, `.agents/skills/motion-transitions/SKILL.md`, `.agents/skills/render-debugging/SKILL.md`, `.agents/skills/render-safe-components/SKILL.md`.
- Next B1.3/P2 scenario: `TC-VAL-006`.

## 2026-04-26 04:24 +0800 — B1.3 TC-PLAY-006 green

- Startup identity: continued as Builder with `gpt-5.5` / `codex`; maintainer explicitly requested the next vertical slice after the `TC-PLAY-004` commit and push.
- Batch scope: `B1.3` / `TC-PLAY-006`; covered requirement IDs `PLAY-006` and `TAPI-006` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/player.presenter-metadata.test.ts` failed because compiled slides did not expose notes metadata and runtime did not expose presenter metadata.
- GREEN: collected slide `Notes` into `TimelineSlide.notes` without changing timeline duration, added runtime `getPresenterMetadata()`, and exposed wall-clock plus active-presenting elapsed time through an injectable clock.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and code links: `packages/core/src/player.presenter-metadata.test.ts`, `packages/core/src/compiler/compile.ts`, `packages/core/src/runtime/createRuntime.ts`, `packages/core/src/index.ts`.
- Next B1.3 scenario: `TC-SKIL-004`.

## 2026-04-26 04:16 +0800 — B1.3 TC-PLAY-004 green

- Startup identity: continued as Builder with `gpt-5.5` / `codex`; maintainer explicitly requested the next vertical slice after the `TC-RSAF-005` commit and push.
- Batch scope: `B1.3` / `TC-PLAY-004`; covered requirement IDs `PLAY-004` and `PLAY-005` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/player.controls.test.ts` failed because the public API did not expose click-region or fullscreen controls.
- GREEN: added `bindClickRegions` for configurable browser click hit regions and `createFullscreenControls` as a thin adapter over player fullscreen capabilities.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and code links: `packages/core/src/player.controls.test.ts`, `packages/core/src/player/clickRegions.ts`, `packages/core/src/player/fullscreen.ts`, `packages/core/src/index.ts`.
- Next B1.3 scenario: `TC-PLAY-006`.

## 2026-04-26 04:09 +0800 — B1.3 TC-RSAF-005 green

- Startup identity: continued as Builder with `gpt-5.5` / `codex`; maintainer explicitly requested the next vertical slice after the `TC-SKIL-001` commit and push.
- Batch scope: `B1.3` / `TC-RSAF-005`; initially covered requirement IDs `RSAF-005`, `RSAF-007`, and `VAL-004` without modifying frozen specs or Accepted ADRs. `RSAF-006` was remediated in the 2026-04-26 04:51 +0800 entry.
- RED: `pnpm test -- packages/core/src/render-safe.typography.test.ts` failed because the public API did not expose `TypographyBox`, `ContentSlot`, or preview layout validation.
- GREEN: added render-safe `TypographyBox` and `ContentSlot` nodes, exposed ContentSlot density/readability metadata, and added `validatePreviewLayout` to emit typed overflow diagnostics from browser measurements.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and code links: `packages/core/src/render-safe.typography.test.ts`, `packages/core/src/render-safe/resources.ts`, `packages/core/src/validation/browser.ts`, `packages/core/src/typed-api/primitives.ts`, `packages/core/src/index.ts`.
- Next B1.3 scenario: `TC-PLAY-004`.

## 2026-04-26 03:46 +0800 — B1.2 TC-SKIL-001 green

- Startup identity: continued as Builder with `gpt-5.5` / `codex`; maintainer explicitly requested the next vertical slice after the `TC-VAL-001` commit and push.
- Batch scope: `B1.2` / `TC-SKIL-001`; covered requirement IDs `SKIL-001`, `SKIL-002`, and `SKIL-003` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/skill-pack.test.ts` failed because the required Phase 1 authoring skill directories did not exist.
- GREEN: added five `.agents/skills` authoring skills for layout composition, motion transitions, speaker notes, render debugging, and render-safe components, each directing agents toward typed API and render-safe usage over raw Remotion primitives.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and artifact links: `packages/core/src/skill-pack.test.ts`, `.agents/skills/layout-composition/SKILL.md`, `.agents/skills/motion-transitions/SKILL.md`, `.agents/skills/speaker-notes/SKILL.md`, `.agents/skills/render-debugging/SKILL.md`, `.agents/skills/render-safe-components/SKILL.md`.
- B1.2 P0 acceptance path is complete; next B1.3 scenario: `TC-RSAF-005`.

## 2026-04-26 02:52 +0800 — B1.2 TC-VAL-001 green

- Startup identity: continued as Builder with `gpt-5.5` / `codex`; maintainer explicitly requested the next vertical slice after the `TC-PLAY-001` commit and push.
- Batch scope: `B1.2` / `TC-VAL-001`; covered requirement IDs `VAL-001`, `VAL-002`, `VAL-003`, and `COMP-008` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/compiler.validation.test.ts` failed because `compile` did not throw typed fatal diagnostics for invalid authoring.
- GREEN: added `CadenzaValidationError`, a structured diagnostic shape, static deck validation for missing or duplicate slide IDs, nested Deck usage, and invalid Step kinds, then wired fatal diagnostics into `compile`.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and code links: `packages/core/src/compiler.validation.test.ts`, `packages/core/src/diagnostics/types.ts`, `packages/core/src/validation/errors.ts`, `packages/core/src/validation/static.ts`, `packages/core/src/compiler/compile.ts`, `packages/core/src/index.ts`.
- Next B1.2 P0 scenario: `TC-SKIL-001`.

## 2026-04-26 02:34 +0800 — B1.2 TC-PLAY-001 green

- Startup identity: continued as Builder with `gpt-5.5` / `codex`; maintainer explicitly requested the next vertical slice after the `TC-RSAF-002` commit and push.
- Batch scope: `B1.2` / `TC-PLAY-001`; covered requirement IDs `PLAY-001` and `PLAY-002` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/player.keyboard.test.ts` failed because the public API did not expose keyboard navigation binding.
- GREEN: added `bindKeyboardNavigation` with conventional default next/previous key sets and support for configurable maps, routing keydown events through runtime `next()` / `previous()`.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and code links: `packages/core/src/player.keyboard.test.ts`, `packages/core/src/player/keyboard.ts`, `packages/core/src/index.ts`.
- Next B1.2 P0 scenario: `TC-VAL-001`.

## 2026-04-26 02:03 +0800 — B1.2 TC-RSAF-002 green

- Startup identity: continued as Builder with `gpt-5.5` / `codex`; maintainer explicitly requested the next vertical slice after the `TC-COMP-007` commit and push.
- Batch scope: `B1.2` / `TC-RSAF-002`; covered requirement IDs `RSAF-002`, `RSAF-003`, `RSAF-004`, and `VAL-005` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/render-safe.readiness.test.ts` failed because the public API did not expose render-safe resource declarations or a readiness registry.
- GREEN: added `SafeImage`, `SafeFont`, `SafeVideo`, `createResourceReadiness`, compiler resource collection, and runtime readiness gating that moves from `loading` back to the intended step once all target-slide resources report ready.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and code links: `packages/core/src/render-safe.readiness.test.ts`, `packages/core/src/render-safe/resources.ts`, `packages/core/src/render-safe/readiness.ts`, `packages/core/src/compiler/compile.ts`, `packages/core/src/runtime/createRuntime.ts`, `packages/core/src/index.ts`, `packages/core/src/typed-api/primitives.ts`.
- Next B1.2 P0 scenario: `TC-PLAY-001`.

## 2026-04-26 01:45 +0800 — B1.2 TC-COMP-007 green

- Startup identity: continued as Builder with `gpt-5.5` / `codex`; maintainer explicitly requested the next vertical slice after the `TC-COMP-004` commit and push.
- Batch scope: `B1.2` / `TC-COMP-007`; covered requirement ID `COMP-007` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/runtime.navigation.test.ts` failed because mid-transition `next()` ignored deck-level navigation policy and behaved like ordinary step navigation.
- GREEN: `TimelineMap` now preserves `navigationPolicy`, and runtime navigation handles `cut-to-next`, `finish-then-advance`, and `queue-next` while the current cursor is `in-transition`.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and code links: `packages/core/src/runtime.navigation.test.ts`, `packages/core/src/compiler/compile.ts`, `packages/core/src/runtime/createRuntime.ts`.
- Next B1.2 P0 scenario: `TC-RSAF-002`.

## 2026-04-26 01:38 +0800 — B1.2 TC-COMP-004 green

- Startup identity: continued as Builder with `gpt-5.5` / `codex`; maintainer explicitly requested the next vertical slice after the `TC-COMP-001` commit and push.
- Batch scope: `B1.2` / `TC-COMP-004`; covered requirement IDs `COMP-004` and `PLAY-003` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/runtime.navigation.test.ts` failed because the public API did not expose `createRuntime`.
- GREEN: added a minimal runtime navigation API that flattens compiler step anchors and routes `goto`, `next`, and `previous` through `player.seekTo(frame)`.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and code links: `packages/core/src/runtime.navigation.test.ts`, `packages/core/src/runtime/createRuntime.ts`, `packages/core/src/index.ts`.
- Next B1.2 P0 scenario: `TC-COMP-007`.

## 2026-04-26 01:32 +0800 — B1.2 TC-COMP-001 green

- Startup identity: continued as Builder with `gpt-5.5` / `codex`; maintainer explicitly requested the next vertical slice after the `TC-TAPI-004` commit and push.
- Batch scope: `B1.2` / `TC-COMP-001`; covered requirement IDs `COMP-001`, `COMP-002`, and `COMP-003` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/compile.timeline-map.test.ts` failed because transitions did not affect neighboring slide segments and no cursor coverage helper was exposed.
- GREEN: `compile` now emits ordered multi-slide `TimelineMap` data with overlapping `transitionIn` / `transitionOut` segments, and `cursorAtFrame` maps valid frames to exactly one semantic cursor.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and code links: `packages/core/src/compile.timeline-map.test.ts`, `packages/core/src/compiler/compile.ts`, `packages/core/src/compiler/cursor.ts`, `packages/core/src/index.ts`.
- Next B1.2 P0 scenario: `TC-COMP-004`.

## 2026-04-26 01:13 +0800 — B1.2 TC-TAPI-004 green

- Startup identity: proceeded as Builder with `gpt-5.5` / `codex`; the maintainer's launch instruction pre-approved this identity.
- Batch scope: `B1.2` / `TC-TAPI-004`; covered requirement IDs `TAPI-004`, `COMP-005`, and `COMP-006` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/public-api.test.ts` failed because `compile(deck).slides` did not expose compiled step declarations.
- GREEN: `compile` now collects direct `Step` nodes under each `Slide`, preserves compiled step kinds, and emits minimal frame segments for `fixed`, `wait-for-event`, and `computed` steps.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`, `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`, `pnpm spec:lint`, and `pnpm phase:check` all passed.
- Test and code links: `packages/core/src/public-api.test.ts`, `packages/core/src/compiler/compile.ts`.
- Next B1.2 P0 scenario: `TC-COMP-001`.

## 2026-04-26 00:59 +0800 — B1.1 TC-TAPI-001 green

- Startup identity: maintainer approved proceeding as Builder with `gpt-5.5` / `codex` on extra-high reasoning.
- Batch scope: `B1.1` / `TC-TAPI-001`; covered requirement IDs `TAPI-001` and `TAPI-002` without modifying frozen specs or Accepted ADRs.
- RED: `pnpm test -- packages/core/src/public-api.test.ts` failed because `@cadenza-dev/core` had no resolvable public entry point.
- GREEN: added the `@cadenza-dev/core` workspace package, exported `Deck`, `Slide`, `Step`, `Transition`, `Notes`, `Theme`, and `compile`, and preserved deck-level `fps` in the returned `TimelineMap`.
- Test and code links: `packages/core/src/public-api.test.ts`, `packages/core/src/index.ts`, `packages/core/src/typed-api/primitives.ts`, `packages/core/src/compiler/compile.ts`.

## 2026-04-25 23:52 +0800 — Phase 1 opened for Builder

- Phase 0 closed after maintainer approval.
- Phase 1 starts with Builder implementation from `prompt/PHASE1_KICK_BUILDER.md`; no Phase 1 Architect Stage B pass is required because `spec/phase1/` was frozen during Phase 0.
- First recommended batch is `B1.1` / `TC-TAPI-001`: public typed API primitives import and compile with deck-level FPS.
- Read `wip/future-support/` before implementation planning to avoid accidentally promoting deferred features.
