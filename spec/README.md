# `spec/` — Normative Contracts

This directory holds **binding specifications** for Cadenza. Specs are the **highest authority** in the project (see [`AGENTS.md`](../AGENTS.md) §2 Authority Order) — when a spec conflicts with code, chat, a README, or any other source, the spec wins.

## Layout

```text
spec/
├── README.md                 ← you are here (format contract only; no phase content)
└── phase<N>/                 ← created by Architect when that phase's Stage A begins
    ├── SPEC_<DOMAIN>.md      ← one file per normative domain
    ├── …                     ← domains and file names are Architect's decision
    ├── SPEC_TEST_MATRIX.md   ← acceptance scenarios referencing the domain specs' IDs
    └── SPEC_TRACEABILITY.md  ← requirement-ID → test-ID → (future) code-location map
```

Specific file names, domain decomposition, and ID prefixes are **Architect's Stage A output**, not maintainer pre-commitment. This README only defines the format contract; it does not dictate what any particular phase's specs will be.

Each phase's specs form a cohesive contract set. The **test matrix** and **traceability** documents are not separate normative contracts — they are the acceptance view and bidirectional audit trail for the domain specs alongside them.

## Status markers

Every spec MUST carry a status marker in its front-matter block. Exactly one of:

- `CONTRACT_DRAFT` — the spec is still being explored (Architect Stage A). Content may change freely.
- `CONTRACT_FROZEN` — the spec is binding. Changes require **explicit user approval** and a superseding ADR.
- `DEPRECATED` — superseded by a later spec; retained for history. The replacement's relative path MUST be linked.

Specs without a status marker fail `pnpm spec:lint`.

## Requirement format

Each requirement inside a spec has these required fields:

- **ID**: `<PREFIX>-<DIGITS>`. Example: `TAPI-001`, `COMP-042`, `RSAF-007`. IDs MUST be unique across the entire repository.
- **Priority**: `P0` (MUST), `P1` (SHOULD), `P2` (MAY).
- **Owner**: the handoff chain for this requirement. Typical: `Architect → Builder`.
- **Statement**: the executable requirement, 1–3 sentences.
- **Verification**: test protocol (unit test name, integration scenario, or manual check).

Example:

```markdown
- **ID**: COMP-001
- **Priority**: P0
- **Owner**: Architect → Builder
- **Statement**: `compile(deck)` MUST return a `TimelineMap` whose `slides[i].segment[0]` is strictly less than `slides[i+1].segment[0]` for all `i`.
- **Verification**: unit test `compile.monotonicity.test.ts` asserts this on a 30-slide fixture.
```

## Freeze Candidates

During Stage A, unresolved design decisions are marked as **Freeze Candidates** with their own IDs:

```markdown
- **FC-ID**: FC-TAPI-03
- **Question**: Should `<Step>` support async initialization via `onEnter` promise?
- **Options considered**:
  1. Block-until-ready (simpler runtime, harder to debug)
  2. Non-blocking with `loading` cursor (consistent with §5.3 of compiler-design.md)
  3. Author-configurable per step (more flexibility, more state)
- **Leaning**: option 2 for consistency.
- **Must resolve before**: Stage B freeze.
```

All Freeze Candidates MUST be resolved before a file can transition from `CONTRACT_DRAFT` to `CONTRACT_FROZEN`.

## Lifecycle — Architect Stage A → Stage B → Builder

1. **Stage A (exploratory)**: Architect proposes 2–3 options per contested domain. Freeze Candidates marked. All files `CONTRACT_DRAFT`.
2. **Stage B (freeze)**: After user review, Architect resolves every Freeze Candidate and marks files `CONTRACT_FROZEN`.
3. **Builder phase**: Builder consumes frozen specs. Per batch: read `SPEC_TEST_MATRIX.md`, write tests (red), implement (green), refactor, update `trace/<phase>/tracker.md`.

**Never** skip Stage A straight to Stage B without at least one review cycle. The purpose of Stage A is to make disagreements visible cheaply.

## Authority and immutability

- `CONTRACT_FROZEN` is enforced by `scripts/check-contract-frozen.ts` in pre-commit (Phase 0 Builder task). Override requires `[FREEZE-OVERRIDE]` in the commit message.
- `session-stop-audit.sh` warns if a frozen file was modified in a session.
- If you believe a frozen spec is wrong: **do not edit it.** Open a superseding ADR (see [`docs/adr/template.md`](../docs/adr/template.md)), then — after the ADR is accepted — the spec can be updated.

## Cross-references

- Spec format is also discussed in [`docs/agentic-workflow.md`](../docs/agentic-workflow.md).
- The overall workflow that consumes these specs is in [`AGENTS.md`](../AGENTS.md) §5.
- Low-level technical designs (which specs may later reference) live in [`docs/design/`](../docs/design/).
