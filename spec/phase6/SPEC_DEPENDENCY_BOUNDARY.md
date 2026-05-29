---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 Dependency Boundary Specification

## Purpose

This Stage A draft defines where renderer and bundler dependencies may live.
Phase 6 must isolate Remotion rendering and bundling concerns in the
CLI/export layer and keep `@cadenza-dev/core` focused on typed API, compiler,
runtime intent, render-safe metadata, and validation contracts.

## Stage A Options

### Dependency Placement

1. CLI-owned Remotion renderer and bundler dependencies.
2. Optional peer dependencies that users install separately.
3. Renderer adapter package outside `@cadenza-dev/core`.

**Stage A leaning**: a constrained combination of options 1 and 3.
`@cadenza-dev/export-local` should own the operational renderer/bundler
dependencies, with a small renderer adapter boundary that keeps core clean,
keeps `@cadenza-dev/cli` focused on command I/O, and leaves future hosted
rendering replaceable.

### Package Topology

1. Keep export code under `scripts/`.
2. Add `@cadenza-dev/cli`.
3. Add `@cadenza-dev/export` or `@cadenza-dev/export-local` plus a root CLI
   wrapper.

**Stage A correction**: option 1 is rejected as the final Phase 6 topology.
The Phase 5 root script was acceptable as a narrow proof, but a generic CLI and
local export engine will be too large and dependency-heavy for a single
`scripts/cadenza.ts` file. After Stage A brainstorming on 2026-05-29, option 3
is the recommended topology: `@cadenza-dev/cli` owns command surface and
process behavior, while `@cadenza-dev/export-local` owns local deck loading,
export execution, manifest/evidence, and renderer adapters.

## Feasibility Analysis

Moving the generic CLI/export implementation into `packages/` is feasible in
the current repository shape:

- `pnpm-workspace.yaml` already includes `packages/*`.
- `@cadenza-dev/core` and `@cadenza-dev/preview-remotion` already establish the
  workspace package pattern.
- The root `pnpm cadenza` script can delegate to the `@cadenza-dev/cli`
  package entrypoint during Phase 6 without requiring npm publication or
  global installation.
- Phase 5.5's testing taxonomy already supports package-local behavior tests,
  `tests/acceptance/` command tests, and `tests/browser/` web compatibility
  checks.
- Renderer and bundler dependencies can be kept out of `@cadenza-dev/core`
  and `@cadenza-dev/cli` when they are owned by the export-local package
  boundary.

This move does not by itself require a public package or npm publication. If
Stage B turns the new package into a public launch surface, an ADR or explicit
Stage B public-surface decision may be needed under `DBND-005`.

## Requirements

- **ID**: DBND-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `@cadenza-dev/core` MUST NOT import Remotion renderer,
  Remotion bundler, esbuild command orchestration, Node filesystem export
  writers, or CLI argument parsing as part of Phase 6 export implementation.
- **Verification**: acceptance scenario `TC-DBND-001` scans package imports and
  dependency declarations for renderer, bundler, and CLI/export leakage into
  core.

- **ID**: DBND-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Remotion renderer and bundler dependencies MUST be isolated in
  `@cadenza-dev/export-local` or an explicit renderer adapter package outside
  `@cadenza-dev/core` and outside the public CLI command package.
- **Verification**: acceptance scenario `TC-DBND-001` verifies package
  dependency placement and adapter imports.

- **ID**: DBND-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The preview package MAY keep Remotion Player peer dependency
  boundaries, but Phase 6 MP4 rendering MUST NOT require preview UI internals
  or Player App components as its export path.
- **Verification**: acceptance scenario `TC-DBND-002` checks that MP4 rendering
  routes through the export renderer adapter rather than `CadenzaPlayer` or
  Player App shell code.

- **ID**: DBND-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The renderer adapter SHOULD expose a small interface for deck
  input, timeline or composition metadata, output path, diagnostics, and
  rendered artifact evidence. It SHOULD hide whether the implementation uses
  direct APIs or a subprocess, and command/export callers SHOULD treat the
  implementation family as evidence/provenance rather than control flow.
- **Verification**: acceptance scenario `TC-DBND-002` verifies adapter-facing
  evidence and avoids assertions against private implementation details.

- **ID**: DBND-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Any package topology that changes public package posture
  SHOULD be routed through Stage B review and MAY require a Proposed ADR if it
  affects long-term packaging, licensing, or public API stability.
- **Verification**: acceptance scenario `TC-CDOC-002` checks Stage B notes or
  ADR routing if a new public package boundary is frozen.

- **ID**: DBND-006
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The final Phase 6 generic CLI/export implementation MUST be
  split across `@cadenza-dev/cli` and `@cadenza-dev/export-local` under
  `packages/`. Root scripts MAY provide clean-checkout entrypoints, but they
  MUST remain thin wrappers and MUST NOT contain the generic command parser,
  deck loader, export engine, diagnostics model, renderer adapter, or format
  evidence generator as a monolithic implementation.
- **Verification**: acceptance scenario `TC-DBND-003` verifies package
  ownership for CLI/export modules and checks that `scripts/cadenza.ts`, if it
  remains, delegates to `@cadenza-dev/cli` without retaining Phase 6 domain
  logic.

- **ID**: DBND-007
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `@cadenza-dev/cli` MUST own command registration, argument
  parsing, help/version output, human and machine output selection, and exit
  behavior. `@cadenza-dev/export-local` MUST own deck loading, export planning,
  manifest/evidence writing, artifact safety checks, and renderer adapter
  invocation. Remotion renderer or bundler dependencies MUST NOT be declared
  directly by `@cadenza-dev/cli`.
- **Verification**: acceptance scenario `TC-DBND-004` checks package
  dependency declarations and import boundaries for the CLI/export-local split.

- **ID**: DBND-008
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: MP4 renderer invocation MUST cross the renderer adapter
  boundary before touching Remotion renderer APIs, Remotion CLI subprocesses,
  browser automation, media tooling, temporary bundle directories, or raw
  renderer logs. `@cadenza-dev/core`, `@cadenza-dev/cli`, and
  `@cadenza-dev/preview-remotion` MUST NOT import or orchestrate Phase 6 local
  MP4 renderer internals.
- **Verification**: acceptance scenario `TC-DBND-005` checks import boundaries,
  dependency declarations, and absence of renderer orchestration outside
  export-local or an explicit adapter package.

## Resolved Stage A Decisions

- **Decision ID**: FC-DBND-01
- **Decision**: Renderer and bundler dependencies live in the CLI/export layer,
  with `@cadenza-dev/export-local` owning operational renderer/bundler
  dependencies behind an adapter outside `@cadenza-dev/core`.
- **Rejected alternatives**: core-owned renderer dependencies and
  user-installed peer dependencies as the Phase 6 default.

- **Decision ID**: FC-DBND-03
- **Decision**: The public package boundary freezes only the renderer adapter
  contract. Direct API or subprocess strategy remains private renderer
  provenance.
- **Rejected alternatives**: direct Remotion API or spawned Remotion CLI as the
  public package contract.

- **Decision ID**: FC-DBND-02
- **Decision**: Phase 6 adds `@cadenza-dev/cli` and
  `@cadenza-dev/export-local`, with any root CLI script remaining a thin
  wrapper.
- **Rejected alternatives**: keeping export code in `scripts/` and using one
  CLI package that owns both command surface and export internals.
