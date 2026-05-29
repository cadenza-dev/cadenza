---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 6 Export Engine Specification

## Purpose

This frozen contract defines the reusable local export engine contract:
artifact layout, manifest schema, format capability declarations, evidence
files, deterministic fields, and known limitations.

Phase 6 export evidence must retire the Phase 5 proof shape as the center of
gravity. It may inherit useful Phase 5 fields, but it must not keep Phase
5-only batch identifiers, hard-coded deck IDs, base64 video artifacts, or
single-run fixture assumptions as the universal engine contract.

## Approved Design Decisions

### Evidence Shape

1. Single manifest with format sections.
2. Manifest plus per-format evidence files.
3. Append-only event log plus summary manifest.

**Decision**: option 2. A manifest should stay compact and deterministic
while per-format evidence can grow without turning every export into one huge
JSON object. After maintainer brainstorming on 2026-05-30, this is the approved
recommendation: the manifest is the summary inventory, and each enabled format
owns its own evidence file.

### Artifact Root

1. `dist/phase6/<deck-id>/<run-id>/`.
2. User-selected output root with a default under `dist/cadenza/`.
3. `tmp/` only, with trace summaries.

**Decision**: option 2. Phase 6 should feel less phase-bound than Phase
5 while still keeping generated output out of tracked fixtures. The default
root should come from the Phase 6 path/config registry, may be overridden by
minimal `cadenza.config.ts`, and must remain overrideable by CLI flags.

### Stable Hash Scope

1. Hash every artifact byte.
2. Hash deterministic contract fields only.
3. Hash source deck text.

**Decision**: option 2. Timestamps, absolute paths, selector alias
provenance, and renderer metadata can vary by machine; the stable hash should
anchor deterministic contract fields only. After maintainer brainstorming on
2026-05-30, this means canonical deck identity, compiled timeline digest,
format selection, relevant config defaults, and format capability
declarations. Artifact bytes are recorded as artifact metadata when useful but
are not part of the Phase 6 stable hash.

## Requirements

- **ID**: EXEN-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 6 export runs MUST write generated outputs under a
  declared output root resolved through the centralized path/config registry
  and MUST treat `dist/` and `tmp/` outputs as regenerate-owned generated
  evidence rather than tracked fixtures.
- **Verification**: acceptance scenario `TC-EXEN-001` exports to the default
  root, a config-defined root, and a CLI-defined custom output root, then checks
  artifact ownership and ignore assumptions.

- **ID**: EXEN-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Every successful export run MUST emit a manifest with
  `schemaVersion`, command, deck identity, source path, selector source, config
  or built-in alias when used, run ID, output root, format selections, artifact
  inventory, per-format evidence file references, stable hash, deterministic
  timeline fields or digest, diagnostics summary, known limitations, and format
  capability declarations.
- **Verification**: acceptance scenario `TC-EXEN-001` validates the manifest
  shape for web and MP4 export.

- **ID**: EXEN-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The manifest MUST distinguish stable deterministic fields from
  volatile fields such as generation timestamp, absolute temporary paths,
  selector alias provenance, machine-specific renderer metadata, browser or
  media-tool metadata, and host-specific environment messages. Volatile fields
  MUST NOT participate in the stable export hash.
- **Verification**: acceptance scenario `TC-EXEN-002` compares repeated exports
  and asserts stable deterministic fields while allowing declared volatile
  fields to differ.

- **ID**: EXEN-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Each enabled format MUST have format-specific evidence that
  records artifacts, capability status, parity or compatibility checks,
  diagnostics, known limitations, and whether the format is supported,
  limited, unsupported, or waived. Artifact byte size, container metadata,
  browser evidence, renderer provenance, and other machine-sensitive details
  belong in per-format evidence rather than the stable manifest hash.
- **Verification**: acceptance scenario `TC-EXEN-003` checks web and MP4
  format evidence and rejects blanket cross-format parity claims.

- **ID**: EXEN-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Export evidence SHOULD remain reusable by future Player App
  and hosted-rendering phases without requiring those phases to preserve Phase
  6 implementation internals.
- **Verification**: acceptance scenario `TC-EXEN-003` verifies that manifest
  and evidence records describe public deck, artifact, format, and diagnostic
  concepts instead of root-script private helper names.

- **ID**: EXEN-006
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Export artifact paths, manifest filenames, per-format evidence
  filenames, and temporary renderer directories MUST be resolved through the
  Phase 6 path/config registry. Export implementation modules MUST NOT invent
  command-local artifact names that bypass the registry.
- **Verification**: acceptance scenario `TC-CNFG-001` verifies path registry
  ownership for manifest, web evidence, MP4 evidence, and temporary renderer
  directories.

- **ID**: EXEN-007
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Manifest deck identity MUST come from the loaded deck module's
  canonical metadata, not from selector alias, config alias, built-in alias, or
  filename inference. The manifest MAY record selector provenance separately,
  including explicit path, explicit alias, config default, config alias, or
  built-in alias.
- **Verification**: acceptance scenario `TC-DLOD-005` verifies that the same
  deck loaded through multiple selectors produces the same manifest deck
  identity while recording selector provenance separately.

- **ID**: EXEN-008
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `@cadenza-dev/export-local` MUST own a shared
  manifest/evidence reader for Phase 6 export artifacts. `cadenza inspect`,
  export evidence tests, and future Player App handoff work SHOULD reuse this
  reader rather than parsing manifest or per-format evidence through
  command-local helper code.
- **Verification**: acceptance scenario `TC-VINS-004` verifies that malformed
  manifest and evidence fixtures are handled through the shared reader and
  diagnostic model.

- **ID**: EXEN-009
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The stable export hash MUST cover only deterministic contract
  fields: schema version, canonical deck identity, compiled timeline digest or
  equivalent deterministic timeline fields, format selection, relevant resolved
  config defaults, and format capability declarations. It MUST exclude artifact
  bytes, timestamps, absolute paths, temporary paths, selector alias provenance,
  machine-specific renderer or browser metadata, and environment messages.
- **Verification**: acceptance scenario `TC-EXEN-004` compares repeated exports
  across different output roots and selector aliases, verifies stable hash
  equality for deterministic inputs, and verifies stable hash changes when the
  canonical deck identity, timeline digest, format selection, relevant config
  defaults, or capability declarations change.

- **ID**: EXEN-010
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Manifest and per-format evidence files MUST declare a
  `schemaVersion` and MUST be readable by the shared export-local reader.
  Unsupported schema versions MUST fail through structured diagnostics rather
  than best-effort parsing.
- **Verification**: acceptance scenarios `TC-VINS-004` and `TC-EXEN-005`
  validate supported and unsupported schema-version fixtures.

## Approved Decision Summary

- **Decision ID**: FC-EXEN-01
- **Decision**: Export evidence uses a compact summary manifest plus
  per-format evidence files.
- **Deferred alternative**: append-only event logs are tracked in
  `wip/future-support/phase-7-plus-export-evidence-candidates.md`.

- **Decision ID**: FC-EXEN-04
- **Decision**: A centralized path/config registry owns export path defaults
  and artifact names.
- **Rejected alternatives**: command-owned path defaults and config-owned
  artifact naming.

- **Decision ID**: FC-EXEN-02
- **Decision**: The default generated output root is
  `dist/cadenza/<deck-id>/<run-id>/`, while config and CLI flags may override
  the root.
- **Rejected alternatives**: `dist/phase6/<deck-id>/<run-id>/` and `tmp/`
  only.

- **Decision ID**: FC-EXEN-03
- **Decision**: Stable export hashes include deterministic contract fields and
  exclude artifact bytes plus volatile machine and run fields.
- **Rejected alternatives**: hashing every artifact byte and hashing only
  source deck text.

- **Decision ID**: FC-EXEN-05
- **Decision**: The manifest and every per-format evidence file declare
  `schemaVersion`, and the shared reader rejects unsupported versions through
  diagnostics.
- **Rejected alternative**: filename or package-version inferred schemas.
