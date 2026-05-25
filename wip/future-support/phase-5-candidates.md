# Phase 5 Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-04-30.

These items fit Phase 5 because the current roadmap defines Phase 5 as
**Export + 0.1 Alpha Readiness**: local/web/MP4/PDF export, Remotion Lambda
evaluation, multi-device presenter console if justified, and tool-based MCP if
justified.

## Read-only MCP resources and prompts evaluation

- **Source**: `spec/phase3/SPEC_AI_BOUNDARIES.md` `FC-AIBND-02`,
  `wip/future-support/phase-4-candidates.md`, and
  `spec/phase4/SPEC_TECHNICAL_TALK_STARTERS.md` `FC-STAR-03`.
- **Frozen Phase 3 decision**: Phase 3 defers read-only MCP and relies on
  `cadenza-best-practices`, Markdown docs, examples, and local reports.
- **Phase 4 frozen disposition**: Phase 4 may evaluate read-only MCP at
  closeout, but the frozen contract does not implement it during the product
  layer build.
- **Future support**: consider read-only MCP resources and prompts at Phase 5
  startup if Phase 4 starters, examples, visual acceptance records, and
  guidance have outgrown practical Markdown context injection across agents.
- **Reason to defer**: read-only MCP should expose stable resources and prompts.
  Phase 4 still needs to prove which product-layer examples and visual
  acceptance records are worth standardizing.
- **Disposition**: keep as Phase 5-start evaluation candidate.

## Tool-based MCP for stable local capabilities

- **Source**: `spec/phase3/SPEC_AI_BOUNDARIES.md` `FC-AIBND-02`,
  `ROADMAP.md` Phase 5, and `docs/analysis/analysis-final.md` §5.
- **Frozen Phase 3 decision**: Phase 3 does not implement tool-based MCP
  operations such as `validate_deck`, `render_preview`, or
  `inspect_composition`.
- **Future support**: consider tool-based MCP in Phase 5 or later after local
  validation, preview, export, and repair-report commands are stable enough to
  expose through a shared capability surface across agents or IDEs.
- **Reason to defer**: tool-based MCP should wrap stable capabilities. Building
  it before validation, preview, export, and report semantics settle would
  freeze the wrong API.
- **Disposition**: keep.

## 2026-05-26 Phase 5 Stage B disposition

Phase 5 Architect resolved these candidates in
`spec/phase5/SPEC_MCP_AUTOMATION_BOUNDARY.md`:

- Read-only MCP resources and prompts are deferred by default. Phase 5 may add
  focused read-only resources only if launch-candidate evidence outgrows
  practical Markdown context injection.
- Tool-based MCP is deferred beyond Phase 5. It should wrap stable local
  validation, preview, export, and report commands only after the public launch
  path has settled.
- If MCP appears at all during Phase 5, it is limited to resources or prompts
  that expose contract-defined concepts rather than mutable package internals.

Follow-up owner: future Architect, likely Phase 7 or later, after Phase 5 and
Phase 6 prove that local command semantics are stable enough to expose across
agents or IDEs.
