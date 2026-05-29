# Cadenza — Execution Tracker (root)

> **Thin routing file.** All phase-specific execution detail lives in [`trace/<phase>/`](./trace/). This file is an index of where to look; it does not carry state.

## Active phase

**Phase 6 — Universal CLI and Local Export Engine** *(Builder ready; started 2026-05-30)*
→ [`trace/phase6/`](./trace/phase6/)

## Phase index

| Phase | Name                                  | Status                             | Archive                                |
| :---- | :------------------------------------ | :--------------------------------- | :------------------------------------- |
| 0     | Technical Pre-Commitment              | complete                           | [`trace/phase0/`](./trace/phase0/)     |
| 1     | Core Semantics & Typed API            | complete                           | [`trace/phase1/`](./trace/phase1/)     |
| 2     | React + Remotion Preview Adapter      | complete                           | [`trace/phase2/`](./trace/phase2/)     |
| 3     | AI Authoring Strengthening            | complete                           | [`trace/phase3/`](./trace/phase3/)     |
| 4     | Presentation Product Layer (pruned)   | complete                           | [`trace/phase4/`](./trace/phase4/)     |
| 5     | Export + 0.1 Alpha Readiness          | complete                           | [`trace/phase5/`](./trace/phase5/)     |
| 5.5   | Test and Harness Hygiene              | reviewer_accepted                  | [`trace/phase5-5/`](./trace/phase5-5/) |
| 6     | Universal CLI and Local Export Engine | builder_ready                      | [`trace/phase6/`](./trace/phase6/)     |

## How to read this after a context reset

Follow [`AGENTS.md`](./AGENTS.md) §1 Read Order. The authoritative sequence is:

1. `AGENTS.md`
2. `STATUS.yaml`
3. `docs/adr/README.md`
4. `docs/analysis/analysis-final.md` §0
5. `prompt/PHASE<N>_KICK_<ROLE>.md`
6. `spec/<current-phase>/`
7. `trace/<current-phase>/tracker.md`

Do not update this file in the middle of a phase — update `trace/<phase>/` instead.
