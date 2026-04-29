---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 3 AI Boundaries Specification

## Purpose

This frozen contract defines what Phase 3 AI-authoring strengthening may and may
not do. It keeps the phase focused on local authoring, preview, diagnostics, and
repair while preserving raw Remotion escape hatches and the skills-first MCP
decision.

## Resolved Design Options

### Raw Remotion Warning Policy

1. Keep raw Remotion as documentation-only guidance.
2. Emit non-blocking diagnostics or lint warnings for agent-authored decks that
   import raw Remotion primitives without an explicit reason.
3. Hard-fail raw Remotion imports.

**Decision**: use option 2. Agents benefit from machine-readable warnings, but
legitimate escape hatches must remain available.

### Read-Only MCP Boundary

1. Defer MCP entirely and keep `cadenza-best-practices` plus Markdown context as
   the AI surface.
2. Add a read-only MCP surface exposing resources and prompts only.
3. Add tool-based MCP operations such as validation, preview rendering, or
   composition inspection.

**Decision**: use option 1. Phase 3 defers read-only MCP and tool-based MCP.
Read-only MCP is routed to future support for Phase 4 late or Phase 5 start;
tool-based MCP is routed to Phase 5 or later.

## Requirements

- **ID**: AIBND-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 3 MUST NOT claim MP4 export, PDF export, hosted
  rendering, Remotion Lambda support, presenter-view product completeness,
  template marketplace support, public API stability, or external alpha usage.
- **Verification**: acceptance scenario `TC-AIBND-001` checks Phase 3 docs,
  skills, examples, and trace artifacts for prohibited claims.

- **ID**: AIBND-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Raw Remotion primitives MUST remain escape hatches rather than
  the default authoring path. Agent-authored decks SHOULD prefer typed API and
  render-safe components, and any raw Remotion use SHOULD include a short
  `// why:` reason.
- **Verification**: acceptance scenario `TC-AIBND-002` exercises the raw
  Remotion warning policy selected during Stage B.

- **ID**: AIBND-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The repair loop MUST NOT instruct agents to edit Cadenza
  framework internals as a normal deck repair. If diagnostics reveal framework
  defects, the loop must report a separate Builder issue rather than mutate the
  core during authoring repair.
- **Verification**: acceptance scenario `TC-AUTH-004` proves the repair changes
  only authored deck or authoring-guidance surfaces.

- **ID**: AIBND-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Phase 3 MUST NOT implement read-only MCP. Read-only MCP is
  deferred until the rules, examples, starters, and documentation corpus exceeds
  what Markdown context and the mono-skill can carry.
- **Verification**: acceptance scenario `TC-AIBND-003` verifies that Phase 3
  does not add read-only MCP and records the future-support routing.

- **ID**: AIBND-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: AI-facing examples and eval prompts SHOULD penalize raw
  Remotion drift, framework internal edits, export claims, and Phase 4
  product-layer claims.
- **Verification**: acceptance scenario `TC-RULE-003` inspects or runs evals
  that include those negative cases.

- **ID**: AIBND-006
- **Priority**: P2
- **Owner**: Architect -> Builder
- **Statement**: Phase 3 MUST NOT implement tool-based MCP operations such as
  `validate_deck`, `render_preview`, or `inspect_composition`. Tool-based MCP is
  deferred until local validation, preview, export, and report commands are
  stable enough to expose through a shared capability surface.
- **Verification**: acceptance scenario `TC-AIBND-003` confirms no tool-based
  MCP operations are introduced in Phase 3.

## Frozen Decisions

- **ID**: FC-AIBND-01
- **Decision**: Add non-blocking diagnostics or lint warnings for raw Remotion
  usage unless the usage has a short `// why:` reason. Do not hard-fail raw
  Remotion imports in Phase 3.
- **Rationale**: Warnings give agents machine-readable repair feedback while
  preserving the raw Remotion escape hatch for legitimate advanced cases.

- **ID**: FC-AIBND-02
- **Decision**: Defer MCP from Phase 3. Read-only MCP is future support for
  Phase 4 late or Phase 5 start. Tool-based MCP belongs to Phase 5 or later,
  once local validation, preview, export, and report commands are stable.
- **Rationale**: Phase 3 must prove the local authoring and repair loop first.
  MCP pays back when resource lookup or cross-tool actions become real
  bottlenecks, not while the authoring loop itself is still being hardened.
