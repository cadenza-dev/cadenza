# Data Explainers

Use this rule when a technical talk needs to explain metrics, trend lines,
architecture measurements, experiment results, or benchmark comparisons.
Phase 3 keeps this as guidance inside `cadenza-best-practices` and does not create
a separate skill or chart package.

## Do

- Start with chart/story framing: name the question, the comparison, and the
  audience takeaway before choosing a visual shape.
- Use bounded labels with stable IDs so overflow can become diagnostics instead
  of clipped text.
- Put speaker-only interpretation in `Notes`, not hidden visual text.
- Prefer render-safe composition with `ContentSlot`, `TypographyBox`,
  `MediaFrame`, `SafeImage`, and public Cadenza primitives.
- Keep labels, legends, and callouts short enough to survive preview resizing.
- Use `Step` to reveal the comparison or threshold when the explanation needs
  pacing.

## Avoid

- Creating a dedicated chart package or separate data-viz skill in Phase 3.
- Pulling in raw visualization libraries before a static render-safe slice has
  proven insufficient.
- Treating screenshots as evidence when the source data, labels, or diagnostic
  IDs would be more repairable.
- Claiming export, presenter product completeness, or hosted rendering because
  a previewable data slide exists.

## Repair Pattern

When a data-explainer slide fails preview, inspect diagnostics by stable source
ID first. Repair bounded labels, content density, or media framing before
changing the story. Re-run compile and preview checks after the focused repair.
