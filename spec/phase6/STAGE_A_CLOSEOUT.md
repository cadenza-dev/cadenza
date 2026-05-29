---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 Stage A Closeout Packet

## Purpose

This packet summarizes the Phase 6 Stage A contract set for maintainer review
before Stage B freeze work. It is an index and closeout aid, not a replacement
for the domain specs, `SPEC_TEST_MATRIX.md`, or `SPEC_TRACEABILITY.md`.

All Phase 6 files remain `CONTRACT_DRAFT`. Nothing in this packet freezes a
contract; Stage B still requires explicit maintainer freeze approval.

Root `STATUS.yaml` still points at Phase 5. The maintainer explicitly
authorized Phase 6 Architect planning before the root phase pointer moves, so
this packet records pre-open Stage A readiness only.

## Stage A Result

Phase 6 has a coherent Stage A recommendation set for Universal CLI and Local
Export Engine:

- split package topology with `@cadenza-dev/cli` for command surface and
  `@cadenza-dev/export-local` for deck loading, local export, evidence, and
  renderer adapters;
- local commands for `export`, `validate`, `inspect`, help, and version;
- minimal `cadenza.config.ts` with `defineConfig`, deck aliases,
  `output.root`, and `export.defaultFormats`;
- explicit selector precedence: CLI intent first, then project config aliases,
  then built-in aliases;
- strict deck module metadata as the canonical identity source;
- trusted local deck modules and config files, documented as local code
  execution; sandboxing is deferred;
- compact manifest plus per-format evidence files;
- stable hash over deterministic contract fields only;
- static web compatibility export with a named adapter boundary and semantic
  browser smoke evidence;
- real local MP4 rendering through a renderer adapter contract, with local
  prerequisite diagnostics and cleanup evidence;
- concise human output by default and stable `--json` command summaries;
- small deterministic exit-code taxonomy plus structured diagnostic records;
- clean-checkout docs with README routing, a dedicated local export
  walkthrough, and overclaim guards.

`SPEC_TEST_MATRIX.md` records that no Phase 6 Stage A Freeze Candidate remains
unresolved after maintainer confirmation on 2026-05-30.

## Contract Files

The Stage A contract set is:

- `SPEC_CLI_SURFACE.md`: local CLI entrypoint, command inventory, command
  adapters, JSON output, and non-interactive behavior.
- `SPEC_DECK_LOADING.md`: deck selector model, deck module contract,
  precedence, canonical identity, and trusted local code boundary.
- `SPEC_CONFIG_AND_PATHS.md`: minimal config file, path/config registry, CLI
  override precedence, generated-output safety, and config diagnostics.
- `SPEC_VALIDATE_INSPECT.md`: side-effect-light validation and artifact-only
  inspection.
- `SPEC_EXPORT_ENGINE.md`: output layout, manifest/evidence model, stable hash,
  schema versions, artifact ownership, and generated-output root.
- `SPEC_STATIC_WEB_COMPATIBILITY.md`: static web compatibility adapter,
  browser semantic smoke, evidence fields, and Player App non-claims.
- `SPEC_LOCAL_MP4_RENDERING.md`: real local MP4 scope, renderer adapter,
  prerequisites, cleanup, evidence, and local-only limitations.
- `SPEC_DEPENDENCY_BOUNDARY.md`: package topology, Remotion dependency
  placement, core isolation, and renderer adapter boundaries.
- `SPEC_DIAGNOSTICS.md`: diagnostic schema, exit codes, repair routing, JSON
  summaries, and renderer-stage diagnostics.
- `SPEC_CLEAN_CHECKOUT_DOCS.md`: install/validate/inspect/export docs,
  prerequisites, config examples, generated-output ownership, and overclaim
  guards.
- `SPEC_TEST_MATRIX.md`: acceptance scenarios, Freeze Candidate summary, WIP
  deferrals, explicit non-scenarios, and Builder batch shape.
- `SPEC_TRACEABILITY.md`: requirement-to-test-to-future-location routing.

## Stage A Recommendations By Domain

| Domain | Stage A recommendation | Primary specs |
| :--- | :--- | :--- |
| CLI topology | Split `@cadenza-dev/cli` and `@cadenza-dev/export-local`; root scripts stay thin wrappers. | `SPEC_CLI_SURFACE.md`, `SPEC_DEPENDENCY_BOUNDARY.md` |
| Command surface | `export`, `validate`, `inspect`, help, and version; commands remain local-only. | `SPEC_CLI_SURFACE.md`, `SPEC_VALIDATE_INSPECT.md` |
| Machine output | Human output by default, stable `--json` summaries, no JSONL stream in Phase 6. | `SPEC_CLI_SURFACE.md`, `SPEC_DIAGNOSTICS.md` |
| Non-interactive behavior | TTY-friendly defaults, deterministic no-prompt behavior in CI and agent contexts. | `SPEC_CLI_SURFACE.md`, `SPEC_CONFIG_AND_PATHS.md` |
| Deck selectors | Built-in aliases, direct local paths, and minimal config aliases. | `SPEC_DECK_LOADING.md`, `SPEC_CONFIG_AND_PATHS.md` |
| Deck identity | Deck module metadata owns canonical identity; aliases never override it. | `SPEC_DECK_LOADING.md`, `SPEC_EXPORT_ENGINE.md` |
| Config | Minimal `cadenza.config.ts`; CLI flags override config, config overrides registry defaults. | `SPEC_CONFIG_AND_PATHS.md` |
| Validate/inspect | Validate checks config/selector/metadata/compile/timeline without export deliverables; inspect reads artifacts only. | `SPEC_VALIDATE_INSPECT.md` |
| Evidence | Summary manifest plus per-format evidence files, with schema versions in both. | `SPEC_EXPORT_ENGINE.md`, `SPEC_VALIDATE_INSPECT.md` |
| Stable hash | Hash deterministic contract fields only, not artifact bytes or volatile machine/run fields. | `SPEC_EXPORT_ENGINE.md` |
| Static web | Static compatibility export with adapter boundary; no Player App web export claim. | `SPEC_STATIC_WEB_COMPATIBILITY.md` |
| MP4 | Real local Remotion render through adapter; implementation strategy remains private provenance. | `SPEC_LOCAL_MP4_RENDERING.md`, `SPEC_DEPENDENCY_BOUNDARY.md` |
| Diagnostics | Structured records, small exit taxonomy, repair hints, and renderer-stage classification. | `SPEC_DIAGNOSTICS.md` |
| Docs | README pointer plus dedicated walkthrough; expected fields instead of generated transcripts; overclaim guard. | `SPEC_CLEAN_CHECKOUT_DOCS.md` |

## WIP Deferrals

The following future-support notes capture rejected or deferred Stage A options:

- `phase-7-plus-cli-diagnostics-candidates.md`: JSONL streams, very granular
  exit codes, generated docs transcripts, and interactive prompts.
- `phase-7-plus-config-candidates.md`: broad config surface, `cadenza init`,
  hosted/cloud config, plugin discovery, and migration tooling.
- `phase-7-plus-deck-loading-candidates.md`: filename or alias identity
  inference, config-owned identity, precompiled manifests, and sandboxing.
- `phase-7-plus-validate-inspect-candidates.md`: source-aware inspect,
  renderer preflight, export diffing, and persistent validate reports.
- `phase-7-plus-export-evidence-candidates.md`: append-only event logs,
  byte-level artifact hashing, signed provenance, and export comparison.
- `phase-7-plus-renderer-candidates.md`: public direct Remotion API contract,
  public Remotion CLI subprocess contract, hosted renderer, pixel parity, and
  portable renderer environment.
- `phase-7-plus-web-export-candidates.md`: Player App web export, app bundler
  contract, richer offline assets, primary visual diffing, and hosted sharing.

Future Architects must promote these WIP notes into a phase spec or ADR before
Builder treats them as requirements.

## Explicit Non-Goals

Phase 6 Stage A keeps the following out of scope:

- Cadenza Player App product shell.
- App-based web bundler or polished Player App export.
- Hosted rendering, Remotion Lambda production path, cloud queue, accounts,
  credentials, billing, cost system, or SaaS implementation.
- PDF, PPTX, cross-format IR, import/export parity, or editor work.
- Visual editor or structured editing surface.
- Template marketplace, collaboration, comments, SSO, or enterprise accounts.
- Alpha announcement, public release claim, npm publication, release tag, or
  external launch.
- Tool-based MCP or read-only MCP implementation.

## Builder Batch Shape

Stage A recommends these vertical Builder batches after Stage B freeze:

1. CLI/export-local package topology, help/version, and deck loading.
2. Export engine manifest, artifact layout, and diagnostics.
3. Static web compatibility and browser evidence.
4. Real local MP4 rendering and renderer/dependency boundary.
5. Clean-checkout documentation and overclaim guards.

Builder should route from `SPEC_TEST_MATRIX.md`, keep tests in the Phase 5.5
taxonomy locations, and update `trace/phase6/tracker.md` only after Phase 6 is
opened or the maintainer explicitly authorizes pre-open trace scaffolding.

## Stage B Preparation

Before freezing, Stage B should:

1. Confirm the maintainer wants to freeze the current Stage A recommendation
   set without reopening domains.
2. Convert domain specs from `CONTRACT_DRAFT` to `CONTRACT_FROZEN` only after
   explicit maintainer freeze approval.
3. Replace Freeze Candidate sections with resolved decision summaries or
   otherwise remove unresolved markers required by `pnpm spec:lint`.
4. Keep `SPEC_TEST_MATRIX.md` and `SPEC_TRACEABILITY.md` synchronized.
5. Decide whether to add a short Proposed ADR for the durable package topology:
   `@cadenza-dev/cli` plus `@cadenza-dev/export-local`, with root scripts as
   thin wrappers.
6. Leave `STATUS.yaml.current_phase` unchanged unless the maintainer or Wizard
   explicitly opens Phase 6.
7. Prepare `prompt/PHASE6_KICK_BUILDER.md` only after the frozen contract set is
   coherent.

## Verification Snapshot

The Stage A recommendation cleanup that precedes this packet passed local
verification and GitHub CI on `main` at commit
`5b20177294a64e55c43d78e0bd8e0f744fac6561`.

This packet itself must pass the normal repository verification gates before it
is reported as ready.
