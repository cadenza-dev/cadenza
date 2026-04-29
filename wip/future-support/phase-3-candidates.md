# Phase 3 Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-04-25.
> Reclassified: 2026-04-29 after `fb8a408 docs: revise roadmap phase
> sequencing`.

These items fit Phase 3 because the current roadmap defines Phase 3 as **AI
Authoring Strengthening**: compile -> error -> repair loop,
`cadenza-best-practices` rule/eval expansion, thin IR if earned, and optional
read-only MCP.

## Raw Remotion lint or diagnostic warnings

- **Source**: `spec/phase1/SPEC_TYPED_API.md` `FC-TAPI-02`.
- **Frozen Phase 1 decision**: raw Remotion remains a documentation-only escape
  hatch.
- **Future support**: add non-blocking lint or diagnostic warnings for raw
  Remotion usage during Phase 3 AI-authoring strengthening.
- **Reason to defer**: Phase 3 owns the local repair loop and is the better
  place to turn escape-hatch guidance into machine-readable agent feedback.
- **Disposition**: keep.

## Data visualization authoring guidance

- **Source**: `spec/phase1/SPEC_SKILLS.md` `FC-SKIL-01`,
  `goals-non-goals.md` ambiguous case for data visualization components, and
  ADR 0014's mono-skill decision.
- **Frozen Phase 1 decision**: `data-viz-slides` is not part of the first
  authoring surface unless examples prove it essential.
- **Future support**: expand `cadenza-best-practices` with data-explainer
  rules, examples, and eval prompts before adding a dedicated charts package or
  separate skill.
- **Reason to defer**: technical talks often need charts, but data visualization
  can become a deep component-design surface. Phase 3 should first prove that
  agents can repair real authoring failures through the mono-skill.
- **Disposition**: keep, but delete the old "dedicated Phase 2 skill" framing.

## Thin IR and richer validation or repair reports

- **Source**: `spec/phase1/SPEC_VALIDATION.md` `VAL-006`, Phase 2 preview
  diagnostics, and `ROADMAP.md` Phase 3.
- **Frozen Phase 1 decision**: validation may expose a machine-readable report,
  but the MVP does not require a full repair-oriented IR.
- **Future support**: introduce a thin IR and diagnostic report shape only if
  Phase 3 repair scenarios prove that the existing validation report is not
  enough.
- **Reason to defer**: the IR should be based on real agent repair failures, not
  invented ahead of the local loop.
- **Disposition**: keep.

## Read-only MCP for resources and prompts

- **Source**: ADR 0003 and `ROADMAP.md` Phase 3.
- **Frozen Phase 1 decision**: skills and instructions come before MCP.
- **Future support**: add a read-only MCP server when docs, examples, rules, and
  generated assets outgrow plain Markdown context injection.
- **Reason to defer**: MCP maintenance does not pay back until reusable dynamic
  lookup becomes a real bottleneck across agents or IDEs.
- **Disposition**: keep as optional Phase 3 scope. Tool-based MCP remains later
  unless export and preview tooling create a concrete shared capability need.

## Moved Out Of Phase 3

- Typography auto-fit and density engine moved to Phase 4 product-layer
  planning.
- Full presenter view moved to Phase 4 product-layer planning.
- Multi-locale timeline compilation moved to conditional-or-later planning
  because current `ROADMAP.md` explicitly defers i18n infrastructure
  indefinitely.
