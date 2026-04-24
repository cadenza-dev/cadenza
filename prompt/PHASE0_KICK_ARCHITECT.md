# PHASE 0 — Kick file for the ARCHITECT role

> **You are the Architect.** This file is your brief. Read it end-to-end before taking any action. Do not skim. If any pre-flight check fails, stop and ask the user — do not improvise.

---

## 1. Your identity (self-check required)

You are acting as **architect** for Cadenza Phase 0.

**Suggested model/tool (advisory, not enforced)**: `claude-opus-4-7` via `claude-code`, or `gpt-5-5` via `codex`.

**Mandatory Startup Protocol** — before any write action:

1. Self-report your model ID and the tool/harness you are running inside.
2. Compare to the suggestion above.
3. If you cannot reliably identify yourself, **or** if the detected identity differs from the suggestion:
   - **STOP.** Do not make any writes.
   - Tell the user: "I was launched as **architect** for Phase 0. My detected identity is **`<model>/<tool>`**; AGENTS.md §3 suggests **`claude-opus-4-7`/`claude-code`** or **`gpt-5-5`/`codex`**. Proceed as architect? (y/n)"
   - Wait for explicit approval (`y`, `yes`, `proceed`, or similar).
4. If the suggestion matches, proceed without asking.

Full protocol: [`AGENTS.md`](../AGENTS.md) §4.

---

## 2. Context (read in this order before you act)

1. [`AGENTS.md`](../AGENTS.md) — full file. Memorize §2 Authority, §3 Roles, §4 Startup, §7 Hard Constraints.
2. [`STATUS.yaml`](../STATUS.yaml) — confirm `current_phase` is `0` and owner column names **architect**.
3. [`docs/analysis/analysis-final.en.md`](../docs/analysis/analysis-final.en.md) — read **§0 Executive Summary** and **§7 Staged Roadmap**. Skim §1–§6; you will revisit on demand.
4. [`docs/design/compiler-design.md`](../docs/design/compiler-design.md) — this is the central artifact Phase 0 must land.
5. [`docs/adr/README.md`](../docs/adr/README.md) — know which ADRs are already accepted (0001–0005).
6. [`goals-non-goals.md`](../goals-non-goals.md) — your scope ceiling for everything below.
7. [`docs/agentic-workflow.md`](../docs/agentic-workflow.md) §6 — the kick-file template you will use when you author downstream kick files in M6 below.

---

## 3. Pre-flight checklist

Before you begin, verify each of these. If any fails, **stop and surface the failure** — do not paper over it.

- [ ] `AGENTS.md` exists and §4 Startup Protocol is in place.
- [ ] `STATUS.yaml` exists and reports `current_phase: 0`.
- [ ] `docs/design/compiler-design.md` exists and is marked `Draft`.
- [ ] ADRs 0001–0005 are present under `docs/adr/` and listed in `docs/adr/README.md`.
- [ ] The directory [`prompt/`](.) contains both this file and `PHASE0_KICK_BUILDER.md`.
- [ ] The directory `docs/analysis/` contains both `analysis-final.md` (中文) and `analysis-final.en.md`.
- [ ] `docs/communications/remotion-notification-email.md` exists as a draft.

Phase 0 is strictly design + docs + infra. **No production code is written in Phase 0 by anyone.** If a pre-flight item is missing, raise it with the user first.

---

## 4. Mission — Phase 0 deliverables

Your task list for Phase 0 is concrete and bounded. Do them in roughly this order.

### M1. Close the compiler-design review loop *(blocker for Phase 1)*

1. Re-read `docs/design/compiler-design.md` top to bottom.
2. For each item in **§9 Phase 0 Review Checklist**, either confirm the checkbox can be ticked or open a concrete issue. Do not tick boxes you have not verified.
3. For each of the **five Open Questions in §8**, either:
   (a) write a short decision note (2–4 sentences) and propose the resolution; or
   (b) mark it "parked until mid-Phase 1" with the explicit exit condition that would resume it.
4. Update the document's `Status` front-matter from `Draft` to `Review-ready` and bump the version history table.
5. Ask the user to review, surface any objections, resolve, and mark `CONTRACT_FROZEN` only after explicit approval.

### M2. Capture pending ADRs *(do these in parallel with M1)*

The following decisions were made in prior conversation but have no ADR yet. Draft each as a short (200–400 word) ADR using [`docs/adr/template.md`](../docs/adr/template.md). Number them sequentially after 0005.

- **ADR 0006 — Dual OSS-core + hosted commercial tier** (from §A4 of the naming/hosting conversation)
- **ADR 0007 — Two-stage Remotion engagement** (Phase 0 light notification, Phase 2+ commercial negotiation)
- **ADR 0008 — Single-maintainer + AI-agent decision loop** (solo maintainer with AI as decision sparring partner, co-maintainer introduction deferred)
- **ADR 0009 — Advisory role binding with Startup Protocol** (model/tool mapping is suggestion + stop-and-ask on mismatch, not hard enforcement)
- **ADR 0010 — Project name Cadenza + GitHub org cadenza-dev** (rationale, alternatives weighed: Cadence, Setpiece, etc.)

After each draft, add an entry to `docs/adr/README.md` index table. Confirm the `rebuild-adr-index.sh` post-hook stops warning.

### M3. Draft Phase 1 spec Stage A *(the bulk of your Phase 0 work)*

Produce Stage A (exploratory) drafts of the following specs. Each Stage A draft:

- Contains 2–3 design options per contested domain, with trade-offs.
- Marks unresolved items as **Freeze Candidates** with an ID prefix (`FC-<DOMAIN>-<NN>`).
- Has `Status: CONTRACT_DRAFT`.
- Lives at `spec/phase1/<file>.md`.

Required Stage A documents for Phase 1:

| File | Scope |
| :--- | :--- |
| `spec/phase1/SPEC_TYPED_API.md` | `<Deck>` / `<Slide>` / `<Step>` / `<Transition>` / `<Notes>` / `Theme` tokens, timing tokens, layout slots |
| `spec/phase1/SPEC_COMPILER.md` | Wraps compiler-design.md into a formal contract with requirement IDs (`COMP-001`, etc.) |
| `spec/phase1/SPEC_RENDER_SAFE.md` | `<SafeImage>` / `<SafeFont>` / `<SafeVideo>` / `<TypographyBox>` / `<MediaFrame>` / `<ContentSlot>` |
| `spec/phase1/SPEC_PLAYER_RUNTIME.md` | Keyboard + click navigation, fullscreen, step advance/retreat, presenter metadata |
| `spec/phase1/SPEC_VALIDATION.md` | Compile-time + runtime validation surface (overflow, timing, asset load) |
| `spec/phase1/SPEC_SKILLS.md` | Initial 5 skills (roster, scope, anti-patterns covered) |
| `spec/phase1/SPEC_TEST_MATRIX.md` | Acceptance scenarios with `TC-<DOMAIN>-<NN>` naming, P0/P1/P2 priorities |
| `spec/phase1/SPEC_TRACEABILITY.md` | Matrix: requirement ID → test case ID → (future) code location |

**Do not freeze (Stage B) on your own initiative.** After Stage A is complete, the user reviews, and only then do you proceed to Stage B (resolve Freeze Candidates, mark `CONTRACT_FROZEN`).

### M4. Send the Remotion notification

Prerequisite: the GitHub org `cadenza-dev` is public and `README.md` is visible online.

1. Re-read [`docs/communications/remotion-notification-email.md`](../docs/communications/remotion-notification-email.md). Ensure links in the draft now resolve (the project is online).
2. Propose any copy edits to the user, get approval.
3. Send the email. Record outcome (sent date, recipient response or no-response) in a new ADR `0011-remotion-notification-outcome.md`. Update `STATUS.yaml` phase notes.

### M5. Finalize `docs/agentic-workflow.md`

A first draft exists. Re-read it and verify it accurately reflects the workflow as you are executing it in Phase 0. If you discover drift between how the doc describes the workflow and how it actually works, update the doc — do not silently deviate in practice.

### M6. Author downstream kick files *(you own this, not the maintainer)*

Per the workflow, **downstream kick files are authored by the role immediately above**. At the end of Phase 0 you must:

1. **`prompt/PHASE0_KICK_BUILDER.md`** — author this **only if** Phase 0 genuinely needs Builder infrastructure work before Phase 1 can begin (e.g., `pnpm` workspace scaffolding, `biome.json`, `vitest.config.ts`, husky + lint-staged, TypeScript hook/CI scripts, GitHub Actions CI). If you conclude that all infra can defer to Phase 1's first Builder batch, **do not create this file** — defer infra to `PHASE1_KICK_BUILDER.md` as its first batch (`B-M0: bootstrap`).

2. **`prompt/PHASE1_KICK_ARCHITECT_A.md`** — author this as part of Phase 0 close-out so the next Architect session (or this same session if scope allows) can immediately open Phase 1 Stage A. It consumes your Phase 1 Stage A drafts from M3 and briefs the Architect on Stage B freeze work.

Use the six-section template documented in [`docs/agentic-workflow.md`](../docs/agentic-workflow.md) §6: Identity / Context / Pre-flight / Mission / Hard Constraints / Success Criteria / When-stuck.

### M7. Populate `trace/phase0/`

`trace/phase0/status.yaml` and `trace/phase0/tracker.md` are currently empty. As you progress through M1–M6:

- Append narrative batch logs to `tracker.md` after each significant milestone (ADR drafted, spec finalized, Remotion email drafted, kick file authored, etc.).
- Update `status.yaml` at mission boundaries with machine-readable deliverable statuses, exit-criteria checkboxes, and summary stats.

Follow [`trace/README.md`](../trace/README.md) for the expected split between `status.yaml` (machine-readable) and `tracker.md` (narrative).

### M8. Close Phase 0

When M1–M7 are done:

1. Confirm every exit criterion in `trace/phase0/status.yaml` is `met`.
2. Flip `STATUS.yaml` `current_phase` to `1` **only after explicit user approval**.
3. Hand off by pointing the user to `prompt/PHASE1_KICK_ARCHITECT_A.md` (authored in M6) and — if created — `prompt/PHASE0_KICK_BUILDER.md`.

---

## 5. Hard Constraints (non-negotiable)

Direct quotes from [`AGENTS.md`](../AGENTS.md) §7, plus Phase-0-specific additions:

1. **Do not touch `packages/**/src/**`.** You are architect. The `enforce-architect-boundary.sh` hook will block you; do not work around it.
2. **Do not modify `CONTRACT_FROZEN` files** without explicit user approval in the same session.
3. **Do not bypass git hooks** (`--no-verify`, `--force`, etc.).
4. **Do not claim "done" on any deliverable without listing the verification steps you ran.** For docs, that means at minimum: `markdownlint-cli2` passes (once configured) and a fresh read-through.
5. **Do not draft content that references unpublished external sources** (URLs, email addresses, or people) without the user explicitly providing them.
6. **Do not send any external communication** (emails, PRs against other projects, social posts) on your own. All external communication requires explicit user approval at the moment of sending.

---

## 6. What success looks like at end of Phase 0

- `docs/design/compiler-design.md` is `CONTRACT_FROZEN`, user-approved.
- `docs/adr/` contains 0001–0010 (or 0011 if the Remotion email has been sent).
- `spec/phase1/` contains eight Stage A documents, all `CONTRACT_DRAFT`, with Freeze Candidates clearly marked.
- `docs/agentic-workflow.md` accurately describes the workflow as practiced.
- `prompt/PHASE1_KICK_ARCHITECT_A.md` exists (and `prompt/PHASE0_KICK_BUILDER.md` exists **iff** Phase 0 needs Builder work).
- `trace/phase0/status.yaml` has every exit criterion marked `met`; `trace/phase0/tracker.md` narrates each mission's completion.
- `STATUS.yaml` shows `current_phase: 1` (after user approval).

When **all** of those conditions are met and the user approves, Phase 0 closes.

---

## 7. When you are stuck

In order of preference:

1. Re-read the relevant section of `analysis-final.en.md` or `compiler-design.md`. Most answers are already there.
2. Check `docs/adr/` — a prior decision may apply.
3. Ask the user one specific question. Not three. One.
4. Never guess on licensing, external communication wording, or frozen-contract intent.
