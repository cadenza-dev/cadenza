---
name: render-safe-components
description: Use Cadenza render-safe components for images, fonts, videos, and future bounded content checks.
---

# Render-Safe Components

Use this skill when adding media, fonts, videos, or content regions that can
affect preview/export reliability.

## Core Rules

- Prefer render-safe components such as `SafeImage`, `SafeFont`, and
  `SafeVideo` for external resources.
- Keep render-safe declarations inside typed API slides and steps so the
  compiler can collect resource readiness requirements.
- Use stable resource ids; avoid generated ids that change between preview and
  export.
- Choose timeouts that reflect expected loading behavior and let diagnostics
  guide repair when resources fail.
- Do not replace render-safe readiness with raw Remotion primitives like
  `delayRender` or `continueRender` unless there is no render-safe API for the
  behavior.

## Authoring Checklist

- Every external image, font, or video has an explicit render-safe declaration.
- Loading failures produce visible degraded state or structured diagnostics.
- Resource readiness remains independent from slide transition timing.
- Escape hatches include a `// why:` comment and should be candidates for a
  future render-safe abstraction.
