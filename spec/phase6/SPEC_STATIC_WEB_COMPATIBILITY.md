---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 Static Web Compatibility Specification

## Purpose

This Stage A draft preserves Phase 5's static web bundle as a supported
compatibility output while reserving a future extension point for a Player
App-based web export. Phase 6 must not silently convert static web
compatibility into a polished Player App product shell.

After Stage A brainstorming on 2026-05-30, the approved recommendation is to
freeze static web as a compatibility export with a named adapter boundary,
format evidence, and browser-observable semantic checks. The future Player App
web export remains a Phase 7+ candidate, not a Phase 6 claim.

## Stage A Options

### Web Compatibility Posture

1. Preserve the Phase 5 static bundle with Phase 6 manifest fields.
2. Define a compatibility adapter that can later be replaced by Player App
   export.
3. Defer all web changes and focus only on MP4.

**Stage A leaning**: option 2, selected as the Stage A recommendation after
maintainer brainstorming. It keeps the current web proof working while making
the future Player App replacement explicit.

### Browser Evidence

1. Manifest-only web checks.
2. Browser-observable semantic smoke checks.
3. Screenshot or pixel diffing as the primary gate.

**Stage A leaning**: option 2, selected as the Stage A recommendation after
maintainer brainstorming. Phase 5.5 already strengthened browser smoke without
making pixel diffing the primary oracle.

## Requirements

- **ID**: WEBC-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 6 MUST preserve a static web compatibility export that
  writes an inspectable `index.html`, embeds or references the export manifest,
  and exposes semantic slide anchors for browser-observable checks.
- **Verification**: acceptance scenario `TC-WEBC-001` exports a web
  compatibility bundle and checks the entrypoint, manifest reference, and
  semantic anchors.

- **ID**: WEBC-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Static web compatibility evidence MUST declare its
  limitations, including that it is not the future Player App export, not a
  hosted bundle, and not a polished app shell.
- **Verification**: acceptance scenario `TC-WEBC-001` checks web evidence for
  compatibility limitation fields and prohibited Player App claims.

- **ID**: WEBC-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Browser-only web compatibility checks MUST live under
  `tests/browser/` and MUST verify browser-visible status, semantic anchor
  order, notes boundary, and absence of unexpected timing mismatches for the
  exported web bundle.
- **Verification**: acceptance scenario `TC-WEBC-002` runs or statically routes
  the browser smoke test according to the testing taxonomy.

- **ID**: WEBC-004
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The static web export SHOULD expose a named compatibility
  adapter boundary so Phase 7 can replace the implementation with a Player
  App-based bundle without changing deck loading, manifest, diagnostics, or
  format evidence contracts.
- **Verification**: acceptance scenario `TC-WEBC-002` checks that web evidence
  and traceability name public compatibility concepts rather than Phase 5
  helper names.

- **ID**: WEBC-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: `@cadenza-dev/export-local` MUST own a static web
  compatibility adapter contract. The adapter MUST accept canonical deck
  identity, deterministic timeline or composition summary, registry-resolved
  output paths, resolved web options, manifest reference, and a diagnostics
  sink. It MUST return an entrypoint path, artifact inventory, evidence fields,
  and limitations without exposing Phase 5 helper names as the public contract.
- **Verification**: acceptance scenario `TC-WEBC-001` checks adapter-facing
  inputs and outputs through public compatibility concepts.

- **ID**: WEBC-006
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Static web per-format evidence MUST record compatibility
  mode, entrypoint path, manifest reference, semantic slide anchor inventory,
  browser smoke status or waiver, adapter provenance, diagnostics, and
  limitations. Future Player App evidence may reuse the evidence category, but
  Phase 6 evidence MUST identify itself as static compatibility evidence.
- **Verification**: acceptance scenarios `TC-WEBC-001` and `TC-EXEN-003`
  validate web evidence fields and prohibit Player App identity claims.

- **ID**: WEBC-007
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Phase 6 browser evidence MUST use semantic browser smoke as
  the required web oracle. Screenshot or pixel comparison MAY be supplemental
  implementation evidence, but MUST NOT be the required primary pass/fail gate
  for static web compatibility.
- **Verification**: acceptance scenario `TC-WEBC-002` verifies semantic browser
  checks and rejects a pixel-only compatibility gate.

## Resolved Stage A Decisions

- **Decision ID**: FC-WEBC-01
- **Decision**: Phase 6 defines a static web compatibility adapter with a
  future Player App extension point.
- **Rejected alternatives**: preserving Phase 5 static output as the whole
  contract and deferring web changes entirely.

- **Decision ID**: FC-WEBC-02
- **Decision**: Browser semantic smoke is the required web compatibility
  evidence. Screenshot or pixel comparison may be supplemental only.
- **Rejected alternatives**: manifest-only checks and pixel diffing as the
  primary gate.

- **Decision ID**: FC-WEBC-03
- **Decision**: The observable web boundary is the named static compatibility
  adapter, not Phase 5 helper names.
- **Rejected alternative**: waiting for Player App export before defining web
  evidence boundaries.
