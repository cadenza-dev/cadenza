# Phase 5 Closeout Review

## 2026-05-27 18:24 +0800 - Initial Reviewer Findings

Startup identity: proceeded as Phase 5 Reviewer with `GPT-5` / `codex` after
maintainer approval in this session.

Review scope: read-only closeout review of `trace/phase5/status.yaml`,
`trace/phase5/tracker.md`, frozen Phase 5 contracts, generated export evidence,
full verification claims, and alpha-readiness overclaim guards.

Reviewed state:

- Current `HEAD`: `2bbbe85` (`chore: update codex_hooks to hooks`).
- Builder closeout commit: `a38ee8f` (`docs: record phase 5 builder closeout`).
- Alpha surface commit observed during review: `b60d4b7`
  (`feat(phase5): declare alpha launch surface`).

Closeout disposition: **not accepted pending remediation**. Builder closeout
evidence is traceable, but the generated preview/export parity evidence
contains a P0 contract mismatch that blocks Reviewer acceptance.

### REV-P5-001 [blocker] Preview/export parity evidence overclaims passed status

Evidence:

- `spec/phase5/SPEC_PREVIEW_EXPORT_PARITY.md` requires parity checks to compare
  slide and step ordering, offline export timing, transition start and settle
  behavior, and final semantic cursor anchors.
- `dist/phase5/phase5-alpha-readiness-talk/b5-6-manual/manifest.json` records
  `previewExportParity.status` as `passed`.
- The same manifest records exported `evidence-gates` step 1 as `[552, 624]`
  and preview `evidence-gates` step 1 as `[552, 600]`.
- The same manifest records exported `evidence-gates -> alpha-boundaries`
  transition settle at `624` and preview settle at `600`.
- Read-only `jq` comparison during review returned
  `stepOrderingEqual: false`, `transitionsEqual: false`, and
  `status: "passed"`.
- `packages/core/src/phase5-export.test.ts` asserts preview/export
  `timelineIdentity` equality and exported deterministic fields, but does not
  assert full preview/export step-segment or transition equality.

Why it matters: `TC-PEXP-001` / `TC-PEXP-002` are P0 Phase 5 scenarios. The
generated evidence currently marks parity as passed while its own timing fields
show a mismatch. That makes B5.7's "all acceptance scenarios complete" claim
too strong.

Recommended remediation: Add a failing test that catches the current false
positive, then make parity status derived from actual preview/export evidence.
If offline export is allowed to differ for `wait-for-event` steps with
`exportDuration`, encode that rule explicitly in the evidence and tests instead
of leaving the report as an unconditional `passed`.

Verification path: focused B5.2 tests should fail against the current evidence,
then pass after the parity oracle or allowed-delta evidence is corrected. The
full Builder verification stack should be rerun and `trace/phase5/status.yaml`
and `trace/phase5/tracker.md` should record the remediation evidence.

Recommended owner: builder-remediation

### REV-P5-002 [medium] Alpha stability clock evidence is stale or ambiguous

Evidence:

- `spec/phase5/SPEC_ALPHA_READINESS.md` states that the one-month stability
  clock starts at the first Builder commit declaring the public alpha surface if
  that surface is explicit and traceable; otherwise it starts after Reviewer
  acceptance.
- `git log` shows `b60d4b7 feat(phase5): declare alpha launch surface`.
- `dist/phase5/phase5-alpha-readiness-talk/b5-6-manual/alpha-readiness-evidence.json`
  still records the stability clock status as `pending-first-builder-commit`.

Why it matters: this does not claim final `0.1 alpha readiness`, but it leaves
the future readiness gate underspecified. After remediation, Reviewer
acceptance must not accidentally become a substitute for the one-month clock
unless that is the intended and recorded route.

Recommended remediation: Record the stability-clock start commit and timestamp,
or explicitly route the clock to "after Reviewer acceptance" with rationale. If
the public surface changes during remediation, Builder should record whether
the clock restarts.

Verification path: `TC-ALFA-002` should assert the chosen clock state and
evidence artifact. The generated alpha-readiness evidence and trace should
agree.

Recommended owner: builder-remediation

## Open Questions

None blocking remediation. `REV-P5-001` can be handled entirely by Builder
unless Builder concludes the frozen contract needs a semantic change for
offline `wait-for-event` deltas.

## Residual Risk

This review inspected the generated `b5-6-manual` export evidence and the
trace/status closeout claims. It did not rerun the full verification stack,
because the requested review was read-only. Builder reported the full local
verification stack as passed, including a browser-capable rerun for
`pnpm test:browser`; that remains evidence, not proof, until the blocker above
is remediated.

Alpha-readiness overclaim guards are directionally honest: README,
`docs/alpha-readiness.md`, generated alpha-readiness evidence, and trace state
all keep final `0.1 alpha readiness` unclaimed pending Reviewer acceptance.

## Maintainer Selection

Selection recorded at `2026-05-27 18:24 +0800`: maintainer approved the
Reviewer recommendation to remediate both findings.

Selected findings:

- `REV-P5-001`
- `REV-P5-002`

Reviewer boundary: no remediation was performed by Reviewer. Phase 5 closeout
remains **not accepted pending remediation**.

## Suggested Builder Remediation Launch Phrase

请作为 Cadenza Builder remediation，读取
`trace/phase5/review-phase5-closeout.md`，只处理 maintainer-selected findings:
`REV-P5-001`, `REV-P5-002`；不得扩大 scope，不修改 CONTRACT_FROZEN specs 或
Accepted ADRs；用 TDD 修复并更新 trace 后停止。

## 2026-05-27 19:31 +0800 - Reviewer Acceptance

Startup identity: proceeded as Phase 5 Reviewer recheck with `GPT-5` / `codex`
after maintainer approval in this session.

Acceptance scope: rechecked only maintainer-selected findings `REV-P5-001` and
`REV-P5-002` against remediation commit `58bc9ac`
(`fix(phase5): remediate closeout findings`), `trace/phase5/status.yaml`,
`trace/phase5/tracker.md`, regenerated B5.6 evidence, and CI run
`26507063014`.

Disposition: **accepted**. The selected Phase 5 closeout remediation resolves
the Reviewer blockers within the requested scope.

### REV-P5-001 Recheck

Accepted. The regenerated B5.6 manifest now includes explicit
`previewExportParity.timingComparison` evidence. The previous preview/export
timing mismatch is no longer hidden behind an unconditional pass:

- `offlineTiming.unexpectedMismatches` is empty.
- The `evidence-gates` `wait-for-event` step records an allowed offline export
  duration delta: preview `[552, 600]` versus exported `[552, 624]`.
- The `evidence-gates -> alpha-boundaries` transition records the propagated
  allowed delta: preview `[583, 600]` versus exported `[607, 624]`.
- Focused Phase 5 tests now assert the timing comparison structure and the
  allowed-delta semantics.

### REV-P5-002 Recheck

Accepted. The regenerated alpha-readiness evidence records the public-surface
stability clock as active from commit `b60d4b7`
(`2026-05-27T00:28:11+08:00`) and keeps final `0.1 alpha readiness` unclaimed.
The evidence still requires Reviewer acceptance after Builder closeout, so this
acceptance records closeout review completion without substituting for the
one-month stability requirement or an explicit maintainer waiver.

### CI Evidence

CI run `26507063014` completed successfully for `main` at head SHA
`58bc9ac36a70cadf2516991f506e73bd018da9b8`. The `CI summary` job passed, with
TypeScript checks, tests, Biome lint/format, Markdown lint, governance checks,
and whitespace checks green across the executed matrix. The CI-classified
Browser preview and Shell format jobs were skipped; Builder trace records the
browser-capable rerun and shell-format check evidence for the remediation.

### Boundary

Reviewer performed no remediation. This acceptance does not modify production
code, frozen specs, Accepted ADRs, prompts, scripts, root phase routing, or the
declared public alpha surface. Final `0.1 alpha readiness` remains governed by
the Phase 5 stability clock or an explicit maintainer waiver.
