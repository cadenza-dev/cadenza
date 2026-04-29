# Phase 5 Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-04-30.

These items fit Phase 5 because the current roadmap defines Phase 5 as
**Export + 0.1 Alpha Readiness**: local/web/MP4/PDF export, Remotion Lambda
evaluation, multi-device presenter console if justified, and tool-based MCP if
justified.

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
