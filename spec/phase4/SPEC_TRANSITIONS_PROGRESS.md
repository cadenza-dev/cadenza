---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 4 Transitions and Progress Specification

## Purpose

This frozen contract defines stronger transition semantics for Phase 4 and the
transition-progress boundary. Phase 4 should make product-layer transitions
feel inspectable and repairable without overloading Phase 1 cursor semantics or
prematurely freezing a public animation API.

## Approved Design Decisions

The maintainer approved the Stage A recommendations on 2026-05-23.

### Transition Roster

1. Keep the existing transition declarations and improve examples only.
2. Add a small typed roster of product-layer transitions with theme-driven
   timing tokens.
3. Encourage raw Remotion transitions for richer motion.

**Decision**: option 2. Phase 4 adds a small typed transition roster with
theme-driven timing tokens. Raw Remotion remains an escape hatch, not the normal
product path.

### Transition Progress Subscription

1. No public progress subscription; keep progress internal to preview adapter.
2. Add an internal product-layer store for presenter and diagnostics surfaces.
3. Add a public transition-progress hook or callback.

**Decision**: option 2. Phase 4 may expose transition progress to presenter and
diagnostics surfaces through an internal product-layer store. It does not add a
public transition-progress hook or callback.

### Progress Evidence Granularity

1. Assert only semantic cursor arrival after transitions.
2. Assert transition start, progress, and settle events in preview diagnostics.
3. Require frame-by-frame public progress snapshots.

**Decision**: option 2. Product evidence should include transition start,
progress, and settle diagnostics, while public frame-by-frame snapshots remain
out of scope.

## Requirements

- **ID**: TRPR-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Stronger Phase 4 transitions MUST be expressed through typed
  Cadenza transition semantics or theme motion tokens by default, not through
  raw Remotion primitives as the normal authoring path.
- **Verification**: acceptance scenario `TC-TRPR-001` inspects the dogfood talk
  and starter examples for typed transition usage and raw Remotion boundary
  diagnostics where applicable.

- **ID**: TRPR-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Local preview navigation MUST play slide transitions when
  moving across slide boundaries and settle at deterministic semantic anchors.
- **Verification**: acceptance scenario `TC-TRPR-001` advances across a dogfood
  slide transition and asserts transition playback plus final cursor anchor.

- **ID**: TRPR-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 4 MUST NOT overload `onCursorChange` or semantic cursor
  events with frame-level transition progress. Transition progress for
  presenter and diagnostics surfaces MUST use a separate internal product-layer
  surface and MUST NOT become a public API stability claim.
- **Verification**: acceptance scenario `TC-TRPR-002` verifies cursor-change
  events remain semantic and progress evidence uses the internal product-layer
  surface.

- **ID**: TRPR-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Transition diagnostics SHOULD make motion repair actionable by
  exposing transition kind, duration, source slide, target slide, progress
  phase, and settle behavior when preview evidence fails.
- **Verification**: acceptance scenario `TC-TRPR-002` validates transition
  diagnostic fields for a targeted invalid or problematic transition fixture.

- **ID**: TRPR-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 4 transition work MUST NOT claim public API stability,
  export correctness, or Remotion Lambda compatibility.
- **Verification**: acceptance scenario `TC-STAR-003` scans Phase 4 artifacts
  for prohibited transition-related claims.

## Frozen Decisions

- **ID**: FC-TRPR-01
- **Decision**: Phase 4 requires a small typed product-layer transition roster
  with theme-driven timing tokens.
- **Rationale**: The product layer needs stronger defaults, while agent-facing
  authoring still needs typed, reviewable semantics.

- **ID**: FC-TRPR-02
- **Decision**: Phase 4 uses a separate internal product-layer progress surface
  for presenter and diagnostics needs. It does not add a public
  transition-progress hook or callback.
- **Rationale**: Presenter and diagnostic surfaces may need progress evidence,
  but public API stability is explicitly outside Phase 4.

- **ID**: FC-TRPR-03
- **Decision**: Transition evidence records start, progress, and settle
  diagnostics rather than only final cursor arrival or frame-by-frame public
  snapshots.
- **Rationale**: This is enough for repair and review without overexposing
  Remotion frame internals.
