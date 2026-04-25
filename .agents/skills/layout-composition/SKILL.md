---
name: layout-composition
description: Compose Cadenza slide layouts with the typed API, theme tokens, and render-safe content boundaries.
---

# Layout Composition

Use this skill when creating or revising slide structure, visual hierarchy,
spacing, theme usage, or responsive composition in a Cadenza deck.

## Core Rules

- Build decks through the typed API: `Deck`, `Slide`, `Step`, `Theme`, and
  `Transition`.
- Prefer theme tokens for color, typography, spacing, and motion instead of
  hard-coded one-off values.
- Keep each `Slide` focused on one visual intent and each `Step` focused on one
  reveal or state change.
- Prefer render-safe components for assets and bounded content regions so
  preview/export failures become structured signals instead of raw runtime
  errors.
- Avoid raw Remotion primitives for layout timing or frame math. If an escape
  hatch is unavoidable, include a short `// why:` comment explaining why the
  typed API cannot express the layout.

## Composition Checklist

- The deck has one top-level `Deck`; nested decks are invalid in Phase 1.
- Every `Slide` has a stable, unique `id`.
- Visual rhythm comes from `Theme` tokens and repeated structure, not copied
  inline constants.
- Long text is split into readable steps or notes rather than squeezed into a
  single dense frame.
- Asset-bearing regions use render-safe declarations so readiness and timeout
  diagnostics can protect export.

## Anti-Patterns

- Do not fix text overflow by shrinking type blindly, hiding content, or
  clipping the frame. Use `TypographyBox` diagnostics to see whether content
  needs a layout change, shorter copy, or a different reveal structure.
- Do not place dense body copy into a decorative layout region just because it
  fits in a screenshot. Agent-generated decks need layouts that survive browser
  preview, export, and small copy changes.
