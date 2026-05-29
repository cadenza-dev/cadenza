---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 Test Matrix

## Purpose

This Stage A draft maps Phase 6 requirements to acceptance scenarios Builder
will consume after Stage B freeze. The matrix is intentionally draft: scenarios
and batch boundaries may change when Freeze Candidates are resolved.

## Builder Batch Shape

The Stage A batch shape should keep vertical slices small:

1. CLI/export-local package topology, help/version, and deck loading.
2. Export engine manifest, artifact layout, and diagnostics.
3. Static web compatibility and browser evidence.
4. Real local MP4 rendering and renderer/dependency boundary.
5. Clean-checkout documentation and overclaim guards.

## Acceptance Scenarios

| Test ID | Priority | Requirement IDs | Scenario |
| :--- | :--- | :--- | :--- |
| TC-CLIS-001 | P0 | CLIS-001, CLIS-005 | The documented local CLI entrypoint is discoverable from a clean checkout and emits deterministic help/version output without hosted or publication claims. |
| TC-CLIS-002 | P0 | CLIS-002, EXEN-001, EXEN-002 | `cadenza export` accepts a deck selector, output controls, and web/MP4 format selection, then returns a manifest path and generated output directory. |
| TC-CLIS-003 | P0 | CLIS-003, VINS-001, VINS-002, CDIA-005 | `cadenza validate` loads a valid and invalid deck, reports concise diagnostics, derives compile/timeline evidence, and does not create export deliverables by default. |
| TC-CLIS-004 | P0 | CLIS-004, VINS-003, VINS-004, EXEN-002, CDIA-001 | `cadenza inspect` reads an existing manifest or artifact directory, summarizes evidence, stays artifact-only, and fails predictably for malformed manifests. |
| TC-CLIS-005 | P0 | CLIS-006, DBND-007 | Public commands are discoverable through a typed command registry, implemented by command adapter modules, and testable without export-local process-global behavior. |
| TC-CLIS-006 | P0 | CLIS-007, CDIA-006 | `--json` emits valid stable JSON on stdout for successful and failing commands without ANSI, progress bars, spinners, or human prose. |
| TC-CLIS-007 | P0 | CLIS-008, CDIA-002 | Non-TTY, CI, and agent-style command runs never wait for prompts and require explicit confirmation flags for overwrite or destructive generated-output behavior. |
| TC-DLOD-001 | P0 | DLOD-001, DLOD-008 | The canonical Phase 5 talk is loadable through the Phase 6 deck module contract without Phase 5 fixture-shaped exports, precompiled manifests, or exported timelines. |
| TC-DLOD-002 | P0 | DLOD-002, DLOD-004, DLOD-006, VIDO-002, CNFG-002, CNFG-003 | Built-in example aliases, config-defined aliases, config-default selection, and direct local module paths resolve through the same loader and clean up temporary bundles. |
| TC-DLOD-003 | P0 | DLOD-003, CDIA-001, CDIA-002 | Invalid selectors, missing deck exports, invalid metadata, and compile failures map to structured diagnostics and deterministic exit codes. |
| TC-DLOD-004 | P0 | DLOD-006 | Selector precedence fixtures prove explicit CLI intent, project config aliases, built-in aliases, alias shadowing, and unknown selector diagnostics. |
| TC-DLOD-005 | P0 | DLOD-007, CNFG-007, EXEN-007 | The same deck loaded by config alias, built-in alias, and direct path keeps one canonical deck identity while manifest evidence records selector provenance separately. |
| TC-VINS-001 | P0 | VINS-001, CNFG-002, CNFG-003, DLOD-006 | `cadenza validate` resolves selectors through built-in aliases, config aliases, config default selection, and direct local module paths using the export loader path. |
| TC-VINS-002 | P0 | VINS-002, VINS-006, CDIA-008 | `cadenza validate` validates metadata, compile, and timeline derivation for passing and failing decks, supports `--json`, and writes no export deliverables by default. |
| TC-VINS-003 | P0 | VINS-003, VINS-004 | `cadenza inspect` summarizes manifest, per-format evidence, diagnostics, limitations, and artifact inventory by manifest path and artifact directory without loading or compiling deck source. |
| TC-VINS-004 | P0 | VINS-005, VINS-006, EXEN-008, CDIA-008 | `cadenza inspect` uses the shared export-local reader and fails predictably for missing manifests, malformed JSON, unsupported schema versions, missing evidence, and non-Cadenza artifact directories. |
| TC-EXEN-001 | P0 | EXEN-001, EXEN-002, EXEN-007, CNFG-001, CNFG-003 | Export runs write generated outputs under default, config-defined, and CLI-defined output roots and emit the required manifest fields, per-format evidence references, and stable hash for web and MP4. |
| TC-EXEN-002 | P0 | EXEN-003, EXEN-009 | Repeated exports preserve stable deterministic fields and stable hash while declaring volatile fields that may vary by run or machine. |
| TC-EXEN-003 | P0 | EXEN-004, EXEN-005, EXEN-006, EXEN-008, WEBC-006 | Format evidence records web and MP4 capability, diagnostics, limitations, artifact metadata, registry-owned artifact names, shared reader compatibility, and future reusable concepts without blanket parity claims. |
| TC-EXEN-004 | P0 | EXEN-009 | Stable hash excludes artifact bytes and volatile fields, stays equal across output roots and selector aliases for deterministic inputs, and changes when canonical identity, timeline digest, formats, relevant config defaults, or capability declarations change. |
| TC-EXEN-005 | P0 | EXEN-010 | Manifest and per-format evidence files declare schema versions, and unsupported schema versions fail through the shared reader diagnostic path. |
| TC-CNFG-001 | P0 | CNFG-001, EXEN-006 | The typed path/config registry owns output root defaults, manifest and evidence filenames, renderer temp routing, default formats, and generated-output safety defaults. |
| TC-CNFG-002 | P0 | CNFG-002, CNFG-007 | Commands work without config, then load a minimal project-root `cadenza.config.ts` with deck aliases, output root, and default formats. |
| TC-CNFG-003 | P0 | CNFG-003 | CLI flags override config values, and config values override registry defaults for deck selector, output root, and format selection. |
| TC-CNFG-004 | P0 | CNFG-004 | Unknown stable config keys and invalid value shapes fail fast with structured diagnostics and repair hints. |
| TC-CNFG-005 | P0 | CNFG-005, CLIS-008 | Generated-output safety rejects unknown existing output directories without `--force`, preserves regenerate-owned output behavior, and never prompts in non-TTY runs. |
| TC-WEBC-001 | P0 | WEBC-001, WEBC-002, WEBC-005, WEBC-006 | Static web compatibility export writes an inspectable entrypoint, manifest reference, semantic anchors, adapter-facing artifact inventory, and compatibility limitation evidence. |
| TC-WEBC-002 | P0 | WEBC-003, WEBC-004, WEBC-007 | Browser-only web compatibility checks live under `tests/browser/` and verify semantic browser evidence through the compatibility adapter boundary without requiring pixel comparison as the primary oracle. |
| TC-VIDO-001 | P0 | VIDO-001, VIDO-002, VIDO-006 | Local MP4 export renders the canonical deck through the renderer adapter and rejects embedded or pre-recorded smoke artifacts. |
| TC-VIDO-002 | P0 | VIDO-003, VIDO-005, VIDO-007, EXEN-004 | MP4 evidence records renderer provenance, artifact metadata, prerequisites, limitations, and absence of hosted/cloud prerequisites. |
| TC-VIDO-003 | P0 | VIDO-006, VIDO-009, DBND-004 | Renderer adapter tests verify stable adapter inputs/outputs, implementation-family provenance, and JSON output separation without asserting direct API versus subprocess internals. |
| TC-VIDO-004 | P0 | VIDO-007, VIDO-008, CDIA-009 | MP4 prerequisite, failure, cancellation, and cleanup fixtures produce structured diagnostics, failure evidence, and no partial success claims. |
| TC-DBND-001 | P0 | DBND-001, DBND-002 | Renderer, bundler, CLI, filesystem, and export-writer dependencies stay outside `@cadenza-dev/core`. |
| TC-DBND-002 | P0 | DBND-003, DBND-004 | MP4 rendering uses the export renderer adapter rather than preview UI internals or Player App shell code. |
| TC-DBND-003 | P0 | CLIS-001, DBND-006 | The generic CLI/export implementation is split across `@cadenza-dev/cli` and `@cadenza-dev/export-local`, while any root script remains only a thin wrapper. |
| TC-DBND-004 | P0 | DBND-002, DBND-007 | Remotion renderer/bundler dependencies and export workflow imports stay in `@cadenza-dev/export-local` or an explicit adapter package, not in `@cadenza-dev/cli` or `@cadenza-dev/core`. |
| TC-DBND-005 | P0 | DBND-008 | Remotion renderer APIs, Remotion CLI subprocesses, browser automation, media tooling, temporary renderer directories, and raw renderer logs stay behind the export-local renderer adapter boundary. |
| TC-CDIA-001 | P0 | CDIA-001, CDIA-003 | Successful and failed commands emit structured diagnostic records and failure evidence without partial success claims. |
| TC-CDIA-002 | P0 | CDIA-002, CDIA-004, VIDO-004 | CLI failure fixtures map to deterministic exit codes and repair-routing categories. |
| TC-CDIA-003 | P0 | CDIA-007 | Cleanup and finalization paths preserve failure exit codes instead of masking failures with a successful process exit. |
| TC-CDOC-001 | P0 | DLOD-005, CNFG-006, CDOC-001, CDOC-002, CDOC-004, CDOC-006, CDOC-007, CDOC-008, CDOC-009 | Clean-checkout docs cover install, validate, inspect, web export, MP4 export, prerequisites, trusted local deck modules and config, machine output, non-interactive behavior, minimal config examples, expected evidence fields, and static web compatibility limits. |
| TC-CDOC-002 | P0 | DBND-005, CDOC-003, CDOC-005, CDOC-008, CDOC-009, CDOC-010 | Docs and evidence avoid prohibited release/hosted/format/Player App claims, avoid generated transcript requirements as a Phase 6 docs contract, and document generated evidence ownership. |

## Stage A Freeze Candidates

- `FC-CLIS-01`: CLI topology, with split `@cadenza-dev/cli` plus
  `@cadenza-dev/export-local` selected as the Stage A recommendation.
- `FC-CLIS-02`: whether `inspect` is required in Phase 6.
- `FC-CLIS-03`: first machine-readable CLI output contract.
- `FC-CLIS-04`: non-interactive CLI behavior.
- `FC-DLOD-01`: deck selector contract.
- `FC-DLOD-02`: deck module export contract.
- `FC-DLOD-03`: local-code trust boundary.
- `FC-DLOD-04`: selector precedence.
- `FC-DLOD-05`: canonical deck identity source.
- `FC-CNFG-01`: whether Phase 6 introduces minimal `cadenza.config.ts`.
- `FC-CNFG-02`: initial config key surface.
- `FC-CNFG-03`: CLI/config/default precedence order.
- `FC-CNFG-04`: whether config aliases can override deck identity.
- `FC-VINS-01`: validate scope.
- `FC-VINS-02`: inspect scope.
- `FC-VINS-03`: manifest/evidence reader ownership.
- `FC-EXEN-01`: manifest-only versus per-format evidence.
- `FC-EXEN-02`: default generated output root.
- `FC-EXEN-03`: stable hash scope.
- `FC-EXEN-04`: export path registry ownership.
- `FC-EXEN-05`: manifest and evidence schema-version ownership.
- `FC-WEBC-01`: static web compatibility adapter posture.
- `FC-WEBC-02`: browser evidence depth.
- `FC-WEBC-03`: web compatibility adapter boundary versus Phase 5 helper
  names.
- `FC-VIDO-01`: renderer invocation boundary.
- `FC-VIDO-02`: MP4 support scope.
- `FC-VIDO-03`: MP4 evidence strength.
- `FC-VIDO-04`: local rendering prerequisites and cleanup.
- `FC-DBND-01`: renderer and bundler dependency placement.
- `FC-DBND-02`: package topology, with monolithic `scripts/cadenza.ts`
  rejected and split CLI/export-local selected as the Stage A recommendation.
- `FC-DBND-03`: adapter implementation strategy as private provenance.
- `FC-CDIA-01`: diagnostic transport.
- `FC-CDIA-02`: exit-code granularity.
- `FC-CDIA-03`: repair-routing API boundary.
- `FC-CDOC-01`: documentation shape.
- `FC-CDOC-02`: generated command evidence in docs.
- `FC-CDOC-03`: documentation and evidence overclaim guard mechanism.

## WIP Deferrals

Stage A candidates that are intentionally not recommended for Phase 6 are
tracked in `wip/future-support/phase-7-plus-cli-diagnostics-candidates.md`.
These notes are not contracts and must be promoted through a future Architect
pass before Builder treats them as requirements.

Broader config candidates are tracked in
`wip/future-support/phase-7-plus-config-candidates.md` for future Player App,
hosted, plugin, interactive, and migration work.

Broader deck-loading candidates are tracked in
`wip/future-support/phase-7-plus-deck-loading-candidates.md` for future
identity inference, config-owned identity, precompiled deck manifests, and
sandboxing work.

Broader validate/inspect candidates are tracked in
`wip/future-support/phase-7-plus-validate-inspect-candidates.md` for future
source-aware inspection, renderer preflight, and richer export diffing.

Broader export-evidence candidates are tracked in
`wip/future-support/phase-7-plus-export-evidence-candidates.md` for future
event logs, byte-level artifact hashing, signed provenance, and richer export
comparison.

Broader renderer candidates are tracked in
`wip/future-support/phase-7-plus-renderer-candidates.md` for future direct API
contracts, subprocess contracts, hosted rendering, stronger media validation,
and pixel-level parity.

Broader web export candidates are tracked in
`wip/future-support/phase-7-plus-web-export-candidates.md` for future Player
App web export, app bundling, richer offline assets, hosted sharing, and
stronger visual evidence.

## Explicit Non-Scenarios

The following are not Phase 6 acceptance scenarios unless a later approved ADR
and frozen spec supersede this draft:

- Cadenza Player App product shell.
- App-based web bundler or polished Player App export.
- Hosted rendering, Remotion Lambda production path, cloud queue, accounts,
  credentials, billing, cost system, or SaaS implementation.
- PDF, PPTX, cross-format IR, import/export parity, or editor work.
- Visual editor or structured editing surface.
- Template marketplace, collaboration, comments, SSO, or enterprise accounts.
- Alpha announcement, public release claim, npm publication, release tag, or
  external launch.
- Tool-based MCP or read-only MCP implementation.
