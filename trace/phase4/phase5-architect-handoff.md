# Phase 4 -> Phase 5 Architect Handoff

- Prepared at: 2026-05-25 04:33 +0800
- Wizard role: Phase-boundary Wizard
- Approved Wizard identity: GPT-5 / Codex, approved by maintainer in session
- Next role: Phase 5 Architect
- Next kick file: `prompt/PHASE5_KICK_ARCHITECT.md`
- Root phase pointer: `STATUS.yaml.current_phase` remains `4`; maintainer owns
  the Phase 5 pointer flip

## Accepted Inputs

- `trace/phase4/review-phase4-closeout.md` records accepted Phase 4 closeout
  after Reviewer recheck of `REV-P4-001`, `REV-P4-002`, and maintainer visual
  sign-off evidence.
- Accepted remediation commit: `7b45c6e`
  (`7b45c6e906a84310befd1837f87a7d945d6cbaac`).
- Accepted Reviewer artifact commit: `256a226`
  (`256a226aaaf1cf1232a8c958d556ba855cacf3a8`).
- Accepted CI evidence: GitHub Actions run `26365074120` completed with
  `success` on head SHA `256a226aaaf1cf1232a8c958d556ba855cacf3a8`.
- Reviewer accepted that Phase 4 visual evidence records maintainer sign-off,
  that pending visual decisions now fail the closeout gate, and that framework
  visual-navigation repairs are routed separately through
  `trace/phase4/evidence/rev-p4-visual-navigation-framework-defect.md`.
- No frozen Phase 4 specs, Accepted ADRs, prompts, or root phase pointer files
  were modified by the accepted remediation commit.
- `ROADMAP.md` defines Phase 5 as **Export + 0.1 Alpha Readiness**.
- `wip/future-support/phase-5-candidates.md` is WIP planning input, not a
  contract.

## Phase 4 Evidence To Inherit

Phase 4 produced and reviewed the pruned presentation product layer:

- a canonical dogfood talk under `examples/phase4/`;
- a maintainer-facing local Remotion Player preview route and preview command;
- same-browser presenter workflow with navigation, notes, outline/chapter
  metadata, and diagnostics;
- maintainer-signed visual acceptance evidence and closeout gating for pending
  visual decisions;
- typography density diagnostics and overflow/fallback behavior;
- product-layer transition diagnostics without exposing a public transition
  progress API;
- three targeted technical-talk starters and `cadenza-best-practices` product
  workflow guidance;
- explicit boundaries against MP4/PDF export, hosted rendering, Remotion Lambda,
  public API stability, external alpha claims, WYSIWYG, marketplace,
  collaboration, comments, SSO, i18n, and MCP implementation in Phase 4.

Phase 5 should build on these surfaces. It should not re-open Phase 4 product
layer semantics unless a frozen-contract conflict appears.

## Phase 5 Roadmap Scope

Phase 5 should turn the proven preview/product layer into export and `0.1 alpha`
readiness.

Current roadmap acceptance seeds:

- a longer agent-authored or agent-revised technical talk starts from public
  typed TSX, `cadenza-best-practices`, and the Phase 4 dogfood/starter workflow;
- a supported local export command produces reviewable deliverables, with web
  bundle export as the baseline and MP4/PDF export either implemented,
  explicitly scoped, or waived with maintainer approval;
- exported output is checked against the local Remotion Player preview for
  timing, slide/step ordering, transitions, notes and presenter-boundary
  behavior, render-safe assets, and typography/density regressions;
- export evidence includes machine-readable metadata plus a concise human
  summary with source deck path, commands, output artifacts, diagnostics,
  preview/export parity checks, and known limitations;
- Remotion Lambda and hosted rendering are evaluated as deployment and
  commercial candidates, but hosted/commercial work does not begin until local
  export infrastructure is stable;
- `0.1 alpha readiness` requires a longer technical-talk export path,
  documented install/run/export commands, no unresolved public API instability
  for the declared alpha surface, and traceable Reviewer acceptance.

## Candidate Routing

Promote from `wip/future-support/phase-5-candidates.md` only through Architect
Stage A:

- Read-only MCP resources and prompts can be evaluated if Phase 4 examples,
  visual acceptance records, and guidance have outgrown practical Markdown
  context injection across agents.
- Tool-based MCP can be considered only after local validation, preview, export,
  and repair-report commands are stable enough to expose through a shared
  capability surface.

Also scan `wip/future-support/conditional-or-later-candidates.md` for export
smoke testing, live-presenter recording, DSL, or editor-related items. Promote
only items that directly serve Phase 5 export and alpha-readiness contracts;
defer the rest explicitly.

## Next Architect Pre-flight

The next Architect should stop before writing if:

- `STATUS.yaml.current_phase` is not `5` and the maintainer has not explicitly
  authorized pre-open Phase 5 Architect planning;
- `trace/phase4/review-phase4-closeout.md` no longer records accepted closeout;
- GitHub Actions run `26365074120` is no longer the accepted closeout CI
  evidence, and no newer maintainer-approved evidence is recorded;
- `STATUS.yaml`, `EXECUTION_TRACKER.md`, and `ROADMAP.md` disagree on the Phase
  5 name or scope;
- `spec/phase5/` already exists and appears to contain unrelated in-progress
  work;
- a requested Phase 5 decision would require editing frozen Phase 1/2/3/4 specs
  or Accepted ADRs;
- Phase 5 work starts to claim hosted/commercial readiness before local export
  infrastructure is stable.

## Recommended First Action

Open Phase 5 Architect Stage A from `prompt/PHASE5_KICK_ARCHITECT.md`. Draft
`spec/phase5/` as `CONTRACT_DRAFT`, surface Freeze Candidates for export format
scope, local export command shape, preview/export parity evidence, export
metadata, Remotion Lambda and hosted-rendering evaluation boundaries, MCP timing,
multi-device presenter-console justification, public API stability definition,
and `0.1 alpha readiness`, then wait for maintainer review before any freeze.

## Launch Phrase

```text
请作为 Cadenza Phase 5 Architect，读取 prompt/PHASE5_KICK_ARCHITECT.md，从 Stage A 起草 Export + 0.1 Alpha Readiness 合同草案与 Freeze Candidates；不得修改 packages/、CONTRACT_FROZEN specs、Accepted ADRs 或 STATUS.yaml.current_phase。
```
