# Cadenza — Execution Tracker (root)

> **Thin routing file.** All phase-specific execution detail lives in [`trace/<phase>/`](./trace/). This file is an index of where to look; it does not carry state.

## Active phase

**Phase 1 — Core Semantics & Typed API** *(closeout ready; started 2026-04-25)*
→ [`trace/phase1/`](./trace/phase1/)

## Phase index

| Phase | Name                                  | Status                             | Archive                            |
| :---- | :------------------------------------ | :--------------------------------- | :--------------------------------- |
| 0     | Technical Pre-Commitment              | complete                           | [`trace/phase0/`](./trace/phase0/) |
| 1     | Core Semantics & Typed API            | complete, pending phase transition | [`trace/phase1/`](./trace/phase1/) |
| 2     | React + Remotion Preview Adapter      | not_started                        | `trace/phase2/`                    |
| 3     | AI Authoring Strengthening            | not_started                        | `trace/phase3/`                    |
| 4     | Presentation Product Layer (pruned)   | not_started                        | `trace/phase4/`                    |
| 5     | Export + 0.1 Alpha Readiness          | not_started                        | `trace/phase5/`                    |

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
