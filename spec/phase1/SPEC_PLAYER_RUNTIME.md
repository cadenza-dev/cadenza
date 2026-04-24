---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 1 Player Runtime Specification

## Purpose

The player runtime adapts the compiler output to an interactive presentation
surface backed by Remotion Player. It handles user intent, fullscreen, click
regions, and presenter metadata.

## Stage A Options

### Navigation Input Scope

1. Keyboard only.
2. Keyboard plus click-to-advance.
3. Keyboard, click, and programmable controller API.

**Leaning**: option 3, with the controller API limited to compiler runtime calls.

### Presenter Metadata

1. Current slide/step only.
2. Current slide/step plus notes and elapsed time.
3. Full presenter view with next slide preview.

**Leaning**: option 2 for Phase 1; full presenter view is Phase 3.

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

## Freeze Candidates

- **FC-ID**: FC-PLAY-01
- **Question**: Which keyboard bindings are Phase 1 defaults?
- **Options considered**:
  1. Arrow keys only.
  2. Arrow keys plus space/backspace.
  3. Configurable map with conventional defaults.
- **Leaning**: option 3.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-PLAY-02
- **Question**: Should elapsed time count paused loading states?
- **Options considered**:
  1. Include loading.
  2. Exclude loading.
  3. Track both wall-clock and active-presenting time.
- **Leaning**: option 3.
- **Must resolve before**: Stage B freeze.
