---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 1 Skills Specification

## Purpose

This frozen contract ships AI-facing guidance before MCP. The initial skill pack constrains
agent output toward the typed API, render-safe components, and validation repair
loop.

## Resolved Design Options

### Initial Skill Count

1. Five skills, matching the roadmap minimum.
2. Seven skills, matching the full analysis roster.
3. One monolithic Cadenza authoring skill.

**Decision**: ship five skills for MVP; split carefully rather than ship weak extras.

### Skill Distribution

1. Claude-only skills.
2. Markdown source with generated adapters for multiple agents.
3. Plain docs only.

**Decision**: use Markdown skill sources that can be mirrored into multiple agent formats once infrastructure exists; Phase 1 may start with local skills.

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

## Frozen Decisions

- **ID**: FC-SKIL-01
- **Decision**: defer `data-viz-slides` to Phase 2 unless alpha examples create a direct MVP need.
- **Rationale**: Phase 1 skills should protect the core authoring loop first; data visualization deserves dedicated treatment once the core loop works.

- **ID**: FC-SKIL-02
- **Decision**: `.agents/skills` is the canonical skill source, mirrored into agent-specific formats as needed.
- **Rationale**: `.agents/skills` is tool-neutral enough to avoid making Claude-specific paths the cross-agent source of truth.
