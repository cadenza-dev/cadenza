# Phase 1 Exit Demo Handoff

> Batch: B1.4-C Phase exit demo / export path
> Fixture: agent-authored technical talk from
> `packages/core/src/fixtures/allDomainMvp.ts`

## Deterministic TimelineMap

The all-domain MVP fixture compiles to deterministic preview and offline
TimelineMap signatures.

- preview total frames: 168
- offline total frames: 192
- fps: 12
- slide order: `opening`, `render-safe-demo`, `agent-repair-loop`
- offline `wait-for-event` handoff: `render-safe-demo` step 1 uses the authored
  `exportDuration` and occupies frames `[72, 120)`.

## Browser Preview Boundary

Browser-observable Phase 1 preview checks remain covered by:

```bash
pnpm test:browser
```

This command verifies typography overflow measurement, click-region routing,
fullscreen capability smoke, keyboard navigation, controlled font/video
readiness, and MediaFrame aspect-ratio measurement.

## Export Handoff Boundary

B1.4-C produces a Phase 1 handoff boundary, not a true renderer/export feature.
The supported handoff artifacts are:

- the all-domain offline TimelineMap signature;
- the validation report and repair queue;
- the browser preview verification command and result.

No MP4/PDF export support is claimed in Phase 1. True video or PDF rendering
remains out of scope until the repo implements and verifies a renderer/export
pipeline.
