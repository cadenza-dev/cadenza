# ADR 0003: Skills-first AI integration; MCP deferred

- **Status**: Accepted
- **Date**: 2026-04-17
- **Deciders**: @DrEden33733
- **References**: [analysis-final §5](../analysis/analysis-final.md), [Remotion AI overview](https://www.remotion.dev/docs/ai/), [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture)

## Context

AI integration in an agent-facing framework can be invested in along two parallel but distinct axes:

- **Skills / instructions / system prompts**: encode "what the agent should do" — taste, norms, constraints, repair workflows. Short feedback loop: improve a skill → next generation is visibly better.
- **MCP (Model Context Protocol)**: encode "what the agent can access" — standardized exposure of resources, prompts, and tools across IDEs and agents.

Both matter long-term. The question is which to invest in **first** during Phase 1, given limited maintainer bandwidth.

Remotion upstream ships skills, system prompts, and MCP in parallel — they are not substitutes. But Remotion is a mature project with staffed infra; Cadenza is a Phase 0 project with one maintainer.

## Decision

Phase 1 invests in skills, instructions, and system prompts. MCP is deferred.

Concrete staging:

| Phase | AI capability |
| :---- | :---- |
| 1 | AI-ready docs + system prompt + skill pack (initial 5 skills) + project instructions |
| 2 (optional) | Read-only MCP exposing `resources + prompts` — triggered when template/docs corpus exceeds what plain Markdown context can carry |
| 3 (conditional) | Tool-based MCP with `validate_deck` / `render_preview` / `inspect_composition` — triggered when multiple agents/IDEs need a shared capability surface |

## Consequences

### Positive

- Phase 1 investment has the highest ROI: agent output quality improves directly and measurably.
- Short feedback loop encourages rapid iteration on skill design.
- Matches Remotion's own default posture (skills + system prompt are their primary AI surface).

### Negative

- Early adopters using non-skill-aware tooling (e.g., IDE integrations without native skill support) get a weaker experience until Phase 2+.
- If a major agent ecosystem standardizes on MCP earlier than we expect, we may be seen as "behind." Mitigation: monitor and accelerate Phase 2 if needed.

### Open

- Phase 2 trigger condition is soft: "template/docs corpus exceeds plain Markdown." Need a harder quantitative signal. To be revisited once Phase 1 ships.
- Should we co-ship a Claude skill, a Cursor rule file, and a Copilot instructions file, or pick one? Current plan: all three; they are cheap to maintain in parallel.

## Alternatives Considered

- **MCP-first**: Rejected. MCP server maintenance (auth, versioning, cross-IDE compat) is non-trivial, and the early bottleneck is agent output quality, not resource access.
- **Skills + MCP in parallel from Phase 1**: Rejected for bandwidth reasons. A single maintainer should not build two AI integration surfaces simultaneously in MVP.
- **No AI-specific investment; agents figure it out from README**: Rejected. This is the "agent writes raw TSX" failure mode the typed API was meant to fix. Skills are the authorial voice of the project, not optional extras.
