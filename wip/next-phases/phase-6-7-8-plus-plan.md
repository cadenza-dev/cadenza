# Phase 6, Phase 7, and Phase 8+ Planning

> Status: WIP planning note, not a contract.
> Created: 2026-05-26.
> Source: Phase 5 Architect Stage A maintainer review.

## Planning Premise

Phase 5 is being steered toward a public launch candidate rather than a purely
internal alpha-readiness proof. The target is a polished developer experience
that can support near-term public communication without overclaiming hosted,
commercial, or broad-format maturity.

The next phases should keep Cadenza's launch path sharp:

- local developer experience first;
- launch-grade demo and docs before hosted infrastructure;
- web bundle and scoped MP4 export before broad format parity;
- skills, examples, quickstart, and repair evidence before tool-based MCP;
- developer technical-talk positioning before any broader deck-product surface.

## Phase 6 — Public Developer Launch

Phase 6 should turn the Phase 5 launch candidate into a public developer alpha.

### Phase 6 Candidate Scope

- Publish-ready README and quickstart for a clean-checkout user journey.
- Public demo talk page or equivalent launch material backed by the Phase 5
  long technical talk.
- Web preview and the narrow `cadenza export <deck>` workflow walkthrough with
  known limitations.
- Package metadata and release preparation for `0.1.0-alpha`, if the Phase 5
  stability clock and Reviewer acceptance allow it.
- A small set of polished technical-talk starters, not a template marketplace.
- External dogfood collection from a small number of developers only after the
  local launch path is stable.

### Phase 6 Non-Goals

- Hosted SaaS implementation.
- Remotion Lambda production deployment.
- Broad template marketplace.
- WYSIWYG editor.
- Collaboration, comments, accounts, SSO, or enterprise features.
- Tool-based MCP unless Phase 5 command semantics are already stable enough to
  wrap safely.

### Phase 6 Promotion Triggers

- Phase 5 has a launch-grade long technical talk.
- Local web bundle export, scoped MP4 export, and the narrow
  `cadenza export <deck>` command are accepted.
- Public-facing docs and known limitations are reviewer-readable.
- The declared alpha surface is stable or has a maintainer-approved narrowed
  readiness claim.

## Phase 7 — Cloud and Agent Interaction Expansion

Phase 7 should expand from a strong local developer experience into shared
agent and cloud-capable workflows.

### Phase 7 Candidate Scope

- Remotion Lambda proof or cloud-export prototype, gated by the Phase 5 hosted
  evaluation and any required ADR.
- Tool-based MCP wrapping stable local capabilities such as validate, preview,
  `cadenza export`, inspect, and report.
- Multi-device presenter console if real dogfood shows it is a launch blocker
  or a strong differentiator.
- Session replay or live-presenter recording only if deterministic offline
  export fails to cover an important real use case.
- Cost, licensing, and operational risk evidence for a future hosted tier.

### Phase 7 Non-Goals

- Hosted commercial tier without explicit ADR and maintainer approval.
- Accounts, billing, comments, collaboration, or SSO by default.
- Direct exposure of unstable package internals through MCP tools.

### Phase 7 Promotion Triggers

- Phase 6 has public developer-alpha usage or maintainer dogfood showing real
  friction.
- Local export commands and evidence schemas are stable enough to expose.
- Remotion Lambda or hosted evaluation recommends a cloud path with documented
  licensing and cost assumptions.

## Phase 8+ — Authoring Surface and Editor Research

Phase 8+ should revisit deeper authoring surfaces only if the TSX-first path
shows real pressure.

### Phase 8+ Candidate Scope

- MDX-first layer for text-heavy talks.
- Constrained schema or IR for structured edits, audit, or import/export.
- Visual editor or structured diff and merge if developer-alpha usage proves
  TSX-only maintenance is too costly.
- Non-programmer maintenance support only if the developer technical-talk
  audience still remains primary.

### Phase 8+ Non-Goals

- Business prompt-to-deck product.
- Gamma/Tome-style template marketplace.
- Broad WYSIWYG editor before concrete evidence.
- Second authoritative deck representation without at least two ADR 0004
  pressures becoming real.

### Phase 8+ Promotion Triggers

- Stable local edits become critical.
- Strong audit or multi-tenant constraints appear.
- Cross-format import/export becomes a true requirement.
- A visual editor becomes necessary for the target developer audience, not for
  generic business-deck users.
