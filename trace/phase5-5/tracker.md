# Phase 5.5 Tracker

## 2026-05-29 01:42 +0800 - Commit Hook Fixture Isolation Guard

The final commit attempt exposed a hook-only harness regression:
`scripts/check-contract-frozen.test.ts` used temporary Git repositories but
inherited the active hook's local `GIT_*` environment, allowing fixture commits
to target the current worktree's Git directory.

- RED: `git commit -m "test: harden phase 5.5 harness taxonomy"` failed at ref
  locking after `scripts/check-contract-frozen.test.ts` created fixture commits
  on the active branch during the commit hook.
- Recovery: the hook-created `HEAD` was preserved at
  `phase-5-5-hook-env-leak-backup`, then the Phase 5.5 branch pointer and index
  were restored to the `origin/main` baseline without changing working tree
  files.
- GREEN: `scripts/check-contract-frozen.test.ts` now clears local Git
  environment variables for fixture Git commands and script subprocesses, with
  a regression test proving inherited hook Git state does not escape into the
  active worktree.

Verification:

- `pnpm test scripts/check-contract-frozen.test.ts -- --runInBand`

## 2026-05-29 01:26 +0800 - Test and Harness Hygiene Batch

Phase 5.5 completed the maintainer-approved test/harness hygiene batch without
changing frozen Phase 5 contracts, accepted ADRs, root phase routing, product
behavior, or export behavior.

- Startup: maintainer pre-approved GPT-5.5/codex for this scoped Phase 5.5
  orchestrator/Builder/Reviewer goal when the only Startup Protocol issue is an
  advisory role/model mismatch.
- RED: `pnpm test scripts/traceability-coverage.test.ts -- --runInBand` failed
  until Phase 5 export acceptance evidence moved from
  `packages/core/src/phase5-export.test.ts` to
  `tests/acceptance/phase5-export.test.ts`.
- GREEN: the Phase 5 acceptance suite now runs from `tests/acceptance/` and
  uses `tests/support/phase5-export-fixture.ts` for live export setup, cleanup,
  manifest reads, artifact reads, and generated output ownership.
- RED: the repo-artifact taxonomy check failed until
  `packages/core/src/phase3-best-practices-rules.test.ts` moved to
  `tests/repo/phase3-best-practices-rules.test.ts`.
- RED: the traceability proof-strength check failed until nested
  `node_modules` paths were excluded and `dist/` / `tmp/` evidence paths were
  classified as regenerate-owned generated evidence rather than missing tracked
  trace files.
- RED: the traceability path-parser check failed until `B5.1`-style batch IDs
  stopped being treated as missing path-like evidence.
- GREEN: the frozen-contract check fixture now isolates Git local environment
  variables so hook-time tests cannot mutate the active worktree Git directory.
- Browser smoke: `tests/browser/phase5-export-parity.spec.ts` now verifies
  browser-visible semantic anchor order plus empty timingComparison unexpected
  mismatches, not only the exported parity data attribute.
- Documentation: `docs/design/testing-taxonomy.md` now documents package-local,
  phase acceptance, repo-artifact smoke, script governance, browser, and static
  governance tiers.
- Trace sync: `trace/phase5/status.yaml` evidence lists now point at
  `tests/acceptance/phase5-export.test.ts` after the taxonomy move; historical
  RED/GREEN command text remains unchanged.

Verification passed:

- `pnpm test scripts/traceability-coverage.test.ts -- --runInBand`
- `pnpm test tests/acceptance/phase5-export.test.ts -- --runInBand`
- `pnpm test scripts/traceability-coverage.test.ts tests/acceptance/phase5-export.test.ts tests/repo/phase3-best-practices-rules.test.ts -- --runInBand`
- `pnpm test scripts/check-contract-frozen.test.ts -- --runInBand`
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
- `pnpm test:browser`

Read-only Reviewer pass is recorded in
`trace/phase5-5/review-phase5-5-hygiene.md` with no remaining findings. Commit,
push, and CI watch remain before merge readiness can be claimed.
