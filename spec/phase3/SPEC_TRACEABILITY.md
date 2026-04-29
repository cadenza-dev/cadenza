---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 3 Traceability Matrix

## Purpose

This draft matrix maps Phase 3 requirements to test scenarios and future
implementation or artifact locations. It is a planning map for Builder after
Stage B freeze, not evidence that any scenario has already passed.

## Matrix

| Requirement ID | Test IDs | Future code or artifact location |
| :--- | :--- | :--- |
| AUTH-001 | TC-AUTH-001 | `packages/core/src/fixtures/`, `tests/`, or resolved Phase 3 deck fixture path |
| AUTH-002 | TC-AUTH-002 | `packages/core/src/validation/`, compile tests, or resolved repair-loop path |
| AUTH-003 | TC-AUTH-003 | `tests/browser/remotion-preview.spec.ts` or Phase 3 browser spec |
| AUTH-004 | TC-AUTH-004 | Phase 3 repair-loop tests and evidence artifact |
| AUTH-005 | TC-AUTH-004 | `trace/phase3/` repair evidence or generated report path |
| AUTH-006 | TC-AUTH-001 | Phase 3 acceptance deck fixture |
| RULE-001 | TC-RULE-001 | `skills/cadenza/`, `.agents/skills/cadenza-best-practices`, `.claude/skills/cadenza-best-practices` |
| RULE-002 | TC-RULE-001 | `skills/cadenza/SKILL.md` and `skills/cadenza/rules/` |
| RULE-003 | TC-RULE-002 | `skills/cadenza/rules/` and `skills/cadenza/evals/evals.json` |
| RULE-004 | TC-RULE-003 | `skills/cadenza/evals/evals.json` and curated eval evidence |
| RULE-005 | TC-AUTH-001, TC-RULE-002 | `skills/cadenza/` examples or resolved fixture path |
| RULE-006 | TC-RULE-003 | `skills/cadenza/rules/` and trace rationale |
| DIAG-001 | TC-AUTH-002, TC-DIAG-001 | `packages/core/src/validation/` |
| DIAG-002 | TC-AUTH-003, TC-DIAG-002 | `packages/preview-remotion/src/` diagnostics and browser tests |
| DIAG-003 | TC-DIAG-003 | traceability coverage tests or Phase 3 repair evidence checks |
| DIAG-004 | TC-AUTH-002, TC-DIAG-001 | repair report or validation report path |
| DIAG-005 | TC-DIAG-003 | repair report or validation report path |
| DIAG-006 | TC-DIAG-004 | thin IR path only if promoted during Stage B |
| AIBND-001 | TC-AIBND-001 | Phase 3 docs, skills, trace, and examples |
| AIBND-002 | TC-AIBND-002 | raw Remotion warning implementation or lint/diagnostic path |
| AIBND-003 | TC-AUTH-004 | repair-loop tests and evidence artifact |
| AIBND-004 | TC-AIBND-003 | MCP resource/prompt path only if promoted during Stage B |
| AIBND-005 | TC-RULE-003 | `skills/cadenza/evals/evals.json` |
| AIBND-006 | TC-AIBND-003 | WIP deferral note or approved MCP design artifact |

## Stage A Notes

- `TC-DIAG-004` is intentionally P2 and conditional. It should disappear or be
  marked deferred during Stage B if thin IR is not promoted.
- `TC-AIBND-003` can be satisfied by explicit deferral if read-only MCP remains
  outside the frozen Phase 3 contract.
- Future locations are not permission to edit `CONTRACT_FROZEN` specs or
  Accepted ADRs.
