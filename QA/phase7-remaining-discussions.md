# Phase 7 Remaining Discussions

> Status: QA tracking note, not a contract.
> Date: 2026-06-03.
> Scope: follow-up discussion tracking for Phase 7 pre-Architect work.

This note tracks deferred discussion items that remain after the Phase 7
pre-Architect brainstorming pass. It does not replace Architect Stage A/B,
future specs, ADRs, or implementation plans.

## Tracking Summary

| Item | Source | Status | Next Action |
| :---- | :---- | :---- | :---- |
| UI prototype | [phase7-pre-architect-ui-prototype-follow-up.md](./phase7-pre-architect-ui-prototype-follow-up.md) | pending | Run a dedicated prototype discussion before Phase 7 Architect freezes UI or package contracts. |
| MP4 duration and animation semantics | [phase7-pre-architect-mp4-duration-follow-up.md](./phase7-pre-architect-mp4-duration-follow-up.md) | resolved | Carry the settled action-anchor, scoped continuous-animation, and MP4 clipping posture into Phase 7 Architect Stage A; reopen only if P0 expands to paused-anchor infinite looping or full MP4 visual parity. |

## UI Prototype

- Current direction: deck-primary balanced shell.
- Product posture: polished, visually strong, read-only player plus inspector.
- Deferred decisions: prototype artifact, technology stack, fixture/data
  strategy, responsive layout, inspector IA, visual quality bar, and Stage A
  handoff.
- Completion signal: Topic 3 in
  [phase7-pre-architect-brainstorming-decisions.md](./phase7-pre-architect-brainstorming-decisions.md)
  can move from `open` to `decided` only after a previewable prototype or
  explicitly accepted design substitute resolves the blocker.

## MP4 Duration And Animation Semantics

- Current direction: MP4 export should produce a standard video artifact without
  Player App chrome.
- Settled decisions: navigation should remain at `step/action anchor`
  granularity, with `action anchor` as the preferred working term. Phase 7 does
  not need a separate smallest interruptible `motion unit` concept. Current-page
  continuous animation may be promoted to P0 only as a scoped Player App /
  app-web visual capability that is bound to the active action anchor and stops
  or freezes after advance.
- MP4 posture: continuous animation should not create an infinite dwell-time or
  deck-duration baseline. MP4 should keep a finite offline timeline duration,
  clip current-page animation to the relevant slide or step segment, and record
  duration baseline plus animation clipping or limitations in evidence.
- Completion signal: the pre-Architect review question is resolved in the linked
  follow-up. Architect Stage A may choose exact evidence field names and API
  shape, but should not reopen motion-unit navigation unless a new P0 scenario
  explicitly requires it.

## Suggested Order

1. UI prototype discussion, because it can clarify Player App layout,
   information architecture, and visual quality before Phase 7 Architect work.
2. Carry the resolved MP4 timing and animation semantics into Phase 7 Architect
   Stage A after the UI prototype discussion is resolved or explicitly deferred.
