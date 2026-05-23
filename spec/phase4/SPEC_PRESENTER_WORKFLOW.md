---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 4 Presenter Workflow Specification

## Purpose

This frozen contract defines the Phase 4 presenter workflow: the maintainer can
present, navigate, inspect notes, understand current/next context, and move
through outline or chapter structure while viewing the dogfood talk in a local
Remotion Player preview.

The presenter workflow extends inherited Phase 1 runtime metadata. It must not
rewrite frozen Phase 1 semantics unless a superseding ADR and explicit
maintainer approval exist.

## Approved Design Decisions

The maintainer approved the Stage A recommendations on 2026-05-23.

### Presenter Surface Shape

1. A same-browser presenter panel beside or below the local preview.
2. A separate browser route or window for presenter controls.
3. A multi-device presenter console.

**Decision**: option 1. Phase 4 ships a same-browser presenter panel. A
multi-device presenter console remains Phase 5 or later unless a later contract
supersedes this decision.

### Next Slide Affordance

1. Show next slide title and metadata only.
2. Show a lightweight next-slide preview derived from the compiled timeline.
3. Run a second live Remotion Player instance for next-slide preview.

**Decision**: option 2 where it can remain deterministic without creating a
second authoritative runtime. If lightweight visual preview is too costly, the
minimum acceptable fallback is title and metadata from the same runtime source.

### Outline and Chapter Data Source

1. Derive outline entries from slide IDs and titles only.
2. Add optional chapter or section metadata on existing typed TSX surfaces.
3. Add a new top-level `<Chapter>` primitive.

**Decision**: option 2. Phase 4 adds optional chapter or section metadata on
existing typed surfaces instead of adding a new primitive.

## Requirements

- **ID**: PRES-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The presenter workflow MUST expose current slide, current
  step, speaker notes, and elapsed time by reusing inherited runtime metadata
  rather than deriving a parallel presenter state model.
- **Verification**: acceptance scenario `TC-PRES-001` navigates the dogfood
  talk and asserts presenter metadata stays synchronized with the runtime
  cursor.

- **ID**: PRES-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The presenter workflow MUST provide current and next context
  so the maintainer can see what is on screen now and what comes next before
  advancing.
- **Verification**: acceptance scenario `TC-PRES-001` verifies current and next
  context across at least one slide boundary and one step boundary.

- **ID**: PRES-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Speaker notes MUST be visible in the presenter workflow and
  MUST NOT affect compiled timeline duration.
- **Verification**: acceptance scenario `TC-PRES-001` asserts notes are visible
  for the active slide and timeline anchors remain unchanged by notes.

- **ID**: PRES-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The presenter workflow SHOULD expose an outline or chapter
  list that allows navigation to stable semantic destinations through Cadenza
  runtime `goto` behavior, not direct frame math in UI code.
- **Verification**: acceptance scenario `TC-PRES-002` selects an outline or
  chapter item and observes runtime-mediated navigation to the expected cursor.

- **ID**: PRES-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Presenter controls SHOULD include next, previous, restart or
  jump-to-start, and pause/resume affordances where they map to existing runtime
  or Player capabilities.
- **Verification**: acceptance scenario `TC-PRES-002` exercises controls and
  confirms they resolve through runtime or Player APIs without custom frame
  derivation.

- **ID**: PRES-006
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Presenter workflow state SHOULD expose preview diagnostics or
  layout state that affect presenting, including loading, overflow, and visual
  acceptance findings where available.
- **Verification**: acceptance scenario `TC-VARR-001` records or inspects
  presenter-visible diagnostics during the dogfood review.

## Frozen Decisions

- **ID**: FC-PRES-01
- **Decision**: Phase 4 ships presenter workflow as a same-browser panel.
- **Rationale**: It proves the product-layer workflow with the least state and
  synchronization risk. Multi-device presenting belongs after local dogfooding
  is proven.

- **ID**: FC-PRES-02
- **Decision**: Phase 4 targets lightweight next-slide context derived from the
  same compiled/runtime source, without a second authoritative Player runtime.
- **Rationale**: Presenters need next context, but a second live Player would
  add synchronization complexity before the local product layer is stable.

- **ID**: FC-PRES-03
- **Decision**: Outline and chapters use optional chapter or section metadata on
  existing typed TSX surfaces.
- **Rationale**: This gives Phase 4 chapter-level product semantics without
  freezing a new top-level primitive too early.
