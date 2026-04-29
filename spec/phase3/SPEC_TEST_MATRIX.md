---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 3 Test Matrix

## Purpose

This draft matrix defines the acceptance scenarios Builder will consume after
Phase 3 specs are frozen. Every scenario references requirement IDs from the
Phase 3 domain specs.

## Stage A Batch Shape

The initial Builder ordering should keep one vertical slice at a time:

1. Authoring-loop acceptance deck and compile diagnostics.
2. Browser preview diagnostics and evidence-driven repair.
3. `cadenza-best-practices` rule/eval strengthening.
4. Raw Remotion warning and Phase 3 boundary guards.
5. Optional thin IR or read-only MCP only if Stage B promotes them.

## Acceptance Scenarios

| Test ID | Priority | Requirement IDs | Scenario |
| :--- | :--- | :--- | :--- |
| TC-AUTH-001 | P0 | AUTH-001, AUTH-006, RULE-005 | A small agent-authored technical deck uses public typed API and render-safe surfaces only. |
| TC-AUTH-002 | P0 | AUTH-002, DIAG-001, DIAG-004 | The acceptance deck compiles, while a targeted invalid deck returns ordered compile diagnostics for repair. |
| TC-AUTH-003 | P0 | AUTH-003, DIAG-002 | The Phase 3 acceptance deck mounts through the Phase 2 browser preview path and reports preview diagnostics through the shared channel. |
| TC-AUTH-004 | P0 | AUTH-004, AUTH-005, AIBND-003 | An intentional authoring failure is repaired through diagnostics, with before/after evidence and no framework-internal edits. |
| TC-DIAG-001 | P0 | DIAG-001, DIAG-004 | Compile diagnostics remain machine-readable and are grouped into a deterministic repair queue. |
| TC-DIAG-002 | P0 | DIAG-002 | Browser preview diagnostics include Cadenza runtime diagnostics and Remotion Player errors where they occur. |
| TC-DIAG-003 | P1 | DIAG-003, DIAG-005 | Repair evidence separates acceptance proof from trace declarations and includes traceable requirement or scenario references. |
| TC-DIAG-004 | P2 | DIAG-006 | Thin IR behavior is tested only if Stage B promotes thin IR into the frozen Phase 3 contract. |
| TC-RULE-001 | P0 | RULE-001, RULE-002 | `cadenza-best-practices` teaches the local authoring loop and generated mirrors stay consistent. |
| TC-RULE-002 | P1 | RULE-003, RULE-005 | Data-explainer guidance and examples use public Cadenza surfaces without creating a chart package. |
| TC-RULE-003 | P1 | RULE-004, RULE-006, AIBND-005 | Skill evals reward diagnostics-driven repair and penalize raw Remotion drift, framework edits, export claims, and Phase 4 claims. |
| TC-AIBND-001 | P0 | AIBND-001 | Phase 3 artifacts avoid export, hosted-rendering, presenter-product, public-stability, and external-alpha claims. |
| TC-AIBND-002 | P1 | AIBND-002 | Raw Remotion usage follows the Stage B warning policy and keeps escape hatches available. |
| TC-AIBND-003 | P1 | AIBND-004, AIBND-006 | Read-only MCP is either verified as resources/prompts only or explicitly deferred; tool-based MCP is absent unless separately approved. |

## Freeze Candidate Summary

- `FC-AUTH-01`: local loop command shape.
- `FC-AUTH-02`: canonical Phase 3 acceptance deck source.
- `FC-RULE-01`: data-explainer guidance shape.
- `FC-RULE-02`: mono-skill eval evidence depth.
- `FC-DIAG-01`: thin IR versus normalized repair report.
- `FC-DIAG-02`: persisted repair report format.
- `FC-AIBND-01`: raw Remotion warning policy.
- `FC-AIBND-02`: read-only MCP boundary.

## Explicit Non-Scenarios

The following are not Phase 3 acceptance scenarios:

- MP4 export.
- PDF export.
- hosted rendering or Remotion Lambda.
- presenter view, chapters, outline, or product-layer workflows.
- typography auto-fit or density engine as a product feature.
- visual editor, template marketplace, collaboration, comments, SSO, or i18n
  infrastructure.
- public API stability over time.
- external alpha usage.
- tool-based MCP unless explicitly approved outside this Stage A draft.
