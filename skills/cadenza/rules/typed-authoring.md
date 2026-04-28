# Typed Authoring

Use Cadenza's typed TSX surface as the authoring spine. A deck should read like
a semantic talk outline first and like animation code second.

## Do

- Use one top-level `Deck`.
- Give every `Slide` a stable, human-readable `id`.
- Use `Step` for reveals and state changes, not for arbitrary frame math.
- Use `Notes` for presenter-only guidance instead of hidden visual text.
- Use `Theme` for reusable color, typography, spacing, and motion tokens.
- Keep raw Remotion imports out of ordinary deck files.

## Avoid

- Nested `Deck` nodes.
- Generated slide IDs that change across runs.
- Embedding presenter script text into visible slide content.
- Treating JSX as a loose HTML canvas. Cadenza TSX is a typed authoring
  contract; invalid structure should be caught before preview.

## Review Questions

- Can an agent understand the slide sequence from the `Slide` and `Step`
  structure alone?
- Are IDs stable enough for diagnostics, browser measurements, and presenter
  metadata?
- Does the deck keep current-phase export limits honest?
