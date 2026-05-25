---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 5 Export Diagnostics Specification

## Purpose

This frozen contract defines the evidence shape for Phase 5 export runs. The
export pipeline must leave a machine-readable record that agents can inspect
and a concise human summary that the maintainer and Reviewer can audit.

Diagnostics are evidence, not marketing. They must name known limitations and
must not convert a successful local export into a hosted, commercial, external
alpha, or full-format-parity claim.

## Approved Design Decisions

The maintainer approved the launch-candidate decisions on 2026-05-26.

### Evidence Format

1. Machine-readable JSON only.
2. Machine-readable JSON plus a concise Markdown summary.
3. Test-runner output only.

**Decision**: option 2, mirroring Phase 3 and Phase 4 evidence patterns.

### Evidence Location

1. Store generated reports with export artifacts only.
2. Store reports under `trace/phase5/evidence/` only.
3. Store generated reports with artifacts, then record closeout summaries in
   trace when Phase 5 routing is open.

**Decision**: option 3. Generated outputs should stay with the export, while
trace captures accepted evidence summaries.

### Known-Limitation Taxonomy

1. Free-form limitation text only.
2. Structured severity and category fields plus free-form notes.
3. Requirement-ID-only limitation records.

**Decision**: option 2. Export limitations need enough shape for repair and
review without becoming a full issue tracker.

## Requirements

- **ID**: EVDN-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Every supported export run MUST emit evidence that includes
  source deck path, source deck identity, command, export options, output
  artifact paths, generated manifest path, diagnostics, parity checks, and
  known limitations.
- **Verification**: acceptance scenario `TC-EVDN-001` validates the evidence
  fields for a successful export run.

- **ID**: EVDN-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Export evidence MUST include a machine-readable report with a
  schema version, export run ID, source deck identity, artifact inventory,
  diagnostics, parity results, limitation records, and boundary claims.
- **Verification**: acceptance scenario `TC-EVDN-001` validates the report
  schema and required fields.

- **ID**: EVDN-003
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Export evidence SHOULD include a concise Markdown summary for
  human review that names commands run, artifacts produced, diagnostics,
  preview/export parity result, known limitations, and next repair route.
- **Verification**: acceptance scenario `TC-EVDN-001` checks the Markdown
  summary for the human-review fields.

- **ID**: EVDN-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Export diagnostics MUST distinguish authored-deck repair,
  guidance repair, export implementation defects, render-safe asset defects,
  environment limitations, and explicit maintainer waivers.
- **Verification**: acceptance scenario `TC-EVDN-002` validates diagnostic and
  limitation categories for passing and failing export fixtures.

- **ID**: EVDN-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Chat-only declarations MUST NOT satisfy Phase 5 export
  evidence. Claims about export readiness, format scope, alpha readiness, or
  waivers MUST be represented in repository artifacts that Reviewer can read.
- **Verification**: acceptance scenario `TC-EVDN-002` checks that readiness and
  waiver claims have artifact-backed evidence.

## Frozen Decisions

- **ID**: FC-EVDN-01
- **Decision**: Each export run emits machine-readable JSON plus a concise
  Markdown summary.
- **Rationale**: JSON supports agents and automated review; Markdown gives the
  maintainer and Reviewer a compact human surface.

- **ID**: FC-EVDN-02
- **Decision**: Generated reports live with generated export artifacts, with
  accepted summaries recorded in trace after routing is open.
- **Rationale**: Generated outputs should not bloat trace, but accepted evidence
  needs durable review summaries.

- **ID**: FC-EVDN-03
- **Decision**: Known limitations use severity and category fields plus
  free-form notes.
- **Rationale**: Structured limitation records are repairable without becoming a
  full issue tracker.
