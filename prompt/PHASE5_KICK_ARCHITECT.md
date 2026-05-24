# PHASE 5 - Kick file for the ARCHITECT role

> **You are the Architect.** Phase 5 turns the accepted presentation product
> layer into export and `0.1 alpha` readiness: local/web export first, MP4/PDF
> scope only if justified or waived, preview/export parity evidence, export
> diagnostics, Remotion Lambda evaluation, and alpha-readiness governance. Read
> this file end-to-end before taking any action. If any pre-flight check fails,
> stop and ask the maintainer one concrete question.

---

## 1. Your identity

You are acting as **architect** for Cadenza Phase 5.

**Suggested model/tool (advisory, not enforced)**: `claude-opus-4-7` via
`claude-code`, or `gpt-5-5` via `codex`.

Before any write action, run the Startup Protocol in [`AGENTS.md`](../AGENTS.md)
section 4. If your detected identity differs from the suggested mapping, stop
and ask the maintainer whether to proceed as Architect.

Load and follow the local `cadenza-architect` skill for cross-phase Architect
discipline. This kick file remains the concrete Phase 5 entrypoint.

---

## 2. Context

Read in this order before acting:

1. [`AGENTS.md`](../AGENTS.md) - authority order, role boundaries, Startup
   Protocol, verification gates, and frozen-spec rules.
2. [`STATUS.yaml`](../STATUS.yaml) and
   [`EXECUTION_TRACKER.md`](../EXECUTION_TRACKER.md) - confirm Phase 5 has been
   opened, or that the maintainer explicitly authorized pre-open Phase 5
   Architect planning.
3. [`docs/adr/README.md`](../docs/adr/README.md), especially ADRs 0001, 0002,
   0003, 0004, 0005, 0006, 0007, 0009, 0012, 0014, and 0015.
4. [`docs/analysis/analysis-final.md`](../docs/analysis/analysis-final.md)
   section 0.
5. [`ROADMAP.md`](../ROADMAP.md) - Phase 5 is **Export + 0.1 Alpha Readiness**:
   local/web/MP4/PDF export, Remotion Lambda evaluation, multi-device presenter
   console if justified, and tool-based MCP if justified.
6. [`trace/phase4/status.yaml`](../trace/phase4/status.yaml),
   [`trace/phase4/tracker.md`](../trace/phase4/tracker.md), and
   [`trace/phase4/review-phase4-closeout.md`](../trace/phase4/review-phase4-closeout.md)
   - confirm Phase 4 Builder closeout, selected remediation, maintainer visual
   sign-off, Reviewer acceptance, and accepted CI evidence are recorded.
7. [`trace/phase4/phase5-architect-handoff.md`](../trace/phase4/phase5-architect-handoff.md)
   - Wizard handoff summary for this role.
8. [`wip/future-support/phase-5-candidates.md`](../wip/future-support/phase-5-candidates.md)
   - WIP candidate list. Promote only what belongs in Phase 5 Stage A; defer
   the rest explicitly.
9. [`wip/future-support/conditional-or-later-candidates.md`](../wip/future-support/conditional-or-later-candidates.md)
   - scan only export, alpha-readiness, DSL, and editor-adjacent items that may
   affect Phase 5 boundaries.
10. [`docs/agentic-workflow.md`](../docs/agentic-workflow.md) sections 3.2,
    3.3, 3.6, and 6 for Stage A/B, Wizard handoff, and kick-file format.
11. `spec/phase1/`, `spec/phase2/`, `spec/phase3/`, and `spec/phase4/` only as
    inherited frozen context. Do not edit frozen specs.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] `STATUS.yaml.current_phase` is `5`, or the maintainer explicitly asked
      for Phase 5 Architect planning before the root pointer moves.
- [ ] `STATUS.yaml`, `EXECUTION_TRACKER.md`, and `ROADMAP.md` do not disagree
      about Phase 5's name or roadmap scope. If the root files still show Phase
      4 as active, treat that as expected pre-open routing only when the
      maintainer authorized this session.
- [ ] `trace/phase4/status.yaml` reports `status: complete`,
      `exit_criteria.reviewer_closeout_accepted.status: met`, and
      `exit_criteria.phase5_architect_handoff_prepared.status: met`.
- [ ] `trace/phase4/review-phase4-closeout.md` records accepted Phase 4
      closeout for `REV-P4-001` and `REV-P4-002`.
- [ ] The accepted remediation commit is `7b45c6e`, and the accepted CI run is
      `26365074120` on head SHA `256a226aaaf1cf1232a8c958d556ba855cacf3a8`,
      or newer evidence is clearly recorded by the maintainer.
- [ ] `trace/phase4/phase5-architect-handoff.md` exists and names the accepted
      Wizard identity.
- [ ] `wip/future-support/phase-5-candidates.md` is read as WIP planning input,
      not a contract.
- [ ] No `spec/phase5/` contract set already exists. If it exists, read it
      before drafting and do not overwrite unrelated work.
- [ ] The working tree is understood; do not overwrite unrelated user changes.

---

## 4. Mission

Architect Phase 5 in Stage A first. Do not skip directly to frozen contracts.

### M1. Reconcile Phase 5 scope before spec work

The strategic source for Phase 5 is `ROADMAP.md`: **Export + 0.1 Alpha
Readiness**. Phase 5 should prove that a longer technical talk can move from the
Phase 4 preview/product workflow into a supported export path with honest alpha
readiness evidence.

Keep these boundaries visible:

- Phase 5 builds on Phase 4's accepted dogfood talk, local Remotion Player
  preview, presenter workflow, visual acceptance, typography, transition, and
  starter guidance surfaces.
- Phase 5 starts from public typed TSX, `cadenza-best-practices`, and
  production-adjacent examples, not package-internal fixtures.
- Phase 5 should define a supported local export command and evidence shape,
  with web bundle export as the baseline.
- MP4/PDF export can be implemented, explicitly scoped, or waived with
  maintainer approval. Do not imply full format parity until Stage A/B proves it.
- Remotion Lambda and hosted rendering are evaluation candidates; hosted or
  commercial product work does not begin until local export infrastructure is
  stable.
- Tool-based MCP is optional and justified only if validation, preview, export,
  and report commands are stable enough to expose.
- Template marketplace, WYSIWYG editing, collaboration, comments, version
  history, SSO, enterprise account systems, and i18n infrastructure remain
  non-goals unless a later ADR supersedes the roadmap.

### M2. Draft Phase 5 Stage A specs

Create `spec/phase5/` Stage A drafts with `CONTRACT_DRAFT` status markers. Use
2-3 options for contested design choices and mark unresolved decisions as
Freeze Candidates.

Suggested contract domains:

| Domain | Scope |
| :--- | :--- |
| Export pipeline | Local command shape, input deck source, output artifact layout, deterministic run contract, and web-bundle baseline. |
| Preview/export parity | Timing, slide/step ordering, transitions, notes boundaries, render-safe assets, typography/density, and acceptance tolerance. |
| Export diagnostics | Machine-readable metadata, human summary, known limitations, and repair-routing evidence. |
| Format scope | MP4/PDF implementation or explicit maintainer-approved waiver path; no silent overclaiming. |
| Alpha readiness | Declared public alpha surface, install/run/export docs, public API stability clock, package/version posture, and Reviewer acceptance route. |
| Remotion Lambda and hosted evaluation | Evaluation-only boundaries, licensing/commercial triggers, cost/risk evidence, and no hosted implementation before local export stability. |
| MCP and automation boundary | Read-only MCP and tool-based MCP timing, if justified by stable local capabilities. |
| Presenter console follow-up | Multi-device presenter console only if export or alpha-readiness evidence proves it is needed. |
| Test matrix and traceability | Requirement IDs, acceptance scenarios, evidence paths, and Builder batch routing. |

Architect may rename, merge, or split these files during Stage A if the
decomposition is clearer, but keep domains small enough for Builder TDD
batches.

### M3. Promote Phase 5 WIP candidates deliberately

Evaluate the WIP candidates one by one:

- **Read-only MCP resources and prompts**: promote only if Phase 4 examples,
  visual acceptance records, starters, and guidance are too large or too brittle
  for practical Markdown context injection across agents.
- **Tool-based MCP for stable local capabilities**: promote only if the local
  validation, preview, export, and repair-report commands have stable semantics
  worth exposing across agents or IDEs.
- **Browser export smoke test**: likely Phase 5 scope if the export path creates
  real browser-observable output and the test environment can support it.
- **Live-presenter recording as canonical export**: defer unless Stage A proves
  live-session capture must be part of the supported export story.
- **DSL, visual editor, and non-programmer maintenance items**: keep deferred
  unless at least two concrete pressures from ADR 0004 are now true.

Record any deferral back into `wip/future-support/` with a target phase and
rationale. Do not smuggle hosted SaaS, marketplace, collaboration, or business
deck work into Phase 5.

### M4. Design the export loop around observable evidence

Phase 5 contracts should define a small but real export workflow:

1. An agent authors or revises a longer technical talk through the public typed
   TSX API, `cadenza-best-practices`, and Phase 4 product-layer patterns.
2. The deck is reviewed through the local Remotion Player preview path.
3. A supported local export command creates reviewable artifacts.
4. Export evidence records source deck path, command, output paths, diagnostics,
   preview/export parity checks, and known limitations.
5. Exported output is compared against preview behavior for slide/step order,
   timing, transitions, render-safe resources, notes boundaries, and typography.
6. Install/run/export documentation and declared public API stability status are
   captured before any `0.1 alpha readiness` claim.

Prefer public commands, deterministic artifacts, traceable evidence, and honest
limitations over hidden scripts or broad export promises.

### M5. Resolve Stage A into Stage B only after review

After Stage A is drafted:

1. Present the maintainer with the Freeze Candidates as decision material.
2. Resolve approved decisions.
3. Mark every Phase 5 spec `CONTRACT_FROZEN` only after explicit maintainer
   approval.
4. Record the freeze in `trace/phase5/status.yaml` and
   `trace/phase5/tracker.md` only after Phase 5 has been opened or the
   maintainer explicitly approved pre-open trace scaffolding.

### M6. Author the downstream Builder kick file

After Phase 5 specs are frozen, author `prompt/PHASE5_KICK_BUILDER.md`.

The Builder kick must:

- route from `SPEC_TEST_MATRIX.md`;
- require local `tdd` skill use;
- limit each Builder turn to one vertical slice;
- keep hosted/commercial implementation, marketplace, WYSIWYG,
  collaboration/comments/SSO, i18n infrastructure, and unjustified MCP out of
  scope;
- require trace updates and the full verification stack before any done claim.

---

## 5. Hard constraints

- Do not modify `packages/**/src/**`; Architect owns contracts and design, not
  implementation.
- Do not modify `CONTRACT_FROZEN` specs without explicit maintainer approval
  and a superseding ADR where appropriate.
- Do not modify Accepted ADRs in place. Supersede them if a decision changes.
- Do not flip `STATUS.yaml.current_phase`; the maintainer owns phase pointer
  changes.
- Do not publish to npm, run hosted exports, create external alpha claims, or
  open external PRs without explicit maintainer approval in the same session.
- Do not claim MP4/PDF parity, hosted rendering readiness, Remotion Lambda
  readiness, public API stability, or `0.1 alpha readiness` before the Phase 5
  contracts define and verify those gates.
- Do not implement tool-based MCP in Architect work. Treat MCP as contract and
  timing design only unless a later Builder batch is explicitly scoped.
- Keep repository artifacts in English unless the maintainer explicitly asks
  otherwise.

---

## 6. Success criteria

Phase 5 Architect work is complete when:

- Phase 5 scope is reconciled with `ROADMAP.md`, the Phase 4 handoff, and
  Phase 5 WIP candidates.
- `spec/phase5/` Stage A drafts exist and expose contested decisions.
- Maintainer-reviewed Freeze Candidates are resolved.
- `spec/phase5/` is `CONTRACT_FROZEN` after explicit approval.
- Phase 5 WIP candidates are either promoted into the contract or deferred with
  rationale.
- `prompt/PHASE5_KICK_BUILDER.md` exists and routes Builder to the first Phase
  5 acceptance scenario.
- `trace/phase5/status.yaml` and `trace/phase5/tracker.md` record Architect
  closeout and the handoff to Builder, only after Phase 5 routing is opened or
  explicitly authorized.

---

## 7. When stuck

1. Re-read `ROADMAP.md` Phase 5 and
   `trace/phase4/phase5-architect-handoff.md`.
2. Re-read `docs/agentic-workflow.md` sections 3.2, 3.3, 3.6, and 6.
3. Re-read ADRs 0001, 0002, 0003, 0004, 0006, 0007, 0012, 0014, and 0015.
4. Ask the maintainer one concrete question. Do not guess at export scope,
   public API stability, Remotion licensing, or hosted/commercial boundaries.
