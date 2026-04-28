# Browser Preview

Browser preview is where Cadenza proves DOM-observable behavior that plain unit
tests cannot see.

## Use Browser Coverage For

- Typography overflow measurement.
- Media-frame aspect ratio measurement.
- Font visibility while readiness is pending.
- Video metadata readiness.
- Keyboard navigation through real browser events.
- Click-region hit testing with real coordinates.
- Fullscreen capability smoke checks.

## Keep Boundaries Honest

- Browser preview is not MP4/PDF export.
- Controlled fixtures are useful, but public adapters should own behavior when
  possible.
- Generated browser bundles belong in ignored temporary output, not source.

## Review Questions

- Does the test exercise public Cadenza behavior, or only a hand-written test
  harness?
- Are measurements tied to stable source IDs?
- Can a failed browser check become a useful diagnostic or repair queue item?
