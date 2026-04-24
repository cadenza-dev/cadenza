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
4. `docs/analysis/analysis-final.en.md` §0 (Executive Summary only, ~30 lines)
5. `prompt/PHASE<N>_KICK_<ROLE>.md` — your role-scoped brief for the current phase
6. `spec/<current-phase>/` — only if your task touches spec or code in this phase
7. `trace/<current-phase>/tracker.md` — only if continuing mid-phase work

Do **not** read `docs/analysis/analysis-final.md` (Chinese) or its archive unless explicitly asked. They are for human review.

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
  > chat history
```

If a `CONTRACT_FROZEN` spec contradicts what a user tells you in chat, **stop and ask** — do not silently override the frozen spec.

---

## 3. Roles (suggested defaults — enforcement is advisory, not strict)

| Role | Suggested model | Suggested tool | Writes | Does not write |
| :-------- | :------------------- | :-------------- | :---------------------------------------------------------- | :---------------------------------------- |
| scout | `gemini-3-1-pro` | `gemini-cli` | `ROADMAP.md`, `docs/research/` | `spec/`, `packages/`, `docs/adr/` |
| architect | `claude-opus-4-7` / `gpt-5-5` | `claude-code` / `codex` | `spec/`, `docs/adr/`, `docs/design/`, `prompt/` | `packages/**/src/`, production code |
| builder | `gpt-5-5` | `codex` | `packages/`, tests, `trace/<phase>/`, infra configs | `spec/` (frozen), `docs/adr/` (accepted) |

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
Architect → spec/<phase>/ Stage A (2-3 options, Freeze Candidates marked)
          → spec/<phase>/ Stage B (Freeze Candidates resolved, CONTRACT_FROZEN)
Builder   → per batch: read SPEC_TEST_MATRIX → write tests (red)
          → implement (green) → refactor → update trace/<phase>/tracker.md
Human     → review each stage; approve freeze; trigger next batch
```

Full description: [`docs/agentic-workflow.md`](./docs/agentic-workflow.md).

---

## 6. Verification Commands (run before declaring "done")

Any claim of completion must be preceded by **all of**:

```bash
pnpm typecheck       # tsc --noEmit across all packages
pnpm test            # vitest workspace, all tests green
pnpm lint            # biome check, zero warnings
pnpm spec:lint       # scripts/lint-specs.ts — spec structure + traceability
pnpm phase:check     # scripts/phase-check.ts — current-phase exit criteria
```

If any command fails, **do not claim done**. Fix or report.

Phase 0 exception: until `packages/` exists, `typecheck` and `test` may be no-ops — but `spec:lint` and `phase:check` must still be runnable and green.

---

## 7. Hard Constraints (non-negotiable)

1. **Never modify a `CONTRACT_FROZEN` file** without user approval. If unfreezing is genuinely needed, open an ADR that supersedes the decision first.
2. **Never bypass git hooks** (`--no-verify`, `--force`, `git reset --hard` on uncommitted work). If a hook blocks you, read its output and fix the root cause.
3. **Always update `trace/<phase>/tracker.md`** after a batch completes. Missing traces make context recovery fail.
4. **Raw Remotion primitives** (`useCurrentFrame`, `delayRender`, `continueRender`, `TransitionSeries` direct use) are escape-hatch only in Cadenza code. Prefer the typed API + render-safe layer. If you must use raw APIs, add a `// why:` comment pointing to the reason.
5. **Do not publish to npm, push to `main`, or open external PRs** without explicit user approval in the same session.

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
├── .claude/                  ← Claude Code-specific config (hooks, skills)
├── .github/                  ← CI workflows, issue templates
├── docs/
│   ├── adr/                  ← architectural decision records
│   ├── analysis/             ← strategic analysis (final + archive)
│   ├── design/               ← low-level technical designs (e.g. compiler)
│   ├── communications/       ← drafts of outbound comms
│   └── agentic-workflow.md   ← full workflow explainer (contributor-facing)
├── prompt/                   ← per-phase × per-role kick files
├── commands/                 ← canonical slash-command sources; see commands/README.md
├── spec/<phase>/             ← normative contracts, CONTRACT_FROZEN markers
├── trace/<phase>/            ← execution archives (status.yaml + tracker.md)
├── packages/                 ← pnpm workspace (Builder territory, from Phase 1)
└── scripts/                  ← build + lint + hook scripts + commands-sync.sh
```

### 8.1 Slash commands (cross-tool)

The single source of truth for every slash command is `commands/<name>.md` (markdown + YAML frontmatter). Per-tool bridges regenerate on demand:

- **Claude Code** → `.claude/commands/*.md` (relative symlinks into `commands/`).
- **OpenCode** → reads `.claude/commands/*.md` as its Claude Code fallback — free.
- **Gemini CLI** → `.gemini/commands/*.toml` (generated by `scripts/commands-sync.sh`; `$ARGUMENTS` → `{{args}}`).
- **Codex** → user-scope `~/.codex/prompts/cadenza-*.md` (installed per developer via `scripts/install-codex-commands.sh`; invoked as `/prompts:cadenza-<name>`).

Edit sources in `commands/<name>.md`, run `scripts/commands-sync.sh`, commit. See [`commands/README.md`](./commands/README.md) for authoring rules and cross-tool portability constraints.

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
