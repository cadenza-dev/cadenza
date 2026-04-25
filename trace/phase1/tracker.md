# Phase 1 Tracker

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
- Batch scope: `B1.3` / `TC-RSAF-005`; covered requirement IDs `RSAF-005`, `RSAF-007`, and `VAL-004` without modifying frozen specs or Accepted ADRs.
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
