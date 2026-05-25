---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 5 Presenter Console Follow-Up Specification

## Purpose

This frozen contract decides whether Phase 5 should promote multi-device
presenter console work or live-presenter recording. Phase 4 froze a
same-browser presenter workflow. For the Phase 5 launch-candidate push,
export/present polish matters, but new multi-device or live-recording surfaces
should not distract from making the local demo, preview, and export path feel
excellent.

This contract also preserves the Phase 1 decision that deterministic export
targets offline timeline behavior, not arbitrary live presenter dwell times.

## Approved Design Decisions

The maintainer approved the launch-candidate decisions on 2026-05-26.

### Multi-Device Presenter Console

1. Keep the Phase 4 same-browser presenter workflow and defer multi-device
   console work.
2. Add a limited multi-device evaluation note without implementation.
3. Implement multi-device presenter console during Phase 5.

**Decision**: option 1. Export and launch-candidate readiness are already
enough for Phase 5; multi-device presenting should wait for real user evidence.

### Live-Presenter Recording

1. Keep deterministic offline export as the canonical export path.
2. Add an optional session replay or recording format as evidence only.
3. Make live-presenter recording the canonical export path.

**Decision**: option 1. A live-session capture path would change export
semantics and should not enter Phase 5 without strong evidence.

### Session Replay Artifact Boundary

1. Do not introduce replay artifacts.
2. Record replay as diagnostic evidence only if needed for parity debugging.
3. Treat replay as a user-facing alpha feature.

**Decision**: option 1 by default. Option 2 is allowed as debugging-only
diagnostic evidence if parity work needs it. User-facing replay is outside
Phase 5.

## Requirements

- **ID**: PCON-001
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 SHOULD keep the inherited same-browser presenter
  workflow as the default presenter surface and defer multi-device presenter
  console work unless export or alpha-readiness evidence proves a concrete need.
- **Verification**: acceptance scenario `TC-PCON-001` records the multi-device
  presenter console disposition.

- **ID**: PCON-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 MUST NOT make live-presenter recording the canonical
  export path. Deterministic offline export remains canonical for Phase 5.
- **Verification**: acceptance scenario `TC-PCON-002` scans export commands,
  evidence, and docs for live-recording-as-canonical claims.

- **ID**: PCON-003
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: If a session replay or presenter-recording artifact is scoped
  for Phase 5, it SHOULD be diagnostic evidence for parity or repair rather
  than a public alpha feature.
- **Verification**: acceptance scenario `TC-PCON-001` validates any replay or
  recording artifact against the declared boundary.

- **ID**: PCON-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Presenter console follow-up work MUST NOT introduce accounts,
  SSO, collaboration, comments, remote control services, external publishing,
  or hosted infrastructure during Phase 5.
- **Verification**: acceptance scenario `TC-PCON-001` scans presenter follow-up
  artifacts for prohibited product scope.

## Frozen Decisions

- **ID**: FC-PCON-01
- **Decision**: Phase 5 defers multi-device presenter console work and keeps
  the Phase 4 same-browser workflow.
- **Rationale**: The launch-candidate path should prioritize local demo,
  preview, and export polish.

- **ID**: FC-PCON-02
- **Decision**: Deterministic offline export remains the canonical export story
  in Phase 5. Live-presenter recording is not canonical.
- **Rationale**: Live recording would change export semantics and pull Phase 5
  into session timing, replay, and synchronization work.

- **ID**: FC-PCON-03
- **Decision**: Phase 5 defines no user-facing replay artifact. A
  debugging-only diagnostic replay artifact is allowed only if parity work needs
  it.
- **Rationale**: Replay can help diagnose export parity, but it should not
  become a public alpha feature in Phase 5.
