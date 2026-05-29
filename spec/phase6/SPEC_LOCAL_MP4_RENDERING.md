---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 Local MP4 Rendering Specification

## Purpose

This Stage A draft defines the local MP4 export contract. Phase 6 must replace
the Phase 5 canonical MP4 smoke artifact with a real local Remotion render path
for decks that satisfy the declared deck module contract.

This contract is local-only. It does not claim hosted rendering, Remotion
Lambda production readiness, arbitrary cloud execution, full pixel parity
across machines, or broad support for every future deck shape.

## Stage A Options

### Renderer Invocation

1. Call Remotion renderer APIs directly.
2. Spawn the Remotion CLI as a subprocess.
3. Hide both behind a stable renderer adapter interface.

**Stage A leaning**: option 3. The public export engine should not care whether
Builder chooses direct APIs or a CLI subprocess first, and future hosted work
should reuse the adapter boundary. After Stage A brainstorming on 2026-05-30,
this is the approved recommendation: freeze the adapter contract, not the
internal Remotion invocation strategy.

### MP4 Support Scope

1. Canonical Phase 5 talk only.
2. Any deck satisfying the Phase 6 deck module contract, with honest local
   prerequisite limitations.
3. Arbitrary project folders and plugin-loaded decks.

**Stage A leaning**: option 2. Phase 6 should be more universal than Phase 5
without pretending to support plugin systems or unbounded project layouts.

### Video Evidence

1. Check file existence and non-zero bytes only.
2. Check file existence, container metadata where available, format evidence,
   and manifest linkage.
3. Require frame-by-frame pixel parity against preview.

**Stage A leaning**: option 2. Real MP4 rendering needs stronger evidence than
non-empty bytes, but frame-perfect pixel parity is too brittle for Stage A.

### Prerequisites and Cleanup

1. Let renderer failures surface raw.
2. Detect and classify local prerequisites, then record them in evidence.
3. Require a fully portable bundled renderer environment.

**Stage A leaning**: option 2. Phase 6 should be honest about local browser,
renderer, codec, and media-tool requirements without pretending to provide a
hosted or fully portable rendering environment.

## Requirements

- **ID**: VIDO-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 6 MP4 export MUST be produced by a real local Remotion
  render path for the declared deck contract. A static base64 video, container
  smoke artifact, or pre-recorded proof MUST NOT satisfy MP4 support.
- **Verification**: acceptance scenario `TC-VIDO-001` runs MP4 export and
  verifies that the artifact is created by the renderer adapter rather than a
  checked-in or embedded video constant.

- **ID**: VIDO-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: MP4 export MUST support at least the canonical Phase 5 talk
  migrated to the Phase 6 deck contract and SHOULD support any local deck
  module that satisfies the same contract and renderer prerequisites.
- **Verification**: acceptance scenario `TC-VIDO-001` renders the canonical
  talk and acceptance scenario `TC-DLOD-002` proves the direct module path used
  by the renderer follows the same loading contract.

- **ID**: VIDO-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: MP4 evidence MUST record the rendered artifact path, renderer
  adapter, renderer implementation family when known, composition dimensions,
  fps, frame count or duration, source deck, local prerequisites, diagnostics,
  artifact metadata such as byte size or container metadata when available, and
  known limitations.
- **Verification**: acceptance scenario `TC-VIDO-002` validates MP4 format
  evidence and manifest linkage.

- **ID**: VIDO-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: MP4 export failures MUST route through structured diagnostics
  that distinguish deck validation failures, renderer failures, missing local
  prerequisites, unsupported deck contract features, and environment
  limitations. Renderer diagnostics MUST preserve the adapter-facing stage that
  failed rather than leaking raw Remotion logs as the only failure contract.
- **Verification**: acceptance scenario `TC-CDIA-002` checks renderer failure
  fixtures and exit-code mapping.

- **ID**: VIDO-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 6 MP4 rendering MUST NOT require hosted services,
  Remotion Lambda deployment, remote accounts, secrets, paid cloud jobs, npm
  publication, or external release infrastructure.
- **Verification**: acceptance scenario `TC-VIDO-002` scans commands,
  dependency declarations, docs, and evidence for hosted prerequisites and
  prohibited publication claims.

- **ID**: VIDO-006
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: MP4 rendering MUST be invoked through a renderer adapter owned
  by `@cadenza-dev/export-local` or an explicit renderer adapter package. The
  adapter contract MUST accept renderer-ready deck identity, deterministic
  timeline or composition metadata, output path, format options, and resolved
  local prerequisites; it MUST return artifact metadata, renderer provenance,
  diagnostics, cleanup status, and known limitations. The export engine MUST
  NOT depend on whether the adapter uses direct Remotion APIs or a Remotion CLI
  subprocess internally.
- **Verification**: acceptance scenario `TC-VIDO-003` verifies adapter-facing
  inputs and outputs while avoiding assertions on private direct-API versus
  subprocess implementation details.

- **ID**: VIDO-007
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The renderer adapter MUST classify local prerequisites before
  or during render, including the availability of the required local browser,
  Remotion renderer or bundler runtime, codec or media tooling when applicable,
  output directory permissions, and environment limitations. Missing or
  unsupported prerequisites MUST fail with environment or renderer diagnostics
  and MUST be recorded in MP4 evidence when an evidence path is available.
- **Verification**: acceptance scenario `TC-VIDO-004` exercises missing or
  unsupported prerequisite fixtures and checks diagnostic categories, repair
  hints, and MP4 failure evidence.

- **ID**: VIDO-008
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: MP4 rendering MUST own temporary bundle and renderer
  directories through the path/config registry and MUST attempt cleanup on
  success, failure, and cancellation. Cleanup failures MUST be reported as
  diagnostics or limitations without turning a failed render into a partial
  success claim.
- **Verification**: acceptance scenario `TC-VIDO-004` verifies successful
  cleanup, failed-render cleanup, cancellation cleanup, and cleanup-failure
  diagnostics.

- **ID**: VIDO-009
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: MP4 render progress and raw renderer logs MUST NOT pollute
  `--json` stdout. Human progress MAY use stderr; structured renderer
  provenance, diagnostics, and limitations MUST be captured in evidence or the
  JSON summary according to the Phase 6 diagnostic transport contract.
- **Verification**: acceptance scenario `TC-CLIS-006` and `TC-VIDO-003` verify
  JSON output separation for successful and failing MP4 renders.

## Resolved Stage A Decisions

- **Decision ID**: FC-VIDO-01
- **Decision**: MP4 rendering goes through a stable renderer adapter interface
  that may internally use direct Remotion APIs or a subprocess strategy.
- **Rejected alternatives**: freezing direct Remotion APIs or a spawned
  Remotion CLI wrapper as the public implementation contract.

- **Decision ID**: FC-VIDO-02
- **Decision**: Phase 6 MP4 support covers any deck satisfying the Phase 6 deck
  module contract, with explicit local-rendering limitations.
- **Rejected alternatives**: canonical Phase 5 talk only and arbitrary project
  folders or plugin-loaded decks.

- **Decision ID**: FC-VIDO-03
- **Decision**: MP4 evidence must include file metadata, renderer provenance,
  manifest linkage, diagnostics, and limitations.
- **Rejected alternatives**: non-empty-file checks only and frame-by-frame
  pixel parity as the Phase 6 claim gate.

- **Decision ID**: FC-VIDO-04
- **Decision**: Phase 6 detects and classifies local prerequisites, records
  evidence, and cleans temporary renderer state on success, failure, and
  cancellation.
- **Rejected alternatives**: raw renderer failures and a fully portable bundled
  renderer environment.
