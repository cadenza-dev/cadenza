# `trace/` — Phase Execution Archives

Phase-specific execution records, one subdirectory per phase. Root files (`STATUS.yaml`, `EXECUTION_TRACKER.md`) stay **thin and stable**; all batch-by-batch detail lives here.

## Layout per phase

```text
trace/phase<N>/
├── status.yaml    ← machine-readable: batch statuses, stage timestamps, stats
└── tracker.md     ← human-readable: narrative batch log, decisions, learnings
```

## Purpose

1. **Auditability** — the historical record of who decided what and why.
2. **Context-compression recovery** — when an agent loses context, the Read Order in [`AGENTS.md`](../AGENTS.md) §1 points here for mid-phase resumption.
3. **Phase closure** — phases close by finalizing these two files. They never migrate back into the root.

## Writing discipline

- **Builder** updates `tracker.md` after **every** batch. Insert entries directly below the H1, newest-first, with heading format `YYYY-MM-DD HH:MM +ZZZZ — Title`. Missing tracker updates make recovery fail — this is enforced advisorily by [`scripts/hooks/session-stop-audit.sh`](../scripts/hooks/session-stop-audit.sh).
- **Architect** updates `status.yaml` at stage boundaries (Stage A complete, Stage B frozen).
- **Reviewer** may write `review*.md` reports only with maintainer approval.
- **Wizard** may write phase handoff notes and next-kick preparation artifacts,
  but does not flip the root phase pointer.
- Neither file is `CONTRACT_FROZEN`. They are execution logs, not contracts.

At phase open, the new phase's `status.yaml` should be a minimal recovery
scaffold only: phase identity, routing handoff, and verified entry conditions.
Do not pre-fill future spec file names, exit criteria, Builder batches, or
implementation evidence before the Architect has completed Stage A/B and the
maintainer has accepted the resulting contracts. Put prospective guidance in
the kick file or handoff note instead; record it in `status.yaml` only after
the corresponding artifact exists.

## Naming convention

- `phase0`, `phase1`, `phase2`, … — primary phases.
- `phase2.5`, `phase2.7`, … — decimal sub-phases for mid-phase specialization (e.g., a platform-hardening pass inside an otherwise-stable phase). Following the precedent set by `eden-skills`.

Do not use `phase-1` or `phase_1`. Stick to `phase<N>` where `<N>` is a digit string, optionally containing a dot.

## What belongs in `status.yaml` vs `tracker.md`

| Concern | Where |
| :--- | :--- |
| Per-deliverable status (done / in-progress / blocked) | `status.yaml` |
| Stage timestamps (Stage A started / closed, Stage B frozen) | `status.yaml` |
| Exit-criteria checklist and statuses | `status.yaml` |
| Machine-parseable statistics (requirement counts, FC counts, test counts) | `status.yaml` |
| Narrative "what happened in this batch, what surprised us, what we decided" | `tracker.md` |
| Decision log with rationale | `tracker.md` |
| Blocker descriptions and unblock notes | `tracker.md` |
| Hand-off notes to future sessions | `tracker.md` |

When in doubt: if an agent or CI script would want to parse it, put it in `status.yaml`. If a human would want to read it to catch up, put it in `tracker.md`.
