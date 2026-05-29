# ADR 0016: Phase 6 local CLI and export package topology

- **Status**: Accepted
- **Date**: 2026-05-30
- **Deciders**: @DrEden33773
- **References**:
  [Phase 6 CLI surface spec](../../spec/phase6/SPEC_CLI_SURFACE.md),
  [Phase 6 dependency boundary spec](../../spec/phase6/SPEC_DEPENDENCY_BOUNDARY.md),
  [ADR 0010](./0010-project-name-cadenza-github-org.md)

## Context

Phase 5 proved export through a narrow root script. That shape is too small for
Phase 6: the generic local CLI needs command registration, deck loading,
configuration, diagnostics, export manifest/evidence writing, static web
compatibility, and real local MP4 rendering.

Keeping that work in one root `scripts/cadenza.ts` file would make dependency
boundaries unclear and would put renderer/bundler concerns too close to the
command entrypoint. At the same time, Phase 6 must remain local-only: this
topology must not imply npm publication, alpha launch, hosted rendering, or
public package stability.

## Decision

Cadenza will implement Phase 6 local CLI/export work through two workspace
packages:

- `@cadenza-dev/cli` owns command registration, argument parsing, help/version,
  stdout/stderr behavior, exit-code mapping, and command adapters.
- `@cadenza-dev/export-local` owns local deck loading, validation support,
  export planning/execution, manifest and evidence reading/writing, static web
  compatibility output, and local renderer adapters.
- Root scripts may remain as clean-checkout wrappers, but they must delegate to
  `@cadenza-dev/cli` and must not retain Phase 6 domain logic.
- `@cadenza-dev/core` remains free of CLI, filesystem export, renderer,
  bundler, browser automation, and local media tooling dependencies.

## Consequences

### Positive

- Keeps command I/O separate from local export workflow logic.
- Gives Builder clear package boundaries and import-boundary tests.
- Leaves room for future hosted or Player App export work without rewriting the
  local CLI command surface.
- Prevents the Phase 6 generic CLI from growing into another monolithic root
  script.

### Negative

- Adds two packages before npm publication or alpha launch.
- Requires package-level tests and acceptance tests to agree on shared helper
  boundaries.
- Makes small CLI changes slightly more ceremony-heavy than editing one script.

### Open

- Whether a future hosted export package should share the local export adapter
  interfaces or define its own package boundary.

## Alternatives Considered

### Keep the generic CLI in `scripts/cadenza.ts`

Rejected. This repeats the Phase 5 proof shape and would not scale to deck
loading, diagnostics, evidence writing, static web compatibility, and local
MP4 rendering.

### Use one `@cadenza-dev/cli` package for everything

Rejected for Phase 6. It improves over a root script, but still mixes command
I/O with renderer and export workflow dependencies.

### Put renderer and bundler dependencies in `@cadenza-dev/core`

Rejected. Core should remain the typed API, compiler, runtime intent, and
validation-contract package; export renderer dependencies belong outside it.
