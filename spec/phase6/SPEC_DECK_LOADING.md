---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 Deck Discovery and Loading Specification

## Purpose

This Stage A draft defines how Phase 6 commands discover and load decks. The
goal is to replace the Phase 5 single registry path with a documented deck
module contract for public examples and future user decks while preserving the
TSX-first, typed-API-first architecture.

Deck loading is a local developer workflow. It does not promise arbitrary
plugin isolation, sandboxed execution, remote loading, or non-code authoring.

## Stage A Options

### Deck Selector Model

1. Explicit built-in registry only.
2. Direct deck module path only.
3. Config-driven discovery only.
4. Constrained combination: built-in example aliases plus direct local module
   paths, with minimal `cadenza.config.ts` aliases as project defaults.

**Stage A leaning**: option 4. Built-in aliases keep examples ergonomic, while
direct paths are the smallest useful user-deck boundary. After Stage A
brainstorming on 2026-05-30, Phase 6 should add minimal config-file aliases so
Phase 7 and alpha-prep work do not need to retrofit deck discovery later.

### Selector Precedence

1. Built-in aliases always win.
2. Config aliases always win.
3. Explicit CLI selector or path wins over default config, and project config
   aliases win over built-in aliases when the same alias string is used.

**Stage A leaning**: option 3, approved as the Stage A recommendation on
2026-05-30. A command-line selector is the user's immediate intent; project
aliases are closer to the local project than built-in examples; built-in aliases
remain the fallback for clean-checkout examples.

### Deck Module Contract

1. Export a fixture factory that returns deck plus preview/offline timelines.
2. Export deck metadata and a deck factory; CLI owns compile and timeline
   derivation.
3. Export a precompiled manifest.

**Stage A leaning**: option 2. Phase 6 should stop depending on fixture-shaped
exports and make CLI/export own validation, compile, preview/offline timing,
and renderer evidence. After Stage A brainstorming on 2026-05-30, this means a
strict metadata contract: every deck module must declare a canonical stable deck
ID and title or label. Direct paths must not invent public deck identity from
filenames.

### Trust Boundary

1. Treat user deck modules as trusted local code.
2. Attempt sandboxing inside Phase 6.
3. Avoid user module paths until a sandbox exists.

**Stage A leaning**: option 1 with explicit documentation. TSX authoring is
code execution; pretending otherwise would overpromise more than it protects.

## Requirements

- **ID**: DLOD-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 6 MUST define a public deck module contract that
  includes a canonical stable deck ID, title or label, and a deck factory or
  exported deck value expressed through public Cadenza typed TSX. Source path
  is resolved by the selector and recorded by the loader, but package-internal
  fixtures, inferred filename IDs, and precompiled manifests MUST NOT be the
  required user-facing export shape.
- **Verification**: acceptance scenario `TC-DLOD-001` loads the canonical
  Phase 5 talk through the Phase 6 deck contract rather than Phase 5 fixture
  exports.

- **ID**: DLOD-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The CLI MUST support built-in example aliases and direct local
  deck module paths. If a project-root `cadenza.config.ts` is present, the CLI
  MUST also support its declared deck aliases as project defaults; direct CLI
  selectors and explicit paths MUST override config defaults.
- **Verification**: acceptance scenario `TC-DLOD-002` resolves one built-in
  example alias, one config-defined alias, and one direct module path, then
  rejects an unknown selector with a structured diagnostic.

- **ID**: DLOD-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Deck loading MUST validate required exports before export
  work begins and MUST route missing exports, missing canonical deck ID, invalid
  metadata, compile diagnostics, and unsupported selector forms into the Phase 6
  diagnostic model.
- **Verification**: acceptance scenario `TC-DLOD-003` exercises invalid deck
  modules and checks diagnostic codes, categories, and exit codes.

- **ID**: DLOD-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Deck bundling and temporary module loading SHOULD clean up
  generated temporary files and SHOULD avoid persisting intermediate bundles
  outside the export output or explicitly declared evidence directory.
- **Verification**: acceptance scenario `TC-DLOD-002` checks that temporary
  bundle paths are not left behind after successful and failed loads.

- **ID**: DLOD-005
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: Clean-checkout docs SHOULD state that direct deck module paths
  and `cadenza.config.ts` execute trusted local TSX code and are not a sandbox
  for untrusted decks or untrusted project configuration.
- **Verification**: acceptance scenario `TC-CDOC-001` checks the local export
  documentation for the trusted-code boundary.

- **ID**: DLOD-006
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Selector resolution MUST follow this precedence: explicit CLI
  path forms and explicit CLI selectors override default config selection;
  project config aliases override built-in aliases when the same alias string is
  used; built-in aliases remain available when no project alias shadows them.
  Resolution diagnostics MUST report whether the selected deck came from an
  explicit path, explicit alias, config default, config alias, or built-in alias.
- **Verification**: acceptance scenario `TC-DLOD-004` exercises direct path,
  config alias, built-in alias, config-default, alias shadowing, and unknown
  selector fixtures.

- **ID**: DLOD-007
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Config aliases and built-in aliases MUST be resolver
  shortcuts only. They MUST NOT override the deck module's canonical ID, title
  or label, metadata, compile behavior, timeline derivation, or manifest deck
  identity. The same deck loaded through different aliases or direct paths MUST
  report the same canonical deck identity.
- **Verification**: acceptance scenario `TC-DLOD-005` loads the same deck
  through a config alias, built-in alias, and direct path and verifies canonical
  identity stability.

- **ID**: DLOD-008
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `@cadenza-dev/export-local` MUST own compile, validation,
  preview or offline timeline derivation, and renderer-ready deck metadata for
  loaded deck modules. Deck modules MUST NOT be required to export precompiled
  timelines, manifests, or renderer-specific artifacts for Phase 6 support.
- **Verification**: acceptance scenario `TC-DLOD-001` verifies that the
  canonical deck contract exports authored deck data and metadata while
  export-local derives compile and timeline evidence.

## Freeze Candidates

- **FC-ID**: FC-DLOD-01
- **Question**: Which deck selectors become Phase 6 contract surface?
- **Options considered**:
  1. Built-in registry only.
  2. Direct module path only.
  3. Config-driven discovery.
  4. Built-in aliases plus direct paths and minimal config aliases.
- **Leaning**: option 4, selected as the Stage A recommendation after
  maintainer brainstorming; full discovery config remains deferred outside
  Phase 6.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-DLOD-02
- **Question**: Should a deck module export precompiled timelines or only the
  authored deck plus metadata?
- **Options considered**:
  1. Fixture factory with timelines.
  2. Deck metadata plus deck factory or deck value.
  3. Precompiled manifest.
- **Leaning**: option 2, selected as the Stage A recommendation after
  maintainer brainstorming.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-DLOD-03
- **Question**: How explicit should the local-code trust boundary be?
- **Options considered**:
  1. Trusted local code, documented.
  2. Sandboxed execution.
  3. No direct user modules yet.
- **Leaning**: option 1.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-DLOD-04
- **Question**: What selector precedence should Phase 6 freeze?
- **Options considered**:
  1. Built-in aliases always win.
  2. Config aliases always win.
  3. Explicit CLI intent first, then project config aliases, then built-in
     aliases.
- **Leaning**: option 3, selected as the Stage A recommendation after
  maintainer brainstorming.
- **Must resolve before**: Stage B freeze.

- **FC-ID**: FC-DLOD-05
- **Question**: Where should canonical deck identity come from?
- **Options considered**:
  1. Infer identity from filenames or aliases when metadata is missing.
  2. Require strict deck module metadata.
  3. Let `cadenza.config.ts` own canonical deck identity.
- **Leaning**: option 2, selected as the Stage A recommendation after
  maintainer brainstorming.
- **Must resolve before**: Stage B freeze.
