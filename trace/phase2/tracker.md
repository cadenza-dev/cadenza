# Phase 2 Tracker

## 2026-04-29 06:59 +0800 — B2.6 TC-TRAC-001/TC-TRAC-005 traceability coverage complete

- Startup identity: proceeded as Builder with `GPT-5` / `codex` after
  maintainer approval in this session.
- RED 1: `pnpm test -- scripts/traceability-coverage.test.ts` failed because
  `scripts/traceability-coverage.ts` did not exist.
- GREEN 1: added a non-mutating traceability coverage report API and CLI that
  compares Phase 2 requirement IDs across domain specs, `SPEC_TEST_MATRIX.md`,
  `SPEC_TRACEABILITY.md`, `trace/phase2/status.yaml`, tests, and
  implementation evidence.
- RED 1 follow-up: the same target test then failed because the test-matrix
  parser missed `TC-TRAC-001`; fixed the parser to use exact non-stateful ID
  matching for table row detection.
- RED 2: the TC-TRAC-005 slice failed because the report did not expose
  deferred WIP markers for the active-phase-only hard gate and promoted
  `REV-P1-004` note.
- GREEN 2: extended the report with Stage A/B status evidence, status evidence
  path existence checks, deferred WIP files, and deferred marker excerpts from
  `TODO.md`, `wip/architect/phase1-traceability-coverage.md`, and
  `wip/future-support/`.
- Report artifact: generated
  `trace/phase2/traceability-coverage.md`, which records all 38 Phase 2
  requirements in specs, test matrix, and traceability matrix, identifies
  MP4/PDF/hosted-rendering scenarios as absent by design, and remains
  non-mutating toward frozen Phase 1 specs.
- The report also flags current evidence gaps as non-blocking findings for
  requirements that are mapped in frozen specs but do not yet have
  trace/test/code evidence.
- Verification after batch: `pnpm typecheck`, `pnpm test`, `pnpm lint`,
  `pnpm format:check`, `pnpm test:browser`,
  `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed.
- Browser verification used elevated permissions after the default sandbox
  blocked Chromium launch with `sandbox_host_linux.cc` /
  `Operation not permitted`.
- Scope preserved: no active-phase-only hard gate, frozen Phase 1 spec edit,
  export claim, hosted-rendering claim, Phase 3 AI repair-loop work, frozen
  spec edit, or Accepted ADR edit.
- Next batch: `B2.7 / phase closeout`.

## 2026-04-29 06:38 +0800 — B2.5 TC-RSRM-006/TC-BROW-006 browser validation complete

- Startup identity: proceeded as Builder with `GPT-5` / `codex` after
  maintainer approval in this session.
- RED 1: `pnpm exec playwright test tests/browser/remotion-preview.spec.ts -g
  "TC-RSRM-006"` failed under elevated Chromium because
  `window.CadenzaRemotionPreview.mountControlledValidationPreview()` did not
  exist.
- GREEN 1: added preview-side validation helpers for `TypographyBox`,
  `MediaFrame`, and `ContentSlot`; `CadenzaPlayer` now measures browser layout
  through real DOM nodes, exposes measurement attributes, and pushes structured
  `RSRM-006` / `RSRM-007` diagnostics through the preview diagnostics channel.
- RED 2: `pnpm exec playwright test tests/browser/remotion-preview.spec.ts -g
  "TC-BROW-006"` failed because the preview root did not record `BROW-006`
  coverage evidence.
- GREEN 2: extended the preview root requirement evidence and added a targeted
  Playwright visual sanity check that samples the Remotion Player screenshot
  pixels for nonblank contrast while also checking the 16:9 Player frame. This
  remains a pixel sanity gate, not a broad screenshot-diff oracle.
- Browser fixture: added `mountControlledValidationPreview()` with a compact
  `ContentSlot`, intentionally overflowing `TypographyBox`, and intentionally
  squashed `MediaFrame` so browser-observable measurements and diagnostics are
  deterministic.
- Verification after batch: `pnpm typecheck`, `pnpm test`, `pnpm lint`,
  `pnpm format:check`, `pnpm test:browser`,
  `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed.
- Browser verification used elevated permissions after the default sandbox
  blocked Chromium launch with `sandbox_host_linux.cc` /
  `Operation not permitted`.
- Scope preserved: no screenshot-diff required gate, traceability coverage
  report, export claim, hosted-rendering claim, Phase 3 AI repair-loop work,
  frozen spec edit, or Accepted ADR edit.
- Next batch: `B2.6 / TC-TRAC-001 + TC-TRAC-005`.

## 2026-04-29 06:19 +0800 — B2.4 TC-RSRM-001 render-safe readiness complete

- Startup identity: proceeded as Builder with `GPT-5` / `codex` after
  maintainer approval in this session.
- RED 1: `pnpm test:browser -- tests/browser/remotion-preview.spec.ts`
  first hit the known sandbox Chromium launch failure, then failed under
  elevated Chromium because
  `window.CadenzaRemotionPreview.mountControlledReadinessPreview()` did not
  exist.
- GREEN 1: added registry-backed preview readiness, connected the Cadenza
  runtime to that registry, and exposed browser-observable loading state,
  pending/ready resources, diagnostics, and Remotion preview buffering status
  on `CadenzaPlayer`.
- Render-safe resources: added preview components for `SafeImage`, `SafeFont`,
  and `SafeVideo`. Image readiness follows the browser `load` / `error` path,
  font readiness uses `document.fonts` by default with an explicit manual
  fallback for deterministic tests, and video readiness follows
  `loadedmetadata` / timeout degradation.
- RED 2: the browser image-diagnostic test failed because duplicate image
  errors could record repeated diagnostics and the preview section did not
  observe diagnostic pushes.
- GREEN 2: made the preview readiness registry the single notification source
  for readiness and diagnostics, deduping structured diagnostics by
  code/requirement/source.
- RED 3: the video timeout browser slice stayed in `loading` because the
  controlled harness still used the default long resource timeout.
- GREEN 3: threaded a controlled `resourceTimeoutMs` through the browser
  readiness fixture, proving metadata timeout degradation emits
  `RSAF_RESOURCE_TIMEOUT` and releases preview buffering.
- Verification after batch: `pnpm typecheck`, `pnpm test`, `pnpm lint`,
  `pnpm format:check`, `pnpm test:browser`,
  `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed.
- Browser verification used elevated permissions after the default sandbox
  blocked Chromium launch with `sandbox_host_linux.cc` /
  `Operation not permitted`.
- Scope preserved: no typography/media/content-slot measurement work, nonblank
  visual sanity gate, traceability coverage report, export claim,
  hosted-rendering claim, Phase 3 AI repair-loop work, frozen spec edit, or
  Accepted ADR edit.

## 2026-04-29 05:35 +0800 — B2.3 TC-PRAD-003/004 navigation and frame sync complete

- Startup identity: proceeded as Builder with `GPT-5-family` / `codex` after
  maintainer approval in this session.
- RED 1: `pnpm test -- packages/preview-remotion/src/navigation.test.ts`
  failed because `createCadenzaPreviewController` did not exist.
- GREEN 1: added `navigation.ts` and `frameSync.ts`, adapting Remotion
  `frameupdate` events into the Cadenza runtime and routing `next`,
  `previous`, and `goto` through runtime anchor resolution before touching
  Player frame operations.
- Transition behavior: cross-slide navigation seeks to the frozen
  `TimelineMap` transition segment, calls Player `play()`, then pauses and
  settles at the semantic step anchor when `frameupdate` reaches the target
  frame.
- RED 2: `pnpm test:browser -- tests/browser/remotion-preview.spec.ts`
  first hit the known sandbox Chromium launch failure, then failed under
  elevated Chromium because
  `window.CadenzaRemotionPreview.navigateNext()` did not exist.
- GREEN 2: connected `CadenzaPlayer` to the preview controller, exposed
  controller navigation through the browser harness, and added observable
  cursor, presenter metadata, and Player frame attributes on the mounted
  preview.
- RED 3: the browser test for `TC-PRAD-004` failed because native Player seek
  was not exposed through the harness.
- GREEN 3: added `nativeSeekToFrame()` and `snapshot()` harness paths that call
  the real PlayerRef `seekTo()` while cursor and presenter metadata remain
  synchronized through the `frameupdate` listener.
- Verification after batch: `pnpm typecheck`, `pnpm test`, `pnpm lint`,
  `pnpm format:check`, `pnpm test:browser`,
  `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed.
- Browser verification used elevated permissions after the default sandbox
  blocked Chromium launch with `sandbox_host_linux.cc` /
  `Operation not permitted`.
- Scope preserved: no render-safe readiness buffering, visual sanity screenshot
  gate, diagnostics channel, traceability coverage report, export claim,
  hosted-rendering claim, Phase 3 AI repair-loop work, frozen spec edit, or
  Accepted ADR edit.

## 2026-04-29 05:05 +0800 — B2.2 TC-PRAD-001 minimal real Player mount complete

- Startup identity: proceeded as Builder with `GPT-5` / `codex` after
  maintainer approval in this session.
- RED: `pnpm test:browser -- tests/browser/remotion-preview.spec.ts` first hit
  the known sandbox Chromium launch failure, then failed under elevated
  Chromium because `window.CadenzaRemotionPreview.mountAllDomainMvpPreview` did
  not exist.
- GREEN: added a real `CadenzaPlayer` preview surface backed by
  `@remotion/player`, rendering the Phase 1 all-domain fixture through a React
  tree and exposing observable typed API content, render-safe resource
  declarations, and presenter notes.
- Player props now flow through `createCadenzaPreviewMount` /
  `playerProps.ts`: `durationInFrames` and `fps` come from the compiled
  `TimelineMap`, while `compositionWidth` and `compositionHeight` come from
  preview configuration.
- Browser harness: extended `tests/browser/cadenza-browser-entry.ts` with
  `CadenzaRemotionPreview.mountAllDomainMvpPreview()` and added
  `tests/browser/remotion-preview.spec.ts` for `PRAD-001`, `PRAD-002`,
  `BROW-001`, and `BROW-002`.
- Added root React type packages required by the new typed React/Remotion
  surface; preview runtime dependencies remain on the preview package peer
  boundary.
- Verification after batch: `pnpm typecheck`, `pnpm test`, `pnpm lint`,
  `pnpm format:check`, `pnpm test:browser`,
  `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed.
- Browser verification used elevated permissions after the default sandbox
  blocked Chromium launch with `sandbox_host_linux.cc` /
  `Operation not permitted`.
- Scope preserved: no navigation/frame-sync behavior, render-safe buffering,
  visual sanity screenshot gate, export claim, hosted-rendering claim, Phase 3
  AI repair-loop work, frozen spec edit, or Accepted ADR edit.

## 2026-04-29 04:41 +0800 — B2.1 CI markdownlint repair

- Trigger: pushed B2.1 commit `e7e7e85` failed the GitHub Actions `Markdown
  lint` job in run `25076322032`.
- CI evidence: `gh run view 25076322032 --job 73469834246 --log` showed
  markdownlint scanning `packages/preview-remotion/node_modules/react-dom` and
  `packages/preview-remotion/node_modules/remotion` README files after
  `pnpm install --frozen-lockfile` created nested workspace dependency links.
- Local reproduction: `pnpm install --frozen-lockfile` followed by
  `pnpm exec markdownlint-cli2 "**/*.md"` reproduced the same 27 errors.
- Fix: updated `.markdownlint-cli2.jsonc` to ignore `**/node_modules/**`, so
  markdownlint excludes dependency markdown at any workspace package depth.
- Scope preserved: no package boundary, production code, frozen spec, or
  Accepted ADR change.

## 2026-04-29 04:10 +0800 — B2.1 TC-PKG-001 package boundary complete

- Startup identity: proceeded as Builder with `GPT-5-family` / `codex` after
  maintainer approval in this session.
- RED: `pnpm test -- packages/preview-remotion/src/package-boundary.test.ts`
  failed because a separate preview workspace package could not resolve public
  Cadenza package imports yet.
- GREEN: added the dedicated `@cadenza-dev/preview-remotion` workspace package
  with a small typed `createCadenzaPreviewMount` public API and a workspace
  dependency on `@cadenza-dev/core`.
- Placed `react`, `react-dom`, `remotion`, and `@remotion/player` on the
  preview package peer boundary while keeping `@cadenza-dev/core` free of a
  hard `@remotion/player` dependency.
- Added the test-supported public core fixture subpath
  `@cadenza-dev/core/fixtures/allDomainMvp` so Phase 2 tests consume the
  inherited all-domain fixture without duplicating it.
- Added TypeScript/Vitest local package aliases so tests exercise package entry
  points, not private source imports.
- Verification after batch: `pnpm install --lockfile-only`, `pnpm typecheck`,
  `pnpm test`, `pnpm lint`, `pnpm format:check`,
  `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed.
- Browser verification: `pnpm test:browser` passed with elevated permissions
  after the default sandbox blocked Chromium launch with
  `sandbox_host_linux.cc` / `Operation not permitted`.
- Scope preserved: no real Remotion Player mount, MP4/PDF export, hosted
  rendering, external alpha claim, public API stability claim, Phase 3 AI
  repair-loop work, or frozen spec/Accepted ADR edit.

## 2026-04-29 03:49 +0800 — Phase 2 contracts frozen for Builder

- Maintainer explicitly authorized freezing the Phase 2 contracts.
- Updated all `spec/phase2/SPEC_*.md` files from `CONTRACT_DRAFT` / Stage A to
  `CONTRACT_FROZEN` / Stage B.
- Added `prompt/PHASE2_KICK_BUILDER.md` routing Builder from the frozen
  `SPEC_TEST_MATRIX.md`, starting with `B2.1 / TC-PKG-001`.
- Updated `STATUS.yaml` and `trace/phase2/status.yaml` to record
  `builder_ready` without changing `STATUS.yaml.current_phase`.
- Updated `scripts/phase-check.ts` so the Phase 2 checker accepts the
  `builder_ready` milestone and verifies frozen Phase 2 specs plus the Builder
  kick file.
- Scope boundary preserved: no production code, Accepted ADRs, frozen Phase 1
  specs, export claims, hosted-rendering claims, or phase pointer changes.
- Verification after freeze: `pnpm typecheck`, `pnpm test`, `pnpm lint`,
  `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed.

## 2026-04-29 03:41 +0800 — Stage A decisions accepted, freeze pending

- Maintainer accepted all Phase 2 Stage A recommendation choices.
- Updated Stage A specs to record approved decisions for package shape,
  transition playback, Player frame sync, render-safe readiness bridge, font
  readiness, browser visual evidence depth, and traceability coverage level.
- Preserved `CONTRACT_DRAFT` status because the maintainer has approved the
  decisions but has not yet explicitly authorized flipping the Phase 2 specs to
  `CONTRACT_FROZEN`.
- Added a `TODO.md` governance follow-up: after the first Phase 2 Builder slice,
  review whether the `REV-P1-004` non-mutating coverage report should become an
  active-phase-only hard gate.
- Marked `wip/architect/phase1-traceability-coverage.md` as promoted into the
  Phase 2 draft contract.
- Verification after decision update: `pnpm typecheck`, `pnpm test`,
  `pnpm lint`, `pnpm format:check`,
  `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed.

## 2026-04-29 03:02 +0800 — Stage A preview adapter drafts opened

- Startup identity: proceeded as Architect with `GPT-5-family` / `codex` after
  maintainer approval in this session.
- Pre-flight confirmed `STATUS.yaml`, `EXECUTION_TRACKER.md`, `ROADMAP.md`, and
  `trace/phase2/status.yaml` all name Phase 2 as **React + Remotion Preview
  Adapter** with `architect_stage_a_open`.
- Phase 1 closeout evidence confirmed: Builder closeout complete,
  `REV-P1-001` through `REV-P1-003` accepted after remediation, and
  `REV-P1-004` intentionally routed to Architect governance follow-up.
- Created Stage A `CONTRACT_DRAFT` specs under `spec/phase2/` for package
  boundary, preview adapter, render-safe Remotion behavior, browser validation,
  traceability coverage, test matrix, and traceability mapping.
- Key Freeze Candidates opened: package shape, transition playback policy,
  Player frame event source, readiness bridge mechanism, font readiness source,
  browser visual evidence depth, and traceability coverage enforcement level.
- Scope boundary preserved: no `packages/**/src/**`, frozen Phase 1 specs,
  Accepted ADRs, export claims, hosted-rendering claims, or root phase pointer
  changes.
- Verification after drafting: `pnpm typecheck`, `pnpm test`, `pnpm lint`,
  `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed.

## 2026-04-29 02:47 +0800 — Phase status scaffold corrected

- Trigger: maintainer noticed that the initial `trace/phase2/status.yaml`
  pre-filled future Architect-stage details before Stage A/B artifacts existed.
- Scope: shrank `trace/phase2/status.yaml` back to a minimal recovery scaffold:
  phase identity, handoff routing, verified entry conditions, and an explicit
  note that detailed stage status waits for accepted Architect artifacts.
- Workflow rule: updated `trace/README.md`, `docs/agentic-workflow.md`, and the
  `cadenza-wizard` skill so future phase-open status files do not pre-commit
  to spec names, exit criteria, Builder batches, or implementation evidence.
- Memory: recorded maintainer-approved lesson
  `MEM-20260429-minimal-phase-status-scaffold` under `memory/lessons/human/`.

## 2026-04-29 02:22 +0800 — Phase 2 opened for Architect

- Startup identity: proceeded as Architect with `GPT-5-family` / `codex` after
  maintainer approval in this session.
- Maintainer approved Phase 1 closeout after Builder trace completion, selected
  Reviewer remediation acceptance, and Wizard Phase 2 handoff preparation.
- Opened Phase 2 root routing as **React + Remotion Preview Adapter**.
- Initial Architect entrypoint:
  `prompt/PHASE2_KICK_ARCHITECT.md`.
- Stage A is not drafted yet. The next Architect session should confirm the
  Phase 2 pre-flight, read the handoff artifacts named by the kick file, then
  draft `spec/phase2/` Stage A contracts with `CONTRACT_DRAFT` markers.
- Verification after opening: `pnpm typecheck`, `pnpm test`, `pnpm lint`,
  `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check` passed.
