---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 4 Visual Acceptance and Repair Specification

## Purpose

This frozen contract defines how Phase 4 turns human visual review into
repairable evidence. The maintainer should be able to dogfood a technical talk,
record visual findings, route repairs to authored deck or guidance surfaces,
and verify that the repaired talk passes local preview and acceptance checks.

This contract inherits Phase 3's distinction between real acceptance evidence
and trace-only declarations.

## Approved Design Decisions

The maintainer approved the Stage A recommendations on 2026-05-23.

### Visual Evidence Format

1. Markdown checklist in `trace/phase4/` only.
2. Machine-readable JSON plus concise Markdown summary, mirroring Phase 3
   repair evidence.
3. Browser screenshot artifacts only.

**Decision**: option 2 after Phase 4 routing is opened. JSON gives agents stable
fields for repair, while Markdown remains reviewable.

### Human Acceptance Gate

1. Maintainer visual sign-off is required for Phase 4 closeout.
2. Automated nonblank and layout diagnostics are sufficient.
3. Reviewer acceptance alone is sufficient.

**Decision**: option 1. Maintainer visual sign-off is a Phase 4 closeout gate.
A maintainer waiver may be recorded, but trace-only declarations cannot satisfy
the gate by themselves.

### Finding Taxonomy

1. Free-form finding text only.
2. Structured categories: layout, typography, motion, presenter workflow,
   diagnostics, notes, and boundary claim.
3. Requirement-ID-only findings.

**Decision**: option 2. Categories help repair routing without overbuilding a
visual editor or complete deck IR.

## Requirements

- **ID**: VARR-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 4 MUST support recording human visual findings with
  enough structure to drive repair: finding category, affected slide or chapter
  when known, observed problem, intended repair surface, and before/after
  evidence.
- **Verification**: acceptance scenario `TC-VARR-001` creates or validates a
  visual acceptance record for the dogfood talk.

- **ID**: VARR-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Visual acceptance evidence MUST distinguish real preview,
  diagnostic, test, or maintainer sign-off proof from trace-only declarations.
- **Verification**: acceptance scenario `TC-VARR-002` includes a trace-only
  visual acceptance fixture or assertion that remains insufficient until real
  evidence or maintainer waiver exists.

- **ID**: VARR-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: A Phase 4 repair iteration MUST target authored deck surfaces,
  starter or guidance surfaces, or explicit visual evidence records. It MUST
  NOT treat `packages/**/src/**` framework edits as normal dogfood-talk repair.
- **Verification**: acceptance scenario `TC-VARR-003` repairs a visual finding
  without framework-internal edits, or routes a suspected framework defect to a
  separate Builder issue.

- **ID**: VARR-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Visual acceptance records SHOULD include local commands or
  preview routes used for review, diagnostics before repair, diagnostics after
  repair, and a concise human-readable summary.
- **Verification**: acceptance scenario `TC-VARR-001` validates the review
  record contains command, route, diagnostic, and summary fields.

- **ID**: VARR-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Preview diagnostics and visual acceptance findings SHOULD be
  inspectable from the local product-layer workflow rather than only from raw
  test logs.
- **Verification**: acceptance scenario `TC-VARR-001` observes relevant
  diagnostics or visual findings through the maintainer-facing preview or
  presenter workflow.

- **ID**: VARR-006
- **Priority**: P2
- **Owner**: Architect -> Builder
- **Statement**: Visual evidence MAY include targeted screenshots or pixel
  sanity artifacts for reviewer inspection, but Phase 4 MUST NOT require a
  broad screenshot-diff suite as the only acceptance oracle.
- **Verification**: acceptance scenario `TC-VARR-002` records optional visual
  artifacts while preserving maintainer sign-off and structured diagnostics as
  the acceptance source.

## Frozen Decisions

- **ID**: FC-VARR-01
- **Decision**: Visual acceptance evidence uses machine-readable JSON plus a
  concise Markdown summary.
- **Rationale**: JSON gives agents stable repair fields; Markdown gives
  reviewers and the maintainer a compact human review surface.

- **ID**: FC-VARR-02
- **Decision**: Phase 4 closeout requires maintainer visual sign-off or an
  explicit maintainer waiver recorded with real supporting evidence.
- **Rationale**: Phase 4 is the first product-layer dogfood phase. Automated
  checks and reviewer acceptance are necessary but not sufficient substitutes
  for human visual acceptance.

- **ID**: FC-VARR-03
- **Decision**: Visual findings use structured categories plus free-form notes.
- **Rationale**: Categories make repair routing reliable while avoiding a
  premature visual editor or complete deck IR.
