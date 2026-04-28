# Phase 2 Tracker

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
