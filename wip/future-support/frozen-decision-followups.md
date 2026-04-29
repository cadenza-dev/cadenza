# Future Support Notes from Frozen Decisions

> Status: WIP planning index, not a contract.
> Source date: 2026-04-25.

This index points to future-support notes derived from frozen Phase 1 compiler
and spec decisions. These notes are not commitments; they are review material
for later phase planning.

## Roadmap Resequencing Note

`fb8a408 docs: revise roadmap phase sequencing` added a standalone Phase 2 for
the React + Remotion Preview Adapter and moved AI-authoring strengthening to
Phase 3. The original future-support notes were created earlier in
`29528f6 Freeze phase 1 specs and track followups`, so any older "Phase 2" or
"Phase 3" target must be checked against the current `ROADMAP.md` before
promotion.

## Files

- [Phase 2 Candidates](./phase-2-candidates.md): closed and reclassified
  after the preview-adapter phase completed.
- [Phase 3 Candidates](./phase-3-candidates.md): AI authoring strengthening.
- [Phase 4 Candidates](./phase-4-candidates.md): presentation product layer.
- [Conditional Or Later Candidates](./conditional-or-later-candidates.md)

## Review Rule

Re-read the relevant file at each phase boundary. Promote an item into an ADR or
phase spec only when it becomes an actual decision, implementation requirement,
or exit criterion.
