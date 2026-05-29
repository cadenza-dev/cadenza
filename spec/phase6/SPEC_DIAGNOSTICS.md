---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 6 Diagnostics Specification

## Purpose

This frozen contract defines structured diagnostics, exit codes, human messages,
machine-readable failure evidence, and repair routing for Phase 6 CLI and
export workflows.

Diagnostics must be actionable and honest. A successful command must not imply
alpha readiness, hosted readiness, public API stability, or broad format parity
unless another frozen contract and evidence file explicitly supports that
claim.

## Approved Design Decisions

### Diagnostic Transport

1. Typed error-code schema in JSON evidence files.
2. JSON or JSONL diagnostic stream plus human summary.
3. Minimal stderr with machine-readable evidence only on export.

**Decision**: option 1 plus optional `--json` command output. JSONL can
wait until streaming diagnostics are needed by a Player App or hosted runner.
After maintainer brainstorming on 2026-05-29, this means human output by default,
stable JSON command summaries with `--json`, and structured diagnostic evidence
files for export artifacts.

### Exit Code Taxonomy

1. Generic `0` success and `1` failure.
2. Small typed taxonomy: usage, deck validation, render/export, environment,
   internal.
3. One exit code per diagnostic category.

**Decision**: option 2. It is useful for agents and docs without
creating a brittle shell API. Deep command internals must not call
`process.exit()`, and top-level cleanup must not mask failure with a final
successful exit.

### Repair Routing

1. Free-form messages.
2. Structured categories with repair route hints.
3. Full issue-tracker records.

**Decision**: option 2, following Phase 5 repair-routing evidence while
removing Phase 5-only batch assumptions.

## Requirements

- **ID**: CDIA-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 6 diagnostics MUST include stable code, severity,
  category, human message, repair hint, source or artifact locator when
  available, and related requirement or scenario references when the failure is
  contract-covered.
- **Verification**: acceptance scenario `TC-CDIA-001` validates successful and
  failing command diagnostic records.

- **ID**: CDIA-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: CLI commands MUST return deterministic exit codes that
  distinguish success, usage error, deck validation or loading failure, export
  or renderer failure, environment limitation, and unexpected internal failure.
- **Verification**: acceptance scenario `TC-CDIA-002` runs command fixtures for
  each failure class and checks exit codes plus diagnostic categories.

- **ID**: CDIA-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Failed export attempts MUST leave machine-readable failure
  evidence when an output directory or evidence path is available, and MUST
  avoid partial success claims for formats that did not complete.
- **Verification**: acceptance scenario `TC-CDIA-001` checks failed web and MP4
  export evidence for partial artifact handling and format status.

- **ID**: CDIA-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Diagnostics MUST route failures to authored deck repair,
  deck-loading contract repair, Cadenza best-practices guidance repair, export
  implementation repair, renderer adapter repair, environment limitation,
  framework-defect evidence, or maintainer waiver.
- **Verification**: acceptance scenario `TC-CDIA-002` validates repair routing
  categories for invalid deck, invalid CLI option, and renderer failure
  fixtures.

- **ID**: CDIA-009
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: MP4 renderer diagnostics MUST classify failures by adapter
  stage: prerequisite detection, bundle or composition preparation, renderer
  invocation, codec or media tool failure, output write failure, cancellation,
  cleanup failure, and unexpected internal failure. Raw renderer logs MAY be
  attached as debug evidence, but the stable diagnostic record MUST include a
  Cadenza diagnostic code, category, repair hint, and renderer provenance.
- **Verification**: acceptance scenarios `TC-VIDO-003` and `TC-VIDO-004` check
  renderer-stage diagnostics, JSON output separation, and failure evidence.

- **ID**: CDIA-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Human CLI messages SHOULD be concise, name the command stage
  that failed, point to the generated evidence path when present, and avoid
  stack traces unless a debug option is explicitly requested.
- **Verification**: acceptance scenario `TC-CLIS-003` checks stdout/stderr
  behavior for validation and export failures.

- **ID**: CDIA-008
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Validation and inspection failures MUST route through the same
  structured diagnostic model as export failures. Validate diagnostics MUST
  distinguish config resolution, selector resolution, deck metadata, compile,
  and timeline derivation failures. Inspect diagnostics MUST distinguish missing
  manifest, malformed manifest, unsupported schema, missing evidence, and
  non-Cadenza artifact directory failures.
- **Verification**: acceptance scenarios `TC-VINS-002` and `TC-VINS-004`
  validate diagnostic categories and repair hints for validate and inspect
  fixtures.

- **ID**: CDIA-006
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `--json` command output MUST expose a stable summary object
  that includes command name, status, exit code, diagnostic codes or categories,
  manifest or evidence paths when present, and repair hints for failures. The
  JSON summary MUST remain separate from human progress and MUST be valid for
  both successful and failed commands.
- **Verification**: acceptance scenario `TC-CLIS-006` validates JSON summary
  shape for successful export, invalid deck validation, malformed inspect
  input, and renderer/environment failure fixtures.

- **ID**: CDIA-007
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: CLI top-level error handling MUST preserve deterministic
  failure exit codes through cleanup and telemetry-like finalization steps.
  Export-local internals and command adapters MUST return typed results or
  throw typed diagnostics rather than hiding failures behind unconditional
  `process.exit(0)`.
- **Verification**: acceptance scenario `TC-CDIA-003` exercises top-level
  cleanup/finalization fixtures and verifies that failures keep their expected
  exit code and diagnostic category.

## Approved Decision Summary

- **Decision ID**: FC-CDIA-01
- **Decision**: Typed JSON evidence files are the primary machine diagnostic
  surface, with `--json` command summaries for CLI automation.
- **Deferred alternative**: JSONL streaming is tracked in
  `wip/future-support/phase-7-plus-cli-diagnostics-candidates.md`.

- **Decision ID**: FC-CDIA-02
- **Decision**: Phase 6 uses a small typed CLI exit-code taxonomy.
- **Deferred alternative**: one exit code per diagnostic category is tracked in
  `wip/future-support/phase-7-plus-cli-diagnostics-candidates.md`.

- **Decision ID**: FC-CDIA-03
- **Decision**: Repair routing becomes a shared CLI/export diagnostic type
  outside `@cadenza-dev/core`.
- **Rejected alternatives**: evidence-field-only repair routing and extending
  core validation APIs for Phase 6 CLI diagnostics.
