---
name: render-debugging
description: Debug Cadenza compile, preview, and export failures through validation diagnostics and render-safe readiness signals.
---

# Render Debugging

Use this skill when a deck fails to compile, preview, export, or reach a stable
render-ready state.

## Core Rules

- Start from typed API inputs and compiler output before changing slide content.
- Run validation and inspect structured diagnostics before guessing at fixes.
- Treat fatal diagnostics as authoring errors that must be fixed before export.
- Treat render-safe readiness timeouts as asset or environment issues, not as a
  reason to bypass readiness checks.
- Do not paper over failures with raw Remotion primitives such as `delayRender`,
  `continueRender`, or `useCurrentFrame` unless the typed API and render-safe
  layer cannot represent the needed behavior.

## Debugging Checklist

- Confirm every slide has a unique `id`.
- Confirm nested `Deck` nodes are absent.
- Confirm `Step` kinds are valid and durations parse as expected.
- Confirm each render-safe resource has a stable resource id and appropriate
  timeout.
- If an escape hatch is needed, add a `// why:` comment and keep the raw
  Remotion primitive locally contained.

## Validate-And-Repair Loop

Use this validate-and-repair loop before changing code or deck structure:

1. Run compile-time validation and preview validation.
2. Pass collected diagnostics to `createValidationReport` when available, then
   use its `repairQueue` as the ordered repair plan.
3. If the report helper is unavailable, group structured diagnostics by
   `requirementId`, `code`, and `source`.
4. Repair the typed API authoring first: missing IDs, duplicate IDs, invalid
   Step kinds, nested Decks, and unsupported raw Remotion primitives.
5. Repair render-safe issues next: unresolved assets, overflow, and readiness
   timeouts.
6. Re-run validation after each repair so the next change responds to current
   diagnostics rather than stale guesses.

Prefer small repairs that preserve author intent. If diagnostics point to a
missing abstraction, add a focused Cadenza helper instead of scattering raw
Remotion escape hatches through the deck.
