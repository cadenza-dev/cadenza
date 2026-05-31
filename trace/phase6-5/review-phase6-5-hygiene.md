# Phase 6.5 Hygiene Review

Review timestamp: 2026-06-01 01:36 +0800

Scope reviewed:

- Maintainer-approved 1A + 2A naming hygiene scope from
  `wip/next-phases/phase-6-5-alpha-surface-naming-hygiene-roadmap.md`.
- Active CLI/package exports, diagnostics/types/config/manifest/evidence helper
  naming, canonical alpha deck selector/path, docs examples, and test imports.
- Boundary exclusions: no `CONTRACT_FROZEN` specs, Accepted ADRs,
  `STATUS.yaml.current_phase`, Player App, new export behavior, hosted
  rendering, npm release, or alpha announcement.

## Findings

No findings.

## Evidence

- TDD RED:
  `pnpm exec vitest run tests/acceptance/phase6-5-alpha-surface-naming.test.ts`
  failed before the durable names and canonical selector existed.
- TDD GREEN:
  `pnpm exec vitest run tests/acceptance/phase6-5-alpha-surface-naming.test.ts`
  passed after the durable surface migration.
- Targeted non-MP4 suite:
  `pnpm exec vitest run packages/export-local/src/config.test.ts packages/export-local/src/deck-loading.test.ts tests/acceptance/phase6-cli.test.ts tests/acceptance/phase6-web-compatibility.test.ts tests/acceptance/phase6-clean-checkout-docs.test.ts tests/acceptance/phase6-5-alpha-surface-naming.test.ts`
  passed.
- MP4 acceptance:
  `pnpm exec vitest run tests/acceptance/phase6-export-validate-inspect.test.ts tests/acceptance/phase6-mp4-rendering.test.ts`
  passed outside sandbox after the sandbox run hit the known Remotion
  `uv_interface_addresses` browser surface.
- Full gates:
  `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`,
  `pnpm exec markdownlint-cli2 "**/*.md"`,
  `find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`,
  `pnpm check:memory`, `git diff --check`, and `pnpm test:browser` passed.

## Reviewer Note

The browser suite and MP4 acceptance suite require non-sandbox execution in this
environment. The sandbox failures were infrastructure launch failures, not
product assertions.
