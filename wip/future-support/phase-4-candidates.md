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
- **Frozen disposition**: promoted into
  `spec/phase4/SPEC_TYPOGRAPHY_DENSITY.md` as Phase 4 frozen scope. Phase 4
  uses opt-in deterministic auto-fit, bounded font/line/spacing adjustment, and
  theme-level density budgets.

## Full presenter view

- **Source**: `spec/phase1/SPEC_PLAYER_RUNTIME.md` resolved metadata option.
- **Frozen Phase 1 decision**: expose current slide, current step, notes, and
  elapsed time only.
- **Future support**: add full presenter view, next-slide preview, outline, and
  richer presenter controls in Phase 4.
- **Reason to defer**: Phase 1 proved semantic runtime metadata, and Phase 2
  proved real browser preview. The full presenter experience belongs in the
  product layer.
- **Frozen disposition**: promoted into
  `spec/phase4/SPEC_PRESENTER_WORKFLOW.md` as Phase 4 frozen scope. Phase 4
  uses a same-browser presenter panel, lightweight next context, and optional
  chapter or section metadata on existing typed surfaces.

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
- **Frozen disposition**: promoted into
  `spec/phase4/SPEC_TRANSITIONS_PROGRESS.md` as Phase 4 frozen scope. Phase 4
  uses a small typed transition roster, internal product-layer progress evidence
  for presenter and diagnostics surfaces, and explicitly rejects overloading
  `onCursorChange` or adding a public progress hook.

## Read-only MCP resources and prompts evaluation

- **Source**: `spec/phase3/SPEC_AI_BOUNDARIES.md` `FC-AIBND-02`,
  `ROADMAP.md` Phase 3 and Phase 5 entries, and
  `docs/analysis/analysis-final.md` §5.
- **Frozen Phase 3 decision**: Phase 3 defers read-only MCP and relies on
  `cadenza-best-practices`, Markdown docs, examples, and local reports.
- **Future support**: evaluate read-only MCP near Phase 4 closeout or Phase 5
  startup if rules, examples, technical-talk starters, and documentation outgrow
  practical Markdown context injection across agents.
- **Reason to defer**: read-only MCP solves resource and prompt access, not the
  core Phase 3 question of whether agents can generate, preview, diagnose, and
  repair decks through the local loop.
- **Frozen disposition**: deferred from Phase 4 implementation.
  `spec/phase4/SPEC_TECHNICAL_TALK_STARTERS.md` keeps read-only MCP as a
  closeout or Phase 5-start evaluation candidate and keeps tool-based MCP out
  of Phase 4.
