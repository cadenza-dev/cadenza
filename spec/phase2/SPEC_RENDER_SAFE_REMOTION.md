---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 2 Render-Safe Remotion Specification

## Purpose

This draft contract defines how Phase 1 render-safe semantics become real
browser preview behavior inside Remotion Player. Phase 2 must prove image,
font, video, typography, media, and content-slot behavior in the preview
adapter without claiming export support.

## Stage A Design Options

### Preview Readiness Mechanism

1. DOM adapter only: bind browser elements to Cadenza readiness state.
2. Remotion component bridge only: use Remotion hooks inside composition
   components.
3. Combined provider/adapter: Cadenza readiness registry plus Remotion preview
   buffering hooks.

**Leaning**: option 3. Phase 1 added a public DOM adapter, but real Remotion
preview must also participate in Player buffering behavior.

- **FC-ID**: FC-RSRM-01
- **Question**: Should Phase 2 implement readiness as DOM bindings only or as a
  Remotion-aware provider/adapter pair?
- **Options considered**:
  1. DOM bindings only.
  2. Remotion hook bridge only.
  3. Combined Cadenza readiness registry and Remotion buffering bridge.
- **Leaning**: option 3.
- **Must resolve before**: Stage B freeze.

### Font Readiness Source

1. Browser `document.fonts` where available.
2. Explicit `markReady()` only.
3. Author-provided font loader callback.

**Leaning**: option 1 with explicit fallback. This keeps browser preview honest
while preserving deterministic tests.

- **FC-ID**: FC-RSRM-02
- **Question**: Which source marks `SafeFont` ready in browser preview?
- **Options considered**:
  1. Browser `FontFaceSet` / `document.fonts`.
  2. Explicit readiness registry calls only.
  3. Author-provided loader callback only.
- **Leaning**: option 1 with option 2 available for tests and unsupported
  browsers.
- **Must resolve before**: Stage B freeze.

## Requirements

- **ID**: RSRM-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The preview adapter MUST connect Phase 1 render-safe resource
  declarations to a shared Cadenza readiness registry during browser preview.
- **Verification**: Browser test observes runtime `loading` cursor until a
  declared resource becomes ready.

- **ID**: RSRM-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `SafeImage` preview behavior MUST mark image resources ready
  only after the browser image load path succeeds, or emit a structured
  diagnostic on timeout or failure.
- **Verification**: Browser fixture covers image ready and timeout/failure
  states.

- **ID**: RSRM-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `SafeFont` preview behavior MUST prevent required text from
  becoming visible before the associated font readiness is reported.
- **Verification**: Playwright test asserts hidden text before readiness and
  visible text after readiness.

- **ID**: RSRM-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `SafeVideo` preview behavior MUST gate slide entry until
  video metadata needed for deterministic playback is available or the resource
  timeout degrades the preview with a diagnostic.
- **Verification**: Playwright test dispatches delayed `loadedmetadata` and
  observes runtime cursor and diagnostics.

- **ID**: RSRM-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Render-safe preview loading MUST use Remotion Player buffering
  behavior for preview-time pauses rather than relying on `delayRender()` alone,
  because `delayRender()` is a render-time mechanism and is a no-op in Player
  preview environments.
- **Verification**: Browser test observes Player buffering or paused preview
  state while a render-safe resource is unresolved.

- **ID**: RSRM-006
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: `TypographyBox` SHOULD expose browser measurement data for
  overflow diagnostics in the preview adapter.
- **Verification**: Playwright measurement test asserts overflow diagnostics
  include source ID and requirement reference.

- **ID**: RSRM-007
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: `MediaFrame` SHOULD expose measured aspect-ratio data in
  browser preview and emit diagnostics when observed layout differs from the
  expected ratio beyond the accepted tolerance.
- **Verification**: Playwright measurement test asserts media-frame
  measurements and diagnostics.

- **ID**: RSRM-008
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: `ContentSlot` SHOULD expose density and readability metadata
  to preview diagnostics without becoming a template system.
- **Verification**: Browser or unit test reads content-slot metadata from the
  preview validation path.

- **ID**: RSRM-009
- **Priority**: P2
- **Owner**: Architect -> Builder
- **Statement**: Render-safe preview components MAY call render-time APIs such
  as `useDelayRender()` to preserve future export compatibility, but Phase 2
  MUST NOT claim MP4/PDF export support from that implementation detail.
- **Verification**: Documentation and tests assert Phase 2 preview scope and
  absence of export acceptance scenarios.

## External API Notes

Remotion documents `useBufferState().delayPlayback()` as the Player/Studio
preview mechanism for pausing playback while content loads. It documents
`delayRender()` / `continueRender()` as render-time mechanisms that do not
affect Player preview. Phase 2 preview readiness must respect that boundary.
