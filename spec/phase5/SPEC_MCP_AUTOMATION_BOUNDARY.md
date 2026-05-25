---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 5 MCP and Automation Boundary Specification

## Purpose

This frozen contract defines how Phase 5 evaluates read-only MCP resources and
tool-based MCP. MCP is not a goal by itself. For the launch-candidate push,
quickstart quality, examples, export evidence, and repair guidance are higher
leverage than early tool-server surface area. MCP is useful only if the
validation, preview, export, and repair-report capabilities have stable
semantics worth exposing across agents or IDEs.

This contract inherits ADR 0003's skills-first decision and Phase 4's
disposition that read-only MCP is a Phase 5-start evaluation item, while
tool-based MCP remains out of scope until local capabilities stabilize.

## Approved Design Decisions

The maintainer approved the launch-candidate decisions on 2026-05-26.

### Read-Only MCP Resources

1. Defer read-only MCP and continue using Markdown, examples, and the mono-skill
   as direct context.
2. Add read-only MCP resources and prompts for stable Phase 4/5 examples,
   visual/export evidence, and guidance.
3. Add a broad MCP corpus over the whole repository.

**Decision**: option 1 by default. Option 2 is allowed only if Phase 5
launch-candidate docs and evidence become too large or brittle for practical
Markdown context injection.

### Tool-Based MCP

1. Defer tool-based MCP beyond Phase 5.
2. Contract tool-based MCP after validation, preview, export, and report
   commands are stable, but leave implementation to a later Builder batch.
3. Implement tool-based MCP in the first Phase 5 Builder slice.

**Decision**: option 1 for Phase 5 implementation. Tool-based MCP moves to
Phase 7 or later after the local commands are stable and public-facing.

### MCP Inventory

1. Expose only resources and prompts.
2. Expose resources, prompts, and tools for stable local commands.
3. Expose internal package functions directly.

**Decision**: option 1 only if MCP is included at all during Phase 5. Stable
local command tools belong to a later phase.

## Requirements

- **ID**: MCPA-001
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 SHOULD evaluate whether read-only MCP resources and
  prompts are justified by practical context-injection limits in Phase 4
  examples, visual acceptance records, Phase 5 export evidence, and
  `cadenza-best-practices` guidance.
- **Verification**: acceptance scenario `TC-MCPA-001` records the read-only MCP
  disposition and rationale.

- **ID**: MCPA-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Tool-based MCP MUST NOT be implemented in Phase 5. It is
  deferred until a later phase can wrap stable local validation, preview,
  export, and report commands.
- **Verification**: acceptance scenario `TC-MCPA-002` scans for tool-based MCP
  implementation and validates its route against frozen scenarios.

- **ID**: MCPA-003
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Any MCP resource, prompt, or tool included in Phase 5 SHOULD
  expose stable contract-defined concepts rather than mutable internal package
  implementation details.
- **Verification**: acceptance scenario `TC-MCPA-001` checks MCP inventory
  entries against spec-defined inputs and outputs.

- **ID**: MCPA-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 5 MCP work MUST NOT expose hosted rendering,
  commercial-tier workflows, WYSIWYG editing, template marketplace,
  collaboration, comments, SSO, i18n infrastructure, or direct external
  publishing capabilities.
- **Verification**: acceptance scenario `TC-MCPA-002` scans MCP artifacts and
  automation docs for prohibited capabilities.

- **ID**: MCPA-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: If read-only MCP or tool-based MCP remains deferred, Phase 5
  SHOULD record the deferral with target phase or condition and rationale in
  WIP planning or closeout evidence.
- **Verification**: acceptance scenario `TC-MCPA-001` checks the WIP or trace
  disposition for deferred MCP scope.

## Frozen Decisions

- **ID**: FC-MCPA-01
- **Decision**: Phase 5 defers read-only MCP by default and continues using
  Markdown, examples, and mono-skill context. Focused read-only resources may be
  added only if launch-candidate evidence exceeds practical Markdown context
  injection.
- **Rationale**: The launch-candidate bottleneck is public developer experience,
  not MCP infrastructure.

- **ID**: FC-MCPA-02
- **Decision**: Tool-based MCP is deferred beyond Phase 5.
- **Rationale**: Tool-based MCP should wrap stable public local commands, not
  freeze command semantics while the launch path is still settling.

- **ID**: FC-MCPA-03
- **Decision**: If Phase 5 includes MCP at all, it may expose only resources
  and prompts. Stable local command tools move to Phase 7 or later.
- **Rationale**: Direct tool surfaces are premature before the local launch
  commands and evidence schema stabilize.
