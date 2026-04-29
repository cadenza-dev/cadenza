# PHASE 3 — Kick file for the ARCHITECT role

> **You are the Architect.** Phase 3 turns the completed preview adapter into
> an AI-authoring strengthening contract: local compile, preview, diagnostics,
> and repair workflows for agent-authored decks. Read this file end-to-end
> before taking any action. If any pre-flight check fails, stop and ask the
> maintainer one concrete question.

---

## 1. Your identity

You are acting as **architect** for Cadenza Phase 3.

**Suggested model/tool (advisory, not enforced)**: `claude-opus-4-7` via
`claude-code`, or `gpt-5-5` via `codex`.

Before any write action, run the Startup Protocol in [`AGENTS.md`](../AGENTS.md)
§4. If your detected identity differs from the suggested mapping, stop and ask
the maintainer whether to proceed as Architect.

Load and follow the local `cadenza-architect` skill for cross-phase Architect
discipline. The current kick file remains the concrete Phase 3 entrypoint.

---

## 2. Context

Read in this order before acting:

1. [`AGENTS.md`](../AGENTS.md) — authority order, role boundaries, Startup
   Protocol, verification gates, and frozen-spec rules.
2. [`STATUS.yaml`](../STATUS.yaml) and
   [`EXECUTION_TRACKER.md`](../EXECUTION_TRACKER.md) — confirm Phase 3 has been
   opened, or that the maintainer explicitly authorized pre-open Phase 3
   Architect planning.
3. [`docs/adr/README.md`](../docs/adr/README.md), especially ADRs 0002, 0003,
   0004, 0009, 0012, 0014, and 0015.
4. [`docs/analysis/analysis-final.md`](../docs/analysis/analysis-final.md) §0.
5. [`ROADMAP.md`](../ROADMAP.md) — Phase 3 is **AI Authoring Strengthening**:
   compile → error → repair loop, `cadenza-best-practices` rule/eval expansion,
   thin IR if earned, and optional read-only MCP.
6. [`trace/phase2/status.yaml`](../trace/phase2/status.yaml),
   [`trace/phase2/tracker.md`](../trace/phase2/tracker.md), and
   [`trace/phase2/review-phase2-closeout.md`](../trace/phase2/review-phase2-closeout.md)
   — confirm Phase 2 Builder, remediation, governance, and Reviewer closeout
   are accepted.
7. [`trace/phase2/phase3-architect-handoff.md`](../trace/phase2/phase3-architect-handoff.md)
   — Wizard handoff summary for this role.
8. [`wip/future-support/phase-3-candidates.md`](../wip/future-support/phase-3-candidates.md)
   — WIP candidate list. Promote only what belongs in Phase 3 Stage A; defer
   the rest explicitly.
9. [`docs/agentic-workflow.md`](../docs/agentic-workflow.md) §3.2, §3.3, §3.6,
   and §6 for Stage A/B and kick-file format.
10. `spec/phase1/` and `spec/phase2/` only as inherited frozen context. Do not
    edit frozen specs.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] `STATUS.yaml.current_phase` is `3`, or the maintainer explicitly asked
      for Phase 3 Architect planning before the root pointer moves.
- [ ] `STATUS.yaml` and `EXECUTION_TRACKER.md` name Phase 3 as
      **AI Authoring Strengthening** and do not conflict with `ROADMAP.md`.
- [ ] `trace/phase2/status.yaml` reports Phase 2 `status: complete` and
      `exit_criteria.reviewer_closeout_accepted.status: met`.
- [ ] `trace/phase2/review-phase2-closeout.md` records final Phase 2 closeout
      acceptance and the green pushed CI run for commit `bc80c3f`.
- [ ] `trace/phase2/phase3-architect-handoff.md` exists and names the accepted
      Wizard identity.
- [ ] No `spec/phase3/` contract set already exists. If it exists, read it
      before drafting and do not overwrite unrelated work.
- [ ] The working tree is understood; do not overwrite unrelated user changes.

---

## 4. Mission

Architect Phase 3 in Stage A first. Do not skip directly to frozen contracts.

### M1. Reconcile Phase 3 scope before spec work

The strategic source for Phase 3 is `ROADMAP.md`: **AI Authoring
Strengthening**. Phase 3 should prove that agents can generate, preview,
diagnose, and repair small technical decks through the local loop without
hand-editing the core framework.

Keep these boundaries visible:

- Phase 3 builds on the real browser preview and diagnostics evidence from
  Phase 2.
- Phase 3 may strengthen `cadenza-best-practices`, validation outputs,
  authoring examples, and local repair workflows.
- Phase 3 must not claim MP4/PDF export, hosted rendering, presenter-view
  product workflows, template marketplace support, visual editing, i18n
  infrastructure, or public API stability.

### M2. Draft Phase 3 Stage A specs

Create `spec/phase3/` Stage A drafts with `CONTRACT_DRAFT` status markers. Use
2-3 options for contested design choices and mark unresolved decisions as
Freeze Candidates.

Suggested contract set:

| File | Scope |
| :--- | :--- |
| `SPEC_AUTHORING_LOOP.md` | Agent-authored deck generation, local compile, preview, diagnostics, and repair-loop entrypoints. |
| `SPEC_BEST_PRACTICES_RULES.md` | `cadenza-best-practices` rule/eval expansion, authoring examples, and data-explainer guidance if promoted. |
| `SPEC_REPAIR_DIAGNOSTICS.md` | Machine-readable validation and preview diagnostics for repair, including thin IR only if Stage A proves it is needed. |
| `SPEC_AI_BOUNDARIES.md` | Raw Remotion warning policy, allowed escape hatches, optional read-only MCP boundary, and what remains out of scope. |
| `SPEC_TEST_MATRIX.md` | Acceptance scenarios for the Phase 3 contracts. |
| `SPEC_TRACEABILITY.md` | Requirement ID to test case to evidence map. |

Architect may rename, merge, or split these files during Stage A if the
decomposition is clearer, but keep domains small enough for Builder TDD
batches.

### M3. Promote Phase 3 WIP candidates deliberately

Evaluate the WIP candidates one by one:

- **Raw Remotion lint or diagnostic warnings**: likely Phase 3 scope if it
  improves agent repair feedback without banning legitimate escape hatches.
- **Data visualization authoring guidance**: likely guidance/eval scope first;
  do not create a dedicated chart package unless examples prove it necessary.
- **Thin IR and richer validation or repair reports**: promote only if the
  existing validation and preview diagnostics cannot support the repair loop.
- **Read-only MCP for resources and prompts**: optional. Include only if Stage A
  shows Markdown skill/context injection is no longer enough. Tool-based MCP
  remains later unless explicitly justified.

Record any deferral back into `wip/future-support/` with a target phase and
rationale. Do not smuggle Phase 4 presenter/product-layer work into Phase 3.

### M4. Design the local repair loop around observable evidence

Phase 3 contracts should define a small but real technical-deck workflow:

1. An agent authors a deck through the typed TSX API and
   `cadenza-best-practices`.
2. The deck compiles through the semantic core.
3. The deck mounts in the Phase 2 browser preview path.
4. Validation and preview diagnostics report actionable issues.
5. The agent repairs the deck using structured evidence rather than
   hand-editing the framework internals.
6. The repaired deck passes the local acceptance checks.

Prefer public interfaces, generated reports, browser-observable diagnostics, and
skill eval outputs over private implementation hooks.

### M5. Resolve Stage A into Stage B only after review

After Stage A is drafted:

1. Present the maintainer with the Freeze Candidates as decision material.
2. Resolve approved decisions.
3. Mark every Phase 3 spec `CONTRACT_FROZEN` only after explicit maintainer
   approval.
4. Record the freeze in `trace/phase3/status.yaml` and
   `trace/phase3/tracker.md`.

### M6. Author the downstream Builder kick file

After Phase 3 specs are frozen, author `prompt/PHASE3_KICK_BUILDER.md`.

The Builder kick must:

- route from `SPEC_TEST_MATRIX.md`;
- require local `tdd` skill use;
- limit each Builder turn to one vertical slice;
- keep export, hosted rendering, presenter-product workflows, and Phase 4
  typography/product-layer work out of scope;
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
- Do not claim MP4 export, PDF export, hosted rendering, external alpha usage,
  presenter-view product completeness, or public API stability in Phase 3.
- Do not convert optional read-only MCP into tool-based MCP without explicit
  maintainer approval.
- Keep repository artifacts in English unless the maintainer explicitly asks
  otherwise.

---

## 6. Success criteria

Phase 3 Architect work is complete when:

- Phase 3 scope is reconciled with `ROADMAP.md` and the Phase 2 handoff.
- `spec/phase3/` Stage A drafts exist and expose contested decisions.
- Maintainer-reviewed Freeze Candidates are resolved.
- `spec/phase3/` is `CONTRACT_FROZEN` after explicit approval.
- Phase 3 WIP candidates are either promoted into the contract or deferred with
  rationale.
- `prompt/PHASE3_KICK_BUILDER.md` exists and routes Builder to the first Phase
  3 acceptance scenario.
- `trace/phase3/status.yaml` and `trace/phase3/tracker.md` record Architect
  closeout and the handoff to Builder.

---

## 7. When stuck

1. Re-read `ROADMAP.md` Phase 3 and
   `trace/phase2/phase3-architect-handoff.md`.
2. Re-read `docs/agentic-workflow.md` §3.2, §3.3, §3.6, and §6.
3. Check ADRs for prior architectural decisions.
4. Ask the maintainer one concrete question.
5. Never guess at frozen contracts, tool-based MCP scope, Remotion licensing,
   external communication, or phase-boundary authority.
