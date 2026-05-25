---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 5 Remotion Lambda and Hosted Evaluation Specification

## Purpose

This frozen contract defines the evaluation boundary for Remotion Lambda and
hosted rendering. Phase 5 may evaluate whether local export infrastructure can
support future hosted or commercial work, but it does not build a hosted tier.
The public launch-candidate push should make the future hosted path legible
without turning Phase 5 into hosted-product implementation.

Accepted ADRs keep Remotion licensing separate, keep the OSS core central, and
defer hosted commercial work until export infrastructure exists. This contract
keeps that boundary visible.

## Approved Design Decisions

The maintainer approved the launch-candidate decisions on 2026-05-26.

### Evaluation Depth

1. Record a docs-only evaluation from existing ADRs and local export evidence.
2. Add a structured local compatibility report without running remote Lambda
   jobs.
3. Run a real Lambda proof using credentials or remote infrastructure.

**Decision**: option 2. Real remote jobs require explicit maintainer approval
and are not assumed by Phase 5.

### Commercial Trigger

1. No ADR is needed until a hosted implementation begins.
2. Create a Proposed ADR when evaluation recommends hosted rendering.
3. Create an Accepted ADR during Stage B regardless of evaluation outcome.

**Decision**: option 2. A positive hosted recommendation should become explicit
decision material before implementation.

### Cost and Risk Evidence

1. Record qualitative risks only.
2. Record estimated costs, operational risks, licensing triggers, and
   unsupported assumptions.
3. Require production-grade cost modeling.

**Decision**: option 2. Phase 5 needs honest decision evidence, not production
finance planning.

## Requirements

- **ID**: LHEV-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 MUST treat Remotion Lambda and hosted rendering as
  evaluation-only unless a later approved ADR and frozen spec explicitly scope
  implementation. Local export stability is a precondition for any hosted work.
- **Verification**: acceptance scenario `TC-LHEV-001` checks evaluation
  artifacts and scans for hosted implementation claims.

- **ID**: LHEV-002
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The hosted evaluation SHOULD assess whether the local export
  manifest, artifact layout, render-safe readiness, preview/export parity
  checks, and diagnostics are suitable inputs for a future Remotion Lambda path.
- **Verification**: acceptance scenario `TC-LHEV-001` validates the evaluation
  report against local export evidence fields.

- **ID**: LHEV-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Any recommendation to start hosted rendering, cloud rendering,
  or commercial-tier implementation MUST route through a future ADR or explicit
  maintainer approval before Builder implementation begins.
- **Verification**: acceptance scenario `TC-LHEV-002` checks for ADR or approval
  routing before any hosted implementation work is considered complete.

- **ID**: LHEV-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 MUST NOT require secrets, remote accounts, paid cloud
  jobs, external publishing, or hosted infrastructure to satisfy local export or
  alpha-readiness gates.
- **Verification**: acceptance scenario `TC-LHEV-002` scans commands,
  configuration, tests, and evidence for remote prerequisites.

- **ID**: LHEV-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Hosted evaluation evidence MUST preserve the Apache-2.0 OSS
  core boundary and Remotion's separate license boundary. It MUST NOT imply that
  Cadenza redistributes Remotion or grants Remotion commercial rights.
- **Verification**: acceptance scenario `TC-LHEV-001` checks evaluation wording
  and license-boundary fields.

## Frozen Decisions

- **ID**: FC-LHEV-01
- **Decision**: Phase 5 performs a structured local compatibility report
  without running real remote Lambda jobs.
- **Rationale**: The launch candidate should make the future hosted path
  legible without requiring secrets, paid jobs, or remote infrastructure.

- **ID**: FC-LHEV-02
- **Decision**: If evaluation recommends hosted rendering, the next step is a
  Proposed ADR before implementation.
- **Rationale**: Hosted rendering affects licensing, cost, commercial posture,
  and infrastructure boundaries.

- **ID**: FC-LHEV-03
- **Decision**: Phase 5 records estimated costs, operational risks, licensing
  triggers, and unsupported assumptions, but does not require production-grade
  cost modeling.
- **Rationale**: This is enough for future decision-making without turning Phase
  5 into hosted-product planning.
