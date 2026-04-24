---
description: "Summarize the current phase state from STATUS.yaml and trace/<phase>/tracker.md"
---


Read the following files, in order, and produce a tight status report. Do not invent fields — if something is missing, say "not recorded".

1. `STATUS.yaml` — to resolve `current_phase`, owners, exit-criteria ref.
2. `trace/<current-phase>/status.yaml` — machine-readable per-phase deliverable statuses.
3. `trace/<current-phase>/tracker.md` — narrative timeline, open batches, blockers, decision log.

Produce your report in this exact shape:

```text
Phase:     <current_phase> — <name> (<status>)
Owners:    <comma-separated list>
Started:   <date or "not recorded">
Exit gate: <path to exit criteria doc>

Open batches:
  - <ID> <name>  [<status>]  <blocker if any>

Recently completed (last 3 timeline entries):
  - <date> — <summary>

Blockers:
  - <item> (from tracker.md Blockers section), or "none"

Exit criteria:
  - <ID> <description> — <met | partial | not_met>
```

After the report, add one line: **"Next actionable batch (lowest-blocker): <ID>"** if a non-blocked batch exists, otherwise **"All open batches are blocked; resolve <blocker-description> first."**

Do not summarize files you were not asked to read. Do not guess at statuses.
