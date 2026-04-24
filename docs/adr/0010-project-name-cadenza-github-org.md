# ADR 0010: Project name Cadenza and GitHub org cadenza-dev

- **Status**: Accepted
- **Date**: 2026-04-25
- **Deciders**: @DrEden33773
- **References**: [README](../../README.md), [ROADMAP](../../ROADMAP.md), [analysis-final §1](../analysis/analysis-final.md)

## Context

The project needs a name that can carry both technical precision and presentation craft. It should feel plausible as an open-source developer tool, not like a consumer AI deck SaaS. It also needs an available GitHub organization namespace for public development.

The project sits at the intersection of React authoring, Remotion timelines, presentation semantics, and AI-agent ergonomics. The name should hint at timing, structure, and performance without overclaiming ownership of the broader presentation category.

## Decision

The project name is **Cadenza**, and the GitHub organization is **`cadenza-dev`**.

Concrete rules:

- Public repository, docs, and package naming use Cadenza as the project brand.
- GitHub organization references use `cadenza-dev`.
- The name is used for the framework and ecosystem; package names may use scoped npm names such as `@cadenza-dev/...` once packages exist.
- README positioning keeps the brand tied to developer-facing, code-reviewable, high-motion presentations.

## Consequences

### Positive

- "Cadenza" evokes timing, structure, and expressive performance without being literal.
- `cadenza-dev` is clear and developer-oriented.
- The name avoids positioning the project as a Gamma-style AI deck generator.

### Negative

- Some users may not immediately infer "presentation framework" from the name alone.
- The name is more evocative than descriptive, so README positioning must stay sharp.

### Open

- Package naming remains to be finalized during Phase 1 workspace setup.

## Alternatives Considered

- **Cadence**: close to timing semantics, but more generic and already overloaded across software products.
- **Setpiece**: strong presentation/theater connotation, but less connected to timeline and motion.
- **Literal names like React Slides or Remotion Decks**: rejected because they are narrow, derivative, and weak as a long-term project brand.
