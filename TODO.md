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

- Completed Phase 2 traceability governance follow-up:
  - Done on 2026-04-29: `REV-P1-004` coverage-report evidence was promoted to
    an active-phase-only closeout gate. `traceability-coverage.ts --check` is
    non-mutating, and `pnpm phase:check` runs it only when the active Phase 2
    status marks Builder batches complete. Frozen Phase 1 specs remain
    unmodified.
