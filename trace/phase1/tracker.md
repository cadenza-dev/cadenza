# Phase 1 Tracker

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
