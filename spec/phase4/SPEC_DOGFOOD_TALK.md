---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 4 Dogfood Technical Talk Specification

## Purpose

This frozen contract defines the production-adjacent technical talk that Phase
4 uses to prove the presentation product layer. The talk must be authored
through public Cadenza TSX and `cadenza-best-practices`, opened in a local
Remotion Player preview, and repaired from observable product evidence.

Phase 4 builds on the accepted Phase 3 authoring loop. It does not reopen Phase
3 repair semantics, and it does not claim MP4/PDF export, hosted rendering,
Remotion Lambda, external alpha usage, or public API stability.

## Approved Design Decisions

The maintainer approved the Stage A recommendations on 2026-05-23.

### Dogfood Talk Source

1. Extend `examples/phase3/acceptance-deck.tsx`.
2. Add a new production-adjacent Phase 4 talk under `examples/phase4/`.
3. Keep the dogfood talk outside the repository and only record trace evidence.

**Decision**: option 2. A new Phase 4 example inherits Phase 3 lessons without
turning the Phase 3 acceptance deck into a product-layer catch-all.

### Local Preview Entrypoint

1. Document an existing command sequence that opens the example in Remotion
   Player.
2. Add a small local preview command or example entrypoint dedicated to the
   Phase 4 dogfood talk.
3. Require Playwright as the primary preview interface.

**Decision**: option 2. Phase 4 needs a maintainer-facing local preview
entrypoint. Playwright remains verification infrastructure, not the primary
review interface.

### Production-Adjacent Talk Topic

1. A Cadenza architecture talk that explains the state-to-timeline compiler and
   product-layer workflow.
2. A data-heavy technical explainer using the Phase 3 data-explainer guidance.
3. A release/demo talk focused on authoring and preview workflow.

**Decision**: option 1 with at least one data-explainer slide. This exercises
notes, chapters, step reveals, transitions, typography, and repair diagnostics
without inventing a broad starter library.

## Requirements

- **ID**: DOGF-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The Phase 4 dogfood talk MUST be authored through public
  Cadenza TSX APIs, render-safe components, and `cadenza-best-practices`.
  Normal talk repair MUST NOT require editing `packages/**/src/**`.
- **Verification**: acceptance scenario `TC-DOGF-001` checks the dogfood talk
  imports public authoring surfaces and records no framework-internal repair
  edits.

- **ID**: DOGF-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The dogfood talk MUST be production-adjacent rather than a
  unit-test fixture: it includes real slide copy, speaker notes, step reveals,
  chapters or outline metadata, at least one render-safe visual surface, and at
  least one transition that can be previewed.
- **Verification**: acceptance scenario `TC-DOGF-001` inspects the dogfood talk
  structure and rejects a minimal all-domain or test-only fixture as sufficient.

- **ID**: DOGF-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: A local preview surface or command MUST open the dogfood talk
  in Remotion Player for maintainer review without making Playwright the
  primary interface.
- **Verification**: acceptance scenario `TC-DOGF-002` launches or mounts the
  local preview surface and confirms the maintainer-facing route reaches the
  dogfood talk.

- **ID**: DOGF-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The dogfood talk SHOULD live in an example or authored-deck
  location, not in package source or a browser-test-only fixture path.
- **Verification**: acceptance scenario `TC-DOGF-001` asserts the dogfood talk
  path is outside `packages/**/src/**` and outside test-only fixture folders.

- **ID**: DOGF-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 4 dogfood artifacts MUST NOT claim MP4 export, PDF
  export, hosted rendering, Remotion Lambda support, external alpha usage,
  template marketplace support, WYSIWYG editing, or public API stability.
- **Verification**: acceptance scenario `TC-STAR-003` scans Phase 4 specs,
  examples, starters, trace artifacts, and guidance for prohibited claims.

## Frozen Decisions

- **ID**: FC-DOGF-01
- **Decision**: The canonical Phase 4 dogfood talk lives under
  `examples/phase4/`.
- **Rationale**: Phase 4 needs a real product-layer example without mutating the
  accepted Phase 3 repair-loop deck into a catch-all fixture.

- **ID**: FC-DOGF-02
- **Decision**: Phase 4 requires a maintainer-facing local preview entrypoint
  dedicated to opening the dogfood talk in Remotion Player.
- **Rationale**: The core product evidence is local preview dogfooding. A
  Playwright-only interface would prove tests, not maintainer workflow.

- **ID**: FC-DOGF-03
- **Decision**: The canonical dogfood topic is a Cadenza architecture talk with
  at least one data-explainer slide.
- **Rationale**: This topic exercises the project-specific presentation
  semantics while still forcing technical-talk density, notes, and visual repair
  behavior.
