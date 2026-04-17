# Cadenza — Command Index

Catalog of every slash command currently supported. Sources live in this directory as `<name>.md`; the format contract and cross-tool bridge mechanics are in [`README.md`](./README.md).

> **If you are an agent asking "what `/` commands can I use here?"** — this file is the answer. Read the Summary table, then jump to the section for whichever command you want to invoke.

---

## Summary

| Command                                  | Purpose                                                      | Arguments            | Scope                                |
| :--------------------------------------- | :----------------------------------------------------------- | :------------------- | :----------------------------------- |
| [`/onboard`](./onboard.md)               | Cold-start onboarding checklist + §4 Startup Protocol gate   | *(none)*             | any phase, any role                  |
| [`/phase-status`](./phase-status.md)     | Summarize current phase state from STATUS.yaml + trace       | *(none)*             | any phase, any role                  |
| [`/spec-lint`](./spec-lint.md)           | Run `pnpm spec:lint` (full repo or per file)                 | `[file-path]`        | Phase 0 architect; Phase 1+ all      |

---

## Invocation cheat sheet

The same source file maps to a different invocation depending on the tool. See [`README.md`](./README.md) for the bridge mechanics.

| Tool          | Pattern                              | Example                            |
| :------------ | :----------------------------------- | :--------------------------------- |
| Claude Code   | `/<name>`                            | `/onboard`                         |
| OpenCode      | `/project:<name>`                    | `/project:onboard`                 |
| Gemini CLI    | `/<name>`                            | `/onboard`                         |
| Codex         | `/prompts:cadenza-<name>`            | `/prompts:cadenza-onboard`         |

Codex uses the `cadenza-` prefix because its prompts are user-scope; the prefix prevents collisions with other projects' commands installed in the same `~/.codex/prompts/` directory.

---

## `/onboard`

- **Source**: [`onboard.md`](./onboard.md)
- **Description**: Run the cold-start onboarding checklist for a fresh Cadenza session.
- **Arguments**: none.
- **Safe to run**: yes (read-only; does not edit files or run shell commands).

### When to use

- The **first** `/` invocation at the start of every new agent session.
- After `/compact` or any context reset.
- After a tool restart (e.g., reopening the IDE extension).

### What it does

1. Orders a full read of `AGENTS.md` (with §2 Authority / §3 Roles / §4 Startup Protocol / §7 Hard Constraints emphasized).
2. Orders a read of `STATUS.yaml`, `docs/adr/README.md`, and `docs/analysis/analysis-final.en.md` §0.
3. Points the agent at the role's kick file under `prompt/PHASE<N>_KICK_<ROLE>.md`.
4. Forces the agent through AGENTS.md §4 Startup Protocol — self-report identity, compare to the suggested mapping, stop and ask on mismatch, wait for explicit user approval before any write.

### Output contract

A compact numbered summary + Startup Protocol result. The agent **does not begin work autonomously** — it stops and waits for user confirmation.

---

## `/phase-status`

- **Source**: [`phase-status.md`](./phase-status.md)
- **Description**: Summarize current phase state from `STATUS.yaml` and the current phase's tracker.
- **Arguments**: none.
- **Safe to run**: yes (read-only).

### When to use

- Immediately after `/onboard` to see where the project stands.
- When resuming a batch after a break.
- Before claiming "done" on a phase, to check exit-criteria status.

### What it does

1. Reads `STATUS.yaml` for `current_phase`, owners, and exit-criteria pointer.
2. Reads `trace/<current-phase>/status.yaml` for per-deliverable statuses and machine-readable exit-criteria.
3. Reads `trace/<current-phase>/tracker.md` for narrative timeline, open batches, blockers, and decisions.
4. Returns a fixed-shape report + a recommendation of the next actionable (non-blocked) batch.

### Output contract

A structured report in a predetermined layout. The command never invents missing fields — it returns "not recorded" for gaps. If all open batches are blocked, the report names the blocker.

---

## `/spec-lint`

- **Source**: [`spec-lint.md`](./spec-lint.md)
- **Description**: Run `pnpm spec:lint` across the repo or a specific file, and surface the results.
- **Arguments**: `[file-path]` — optional. If omitted, lints all spec files under `spec/**/*.md`.
- **Safe to run**: yes in the default path (Phase 0 fallback is read-only). Once `pnpm spec:lint` is wired in Phase 1, the command may exec that script — still read-only by design.

### When to use

- Before committing changes to any `spec/**/*.md` file.
- During Architect Stage A/B to verify spec structure (requirement-ID format, status markers, traceability).
- Before declaring a phase complete — AGENTS.md §6 requires verification commands green.

### What it does

1. If `package.json` exists and the `spec:lint` script is wired (Phase 1 B-M4+), runs `pnpm spec:lint $ARGUMENTS` and captures the exit code.
2. Otherwise (Phase 0 pre-B-M4), falls back to in-shell hygiene: walks `spec/**/*.md` and checks status markers (`CONTRACT_DRAFT` / `CONTRACT_FROZEN` / `DEPRECATED`) and requirement-ID format (`<PREFIX>-<DIGITS>`).
3. For `SPEC_TEST_MATRIX.md`, cross-references each requirement ID back to the originating spec in the same phase.

### Output contract

A structured findings table + summary + exit code. If errors > 0, the agent must **not** claim the work is done — per AGENTS.md §6, verification commands must exit 0 first.

---

## Adding a new command

Full authoring rules live in [`README.md`](./README.md) §"Adding a new command". The checklist in short:

1. Write `commands/<name>.md` with YAML frontmatter (`description`, `argument-hint`, optional `allowed-tools`) and a markdown body.
2. Run `scripts/commands-sync.sh` — regenerates `.claude/commands/*.md` symlinks and `.gemini/commands/*.toml` artifacts.
3. **Append a row to the Summary table in this file** (and add a detailed section following the layout above).
4. Commit all of: the source, the generated Gemini TOML, the Claude symlink, and this INDEX update.
5. Tell Codex users to run `scripts/install-codex-commands.sh` on their next pull to pick up the new command.

## Authoring conventions

- **Safe-run by default**: read-only commands need no user confirmation. Any command that executes destructive shell, modifies files outside a narrow scope, or hits the network MUST start its body with "Confirm before running."
- **Body length ≤ 500 words**: long context belongs in `docs/`, referenced from the command body.
- **Imperative voice**: "Read X, summarize Y, return a table with columns Z" beats conversational phrasing.
- **Portable placeholders only**: `$ARGUMENTS` and `$1..$9` are supported across Claude Code and Codex; in Gemini the sync script rewrites them all to `{{args}}` (so Gemini loses positional granularity — do not rely on `$1 ≠ $2` semantics if the command must work under Gemini).
- **No Gemini-only injection syntax**: `!{shell-cmd}` and `@{file-path}` are Gemini-specific; do not use them, they will silently break Claude Code and Codex.
- **Reference files by relative path from repo root**: e.g. `spec/<phase>/SPEC_<DOMAIN>.md`, not `~/repo/spec/...` or absolute paths.
