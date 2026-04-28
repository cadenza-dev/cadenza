---
id: MEM-20260429-minimal-phase-status-scaffold
source: human
severity: high
applies_to:
  - workflow
  - trace
  - phase-boundary
  - wizard
  - architect
status: active
superseded_by:
---

# Keep Phase-Open Status Minimal

## Trigger

When opening `trace/phase<N+1>/status.yaml` during a phase transition before
the next Architect has drafted and frozen that phase's contracts.

## Lesson

Use a minimal recovery scaffold only: phase identity, handoff routing, and
verified entry conditions. Do not pre-fill future spec file names, exit
criteria, Builder batches, or implementation evidence before Architect Stage
A/B has produced accepted artifacts.

Prospective guidance belongs in the Architect kick file or phase handoff note.
After Architect Stage A/B is complete and accepted, expand `status.yaml` with
the actual contract set, stage state, exit criteria, and handoff facts.

## Evidence

- `trace/phase2/status.yaml` was initially opened in commit `27e641f` with
  future Architect-stage placeholders before `spec/phase2/` existed.
- The maintainer corrected the workflow direction on 2026-04-29: phase
  transitions should create only the minimal `status.yaml` frame; detailed
  phase status belongs to Architect after Stage A/B confirmation.
