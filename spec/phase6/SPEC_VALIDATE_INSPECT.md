---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 Validate and Inspect Specification

## Purpose

This Stage A draft defines the `cadenza validate` and `cadenza inspect`
contracts. These commands make Phase 6 local export evidence reviewable without
turning every check into another render.

`validate` checks whether a deck can enter the Phase 6 export pipeline.
`inspect` checks what an already-generated export contains. They share
diagnostics, JSON output behavior, and manifest/evidence types, but they do not
perform the same work.

## Stage A Options

### Validate Scope

1. Config and selector resolution only.
2. Config, selector, deck metadata, compile, and timeline derivation, without
   export deliverables.
3. Full export preflight including renderer prerequisites and artifact writes.

**Stage A leaning**: option 2, approved as the Stage A recommendation on
2026-05-30. This catches the important deck-contract failures before export,
while keeping validation cheap and side-effect-light.

### Inspect Scope

1. No inspect command; users read files manually.
2. Manifest-only inspection.
3. Artifact-only manifest, per-format evidence, diagnostics, limitations, and
   artifact inventory inspection.
4. Source-aware inspection that reloads or recompiles the deck and compares it
   to prior export evidence.

**Stage A leaning**: option 3, approved as the Stage A recommendation on
2026-05-30. Inspect should summarize generated evidence, not become a second
export or validation command.

### Reader Ownership

1. Each command parses manifest and evidence files directly.
2. `@cadenza-dev/export-local` owns a shared manifest/evidence reader reused by
   inspect, tests, and future Player App handoff.
3. Manifest and evidence parsing belongs in `@cadenza-dev/core`.

**Stage A leaning**: option 2. The reader is an export artifact concern, not a
core typed-API concern, and command-local ad hoc parsers would drift quickly.

## Requirements

- **ID**: VINS-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `cadenza validate` MUST resolve `cadenza.config.ts`, selector
  precedence, built-in aliases, config aliases, and direct local module paths
  through the same loader path used by `cadenza export`.
- **Verification**: acceptance scenario `TC-VINS-001` validates decks selected
  by built-in alias, config alias, config default, and direct local module path.

- **ID**: VINS-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `cadenza validate` MUST validate deck module metadata,
  canonical deck identity, public typed TSX deck shape, compile diagnostics,
  and preview or offline timeline derivation. By default it MUST NOT render,
  bundle final export artifacts, write export deliverables, or invoke the MP4
  renderer adapter.
- **Verification**: acceptance scenario `TC-VINS-002` validates passing and
  failing deck fixtures while asserting that no web, MP4, manifest, or export
  artifact directory is created by default.

- **ID**: VINS-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `cadenza inspect` MUST accept an export manifest path or an
  export artifact directory, locate the manifest and per-format evidence, and
  summarize deck identity, selector provenance, enabled formats, artifact
  inventory, diagnostics, known limitations, and format capability status.
- **Verification**: acceptance scenario `TC-VINS-003` inspects a successful
  web and MP4 export by manifest path and by artifact directory.

- **ID**: VINS-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `cadenza inspect` MUST be artifact-only. It MUST NOT load the
  source deck module, compile the deck, invoke Remotion, re-render outputs,
  compare current source to prior evidence, or mutate generated artifacts.
- **Verification**: acceptance scenario `TC-VINS-003` uses fixtures or spies to
  verify inspect reads only manifest, evidence, and artifact inventory paths.

- **ID**: VINS-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `cadenza inspect` MUST reuse the shared export-local
  manifest/evidence reader. It MUST fail predictably for missing manifests,
  malformed JSON, unsupported schema versions, missing per-format evidence, or
  artifact directories that are not Cadenza exports.
- **Verification**: acceptance scenario `TC-VINS-004` exercises malformed and
  missing evidence fixtures and checks diagnostic codes, categories, repair
  hints, and exit behavior.

- **ID**: VINS-006
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `validate` and `inspect` MUST support the Phase 6 human output
  default and `--json` machine summary contract. JSON output MUST use the same
  diagnostic schema and stdout/stderr separation as `export`.
- **Verification**: acceptance scenario `TC-CLIS-006` validates JSON output for
  passing validate, failing validate, passing inspect, and failing inspect
  fixtures.

## Resolved Stage A Decisions

- **Decision ID**: FC-VINS-01
- **Decision**: `validate` checks config, selector resolution, deck metadata,
  compile, and timeline derivation without creating export deliverables by
  default.
- **Rejected alternatives**: selector-only validation and full renderer/export
  preflight in Phase 6.

- **Decision ID**: FC-VINS-02
- **Decision**: `inspect` is required in Phase 6 and remains artifact-only:
  manifests, per-format evidence, diagnostics, limitations, and artifact
  inventory.
- **Rejected alternatives**: omitting `inspect`, manifest-only inspection, and
  source-aware inspection.

- **Decision ID**: FC-VINS-03
- **Decision**: `@cadenza-dev/export-local` owns the shared manifest and
  evidence reader used by `inspect`, evidence checks, and acceptance helpers.
- **Rejected alternatives**: per-command parsers and artifact parsing in
  `@cadenza-dev/core`.
