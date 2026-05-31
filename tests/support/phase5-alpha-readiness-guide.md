# Phase 5 Public Launch Candidate

This historical fixture preserves the Phase 5 clean-checkout launch-candidate
guide that the Phase 5 acceptance tests compare against. The active alpha guide
has moved to durable Cadenza/local-export naming.

## Public Surface

- `@cadenza-dev/core`
- `@cadenza-dev/preview-remotion`
- `cadenza-best-practices`

## Clean-Checkout Path

```bash
pnpm cadenza export phase5-alpha-readiness-talk --run-id local-alpha
```

Evidence command: `inspect dist/phase5/phase5-alpha-readiness-talk/local-alpha/`.
