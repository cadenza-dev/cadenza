# Testing Taxonomy

This document defines where Cadenza tests belong and what each test tier is
allowed to prove. It is a placement policy, not a mandate to move every test
under one directory.

## Current Stance

Cadenza intentionally uses these primary test homes:

- `packages/<package>/src/*.test.ts` for package-local Vitest tests that assert
  public package behavior, package contracts, and package-owned fixtures.
- `tests/acceptance/*.test.ts` for phase-bound Vitest acceptance tests that
  exercise repository artifacts, generated evidence, command outputs, and
  phase-specific traceability through public command/package surfaces.
- `tests/repo/*.test.ts` for lightweight repo-artifact smoke checks that still
  fit Vitest but do not belong to a package API.
- `scripts/*.test.ts` for script-owned governance and fixture tests for
  repository checks such as traceability coverage, frozen-contract policy, and
  CI/change classification.
- `tests/browser/*.spec.ts` for Playwright tests that need a real browser,
  browser APIs, DOM measurement, or generated browser fixtures.

Do not centralize all tests under `tests/` just for visual tidiness. A test's
home should communicate its dependency boundary and runtime cost.

## Tiers

| Tier | Home | Command | Purpose |
| :--- | :--- | :--- | :--- |
| Package contract / unit | `packages/<package>/src/*.test.ts` | `pnpm test` | Public exports, model constraints, compiler/runtime behavior, and small render-safe semantics. |
| Package scenario / closeout | `packages/<package>/src/*.test.ts` | `pnpm test` | Phase scenarios that still exercise one package through its public API. |
| Phase acceptance | `tests/acceptance/*.test.ts` | `pnpm test` | Phase-bound command, generated evidence, traceability, artifact inventory, and public-surface assertions that cross package boundaries. |
| Repository artifact smoke | `tests/repo/*.test.ts` or `scripts/check-*.ts` | `pnpm check:*` or `pnpm test` | Skill mirrors, harness shape, memory shape, frozen-contract policy, and other repo files. |
| Script governance | `scripts/*.test.ts` | `pnpm test` | Script-owned fixture tests for traceability coverage, phase checks, frozen-contract checks, and CI/change classification. |
| Browser integration | `tests/browser/*.spec.ts` | `pnpm test:browser` | Real DOM measurement, browser keyboard/click/fullscreen behavior, and browser readiness behavior. |
| Static governance | `scripts/*.ts`, Markdown/shell formatters | completion gates | Spec traceability, phase status, contract freezing, role boundary, harness sync, and memory shape. |

## Placement Rules

Put a new test beside package source when all of these are true:

- The behavior belongs to one package.
- The test can run in Vitest without a browser.
- The assertion is against public exports, observable runtime behavior, or a
  documented package contract.
- The test does not need to inspect the repository as a product artifact.

Put a new test under `tests/browser/` when any of these are true:

- The assertion depends on browser layout, DOM measurement, keyboard events,
  click coordinates, fullscreen APIs, media/font readiness, or browser-only
  rendering behavior.
- The test needs the browser fixture produced by `pnpm build:browser-fixture`.
- The failure mode would be invisible in a pure Vitest environment.

Use `scripts/check-*.ts` for static repository governance when a check is more
naturally expressed as a repository invariant than as a package behavior. This
includes phase pointer shape, skill mirror consistency, frozen-contract
protection, and traceability linting.

Use `tests/acceptance/` when a Vitest test proves a phase acceptance scenario by
running a supported repository command, reading generated evidence, or checking
multiple repo-owned artifacts. Generated `dist/**` output is live export output:
tests may create and inspect it, but it is not a tracked fixture or public API.

Use `tests/repo/` when a small Vitest smoke test reads repo artifacts such as
skills, evals, root package metadata, or generated mirrors without exercising a
package-owned public API.

## Current Inventory

| File | Tier | Why it lives there |
| :--- | :--- | :--- |
| `packages/core/src/public-api.test.ts` | Package contract / unit | Verifies public typed API imports and compiler output through `@cadenza-dev/core`. |
| `packages/core/src/compile.timeline-map.test.ts` | Package contract / unit | Verifies deterministic `TimelineMap` behavior from package APIs. |
| `packages/core/src/compiler.validation.test.ts` | Package contract / unit | Verifies typed diagnostics emitted by compiler validation. |
| `packages/core/src/runtime.navigation.test.ts` | Package contract / unit | Verifies runtime navigation semantics without browser APIs. |
| `packages/core/src/player.keyboard.test.ts` | Package contract / unit | Verifies keyboard intent mapping through package runtime/player APIs. |
| `packages/core/src/player.controls.test.ts` | Package contract / unit | Verifies control routing and capability abstractions without real browser layout. |
| `packages/core/src/player.presenter-metadata.test.ts` | Package contract / unit | Verifies presenter metadata exposed by package runtime APIs. |
| `packages/core/src/render-safe.readiness.test.ts` | Package contract / unit | Verifies controlled resource readiness and diagnostics without a real browser. |
| `packages/core/src/render-safe.typography.test.ts` | Package contract / unit | Verifies render-safe metadata and preview diagnostics generated by package code. |
| `packages/core/src/validation.report.test.ts` | Package contract / unit | Verifies machine-readable repair queues produced by validation reporting. |
| `packages/core/src/compiler-runtime.closeout.test.ts` | Package scenario / closeout | Closes Phase 1 compiler/runtime semantics through public package behavior. |
| `packages/core/src/all-domain-mvp.fixture.test.ts` | Package scenario / closeout | Proves the all-domain MVP fixture crosses core domains while staying on public package APIs. |
| `packages/core/src/phase-exit-demo.test.ts` | Package scenario / closeout | Documents deterministic Phase 1 demo output and current export boundary. |
| `packages/core/src/skill-pack.test.ts` | Repository artifact smoke | Grandfathered Vitest smoke test for the authoring skill surface and generated mirrors. |
| `tests/acceptance/phase5-export.test.ts` | Phase acceptance | Proves Phase 5 export, parity, evidence, format, alpha-readiness, and boundary scenarios through the supported export command and generated evidence artifacts. |
| `tests/repo/phase3-best-practices-rules.test.ts` | Repository artifact smoke | Verifies the public mono-skill guidance, eval evidence, and generated mirrors as repo artifacts rather than package behavior. |
| `scripts/traceability-coverage.test.ts` | Script governance | Verifies traceability coverage, active-phase gating, evidence classification, and routing fixtures owned by `scripts/traceability-coverage.ts` and `scripts/phase-check.ts`. |
| `scripts/check-contract-frozen.test.ts` | Script governance | Verifies frozen-contract protection using isolated temporary Git repositories, including hook-time local Git environment isolation. |
| `tests/browser/render-safe-preview.spec.ts` | Browser integration | Uses Chromium to verify real DOM overflow, hit regions, fullscreen capability, keyboard events, readiness gates, and media-frame measurement. |
| `tests/browser/phase5-export-parity.spec.ts` | Browser integration | Opens the generated Phase 5 web export in Chromium and verifies browser-visible parity status, semantic anchor order, and notes boundaries. |

## Known Exception

`packages/core/src/skill-pack.test.ts` inspects repository skill artifacts, so it
is not a pure package unit test. It remains package-local as historical Phase 1
coverage until the legacy skill-pack assertions are either retired or moved into
`tests/repo/`.

The current Vitest include deliberately covers package tests plus script,
acceptance, and repo-artifact smoke tests:

```ts
include: [
  "packages/**/*.test.ts",
  "scripts/**/*.test.ts",
  "tests/acceptance/**/*.test.ts",
  "tests/repo/**/*.test.ts",
]
```

Do not add new repo-artifact smoke tests under `packages/`; use `tests/repo/`
or a `scripts/check-*.ts` gate.

## What Tests Must Not Do

- Do not test private helpers only because they are easy to import.
- Do not duplicate Playwright/browser assertions in Vitest with fake DOM
  stand-ins and then claim browser coverage.
- Do not treat `pnpm spec:lint` as full requirement coverage. It checks
  structure and references; reviewer/architect work still owns coverage
  judgment.
- Do not mix generated browser artifacts into package-local tests.
- Do not make `pnpm test` depend on installed Chromium. Browser coverage belongs
  to `pnpm test:browser`.
- Do not let script-governance fixture tests inherit local hook Git environment
  such as `GIT_DIR` or `GIT_WORK_TREE` when they spawn Git in temporary repos.

## Future Migration Triggers

Revisit this taxonomy when any of these happen:

- A second package is added and tests need to verify cross-package behavior.
- Repo-artifact Vitest tests grow enough to need subdirectories under
  `tests/repo/`.
- Phase 2 introduces a React/Remotion preview adapter with its own package.
- Browser tests become part of every local pre-commit path, which would require
  clearer fast/slow command separation.
