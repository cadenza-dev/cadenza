# PHASE 4 - Kick file for the BUILDER role

> **You are the Builder.** Phase 4 implements the frozen Presentation Product
> Layer contracts. Start from `SPEC_TEST_MATRIX.md`, use strict TDD, keep each
> batch vertical, and update trace after every batch.

---

## 1. Your identity

You are acting as **builder** for Cadenza Phase 4.

**Suggested model/tool (advisory, not enforced)**: `gpt-5-5` via `codex`.

Before any write action, run the Startup Protocol in [`AGENTS.md`](../AGENTS.md)
section 4. If your detected identity differs from the suggested mapping, stop
and ask the maintainer whether to proceed as Builder.

Load and follow the local `cadenza-builder` skill for cross-phase Builder
discipline. Before implementation work, also load and follow the local `tdd`
skill.

---

## 2. Context

Read in this order before acting:

1. [`AGENTS.md`](../AGENTS.md) - authority order, role boundaries, verification
   gates, frozen-spec rules, and Builder batch discipline.
2. [`STATUS.yaml`](../STATUS.yaml) - confirm current phase is `4`.
3. `trace/phase4/status.yaml` and `trace/phase4/tracker.md` - confirm Phase 4
   has been opened and Builder handoff is ready. If these do not exist yet,
   stop and ask the maintainer to open Phase 4 routing.
4. [`spec/phase4/SPEC_TEST_MATRIX.md`](../spec/phase4/SPEC_TEST_MATRIX.md) -
   choose the next acceptance scenario.
5. [`spec/phase4/SPEC_TRACEABILITY.md`](../spec/phase4/SPEC_TRACEABILITY.md) -
   keep requirement-to-test-to-code links aligned through trace evidence.
6. The domain spec for the selected batch:
   - [`SPEC_DOGFOOD_TALK.md`](../spec/phase4/SPEC_DOGFOOD_TALK.md)
   - [`SPEC_PRESENTER_WORKFLOW.md`](../spec/phase4/SPEC_PRESENTER_WORKFLOW.md)
   - [`SPEC_VISUAL_ACCEPTANCE_REPAIR.md`](../spec/phase4/SPEC_VISUAL_ACCEPTANCE_REPAIR.md)
   - [`SPEC_TYPOGRAPHY_DENSITY.md`](../spec/phase4/SPEC_TYPOGRAPHY_DENSITY.md)
   - [`SPEC_TRANSITIONS_PROGRESS.md`](../spec/phase4/SPEC_TRANSITIONS_PROGRESS.md)
   - [`SPEC_TECHNICAL_TALK_STARTERS.md`](../spec/phase4/SPEC_TECHNICAL_TALK_STARTERS.md)
7. Inherited implementation and evidence context only when needed:
   - [`trace/phase3/status.yaml`](../trace/phase3/status.yaml)
   - [`trace/phase3/review-phase3-closeout.md`](../trace/phase3/review-phase3-closeout.md)
   - [`trace/phase3/phase4-architect-handoff.md`](../trace/phase3/phase4-architect-handoff.md)
   - [`examples/phase3/acceptance-deck.tsx`](../examples/phase3/acceptance-deck.tsx)
   - [`tests/browser/remotion-preview.spec.ts`](../tests/browser/remotion-preview.spec.ts)
8. [`wip/future-support/`](../wip/future-support/) only to avoid implementing
   deferred features such as export, hosted rendering, Remotion Lambda,
   multi-device presenter console, public API stability, read-only MCP
   implementation, or tool-based MCP.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] `spec/phase4/` is `CONTRACT_FROZEN` and has no unresolved Stage A
      decision markers.
- [ ] `STATUS.yaml.current_phase` is `4` and `trace/phase4/status.yaml` reports
      Builder-ready routing.
- [ ] The selected test case has requirement IDs in `SPEC_TRACEABILITY.md`.
- [ ] The local `tdd` skill is loaded before implementation work.
- [ ] `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`,
      `pnpm test:browser`, `pnpm spec:lint`, `pnpm phase:check`,
      `pnpm check:harness`, and `pnpm check:memory` are runnable. Browser tests
      may need a Chromium-capable environment.
- [ ] The working tree is understood; do not overwrite unrelated user changes.

---

## 4. Mission

Implement Phase 4 in Builder batches using RED -> GREEN -> REFACTOR.

Before implementation work, load and follow the local `tdd` skill. Use
one-test-at-a-time vertical slices through public interfaces. Do not write a
horizontal batch of tests before implementation.

Complete at most one Builder batch per session turn. After that batch is green,
stop, report the changes and verification results to the maintainer, and wait
for explicit approval before starting the next batch.

### B4.1 Dogfood talk and local preview entrypoint

Start with `TC-DOGF-001` and `TC-DOGF-002`:

- create or resolve the canonical Phase 4 dogfood talk under
  `examples/phase4/`;
- make it a production-adjacent Cadenza architecture talk with at least one
  data-explainer slide;
- prove it uses public Cadenza TSX, render-safe components, notes, outline or
  chapter metadata, and previewable transitions;
- add a maintainer-facing local preview command or example entrypoint that
  opens the talk in Remotion Player without making Playwright the primary
  interface.

### B4.2 Presenter workflow

After B4.1, implement `TC-PRES-001` and `TC-PRES-002`:

- add a same-browser presenter panel;
- expose current slide, current step, notes, elapsed time, and current/next
  context from inherited runtime metadata;
- support outline or chapter navigation through runtime-mediated `goto`
  behavior;
- keep UI frame math out of presenter controls.

### B4.3 Visual acceptance evidence and repair routing

Implement `TC-VARR-001`, `TC-VARR-002`, and `TC-VARR-003`:

- record human visual findings as JSON plus a concise Markdown summary;
- include category, affected slide or chapter when known, observed problem,
  intended repair surface, commands or routes, diagnostics, and before/after
  evidence;
- prove trace-only visual acceptance remains insufficient without real evidence
  or maintainer waiver;
- repair a visual finding through authored deck or guidance changes, or route a
  suspected framework defect to a separate Builder issue.

### B4.4 Typography auto-fit and density diagnostics

Implement `TC-TYPO-001` and `TC-TYPO-002`:

- add opt-in deterministic typography auto-fit;
- keep fitting bounded by minimum font size, line-height bounds, spacing bounds,
  and overflow fallback;
- use theme-level readable density budgets with deterministic defaults;
- expose density and overflow diagnostics through the local product-layer
  workflow.

### B4.5 Stronger transitions and progress evidence

Implement `TC-TRPR-001` and `TC-TRPR-002`:

- add a small typed product-layer transition roster with theme-driven timing
  tokens;
- prove local preview navigation plays slide transitions and settles at
  deterministic semantic anchors;
- expose transition start, progress, and settle diagnostics through an internal
  product-layer surface;
- preserve `onCursorChange` as a semantic cursor event and avoid public
  transition-progress API claims.

### B4.6 Starters, guidance, evals, and deferred-scope guards

Implement `TC-STAR-001`, `TC-STAR-002`, and `TC-STAR-003`:

- add three narrow technical-talk starter surfaces: architecture talk, data
  explainer, and live-demo or release talk;
- keep starter guidance in `cadenza-best-practices` plus TSX examples, not a
  new starter package;
- add eval coverage that rewards production-adjacent technical-talk structure
  and penalizes WYSIWYG, template-marketplace, export, hosted-rendering,
  public-stability, and external-alpha claims;
- record read-only MCP as a closeout or Phase 5-start evaluation item only;
- prove tool-based MCP remains absent.

### B4.7 Phase closeout

After all Phase 4 acceptance scenarios are green or explicitly waived:

- update `trace/phase4/status.yaml` exit criteria;
- insert a newest-first tracker entry below the H1;
- run the full verification stack;
- stop and report the phase-close state for Reviewer review.

---

## 5. Hard constraints

- Do not modify `CONTRACT_FROZEN` specs or Accepted ADRs. If implementation
  contradicts a frozen contract, stop and ask for Architect review.
- Do not claim MP4 export, PDF export, hosted rendering, Remotion Lambda,
  external alpha usage, public API stability, or multi-device presenter console
  support in Phase 4.
- Do not implement read-only MCP or tool-based MCP in Phase 4. Read-only MCP may
  only be evaluated at closeout or Phase 5 startup.
- Do not expand starters into a broad template marketplace, WYSIWYG editing,
  collaboration, comments, SSO, or i18n infrastructure.
- Do not treat `packages/**/src/**` framework edits as normal dogfood-talk
  repair. Route suspected framework defects separately.
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

Phase 4 Builder work is complete when:

- All Phase 4 scenarios in `SPEC_TEST_MATRIX.md` are green or explicitly waived
  by the maintainer.
- The canonical Phase 4 dogfood talk lives under `examples/phase4/`, uses
  public Cadenza surfaces, and opens through a local Remotion Player preview
  entrypoint.
- The presenter workflow exposes current/next context, notes, elapsed time,
  outline or chapter navigation, and relevant diagnostics.
- Human visual acceptance is recorded as JSON plus Markdown summary and supports
  evidence-driven repair.
- Typography auto-fit is opt-in, deterministic, bounded, and diagnostic-rich.
- Stronger transitions use typed Cadenza semantics and internal progress
  evidence without public progress API claims.
- Technical-talk starters and `cadenza-best-practices` guidance cover Phase 4
  product-layer workflows without drifting into marketplace, WYSIWYG, export,
  hosted-rendering, public-stability, external-alpha, or MCP implementation
  claims.
- Trace records requirement, test, implementation, and evidence status.
- The full verification stack passes.

---

## 7. When stuck

1. Re-read the selected frozen Phase 4 spec and `SPEC_TRACEABILITY.md`.
2. Re-read `trace/phase4/status.yaml` for current batch routing.
3. Re-read Phase 1/2/3 implementation only as inherited context.
4. Check `wip/future-support/` to confirm the feature was not deferred.
5. Ask the maintainer one concrete question.
6. Never silently weaken a frozen requirement to make tests pass.
