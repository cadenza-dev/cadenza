# Layout Composition

Layout work should make information easier to scan and harder to break during
preview. Prefer stable semantic regions over screenshot-perfect positioning.

## Do

- Use `Theme` tokens for repeated visual decisions.
- Put bounded text inside `TypographyBox` when overflow matters.
- Use `ContentSlot` to record density and readability intent.
- Keep each slide focused on one visual job.
- Split dense content into steps when a single frame becomes fragile.

## Avoid

- Shrinking type blindly to hide overflow.
- Clipping text just because the current screenshot looks acceptable.
- Copying inline spacing values across slides instead of naming a token.
- Using decorative regions for body copy that must remain readable.

## Repair Pattern

When text overflows, first decide whether the issue is content length, layout
shape, reveal pacing, or typography. Use `TypographyBox` diagnostics to choose
the repair; do not start by reducing font size.
