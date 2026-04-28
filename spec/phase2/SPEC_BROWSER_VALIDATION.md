---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 2 Browser Validation Specification

## Purpose

This draft contract defines the browser-observable evidence Phase 2 must
produce before the React + Remotion Preview Adapter can close. Validation must
prove real preview behavior, not only unit-level runtime behavior or a
controlled DOM harness.

## Stage A Design Options

### Browser Evidence Depth

1. DOM/state assertions only.
2. DOM/state assertions plus targeted screenshots or pixel sanity checks.
3. Full screenshot-diff suite.

**Leaning**: option 2. Phase 2 needs enough visual evidence to prove the Player
is nonblank and correctly framed, but full screenshot diffing remains too noisy
for a required MVP gate.

- **FC-ID**: FC-BROW-01
- **Question**: How much visual evidence is required for Phase 2 browser
  validation?
- **Options considered**:
  1. DOM and state assertions only.
  2. DOM/state assertions plus targeted screenshot or pixel sanity checks.
  3. Full screenshot-diff suite.
- **Leaning**: option 2.
- **Must resolve before**: Stage B freeze.

### Fixture Media Strategy

1. Use real small static assets committed to the repo.
2. Use generated data URLs and synthetic media in tests.
3. Depend on external network assets.

**Leaning**: option 1 or 2, but never option 3. Browser validation must be
hermetic in CI.

## Requirements

- **ID**: BROW-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 2 browser validation MUST mount the preview adapter in a
  real browser with a real `@remotion/player` instance, not only a mocked
  PlayerRef or controlled DOM fixture.
- **Verification**: Playwright test asserts a Remotion Player-backed preview is
  present and interactive.

- **ID**: BROW-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Browser validation MUST prove the Phase 1 all-domain fixture
  renders through the preview adapter and exposes observable content from at
  least three domains: typed API content, render-safe media/font declarations,
  and presenter or validation metadata.
- **Verification**: Playwright test queries observable fixture content and
  metadata after mounting the preview.

- **ID**: BROW-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Browser validation MUST cover keyboard or controller
  navigation that advances and retreats through the all-domain fixture via
  Remotion Player frame control.
- **Verification**: Playwright test triggers navigation and asserts frame and
  cursor changes.

- **ID**: BROW-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Browser validation MUST cover at least one native Player seek
  or scrub path and verify that Cadenza cursor state remains synchronized.
- **Verification**: Playwright test drives Player seek/scrub behavior and
  asserts Cadenza cursor state.

- **ID**: BROW-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Browser validation SHOULD measure `TypographyBox` overflow and
  `MediaFrame` aspect ratio from actual browser layout.
- **Verification**: Playwright test reads DOM layout metrics and asserts
  structured diagnostics.

- **ID**: BROW-006
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Browser validation SHOULD include a nonblank preview sanity
  check so a mounted but visually empty Remotion Player cannot pass Phase 2
  closeout.
- **Verification**: Playwright screenshot or canvas-pixel sanity check confirms
  visible rendered content.

- **ID**: BROW-007
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Browser validation SHOULD run in CI as a separate browser gate
  from unit tests, and the trace must distinguish browser-environment failures
  from logic failures.
- **Verification**: CI or local command evidence records the browser gate
  separately from `pnpm test`.

- **ID**: BROW-008
- **Priority**: P2
- **Owner**: Architect -> Builder
- **Statement**: Browser validation MAY include targeted screenshot artifacts
  for reviewer inspection, but required Phase 2 acceptance MUST NOT depend on a
  broad screenshot-diff suite.
- **Verification**: Optional browser artifact is produced without becoming the
  required acceptance oracle.

- **ID**: BROW-009
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Browser validation MUST NOT claim MP4 export, PDF export,
  hosted rendering, or public API stability.
- **Verification**: Test matrix and traceability contain no export acceptance
  scenario for Phase 2.
