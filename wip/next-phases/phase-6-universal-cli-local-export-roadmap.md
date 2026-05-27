# Phase 6 Roadmap - Universal CLI and Local Export Engine

> Status: WIP planning note, not a contract.
> Created: 2026-05-28.
> Source: maintainer roadmap adjustment after Phase 5 closeout review.

## Purpose

Phase 6 should turn the narrow Phase 5 `cadenza export <deck>` proof into a
general local CLI and export engine. The priority is a credible local developer
workflow, especially real video export, while keeping the current web bundle as
a compatibility output until the Player App-based web export exists.

## Thesis

The current export command has the right shape but the wrong center of gravity:
it is phase-bound, generated-evidence-heavy, and still writes the canonical MP4
proof as a smoke artifact. Before building a polished Player App, Cadenza needs
a stable command boundary, deck-loading contract, artifact layout, diagnostics
schema, and local renderer abstraction.

## Candidate Scope

- General CLI surface: support stable local commands such as export, inspect,
  validate, and version/help output if they are needed by the export workflow.
- Deck discovery and loading: replace the single Phase 5 registry path with a
  documented deck module contract for public examples and future user decks.
- Export engine: define reusable artifact layout, manifest schema,
  deterministic fields, diagnostics, known limitations, and format capability
  declarations.
- Web compatibility export: keep the current static web bundler as a supported
  compatibility mode, while reserving an extension point for the future
  Player App-based web bundle.
- Local MP4 export: replace the hard-coded MP4 smoke artifact with a real local
  Remotion render path for the canonical/public deck contract.
- Dependency boundary: isolate Remotion render and bundling dependencies in the
  CLI/export layer rather than in `@cadenza-dev/core`.
- Documentation: provide a clean-checkout CLI walkthrough that states supported
  formats, limitations, and local prerequisites honestly.

## MP4 Scope

Phase 6 should include MP4, but only as local deterministic export. The target is
real local rendering for the canonical Phase 5 talk and, if the deck module
contract is ready, any deck that satisfies that contract.

Phase 6 should not claim hosted rendering, cloud queueing, arbitrary plugin
loading, all deck shapes, PDF parity, or cross-format semantic equivalence.

## Non-Goals

- No Cadenza Player App product shell.
- No polished app-based web export.
- No hosted rendering, Remotion Lambda production path, cloud queue, account,
  credential, or cost system.
- No PPTX/PDF import/export IR.
- No visual editor or structured editing surface.
- No public alpha announcement unless the maintainer explicitly narrows Phase 6
  into a release phase.

## Promotion Triggers

- Phase 5.5 has clarified the test/harness boundaries enough to test CLI
  behavior without expanding Phase 5's one-off acceptance tests.
- Phase 5 export evidence is accepted as a useful seed but not treated as a
  reusable CLI architecture.

## Exit Evidence

- `cadenza export <deck>` works through the general CLI path rather than a
  Phase 5-only generator.
- The local web compatibility export remains available and documented.
- Real local MP4 export exists for the declared deck contract, with
  format-specific evidence and honest limitations.
- Export failures produce structured diagnostics that future Player App and
  hosted export work can consume.
- The CLI/export implementation no longer depends on Phase 5-only constants,
  output paths, or base64 video artifacts.

## Phase 7 Handoff

Phase 7 should be able to reuse the CLI's deck loading, manifest, artifact, and
diagnostics contracts while replacing the static web compatibility bundle with a
Player App-based exported web experience.
