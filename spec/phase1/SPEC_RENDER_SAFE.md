---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 1 Render-Safe Layer Specification

## Purpose

This frozen contract wraps Remotion's common asynchronous and visual failure
surfaces so agents can generate reliable decks without touching sharp runtime
primitives by default.

## Resolved Design Options

### Failure Behavior

1. Silent fallback.
2. Loud runtime error.
3. User-visible degraded state plus emitted diagnostic.

**Decision**: assets use user-visible degraded states plus emitted diagnostics; invalid authoring uses loud runtime or compile-time errors.

### Component Roster

1. Minimal media-only roster.
2. Six-component roster from ADR 0002.
3. Larger layout-and-template library.

**Decision**: ship the six-component roster from ADR 0002.

## Requirements

- **ID**: RSAF-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 1 MUST provide `SafeImage`, `SafeFont`, `SafeVideo`, `TypographyBox`, `MediaFrame`, and `ContentSlot`.
- **Verification**: Public export type tests.

- **ID**: RSAF-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `SafeImage` MUST register asset readiness before the runtime enters the target slide.
- **Verification**: Runtime asset-readiness integration test.

- **ID**: RSAF-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `SafeFont` MUST prevent text render before required font readiness is reported.
- **Verification**: Browser test asserts no fallback text flash in controlled fixture.

- **ID**: RSAF-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `SafeVideo` MUST gate slide entry until metadata needed for deterministic playback is available or timeout occurs.
- **Verification**: Browser test with delayed metadata fixture.

- **ID**: RSAF-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `TypographyBox` MUST detect overflow and emit a validation diagnostic.
- **Verification**: Playwright measurement test.

- **ID**: RSAF-006
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: `MediaFrame` SHOULD preserve aspect ratio and provide consistent poster/export snapshot behavior.
- **Verification**: Visual fixture and DOM measurement test.

- **ID**: RSAF-007
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: `ContentSlot` SHOULD expose density and readability metadata to validation.
- **Verification**: Validation fixture reads slot metadata.

- **ID**: RSAF-008
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Render-safe components SHOULD emit structured diagnostics instead of raw Remotion errors where possible.
- **Verification**: Diagnostic shape tests.

## Frozen Decisions

- **ID**: FC-RSAF-01
- **Decision**: asset timeout defaults are per component; image and video default to 10 seconds.
- **Rationale**: different asset types fail differently, so one global timeout is too coarse, while author-required values add too much MVP friction.

- **ID**: FC-RSAF-02
- **Decision**: `TypographyBox` reports overflow in Phase 1; auto-fit and density-engine behavior are deferred to Phase 3.
- **Rationale**: reporting overflow gives the validation and repair loop a reliable signal without introducing premature visual-quality heuristics.
