---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 5 Alpha Readiness Specification

## Purpose

This frozen contract defines what Cadenza may call a public launch candidate,
developer preview candidate, and eventual `0.1 alpha readiness`. Readiness is
not a promise of hosted rendering, external alpha usage, broad format parity,
or npm publication. It is a traceable local gate first: a longer technical talk
exports through the supported pipeline, the declared public surface is stable by
an explicit clock, install/run/export commands are documented, launch-grade demo
material exists, and Reviewer accepts the evidence.

## Approved Design Decisions

The maintainer approved the launch-candidate decisions on 2026-05-26.

### Declared Alpha Surface

1. Only package public exports are part of the alpha surface.
2. Package public exports plus documented preview and export commands,
   examples, and `cadenza-best-practices` guidance are part of the alpha
   surface.
3. Every repository file touched by Phase 5 is part of the alpha surface.

**Decision**: option 2. Alpha users need commands and examples, not only
package exports, but internal implementation remains outside the stability
promise.

### Stability Clock

1. Start the 1-month clock at Stage B freeze.
2. Start the clock at the first Builder implementation commit that declares the
   alpha surface.
3. Start the clock only after Reviewer acceptance, making Phase 5 readiness a
   future delayed claim.

**Decision**: option 2 if the declared surface is explicit and traceable;
otherwise option 3. Public launch-candidate communication may precede the full
one-month stability claim if it is clearly labeled as a candidate or developer
preview.

### Package and Version Posture

1. Keep the repository private-package posture and declare local alpha
   readiness only.
2. Prepare package metadata for future publication without publishing.
3. Publish `0.1.0-alpha` during Phase 5.

**Decision**: option 2. Phase 5 may prepare package metadata and publication
readiness, but publishing remains out of scope without explicit maintainer
approval in the same session.

## Requirements

- **ID**: ALFA-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 MUST declare the `0.1 alpha` public surface and the
  excluded internal surface. The declaration MUST include supported package
  exports, local preview/export commands, examples or starter paths, and
  guidance files that users are expected to rely on.
- **Verification**: acceptance scenario `TC-ALFA-001` validates the alpha
  surface declaration against package exports, scripts, examples, and guidance.

- **ID**: ALFA-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 MUST document install, run, preview, export, and
  evidence-review commands from a clean checkout. Documentation MUST route users
  through the supported local export path rather than hidden scripts or test-only
  fixtures.
- **Verification**: acceptance scenario `TC-ALFA-001` checks the documented
  commands and runs or statically validates them where appropriate.

- **ID**: ALFA-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `0.1 alpha readiness` MUST NOT be claimed until the declared
  public alpha surface has no unresolved breaking-change finding for one month,
  or until the maintainer records an explicit waiver that narrows the readiness
  claim and explains the risk.
- **Verification**: acceptance scenario `TC-ALFA-002` validates the stability
  clock or waiver evidence.

- **ID**: ALFA-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 alpha readiness MUST require traceable Reviewer
  acceptance after Builder closeout. Builder green tests, successful export
  evidence, or maintainer chat sign-off alone MUST NOT be sufficient.
- **Verification**: acceptance scenario `TC-ALFA-002` checks closeout routing
  for Reviewer acceptance.

- **ID**: ALFA-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 artifacts MUST NOT claim external alpha user feedback,
  hosted rendering readiness, commercial readiness, template marketplace
  support, WYSIWYG editing, collaboration, comments, SSO, or i18n
  infrastructure.
- **Verification**: acceptance scenario `TC-ALFA-003` scans Phase 5 artifacts
  for prohibited alpha-scope claims.

- **ID**: ALFA-006
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 MUST NOT publish to npm, push release tags, or open
  external alpha announcements without explicit maintainer approval in the same
  session. Local `0.1 alpha readiness` evidence MAY be prepared without
  publication.
- **Verification**: acceptance scenario `TC-ALFA-003` checks release and
  publication boundaries.

- **ID**: ALFA-007
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 SHOULD prepare public-facing developer-preview
  materials for the launch candidate: a concise quickstart, demo talk entry,
  preview and export path, known limitations, and positioning that targets
  developers writing technical talks rather than generic business-deck users.
- **Verification**: acceptance scenario `TC-ALFA-001` checks public-facing
  quickstart or launch-candidate docs for the required fields and positioning.

## Frozen Decisions

- **ID**: FC-ALFA-01
- **Decision**: The declared public surface includes package exports,
  documented preview/export commands, examples, and `cadenza-best-practices`
  guidance.
- **Rationale**: A developer preview needs commands and examples, while
  internal implementation remains outside the stability promise.

- **ID**: FC-ALFA-02
- **Decision**: The one-month stability clock starts at the first Builder
  commit that declares the public alpha surface, if that surface is explicit and
  traceable. Otherwise it starts after Reviewer acceptance. Launch-candidate
  wording may be used earlier if it does not overclaim final `0.1 alpha`
  readiness.
- **Rationale**: This supports near-term public communication while preserving
  the stability requirement for the final alpha claim.

- **ID**: FC-ALFA-03
- **Decision**: Phase 5 prepares package metadata and publication readiness but
  does not publish npm packages unless separately approved in-session.
- **Rationale**: Publication would create support and release-management
  commitments that belong after the launch-candidate evidence is accepted.
