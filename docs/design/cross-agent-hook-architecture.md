# **Cadenza Cross-Agent Hook Architecture — Technical Design (v0.1 Draft)**

> **Status**: Draft, pending Phase 0 Builder infrastructure planning
> **Author**: Eden Wang (`@DrEden33773`) with Codex
> **Review standard**: Phase 0 Builder infrastructure work should not implement cross-agent hooks until this document, or a superseding design, has been read and scoped.
> **Related documents**:
>
> - [`AGENTS.md`](../../AGENTS.md) §6-§8 (verification commands, hard constraints, skill map)
> - [`docs/agentic-workflow.md`](../agentic-workflow.md) §8 (enforcement layers)
> - [`scripts/hooks/README.md`](../../scripts/hooks/README.md) (current Claude Code hook behavior)
> - [`docs/design/compiler-design.md`](./compiler-design.md) (style reference for Phase 0 design documents)

---

## **0. Why This Document Exists**

Cadenza is intended to be built by multiple agent tools, not by Claude Code alone. The current hook implementation lives under `.claude/settings.json` and `scripts/hooks/`, so its automatic guardrails only run in Claude Code sessions.

That is not sufficient for the planned workflow:

- Architect and Builder may run under Codex.
- Scout or Architect analysis may run under Gemini CLI.
- OpenCode may be used by contributors who already rely on `AGENTS.md`.
- Future agents may have different hook protocols, event names, and blocking semantics.

The purpose of this document is to define a portable hook architecture before the Phase 0 Builder infrastructure bootstrap begins. Agent-local hooks should improve ergonomics and catch mistakes early, but **git hooks and CI remain the authoritative enforcement layer**.

---

## **1. Goals and Non-Goals**

### **1.1 Goals**

1. Reuse the existing Cadenza hook intent across agent tools.
2. Avoid duplicating policy logic separately for Claude Code, Codex, Gemini CLI, OpenCode, and future agents.
3. Keep role boundaries, destructive-command blocks, spec hygiene, trace updates, and verification gates visible at the right moment.
4. Make the weakest hook surface explicit, especially Codex's current limited non-shell interception.
5. Preserve a hard fallback through git pre-commit and CI.
6. Support Reviewer, Wizard, and project-memory workflows without relying on
   agent hooks as the only enforcement layer.

### **1.2 Non-Goals**

1. Do not make agent hooks the only enforcement layer for frozen contracts or role boundaries.
2. Do not require every contributor to use the same agent client.
3. Do not build production Cadenza runtime code as part of hook migration.
4. Do not install remote or opaque hook packages in Phase 0; keep repo-local scripts auditable.

---

## **2. Current Hook Surface**

| Tool | Project hook/config location | Useful events | Main limitation |
| :--- | :--- | :--- | :--- |
| Claude Code | `.claude/settings.json` | `SessionStart`, `PreToolUse`, `PostToolUse`, `Stop`, `PreCompact` | Current scripts parse Claude-style JSON and tool names. |
| Codex | `.codex/hooks.json` plus feature flag | `SessionStart`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `UserPromptSubmit`, `Stop` | Current `PreToolUse` / `PostToolUse` primarily emit `Bash`; `Write`, `Edit`, MCP, WebSearch, and other non-shell tools are not fully intercepted. |
| Gemini CLI | `.gemini/settings.json` | `SessionStart`, `BeforeTool`, `AfterTool`, `BeforeAgent`, `AfterAgent`, `BeforeModel`, `PreCompress`, etc. | Hook stdout must be strict JSON; current shell scripts print Claude-oriented text. |
| OpenCode | `.opencode/plugins/` and `opencode.json` | `tool.execute.before`, `tool.execute.after`, `file.edited`, `session.compacted`, `shell.env`, etc. | Uses a TypeScript/JavaScript plugin model, not command-hook JSON files. |
| OpenHands or similar | tool-specific config | Often supports Claude-compatible hook shapes | Useful as a later adapter target, not a Phase 0 blocking requirement. |

---

## **3. Core Architecture**

The architecture has three layers:

```text
agent hook event
  -> adapter for that agent
  -> normalized Cadenza hook input
  -> shared policy script
  -> adapter-specific output
  -> agent runtime decision / warning / context injection
```

### **3.1 Shared policy core**

Policy scripts own the actual Cadenza rules. They should not know whether they were called by Claude Code, Codex, Gemini CLI, or OpenCode.

Recommended directory shape:

```text
scripts/agent-hooks/
├── adapters/
│   ├── claude.sh
│   ├── codex.sh
│   ├── gemini.sh
│   └── opencode.ts
├── policies/
│   ├── block-dangerous-bash.sh
│   ├── role-boundary.sh
│   ├── format-post-edit.sh
│   ├── spec-post-edit.sh
│   ├── markdown-post-edit.sh
│   ├── adr-index-post-edit.sh
│   ├── session-brief.sh
│   ├── stop-audit.sh
│   └── pre-compact-preserve.sh
└── lib/
    └── normalize-event.sh
```

The current `scripts/hooks/*.sh` can be moved or wrapped into this structure gradually. A Phase 0 Builder should prefer wrapping first, then refactoring only where wrapper complexity becomes worse than the existing script.

### **3.2 Normalized event shape**

Every adapter should translate its native input into a Cadenza shape like:

```json
{
  "agent": "codex",
  "event": "pre_tool_use",
  "tool": "bash",
  "cwd": "/repo/path",
  "role": "architect",
  "command": "pnpm test",
  "file_path": "spec/phase1/SPEC_COMPILER.md",
  "raw": {}
}
```

Not every field is present for every event. Policy scripts must treat missing fields as unknown, not as permission.

### **3.3 Adapter-specific output**

Adapters own output translation:

- Claude Code may use exit code `2` and stderr for blocking `PreToolUse`.
- Codex may use its hook-specific JSON or exit code `2` for Bash denial, but non-shell interception is incomplete.
- Gemini CLI should emit valid JSON on stdout and use `decision: "deny"` or exit code `2` where appropriate.
- OpenCode plugins should throw or mutate event output according to its plugin API.

Policy scripts should return a small internal result:

```json
{
  "decision": "allow",
  "severity": "info",
  "message": "No policy finding."
}
```

or:

```json
{
  "decision": "deny",
  "severity": "error",
  "message": "Architect sessions must not write packages/**/src/**."
}
```

---

## **4. Policy Mapping**

| Current script | Future policy | Agent hook placement | Hard fallback |
| :--- | :--- | :--- | :--- |
| `session-brief.sh` | `session-brief` | Session start / prompt submit context | `AGENTS.md` read order |
| `block-dangerous-bash.sh` | `block-dangerous-bash` | Pre shell tool use / permission request | git discipline, CI, user approval |
| `enforce-architect-boundary.sh` | `role-boundary` | Pre file edit where supported | pre-commit + CI |
| `post-format-edit.sh` | `format-post-edit` | After Markdown or shell edit where supported | `markdownlint-cli2`, `shfmt`, pre-commit + CI |
| `post-spec-edit.sh` | `spec-post-edit` | After file edit where supported | `pnpm spec:lint`, pre-commit + CI |
| `rebuild-adr-index.sh` | `adr-index-post-edit` | After ADR edit where supported | `pnpm phase:check`, review |
| `post-md-edit.sh` | `markdown-post-edit` | After Markdown edit where supported | `pnpm lint` / markdown lint |
| `session-stop-audit.sh` | `stop-audit` | Stop / session end | pre-commit + CI |
| `pre-compact-preserve.sh` | `pre-compact-preserve` | PreCompact / PreCompress / compaction plugin | trace files and read order |
| `scripts/check-harness.ts` | `harness-consistency` | package script / pre-commit / CI | CI |
| `scripts/check-memory.ts` | `memory-consistency` | package script / pre-commit / CI | CI |

Codex-specific caution: until Codex can reliably intercept file writes and non-shell tools, `role-boundary`, `spec-post-edit`, and Markdown/ADR post-edit checks are advisory in Codex sessions unless they are also enforced by git hooks or explicit verification commands.

---

## **5. Priority Plan**

### **P0 — Universal hard gates**

Implement first in the Phase 0 Builder infrastructure bootstrap:

1. `package.json` and `pnpm-workspace.yaml`.
2. `pnpm format:check`, `pnpm lint`, Markdown lint/format, shell `shfmt`, `pnpm spec:lint`, and `pnpm phase:check`.
3. git pre-commit or equivalent local gate for frozen spec changes and role-boundary checks.
4. CI mirror of the same gates.

Rationale: these checks apply regardless of agent tool and compensate for incomplete hook surfaces.

### **P1 — Codex hook adapter**

Implement next because Builder is expected to use `gpt-5-5` via Codex.

Scope:

1. `.codex/hooks.json`.
2. `SessionStart` context injection.
3. `PreToolUse` / `PermissionRequest` for Bash safety.
4. `Stop` audit for missing trace updates and unrun gates.

Non-scope:

1. Do not rely on Codex hooks to enforce file edit policy yet.
2. Do not treat Codex hooks as a replacement for pre-commit or CI.

### **P2 — Gemini CLI hook adapter**

Implement when Gemini is used for Scout or Architect work.

Scope:

1. `.gemini/settings.json`.
2. `SessionStart`, `BeforeTool`, `AfterTool`, `BeforeAgent`, `PreCompress`.
3. Strict JSON output wrappers.

Rationale: Gemini has a broad hook model and can catch more file/tool events than Codex currently can.

### **P3 — OpenCode plugin adapter**

Implement after P0-P2 unless OpenCode becomes a primary contributor path earlier.

Scope:

1. `.opencode/plugins/cadenza-hooks.ts`.
2. `tool.execute.before`, `file.edited`, `session.compacted`.
3. Thin calls into the same shared policy scripts.

Rationale: OpenCode needs a plugin adapter rather than a shell-only hook config.

### **P4 — Additional agents**

Add adapters only when a real contributor uses the tool. Prefer agents whose hook systems can run repo-local scripts and block tool use.

---

## **6. Phase 0 Builder Bootstrap Boundary**

The hook migration belongs to infrastructure work, not to production Cadenza runtime work.

Acceptable Phase 0 Builder scope:

1. Make the verification commands runnable.
2. Add the shared policy directory and thin adapters.
3. Preserve current Claude Code behavior.
4. Add Codex support for startup, Bash safety, approval requests, and stop audit.
5. Document known limitations.

Out of scope:

1. Full OpenCode plugin polish unless OpenCode is actively used during Phase 0.
2. Tool-specific package publishing.
3. Complex telemetry or analytics.
4. Any changes to frozen specs without explicit approval.

---

## **7. Success Criteria**

The first implementation pass is successful when:

1. Claude Code hooks still behave as before.
2. Codex sessions can load repo-local hooks after feature flag setup and receive startup/stop guardrails.
3. Dangerous shell commands are blocked in every supported hook adapter.
4. File-edit-sensitive rules are enforced by pre-commit/CI even if an agent hook misses them.
5. `trace/<phase>/tracker.md` records which hooks ran and which gates were verified for each Builder batch.

---

## **8. Open Questions**

1. Should Cadenza keep hook policy scripts in Bash, or move the normalized policy core to TypeScript once pnpm is bootstrapped?
2. Should Codex hook feature-flag setup be documented as a required contributor setup step or left optional until the feature stabilizes?
3. Should stop hooks block session completion when gates are missing, or only warn and require the final answer to disclose missing gates?
4. How much OpenCode support is worth doing before there is a real OpenCode contributor?
