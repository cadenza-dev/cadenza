# TODO

- Medium-term follow-ups for the reviewer/wizard/memory workflow:
  - Add a reusable `prompt/PHASE<N>_KICK_REVIEWER.md` template if review starts
    happening at more than phase closeout.
  - Extend `phase:check` so phase close requires either an accepted Reviewer
    report or an explicit maintainer waiver.
  - Run a full `skill-creator` eval loop for `cadenza-wizard`; the first
    eval prompts now live under `.agents/skills/cadenza-wizard/evals/`.
  - Add trigger/eval coverage for `cadenza-reviewer` using the
    [`skill-creator`](/home/eden/.agents/skills/skill-creator/SKILL.md)
    workflow.
  - Promote only maintainer-approved reusable lessons into `memory/`.

- Operational role skill follow-up:
  - Draft and accept an ADR for `cadenza-architect` and `cadenza-builder` as
    cross-phase operational skills. The ADR should clarify that these skills
    do not replace `prompt/PHASE<N>_KICK_<ROLE>.md`, frozen specs, or trace
    routing.
  - Add `.agents/skills/cadenza-architect/SKILL.md` focused on Stage A/B
    contract design, `ROADMAP.md` and `docs/analysis/analysis-final.md`
    cross-reference, option generation, Freeze Candidates, ADR routing, WIP
    deferral, and maintainer approval before freeze.
  - Add `.agents/skills/cadenza-builder/SKILL.md` focused on strict
    `SPEC_TEST_MATRIX.md` routing, one vertical slice per turn, local `tdd`
    skill use, real RED -> GREEN -> REFACTOR evidence, public-behavior tests,
    trace updates, full gates, and stopping after the scoped batch.
  - Add `evals/evals.json` for both skills with realistic positive and
    boundary-case prompts, then run a `skill-creator` review loop before
    treating the skills as stable.
  - Update `AGENTS.md` and `docs/agentic-workflow.md` so Architect and Builder
    list their operational skills while preserving phase-specific kick files
    as the concrete task entrypoints.
  - Run `scripts/commands-sync.sh`, then verify the harness with
    `pnpm check:harness`. Consider hardening `scripts/check-harness.ts` so
    `cadenza-architect`, `cadenza-builder`, and their eval files are required.
