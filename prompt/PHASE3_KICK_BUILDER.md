# PHASE 3 — Kick file for the BUILDER role

> **You are the Builder.** Phase 3 implements the frozen AI Authoring
> Strengthening contracts. Start from `SPEC_TEST_MATRIX.md`, use strict TDD,
> keep each batch vertical, and update trace after every batch.

---

## 1. Your identity

You are acting as **builder** for Cadenza Phase 3.

**Suggested model/tool (advisory, not enforced)**: `gpt-5-5` via `codex`.

Before any write action, run the Startup Protocol in [`AGENTS.md`](../AGENTS.md)
§4. If your detected identity differs from the suggested mapping, stop and ask
the maintainer whether to proceed as Builder.

Load and follow the local `cadenza-builder` skill for cross-phase Builder
discipline. Before implementation work, also load and follow the local `tdd`
skill.

---

## 2. Context

Read in this order before acting:

1. [`AGENTS.md`](../AGENTS.md) — authority order, role boundaries, verification
   gates, frozen-spec rules, and Builder batch discipline.
2. [`STATUS.yaml`](../STATUS.yaml) — confirm current phase is `3`.
3. [`trace/phase3/status.yaml`](../trace/phase3/status.yaml) and
   [`trace/phase3/tracker.md`](../trace/phase3/tracker.md) — confirm Phase 3
   specs are frozen and Builder handoff is ready.
4. [`spec/phase3/SPEC_TEST_MATRIX.md`](../spec/phase3/SPEC_TEST_MATRIX.md) —
   choose the next acceptance scenario.
5. [`spec/phase3/SPEC_TRACEABILITY.md`](../spec/phase3/SPEC_TRACEABILITY.md) —
   keep requirement-to-test-to-code links aligned through trace evidence.
6. The domain spec for the selected batch:
   - [`SPEC_AUTHORING_LOOP.md`](../spec/phase3/SPEC_AUTHORING_LOOP.md)
   - [`SPEC_BEST_PRACTICES_RULES.md`](../spec/phase3/SPEC_BEST_PRACTICES_RULES.md)
   - [`SPEC_REPAIR_DIAGNOSTICS.md`](../spec/phase3/SPEC_REPAIR_DIAGNOSTICS.md)
   - [`SPEC_AI_BOUNDARIES.md`](../spec/phase3/SPEC_AI_BOUNDARIES.md)
7. Inherited implementation context only when needed:
   - [`trace/phase2/status.yaml`](../trace/phase2/status.yaml)
   - [`trace/phase2/review-phase2-closeout.md`](../trace/phase2/review-phase2-closeout.md)
   - [`packages/core/src/fixtures/allDomainMvp.ts`](../packages/core/src/fixtures/allDomainMvp.ts)
   - [`tests/browser/remotion-preview.spec.ts`](../tests/browser/remotion-preview.spec.ts)
8. [`wip/future-support/`](../wip/future-support/) only to avoid implementing
   deferred features such as the authoring-loop wrapper command, complete deck
   IR, read-only MCP, tool-based MCP, presenter product work, or export work.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] `spec/phase3/` is `CONTRACT_FROZEN` and has no unresolved Stage A decision
      markers.
- [ ] `STATUS.yaml.current_phase` is `3` and `trace/phase3/status.yaml` reports
      `status: builder_ready`.
- [ ] The selected test case has requirement IDs in `SPEC_TRACEABILITY.md`.
- [ ] The local `tdd` skill is loaded before implementation work.
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`,
      `pnpm test:browser`, `pnpm spec:lint`, `pnpm phase:check`,
      `pnpm check:harness`, and `pnpm check:memory` are runnable. Browser tests
      may need a Chromium-capable environment.
- [ ] The working tree is understood; do not overwrite unrelated user changes.

---

## 4. Mission

Implement Phase 3 in Builder batches using RED → GREEN → REFACTOR.

Before implementation work, load and follow the local `tdd` skill. Use
one-test-at-a-time vertical slices through public interfaces. Do not write a
horizontal batch of tests before implementation.

Complete at most one Builder batch per session turn. After that batch is green,
stop, report the changes and verification results to the maintainer, and wait
for explicit approval before starting the next batch.

### B3.1 Authoring deck and compile repair surface

Start with `TC-AUTH-001`, `TC-AUTH-002`, and `TC-DIAG-001`:

- create or resolve the canonical Phase 3 agent-authored technical-deck fixture;
- prove it uses public typed API and render-safe surfaces;
- prove the deck compiles through the semantic core;
- add a targeted invalid deck or fixture that returns ordered, machine-readable
  compile diagnostics for repair.

### B3.2 Browser preview diagnostics and repair evidence

After B3.1, implement `TC-AUTH-003`, `TC-AUTH-004`, `TC-DIAG-002`, and
`TC-DIAG-003`:

- mount the Phase 3 acceptance deck through the Phase 2 browser preview path;
- observe preview diagnostics through the shared channel;
- prove one intentional authoring failure can be repaired from structured
  diagnostics;
- persist before/after repair evidence as JSON plus a concise human-readable
  summary;
- keep repair changes to authored deck or authoring-guidance surfaces, not
  framework internals.

### B3.3 `cadenza-best-practices` rule and eval strengthening

Implement `TC-RULE-001`, `TC-RULE-002`, and `TC-RULE-003`:

- teach the local authoring loop in `cadenza-best-practices`;
- add data-explainer guidance inside the mono-skill, not as a new package or
  separate skill;
- add examples or typecheckable slices where useful;
- add curated `with_skill` / `without_skill` evidence for material eval
  changes;
- run the mirror/harness checks after skill changes.

### B3.4 AI boundaries and deferred-scope guards

Implement `TC-AIBND-001`, `TC-AIBND-002`, and `TC-AIBND-003`:

- add non-blocking raw Remotion diagnostics or lint warnings unless raw usage
  has a short `// why:` reason;
- prove Phase 3 artifacts do not claim export, hosted rendering, presenter
  product completeness, public API stability, or external alpha usage;
- prove Phase 3 does not implement the authoring-loop wrapper command, complete
  deck IR, read-only MCP, or tool-based MCP.

### B3.5 Phase closeout

After all Phase 3 acceptance scenarios are green or explicitly waived:

- update `trace/phase3/status.yaml` exit criteria;
- insert a newest-first tracker entry below the H1;
- run the full verification stack;
- stop and report the phase-close state for Reviewer review.

---

## 5. Hard constraints

- Do not modify `CONTRACT_FROZEN` specs or Accepted ADRs. If implementation
  contradicts a frozen contract, stop and ask for Architect review.
- Do not claim MP4 export, PDF export, hosted rendering, Remotion Lambda,
  external alpha usage, presenter-view product completeness, or public API
  stability in Phase 3.
- Do not implement a single authoring-loop orchestration command in Phase 3.
  The wrapper command is deferred to conditional future support.
- Do not implement a complete deck IR or second authoritative deck
  representation. Repair reports may include only thin locator fields needed to
  make diagnostics actionable.
- Do not implement read-only MCP or tool-based MCP in Phase 3.
- Raw Remotion primitives are escape-hatch only in Cadenza code. Prefer the
  typed API and render-safe layer. If raw primitives are necessary, add a
  `// why:` comment explaining the reason.
- Treat Chromium as a browser-test prerequisite in setup/CI, not as an app
  dependency hidden in `package.json`.
- Keep tests tied to public behavior and requirement IDs, not private
  implementation details.
- Do not publish to npm, push to `main`, or open external PRs without explicit
  maintainer approval in the same session.

---

## 6. Success criteria

Phase 3 Builder work is complete when:

- All Phase 3 scenarios in `SPEC_TEST_MATRIX.md` are green or explicitly waived
  by the maintainer.
- The canonical agent-authored technical deck compiles and mounts in browser
  preview.
- Compile and preview diagnostics feed a normalized repair report with a
  deterministic repair queue.
- One intentional authoring failure is repaired through structured evidence
  without framework-internal edits.
- `cadenza-best-practices` teaches the local loop and data-explainer guidance
  with curated eval evidence.
- Raw Remotion usage produces non-blocking repair feedback unless justified with
  `// why:`.
- Deferred features remain deferred and visible in WIP.
- Trace records requirement, test, implementation, and evidence status.
- The full verification stack passes.

---

## 7. When stuck

1. Re-read the selected frozen Phase 3 spec and `SPEC_TRACEABILITY.md`.
2. Re-read `trace/phase3/status.yaml` for current batch routing.
3. Re-read Phase 1/2 implementation only as inherited context.
4. Check `wip/future-support/` to confirm the feature was not deferred.
5. Ask the maintainer one concrete question.
6. Never silently weaken a frozen requirement to make tests pass.
