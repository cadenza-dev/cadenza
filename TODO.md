# TODO

- Merge PR #2 back to `main` only after maintainer approval.
- Medium-term follow-ups for the reviewer/wizard/memory workflow:
  - Add a reusable `prompt/PHASE<N>_KICK_REVIEWER.md` template if review starts
    happening at more than phase closeout.
  - Extend `phase:check` so phase close requires either an accepted Reviewer
    report or an explicit maintainer waiver.
  - Add a Wizard skill or kick-template generator once
    `PHASE2_KICK_ARCHITECT.md` has been produced manually at least once.
  - Add trigger/eval coverage for `cadenza-reviewer` using the
    [`skill-creator`](/home/eden/.agents/skills/skill-creator/SKILL.md)
    workflow.
  - Promote only maintainer-approved reusable lessons into `memory/`.
- After Phase 1 ends, use the
  [`skill-creator`](/home/eden/.agents/skills/skill-creator/SKILL.md) skill to
  review the five newly created authoring skills
  (`layout-composition`, `motion-transitions`, `speaker-notes`,
  `render-debugging`, and `render-safe-components`), ensuring their content is
  complete, logically clear, strongly tutorial-oriented for agents, and
  analyzing whether they can be further optimized from an agent-friendly
  perspective.
