# Phase 3 -> Phase 4 Architect Handoff

- Prepared at: 2026-05-23 20:59 +0800
- Wizard role: Phase-boundary Wizard
- Approved Wizard identity: GPT-5 / Codex, approved by maintainer in session
- Next role: Phase 4 Architect
- Next kick file: `prompt/PHASE4_KICK_ARCHITECT.md`
- Root phase pointer: `STATUS.yaml.current_phase` remains `3`; maintainer owns
  the Phase 4 pointer flip

## Accepted Inputs

- `trace/phase3/review-phase3-closeout.md` records `Reviewer Acceptance` for
  maintainer-selected findings `REV-P3-001` and `REV-P3-002`.
- Accepted remediation commit: `39f397c`
  (`39f397ca9137133ebe6e4fc97235ef0b9e10ed7e`).
- Accepted CI evidence: GitHub Actions run `26332036994` completed with
  `success` on head SHA `39f397ca9137133ebe6e4fc97235ef0b9e10ed7e`.
- Reviewer accepted that the authored / repaired Phase 3 deck lives at
  `examples/phase3/acceptance-deck.tsx`, not under `packages/**/src/**`.
- Reviewer accepted the trace-only negative proof for `TC-DIAG-003`.
- No frozen Phase 3 specs or Accepted ADRs were modified by the accepted
  remediation commit.
- `ROADMAP.md` defines Phase 4 as **Presentation Product Layer (pruned)**.
- `wip/future-support/phase-4-candidates.md` is WIP planning input, not a
  contract.

## Phase 3 Evidence To Inherit

Phase 3 produced and reviewed the local AI authoring strengthening loop:

- a canonical agent-authored technical deck through public typed TSX authoring
  surfaces;
- compile diagnostics and ordered repair queues;
- real browser preview repair evidence through the Phase 2 Remotion Player
  preview path;
- persisted repair evidence under `trace/phase3/evidence/`;
- `cadenza-best-practices` local-loop, data-explainer, rule, example, and eval
  strengthening;
- raw Remotion and deferred-scope boundary diagnostics;
- explicit boundaries against wrapper command, complete deck IR, MCP, export,
  hosted rendering, presenter-product claims, public API stability, and
  external alpha usage in Phase 3.

Phase 4 should build on these surfaces. It should not re-open Phase 3 authoring
loop or repair-evidence semantics unless a frozen-contract conflict appears.

## Phase 4 Roadmap Scope

Phase 4 should prove a production-adjacent technical talk through a local
Remotion Player preview and presenter workflow, with human visual acceptance
feeding the repair loop.

Current roadmap acceptance seeds:

- an agent-authored or agent-revised production-adjacent technical talk starts
  from public typed TSX and `cadenza-best-practices`;
- a local preview surface or command opens that talk in Remotion Player for
  maintainer review without requiring Playwright as the primary interface;
- the maintainer can navigate slides and steps, inspect speaker notes and
  presenter metadata, and see preview diagnostics or layout state that matters
  for visual acceptance;
- human visual findings can be recorded as repair evidence and routed back into
  authored deck or authoring-guidance changes instead of framework-internal
  edits;
- MP4/PDF export, hosted rendering, Remotion Lambda, public API stability, and
  external alpha claims remain Phase 5+ boundaries unless a later spec or ADR
  explicitly supersedes the roadmap.

## Candidate Routing

Promote from `wip/future-support/phase-4-candidates.md` only through Architect
Stage A:

- Typography auto-fit and density engine can become Phase 4 scope if bounded by
  deterministic diagnostics and repair behavior.
- Full presenter view is likely central Phase 4 scope, including notes,
  next-slide preview, outline, and richer presenter controls.
- Runtime transition progress subscription should be promoted only if stronger
  transitions, presenter controls, or authoring tools prove they need
  frame-granular progress. Do not overload `onCursorChange`.
- Read-only MCP remains a Phase 4-late or Phase 5-start evaluation candidate.
  Tool-based MCP belongs to Phase 5 or later unless explicitly approved.

Move anything else back to `wip/future-support/` with a target phase and
rationale.

## Next Architect Pre-flight

The next Architect should stop before writing if:

- `STATUS.yaml.current_phase` is not `4` and the maintainer has not explicitly
  authorized pre-open Phase 4 Architect planning;
- Phase 3 Reviewer Acceptance no longer appears in
  `trace/phase3/review-phase3-closeout.md`;
- `STATUS.yaml`, `EXECUTION_TRACKER.md`, and `ROADMAP.md` disagree on the Phase
  4 name or scope;
- `spec/phase4/` already exists and appears to contain unrelated in-progress
  work;
- a requested Phase 4 decision would require editing frozen Phase 1/2/3 specs
  or Accepted ADRs;
- Phase 4 work starts to claim MP4/PDF export, hosted rendering, Remotion
  Lambda, public API stability, or external alpha usage.

## Recommended First Action

Open Phase 4 Architect Stage A from `prompt/PHASE4_KICK_ARCHITECT.md`. Draft
`spec/phase4/` as `CONTRACT_DRAFT`, surface Freeze Candidates for the
production-adjacent dogfood talk, local preview surface, presenter workflow,
visual acceptance evidence, typography/density behavior, transition-progress
need, and read-only MCP timing, then wait for maintainer review before any
freeze.

## Launch Phrase

```text
请作为 Cadenza Phase 4 Architect，读取 prompt/PHASE4_KICK_ARCHITECT.md，从 Stage A 起草 Presentation Product Layer 合同草案与 Freeze Candidates；不得修改 packages/、CONTRACT_FROZEN specs、Accepted ADRs 或 STATUS.yaml.current_phase。
```
