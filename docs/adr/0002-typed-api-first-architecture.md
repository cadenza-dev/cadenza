# ADR 0002: Typed API + render-safe layer as architectural spine

- **Status**: Accepted
- **Date**: 2026-04-17
- **Deciders**: @DrEden33773
- **References**: [analysis-final §4](../analysis/analysis-final.md), [compiler-design.md](../design/compiler-design.md)

## Context

The project needs a layer between AI agents / human authors and raw Remotion. Without that layer:

- Agent-generated code diverges in structure across runs and cannot be normalized.
- Remotion's frame-driven model conflicts with the discrete event model slides require.
- Asset-loading, font timing, and export determinism traps get re-encountered on every page.

We considered three shapes for that layer:

1. **Heavy DSL**: design a new language / parser / runtime. Rejected in [ADR 0004](./0004-tsx-first-authoring.md).
2. **Raw Remotion + skills only**: no abstraction layer, just better prompts. Insufficient — skills alone cannot fix structural divergence.
3. **Thin typed API + render-safe component layer + state-to-timeline compiler** — this ADR.

## Decision

The architectural spine has three layers, top to bottom:

1. **Typed API** (`<Deck>`, `<Slide>`, `<Step>`, `<Transition>`, `<Notes>`, `Theme`, timing tokens, layout slots). A TypeScript React surface that encodes presentation semantics only. Thin, sharp, escape-hatchable.
2. **State-to-timeline compiler**. Translates discrete slide/step state into continuous Remotion timeline. See [`docs/design/compiler-design.md`](../design/compiler-design.md) for the full design.
3. **Render-safe component layer** (`<SafeImage>`, `<SafeFont>`, `<SafeVideo>`, `<TypographyBox>`, `<MediaFrame>`, `<ContentSlot>`). Controlled components that absorb Remotion's `delayRender` / `continueRender` patterns, font loading timing, and common overflow pitfalls.

Raw Remotion remains available as an escape hatch. The typed API is the **default** path, not an exclusive one.

## Consequences

### Positive

- Agents target a stable surface; output shape can be normalized.
- Static analysis and automated repair become feasible.
- Future layers (IR, MDX authoring, visual editor) can be added without re-architecting.
- Remotion's async / timing invariants are preserved automatically through render-safe components.

### Negative

- Adds a layer of indirection between authors and Remotion. Advanced users may hit the escape hatch more than expected in Phase 1.
- Compiler complexity is high; its design must ship in Phase 0 before MVP engineering begins.
- Render-safe component surface must be designed carefully to avoid being "ritual" (components that impose overhead without adding safety).

### Open

- How large should the initial render-safe component roster be? Current plan: 6 components. If alpha users consistently bypass them, the roster is wrong.
- Should the escape hatch emit a warning or require an explicit import? To be decided during Phase 1 implementation.

## Alternatives Considered

- **No abstraction layer**: Just document best practices and let agents write raw Remotion. Rejected — structural divergence is the root problem; documentation alone doesn't fix it.
- **Only typed API, no render-safe layer**: Rejected. The typed API addresses *shape* consistency; render-safe addresses *runtime safety*. These are orthogonal concerns.
- **Only render-safe layer, no typed API**: Rejected. Without semantic primitives (slide/step), agents cannot produce shape-consistent code.
- **Heavy DSL + parser + new runtime**: Rejected in [ADR 0004](./0004-tsx-first-authoring.md).
