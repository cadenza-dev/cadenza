---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 1 Traceability Matrix

## Purpose

This draft links requirement IDs to acceptance tests and future code locations.
Code locations are intentionally placeholders until Builder implementation
begins.

## Matrix

| Requirement ID | Test IDs | Future code location |
| :--- | :--- | :--- |
| TAPI-001 | TC-TAPI-001 | `packages/*/src/typed-api/` |
| TAPI-002 | TC-TAPI-001 | `packages/*/src/typed-api/Deck.tsx` |
| TAPI-003 | TC-COMP-001 | `packages/*/src/typed-api/Slide.tsx` |
| TAPI-004 | TC-TAPI-004 | `packages/*/src/typed-api/Step.tsx` |
| TAPI-005 | TC-COMP-007 | `packages/*/src/typed-api/Transition.tsx` |
| TAPI-006 | TC-PLAY-006 | `packages/*/src/typed-api/Notes.tsx` |
| TAPI-007 | TC-TAPI-001 | `packages/*/src/theme/` |
| TAPI-008 | TC-TAPI-001 | `packages/*/src/mdx/` |
| COMP-001 | TC-COMP-001 | `packages/*/src/compiler/compile.ts` |
| COMP-002 | TC-COMP-001 | `packages/*/src/compiler/invariants.ts` |
| COMP-003 | TC-COMP-001 | `packages/*/src/compiler/cursor.ts` |
| COMP-004 | TC-COMP-004 | `packages/*/src/runtime/createRuntime.ts` |
| COMP-005 | TC-TAPI-004 | `packages/*/src/compiler/steps.ts` |
| COMP-006 | TC-TAPI-004 | `packages/*/src/compiler/steps.ts` |
| COMP-007 | TC-COMP-007 | `packages/*/src/runtime/navigationPolicy.ts` |
| COMP-008 | TC-VAL-001 | `packages/*/src/compiler/validate.ts` |
| COMP-009 | TC-COMP-001 | `packages/*/src/compiler/warnings.ts` |
| COMP-010 | TC-COMP-004 | `packages/*/src/runtime/events.ts` |
| RSAF-001 | TC-SKIL-001 | `packages/*/src/render-safe/` |
| RSAF-002 | TC-RSAF-002 | `packages/*/src/render-safe/SafeImage.tsx` |
| RSAF-003 | TC-RSAF-002 | `packages/*/src/render-safe/SafeFont.tsx` |
| RSAF-004 | TC-RSAF-002 | `packages/*/src/render-safe/SafeVideo.tsx` |
| RSAF-005 | TC-RSAF-005 | `packages/*/src/render-safe/TypographyBox.tsx` |
| RSAF-006 | TC-RSAF-005 | `packages/*/src/render-safe/MediaFrame.tsx` |
| RSAF-007 | TC-RSAF-005 | `packages/*/src/render-safe/ContentSlot.tsx` |
| RSAF-008 | TC-VAL-001 | `packages/*/src/diagnostics/` |
| PLAY-001 | TC-PLAY-001 | `packages/*/src/player/keyboard.ts` |
| PLAY-002 | TC-PLAY-001 | `packages/*/src/player/navigation.ts` |
| PLAY-003 | TC-COMP-004 | `packages/*/src/player/seek.ts` |
| PLAY-004 | TC-PLAY-004 | `packages/*/src/player/clickRegions.ts` |
| PLAY-005 | TC-PLAY-004 | `packages/*/src/player/fullscreen.ts` |
| PLAY-006 | TC-PLAY-006 | `packages/*/src/player/presenterMetadata.ts` |
| VAL-001 | TC-VAL-001 | `packages/*/src/validation/static.ts` |
| VAL-002 | TC-VAL-001 | `packages/*/src/diagnostics/types.ts` |
| VAL-003 | TC-VAL-001 | `packages/*/src/validation/errors.ts` |
| VAL-004 | TC-RSAF-005 | `packages/*/src/validation/browser.ts` |
| VAL-005 | TC-RSAF-002 | `packages/*/src/validation/assets.ts` |
| VAL-006 | TC-VAL-006 | `packages/*/src/validation/report.ts` |
| SKIL-001 | TC-SKIL-001 | `.agents/skills/` |
| SKIL-002 | TC-SKIL-001 | `.agents/skills/` |
| SKIL-003 | TC-SKIL-001 | `.agents/skills/` |
| SKIL-004 | TC-SKIL-004 | `.agents/skills/` |
| SKIL-005 | TC-SKIL-004, TC-VAL-006 | `.agents/skills/` |
| SKIL-006 | TC-SKIL-001 | `scripts/commands-sync.sh` or successor |

## Freeze Candidates

- **FC-ID**: FC-TAPI-98
- **Question**: Should future code locations name final package names before workspace bootstrap?
- **Options considered**:
  1. Use concrete package names now.
  2. Use `packages/*` placeholders until Builder bootstrap.
  3. Omit code locations until implementation.
- **Leaning**: option 2.
- **Must resolve before**: Stage B freeze.
