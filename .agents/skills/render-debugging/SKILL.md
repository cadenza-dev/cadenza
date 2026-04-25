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
