---
id: MEM-20260530-reviewer-handoff-report-path
source: human
severity: high
applies_to:
  - workflow
  - reviewer
  - handoff
  - trace
status: active
superseded_by:
---

# Do Not Handoff From a Missing Reviewer Report

## Trigger

When acting as Reviewer and the maintainer selects findings for Builder
remediation, especially after the findings were only reported in chat.

## Lesson

Do not generate a Builder remediation launch phrase that asks Builder to read a
reviewer report path unless that report file already exists.

Reviewer may stay read-only by default, and `cadenza-reviewer` does not require
automatic report-file creation. However, the maintainer-selection handoff format
requires a concrete `<reviewer-report-path>`. If the findings exist only in
chat, first ask for maintainer approval to write the report under
`trace/<phase>/review*.md`. After the report exists, then emit the remediation
launch phrase that references it.

## Evidence

- During Phase 6 closeout review, findings `REV-P6-001`, `REV-P6-002`, and
  `REV-P6-003` were initially reported only in chat.
- After the maintainer selected all findings, Reviewer emitted a Builder
  remediation phrase pointing at `trace/phase6/review-phase6-closeout.md`
  before that file existed.
- The maintainer corrected the workflow and approved writing the missing
  reviewer report plus this lesson on 2026-05-30.
