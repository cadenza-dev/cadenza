---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 1 Validation Specification

## Purpose

This frozen contract gives agents actionable feedback before and during preview/export.
Phase 1 splits validation into exhaustive compile-time checks and limited
browser-observable runtime checks.

## Resolved Design Options

### Diagnostic Delivery

1. Throw exceptions only.
2. Return structured diagnostics only.
3. Throw for fatal errors and return structured diagnostics for warnings.

**Decision**: throw for fatal errors and return structured diagnostics for warnings.

### Runtime Visual QA

1. No browser checks.
2. Minimal overflow and asset readiness checks.
3. Screenshot diff suite.

**Decision**: Phase 1 ships minimal overflow and asset-readiness browser checks, not screenshot diff CI.

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

## Frozen Decisions

- **ID**: FC-VAL-01
- **Decision**: validation diagnostics include both a diagnostic code and a requirement reference.
- **Rationale**: diagnostic codes help authors and agents repair failures, while requirement references preserve spec traceability.

- **ID**: FC-VAL-02
- **Decision**: screenshot diffing may exist as an experimental manual command in Phase 1 if cheap, but it is never a required Phase 1 CI gate.
- **Rationale**: screenshot diffing is useful but flaky and expensive; Phase 1 needs fast, reliable gates.
