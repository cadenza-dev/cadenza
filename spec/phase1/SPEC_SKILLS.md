---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 1 Skills Specification

## Purpose

Phase 1 ships AI-facing guidance before MCP. The initial skill pack constrains
agent output toward the typed API, render-safe components, and validation repair
loop.

## Stage A Options

### Initial Skill Count

1. Five skills, matching the roadmap minimum.
2. Seven skills, matching the full analysis roster.
3. One monolithic Cadenza authoring skill.

**Leaning**: option 1 for MVP; split carefully rather than ship weak extras.

### Skill Distribution

1. Claude-only skills.
2. Markdown source with generated adapters for multiple agents.
3. Plain docs only.

**Leaning**: option 2 once infrastructure exists; Phase 1 may start with local skills.

## Requirements

- **ID**: SKIL-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 1 MUST ship at least five high-quality authoring skills.
- **Verification**: Repository check confirms five skill directories or equivalent docs exist.

- **ID**: SKIL-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The skill pack MUST include `layout-composition`, `motion-transitions`, `speaker-notes`, `render-debugging`, and `render-safe-components`.
- **Verification**: Skill inventory test or docs check.

- **ID**: SKIL-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Skills MUST instruct agents to prefer typed API and render-safe components over raw Remotion primitives.
- **Verification**: Skill content lint checks for required guidance.

- **ID**: SKIL-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Skills SHOULD include anti-patterns for overflow, asset loading, timing, and direct frame-coordinate manipulation.
- **Verification**: Skill content review checklist.

- **ID**: SKIL-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Skills SHOULD include a validate-and-repair loop using structured diagnostics.
- **Verification**: End-to-end agent workflow dry run once validation exists.

- **ID**: SKIL-006
- **Priority**: P2
- **Owner**: Architect -> Builder
- **Statement**: Skills MAY be mirrored into other agent formats after the canonical source is stable.
- **Verification**: Adapter generation check if implemented.

## Freeze Candidates

- **FC-ID**: FC-SKIL-01
- **Question**: Should `data-viz-slides` be in the first five skills or deferred?
- **Options considered**:
  1. Include in first five.
  2. Defer to Phase 2.
  3. Fold into layout-composition.
- **Leaning**: defer to Phase 2 unless alpha examples demand it.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-SKIL-02
- **Question**: What is the canonical skill source format?
- **Options considered**:
  1. `.agents/skills` source of truth.
  2. `.claude/skills` source of truth.
  3. Docs-first source with generated skills.
- **Leaning**: `.agents/skills` source of truth, mirroring as needed.
- **Must resolve before**: Stage B freeze.
