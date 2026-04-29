---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 3 Repair Diagnostics Specification

## Purpose

This frozen contract defines the diagnostics and repair-report surface that lets
agents repair authored decks from evidence. It inherits Phase 1 validation
reports and Phase 2 preview diagnostics. Phase 3 should enrich those surfaces
only as much as the local repair loop needs.

## Resolved Design Options

### Repair Data Shape

1. Reuse existing validation and preview diagnostics, adding only missing fields.
2. Add a thin repair report that normalizes compile and preview diagnostics
   without becoming a full intermediate representation.
3. Add a broader deck IR that models deck structure, diagnostics, preview state,
   and suggested edits.

**Decision**: use option 2. Phase 3 adds a normalized repair report that may
include thin locator fields, but it does not introduce a standalone thin IR or a
complete deck IR.

### Report Persistence

1. Console-only diagnostics for tests and agent loops.
2. Machine-readable JSON report plus a small human-readable summary.
3. Markdown-only trace artifact.

**Decision**: use option 2. Agents need structured fields; reviewers need a
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
- **Statement**: The repair report MAY include thin locator fields such as slide
  IDs, component IDs, layout kinds, theme tokens, asset references, and timing
  tokens when needed to make diagnostics actionable. Phase 3 MUST NOT introduce
  a standalone complete deck IR or a second authoritative deck representation.
- **Verification**: acceptance scenario `TC-DIAG-003` asserts repair diagnostics
  can locate authored deck issues without requiring a complete deck IR.

## Frozen Decisions

- **ID**: FC-DIAG-01
- **Decision**: Add a normalized repair report that unifies compile and preview
  diagnostics. The report may include thin locator fields, but Phase 3 defers a
  complete deck IR to conditional future support.
- **Rationale**: Agents need one repair queue across compile and preview
  failures. A complete deck IR would create a second source representation
  before local edits, visual editing, cross-format import/export, or strong audit
  constraints have proven they need it.

- **ID**: FC-DIAG-02
- **Decision**: Persist repair evidence as a machine-readable JSON report plus a
  concise human-readable summary.
- **Rationale**: JSON gives agents stable fields for repair, while a short
  summary gives reviewers traceable evidence without forcing them to inspect raw
  JSON for every loop.
