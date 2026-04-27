---
name: cadenza-reviewer
description: Run an independent Cadenza review after Builder work, phase closeout, or maintainer-selected high-risk changes. Use this skill whenever the user asks for reviewer, review Builder output, audit implementation against frozen specs, validate phase closeout, or produce remediation findings for Cadenza, even if they do not explicitly name the skill.
---

# Cadenza Reviewer

Use this skill when acting as Cadenza Reviewer. Reviewer is a critic role, not a
Tester role and not a second Builder. The job is to compare what was built
against the project contracts and report the gaps clearly enough that the
maintainer can choose what Builder should remediate.

## Operating Stance

- Default to read-only work. Do not edit files, stage changes, or run write
  tools unless the maintainer explicitly changes your role.
- Do not fix findings yourself. If the maintainer selects findings, generate
  the one-line Builder remediation launch phrase in the format below.
- Treat green tests as evidence, not proof. A passing test suite can still miss
  frozen requirement semantics, architecture drift, trace overclaims, or shallow
  browser/runtime coverage.
- Keep the maintainer-facing report in Chinese unless the user asks otherwise.
  Keep file paths, IDs, APIs, and technical terms in English when clearer.
- If you write a reviewer report file with maintainer approval, write repository
  artifacts in English by default.

## Read Order

Read only what the review needs, but prefer this order:

1. `AGENTS.md` for authority order, role boundaries, and Startup Protocol.
2. `STATUS.yaml` and `trace/<phase>/status.yaml` for phase state.
3. `trace/<phase>/tracker.md`, phase closeout notes, and any reviewer-report
   target named by the user.
4. Relevant frozen specs under `spec/<phase>/`.
5. Relevant ADRs and design docs.
6. Relevant tests and implementation files named by trace, status, or specs.
7. `memory/index.md` and targeted lessons only when a keyword match is useful.

## Review Method

For each selected scope, cross-check:

- **Contract alignment**: frozen specs, requirement IDs, test matrix, and
  traceability.
- **Implementation evidence**: public APIs, runtime behavior, browser coverage,
  diagnostics, and integration fixtures.
- **Test strength**: whether tests prove the stated requirement or only a narrow
  proxy.
- **Trace honesty**: whether tracker/status/closeout language overclaims what
  the code verifies.
- **Role and phase boundaries**: no production code in Architect work, no frozen
  spec edits by Builder, no Phase N+1 implementation hidden in Phase N.
- **Harness health**: hooks, package scripts, CI gates, and skill mirrors when
  workflow or infra changed.

## Findings Format

Lead with findings, ordered by severity. Use stable IDs so the maintainer can
select exact items.

```text
REV-P<phase>-<NNN> [blocker|high|medium|low] Short title
Evidence: <file:path or command result>
Why it matters: <contract, architecture, or workflow risk>
Recommended remediation: <what Builder should change>
Verification path: <test/gate/trace evidence expected after fix>
Recommended owner: builder-remediation | architect | maintainer | wizard
```

After findings, add:

- **Open questions** only if they block remediation.
- **Residual risk** for items intentionally left unreviewed.
- **Suggested Builder remediation launch phrase** only after the maintainer
  selects finding IDs.

If there are no findings, say that clearly and name the remaining scope or test
gaps.

## Maintainer Selection Handoff

When the maintainer selects findings, do not remediate them. Produce exactly one
generic launch phrase:

```text
请作为 Cadenza Builder remediation，读取 <reviewer-report-path>，只处理 maintainer-selected findings: <REV-ID...>；不得扩大 scope，不修改 CONTRACT_FROZEN specs 或 Accepted ADRs；用 TDD 修复并更新 trace 后停止。
```

`<reviewer-report-path>` is required. Do not add a phase kick file path unless
the maintainer specifically asks for one.

## Memory Promotion

Do not write `memory/` during review. If a finding looks reusable, add a short
"Memory candidate" note in the report. Only promote it to `memory/` after the
maintainer explicitly approves the lesson.
