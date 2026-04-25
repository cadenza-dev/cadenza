# PHASE 1 — Kick file for the BUILDER role

> **You are the Builder.** Phase 1 implements the frozen MVP contracts. Start
> from tests, keep batches narrow, and update trace after every batch.

---

## 1. Your identity

You are acting as **builder** for Cadenza Phase 1.

**Suggested model/tool (advisory, not enforced)**: `gpt-5-5` via `codex`.

Before any write action, run the Startup Protocol in [`AGENTS.md`](../AGENTS.md)
§4. If your detected identity differs from the suggested mapping, stop and ask
the maintainer whether to proceed as Builder.

---

## 2. Context

Read in this order before acting:

1. [`AGENTS.md`](../AGENTS.md) — authority order, role boundaries, verification
   gates, and frozen-spec rules.
2. [`STATUS.yaml`](../STATUS.yaml) — confirm current phase is `1`.
3. [`trace/phase1/status.yaml`](../trace/phase1/status.yaml) and
   [`trace/phase1/tracker.md`](../trace/phase1/tracker.md), if present.
4. [`spec/phase1/SPEC_TEST_MATRIX.md`](../spec/phase1/SPEC_TEST_MATRIX.md) —
   choose the next acceptance scenario.
5. [`spec/phase1/SPEC_TRACEABILITY.md`](../spec/phase1/SPEC_TRACEABILITY.md) —
   keep requirement-to-test-to-code links current.
6. The domain spec for the selected batch:
   - [`SPEC_TYPED_API.md`](../spec/phase1/SPEC_TYPED_API.md)
   - [`SPEC_COMPILER.md`](../spec/phase1/SPEC_COMPILER.md)
   - [`SPEC_RENDER_SAFE.md`](../spec/phase1/SPEC_RENDER_SAFE.md)
   - [`SPEC_PLAYER_RUNTIME.md`](../spec/phase1/SPEC_PLAYER_RUNTIME.md)
   - [`SPEC_VALIDATION.md`](../spec/phase1/SPEC_VALIDATION.md)
   - [`SPEC_SKILLS.md`](../spec/phase1/SPEC_SKILLS.md)
7. [`docs/design/compiler-design.md`](../docs/design/compiler-design.md) for
   compiler edge cases.
8. [`wip/future-support/phase-2-candidates.md`](../wip/future-support/phase-2-candidates.md)
   and later WIP notes only to avoid accidentally implementing deferred work.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] `spec/phase1/` is `CONTRACT_FROZEN` and has no Freeze Candidates.
- [ ] Phase 0 infrastructure bootstrap is complete, or the maintainer explicitly
      asks you to run bootstrap first.
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`,
      `pnpm spec:lint`, and `pnpm phase:check` are runnable.
- [ ] The selected test case has requirement IDs in the traceability matrix.
- [ ] The working tree is understood; do not overwrite unrelated user changes.

---

## 4. Mission

Implement Phase 1 in Builder batches using RED → GREEN → REFACTOR.

Before implementation work, load and follow the local `tdd` skill. Use
one-test-at-a-time vertical slices through public interfaces. Do not write a
horizontal batch of tests before implementation.

Complete at most one Builder batch per session turn. After that batch is green,
stop, report the changes and verification results to the maintainer, and wait
for explicit approval before starting the next batch.

### B1.1 First vertical slice

Start with `TC-TAPI-001`: public typed API primitives import and compile with
deck-level FPS. This creates the smallest observable surface for later compiler,
runtime, and validation work.

### B1.2 P0 acceptance path

After the first slice, prioritize P0 scenarios from `SPEC_TEST_MATRIX.md`:

- `TC-TAPI-004`
- `TC-COMP-001`
- `TC-COMP-004`
- `TC-COMP-007`
- `TC-RSAF-002`
- `TC-PLAY-001`
- `TC-VAL-001`
- `TC-SKIL-001`

### B1.3 P1/P2 completion path

Once P0 is green, continue through P1 and P2 scenarios unless the maintainer
explicitly narrows the phase:

- P1: overflow reporting, browser controls, presenter metadata, skill repair
  workflow.
- P2: validation reports for the AI repair loop when available.

### B1.4 Phase closeout path

After all `SPEC_TEST_MATRIX.md` scenarios are green, close Phase 1 through the
following narrow Builder batches. Do not treat a green scenario matrix as phase
closure until these exit tasks are handled or explicitly waived by the
maintainer.

#### B1.4-A Requirement coverage audit

Perform a repo-grounded audit against the frozen Phase 1 specs, current tests,
implementation files, and `trace/phase1/status.yaml`.

- Confirm which requirements are fully covered by the completed scenarios.
- Identify any requirements whose scenario is green but whose frozen statement
  or verification language is only partially implemented.
- Pay special attention to runtime-elastic `wait-for-event` / `computed`
  semantics, offline export/static TimelineMap expectations, 60-minute warning
  behavior, semantic `onCursorChange`, render-safe diagnostic coverage, and
  any P1/P2 requirement that was intentionally shallow.
- Record the result under `trace/phase1/` and update the tracker. Do not change
  frozen specs or Accepted ADRs.

#### B1.4-B All-domain MVP fixture

If B1.4-A finds green-scenario gaps in frozen requirement semantics, close
those gaps first as narrow B1.4-B sub-batches before creating the fixture. The
fixture is the final B1.4-B integration batch, not a substitute for missing
runtime/compiler behavior.

Create one small integration fixture that spans the Phase 1 MVP domains:

- typed API primitives and theme tokens;
- compiler TimelineMap generation and cursor coverage;
- render-safe resources and bounded content;
- player/runtime navigation and presenter metadata;
- validation diagnostics and `createValidationReport`;
- skill-pack guidance that an agent can follow.

The fixture should be an agent-authored technical talk, not a synthetic unit
fixture. Keep it small enough to debug quickly.

#### B1.4-C Phase exit demo / export path

Use the all-domain fixture to prove the Phase 1 exit path:

- compile to a deterministic TimelineMap;
- run browser preview checks where applicable;
- produce the Phase 1 export handoff artifact or clearly document the current
  export boundary if true video rendering remains out of scope.

Do not claim MP4/PDF export support unless the repo actually implements and
verifies that path.

#### B1.4-D Trace closeout

Close the Phase 1 Builder trace only after B1.4-A through B1.4-C are complete or
explicitly waived.

- Update `trace/phase1/status.yaml` exit criteria.
- Insert a newest-first tracker entry below the H1.
- Run the full verification stack.
- Stop and report the phase-close state before starting any Phase 2 work.

#### Batch rules during B1.4

For each batch:

- Update tests first and confirm the intended RED state.
- Implement the smallest code needed to turn the batch GREEN.
- Refactor only after the batch is GREEN, then re-run verification.
- Update `SPEC_TRACEABILITY.md` only if allowed by the maintainer; otherwise
  record code locations in `trace/phase1/`.
- Insert a tracker entry below the H1 in `trace/phase1/tracker.md`.
- Stop after the tracker update and report the batch outcome before continuing.

---

## 5. Hard constraints

- Do not modify `CONTRACT_FROZEN` specs or Accepted ADRs. If implementation
  contradicts a frozen contract, stop and ask for Architect review.
- Do not implement deferred WIP items from `wip/future-support/` unless a later
  frozen spec or explicit maintainer instruction promotes them.
- Raw Remotion primitives are escape-hatch only. If used, add a `// why:`
  comment explaining the reason.
- Keep tests tied to public behavior and requirement IDs, not private internals.
- Do not publish to npm, push to `main`, or open external PRs without explicit
  maintainer approval in the same session.

---

## 6. Success criteria

Phase 1 Builder work is complete when:

- All P0/P1/P2 scenarios in `SPEC_TEST_MATRIX.md` are green or explicitly
  waived by the maintainer.
- The all-domain MVP fixture covers typed API, compiler, render-safe layer,
  player runtime, validation, and skills.
- The documented verification stack passes.
- Trace records requirement, test, and implementation status.
- The phase exit demo can produce an agent-authored technical talk and export
  path according to the frozen specs.

---

## 7. When stuck

1. Re-read the selected frozen spec and `SPEC_TRACEABILITY.md`.
2. Re-read `docs/design/compiler-design.md` for timeline behavior.
3. Check `wip/future-support/` to confirm the feature was not deferred.
4. Ask the maintainer one concrete question.
5. Never silently weaken a frozen requirement to make tests pass.
