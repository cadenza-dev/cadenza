---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 1 Compiler Specification

## Purpose

This Stage A draft turns the frozen compiler design into a formal Phase 1
contract. The compiler maps typed presentation state onto Remotion frame
coordinates and exposes deterministic runtime navigation.

## Stage A Options

### Timeline Mutability

1. Fully static TimelineMap.
2. Runtime-elastic TimelineMap for `wait-for-event` and `computed` steps.
3. Separate static preview and runtime maps.

**Leaning**: option 2 for interactive preview; offline export is static.

### Transition Navigation Policy

1. `cut-to-next` only.
2. Deck-level configurable policy.
3. Per-transition configurable policy.

**Leaning**: option 2, matching the frozen design without state explosion.

## Requirements

- **ID**: COMP-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `compile(deck)` MUST return a TimelineMap with `totalFrames`, ordered slides, step segments, and transition segments.
- **Verification**: Unit test `compile.timeline-map.test.ts`.

- **ID**: COMP-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The compiler MUST enforce temporal monotonicity for slide and step anchors.
- **Verification**: Unit test iterates compiled anchors and asserts strict ordering.

- **ID**: COMP-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Every valid frame in `[0, totalFrames)` MUST map to exactly one cursor.
- **Verification**: Unit test checks cursor completeness over representative fixtures.

- **ID**: COMP-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The runtime MUST expose `goto`, `next`, `previous`, `getCursor`, and `onCursorChange`.
- **Verification**: Type tests and runtime navigation tests.

- **ID**: COMP-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `wait-for-event` steps MUST use an expandable runtime interval and an `exportDuration` in offline mode.
- **Verification**: Runtime test for expansion and export test for static output.

- **ID**: COMP-006
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `computed` steps MUST enter loading while unresolved and MUST fail export if unresolved before offline compilation.
- **Verification**: Runtime loading test and export error test.

- **ID**: COMP-007
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Mid-transition navigation MUST support deck-level policies `cut-to-next`, `finish-then-advance`, and `queue-next`, defaulting to `cut-to-next`.
- **Verification**: Runtime transition policy tests.

- **ID**: COMP-008
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Nested `Deck` usage MUST be rejected in Phase 1.
- **Verification**: Compiler error fixture.

- **ID**: COMP-009
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Decks exceeding 60 minutes SHOULD emit a compile-time warning, not a hard error.
- **Verification**: Unit test asserts warning metadata.

- **ID**: COMP-010
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: `onCursorChange` SHOULD emit semantic cursor transitions, not frame-level progress events.
- **Verification**: Runtime event emission test.

## Freeze Candidates

- **FC-ID**: FC-COMP-01
- **Question**: How should runtime interval mutation be represented internally?
- **Options considered**:
  1. Mutate TimelineMap in place.
  2. Store immutable base map plus runtime deltas.
  3. Recompile a new map on every extension.
- **Leaning**: option 2 for debuggability.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-COMP-02
- **Question**: Should `finish-then-advance` discard or defer repeated input?
- **Options considered**:
  1. Discard repeated input.
  2. Keep one pending input.
  3. Keep a full queue.
- **Leaning**: keep one pending input.
- **Must resolve before**: Stage B freeze.
