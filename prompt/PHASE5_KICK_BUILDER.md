# PHASE 5 - Kick file for the BUILDER role

> **You are the Builder.** Phase 5 implements the frozen Export + `0.1 Alpha
> Readiness` contracts. Start from `SPEC_TEST_MATRIX.md`, use strict TDD, keep
> each batch vertical, and update trace after every batch.

---

## 1. Your identity

You are acting as **builder** for Cadenza Phase 5.

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
2. [`STATUS.yaml`](../STATUS.yaml) - confirm current phase is `5`, or confirm
   the maintainer explicitly authorized pre-open Phase 5 Builder work.
3. `trace/phase5/status.yaml` and `trace/phase5/tracker.md` - confirm Phase 5
   has been opened and Builder handoff is ready. If these do not exist yet,
   stop and ask the maintainer to open Phase 5 routing or explicitly approve
   pre-open Builder work.
4. [`spec/phase5/SPEC_TEST_MATRIX.md`](../spec/phase5/SPEC_TEST_MATRIX.md) -
   choose the next acceptance scenario.
5. [`spec/phase5/SPEC_TRACEABILITY.md`](../spec/phase5/SPEC_TRACEABILITY.md) -
   keep requirement-to-test-to-code links aligned through trace evidence.
6. The domain spec for the selected batch:
   - [`SPEC_EXPORT_PIPELINE.md`](../spec/phase5/SPEC_EXPORT_PIPELINE.md)
   - [`SPEC_PREVIEW_EXPORT_PARITY.md`](../spec/phase5/SPEC_PREVIEW_EXPORT_PARITY.md)
   - [`SPEC_EXPORT_DIAGNOSTICS.md`](../spec/phase5/SPEC_EXPORT_DIAGNOSTICS.md)
   - [`SPEC_FORMAT_SCOPE.md`](../spec/phase5/SPEC_FORMAT_SCOPE.md)
   - [`SPEC_ALPHA_READINESS.md`](../spec/phase5/SPEC_ALPHA_READINESS.md)
   - [`SPEC_LAMBDA_HOSTED_EVALUATION.md`](../spec/phase5/SPEC_LAMBDA_HOSTED_EVALUATION.md)
   - [`SPEC_MCP_AUTOMATION_BOUNDARY.md`](../spec/phase5/SPEC_MCP_AUTOMATION_BOUNDARY.md)
   - [`SPEC_PRESENTER_CONSOLE_FOLLOWUP.md`](../spec/phase5/SPEC_PRESENTER_CONSOLE_FOLLOWUP.md)
7. Inherited product-layer context only when needed:
   - [`trace/phase4/status.yaml`](../trace/phase4/status.yaml)
   - [`trace/phase4/review-phase4-closeout.md`](../trace/phase4/review-phase4-closeout.md)
   - [`trace/phase4/phase5-architect-handoff.md`](../trace/phase4/phase5-architect-handoff.md)
   - [`examples/phase4/dogfood-talk.tsx`](../examples/phase4/dogfood-talk.tsx)
   - [`examples/phase4/technical-talk-starters.tsx`](../examples/phase4/technical-talk-starters.tsx)
   - [`examples/phase4/preview.ts`](../examples/phase4/preview.ts)
8. [`wip/next-phases/`](../wip/next-phases/) and
   [`wip/future-support/`](../wip/future-support/) only to avoid implementing
   deferred features such as hosted SaaS, production Lambda, tool-based MCP,
   multi-device presenter console, user-facing replay, broad editor surfaces,
   marketplace, collaboration, accounts, SSO, or i18n.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] `spec/phase5/` is `CONTRACT_FROZEN` and has no unresolved decision
      markers.
- [ ] `STATUS.yaml.current_phase` is `5`, or the maintainer explicitly
      approved pre-open Phase 5 Builder work.
- [ ] `trace/phase5/status.yaml` reports Builder-ready routing, unless the
      maintainer explicitly approved pre-open Builder work.
- [ ] The selected test case has requirement IDs in
      `SPEC_TRACEABILITY.md`.
- [ ] The local `tdd` skill is loaded before implementation work.
- [ ] The working tree is understood; do not overwrite unrelated user changes.
- [ ] The full verification stack is runnable before any done claim:
      `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`,
      Markdown lint, shell format check, `pnpm spec:lint`,
      `pnpm phase:check`, `pnpm check:harness`, and `pnpm check:memory`.

---

## 4. Mission

Implement Phase 5 in Builder batches using RED -> GREEN -> REFACTOR.

Before implementation work, load and follow the local `tdd` skill. Use
one-test-at-a-time vertical slices through public interfaces. Do not write a
horizontal batch of tests before implementation.

Complete at most one Builder batch per session turn. After that batch is green,
stop, report the changes and verification results to the maintainer, and wait
for explicit approval before starting the next batch.

### B5.1 Launch-grade export source and local web export

Start with `TC-EXPT-001` and `TC-EXPT-002`:

- create the canonical Phase 5 longer technical talk under `examples/phase5/`;
- author it through public Cadenza TSX, render-safe components,
  `cadenza-best-practices`, and Phase 4 product-layer patterns;
- add the narrow generic local command shape `cadenza export <deck>`;
- produce a deterministic reviewable web bundle baseline and export manifest;
- keep temporary scripts wrapped behind the supported command surface.

### B5.2 Preview and export parity

Implement `TC-PEXP-001` and `TC-PEXP-002`:

- compare exported web output with local preview for timeline identity,
  slide/step ordering, timing, transitions, and semantic anchors;
- include a browser-observable smoke test for exported web output;
- preserve notes boundaries and record render-safe, typography, and density
  diagnostics;
- use semantic checkpoints plus deterministic offline frame fields rather than
  brittle screenshot-only assertions.

### B5.3 Export diagnostics and repair routing

Implement `TC-EVDN-001` and `TC-EVDN-002`:

- emit machine-readable JSON evidence plus a concise Markdown summary;
- name source deck, command, generated artifacts, diagnostics, parity checks,
  known limitations, and repair categories;
- keep generated reports with artifacts and record accepted summaries in trace;
- require artifact-backed evidence before readiness or waiver claims.

### B5.4 Format scope

Implement `TC-FMT-001` and `TC-FMT-002`:

- support MP4 export for the canonical Phase 5 launch-candidate technical talk;
- record explicit MP4 limitations and avoid arbitrary-deck guarantees;
- treat PDF as waived by default for launch readiness, or add only a clearly
  labeled static proof if it is cheap and honest;
- keep format capability claims specific to each output format.

### B5.5 Alpha readiness and public launch-candidate surface

Implement `TC-ALFA-001`, `TC-ALFA-002`, and `TC-ALFA-003`:

- declare the public surface as package exports, documented preview/export
  commands, examples, and `cadenza-best-practices` guidance;
- add clean-checkout install, run, preview, export, and evidence docs;
- add public launch-candidate material without claiming hosted rendering,
  external alpha adoption, broad format parity, or npm publication;
- record the public-surface stability clock or maintainer waiver route;
- require Reviewer acceptance after Builder closeout before final
  `0.1 alpha readiness` is claimed.

### B5.6 Hosted evaluation, MCP boundary, and presenter follow-up

Implement `TC-LHEV-001`, `TC-LHEV-002`, `TC-MCPA-001`, `TC-MCPA-002`,
`TC-PCON-001`, and `TC-PCON-002`:

- produce a structured local compatibility report for Remotion Lambda and
  hosted rendering without running remote jobs;
- scan for secrets, remote accounts, paid jobs, publishing, and hosted
  infrastructure requirements;
- record cost, operational risk, licensing, and OSS-core boundary evidence;
- defer tool-based MCP beyond Phase 5 and allow read-only MCP only if context
  limits justify it;
- defer multi-device presenter console and keep deterministic offline export
  canonical;
- allow session replay only as diagnostic evidence if parity work needs it.

### B5.7 Phase closeout

After all Phase 5 acceptance scenarios are green or explicitly waived:

- update `trace/phase5/status.yaml` exit criteria;
- insert a newest-first tracker entry below the H1;
- run the full verification stack;
- stop and report the phase-close state for Reviewer review.

---

## 5. Hard constraints

- Do not modify `CONTRACT_FROZEN` specs or Accepted ADRs. If implementation
  contradicts a frozen contract, stop and ask for Architect review.
- Do not modify `STATUS.yaml.current_phase`; phase routing is a maintainer or
  Wizard boundary action.
- Do not publish to npm, push to `main`, open external PRs, tag releases, or
  announce external alpha availability without explicit maintainer approval in
  the same session.
- Do not build hosted SaaS, production Remotion Lambda, commercial tiers,
  accounts, billing, SSO, collaboration, comments, external publishing, i18n
  infrastructure, WYSIWYG editing, or a template marketplace.
- Do not implement tool-based MCP in Phase 5. Read-only MCP must remain
  deferred unless evidence proves Markdown context injection is inadequate.
- Do not make live-presenter recording the canonical export path. Deterministic
  offline export remains canonical.
- Do not claim broad arbitrary-deck MP4 support, full PDF parity, or hosted
  rendering readiness from the Phase 5 launch-candidate proof.
- Raw Remotion primitives are escape-hatch only in Cadenza code. Prefer the
  typed API and render-safe layer. If raw primitives are necessary, add a
  `// why:` comment explaining the reason.
- Keep tests tied to public behavior and requirement IDs, not private
  implementation details.

---

## 6. Success criteria

Phase 5 Builder work is complete when:

- All Phase 5 scenarios in `SPEC_TEST_MATRIX.md` are green or explicitly waived
  by the maintainer.
- The canonical Phase 5 talk lives under `examples/phase5/` and uses public
  Cadenza authoring surfaces.
- `cadenza export <deck>` produces a deterministic local web bundle and
  manifest for the canonical talk.
- The exported web bundle has browser-observable smoke coverage and semantic
  preview/export parity evidence.
- MP4 export works for the canonical launch-candidate talk with explicit
  limitations.
- PDF is either clearly waived or represented only by a scoped static proof.
- Export evidence exists as JSON plus Markdown summary and routes known
  limitations to actionable repair categories.
- Public launch-candidate docs and alpha-readiness evidence avoid hosted,
  commercial, external-alpha, publication, marketplace, editor, collaboration,
  SSO, and i18n overclaims.
- Remotion Lambda, hosted rendering, MCP, presenter console, live recording, and
  replay work are resolved within the frozen evaluation or deferral boundaries.
- Trace records requirement, test, implementation, and evidence status.
- The full verification stack passes.

---

## 7. When stuck

1. Re-read the selected frozen Phase 5 spec and `SPEC_TRACEABILITY.md`.
2. Re-read `trace/phase5/status.yaml` for current batch routing.
3. Re-read Phase 4 implementation and closeout evidence only as inherited
   context.
4. Check `wip/next-phases/` and `wip/future-support/` to confirm the feature
   was not deferred.
5. Ask the maintainer one concrete question.
6. Never silently weaken a frozen requirement to make tests pass.
