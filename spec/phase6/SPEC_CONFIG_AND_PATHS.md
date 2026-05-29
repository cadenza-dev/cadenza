---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 Config and Paths Specification

## Purpose

This Stage A draft defines the Phase 6 project configuration and path registry
contract. Phase 6 needs enough configuration to support Phase 7 Player App and
alpha-launch workflows without freezing a broad configuration language too
early.

The goal is a small, versioned `cadenza.config.ts` surface for project defaults,
backed by a typed internal registry for paths, artifact names, deck aliases,
format defaults, temporary directories, and generated-output safety checks.

## Stage A Options

### Config Posture

1. Internal path/config registry only, with no project config file.
2. Minimal `cadenza.config.ts` plus typed path/config registry and CLI override
   precedence.
3. Full project configuration surface for deck discovery, output, preview,
   export, renderer, Player App, hosted, and plugin settings.

**Stage A leaning**: option 2, approved as the Stage A recommendation on
2026-05-30. Phase 6 is a direct prerequisite for Phase 7 Player App and alpha
launch work, so deferring every config-file concept would push migration cost
into the alpha-prep window. A full configuration surface is still too early.

### Minimal Config Shape

1. Output defaults only.
2. Deck aliases, output defaults, and export format defaults.
3. Deck aliases, output defaults, export defaults, preview defaults, renderer
   options, web-app options, and future hosted options.

**Stage A leaning**: option 2. These fields map to stable Phase 6 concepts and
give Phase 7 a place to add namespaced Player App settings later without
renaming the local export defaults.

Config `decks` entries are resolver aliases only. They map local selector names
to deck module paths; they do not define or override canonical deck identity.

Example draft shape:

```ts
import { defineConfig } from "@cadenza-dev/cli";

export default defineConfig({
  decks: {
    "technical-talk": "./examples/technical-talk.deck.tsx",
  },
  output: {
    root: "dist/cadenza",
  },
  export: {
    defaultFormats: ["web", "mp4"],
  },
});
```

### Precedence

1. Config file overrides CLI flags.
2. CLI flags override config file, which overrides registry defaults.
3. Merge order varies by command.

**Stage A leaning**: option 2. CLI flags are the explicit command invocation;
config supplies project defaults; registry defaults keep clean-checkout commands
usable.

## Requirements

- **ID**: CNFG-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `@cadenza-dev/export-local` MUST expose or own a typed
  path/config registry that centralizes Phase 6 defaults for output root,
  manifest filename, per-format evidence filenames, renderer temporary
  directory ownership, deck alias resolution, default export formats, and
  generated-output overwrite safety. Command modules MUST NOT hard-code
  conflicting defaults outside that registry.
- **Verification**: acceptance scenario `TC-CNFG-001` checks default path
  resolution, evidence filenames, temporary directory routing, and absence of
  duplicated command-local path constants.

- **ID**: CNFG-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 6 MUST support an optional project-root
  `cadenza.config.ts` loaded through a typed `defineConfig` helper. The Phase 6
  config surface MUST be limited to `decks`, `output.root`, and
  `export.defaultFormats` unless Stage B explicitly adds another minimal field.
  The config file supplies project defaults and deck alias shortcuts and MUST
  NOT be required for clean-checkout example commands.
- **Verification**: acceptance scenario `TC-CNFG-002` runs export and validate
  with no config file, then with a minimal config file defining a deck alias,
  output root, and default formats.

- **ID**: CNFG-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: CLI flags MUST override `cadenza.config.ts`, and config values
  MUST override registry defaults. This precedence order MUST be consistent
  across export, validate, inspect, help, and any Phase 6 command that reads
  configurable defaults.
- **Verification**: acceptance scenario `TC-CNFG-003` verifies CLI override
  behavior for deck selector, output root, and format selection.

- **ID**: CNFG-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Unknown stable config keys and invalid config value shapes
  MUST fail fast with structured diagnostics. Future additive keys MUST be
  namespaced rather than silently accepted by Phase 6. Renaming or removing a
  frozen key after alpha requires a documented deprecation path or a future ADR.
- **Verification**: acceptance scenario `TC-CNFG-004` loads malformed config
  fixtures and checks diagnostic codes, categories, repair hints, and exit
  behavior.

- **ID**: CNFG-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Generated-output safety checks MUST use the centralized
  path/config registry. Export commands MUST reject overwriting a non-Cadenza or
  unknown existing output directory unless an explicit confirmation flag such as
  `--force` is provided, and non-TTY runs MUST fail rather than prompt.
- **Verification**: acceptance scenario `TC-CNFG-005` exercises fresh output,
  regenerate-owned output, non-Cadenza existing output, and `--force`
  overwrite cases in TTY and non-TTY contexts.

- **ID**: CNFG-006
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Clean-checkout documentation SHOULD describe the minimal
  `cadenza.config.ts` shape, CLI override precedence, generated-output safety,
  and the trusted local code boundary for config and deck modules.
- **Verification**: acceptance scenario `TC-CDOC-001` checks the walkthrough for
  minimal config examples, override precedence, and trust-boundary language.

- **ID**: CNFG-007
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `decks` entries in `cadenza.config.ts` MUST act only as
  selector aliases to local deck module paths. They MUST NOT provide canonical
  deck ID, title, label, precompiled timeline, manifest data, renderer-specific
  artifacts, or identity overrides. Config alias diagnostics MUST name both the
  alias used and the canonical deck ID loaded from the deck module.
- **Verification**: acceptance scenario `TC-DLOD-005` checks that config aliases
  do not change canonical deck identity and that diagnostics report alias source
  plus module identity.

## Resolved Stage A Decisions

- **Decision ID**: FC-CNFG-01
- **Decision**: Phase 6 introduces a minimal `cadenza.config.ts` backed by a
  typed registry and explicit CLI override precedence.
- **Rejected alternatives**: internal registry only and a broad project config
  surface.

- **Decision ID**: FC-CNFG-02
- **Decision**: The initial config surface is limited to deck aliases, output
  root, and export default formats.
- **Deferred alternative**: preview, renderer, Player App, hosted, plugin, and
  migration settings are tracked in
  `wip/future-support/phase-7-plus-config-candidates.md`.

- **Decision ID**: FC-CNFG-04
- **Decision**: Config deck aliases resolve paths only. Deck modules own
  canonical deck ID, title, and identity.
- **Rejected alternatives**: config-owned identity and partial config title
  overrides.

- **Decision ID**: FC-CNFG-03
- **Decision**: CLI flags override config, and config overrides registry
  defaults for selector, output root, and format selection.
- **Rejected alternatives**: config overriding CLI intent and command-specific
  merge orders.
