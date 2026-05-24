# Phase 4 Closeout Review

- Reviewer: GPT-5 / Codex, approved by maintainer for Phase 4 Reviewer work
- Date: 2026-05-24
- Scope: independent closeout review of Phase 4 Builder output against frozen
`spec/phase4/*`, `trace/phase4/status.yaml`, `trace/phase4/tracker.md`,
`prompt/PHASE4_KICK_BUILDER.md`, implementation evidence, tests, guidance, and
local preview evidence.

This review is read-only. It does not remediate findings, modify frozen specs,
modify Accepted ADRs, or update production code.

## Findings

### REV-P4-001 [blocker] Phase 4 closeout is missing the required maintainer visual sign-off or waiver

Evidence:

- `spec/phase4/SPEC_VISUAL_ACCEPTANCE_REPAIR.md` requires maintainer visual
  sign-off for Phase 4 closeout, with an explicit maintainer waiver allowed only
  when recorded with supporting evidence.
- `trace/phase4/evidence/b4.3-visual-acceptance-evidence.json` still records
  `"maintainerVisualDecision": "pending-closeout-signoff"`.
- `trace/phase4/status.yaml` claims all frozen Phase 4 scenarios are complete
  and that no maintainer waivers were required, but it does not point to a
  completed sign-off artifact.

Why it matters:

Phase 4 is the first product-layer dogfood phase. The frozen visual acceptance
contract explicitly says automated checks and Reviewer acceptance are not
sufficient substitutes for human visual acceptance. Closeout cannot be accepted
while the evidence remains pending.

Recommended remediation:

The maintainer should either perform and record visual sign-off for the Phase 4
dogfood preview, or record an explicit maintainer waiver with supporting preview
evidence. Builder remediation may then update the Phase 4 evidence/status so
the closeout state no longer points at `pending-closeout-signoff`.

Verification path:

- `trace/phase4/evidence/b4.3-visual-acceptance-evidence.json` records
  `maintainerVisualDecision` as `signed-off` or `explicit-waiver`.
- `trace/phase4/status.yaml` points to that sign-off or waiver evidence.
- Reviewer recheck confirms the frozen visual closeout gate is met.

Recommended owner: maintainer

### REV-P4-002 [high] Automated closeout gates allow pending visual sign-off to pass

Evidence:

- `packages/core/src/validation/visualAcceptanceEvidence.ts` treats preview
  commands or product workflow diagnostics as sufficient real acceptance proof
  even when `maintainerVisualDecision` is still `pending-closeout-signoff`.
- `packages/core/src/phase4-visual-acceptance-evidence.test.ts` expects the
  current pending visual evidence to validate with no findings.
- `scripts/phase-check.ts` invokes Phase 4 traceability coverage after
  `builder_batches_complete`, but that coverage only checks requirement-to-test
  evidence and maintainer waivers. It does not enforce the Phase 4 visual
  sign-off state.
- `pnpm phase:check` and
  `node --experimental-strip-types scripts/traceability-coverage.ts --phase 4
  --check` passed while REV-P4-001 remained true.

Why it matters:

This creates a false-closeout path: local and CI gates can pass even though a
frozen Phase 4 human acceptance gate is still pending. Future agents may trust
the green gate and incorrectly route the phase to Reviewer Acceptance or Wizard
handoff.

Recommended remediation:

Add a closeout-level gate that fails Phase 4 when visual acceptance remains
`pending-closeout-signoff` and no explicit sign-off or waiver artifact is
recorded. Keep the existing preview/diagnostic checks, but do not let them
replace the closeout decision.

Verification path:

- Add a regression test where Phase 4 closeout with
  `pending-closeout-signoff` fails `pnpm phase:check` or the active Phase 4
  closeout coverage check.
- Add/keep a passing fixture for `signed-off` or `explicit-waiver`.
- Re-run `pnpm test -- scripts/traceability-coverage.test.ts`,
  `pnpm phase:check`, and the full verification stack after remediation.

Recommended owner: builder-remediation

## Open Questions

None blocking remediation. REV-P4-001 requires a maintainer decision: visual
sign-off or explicit waiver.

## Residual Risk

- Browser verification depends on a Chromium-capable environment. In the default
  sandbox, `pnpm test:browser` fails with Chromium sandbox permission errors and
  `pnpm preview:phase4` cannot bind localhost. Elevated reruns during review
  confirmed `pnpm test:browser` passed 16/16 and the Phase 4 preview served `/`
  plus `/phase4-dogfood-preview.js` as HTTP 200.
- GitHub Actions run `26360043321` for `dedaca0` completed successfully, but CI
  skipped browser preview jobs for this change set. Local elevated browser proof
  is therefore the browser-observable evidence for this review.

## Verification Performed

- `pnpm typecheck`
- `pnpm test`
- `pnpm lint`
- `pnpm format:check`
- `pnpm exec markdownlint-cli2 "**/*.md"`
- `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`
- `pnpm spec:lint`
- `pnpm phase:check`
- `pnpm check:harness`
- `pnpm check:memory`
- `git diff --check`
- `node --experimental-strip-types scripts/traceability-coverage.ts --phase 4 --check`
- `pnpm test -- packages/core/src/phase4-visual-acceptance-evidence.test.ts`
- `pnpm test -- scripts/traceability-coverage.test.ts`
- `pnpm test:browser` under elevated execution, 16/16 passed
- `pnpm preview:phase4` under elevated execution, with `/` and
  `/phase4-dogfood-preview.js` returning HTTP 200

## Closeout Disposition

Phase 4 Builder output is not accepted yet. Reviewer Acceptance should wait
until REV-P4-001 is resolved by maintainer sign-off or waiver, and REV-P4-002 is
remediated so the closeout gate cannot pass while visual acceptance is still
pending.
