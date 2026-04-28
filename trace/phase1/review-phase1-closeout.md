# Phase 1 Closeout Reviewer Report

> Role: Phase 1 Reviewer
> Date: 2026-04-28 04:57 +0800
> Scope: Read-only review of `trace/phase1/phase-closeout.md`,
> `trace/phase1/status.yaml`, and `trace/phase1/tracker.md` against
> `spec/phase1/`, `docs/design/compiler-design.md`, relevant tests, and
> `packages/` implementation.
> Write approval: Maintainer approved writing this reviewer report in
> `trace/phase1/`.

## Findings

REV-P1-001 [blocker] Typed API implementation is not the frozen TSX/component surface

Evidence: `spec/phase1/SPEC_TYPED_API.md` selects a component-only API where
authors compose `<Deck>`, `<Slide>`, `<Step>`, `<Transition>`, `<Notes>`, and
`<Theme>`, and explicitly requires both static children and render-function
children receiving step context. Current implementation in
`packages/core/src/typed-api/primitives.ts` exposes object factory functions
such as `Deck({ ... })` and `Step({ ... })`; `StepProps.children` is `unknown`
and there is no public `StepContext` shape. `tsconfig.json` includes
`packages/**/*.ts` but not TSX test fixtures, and the current public API test
uses factory calls rather than JSX/TSX authoring.

Why it matters: Phase 1 closeout records the typed API surface as complete, but
the frozen contract's authoring surface is not proven. This is a contract-level
gap, not only a test naming issue.

Recommended remediation: Maintainer should first decide whether Phase 1 still
requires the frozen TSX component surface or whether the true React/TSX surface
is deferred to Phase 2. If the contract stands, Builder remediation should add
TSX-compatible public API/type tests and implement or type the render-function
step context.

Verification path: A new TSX type/compile fixture covers `<Deck>`, `<Slide>`,
`<Step>{(ctx) => ...}</Step>`, `Transition`, `Notes`, and `Theme`, and
`pnpm typecheck` proves the public authoring surface.

Recommended owner: maintainer

REV-P1-002 [high] `computed` step preview semantics stop at loading and do not cover resolution or segment shift

Evidence: `docs/design/compiler-design.md` TC-5.1.4 says a pending computed
step becomes loading, then transitions to `at-step` after resolution, shifting
subsequent slide segments. `spec/phase1/SPEC_COMPILER.md` requires computed
steps to enter loading while unresolved and fail export if unresolved before
offline compilation. Current `packages/core/src/compiler/compile.ts` marks
zero-frame computed steps as `pending`, and
`packages/core/src/runtime/createRuntime.ts` enters loading for pending steps,
but there is no resolver/readiness path that returns a computed step from
loading to `at-step` or shifts subsequent segments. The current closeout test
only verifies loading after advancing from a previous fixed slide.

Why it matters: `trace/phase1/status.yaml` and `phase-closeout.md` treat the
B1.4-B compiler/runtime semantic gaps as closed, but the broader frozen
computed-step runtime behavior is still only partially implemented.

Recommended remediation: Builder remediation should add a computed-step
resolution API or readiness path through TDD, including a computed-only or
first-step fixture, and prove that resolving the computed step exits loading and
updates subsequent anchors consistently.

Verification path: Unit tests prove unresolved computed steps enter loading,
resolved computed steps transition to `at-step`, subsequent timeline anchors are
shifted or otherwise made deterministic, and offline unresolved computed steps
still fail with typed diagnostics.

Recommended owner: builder-remediation

REV-P1-003 [medium] Browser readiness coverage proves a controlled harness, not render-safe component behavior

Evidence: `spec/phase1/SPEC_RENDER_SAFE.md` requires `SafeFont` to prevent text
render before required font readiness and `SafeVideo` to gate slide entry until
metadata is available or timeout occurs. The browser fixture in
`tests/browser/cadenza-browser-entry.ts` manually sets
`title.style.visibility = "hidden"`, manually marks font readiness, and manually
sets visibility back to `visible`. The Playwright test in
`tests/browser/render-safe-preview.spec.ts` asserts that controlled state, not a
public render-safe DOM adapter or component behavior.

Why it matters: The closeout trace says readiness/browser-depth gaps are
complete. The current browser test is useful, but it proves a harness-level
contract more than it proves `SafeFont`/`SafeVideo` behavior as public
render-safe authoring primitives.

Recommended remediation: Either narrow the trace wording to "controlled
readiness fixture" or implement a public render-safe adapter/helper that owns
the font/video readiness DOM behavior and can be tested without manual
visibility toggles in the harness.

Verification path: Playwright tests drive the public Cadenza render-safe adapter
or component-facing helper; font visibility and video readiness change because
of the public API, not because the fixture mutates DOM state directly.

Recommended owner: builder-remediation

REV-P1-004 [medium] Traceability gate allows requirement coverage holes while status marks traceability complete

Evidence: `trace/phase1/status.yaml` marks `traceability_recorded: met`.
`spec/phase1/SPEC_TRACEABILITY.md` maps every requirement to test IDs, but
`spec/phase1/SPEC_TEST_MATRIX.md` does not list every requirement ID in the
scenario table. `scripts/lint-specs.ts` checks that IDs referenced by the test
matrix and traceability matrix are known, but it does not require every frozen
requirement to appear in the test matrix or in an implementation evidence
ledger.

Why it matters: `pnpm spec:lint` can be green while requirement coverage is
still only partially represented in normative scenario metadata. This weakens
future closeout reviews and makes `traceability_recorded: met` easier to
overread.

Recommended remediation: Add a non-mutating coverage check or reviewer-facing
coverage report that compares requirement IDs across domain specs, test matrix,
traceability matrix, trace status, tests, and implementation evidence. If the
frozen test matrix itself must change, get maintainer approval before editing
the frozen spec.

Verification path: A spec/coverage gate or report flags requirements that are
not present in the test matrix or lack implementation evidence, while preserving
the frozen-spec edit boundary.

Recommended owner: architect

## Open Questions

- REV-P1-001 is resolved for remediation planning: the maintainer chose to
  uphold the Phase 1 TSX/component API contract.

## Residual Risk

- This report did not rerun the full completion stack. The review used source
  inspection plus read/check commands: `pnpm typecheck`, `pnpm spec:lint`,
  `pnpm phase:check`, `pnpm check:harness`, and `pnpm check:memory`.
- `pnpm test:browser` was not rerun during the review because it writes the
  generated browser fixture under `tmp/`; earlier trace evidence says it passed
  with sandbox escalation.
- The report focuses on Phase 1 closeout honesty and frozen contract alignment,
  not on exhaustive code quality or Phase 2 roadmap readiness.

## Maintainer Selection

Selected for Builder remediation:

- `REV-P1-001`: uphold the Phase 1 TSX/component API contract. Builder
  remediation should add TSX-compatible public API/type tests and implement or
  type the render-function step context.
- `REV-P1-002`: remediate as recommended in this report.
- `REV-P1-003`: implement and test a public render-safe adapter/helper so the
  core API drives DOM readiness behavior for font/video preview coverage.

Not selected for this Builder remediation:

- `REV-P1-004`: defer to Architect follow-up because the finding concerns
  spec/coverage governance rather than Phase 1 Builder code remediation. The
  follow-up is recorded in `wip/architect/phase1-traceability-coverage.md`.

Suggested Builder remediation launch phrase:

```text
请作为 Cadenza Builder remediation，读取 trace/phase1/review-phase1-closeout.md，只处理 maintainer-selected findings: REV-P1-001, REV-P1-002, REV-P1-003；不得扩大 scope，不修改 CONTRACT_FROZEN specs 或 Accepted ADRs；用 TDD 修复并更新 trace 后停止。
```

## Reviewer Closeout After Builder Remediation

> Date: 2026-04-28 18:40 +0800
> Reviewed commits: `fabd2ee`, `8e9de57`, `03f98f2`

Reviewer conclusion: accepted. The maintainer-selected Builder remediation
scope for `REV-P1-001`, `REV-P1-002`, and `REV-P1-003` is closed from the
reviewer side.

Closure evidence:

- `REV-P1-001`: `packages/core/src/public-tsx-api.fixture.tsx`,
  `packages/core/src/jsx-runtime.ts`, `packages/core/src/typed-api/primitives.ts`,
  `packages/core/package.json`, and `tsconfig.json` now cover the Phase 1 TSX
  component authoring surface, JSX runtime entry, and render-function
  `StepContext` typing.
- `REV-P1-002`: `packages/core/src/compiler-runtime.closeout.test.ts` now
  covers a computed-first runtime case, and
  `packages/core/src/runtime/createRuntime.ts` exposes `resolveComputedStep`
  so a pending computed step can leave `loading` and shift later anchors.
- `REV-P1-003`: `packages/core/src/render-safe/domAdapter.ts` adds the public
  render-safe DOM helper, and `tests/browser/cadenza-browser-entry.ts` uses
  `createRenderSafeDomAdapter` so the browser readiness fixture is driven by
  core API behavior rather than direct manual DOM toggles.
- Trace closeout is recorded in `trace/phase1/status.yaml` under
  `post_closeout_remediations.REV_P1_selected_builder_remediation` and in
  `trace/phase1/tracker.md`.

Verification performed by reviewer:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check
pnpm test:browser
pnpm exec markdownlint-cli2 "**/*.md"
find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d
pnpm spec:lint
pnpm phase:check
pnpm check:harness
pnpm check:memory
git diff --check
```

Notes:

- The first sandboxed `pnpm test:browser` run failed with the known Chromium
  `sandbox_host_linux.cc:41` environment issue. The same command passed when
  rerun with sandbox escalation.
- `REV-P1-004` remains deferred to Architect follow-up in
  `wip/architect/phase1-traceability-coverage.md`; this reviewer closeout does
  not mark that governance finding complete.
