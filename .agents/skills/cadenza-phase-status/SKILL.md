---
name: cadenza-phase-status
description: Summarize the current Cadenza phase state from STATUS.yaml and trace files. Use this when the user asks for current phase status, open batches, blockers, exit criteria, or the next actionable Cadenza batch.
---

# Cadenza Phase Status

Use this skill to report Cadenza's current phase without inventing missing
fields. If a value is absent from the source files, write `not recorded`.

## Files To Read

1. `STATUS.yaml` to resolve `current_phase`, owners, start date, and exit gate.
2. `trace/<current-phase>/status.yaml` for machine-readable deliverable and
   exit-criteria status. If the file is empty or missing, report that.
3. `trace/<current-phase>/tracker.md` for timeline entries, open batches,
   blockers, and decisions.

## Report Shape

Return exactly this structure:

```text
Phase:     <current_phase> - <name> (<status>)
Owners:    <comma-separated list>
Started:   <date or "not recorded">
Exit gate: <path to exit criteria doc>

Open batches:
  - <ID> <name>  [<status>]  <blocker if any>

Recently completed (last 3 timeline entries):
  - <date> - <summary>

Blockers:
  - <item from tracker.md Blockers section>, or "none"

Exit criteria:
  - <ID> <description> - <met | partial | not_met | not recorded>
```

After the report, add one line:

```text
Next actionable batch (lowest-blocker): <ID>
```

If every open batch is blocked, instead write:

```text
All open batches are blocked; resolve <blocker-description> first.
```

Do not summarize files outside this read list unless the user asks.
