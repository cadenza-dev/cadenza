# Phase 1 Tracker

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
