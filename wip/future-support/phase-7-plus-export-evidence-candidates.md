# Phase 7+ Export Evidence Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-05-30.

These candidates came from Phase 6 Stage A export-evidence brainstorming.
Phase 6 recommends a compact summary manifest, per-format evidence files, and a
stable hash over deterministic contract fields only. The items below are
intentionally deferred: future Architects must promote them into a phase spec
before Builder treats them as requirements.

## Append-Only Event Log

- **Source**: Phase 6 `FC-EXEN-01`.
- **Phase 6 disposition**: use manifest plus per-format evidence files, not an
  event log as the primary export evidence model.
- **Future support**: reconsider an append-only event log for hosted rendering,
  long-running Player App export, resumable jobs, cancellation, or live agent
  progress.
- **Reason to defer**: event logs are useful once there is a long-lived process
  or remote runner. Phase 6 local export needs stable summary evidence first.

## Byte-Level Artifact Hashing

- **Source**: Phase 6 `FC-EXEN-03`.
- **Phase 6 disposition**: exclude generated artifact bytes from the stable
  export hash. Per-format evidence may record artifact size, container
  metadata, or optional implementation-local checksums, but they are not the
  Phase 6 stable identity.
- **Future support**: add byte-level hashes if alpha workflows need artifact
  integrity checks, release asset verification, cache keys, or remote transfer
  validation.
- **Reason to defer**: MP4 and browser-generated artifacts can vary by machine,
  browser, renderer version, codec settings, or filesystem path. Making bytes
  part of the stable Phase 6 hash would make legitimate exports look unstable.

## Signed Provenance

- **Source**: Phase 6 discussion of stronger export evidence and future alpha
  or hosted workflows.
- **Phase 6 disposition**: no signatures, attestations, or tamper-proof export
  provenance.
- **Future support**: consider signed provenance only after public alpha or
  hosted distribution introduces trust, release, or supply-chain requirements.
- **Reason to defer**: signing evidence implies key management and release
  process. Phase 6 is local-only.

## Export Comparison Command

- **Source**: Phase 6 stable hash and inspect discussions.
- **Phase 6 disposition**: inspect summarizes one export. It does not compare
  two export runs.
- **Future support**: consider `inspect --compare` or a dedicated comparison
  command after stable hash semantics, Player App web evidence, and MP4 evidence
  have settled.
- **Reason to defer**: comparison semantics depend on which fields are stable,
  which are volatile, and how future app-based web export records evidence.
