# ADR 0001: Primary audience — developers writing technical talks

- **Status**: Accepted
- **Date**: 2026-04-17
- **Deciders**: @DrEden33773
- **References**: [analysis-final §1.2](../analysis/analysis-final.md), [§9 Q1](../analysis/analysis-final.md)

## Context

The "AI-augmented presentation tool" space has two distinct user populations:

1. **Developers and technical communicators** who give technical talks, build data-heavy explainers, or produce documentation-first decks. They value: React ergonomics, animation ceiling, code reviewability, deterministic export.
2. **Business users** who want AI to generate quarterly or sales decks. They value: template breadth, WYSIWYG editing, collaboration, brand consistency. This is the market Gamma, Tome, Beautiful.ai, and Copilot + Designer serve.

These audiences want different products. Serving both at once forces the roadmap to simultaneously invest in high-motion React animation (which business users don't need) and in template marketplaces / account systems / real-time collab (which developers don't need and which compete in a crowded, well-funded space).

## Decision

Cadenza serves the **first** audience exclusively: developers and technical content creators.

Concrete rules that follow:

- The authoring surface is TypeScript + React. There will never be a WYSIWYG editor in the core.
- Template breadth is not a goal. A small curated set of technical-talk layouts is enough.
- Real-time collaboration, commenting, version history are **non-goals for the core framework** (see [`goals-non-goals.md`](../../goals-non-goals.md)).
- The README's first sentence makes this positioning explicit, to prevent miscasting by community discourse.

## Consequences

### Positive

- Every downstream decision — animation engine choice, authoring API shape, commercialization model — has a clear tiebreaker.
- We do not compete with Gamma / Tome on their home ground.
- The typed API can be shaped for developer ergonomics without WYSIWYG compromises.

### Negative

- The addressable market is structurally smaller. Cadenza will not become a household name in the same way Gamma might.
- Some community members will request "business user" features (templates, editing UI). Saying no to them requires discipline.
- Funding narratives (if we pursue commercialization) are narrower; "developer tool for technical talks" is a smaller pitch than "AI deck generator for everyone."

### Open

- In Phase 3+, do we offer a limited set of data-viz and layout templates for technical talks? (This is not a contradiction — technical users still want defaults.) To be revisited in a future ADR.

## Alternatives Considered

- **Serve both audiences**: Rejected. Leads to divided resources, conflicting roadmap pressures, and a product that serves neither well.
- **Serve business users only**: Rejected. Gamma and Tome have multi-year head starts, significant funding, and product-market fit. Entering that race as a solo-maintainer OSS project is a losing bet.
- **Serve neither explicitly; position as "general-purpose"**: Rejected. "General-purpose" is how projects die — they fail to attract the first 100 users because no one feels spoken to.
