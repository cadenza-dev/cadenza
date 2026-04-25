---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 1 Typed API Specification

## Purpose

This frozen contract defines the public TSX authoring surface for Phase 1. The
API is intentionally thin: it encodes presentation semantics, then hands
timeline behavior to the compiler and resource safety to the render-safe layer.

## Resolved Design Options

### Primitive Shape

1. Component-only API: authors compose `<Deck>`, `<Slide>`, `<Step>`,
   `<Transition>`, `<Notes>`, and `<Theme>`.
2. Component API plus JSON metadata companion.
3. Builder-function API that returns a serializable deck object.

**Decision**: component-only API for Phase 1, with JSON metadata deferred until validation needs it.

### Step Authoring

1. Static child nodes only.
2. Render-function child receiving step context.
3. Both forms.

**Decision**: support both static children and render-function children. Static children preserve authoring ergonomics; render functions give agents and advanced authors a stable way to access step context.

### Escape Hatch

1. Raw Remotion import allowed silently.
2. Raw Remotion import allowed but documented as an escape hatch.
3. Raw Remotion import requires an explicit `<RawRemotion>` wrapper.

**Decision**: raw Remotion is a documentation-only escape hatch in Phase 1. Tooling-level lint warnings are deferred to Phase 2 AI-authoring strengthening.

## Requirements

- **ID**: TAPI-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 1 MUST expose `Deck`, `Slide`, `Step`, `Transition`, `Notes`, and `Theme` as the first public typed API primitives.
- **Verification**: Type tests import every primitive from the public package entry point.

- **ID**: TAPI-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `Deck` MUST accept deck-level `fps`, `theme`, and navigation policy inputs; `fps` MUST compile to one deck-wide frame grid.
- **Verification**: Type test plus compiler fixture asserts `fps` is present in the resulting TimelineMap.

- **ID**: TAPI-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `Slide` MUST provide a stable `id`, optional `duration`, and presenter metadata slots.
- **Verification**: Compiler fixture asserts slide ID and metadata collection.

- **ID**: TAPI-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `Step` MUST support `fixed`, `wait-for-event`, and `computed` step kinds consistent with the frozen compiler design.
- **Verification**: Unit tests compile one deck fixture per step kind.

- **ID**: TAPI-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `Transition` MUST declare transition kind and duration without implementing interpolation itself.
- **Verification**: Unit test asserts transition declarations are collected without invoking Remotion animation primitives.

- **ID**: TAPI-006
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: `Notes` SHOULD attach presenter notes to the containing slide and MUST NOT affect timeline duration.
- **Verification**: Compiler fixture asserts notes exist in metadata and do not change frame anchors.

- **ID**: TAPI-007
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: `Theme` SHOULD expose tokens for color, typography, spacing, and motion timing without becoming a design system.
- **Verification**: Type tests assert token shape and absence of required component styling dependencies.

- **ID**: TAPI-008
- **Priority**: P2
- **Owner**: Architect -> Builder
- **Statement**: The typed API MAY support MDX-generated TSX as long as runtime execution remains TSX-first.
- **Verification**: Manual compatibility note in Phase 1 docs; no implementation required for MVP.

## Frozen Decisions

- **ID**: FC-TAPI-01
- **Decision**: `Step` supports both static children and render-function children in Phase 1.
- **Rationale**: static children keep simple decks concise, while render-function children provide a stable context surface for step-aware authoring.

- **ID**: FC-TAPI-02
- **Decision**: raw Remotion usage remains a documentation-only escape hatch in Phase 1; non-blocking lint warnings are deferred to Phase 2.
- **Rationale**: Phase 1 must prove the typed API path without prematurely constraining legitimate escape-hatch cases. Phase 2 is the better home for warning tooling because it focuses on AI authoring repair loops.
