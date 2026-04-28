---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 2 Test Matrix

## Purpose

This draft matrix defines the acceptance scenarios Builder will consume after
Phase 2 specs are frozen. Every scenario references requirement IDs from the
Phase 2 domain specs.

## Stage A Batch Shape

The initial Builder ordering should keep one vertical slice at a time:

1. Package boundary and public type surface.
2. Minimal Remotion Player mount for the all-domain fixture.
3. Navigation and frame/cursor synchronization.
4. Render-safe readiness inside Remotion preview.
5. Browser validation and traceability coverage evidence.

## Acceptance Scenarios

| Test ID | Priority | Requirement IDs | Scenario |
| :--- | :--- | :--- | :--- |
| TC-PKG-001 | P0 | PKG-001, PKG-002, PKG-003, PKG-005 | Public preview package imports compile while `@cadenza-dev/core` remains free of a hard `@remotion/player` dependency. |
| TC-PKG-004 | P1 | PKG-004, PKG-006 | Preview controller and optional custom-control hook expose Cadenza semantic state without exposing raw frame math to authors. |
| TC-PRAD-001 | P0 | PRAD-001, PRAD-002, BROW-001, BROW-002 | The all-domain fixture mounts inside a real React tree containing `@remotion/player` with timeline-derived Player props. |
| TC-PRAD-003 | P0 | PRAD-003, PRAD-005, BROW-003 | Cadenza `next`, `previous`, and `goto` navigation resolve through runtime anchors and settle the Player at semantic step anchors. |
| TC-PRAD-004 | P0 | PRAD-004, PRAD-006, BROW-004 | Player frame changes from playback, seeking, or scrubbing keep Cadenza cursor and presenter metadata synchronized. |
| TC-PRAD-007 | P1 | PRAD-007, BROW-007 | Preview diagnostics combine Cadenza runtime diagnostics and Remotion Player errors with traceable evidence. |
| TC-PRAD-008 | P2 | PRAD-008 | Optional custom controls subscribe to Player frame state without forcing the Player host component to re-render every frame. |
| TC-RSRM-001 | P0 | RSRM-001, RSRM-002, RSRM-003, RSRM-004, RSRM-005 | Image, font, and video readiness drive Cadenza loading state and Remotion preview buffering in browser preview. |
| TC-RSRM-006 | P1 | RSRM-006, RSRM-007, RSRM-008, BROW-005 | `TypographyBox`, `MediaFrame`, and `ContentSlot` expose browser measurements and validation metadata. |
| TC-RSRM-009 | P2 | RSRM-009, BROW-009 | Render-time compatibility hooks, if present, do not create Phase 2 export claims. |
| TC-BROW-006 | P1 | BROW-006, BROW-008 | Browser validation includes a targeted nonblank visual sanity check without requiring a broad screenshot-diff suite. |
| TC-TRAC-001 | P0 | TRAC-001, TRAC-002, TRAC-003, TRAC-004 | Phase 2 traceability coverage report compares specs, test matrix, traceability matrix, tests, and implementation evidence without mutating frozen Phase 1 specs. |
| TC-TRAC-005 | P1 | TRAC-005, TRAC-006 | Phase 2 tracker/status evidence records Stage A/B decisions and separates deferred WIP from Phase 2 acceptance scope. |

## Stage A Freeze Candidates

- `FC-PKG-01`: preview package shape.
- `FC-PRAD-01`: transition playback policy.
- `FC-PRAD-02`: Player frame event source.
- `FC-RSRM-01`: readiness bridge mechanism.
- `FC-RSRM-02`: font readiness source.
- `FC-BROW-01`: browser visual evidence depth.
- `FC-TRAC-01`: coverage report versus hard gate.

## Explicit Non-Scenarios

The following are not Phase 2 acceptance scenarios:

- MP4 export.
- PDF export.
- hosted rendering or Remotion Lambda.
- external alpha usage.
- public API stability over time.
- AI repair loop or MCP implementation unless explicitly promoted during
  Stage A review.
