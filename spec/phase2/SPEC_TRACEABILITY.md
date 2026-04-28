---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 2 Traceability Matrix

## Purpose

This frozen matrix maps Phase 2 requirements to test scenarios and future
implementation evidence. The governance requirements for the deferred
`REV-P1-004` finding live in `SPEC_TRACEABILITY_COVERAGE.md`; this file stays
as the repository-tooling-friendly mapping surface.

## Matrix

| Requirement ID | Test IDs | Future code location |
| :--- | :--- | :--- |
| PKG-001 | TC-PKG-001 | `packages/preview-remotion/src/` or resolved preview package path |
| PKG-002 | TC-PKG-001 | `packages/*/package.json` |
| PKG-003 | TC-PKG-001, TC-PRAD-001 | `packages/preview-remotion/src/index.ts` |
| PKG-004 | TC-PKG-004 | `packages/preview-remotion/src/controller.ts` |
| PKG-005 | TC-PKG-001, TC-PRAD-001 | `packages/core/src/fixtures/allDomainMvp.ts` |
| PKG-006 | TC-PKG-004, TC-PRAD-008 | `packages/preview-remotion/src/useCadenzaPreviewController.ts` |
| PRAD-001 | TC-PRAD-001 | `packages/preview-remotion/src/CadenzaPlayer.tsx` |
| PRAD-002 | TC-PRAD-001 | `packages/preview-remotion/src/playerProps.ts` |
| PRAD-003 | TC-PRAD-003 | `packages/preview-remotion/src/navigation.ts` |
| PRAD-004 | TC-PRAD-004 | `packages/preview-remotion/src/frameSync.ts` |
| PRAD-005 | TC-PRAD-003 | `packages/preview-remotion/src/navigation.ts` |
| PRAD-006 | TC-PRAD-004 | `packages/preview-remotion/src/frameSync.ts` |
| PRAD-007 | TC-PRAD-007 | `packages/preview-remotion/src/diagnostics.ts` |
| PRAD-008 | TC-PRAD-008 | `packages/preview-remotion/src/useCadenzaPreviewController.ts` |
| RSRM-001 | TC-RSRM-001 | `packages/preview-remotion/src/readiness/` |
| RSRM-002 | TC-RSRM-001 | `packages/preview-remotion/src/render-safe/SafeImagePreview.tsx` |
| RSRM-003 | TC-RSRM-001 | `packages/preview-remotion/src/render-safe/SafeFontPreview.tsx` |
| RSRM-004 | TC-RSRM-001 | `packages/preview-remotion/src/render-safe/SafeVideoPreview.tsx` |
| RSRM-005 | TC-RSRM-001 | `packages/preview-remotion/src/readiness/usePreviewBuffering.ts` |
| RSRM-006 | TC-RSRM-006 | `packages/preview-remotion/src/validation/typography.ts` |
| RSRM-007 | TC-RSRM-006 | `packages/preview-remotion/src/validation/mediaFrame.ts` |
| RSRM-008 | TC-RSRM-006 | `packages/preview-remotion/src/validation/contentSlot.ts` |
| RSRM-009 | TC-RSRM-009 | `packages/preview-remotion/src/render-safe/` |
| BROW-001 | TC-PRAD-001 | `tests/browser/remotion-preview.spec.ts` |
| BROW-002 | TC-PRAD-001 | `tests/browser/remotion-preview.spec.ts` |
| BROW-003 | TC-PRAD-003 | `tests/browser/remotion-preview.spec.ts` |
| BROW-004 | TC-PRAD-004 | `tests/browser/remotion-preview.spec.ts` |
| BROW-005 | TC-RSRM-006 | `tests/browser/remotion-preview.spec.ts` |
| BROW-006 | TC-BROW-006 | `tests/browser/remotion-preview.spec.ts` |
| BROW-007 | TC-PRAD-007 | `.github/workflows/ci.yml` and `playwright.config.ts` |
| BROW-008 | TC-BROW-006 | `tests/browser/remotion-preview.spec.ts` |
| BROW-009 | TC-RSRM-009 | `trace/phase2/` |
| TRAC-001 | TC-TRAC-001 | `scripts/` coverage report path to be resolved |
| TRAC-002 | TC-TRAC-001 | `spec/phase2/SPEC_TRACEABILITY.md` |
| TRAC-003 | TC-TRAC-001 | `scripts/` coverage report path to be resolved |
| TRAC-004 | TC-TRAC-001 | `spec/phase2/SPEC_TEST_MATRIX.md` |
| TRAC-005 | TC-TRAC-005 | `trace/phase2/status.yaml` and `trace/phase2/tracker.md` |
| TRAC-006 | TC-TRAC-005 | `wip/future-support/` |
