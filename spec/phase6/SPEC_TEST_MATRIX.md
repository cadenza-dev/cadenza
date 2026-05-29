---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 Test Matrix

## Purpose

This Stage A draft maps Phase 6 requirements to acceptance scenarios Builder
will consume after Stage B freeze. The matrix is intentionally draft: scenarios
and batch boundaries may change during Stage B wording cleanup or freeze
review.

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

## Resolved Stage A Decision Summary

- `FC-CLIS-01`: CLI topology, with split `@cadenza-dev/cli` plus
  `@cadenza-dev/export-local`.
- `FC-CLIS-02`: artifact-only `inspect` is required in Phase 6.
- `FC-CLIS-03`: human output by default plus stable `--json` summaries.
- `FC-CLIS-04`: TTY-friendly defaults with no prompts in non-TTY contexts.
- `FC-DLOD-01`: built-in aliases, direct paths, and minimal config aliases.
- `FC-DLOD-02`: deck metadata plus authored deck factory or deck value.
- `FC-DLOD-03`: trusted local deck modules and config; sandboxing deferred.
- `FC-DLOD-04`: CLI intent, then config aliases, then built-in aliases.
- `FC-DLOD-05`: canonical deck identity from deck module metadata.
- `FC-CNFG-01`: minimal `cadenza.config.ts` is introduced in Phase 6.
- `FC-CNFG-02`: config keys are deck aliases, output root, and default
  formats.
- `FC-CNFG-03`: CLI flags override config, which overrides registry defaults.
- `FC-CNFG-04`: config aliases do not override deck module identity.
- `FC-VINS-01`: `validate` checks config, selector, metadata, compile, and
  timeline without export deliverables by default.
- `FC-VINS-02`: `inspect` reads artifacts only.
- `FC-VINS-03`: `@cadenza-dev/export-local` owns the shared reader.
- `FC-EXEN-01`: summary manifest plus per-format evidence files.
- `FC-EXEN-02`: default output root is
  `dist/cadenza/<deck-id>/<run-id>/`.
- `FC-EXEN-03`: stable hash covers deterministic contract fields only.
- `FC-EXEN-04`: path/config registry owns export defaults and artifact names.
- `FC-EXEN-05`: manifest and per-format evidence declare `schemaVersion`.
- `FC-WEBC-01`: static web compatibility adapter with Player App extension
  point.
- `FC-WEBC-02`: browser semantic smoke is the required web evidence.
- `FC-WEBC-03`: web contract uses a compatibility adapter boundary.
- `FC-VIDO-01`: renderer adapter hides direct API versus subprocess strategy.
- `FC-VIDO-02`: MP4 support covers decks satisfying the Phase 6 deck contract.
- `FC-VIDO-03`: MP4 evidence includes renderer provenance and limitations.
- `FC-VIDO-04`: local prerequisites and cleanup are classified and recorded.
- `FC-DBND-01`: renderer and bundler dependencies live in export-local or an
  adapter outside core.
- `FC-DBND-02`: monolithic `scripts/cadenza.ts` is rejected; split
  CLI/export-local is selected.
- `FC-DBND-03`: adapter implementation strategy is private provenance.
- `FC-CDIA-01`: typed evidence JSON plus optional `--json` summaries.
- `FC-CDIA-02`: small typed exit-code taxonomy.
- `FC-CDIA-03`: shared CLI/export diagnostic type outside core.
- `FC-CDOC-01`: README pointer plus dedicated local export walkthrough.
- `FC-CDOC-02`: expected command shapes and artifact fields, not generated
  transcripts.
- `FC-CDOC-03`: explicit overclaim checks for docs and evidence summaries.

## Stage A Confirmation Status

After maintainer brainstorming, all decision items above have a Stage A
recommendation and should not be reopened during Stage A unless the maintainer
explicitly asks to revisit a domain. On 2026-05-30, the maintainer also
accepted the final two confirmation items:

- `FC-DLOD-03`: whether Phase 6 formally accepts trusted local deck modules
  and `cadenza.config.ts` as documented local code execution, with sandboxing
  deferred to Phase 7+.
- `FC-EXEN-02`: whether the default generated output root should be
  `dist/cadenza/<deck-id>/<run-id>/`, while still allowing config and CLI
  overrides.

No Phase 6 Stage A decision item remains unresolved. This does not freeze any
contract; Stage B still requires explicit maintainer freeze approval.

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
