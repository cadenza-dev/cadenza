# Phase 2 → Phase 3 Architect Handoff

- Prepared at: 2026-04-29 22:24 +0800
- Wizard role: Phase-boundary Wizard
- Approved Wizard identity: GPT-5-family / Codex, approved by maintainer in
  session
- Next role: Phase 3 Architect
- Next kick file: `prompt/PHASE3_KICK_ARCHITECT.md`
- Root phase pointer: `STATUS.yaml.current_phase` remains `2`; maintainer owns
  the Phase 3 pointer flip

## Accepted Inputs

- `STATUS.yaml` marks Phase 2 complete and Phase 3 not started.
- `trace/phase2/status.yaml` records Phase 2 complete with
  `reviewer_closeout_accepted.status: met`.
- `trace/phase2/review-phase2-closeout.md` accepts Phase 2 closeout after
  `REV-P2-001`, `REV-P2-002`, `REV-P2-003`, and the promoted `REV-P1-004`
  active-phase closeout gate were resolved.
- Latest pushed CI evidence in the closeout report is GitHub Actions run
  `25104871915` for commit `bc80c3f`.
- `ROADMAP.md` defines Phase 3 as **AI Authoring Strengthening**.
- `wip/future-support/phase-3-candidates.md` is WIP planning input, not a
  contract.

## Phase 2 Evidence To Inherit

Phase 2 produced and reviewed the real React + Remotion preview adapter layer:

- public preview package boundary through `@cadenza-dev/preview-remotion`;
- real `@remotion/player` browser preview mounting;
- navigation and frame/cursor synchronization through Remotion Player frame
  control;
- render-safe image, font, and video readiness in the preview path;
- browser-observable typography, media, and content-slot validation;
- preview diagnostics shared between Cadenza runtime diagnostics and Remotion
  Player errors;
- non-mutating traceability coverage with an active-phase closeout gate.

Phase 3 should build on those surfaces. It should not re-open Phase 2 preview
adapter architecture unless a frozen-contract conflict appears.

## Phase 3 Roadmap Scope

Phase 3 should prove that agents can generate, preview, validate, diagnose, and
repair small technical decks through the local loop without hand-editing the
core framework.

Current roadmap scope:

- compile → error → repair loop;
- `cadenza-best-practices` rule and eval expansion;
- thin IR only if repair scenarios prove existing validation reports are not
  enough;
- optional read-only MCP for resources and prompts if plain Markdown context no
  longer carries the needed authoring context.

Out of scope for Phase 3:

- MP4/PDF export and hosted rendering;
- presenter view, chapters, outline, and product-layer workflows;
- typography auto-fit or density engine as a product feature;
- visual editor, template marketplace, collaboration, comments, SSO, and i18n
  infrastructure;
- public API stability claims or external alpha usage claims.

## Candidate Routing

Promote from `wip/future-support/phase-3-candidates.md` only through Architect
Stage A:

- Raw Remotion lint or diagnostic warnings can become repair-loop feedback if
  the policy keeps escape hatches available.
- Data visualization guidance should start as `cadenza-best-practices` rules,
  examples, and eval prompts before any dedicated chart package is considered.
- Thin IR and richer repair reports should be justified by real agent repair
  failures, not designed ahead of evidence.
- Read-only MCP remains optional and should expose resources/prompts only.
  Tool-based MCP belongs to a later phase unless explicitly approved.

Move anything else back to `wip/future-support/` with a target phase and
rationale.

## Next Architect Pre-flight

The next Architect should stop before writing if:

- `STATUS.yaml.current_phase` is not `3` and the maintainer has not explicitly
  authorized pre-open Phase 3 Architect planning;
- Phase 2 closeout acceptance no longer appears in `trace/phase2/status.yaml`
  or `trace/phase2/review-phase2-closeout.md`;
- `STATUS.yaml`, `EXECUTION_TRACKER.md`, and `ROADMAP.md` disagree on the Phase
  3 name or scope;
- `spec/phase3/` already exists and appears to contain unrelated in-progress
  work;
- a requested Phase 3 decision would require editing frozen Phase 1/2 specs or
  Accepted ADRs.

## Recommended First Action

Open Phase 3 Architect Stage A from `prompt/PHASE3_KICK_ARCHITECT.md`. Draft
`spec/phase3/` as `CONTRACT_DRAFT`, surface Freeze Candidates for the repair
loop, skill/eval scope, thin IR threshold, raw Remotion warning policy, and
optional read-only MCP boundary, then wait for maintainer review before any
freeze.

## Launch Phrase

```text
请作为 Cadenza Phase 3 Architect，读取 prompt/PHASE3_KICK_ARCHITECT.md，从 Stage A 起草 AI Authoring Strengthening 合同草案与 Freeze Candidates；不得修改 packages/、frozen specs、Accepted ADRs 或 STATUS.yaml.current_phase。
```
