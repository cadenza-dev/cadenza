---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 5 Export Pipeline Specification

## Purpose

This frozen contract defines the supported local export pipeline for Phase 5.
Phase 5 turns the accepted Phase 4 product-layer workflow into a public launch
candidate: a polished local developer experience with reviewable deliverables,
public-facing demo material, and honest export evidence. The baseline
deliverable is a local web bundle; MP4 and PDF are handled in the format-scope
contract.

Phase 5 export starts from public Cadenza TSX, `cadenza-best-practices`, and
the Phase 4 dogfood or starter workflow. It must not use package-internal
fixtures as the launch proof, and it must not claim hosted rendering, npm
publication, or final `0.1 alpha` readiness before the contracts define those
gates.

## Approved Design Decisions

The maintainer approved the launch-candidate decisions on 2026-05-26.

### Export Deck Source

1. Reuse the Phase 4 dogfood talk directly.
2. Create a longer Phase 5 alpha talk under `examples/phase5/` that extends the
   Phase 4 product-layer patterns.
3. Keep the alpha talk outside the repository and record only trace evidence.

**Decision**: option 2. Phase 5 needs a longer, launch-grade, export-focused
technical talk without mutating the accepted Phase 4 dogfood artifact into a
catch-all.

### Local Export Command Shape

1. Add a phase-specific script such as `pnpm export:phase5`.
2. Add a generic local command surface such as `pnpm cadenza export <deck>`.
3. Document a multi-command sequence that Builder must run manually.

**Decision**: option 2, with a narrow Phase 5 scope. Phase 5 freezes a generic
local command shape, `cadenza export <deck>`, because launch-candidate developer
experience should feel product-shaped rather than phase-internal. The command
is narrow: it must support the canonical Phase 5 talk and documented examples,
web bundle output, scoped MP4 output from the format contract, deterministic
manifest/evidence output, and explicit limitations. It does not imply npm
publication, hosted export, arbitrary plugin loading, broad config discovery,
or every future deck shape.

### Output Artifact Layout

1. Write generated deliverables under `dist/phase5/<deck-id>/<run-id>/`.
2. Write deliverables under `trace/phase5/evidence/exports/`.
3. Write deliverables under `tmp/` and record only summaries.

**Decision**: option 1 for generated artifacts, with trace summaries pointing
to the generated paths during closeout.

## Requirements

- **ID**: EXPT-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 MUST include a longer launch-grade technical-talk
  export source authored through public Cadenza TSX, render-safe components,
  `cadenza-best-practices`, and Phase 4 product-layer patterns. Package-internal
  fixtures or unit-test-only decks MUST NOT satisfy the launch-candidate export
  proof.
- **Verification**: acceptance scenario `TC-EXPT-001` inspects the source deck,
  imports, metadata, and authored location.

- **ID**: EXPT-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 MUST define a supported local export command that
  uses the generic shape `cadenza export <deck>`, produces a reviewable web
  bundle baseline from the Phase 5 source deck, and emits a manifest that names
  the source deck, command, output directory, and generated artifacts.
- **Verification**: acceptance scenario `TC-EXPT-002` runs the supported local
  command and validates the web bundle and manifest shape.

- **ID**: EXPT-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The local export command MUST be deterministic for the same
  deck source, export options, dependency state, viewport, and composition
  settings. Run IDs or timestamps MAY differ, but compiled timeline identity,
  slide and step ordering, and declared artifacts MUST remain stable.
- **Verification**: acceptance scenario `TC-EXPT-002` compares two export runs
  and asserts stable deterministic fields.

- **ID**: EXPT-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The Phase 5 export pipeline MUST run locally without hosted
  services, cloud rendering accounts, secrets, external publishing, or npm
  publication. Hosted and commercial evaluation remains separate from local
  export support.
- **Verification**: acceptance scenario `TC-LHEV-002` scans scripts, commands,
  evidence, and configuration for remote-service or publishing requirements.

- **ID**: EXPT-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The supported export workflow SHOULD use public or
  contract-defined command surfaces rather than hidden one-off scripts. Any
  temporary implementation script MUST be wrapped by `cadenza export <deck>` and
  documented as an implementation detail.
- **Verification**: acceptance scenario `TC-EXPT-001` checks that the export
  workflow is discoverable from documented public commands or scripts.

## Frozen Decisions

- **ID**: FC-EXPT-01
- **Decision**: The canonical Phase 5 export source is a launch-grade longer
  technical talk under `examples/phase5/`.
- **Rationale**: Phase 5 needs public-facing export proof without turning the
  Phase 4 dogfood talk into a catch-all artifact.

- **ID**: FC-EXPT-02
- **Decision**: Phase 5 uses a narrow generic local command shape:
  `cadenza export <deck>`.
- **Rationale**: The launch-candidate path should feel like a real developer
  product. The scope remains intentionally narrow to avoid premature CLI,
  hosted, plugin, or publication commitments.

- **ID**: FC-EXPT-03
- **Decision**: Generated deliverables live under
  `dist/phase5/<deck-id>/<run-id>/`, with trace summaries referencing the
  generated paths.
- **Rationale**: Generated outputs should remain generated artifacts; trace
  should preserve accepted evidence and review summaries.
