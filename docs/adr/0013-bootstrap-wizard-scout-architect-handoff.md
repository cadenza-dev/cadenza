# ADR 0013: Bootstrap Wizard for Scout-to-Architect Handoff

- **Status**: Accepted
- **Date**: 2026-04-28
- **Deciders**: @DrEden33773
- **References**: [agentic-workflow §2](../agentic-workflow.md),
  [ADR 0012](./0012-reviewer-wizard-memory-workflow.md)

## Context

Cadenza's phase workflow now has explicit handoffs from Architect to Builder,
Builder to Reviewer, Reviewer to Builder remediation, and Wizard to the next
Architect. The first transition, from Scout's strategic brief to Phase 0
Architect, is less explicit. Historically this was acceptable because Phase 0
was bootstrapped manually and Scout often meant maintainer synthesis rather
than a dedicated agent session.

That gap matters for repeatability. A future repo restart, fork, or major
roadmap reset may need to turn an accepted Scout brief into a Phase 0 Architect
entrypoint without silently letting Scout write specs or letting Architect
guess which strategic inputs are accepted.

## Decision

Extend Wizard with a **bootstrap handoff** mode.

Bootstrap Wizard runs after the maintainer accepts a Scout brief and before the
first Architect session for Phase 0, or for any future foundational reset that
needs the same shape. It may prepare:

1. `prompt/PHASE0_KICK_ARCHITECT.md` or a successor initial Architect kick
   file.
2. `trace/phase0/scout-architect-handoff.md` or the matching trace note for
   the initial phase.
3. Optional TODO cleanup that points the next agent at the new entrypoint.

Bootstrap Wizard must not edit `ROADMAP.md`, open or advance a phase pointer,
write specs, freeze contracts, implement production code, or replace
maintainer acceptance of the Scout brief.

The regular phase-boundary Wizard from ADR 0012 remains unchanged: it runs
after Builder closeout, Reviewer review, and maintainer acceptance to prepare
the next Architect kick/handoff.

## Consequences

### Positive

- Closes the only missing role handoff in the Scout -> Architect -> Builder ->
  Reviewer -> remediation -> Wizard loop.
- Keeps Scout strategic authority separate from Architect contract authority.
- Gives new Cadenza instances a repeatable way to bootstrap Phase 0 without
  relying on hidden chat context.
- Reuses Wizard's existing strengths: read completed state, summarize accepted
  inputs, prepare the next role entrypoint, and avoid phase-pointer authority.

### Negative

- Adds one more Wizard mode that agents must distinguish from normal
  phase-boundary closeout.
- A weak Scout brief can still produce a weak Architect kick; Wizard cannot
  make unaccepted strategy authoritative.

### Open

- Whether future forks should keep the initial trace note under
  `trace/phase0/` or under a dedicated `trace/bootstrap/` directory.
- Whether a later Wizard template generator should render both bootstrap and
  phase-boundary kick files from structured inputs.

## Alternatives Considered

### Let Scout write the Phase 0 Architect kick

Rejected. Scout owns strategic research and roadmap shaping. Asking Scout to
author Architect entrypoints blurs the boundary between strategic brief and
contract-authoring launch.

### Let Architect infer from ROADMAP.md directly

Rejected as the default. `ROADMAP.md` is strategic and non-contractual. The
handoff should tell Architect which inputs are accepted, which tensions need
Stage A treatment, and where the first trace entry belongs.

### Create a new Bootstrap role

Rejected for now. The job is narrow and matches Wizard's existing phase-boundary
behavior closely enough that a separate role would add more coordination cost
than signal.
