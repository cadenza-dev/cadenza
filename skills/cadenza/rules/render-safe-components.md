# Render-Safe Components

Render-safe components keep preview and export failures attached to the resource
or bounded content that caused them.

Use this rule for asset loading, font loading, video metadata readiness, and any
bounded content whose browser behavior should produce structured diagnostics.

## Use

- `SafeImage` for external images and diagram assets.
- `SafeFont` for required fonts that should not flash fallback text.
- `SafeVideo` for videos whose metadata gates slide entry.
- `TypographyBox` for bounded text that should report overflow.
- `ContentSlot` for semantic density and readability metadata.
- `MediaFrame` for media aspect ratio and export snapshot expectations.

## Do

- Give resources stable IDs.
- Set timeouts that reflect expected loading behavior.
- Provide alt text for images that carry meaning.
- Keep readiness independent from slide transition timing.

## Avoid

- Replacing readiness with raw `delayRender` / `continueRender` unless no
  render-safe abstraction exists yet.
- Hiding failed assets behind screenshots without surfacing diagnostics.
- Treating `MediaFrame` as decoration when aspect ratio affects comprehension.
