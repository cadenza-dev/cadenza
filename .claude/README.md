# `.claude/` — Claude Code specifics for Cadenza

This directory holds **tool-specific** configuration for Claude Code sessions working on Cadenza. Everything here is a complement to [`AGENTS.md`](../AGENTS.md) at the project root, not a substitute.

If you are not running Claude Code (e.g., you are Codex, Gemini CLI, or a human editor), most files here are irrelevant to you — but the role boundaries referenced below still apply across tools.

## What's here

| File                          | Purpose                                                                                                        |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------- |
| `settings.json`               | Hooks configuration (SessionStart / PreToolUse / PostToolUse / Stop / PreCompact) pointing at `scripts/hooks/` |
| `skills/` *(Phase 1+)*        | Cadenza-specific skill pack (typed API conventions, render-safe usage, TDD loop, spec format)                  |
| `README.md` (this file)       | Overview of this directory                                                                                     |

## How the hooks work

All hook logic lives in shell scripts under [`scripts/hooks/`](../scripts/hooks/) at the project root — **not** inside `.claude/`. Rationale:

1. Those scripts may be re-used from git hooks or CI later, and keeping them outside `.claude/` avoids vendor lock-in to one harness.
2. Non-Claude-Code tools (Codex, Gemini CLI) can still invoke the scripts locally to enforce the same invariants if needed.

`settings.json` in this directory is a thin dispatch layer that Claude Code reads. The scripts themselves do the work.

## Role identification (how boundary hooks decide)

The `enforce-architect-boundary.sh` hook reads the `CADENZA_AGENT_ROLE` environment variable:

- **unset** → defaults to `architect` (Claude Code is the Architect's suggested tool).
- `architect` → enforces the "no writes to `packages/**/src/**`" boundary.
- `builder` → boundary check is skipped (useful if you are intentionally running Builder work in Claude Code — e.g., Codex is unavailable).
- `scout` → boundary check is skipped; separate `spec/` and `packages/` write blocks apply instead (Phase 2+).

Set it at session launch:

```bash
CADENZA_AGENT_ROLE=builder claude
```

Or export it persistently in your shell profile if one specific role is your default use of Claude Code on this project.

Note: per [`AGENTS.md`](../AGENTS.md) §3–§4, this env var is part of the **advisory** binding. Its presence is one of the signals agents self-check against — it does not replace the Startup Protocol, it informs it.

## Skills (Phase 1+)

Skills for Cadenza will ship alongside the Phase 1 MVP (see [analysis-final §5.4](../docs/analysis/analysis-final.en.md)). Initial roster:

- `cadenza-typed-api` — how to use `<Deck>` / `<Slide>` / `<Step>` / `<Transition>`
- `cadenza-render-safe` — correct usage of `<SafeImage>` / `<SafeFont>` / `<TypographyBox>`, and the anti-patterns they forbid
- `cadenza-compiler-edges` — pointer to [`docs/design/compiler-design.md`](../docs/design/compiler-design.md) edge cases with quick-reference summaries
- `cadenza-tdd-loop` — red → green → refactor, anchored on `SPEC_TEST_MATRIX`
- `cadenza-spec-format` — how to read/write normative specs (requirement IDs, CONTRACT_FROZEN markers, traceability)
- `cadenza-remotion-debug` — common `flickering` / `delayRender` failure modes and fixes

They will live under `.claude/skills/<slug>/SKILL.md`. Until that directory exists, this section is a placeholder.

## Slash commands (Phase 1+)

Potential custom slash commands for Cadenza sessions (not yet implemented):

- `/cadenza-spec-lint` — run `pnpm spec:lint` and surface results
- `/cadenza-phase-status` — summarize `STATUS.yaml` + current phase exit criteria progress
- `/cadenza-next-batch` — hand off current batch to a new Builder session with the right kick file

## Do not put here

- Strategic analysis → goes in `docs/analysis/`
- ADRs → go in `docs/adr/`
- Spec contracts → go in `spec/<phase>/`
- Prompt kick files → go in `prompt/`
- Anything that should apply to Codex or other tools → goes in `AGENTS.md`

Keep `.claude/` narrowly scoped to Claude Code specifics.
