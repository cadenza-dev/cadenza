# Phase 7 Pre-Architect Brainstorming Topics

> Status: QA planning note, not a contract.
> Date: 2026-06-03.
> Language: Chinese-first maintainer discussion note.

本文件记录 Phase 7 Architect 之前建议先开展的 brainstorming topics。
它不是 `spec/phase7/` 合同，也不替代未来的 Stage A / Stage B 流程。
它的用途是帮助 maintainer 按最省心的顺序展开讨论：先宏观，后具体；
先处理容易收束且会影响后续全部判断的问题；再进入 UI、runtime、export、
evidence 等更重的设计空间。

## Context

Phase 7 的主任务不是单纯做一个漂亮播放器，而是把 Cadenza 从
本地工程能力推进到第一个可信的产品面：Player App、local preview、
app-based web export、CLI alpha invocation、fresh-project dogfood、public
alpha wording，以及与这些能力匹配的 evidence gates。

Phase 6/6.5 已经提供了重要底座：

- local CLI: `validate`, `export`, `inspect`, stable `--json` summaries。
- local export: static web compatibility, local MP4, manifest, per-format
  evidence, structured diagnostics。
- alpha surface hygiene: durable Cadenza/local-export names and
  `cadenza-alpha-readiness-talk` as the canonical alpha selector。

Phase 7 需要避免两个方向的误判：

- 把 Phase 7 缩成 UI repaint，忽略 alpha/public contract 风险。
- 把 Phase 7 扩成 hosted SaaS、marketplace、editor、PDF/PPTX 或 npm release
  的总爆发。

## Ordering Principles

推荐顺序遵循四条规则：

1. **先定 public promise**：先决定可以对 alpha 用户承诺什么，再决定怎么实现。
2. **先定 shared runtime**：Player App、preview、web export、MP4 visual
   fidelity 如果不共享边界，后面会反复返工。
3. **先易后难**：容易从既有 roadmap / non-goals 收束的问题放前面，为重设计题
   降低不确定性。
4. **先合同后验证**：先明确哪些行为要成为 Phase 7 contract，再定义 dogfood 和
   evidence gates。

## Recommended Discussion Sequence

| Order | Topic | Why Now | Recommended Method |
| :---- | :---- | :---- | :---- |
| 1 | Alpha claim boundary and audience promise | 所有 UI、install、docs、evidence 的上层边界 | `superpowers:brainstorming` -> `grill-with-docs` |
| 2 | Phase 7 success slice and non-goals | 快速排除 hosted/editor/PDF/PPTX 等 scope creep | `grill-with-docs` |
| 3 | Player App role and UI / App Design direction | 确定产品第一印象和 app 需要服务的工作流 | `superpowers:brainstorming` with optional visual companion |
| 4 | Player App package boundary and `preview-remotion` transition | 影响 public package surface 和未来兼容承诺 | `superpowers:brainstorming` -> `grill-with-docs` |
| 5 | Visual-fidelity export posture | 决定 web/MP4 是否必须接近 Player App 视觉路径 | `superpowers:brainstorming` -> `grill-me` |
| 6 | App-based web export and bundler contract | Phase 6 static compatibility 的替代路线 | `superpowers:brainstorming` |
| 7 | CLI install, invocation, and pure JSON path | alpha 用户和 agents 如何可靠调用 CLI | `grill-with-docs` |
| 8 | Canonical deck identity, starters, and demo material | 决定用户看到的第一份 Cadenza 内容 | `grill-with-docs` -> `superpowers:brainstorming` |
| 9 | Diagnostics, readiness, and progress model | Player App、CLI、agent repair 的共同反馈语言 | `superpowers:brainstorming` |
| 10 | Evidence gates and visual regression strategy | 决定什么证据足以支撑 alpha claim | `superpowers:brainstorming` -> `grill-me` |
| 11 | Config surface expansion | 避免过早冻结 `playerApp` / `preview` / `web` keys | `grill-with-docs` |
| 12 | Fresh-project dogfood harness | 在前面 contract 初步收束后验证真实 alpha 路径 | `superpowers:brainstorming` -> `grill-me` |

## Topic Details

### 1. Alpha Claim Boundary And Audience Promise

**核心问题**：Phase 7 完成后，Cadenza 能公开说自己是什么？

建议先讨论这个 topic，因为它决定所有后续内容的口径。Phase 7 不能只证明
“代码能跑”，还要证明 public alpha wording 不过度承诺。可以比较三种姿态：

- repo-local developer preview: 只承诺从仓库 checkout 运行。
- local developer alpha candidate: 可以给小范围开发者试用，但明确限制。
- public alpha: 允许公开宣发，但必须有更强 install、docs、dogfood、evidence。

推荐结论倾向：先以 **local developer alpha candidate** 为目标，只有在
fresh-project dogfood 和 release wording 都被 Reviewer 接受后，才升级为 public
alpha claim。

推荐方式：先用 `superpowers:brainstorming` 拉出 2-3 种 alpha 姿态；然后用
`grill-with-docs` 审查 README、alpha guide、package metadata、known limitations
里哪些词能用、哪些词不能用。

### 2. Phase 7 Success Slice And Non-Goals

**核心问题**：Phase 7 到底要完成哪一个最小但完整的产品闭环？

这是容易先出结论的问题，因为既有 roadmap 已经明确排除了 hosted SaaS、
Remotion Lambda production、cloud queue、broad template marketplace、PPTX/PDF
IR、WYSIWYG editor、collaboration、accounts、SSO 等方向。这里要把
“Phase 7 完成”压成一个可验证闭环：

- Player App 能打开 canonical deck。
- local preview 使用 Player App，而不是 raw Player page。
- CLI 能导出 app-based web bundle。
- MP4 和 web 的视觉限制被清楚记录。
- alpha docs 与 evidence 不 overclaim。

推荐方式：用 `grill-with-docs`。这个 topic 更像 contract boundary cleanup，
不是自由创意发散。讨论时应该逐条问：“这个能力如果缺失，Phase 7 还能否
被称为 alpha candidate？”

### 3. Player App Role And UI / App Design Direction

**核心问题**：Cadenza Player App 的第一屏要让开发者立刻相信什么？

UI / App Design 应该早谈，但不应该第一个谈。它需要先继承 alpha promise 和
success slice，然后再决定视觉语言、信息架构和交互优先级。建议围绕这些问题
展开：

- 第一屏主对象是 deck，还是 playback controls，还是 diagnostics？
- 是否默认显示 outline / chapter navigation？
- speaker notes 应该如何保持边界：可见、隐藏、presenter-only，还是 metadata
  inspectable？
- readiness / diagnostics 是常驻状态、toast、panel，还是 export metadata tab？
- desktop 和 mobile browser 的最低可接受体验是什么？
- Cadenza 的视觉气质应更像 developer tool、presentation player，还是 technical
  artifact inspector？

推荐结论倾向：Phase 7 UI 应该是 **developer-facing playback shell**，不是营销
landing page，也不是编辑器。它应该安静、清晰、可检查，突出 deck identity、
navigation、playback、diagnostics/readiness 和 export provenance。

推荐方式：用 `superpowers:brainstorming`，并考虑启用 visual companion 做
wireframe / layout 对比。随后用 `grill-me` 压问题，例如“没有 diagnostics panel
是否仍可 alpha？”、“mobile 是否只是 responsive viewer，还是正式 presenter
surface？”

### 4. Player App Package Boundary And `preview-remotion` Transition

**核心问题**：Phase 7 是否引入 `@cadenza-dev/player-app` 或
`@cadenza-dev/player`，以及 `@cadenza-dev/preview-remotion` 的长期位置是什么？

这个 topic 会影响 public package surface、dependency boundary、future desktop
wrapper、app-based web export 复用。可以比较：

- 新增 `@cadenza-dev/player-app`，内部依赖 `preview-remotion`。
- 将 `preview-remotion` 收缩成 Remotion adapter，再由新 player package 暴露产品面。
- 延迟新 package，先在 preview package 内形成 shell，再在 Phase 7 后拆包。

推荐结论倾向：新增 product-facing package boundary 更干净，但不要急着 deprecate
`preview-remotion`。它应在 Player App 达到 local preview parity 后再收缩为内部
adapter 或迁移目标。

推荐方式：先用 `superpowers:brainstorming` 比较 package topology，再用
`grill-with-docs` 判断是否需要 ADR。若决定改变 public package posture，通常应
进入 ADR 或 Phase 7 frozen spec。

### 5. Visual-Fidelity Export Posture

**核心问题**：Phase 7 alpha 的 web 和 MP4 输出是否必须展示真实 Player App 视觉体验？

这是 Phase 7 最硬的问题之一。Phase 6 的 static web compatibility 是语义可检查的
compatibility output，不是 polished product shell。Phase 6 的 MP4 也记录了本地
renderer provenance 和 limitations，而不是 frame-perfect product promise。

需要比较：

- Phase 7 只要求 app-based web 走 Player App，MP4 继续记录限制。
- web 和 MP4 都必须走 Player App-equivalent visual route。
- web 走 Player App，MP4 只需证明 authored deck render fidelity，不承诺 app chrome。

推荐结论倾向：Phase 7 至少应让 app-based web export 成为 preferred visual output。
MP4 是否必须包括 Player App chrome 要谨慎；对 technical talks 来说，MP4 可能应导出
deck content 而不是播放器 UI。关键是不要把 MP4 supported 写成没有视觉限制。

推荐方式：先用 `superpowers:brainstorming` 明确方案和 tradeoffs，再用 `grill-me`
压力测试：“如果 MP4 仍有视觉限制，是否阻塞 public alpha？”

### 6. App-Based Web Export And Bundler Contract

**核心问题**：Phase 7 的 web export 是什么 artifact？

需要决定 app bundle 的 contract，而不是复用 Phase 6 static helper 的形状。讨论点：

- 输出目录结构和 manifest/evidence 的关系。
- 是否需要 route assets、runtime chunks、CSS、fonts、media packaging。
- 是否承诺 offline portability。
- 如何区分 `web-evidence.json` 中的 static compatibility output 与 Player App output。
- 是否保留 compatibility adapter 作为 fallback。

推荐结论倾向：Phase 7 应定义 dedicated app bundler contract，但先保持 local-only。
offline asset strategy 可以做 alpha limitation，不必一次承诺完整 portable app。

推荐方式：用 `superpowers:brainstorming`。这是开放架构设计题，需要比较 bundle
shape，而不是用 grilling 一步步逼问。

### 7. CLI Install, Invocation, And Pure JSON Path

**核心问题**：alpha 用户和 agent 该用什么命令可靠调用 Cadenza？

Phase 6 的 `pnpm cadenza ... --json` 已能表达稳定 JSON summary，但 package-manager
script banner 可能污染 stdout。Phase 7 如果要面对用户，就必须明确 human command
和 machine command 的差异。

候选方向：

- 继续 repo-local invocation，但文档要求 `pnpm --silent cadenza` 用于 machine output。
- 生成 local binary wrapper，避免 package-manager stdout 干扰。
- 引入 package `bin` posture，但仍不 npm publish。
- 明确 npm publication deferred。

推荐结论倾向：Phase 7 先冻结 **alpha-safe local invocation**，不急着 npm publish。
同时必须有 test-backed pure JSON path，不能要求 agent 知道 pnpm banner 细节。

推荐方式：用 `grill-with-docs`。这主要是 public contract 和 docs truthfulness 问题。

### 8. Canonical Deck Identity, Starters, And Demo Material

**核心问题**：潜在用户第一次看到的是哪份 deck，它代表 Cadenza 的什么能力？

Phase 6.5 已经把 canonical selector 收到 `cadenza-alpha-readiness-talk`，但 Phase 7
还需要决定：

- canonical deck 是 product demo、technical talk starter，还是 alpha readiness
  artifact？
- 是否需要更小的 starter deck，让用户先跑通 preview/export？
- Player App 中显示的 deck title、speaker metadata、chapter identity 是否全部来自
  deck module metadata？
- 是否允许 config display override，还是继续坚持 authored deck metadata 是 canonical
  identity？

推荐结论倾向：canonical deck 继续由 deck module metadata 拥有身份；config 只做
selector/path shortcut。可以新增小 starter，但不要让 alias 或 filename 发明 manifest
identity。

推荐方式：先用 `grill-with-docs` 固定术语和 identity authority；如需设计 demo
material，再用 `superpowers:brainstorming` 比较 starter shapes。

### 9. Diagnostics, Readiness, And Progress Model

**核心问题**：Player App、CLI、export evidence、agent repair 是否共享同一套反馈语言？

Phase 7 Player App 会暴露 readiness、diagnostics、export metadata。此时要决定：

- diagnostics 是只读 summary，还是有 live updates？
- readiness 是 deck runtime state、resource state，还是 export state？
- 是否需要 JSONL diagnostic event stream？
- 是否需要 cancellation/progress protocol？
- interactive prompts 是否进入 alpha，还是继续 no-prompt deterministic behavior？

推荐结论倾向：Phase 7 可以先设计 shared diagnostic/readiness model，但不急着冻结
JSONL streaming protocol。只有当 Player App preview/export 出现长任务、取消、实时
progress 的真实需求，才把 JSONL promotion 变成 Freeze Candidate。

推荐方式：用 `superpowers:brainstorming`。如果讨论走向 public protocol，则切换到
`grill-with-docs` 审查字段命名、stdout/stderr、exit code 和 evidence semantics。

### 10. Evidence Gates And Visual Regression Strategy

**核心问题**：哪些证据足以支撑 Phase 7 的 alpha claim？

Phase 6 主要依靠 semantic browser smoke、manifest/evidence、structured diagnostics。
Phase 7 的 Player App 是视觉产品面，可能需要更强 gate，但 pixel-level checks 也可能
脆弱。需要讨论：

- semantic browser smoke 是否仍是 primary oracle？
- screenshot/pixel diff 是否只是 supplemental，还是成为 release gate？
- app-based web evidence 应记录哪些 Player App provenance？
- MP4 evidence 是否需要更强 media checks？
- `inspect` 是否需要理解 Player App export evidence？

推荐结论倾向：继续让 semantic checks 作为 primary oracle；对关键 first viewport 和
layout regressions 增加有限 screenshot/pixel supplemental checks。不要把 pixel parity
做成广泛跨平台 contract。

推荐方式：先用 `superpowers:brainstorming` 比较 evidence strategy，再用 `grill-me`
逐项问：“这个 gate 失败时是否阻塞 alpha？”

### 11. Config Surface Expansion

**核心问题**：Phase 7 是否要扩展 `cadenza.config.ts`？

Phase 6 的 config 极小：deck aliases、`output.root`、`export.defaultFormats`。Phase 7
可能需要 `preview`、`playerApp`、`web`、`renderer`、`diagnostics`、`experimental`。
这些 key 一旦出现在 alpha docs，就会变成 public-ish surface。

推荐结论倾向：只加入 Phase 7 必须的 additive keys。`hosted`、`cloud`、plugin
registry、interactive init、migration tooling 应继续 deferred，除非 alpha workflow
真的被阻塞。

推荐方式：用 `grill-with-docs` 一项一项问：“这是 alpha 用户必须配置，还是内部实现
可以默认推导？”不要一开始用大 config brainstorming，否则容易发散出半个产品平台。

### 12. Fresh-Project Dogfood Harness

**核心问题**：Phase 7 的 alpha workflow 是否能在 Cadenza monorepo 外跑通？

这个 topic 很重要，但不建议过早讨论细节。它依赖前面的 install posture、canonical
deck/story、Player App export、evidence gates。等这些初步收束后，再定义 dogfood：

- 一个 Cadenza workspace 外的 sample project。
- realistic `cadenza.config.ts`。
- preview Player App。
- app-based web export。
- MP4 export。
- inspect manifest/evidence。
- pure JSON machine invocation。
- docs path 从 fresh checkout 到成功 artifact。

推荐结论倾向：Phase 7 应至少有 fresh-project dogfood route，除非 maintainer 明确把
它降级为 documented alpha non-goal。没有这个路径，public alpha claim 会显得太像
monorepo fixture success。

推荐方式：先用 `superpowers:brainstorming` 设计 dogfood shape，再用 `grill-me`
模拟真实用户失败路径：依赖安装失败、browser prerequisite 缺失、config 写错、MP4
renderer failure、JSON output 被污染、web artifact 打不开。

## Suggested Session Plan

为了让讨论不变成一次超长会议，建议拆成三轮。

### Round 1 - Public Promise And Scope

目标：快速收束最宏观、最容易有结论的问题。

Topics:

1. Alpha claim boundary and audience promise。
2. Phase 7 success slice and non-goals。
3. CLI install, invocation, and pure JSON path。

输出：Phase 7 可以承诺什么、不能承诺什么、用户/agent 如何调用。

### Round 2 - Player App Product And Runtime

目标：把用户看见的产品面和内部 runtime boundary 对齐。

Topics:

1. Player App role and UI / App Design direction。
2. Player App package boundary and `preview-remotion` transition。
3. Visual-fidelity export posture。
4. App-based web export and bundler contract。

输出：Player App 是什么、在哪个 package、如何服务 preview/export、web/MP4 视觉
承诺到什么程度。

### Round 3 - Alpha Evidence And Dogfood

目标：把 alpha claim 落到可以验证、可以 review 的证据。

Topics:

1. Canonical deck identity, starters, and demo material。
2. Diagnostics, readiness, and progress model。
3. Evidence gates and visual regression strategy。
4. Config surface expansion。
5. Fresh-project dogfood harness。

输出：Phase 7 Stage A specs 可以使用的 Freeze Candidates、test matrix seeds、
evidence expectations 和 WIP deferrals。

## Skill Selection Cheat Sheet

- `superpowers:brainstorming`: 用于开放设计空间，尤其是 UI/App Design、Player App
  runtime、web bundler、visual-fidelity、dogfood shape。它的价值是提出 2-3 个方案
  和 tradeoffs。
- `grill-with-docs`: 用于 public contract、术语、docs truthfulness、package/config
  surface、release wording。它的价值是防止 alpha 文案和 contract 悄悄 overclaim。
- `grill-me`: 用于已有候选方案后的压力测试。它的价值是把“听起来合理”的方案推到
  failure scenarios 里，看是否仍然成立。

## Recommended Next Prompt

```text
请作为 Cadenza Phase 7 pre-Architect discussion partner，读取
QA/phase7-pre-architect-brainstorming-topics.md、
QA/phase7-pre-architect-brainstorming-decisions.md 和
wip/next-phases/phase-7-player-app-alpha-roadmap.md；先从 Round 1 开始，使用
superpowers:brainstorming 与 grill-with-docs 的方式，一次只问一个关键问题，目标是
收束 alpha claim boundary、Phase 7 success slice / non-goals、CLI install /
invocation / pure JSON path；每讨论完一个 topic，就立刻更新
QA/phase7-pre-architect-brainstorming-decisions.md 中对应 section 的 Status、
Consensus decision、Rationale、Stage A implications 和 Updated 字段；只做讨论与
决策记录，不写 spec、不冻结 contract、不改 packages 源码。
```
