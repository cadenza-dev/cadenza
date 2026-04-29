# ADR 0015: Operational Role Skills for Architect and Builder

- **Status**: Accepted
- **Date**: 2026-04-29
- **Deciders**: @DrEden33773
- **References**: [ADR 0003](./0003-skills-before-mcp.md),
  [ADR 0009](./0009-advisory-role-binding.md),
  [ADR 0014](./0014-cadenza-best-practices-mono-skill.md),
  [agentic workflow](../agentic-workflow.md)

## Context

Cadenza already has operational skills for onboarding, phase status,
reviewer work, spec linting, and Wizard handoffs. Architect and Builder still
depend mostly on phase-specific kick files plus repeated workflow prose in
`AGENTS.md` and `docs/agentic-workflow.md`.

That split is intentional but incomplete. Kick files should remain the concrete
entrypoint for a given phase and role, because they name current scope, read
order, pre-flight checks, and batch routing. At the same time, Architect and
Builder have reusable cross-phase disciplines that should not be recopied into
each kick file: Stage A/B contract design for Architect, and strict
test-matrix-driven TDD for Builder.

The operational role skills must improve agent recall without weakening the
authority order. They must not become a second source of truth above frozen
specs, phase trace state, or role kick files.

## Decision

Add two cross-phase operational skills:

- `.agents/skills/cadenza-architect/SKILL.md`
- `.agents/skills/cadenza-builder/SKILL.md`

Each skill must include `evals/evals.json` with realistic positive and
boundary-case prompts. `scripts/check-harness.ts` will require both skills and
their eval files. `scripts/commands-sync.sh` continues to mirror all
`.agents/skills/cadenza-*` skills into `.claude/skills/`.

The skills are role discipline aids, not task authorities. Agents still start
from `AGENTS.md`, `STATUS.yaml`, the current `prompt/PHASE<N>_KICK_<ROLE>.md`,
and the relevant frozen specs or trace files. If a skill conflicts with a
frozen spec, accepted ADR, current trace state, or kick file, the higher
authority wins.

## Consequences

### Positive

- Reduces repeated role-discipline text in future phase kick files.
- Gives Architect and Builder the same command-like skill surface already used
  by Reviewer and Wizard.
- Makes role behavior easier to eval through stable, reusable prompts.
- Gives the harness a concrete way to catch missing operational skill coverage.

### Negative

- Adds another artifact that must stay synchronized with workflow docs.
- Agents may over-trigger the skills unless the docs clearly say kick files
  remain the concrete task entrypoints.
- Eval prompts prove workflow shape and boundary handling, not actual product
  correctness.

### Open

- Whether future Scout guidance should become a `cadenza-scout` skill after
  repeated Scout sessions justify it.
- Whether role-skill evals should later move from prompt-only checks to a full
  generated-output benchmark workspace.

## Alternatives Considered

### Keep Architect and Builder guidance only in kick files

Rejected. It keeps phase entrypoints concrete but forces every phase to repeat
the same Stage A/B and TDD discipline, increasing drift risk.

### Merge all operational roles into one large Cadenza workflow skill

Rejected. Reviewer, Wizard, Architect, and Builder have different authority
boundaries. One large skill would encourage agents to blur roles.

### Make the skills replace phase kick files

Rejected. The skills are cross-phase habits. They cannot know the current
phase's frozen contracts, WIP routing, reviewer findings, or batch order.
