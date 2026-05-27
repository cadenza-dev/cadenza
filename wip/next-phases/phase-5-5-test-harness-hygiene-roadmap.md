# Phase 5.5 Roadmap - Test and Harness Hygiene

> Status: WIP planning note, not a contract.
> Created: 2026-05-28.
> Source: maintainer roadmap adjustment after Phase 5 closeout review.

## Purpose

Phase 5.5 is a hardening interlude before the next product phases. It should
make the test and harness layout easier to reason about without changing the
declared product surface, export behavior, public API, or phase pointer.

This phase does not need the full Architect -> Builder -> Reviewer lifecycle
unless the maintainer later asks for it. It does need a small, explicit scope so
that harness cleanup does not silently become CLI generalization or product
implementation.

## Thesis

The project has enough evidence machinery now that test placement and harness
responsibilities matter. Phase-specific acceptance tests, repo-governance
checks, generated evidence readers, and package-local unit tests should not all
look like package tests. Clear boundaries will make Phase 6 CLI work faster and
less risky.

## Candidate Scope

- Test taxonomy alignment: keep package-local behavior tests near packages, move
  repo-artifact smoke and governance assertions into repo-level or script-owned
  harnesses, and document any taxonomy changes.
- Phase acceptance organization: separate phase-bound acceptance assertions from
  reusable package behavior so future phases do not inherit Phase 5 test bulk.
- Harness decomposition: extract repeated export-evidence, traceability, path,
  and generated-artifact readers into focused helpers with small public
  contracts.
- Coverage evidence clarity: make coverage and traceability tests prove the
  model they claim to prove, instead of only proving that trace text or generated
  rows exist.
- Fixture hygiene: identify generated fixtures, curated evidence fixtures, and
  live export outputs as different artifact classes with different ownership.

## Non-Goals

- No CLI generalization.
- No new export formats.
- No Cadenza Player App design or implementation.
- No web bundle redesign.
- No Remotion renderer, Lambda, cloud, hosted path, or MCP implementation.
- No edits to frozen Phase 5 specs or Accepted ADRs unless a separate
  maintainer-approved governance correction requires it.
- No change to `STATUS.yaml.current_phase` unless the maintainer explicitly
  opens a new phase route.

## Promotion Triggers

- Phase 5 closeout review and remediation have produced enough evidence to see
  which tests are phase-bound and which are reusable.
- The next phase is expected to touch CLI/export structure, making noisy harness
  boundaries a direct implementation risk.

## Exit Evidence

- The test taxonomy points future agents to the correct location for
  package-local tests, browser tests, repo-governance checks, phase acceptance
  tests, and generated-evidence helpers.
- The largest phase-bound tests are either decomposed or explicitly documented
  as temporary debt with a follow-up target.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`,
  `pnpm spec:lint`, `pnpm phase:check`, `pnpm check:harness`, and
  `pnpm check:memory` remain green or have an explicit maintainer-approved
  waiver.

## Phase 6 Handoff

Phase 6 should start with enough harness clarity that CLI behavior can be tested
through stable command, manifest, artifact, and diagnostics contracts rather
than by extending Phase 5's one-off export generator tests.
