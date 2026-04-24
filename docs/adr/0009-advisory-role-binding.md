# ADR 0009: Advisory role binding with Startup Protocol

- **Status**: Accepted
- **Date**: 2026-04-25
- **Deciders**: @DrEden33773
- **References**: [AGENTS.md §3-4](../../AGENTS.md), [agentic workflow §5](../agentic-workflow.md)

## Context

Cadenza uses role-scoped agent sessions: Scout, Architect, and Builder. Each role has suggested model/tool pairings, because different tasks benefit from different strengths and write permissions. A tempting implementation would hard-enforce exact model IDs and tools.

Exact enforcement is brittle. Provider model names drift, users may intentionally launch a different harness, and agents cannot always reliably detect their own identity. Hard failure on every mismatch would block legitimate work and push the maintainer toward bypasses.

## Decision

Role binding is **advisory**, guarded by a mandatory Startup Protocol rather than exact hard enforcement.

Concrete rules:

- Kick files name the intended role and suggested model/tool pairing.
- At session start, the agent self-reports detected model and harness.
- If identity is unknown or differs from the suggestion, the agent stops before writes and asks the maintainer for explicit approval.
- Once approved, the agent records the accepted identity in the phase trace and proceeds within the role's write boundaries.

## Consequences

### Positive

- The maintainer keeps control over intentional role/tool exceptions.
- Model ID drift does not block the project.
- The trace records who acted under which approved identity.

### Negative

- The system relies on agent discipline before any hook can observe a write.
- Humans must answer one extra prompt when launching a mismatched session.
- Advisory binding is less mechanically strict than exact model enforcement.

### Open

- If future harnesses expose reliable model metadata, part of this check can move into tooling.

## Alternatives Considered

- **Hard-enforce exact model/tool pairs**: rejected as too brittle.
- **No role binding**: rejected because write boundaries and review expectations would become unclear.
- **Trust chat history only**: rejected; startup state must survive compaction and fresh sessions.
