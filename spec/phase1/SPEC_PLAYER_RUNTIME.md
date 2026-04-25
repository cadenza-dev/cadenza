---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 1 Player Runtime Specification

## Purpose

This frozen contract adapts the compiler output to an interactive presentation
surface backed by Remotion Player. It handles user intent, fullscreen, click
regions, and presenter metadata.

## Resolved Design Options

### Navigation Input Scope

1. Keyboard only.
2. Keyboard plus click-to-advance.
3. Keyboard, click, and programmable controller API.

**Decision**: keyboard, click, and programmable controller API are in scope, with the controller API limited to compiler runtime calls.

### Presenter Metadata

1. Current slide/step only.
2. Current slide/step plus notes and elapsed time.
3. Full presenter view with next slide preview.

**Decision**: Phase 1 exposes current slide, current step, notes, and elapsed time; full presenter view with next-slide preview is deferred to Phase 3.

## Requirements

- **ID**: PLAY-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The runtime MUST support keyboard `next` and `previous` navigation.
- **Verification**: Playwright keyboard navigation test.

- **ID**: PLAY-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The runtime MUST support step-level forward and backward movement within a slide.
- **Verification**: Runtime test over a multi-step slide fixture.

- **ID**: PLAY-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The runtime MUST seek to compiler-provided frame anchors rather than deriving frame positions in UI code.
- **Verification**: Mock Player test asserts `seekTo` frame values from TimelineMap.

- **ID**: PLAY-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The runtime SHOULD support configurable click-to-advance hit regions.
- **Verification**: Playwright click-region test.

- **ID**: PLAY-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The runtime SHOULD expose fullscreen controls using Remotion Player capabilities where possible.
- **Verification**: Browser fullscreen capability smoke test.

- **ID**: PLAY-006
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The runtime SHOULD expose presenter metadata: current slide, current step, notes, and elapsed time.
- **Verification**: Runtime metadata test.

## Frozen Decisions

- **ID**: FC-PLAY-01
- **Decision**: Phase 1 uses a configurable keyboard map with conventional defaults.
- **Rationale**: defaults should match presenter expectations, while embedders need a supported way to customize bindings.

- **ID**: FC-PLAY-02
- **Decision**: elapsed-time metadata tracks both wall-clock time and active-presenting time.
- **Rationale**: wall-clock time matches real presentation duration, while active-presenting time excludes paused loading states for cleaner pacing feedback.
