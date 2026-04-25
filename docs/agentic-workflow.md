# Cadenza — Agentic Workflow

> This document is the **long-form** explainer of how humans and AI agents jointly build Cadenza. [`AGENTS.md`](../AGENTS.md) is the tight operational map (≤150 lines); this file is the reference you read when the map is not enough.
>
> Audience: new contributors (human or agent), future maintainers, anyone who wants to understand *why* the workflow looks the way it does.

---

## 0. One-paragraph summary

Cadenza is developed by a team of specialized AI agents and one human maintainer, coordinated through file-based contracts rather than ad-hoc messaging. **Specs are the highest authority**; code follows specs; agents work in role-scoped sessions; enforcement is layered (AGENTS.md text → Claude Code hooks → git pre-commit → CI). Every phase proceeds in three stages (Stage A exploratory → Stage B freeze → Builder implementation) with per-stage exit criteria. Context loss is routine, so everything important lives in files that are read in a canonical order — no session owns knowledge.

If you remember nothing else: **read `AGENTS.md` first, run the Startup Protocol, pick up an open batch from `trace/<phase>/tracker.md`.**

---

## 1. Why this workflow exists

The shape of this project forces three constraints:

1. **Multi-agent from day one.** Cadenza is meant to be built by agents (Architect, Builder, Scout), not by a single human with tool-assist. That means role boundaries must be explicit and machine-enforceable, not implicit.
2. **Specs as authority, not documentation.** In typical OSS projects, documentation trails the code. Here, specs lead the code — they are the contract that tests verify and agents implement against. This inverts the usual order and makes `spec/**/*.md` the single source of truth that an agent can return to after a context reset.
3. **Context is ephemeral.** Agents compact, reset, and swap out. A workflow that assumes an agent "remembers what it just decided" will fail the first time a session crosses a compaction boundary. Everything important is written down in a predictable location so that a cold agent can reach the same conclusion a warm one would.

The reference inspiration is two prior projects by the same maintainer: [vhs-analyzer](https://github.com/DrEden33773/vhs-analyzer) and [eden-skills](https://github.com/AI-Eden/eden-skills). Cadenza inherits their **spec → trace → kick-file** trio and extends it with Claude Code hooks, OpenAI-style [harness engineering](https://openai.com/index/harness-engineering/) practices, and a deliberately minimal AGENTS.md designed to stay cheap at every session start.

---

## 2. Roles

Three roles, each with a kick file per phase. Suggested model/tool bindings are advisory (see §5 Startup Protocol).

### Scout

Produces strategic briefs. Writes [`ROADMAP.md`](../ROADMAP.md) and, over time, research notes under `docs/research/`. Scout is usually *not* an agent session — it is often the maintainer consolidating thinking, or a Gemini-run research pass — so it has no kick file in Phase 0. Scout sessions will formalize in Phase 1+.

**Writes**: `ROADMAP.md`, `docs/research/`.
**Must not touch**: `spec/`, `packages/`, `docs/adr/`.
**Suggested model/tool**: `gemini-3-1-pro` via `gemini-cli`.

### Architect

Translates Scout's strategic direction into frozen contracts. Produces specs, ADRs, design documents, and the kick files the Builder will consume. Architect operates in **two stages** per phase:

- **Stage A — exploratory**: 2–3 design options per contested domain, Freeze Candidates marked.
- **Stage B — freeze**: Freeze Candidates resolved, `CONTRACT_FROZEN` markers applied.

**Writes**: `spec/`, `docs/adr/`, `docs/design/`, `prompt/`.
**Must not touch**: `packages/**/src/` (enforced by [`scripts/hooks/enforce-architect-boundary.sh`](../scripts/hooks/enforce-architect-boundary.sh) when `CADENZA_AGENT_ROLE=architect`).
**Suggested model/tool**: `claude-opus-4-7` via `claude-code`, or `gpt-5-5` via `codex`.

### Builder

Consumes frozen specs; writes tests first (red); implements (green); refactors. Operates in **batches** defined by the phase's `SPEC_TEST_MATRIX.md` — never implements ahead of the test matrix, never deviates from a frozen spec.

**Writes**: `packages/`, tests, `trace/<phase>/`, infra configs (Biome, Vitest, TSConfig, CI).
**Must not touch**: `spec/` (when `CONTRACT_FROZEN`), `docs/adr/` (when `Accepted`).
**Suggested model/tool**: `gpt-5-5` via `codex`.

### Why we don't have a Tester role

In the reference projects, tests are Builder's responsibility, co-authored with the spec's test matrix. A separate Tester agent would add a handoff without adding a signal — Architect already defines what to test via `SPEC_TEST_MATRIX.md`, and Builder's TDD discipline ensures tests come before implementation. The human maintainer occasionally spot-checks coverage, but there is no standing Tester role.

---

## 3. Phase lifecycle

Each phase runs through five sub-stages. Only phases 0 and 1 are defined in detail today; phases 2–4 reserve the same structure.

```text
┌──────────────┐    ┌───────────────────┐    ┌──────────────────┐
│  Scout brief ├───▶│ Architect Stage A ├───▶│Architect Stage B │
│  ROADMAP.md  │    │ spec CONTRACT_DRAFT│   │ CONTRACT_FROZEN  │
└──────────────┘    └───────────────────┘    └────────┬─────────┘
                                                      │
                          ┌───────────────────────────▼─────────┐
                          │   Builder batches (TDD per batch)    │
                          │   red → green → refactor             │
                          │   tracker.md updated each batch      │
                          └───────────────────────────┬─────────┘
                                                      ▼
                                             ┌────────────────┐
                                             │  Phase close   │
                                             │  (exit gates + │
                                             │   archive)     │
                                             └────────────────┘
```

### 3.1 Scout brief

Inputs: user interviews, market observation, prior phase retrospectives.
Output: `ROADMAP.md` updated (and any research notes in `docs/research/`).
Done when: maintainer reviews and accepts.

### 3.2 Architect Stage A — exploratory

Inputs: `ROADMAP.md`, `docs/analysis/analysis-final.md`,
`wip/future-support/` entries targeting the current phase, and prior phase's
frozen specs.
Output: `spec/<phase>/SPEC_*.md` files with `CONTRACT_DRAFT` markers and Freeze Candidate entries.
Done when: every contested domain has ≥ 2 options considered and any unresolved tension is an explicit Freeze Candidate.

### 3.3 Architect Stage B — freeze

Inputs: Stage A drafts + user review.
Output: same files updated — every Freeze Candidate resolved, status marker flipped to `CONTRACT_FROZEN`; deferred enhancements recorded under `wip/future-support/` by target phase.
Done when: user approves, no Freeze Candidates remain, and follow-up items are either promoted into the phase contract or recorded as WIP planning notes.

### 3.4 Builder batches

The phase's `SPEC_TEST_MATRIX.md` defines an ordered list of test scenarios. Builder works in **batches** — a batch is typically 5–20 related test cases plus their implementation. Per batch:

1. Read the batch's test-matrix entries.
2. Write each test, confirm it fails (red).
3. Implement the smallest code change to make it pass (green).
4. Refactor if needed, confirm tests still green.
5. Insert the batch log at the top of `trace/<phase>/tracker.md`, directly below the H1, using the heading format `YYYY-MM-DD HH:MM +ZZZZ — Title`.

Between batches, the maintainer reviews and triggers the next. Builder does not "just keep going" — it is a pace-controlled loop.

### 3.5 Phase close

Every phase has **exit criteria** in `trace/<phase>/status.yaml`. When all are `met`, the maintainer (not the agent) flips `STATUS.yaml.current_phase` to the next phase and archives the closing state in `trace/<phase>/` as the final tracker entry.

---

## 4. Specs

See [`spec/README.md`](../spec/README.md) for the operational format reference. This section covers the *intent* behind that format.

### 4.1 Specs are not documentation

A spec is a **contract**. If a spec says "`compile(deck)` must return a `TimelineMap` whose segments are temporally monotonic," then code MUST satisfy that, and tests MUST verify it. If the code disagrees, the code is wrong, not the spec. This inverts the usual assumption that documentation trails code; it is the foundation of an agent-friendly workflow.

### 4.2 Status markers are enforcement hooks

`CONTRACT_FROZEN` is not just a label — it is enforced at three layers:

- **Advisory**: the `post-spec-edit.sh` Claude Code hook warns if a file lacks a status marker.
- **Pre-commit**: `scripts/check-contract-frozen.ts` (once Phase 0 Builder ships it) rejects commits that modify a frozen file without `[FREEZE-OVERRIDE]` in the message.
- **Stop audit**: `session-stop-audit.sh` warns on session exit if a frozen file was touched.

Breaking a freeze requires an ADR that supersedes the earlier decision — not a unilateral edit.

### 4.3 Requirement IDs are the backbone of traceability

Every normative statement gets an ID (`COMP-001`, `TAPI-042`). The ID appears in:

- The spec where the requirement is stated.
- `SPEC_TEST_MATRIX.md` next to the test that verifies it.
- `SPEC_TRACEABILITY.md` mapping ID → test → (eventually) code location.
- Code comments (`// impl: COMP-001`) once Builder reaches the relevant line.

This lets any reader follow a requirement from origin to implementation without relying on git blame or memory.

### 4.4 Freeze Candidates over premature freezing

Stage A's job is to **make disagreement cheap**. A Freeze Candidate entry looks like:

```markdown
- **FC-ID**: FC-COMP-03
- **Question**: Should scrubbing replay step side effects?
- **Options**: (1) visual seek only; (2) logical replay; (3) author-configurable.
- **Leaning**: option 1, per compiler-design.md §5.5.
- **Must resolve before**: Stage B freeze.
```

If you feel pressure to freeze early, ask whether there's a genuine contested decision that a Freeze Candidate would capture. If yes, write the FC and keep going. If no, you can freeze.

---

## 5. Startup Protocol and advisory role binding

The `(role, model, tool)` binding in `AGENTS.md` §3 is a **suggestion**, not a hard constraint. Two reasons:

1. Model IDs drift. `claude-opus-4-7` becomes `claude-opus-4-8` on some future release; hard-coding breaks
    - What's more, with the publishing of `gpt-5-5`, it could be considered as an alternative option of `claude-opus-4-7`.
2. Agents cannot always reliably self-identify. Enforcement that depends on unreliable self-reports will misfire.

Instead, enforcement is behavioral: every session runs the **Startup Protocol** (AGENTS.md §4). It boils down to:

1. Self-report model and tool.
2. Compare to the suggested pair for the role indicated by the kick file.
3. On mismatch or uncertainty, **stop** and ask the user. Proceed only on explicit approval.
4. On match, proceed silently.

Why not just enforce at the hook layer? Because hooks can observe tool calls, but they cannot force the LLM to pause its own reasoning. Only the agent's discipline (following the protocol) keeps the human in the loop when identity diverges from expectation. Hooks and CI catch the aftermath; the protocol prevents the miss.

See [`docs/adr/0009-advisory-role-binding.md`](./adr/0009-advisory-role-binding.md) *(to be drafted in Phase 0 M2)* for the fuller rationale.

---

## 6. Kick files — anatomy of a role brief

Every phase has one kick file per role under `prompt/PHASE<N>_KICK_<ROLE>.md`. The template, inherited from vhs-analyzer and eden-skills, has six fixed sections:

| Section | Purpose |
| :--- | :--- |
| **Your identity** | Role name, suggested model/tool, Startup Protocol reminder, escalation path |
| **Context** | Read order specific to this role × phase; prioritized |
| **Pre-flight** | Mechanical checks; if any fails, stop and report — do not improvise |
| **Mission** | Concrete deliverables, in roughly the right order, each with done-criteria |
| **Hard constraints** | The non-negotiables — subset of AGENTS.md §7 plus phase-specific additions |
| **Success criteria** | What the phase closure looks like for this role |
| **When stuck** | Ordered fallback list: re-read docs → check ADRs → ask user (one question, not three) |

Kick files are **not** prompts that get pasted into the agent at session start. They are reference documents the agent reads (per `AGENTS.md` §1 Read Order). The session's actual prompt is a one-liner like: "Proceed with `PHASE0_KICK_ARCHITECT.md` batch A-M1."

---

## 7. Context recovery after compaction

Claude Code's `/compact`, context-window exhaustion, or just closing and reopening a session will blow away working memory. The workflow treats this as routine and builds around it:

1. **Read Order** (AGENTS.md §1) is **authoritative**. Agents re-enter the workflow by reading the same files in the same sequence, producing the same mental model they would have on first entry.
2. **PreCompact hook** ([`scripts/hooks/pre-compact-preserve.sh`](../scripts/hooks/pre-compact-preserve.sh)) pre-injects `STATUS.yaml` and the Read Order reminder before Claude Code compacts, so the post-compact context starts with the right pointers.
3. **Trace files** are intentionally information-dense. `trace/<phase>/tracker.md` is newest-first and should contain enough narrative that a fresh agent can pick up mid-batch without re-reading the whole session.
4. **Tracker updates are mandatory**, not polite. The `session-stop-audit.sh` hook warns on session exit if spec/ or packages/ was touched without a tracker update.

If you are an agent reading this after a compaction: you should already have the preservation block injected above this in your context. If you do not, that is a hook failure — flag it to the user.

---

## 8. Enforcement layers

Workflow compliance is enforced in four layers, from softest to hardest:

### Layer 1 — `AGENTS.md` text

Soft. Documented rules that an LLM is expected to follow in good faith. Covers style, intent, authority order. Always present; always re-read on session start.

### Layer 2 — Claude Code hooks

Medium. Scripts under [`scripts/hooks/`](../scripts/hooks/) fire automatically on `SessionStart`, `PreToolUse`, `PostToolUse`, `Stop`, `PreCompact`. They produce advisory warnings and hard blocks. Blocks cannot be bypassed even with `--dangerously-skip-permissions`, so they are appropriate for safety-critical constraints (destructive commands, role boundaries).

Limits: hooks only run in Claude Code sessions. Codex and Gemini sessions bypass them entirely — see Layer 3.

### Layer 3 — git pre-commit (husky + lint-staged)

Hard. Runs in every session regardless of which agent tool produced the diff. Phase 0 Builder deliverables include:

- `scripts/check-contract-frozen.ts` — rejects commits that modify frozen specs without `[FREEZE-OVERRIDE]`.
- `scripts/check-role-boundary.ts` — rejects commits outside the session role's allowed globs.
- `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm spec:lint` — standard correctness gates.

This is the most reliable layer because it cannot be bypassed without `--no-verify`, which is itself blocked by [`scripts/hooks/block-dangerous-bash.sh`](../scripts/hooks/block-dangerous-bash.sh) in Claude Code sessions and requires explicit user approval elsewhere.

### Layer 4 — CI (GitHub Actions)

Hardest. Runs on every PR; blocks merge. Catches anything that snuck through the above layers or that only manifests in a clean environment.

### Which layer should a new rule go in?

Ask: "could this rule be violated silently?" If yes, escalate. If a rule is important enough that "the agent should know and follow" isn't sufficient, put it in Layer 3 or 4. If the rule is about taste or intent, Layer 1 is correct — it would be wasteful to encode every aesthetic preference in CI.

---

## 9. Multi-agent coordination

Cadenza uses three coordination patterns, chosen per situation:

### 9.1 Sequential (default for Phase 0 and early Phase 1)

The maintainer runs one session at a time. Architect Stage A completes, the maintainer reviews, then Architect Stage B, then Builder batches. This is the simplest and lowest-error pattern.

### 9.2 Parallel (appropriate when batches are independent)

Within a phase, independent batches can run in parallel. For example, in Phase 1, the typed API surface and the render-safe component layer are independent (different packages, different tests). Two Builder sessions can work simultaneously, each owning one package.

Use this when you can articulate the non-interference invariant in one sentence. If you can't, don't.

### 9.3 Agent Teams (experimental, for Phase 2+)

Claude Code's [Agent Teams](https://code.claude.com/docs/en/agent-teams) allow a "lead" session to spawn teammates that communicate peer-to-peer. Cadenza's current stance: **wait until Phase 2+** before adopting Agent Teams. The overhead is high, the coordination primitives are new, and Phase 0–1 fits comfortably in the sequential / parallel patterns.

When Agent Teams become useful, the scenario will look like: a Builder lead session decomposes a complex compiler implementation batch into sub-batches (state machine, edge-case handlers, runtime bindings), spawns one teammate per sub-batch, and reconciles their diffs via file locking. That is a Phase 2+ conversation.

---

## 10. How to propose a workflow change

Changes to this document, to `AGENTS.md`, or to the kick file templates go through ADRs:

1. Open a Proposed ADR under `docs/adr/` with the next available number.
2. State the current workflow, the proposed change, and the concrete cost of not making it (or the benefit of making it).
3. Open a conversation with the maintainer. Wait for Accepted status before updating any workflow file.
4. Once Accepted, update `AGENTS.md` / kick-file templates / this file in the same commit that accepts the ADR.
5. Add an entry to the ADR index at `docs/adr/README.md`.

**Do not** edit the workflow unilaterally. Even small-seeming changes (renaming a status marker, adding a new status, changing the Read Order) ripple through agent behavior in non-obvious ways.

---

## 11. Glossary

| Term                    | Meaning                                                                      |
| :---------------------- | :--------------------------------------------------------------------------- |
| **Spec**                | A `spec/<phase>/SPEC_*.md` file; a binding contract with requirement IDs     |
| **CONTRACT_DRAFT**      | Spec status: still editable; Architect Stage A                               |
| **CONTRACT_FROZEN**     | Spec status: binding; changes require explicit user approval via ADR         |
| **Freeze Candidate**    | A Stage A marker for a contested decision that must resolve before freeze    |
| **Requirement ID**      | `<PREFIX>-<DIGITS>`, globally unique within the repo                         |
| **Test Case ID**        | `TC-<DOMAIN>-<NN>` tied back to one or more requirement IDs                  |
| **Batch**               | A Builder work unit of ~5–20 related test cases + implementation             |
| **Kick file**           | `prompt/PHASE<N>_KICK_<ROLE>.md`; role brief for a phase                     |
| **Trace**               | Under `trace/<phase>/`; phase execution archive                              |
| **Read Order**          | Canonical file sequence in AGENTS.md §1 for cold-start and recovery          |
| **Startup Protocol**    | Self-check + stop-and-ask routine in AGENTS.md §4                            |
| **ADR**                 | Architectural Decision Record under `docs/adr/NNNN-*.md`                     |

---

## 12. FAQ

**Q: I am Claude Code. Can I do Builder work?**
A: Yes, but set `CADENZA_AGENT_ROLE=builder` before you start writing, and run the Startup Protocol to confirm with the user that your model is acceptable for Builder (the suggested model is `gpt-5-5`, and the user may want you to wait for Codex instead).

**Q: A spec says X, the user in chat said Y. Which wins?**
A: The spec, if `CONTRACT_FROZEN`. If unfrozen, ask the user which to prefer and capture the resolution in the spec.

**Q: I finished my batch but I'm not sure whether to commit or hand off.**
A: Update `trace/<phase>/tracker.md`, commit, and leave a note in chat. Do not leave uncommitted work at session end unless explicitly paused.

**Q: The hook blocked something I want to do. Is the hook wrong?**
A: Usually no. Almost always, the hook is catching a real boundary violation. If you genuinely think the hook is wrong, open an ADR — do not edit the hook directly without discussion.

**Q: How many Freeze Candidates is too many in Stage A?**
A: There is no absolute number, but if a single spec has more than ~10, it probably needs to be split. Freeze Candidates are cheap to create and signal genuine disagreement; if they pile up, it is usually a sign the spec scope is too big.

**Q: I'm a human contributor, not an agent. Do I follow the same workflow?**
A: Yes. The workflow is not agent-specific — it is a contract-first workflow that happens to be optimized for agents. Human contributors benefit from the same structure: clear specs, small batches, explicit exit criteria, thorough traces.

---

## 13. Revision history

| Version | Date | Summary |
| :------ | :--------- | :----------------------------------------------------------------- |
| v0.1 | 2026-04-18 | Initial draft: Phase 0 baseline capturing AGENTS.md + hooks + kick-file + spec/trace conventions |
