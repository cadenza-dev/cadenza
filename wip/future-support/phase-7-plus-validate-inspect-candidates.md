# Phase 7+ Validate and Inspect Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-05-30.

These candidates came from Phase 6 Stage A validate/inspect brainstorming.
Phase 6 recommends `validate` as a deck/config/compile/timeline check with no
export deliverables by default, and `inspect` as artifact-only manifest and
evidence inspection. The items below are intentionally deferred: future
Architects must promote them into a phase spec before Builder treats them as
requirements.

## Source-Aware Inspect

- **Source**: Phase 6 `FC-VINS-02`.
- **Phase 6 disposition**: reject for the initial inspect command. Inspect reads
  existing export artifacts and does not load, compile, or render deck source.
- **Future support**: consider source-aware inspect after Player App and alpha
  workflows need drift detection between current source and prior export
  evidence.
- **Reason to defer**: source-aware inspect overlaps validate and export. It
  would make inspect slower, less deterministic, and harder to use on archived
  artifacts.

## Renderer Preflight In Validate

- **Source**: Phase 6 `FC-VINS-01`.
- **Phase 6 disposition**: validate does not invoke renderer adapters or write
  export deliverables by default.
- **Future support**: add an explicit renderer preflight mode if MP4 failures in
  alpha dogfood show that environment checks need a cheaper command than full
  export.
- **Reason to defer**: renderer preflight can accidentally become a partial
  export command. Phase 6 should first make real export diagnostics reliable.

## Export Evidence Diffing

- **Source**: Phase 6 inspect scope discussion and stable manifest/hash
  decisions.
- **Phase 6 disposition**: inspect summarizes one export's manifest, evidence,
  diagnostics, limitations, and artifact inventory.
- **Future support**: add `inspect --compare` or a dedicated diff command when
  users need to compare two export runs, renderer versions, or Player App
  bundles.
- **Reason to defer**: diff semantics depend on stable hash scope, volatile
  fields, and future app-based web evidence. Freezing comparison now would lock
  too much too early.

## Persistent Validate Reports

- **Source**: Phase 6 validation output discussion.
- **Phase 6 disposition**: validate writes no export deliverables by default and
  may write diagnostics only when explicitly requested.
- **Future support**: consider persistent validation reports if alpha workflows
  need shareable pre-export review artifacts or IDE integrations.
- **Reason to defer**: persistent reports create another artifact family. Phase
  6 already has export manifests and per-format evidence to stabilize first.
