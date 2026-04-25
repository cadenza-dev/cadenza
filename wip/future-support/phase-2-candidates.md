# Phase 2 Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-04-25.

These items are natural candidates for Phase 2 because that phase focuses on AI
authoring strengthening, repair loops, expanded skills, thin IR, and optional
read-only MCP.

## Raw Remotion lint warnings

- **Source**: `spec/phase1/SPEC_TYPED_API.md` `FC-TAPI-02`.
- **Frozen Phase 1 decision**: raw Remotion remains a documentation-only escape
  hatch.
- **Future support**: add non-blocking lint or diagnostic warnings for raw
  Remotion usage during Phase 2 AI-authoring strengthening.
- **Reason to defer**: Phase 2 owns the compile-error-repair loop and is a
  better place to turn guidance into machine-readable agent feedback.

## Data visualization authoring skill

- **Source**: `spec/phase1/SPEC_SKILLS.md` `FC-SKIL-01`.
- **Frozen Phase 1 decision**: `data-viz-slides` is not part of the first five
  skills unless alpha examples prove it is essential.
- **Future support**: add a dedicated data visualization skill in Phase 2.
- **Reason to defer**: data visualization is important for technical talks, but
  it can become its own deep design surface. The MVP skill pack should protect
  the core authoring loop first.

## Thin IR and richer validation reports

- **Source**: `spec/phase1/SPEC_VALIDATION.md` `VAL-006`, `ROADMAP.md` Phase 2.
- **Frozen Phase 1 decision**: validation may expose a machine-readable report,
  but the MVP does not require a full repair-oriented IR.
- **Future support**: introduce a thin IR and diagnostic report shape that
  agents can consume for repair loops.
- **Reason to defer**: the IR should be based on real failure modes observed in
  Phase 1 alpha decks.

## Read-only MCP for resources and prompts

- **Source**: `ROADMAP.md` Phase 2, ADR 0003.
- **Frozen Phase 1 decision**: skills and instructions come before MCP.
- **Future support**: add a read-only MCP server when docs, examples, and skill
  assets outgrow plain Markdown context injection.
- **Reason to defer**: MCP maintenance does not pay back until reusable dynamic
  lookup becomes a real bottleneck.

## Runtime transition progress subscription

- **Source**: `docs/design/compiler-design.md` OQ-2.
- **Frozen Phase 1 decision**: `onCursorChange` emits semantic cursor changes,
  not frame-level progress events.
- **Future support**: add a separate transition-progress subscription API if
  runtime UI or authoring tools prove they need frame-granular progress.
- **Reason to defer**: progress subscriptions should not overload cursor-change
  semantics.
