# Phase 3 Closeout Review

Reviewer identity: `GPT-5/Codex`, approved by maintainer in chat for Phase 3
Reviewer work.

Scope: read-only closeout review of `trace/phase3/status.yaml`,
`trace/phase3/tracker.md`, frozen `spec/phase3/*`, and Builder evidence. No
remediation was performed.

## Findings

REV-P3-001 [blocker] Repair-loop evidence violates the `AUTH-001` package-src boundary

Evidence: `spec/phase3/SPEC_AUTHORING_LOOP.md` requires the authoring loop to
start from public Cadenza authoring surfaces and says repair of an authored deck
must not require editing `packages/**/src/**`. However
`trace/phase3/evidence/b3.2-repair-evidence.json` records both
`authoredDeckPath` and `repairedDeckPath` as
`packages/core/src/fixtures/phase3Acceptance.tsx`, and lists the same package
source path under `repairScope.allowedEdits`. The browser test in
`tests/browser/remotion-preview.spec.ts` also asserts that evidence shape.

Why it matters: Phase 3 is supposed to prove that AI repair stays on authored
deck or authoring-guidance surfaces, not on framework package source. The
current evidence says there are no `frameworkInternalEdits`, but the accepted
repair path still lives under `packages/**/src/**`.

Recommended remediation: Move the Phase 3 acceptance / repair-candidate deck to
a non-`packages/**/src/**` authored fixture or example path, and add an assertion
that repair evidence allowed edits do not match `packages/**/src/**`.

Verification path: Run the targeted B3.2 unit/browser tests, then the full
Phase 3 verification stack, and update `trace/phase3/status.yaml` plus
`trace/phase3/tracker.md`.

Recommended owner: builder-remediation. If the maintainer wants package source
fixtures to count as authored deck surfaces, route that to Architect first
because it changes frozen spec semantics.

REV-P3-002 [high] `DIAG-003` lacks trace-only negative proof

Evidence: `spec/phase3/SPEC_REPAIR_DIAGNOSTICS.md` requires the repair surface
to distinguish acceptance evidence from trace declarations, and specifies that
`TC-DIAG-003` includes a trace-only evidence fixture or assertion that remains a
finding until real acceptance evidence or a maintainer waiver exists. Current
B3.2 coverage verifies only positive browser evidence. The only trace-only field
in the committed evidence is `traceDeclarationOnly: false`, which proves the
happy path but not that trace-only declarations are rejected.

Why it matters: Without this negative proof, Phase 3 can regress into the exact
false-closeout pattern the frozen diagnostics spec is trying to prevent:
trace prose can appear sufficient even when compile, preview, test, or
implementation proof is absent.

Recommended remediation: Add a negative fixture/test where trace declaration
alone remains a finding, then prove the real B3.2 browser evidence clears that
finding.

Verification path: Run the targeted `TC-DIAG-003` test, the B3.2 browser
evidence test, then the full Phase 3 verification stack, and update trace.

Recommended owner: builder-remediation.

## Open Questions

None for Builder remediation if both findings are accepted as selected.

## Residual Risk

This review did not rerun local checks or GitHub Actions. It is based on static
cross-checking of frozen specs, trace/status files, tests, and committed
evidence artifacts.

## Maintainer Selection

Selected findings: `REV-P3-001`, `REV-P3-002`.

## Suggested Builder Remediation Launch Phrase

请作为 Cadenza Builder remediation，读取 trace/phase3/review-phase3-closeout.md，只处理 maintainer-selected findings: REV-P3-001, REV-P3-002；不得扩大 scope，不修改 CONTRACT_FROZEN specs 或 Accepted ADRs；用 TDD 修复并更新 trace 后停止。
