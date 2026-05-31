# Phase 6.5 Tracker

## 2026-06-01 01:36 +0800 — Alpha Surface Naming Hygiene Complete

Builder completed the scoped Phase 6.5 hygiene batch. The active CLI/export
surface now uses durable Cadenza/local-export names, the default built-in deck
selector is `cadenza-alpha-readiness-talk`, and the historical Phase 5 deck
surface is routed through historical/test-owned fixture paths instead of active
package barrels or root CLI wrapper exports.

Changed surfaces:

- `@cadenza-dev/cli`: `runCadenzaCli` and `runCadenzaCliEntrypoint`.
- `@cadenza-dev/export-local`: `LocalExport*`, `CadenzaDeckMetadata`,
  `CadenzaLocalExportError`, `LOCAL_EXPORT_*`, and
  `findAlphaSurfaceOverclaimViolations`.
- Active examples/docs: `examples/cadenza/alpha-readiness-talk.tsx`,
  `docs/local-export.md`, and the canonical alpha commands.
- Historical fixtures: Phase 5 support now imports `legacyPhase5.ts` directly
  from test-owned helpers, with a historical guide fixture under
  `tests/support/`.

Verification passed:

- `pnpm typecheck`
- `pnpm test` (outside sandbox for local MP4 renderer acceptance)
- `pnpm lint`
- `pnpm format:check`
- `pnpm exec markdownlint-cli2 "**/*.md"`
- `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`
- `pnpm spec:lint`
- `pnpm phase:check`
- `pnpm check:harness`
- `pnpm check:memory`
- `git diff --check`
- `pnpm test:browser` (outside sandbox; sandbox Chromium launch is blocked by
  `sandbox_host_linux`)

Read-only Reviewer pass is recorded in
`trace/phase6-5/review-phase6-5-hygiene.md` with no findings.

Boundary: no `CONTRACT_FROZEN` specs, Accepted ADRs, or
`STATUS.yaml.current_phase` were modified; no Player App, new export behavior,
visual-fidelity redesign, hosted rendering, npm release, or alpha announcement.

## 2026-06-01 01:23 +0800 — Phase 6.5 Alpha Surface Naming Hygiene Opened

Maintainer launched a scoped Builder/Orchestrator hygiene goal using
`wip/next-phases/phase-6-5-alpha-surface-naming-hygiene-roadmap.md` as the
approved scope, with decisions 1A and 2A:

- introduce a product-neutral canonical alpha deck selector/path and demote the
  Phase 5 demo to a historical fixture;
- remove Phase5/Phase6 public-ish aliases from active package barrels, CLI
  APIs, and diagnostic/type exports.

Startup: GPT-5/Codex detected; maintainer pre-authorized GPT-5/Codex for this
goal. No Architect/spec/kickfile route is required for this scoped hygiene pass.

Initial TDD evidence:

- RED:
  `pnpm exec vitest run tests/acceptance/phase6-5-alpha-surface-naming.test.ts`
  failed because `runCadenzaCli` and canonical alpha deck constants were not yet
  exposed.

Boundary: do not modify `CONTRACT_FROZEN` specs, Accepted ADRs, or
`STATUS.yaml.current_phase`; no Player App, new export behavior,
visual-fidelity redesign, hosted rendering, npm release, or alpha announcement.
