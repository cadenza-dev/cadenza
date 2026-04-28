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

- Phase 2 traceability governance follow-up:
  - After `Phase 2 Builder` completes, review the
    `REV-P1-004` coverage-report evidence and decide whether to promote an
    active-phase-only hard gate. Keep this separate from the Phase 2 freeze, do
    not mutate frozen Phase 1 specs, and prefer a scoped gate that fails only
    active-phase coverage holes over a global historical blocker.
