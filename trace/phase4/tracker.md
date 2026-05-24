# Phase 4 Tracker

## 2026-05-24 22:29 +0800 — Maintainer visual sign-off recorded

- Maintainer decision: `maintainerVisualDecision` is now `signed-off` after
  visual recheck of the Phase 4 dogfood preview.
- Sign-off basis: maintainer confirmed the font clipping issue is resolved and
  that the current PPT-like visual navigation is sufficient to prove expected
  function; no further visual adjustment is requested.
- Scope: closeout evidence/status only. No `CONTRACT_FROZEN` spec, Accepted
  ADR, package behavior, root phase pointer, export, hosted-rendering, public
  stability, external-alpha, WYSIWYG, marketplace, or MCP implementation change
  was made for sign-off.
- Updated evidence: `trace/phase4/evidence/b4.3-visual-acceptance-evidence.json`
  records `signed-off`; `trace/phase4/status.yaml` marks the selected
  remediation complete and routes the next step to Reviewer recheck.
- Verification: the full local gate stack passed after sign-off, including
  `pnpm phase:check`.
- Next action: commit, push, and watch the exact CI run before handing off.

## 2026-05-24 21:38 +0800 — Dogfood dense-copy clipping repair

- Startup identity: continuing as approved Phase 4 Builder remediation with
  `GPT-5` / `codex`.
- Scope: repaired the maintainer-observed bottom clipping on
  `preview-reliability-budget` step 2 after the broader dogfood visual
  navigation repair. This remains part of the pending `REV-P4-001` visual
  sign-off path and does not modify frozen specs or Accepted ADRs.
- Objective judgment: the defect was mixed. The authored dogfood sample used a
  `420x96` compact `TypographyBox` for long dense copy, and the renderer also
  measured auto-fit before the configured base typography was applied while the
  preceding `MediaFrame` was too unconstrained for a slide-like Player layout.
- RED/GREEN evidence: the new focused browser regression first failed with
  `data-cadenza-typography-overflow-fallback=true`, then exposed live DOM
  overflow after the box was enlarged but fitted typography was not applied to
  the element. It passed after shared box sizing, styled measurement, live
  fitted-style application, and bounded slide/media layout were implemented.
- Repair: `examples/phase4/dogfood-talk.tsx` now uses a shared
  `PHASE4_RELIABILITY_DENSITY_BOX`; `examples/phase4/preview.ts` uses the same
  dimensions for typography diagnostics; `CadenzaPlayer` now measures
  `TypographyBoxPreview` from styled browser layout, applies the fit result to
  the live DOM, and constrains slide, step, content-slot, and media-frame
  preview layout.
- Artifacts written: `examples/phase4/dogfood-talk.tsx`,
  `examples/phase4/preview.ts`,
  `packages/preview-remotion/src/CadenzaPlayer.tsx`,
  `tests/browser/cadenza-browser-entry.ts`,
  `tests/browser/remotion-preview.spec.ts`,
  `trace/phase4/evidence/b4.3-visual-acceptance-evidence.json`,
  `trace/phase4/evidence/b4.3-visual-acceptance-evidence.md`,
  `trace/phase4/evidence/rev-p4-visual-navigation-framework-defect.md`,
  `trace/phase4/status.yaml`, and `trace/phase4/tracker.md`.
- Verification: focused dense-copy browser regression passed; full `B4
  dogfood` browser group passed; `pnpm typecheck`, `pnpm test`, `pnpm lint`,
  `pnpm format:check`, `pnpm test:browser` (18/18 under Chromium-capable
  execution), Markdown lint, shell formatting, `pnpm spec:lint`,
  `pnpm check:harness`, `pnpm check:memory`, and `git diff --check` passed.
  `pnpm phase:check` still fails only on the intentional pending visual
  sign-off/waiver gate.
- Remaining gate: `maintainerVisualDecision` is still
  `pending-closeout-signoff`; maintainer must re-check the preview and then
  record `signed-off` or `explicit-waiver` before Reviewer recheck.

## 2026-05-24 21:06 +0800 — Dogfood preview visual navigation repair

- Startup identity: continuing as approved Phase 4 Builder remediation with
  `GPT-5` / `codex`.
- Scope: repaired maintainer-observed visual sign-off blockers before
  `REV-P4-001` can be signed off. The dogfood preview is now held to the stricter
  expectation that the left Remotion Player surface behaves like a PPT preview,
  not only that the right presenter panel metadata advances.
- Issues fixed: the left Player composition previously rendered static deck
  content instead of the current semantic slide; future slides and future steps
  were visible too early; presenter notes and a font readiness marker leaked
  into the visible slide surface; and the generic preview controls exposed a
  stale `Goto render-safe-demo` button for a slide that is absent from the Phase
  4 dogfood talk.
- RED/GREEN evidence: the focused Phase 4 browser test first failed because
  `timeline-compiler` was already present before navigation, then passed after
  current-frame visual rendering was added.
- Repair: `CadenzaPlayer` now renders the Remotion composition from the current
  frame, shows only the active slide and cumulative step content, keeps
  render-safe resources in a hidden preload layer for readiness diagnostics,
  hides presenter notes from the visual surface, and removes the stale
  `render-safe-demo` control. `SafeFontPreview` keeps readiness attributes while
  preventing font markers from appearing visually.
- Framework-defect route: because this repair touched
  `packages/preview-remotion/src/**`, it is recorded separately in
  `trace/phase4/evidence/rev-p4-visual-navigation-framework-defect.md` instead
  of being treated as normal authored dogfood-talk repair.
- Artifacts written: `packages/preview-remotion/src/CadenzaPlayer.tsx`,
  `packages/preview-remotion/src/render-safe/SafeFontPreview.tsx`,
  `tests/browser/cadenza-browser-entry.ts`,
  `tests/browser/remotion-preview.spec.ts`,
  `trace/phase4/evidence/b4.3-visual-acceptance-evidence.json`,
  `trace/phase4/evidence/b4.3-visual-acceptance-evidence.md`,
  `trace/phase4/evidence/rev-p4-visual-navigation-framework-defect.md`,
  `trace/phase4/status.yaml`, and `trace/phase4/tracker.md`.
- Verification: focused Phase 4 browser test passed under Chromium-capable
  execution; full `pnpm test:browser` passed 17/17; `pnpm typecheck`,
  `pnpm test`, `pnpm lint`, and `pnpm format:check` passed before trace update.
- Boundary preserved: no root phase pointer, frozen spec, Accepted ADR, export,
  hosted-rendering, Remotion Lambda, public-stability, external-alpha,
  multi-device presenter console, WYSIWYG, marketplace, collaboration,
  comments, SSO, i18n, read-only MCP implementation, or tool-based MCP
  implementation changes.
- Remaining gate: `maintainerVisualDecision` is still
  `pending-closeout-signoff`; maintainer must re-check the preview and then
  record `signed-off` or `explicit-waiver` before Reviewer recheck.

## 2026-05-24 20:18 +0800 — Reviewer remediation REV-P4-001 and REV-P4-002

- Startup identity: proceeded as Phase 4 Builder remediation with `GPT-5` /
  `codex` after maintainer approval in this session.
- Scope: handled only maintainer-selected findings `REV-P4-001` and
  `REV-P4-002` from `trace/phase4/review-phase4-closeout.md`; no
  `CONTRACT_FROZEN` spec or Accepted ADR was modified.
- RED/GREEN evidence: the core visual acceptance test first failed because
  `validatePhase4VisualCloseoutEvidence` was not exported, then passed after a
  closeout-only validator was added. The traceability coverage test first
  failed because Phase 4 closeout coverage did not report a pending visual
  decision, then passed after the active Phase 4 coverage gate learned to fail
  on `pending-closeout-signoff`.
- `REV-P4-002`: remediated. Structured B4.3 visual evidence can still validate
  for its original batch, but closeout validation and `pnpm phase:check` now
  fail until `maintainerVisualDecision` is `signed-off` or
  `explicit-waiver`.
- `REV-P4-001`: still blocked on maintainer action. Builder did not record
  visual sign-off or a waiver because the current evidence remains
  `pending-closeout-signoff` and no explicit visual decision was provided in
  this session.
- Artifacts written: `packages/core/src/validation/visualAcceptanceEvidence.ts`,
  `packages/core/src/index.ts`,
  `packages/core/src/phase4-visual-acceptance-evidence.test.ts`,
  `scripts/traceability-coverage.ts`,
  `scripts/traceability-coverage.test.ts`, `trace/phase4/status.yaml`, and
  `trace/phase4/tracker.md`.
- Verification: targeted RED/GREEN tests passed, `pnpm typecheck`,
  `pnpm lint`, and `pnpm format:check` passed. As intended, the active Phase 4
  traceability check and `pnpm phase:check` now fail with
  `Phase 4 visual closeout is pending maintainer sign-off or explicit waiver.`
- Boundary preserved: no root phase pointer, frozen spec, Accepted ADR, export,
  hosted-rendering, Remotion Lambda, public-stability, external-alpha,
  multi-device presenter console, WYSIWYG, marketplace, collaboration,
  comments, SSO, i18n, read-only MCP implementation, or tool-based MCP
  implementation changes.
- Next required action: maintainer must record Phase 4 visual sign-off or an
  explicit maintainer waiver before Reviewer recheck.

## 2026-05-24 17:30 +0800 — B4.7 Phase 4 Builder closeout

- Startup identity: proceeded as Phase 4 Builder with `GPT-5` / `codex` after
  maintainer approval in this session.
- Scope: completed only `B4.7 / phase-closeout` after `B4.1` through `B4.6`
  were already recorded complete in `trace/phase4/status.yaml`.
- Closeout status: updated `trace/phase4/status.yaml` so
  `builder_progress.status` is `builder_complete_pending_reviewer`,
  `builder_progress.next_batch.id` is `null`, and
  `exit_criteria.builder_batches_complete.status` is `met`.
- Gate repair TDD: `pnpm test -- scripts/traceability-coverage.test.ts` first
  failed because Phase 4 active-phase coverage was blocked by Phase 2
  `TRAC-001` through `TRAC-006` requirements. The coverage gate now scopes
  those traceability-governance requirements to Phase 2, and the targeted test
  passes.
- Evidence map: the closeout points Reviewer to the Phase 4 dogfood talk,
  local Remotion Player preview entrypoint, same-browser presenter workflow,
  visual acceptance evidence, typography diagnostics, transition diagnostics,
  technical-talk starters, `cadenza-best-practices` guidance/evals, and browser
  preview tests.
- Artifacts written: `scripts/traceability-coverage.ts`,
  `scripts/traceability-coverage.test.ts`, `trace/phase4/status.yaml`, and
  `trace/phase4/tracker.md`.
- Verification: `pnpm typecheck`, `pnpm test`, `pnpm lint`,
  `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed. Default
  `pnpm test:browser` failed only because the sandbox blocked Chromium launch
  with `sandbox_host_linux.cc` / `Operation not permitted`; elevated
  `pnpm test:browser` passed 16/16. Default `pnpm preview:phase4` failed only
  because the sandbox blocked localhost binding; elevated preview served
  `http://127.0.0.1:4174/`, `curl` verified `/` and
  `/phase4-dogfood-preview.js` as HTTP 200, `rg` verified the Phase 4 dogfood,
  presenter, visual, typography, transition, and `ProductTransition` bundle
  markers, and the preview server was stopped.
- Boundary preserved: no `CONTRACT_FROZEN` spec, Accepted ADR, root phase
  pointer, export, hosted-rendering, Remotion Lambda, public-stability,
  external-alpha, multi-device presenter console, WYSIWYG, marketplace,
  collaboration, comments, SSO, i18n, read-only MCP implementation, or
  tool-based MCP implementation changes.
- Next step: Phase 4 Reviewer closeout; Builder stops here.

## 2026-05-24 04:08 +0800 — B4.6 technical-talk starters and deferred guards

- Startup identity: proceeded as Phase 4 Builder with `GPT-5` / `codex` after
  maintainer approval in this session.
- Scope: completed only
  `B4.6 / TC-STAR-001 + TC-STAR-002 + TC-STAR-003` from frozen
  `spec/phase4/SPEC_TEST_MATRIX.md` and
  `spec/phase4/SPEC_TECHNICAL_TALK_STARTERS.md`.
- RED/GREEN evidence:
  `pnpm test -- packages/core/src/phase4-technical-talk-starters.test.ts`
  first failed because `examples/phase4/technical-talk-starters.tsx` did not
  exist, then passed after the architecture talk, data explainer, and live-demo
  starters were added. The same command then failed because
  `skills/cadenza/rules/product-layer-workflow.md` did not exist, then passed
  after `cadenza-best-practices` guidance and eval coverage were added. The
  same command then failed because
  `trace/phase4/evidence/b4.6-deferred-scope-guards.json` did not exist, then
  passed after the read-only MCP disposition and tool-based MCP absence evidence
  were recorded.
- Artifacts written: `examples/phase4/technical-talk-starters.tsx`,
  `packages/core/src/phase4-technical-talk-starters.test.ts`,
  `skills/cadenza/SKILL.md`,
  `skills/cadenza/rules/product-layer-workflow.md`,
  `skills/cadenza/evals/evals.json`,
  `trace/phase4/evidence/b4.6-deferred-scope-guards.json`,
  `trace/phase4/evidence/b4.6-deferred-scope-guards.md`,
  `trace/phase4/status.yaml`, and `trace/phase4/tracker.md`.
- Behavior: Phase 4 now has three narrow developer technical-talk starter
  surfaces: architecture talk, data explainer, and live-demo talk. Each starter
  uses public Cadenza TSX, render-safe components, `Notes`, outline/chapter
  metadata, typed product transitions, and local preview repair workflow
  metadata.
- Guidance and evals: `cadenza-best-practices` now routes Phase 4 starter work
  through `rules/product-layer-workflow.md` and adds eval coverage for
  production-adjacent technical-talk structure plus boundary-drift penalties.
- Deferred scope: read-only MCP is recorded only as a closeout or Phase 5-start
  evaluation item. Tool-based MCP package and command surfaces remain absent.
- Verification: targeted B4.6 tests passed before trace update. Final gate
  results are recorded in `trace/phase4/status.yaml`.
- Boundary preserved: no `CONTRACT_FROZEN` spec, Accepted ADR, new starter
  package, export, hosted-rendering, Remotion Lambda, public-stability,
  external-alpha, WYSIWYG, marketplace, collaboration, comments, SSO, i18n,
  read-only MCP implementation, or tool-based MCP implementation changes.
- Next batch after maintainer approval: `B4.7 / phase closeout`.

## 2026-05-24 03:21 +0800 — B4.5 stronger transitions and progress evidence

- Startup identity: proceeded as Phase 4 Builder with `GPT-5` / `codex` after
  maintainer approval in this session.
- Scope: completed only `B4.5 / TC-TRPR-001 + TC-TRPR-002` from frozen
  `spec/phase4/SPEC_TEST_MATRIX.md` and
  `spec/phase4/SPEC_TRANSITIONS_PROGRESS.md`.
- RED/GREEN evidence:
  `pnpm test -- packages/preview-remotion/src/phase4-transitions-progress.test.ts`
  first failed because the dogfood talk still used ordinary `Transition`, then
  passed after `ProductTransition` and theme-token duration resolution were
  added. The same command then failed because
  `createPhase4TransitionDiagnostics` was not implemented, then passed after
  the internal product-layer transition diagnostic surface and presenter-panel
  evidence were added.
- Artifacts written: `examples/phase4/dogfood-talk.tsx`,
  `examples/phase4/preview.ts`, `examples/phase4/preview.jsx`,
  `packages/core/src/typed-api/primitives.ts`,
  `packages/core/src/compiler/compile.ts`, `packages/core/src/index.ts`,
  `packages/preview-remotion/src/CadenzaPlayer.tsx`,
  `packages/preview-remotion/src/phase4-transitions-progress.test.ts`,
  `trace/phase4/status.yaml`, and `trace/phase4/tracker.md`.
- Behavior: Phase 4 dogfood transitions now use a typed product-layer roster
  through `ProductTransition`, resolving transition durations from theme
  `motion` tokens. Local preview navigation plays transition segments before
  pausing at deterministic semantic anchors.
- Progress evidence: the Phase 4 presenter workflow exposes transition start,
  progress, and settled diagnostics through
  `createPhase4TransitionDiagnostics` and
  `data-cadenza-phase4-transition-*` attributes. `onCursorChange` remains
  semantic and is not converted into a frame-level progress stream.
- Verification: targeted B4.5 tests, `pnpm typecheck`, `pnpm test`,
  `pnpm lint`, and `pnpm format:check` passed before trace update. Final gate
  results are recorded in `trace/phase4/status.yaml`.
- Boundary preserved: no `CONTRACT_FROZEN` spec, Accepted ADR, export,
  hosted-rendering, Remotion Lambda, public-stability, external-alpha,
  WYSIWYG, marketplace, collaboration, or MCP implementation changes. No
  public `onTransitionProgress` hook or callback was added.
- Next batch after maintainer approval:
  `B4.6 / TC-STAR-001 + TC-STAR-002 + TC-STAR-003`.

## 2026-05-24 01:38 +0800 — B4.4 typography auto-fit and density diagnostics

- Startup identity: proceeded as Phase 4 Builder with `GPT-5` / `codex` after
  maintainer approval in this session.
- Scope: completed only `B4.4 / TC-TYPO-001 + TC-TYPO-002` from frozen
  `spec/phase4/SPEC_TEST_MATRIX.md` and
  `spec/phase4/SPEC_TYPOGRAPHY_DENSITY.md`.
- RED/GREEN evidence:
  `pnpm test -- packages/core/src/phase4-typography-density.test.ts` first
  failed because `fitTypographyBox` was not implemented, then passed after
  opt-in deterministic auto-fit metadata and fitting diagnostics were added.
  The same command then failed because `validateTypographyDensity` was not
  implemented, then passed after theme-budget density diagnostics and preview
  workflow exposure were added.
- Artifacts written: `examples/phase4/dogfood-talk.tsx`,
  `examples/phase4/preview.ts`, `examples/phase4/preview.jsx`,
  `packages/core/src/render-safe/resources.ts`,
  `packages/core/src/typed-api/primitives.ts`,
  `packages/core/src/validation/typographyDensity.ts`,
  `packages/core/src/index.ts`,
  `packages/core/src/phase4-typography-density.test.ts`,
  `packages/preview-remotion/src/CadenzaPlayer.tsx`,
  `trace/phase4/status.yaml`, and `trace/phase4/tracker.md`.
- Behavior: `TypographyBox` now carries opt-in auto-fit bounds, core fitting is
  deterministic for a fixed measurement/viewport/font-readiness state, and
  non-fitting content emits an overflow fallback diagnostic instead of
  rewriting authored prose. Theme tokens now carry readable density budgets
  with deterministic defaults, and density diagnostics include locator,
  measured value, category, theme budget, and authored-deck repair direction.
- Product-layer workflow: the dogfood talk uses bounded auto-fit on typography
  boxes; `CadenzaPlayer` exposes auto-fit status, fitted font size,
  line-height, spacing, and overflow fallback as `data-cadenza-*` attributes;
  the Phase 4 same-browser presenter panel exposes density diagnostics through
  `data-cadenza-phase4-typography-density`.
- Verification: targeted B4.4 tests, `pnpm typecheck`, `pnpm test`,
  `pnpm lint`, `pnpm format:check`,
  `pnpm exec markdownlint-cli2 "**/*.md"`, shell formatting check,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed. `pnpm test:browser`
  failed in the default sandbox with Chromium `sandbox_host_linux` permission
  errors, then passed under approved elevated execution (`16/16`).
  `pnpm preview:phase4` failed in the default sandbox with `listen EPERM`;
  elevated rerun built the current preview bundle, then hit `EADDRINUSE`
  because an existing Phase 4 preview server was already bound on 4174; `curl`
  verified `/` and `/phase4-dogfood-preview.js` from that server, including the
  B4.4 data attributes.
- Boundary preserved: no `CONTRACT_FROZEN` spec, Accepted ADR, export,
  hosted-rendering, Remotion Lambda, public-stability, external-alpha,
  WYSIWYG, marketplace, collaboration, or MCP implementation changes.
- Next batch after maintainer approval:
  `B4.5 / TC-TRPR-001 + TC-TRPR-002`.

## 2026-05-24 01:04 +0800 — B4.3 visual acceptance evidence and repair routing

- Startup identity: proceeded as Phase 4 Builder with `GPT-5` / `codex` after
  maintainer approval in this session.
- Scope: completed only
  `B4.3 / TC-VARR-001 + TC-VARR-002 + TC-VARR-003` from frozen
  `spec/phase4/SPEC_TEST_MATRIX.md` and
  `spec/phase4/SPEC_VISUAL_ACCEPTANCE_REPAIR.md`.
- RED/GREEN evidence:
  `pnpm test -- packages/core/src/phase4-visual-acceptance-evidence.test.ts`
  first failed because
  `trace/phase4/evidence/b4.3-visual-acceptance-evidence.json` did not exist,
  then passed after JSON and Markdown evidence plus the validator were added;
  the same command then failed because trace-only evidence was not flagged,
  then passed after `VARR_TRACE_ONLY_DECLARATION` and artifact-only validation
  were added; the same command then failed because package-source repair
  routing was not flagged, then passed after `VARR_PACKAGE_SRC_REPAIR_SCOPE`
  routing validation was added.
- Artifacts written: `examples/phase4/dogfood-talk.tsx`,
  `examples/phase4/preview.ts`, `examples/phase4/preview.jsx`,
  `packages/core/src/validation/visualAcceptanceEvidence.ts`,
  `packages/core/src/index.ts`,
  `packages/core/src/phase4-visual-acceptance-evidence.test.ts`,
  `trace/phase4/evidence/b4.3-visual-acceptance-evidence.json`,
  `trace/phase4/evidence/b4.3-visual-acceptance-evidence.md`,
  `trace/phase4/evidence/b4.3-pixel-sanity-note.json`,
  `trace/phase4/status.yaml`, and `trace/phase4/tracker.md`.
- Behavior: visual findings are now recorded as machine-readable JSON plus a
  concise Markdown summary with category, affected slide/chapter, observed
  problem, intended repair surface, commands/routes, diagnostics, and
  before/after evidence. Trace-only declarations and artifact-only proof remain
  insufficient without real preview, diagnostic, test, sign-off, or waiver
  evidence, and the optional pixel-sanity note is supplemental only.
- Repair routing: the actual repair stays in authored deck and product-layer
  example surfaces by making visual acceptance sign-off or waiver visible in
  the dogfood talk and same-browser presenter panel. Package-source repair
  paths are flagged unless routed as a separate framework defect.
- Verification: targeted B4.3 tests and `pnpm typecheck` passed before trace
  update. Final gate results are recorded in `trace/phase4/status.yaml`.
- Boundary preserved: no `CONTRACT_FROZEN` spec, Accepted ADR, export,
  hosted-rendering, Remotion Lambda, public-stability, external-alpha,
  WYSIWYG, marketplace, collaboration, or MCP implementation changes.
- Next batch after maintainer approval:
  `B4.4 / TC-TYPO-001 + TC-TYPO-002`.

## 2026-05-24 00:33 +0800 — B4.2 same-browser presenter workflow

- Startup identity: proceeded as Phase 4 Builder with `GPT-5` / `codex` after
  maintainer approval in this session.
- Scope: completed only `B4.2 / TC-PRES-001 + TC-PRES-002` from frozen
  `spec/phase4/SPEC_TEST_MATRIX.md` and
  `spec/phase4/SPEC_PRESENTER_WORKFLOW.md`.
- RED/GREEN evidence:
  `pnpm test -- packages/preview-remotion/src/phase4-presenter-workflow.test.ts`
  first failed because `createPhase4PresenterWorkflow` did not exist, then
  passed after presenter context derivation was added; the same command then
  failed because `createPhase4PresenterControls` did not exist, then passed
  after runtime-mediated controls and the same-browser panel were added.
- Artifacts written: `examples/phase4/preview.ts`,
  `examples/phase4/preview.jsx`,
  `packages/preview-remotion/src/CadenzaPlayer.tsx`,
  `packages/preview-remotion/src/phase4-presenter-workflow.test.ts`,
  `trace/phase4/status.yaml`, and `trace/phase4/tracker.md`.
- Behavior: presenter workflow now derives current slide, current step, notes,
  elapsed time, current context, and next context from `CadenzaPlayerSnapshot`
  plus the compiled dogfood timeline; the Phase 4 local preview renders a
  same-browser presenter panel with current/next context, notes, elapsed time,
  outline navigation, chapter navigation, and presenter controls.
- Verification: targeted B4.2 tests, `pnpm typecheck`, `pnpm test`,
  `pnpm lint`, `pnpm format:check`,
  `pnpm exec markdownlint-cli2 "**/*.md"`, `pnpm lint:shell`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed. `pnpm test:browser`
  failed in the default sandbox with Chromium `sandbox_host_linux` permission
  errors, then passed under approved elevated execution (`16/16`).
  `pnpm preview:phase4` failed in the default sandbox with `listen EPERM`, then
  served `http://127.0.0.1:4174/` under approved elevated execution and the
  root page was fetched.
- Boundary preserved: outline and chapter navigation call runtime-mediated
  `goto` targets; next, previous, restart, pause, resume, and toggle route
  through `CadenzaPlayerHandle`; no UI frame math, `CONTRACT_FROZEN` spec,
  Accepted ADR, export, hosted-rendering, Remotion Lambda, public-stability,
  external-alpha, multi-device presenter console, WYSIWYG, marketplace,
  collaboration, or MCP implementation changes.
- Next batch after maintainer approval:
  `B4.3 / TC-VARR-001 + TC-VARR-002 + TC-VARR-003`.

## 2026-05-24 00:14 +0800 — B4.1 dogfood talk and local preview

- Startup identity: proceeded as Phase 4 Builder with `GPT-5` / `codex` after
  maintainer approval in this session.
- Scope: completed only `B4.1 / TC-DOGF-001 + TC-DOGF-002` from frozen
  `spec/phase4/SPEC_TEST_MATRIX.md`.
- RED/GREEN evidence:
  `pnpm test -- packages/core/src/phase4-dogfood-talk.test.ts` first failed
  because `examples/phase4/dogfood-talk.tsx` did not exist, then passed after
  the canonical dogfood talk was added; `pnpm test --
  packages/preview-remotion/src/phase4-dogfood-preview-entrypoint.test.ts`
  first failed because `examples/phase4/preview.ts` did not exist, then passed
  after the local preview entrypoint and command were added.
- Artifacts written: `examples/phase4/dogfood-talk.tsx`,
  `examples/phase4/preview.ts`, `examples/phase4/preview.jsx`,
  `examples/phase4/index.html`, `examples/phase4/serve-preview.mjs`,
  `packages/core/src/phase4-dogfood-talk.test.ts`,
  `packages/preview-remotion/src/phase4-dogfood-preview-entrypoint.test.ts`,
  `package.json`, `trace/phase4/status.yaml`, and
  `trace/phase4/tracker.md`.
- Verification: targeted batch tests, `pnpm typecheck`, `pnpm test`,
  `pnpm lint`, `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`,
  `pnpm lint:shell`, `pnpm spec:lint`, `pnpm phase:check`,
  `pnpm check:harness`, `pnpm check:memory`, and `git diff --check` passed.
  `pnpm preview:phase4` could not bind a local port in the default sandbox
  (`listen EPERM`), then started successfully under approved elevated execution
  at `http://127.0.0.1:4174/` and was stopped after verification.
  `pnpm test:browser` failed in the default sandbox with Chromium
  `sandbox_host_linux` permission errors, then passed under approved elevated
  execution (`16/16`).
- Boundary preserved: no `CONTRACT_FROZEN` specs, Accepted ADRs, package-source
  framework repair, export, hosted-rendering, Remotion Lambda,
  public-stability, external-alpha, WYSIWYG, marketplace, collaboration, or MCP
  implementation changes.
- Next batch after maintainer approval: `B4.2 / TC-PRES-001 + TC-PRES-002`.

## 2026-05-23 23:57 +0800 — Phase 4 Builder routing opened

- Startup identity: proceeded as Phase 4 Builder routing handoff with
  `GPT-5` / `codex` after maintainer approval in this session.
- Scope: opened Phase 4 routing from `STATUS.yaml`,
  `trace/phase3/phase4-architect-handoff.md`, frozen `spec/phase4/`, and
  `prompt/PHASE4_KICK_BUILDER.md`.
- Accepted inputs: Phase 3 is recorded complete in `trace/phase3/status.yaml`;
  Phase 3 Reviewer closeout is accepted; Phase 4 contracts are
  `CONTRACT_FROZEN`; and the Phase 4 Builder kick file names `B4.1 /
  TC-DOGF-001 + TC-DOGF-002` as the first Builder batch.
- Artifacts written: `STATUS.yaml`, `EXECUTION_TRACKER.md`,
  `trace/phase4/status.yaml`, and `trace/phase4/tracker.md`.
- Boundary preserved: no `packages/`, `CONTRACT_FROZEN` specs, Accepted ADRs,
  export, hosted-rendering, Remotion Lambda, public-stability,
  external-alpha, WYSIWYG, marketplace, collaboration, or MCP implementation
  changes.
- Next launch phrase: `请作为 Cadenza Phase 4 Builder，读取 AGENTS.md、STATUS.yaml、trace/phase4/status.yaml、trace/phase4/tracker.md、prompt/PHASE4_KICK_BUILDER.md、spec/phase4/SPEC_TEST_MATRIX.md、spec/phase4/SPEC_TRACEABILITY.md 和 spec/phase4/SPEC_DOGFOOD_TALK.md；加载 cadenza-builder 与 tdd skills；只执行 B4.1 / TC-DOGF-001 + TC-DOGF-002，用严格 RED -> GREEN -> REFACTOR 创建 examples/phase4/ canonical dogfood talk 与 maintainer-facing local Remotion Player preview entrypoint，更新 trace/phase4/ 后停止；不得修改 CONTRACT_FROZEN specs、Accepted ADRs，不得实现 export/hosted rendering/Remotion Lambda/public-stability/external-alpha/MCP，且不要把 Playwright 当作主要预览界面。`
