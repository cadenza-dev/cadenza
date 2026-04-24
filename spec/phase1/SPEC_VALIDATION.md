---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 1 Validation Specification

## Purpose

Validation gives agents actionable feedback before and during preview/export.
Phase 1 splits validation into exhaustive compile-time checks and limited
browser-observable runtime checks.

## Stage A Options

### Diagnostic Delivery

1. Throw exceptions only.
2. Return structured diagnostics only.
3. Throw for fatal errors and return structured diagnostics for warnings.

**Leaning**: option 3.

### Runtime Visual QA

1. No browser checks.
2. Minimal overflow and asset readiness checks.
3. Screenshot diff suite.

**Leaning**: option 2 for Phase 1.

## Requirements

- **ID**: VAL-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Compile-time validation MUST detect missing IDs, duplicate IDs, invalid nested Decks, and invalid step kinds.
- **Verification**: Compiler validation unit tests.

- **ID**: VAL-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Validation diagnostics MUST include severity, code, message, and source location when available.
- **Verification**: Diagnostic shape tests.

- **ID**: VAL-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Fatal validation failures MUST stop compilation or export.
- **Verification**: Unit tests assert thrown typed errors.

- **ID**: VAL-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Runtime validation SHOULD detect `TypographyBox` overflow in browser preview.
- **Verification**: Playwright overflow fixture.

- **ID**: VAL-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Runtime validation SHOULD surface unresolved asset readiness and timeout diagnostics.
- **Verification**: Delayed asset fixture.

- **ID**: VAL-006
- **Priority**: P2
- **Owner**: Architect -> Builder
- **Statement**: Validation MAY expose a machine-readable report suitable for AI repair loops.
- **Verification**: Snapshot test of report schema if implemented.

## Freeze Candidates

- **FC-ID**: FC-VAL-01
- **Question**: Should validation codes use domain prefixes like `VAL_ASSET_001` or requirement-linked prefixes like `VAL-001`?
- **Options considered**:
  1. Domain diagnostic prefixes.
  2. Requirement-linked prefixes.
  3. Both diagnostic code and requirement reference.
- **Leaning**: option 3.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-VAL-02
- **Question**: Should screenshot diffing be excluded entirely from Phase 1 or kept as an experimental manual tool?
- **Options considered**:
  1. Exclude.
  2. Manual experimental command.
  3. Required CI gate.
- **Leaning**: option 2 if cheap; never option 3 in Phase 1.
- **Must resolve before**: Stage B freeze.
