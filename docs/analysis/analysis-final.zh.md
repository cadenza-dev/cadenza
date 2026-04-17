# **基于 React 与 Remotion 生态的 AI 驱动演示文稿框架 — 最终分析报告**

> **版本定位**：v1.0（整合版）
> **日期**：2026-04-17
> **受众**：潜在开源贡献者与技术社区
> **风格**：工程备忘录式，结论先行、条件化表达、显式风险
> **整合来源**：`analysis-v0.1.md`（产品叙事 + AI 失控与 Remotion 范式冲突论述）+ `analysis-v0.2.md`（架构收束：typed API / skills / TSX-first / render-safe layer）+ 本版补充（License、compiler 未决问题、AI-consumer 赛道边界、Risk Register、Go/No-go 决策点）

---

## **0. Executive Summary**

**核心判断**：市场上存在一个真实但狭窄的空白 — **React 原生 × 高动画上限 × 完整 presentation 语义 × AI agent 友好**。这四个条件同时满足的产品，目前没有。基于 Remotion 构建该产品在技术上可行，但存在若干**需在 Phase 0 回答的前置问题**。如果不先把这些问题回答清楚，项目很容易退化为 "Slidev for React" 或 "另一个 Remotion 样板"。

**可行性分档评估**：

| 形态 | 可行性评分 | 成立的核心前置条件 |
| :---- | :---- | :---- |
| 开源项目（独立 OSS） | 65–70% | state-to-timeline compiler 设计可交付；受众收窄到"写技术演讲的开发者"；放弃通用 AI deck 赛道 |
| 商业产品（SaaS） | 30–40% | 需要与 Remotion 官方达成 License 合作；需要补齐协作 / 模板 / 云渲染 / 批注等红海功能；PMF 路径长 |
| 双模型（OSS 核心 + 托管云渲染商业层） | 50–60% | 上述两项都要做，但可以顺序实现：先开源 PMF，再加托管 |

**最具战略合理性的形态**：**第三种**。先以高质量开源 OSS 打入开发者社区，获得 PMF 后再以托管云渲染、企业模板、协作层作为商业化出口。

**5 个必须现在就回答的 Go/No-go 决策点**：

1. **主受众画像**：是"写技术演讲的开发者与技术内容创作者"，还是"让 AI 做 deck 的业务用户"？这决定 90% 的后续取舍。
2. **State-to-Timeline Compiler 的核心设计**：能否在 Phase 0 内交付一份专门的技术设计文档，讲清楚 discrete state ↔ continuous timeline 的映射算法与边界情形？
3. **Remotion License**：计划商业化就必须前置与 Remotion 官方沟通授权方式（Remotion License 对公司规模有阶梯）。是否能在 Phase 1 启动前完成？
4. **开源与商业化比例**：是"OSS 为主 + 托管云渲染商业层"，还是"直接做商业产品"？两者的代码架构、社区建设节奏、融资叙事完全不同。
5. **与 Remotion 官方的关系**：合作、独立、还是潜在竞争？如果官方未来加码 AI deck 领域（目前仅做 motion graphics），本项目是否仍有差异化空间？

本报告其余章节沿着 v0.2 的架构主线，把 v0.1 未被充分吸纳的关键论述回收进来，并显式补充上述决策点背后的证据与取舍。

---

## **1. 生态位与问题定义**

**本节结论**：市场不缺"写 slides 的工具"，也不缺"做复杂动画的工具"，更不缺"让 AI 生成 deck 的工具"。真正的空白在于**四个条件同时满足**的产品，而本项目正好切中这块空白。但必须与两条不同轨道上的竞争者做清晰切割：Slidev 代表的 dev-first slides 轨道，以及 Gamma/Tome 代表的 AI-consumer deck 轨道。

### **1.1 dev-first 代码驱动演示工具的现状**

| 框架 | 核心技术栈 | 关键优势 | 关键卡点 |
| :---- | :---- | :---- | :---- |
| [Slidev](https://sli.dev/guide/why) | Markdown + Vue + Vite | slide semantics 成熟、[AI 友好文档](https://sli.dev/guide/work-with-ai)、导出完善、社区活跃 | 深度绑定 Vue、动画上限偏向 CSS/过渡；React 生态无法无缝接入 |
| [Motion Canvas](https://motioncanvas.io/docs/presentation/) | TypeScript + Canvas | 动画物理引擎、精确帧控制、已有 `beginSlide()` 原语 | 命令式 generator 编程范式、与 DOM 生态脱钩、社区仍在补完 presentation 语义（[#213](https://github.com/motion-canvas/motion-canvas/issues/213)、[#825](https://github.com/motion-canvas/motion-canvas/issues/825)、[#1198](https://github.com/motion-canvas/motion-canvas/issues/1198)） |
| [reveal.js](https://revealjs.com/) | Vanilla JS + HTML | 历史悠久、speaker notes / fragments / PDF 导出成熟 | 动画上限有限、React 非其核心 |
| [Marp](https://marp.app/) / [Marpit](https://marpit.marp.app/directives) | Markdown | Markdown-to-slides 可移植性强 | 偏"文档式 slides"、复杂交互动效薄弱 |
| [Spectacle](https://github.com/FormidableLabs/spectacle) | React / JSX | React authoring、社区存在基础 | 导出、presenter mode、transition 稳定性长期被社区报告为痛点（[#1247](https://github.com/FormidableLabs/spectacle/issues/1247)、[#1287](https://github.com/FormidableLabs/spectacle/issues/1287)） |
| [Remotion](https://www.remotion.dev/) | React / TSX + timeline | 渲染、导出、转场、AI 代码生成基础设施、Lambda 云渲染 | 不是完整的 presentation product layer；官方明确[不做 Lovable for Motion Graphics](https://www.remotion.dev/docs/lovable-for-motion-graphics) |

这张表说明：要么 slide 语义成熟但动画上限有限；要么 React 原生但 presentation product 层不完整；要么动画引擎强但 authoring 范式陡峭。**四个条件从未在同一个产品里凑齐过**。

### **1.2 AI-consumer deck 赛道的边界（新增）**

v0.1/v0.2 均未展开的一条线是：Gamma、Tome、Beautiful.ai、Microsoft Copilot + Designer 这类**直接面向业务用户的 AI deck 产品**。

**这条赛道与本项目的关系**：

- **产品形态不同**：它们是 SaaS + 所见即所得编辑器 + 模板库 + AI prompt 输入，目标用户是市场、销售、咨询、教育等非技术角色。
- **技术栈不同**：它们基本不依赖 Remotion 级别的动画引擎，核心在于"让非专业用户用自然语言描述 + AI 产出可用 deck"。
- **动画上限不同**：它们的动画通常止步于 CSS 过渡 + 模板切换，不追求电影级 motion。
- **导出能力不同**：主要产出 web deck + PPTX + PDF，视频导出并非核心。

**关键判断**：本项目**不应与这条赛道正面竞争**。理由：

1. 它们已有先发优势和充足资金（Gamma、Tome 均已完成多轮融资）；
2. 它们的目标用户对"高动画上限"没有需求（业务 deck 不需要电影级 motion）；
3. 直接竞争会让本项目被迫补齐模板市场、协作、批注、账号体系等与核心差异化无关的功能。

**Risk**：如果定位模糊，项目容易被投资人或社区期待塑造为"开源版 Gamma"，那将是一条必输的路。
**Mitigation**：Executive Summary 与 README 必须开篇明确"本项目面向写技术演讲、数据可视化、开发者内容创作者"，拒绝被错位定位。

### **1.3 四条件空白的归纳表（继承自 v0.2）**

| 条件 | Slidev | Motion Canvas | reveal.js / Marp | Spectacle | Remotion（原生） | Gamma / Tome | **拟议项目** |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| React 原生 | ✗ | 部分 | ✗ | ✓ | ✓ | 部分 | ✓ |
| 高动画上限 | 中 | 高 | 低 | 中 | 高 | 低 | 高 |
| Presentation 语义完整 | ✓ | 补完中 | ✓ | 部分 | ✗ | ✓ | ✓ |
| AI agent 友好 | 高 | 低 | 低 | 低 | 高 | 高（但面向终端用户） | 高（面向 coding agent） |

**结论**：项目存在的合理性取决于**同时命中四列**的能力。任何一列退让都会使本项目与既有竞品的边界变得模糊。

---

## **2. 为什么 AI 直接写 TSX 不够（关键论述，自 v0.1 完整回收）**

**本节结论**：如果目标只是"一次性交付一个 HTML 文件"，让 AI agent 直接裸写原生 TSX 确实能跑起来；但只要目标升级为"可持续维护、可重复修改、可跨 deck 复用、可验证、可导出"的系统，这条路径会在四个层面系统性失败。因此系统需要一层**受限的 authoring surface + render-safe layer + 修复 loop**。这层不必是"新造一门语言"，但必须是稳定可对准的接口面。

v0.2 在战略层面得出了相同结论（typed API 前置，DSL 后置），但把下面这些论据压缩了。在面向开源贡献者的最终版里，这些论据必须完整还原 —— 它们既是**为什么项目需要存在**的底层论证，也是日后与 Remotion 官方或其他 React 框架做架构对话的基本凭据。

### **2.1 输出目标不稳定**

如果没有稳定的接口面，不同 agent、不同模型、不同时间点会写出完全不同的结构：

- 有时直接把所有逻辑堆在一个庞大的单文件组件里
- 有时自己发明 step / stage 机制
- 有时直接写原生 `useCurrentFrame()`
- 有时混用 `TransitionSeries`、自定义 transition 以及大量 ad-hoc `useEffect`

这会让系统无法沉淀规范、模板、示例或自动修复策略。每一次 agent 生成都是从头开始，而不是在既有约束上演化。

**对比参考**：Slidev 的成功很大程度上源于它给 AI 提供了稳定接口 — Markdown 分隔符、YAML frontmatter、固定组件集。[Slidev 官方 AI 工作流](https://sli.dev/guide/work-with-ai) 的有效性本身就是"稳定接口 > 更长 prompt"这一判断的证据。

### **2.2 "能跑"不等于"可维护"**

当 slide 同时涉及分步展示、场景切换、自适应排版、资源加载、presenter notes、导出与运行时一致性时，单纯"让模型写 React 代码"极易走向结构失控。特别是在 Remotion 场景下，异步资源、时间轴逻辑、导出确定性会把"能跑 vs 可维护"的差距进一步拉开（详见 §3）。

AI 在前端代码生成领域的系统性缺陷已被多份独立观察记录，典型表现包括：

- **组件架构缺乏全局视野**：模型倾向于把所有逻辑堆在单一组件里，少主动抽取 custom hooks 或复合组件模式。
- **渲染生命周期误用**：为确保变量捕获，过度使用 `useMemo` / `useCallback`；或生成违反 hooks 规则的 `useEffect` 依赖数组。
- **状态边界模糊**：context 嵌套、闭包陷阱导致难以排查的重渲染。

这些问题在普通 CRUD 应用里已经足够麻烦，在带时间轴的演示场景里会被进一步放大 —— 一个错放的 `useEffect` 足以让整页动画时序失控。

### **2.3 视觉正确性难靠单测兜住**

对于业务逻辑，agent 可以通过单元测试逐步修复；但对于 slides，"正确性"的大部分含义是视觉与时序：

- 内容是否溢出、是否拥挤
- step 节奏是否合理、是否突兀
- 转场是否自然、是否出现闪烁
- 浏览器预览与 MP4 导出是否一致

这意味着系统需要的不是"更长的 prompt"，而是：

1. **受约束的 authoring surface**：把"乱写"的空间提前收敛掉
2. **可重复的运行时验证**：每次生成后自动跑一轮结构化检查
3. **清晰的失败信号**：让 agent 知道下一轮需要修什么

**Risk**：视觉正确性完全自动化几乎不可能 —— `Playwright` 截图对比、`overflow` 检测都需要真实浏览器测量，算力成本和 flakiness 都不低。
**Mitigation**：把验证分成两层 —— **编译期静态检查**（typed API 结构、props、资源引用）务必做全；**运行时视觉检查**（overflow、density、timing）先做最小可用版本，允许人工干预。

### **2.4 结论：需要约束，但不必是重 DSL**

v0.1 原始结论是"需要防御性组件沙箱"，v0.2 把它进一步精确化为"受限 authoring surface + render-safe layer + 修复 loop"。最终版沿用 v0.2 判断：

> **agent 确实需要一个稳定的约束层。但这个约束层的最早形态不应是重 DSL，而应是一个薄型 typed API（TS DSL）+ render-safe component layer + 可重复的 validation/repair loop。**

DSL 真正值得引入的时机见 §6；在此之前，一切努力先投入到让 typed API 与 render-safe layer 足够收敛、足够稳定。

---

## **3. Remotion 能做什么，不能做什么**

**本节结论**：Remotion 足以承担本项目的"渲染与编译底座"，包括播放、转场、动画、视频/PDF 导出、AI 代码生成基础设施。但它本身不等于完整的 slides 产品，其 timeline-first 模型与"按键翻页"这一核心交互存在**范式级冲突**，需要上层做抽象；其商业 License 模型也对项目形态有实质约束，**两版原文均未提及，本版必须补齐**。

### **3.1 Remotion 已具备的关键能力**

| 能力 | 官方入口 |
| :---- | :---- |
| 可嵌入播放 | [`@remotion/player`](https://www.remotion.dev/docs/player/player) |
| 自定义控制与全屏 | [custom controls](https://www.remotion.dev/docs/player/custom-controls) |
| 场景切换 | [`@remotion/transitions`](https://www.remotion.dev/docs/transitions/) |
| AI 代码生成 | [Generate](https://www.remotion.dev/docs/ai/generate) |
| JIT 编译预览 | [Dynamic compilation](https://www.remotion.dev/docs/ai/dynamic-compilation) |
| AI rules / system prompt / skills / MCP | [AI overview](https://www.remotion.dev/docs/ai/) |
| 编辑器基础设施 | [Editor Starter](https://www.remotion.dev/docs/editor-starter) |
| 分布式渲染 | Remotion Lambda |

从"逐页显示、转场、复杂动画、浏览器播放、视频导出"这个清单看，Remotion 的底层能力已足够强。

### **3.2 Remotion 尚未原生提供的能力**

本项目需要但 Remotion 不直接提供的 presentation product layer 包括：

- **deck 语义**：slide / step / hidden slide / chapter / outline
- **presenter 语义**：speaker notes / next slide preview / timer / 演讲者端控制
- **authoring 语义**：稳定的 authoring surface、模板化布局、局部编辑
- **validation 语义**：overflow 检查、节奏检查、资产加载安全、导出一致性

公开 issue 也印证这些缺口：[Marp Support #5573](https://github.com/remotion-dev/remotion/issues/5573) 反映"slides → Remotion" 的桥接需求；[More transition effects #3357](https://github.com/remotion-dev/remotion/issues/3357) 说明社区确实把它当 presentation-grade motion system；[Custom control in player #6306](https://github.com/remotion-dev/remotion/issues/6306) 表明播放器层尚不足以直接做完整演示系统。

### **3.3 核心范式冲突：帧连续 vs 事件离散（自 v0.1 完整回收）**

这是整个项目最底层的技术难点，v0.1 论述深入，v0.2 压缩偏轻，本版必须还原。

**传统 slides 是状态驱动的**：展示第 N 页 → 等用户事件 → 跳到第 N+1 页。一切由离散事件触发。

**Remotion 是帧驱动的**：一切围绕 timeline 上的确定性计算展开，所有动画（`spring`、`interpolate`）都强依赖 `useCurrentFrame()`。为用 Remotion 模拟 slides，必须：

1. 为每一页规划起止帧
2. 在特定帧暂停，等待事件，恢复播放进入转场
3. 整个 deck 的 timeline 必须提前算好

**这会引发三个具体问题**：

1. **精度敏感**：`pause()` 晚一帧用户就看到下一页闪烁（[Flickering](https://www.remotion.dev/docs/flickering)）。浏览器多进程 compositor lag 会把问题进一步放大。
2. **可维护性破碎**：任何一页插入或删除，后续全部绝对帧序号都要重算。
3. **agent 友好度塌陷**：要求 LLM 精准规划全局时间线、手工维护帧坐标，极易出错。

**这是 typed API + state-to-timeline compiler 要解决的核心问题**，§4 会展开。

### **3.4 多线程渲染安全原则（自 v0.1 回收）**

为支持 Remotion Lambda 的多线程并发渲染，Remotion 引擎要求所有动画逻辑与真实时间、异步状态**解耦**。如果组件包含：

- 由异步数据加载触发的非确定性状态
- 不受控的 `setTimeout` 延时
- 依赖外部 clock 的副作用

在多线程打包时会出现**帧顺序错乱与闪烁**。规避方式是使用 `delayRender` / `continueRender` 冻结引擎直到资产就绪，或强制 `--concurrency=1`（后者丧失云端渲染性能优势）。

**对本项目的含义**：agent 在自由生成代码时大概率踩进这些坑。因此 `render-safe component layer`（§4.2）的设计初衷之一就是**把这些安全性封装到受控组件内部**，让 agent 根本没机会写出不安全的资产加载代码。

### **3.5 Remotion License 与商业化边界（新增，两版均缺）**

[Remotion License](https://www.remotion.dev/docs/license) 采用**分级授权**：

- 个人 / 学生 / 小团队免费使用（具体员工数上限以官方为准）
- 超过一定员工数的公司需付费授权
- Remotion Lambda（云渲染）按用量计费

**对本项目的含义**：

- **纯开源路径**：项目自身可以完全 MIT/Apache，但**终端用户如果所在公司超过 License 阈值，仍需自行向 Remotion 授权**。必须在 README 显式注明，否则会出现合规盲区。
- **商业化路径**：如果计划做托管 SaaS（例如把 Remotion Lambda 再包一层），需要和 Remotion 官方谈转售或 enterprise 协议。这**不是可以 Phase 3 再解决**的事 —— License 不清就没法定价。
- **风险**：Remotion 官方未来 License 条款变动可能改变项目经济模型。

**Risk**：Remotion License 是关键依赖，一旦条款变化或谈判失败，整个商业化路径需要重写。
**Mitigation**：

1. Phase 0 就和 Remotion 官方建立直接联系、沟通授权与合作意向；
2. 架构上保留 renderer 抽象接口，让底层引擎**原则上可替换**（虽然短期内没有等价替代品）；
3. 在 README 和贡献者指南里明确 License 传递义务。
**Unknown**：Remotion 官方未来 3–5 年是否会自己进入 AI deck / slides 产品？若进入，本项目如何差异化？

### **3.6 关键判断**

不是"Remotion 能替代 PowerPoint"，也不是"套个壳就有完整 slides 系统"。准确说法是：

> **Remotion 足以作为 slides 系统的 runtime / rendering / export backbone，但 presentation product layer、state-to-timeline 抽象层、License 边界必须由上层项目补齐。这正是本项目存在的理由。**

---

## **4. 核心架构：Typed API + Render-Safe Layer**

**本节结论**：Phase 1 最高优先级的工程投入，是**薄型 typed API（TS DSL）+ render-safe component layer**。前者让 agent 与作者都有稳定对准点，后者把 Remotion 的底层陷阱收敛到受控组件里。两者之间由 **state-to-timeline compiler** 承接，把离散 slide/step 状态映射到连续 timeline —— 这是整个项目最深的技术赌注，两版原文均提到但都未展开，本节给出具体设计约束与未决问题。

### **4.1 Typed API 前置的论证（自 v0.2 继承）**

**为什么 typed API 要在第一阶段就出现**：

1. 输出风格发散无法沉淀规范
2. 无法稳定做静态检查与自动修复
3. 后续很难再补 IR / MDX / 编辑器 / 局部编辑能力

**typed API 是什么 —— 也是什么不是**：

- ✓ 以 slides 语义为核心的 React/TypeScript 封装层
- ✓ agent 与人类开发者都能稳定对准的接口面
- ✓ 把离散演示语义映射到底层 Remotion timeline 的适配层
- ✗ 不是一套庞大的 DSL
- ✗ 不是完整可视化语法
- ✗ 不是试图抽象所有动效的新语言

**首批暴露的原语**：

```typescript
Deck
  Slide
    Step
    Transition
    Notes
Theme tokens
Duration / timing tokens
Layout slots
```

**三条设计原则**：

- **(a) 薄而硬**：只抽象稳定的 presentation semantics，不抢跑去抽象所有视觉与动画细节。
- **(b) 默认路径，而非唯一路径**：系统保留 raw React / raw Remotion 的 escape hatch。typed API 是推荐路径，不是阻断创新的强制边界。
- **(c) 编译目标清晰**：typed API 的主要价值不是"语法更好看"，而是让系统内部稳定产生 runtime state machine、slide/step map、timeline mapping、validation hooks、presenter metadata。

### **4.2 Render-Safe Component Layer（自 v0.2 继承并扩展）**

这是 v0.2 引入的关键概念，用一句话定义：

> **把 Remotion 语境下常见的"异步陷阱、资产加载、导出时序、视觉闪烁"等不安全模式，收敛到一组受控组件中，让 agent 在生成代码时无法绕过安全准则。**

首批 render-safe 组件的职责清单：

| 组件 | 收敛的不安全模式 |
| :---- | :---- |
| `<SafeImage>` | 图片加载完成前自动 `delayRender`；加载失败有明确错误路径 |
| `<SafeFont>` | 字体就绪前不渲染文本；避免 FOUT/FOIT 导致的闪烁 |
| `<SafeVideo>` | 视频资源预加载；metadata 就绪前不播放 |
| `<TypographyBox>` | 内置 overflow 检测；超出容器时触发 auto-fit 或报错 |
| `<MediaFrame>` | 统一媒体容器，处理 aspect ratio / poster / 导出快照 |
| `<ContentSlot>` | 布局槽位，带 density / readability 启发式 |

**关键设计取舍**：

- render-safe 不等于"禁止 raw React"。它是**默认路径**。进阶作者可以 escape hatch 到原生 Remotion，但将自行承担风险。
- render-safe 组件必须有**清晰失败信号**：静默 fallback 会让 agent 以为自己写对了。宁可抛错，也不要掩盖问题。
- render-safe 组件的边界应尽量**正交**：`<SafeImage>` 不应假设某种布局；`<TypographyBox>` 不应假设媒体上下文。

### **4.3 State-to-Timeline Compiler：核心技术赌注（新增关键章节）**

v0.1 和 v0.2 都提到"状态-帧编译器"或"state-to-timeline compiler"，但都停留在一句话。对面向开源贡献者的最终版，这一层**必须讲清楚其边界问题与未决难点**，否则就是把最深的坑留给后人。

**核心职责**：

1. 遍历整个 deck 组件树，收集每个 slide 的时长声明与 step 声明
2. 生成一张内部全局 timeline map：`slideId → [entry frame, exit frame]`
3. 把 step 状态（当前第几步）映射为 timeline 上的子区间
4. 提供 runtime API：`goto(slideId, stepIndex)`、`next()`、`previous()` → 精确 `seekTo(frame)`

**已知难点与未决问题**：

| 难点 | 问题描述 | 初步思路 |
| :---- | :---- | :---- |
| **变长 step** | 某些 step 时长依赖用户交互（等待点击），而非固定时间 | 把 step 分为"定长"与"wait-for-event"两类；后者在 timeline 上占据可扩展区间，runtime 动态扩缩 |
| **中途跳转** | 用户翻页中途按"下一页"，当前转场未完成怎么办？ | 定义三种策略：`finish-then-advance`、`cut-to-next`、`queue-next`；默认 `cut-to-next`，作者可配置 |
| **异步资源对齐** | 下一页资源未就绪时按下一页，是阻塞还是降级？ | 配合 `<SafeImage>` 等组件的 `delayRender` 状态；提供 loading overlay |
| **overlap 转场** | `TransitionSeries` 的 transition 会 overlap 两页，state machine 如何表示"处于转场中"？ | 引入第三种状态 `in-transition(fromSlide, toSlide, progress)` |
| **倒播与 seek** | 用户按返回键或拖动进度条时，中间跳过的 step 状态如何回放？ | 区分"视觉 seek"（直接跳）与"逻辑回放"（逐步 replay）；默认视觉 seek |
| **嵌套 deck** | 未来支持 deck 嵌套时，timeline 如何组合？ | 作为 Phase 2+ 问题；Phase 1 不支持嵌套 |

**Risk**：state-to-timeline compiler 是整个项目的技术核心。若其设计有严重 bug 或抽象泄漏，上层所有 typed API 都会崩。
**Mitigation**：Phase 0 就输出一份独立的 `compiler-design.md`，把上表每一行的决策、边界情形、测试用例写清楚。先做 compiler，再做 typed API。
**Unknown**：实际使用中会涌现多少边界情形是当前设计没覆盖的？这需要 alpha 用户反馈才能确定。

### **4.4 运行时播放器**

基于 `@remotion/player` 封装，提供：

- 键盘翻页（方向键、空格）
- 点击翻页（可配置区域）
- 全屏切换（沿用 `doubleClickToFullscreen`）
- step 前进/后退
- Presenter metadata 暴露（current slide / step / elapsed）
- 扩展点：对接 speaker view（§7 Phase 3）

---

## **5. AI 集成策略：Skills 前置，MCP 后置**

**本节结论**：第一阶段的 AI 投入应优先建设 skills / instructions / system prompt，**不急于 MCP**。MCP 在动态检索、结构化工具、跨 IDE 复用出现明确需求后再引入。这一判断沿用 v0.2 的战略收束，本节补充面向开源贡献者的解释。

### **5.1 Skill 与 MCP 的职责分层**

- [**Skills / instructions / memory**](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) 解决的是 **"agent 应该怎么做"** —— 品味、规范、约束、修复流程
- [**MCP**](https://modelcontextprotocol.io/docs/learn/architecture) 解决的是 **"agent 能访问什么数据和动作"** —— 资源、工具、prompts 的标准化暴露层

它们是并列关系，不是替代关系。实际工程中，skills 往往先用，MCP 在规模/复用需要时加入。

### **5.2 为什么 Phase 1 skill 比 MCP ROI 更高**

- 早期最大风险不是"agent 接不上外部工具"，而是"agent 会不会稳定写对 slides"
- skill / system prompt 的投入可以直接改善生成质量，**短闭环反馈明显**
- MCP server 维护成本不低（跨 IDE 兼容、版本化、鉴权），而第一阶段文档量与模板量尚未上规模

**与 Remotion 官方路线一致**：官方同时提供 [skills](https://www.remotion.dev/docs/ai/skills) 和 [system prompt](https://www.remotion.dev/docs/ai/system-prompt)，[MCP](https://www.remotion.dev/docs/ai/mcp) 作为并行能力而非唯一入口。

### **5.3 推荐的三阶段引入节奏**

| 阶段 | 能力 | 触发条件 |
| :---- | :---- | :---- |
| Phase 1 | AI-ready docs + system prompt + skill pack + project instructions | 默认就做 |
| Phase 2（可选） | 只读 MCP（resources + prompts） | 文档/模板量上规模、普通 Markdown 注入不够用 |
| Phase 3（条件成立后） | tool-based MCP（`validate_deck` / `render_preview` / `inspect_composition`） | 多 IDE / 多 agent 共享能力面、需要结构化动作 |

### **5.4 第一阶段 skill pack 推荐清单**

- `layout-composition`：布局组合与密度控制
- `motion-transitions`：转场选型与节奏建议
- `speaker-notes`：speaker notes 语气与信息密度
- `data-viz-slides`：数据可视化页面的生成与约束
- `brand-qa`：品牌一致性检查
- `render-debugging`：常见 flickering / 资产加载问题的定位与修复
- `render-safe-components`：render-safe 组件使用规范与 anti-patterns

### **5.5 一句话原则**

> **把"品味、规则、流程"放进 skills/instructions；把"动态数据、结构化检索、跨工具动作"放进 MCP。**

---

## **6. Authoring 策略：TSX-first, Schema-assisted, DSL-last**

**本节结论**：今天的 LLM 已经能直接写可用 TSX/JSX。Phase 1 让 agent 直接生成 typed API 风格的 TSX，给它稳定接口面与修复闭环即可。JSON / MDX 是辅助介质而非替代介质。DSL 只在明确需求出现后才引入；未来若需引入，推荐 **MDX + 受限组件层 + Schema IR** 的双层而非全新文本 DSL。

### **6.1 为什么 TSX-first 是可行的**

Remotion 官方已显式支持 LLM 直接生成 TSX 的工作流：

- [Generate Remotion code using LLMs](https://www.remotion.dev/docs/ai/generate)
- [Dynamic compilation](https://www.remotion.dev/docs/ai/dynamic-compilation)
- [AI SaaS template](https://www.remotion.dev/docs/ai/ai-saas-template)

结合 §4 的 typed API，agent 不是在写 raw Remotion，而是在写 **typed-API-constrained TSX**。这大幅降低了失控概率。

### **6.2 JSON / MDX 各自的能力边界**

**JSON / Schema 适合**：

- deck metadata / slide 结构 / theme tokens / asset refs / validation contract

**JSON / Schema 不适合**：

- 复杂动画实现、高自由度布局、需要 React 组件组合的最终渲染层

**MDX 适合**：

- 人类可读可写的内容层
- 局部手工编辑层
- text-heavy slides / notes / documentation-first deck 的 authoring

**MDX 不是复杂 motion system 的最佳最终执行格式**。但它是优秀的"中间介质 + 内容层"。

### **6.3 DSL 真正必要的时机**

DSL 不是因为"模型不会写 TSX"才需要，而是出现以下需求时才值得引入：

1. 需要稳定的局部编辑，而不是整页重写
2. 需要强校验、强审计、多租户约束
3. 需要可视化编辑器与结构化 diff/merge
4. 需要跨渲染器或跨格式导入导出
5. 需要非程序员长期维护 deck

**在这些需求未成为主矛盾前，过早引入 DSL 只会增加编译层和失败面**。

### **6.4 未来如果需要 DSL，推荐形式**

两层而非一层：

1. **人类层**：MDX / Markdown + 受限组件库 + 少量 frontmatter
2. **系统层**：Zod / JSON Schema IR

最终运行时仍然编译到 React / TSX / Remotion。

**好处**：人类可读可写；agent 容易生成和校验；组件白名单容易做；失败时可分层处理 authoring / IR / renderer。

### **6.5 总原则**

> **先做代码生成系统，不要一开始就做语言设计项目。**

---

## **7. 分阶段产品路线图**

**本节结论**：沿用 v0.2 的四阶段结构，但增加 **Phase 0（技术前置）**，收窄 Phase 1 的 MVP 范围，裁剪 Phase 3/4 中的红海功能。路线图必须**可执行、可停止、可转向** —— 每个阶段都明确退出条件与 Go/No-go 检查点。

### **Phase 0：技术前置（新增，Phase 1 启动前必须完成）**

**目标**：回答 §0 的 5 个 Go/No-go 决策点中最紧迫的两个 —— compiler 设计与 License 谈判。

**交付物**：

1. **`compiler-design.md`**：state-to-timeline compiler 的独立技术设计文档，覆盖 §4.3 列出的 6 个已知难点的每一项决策、边界情形、测试用例
2. **Remotion License 沟通纪要**：与 Remotion 官方建立联系，确认授权模式、是否允许商业化二次封装、Lambda 转售是否可谈
3. **受众画像声明**：README 草案明确"本项目面向谁、不面向谁"
4. **MVP scope letter of intent**：Phase 1 要交付什么、不交付什么

**退出条件**：上述 4 份交付物通过核心贡献者评审。

### **Phase 1：核心框架与 typed API（MVP，收窄）**

**目标**：建立最小可用的 presentation semantics adapter。**不追求覆盖所有 presentation 功能**。

1. **薄型 typed API (TS DSL)**：`Deck / Slide / Step / Transition / Notes / Theme` 六个原语为主
2. **state-to-timeline compiler**：按 Phase 0 设计文档实现
3. **runtime player**：键盘翻页 + 点击翻页 + 全屏 + step 前进后退 + presenter metadata
4. **escape hatch**：保留 raw Remotion 使用通道
5. **render-safe component layer**：§4.2 清单中的 6 个核心组件
6. **最小 validation loop**：编译检查 + 静态 props 检查 + 资源加载安全检查 + 基本 overflow / timing QA
7. **AI 基础设施**：AI-ready docs + system prompt + 5 个高质量 skill

**显式不做**：模板市场、协作、批注、版本历史、多设备控制、云渲染 SaaS。

**退出条件**：

- 一个由 agent 生成的 30 页技术演讲可以稳定运行并导出 MP4
- 5 位外部 alpha 用户完成端到端使用反馈
- typed API 的公开接口在 1 个月内无 breaking change

### **Phase 2：AI authoring 能力增强**

**目标**：让 agent 稳定产出符合规范的 deck。

1. AI-ready docs 与项目级 instructions 持续迭代
2. skill pack 扩展到 10+ 个
3. compile → error → repair loop 自动化
4. 按需引入薄 IR（slide ids / layout kind / theme tokens / notes / asset refs / timing tokens）
5. **可选**：只读 MCP（resources + prompts），当文档/模板量上规模时引入

**退出条件**：alpha 用户的"从零到可用 deck"平均生成轮次 ≤ 3 轮。

### **Phase 3：presentation product layer 补齐（裁剪版）**

**原 v0.2 清单被保留的**：

1. 本地控制面与 presenter metadata：next slide preview / timer / notes / presenter-side controls
2. Hidden slides / chapter / overview / deck outline
3. 更强的转场与页面模式组件
4. 数据可视化与复杂页面模板
5. 智能排版与密度控制引擎（auto-fit text / overflow prevention / density budgeting / readability heuristics）

**建议明确推迟的**：

- 模板市场（红海功能，与差异化无关）
- 协作编辑、批注、版本历史（红海功能，进入门槛极高）

**退出条件**：10+ 位开发者在真实场景完整使用并提供反馈。

### **Phase 4：导出、协作、协议层扩展（再裁剪）**

**保留**：

1. Remotion Lambda 对接与云端导出
2. `web bundle + MP4 + PDF` 稳定支持
3. 双向互动 / 多设备控制台（"演讲者模式"是这一能力最直接的产品化封装用例）
4. 明确需求出现后提供 tool-based MCP

**推迟或放弃**：

- 模板市场、批注、版本历史 —— 只有在 PMF 明确、商业化路径清晰后才值得投入

**退出条件**：取决于 PMF 状态与商业化决策（见 §9）。

---

## **8. Risk Register（新增）**

工程备忘录的必要组件。每条风险列出触发条件、缓解策略、以及明确标注"未知"的部分。

### **8.1 技术风险**

| 风险 | 触发条件 | Mitigation | Unknown |
| :---- | :---- | :---- | :---- |
| state-to-timeline compiler 设计缺陷 | 实际使用中发现抽象泄漏或严重 bug | Phase 0 输出独立设计文档；先做 compiler 再做 typed API；保留足够测试用例 | 边界情形数量与严重程度只有 alpha 阶段才能暴露 |
| render-safe layer 覆盖不全 | agent 生成代码绕过受控组件、踩到 flickering 等坑 | 组件白名单 + 静态检查 + anti-pattern skill；escape hatch 必须有清晰警告 | 新的不安全模式可能随 Remotion 升级涌现 |
| validation loop 无法规模化 | overflow / density 检查无法用低成本自动化 | 分层：编译期静态检查做全；运行时视觉检查先做最小版本，允许人工兜底 | 完全自动化视觉 QA 可能永远不可行 |
| typed API 公开接口稳定性 | alpha 阶段频繁 breaking change，生态难以沉淀 | Phase 0 就冻结首批原语的形状；内部实现可演进，公开接口谨慎变动 | — |

### **8.2 商业与 License 风险**

| 风险 | 触发条件 | Mitigation | Unknown |
| :---- | :---- | :---- | :---- |
| Remotion License 条款不利 | 未来条款变动影响商业化路径 | Phase 0 直接沟通确认；架构保留 renderer 抽象接口 | Remotion 官方未来 3–5 年 License 走向 |
| Lambda 云渲染成本模型不经济 | 托管服务毛利不足以覆盖基础设施 | 先做自部署版本；托管是 Phase 4+ 才考虑 | 使用量与单 deck 成本的真实比例 |
| 无商业化路径 | 开源但无付费转化 | 双模型：OSS 获取 PMF → 托管、企业模板、协作层商业化 | 开发者工具 OSS→商业化转化率普遍不高 |

### **8.3 定位风险**

| 风险 | 触发条件 | Mitigation | Unknown |
| :---- | :---- | :---- | :---- |
| 受众画像模糊 | 既追"写技术演讲的开发者"，又想做"AI deck for 业务用户" | README 开篇明确；拒绝被定位为"开源版 Gamma" | — |
| 被期待补齐红海功能 | 社区 / 投资人要求模板市场、协作、批注 | Phase 3/4 显式裁剪；对齐 Gamma/Tome 的分工 | 拒绝会流失多少潜在用户 |
| 开发者工具与 AI 工具定位冲突 | TSX-first 吸引开发者 vs agent-first 吸引 AI 产品化用户 | 这两者实际上兼容：typed API 是共同接口面 | 长期主导叙事由哪一方胜出 |

### **8.4 竞争风险**

| 风险 | 触发条件 | Mitigation | Unknown |
| :---- | :---- | :---- | :---- |
| Slidev 补齐 React 与 motion 能力 | Slidev 推出 React 分支或 motion 插件 | 维持"React 原生 + 电影级 motion"的双壁垒；speed to market | Slidev 团队是否有动机跨栈 |
| Remotion 官方内化 slides 产品 | 官方推出自己的 deck-layer（与 [lovable-for-motion-graphics](https://www.remotion.dev/docs/lovable-for-motion-graphics) 声明相悖） | 与官方保持沟通；保持 typed API 设计足够独立，必要时可适配其他 renderer | 官方路线是否会因市场压力转向 |
| Gamma/Tome 推出 code mode | 通用 AI deck 产品增加 developer-facing API | 聚焦技术演讲差异化；不追求通用化 | 它们是否会投入 developer 赛道 |
| 同类 OSS 项目出现 | 另一个开源团队走到了前面 | 速度优先；Phase 0–1 尽快发布获得品牌沉淀 | — |

### **8.5 组织与执行风险（新增）**

| 风险 | 触发条件 | Mitigation | Unknown |
| :---- | :---- | :---- | :---- |
| 维护者 bus factor = 1 | 项目核心由单一维护者承担 | 尽早邀请 co-maintainer；文档化关键决策 | — |
| 贡献者 onboarding 成本高 | typed API + compiler + render-safe layer 三层抽象难以快速理解 | 投入面向贡献者的架构文档；为每层提供小而完整的示例 | — |
| 社区治理真空 | 社区讨论、issue 分诊、RFC 流程缺失 | Phase 1 就建立 RFC 流程；明确 Code of Conduct 与治理边界 | — |

---

## **9. Go/No-go Decision Points**

**本节结论**：以下 5 个问题必须**现在**就回答，而不是等到 Phase 1 中期才发现方向错误。答错任何一个都会导致项目大量返工甚至失败。

### **Q1：主受众是"写技术演讲的开发者"，还是"让 AI 做 deck 的业务用户"？**

- 选前者：所有后续取舍优先 developer ergonomics、代码质量、导出保真度。MVP 功能清单按 §7 Phase 1 执行。
- 选后者：需要补齐模板库、可视化编辑器、账号体系、协作、批注。与 Gamma/Tome 正面竞争。
- **推荐答案**：前者。理由见 §1.2。
- **不回答的代价**：功能优先级混乱，团队资源双线作战。

### **Q2：state-to-timeline compiler 的核心设计能否在 Phase 0 内交付？**

- 能：Phase 1 可启动。
- 不能：项目应暂停或重新评估。**没有 compiler 就没有 typed API 的可实现性**。
- **推荐答案**：必须能。建议给 Phase 0 留 4–6 周专门投入。
- **不回答的代价**：Phase 1 中期 compiler 抽象崩溃 → 整个 typed API 重写。

### **Q3：Remotion License 谈判能否在 Phase 1 启动前完成？**

- 能：按双模型商业化路径推进。
- 不能：先走纯 OSS 路径，商业化推迟到官方态度明确后再决定。
- **推荐答案**：Phase 0 就主动联系 Remotion 团队，即使只是书面确认使用意向与边界。
- **不回答的代价**：Phase 3/4 才发现商业化路径有合规问题，回头成本极大。

### **Q4：开源与商业化的比例？**

- OSS-only：维护成本高、商业回报低，但速度快、没有合规负担。
- 商业 SaaS-only：需要前置补齐太多红海功能，PMF 路径长。
- **双模型（推荐）**：OSS 核心 + 托管云渲染、企业模板、协作层为商业化出口。先 OSS PMF，再加托管。
- **不回答的代价**：架构耦合商业化决定，等到商业化启动时已不可分离。

### **Q5：与 Remotion 官方的关系？**

- **合作**：共同推广、互引文档、possibly License 优惠。
- **独立**：各走各的，保持礼貌距离。
- **潜在竞争**：如果官方未来入局 AI deck，本项目必须有差异化壁垒。
- **推荐答案**：Phase 0 开始建立合作沟通；同时架构上保持可替换性（renderer 抽象）作为长期保险。
- **不回答的代价**：在官方态度转变时措手不及。

---

## **10. 结论与下一步**

**综合判断**：

1. **项目方向成立**。空白不是"再做一个 slides 工具"，而是"做一个以 React 和 Remotion 为底座、以 presentation semantics 为核心、以 AI agent 为重要作者的系统层"。
2. **Remotion 足够但不完整**。它可以承担 runtime / rendering / export backbone，但 presentation product layer、state-to-timeline 抽象、License 边界必须由上层项目补齐。
3. **架构主线清晰**：typed API 前置、render-safe layer 前置、skills 前置、MCP/DSL 后置、TSX-first。这是 v0.2 贡献的最有价值判断，本版完整保留。
4. **关键赌注是 state-to-timeline compiler**。它是整个项目技术可行性的核心。Phase 0 必须交付独立设计文档，否则不应启动 Phase 1。
5. **商业化路径需要前置**。Remotion License 边界、双模型商业化结构、云渲染成本模型这三件事必须在 Phase 0 有明确意向。
6. **受众画像必须收窄**。面向"写技术演讲的开发者与技术内容创作者"，不追通用 AI deck 赛道。这是本项目与 Gamma/Tome 的根本分工。
7. **路线图要可停止、可转向**。每个阶段明确退出条件；Phase 3/4 的红海功能显式裁剪，避免成为"另一个大而全但没 PMF"的项目。

**下一步建议的具体行动（按时间顺序）**：

1. **Week 1–2**：输出 `compiler-design.md` 初稿；联系 Remotion 官方沟通 License 与合作意向
2. **Week 3–4**：完成 `compiler-design.md` 评审；固化 README 中的受众声明
3. **Week 5–8**：Phase 1 MVP 工程启动；首批 typed API + render-safe layer + compiler 实现
4. **Week 9–12**：5 位外部 alpha 用户 onboarding；skill pack 第一版；validation loop v1
5. **Month 4+**：根据 alpha 反馈决定进入 Phase 2 或回到 Phase 0 修正

**本项目的最终定义**：

> **一个以 React 为 authoring surface、以 Remotion 为 runtime / rendering / export backbone、以薄型 typed API 为语义桥、以 skills 为 AI 协作入口、以 render-safe component layer 为安全底线的下一代 presentation system，面向写技术演讲与技术内容的开发者与 AI agent。**

---

## **参考资料**

### 竞品与生态

- [Why Slidev](https://sli.dev/guide/why)
- [Slidev: Work with AI](https://sli.dev/guide/work-with-ai)
- [Motion Canvas: Presentation](https://motioncanvas.io/docs/presentation/)
- [Motion Canvas issue #213: Interactive live presentation support](https://github.com/motion-canvas/motion-canvas/issues/213)
- [Motion Canvas issue #825: HTML overlay in presentation mode](https://github.com/motion-canvas/motion-canvas/issues/825)
- [Motion Canvas issue #1198: Pointer events in presentations](https://github.com/motion-canvas/motion-canvas/issues/1198)
- [reveal.js](https://revealjs.com/)
- [Marp](https://marp.app/)
- [Marpit Directives](https://marpit.marp.app/directives)
- [Spectacle repository](https://github.com/FormidableLabs/spectacle)
- [Spectacle issue #1247: Export to PowerPoint](https://github.com/FormidableLabs/spectacle/issues/1247)
- [Spectacle issue #1287: presenterMode affects transitions](https://github.com/FormidableLabs/spectacle/issues/1287)

### Remotion 官方

- [Remotion](https://www.remotion.dev/)
- [Remotion Player](https://www.remotion.dev/docs/player/player)
- [Remotion custom controls](https://www.remotion.dev/docs/player/custom-controls)
- [Remotion Transitions](https://www.remotion.dev/docs/transitions/)
- [Remotion Flickering](https://www.remotion.dev/docs/flickering)
- [Remotion AI overview](https://www.remotion.dev/docs/ai/)
- [Remotion Generate](https://www.remotion.dev/docs/ai/generate)
- [Remotion Dynamic compilation](https://www.remotion.dev/docs/ai/dynamic-compilation)
- [Remotion Skills](https://www.remotion.dev/docs/ai/skills)
- [Remotion System Prompt](https://www.remotion.dev/docs/ai/system-prompt)
- [Remotion MCP](https://www.remotion.dev/docs/ai/mcp)
- [Remotion Editor Starter](https://www.remotion.dev/docs/editor-starter)
- [Remotion License](https://www.remotion.dev/docs/license)
- [Remotion issue #5573: Marp Support](https://github.com/remotion-dev/remotion/issues/5573)
- [Remotion issue #3357: More transition effects](https://github.com/remotion-dev/remotion/issues/3357)
- [Remotion issue #6306: Custom control in player](https://github.com/remotion-dev/remotion/issues/6306)
- [Is Remotion building Lovable for Motion Graphics?](https://www.remotion.dev/docs/lovable-for-motion-graphics)

### 协议与 AI 工作流

- [Model Context Protocol: Architecture](https://modelcontextprotocol.io/docs/learn/architecture)
- [OpenAI Docs MCP](https://developers.openai.com/learn/docs-mcp)
- [GitHub Copilot: About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [MDX: What is MDX](https://mdxjs.com/docs/what-is-mdx/)

### AI-consumer deck 赛道（对照参考）

- [Gamma](https://gamma.app/)
- [Tome](https://tome.app/)
- [Beautiful.ai](https://www.beautiful.ai/)
- [Microsoft Copilot in PowerPoint](https://www.microsoft.com/en-us/microsoft-365/copilot)
