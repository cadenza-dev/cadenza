# Phase 7+ Deck Loading Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-05-30.

These candidates came from Phase 6 Stage A deck-loading brainstorming. Phase 6
recommends strict deck module metadata, selector aliases as resolver shortcuts,
and export-local ownership of compile and timeline derivation. The items below
are intentionally deferred: future Architects must promote them into a phase
spec before Builder treats them as requirements.

## Filename Or Alias Identity Inference

- **Source**: Phase 6 `FC-DLOD-05`.
- **Phase 6 disposition**: reject for the initial contract. Deck modules must
  declare canonical stable identity; direct paths and aliases do not invent it.
- **Future support**: reconsider inference only as a scaffold or quickstart
  convenience if it produces an explicit module metadata block rather than a
  hidden manifest identity.
- **Reason to defer**: inferred identity can drift when files move or aliases
  change, which would make manifests, stable hashes, Player App identity, and
  alpha examples less reliable.

## Config-Owned Deck Identity

- **Source**: Phase 6 `FC-CNFG-04`.
- **Phase 6 disposition**: reject for the initial contract. Config aliases only
  map selector names to local module paths.
- **Future support**: reconsider config-owned display overrides only after
  Player App requirements clarify whether project-level presentation labels are
  needed in addition to canonical deck identity.
- **Reason to defer**: putting canonical identity in config creates two sources
  of truth and makes direct-path loading disagree with config-alias loading.

## Precompiled Deck Manifests

- **Source**: Phase 6 `FC-DLOD-02`.
- **Phase 6 disposition**: deck modules export authored deck metadata and a
  deck factory or deck value; export-local owns compile and timeline derivation.
- **Future support**: consider precompiled manifests for cache, remote export,
  import/export interchange, or hosted render queues after the authored deck
  contract and manifest schema are stable.
- **Reason to defer**: Phase 6 needs one authoritative deck source. Accepting
  precompiled manifests now would add another source before the local compiler
  and renderer evidence are settled.

## Sandboxed Deck Loading

- **Source**: Phase 6 `FC-DLOD-03`.
- **Phase 6 disposition**: trusted local TSX code execution, documented.
- **Future support**: revisit sandboxing if external alpha usage introduces
  untrusted templates, remote registries, marketplace workflows, or plugin
  loading.
- **Reason to defer**: sandboxing changes runtime, dependency, filesystem, and
  security assumptions. It should follow real trust-boundary pressure rather
  than precede the local developer workflow.
