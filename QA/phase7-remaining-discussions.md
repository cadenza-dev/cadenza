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
| MP4 duration and animation semantics | [phase7-pre-architect-mp4-duration-follow-up.md](./phase7-pre-architect-mp4-duration-follow-up.md) | pending | Run a code-review session before freezing MP4 deck-duration or looping-animation behavior. |

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
- Deferred decisions: current support for indefinite looping animations,
  navigation granularity, canonical term for the smallest interruptible motion
  unit, MP4 dwell-time calculation, and evidence fields for duration source and
  loop handling.
- Completion signal: MP4 timing behavior should not be frozen until the relevant
  core, preview, and export timing code has been reviewed and the outcome is
  reflected in the QA notes or future Stage A material.

## Suggested Order

1. UI prototype discussion, because it can clarify Player App layout,
   information architecture, and visual quality before Phase 7 Architect work.
2. MP4 duration code review, because it affects export timing contract and can
   happen independently from UI prototyping.
