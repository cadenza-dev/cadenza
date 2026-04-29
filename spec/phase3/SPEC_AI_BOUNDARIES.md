---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 3 AI Boundaries Specification

## Purpose

This draft contract defines what Phase 3 AI-authoring strengthening may and may
not do. It keeps the phase focused on local authoring, preview, diagnostics, and
repair while preserving raw Remotion escape hatches and the skills-first MCP
decision.

## Design Options

### Raw Remotion Warning Policy

1. Keep raw Remotion as documentation-only guidance.
2. Emit non-blocking diagnostics or lint warnings for agent-authored decks that
   import raw Remotion primitives without an explicit reason.
3. Hard-fail raw Remotion imports.

**Stage A leaning**: option 2. Agents benefit from machine-readable warnings,
but legitimate escape hatches must remain available.

### Read-Only MCP Boundary

1. Defer MCP entirely and keep `cadenza-best-practices` plus Markdown context as
   the AI surface.
2. Add a read-only MCP surface exposing resources and prompts only.
3. Add tool-based MCP operations such as validation, preview rendering, or
   composition inspection.

**Stage A leaning**: option 1 unless maintainer review finds that rules,
examples, and docs already exceed practical Markdown context. Option 3 is out
of Phase 3 unless explicitly approved.

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
- **Statement**: If Phase 3 includes read-only MCP, it MUST expose resources and
  prompts only. It MUST NOT expose tool-based validation, rendering, or
  inspection operations in this phase.
- **Verification**: acceptance scenario `TC-AIBND-003` either verifies the
  read-only boundary or records Stage B deferral with rationale.

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
- **Statement**: Phase 3 MAY document how a future tool-based MCP could consume
  the repair report, but it MUST NOT implement tool-based MCP without explicit
  maintainer approval.
- **Verification**: acceptance scenario `TC-AIBND-003` confirms no tool-based
  MCP operations are introduced unless separately approved.

## Freeze Candidates

- **FC-ID**: FC-AIBND-01
- **Question**: What should the raw Remotion warning policy be in Phase 3?
- **Options considered**:
  1. Documentation-only warning.
  2. Non-blocking diagnostic or lint warning unless raw usage has a `// why:`
     reason.
  3. Hard lint failure on raw Remotion imports.
- **Leaning**: option 2.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-AIBND-02
- **Question**: Should Phase 3 include read-only MCP?
- **Options considered**:
  1. Defer MCP and rely on the mono-skill plus Markdown context.
  2. Add read-only MCP resources and prompts only.
  3. Add tool-based MCP operations.
- **Leaning**: option 1 unless maintainer review identifies a real context
  retrieval bottleneck; option 3 is outside Phase 3 without explicit approval.
- **Must resolve before**: Stage B freeze.
