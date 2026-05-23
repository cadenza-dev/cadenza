# Product-Layer Workflow

Use this rule for Phase 4 technical-talk starters and product-layer dogfood
workflows. The goal is a small, production-adjacent talk surface for developers,
not a broad deck product.

## Do

- Start from one narrow starter: architecture talk, data explainer, or live-demo
  talk.
- Use public Cadenza TSX, render-safe components, `Notes`, and typed product
  transitions before considering any raw Remotion escape hatch.
- Preserve presenter workflow metadata: current slide, current step, notes,
  elapsed time, current/next context, and runtime-mediated navigation.
- Add outline or chapters metadata so the presenter panel can navigate by
  authored semantics rather than UI frame math.
- Keep visual acceptance evidence tied to diagnostics, preview route, repair
  surface, and maintainer-readable summary.
- Treat typography/density findings as authored-deck repair signals before
  visual restyling.
- Use stronger transitions through `ProductTransition` and internal diagnostics;
  do not add a public transition-progress callback.
- Validate through local preview repair: run `pnpm preview:phase4`, inspect
  presenter metadata and diagnostics, repair authored TSX or guidance, then
  re-run focused verification.

## Avoid

- Turning starters into a generic business prompt-to-deck flow.
- Creating a new starter package, template marketplace, WYSIWYG editor,
  collaboration surface, comments system, SSO, or i18n infrastructure.
- Claiming MP4/PDF export, hosted rendering, Remotion Lambda, public API
  stability, external alpha usage, read-only MCP implementation, or tool-based
  MCP support during Phase 4.
- Treating screenshots, unit tests, or trace notes alone as visual acceptance
  without real preview evidence or maintainer waiver.

## Starter Checklist

- Does the starter target developers writing a technical talk?
- Does it use public imports from `@cadenza-dev/core`?
- Are notes, outline or chapters, and local preview repair guidance visible?
- Are typography/density and transition choices diagnostic-rich?
- Are deferred scopes recorded as deferred rather than implemented?
