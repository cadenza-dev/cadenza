# Phase 7+ Renderer Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-05-30.

These candidates came from Phase 6 Stage A local MP4 rendering brainstorming.
Phase 6 recommends a stable renderer adapter contract while keeping the direct
Remotion API versus Remotion CLI subprocess strategy private. The items below
are intentionally deferred: future Architects must promote them into a phase
spec before Builder treats them as requirements.

## Direct Remotion API As Public Contract

- **Source**: Phase 6 `FC-VIDO-01` and `FC-DBND-03`.
- **Phase 6 disposition**: do not freeze direct Remotion renderer APIs as the
  public or package-level contract. Freeze the adapter boundary instead.
- **Future support**: promote direct API usage only if Builder evidence shows it
  is stable, debuggable, and meaningfully better than subprocess invocation for
  local and future Player App export.
- **Reason to defer**: direct APIs can expose private Remotion details to the
  export engine too early. The adapter should absorb that choice first.

## Remotion CLI Subprocess As Public Contract

- **Source**: Phase 6 `FC-VIDO-01` and Remotion CLI research.
- **Phase 6 disposition**: spawning Remotion CLI may be an implementation
  strategy, but it is not the public adapter contract.
- **Future support**: promote subprocess invocation only if it proves more
  reliable for local users and its logs, exit codes, cancellation, and cleanup
  can be normalized through Cadenza diagnostics.
- **Reason to defer**: subprocess behavior can be coarse and environment
  sensitive. Freezing it would make diagnostics and progress handling harder to
  refine.

## Hosted Or Lambda Renderer

- **Source**: Phase 6 local-only renderer boundary and future hosted roadmap.
- **Phase 6 disposition**: no hosted rendering, Remotion Lambda production path,
  cloud queue, accounts, credentials, paid jobs, or remote rendering
  prerequisite.
- **Future support**: add a hosted renderer adapter in a future phase only after
  local export, Player App web export, and alpha feedback prove the need.
- **Reason to defer**: hosted rendering carries product, cost, security, and
  operational decisions that do not belong in the local Phase 6 contract.

## Pixel-Level MP4 And Preview Parity

- **Source**: Phase 6 `FC-VIDO-03`.
- **Phase 6 disposition**: MP4 evidence records file, renderer provenance,
  metadata, manifest linkage, diagnostics, and limitations; it does not require
  frame-by-frame pixel parity.
- **Future support**: add stronger media or pixel checks if alpha dogfood shows
  visual regressions that metadata and browser evidence cannot catch.
- **Reason to defer**: pixel checks can be brittle across browsers, codecs,
  operating systems, fonts, and renderer versions.

## Fully Portable Renderer Environment

- **Source**: Phase 6 `FC-VIDO-04`.
- **Phase 6 disposition**: detect and document local prerequisites rather than
  bundle or guarantee a fully portable renderer environment.
- **Future support**: revisit portable renderer packaging if alpha setup
  friction becomes the primary blocker.
- **Reason to defer**: packaging browsers, codecs, and media tooling as a
  portable environment is operationally heavy and can obscure the actual local
  prerequisite boundary Phase 6 needs to document.
