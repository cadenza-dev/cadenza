# ADR 0004: TSX-first authoring; DSL deferred

- **Status**: Accepted
- **Date**: 2026-04-17
- **Deciders**: @DrEden33773
- **References**: [analysis-final §6](../analysis/analysis-final.md), [Remotion AI generate](https://www.remotion.dev/docs/ai/generate)

## Context

A recurring temptation for AI-facing frameworks is to introduce a new authoring language (DSL) to "constrain" agent output. The reasoning goes: agents drift on raw code, so give them a narrower language with fewer ways to fail.

This reasoning is half right. Agents *do* drift on unconstrained code. But the cure is often worse than the disease: a DSL simultaneously requires solving four problems — language design, parser / compiler, authoring ergonomics, runtime semantics. Most "DSL-first" projects end up as language-engineering projects with underinvested product layers.

Meanwhile, modern LLMs write usable TSX / JSX reliably, as evidenced by Remotion's own [`generate`](https://www.remotion.dev/docs/ai/generate) workflow and the broader industry experience with Copilot, Cursor, and Claude Code on React codebases.

## Decision

Authoring uses TypeScript + React (TSX). Agents generate typed-API-constrained TSX, not raw Remotion and not a new DSL.

Supporting media:

- **JSON / Schema**: used for deck metadata, slide structure, theme tokens, asset refs, validation contract. Not for final render.
- **MDX**: permitted as an authoring medium for text-heavy slides, notes, documentation-first decks. Compiled to TSX under the hood.

A full DSL is revisited only when **specific pressures** emerge:

1. Stable local edits become critical (not full-page regeneration).
2. Strong validation, auditing, multi-tenant constraints become mandatory.
3. A visual editor with structured diff/merge becomes a requirement.
4. Cross-renderer or cross-format import/export is needed.
5. Non-programmers need to maintain decks for the long term.

Until at least two of those are true, no DSL.

If a DSL eventually becomes warranted, its recommended shape is two layers: **MDX + constrained component library + small frontmatter** (human layer) over **Zod / JSON Schema IR** (system layer). Runtime still compiles to TSX + Remotion.

## Consequences

### Positive

- No language engineering in Phase 1; all effort goes into typed API + compiler + render-safe layer.
- Leverages the existing maturity of LLMs on TSX.
- Escape hatch to raw React / raw Remotion remains natural.
- Future DSL migration path is clear if/when needed.

### Negative

- TSX-constrained agent output still allows more shape variance than a restricted DSL would. Must be compensated for by the typed API's opinions + skill pack.
- Some authors may prefer a Markdown-first experience (e.g., Slidev users). MDX support addresses this partially; full parity is not a Phase 1 goal.

### Open

- Should the initial skill pack include Cursor/Copilot instructions that forbid `useCurrentFrame()` and similar raw Remotion primitives in typed-API-constrained code? Current leaning: yes, as soft guidance, not a hard lint rule.

## Alternatives Considered

- **DSL-first**: Rejected. Risk of becoming a language-engineering project; no evidence today's agents need a DSL over constrained TSX.
- **Markdown-first (Slidev model)**: Rejected. Insufficient expressive power for the motion ceiling Cadenza targets. MDX is offered as a middle ground for content-heavy decks.
- **JSON-first**: Rejected. JSON cannot express React component composition, which is the execution format.
- **Raw Remotion with prompt-only guidance**: Rejected in [ADR 0002](./0002-typed-api-first-architecture.md). Shape variance problem unsolved by prompts alone.
