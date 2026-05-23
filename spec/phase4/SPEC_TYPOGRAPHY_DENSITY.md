---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 4 Typography and Density Specification

## Purpose

This frozen contract defines bounded typography auto-fit and
density/readability behavior for Phase 4. Phase 1 and Phase 2 proved overflow
detection and browser measurements. Phase 4 adds deterministic correction and
repair guidance, but it must not become a template marketplace, WYSIWYG editor,
or broad design system.

## Approved Design Decisions

The maintainer approved the Stage A recommendations on 2026-05-23.

### Auto-Fit Default Behavior

1. Keep diagnostics-only behavior and require authors to repair overflow.
2. Add opt-in auto-fit with deterministic bounds.
3. Enable auto-fit by default for all `TypographyBox` usage.

**Decision**: option 2. Phase 4 adds opt-in deterministic auto-fit. Automatic
visual taste changes remain bounded and inspectable.

### Fitting Strategy

1. Adjust font size only within a minimum and maximum range.
2. Adjust font size, line height, and spacing within deterministic limits.
3. Rewrite or summarize authored text automatically.

**Decision**: option 2. Automatic rewriting or summarization is rejected as
framework behavior; text changes belong to authored-deck repair guidance.

### Density Threshold Source

1. Hard-coded global thresholds.
2. Theme-level readable density budgets with deterministic defaults.
3. AI-generated per-slide density budgets.

**Decision**: option 2. Theme-level budgets keep behavior predictable without
opening a per-run AI taste surface.

## Requirements

- **ID**: TYPO-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Opt-in typography auto-fit MUST be deterministic for a given
  deck, theme, viewport, and font readiness state. It MUST report the chosen
  fit result and any remaining overflow as structured diagnostics.
- **Verification**: acceptance scenario `TC-TYPO-001` runs a fitting fixture
  twice and asserts stable fit results and diagnostics.

- **ID**: TYPO-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Auto-fit behavior MUST preserve bounded readability limits,
  including minimum font size, line-height bounds, spacing bounds, and overflow
  fallback when content cannot fit safely.
- **Verification**: acceptance scenario `TC-TYPO-001` covers a text block that
  fits within bounds and one that remains too dense and emits a diagnostic.

- **ID**: TYPO-003
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Content density checks SHOULD produce repairable diagnostics
  with slide or component locator fields, density category, measured values,
  theme budget values, and suggested authored-deck repair direction.
- **Verification**: acceptance scenario `TC-TYPO-002` validates diagnostic
  shape for an over-dense dogfood slide.

- **ID**: TYPO-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Typography and density behavior SHOULD be preview-observable
  in the local product-layer workflow so the maintainer can see layout state
  during visual acceptance.
- **Verification**: acceptance scenario `TC-TYPO-002` observes density or
  overflow diagnostics through the preview or presenter workflow.

- **ID**: TYPO-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 4 typography behavior MUST NOT rewrite authored prose,
  add a WYSIWYG editor, or expand into a template marketplace. Text changes
  remain authored-deck or guidance repairs.
- **Verification**: acceptance scenario `TC-STAR-003` scans Phase 4 behavior,
  guidance, and examples for prohibited editor or marketplace claims.

## Frozen Decisions

- **ID**: FC-TYPO-01
- **Decision**: Phase 4 implements opt-in deterministic auto-fit.
- **Rationale**: Diagnostics-only behavior is too thin for the product layer,
  while default auto-fit everywhere would hide visual taste changes and make
  repair evidence harder to audit.

- **ID**: FC-TYPO-02
- **Decision**: Auto-fit may adjust font size, line height, and spacing within
  deterministic limits. It must not rewrite or summarize authored prose.
- **Rationale**: Layout correction belongs in the framework; content editing
  belongs in authored-deck repair or authoring guidance.

- **ID**: FC-TYPO-03
- **Decision**: Density thresholds come from theme-level readable density
  budgets with deterministic defaults.
- **Rationale**: Theme budgets make density behavior predictable and reviewable
  without hard-coding one global taste profile or delegating thresholds to
  per-run AI output.
