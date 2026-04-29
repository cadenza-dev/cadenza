---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 3 Authoring Loop Specification

## Purpose

This frozen contract defines the local AI-authoring loop for Phase 3. The loop
starts from `cadenza-best-practices`, produces a small typed TSX technical deck,
compiles it through the semantic core, mounts it in the Phase 2 browser preview
path, repairs diagnostics with structured evidence, and stops without
hand-editing framework internals.

Phase 3 strengthens authoring reliability. It does not claim MP4/PDF export,
hosted rendering, presenter-product workflows, public API stability, or external
alpha usage.

## Resolved Design Options

### Loop Entrypoint Shape

1. Documented command sequence: author, compile, preview, inspect diagnostics,
   repair, and re-run through existing commands.
2. Single orchestration command: one command wraps the whole loop and emits a
   report.
3. Skill-only workflow: the authoring skill describes the loop but no new local
   command or report surface is added.

**Decision**: use option 1. Phase 3 proves the loop with public interfaces and
existing commands before adding a wrapper. A wrapper command is deferred to
`wip/future-support/conditional-or-later-candidates.md` and can be reconsidered
only if the explicit command sequence creates repeated repair-loop friction.

### Acceptance Deck Source

1. One generated deck fixture committed as a focused Phase 3 acceptance deck.
2. Multiple scenario-specific generated decks under browser/unit tests.
3. Reuse the Phase 1 all-domain fixture only.

**Decision**: use option 1 plus targeted scenario fixtures only when needed. The
all-domain fixture proves inherited runtime coverage, but Phase 3 needs an
agent-authored technical-deck example that can fail and be repaired.

## Requirements

- **ID**: AUTH-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The Phase 3 authoring loop MUST start from public Cadenza
  authoring surfaces: typed TSX API, render-safe components, and
  `cadenza-best-practices`. The loop MUST NOT require editing
  `packages/**/src/**` to repair an authored deck.
- **Verification**: acceptance scenario `TC-AUTH-001` authors or loads a small
  technical deck using public imports only.

- **ID**: AUTH-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The authored deck MUST compile through the existing semantic
  core before browser preview is considered valid. Fatal compile diagnostics
  MUST block the preview step and feed the repair queue.
- **Verification**: acceptance scenario `TC-AUTH-002` proves a valid deck
  compiles and a targeted invalid deck returns repairable compile diagnostics.

- **ID**: AUTH-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The authored deck MUST mount through the Phase 2 browser
  preview path, reusing the Remotion Player adapter and shared preview
  diagnostics channel rather than introducing a parallel preview stack.
- **Verification**: browser scenario `TC-AUTH-003` mounts the Phase 3
  acceptance deck and observes preview diagnostics through the inherited
  browser channel.

- **ID**: AUTH-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: A repair iteration MUST be evidence-driven: the agent reads
  structured compile or preview diagnostics, changes only the authored deck or
  authoring guidance surfaces, and re-runs the relevant local checks.
- **Verification**: acceptance scenario `TC-AUTH-004` starts from a deck with
  one intentional authoring failure, repairs it, and records before/after
  diagnostics.

- **ID**: AUTH-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The loop SHOULD emit enough human-readable evidence for trace
  review: authored deck path, commands run, diagnostics before repair,
  diagnostics after repair, and preview pass/fail result.
- **Verification**: acceptance scenario `TC-AUTH-004` produces a reviewable
  repair evidence artifact or test output that contains those fields.

- **ID**: AUTH-006
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The Phase 3 acceptance deck SHOULD represent a real small
  technical talk slice with notes, step reveals, bounded content, at least one
  render-safe resource or content slot, and preview-observable diagnostics.
- **Verification**: acceptance scenario `TC-AUTH-001` asserts the deck uses the
  relevant public primitives and stays within Phase 3 non-goals.

## Frozen Decisions

- **ID**: FC-AUTH-01
- **Decision**: Phase 3 uses an explicit documented command sequence over
  existing compile, preview, test, diagnostics, and repair evidence commands.
  It does not add a single orchestration command.
- **Rationale**: The loop should remain transparent while the repair workflow is
  being proven. A wrapper command would be useful later only if repeated
  real-loop evidence shows command choreography is the bottleneck.

- **ID**: FC-AUTH-02
- **Decision**: Phase 3 uses one canonical generated technical-deck fixture as
  the main acceptance deck, with targeted scenario fixtures added only when a
  diagnostic cannot be proven through the canonical deck.
- **Rationale**: A single canonical deck keeps the repair loop reviewable and
  avoids turning Phase 3 into a broad fixture-matrix exercise before the local
  loop is proven.
