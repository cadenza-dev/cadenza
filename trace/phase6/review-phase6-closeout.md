# Phase 6 Reviewer Closeout

## Scope

This read-only review covers the completed Phase 6 Builder batches B6.1 through
B6.6 against the frozen Phase 6 contracts, ADR 0016, Phase 6 tests, relevant
implementation files, trace evidence, and the latest hosted CI state.

Reviewer did not remediate implementation findings.

## CI Evidence

- Latest hosted CI checked before review: GitHub Actions `CI` run
  `26671149608`.
- Commit: `9e04ee9994f9ee60cb7065c54f29e62876d32f29`.
- Display title: `Close out Phase 6 Builder batches`.
- Result: `completed` / `success`.
- Jobs observed as successful included TypeScript checks, Vitest tests, Biome
  lint/format, governance checks, Markdown lint, shell format check,
  whitespace check, CI summary, and browser preview jobs on Ubuntu, Windows,
  and macOS.

## Findings

REV-P6-001 [high] Deck module contract only implements factory, not exported deck value
Evidence: `spec/phase6/SPEC_DECK_LOADING.md` requires the public deck module
contract to allow "a deck factory or exported deck value"; `SPEC_TEST_MATRIX.md`
also records `FC-DLOD-02` as "deck metadata plus authored deck factory or deck
value". `packages/export-local/src/deckLoader.ts` only accepts
`createCadenzaDeck()` and emits `DLOD_MISSING_CREATE_DECK` when that function is
absent. `packages/export-local/src/deck-loading.test.ts` hard-codes the
contract exports as `cadenzaDeckMetadata` plus `createCadenzaDeck`.
Why it matters: A deck module that follows the frozen contract by exporting a
deck value instead of a factory would fail even though the contract presents it
as valid. This narrows P0 `DLOD-001` and `FC-DLOD-02` without an approved
contract override.
Recommended remediation: Add a failing fixture for metadata plus an exported
deck value, then support that shape alongside `createCadenzaDeck`. The
implementation should use an explicit stable export name such as `cadenzaDeck`
and define deterministic behavior when both factory and value exports are
present.
Verification path: Run
`pnpm exec vitest run packages/export-local/src/deck-loading.test.ts tests/acceptance/phase6-export-validate-inspect.test.ts`,
then the full Phase 6 verification gates.
Recommended owner: builder-remediation

REV-P6-002 [high] MP4 renderer diagnostics collapse required adapter stages
Evidence: `spec/phase6/SPEC_DIAGNOSTICS.md` requires MP4 diagnostics to
classify failures by adapter stage: prerequisite detection, bundle or
composition preparation, renderer invocation, codec or media tool failure,
output write failure, cancellation, cleanup failure, and unexpected internal
failure. `spec/phase6/SPEC_LOCAL_MP4_RENDERING.md` requires renderer
diagnostics to preserve the failed adapter-facing stage. In
`packages/export-local/src/mp4Renderer.ts`, `bundle()`, `selectComposition()`,
`renderMedia()`, and `getVideoMetadata()` run under one broad `try`, and
non-browser failures map to the generic `VIDO_RENDERER_FAILURE`. Cleanup
failure only returns `cleanup.status = "failed"` without a diagnostic or
limitation. The B6.4 acceptance coverage exercises missing browser evidence but
does not cover the other required renderer stages.
Why it matters: Real local render failures are not machine-routable to the
contract-required repair categories. This weakens P0 `VIDO-004`, `VIDO-007`,
`VIDO-008`, and `CDIA-009`, especially for agent-driven repair or waiver
decisions.
Recommended remediation: Split the renderer pipeline into explicit diagnostic
stages and emit stable diagnostic codes such as `VIDO_BUNDLE_FAILED`,
`VIDO_COMPOSITION_FAILED`, `VIDO_RENDER_INVOCATION_FAILED`,
`VIDO_CONTAINER_METADATA_FAILED`, and `VIDO_CLEANUP_FAILED`. If useful, add a
stable stage field in addition to stage-specific codes. Add fixtures or
injection seams that exercise representative non-browser failures and cleanup
failure reporting.
Verification path: Expand
`tests/acceptance/phase6-mp4-rendering.test.ts`, then run the MP4 acceptance
test and the full Phase 6 verification gates.
Recommended owner: builder-remediation

REV-P6-003 [medium] README Remotion dependency posture is stale after Phase 6 package split
Evidence: `README.md` says Cadenza does not redistribute Remotion and "depends
on it as a peer dependency". ADR 0016 says `@cadenza-dev/export-local` owns
local renderer adapters. `spec/phase6/SPEC_DEPENDENCY_BOUNDARY.md` requires
Remotion renderer and bundler dependencies to live in `@cadenza-dev/export-local`
or an explicit adapter package outside core and CLI. The actual
`packages/export-local/package.json` declares direct dependencies on
`@remotion/bundler`, `@remotion/renderer`, `remotion`, `react`, and
`react-dom`.
Why it matters: The public licensing and package posture note no longer
matches the Phase 6 topology. The package is still private and local-only, but
the README now conflates the preview peer dependency boundary with
export-local's direct local renderer dependencies.
Recommended remediation: Update README to distinguish preview adapter peer
dependencies from Phase 6 export-local renderer dependencies, while preserving
the Remotion licensing warning. Add a clean-checkout documentation assertion so
the README does not drift back to a blanket peer dependency claim.
Verification path: Run
`pnpm exec vitest run tests/acceptance/phase6-clean-checkout-docs.test.ts`,
Markdown lint, and the full Phase 6 verification gates.
Recommended owner: builder-remediation

## Open Questions

None blocking remediation. For REV-P6-001, Builder should choose a stable deck
value export name during remediation and keep the behavior deterministic when a
module exports both factory and value shapes.

## Residual Risk

The review did not rerun local export-generating tests because Reviewer work is
read-only by default. Findings were based on the latest green hosted CI,
frozen specs, ADR 0016, trace files, tests, and implementation source.

## Maintainer Selection

The maintainer selected all findings for Builder remediation:

- `REV-P6-001`
- `REV-P6-002`
- `REV-P6-003`

## Suggested Builder Remediation Launch Phrase

```text
请作为 Cadenza Builder remediation，读取 trace/phase6/review-phase6-closeout.md，只处理 maintainer-selected findings: REV-P6-001, REV-P6-002, REV-P6-003；不得扩大 scope，不修改 CONTRACT_FROZEN specs 或 Accepted ADRs；用 TDD 修复并更新 trace 后停止。
```

## Reviewer Recheck of Commit `ba1fea8`

Reviewer rechecked only commit `ba1fea8a6b669593eb13f59b2b437321f3da5d53`
against the maintainer-selected remediation findings `REV-P6-001`,
`REV-P6-002`, and `REV-P6-003`.

Hosted CI evidence:

- GitHub Actions `CI` run `26683367869`.
- Head SHA: `ba1fea8a6b669593eb13f59b2b437321f3da5d53`.
- Display title: `Remediate Phase 6 reviewer findings`.
- Result: `completed` / `success`.
- Jobs observed as successful included cross-platform TypeScript/Vitest,
  Biome lint/format, governance checks, Markdown lint, shell format check,
  whitespace check, browser preview, and CI summary.

Recheck outcome:

- `REV-P6-001`: accepted. `cadenzaDeck` is supported beside
  `createCadenzaDeck()`, factory export wins deterministically when both are
  present, and `contractExports` records actual stable export names.
- `REV-P6-003`: accepted. README now distinguishes preview adapter peer
  dependencies from Phase 6 `@cadenza-dev/export-local` direct local renderer
  dependencies, with a docs guard against the stale blanket peer-dependency
  claim.
- `REV-P6-002`: not accepted. Commit `ba1fea8` splits several renderer stages,
  but the frozen contracts still require independently routable diagnostics
  for codec or media tool failure, output write failure, and cancellation.
  Those stages are not represented in the stage taxonomy or focused tests.

### Follow-up Finding

REV-P6-002-R1 [high] MP4 renderer stage pipeline still misses required failure routes
Evidence: `spec/phase6/SPEC_DIAGNOSTICS.md` requires MP4 diagnostics to
classify adapter stages including codec or media tool failure, output write
failure, and cancellation. `spec/phase6/SPEC_LOCAL_MP4_RENDERING.md` requires
cleanup on success, failure, and cancellation, with cancellation cleanup
verification. Commit `ba1fea8` adds stages for prerequisite detection, bundle,
composition, renderer invocation, container metadata, cleanup, and unexpected
internal failure, but `renderMedia()` failures remain collapsed under
`VIDO_RENDER_INVOCATION_FAILED` and the focused test only covers bundle plus
cleanup failure.
Why it matters: Agent-routable remediation still cannot distinguish the full
set of frozen adapter-stage failures. This leaves `CDIA-009`, `VIDO-007`, and
`VIDO-008` only partially remediated.
Recommended owner: builder-remediation

### Maintainer-Selected Follow-up Approach

The maintainer selected an internal pipeline refactor for `REV-P6-002-R1`.
This is feasible if kept narrowly scoped:

- Keep `renderLocalMp4()` as the public entrypoint and avoid changing CLI
  public behavior.
- Refactor only the internal `@cadenza-dev/export-local` MP4 renderer pipeline.
- Introduce package-private pipeline dependencies or step functions for
  entrypoint write, bundle, composition selection, media render, container
  metadata, cancellation handling, and cleanup.
- Make each stage return or throw typed stage diagnostics rather than relying
  on broad catch-all mapping.
- Add focused tests that inject representative failures for bundle,
  composition, renderer invocation, codec or media tooling, output write,
  cancellation, and cleanup failure evidence.
- Preserve boundaries: no `CONTRACT_FROZEN` spec edits, Accepted ADR edits,
  new renderer backend, plugin system, hosted rendering, Player App path,
  PDF/PPTX, release, or npm publication work.

Tradeoffs:

- Pros: clearer stage boundaries, stronger tests, lower future review
  ambiguity, and less dependence on real Remotion/Chrome/ffmpeg failures to
  exercise diagnostics.
- Cons: larger than a string/code-only patch, so it needs strict scope control
  and full verification after touching the MP4 renderer path.

## Follow-up Builder Remediation Launch Phrase

```text
请作为 Cadenza Builder remediation，读取 trace/phase6/review-phase6-closeout.md，只处理 REV-P6-002-R1；采用收束版方案 2：仅重构 @cadenza-dev/export-local 内部 MP4 renderer pipeline 以补齐 codec/media tool、output write、cancellation、cleanup 等 stage diagnostics 与测试；不得修改 CONTRACT_FROZEN specs、Accepted ADRs 或 CLI public surface；用 TDD 修复并更新 trace 后停止。
```

## Memory Candidate

When Reviewer emits a Builder remediation launch phrase that references a
reviewer report path, the report must already exist or the Reviewer must first
ask the maintainer for approval to write it.
