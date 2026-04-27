# TODO

- Experimental branch `exp/rev-wiz-mem` short-term closure checklist:
  - Verify the `cadenza-reviewer` skill on one completed Builder closeout.
  - Run the full local gate stack after the reviewer/wizard/memory harness
    upgrade lands.
  - Use Reviewer findings plus maintainer selection to produce the generic
    Builder remediation launch phrase.
  - After Reviewer acceptance, use Wizard to prepare `PHASE2_KICK_ARCHITECT.md`
    and, if useful, a phase handoff note.
  - Merge back to local `main` only after the minimum loop is exercised and the
    maintainer accepts the branch.
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
