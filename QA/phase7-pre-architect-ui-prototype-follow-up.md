# Phase 7 Pre-Architect UI Prototype Follow-Up

> Status: QA follow-up note; discussion decisions captured; not a contract.
> Date: 2026-06-03.
> Source: Topic 3 discussion in
> [phase7-pre-architect-brainstorming-decisions.md](./phase7-pre-architect-brainstorming-decisions.md).

This note preserves the deferred discussion items for a future Phase 7 UI
prototype session. It does not replace Architect Stage A/B, future specs, ADRs,
or implementation plans.

## Current Resolution

The dedicated UI prototype QA discussion has been split into
[phase7-pre-architect-ui-prototype-topics.md](./phase7-pre-architect-ui-prototype-topics.md)
and
[phase7-pre-architect-ui-prototype-decisions.md](./phase7-pre-architect-ui-prototype-decisions.md).
Q1-Q20 are settled there. The remaining blocker is not another QA question; it
is the Q17 promotion evidence packet: a previewable prototype in
`design/ui-prototype/` or an explicitly accepted design substitute, annotated
screenshots, fixture provenance map, limitation note, and guideline
cross-references.

## Settled Direction So Far

- The Player App direction is a deck-primary balanced shell.
- The app should be a polished, visually strong, read-only player plus
  inspector.
- Deck playback is the primary surface.
- Controls likely belong in a stable bottom bar.
- A single discoverable inspector should carry outline or chapter navigation,
  readiness, diagnostics, and export provenance.
- Phase 7 should not include WYSIWYG editing, source editing, in-app repair
  workbench behavior, or AI patching UI.

## Original Deferred Discussion Items

- Prototype artifact: where the previewable frontend prototype should live, and
  whether it should be disposable, reusable, or promoted into Phase 7 work.
- Prototype technology stack: whether to use the repo's existing React/Remotion
  path, a standalone frontend prototype, or another minimal preview setup.
- Data strategy: whether the prototype should use static fixture data, real
  Cadenza deck/timeline/snapshot data, or a hybrid.
- Layout model: how deck canvas, bottom controls, and the inspector behave on
  desktop and mobile.
- Inspector information architecture: how to organize outline, readiness,
  diagnostics, provenance, notes boundaries, and known limitations.
- Visual quality bar: what level of polish is required before the UI direction
  can move from `open` to `decided`.
- Stage A handoff: how prototype findings should feed into Architect Stage A
  without accidentally becoming frozen contract language.

These items have now been discussed and settled in the UI prototype topic and
decision pair:
[phase7-pre-architect-ui-prototype-topics.md](./phase7-pre-architect-ui-prototype-topics.md)
and
[phase7-pre-architect-ui-prototype-decisions.md](./phase7-pre-architect-ui-prototype-decisions.md).

## Suggested Next Step Prompt

Prepare the Phase 7 UI prototype promotion evidence packet. Read
`QA/phase7-pre-architect-ui-prototype-follow-up.md`,
`QA/phase7-pre-architect-ui-prototype-topics.md`,
`QA/phase7-pre-architect-ui-prototype-decisions.md` Q17, and the guideline
files under `design/ui-prototype/`. Build or accept a design substitute only if explicitly
authorized, then collect annotated screenshots, fixture provenance map,
prototype limitation note, and guideline cross-references. Update QA
follow-up/decision notes only unless separately asked to implement the
prototype; do not write specs, freeze contracts, or edit packages.
