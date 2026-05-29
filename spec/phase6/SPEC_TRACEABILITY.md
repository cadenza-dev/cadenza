---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 6 Traceability Matrix

## Purpose

This Stage A draft maps Phase 6 requirements to acceptance scenarios and
future implementation or evidence locations. It is a routing map for Builder,
not evidence that any scenario has passed.

## Matrix

| Requirement ID | Test IDs | Future code or artifact location |
| :--- | :--- | :--- |
| CLIS-001 | TC-CLIS-001, TC-DBND-003 | root CLI wrapper, `@cadenza-dev/cli` entrypoint, `@cadenza-dev/export-local` package boundary, README/local export docs |
| CLIS-002 | TC-CLIS-002 | export command parser, format selection, manifest success output |
| CLIS-003 | TC-CLIS-003 | validate command, deck loader, compile and timeline derivation, diagnostic output |
| CLIS-004 | TC-CLIS-004 | inspect command, shared manifest reader, artifact inventory summarizer |
| CLIS-005 | TC-CLIS-001 | help/version command output and clean-checkout docs |
| CLIS-006 | TC-CLIS-005 | typed command registry, command adapter modules, export-local invocation boundary |
| CLIS-007 | TC-CLIS-006 | JSON command summary writer, stdout/stderr transport boundary, ANSI/progress suppression |
| CLIS-008 | TC-CLIS-007 | non-TTY command fixtures, confirmation flag handling, usage diagnostics |
| DLOD-001 | TC-DLOD-001 | deck module contract, canonical Phase 5 talk migration, example metadata |
| DLOD-002 | TC-DLOD-002 | built-in example alias resolver, config-defined alias resolver, direct module path resolver |
| DLOD-003 | TC-DLOD-003 | deck loader validation, metadata validation, compile diagnostics |
| DLOD-004 | TC-DLOD-002 | temporary bundle ownership, cleanup helper, loader failure path |
| DLOD-005 | TC-CDOC-001 | local export docs and trust-boundary language |
| DLOD-006 | TC-DLOD-002, TC-DLOD-004 | selector precedence resolver, selector-source diagnostics |
| DLOD-007 | TC-DLOD-005 | canonical identity normalization, alias versus deck identity evidence |
| DLOD-008 | TC-DLOD-001 | export-local compile ownership, timeline derivation, renderer-ready metadata |
| VINS-001 | TC-CLIS-003, TC-VINS-001 | validate command selector resolution and shared loader path |
| VINS-002 | TC-CLIS-003, TC-VINS-002 | validate command metadata, compile, timeline, and no-export side effects |
| VINS-003 | TC-CLIS-004, TC-VINS-003 | inspect command manifest path and artifact directory summarizer |
| VINS-004 | TC-CLIS-004, TC-VINS-003 | artifact-only inspect guard and source-loading exclusion |
| VINS-005 | TC-VINS-004 | inspect malformed evidence diagnostics and shared reader failure modes |
| VINS-006 | TC-CLIS-006, TC-VINS-002, TC-VINS-004 | validate and inspect JSON summary output |
| CNFG-001 | TC-CNFG-001, TC-EXEN-001 | typed path/config registry, artifact filename defaults, temp directory routing |
| CNFG-002 | TC-CNFG-002, TC-DLOD-002 | `cadenza.config.ts` loader, `defineConfig`, minimal config schema |
| CNFG-003 | TC-CNFG-003, TC-DLOD-002, TC-EXEN-001 | CLI/config/default precedence resolver |
| CNFG-004 | TC-CNFG-004 | config validation diagnostics and repair hints |
| CNFG-005 | TC-CNFG-005 | generated-output ownership guard and `--force` behavior |
| CNFG-006 | TC-CDOC-001 | minimal config documentation and trust-boundary language |
| CNFG-007 | TC-CNFG-002, TC-DLOD-005 | config alias schema, alias source diagnostics, identity override rejection |
| EXEN-001 | TC-CLIS-002, TC-EXEN-001 | output root resolver, generated artifact cleanup/ownership checks |
| EXEN-002 | TC-CLIS-002, TC-CLIS-004, TC-EXEN-001 | manifest writer, manifest schema, evidence references, stable hash field |
| EXEN-003 | TC-EXEN-002 | deterministic field builder, stable hash, volatile field declaration |
| EXEN-004 | TC-EXEN-003, TC-VIDO-002 | format evidence files, web evidence, MP4 evidence |
| EXEN-005 | TC-EXEN-003 | manifest/evidence public concepts and future Player App or hosted handoff boundary |
| EXEN-006 | TC-CNFG-001, TC-EXEN-003 | registry-owned artifact names, manifest path, evidence paths, renderer temp paths |
| EXEN-007 | TC-DLOD-005, TC-EXEN-001 | manifest canonical deck identity, selector provenance fields |
| EXEN-008 | TC-EXEN-003, TC-VINS-004 | shared manifest/evidence reader, schema-version checks, evidence parsing |
| EXEN-009 | TC-EXEN-002, TC-EXEN-004 | stable hash scope, deterministic contract field digest, volatile exclusion rules |
| EXEN-010 | TC-EXEN-005, TC-VINS-004 | manifest schema version, per-format evidence schema versions, unsupported schema diagnostics |
| WEBC-001 | TC-WEBC-001 | static web compatibility writer, `index.html`, embedded or referenced manifest |
| WEBC-002 | TC-WEBC-001 | web compatibility limitation evidence and prohibited Player App claim checks |
| WEBC-003 | TC-WEBC-002 | `tests/browser/` web compatibility smoke test |
| WEBC-004 | TC-WEBC-002 | web compatibility adapter boundary and future Player App extension notes |
| WEBC-005 | TC-WEBC-001 | export-local static web compatibility adapter interface and adapter evidence fields |
| WEBC-006 | TC-WEBC-001, TC-EXEN-003 | web per-format evidence schema, compatibility mode, semantic anchors, adapter provenance |
| WEBC-007 | TC-WEBC-002 | semantic browser smoke oracle and supplemental-only screenshot or pixel evidence |
| VIDO-001 | TC-VIDO-001 | renderer adapter implementation, MP4 export path, embedded-video guard |
| VIDO-002 | TC-DLOD-002, TC-VIDO-001 | canonical deck render fixture and direct module render fixture |
| VIDO-003 | TC-VIDO-002 | MP4 format evidence, artifact metadata, renderer provenance |
| VIDO-004 | TC-CDIA-002, TC-VIDO-004 | renderer failure diagnostics and exit-code mapping |
| VIDO-005 | TC-VIDO-002 | local-only boundary scans, docs, dependency declarations |
| VIDO-006 | TC-VIDO-001, TC-VIDO-003 | renderer adapter contract, adapter inputs and outputs, implementation provenance |
| VIDO-007 | TC-VIDO-002, TC-VIDO-004 | local prerequisite detection, environment diagnostics, prerequisite evidence |
| VIDO-008 | TC-VIDO-004 | renderer temp directory ownership, success/failure/cancellation cleanup |
| VIDO-009 | TC-CLIS-006, TC-VIDO-003 | renderer progress/log transport, JSON stdout separation, MP4 evidence output |
| DBND-001 | TC-DBND-001 | `@cadenza-dev/core` imports and package dependency declarations |
| DBND-002 | TC-DBND-001, TC-DBND-004 | `@cadenza-dev/export-local` or adapter package dependency declarations |
| DBND-003 | TC-DBND-002 | preview package boundary, renderer adapter route, absence of Player App shell dependency |
| DBND-004 | TC-DBND-002 | renderer adapter interface and adapter-facing evidence |
| DBND-005 | TC-CDOC-002 | Stage B package topology notes or Proposed ADR if public package posture changes |
| DBND-006 | TC-DBND-003 | `@cadenza-dev/cli`, `@cadenza-dev/export-local`, root script wrapper boundary |
| DBND-007 | TC-CLIS-005, TC-DBND-004 | CLI command package imports, export-local workflow package imports, Remotion dependency declarations |
| DBND-008 | TC-DBND-005 | renderer adapter import boundary, subprocess/API isolation, raw renderer log boundary |
| CDIA-001 | TC-CLIS-004, TC-DLOD-003, TC-CDIA-001 | diagnostic schema, command diagnostics, manifest/evidence diagnostics |
| CDIA-002 | TC-DLOD-003, TC-CDIA-002 | exit-code taxonomy and command fixtures |
| CDIA-003 | TC-CDIA-001 | failed export evidence writer and partial-artifact status |
| CDIA-004 | TC-CDIA-002 | repair-routing categories and failure fixtures |
| CDIA-005 | TC-CLIS-003 | human stdout/stderr behavior and debug-stack boundary |
| CDIA-006 | TC-CLIS-006 | JSON diagnostic summary schema and command fixtures |
| CDIA-007 | TC-CDIA-003 | top-level error handling, cleanup/finalization exit preservation |
| CDIA-008 | TC-VINS-002, TC-VINS-004 | validate and inspect diagnostic categories and repair hints |
| CDIA-009 | TC-VIDO-003, TC-VIDO-004 | renderer-stage diagnostic categories, renderer provenance, raw-log debug evidence |
| CDOC-001 | TC-CDOC-001 | README pointer and dedicated local export walkthrough |
| CDOC-002 | TC-CDOC-001 | prerequisites and MP4 limitation documentation |
| CDOC-003 | TC-CDOC-002 | docs and evidence overclaim guard scans |
| CDOC-004 | TC-CDOC-001 | README-to-walkthrough routing |
| CDOC-005 | TC-CDOC-002 | generated output ownership language and testing-taxonomy reference |
| CDOC-006 | TC-CDOC-001 | machine-output docs, non-interactive behavior docs, confirmation flag docs |
| CDOC-007 | TC-CDOC-001 | minimal config docs, CLI override docs, broad-config non-claims |
| CDOC-008 | TC-CDOC-001, TC-CDOC-002 | static web compatibility docs, Player App non-claim language, future replacement boundary |
| CDOC-009 | TC-CDOC-001, TC-CDOC-002 | local export walkthrough expected command shapes, output paths, manifest and evidence field docs |
| CDOC-010 | TC-CDOC-002 | prohibited-claim scan fixtures for docs and generated evidence summaries |

## Draft Notes

- Future locations are not permission to edit `CONTRACT_FROZEN` specs,
  Accepted ADRs, `packages/**/src/**` as Architect, or
  `STATUS.yaml.current_phase`.
- Generated export artifacts should remain generated outputs under `dist/` or
  `tmp/`; tests may create and inspect them, but Stage B should not make them
  tracked fixtures.
- Stage B must keep the resolved decision summary in `SPEC_TEST_MATRIX.md`
  synchronized before any Phase 6 spec can become `CONTRACT_FROZEN`.
