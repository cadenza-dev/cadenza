---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 5 Format Scope Specification

## Purpose

This frozen contract defines which export formats Phase 5 must support for a
public launch candidate, which formats may be scoped or waived, and what
evidence is required before Cadenza can claim format support.

Web bundle export is the baseline. MP4 support is expected for the canonical
Phase 5 launch-candidate technical talk, with explicit limitations rather than
blanket arbitrary-deck support. PDF is not launch-blocking and may be handled
as a static proof or maintainer waiver.

## Approved Design Decisions

The maintainer approved the launch-candidate decisions on 2026-05-26.

### MP4 Scope

1. Implement MP4 export as a supported Phase 5 output.
2. Implement a limited MP4 smoke proof only, with limitations recorded.
3. Waive MP4 for Phase 5 and keep it as a later export target.

**Decision**: option 1 for the canonical Phase 5 launch-candidate technical
talk, scoped honestly. This is not a claim that every future deck shape has full
MP4 support.

### PDF Scope

1. Implement PDF export as a supported Phase 5 output.
2. Implement a limited PDF proof for static slide snapshots or print-like
   review only.
3. Waive PDF for Phase 5 and keep it as a later export target.

**Decision**: option 3 by default, with option 2 allowed if a static or
print-like proof is cheap and clearly marked as non-motion parity. PDF is not
required for Phase 5 launch-candidate readiness.

### Format Parity Claims

1. Claim all enabled formats are equivalent.
2. Claim format-specific support with explicit capability and limitation
   fields.
3. Treat non-web formats as experimental artifacts outside alpha readiness.

**Decision**: option 2. Format support should be specific rather than broad.

## Requirements

- **ID**: FMT-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 MUST support local web bundle export as the baseline
  reviewable deliverable.
- **Verification**: acceptance scenario `TC-EXPT-002` validates that the local
  export command produces an inspectable web bundle.

- **ID**: FMT-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: MP4 MUST be supported for the canonical Phase 5
  launch-candidate technical talk with format-specific evidence and explicit
  limitations. PDF is waived by default for launch readiness; Builder MAY add a
  cheap static proof if it is clearly labeled as non-motion, static output.
  Phase 5 MUST NOT silently imply broad MP4 or PDF support from web bundle
  export.
- **Verification**: acceptance scenario `TC-FMT-001` verifies the frozen format
  disposition and rejects unsupported format claims.

- **ID**: FMT-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Each enabled or scoped format MUST have format-specific
  parity checks, artifact inventory, diagnostics, and known limitations. A
  format without those fields MUST be recorded as unsupported or waived.
- **Verification**: acceptance scenario `TC-FMT-002` validates format-specific
  evidence for every enabled output.

- **ID**: FMT-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: A maintainer waiver for PDF or for any MP4 capability outside
  the canonical launch-candidate talk MUST record the waived format or
  capability, rationale, scope impact on launch-candidate readiness, and any
  follow-up WIP target. Reviewer acceptance alone MUST NOT create a format
  waiver.
- **Verification**: acceptance scenario `TC-FMT-001` validates waiver records
  when a format is not implemented.

- **ID**: FMT-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Format-specific output SHOULD preserve Cadenza's visible slide
  surface, notes boundary, render-safe assets, typography and density outcomes,
  and transition or step semantics according to the declared capability of that
  format.
- **Verification**: acceptance scenario `TC-FMT-002` checks supported format
  capabilities against the declared limitation set.

## Frozen Decisions

- **ID**: FC-FMT-01
- **Decision**: Phase 5 supports MP4 export for the canonical launch-candidate
  technical talk, with explicit known limitations and no broad arbitrary-deck
  guarantee.
- **Rationale**: A public launch candidate needs a real video-export proof, but
  broad MP4 guarantees should wait for more deck diversity.

- **ID**: FC-FMT-02
- **Decision**: PDF is waived by default for Phase 5. Builder may include a
  cheap static or print-like proof only if it does not imply motion or notes
  parity.
- **Rationale**: PDF semantics for steps, notes, and motion are not essential
  to the launch-candidate path and would distract from web and MP4 export.

- **ID**: FC-FMT-03
- **Decision**: Phase 5 uses format-specific support claims with capability and
  limitation fields.
- **Rationale**: Honest format-specific language prevents web, MP4, and PDF
  from being overclaimed as equivalent.
