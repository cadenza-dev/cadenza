# Cadenza — AGENTS.md

> This file is a **map**, not an encyclopedia. Detailed content lives under `docs/`.
> The Read Order below is authoritative for context-compression recovery.
> Target length: ≤ 150 lines. If you find yourself adding more, push content into `docs/` instead.

---

## 1. Read Order (for session start and post-compaction recovery)

When your context is cold — fresh session, post `/compact`, or post VM restart — read these in order. Stop as soon as you have enough to act.

1. `AGENTS.md` (this file)
2. `STATUS.yaml` — what phase is active, who owns it, what is blocked
3. `docs/adr/README.md` — index of accepted architectural decisions
4. `docs/analysis/analysis-final.md` §0 (Executive Summary only, ~30 lines)
5. `prompt/PHASE<N>_KICK_<ROLE>.md` — your role-scoped brief for the current phase
6. `wip/future-support/` — Architect only: read entries targeting the current phase
7. `spec/<current-phase>/` — only if your task touches spec or code in this phase
8. `trace/<current-phase>/tracker.md` — only if continuing mid-phase work
9. `memory/index.md` — only if the task asks for lessons or prior pitfalls

Do **not** read `docs/analysis/analysis-final.zh.md` (Chinese) or its archive unless explicitly asked. They are for human review.

---

## 2. Authority Order (conflict resolution)

When two sources conflict, the higher wins. No arguing with a higher source.

```text
spec/**/*.md (CONTRACT_FROZEN)
  > spec/**/*.md (unfrozen)
  > STATUS.yaml
  > EXECUTION_TRACKER.md
  > docs/adr/**
  > docs/design/**
  > ROADMAP.md
  > README.md
  > memory/**
  > chat history
```

If a `CONTRACT_FROZEN` spec contradicts what a user tells you in chat, **stop and ask** — do not silently override the frozen spec.

---

## 3. Roles (suggested defaults — enforcement is advisory, not strict)

| Role | Suggested model | Suggested tool | Writes | Does not write |
| :--- | :--- | :--- | :--- | :--- |
| scout | `gemini-3-1-pro` | `gemini-cli` | `ROADMAP.md`, `docs/research/` | `spec/`, `packages/`, `docs/adr/` |
| architect | `claude-opus-4-7` / `gpt-5-5` | `claude-code` / `codex` | `spec/`, `docs/adr/`, `docs/design/`, `prompt/` | `packages/**/src/`, production code |
| builder | `gpt-5-5` | `codex` | `packages/`, tests, `trace/<phase>/`, infra configs | `spec/` (frozen), `docs/adr/` (accepted) |
| reviewer | `gpt-5-5` | `codex` | `trace/<phase>/review*.md` only with approval | fixes, `packages/`, `spec/`, `docs/adr/`, `prompt/` |
| wizard | `gpt-5-5` | `codex` | `prompt/`, `trace/<phase>/`, `memory/` with approval | production code, frozen specs, phase pointer flips |

These are **suggestions**, not hard constraints. Reality breaks the suggestion in three places:

- Model IDs drift as providers release new versions.
- Users may deliberately invoke a different tool for a task (e.g., use `claude-code` to write Builder code when Codex is unavailable).
- Self-detection of model/tool is fragile; do not hard-fail on mismatch.

See §4 for how to handle mismatches.

---

## 4. Startup Protocol (mandatory self-check + graceful stop)

On every session start, before making any file edit or running any write tool:

1. **Identify yourself.** Attempt to determine (a) your model ID and (b) the tool/harness you run inside (Claude Code, Codex, Gemini CLI, etc.).
2. **Compare to §3.** Match against the role whose kick file you were launched with (`prompt/PHASE<N>_KICK_<ROLE>.md`).
3. **If you cannot detect your own identity** *or* **your detected identity differs from the suggested mapping for this role**:
   - **STOP.** Do not proceed with any writes.
   - Report to the user with this exact shape:
     > I was launched as role **`<role>`** per `prompt/PHASE<N>_KICK_<ROLE>.md`. My detected identity is **`<model>/<tool>`**, but §3 of AGENTS.md suggests **`<suggested-model>/<suggested-tool>`**. Do you want me to proceed as **`<role>`** with this identity? (y/n)
   - Wait for explicit user approval. A bare `y` or `proceed` is enough. Anything ambiguous means keep waiting.
4. **After approval**, proceed with the role's responsibilities. Log the approved identity at the top of your session (e.g., as a first note in `trace/<phase>/tracker.md` if continuing phase work).
5. **If the suggestion matches** (or you cannot detect anything and have no reason to suspect mismatch), you may proceed without asking.

The point is: **when in doubt, stop and ask once**. Do not silently adopt a role you may not be right for.

---

## 5. Workflow (SDD + TDD loop, condensed)

```text
Scout     → ROADMAP.md (strategic brief)
Wizard    → accepted Scout brief: draft Phase 0 Architect kick/handoff

Architect → spec/<phase>/ Stage A (2-3 options, Freeze Candidates marked)
          → spec/<phase>/ Stage B (Freeze Candidates resolved, CONTRACT_FROZEN)
          → wip/future-support/ (deferred enhancements grouped by future phase)
Builder   → per batch: read SPEC_TEST_MATRIX → write tests (red)
          → implement (green) → refactor → update trace/<phase>/tracker.md
Reviewer  → after Builder closeout: produce severity-ranked findings
Builder   → maintainer-selected remediation findings only, via TDD
Wizard    → after Reviewer acceptance: draft next Architect kick/handoff
Human     → review each stage; approve freeze; trigger next batch
```

Builder global rules:

- Load and follow the local `tdd` skill before implementation work; use
  one-test-at-a-time vertical slices, not horizontal test batches.
- Complete at most one Builder batch per session turn, then stop, report the
  result and verification, and wait for maintainer approval before continuing.

At the start of each Architect phase, read the relevant `wip/future-support/`
entries and promote only the applicable items into that phase's specs or ADRs.
If a prior phase already froze `spec/<next-phase>/`, launch that phase's Builder
from the frozen specs instead of opening another Architect freeze pass.

Reviewer uses `cadenza-reviewer` and does not fix findings. When the maintainer
selects findings, Reviewer emits one generic Builder remediation launch phrase.
Wizard prepares the next Architect kick file after Builder + Reviewer closeout,
or the initial Phase 0 Architect kick after an accepted Scout brief, but never
flips `STATUS.yaml.current_phase`.

Full description: [`docs/agentic-workflow.md`](./docs/agentic-workflow.md).

---

## 6. Verification Commands (run before declaring "done")

Any claim of completion must be preceded by **all of**:

```bash
pnpm typecheck       # tsc --noEmit across all packages
pnpm test            # vitest workspace, all tests green
pnpm lint            # biome check, zero warnings
pnpm format:check    # biome format --check .
markdownlint-cli2 "**/*.md"  # Markdown lint/format rules
find scripts .agents -name '*.sh' -print0 | xargs -0 shfmt -d  # shell format check; options come from .editorconfig
pnpm spec:lint       # scripts/lint-specs.ts — spec structure + traceability
pnpm phase:check     # scripts/phase-check.ts — current-phase exit criteria
pnpm check:harness   # harness config and Cadenza skill mirror consistency
pnpm check:memory    # project memory directory shape
```

If any command fails, **do not claim done**. Fix or report.

For Markdown or shell-script edits, apply formatters before the final check:
`markdownlint-cli2 --fix "**/*.md"` and
`find scripts .agents -name '*.sh' -exec shfmt -w {} +`.
Shell formatting options are configured in `.editorconfig`.

Phase 0 exception: until `packages/` exists, `typecheck` and `test` may be no-ops — but `format:check`, `spec:lint`, and `phase:check` must still be runnable and green.

---

## 7. Hard Constraints (non-negotiable)

1. **Never modify a `CONTRACT_FROZEN` file** without user approval. If unfreezing is genuinely needed, open an ADR that supersedes the decision first.
2. **Never bypass git hooks** (`--no-verify`, `--force`, `git reset --hard` on uncommitted work). If a hook blocks you, read its output and fix the root cause.
3. **Always update `trace/<phase>/tracker.md`** after a batch completes. Insert entries directly below the H1, newest-first, with heading format `YYYY-MM-DD HH:MM +ZZZZ — Title`.
4. **Raw Remotion primitives** (`useCurrentFrame`, `delayRender`, `continueRender`, `TransitionSeries` direct use) are escape-hatch only in Cadenza code. Prefer the typed API + render-safe layer. If you must use raw APIs, add a `// why:` comment pointing to the reason.
5. **Do not publish to npm, push to `main`, or open external PRs** without explicit user approval in the same session.
6. **Communicate with the maintainer primarily in Chinese.** Keep English technical terms, API names, model/tool names, and term-like phrases in English when that is clearer.
7. **Use English for repository artifacts by default.** Unless the user explicitly asks for another language, new or edited files, docs, specs, ADRs, prompts, code comments, and scripts should be written in English.
8. **Load relevant local skills on demand.** Agents may use any locally configured skill that is relevant to the task assigned in the current session.
9. **Use internet research tools when useful.** Agents may use web search, and when justified, higher-fidelity tools such as agent-browser or Playwright, to verify external facts, current behavior, official docs, or browser-observable workflows.
10. **Use sub-agents for parallel work when appropriate.** Agents are encouraged to delegate bounded, independent subtasks to sub-agents when parallel execution is feasible, useful, and safe to integrate.
11. **Reviewer does not remediate.** Reviewer reports findings and, after maintainer selection, emits a Builder remediation launch phrase.
12. **Memory is advisory.** `memory/` stores maintainer-approved lessons only; it never overrides specs, ADRs, status, trace, or design docs.

---

## 8. Directory Map (top-level)

```text
cadenza/
├── AGENTS.md                 ← you are here
├── CLAUDE.md                 ← pointer to this file
├── README.md                 ← human-facing project intro
├── LICENSE.txt / NOTICE.txt  ← Apache 2.0 + Remotion license note
├── STATUS.yaml               ← phase state, ownership (thin index)
├── EXECUTION_TRACKER.md      ← phase index (thin pointer to trace/<phase>/)
├── ROADMAP.md                ← strategic brief (Scout output)
├── goals-non-goals.md        ← what we do and don't build
├── skills/cadenza/           ← public Cadenza authoring mono-skill source
├── .agents/                  ← operational skill source + generated skill mirrors
├── .claude/                  ← Claude Code hooks + skill symlink mirror
├── .github/                  ← CI workflows, issue templates
├── docs/
│   ├── adr/                  ← architectural decision records
│   ├── analysis/             ← strategic analysis (final + archive)
│   ├── design/               ← low-level technical designs (e.g. compiler)
│   ├── communications/       ← drafts of outbound comms
│   └── agentic-workflow.md   ← full workflow explainer (contributor-facing)
├── prompt/                   ← per-phase × per-role kick files
├── spec/<phase>/             ← normative contracts, CONTRACT_FROZEN markers
├── trace/<phase>/            ← execution archives (status.yaml + tracker.md)
├── memory/                   ← maintainer-approved project lessons
├── wip/                      ← non-contract future-support planning notes
├── packages/                 ← pnpm workspace (Builder territory, from Phase 1)
└── scripts/                  ← build + lint + hook scripts + skill sync
```

### 8.1 Agent skills (cross-tool)

The source of truth for command-like Cadenza workflows is
`.agents/skills/cadenza-*/SKILL.md`. The source of truth for Cadenza authoring
guidance is `skills/cadenza/SKILL.md`, mirrored as
`cadenza-best-practices`. These are project-level agent skills, not legacy
prompt bridges.

Current project skills:

- `cadenza-onboard` — cold-start read order + Startup Protocol gate.
- `cadenza-phase-status` — current phase, blockers, exit criteria, next batch.
- `cadenza-reviewer` — independent Builder/closeout review and remediation handoff.
- `cadenza-spec-lint` — `pnpm spec:lint` or Phase 0 bundled fallback hygiene.
- `cadenza-wizard` — bootstrap and phase-boundary Architect handoff drafting.
- `cadenza-best-practices` — generated mirror of `skills/cadenza` for authoring.

Run `scripts/commands-sync.sh` after adding or deleting a `cadenza-*` skill or
editing the public mono-skill bridge. It mirrors `skills/cadenza` into
`.agents/skills/cadenza-best-practices`, then mirrors `.agents/skills/cadenza-*`
into `.claude/skills/cadenza-*` as relative symlinks for Claude Code. Other
agents should read `.agents/skills/` directly when they support the common
skill layout.

---

## 9. Learning Log

Positive-feedback lessons captured across sessions live in [`docs/lessons-learned.md`](./docs/lessons-learned.md). The `Stop` hook appends to that file; future sessions read it via the Read Order at §1. Do not edit it manually unless a lesson is factually wrong.

---

## 10. When in Doubt

In order of preference:

1. Read the relevant `spec/**` or `docs/adr/**` file.
2. Read `docs/agentic-workflow.md`.
3. Ask the user — one concrete question, not a committee of them.
4. Never guess at frozen contracts, licensing, or external communication content. Always ask.
