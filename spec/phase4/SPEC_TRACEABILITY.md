---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 4 Traceability Matrix

## Purpose

This frozen matrix maps Phase 4 requirements to acceptance scenarios and future
implementation or artifact locations. It is a planning map for Builder, not
evidence that any scenario has already passed.

## Matrix

| Requirement ID | Test IDs | Future code or artifact location |
| :--- | :--- | :--- |
| DOGF-001 | TC-DOGF-001 | `examples/phase4/`, public package imports, or resolved authored-deck path |
| DOGF-002 | TC-DOGF-001 | Phase 4 dogfood talk source and metadata |
| DOGF-003 | TC-DOGF-002 | local preview route, example entrypoint, or preview command |
| DOGF-004 | TC-DOGF-001 | `examples/phase4/` or resolved authored-deck path outside package source |
| DOGF-005 | TC-STAR-003 | Phase 4 specs, examples, starters, trace, and guidance |
| PRES-001 | TC-PRES-001 | presenter workflow state and inherited runtime metadata path |
| PRES-002 | TC-PRES-001 | presenter current/next context surface |
| PRES-003 | TC-PRES-001 | notes metadata and presenter view surface |
| PRES-004 | TC-PRES-002 | outline or chapter metadata and runtime `goto` path |
| PRES-005 | TC-PRES-002 | presenter controls and preview controller path |
| PRES-006 | TC-VARR-001 | presenter-visible diagnostics or layout state |
| VARR-001 | TC-VARR-001 | visual acceptance record under `trace/phase4/evidence/` after phase routing opens |
| VARR-002 | TC-VARR-002 | visual acceptance validation or evidence checker |
| VARR-003 | TC-VARR-003 | repair evidence, authored deck path, and framework-defect routing |
| VARR-004 | TC-VARR-001 | visual acceptance JSON and Markdown summary |
| VARR-005 | TC-VARR-001 | local preview or presenter diagnostics surface |
| VARR-006 | TC-VARR-002 | optional screenshot or pixel sanity artifacts |
| TYPO-001 | TC-TYPO-001 | typography fit logic or validation path |
| TYPO-002 | TC-TYPO-001 | typography fit bounds and overflow fallback diagnostics |
| TYPO-003 | TC-TYPO-002 | density diagnostics path and locator fields |
| TYPO-004 | TC-TYPO-002 | preview-observable typography and density state |
| TYPO-005 | TC-STAR-003 | Phase 4 typography guidance and scope guards |
| TRPR-001 | TC-TRPR-001 | typed transition declarations, theme motion tokens, or starter examples |
| TRPR-002 | TC-TRPR-001 | preview navigation and transition playback path |
| TRPR-003 | TC-TRPR-002 | cursor-change boundary and internal progress surface |
| TRPR-004 | TC-TRPR-002 | transition diagnostics path |
| TRPR-005 | TC-STAR-003 | Phase 4 transition guidance and scope guards |
| STAR-001 | TC-STAR-001 | `skills/cadenza/` and `examples/phase4/` starter guidance |
| STAR-002 | TC-STAR-001 | starter TSX examples and public import checks |
| STAR-003 | TC-STAR-002 | `skills/cadenza/SKILL.md` and Phase 4 rule files |
| STAR-004 | TC-STAR-002 | `skills/cadenza/evals/evals.json` and curated eval evidence |
| STAR-005 | TC-STAR-003 | WIP deferral note for read-only MCP and tool-based MCP absence |
| STAR-006 | TC-STAR-003 | starter examples, guidance, and boundary claim scans |

## Frozen Notes

- Future locations are not permission to edit previously frozen specs, Accepted
  ADRs, or `STATUS.yaml.current_phase`.
- `trace/phase4/evidence/` is a planned evidence path for Builder or closeout
  after Phase 4 routing is opened; this frozen contract does not create Phase 4
  trace scaffolding.
- Read-only MCP is a Phase 4 closeout or Phase 5-start evaluation item.
  Tool-based MCP is outside Phase 4 unless a later approved ADR and frozen spec
  supersede this contract.
