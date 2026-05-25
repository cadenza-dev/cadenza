---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 5 Preview and Export Parity Specification

## Purpose

This frozen contract defines how exported output is compared with the local
Remotion Player preview that Phase 4 made maintainer-facing. Phase 5 should not
pretend that every format has identical observability; it should define the
smallest real parity checks that make export regressions visible and repairable.

The contract inherits Phase 1 timeline determinism, Phase 2 render-safe preview
readiness, Phase 3 repair diagnostics, and Phase 4 visual acceptance evidence.

## Approved Design Decisions

The maintainer approved the launch-candidate decisions on 2026-05-26.

### Parity Baseline

1. Require parity only for the web bundle baseline.
2. Require parity for web bundle plus any enabled MP4 or PDF output.
3. Accept export metadata without browser-observable parity.

**Decision**: option 2. Web parity is mandatory; MP4 parity applies to the
canonical launch-candidate talk; PDF parity applies only if a static proof is
scoped.

### Browser Export Smoke

1. No browser export smoke test; rely on manifest validation.
2. Add a browser-observable smoke test for the exported web bundle.
3. Add screenshot or pixel diffing as the primary parity gate.

**Decision**: option 2. Browser export smoke is required for exported web
output. Screenshot or pixel artifacts may supplement but should not become the
only oracle.

### Tolerance Model

1. Require exact frame-for-frame equality for every preview and export
   observation.
2. Require semantic parity at slide, step, transition-settle, notes-boundary,
   and diagnostics checkpoints, with deterministic frame fields where the
   offline timeline owns timing.
3. Use maintainer visual review only.

**Decision**: option 2. Semantic parity matches Cadenza's slide model while
still preserving deterministic timeline checks.

## Requirements

- **ID**: PEXP-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Exported output MUST be traceable to the same compiled
  timeline identity, slide order, step order, transition declarations, and
  source deck metadata used by the local Remotion Player preview.
- **Verification**: acceptance scenario `TC-PEXP-001` compares preview metadata
  with export manifest or report fields.

- **ID**: PEXP-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The parity check MUST compare slide and step ordering,
  timeline timing for offline export durations, transition start and settle
  behavior, and final semantic cursor anchors across preview and exported web
  output.
- **Verification**: acceptance scenario `TC-PEXP-001` runs parity assertions for
  at least one slide boundary, one step boundary, and one transition.

- **ID**: PEXP-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Presenter-only material, including speaker notes and
  presenter diagnostics, MUST NOT leak into the visible exported slide surface.
  Export evidence MAY include notes metadata separately when the format supports
  it.
- **Verification**: acceptance scenario `TC-PEXP-002` checks exported output or
  export metadata for notes and presenter-boundary behavior.

- **ID**: PEXP-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Export parity evidence MUST include render-safe asset
  readiness and typography or density diagnostics for the exported deck, and it
  MUST flag regressions that were not present in the Phase 4 preview workflow.
- **Verification**: acceptance scenario `TC-PEXP-002` validates resource,
  typography, and density diagnostic fields in the parity report.

- **ID**: PEXP-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Parity findings SHOULD route to authored deck repair,
  `cadenza-best-practices` guidance, export implementation, or explicit
  framework-defect evidence instead of collapsing all failures into generic
  export errors.
- **Verification**: acceptance scenario `TC-EVDN-002` validates repair routing
  categories for parity failures.

## Frozen Decisions

- **ID**: FC-PEXP-01
- **Decision**: Parity covers the web bundle baseline, the canonical
  launch-candidate MP4 output, and any explicitly scoped PDF proof.
- **Rationale**: Format-specific support needs format-specific evidence, while
  unsupported formats must not inherit parity claims.

- **ID**: FC-PEXP-02
- **Decision**: Phase 5 requires a browser-observable smoke test for exported
  web output.
- **Rationale**: Manifest validation alone is too weak for a launch candidate;
  screenshot diffing remains supplemental rather than primary.

- **ID**: FC-PEXP-03
- **Decision**: Preview/export parity uses semantic checkpoints plus
  deterministic offline frame fields.
- **Rationale**: This preserves Cadenza's slide/step semantics without forcing
  brittle full-frame equality for every observation.
