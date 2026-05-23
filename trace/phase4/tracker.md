# Phase 4 Tracker

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
