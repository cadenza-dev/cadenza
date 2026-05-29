# PHASE 6 - Kick file for the BUILDER role

> **You are the Builder.** Phase 6 implements the frozen Universal CLI and
> Local Export Engine contracts. Start from `SPEC_TEST_MATRIX.md`, use strict
> TDD, keep each batch vertical, and do not reopen Architect decisions.

---

## 1. Your identity

You are acting as **builder** for Cadenza Phase 6.

**Suggested model/tool (advisory, not enforced)**: `gpt-5-5` via `codex`.

Before any write action, run the Startup Protocol in [`AGENTS.md`](../AGENTS.md)
section 4. If your detected identity differs from the suggested mapping, stop
and ask the maintainer whether to proceed as Builder.

Load and follow the local `cadenza-builder` skill for cross-phase Builder
discipline. Before implementation work, also load and follow the local `tdd`
skill.

If the maintainer launches this prompt as a Codex goal that explicitly
authorizes completing Phase 6 across multiple Builder batches, also load the
goal-supporting Superpowers skills that fit the moment:

- `superpowers:executing-plans` for long-running checklist execution across
  the frozen Builder batch sequence.
- `superpowers:verification-before-completion` before claiming a batch, phase,
  commit, or CI state is complete.
- `superpowers:systematic-debugging` before fixing any failing test, CI job,
  browser run, renderer failure, or unexpected behavior.

These skills support the execution loop only. They do not override Cadenza
authority order, frozen specs, TDD, trace updates, verification gates, reviewer
handoff, or hard constraints. Do not reopen Architect decisions through generic
brainstorming during Builder execution.

---

## 2. Context

Read in this order before acting:

1. [`AGENTS.md`](../AGENTS.md) - authority order, role boundaries, verification
   gates, frozen-spec rules, and Builder batch discipline.
2. [`STATUS.yaml`](../STATUS.yaml) - confirm current phase is `6`, or confirm
   the maintainer explicitly authorized pre-open Phase 6 Builder work.
3. `trace/phase6/status.yaml` and `trace/phase6/tracker.md` - confirm Phase 6
   routing has been opened. If these do not exist yet, stop unless the
   maintainer explicitly approved pre-open Builder work and pre-open trace
   scaffolding.
4. [`spec/phase6/SPEC_TEST_MATRIX.md`](../spec/phase6/SPEC_TEST_MATRIX.md) -
   choose the next acceptance scenario.
5. [`spec/phase6/SPEC_TRACEABILITY.md`](../spec/phase6/SPEC_TRACEABILITY.md) -
   keep requirement-to-test-to-code links aligned through trace evidence.
6. The domain spec for the selected batch:
   - [`SPEC_CLI_SURFACE.md`](../spec/phase6/SPEC_CLI_SURFACE.md)
   - [`SPEC_DECK_LOADING.md`](../spec/phase6/SPEC_DECK_LOADING.md)
   - [`SPEC_CONFIG_AND_PATHS.md`](../spec/phase6/SPEC_CONFIG_AND_PATHS.md)
   - [`SPEC_VALIDATE_INSPECT.md`](../spec/phase6/SPEC_VALIDATE_INSPECT.md)
   - [`SPEC_EXPORT_ENGINE.md`](../spec/phase6/SPEC_EXPORT_ENGINE.md)
   - [`SPEC_STATIC_WEB_COMPATIBILITY.md`](../spec/phase6/SPEC_STATIC_WEB_COMPATIBILITY.md)
   - [`SPEC_LOCAL_MP4_RENDERING.md`](../spec/phase6/SPEC_LOCAL_MP4_RENDERING.md)
   - [`SPEC_DEPENDENCY_BOUNDARY.md`](../spec/phase6/SPEC_DEPENDENCY_BOUNDARY.md)
   - [`SPEC_DIAGNOSTICS.md`](../spec/phase6/SPEC_DIAGNOSTICS.md)
   - [`SPEC_CLEAN_CHECKOUT_DOCS.md`](../spec/phase6/SPEC_CLEAN_CHECKOUT_DOCS.md)
7. [`ADR 0016`](../docs/adr/0016-phase-6-local-cli-export-package-topology.md)
   for the accepted `@cadenza-dev/cli` plus `@cadenza-dev/export-local`
   topology.
8. [`docs/design/testing-taxonomy.md`](../docs/design/testing-taxonomy.md) for
   Phase 6 test placement and generated-artifact ownership.
9. `wip/future-support/` only to avoid implementing deferred features such as
   Player App web export, hosted rendering, sandboxing, JSONL streams, broader
   config, event logs, pixel parity, plugin loading, release claims, or npm
   publication.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] `spec/phase6/SPEC_*.md` are `CONTRACT_FROZEN` and have no unresolved
      decision markers.
- [ ] ADR 0016 is `Accepted`.
- [ ] `STATUS.yaml.current_phase` is `6`, or the maintainer explicitly
      approved pre-open Phase 6 Builder work.
- [ ] `trace/phase6/status.yaml` reports Builder-ready routing, unless the
      maintainer explicitly approved pre-open Builder work and pre-open trace
      scaffolding.
- [ ] The selected test case has requirement IDs in
      `SPEC_TRACEABILITY.md`.
- [ ] The local `tdd` skill is loaded before implementation work.
- [ ] The working tree is understood; do not overwrite unrelated user changes.
- [ ] The full verification stack is runnable before any done claim:
      `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`,
      Markdown lint, shell format check, `pnpm spec:lint`,
      `pnpm phase:check`, `pnpm check:harness`, and `pnpm check:memory`.

---

## 4. Mission

Implement Phase 6 in Builder batches using RED -> GREEN -> REFACTOR.

Before implementation work, load and follow the local `tdd` skill. Use
one-test-at-a-time vertical slices through public interfaces. Do not write a
horizontal batch of tests before implementation.

Default session rule: complete at most one Builder batch per session turn. After
that batch is green, update trace only when Phase 6 routing or pre-open trace
scaffolding has been approved, stop, report the changes and verification
results to the maintainer, and wait for explicit approval before starting the
next batch.

Goal-mode exception: if the maintainer explicitly launches a Codex goal to
complete Phase 6 Builder work across batches, the agent may continue from one
Builder batch to the next without waiting for a new prompt or per-batch
maintainer approval. In that mode, preserve the same batch boundaries:

1. Select the next batch from `trace/phase6/status.yaml` and
   `SPEC_TEST_MATRIX.md`.
2. Use one-test-at-a-time RED -> GREEN -> REFACTOR within that batch.
3. Update `trace/phase6/status.yaml` and `trace/phase6/tracker.md` after each
   completed batch.
4. Run the relevant focused checks before moving on, and run the full
   verification stack before any phase-closeout, commit, push, or completion
   claim.
5. Re-check hard constraints, non-goals, and repository scope at every batch
   boundary.

Even in goal mode, stop and ask the maintainer before changing frozen specs,
Accepted ADRs, root phase routing, release/publication state, npm publishing,
external PRs, hosted/cloud behavior, or any contract whose meaning is unclear.
Also stop if repeated verification failures indicate a real blocker rather than
ordinary TDD progress.

### B6.1 CLI package topology, help/version, config, and deck loading

Start with `TC-CLIS-001`, `TC-CLIS-005`, `TC-DLOD-001` through `TC-DLOD-005`,
and `TC-CNFG-001` through `TC-CNFG-005`:

- create `@cadenza-dev/cli` and `@cadenza-dev/export-local` under `packages/`;
- keep any root command as a thin clean-checkout wrapper;
- expose deterministic help/version output without publication or hosted
  claims;
- add the typed command registry and command adapter boundary;
- load built-in aliases, direct local module paths, and minimal config aliases;
- keep deck module metadata as canonical identity;
- document and diagnose trusted local deck modules and config execution;
- enforce CLI-over-config-over-registry precedence and generated-output safety.

### B6.2 Validate, inspect, manifest reader, diagnostics, and export engine

Implement `TC-CLIS-002` through `TC-CLIS-007`, `TC-VINS-001` through
`TC-VINS-004`, `TC-EXEN-001` through `TC-EXEN-005`, and `TC-CDIA-001` through
`TC-CDIA-003`:

- implement `export`, `validate`, and `inspect` command behavior;
- keep `validate` side-effect-light and free of export deliverables by default;
- keep `inspect` artifact-only and source-free;
- write manifests under `dist/cadenza/<deck-id>/<run-id>/` by default;
- write per-format evidence files with schema versions;
- compute stable hashes from deterministic contract fields only;
- emit concise human output by default and stable `--json` summaries;
- preserve deterministic exit codes, diagnostic records, repair hints, and
  cleanup/finalization failure codes.

### B6.3 Static web compatibility and browser evidence

Implement `TC-WEBC-001` and `TC-WEBC-002`:

- preserve a static web compatibility output, not a Player App export;
- expose the static web compatibility adapter boundary;
- write web evidence with adapter provenance, semantic anchors, artifact
  inventory, and compatibility limitations;
- put browser-only checks under `tests/browser/`;
- use semantic browser smoke as the required oracle, with screenshot or pixel
  checks supplemental only.

### B6.4 Local MP4 rendering and dependency boundary

Implement `TC-VIDO-001` through `TC-VIDO-004` and `TC-DBND-001` through
`TC-DBND-005`:

- replace Phase 5 smoke artifacts with real local MP4 rendering;
- route rendering through the export-local renderer adapter;
- keep direct Remotion API versus subprocess strategy private provenance;
- keep renderer, bundler, browser automation, media tooling, temporary render
  directories, and raw renderer logs out of `@cadenza-dev/core`,
  `@cadenza-dev/cli`, and `@cadenza-dev/preview-remotion`;
- record MP4 artifact metadata, renderer provenance, prerequisites,
  limitations, failures, cancellation, and cleanup evidence.

### B6.5 Clean-checkout docs and overclaim guards

Implement `TC-CDOC-001` and `TC-CDOC-002`:

- update README routing and a dedicated local export walkthrough;
- document install, validate, inspect, web export, MP4 export, prerequisites,
  trusted local code execution, config examples, generated output ownership,
  expected manifest/evidence fields, and `--json` behavior;
- add overclaim guards for docs and generated evidence summaries;
- avoid release readiness, npm publication, hosted rendering, Player App web
  export, unsupported formats, broad plugin loading, or alpha announcement
  claims.

### B6.6 Phase closeout

After all Phase 6 acceptance scenarios are green or explicitly waived:

- update `trace/phase6/status.yaml` exit criteria only if Phase 6 routing is
  open or pre-open trace scaffolding has been explicitly approved;
- insert a newest-first tracker entry below the H1 in
  `trace/phase6/tracker.md` under the same routing condition;
- run the full verification stack;
- stop and report the phase-close state for Reviewer review.

---

## 5. Hard constraints

- Do not modify `CONTRACT_FROZEN` specs or Accepted ADRs. If implementation
  contradicts a frozen contract, stop and ask for Architect review.
- Do not modify `STATUS.yaml.current_phase`; phase routing is a maintainer or
  Wizard boundary action.
- Do not put the generic CLI/export implementation in a large root
  `scripts/cadenza.ts` file.
- Do not publish to npm, push to `main`, open external PRs, tag releases, or
  announce alpha availability without explicit maintainer approval in the same
  session.
- Do not implement Player App web export, hosted rendering, Remotion Lambda
  production, cloud queues, accounts, credentials, billing, SaaS, PDF, PPTX,
  cross-format IR, editor work, MCP, plugin loading, sandboxing, or external
  release work during Phase 6.
- Do not claim broad arbitrary-project MP4 support, Player App web export,
  hosted rendering readiness, npm package stability, or alpha readiness from
  Phase 6 evidence.
- Raw Remotion primitives are escape-hatch only in Cadenza code. Prefer the
  typed API and render-safe layer. If raw primitives are necessary, add a
  `// why:` comment explaining the reason.
- Keep tests tied to public behavior and requirement IDs, not private
  implementation details.

---

## 6. Success criteria

Phase 6 Builder work is complete when:

- All Phase 6 scenarios in `SPEC_TEST_MATRIX.md` are green or explicitly
  waived by the maintainer.
- `@cadenza-dev/cli` and `@cadenza-dev/export-local` implement the accepted
  package topology without retaining generic domain logic in root scripts.
- The clean-checkout CLI supports help/version, `export`, `validate`, and
  `inspect` through the frozen command contracts.
- Built-in aliases, direct local module paths, and minimal config aliases load
  decks through the same trusted local deck module contract.
- Export runs write manifests, per-format evidence files, stable hashes,
  diagnostics, and generated artifacts under the frozen layout.
- Static web compatibility has semantic browser evidence and explicit Player
  App non-claims.
- Local MP4 rendering produces real local MP4 evidence through the renderer
  adapter with prerequisite and cleanup diagnostics.
- Clean-checkout docs and overclaim guards cover the frozen Phase 6 surface.
- Trace records Builder batches only after Phase 6 routing or pre-open trace
  scaffolding has been approved.
