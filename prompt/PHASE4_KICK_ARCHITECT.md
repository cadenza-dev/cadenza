# PHASE 4 - Kick file for the ARCHITECT role

> **You are the Architect.** Phase 4 turns the accepted AI authoring loop into
> the pruned presentation product layer: preview-first dogfooding, presenter
> workflow, outline/chapters, stronger transitions, smart typography/density,
> and targeted technical-talk starters. Read this file end-to-end before taking
> any action. If any pre-flight check fails, stop and ask the maintainer one
> concrete question.

---

## 1. Your identity

You are acting as **architect** for Cadenza Phase 4.

**Suggested model/tool (advisory, not enforced)**: `claude-opus-4-7` via
`claude-code`, or `gpt-5-5` via `codex`.

Before any write action, run the Startup Protocol in [`AGENTS.md`](../AGENTS.md)
section 4. If your detected identity differs from the suggested mapping, stop
and ask the maintainer whether to proceed as Architect.

Load and follow the local `cadenza-architect` skill for cross-phase Architect
discipline. This kick file remains the concrete Phase 4 entrypoint.

---

## 2. Context

Read in this order before acting:

1. [`AGENTS.md`](../AGENTS.md) - authority order, role boundaries, Startup
   Protocol, verification gates, and frozen-spec rules.
2. [`STATUS.yaml`](../STATUS.yaml) and
   [`EXECUTION_TRACKER.md`](../EXECUTION_TRACKER.md) - confirm Phase 4 has been
   opened, or that the maintainer explicitly authorized pre-open Phase 4
   Architect planning.
3. [`docs/adr/README.md`](../docs/adr/README.md), especially ADRs 0001, 0002,
   0003, 0004, 0006, 0007, 0009, 0012, 0014, and 0015.
4. [`docs/analysis/analysis-final.md`](../docs/analysis/analysis-final.md)
   section 0.
5. [`ROADMAP.md`](../ROADMAP.md) - Phase 4 is **Presentation Product Layer
   (pruned)**: preview-first dogfooding, presenter view, chapters/outline,
   stronger transitions, smart typography and density, and targeted
   technical-talk starters.
6. [`trace/phase3/status.yaml`](../trace/phase3/status.yaml),
   [`trace/phase3/tracker.md`](../trace/phase3/tracker.md), and
   [`trace/phase3/review-phase3-closeout.md`](../trace/phase3/review-phase3-closeout.md)
   - confirm Phase 3 Builder closeout, selected remediation, and Reviewer
   Acceptance are recorded.
7. [`trace/phase3/phase4-architect-handoff.md`](../trace/phase3/phase4-architect-handoff.md)
   - Wizard handoff summary for this role.
8. [`wip/future-support/phase-4-candidates.md`](../wip/future-support/phase-4-candidates.md)
   - WIP candidate list. Promote only what belongs in Phase 4 Stage A; defer
   the rest explicitly.
9. [`docs/agentic-workflow.md`](../docs/agentic-workflow.md) sections 3.2,
   3.3, 3.6, and 6 for Stage A/B, Wizard handoff, and kick-file format.
10. `spec/phase1/`, `spec/phase2/`, and `spec/phase3/` only as inherited
    frozen context. Do not edit frozen specs.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] `STATUS.yaml.current_phase` is `4`, or the maintainer explicitly asked
      for Phase 4 Architect planning before the root pointer moves.
- [ ] `STATUS.yaml`, `EXECUTION_TRACKER.md`, and `ROADMAP.md` do not disagree
      about Phase 4's name or roadmap scope. If the root files still show Phase
      3 as active, treat that as expected pre-open routing only when the
      maintainer authorized this session.
- [ ] `trace/phase3/review-phase3-closeout.md` includes `Reviewer Acceptance`
      for `REV-P3-001` and `REV-P3-002`.
- [ ] The accepted remediation commit is `39f397c` and the accepted CI run is
      `26332036994`, or newer evidence is clearly recorded by the maintainer.
- [ ] `trace/phase3/phase4-architect-handoff.md` exists and names the accepted
      Wizard identity.
- [ ] `wip/future-support/phase-4-candidates.md` is read as WIP planning input,
      not a contract.
- [ ] No `spec/phase4/` contract set already exists. If it exists, read it
      before drafting and do not overwrite unrelated work.
- [ ] The working tree is understood; do not overwrite unrelated user changes.

---

## 4. Mission

Architect Phase 4 in Stage A first. Do not skip directly to frozen contracts.

### M1. Reconcile Phase 4 scope before spec work

The strategic source for Phase 4 is `ROADMAP.md`: **Presentation Product Layer
(pruned)**. Phase 4 should prove a production-adjacent technical talk through a
local Remotion Player preview and presenter workflow, with human visual
acceptance feeding the repair loop.

Keep these boundaries visible:

- Phase 4 builds on Phase 3's accepted generate -> preview -> diagnose -> repair
  loop.
- Phase 4 starts from public typed TSX and `cadenza-best-practices`, not
  test-only package fixtures.
- Phase 4 may design dogfooding talk workflows, local preview surfaces,
  presenter metadata, outline/chapters, stronger transitions, smart
  typography/density, starter guidance, and human visual acceptance records.
- Phase 4 must not claim MP4/PDF export, hosted rendering, Remotion Lambda,
  public API stability, or external alpha usage.
- Template marketplace, WYSIWYG editing, collaboration, comments, SSO, and i18n
  infrastructure remain non-goals unless a later ADR supersedes the roadmap.

### M2. Draft Phase 4 Stage A specs

Create `spec/phase4/` Stage A drafts with `CONTRACT_DRAFT` status markers. Use
2-3 options for contested design choices and mark unresolved decisions as
Freeze Candidates.

Suggested contract domains:

| Domain | Scope |
| :--- | :--- |
| Dogfood technical talk | Production-adjacent talk source, public TSX authoring surface, local preview entrypoint, and fixture-vs-example boundary. |
| Presenter workflow | Presenter view, notes, current/next slide affordances, outline/chapters, elapsed time, and controls. |
| Visual acceptance and repair | Human visual findings, preview diagnostics, repair evidence, and authored-deck or guidance repair routing. |
| Typography and density | Auto-fit, density/readability heuristics, overflow handling, and deterministic limits. |
| Transitions and progress | Stronger transition semantics and any justified transition-progress subscription boundary. |
| Technical-talk starters | Starter examples, `cadenza-best-practices` guidance, and evals for production-adjacent talks. |
| Test matrix and traceability | Requirement IDs, acceptance scenarios, evidence paths, and Builder batch routing. |

Architect may rename, merge, or split these files during Stage A if the
decomposition is clearer, but keep domains small enough for Builder TDD
batches.

### M3. Promote Phase 4 WIP candidates deliberately

Evaluate the WIP candidates one by one:

- **Typography auto-fit and density engine**: likely Phase 4 scope if it is
  specified with deterministic behavior, diagnostics, and bounded visual taste
  heuristics.
- **Full presenter view**: likely central Phase 4 scope. Use the existing
  runtime presenter metadata as inherited context, but do not rewrite frozen
  Phase 1 semantics unless a superseding ADR is approved.
- **Runtime transition progress subscription**: promote only if stronger
  transitions, presenter controls, or authoring tools need frame-granular
  progress. Do not overload `onCursorChange`.
- **Read-only MCP resources and prompts**: evaluate near Phase 4 closeout or
  Phase 5 startup if rules, examples, starters, and docs outgrow practical
  Markdown context injection. Tool-based MCP remains Phase 5 or later unless
  explicitly approved.

Record any deferral back into `wip/future-support/` with a target phase and
rationale. Do not smuggle Phase 5 export or hosted-rendering work into Phase 4.

### M4. Design the dogfooding loop around observable product evidence

Phase 4 contracts should define a small but real technical-talk workflow:

1. An agent authors or revises a production-adjacent technical talk through the
   public typed TSX API and `cadenza-best-practices`.
2. A local preview surface or command opens the talk in Remotion Player for
   maintainer review without requiring Playwright as the primary interface.
3. The maintainer can navigate slides and steps, inspect speaker notes,
   presenter metadata, outline/chapters, diagnostics, and layout state.
4. Human visual findings are recorded as repair evidence.
5. Repairs target authored deck or authoring-guidance surfaces, not framework
   internals.
6. The repaired talk passes local validation, preview, and visual acceptance
   checks.

Prefer public interfaces, browser-observable behavior, traceable visual
findings, and authoring guidance over private implementation hooks.

### M5. Resolve Stage A into Stage B only after review

After Stage A is drafted:

1. Present the maintainer with the Freeze Candidates as decision material.
2. Resolve approved decisions.
3. Mark every Phase 4 spec `CONTRACT_FROZEN` only after explicit maintainer
   approval.
4. Record the freeze in `trace/phase4/status.yaml` and
   `trace/phase4/tracker.md` only after Phase 4 has been opened or the
   maintainer explicitly approved pre-open trace scaffolding.

### M6. Author the downstream Builder kick file

After Phase 4 specs are frozen, author `prompt/PHASE4_KICK_BUILDER.md`.

The Builder kick must:

- route from `SPEC_TEST_MATRIX.md`;
- require local `tdd` skill use;
- limit each Builder turn to one vertical slice;
- keep MP4/PDF export, hosted rendering, Remotion Lambda, public API stability,
  external alpha usage, and Phase 5 tool-based MCP out of scope;
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
- Do not claim MP4 export, PDF export, hosted rendering, Remotion Lambda,
  external alpha usage, or public API stability in Phase 4.
- Do not implement tool-based MCP in Phase 4. Treat read-only MCP as a
  late-Phase-4 or Phase-5-start evaluation candidate unless explicitly
  promoted during Stage A.
- Do not turn Phase 4 into a WYSIWYG editor, template marketplace,
  collaboration layer, comments system, SSO feature set, or i18n
  infrastructure.
- Keep repository artifacts in English unless the maintainer explicitly asks
  otherwise.

---

## 6. Success criteria

Phase 4 Architect work is complete when:

- Phase 4 scope is reconciled with `ROADMAP.md`, Phase 3 Reviewer Acceptance,
  and the Phase 3 handoff.
- `spec/phase4/` Stage A drafts exist and expose contested decisions.
- Maintainer-reviewed Freeze Candidates are resolved.
- `spec/phase4/` is `CONTRACT_FROZEN` after explicit approval.
- Phase 4 WIP candidates are either promoted into the contract or deferred with
  rationale.
- `prompt/PHASE4_KICK_BUILDER.md` exists and routes Builder to the first Phase
  4 acceptance scenario.
- `trace/phase4/status.yaml` and `trace/phase4/tracker.md` record Architect
  closeout and the handoff to Builder after Phase 4 routing is authorized.

---

## 7. When stuck

1. Re-read `ROADMAP.md` Phase 4 and
   `trace/phase3/phase4-architect-handoff.md`.
2. Re-read `docs/agentic-workflow.md` sections 3.2, 3.3, 3.6, and 6.
3. Check ADRs for prior architectural decisions.
4. Ask the maintainer one concrete question.
5. Never guess at frozen contracts, MCP scope, Remotion licensing, hosted
   rendering, external communication, or phase-boundary authority.
