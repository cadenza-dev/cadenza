# `scripts/hooks/`

Shell scripts invoked by Claude Code hooks (configured in [`.claude/settings.json`](../../.claude/settings.json)). They run automatically during Claude Code sessions and are not intended to be invoked directly by humans.

## Script index

| Script | Event | Purpose |
| :--- | :--- | :--- |
| `session-brief.sh` | SessionStart | Print current phase, role mapping, and §4 Startup Protocol reminder |
| `enforce-architect-boundary.sh` | PreToolUse `Write\|Edit` | Block architect sessions from writing `packages/**/src/**` |
| `block-dangerous-bash.sh` | PreToolUse `Bash` | Block destructive commands (rm -rf /, force push, publish, hook bypass) |
| `post-format-edit.sh` | PostToolUse `Write\|Edit` | After `*.md` edits, run `markdownlint-cli2 --fix`; after `*.sh` edits, run `shfmt -w` with repo `.editorconfig` options |
| `post-spec-edit.sh` | PostToolUse `Write\|Edit` | After `spec/` edits, run structural sanity + `pnpm spec:lint` if present |
| `rebuild-adr-index.sh` | PostToolUse `Write\|Edit` | After ADR file edits, warn if `docs/adr/README.md` index is out of sync |
| `post-md-edit.sh` | PostToolUse `Write\|Edit` | After any `*.md` edit, run `markdownlint-cli2`; when a rule fires ≥ N times in a session, suggest relaxing it in `.markdownlint-cli2.jsonc` project-wide rather than per-file |
| `session-stop-audit.sh` | Stop | Warn about uncommitted work or missing `trace/<phase>/` updates |
| `pre-compact-preserve.sh` | PreCompact | Inject `STATUS.yaml` + read-order reminder before context compaction |
| `codex-session-brief.sh` | Codex SessionStart | Adapt `session-brief.sh` into Codex JSON additional context |
| `codex-permission-request.sh` | Codex PermissionRequest `Bash` | Adapt dangerous-Bash checks into Codex approval denial JSON |
| `codex-stop-audit.sh` | Codex Stop | Adapt `session-stop-audit.sh` into Codex JSON system messages |

Related package/CI gates live one directory higher:

- `scripts/check-harness.ts` verifies hook script references and Cadenza skill
  mirror consistency.
- `scripts/check-memory.ts` verifies the project memory directory shape and
  lesson frontmatter.

## Hook protocol (Claude Code)

All scripts follow the same contract:

- **stdin**: JSON with `tool_name` plus `tool_input` (and, for PostToolUse, `tool_response`).
- **stdout**: injected as additional context to the agent. Keep it small — hooks pay nothing in context unless they produce output.
- **stderr**: surfaced as a warning or block reason. Use for human-readable explanations.
- **exit codes**: `0` = allow / silent success; `2` = block (`PreToolUse` only). Other non-zero = error but non-blocking (tool already ran for PostToolUse).

Scripts use `jq` for JSON parsing. If `jq` is absent, they no-op gracefully rather than blocking.

## Hook protocol (Codex)

Project-local Codex hooks live in [`.codex/hooks.json`](../../.codex/hooks.json)
with the feature flag enabled in [`.codex/config.toml`](../../.codex/config.toml).
Codex requires JSON stdout for some events, so the `codex-*` wrappers adapt the
shared Claude-oriented scripts without duplicating policy logic.

Current Codex coverage is intentionally narrow:

- startup context injection,
- Bash safety before shell execution,
- Bash permission-request denial for unsafe commands,
- stop-time audit notes.

File-edit-sensitive rules remain enforced by `.githooks/` and CI because Codex
hook interception is not yet a complete enforcement boundary.

## Role detection

Boundary-enforcing hooks read `CADENZA_AGENT_ROLE` (values: `scout`, `architect`, `builder`). Unset defaults to `architect`. See [`.claude/README.md`](../../.claude/README.md) for full details.

## Dependencies

- `bash` ≥ 4.0
- `jq` (recommended; hooks gracefully no-op without it)
- `git` (for `session-stop-audit.sh`)
- `markdownlint-cli2` (optional; Markdown hooks skip gracefully when absent). Installed as a devDependency during Phase 0 Builder work.
- `shfmt` (optional; `post-format-edit.sh` skips shell formatting gracefully when absent). Shell formatting options come from the root `.editorconfig`.

## Tunables (env vars)

- `CADENZA_AGENT_ROLE` — `scout` / `architect` / `builder` / `reviewer` / `wizard`. Defaults to `architect` in unset sessions. Controls boundary enforcement.
- `CADENZA_MD_LINT_THRESHOLD` — integer ≥ 1. Defaults to `3`. Number of times a markdown-lint rule must fire within one session before `post-md-edit.sh` suggests a project-level config relaxation.
- `CADENZA_ALLOW_RESET` / `CADENZA_ALLOW_PUBLISH` — set to `1` (only with user approval) to bypass specific patterns in `block-dangerous-bash.sh`.

## Portability

Scripts are POSIX-ish bash and work on macOS and Linux. Windows users should run via WSL. CI runs them in Ubuntu (see `.github/workflows/`).

## Testing a hook manually

```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"packages/core/src/index.ts"}}' \
  | CADENZA_AGENT_ROLE=architect bash scripts/hooks/enforce-architect-boundary.sh \
  ; echo "exit=$?"
```

Exit code 2 plus a message on stderr means the hook fired correctly.
