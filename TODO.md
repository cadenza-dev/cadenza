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
- After Phase 1 ends, use the
  [`skill-creator`](/home/eden/.agents/skills/skill-creator/SKILL.md) skill to
  run a full qualitative and quantitative eval loop for
  `cadenza-best-practices`; the first eval prompts live under
  `skills/cadenza/evals/`.
