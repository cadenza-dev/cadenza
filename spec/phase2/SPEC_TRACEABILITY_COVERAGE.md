---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 2 Traceability Coverage Specification

## Purpose

This frozen contract promotes the deferred `REV-P1-004` traceability governance
finding into Phase 2 as a non-mutating coverage design. It is separate from
`SPEC_TRACEABILITY.md` because the latter is the requirement-to-test mapping
file consumed by repository tooling.

## Approved Design Decisions

The maintainer approved the Stage A recommendation and authorized freeze on
2026-04-29.

### Coverage Enforcement Level

1. Generate a non-mutating coverage report for Architect/Reviewer inspection.
2. Add a hard `spec:lint` rule requiring every requirement to appear in the
   test matrix and traceability matrix.
3. Add a phase-scoped hard gate for the active phase only.

**Decision**: option 1 for Phase 2. A report closes the governance visibility gap
without modifying frozen Phase 1 specs or turning historical gaps into an
unrelated blocker. Promotion to an active-phase-only hard gate is tracked as a
post-first-Builder-slice governance follow-up in `TODO.md`.

## Requirements

- **ID**: TRAC-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 2 MUST include a non-mutating traceability coverage
  report that compares requirement IDs across domain specs,
  `SPEC_TEST_MATRIX.md`, `SPEC_TRACEABILITY.md`, trace status, tests, and
  implementation evidence.
- **Verification**: Coverage command or report fixture flags missing links
  without editing frozen Phase 1 specs.

- **ID**: TRAC-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The Phase 2 traceability matrix MUST map every Phase 2
  requirement ID to at least one acceptance scenario and future implementation
  evidence path.
- **Verification**: `pnpm spec:lint` plus coverage report validates every
  Phase 2 requirement ID is represented.

- **ID**: TRAC-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The coverage design MUST NOT require editing frozen Phase 1
  specs unless the maintainer explicitly approves a frozen-spec change.
- **Verification**: Report or gate runs against Phase 1 in read-only mode and
  emits findings rather than patching frozen specs.

- **ID**: TRAC-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 2 traceability MUST make export-related non-goals
  inspectable so MP4/PDF/hosted-rendering claims cannot enter closeout evidence
  by implication.
- **Verification**: Test matrix and coverage report identify export scenarios
  as absent by design.

- **ID**: TRAC-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Phase 2 tracker and status evidence SHOULD record Stage A
  decisions, Stage B resolutions, and Builder batch completion without
  pre-filling future implementation evidence before it exists.
- **Verification**: Trace review confirms status/tracker entries match actual
  accepted artifacts.

- **ID**: TRAC-006
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Future-support items from older AI-authoring Phase 2 notes
  SHOULD be either promoted into explicit Phase 2 preview requirements or
  rerouted to Phase 3+ WIP with rationale.
- **Verification**: Architect Stage A/B trace notes list promoted and deferred
  WIP items.
