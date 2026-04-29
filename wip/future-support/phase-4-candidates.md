# Phase 4 Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-04-29.
> Created from the Phase 2/3 future-support reclassification after
> `fb8a408 docs: revise roadmap phase sequencing`.

These items fit Phase 4 because the current roadmap defines Phase 4 as the
**Presentation Product Layer**: presenter view, chapters/outline, stronger
transitions, smart typography and density, and targeted technical-talk starters.

## Typography auto-fit and density engine

- **Source**: `spec/phase1/SPEC_RENDER_SAFE.md` `FC-RSAF-02`.
- **Frozen Phase 1 decision**: `TypographyBox` reports overflow only.
- **Future support**: add auto-fit behavior and eventually a density/readability
  engine in Phase 4.
- **Reason to defer**: auto-fit affects visual quality and layout taste. Phase 1
  and Phase 2 needed reliable diagnostics before heuristic correction.
- **Disposition**: keep.

## Full presenter view

- **Source**: `spec/phase1/SPEC_PLAYER_RUNTIME.md` resolved metadata option.
- **Frozen Phase 1 decision**: expose current slide, current step, notes, and
  elapsed time only.
- **Future support**: add full presenter view, next-slide preview, outline, and
  richer presenter controls in Phase 4.
- **Reason to defer**: Phase 1 proved semantic runtime metadata, and Phase 2
  proved real browser preview. The full presenter experience belongs in the
  product layer.
- **Disposition**: keep.

## Runtime transition progress subscription

- **Source**: `docs/design/compiler-design.md` OQ-2 and the old Phase 2
  candidate note.
- **Frozen Phase 1 decision**: `onCursorChange` emits semantic cursor changes,
  not frame-level progress events.
- **Phase 2 result**: preview synchronization uses Player frame events
  internally, but that does not create a public transition-progress API.
- **Future support**: add a separate transition-progress subscription API only
  if stronger transitions, presenter controls, or authoring tools prove they
  need frame-granular progress.
- **Reason to defer**: progress subscriptions should not overload cursor-change
  semantics, and a public API should wait for a product-layer consumer.
- **Disposition**: keep as Phase 4-or-later.
