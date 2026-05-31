# Phase 6.5 Roadmap - Alpha Surface Naming Hygiene

> Status: WIP planning note, not a contract.
> Created: 2026-06-01.
> Source: maintainer request after Phase 6 CLI closeout assessment.

## Purpose

Phase 6.5 is a hardening interlude between the working local CLI/export engine
and the Phase 7 Player App alpha. It should remove development-phase coupling
from the CLI/export public-ish surface before Cadenza asks alpha users or agents
to treat the workflow as a product surface.

This phase does not need to redesign export behavior or build the Player App.
It does need a focused naming and boundary cleanup so Phase 7 starts from
`Cadenza`-named APIs, diagnostics, and examples rather than Phase 5 or Phase 6
scaffolding.

## Thesis

Phase 6 proved that the local CLI can validate, export, inspect, and render real
local MP4 output. The remaining issue is product posture: several package exports,
entrypoints, diagnostics, fixture helpers, and built-in selectors still encode
`Phase5` or `Phase6`. That is acceptable for phase trace, historical tests, and
frozen specs, but it should not remain in the alpha-facing CLI/export surface.

## Candidate Scope

- Legacy Phase 5 export surface removal: stop re-exporting `legacyPhase5.ts`
  helpers from the root CLI wrapper or `@cadenza-dev/export-local` package
  barrel. Keep historical Phase 5 tests working through test-owned helpers or an
  explicitly internal import path.
- Generic CLI naming migration: rename current `Phase6` CLI entrypoints,
  diagnostics, exit-code constants, schema helpers, deck metadata, runtime config,
  and read helpers to durable Cadenza or local-export names.
- User-visible text cleanup: remove Phase 6 wording from active config,
  validation, export, inspect, renderer, and machine-output messages unless the
  text is explicitly describing a historical phase artifact.
- Renderer and evidence naming cleanup: replace phase-coded composition,
  provenance, manifest, and evidence helper names with product-stable local
  export names while preserving the existing schema meaning.
- Canonical alpha deck posture: replace the built-in Phase 5 demo as the default
  alpha selector, or explicitly mark it as a historical fixture while introducing
  a product-neutral canonical deck path for Phase 7.
- Test and documentation rerouting: update acceptance tests, browser tests,
  clean-checkout docs, and package-boundary assertions so they import the formal
  names. Historical file names under `tests/**`, `trace/**`, and `spec/**` may
  remain phase-coded when they describe historical phase evidence.

## Non-Goals

- No Cadenza Player App design or implementation.
- No visual-fidelity export redesign.
- No new export formats or hosted rendering.
- No npm publication or public package release.
- No change to existing export behavior unless required by the naming boundary.
- No edits to frozen specs or Accepted ADRs unless a separate maintainer-approved
  governance correction requires it.
- No deletion of historical Phase 5 or Phase 6 trace, spec, evidence, or review
  records.

## Promotion Triggers

- Phase 6 has a working local CLI/export engine, but the exported package surface
  still contains `Phase5` and `Phase6` identifiers.
- Phase 7 intends to present Cadenza as a credible public alpha surface, making
  phase-coded public names a product and agent-guidance liability.
- The relevant packages are still private `0.0.0` workspace packages, so durable
  renaming is cheaper now than after alpha users or docs depend on the old names.

## Exit Evidence

- `scripts/cadenza.ts` delegates to a formally named CLI entrypoint and no longer
  re-exports Phase 5 helpers.
- `@cadenza-dev/cli` exposes formally named CLI APIs such as `runCadenzaCli`
  rather than `runPhase6Cli`.
- `@cadenza-dev/export-local` exposes formally named export, diagnostics,
  manifest, config, and renderer types. `Phase5` helpers are absent from the
  package barrel.
- Active CLI human output, JSON summaries, diagnostics, and repair hints do not
  describe current config or export failures as Phase 6 behavior.
- Legacy Phase 5 acceptance and browser tests still pass through test-owned or
  internal compatibility helpers.
- Historical `Phase5` and `Phase6` strings remain only where they are
  intentionally historical: frozen specs, trace archives, phase-named tests,
  review notes, and phase planning documents.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`, and
  `pnpm check:memory` remain green or have an explicit maintainer-approved
  waiver.

## Phase 7 Handoff

Phase 7 should start from a product-stable CLI/export naming surface. It can then
focus on Player App architecture, app-based web export, visual-fidelity posture,
and alpha material without asking users or agents to distinguish current Cadenza
APIs from Phase 5 or Phase 6 implementation history.
