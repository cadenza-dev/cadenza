---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 Clean-Checkout Documentation Specification

## Purpose

This Stage A draft defines the clean-checkout documentation boundary for Phase
6. The docs must let a developer install, validate, inspect, export static web,
and export local MP4 from a fresh checkout while stating prerequisites,
supported formats, and limitations honestly.

This is documentation for a local developer workflow, not an alpha launch
announcement or publication plan.

After Stage A brainstorming on 2026-05-30, the approved recommendation is to
use the README as a short entrypoint, put the full clean-checkout local export
workflow in a dedicated walkthrough, and make overclaim checks part of the
acceptance matrix. Phase 6 documentation should describe expected commands,
output paths, manifest fields, evidence fields, and limitations; generated
command transcripts or long refreshed logs are deferred.

## Stage A Options

### Documentation Shape

1. README quickstart only.
2. Dedicated local export walkthrough only.
3. README pointer plus dedicated local export walkthrough.

**Stage A leaning**: option 3, selected as the Stage A recommendation after
maintainer brainstorming. The README should stay high-level; a dedicated
walkthrough can carry prerequisites, failure modes, and artifact inspection.

### Evidence in Docs

1. Docs list commands only.
2. Docs include expected output paths and manifest fields.
3. Docs include generated command evidence refreshed by tests.

**Stage A leaning**: option 2 for Stage B, selected as the Stage A
recommendation after maintainer brainstorming. Generated command evidence may
be valuable later, but Phase 6 can keep docs stable by testing command behavior
and documenting expected evidence fields.

### Overclaim Guard

1. Rely on editorial review only.
2. Add explicit acceptance checks for prohibited release, hosted, Player App,
   and unsupported-format claims.
3. Defer overclaim checks to the alpha announcement process.

**Stage A leaning**: option 2, selected as the Stage A recommendation after
maintainer brainstorming. Phase 6 is alpha-enabling infrastructure, not an
alpha announcement.

## Requirements

- **ID**: CDOC-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 6 MUST provide clean-checkout documentation that covers
  install, validation, inspect, static web export, local MP4 export, output
  artifact review, optional minimal `cadenza.config.ts`, and local-code trust
  boundaries for direct deck modules and config files.
- **Verification**: acceptance scenario `TC-CDOC-001` checks README and local
  export docs for commands, deck selectors, output paths, and trust-boundary
  language.

- **ID**: CDOC-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Documentation MUST name local prerequisites and limitations
  for MP4 rendering, including Node/pnpm expectations, Remotion renderer
  requirements, browser or media-tool prerequisites if any, and environment
  limitations that may require repair or waiver evidence. It MUST state that
  MP4 export is local-only, runs through the renderer adapter boundary, records
  renderer provenance in evidence, and cleans up temporary renderer state where
  possible.
- **Verification**: acceptance scenario `TC-CDOC-001` checks prerequisite and
  limitation sections against the frozen MP4 and dependency-boundary
  requirements.

- **ID**: CDOC-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Documentation MUST avoid claims of final `0.1 alpha
  readiness`, npm publication, release tags, public API stability beyond the
  declared surface, hosted rendering readiness, Remotion Lambda production
  readiness, PDF/PPTX support, Player App export, or arbitrary plugin-loaded
  deck support.
- **Verification**: acceptance scenario `TC-CDOC-002` scans docs and generated
  evidence summaries for prohibited overclaim language.

- **ID**: CDOC-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The README MUST point to a dedicated Phase 6 local export
  walkthrough rather than carrying every command, prerequisite, and evidence
  field inline.
- **Verification**: acceptance scenario `TC-CDOC-001` checks README routing and
  dedicated walkthrough presence.

- **ID**: CDOC-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Documentation SHOULD describe how generated `dist/` and
  `tmp/` outputs are owned, regenerated, inspected, and excluded from tracked
  fixtures according to the testing taxonomy, including how config-defined
  output roots interact with generated-output safety checks. It SHOULD explain
  that the export manifest is a compact summary, per-format evidence files hold
  format-specific details, and the stable hash covers deterministic contract
  fields rather than generated artifact bytes.
- **Verification**: acceptance scenario `TC-CDOC-002` checks generated-evidence
  ownership language and links or references the testing taxonomy.

- **ID**: CDOC-006
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Documentation SHOULD describe human versus machine output,
  including `--json`, stderr progress behavior, non-TTY no-prompt behavior, and
  explicit confirmation flags such as `--yes` or `--force` when a command can
  overwrite generated outputs.
- **Verification**: acceptance scenario `TC-CDOC-001` checks the local export
  walkthrough for machine-output and non-interactive behavior notes.

- **ID**: CDOC-007
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Documentation SHOULD show a minimal `cadenza.config.ts`
  example using `defineConfig`, deck aliases, `output.root`, and
  `export.defaultFormats`. It SHOULD state that CLI flags override config and
  that broader preview, Player App, hosted, plugin, and interactive config
  surfaces are not Phase 6 contracts.
- **Verification**: acceptance scenario `TC-CDOC-001` checks minimal config
  docs and prohibited broad-config claims.

- **ID**: CDOC-008
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Documentation SHOULD describe the static web output as a
  compatibility export, not as the future Player App web export. It SHOULD
  explain the compatibility adapter boundary, web evidence fields, semantic
  browser smoke expectation, and Phase 7+ replacement path in user-facing
  language.
- **Verification**: acceptance scenarios `TC-CDOC-001` and `TC-CDOC-002` check
  static web compatibility language and prohibited Player App overclaims.

- **ID**: CDOC-009
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The dedicated local export walkthrough MUST document expected
  command shapes, generated output paths, manifest fields, per-format evidence
  fields, stable hash meaning, and common failure-routing categories without
  embedding long generated command transcripts as the normative source of
  truth.
- **Verification**: acceptance scenario `TC-CDOC-001` checks walkthrough
  coverage for expected commands and evidence fields, and acceptance scenario
  `TC-CDOC-002` checks that generated command transcripts are not required as a
  Phase 6 documentation contract.

- **ID**: CDOC-010
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Documentation and generated evidence summaries MUST be covered
  by an overclaim guard that rejects prohibited claims about release readiness,
  publication, hosted rendering, Player App export, unsupported formats, or
  arbitrary plugin loading unless a later frozen contract explicitly permits
  those claims.
- **Verification**: acceptance scenario `TC-CDOC-002` scans the documentation
  and generated evidence summaries for prohibited overclaim language.

## Freeze Candidates

- **FC-ID**: FC-CDOC-01
- **Question**: Should Phase 6 use README-only docs, a dedicated walkthrough,
  or both?
- **Options considered**:
  1. README quickstart only.
  2. Dedicated local export walkthrough only.
  3. README pointer plus dedicated walkthrough.
- **Leaning**: option 3, selected as the Stage A recommendation after
  maintainer brainstorming.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-CDOC-02
- **Question**: Should documentation include generated command evidence or only
  expected command shapes and artifact fields?
- **Options considered**:
  1. Commands only.
  2. Expected output paths and manifest fields.
  3. Generated command evidence refreshed by tests.
- **Leaning**: option 2 for Phase 6, selected as the Stage A recommendation
  after maintainer brainstorming. Option 3 is deferred unless Builder evidence
  shows docs drift and is tracked in
  `wip/future-support/phase-7-plus-cli-diagnostics-candidates.md`.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-CDOC-03
- **Question**: Should Phase 6 rely on editorial restraint for release and
  product claims, or add explicit overclaim checks?
- **Options considered**:
  1. Editorial review only.
  2. Explicit acceptance checks for prohibited claims.
  3. Defer checks to the alpha announcement process.
- **Leaning**: option 2, selected as the Stage A recommendation after
  maintainer brainstorming.
- **Must resolve before**: Stage B freeze.
