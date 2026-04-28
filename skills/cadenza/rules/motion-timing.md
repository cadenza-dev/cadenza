# Motion Timing

Cadenza motion should preserve semantic navigation. The compiler and runtime can
only keep cursor metadata honest when timing intent is expressed through typed
steps and transitions.

## Step Kinds

- Use `fixed` for normal timed reveals.
- Use `wait-for-event` for authored pauses in live preview. Add
  `exportDuration` when offline export needs deterministic duration.
- Use `computed` only for content that genuinely depends on async or derived
  state. Keep unresolved computed steps diagnosable.

## Navigation

- Set deck-level `navigationPolicy` when the default is not enough.
- Keep transition timing monotonic.
- Treat direct frame-coordinate manipulation as an escape hatch, not a design
  style.

## Avoid

- Solving reveal order with `useCurrentFrame` or raw frame counters.
- Stretching transitions to wait for media readiness.
- Hiding resource loading inside motion timing. Resource readiness belongs in
  render-safe declarations and diagnostics.
