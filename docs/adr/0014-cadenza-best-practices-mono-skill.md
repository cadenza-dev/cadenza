# ADR 0014: Cadenza Best Practices Mono-Skill

- **Status**: Accepted
- **Date**: 2026-04-28
- **Deciders**: @DrEden33773
- **Supersedes**: Phase 1 skill-pack distribution decisions in
  `spec/phase1/SPEC_SKILLS.md`
- **References**: [ADR 0003](./0003-skills-before-mcp.md),
  [SPEC_SKILLS](../../spec/phase1/SPEC_SKILLS.md)

## Context

Phase 1 shipped five small authoring skills:

- `layout-composition`
- `motion-transitions`
- `speaker-notes`
- `render-debugging`
- `render-safe-components`

They satisfied the frozen MVP inventory checks, but the post-closeout review
found that they read more like implementation guardrails than user-facing,
tutorial-grade guidance. The strongest issues were uneven depth, weak examples,
and fragmentation across tightly related authoring decisions. The
`skill-pack.test.ts` check also proved only existence and keyword coverage, not
agent usability.

Cadenza now needs one coherent skill that teaches the full authoring loop:
typed TSX API, layout composition, motion timing, render-safe resources,
speaker notes, browser validation, and diagnostics-driven repair.

## Decision

Replace the five Phase 1 authoring skills with one canonical mono-skill:

```text
skills/cadenza/
```

The skill is exposed to agents as `cadenza-best-practices` through generated
symlinks:

```text
.agents/skills/cadenza-best-practices -> ../../skills/cadenza
.claude/skills/cadenza-best-practices -> ../../.agents/skills/cadenza-best-practices
```

`scripts/commands-sync.sh` owns those symlinks. The previous five authoring
skill directories are removed rather than kept as wrappers.

Operational command skills remain under `.agents/skills/cadenza-*` and continue
to mirror into `.claude/skills/`.

## Consequences

### Positive

- Gives agents one obvious Cadenza authoring skill instead of five overlapping
  micro-skills.
- Supports progressive disclosure through `rules/` files while keeping one
  trigger surface.
- Aligns Cadenza with the mono-skill pattern used by mature framework skills.
- Removes stale guidance risk from wrappers that would need to stay in sync.

### Negative

- Supersedes a frozen Phase 1 skill-distribution decision, so the contract and
  tests must be updated in the same maintenance slice.
- The skill is larger and needs real `skill-creator` evals to avoid becoming a
  static handbook.
- Agents that had memorized the five old skill names need to route through
  `cadenza-best-practices` instead.

### Open

- Whether future Phase 3+ domain additions should live as more `rules/` files
  or become separate skills after repeated eval evidence.
- Whether trigger-description optimization should be run after the first full
  qualitative eval loop.

## Alternatives Considered

### Keep five wrappers around the mono-skill

Rejected. Wrappers preserve old names but create duplication and ambiguity. The
maintainer prefers deleting the old directories and making the new mono-skill
the single authoring surface.

### Expand all five existing skills

Rejected. The domains overlap too much for early Cadenza. A layout decision can
depend on render-safe constraints, motion timing, notes, and repair diagnostics;
splitting them forced agents to stitch the guidance together themselves.

### Leave Phase 1 as-is and revisit in Phase 3

Rejected. Phase 2 and Phase 3 need stronger authoring guidance, and the current
skills are already known to be below the desired tutorial quality bar.
