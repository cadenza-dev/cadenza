# Phase 1 Requirement Coverage Audit

> Batch: B1.4-A Requirement coverage audit
> Date: 2026-04-26 06:11 +0800
> Scope: frozen Phase 1 specs, current tests, implementation, and trace status.

## Executive Summary

The `SPEC_TEST_MATRIX.md` scenarios are green and the verification stack passes.
However, Phase 1 is not ready to close until the exit-level work handles two
classes of remaining work:

1. Some frozen requirements are only partially covered by their green scenario.
2. The all-domain MVP fixture and phase-exit demo are not present yet.

The highest-priority gaps are compiler/runtime semantics, not surface API
exports:

- `COMP-005`: `wait-for-event` currently has a placeholder duration, but no
  runtime interval expansion and no offline `exportDuration` path.
- `COMP-006`: `computed` steps currently compile to zero frames, but do not
  enter loading while unresolved and have no offline export failure path.
- `COMP-009`: decks longer than 60 minutes do not emit compile-time warnings.
- `COMP-010`: `onCursorChange` currently emits from every player frame-change
  callback, so semantic-only cursor emissions are not guaranteed.
- `VAL-005`: unresolved asset readiness can produce a loading cursor, but
  timeout diagnostics are not implemented.

## Status Legend

- `Covered`: implementation and tests satisfy the frozen requirement.
- `Partial`: the scenario is green, but the frozen requirement or verification
  language is broader than the current implementation.
- `Deferred/Not required`: the frozen requirement is optional for Phase 1 or
  explicitly states no implementation is required.

## Requirement Audit

### Typed API

- `TAPI-001`: Covered. Public primitives are exported and imported in
  `packages/core/src/public-api.test.ts`.
- `TAPI-002`: Covered. `Deck` accepts `fps`, `theme`, and `navigationPolicy`;
  `compile(deck).fps` preserves the deck-wide frame grid.
- `TAPI-003`: Covered. `Slide` exposes `id` and `duration`; notes metadata is
  collected by the compiler and presenter metadata test.
- `TAPI-004`: Partial. Step kinds compile into expected placeholder segments,
  but the broader frozen compiler semantics for `wait-for-event` and
  `computed` are tracked under `COMP-005` and `COMP-006`.
- `TAPI-005`: Covered. `Transition` declares kind and duration; compiler
  collects transition segments without animation interpolation.
- `TAPI-006`: Covered. `Notes` are collected without changing timeline
  duration.
- `TAPI-007`: Covered for the Phase 1 token surface. The all-domain fixture
  should still exercise theme tokens through a realistic deck.
- `TAPI-008`: Deferred/Not required. The requirement is explicitly `MAY` and
  says no implementation is required for MVP.

### Compiler

- `COMP-001`: Covered. `compile.timeline-map.test.ts` asserts total frames,
  ordered slides, step segments, and transition segments.
- `COMP-002`: Covered for representative fixtures. Step and slide anchors are
  monotonic in the existing multi-slide timeline test.
- `COMP-003`: Covered for representative fixtures. The cursor helper is checked
  across every frame in the compiled test timeline.
- `COMP-004`: Covered. Runtime exposes `goto`, `next`, `previous`,
  `getCursor`, and `onCursorChange`.
- `COMP-005`: Partial. `wait-for-event` has a default two-second placeholder,
  but runtime interval expansion and offline `exportDuration` are not
  implemented.
- `COMP-006`: Partial. `computed` steps compile to zero-frame placeholders, but
  unresolved computed steps do not enter loading and no offline export failure
  path exists.
- `COMP-007`: Covered for the configured policies in unit tests.
- `COMP-008`: Covered. Nested `Deck` produces a fatal validation diagnostic.
- `COMP-009`: Partial. No compile-time warning metadata exists for decks over
  60 minutes.
- `COMP-010`: Partial. `onCursorChange` exists, but frame-change callbacks emit
  on every player frame update; semantic-only emissions are not enforced by
  implementation or tests.

### Render-Safe Layer

- `RSAF-001`: Covered. The six Phase 1 components are implemented and exported.
- `RSAF-002`: Covered. `SafeImage` readiness is collected and gates runtime
  entry.
- `RSAF-003`: Partial. `SafeFont` readiness participates in runtime gating, but
  the specified browser no-fallback-text-flash check is not present.
- `RSAF-004`: Partial. `SafeVideo` readiness participates in runtime gating, but
  delayed metadata and timeout behavior are not implemented.
- `RSAF-005`: Covered. `TypographyBox` overflow is validated in unit and browser
  fixtures.
- `RSAF-006`: Partial. `MediaFrame` exposes aspect ratio and export snapshot
  metadata, but DOM measurement / visual fixture depth is shallow.
- `RSAF-007`: Covered. `ContentSlot` exposes density and readability metadata.
- `RSAF-008`: Partial. Typography overflow emits structured diagnostics, but
  asset timeout diagnostics are not implemented.

### Player Runtime

- `PLAY-001`: Partial. Keyboard binding works through a DOM-like target, but the
  spec calls for Playwright keyboard navigation coverage.
- `PLAY-002`: Covered. Runtime step-level forward/backward movement is tested.
- `PLAY-003`: Covered. Runtime seeks to compiler-provided frame anchors.
- `PLAY-004`: Covered. Click regions are tested in unit and browser fixtures.
- `PLAY-005`: Covered. Fullscreen capability is exposed and smoke-tested in
  browser preview.
- `PLAY-006`: Covered. Presenter metadata exposes slide, step, notes, and
  elapsed wall/active time.

### Validation

- `VAL-001`: Covered. Missing IDs, duplicate IDs, nested decks, and invalid
  step kinds produce fatal diagnostics.
- `VAL-002`: Covered. Diagnostics include severity, code, message,
  requirement, and source when available.
- `VAL-003`: Covered for compile-time fatal validation. Export-time fatal
  validation depends on the missing offline export boundary.
- `VAL-004`: Covered. Browser preview can surface `TypographyBox` overflow.
- `VAL-005`: Partial. Loading states surface unresolved readiness, but timeout
  diagnostics are not implemented.
- `VAL-006`: Covered. `createValidationReport` exposes a machine-readable
  report and repair queue.

### Skills

- `SKIL-001`: Covered. Five authoring skills exist.
- `SKIL-002`: Covered. The required five skills are present.
- `SKIL-003`: Covered. Skills instruct typed API and render-safe usage over raw
  Remotion primitives.
- `SKIL-004`: Covered. Skills cover overflow, asset loading, timing, and direct
  frame-coordinate anti-patterns.
- `SKIL-005`: Covered. `render-debugging` now uses `createValidationReport` and
  `repairQueue` in the validate-and-repair loop.
- `SKIL-006`: Deferred/Not required. Mirroring is optional; post-Phase 1 skill
  review is tracked in `TODO.md`.

## Recommended Next Batches

1. `B1.4-B1`: close compiler/runtime semantic gaps for `COMP-005`,
   `COMP-006`, `COMP-009`, and `COMP-010` with focused public-interface tests.
2. `B1.4-B2`: close readiness timeout and browser-depth gaps for `VAL-005`,
   `RSAF-003`, `RSAF-004`, and `PLAY-001`.
3. `B1.4-B3`: create the all-domain MVP fixture after the semantic gaps are
   closed, so the fixture rests on the final Phase 1 surface.
4. `B1.4-C`: use the all-domain fixture to prove the phase-exit demo/export
   handoff boundary.
5. `B1.4-D`: update `trace/phase1/status.yaml` exit criteria and close Phase 1
   only after the above are complete or explicitly waived.
