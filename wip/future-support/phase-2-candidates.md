# Phase 2 Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-04-25.
> Reclassified: 2026-04-29 after `fb8a408 docs: revise roadmap phase
> sequencing`.

This file was created before the roadmap introduced a standalone Phase 2 for
the **React + Remotion Preview Adapter**. The original note treated Phase 2 as
AI authoring strengthening, repair loops, expanded skills, thin IR, and optional
read-only MCP. That target is now Phase 3 in `ROADMAP.md`.

Phase 2 is complete. No open future-support item remains assigned to Phase 2.

## Reclassification

### Moved to Phase 3

- Raw Remotion lint or diagnostic warnings.
- Data visualization authoring guidance.
- Thin IR and richer validation or repair reports.
- Optional read-only MCP for resources and prompts.

Rationale: these are AI-authoring and local repair-loop concerns. They now match
Phase 3's roadmap scope: generate, preview, diagnose, and repair agent-authored
technical decks.

### Moved to Phase 4 or Later

- Runtime transition progress subscription.

Rationale: Phase 2 implemented internal Player frame synchronization for preview
adapter correctness. A public frame-granular progress subscription should wait
for product-layer pressure from stronger transitions, presenter tools, or
authoring UI.

## Delete From Phase 2 Backlog

Delete the old assignment language, not the ideas:

- "Phase 2 focuses on AI authoring strengthening."
- "Phase 2 owns the compile-error-repair loop."
- "Add a dedicated data visualization skill in Phase 2."
- "`ROADMAP.md` Phase 2" as the source for read-only MCP.

The surviving items are recorded in the Phase 3 and Phase 4 candidate files.
