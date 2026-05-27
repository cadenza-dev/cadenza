# Phase 9+ Roadmap - Cross-Format Semantics and Authoring Surfaces

> Status: WIP planning note, not a contract.
> Created: 2026-05-28.
> Source: maintainer roadmap adjustment after Phase 5 closeout review.

## Purpose

Phase 9+ should revisit Cadenza's deeper representation and authoring surface
after the local product loop and any cloud path have produced real pressure for
cross-format import/export, structured edits, or non-TSX maintenance.

## Thesis

PPTX, PDF, import/export IR, and editor work are semantic projects, not merely
renderer tasks. They should wait until Cadenza knows which slide semantics must
survive across formats and which authoring pain points are real for the target
developer-technical-talk audience.

## Candidate Scope

- Format strategy: define which parts of Cadenza semantics can map to PDF,
  PPTX, image sequences, or other external formats, and which parts must be
  explicitly lossy.
- PDF export: revisit static or print-like output with clear non-motion
  semantics, notes boundaries, and limitations.
- PPTX export/import: evaluate whether slide structure, steps, notes,
  typography, media, and transitions can be mapped without creating false
  parity claims.
- Structured representation: design a constrained IR or schema only if it is
  needed for import/export, audit, editing, or multi-agent maintenance.
- MDX or text-heavy authoring layer: promote only if developer-alpha usage shows
  TSX alone is too costly for narrative talks.
- Editor research: consider visual editing, structured diff/merge, or
  non-programmer maintenance after the IR and target audience pressure are clear.
- Round-trip rules: define what "round trip" means for each format and reject
  any claim that cannot preserve Cadenza's semantic intent.

## Non-Goals

- No Gamma/Tome-style prompt-to-deck product.
- No broad WYSIWYG editor before concrete evidence.
- No template marketplace.
- No second authoritative deck representation without an ADR-level reason.
- No claim that external formats are equivalent to Cadenza's native TSX and
  Remotion-backed model.

## Promotion Triggers

- Alpha users need PDF/PPTX deliverables often enough that manual workarounds
  are blocking adoption.
- Hosted or agent workflows require a more structured deck representation.
- TSX-first maintenance becomes too costly for the primary developer audience.
- At least one concrete cross-format semantic mapping problem is worth solving
  end to end.

## Exit Evidence

- Each supported external format has explicit capability, limitation, and
  lossiness fields.
- Any IR or schema has a clear authority relationship with the native TSX deck
  source.
- Editor or structured authoring work is justified by evidence from real
  workflows, not by generic deck-product expectations.

## Long-Term Boundary

Cadenza remains React-native and developer-oriented unless a future ADR
deliberately changes the product thesis. Cross-format support should broaden the
delivery surface without turning Cadenza into a generic business-deck suite.
