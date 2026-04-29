---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 3 Best Practices Rules Specification

## Purpose

This frozen contract defines how Phase 3 strengthens `cadenza-best-practices`.
The mono-skill remains the single public authoring guidance surface. Phase 3 may
add rule files, examples, and eval prompts, but it should not split back into
multiple authoring skills or create a dedicated chart package unless evidence
from repair scenarios makes that necessary.

## Resolved Design Options

### Data-Explainer Guidance Shape

1. Add a `rules/data-explainers.md` rule file plus one or more examples and
   eval prompts inside the mono-skill.
2. Add examples and eval prompts only, with no new rule file.
3. Create a separate `data-viz-slides` skill or a dedicated chart package.

**Decision**: use option 1. Technical talks often need data explainers, but the
Phase 3 move is guidance and eval coverage inside the mono-skill, not a new
package.

### Eval Evidence Depth

1. Prompt-only evals that inspect generated text for required guidance.
2. Curated qualitative benchmark with `with_skill` and `without_skill`
   comparison artifacts.
3. Full generated workspace benchmark for every eval run.

**Decision**: use option 2. The prior mono-skill eval loop showed that curated
evidence is useful without committing large generated workspaces.

## Requirements

- **ID**: RULE-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 3 MUST keep `skills/cadenza` as the canonical
  `cadenza-best-practices` authoring surface and MUST preserve generated mirror
  consistency through the existing command-sync path.
- **Verification**: acceptance scenario `TC-RULE-001` updates or inspects the
  mono-skill source and verifies `.agents` / `.claude` mirrors through the
  harness check.

- **ID**: RULE-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The skill MUST teach the Phase 3 local loop: author typed TSX,
  compile, preview, inspect diagnostics, repair the deck, and re-run checks
  without editing framework internals.
- **Verification**: acceptance scenario `TC-RULE-001` checks the skill and rule
  files for explicit local-loop routing.

- **ID**: RULE-003
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The skill SHOULD add data-explainer guidance for technical
  talks, including chart/story framing, bounded labels, notes, and render-safe
  composition. This guidance MUST stay inside the mono-skill in Phase 3.
- **Verification**: acceptance scenario `TC-RULE-002` covers a data-explainer
  authoring prompt and confirms generated guidance uses public Cadenza surfaces.

- **ID**: RULE-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The eval set SHOULD include repair-loop prompts that reward
  structured diagnostics usage and penalize raw Remotion drift, framework
  internal edits, export claims, and Phase 4 product-layer claims.
- **Verification**: acceptance scenario `TC-RULE-003` runs or inspects
  `skills/cadenza/evals/evals.json` and curated evidence for those cases.

- **ID**: RULE-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Examples added in Phase 3 SHOULD be small, runnable or
  typecheckable slices that use `Deck`, `Slide`, `Step`, `Transition`, `Notes`,
  `Theme`, and render-safe components where relevant.
- **Verification**: acceptance scenario `TC-RULE-002` validates the example
  inventory or example fixture imports.

- **ID**: RULE-006
- **Priority**: P2
- **Owner**: Architect -> Builder
- **Statement**: Phase 3 MAY add a new mono-skill rule file only when the rule
  improves authoring or repair behavior across more than one acceptance
  scenario.
- **Verification**: acceptance scenario `TC-RULE-003` records the rationale for
  any new rule file in skill evidence or trace.

## Frozen Decisions

- **ID**: FC-RULE-01
- **Decision**: Add data-explainer guidance as a mono-skill rule file, examples,
  and eval prompts. Do not create a separate skill or dedicated chart package in
  Phase 3.
- **Rationale**: Data explainers matter for technical talks, but early guidance
  should strengthen the existing authoring surface before adding new package or
  skill boundaries.

- **ID**: FC-RULE-02
- **Decision**: Require curated qualitative eval evidence with `with_skill` /
  `without_skill` comparison notes for material `cadenza-best-practices`
  changes.
- **Rationale**: Prompt-only checks are too weak, while committing every full
  generated workspace is too noisy. Curated comparison evidence matches the
  existing successful mono-skill evaluation pattern.
