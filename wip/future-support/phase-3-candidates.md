# Phase 3 Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-04-25.

These items fit Phase 3 because that phase fills in the presentation product
layer after the core framework and AI authoring loop have been validated.

## Typography auto-fit and density engine

- **Source**: `spec/phase1/SPEC_RENDER_SAFE.md` `FC-RSAF-02`.
- **Frozen Phase 1 decision**: `TypographyBox` reports overflow only.
- **Future support**: add auto-fit behavior and eventually a density/readability
  engine in Phase 3.
- **Reason to defer**: auto-fit affects visual quality and layout taste. Phase 1
  needs reliable diagnostics before heuristic correction.

## Full presenter view

- **Source**: `spec/phase1/SPEC_PLAYER_RUNTIME.md` resolved metadata option.
- **Frozen Phase 1 decision**: expose current slide, current step, notes, and
  elapsed time only.
- **Future support**: add full presenter view, next-slide preview, outline, and
  richer presenter controls in Phase 3.
- **Reason to defer**: Phase 1 must prove runtime navigation first; the full
  product-layer presenter experience belongs later.

## Multi-locale timeline compilation

- **Source**: `docs/design/compiler-design.md` OQ-4.
- **Frozen Phase 1 decision**: Phase 1 does not support multi-locale slide
  variants.
- **Future support**: compile one independent TimelineMap per locale if i18n
  enters Phase 3.
- **Reason to defer**: locale-specific text density can change layout and timing,
  so shared anchors would be unsafe.
