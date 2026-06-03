# Phase 7 Pre-Architect MP4 Duration Follow-Up

> Status: QA follow-up note, not a contract.
> Date: 2026-06-03.
> Updated: 2026-06-04.
> Source: Topic 5 discussion in
> [phase7-pre-architect-brainstorming-decisions.md](./phase7-pre-architect-brainstorming-decisions.md).

This note records the pre-Architect MP4 timing and animation-semantics review
outcome. It does not replace Architect Stage A/B, future specs, ADRs, or
implementation plans.

## Settled Direction So Far

- App-based web export should package slides and the Player App into an
  immediately openable runtime environment.
- MP4 export should produce a standard video artifact that can be opened by
  ordinary video players.
- MP4 export should not include Player App chrome or any runtime environment UI.
- Navigation should remain at `step/action anchor` granularity, with
  `action anchor` as the preferred working term. Phase 7 should not introduce a
  separate navigable `motion unit`.
- Current-page continuous animation may be promoted to Phase 7 P0 only in a
  scoped form: a Player App / app-web visual capability bound to the active
  action anchor that stops or freezes when the user advances.
- MP4 duration should keep the finite offline compiled timeline as the baseline.
  Project, CLI, or authored duration parameters may feed finite slide or step
  segments where supported, but current-page continuous animation must be
  clipped to those finite segments rather than expanding deck duration.

## Reviewed Outcomes

- Current implementation does not expose a first-class authored indefinite
  looping animation primitive in the typed API. `StepContext` remains semantic
  and does not expose frame or progress values.
- Core compiler and runtime should continue to own semantic timeline,
  transitions, and action-anchor navigation. They should not become a per-frame
  animation engine for Phase 7 P0.
- Preview / Player App is the right layer for the scoped P0: derive active
  action-anchor frame state in the render layer, expose only conservative visual
  context or primitives, and prevent previously revealed steps from continuing
  to animate after advance.
- Interactive paused-anchor infinite looping is a separate, higher-cost feature.
  It would require an opt-in local animation clock or adapter/controller design
  because the current Player navigation pauses at action anchors.
- MP4 visual parity for authored deck animation is also higher-cost. The current
  MP4 renderer uses an independent Remotion entrypoint rather than the authored
  deck / Player App visual tree, so Phase 7 P0 should not require full animated
  deck visual parity in MP4.
- MP4 evidence should record the duration baseline and animation handling,
  using Stage A-selected field names such as `durationBaseline`,
  `animationClipping`, `visualMotionPolicy`, or equivalent per-format evidence
  fields. Manifest-level summaries should remain compact.

## Rejected Or Deferred P0 Shapes

- Do not use deck page as the only navigation unit; it is too coarse for
  Cadenza's existing step reveal and action semantics.
- Do not introduce a navigable `motion unit` for Phase 7; it would complicate
  authoring and export semantics without a concrete P0 need.
- Do not treat "current-page continuous animation" as unbounded MP4 dwell time.
- Do not make full PowerPoint repeat-timing parity, interactive paused-anchor
  infinite looping, or full MP4 animated visual parity part of Phase 7 P0.

## Out Of Scope For This Note

- No spec, frozen contract, ADR, package code, renderer behavior, or test
  expectation is changed by this note.
- No implementation was performed, no package source was modified, and no
  product or runtime verification commands were run as part of this
  pre-Architect review.
- Exact API names, evidence field names, and implementation slices remain for
  Phase 7 Architect Stage A/B and Builder planning.

## Suggested Next Session Prompt

Carry Phase 7 MP4 duration and animation semantics into Architect Stage A. Read
`QA/phase7-pre-architect-mp4-duration-follow-up.md`,
`QA/phase7-pre-architect-brainstorming-decisions.md` Topic 5, and the current
core/preview/export timing code; preserve `step/action anchor` navigation,
define scoped current-page continuous animation as a P0 Player App / app-web
visual capability, keep MP4 duration finite via the offline compiled timeline,
and choose evidence field names for duration baseline and animation clipping.
Do not introduce navigable motion units, paused-anchor infinite looping, or full
MP4 animated visual parity unless the maintainer explicitly expands P0 scope.
