# Phase 2 Reviewer Closeout

Reviewer pass for Phase 2 Builder closeout and the promoted `REV-P1-004`
traceability coverage evidence.

- Reviewed at: 2026-04-29
- Reviewer role: Phase 2 Reviewer
- Approved identity: GPT-5 / Codex, approved by maintainer in session
- Scope:
  - `spec/phase2/`
  - `prompt/PHASE2_KICK_BUILDER.md`
  - `trace/phase2/status.yaml`
  - `trace/phase2/tracker.md`
  - `trace/phase2/traceability-coverage.md`
  - `scripts/traceability-coverage.ts`
  - `scripts/traceability-coverage.test.ts`
- Mode: read-only review; no remediation performed

## Findings

### REV-P2-001 [blocker] B2.7 closes unproven acceptance scenarios

Evidence:

- `spec/phase2/SPEC_TEST_MATRIX.md` still lists `TC-PKG-004`,
  `TC-PRAD-007`, `TC-PRAD-008`, and `TC-RSRM-009` as Phase 2 acceptance
  scenarios.
- `prompt/PHASE2_KICK_BUILDER.md` says Phase 2 Builder work is complete only
  when all Phase 2 scenarios are green or explicitly waived by the maintainer.
- `trace/phase2/status.yaml` records `builder_batches_complete: met`, while
  B2.7 self-records `PKG-006`, `PRAD-008`, and `PRAD-007` as waived for
  closeout.
- `PRAD-007` is a P1 requirement that expects Remotion Player errors and
  Cadenza runtime diagnostics to share one preview diagnostics channel, but
  B2.7 explicitly says Remotion Player error aggregation was waived.

Why it matters:

The closeout record treats Builder-owned scope as complete without visible
maintainer waiver evidence for the unimplemented or unproven scenarios. This is
a false closeout risk: reviewer cannot distinguish maintainer-approved waiver
from Builder-side scope shrinkage.

Recommended remediation:

Either add explicit maintainer waiver evidence for the affected scenarios, or
return to Builder remediation and prove the missing scenarios with tests and
implementation evidence. P2 `MAY` items can remain waived, but the trace should
record the approval source.

Verification path:

The traceability report should show each affected scenario as either backed by
test and implementation evidence, or backed by an explicit maintainer waiver.
`builder_batches_complete` should not be `met` without one of those states.

Recommended owner: builder-remediation, with maintainer waiver decision if
needed.

### REV-P2-002 [high] Coverage tool lets circular trace evidence hide gaps

Evidence:

- `trace/phase2/traceability-coverage.md` shows `PKG-004`, `PKG-006`,
  `PRAD-007`, `PRAD-008`, `RSRM-009`, `BROW-007`, and `BROW-009` with
  `Test evidence` and `Implementation evidence` as `-`.
- The same rows still have `Trace status evidence`, including
  `trace/phase2/status.yaml`, `trace/phase2/tracker.md`, and
  `trace/phase2/traceability-coverage.md`.
- `scripts/traceability-coverage.ts` only emits a finding when trace evidence,
  test evidence, and implementation evidence are all empty.
- `scripts/traceability-coverage.test.ts` asserts the closeout requirement IDs
  only have non-empty trace status evidence, then expects `report.findings` to
  be empty.

Why it matters:

`REV-P1-004` was originally a traceability coverage gate weakness. The Phase 2
report reintroduces the same weakness in a narrower form by allowing a status
file mention, or even the generated report itself, to clear a coverage gap.
This turns trace text into acceptance evidence.

Recommended remediation:

Separate real acceptance evidence from trace declarations. Status, tracker, and
coverage-report files may document disposition, but they should not by
themselves satisfy an acceptance scenario that requires test or implementation
proof. If a requirement has no test or implementation evidence, it should remain
a finding unless an explicit maintainer waiver exists.

Verification path:

Add a regression fixture where `trace/phase2/status.yaml` mentions a
requirement, but no matching test or implementation file proves it. The report
should emit a finding for that requirement.

Recommended owner: builder-remediation.

### REV-P2-003 [medium] REV-P1-004 disposition is not explicit in the report

Evidence:

- `spec/phase2/SPEC_TRACEABILITY_COVERAGE.md` says Phase 2 promotes the
  deferred `REV-P1-004` governance finding into a non-mutating coverage design.
- `prompt/PHASE2_KICK_BUILDER.md` success criteria say the coverage report must
  record `REV-P1-004` evidence without editing frozen Phase 1 specs.
- `trace/phase2/traceability-coverage.md` lists deferred files and markers, but
  does not include the `REV-P1-004` ID, its source finding, or its current
  disposition.
- `scripts/traceability-coverage.ts` only scans generic markers such as
  `active-phase-only hard gate` and `Promoted into Phase 2 draft contract`.

Why it matters:

The report is supposed to make the former governance gap inspectable. Without a
stable `REV-P1-004` disposition, a future reviewer cannot tell whether the
finding is closed, converted into a report-only mitigation, or still waiting for
an active-phase-only hard gate decision.

Recommended remediation:

Add an explicit `REV-P1-004 disposition` section to the report. It should record
the original finding, the Phase 2 decision, the deferred active-phase-only hard
gate follow-up, and the boundary that frozen Phase 1 specs were not edited.

Verification path:

Extend `scripts/traceability-coverage.test.ts` so the generated report includes
`REV-P1-004`, the source or follow-up paths, and the current disposition.

Recommended owner: builder-remediation.

## Open Questions

- I did not find maintainer waiver evidence for `PRAD-007`, `TC-PKG-004`, or
  the other B2.7 waived scenarios inside the reviewed scope. If such approval
  exists only in chat, it should be recorded in trace before closeout is
  accepted.

## Residual Risk

- This pass did not inspect `packages/**` implementation details beyond the
  evidence surfaced by the named trace and coverage artifacts. The findings are
  about closeout truthfulness and traceability evidence, not a full code-level
  preview adapter audit.
- No Builder remediation launch phrase is emitted yet because the maintainer
  has not selected finding IDs for remediation.

## Reviewer Acceptance

- Reviewed at: 2026-04-29 18:19 +0800
- Reviewer role: Phase 2 Reviewer
- Approved identity: GPT-5 / Codex, approved by maintainer in session
- Scope:
  - `REV-P2-001`
  - `REV-P2-002`
  - `REV-P2-003`
  - `trace/phase2/status.yaml`
  - `trace/phase2/tracker.md`
  - `trace/phase2/traceability-coverage.md`
  - `scripts/traceability-coverage.ts`
  - `scripts/traceability-coverage.test.ts`
  - targeted preview evidence for `TC-PKG-004` and `TC-PRAD-007`
- Mode: read-only remediation review; no code remediation performed

### Acceptance Decision

Accepted. The Builder remediation resolves the three selected findings well
enough for Phase 2 closeout review.

### Accepted Remediation Evidence

- `REV-P2-001`: accepted. `PKG-004` now has unit evidence for the public
  controller surface, `PRAD-007` now has browser evidence for one preview
  diagnostics channel shared by Remotion Player errors and Cadenza diagnostics,
  and `PKG-006` / `PRAD-008` are recorded as maintainer-approved P2/MAY
  waivers rather than silently satisfied.
- `REV-P2-002`: accepted. `scripts/traceability-coverage.ts` now separates
  `Trace status evidence` from `Acceptance evidence`, and emits findings when a
  requirement has only trace declarations and no acceptance evidence or
  maintainer-approved waiver. Regression tests cover both trace-only evidence
  and existing future paths that do not name the requirement or scenario.
- `REV-P2-003`: accepted. `trace/phase2/traceability-coverage.md` now includes
  an explicit `REV-P1-004 Disposition` section with the source finding, Phase 2
  non-mutating report mitigation, deferred active-phase-only hard gate, follow-up
  paths, and the boundary that frozen Phase 1 specs were not edited.

### Verification

- `pnpm test -- scripts/traceability-coverage.test.ts packages/preview-remotion/src/navigation.test.ts`
  passed.
- `pnpm exec playwright test tests/browser/remotion-preview.spec.ts -g TC-PRAD-007`
  failed in the default sandbox only at Chromium launch with
  `sandbox_host_linux.cc` / `Operation not permitted`; the same targeted browser
  test passed with elevated permissions.
- Required closeout gates passed: `pnpm typecheck`, `pnpm test`, `pnpm lint`,
  `pnpm format:check`, `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, and `git diff --check`.

### Acceptance Scope

- This acceptance is scoped to the maintainer-selected remediation findings
  `REV-P2-001`, `REV-P2-002`, and `REV-P2-003`. It does not reopen a full
  Phase 2 preview adapter architecture or UX review.
- Root `STATUS.yaml.current_phase` and `trace/phase2/status.yaml` closeout
  pointers were intentionally left unchanged by Reviewer.
