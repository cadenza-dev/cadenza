# **Cadenza 跨 Agent Hook 架构 — 技术设计文档 (v0.1 草案)**

> **状态**：Draft, pending Phase 0 Builder infrastructure planning
> **作者**：Eden Wang (`@DrEden33773`) with Codex
> **评审标准**：Phase 0 Builder 开始实现跨 agent hooks 前，必须先阅读本文档或其后续替代设计。
> **关联文档**：
>
> - [`AGENTS.md`](../../AGENTS.md) §6-§8（验证命令、硬约束、跨工具命令桥接）
> - [`docs/agentic-workflow.md`](../agentic-workflow.md) §8（enforcement layers）
> - [`scripts/hooks/README.md`](../../scripts/hooks/README.md)（当前 Claude Code hooks 行为）
> - [`docs/design/compiler-design.zh.md`](./compiler-design.zh.md)（Phase 0 技术设计文档风格参考）

---

## **0. 为什么需要这份文档**

Cadenza 的目标不是绑定在 Claude Code 上完成，而是允许多个 agent 工具参与建设。当前 hook 实现位于 `.claude/settings.json` 和 `scripts/hooks/`，因此自动护栏只会在 Claude Code session 中生效。

这与后续工作流不完全匹配：

- Architect 和 Builder 可能运行在 Codex 中。
- Scout 或 Architect 的分析任务可能运行在 Gemini CLI 中。
- 外部贡献者可能更习惯 OpenCode，但仍读取同一份 `AGENTS.md`。
- 未来新的 agent 工具会有不同的 hook 协议、事件名和阻断语义。

本文档的目的，是在 Phase 0 Builder 做基础设施 bootstrap 前，先定义一套可迁移的 hook 架构。Agent 本地 hooks 用于提前提醒和拦截常见错误，但**最终强制层仍然是 git hooks 和 CI**。

---

## **1. 目标与非目标**

### **1.1 目标**

1. 复用当前 Cadenza hooks 的规则意图。
2. 避免为 Claude Code、Codex、Gemini CLI、OpenCode 和未来 agent 各自维护一套重复策略。
3. 在正确时机暴露 role boundary、危险命令拦截、spec hygiene、trace 更新和验证流水线。
4. 明确每个工具的弱点，尤其是 Codex 当前对非 shell 工具拦截仍有限。
5. 保留 git pre-commit 和 CI 作为硬兜底。

### **1.2 非目标**

1. 不把 agent hooks 作为 frozen contract 或 role boundary 的唯一 enforcement。
2. 不要求所有贡献者使用同一个 agent client。
3. 不在 hook 迁移中编写 Cadenza 生产运行时代码。
4. Phase 0 不引入远程或不透明的 hook 包；优先保持 repo-local、可审计。

---

## **2. 当前 Hook 能力面**

| 工具 | 项目级 hook/config 位置 | 可用事件 | 主要限制 |
| :--- | :--- | :--- | :--- |
| Claude Code | `.claude/settings.json` | `SessionStart`, `PreToolUse`, `PostToolUse`, `Stop`, `PreCompact` | 当前脚本解析 Claude 风格 JSON 和工具名。 |
| Codex | `.codex/hooks.json` 加 feature flag | `SessionStart`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `UserPromptSubmit`, `Stop` | 当前 `PreToolUse` / `PostToolUse` 主要只发出 `Bash`；`Write`、`Edit`、MCP、WebSearch 等非 shell 工具还不能完整拦截。 |
| Gemini CLI | `.gemini/settings.json` | `SessionStart`, `BeforeTool`, `AfterTool`, `BeforeAgent`, `AfterAgent`, `BeforeModel`, `PreCompress` 等 | hook stdout 必须是严格 JSON；当前 shell 脚本输出偏 Claude 风格文本。 |
| OpenCode | `.opencode/plugins/` 和 `opencode.json` | `tool.execute.before`, `tool.execute.after`, `file.edited`, `session.compacted`, `shell.env` 等 | 使用 TypeScript/JavaScript plugin 模型，不是 command-hook JSON 文件。 |
| OpenHands 或类似工具 | 工具自有配置 | 常见为 Claude-compatible hook 形态 | 可作为后续 adapter 目标，不是 Phase 0 阻塞项。 |

---

## **3. 核心架构**

整体架构分三层：

```text
agent hook event
  -> 当前 agent 的 adapter
  -> Cadenza 标准化 hook input
  -> 共享 policy script
  -> adapter-specific output
  -> agent runtime 的 decision / warning / context injection
```

### **3.1 共享 policy core**

Policy scripts 负责真正的 Cadenza 规则，不应关心调用方是 Claude Code、Codex、Gemini CLI 还是 OpenCode。

建议目录结构：

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
│   ├── spec-post-edit.sh
│   ├── markdown-post-edit.sh
│   ├── adr-index-post-edit.sh
│   ├── session-brief.sh
│   ├── stop-audit.sh
│   └── pre-compact-preserve.sh
└── lib/
    └── normalize-event.sh
```

现有 `scripts/hooks/*.sh` 可以逐步移动或包装到这个结构里。Phase 0 Builder 应优先包装现有脚本，只有当 wrapper 复杂度高于原脚本时，再做重构。

### **3.2 标准化事件形态**

每个 adapter 把原生输入翻译成类似下面的 Cadenza 事件：

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

不是每个事件都有所有字段。Policy scripts 必须把缺失字段视为未知，而不是默认允许。

### **3.3 按 adapter 输出**

Adapter 负责把 policy 结果翻译回各工具需要的输出：

- Claude Code 可用 exit code `2` 和 stderr 阻断 `PreToolUse`。
- Codex 可用 hook-specific JSON 或 exit code `2` 阻断 Bash，但非 shell 拦截仍不完整。
- Gemini CLI 应在 stdout 输出合法 JSON，并按需使用 `decision: "deny"` 或 exit code `2`。
- OpenCode plugin 应按 plugin API 抛错或修改 event output。

Policy scripts 返回一个小型内部结果：

```json
{
  "decision": "allow",
  "severity": "info",
  "message": "No policy finding."
}
```

或：

```json
{
  "decision": "deny",
  "severity": "error",
  "message": "Architect sessions must not write packages/**/src/**."
}
```

---

## **4. 规则映射**

| 当前脚本 | 未来 policy | Agent hook 位置 | 硬兜底 |
| :--- | :--- | :--- | :--- |
| `session-brief.sh` | `session-brief` | session start / prompt submit context | `AGENTS.md` read order |
| `block-dangerous-bash.sh` | `block-dangerous-bash` | shell tool use 前 / permission request | git discipline、CI、用户审批 |
| `enforce-architect-boundary.sh` | `role-boundary` | 支持时在文件编辑前 | pre-commit + CI |
| `post-spec-edit.sh` | `spec-post-edit` | 支持时在文件编辑后 | `pnpm spec:lint`, pre-commit + CI |
| `rebuild-adr-index.sh` | `adr-index-post-edit` | 支持时在 ADR 编辑后 | `pnpm phase:check`, review |
| `post-md-edit.sh` | `markdown-post-edit` | 支持时在 Markdown 编辑后 | `pnpm lint` / markdown lint |
| `session-stop-audit.sh` | `stop-audit` | stop / session end | pre-commit + CI |
| `pre-compact-preserve.sh` | `pre-compact-preserve` | PreCompact / PreCompress / compaction plugin | trace files 和 read order |

Codex 特别注意：在 Codex 能可靠拦截文件写入和非 shell 工具之前，`role-boundary`、`spec-post-edit`、Markdown/ADR post-edit 检查在 Codex session 中只能算提前提醒；真正 enforcement 必须落到 git hooks 或显式验证命令。

---

## **5. 优先级计划**

### **P0 — Universal hard gates**

应在 Phase 0 Builder infrastructure bootstrap 中优先完成：

1. `package.json` 和 `pnpm-workspace.yaml`。
2. `pnpm format:check`、`pnpm lint`、`pnpm spec:lint`、`pnpm phase:check`。
3. 用 git pre-commit 或等价本地 gate 检查 frozen spec 变更和 role boundary。
4. CI 复刻同一批 gates。

理由：这些检查与 agent 工具无关，可以补足各工具 hook 能力不一致的问题。

### **P1 — Codex hook adapter**

第二优先级，因为 Builder 的建议组合是 `gpt-5-5` via Codex。

范围：

1. `.codex/hooks.json`。
2. `SessionStart` context injection。
3. `PreToolUse` / `PermissionRequest` 的 Bash safety。
4. `Stop` audit，检查 trace 更新和未运行 gates。

非范围：

1. 暂不依赖 Codex hooks 执行文件编辑策略。
2. 不把 Codex hooks 当成 pre-commit 或 CI 的替代品。

### **P2 — Gemini CLI hook adapter**

当 Gemini 被用于 Scout 或 Architect 工作时实现。

范围：

1. `.gemini/settings.json`。
2. `SessionStart`、`BeforeTool`、`AfterTool`、`BeforeAgent`、`PreCompress`。
3. 严格 JSON 输出 wrappers。

理由：Gemini 的 hook 模型较完整，当前比 Codex 更适合拦截文件和工具事件。

### **P3 — OpenCode plugin adapter**

除非 OpenCode 更早成为主要贡献路径，否则排在 P0-P2 之后。

范围：

1. `.opencode/plugins/cadenza-hooks.ts`。
2. `tool.execute.before`、`file.edited`、`session.compacted`。
3. 只写薄 wrapper，调用同一批共享 policy scripts。

理由：OpenCode 需要 plugin adapter，而不是 shell-only hook config。

### **P4 — 其它 agents**

只有当真实贡献者使用对应工具时再加 adapter。优先支持能运行 repo-local scripts 并能阻断工具调用的 agent。

---

## **6. Phase 0 Builder Bootstrap 边界**

Hook 迁移属于基础设施工作，不属于 Cadenza 生产 runtime 工作。

Phase 0 Builder 可接受范围：

1. 让验证命令可运行。
2. 加入共享 policy 目录和薄 adapter。
3. 保持当前 Claude Code 行为不退化。
4. 增加 Codex 的 startup、Bash safety、approval request 和 stop audit 支持。
5. 记录已知限制。

范围外：

1. 除非 OpenCode 在 Phase 0 被实际使用，否则不做完整 OpenCode plugin polish。
2. 不发布工具专用 package。
3. 不做复杂 telemetry 或 analytics。
4. 不在没有明确批准的情况下修改 frozen specs。

---

## **7. 成功标准**

第一轮实现成功的标准：

1. Claude Code hooks 行为保持不变。
2. Codex session 在 feature flag 配好后可加载 repo-local hooks，并获得 startup/stop 护栏。
3. 所有已支持 adapter 都能阻断危险 shell 命令。
4. 即使 agent hook 漏拦截，文件编辑相关规则仍由 pre-commit/CI enforce。
5. 每个 Builder batch 都在 `trace/<phase>/tracker.md` 记录 hooks 与 gates 的验证情况。

---

## **8. 未决问题**

1. Cadenza 的 hook policy core 应继续使用 Bash，还是在 pnpm bootstrap 后迁移到 TypeScript？
2. Codex hook feature flag 应作为 contributor setup 必需步骤，还是在该功能稳定前保持可选？
3. Stop hooks 在 gates 缺失时应阻止 session 完成，还是只警告并要求 final answer 明确披露？
4. 在真正出现 OpenCode 贡献者前，OpenCode 支持做到什么程度才值得？
