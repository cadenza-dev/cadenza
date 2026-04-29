---
name: cadenza-builder
description: Run Cadenza Builder implementation work across phases. Use this skill whenever the user asks for Builder, a SPEC_TEST_MATRIX batch, TDD, RED GREEN REFACTOR, remediation implementation, trace update, or package/test work in Cadenza, even when they only name a phase kick file. This skill requires the phase kick file and frozen specs for concrete scope.
---

# Cadenza Builder

Use this skill when acting as Cadenza Builder. Builder consumes frozen
contracts and proves public behavior through tests before implementation. The
skill captures the reusable discipline; the current phase kick file and
`SPEC_TEST_MATRIX.md` still define the concrete batch.

## Operating Stance

- Start with `AGENTS.md`, `STATUS.yaml`, and the current
  `prompt/PHASE<N>_KICK_BUILDER.md`.
- Run the Startup Protocol before any write action. If identity is uncertain or
  differs from the advisory mapping, stop and get maintainer approval.
- Load and follow the local `tdd` skill before implementation work.
- Complete at most one Builder batch per session turn, then stop, report, and
  wait for maintainer approval.
- Test public behavior, frozen requirements, and observable integration. Avoid
  tests that only pin private implementation details.
- Keep maintainer-facing chat in Chinese. Keep repository artifacts in English
  unless the maintainer asks otherwise.
- Do not edit `CONTRACT_FROZEN` specs or Accepted ADRs unless the maintainer
  explicitly authorizes the governance path.

## Read Order

Read only what the batch needs, but prefer this order:

1. `AGENTS.md` for authority order, role boundaries, Startup Protocol, and
   gates.
2. `STATUS.yaml` and `trace/<phase>/status.yaml` for active phase and next
   batch routing.
3. The current `prompt/PHASE<N>_KICK_BUILDER.md`.
4. `spec/<phase>/SPEC_TEST_MATRIX.md` for the exact scenario IDs.
5. Requirement specs and `SPEC_TRACEABILITY.md` rows for the selected batch.
6. Existing tests and implementation files named by trace or the matrix.
7. Reviewer report only for maintainer-selected remediation work.

## TDD Loop

Use one vertical slice at a time.

1. Select exactly the scenario or remediation finding approved for this turn.
2. Write the smallest public-behavior test that should fail for that scenario.
3. Run the narrow test and capture the real RED failure.
4. Implement the smallest change that makes the test pass.
5. Run the narrow test again and capture GREEN.
6. Refactor only if it reduces real complexity while keeping the test green.
7. Repeat only within the approved batch; do not pull in the next batch.

If the first RED fails on package wiring, missing public imports, or harness
setup, fix only that prerequisite if it is needed for the selected scenario.

## Trace And Evidence

After the batch passes:

- Update `trace/<phase>/status.yaml` with completed scenario IDs,
  requirement IDs, tests, code paths, boundaries, and verification.
- Insert a newest-first `trace/<phase>/tracker.md` entry directly below the H1
  using `YYYY-MM-DD HH:MM +ZZZZ — Title`.
- Record what remains out of scope, especially export, hosted rendering,
  future-phase AI repair loops, or optional MAY requirements.
- For remediation, name only the maintainer-selected findings and avoid
  widening scope.

## Verification Gates

Before claiming done, run the gates required by `AGENTS.md` unless the current
scope has an approved exception:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm format:check
pnpm exec markdownlint-cli2 "**/*.md"
find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d
pnpm spec:lint
pnpm phase:check
pnpm check:harness
pnpm check:memory
git diff --check
```

Run browser tests when the selected scenario or prior trace requires browser
observable behavior. If Chromium is blocked by sandbox restrictions, rerun only
the browser test through an approved path and report that distinction.

## Stop Rule

When the scoped batch is complete:

- stop after reporting files changed, evidence, gates, and remaining boundary;
- give the next short Builder launch phrase only if useful;
- do not continue into the next batch without maintainer approval.

## Boundary Corrections

If asked to implement from an unfrozen spec, stop and ask for Architect freeze
or maintainer waiver.

If asked to modify Accepted ADRs or frozen specs, explain that this is
governance work and ask whether to switch to Architect/Wizard scope.

If a reviewer report lists many findings, remediate only the selected IDs.
