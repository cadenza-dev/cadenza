---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 5 Traceability Matrix

## Purpose

This frozen matrix maps Phase 5 requirements to acceptance scenarios and future
implementation or evidence locations. It is a routing map for Builder, not
evidence that any scenario has passed.

## Matrix

| Requirement ID | Test IDs | Future code or artifact location |
| :--- | :--- | :--- |
| EXPT-001 | TC-EXPT-001 | `examples/phase5/`, public package imports, or resolved authored-deck path |
| EXPT-002 | TC-EXPT-002 | local export command, package script, or export entrypoint |
| EXPT-003 | TC-EXPT-002 | export manifest, deterministic timeline identity, and repeat-run fixture |
| EXPT-004 | TC-LHEV-002 | export command, package scripts, CI config, and evidence boundary scans |
| EXPT-005 | TC-EXPT-001 | documented command surface and export workflow docs |
| PEXP-001 | TC-PEXP-001 | preview/export metadata comparison and timeline identity fields |
| PEXP-002 | TC-PEXP-001 | preview/export parity checker and browser export smoke path |
| PEXP-003 | TC-PEXP-002 | exported slide surface, notes metadata, and presenter-boundary assertions |
| PEXP-004 | TC-PEXP-002 | render-safe asset, typography, and density parity diagnostics |
| PEXP-005 | TC-EVDN-002 | parity finding taxonomy and repair-routing evidence |
| EVDN-001 | TC-EVDN-001 | export evidence report and artifact inventory |
| EVDN-002 | TC-EVDN-001 | machine-readable export report schema |
| EVDN-003 | TC-EVDN-001 | Markdown export summary |
| EVDN-004 | TC-EVDN-002 | diagnostic categories and limitation records |
| EVDN-005 | TC-EVDN-002 | readiness and waiver artifact checks |
| FMT-001 | TC-EXPT-002 | exported web bundle artifact and manifest |
| FMT-002 | TC-FMT-001 | MP4/PDF frozen disposition and scope guards |
| FMT-003 | TC-FMT-002 | format-specific diagnostics and limitation fields |
| FMT-004 | TC-FMT-001 | maintainer waiver record and follow-up routing |
| FMT-005 | TC-FMT-002 | format capability evidence for visible slides, notes, assets, typography, and transitions |
| ALFA-001 | TC-ALFA-001 | alpha public-surface declaration |
| ALFA-002 | TC-ALFA-001 | clean-checkout install, run, preview, export, and evidence docs |
| ALFA-003 | TC-ALFA-002 | public-surface stability clock or waiver evidence |
| ALFA-004 | TC-ALFA-002 | Reviewer acceptance route and closeout status |
| ALFA-005 | TC-ALFA-003 | Phase 5 artifacts and prohibited-scope claim scans |
| ALFA-006 | TC-ALFA-003 | release, tag, npm publication, and external announcement boundary checks |
| ALFA-007 | TC-ALFA-001 | public-facing quickstart, demo entry, launch-candidate docs, and positioning |
| LHEV-001 | TC-LHEV-001 | Remotion Lambda and hosted evaluation report |
| LHEV-002 | TC-LHEV-001 | local export compatibility assessment |
| LHEV-003 | TC-LHEV-002 | hosted recommendation ADR or approval routing |
| LHEV-004 | TC-LHEV-002 | secrets, accounts, paid job, remote infrastructure, and publishing scans |
| LHEV-005 | TC-LHEV-001 | OSS core and Remotion license boundary evidence |
| MCPA-001 | TC-MCPA-001 | read-only MCP evaluation record |
| MCPA-002 | TC-MCPA-002 | tool-based MCP deferral and future stable-command boundary |
| MCPA-003 | TC-MCPA-001 | MCP inventory and contract-defined resource or prompt fields |
| MCPA-004 | TC-MCPA-002 | MCP prohibited-capability scans |
| MCPA-005 | TC-MCPA-001 | WIP planning or trace disposition for deferred MCP work |
| PCON-001 | TC-PCON-001 | multi-device presenter console disposition |
| PCON-002 | TC-PCON-002 | live-presenter recording boundary checks |
| PCON-003 | TC-PCON-001 | optional replay or recording diagnostic evidence |
| PCON-004 | TC-PCON-001 | presenter follow-up prohibited-scope scans |

## Frozen Notes

- Future locations are not permission to edit `CONTRACT_FROZEN` specs, Accepted
  ADRs, `packages/**/src/**`, or `STATUS.yaml.current_phase`.
- Generated export artifacts should remain generated outputs; trace records
  should capture accepted summaries and evidence paths once Phase 5 trace
  routing is open or explicitly approved.
- Read-only MCP, tool-based MCP, multi-device presenter console,
  live-presenter recording, Remotion Lambda, and hosted rendering are resolved
  as deferred, diagnostic, or evaluation boundaries by the frozen Phase 5
  contracts.
