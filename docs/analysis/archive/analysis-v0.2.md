# **基于 React 与 Remotion 生态的 AI 驱动智能演示文稿框架研究与技术可行性分析**

> **v0.2 修订说明**
>
> 本版保留了 v0.1 的核心 thesis：市场上确实存在一个“高动画上限、React 原生、对 AI agent 友好”的演示框架空白。但相较于上一版，本版做了三项重要收束：
>
> 1. 将部分启发式图表和证据强度不足的推断，降级为产品判断，不再视为硬结论。
> 2. 将 `Model Context Protocol (MCP)` 从“默认应在第二阶段构建的必选项”调整为“在动态检索、结构化动作、跨 IDE 复用出现明确需求后再引入的协议层”。
> 3. 将“是否必须先制定 DSL”重构为更稳妥的判断：`TSX-first, schema-assisted, DSL-last`。与此同时，明确提出应在第一阶段就提供一个**薄型 typed API（TS DSL）**，作为 agent 和底层 Remotion 之间的稳定语义层。

## **引言**

随着大语言模型、代码代理和自动化工作流的持续演进，传统由 GUI 主导的演示文稿生产方式正在被重新定义。若一个产物能够像幻灯片那样逐页展示、响应翻页操作、支持全屏、具备必要转场和动画，那么从交付体验看，它已经构成了一种现代化的演示文稿形态。问题不在于它是不是 `.pptx`，而在于它是否能够稳定地被编写、修改、验证、演示和导出。

在这个背景下，`remotion.dev` 很自然地进入视野。Remotion 本质上是一个用 React 和 TypeScript 构建动态内容并导出视频的底层引擎，官方现在同时提供了 [`@remotion/player`](https://www.remotion.dev/docs/player/player)、[`@remotion/transitions`](https://www.remotion.dev/docs/transitions/)、[`Editor Starter`](https://www.remotion.dev/docs/editor-starter)、[AI code generation](https://www.remotion.dev/docs/ai/generate)、[skills](https://www.remotion.dev/docs/ai/skills) 和 [MCP](https://www.remotion.dev/docs/ai/mcp) 等能力。这意味着它非常像一个“渲染与编译底座”，却又尚未直接等价于完整的 presentation system。

本报告的核心问题不是“Remotion 能不能做出像 PPT 的东西”，而是：

1. 市场上是否已有等价竞品，或者类似产品分别卡在了哪里？
2. 仅借助 Remotion 本身，是否足以构建一个接近 PPT 的 slides 系统？
3. 如果能，新的项目还剩下哪些决定性的差异化空间？
4. 在 AI agent 已经足够强的前提下，系统最应该优先投入的是 `typed API`、`skills`、`MCP` 还是 `DSL`？

---

## **一、生态位判断：空白不在“有没有 slides”，而在“React + Motion + AI-Friendly Presentation System”**

当前市场上并不缺“写 slides”的工具，但最接近本项目目标的能力被拆散在几类产品中。

### **1. Slidev：slide semantics 很成熟，但技术栈和动效上限不在你的目标象限**

[Slidev](https://sli.dev/guide/why) 是当下最成熟的 developer-first slides 工具之一，强项非常明确：

- Markdown-first，authoring 体验清晰。
- Presenter Mode、主题机制、导出能力相对完善。
- 官方已经明确支持 [Work with AI](https://sli.dev/guide/work-with-ai)，说明它在 agent 友好性上走得很靠前。

但它和你的目标之间仍有几个结构性差距：

- 它深度绑定 Vue 生态，而你的目标更偏 React 原生能力和 Remotion 兼容。
- 它的强项在 slide semantics 和内容组织，不在电影级 motion 和 React 组件复用。
- 它证明了“developer-first slides”是成立的，却没有覆盖“高动画上限 + Remotion 输出 + AI 稳定协作”这个组合。

### **2. Motion Canvas：动画能力极强，但 authoring 范式和生态接入成本更高**

[Motion Canvas](https://motioncanvas.io/docs/presentation/) 已经具备很强的 presentation 气质，甚至原生就有 `beginSlide()` 和 Presentation Mode。这说明“程序化动画系统走向 live presentation”不是空想。

但它也有明显的边界：

- 它的 authoring 核心仍然更偏命令式时间流和 scene 编排，而不是 React 组件树。
- 社区仍在持续提出“更像 live presentation”的诉求，例如 [Interactive live presentation support](https://github.com/motion-canvas/motion-canvas/issues/213)、[Support for pointer events in presentations](https://github.com/motion-canvas/motion-canvas/issues/1198) 以及 [HTML overlay in presentation mode](https://github.com/motion-canvas/motion-canvas/issues/825)。
- 它更像“动画引擎长出了演示能力”，而不是“演示系统长出了动画能力”。

这使它成为一个很强的邻近参照物，但不直接等于你的产品定义。

### **3. Reveal.js / Marp / Spectacle：有的强在演示系统，有的强在 React，但都没有同时命中目标**

- [reveal.js](https://revealjs.com/) 的 speaker notes、fragments、PDF export 等演示语义很成熟，但动画和 React 生态整合不是它的主场。
- [Marp](https://marp.app/) 与 [Marpit](https://marpit.marp.app/directives) 强在 Markdown to slides 的可移植性，但更像“文档式 slides”，并不适合承载复杂交互动效。
- [Spectacle](https://github.com/FormidableLabs/spectacle) 是 React-based presentation library，但长期社区反馈依然集中在导出、presenter mode、transition/step 稳定性等问题上，例如 [PPTX export](https://github.com/FormidableLabs/spectacle/issues/1247) 和 [presenter mode 影响 transition](https://github.com/FormidableLabs/spectacle/issues/1287)。

这些工具的存在说明：要么 slide semantics 成熟但 motion 上限有限，要么 React 原生但产品层不够完整。

### **4. Remotion：它更像底层生态，而不是现成竞品**

Remotion 官方已经显著扩展了能力边界：

- 播放与交互：[Player](https://www.remotion.dev/docs/player/player)
- 场景切换：[Transitions](https://www.remotion.dev/docs/transitions/)
- AI 辅助代码生成：[Generate](https://www.remotion.dev/docs/ai/generate)
- JIT 编译预览：[Dynamic compilation](https://www.remotion.dev/docs/ai/dynamic-compilation)
- AI rules / system prompt / skills：[AI docs](https://www.remotion.dev/docs/ai/)
- 编辑器基础设施：[Editor Starter](https://www.remotion.dev/docs/editor-starter)

但 Remotion 官方也明确表示，他们并不打算自己去做直接面向最终用户的 motion graphics“Lovable”式产品，而是更愿意提供底层能力和基础设施：[Is Remotion building Lovable for Motion Graphics?](https://www.remotion.dev/docs/lovable-for-motion-graphics)

这恰好说明，本项目如果成立，最自然的定位不是“Remotion 替代品”，而是“构建在 Remotion 之上的 presentation system”。

### **5. 归纳：真正的空白是什么**

市场并不缺：

- 写 slides 的工具
- 做复杂动画的工具
- 让 AI 生成 deck 的工具

真正缺少的是一个同时满足以下四个条件的系统：

1. **React 原生**  
2. **高动画上限**  
3. **slide/presentation 语义完整**  
4. **对 AI agent 稳定友好**

这就是本项目最值得瞄准的生态位。

| 方向 | Authoring 主模型 | 强项 | 主要缺口 |
| :---- | :---- | :---- | :---- |
| Slidev | Markdown + Vue 组件 | slide semantics、导出、AI 友好文档 | React 兼容和 motion 上限不在主赛道 |
| Motion Canvas | TS/Canvas scene code | 动画与演示张力极强 | React 生态接入、authoring 范式更陡 |
| reveal.js / Marp | HTML / Markdown | 演示系统语义成熟、可移植 | 动画上限有限，React 不是核心 |
| Spectacle | React/JSX | React authoring | presentation system 与导出层仍不完整 |
| Remotion | React/TSX + timeline | 渲染、导出、动画与 AI 基础设施 | 缺少完整 deck/presenter/product 语义 |
| **拟议项目** | React/TSX + thin typed API | 在 React、motion、presentation semantics、AI ergonomics 之间做统一层 | 需要避免过早陷入重 DSL / 重协议设计 |

---

## **二、为什么不能直接让 agent 裸写 HTML/TSX**

如果目标只是做一个一次性交付的 HTML 文件，让 agent 直接生成原生 TSX/JSX 的确常常能跑起来。但只要目标升级为“可持续维护、可重复修改、可跨 deck 复用、可导出、可验证”的系统，这条路径很快就会暴露出问题。

### **1. 输出目标不稳定**

如果没有稳定的接口面，不同 agent、不同模型、不同时间点会写出完全不同的结构：

- 有时直接堆在一个大组件里
- 有时自己发明 step 机制
- 有时直接写原生 `useCurrentFrame()`
- 有时混用 `TransitionSeries`、自定义 transition 和大量 ad-hoc `useEffect`

这会让你很难沉淀规范、模板、示例和自动修复策略。

### **2. React 代码“能跑”不等于演示系统“可维护”**

当 slide 同时涉及：

- 分步展示
- 场景切换
- 自适应排版
- 资源加载
- Presenter notes
- 导出与运行时一致性

单纯“让模型写 React 代码”很容易走向结构失控。特别是在 Remotion 场景下，异步资源、时间轴逻辑和导出确定性会进一步放大问题。

### **3. 视觉正确性难以靠普通测试完全兜住**

对于业务逻辑，agent 可以通过单元测试逐步修复；但对于 slides，真正的正确性常常是：

- 是否溢出
- 是否拥挤
- step 节奏是否合理
- 转场是否突兀
- 浏览器预览与导出是否一致

这意味着系统需要的是“受约束的 authoring surface + 可验证的运行时”，而不是仅仅更长的 prompt。

### **4. 结论：需要约束，但不一定需要重 DSL**

这一点非常关键。v0.1 的一个问题是过早把“需要约束”直接等同于“需要重 DSL”。v0.2 的判断是：

> 你确实需要一个稳定的约束层，但它最早不一定是 DSL；更合理的起点是一个**薄型 typed API（TS DSL）+ 受限组件协议 + 验证与修复闭环**。

在 Remotion 语境下，这个“受限组件协议”最好进一步落实为一层 **render-safe component layer**。它不只是 API 风格约束，还意味着对资源加载、字体图片时序、异步边界和导出确定性做统一封装，避免 agent 在自由生成代码时直接踩进 flickering 或 render mismatch 这类底层坑里。

---

## **三、Remotion 能做什么，不能做什么**

Remotion 完全可以承担这个项目的“渲染底座”角色，但它本身并不等于完整的 slides 产品。

### **1. Remotion 已经具备的关键能力**

从官方文档看，Remotion 对于本项目已经提供了几块关键砖：

- 可嵌入播放：[`@remotion/player`](https://www.remotion.dev/docs/player/player)
- 可自定义控制与全屏：[custom controls](https://www.remotion.dev/docs/player/custom-controls)
- 复杂场景切换：[`@remotion/transitions`](https://www.remotion.dev/docs/transitions/)
- 代码生成和预览：[`generate`](https://www.remotion.dev/docs/ai/generate) + [`dynamic compilation`](https://www.remotion.dev/docs/ai/dynamic-compilation)
- 编辑器基础设施：[`Editor Starter`](https://www.remotion.dev/docs/editor-starter)
- AI 辅助资产：skills / system prompt / MCP

就“逐页显示、转场、复杂动画、浏览器播放、视频导出”而言，Remotion 的底层能力已经足够强。

### **2. Remotion 尚未天然提供的能力**

但这些能力本质上仍然偏底层和通用。对一个“像 PPT 的系统”来说，Remotion 缺少的不是动效，而是 presentation product layer：

- `deck` 语义：slide、step、hidden slide、chapter、outline
- `presenter` 语义：speaker notes、next slide preview、timer、演讲者控制
- `authoring` 语义：稳定的 authoring surface、模板化布局、局部编辑
- `validation` 语义：overflow 检查、节奏检查、资产加载安全、导出一致性

从公开 issue 也能看到这种边界：

- [Marp Support](https://github.com/remotion-dev/remotion/issues/5573) 反映出“slides to Remotion”的桥接需求客观存在。
- [Add more transition effects](https://github.com/remotion-dev/remotion/issues/3357) 说明社区确实在把它当作 presentation-grade motion system 使用。
- [Custom control to Remotion player](https://github.com/remotion-dev/remotion/issues/6306) 与 fullscreen / mobile 相关问题，说明播放器层还不是完整演示系统。

### **3. 关键判断**

因此最准确的说法不是：

> “仅靠 Remotion 就能直接替代 PowerPoint。”

而是：

> “Remotion 足以作为 slides 系统的 runtime/rendering/export backbone，但还需要上层补齐 presentation semantics。”

这也是为什么新项目仍然有明确存在空间。

---

## **四、v0.2 的核心架构判断：typed API 前置，重 DSL 后置**

这是本版最重要的修正。

### **1. 为什么 typed API 要在第一阶段就出现**

如果第一阶段完全放任 agent 直接面向原生 Remotion API 编写代码，系统很快会出现三个问题：

1. 输出风格发散，难以沉淀规范  
2. 无法稳定做静态检查和自动修复  
3. 后续很难再补 IR、MDX、编辑器和局部编辑能力

因此，系统需要尽早给 agent 一个稳定目标。但这个目标不必是“新语言”，而可以是一个**薄型 typed API（TS DSL）**。

### **2. 这里所说的 typed API 是什么**

它不是一套庞大的 DSL，不是完整可视化语法，也不是企图把所有动效都抽象出来的新语言。它更接近：

- 一个以 slides 语义为核心的 React/TypeScript 封装层
- 一个让 agent 和人类开发者都能稳定对准的接口面
- 一个把“离散演示语义”映射到底层 Remotion timeline 的适配层

它应该尽早暴露的内容，是那些长期稳定、真正属于 presentation system 核心的原语：

- `Deck`
- `Slide`
- `Step`
- `Transition`
- `Notes`
- `Theme tokens`
- `Duration / timing tokens`
- `Layout slots`

### **3. typed API 的设计原则**

第一阶段的 typed API 应遵守三条原则：

#### **(a) 薄而硬**

它只抽象稳定的 presentation semantics，不抢跑去抽象所有视觉和动画细节。

#### **(b) 默认路径，而非唯一路径**

系统应保留 raw React / raw Remotion 的 escape hatch。typed API 是推荐路径，不应该变成阻断创新的强制边界。

#### **(c) 编译目标清晰**

typed API 的主要价值不是“语法更好看”，而是让系统内部可以稳定地产生：

- runtime state machine
- slide/step map
- timeline mapping
- validation hooks
- presenter metadata

### **4. 为什么这比“先做 DSL”更稳**

原因很简单：一旦过早启动 DSL 设计，你就在同时解决四个问题：

- 语言设计
- parser / compiler
- authoring ergonomics
- runtime semantics

这很容易把项目变成“语言工程”，而不是“presentation system 工程”。

相反，第一阶段先做 typed API，你可以先稳定三件最重要的事：

1. agent 要对准什么写
2. runtime 如何解释 slide semantics
3. 系统如何为后续 IR / MDX / editor 留出接口

这一判断可以浓缩为一句话：

> **Phase 1 需要的是 `presentation semantics adapter`，而不是“大而全的语言系统”。**

---

## **五、AI 集成策略：skill 前置，MCP 后置**

### **1. skills / instructions 和 MCP 不是同一层能力**

在这一点上，v0.1 把两者靠得太近了。按官方定义，它们解决的是不同问题：

- `skills / instructions / memory` 解决的是“agent 应该怎么做”
- `MCP` 解决的是“agent 能访问什么数据和动作”

官方资料都支持这种分层：

- [MCP architecture](https://modelcontextprotocol.io/docs/learn/architecture)
- [Remotion AI docs](https://www.remotion.dev/docs/ai/)
- [GitHub Copilot agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [OpenAI Docs MCP](https://developers.openai.com/learn/docs-mcp)

### **2. 对本项目，第一阶段更值得做的是 skill pack**

对一个 AI 驱动的 slides 框架，早期最大的风险不是“agent 接不上外部工具”，而是“agent 会不会稳定地写对 slides”。

因此，第一阶段更高 ROI 的投入是：

- AI-ready docs
- system prompt / repository instructions
- 高质量 skill pack
- 可重复调用的验证命令

这也与 Remotion 官方路线一致：他们既提供 [skills](https://www.remotion.dev/docs/ai/skills)，也提供 [system prompt](https://www.remotion.dev/docs/ai/system-prompt)，MCP 则作为并行存在的辅助能力，而不是唯一入口。

### **3. MCP 什么时候开始变得必要**

MCP 在以下场景下会显著变得有价值：

- 文档、模板、组件示例很多，普通 Markdown 注入不够用了
- 你需要给多个 IDE / 多个 agent 暴露统一能力面
- 你需要结构化 tools，例如 `render_preview`、`validate_deck`、`list_templates`
- 你需要动态资源查询、主题 token 检索、远程资产接入

也就是说，MCP 不是“不需要”，而是**不应抢跑到 skill 之前**。

### **4. v0.2 的建议**

将路线调整为：

1. **Phase 1**：`AI-ready docs + system prompt + skill pack + project instructions`
2. **Phase 2（可选）**：只读 MCP，优先暴露 `resources + prompts`
3. **Phase 3（条件成立后）**：tool-based MCP，如 `validate_deck`、`render_preview`、`inspect_composition`

一句话原则：

> **把“品味、规则、流程”放进 skills/instructions；把“动态数据、结构化检索、跨工具动作”放进 MCP。**

---

## **六、Authoring 策略：TSX-first, schema-assisted, DSL-last**

这是本项目另一个需要明确写进路线图的判断。

### **1. 今天的大模型，已经可以直接写可用的 TSX/JSX**

在 Remotion 语境下，这不是猜测，而是官方显式支持的工作流：

- [Generate Remotion code using LLMs](https://www.remotion.dev/docs/ai/generate)
- [Dynamic compilation](https://www.remotion.dev/docs/ai/dynamic-compilation)
- [AI SaaS template](https://www.remotion.dev/docs/ai/ai-saas-template)

这说明对本项目而言，早期完全可以先让 agent 直接生成 TSX/JSX，只要你给它一个足够稳定的接口面和修复闭环。

### **2. JSON / MDX 并不是“表达能力不足”**

需要更准确地区分它们分别擅长什么：

#### **JSON / Schema**

适合做：

- deck metadata
- slide structure
- theme tokens
- asset refs
- validation contract

但不适合单独承担：

- 复杂动画实现
- 高自由度布局逻辑
- 需要表达 React 组件组合能力的最终渲染层

#### **MDX**

[MDX](https://mdxjs.com/docs/what-is-mdx/) 本质上是 Markdown + JSX，不是弱格式。它非常适合作为：

- 人类可读可写的内容层
- 局部手工编辑层
- text-heavy slides / notes / documentation-first deck 的 authoring layer

它的问题不在“表达能力弱”，而在于它并不是复杂 motion system 的最佳最终执行格式。

### **3. DSL 真正必要的时机**

DSL 不是因为“模型不会写 TSX”才需要，而是在你出现这些需求时才真正值得引入：

1. 需要稳定的局部编辑，而不是整页重写
2. 需要强校验、强审计、多租户约束
3. 需要可视化编辑器与结构化 diff/merge
4. 需要跨渲染器或跨格式导入导出
5. 需要非程序员长期维护 deck

如果这些需求尚未成为主矛盾，那么过早引入 DSL 只会增加编译层和失败面。

### **4. 如果未来确实需要 DSL，最推荐的形式是什么**

v0.2 的建议不是“新造一门文本 DSL”，而是两层：

1. **人类层**：`MDX / Markdown + 受限组件库 + 少量 frontmatter`
2. **系统层**：`Zod / JSON Schema IR`

最终运行时仍然编译到 React/TSX/Remotion。

这样做的好处是：

- 人类可读可写
- agent 容易生成和校验
- 组件白名单容易做
- 失败时可以分离处理 authoring、IR 和 renderer

因此，这一部分的总原则应明确写成：

> **先做代码生成系统，不要一开始就做语言设计项目。**

---

## **七、具有可行性的分阶段产品路线图**

基于以上修正，v0.2 将路线图调整为“typed API 前置，skills 前置，MCP/重 DSL 后置”。

### **第一阶段：核心框架与 typed API（必须项）**

目标：建立最小可用的 presentation semantics adapter。

1. **提供薄型 typed API（TS DSL）**  
   例如 `Deck / Slide / Step / Transition / Notes / Theme` 这样的核心语义原语。  

2. **实现 state-to-timeline compiler**  
   将离散的 slide / step 状态映射为内部 timeline map，但不把底层帧语义暴露给作者。  

3. **封装 runtime player**  
   基于 `@remotion/player` 实现键盘翻页、点击翻页、全屏、step 前进后退、基础 presenter metadata。  

4. **保留 raw React / Remotion escape hatch**  
   默认推荐 typed API，但允许特殊页面回退到底层实现。  

5. **构建 render-safe component layer / 受限组件协议**  
   将常见的不安全模式收敛到受控组件中，例如资产加载、字体与图片就绪、导出时序安全、基础内容容器和媒体容器，减少 agent 直接生成底层不确定逻辑的空间。  

6. **建立最小验证闭环**  
   至少包含：编译检查、静态 props 检查、资源加载安全检查、基本的 overflow / timing QA。

### **第二阶段：AI authoring 能力（优先 skills，不急于 MCP/DSL）**

目标：让 agent 稳定地产出符合规范的 deck。

1. **建设 AI-ready docs 与项目级 instructions**
2. **提供高质量 skill pack**  
   例如：`layout-composition`、`motion-transitions`、`speaker-notes`、`data-viz-slides`、`brand-qa`、`render-debugging`、`render-safe-components`
3. **建立 compile -> error -> repair loop**
4. **按需引入薄 IR**  
   只描述 `slide ids / layout kind / theme tokens / notes / asset refs / timing tokens`
5. **可选：只读 MCP**
   当文档量和模板量上来后，再增加 `resources + prompts` 型 MCP，而不是一开始就做 tools MCP。

### **第三阶段：presentation system 产品层**

目标：补齐“像 PPT”而不是“像 demo”。

1. 本地控制面与 presenter metadata：next slide preview / timer / notes / presenter-side controls
2. Hidden slides / chapter / overview / deck outline
3. 更强的转场和页面模式组件
4. 数据可视化与复杂页面模板
5. 智能排版与密度控制引擎：auto-fit text、overflow prevention、density budgeting、readability heuristics
6. 更系统的 layout / density / readability QA

### **第四阶段：导出、协作与协议层扩展**

目标：把系统从本地 authoring 工具扩展到内容分发平台。

1. 对接 Remotion Lambda 与云端导出
2. 稳定支持 `web bundle + MP4 + PDF`
3. 双向互动 / 多设备互动控制台：支持 presenter-screen 双端同步与远程控制；`演讲者模式` 是这一能力最直接、最容易产品化的封装用例
4. 在明确需求出现后提供 `tools` 型 MCP
5. 模板市场、协作、批注、版本历史

这一路线的关键变化是：

- `typed API` 不再被推迟，而是第一阶段核心
- `skills` 早于 `MCP`
- `TSX-first` 早于 `DSL-first`

---

## **八、结论**

截至 2026 年 4 月 17 日，综合官方文档、社区反馈和相邻竞品的能力边界，可以得出以下更稳健的结论：

1. 你的项目方向是成立的，且存在清晰空白，但空白并不是“再做一个 slides 工具”，而是“做一个以 React 和 Remotion 为底座、以 presentation semantics 为核心、以 AI agent 为重要作者的系统层”。
2. Remotion 足以承担底层渲染、播放、转场、导出和 AI 代码生成的基础设施角色，但它本身并不等于完整的演示文稿产品。
3. 项目早期最应该优先投入的，不是 MCP，也不是重 DSL，而是一个**薄型 typed API（TS DSL）**，它是 agent、作者与底层 runtime 之间最稳定的桥。
4. 除了 typed API，第一阶段还应尽早建立 `render-safe component layer`，把资源加载、导出确定性和常见布局安全边界提前收敛到受控组件层。
5. AI 集成上，应优先构建 `AI-ready docs + system prompt + skills + validation loop`；MCP 应在动态检索和结构化动作真正成为瓶颈后再引入。
6. Authoring 策略上，应采用 `TSX-first, schema-assisted, DSL-last`。未来若确实需要更强的结构化 authoring，再引入 `MDX/Markdown + 受限组件层` 与 `Schema IR` 的双层设计。
7. 产品层能力不应只停留在“能播放”的 deck 上，后续还应补齐智能排版、双向互动和多设备控制，其中 `演讲者模式` 可以被视为双端控制面的一个典型封装实践。

因此，本项目最有价值的定义不应是“用 Remotion 做 PPT”，而应是：

> **构建一个以 React 为 authoring surface、以 Remotion 为 runtime/rendering backbone、以 typed API 为语义桥、以 skills 为 AI 协作入口的下一代 presentation system。**

---

## **参考资料**

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
- [Remotion issue #5573: Marp Support](https://github.com/remotion-dev/remotion/issues/5573)
- [Remotion issue #3357: More transition effects](https://github.com/remotion-dev/remotion/issues/3357)
- [Remotion issue #6306: Custom control in player](https://github.com/remotion-dev/remotion/issues/6306)
- [Is Remotion building Lovable for Motion Graphics?](https://www.remotion.dev/docs/lovable-for-motion-graphics)
- [Model Context Protocol: Architecture](https://modelcontextprotocol.io/docs/learn/architecture)
- [OpenAI Docs MCP](https://developers.openai.com/learn/docs-mcp)
- [GitHub Copilot: About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [MDX: What is MDX](https://mdxjs.com/docs/what-is-mdx/)
