# ADR 0012: Reviewer, Wizard, and Project Memory Workflow

- **Status**: Accepted
- **Date**: 2026-04-28
- **Deciders**: @DrEden33773
- **References**: [agentic-workflow §2](../agentic-workflow.md), [cross-agent-hook-architecture](../design/cross-agent-hook-architecture.md)

## Context

Cadenza's current workflow defines Scout, Architect, and Builder roles. Builder
work already uses TDD and full repository gates, but test success does not prove
that an implementation fully satisfies frozen requirements, avoids architecture
drift, or reports phase maturity honestly. Phase 1 exposed this gap when the
scenario matrix was green before several frozen requirement semantics and
browser-depth checks were fully closed.

The project also has a phase-boundary gap. After Builder closeout and before
the next Architect session, an agent needs to read the completed phase state,
roadmap, WIP notes, and review findings, then prepare the next Architect kick
file without silently starting the next phase.

Finally, repeated maintainer corrections and reviewer-approved lessons should
survive context loss. Global agent memory is useful, but Cadenza needs a
project-local, reviewable memory layer that remains lower authority than specs,
ADRs, status files, and trace records.

## Decision

Adopt the Reviewer, Wizard, remediation handoff, and project memory workflow:

1. **Reviewer**: a review role backed by the `cadenza-reviewer` skill.
   Reviewer defaults to read-only analysis, compares Builder output against
   frozen specs, ADRs, design docs, trace records, tests, and implementation,
   and reports severity-ranked findings. Reviewer does not fix findings.
2. **Builder remediation handoff**: after the maintainer selects reviewer
   findings, Reviewer generates a one-line Builder remediation launch phrase
   using the selected finding IDs and the reviewer report path. Builder handles
   the fix through TDD, gates, and trace updates.
3. **Wizard**: a phase-boundary guide that runs after Builder closeout,
   Reviewer review, and maintainer acceptance. Wizard prepares the next
   Architect kick file and optional phase handoff note, but does not flip the
   root phase pointer, freeze specs, or implement production code.
4. **Project memory**: add `memory/` for human-approved lessons and
   reviewer-approved lessons. Memory is an advisory retrieval layer, not an
   authority layer.

## Consequences

### Positive

- Separates implementation from independent review without creating a standing
  Tester role.
- Gives the maintainer stable finding IDs to select from before remediation.
- Keeps remediation implementation inside Builder's TDD and gate discipline.
- Gives phase transitions a named role without giving that role maintainer
  authority.
- Makes repeated lessons discoverable by future agents without relying on
  hidden session memory.

### Negative

- Adds more workflow artifacts and role boundary rules.
- A reviewer report can create extra work even when all tests pass.
- Project memory needs curation; noisy lessons would reduce signal.

### Open

- Whether every Builder batch needs Reviewer or only phase closeout and
  maintainer-selected high-risk batches.
- Whether Architect Stage A/B should get optional Reviewer review before
  freeze.
- Whether future workflow phases need a separate refactor role. The initial
  stance is no; Builder remediation owns selected fixes.

## Alternatives Considered

### Let Builder self-review

Rejected. It keeps the same context fatigue and self-justification risk that
Reviewer is meant to reduce.

### Let Reviewer fix findings immediately

Rejected for the initial workflow. Reviewer should diagnose and hand off; the
maintainer chooses findings; Builder remediation implements selected fixes.
This keeps role boundaries crisp and avoids turning Reviewer into a second
Builder.

### Have Wizard generate the Reviewer prompt every time

Rejected as the default. Reviewer needs a stable review method, so the method
belongs in `cadenza-reviewer`. Wizard may generate phase-specific review
briefs later, but it should not rewrite the review standard.
