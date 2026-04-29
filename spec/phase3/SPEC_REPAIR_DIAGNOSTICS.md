---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 3 Repair Diagnostics Specification

## Purpose

This draft contract defines the diagnostics and repair-report surface that lets
agents repair authored decks from evidence. It inherits Phase 1 validation
reports and Phase 2 preview diagnostics. Phase 3 should enrich those surfaces
only as much as the local repair loop needs.

## Design Options

### Repair Data Shape

1. Reuse existing validation and preview diagnostics, adding only missing fields.
2. Add a thin repair report that normalizes compile and preview diagnostics
   without becoming a full intermediate representation.
3. Add a broader deck IR that models deck structure, diagnostics, preview state,
   and suggested edits.

**Stage A leaning**: option 2. A thin repair report is likely useful, but a full
IR should be earned by failed repair scenarios.

### Report Persistence

1. Console-only diagnostics for tests and agent loops.
2. Machine-readable JSON report plus a small human-readable summary.
3. Markdown-only trace artifact.

**Stage A leaning**: option 2. Agents need structured fields; reviewers need a
concise summary.

## Requirements

- **ID**: DIAG-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 3 diagnostics MUST preserve compile-time validation
  fields from Phase 1: severity, code, message, and source location when
  available.
- **Verification**: acceptance scenario `TC-DIAG-001` asserts compile
  diagnostics remain machine-readable for a targeted invalid deck.

- **ID**: DIAG-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 3 diagnostics MUST include preview diagnostics from the
  Phase 2 browser path, including Cadenza runtime diagnostics and Remotion
  Player errors where they occur.
- **Verification**: browser scenario `TC-DIAG-002` observes preview diagnostics
  through the shared preview diagnostics channel.

- **ID**: DIAG-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The repair surface MUST distinguish acceptance evidence from
  trace declarations. Trace files may record disposition, but they MUST NOT by
  themselves satisfy a repair scenario that requires compile, preview, test, or
  implementation proof.
- **Verification**: acceptance scenario `TC-DIAG-003` includes a trace-only
  evidence fixture or assertion that remains a finding until real acceptance
  evidence or maintainer waiver exists.

- **ID**: DIAG-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: A repair report SHOULD group diagnostics into a deterministic
  repair queue ordered by severity, source proximity, and dependency order so an
  agent can make one focused repair at a time.
- **Verification**: acceptance scenario `TC-DIAG-001` snapshots or asserts the
  repair queue order for a deck with multiple failures.

- **ID**: DIAG-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: A repair report SHOULD include requirement or test references
  when a diagnostic maps to a Phase 3 requirement, browser scenario, or inherited
  Phase 1/2 validation rule.
- **Verification**: acceptance scenario `TC-DIAG-003` asserts at least one
  repair diagnostic contains a traceable requirement or scenario reference.

- **ID**: DIAG-006
- **Priority**: P2
- **Owner**: Architect -> Builder
- **Statement**: Phase 3 MAY introduce a thin deck IR only if Stage B concludes
  that existing diagnostics plus a repair report cannot support the acceptance
  repair scenarios.
- **Verification**: acceptance scenario `TC-DIAG-004` is required only if the
  thin IR option is promoted during Stage B.

## Freeze Candidates

- **FC-ID**: FC-DIAG-01
- **Question**: Does Phase 3 need a thin IR, or is a normalized repair report
  enough?
- **Options considered**:
  1. No new IR; reuse existing diagnostics.
  2. Thin repair report that normalizes compile and preview diagnostics.
  3. Full deck IR for authoring, validation, and repair.
- **Leaning**: option 2; option 3 stays deferred unless early repair scenarios
  fail without it.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-DIAG-02
- **Question**: What persisted report format should Builder implement for the
  repair loop?
- **Options considered**:
  1. Console-only diagnostics.
  2. JSON report plus concise human-readable summary.
  3. Markdown-only trace artifact.
- **Leaning**: option 2.
- **Must resolve before**: Stage B freeze.
