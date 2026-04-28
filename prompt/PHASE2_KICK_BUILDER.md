# PHASE 2 — Kick file for the BUILDER role

> **You are the Builder.** Phase 2 implements the frozen React + Remotion
> Preview Adapter contracts. Start from tests, keep each batch vertical, and
> update trace after every batch.

---

## 1. Your identity

You are acting as **builder** for Cadenza Phase 2.

**Suggested model/tool (advisory, not enforced)**: `gpt-5-5` via `codex`.

Before any write action, run the Startup Protocol in [`AGENTS.md`](../AGENTS.md)
§4. If your detected identity differs from the suggested mapping, stop and ask
the maintainer whether to proceed as Builder.

---

## 2. Context

Read in this order before acting:

1. [`AGENTS.md`](../AGENTS.md) — authority order, role boundaries, verification
   gates, frozen-spec rules, and Builder batch discipline.
2. [`STATUS.yaml`](../STATUS.yaml) — confirm current phase is `2` and status is
   `builder_ready`.
3. [`trace/phase2/status.yaml`](../trace/phase2/status.yaml) and
   [`trace/phase2/tracker.md`](../trace/phase2/tracker.md).
4. [`spec/phase2/SPEC_TEST_MATRIX.md`](../spec/phase2/SPEC_TEST_MATRIX.md) —
   choose the next acceptance scenario.
5. [`spec/phase2/SPEC_TRACEABILITY.md`](../spec/phase2/SPEC_TRACEABILITY.md) —
   keep requirement-to-test-to-code links aligned through trace evidence.
6. The domain spec for the selected batch:
   - [`SPEC_PACKAGE_BOUNDARY.md`](../spec/phase2/SPEC_PACKAGE_BOUNDARY.md)
   - [`SPEC_PREVIEW_ADAPTER.md`](../spec/phase2/SPEC_PREVIEW_ADAPTER.md)
   - [`SPEC_RENDER_SAFE_REMOTION.md`](../spec/phase2/SPEC_RENDER_SAFE_REMOTION.md)
   - [`SPEC_BROWSER_VALIDATION.md`](../spec/phase2/SPEC_BROWSER_VALIDATION.md)
   - [`SPEC_TRACEABILITY_COVERAGE.md`](../spec/phase2/SPEC_TRACEABILITY_COVERAGE.md)
7. Phase 1 inherited context only when needed:
   - [`trace/phase1/status.yaml`](../trace/phase1/status.yaml)
   - [`trace/phase1/review-phase1-closeout.md`](../trace/phase1/review-phase1-closeout.md)
   - [`packages/core/src/fixtures/allDomainMvp.ts`](../packages/core/src/fixtures/allDomainMvp.ts)
8. [`TODO.md`](../TODO.md) only to avoid accidentally implementing deferred
   governance follow-ups such as the active-phase-only traceability hard gate.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] `spec/phase2/` is `CONTRACT_FROZEN` and has no unresolved Freeze
      Candidate markers.
- [ ] `STATUS.yaml.current_phase` is `2` and `trace/phase2/status.yaml` reports
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

Implement Phase 2 in Builder batches using RED → GREEN → REFACTOR.

Before implementation work, load and follow the local `tdd` skill. Use
one-test-at-a-time vertical slices through public interfaces. Do not write a
horizontal batch of tests before implementation.

Complete at most one Builder batch per session turn. After that batch is green,
stop, report the changes and verification results to the maintainer, and wait
for explicit approval before starting the next batch.

### B2.1 Package boundary and first public preview surface

Start with `TC-PKG-001`: public preview package imports compile while
`@cadenza-dev/core` remains free of a hard `@remotion/player` dependency.

This batch should create the smallest observable Phase 2 surface:

- a resolved package boundary for `@cadenza-dev/preview-remotion`;
- manifest dependency placement for React, Remotion, and `@remotion/player`;
- type or unit tests proving public imports and no private source imports;
- no real Player behavior beyond what is needed to prove the boundary.

### B2.2 Minimal real Player mount

After B2.1, implement `TC-PRAD-001`:

- mount the Phase 1 all-domain fixture in a real React tree containing
  `@remotion/player`;
- pass timeline-derived `durationInFrames`, `fps`, `compositionWidth`, and
  `compositionHeight`;
- keep the test browser-observable.

### B2.3 Navigation and frame/cursor synchronization

Implement `TC-PRAD-003` and `TC-PRAD-004` as narrow slices:

- Cadenza navigation intents resolve through runtime anchors;
- transition segments play, then pause at semantic anchors;
- `frameupdate` drives internal cursor synchronization;
- native Player seek/scrub behavior updates Cadenza cursor and metadata.

### B2.4 Render-safe readiness inside Remotion preview

Implement `TC-RSRM-001`:

- Cadenza readiness registry connects to Remotion preview buffering;
- `SafeImage`, `SafeFont`, and `SafeVideo` readiness are browser-observable;
- browser font readiness uses `document.fonts` when available, with explicit
  fallback for deterministic tests.

### B2.5 Browser validation and visual sanity

Implement `TC-RSRM-006` and `TC-BROW-006`:

- `TypographyBox`, `MediaFrame`, and `ContentSlot` expose browser measurement
  evidence;
- targeted visual sanity proves the Player is nonblank and correctly framed;
- do not introduce a full screenshot-diff required gate.

### B2.6 Traceability coverage report

Implement `TC-TRAC-001` and `TC-TRAC-005`:

- add the non-mutating coverage report required by `TRAC-001`;
- compare requirement IDs across specs, test matrix, traceability matrix,
  trace status, tests, and implementation evidence;
- do not mutate frozen Phase 1 specs;
- keep the active-phase-only hard gate deferred to `TODO.md` until after the
  first Phase 2 Builder slice is reviewed.

### B2.7 Phase closeout

After all Phase 2 acceptance scenarios are green or explicitly waived:

- update `trace/phase2/status.yaml` exit criteria;
- insert a newest-first tracker entry below the H1;
- run the full verification stack;
- stop and report the phase-close state for Reviewer review.

---

## 5. Hard constraints

- Do not modify `CONTRACT_FROZEN` specs or Accepted ADRs. If implementation
  contradicts a frozen contract, stop and ask for Architect review.
- Do not claim MP4 export, PDF export, hosted rendering, external alpha usage,
  or public API stability in Phase 2.
- Do not implement Phase 3 AI repair-loop work, MCP work, or the
  active-phase-only traceability hard gate unless the maintainer explicitly
  widens scope in this session.
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

Phase 2 Builder work is complete when:

- All Phase 2 scenarios in `SPEC_TEST_MATRIX.md` are green or explicitly waived
  by the maintainer.
- The all-domain fixture renders through a real React + Remotion browser
  preview.
- Navigation seeks via Remotion Player frame control while Cadenza cursor state
  remains deterministic.
- Image, font, and video readiness are driven through public render-safe
  behavior in the preview adapter.
- Typography/media/browser visual sanity checks run against the preview.
- The non-mutating traceability coverage report exists and records
  `REV-P1-004` evidence without editing frozen Phase 1 specs.
- Trace records requirement, test, and implementation status.
- The full verification stack passes.

---

## 7. When stuck

1. Re-read the selected frozen Phase 2 spec and `SPEC_TRACEABILITY.md`.
2. Re-read `trace/phase2/status.yaml` for current batch routing.
3. Re-read the relevant Phase 1 implementation only as inherited context.
4. Check `TODO.md` and `wip/future-support/` to confirm the feature was not
   deferred.
5. Ask the maintainer one concrete question.
6. Never silently weaken a frozen requirement to make tests pass.
