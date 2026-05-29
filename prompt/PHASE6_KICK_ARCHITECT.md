# PHASE 6 - Kick file for the ARCHITECT role

> **You are the Architect.** Phase 6 turns the narrow Phase 5 export proof into
> a universal local CLI and local export engine. Start from roadmap-driven
> brainstorming and Stage A options. Do not skip directly to frozen specs.

---

## 1. Your identity

You are acting as **architect** for Cadenza Phase 6.

**Suggested model/tool (advisory, not enforced)**: `claude-opus-4-7` via
`claude-code`, or `gpt-5-5` via `codex`.

Before any write action, run the Startup Protocol in [`AGENTS.md`](../AGENTS.md)
section 4. If your detected identity differs from the suggested mapping, stop
and ask the maintainer whether to proceed as Architect.

Load and follow these local skills before Stage A work:

- `cadenza-architect` for Cadenza Stage A/B contract discipline.
- `superpowers:brainstorming` for explicit option exploration before design
  freeze.

If generic brainstorming guidance conflicts with Cadenza authority, preserve
Cadenza's workflow: use brainstorming to expose alternatives and get maintainer
direction, then write Cadenza Stage A drafts in `spec/phase6/` with
`CONTRACT_DRAFT` markers. Do not write frozen specs until Stage B approval.

This kick file remains the concrete Phase 6 entrypoint.

---

## 2. Context

Read in this order before acting:

1. [`AGENTS.md`](../AGENTS.md) - authority order, role boundaries, Startup
   Protocol, verification gates, and frozen-spec rules.
2. [`STATUS.yaml`](../STATUS.yaml) and
   [`EXECUTION_TRACKER.md`](../EXECUTION_TRACKER.md) - confirm whether Phase 6
   has been opened. If root routing still says Phase 5, proceed only when the
   maintainer explicitly authorized Phase 6 Architect planning.
3. [`docs/adr/README.md`](../docs/adr/README.md), especially ADRs 0001, 0002,
   0003, 0004, 0005, 0006, 0007, 0009, 0012, 0014, and 0015.
4. [`docs/analysis/analysis-final.md`](../docs/analysis/analysis-final.md)
   section 0.
5. [`ROADMAP.md`](../ROADMAP.md) - treat the Phase 5 export posture and the
   developer-first thesis as strategic input, not a Phase 6 contract.
6. [`wip/next-phases/phase-6-universal-cli-local-export-roadmap.md`](../wip/next-phases/phase-6-universal-cli-local-export-roadmap.md)
   - primary Phase 6 roadmap input.
7. [`wip/next-phases/phase-5-5-test-harness-hygiene-roadmap.md`](../wip/next-phases/phase-5-5-test-harness-hygiene-roadmap.md)
   - test and harness strategy input only.
8. [`trace/phase5/review-phase5-closeout.md`](../trace/phase5/review-phase5-closeout.md),
   [`trace/phase5/status.yaml`](../trace/phase5/status.yaml), and
   [`trace/phase5/tracker.md`](../trace/phase5/tracker.md) - confirm Phase 5
   export closeout, selected remediation, Reviewer acceptance, and remaining
   alpha-readiness boundary.
9. [`trace/phase5-5/status.yaml`](../trace/phase5-5/status.yaml),
   [`trace/phase5-5/tracker.md`](../trace/phase5-5/tracker.md), and
   [`trace/phase5-5/review-phase5-5-hygiene.md`](../trace/phase5-5/review-phase5-5-hygiene.md)
   - confirm hygiene closeout and accepted test placement rules.
10. [`trace/phase5-5/phase6-architect-handoff.md`](../trace/phase5-5/phase6-architect-handoff.md)
    - Wizard handoff summary for this role.
11. [`docs/design/testing-taxonomy.md`](../docs/design/testing-taxonomy.md)
    - Phase 6 test placement and generated-artifact ownership policy.
12. [`docs/agentic-workflow.md`](../docs/agentic-workflow.md) sections 3.2,
    3.3, 3.6, and 6 for Stage A/B, Wizard handoff, and kick-file format.
13. Existing `spec/phase1/` through `spec/phase5/` only as inherited frozen
    context. Do not edit frozen specs.
14. `spec/phase6/` only if it already exists. If it contains prior work, read
    it before drafting and do not overwrite unrelated content.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] Startup Protocol has completed for the Architect role.
- [ ] `cadenza-architect` and `superpowers:brainstorming` are loaded.
- [ ] `STATUS.yaml.current_phase` is `6`, or the maintainer explicitly
      authorized Phase 6 Architect planning before the root phase pointer
      moves.
- [ ] `STATUS.yaml`, `EXECUTION_TRACKER.md`, `ROADMAP.md`, and the Phase 6 WIP
      roadmap do not create an unhandled scope conflict. If they disagree,
      report the conflict instead of resolving it silently.
- [ ] `trace/phase5/review-phase5-closeout.md` records accepted Phase 5
      Reviewer closeout after remediation of `REV-P5-001` and `REV-P5-002`.
- [ ] `trace/phase5-5/status.yaml` reports `status: reviewer_accepted`.
- [ ] `trace/phase5-5/review-phase5-5-hygiene.md` has no remaining findings.
- [ ] `trace/phase5-5/phase6-architect-handoff.md` exists and names the
      approved Wizard identity.
- [ ] The Phase 6 roadmap is treated as WIP planning input, not a contract.
- [ ] Phase 5.5 hygiene is treated as test strategy input, not product scope.
- [ ] No `spec/phase6/` contract set already exists. If it exists, read it
      first and preserve unrelated work.
- [ ] The working tree is understood; do not overwrite unrelated user changes.

---

## 4. Mission

Architect Phase 6 in brainstorming and Stage A first. Do not skip directly to
frozen contracts.

### M1. Reconcile Phase 6 scope before spec work

The strategic source for Phase 6 is
[`wip/next-phases/phase-6-universal-cli-local-export-roadmap.md`](../wip/next-phases/phase-6-universal-cli-local-export-roadmap.md):
**Universal CLI and Local Export Engine**.

Phase 6 should turn the Phase 5 `cadenza export <deck>` proof into a credible
local developer workflow with a stable CLI boundary, deck-loading contract,
artifact layout, diagnostics model, and real local MP4 rendering. Treat the
current static web export as a compatibility output until a later Player
App-based web export exists.

Phase 6 scope includes:

- Universal local CLI surface: export, inspect, validate, version/help, and
  related commands only where Stage A proves they are needed.
- Deck discovery and loading: a documented deck module contract for public
  examples and future user decks, replacing Phase 5's single registry path.
- Export engine manifest and evidence: reusable artifact layout, deterministic
  fields, format capability declarations, known limitations, and evidence
  files.
- Static web compatibility export: preserve the current static web output as a
  supported compatibility mode with an extension point for a future Player App
  bundle.
- Real local MP4 render: replace the Phase 5 smoke artifact with a local
  Remotion render path for the declared deck contract.
- Remotion renderer and bundler dependency boundary: isolate render/bundle
  dependencies in the CLI/export layer, not `@cadenza-dev/core`.
- Diagnostics and error model: structured diagnostics, exit codes, actionable
  human messages, and machine-readable failure evidence.
- Clean-checkout documentation: honest install, validate, export, local
  prerequisites, supported formats, and limitations.

Phase 6 must explicitly use Phase 5.5 hygiene as testing input:

- Put phase-bound CLI/export acceptance tests under `tests/acceptance/`.
- Keep package-local tests beside package source only when they assert package
  behavior through public exports.
- Put browser-only web compatibility checks under `tests/browser/`.
- Keep script-owned governance and generated-evidence checks under `scripts/`.
- Treat `dist/` and `tmp/` export output as regenerate-owned generated
  evidence, not tracked fixtures.
- Extract reusable Phase 6 evidence readers and live export helpers behind
  small helper contracts rather than extending Phase 5's one-off fixture shape.

### M2. Run brainstorming and expose real options

Before writing Stage B contracts, use `superpowers:brainstorming` and
`cadenza-architect` together to explore 2-3 real options for contested domains.
At minimum, evaluate these option sets and mark unresolved decisions as Freeze
Candidates:

| Domain | Options to compare in Stage A |
| :--- | :--- |
| CLI topology | Thin root script, dedicated CLI package, or hybrid root entrypoint delegating to package-owned command modules. |
| Deck loading | Explicit registry, direct deck module path, config-driven discovery, or a constrained combination. |
| Export engine evidence | Single manifest with format sections, manifest plus per-format evidence files, or append-only event log plus summary manifest. |
| Static web compatibility | Preserve Phase 5 static bundle, define a compatibility adapter with future Player App extension, or defer web changes entirely. |
| Local MP4 rendering | Direct Remotion renderer API, spawned Remotion CLI wrapper, or an adapter that hides both behind a stable export interface. |
| Dependency boundary | CLI-owned Remotion dependencies, optional peer dependencies, or a renderer adapter package outside core. |
| Diagnostics | Typed error-code schema, JSON/JSONL diagnostic stream plus human summary, or minimal command stderr with machine-readable evidence. |
| Clean-checkout docs | README quickstart only, dedicated export walkthrough, or both with generated command evidence. |

Stage A should reject or defer options that only recreate Phase 5 smoke
artifacts, silently start a Player App, or require hosted/cloud infrastructure.

### M3. Draft Phase 6 Stage A specs

Create `spec/phase6/` Stage A drafts with `CONTRACT_DRAFT` status markers.
Suggested contract domains:

| Domain | Scope |
| :--- | :--- |
| CLI surface | Command names, arguments, deck selectors, output paths, exit codes, help/version behavior, and public command boundary. |
| Deck discovery and loading | Deck module contract, example deck discovery, error handling for invalid decks, and future user-deck compatibility. |
| Export engine | Artifact directory layout, manifest schema, evidence files, deterministic fields, format capability declarations, and known limitations. |
| Static web compatibility | Static web output contract, compatibility limitations, browser-observable evidence, and Player App extension boundary. |
| Local MP4 rendering | Real local Remotion render path, supported deck contract, output evidence, local prerequisites, and deterministic limits. |
| Dependency boundary | Where Remotion renderer/bundler dependencies live, what `@cadenza-dev/core` may import, and how adapters are tested. |
| Diagnostics | Structured diagnostics, exit code taxonomy, human messages, machine-readable failure evidence, and repair routing. |
| Clean-checkout docs | Install, validate, inspect, export web, export MP4, prerequisites, limitations, and no-overclaim language. |
| Test matrix and traceability | Requirement IDs, acceptance scenarios, helper ownership, generated evidence, browser checks, and Builder batch routing. |

Architect may rename, merge, or split these files during Stage A if the
decomposition is clearer, but keep each domain small enough for Builder TDD
batches.

### M4. Preserve explicit non-goals

Keep these outside Phase 6 unless the maintainer opens a separate superseding
decision:

- No Cadenza Player App product shell.
- No app-based web bundler or polished Player App export.
- No hosted rendering, Remotion Lambda production path, cloud queue, accounts,
  credentials, billing, cost system, or SaaS implementation.
- No PDF, PPTX, cross-format IR, import/export parity, or editor work.
- No visual editor or structured editing surface.
- No template marketplace, collaboration, comments, SSO, or enterprise account
  system.
- No alpha announcement, public release claim, npm publication, release tag, or
  external launch without explicit maintainer approval.

### M5. Resolve Stage A into Stage B only after maintainer review

After Stage A is drafted:

1. Present the maintainer with the Freeze Candidates and option trade-offs.
2. Resolve only approved decisions.
3. Add or supersede ADRs only when a decision changes architecture, workflow,
   licensing, governance, public package posture, or authority.
4. Mark Phase 6 specs `CONTRACT_FROZEN` only after explicit maintainer
   approval.
5. Record Stage B freeze evidence in `trace/phase6/` only after Phase 6 has
   been opened or the maintainer explicitly authorized pre-open trace
   scaffolding.

### M6. Author the downstream Builder kick file after freeze

After Phase 6 specs are frozen, author `prompt/PHASE6_KICK_BUILDER.md`.

The Builder kick must:

- route from `spec/phase6/SPEC_TEST_MATRIX.md`;
- require local `tdd` skill use;
- limit each Builder turn to one vertical slice;
- use Phase 5.5 test taxonomy for placement and helper boundaries;
- keep Player App, app-based web bundler, hosted/cloud/Lambda, PDF/PPTX/IR,
  editor work, and alpha announcement out of scope;
- require trace updates and the full verification stack before any done claim.

---

## 5. Hard constraints

- Do not modify `packages/**/src/**`; Architect owns contracts and design, not
  implementation.
- Do not modify `CONTRACT_FROZEN` specs without explicit maintainer approval
  and a superseding ADR where appropriate.
- Do not modify Accepted ADRs in place.
- Do not flip `STATUS.yaml.current_phase`; the maintainer owns phase pointer
  changes.
- Do not treat WIP roadmap files as contracts.
- Do not claim real local MP4 export until Stage B defines the contract and
  Builder evidence proves it.
- Do not claim static web compatibility beyond the contract's declared
  limitations.
- Do not claim `0.1 alpha readiness`, public release readiness, hosted
  rendering readiness, Remotion Lambda readiness, or public API stability beyond
  the Phase 5 and Phase 6 evidence gates.
- Do not implement Player App, app-based web export, cloud/Lambda, PDF/PPTX/IR,
  editor, MCP, external release, or npm publication work during Architect.
- Keep repository artifacts in English unless the maintainer explicitly asks
  otherwise.

---

## 6. Success criteria

Phase 6 Architect work is complete when:

- Phase 6 scope is reconciled with the Phase 6 roadmap, Phase 5 closeout,
  Phase 5.5 hygiene evidence, and inherited frozen specs.
- Brainstorming has exposed 2-3 real approaches for contested design domains.
- `spec/phase6/` Stage A drafts exist with `CONTRACT_DRAFT` markers and visible
  Freeze Candidates.
- Maintainer-reviewed Freeze Candidates are resolved.
- `spec/phase6/` is `CONTRACT_FROZEN` only after explicit approval.
- WIP items are either promoted into the contract or deferred with rationale.
- `prompt/PHASE6_KICK_BUILDER.md` exists and routes Builder to the first Phase 6
  acceptance scenario.
- `trace/phase6/status.yaml` and `trace/phase6/tracker.md` record Architect
  closeout and the Builder handoff only after Phase 6 routing is opened or
  explicitly authorized.

---

## 7. When stuck

1. Re-read
   [`trace/phase5-5/phase6-architect-handoff.md`](../trace/phase5-5/phase6-architect-handoff.md)
   and the two Phase 6/Phase 5.5 WIP roadmaps.
2. Re-read `docs/agentic-workflow.md` sections 3.2, 3.3, 3.6, and 6.
3. Re-read ADRs 0001, 0002, 0003, 0004, 0006, 0007, 0012, 0014, and 0015.
4. Ask the maintainer one concrete question. Do not guess at frozen contracts,
   release claims, Remotion licensing, or external communications.
