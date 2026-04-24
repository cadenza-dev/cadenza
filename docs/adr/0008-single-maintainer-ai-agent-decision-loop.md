# ADR 0008: Single-maintainer plus AI-agent decision loop

- **Status**: Accepted
- **Date**: 2026-04-25
- **Deciders**: @DrEden33773
- **References**: [analysis-final §8.5](../analysis/analysis-final.md), [agentic workflow](../agentic-workflow.md)

## Context

Cadenza starts as a single-maintainer project. That creates speed and coherence, but also bus-factor risk. A common response is to recruit co-maintainers immediately. For Cadenza, doing that before the compiler contract and Phase 1 scope are stable would likely create coordination overhead without reducing the core early risk.

The project is already designed around role-scoped AI agents: Scout, Architect, and Builder. These agents are not maintainers and do not own final authority, but they can make the maintainer's decision process more rigorous by drafting options, surfacing trade-offs, and preserving traceable records.

## Decision

Cadenza uses a **single-maintainer plus AI-agent decision loop** during Phase 0 and early Phase 1.

Concrete rules:

- @DrEden33773 remains the sole human maintainer and final decision maker.
- AI agents act as role-scoped collaborators and sparring partners, not autonomous governors.
- Co-maintainer introduction is deferred until the project has stable contracts, early users, or recurring review load.
- Decisions with lasting impact are captured in ADRs, specs, or trace files rather than left in chat history.

## Consequences

### Positive

- The project keeps early direction coherent.
- AI agents add structured dissent and documentation without adding governance overhead.
- Future co-maintainers can onboard from artifacts instead of reconstructing chat context.

### Negative

- Bus-factor risk remains real.
- The maintainer must actively review agent output rather than rubber-stamp it.
- External contributors may have limited authority until governance matures.

### Open

- The trigger for adding the first co-maintainer should be revisited after Phase 1 alpha feedback.

## Alternatives Considered

- **Recruit co-maintainers immediately**: rejected until the project has stable contracts and concrete work to share.
- **Let agents make final decisions**: rejected; accountability stays with the human maintainer.
- **Avoid formal process until contributors arrive**: rejected because early decisions are already foundational.
