---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 CLI Surface Specification

## Purpose

This Stage A draft defines the local command surface for Phase 6. Phase 6 turns
the narrow Phase 5 `cadenza export <deck>` proof into a stable local developer
workflow for export, inspection, validation, help, and version reporting.

The CLI is local-only. It must not imply npm publication, hosted rendering,
Remotion Lambda, Player App export, cloud queues, accounts, credentials, or a
public release.

## Stage A Options

### CLI Topology

1. Thin root script: keep `pnpm cadenza` as a root script backed by
   `scripts/cadenza.ts`.
2. Single dedicated CLI package: add `@cadenza-dev/cli` that owns command
   modules, deck loading, local export, diagnostics, and renderer adapters.
3. Split CLI and export packages: add `@cadenza-dev/cli` for command surface
   and `@cadenza-dev/export-local` for deck loading, local export execution,
   manifest/evidence, and renderer adapters, with any root script acting only
   as a clean-checkout wrapper.

**Stage A correction**: option 1 is rejected. The final Phase 6 CLI/export
implementation must not remain a large single file like the Phase 5
`scripts/cadenza.ts` proof. After Stage A brainstorming on 2026-05-29, option
3 is the recommended package topology: keep `pnpm cadenza` as a
clean-checkout entrypoint if useful, but make the root script a thin wrapper
over `@cadenza-dev/cli`, and keep export workflow concerns in
`@cadenza-dev/export-local`. This is still a Stage A Freeze Candidate, not a
frozen contract.

### Command Architecture

1. Handwritten dispatch in the CLI entrypoint.
2. A typed command registry that maps public command names to command adapter
   modules.
3. A third-party CLI framework that owns parsing, dispatch, help, and command
   lifecycle.

**Stage A leaning**: option 2. Remotion CLI and `skills.sh` both use thin bin
entrypoints plus explicit source-level dispatch and command modules. Cadenza
should keep that simplicity, but a typed registry gives Builder a better
spec/test target than an open-ended switch statement and prevents root-entry
growth like the Phase 5 proof.

### Command Inventory

1. Export only.
2. Export plus inspect and validate.
3. Export, inspect, validate, help, and version.

**Stage A leaning**: option 3, with all commands local-only and scoped to the
Phase 6 deck contract. `inspect` and `validate` make export evidence reviewable
without re-rendering. After Stage A brainstorming on 2026-05-30, `validate` is
recommended as a deck/config/compile/timeline check that writes no export
deliverables by default, and `inspect` is recommended as artifact-only manifest
and evidence inspection.

### Machine Output Mode

1. JSON stdout only when a command succeeds.
2. Human stdout by default, with `--json` for machine-readable output.
3. JSONL diagnostic stream for every command.

**Stage A leaning**: option 2 for the first stable CLI, approved as the Stage A
recommendation on 2026-05-29. JSON stdout is the machine contract for command
summaries; human progress, warnings, and spinner output must not pollute JSON
stdout. JSONL may be useful for future hosted or Player App workflows, but Phase
6 can keep the command surface smaller by writing structured diagnostic
artifacts and offering `--json`.

### Non-Interactive Behavior

1. Prompt whenever a human-friendly fallback is available.
2. Never prompt; require every option explicitly.
3. Human-friendly defaults for TTY use, deterministic no-prompt behavior for
   non-TTY, CI, and agent contexts.

**Stage A leaning**: option 3. Phase 6 should be pleasant in a terminal while
remaining predictable for tests, agents, and clean-checkout automation.

## Requirements

- **ID**: CLIS-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 6 MUST expose a documented local CLI entrypoint that can
  be run from a clean checkout without npm publication or global installation.
  The entrypoint MAY remain `pnpm cadenza`, but the public CLI implementation
  MUST live under `packages/cli` as `@cadenza-dev/cli`, and the local export
  implementation MUST live under `packages/export-local` as
  `@cadenza-dev/export-local`. Root `scripts/cadenza.ts` MAY remain only as a
  thin compatibility wrapper or development shim; it MUST NOT be the final
  home for command parsing, deck loading, export engine logic, diagnostics,
  renderer adapters, or format evidence generation.
- **Verification**: acceptance scenario `TC-CLIS-001` runs the documented
  entrypoint and checks that Phase 6 commands are discoverable without global
  install or hosted prerequisites, while acceptance scenario `TC-DBND-003`
  verifies the root script remains only a thin wrapper and the split package
  boundary is present.

- **ID**: CLIS-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `cadenza export` MUST accept a deck selector, output root or
  run identifier, and a format selection for at least `web` and `mp4`. The
  command MUST produce a manifest path and output directory on success. CLI
  flags MUST override any `cadenza.config.ts` project defaults for selector,
  output root, or format selection.
- **Verification**: acceptance scenario `TC-CLIS-002` exports a declared deck
  to web and MP4 outputs, verifies config defaults and CLI overrides, and
  validates the returned manifest path.

- **ID**: CLIS-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `cadenza validate` MUST load and compile the selected deck
  contract, derive preview or offline timeline evidence, report structured
  diagnostics, and avoid writing export deliverables or invoking renderer
  adapters by default. Validation MAY write diagnostic evidence only when an
  explicit output path or JSON mode requests it.
- **Verification**: acceptance scenario `TC-CLIS-003` validates a passing deck
  and an invalid deck while asserting that no export artifact directory is
  created by default.

- **ID**: CLIS-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `cadenza inspect` MUST read an existing export manifest or
  artifact directory and report artifact inventory, formats, diagnostics, and
  known limitations without loading, rebuilding, recompiling, or re-rendering
  the deck. Inspect MUST reuse the export-local manifest/evidence reader rather
  than command-local ad hoc parsing.
- **Verification**: acceptance scenario `TC-CLIS-004` inspects a generated
  export directory and fails predictably for a missing or malformed manifest.

- **ID**: CLIS-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Help and version output SHOULD be deterministic,
  side-effect-free, and sufficient for clean-checkout docs to reference
  supported commands, options, formats, and local-only boundaries.
- **Verification**: acceptance scenario `TC-CLIS-001` checks help/version
  output for command inventory, format names, and prohibited hosted claims.

- **ID**: CLIS-006
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Each public command MUST be implemented as a command adapter
  module owned by `@cadenza-dev/cli`. Command adapters MAY parse argv, produce
  help, map diagnostics to process exit behavior, and call
  `@cadenza-dev/export-local`; they MUST NOT embed deck loading, export
  engine, renderer, or format-evidence implementation logic. The export-local
  package MUST NOT read `process.argv` or call `process.exit()`.
- **Verification**: acceptance scenario `TC-CLIS-005` exercises command
  registry discovery and asserts that command adapters are testable without
  invoking export-local internals or process-global exit behavior.

- **ID**: CLIS-007
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Commands MUST default to concise human-readable output and
  MUST support `--json` for stable machine-readable command summaries. In JSON
  mode, stdout MUST contain only JSON without ANSI codes, progress bars,
  spinners, or human prose; human progress and warnings MUST route to stderr or
  be suppressed when they would make automation ambiguous.
- **Verification**: acceptance scenario `TC-CLIS-006` runs success and failure
  fixtures with `--json`, validates stdout as JSON, and checks that progress or
  spinner text does not appear in machine output.

- **ID**: CLIS-008
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Non-TTY, CI, and agent-oriented command runs MUST be
  deterministic and MUST NOT wait for interactive prompts. Any destructive or
  expensive action requiring confirmation MUST use an explicit flag such as
  `--yes` or `--force`; missing required input MUST fail with a usage
  diagnostic rather than prompting indefinitely.
- **Verification**: acceptance scenario `TC-CLIS-007` runs representative
  commands in non-TTY mode and verifies no prompt, deterministic diagnostics,
  and explicit confirmation behavior for overwrite or destructive paths.

## Freeze Candidates

- **FC-ID**: FC-CLIS-01
- **Question**: Should Phase 6 introduce a dedicated CLI package now, or keep a
  root script, a single CLI package, or a split CLI plus export-local package?
- **Options considered**:
  1. Thin root script. Rejected: it would repeat the Phase 5 proof shape and
     does not scale to a generic CLI, deck loader, diagnostics model, export
     engine, and local MP4 renderer.
  2. Single dedicated `@cadenza-dev/cli` package owning command and export
     internals.
  3. Split `@cadenza-dev/cli` and `@cadenza-dev/export-local`, with any root
     script remaining a thin wrapper.
- **Leaning**: option 3, selected as the Stage A recommendation after
  maintainer brainstorming; still requires Stage B freeze approval.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-CLIS-02
- **Question**: Is `inspect` required in Phase 6, or can manifest inspection
  remain a documentation-only filesystem step?
- **Options considered**:
  1. No inspect command.
  2. Inspect generated manifests only.
  3. Artifact-only inspect of manifests, per-format evidence, diagnostics,
     limitations, and artifact inventory.
  4. Source-aware inspect that reloads or recompiles the deck.
- **Leaning**: option 3, selected as the Stage A recommendation after
  maintainer brainstorming.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-CLIS-03
- **Question**: What is the first machine-readable CLI output contract?
- **Options considered**:
  1. JSON stdout only on success.
  2. Human default plus `--json`.
  3. JSONL diagnostic stream.
- **Leaning**: option 2, selected as the Stage A recommendation after
  maintainer brainstorming; JSONL is deferred to
  `wip/future-support/phase-7-plus-cli-diagnostics-candidates.md`.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-CLIS-04
- **Question**: How should Phase 6 behave in non-interactive contexts?
- **Options considered**:
  1. Prompt whenever a human-friendly fallback exists.
  2. Never prompt and require every option explicitly.
  3. TTY-friendly defaults with deterministic no-prompt behavior for non-TTY,
     CI, and agent contexts.
- **Leaning**: option 3, selected as the Stage A recommendation after
  maintainer brainstorming.
- **Must resolve before**: Stage B freeze.
