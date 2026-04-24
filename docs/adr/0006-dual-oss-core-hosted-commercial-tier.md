# ADR 0006: Dual OSS core plus hosted commercial tier

- **Status**: Accepted
- **Date**: 2026-04-25
- **Deciders**: @DrEden33773
- **References**: [analysis-final §0](../analysis/analysis-final.md), [§3.5](../analysis/analysis-final.md), [§9 Q4](../analysis/analysis-final.md), [ROADMAP](../../ROADMAP.md)

## Context

Cadenza can be shaped as OSS-only, SaaS-only, or a dual model. The strategic analysis treats OSS-only as straightforward but commercially limited, while SaaS-only would force the project to compete in crowded territory before it has developer PMF.

The core audience decision in ADR 0001 already narrows the project to developers and technical communicators. That makes an OSS-first path the best way to earn trust, invite contribution, and validate whether the typed API plus compiler model is useful. At the same time, Remotion Lambda, hosted rendering, and team-oriented deployment may eventually support a commercial tier if PMF exists.

## Decision

Cadenza adopts a **dual model**: an Apache-2.0 OSS core first, with an optional hosted commercial tier deferred until Phase 4+.

Concrete rules:

- The OSS core remains the center of gravity.
- Phase 1 and Phase 2 do not build hosted SaaS plumbing.
- Hosted cloud rendering, team templates, and collaboration-like commercial features are Phase 4+ considerations.
- Remotion licensing remains separate; Cadenza users must satisfy Remotion's license directly.

## Consequences

### Positive

- The project can move quickly toward developer PMF without SaaS overhead.
- Commercial optionality remains available if adoption justifies it.
- The OSS/commercial boundary is visible before code architecture hardens.

### Negative

- Revenue is deferred and uncertain.
- Hosted-tier assumptions cannot drive MVP scope.
- The future commercial layer may need packaging boundaries not yet implemented.

### Open

- Whether hosted rendering can be economically viable depends on real Lambda cost and usage data.

## Alternatives Considered

- **OSS-only**: simpler, but discards plausible hosted rendering upside too early.
- **SaaS-only**: rejected because it would require accounts, billing, templates, collaboration, and licensing negotiation before PMF.
- **Decide later**: rejected because packaging and licensing boundaries are cheaper to preserve now than retrofit later.
