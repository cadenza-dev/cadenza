# PHASE 2 — Kick file for the ARCHITECT role

> **You are the Architect.** Phase 2 turns the Phase 1 semantic core into a
> real React + Remotion browser preview contract. Read this file end-to-end
> before taking any action. If any pre-flight check fails, stop and ask the
> maintainer one concrete question.

---

## 1. Your identity

You are acting as **architect** for Cadenza Phase 2.

**Suggested model/tool (advisory, not enforced)**: `claude-opus-4-7` via
`claude-code`, or `gpt-5-5` via `codex`.

Before any write action, run the Startup Protocol in [`AGENTS.md`](../AGENTS.md)
§4. If your detected identity differs from the suggested mapping, stop and ask
the maintainer whether to proceed as Architect.

---

## 2. Context

Read in this order before acting:

1. [`AGENTS.md`](../AGENTS.md) — authority order, role boundaries, Startup
   Protocol, verification gates, and frozen-spec rules.
2. [`STATUS.yaml`](../STATUS.yaml) and [`EXECUTION_TRACKER.md`](../EXECUTION_TRACKER.md)
   — confirm the maintainer has opened Phase 2, or has explicitly authorized
   pre-open Architect planning.
3. [`docs/adr/README.md`](../docs/adr/README.md), especially ADRs 0002, 0003,
   0004, 0006, 0007, 0009, and 0012 if present.
4. [`docs/analysis/analysis-final.md`](../docs/analysis/analysis-final.md) §0;
   revisit §4.2 only when designing render-safe preview contracts.
5. [`ROADMAP.md`](../ROADMAP.md) — Phase 2 is **React + Remotion Preview
   Adapter**: real browser preview, `@remotion/player` integration, player
   navigation, render-safe readiness behavior, and no MP4/PDF export claim.
6. [`trace/phase1/status.yaml`](../trace/phase1/status.yaml),
   [`trace/phase1/phase-closeout.md`](../trace/phase1/phase-closeout.md), and
   [`trace/phase1/review-phase1-closeout.md`](../trace/phase1/review-phase1-closeout.md)
   — confirm Phase 1 Builder closeout and selected reviewer remediation are
   accepted.
7. [`trace/phase1/phase2-architect-handoff.md`](../trace/phase1/phase2-architect-handoff.md)
   — Wizard handoff summary for this role.
8. [`wip/architect/phase1-traceability-coverage.md`](../wip/architect/phase1-traceability-coverage.md)
   — deferred `REV-P1-004` governance follow-up.
9. [`wip/future-support/phase-2-candidates.md`](../wip/future-support/phase-2-candidates.md)
   — stale Phase 2 planning note from the earlier AI-authoring roadmap; do not
   promote it directly without re-routing against the current roadmap.
10. [`spec/README.md`](../spec/README.md) and
    [`docs/agentic-workflow.md`](../docs/agentic-workflow.md) §6 for spec and
    kick-file format.
11. `spec/phase1/` only as inherited context. Do not edit frozen Phase 1 specs.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] `STATUS.yaml.current_phase` is `2`, or the maintainer explicitly asked
      for Phase 2 Architect planning before the root pointer moves.
- [ ] `STATUS.yaml` / `EXECUTION_TRACKER.md` phase naming has been reconciled
      with `ROADMAP.md`. If root files still call Phase 2 "AI Authoring
      Strengthening" while `ROADMAP.md` calls it "React + Remotion Preview
      Adapter", ask the maintainer before writing Phase 2 contracts.
- [ ] `trace/phase1/status.yaml` reports Phase 1 `status: complete`,
      `next_batch: null`, selected Builder remediation complete, and the root
      phase-pointer transition pending maintainer approval.
- [ ] `trace/phase1/review-phase1-closeout.md` records reviewer acceptance for
      `REV-P1-001`, `REV-P1-002`, and `REV-P1-003`.
- [ ] `REV-P1-004` is understood as Architect governance follow-up, not Builder
      remediation.
- [ ] The working tree is understood; do not overwrite unrelated user changes.
- [ ] If `trace/phase2/` does not exist, create it only after the maintainer has
      opened Phase 2 or explicitly approved pre-open Architect planning.

---

## 4. Mission

Architect Phase 2 in Stage A first. Do not skip directly to frozen contracts.

### M1. Reconcile Phase 2 scope before spec work

The current strategic source for Phase 2 is `ROADMAP.md`: **React + Remotion
Preview Adapter**. Phase 2 should prove the Phase 1 all-domain fixture inside a
real React + Remotion browser preview.

Before drafting contracts:

- Resolve any root-file naming drift with the maintainer.
- Treat older AI-authoring Phase 2 WIP notes as re-routing material, not as the
  Phase 2 contract.
- Keep Phase 3+ concerns out unless they are required to make the preview
  adapter honest.

### M2. Draft Phase 2 Stage A specs

Create `spec/phase2/` Stage A drafts with `CONTRACT_DRAFT` status markers. Use
2-3 options for contested design choices and mark unresolved decisions as
Freeze Candidates.

Suggested contract set:

| File | Scope |
| :--- | :--- |
| `SPEC_PACKAGE_BOUNDARY.md` | React/Remotion package boundary, public imports, peer dependencies, fixture ownership, and what stays in `@cadenza-dev/core`. |
| `SPEC_PREVIEW_ADAPTER.md` | `@remotion/player` integration, frame seeking, cursor-to-frame synchronization, navigation intent mapping, and preview runtime lifecycle. |
| `SPEC_RENDER_SAFE_REMOTION.md` | Remotion-backed image/font/video readiness, `TypographyBox`, `MediaFrame`, `ContentSlot`, and public DOM/helper behavior in preview. |
| `SPEC_BROWSER_VALIDATION.md` | Browser-observable readiness, typography/media measurement, overflow diagnostics, and Playwright verification boundaries. |
| `SPEC_TEST_MATRIX.md` | Acceptance scenarios for the Phase 2 contracts. |
| `SPEC_TRACEABILITY.md` | Requirement ID to test case to evidence map. Include the governance choice from `REV-P1-004`. |

Architect may rename or split these files during Stage A if the decomposition
is clearer, but keep the domains small enough for Builder TDD batches.

### M3. Anchor Phase 2 on the Phase 1 all-domain fixture

The Phase 1 all-domain MVP fixture is the inherited integration input. Phase 2
contracts should require it to render in a real React + Remotion browser preview
with:

- `@remotion/player` frame control as the navigation backing;
- Cadenza cursor and Remotion frame state kept deterministic;
- image, font, and video readiness driven through public render-safe behavior;
- typography and media measurements checked in the browser;
- validation diagnostics surfaced without claiming MP4/PDF export.

### M4. Route WIP and reviewer follow-ups deliberately

Promote only the items that belong in Phase 2:

- `REV-P1-004`: design a non-mutating coverage report or stricter traceability
  gate that compares requirement IDs across specs, test matrix, traceability,
  trace status, tests, and implementation evidence. If a frozen Phase 1 spec
  must change, stop for maintainer approval before editing it.
- Runtime transition progress subscription: consider only if Remotion preview
  frame synchronization needs it; otherwise defer.
- Raw Remotion lint warnings, data visualization skill, thin IR/repair loop,
  and read-only MCP: re-route to Phase 3+ unless Stage A proves they are
  required for the preview adapter.

### M5. Resolve Stage A into Stage B only after review

After Stage A is drafted:

1. Present the maintainer with the Freeze Candidates as decision material.
2. Resolve approved decisions.
3. Mark every Phase 2 spec `CONTRACT_FROZEN` only after explicit maintainer
   approval.
4. Record the freeze in `trace/phase2/status.yaml` and `trace/phase2/tracker.md`.

### M6. Author the downstream Builder kick file

After Phase 2 specs are frozen, author `prompt/PHASE2_KICK_BUILDER.md`.

The Builder kick must:

- route from `SPEC_TEST_MATRIX.md`;
- require local `tdd` skill use;
- limit each Builder turn to one vertical slice;
- keep MP4/PDF export and hosted/cloud rendering out of scope;
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
  or public API stability in Phase 2.
- Do not send external communications or contact Remotion without explicit
  maintainer approval in the same session.
- Keep repository artifacts in English unless the maintainer explicitly asks
  otherwise.

---

## 6. Success criteria

Phase 2 Architect work is complete when:

- Root phase naming drift is resolved or explicitly acknowledged by the
  maintainer before contract work proceeds.
- `spec/phase2/` Stage A drafts exist and expose the contested decisions.
- Maintainer-reviewed Freeze Candidates are resolved.
- `spec/phase2/` is `CONTRACT_FROZEN` after explicit approval.
- `REV-P1-004` is either promoted into a Phase 2 governance requirement or
  consciously deferred with rationale.
- `prompt/PHASE2_KICK_BUILDER.md` exists and routes Builder to the first
  Phase 2 acceptance scenario.
- `trace/phase2/status.yaml` and `trace/phase2/tracker.md` record Architect
  closeout and the handoff to Builder.

---

## 7. When stuck

1. Re-read `ROADMAP.md` Phase 2 and
   `trace/phase1/phase2-architect-handoff.md`.
2. Re-read `spec/README.md` and `docs/agentic-workflow.md` §6.
3. Check ADRs for prior architectural decisions.
4. Ask the maintainer one concrete question.
5. Never guess at frozen contracts, Remotion licensing, external communication,
   or phase-boundary authority.
