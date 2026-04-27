# `.codex/` - Codex-specific Cadenza hooks

This directory contains project-local Codex configuration for Cadenza. It
complements [`AGENTS.md`](../AGENTS.md); it does not replace the Startup
Protocol or the git/CI hard gates.

## Files

| File | Purpose |
| :--- | :--- |
| `config.toml` | Enables Codex hooks for this trusted project layer |
| `hooks.json` | Wires Codex lifecycle events to shared scripts under `scripts/hooks/` |

## Supported events

- `SessionStart`: injects the same Cadenza startup brief used by Claude Code.
- `PreToolUse` for `Bash`: blocks destructive or trust-violating shell commands.
- `PermissionRequest` for `Bash`: denies unsafe escalation requests before they
  reach the normal approval prompt.
- `Stop`: adapts the shared session stop audit into Codex JSON output.

## Current limitations

Codex hooks are guardrails, not the source of truth. File-edit interception and
some shell paths are still incomplete in Codex, so frozen-contract and role
boundary enforcement live in `.githooks/` and CI as the authoritative fallback.

Reviewer, Wizard, and memory workflows follow the same rule: Codex hooks may
remind the agent at startup or stop time, but `check:role-boundary`,
`check:harness`, `check:memory`, pre-commit, and CI are the durable enforcement
layers.
