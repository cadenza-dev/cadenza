---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 4 Technical-Talk Starters Specification

## Purpose

This frozen contract defines targeted technical-talk starters and authoring
guidance for Phase 4. Starters should make the dogfood workflow easier for
developers and AI coding agents without becoming a template marketplace,
business-deck generator, WYSIWYG editor, or separate skill ecosystem.

The canonical authoring guidance surface remains `cadenza-best-practices`.

## Approved Design Decisions

The maintainer approved the Stage A recommendations on 2026-05-23.

### Starter Inventory

1. One canonical dogfood starter only.
2. Three targeted starters: architecture talk, data explainer, and live-demo or
   release talk.
3. A broad template catalog.

**Decision**: option 2. Phase 4 includes three narrow technical-talk starters.
Only the canonical dogfood talk needs to be a full production-adjacent example;
the other starters may be lightweight examples or guidance slices.

### Starter Location

1. Examples only under `examples/phase4/`.
2. `cadenza-best-practices` rule guidance plus example TSX starters.
3. A new starter package.

**Decision**: option 2. Starters live as mono-skill guidance plus TSX examples.
No new starter package is introduced in Phase 4.

### Read-Only MCP Timing

1. Do not implement read-only MCP in Phase 4; keep Markdown and mono-skill
   context.
2. Evaluate read-only MCP at Phase 4 closeout and route to Phase 5 startup if
   examples and guidance have outgrown practical context injection.
3. Implement read-only MCP resources and prompts during Phase 4.

**Decision**: option 2. Phase 4 may evaluate read-only MCP at closeout, but it
does not implement MCP during the product-layer build. Tool-based MCP remains
out of scope.

## Requirements

- **ID**: STAR-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 4 starters MUST target developers and technical
  communicators writing technical talks, data explainers, or
  documentation-first decks. They MUST NOT target generic business
  prompt-to-deck use cases.
- **Verification**: acceptance scenario `TC-STAR-001` inspects starter prompts,
  examples, and guidance for technical-talk positioning.

- **ID**: STAR-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Starter guidance MUST use public Cadenza TSX, typed
  primitives, render-safe components, speaker notes, presenter metadata, and
  local preview repair workflow.
- **Verification**: acceptance scenario `TC-STAR-001` checks starter examples
  or guidance for public imports and product-layer workflow coverage.

- **ID**: STAR-003
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: `cadenza-best-practices` SHOULD include Phase 4 product-layer
  guidance for presenter workflow, outline or chapters, visual acceptance,
  typography/density, and stronger transitions.
- **Verification**: acceptance scenario `TC-STAR-002` inspects the mono-skill
  and relevant rule files for Phase 4 product-layer guidance.

- **ID**: STAR-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Phase 4 evals SHOULD reward production-adjacent technical-talk
  structure and penalize WYSIWYG, template-marketplace, export,
  hosted-rendering, public-stability, and external-alpha claims.
- **Verification**: acceptance scenario `TC-STAR-002` inspects or runs
  `cadenza-best-practices` evals with Phase 4 positive and boundary cases.

- **ID**: STAR-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 4 MUST NOT implement tool-based MCP. Read-only MCP MAY
  only be evaluated as a closeout or Phase 5-start candidate unless a later
  approved ADR and frozen spec supersede this contract.
- **Verification**: acceptance scenario `TC-STAR-003` confirms no tool-based
  MCP exists in Phase 4 and records the selected read-only MCP disposition.

- **ID**: STAR-006
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 4 starters MUST NOT expand into a broad template
  marketplace, WYSIWYG editing, collaboration, comments, SSO, or i18n
  infrastructure.
- **Verification**: acceptance scenario `TC-STAR-003` scans starters, examples,
  and guidance for prohibited product-scope claims.

## Frozen Decisions

- **ID**: FC-STAR-01
- **Decision**: Phase 4 requires three narrow technical-talk starters:
  architecture talk, data explainer, and live-demo or release talk.
- **Rationale**: The inventory covers likely developer talks without becoming a
  broad template catalog. Only the canonical dogfood talk must be a full
  production-adjacent example.

- **ID**: FC-STAR-02
- **Decision**: Starter guidance lives in `cadenza-best-practices` plus TSX
  examples.
- **Rationale**: This strengthens the existing AI-facing authoring surface
  without introducing a premature starter package or separate skill ecosystem.

- **ID**: FC-STAR-03
- **Decision**: Phase 4 does not implement read-only MCP. It records a closeout
  evaluation and routes read-only MCP to Phase 5 startup if Markdown and
  mono-skill context prove insufficient.
- **Rationale**: MCP should expose stable resources and prompts. Phase 4 still
  needs to prove which product-layer examples and visual records deserve that
  standardization.
