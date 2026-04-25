---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 1 Test Matrix

## Purpose

This frozen matrix lists acceptance scenarios that Builder consumes during Phase 1.
Every test case references one or more requirement IDs from the domain specs.

## Acceptance Scenarios

| Test ID | Priority | Requirement IDs | Scenario |
| :--- | :--- | :--- | :--- |
| TC-TAPI-001 | P0 | TAPI-001, TAPI-002 | Public typed API primitives import and compile with deck-level FPS. |
| TC-TAPI-004 | P0 | TAPI-004, COMP-005, COMP-006 | Fixed, wait-for-event, and computed steps compile into expected step kinds. |
| TC-COMP-001 | P0 | COMP-001, COMP-002, COMP-003 | A multi-slide deck compiles to a monotonic TimelineMap with complete cursor coverage. |
| TC-COMP-004 | P0 | COMP-004, PLAY-003 | Runtime `goto`, `next`, and `previous` seek to compiler-provided frame anchors. |
| TC-COMP-007 | P0 | COMP-007 | Mid-transition navigation follows the configured deck-level policy. |
| TC-RSAF-002 | P0 | RSAF-002, RSAF-003, RSAF-004, VAL-005 | Asset and font readiness can move the runtime into and out of loading. |
| TC-RSAF-005 | P1 | RSAF-005, RSAF-007, VAL-004 | Overflow inside `TypographyBox` is detected and reported. |
| TC-PLAY-001 | P0 | PLAY-001, PLAY-002 | Keyboard navigation advances and retreats through slide steps. |
| TC-PLAY-004 | P1 | PLAY-004, PLAY-005 | Click regions and fullscreen controls work in browser preview. |
| TC-PLAY-006 | P1 | PLAY-006, TAPI-006 | Presenter metadata exposes current slide, step, notes, and elapsed time. |
| TC-VAL-001 | P0 | VAL-001, VAL-002, VAL-003 | Invalid authoring surfaces typed fatal diagnostics. |
| TC-VAL-006 | P2 | VAL-006, SKIL-005 | Validation report can drive an AI repair loop when available. |
| TC-SKIL-001 | P0 | SKIL-001, SKIL-002, SKIL-003 | Initial skill pack exists and instructs typed API plus render-safe usage. |
| TC-SKIL-004 | P1 | SKIL-004, SKIL-005 | Skills cover common anti-patterns and repair workflow. |

## Frozen Decision

Phase 1 includes one all-domain MVP fixture that spans the P0 requirements
across typed API, compiler, render-safe components, player, validation, and
skills. A browser export smoke test is not required until Builder bootstrap
confirms the test stack and cost.
