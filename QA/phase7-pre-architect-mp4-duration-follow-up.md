# Phase 7 Pre-Architect MP4 Duration Follow-Up

> Status: QA follow-up note, not a contract.
> Date: 2026-06-03.
> Source: Topic 5 discussion in
> [phase7-pre-architect-brainstorming-decisions.md](./phase7-pre-architect-brainstorming-decisions.md).

This note preserves deferred MP4 timing and animation-semantics questions for a
future code-review session. It does not replace Architect Stage A/B, future
specs, ADRs, or implementation plans.

## Settled Direction So Far

- App-based web export should package slides and the Player App into an
  immediately openable runtime environment.
- MP4 export should produce a standard video artifact that can be opened by
  ordinary video players.
- MP4 export should not include Player App chrome or any runtime environment UI.
- MP4 duration should be driven by project or CLI duration parameters, or by
  authored per-slide deck duration parameters where supported.

## Deferred Review Items

- Current capability: determine whether Cadenza currently supports indefinite
  looping animations that are interrupted by next page or next action behavior.
- Navigation granularity: determine whether current navigation advances at the
  deck/page level, the action level, or the smallest animation or motion unit.
- Terminology: decide the canonical term for the smallest interruptible
  animation unit if the current codebase has or needs one.
- MP4 duration algorithm: if indefinite looping animations are supported or
  added, review the deck dwell-time calculation before freezing MP4 timing
  behavior.
- Candidate timing rule: for a deck/page dwell-time base point, compare the
  latest final frame among all finite animations with the earliest first frame
  among all indefinite looping animations, then use the later of those two
  frames as the base point before applying configured dwell duration semantics.
- Evidence impact: decide how MP4 evidence should record duration source,
  authored overrides, loop handling, and limitations.

## Out Of Scope For This Note

- No code review was performed in this session.
- No claim is made about whether the current implementation already supports
  indefinite looping animations.
- No spec, frozen contract, ADR, package code, renderer behavior, or test
  expectation is changed by this note.

## Suggested Next Session Prompt

Review Phase 7 MP4 duration and animation-loop semantics. Read
`QA/phase7-pre-architect-mp4-duration-follow-up.md`,
`QA/phase7-pre-architect-brainstorming-decisions.md` Topic 5, and the current
core/preview/export timing code; determine whether Cadenza supports indefinite
looping animations, what navigation granularity currently means, how MP4 deck
dwell time should be calculated, and what evidence fields are needed. Update QA
notes only unless explicitly asked to write specs or code.
