---
name: motion-transitions
description: Author Cadenza motion with typed steps, transitions, and navigation policy instead of raw Remotion timelines.
---

# Motion Transitions

Use this skill when adding slide transitions, step timing, or navigation behavior
to a Cadenza deck.

## Core Rules

- Express motion with the typed API: `Step`, `Transition`, deck-level
  `navigationPolicy`, and duration tokens.
- Use `Step({ kind: "fixed" })` for ordinary timed reveals.
- Use `Step({ kind: "wait-for-event" })` for authored pauses that must survive
  interactive preview.
- Use `Step({ kind: "computed" })` only when the content genuinely needs an
  async or derived state.
- Prefer Cadenza `Transition` over raw Remotion primitives such as
  `TransitionSeries`, `useCurrentFrame`, or hand-built frame switches.
- Keep render-safe asset readiness separate from motion timing; assets should
  report readiness through render-safe declarations, not hidden timeline hacks.

## Motion Checklist

- Durations use `number`, `"ms"`, or `"s"` tokens consistently.
- Transition timing does not make the compiled timeline non-monotonic.
- Navigation behavior is explicit when default `cut-to-next` is not desired.
- Any raw Remotion primitive escape hatch includes a `// why:` comment and stays
  isolated from the public authoring surface.
