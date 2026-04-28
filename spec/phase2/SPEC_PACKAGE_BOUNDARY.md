---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 2 Package Boundary Specification

## Purpose

This frozen contract defines the package and public import boundary for the
React + Remotion Preview Adapter. Phase 2 must keep the Phase 1 semantic core
stable while adding a real browser preview layer backed by `@remotion/player`.

Phase 2 does not claim MP4 export, PDF export, hosted rendering, external alpha
usage, or public API stability.

## Approved Design Decisions

The maintainer approved the Stage A recommendation and authorized freeze on
2026-04-29.

### Preview Package Shape

1. Add a dedicated `@cadenza-dev/preview-remotion` package.
2. Add a `@cadenza-dev/core/remotion` subpath export.
3. Keep the adapter as test-only infrastructure.

**Decision**: option 1. A dedicated package keeps React/Remotion peer
dependencies out of `@cadenza-dev/core` while making the preview adapter a
real public surface instead of a browser-test artifact.

### Fixture Ownership

1. Keep the Phase 1 all-domain fixture in `@cadenza-dev/core`; the preview
   package consumes it only in tests.
2. Move the all-domain fixture into the preview package.
3. Duplicate a preview-specific fixture.

**Decision**: option 1. The all-domain fixture proves the inherited semantic
core; Phase 2 should render that fixture rather than redefine it.

## Requirements

- **ID**: PKG-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 2 MUST define a public React + Remotion preview package
  boundary that imports the Phase 1 core package instead of moving semantic
  compiler/runtime responsibilities into the preview layer.
- **Verification**: Typecheck fixture imports preview APIs and core APIs through
  public package entry points only.

- **ID**: PKG-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The preview adapter MUST treat `@remotion/player`, `remotion`,
  `react`, and `react-dom` as preview-layer dependencies or peer dependencies;
  `@cadenza-dev/core` MUST NOT gain a hard dependency on `@remotion/player`.
- **Verification**: Package manifest test asserts dependency placement and
  public import boundaries.

- **ID**: PKG-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The preview package MUST expose a typed public API for mounting
  a compiled Cadenza deck in a Remotion Player-backed browser preview.
- **Verification**: Typecheck fixture mounts the all-domain fixture through the
  preview package without importing private source files.

- **ID**: PKG-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The preview package SHOULD expose a small controller surface
  for `next`, `previous`, `goto`, current cursor, diagnostics, and presenter
  metadata without exposing raw Remotion frame math to Cadenza authors.
- **Verification**: Unit or type test asserts the controller surface maps to
  Cadenza runtime types and not raw Remotion-only types.

- **ID**: PKG-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The Phase 1 all-domain MVP fixture SHOULD remain owned by the
  core package and be consumed by Phase 2 preview tests as inherited input.
- **Verification**: Browser preview test imports or constructs the all-domain
  fixture through public or test-supported core exports, with no duplicated
  preview-only equivalent.

- **ID**: PKG-006
- **Priority**: P2
- **Owner**: Architect -> Builder
- **Statement**: The preview package MAY expose lower-level hooks for custom UI
  controls if they preserve the same frame/cursor synchronization contract as
  the default component.
- **Verification**: Optional type fixture composes a custom controls shell
  around the preview controller.

## Deferred Out Of Phase

- Hosted rendering package boundaries are deferred to Phase 5 or later.
- MP4/PDF export package boundaries are deferred to Phase 5.
- AI repair-loop package boundaries are deferred to Phase 3 unless Stage A
  review finds they are required for preview diagnostics.
