# Cadenza Project Memory

`memory/` stores maintainer-approved lessons that future agents should check
before repeating known mistakes. It is an advisory retrieval layer, not a source
of project authority.

Authority still flows through:

```text
spec/**/*.md (CONTRACT_FROZEN)
  > spec/**/*.md (unfrozen)
  > STATUS.yaml
  > EXECUTION_TRACKER.md
  > docs/adr/**
  > docs/design/**
  > ROADMAP.md
  > README.md
  > memory/**
  > chat history
```

## What Belongs Here

- Human-supervisor corrections that the maintainer explicitly wants future
  agents to remember.
- Reviewer findings that the maintainer accepted as reusable lessons.
- Short, searchable rules that prevent repeated workflow, harness, spec,
  traceability, or implementation mistakes.

## What Does Not Belong Here

- Raw review reports. Keep those under `trace/<phase>/`.
- Every issue a reviewer found. Only promote lessons after maintainer approval.
- Frozen project requirements. Those belong in `spec/` or ADRs.
- Long session transcripts.

## Lesson Format

Use one Markdown file per lesson under `memory/lessons/human/` or
`memory/lessons/reviewer/`.

```markdown
---
id: MEM-YYYYMMDD-short-slug
source: human | reviewer
severity: blocker | high | medium | low
applies_to:
  - workflow
  - hooks
status: active
superseded_by:
---

# Short Lesson Title

## Trigger

When this situation appears...

## Lesson

Do this instead...

## Evidence

- `trace/phaseN/...`
```
