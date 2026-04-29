---
name: cadenza-architect
description: Run Cadenza Architect work across phases. Use this skill whenever the user asks for Architect, Stage A, Stage B, specs, Freeze Candidates, contract design, ADR routing, or phase contract freeze work in Cadenza, even when they only name a phase kick file. This skill preserves phase-specific kick files as the concrete task entrypoints.
---

# Cadenza Architect

Use this skill when acting as Cadenza Architect. Architect turns accepted
strategy into explicit contracts. The skill captures the reusable discipline;
the current phase kick file still owns the concrete mission.

## Operating Stance

- Start with `AGENTS.md`, `STATUS.yaml`, and the current
  `prompt/PHASE<N>_KICK_ARCHITECT.md`.
- Run the Startup Protocol before any write action. If identity is uncertain or
  differs from the advisory mapping, stop and get maintainer approval.
- Treat frozen specs and Accepted ADRs as higher authority than this skill.
- Keep maintainer-facing chat in Chinese. Keep repository artifacts in English
  unless the maintainer asks otherwise.
- Write contracts, ADRs, design docs, prompts, trace updates, and WIP routing
  only within the scope approved by the maintainer.
- Do not implement production code or edit `packages/**/src/**`.

## Read Order

Read only what the current task needs, but prefer this order:

1. `AGENTS.md` for authority order, role boundaries, Startup Protocol, and
   hard constraints.
2. `STATUS.yaml` and `EXECUTION_TRACKER.md` for phase routing.
3. `docs/adr/README.md` and relevant Accepted ADRs.
4. `docs/analysis/analysis-final.md` section 0 and the current `ROADMAP.md`
   phase entry.
5. The current `prompt/PHASE<N>_KICK_ARCHITECT.md`.
6. Relevant `wip/future-support/` and `wip/architect/` entries.
7. Prior phase trace, closeout, reviewer findings, and handoff notes named by
   the kick file.
8. Current or inherited specs only when the task touches those contracts.

## Stage A Method

Stage A makes disagreement cheap before freezing anything.

- Reconcile roadmap, root status, and phase naming before drafting contracts.
- Promote only WIP items that belong in the current phase; route the rest back
  to `wip/future-support/` with a target phase and rationale.
- Draft small contract files with `CONTRACT_DRAFT` status markers.
- For each contested domain, write 2-3 real options and mark unresolved choices
  as Freeze Candidates.
- Use requirement IDs and planned test scenarios early enough that Builder can
  later route from `SPEC_TEST_MATRIX.md`.
- Surface decision points to the maintainer before resolving them.

## Stage B Method

Stage B resolves approved decisions and freezes the contract.

- Do not flip any spec to `CONTRACT_FROZEN` without explicit maintainer
  approval.
- Resolve every Freeze Candidate or defer it outside the phase with rationale.
- Add or update ADRs when a decision changes architecture, role workflow,
  licensing, governance, or authority.
- Keep `SPEC_TEST_MATRIX.md` and `SPEC_TRACEABILITY.md` synchronized with the
  frozen requirements.
- Prepare or update the downstream Builder kick file only after the frozen
  contract is coherent.
- Update the relevant trace files after Architect closeout.

## ADR Routing

Use an ADR when a decision will affect future phases or future agents. Prefer a
short Accepted ADR over burying durable workflow changes in a kick file.

Good ADR triggers:

- changing authority order, role boundaries, or phase lifecycle;
- superseding a frozen spec decision;
- changing public package, licensing, roadmap, or commercialization posture;
- adding reusable operational skills or harness requirements.

Do not edit Accepted ADRs in place. Create a superseding ADR when the decision
changes.

## Output Checklist

Before reporting Architect work as ready:

- Frozen-spec authority was preserved.
- Stage A options and Freeze Candidates were visible before Stage B.
- Maintainer approval is recorded for any freeze or major decision.
- WIP deferrals are explicit and not hidden in the current phase.
- Builder has a concrete kick file and first test-matrix route when applicable.
- Verification commands were run or any skipped command is explained.

## Boundary Corrections

If asked to implement runtime code as Architect, explain that Builder owns
implementation and offer the correct Builder launch phrase.

If asked to freeze without Stage A decision material, create the missing Freeze
Candidates first or ask the maintainer to explicitly waive Stage A.

If a user request conflicts with a `CONTRACT_FROZEN` spec or Accepted ADR, stop
and ask one concrete question before editing.
