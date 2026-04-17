# **Cadenza State-to-Timeline Compiler — 技术设计文档 (v0.1 草案)**

> **状态**：Draft, pending Phase 0 review
> **作者**：Eden Wang (`@DrEden33773`)
> **评审标准**：Phase 0 核心贡献者评审通过后方可启动 Phase 1
> **关联文档**：
>
> - [`docs/analysis/analysis-final.md`](../analysis/analysis-final.md) §4.3（问题来源与约束）
> - [`docs/adr/0002-typed-api-first-architecture.md`](../adr/0002-typed-api-first-architecture.md)（架构决策）

---

## **0. 为什么需要这份文档**

Cadenza 的核心技术赌注，是能否把**离散的演示状态**（"现在展示第 N 页第 M 步"）稳定地映射到 **Remotion 的连续帧时间线** 上。这是整个项目可行性的瓶颈。

如果 compiler 的抽象存在泄漏，上层所有 typed API 都会崩：

- 作者看到 slide / step 的语义
- 底层却要处理帧坐标、转场 overlap、异步资产、用户交互打断
- 两者之间的翻译层一旦出错，作者看到的是"动画莫名闪烁 / 翻页延迟 / 导出与运行时不一致"

本文档的目的：**在写第一行运行时代码之前，把翻译层的每一条规则、每一个边界情形、每一种失败模式都显式化**。任何一个边界没想清楚，就不应启动 Phase 1。

---

## **1. 术语与符号约定**

本章统一用语，所有后续章节以此为准。

| 术语 | 含义 |
| :---- | :---- |
| **Deck** | 一整套演示内容，由多个 Slide 组成 |
| **Slide** | 一页演示内容，内部可包含多个 Step |
| **Step** | 单页内的一个"分步展示"单元；两步之间由用户触发推进 |
| **Transition** | 两个 Slide 之间的转场动画 |
| **Timeline** | Remotion 的连续帧数轴；整个 Deck 最终被映射为一条 timeline |
| **Anchor** | Timeline 上的一个帧坐标，表示某个 Slide/Step 的起点或终点 |
| **Segment** | Timeline 上的一段区间，表示一个 Slide 或 Step 的占位范围 |
| **Cursor** | 运行时当前播放位置；可能指向某个 Slide/Step，也可能指向 transition 中间 |
| **Intent** | 用户触发的导航意图，如 `next()` / `previous()` / `goto(slideId, stepIndex)` |

记号：

- `S_i` 表示第 `i` 个 Slide
- `S_i.step_j` 表示 `S_i` 的第 `j` 个 Step
- `[a, b]` 表示帧区间 `[a, b)`，左闭右开
- `FPS` 表示帧率（默认 30 或 60，作者可配置）

---

## **2. 核心职责（Compiler Responsibilities）**

Compiler 做四件事，**仅此四件**：

### **2.1 遍历 Deck 树，收集声明**

输入：typed API 产出的组件树（`<Deck><Slide><Step>…</Step></Slide></Deck>`）。

收集：

- 每个 Slide 的默认时长（`duration`）
- 每个 Step 的类型与时长（`fixed` / `wait-for-event` / `computed`）
- 每个 Transition 的类型与时长（`fade` / `slide` / `cut` / 自定义）
- 每个 Slide 上的 presenter metadata（`notes`、`hidden`、`chapter`）

### **2.2 生成内部全局 Timeline Map**

输出：一张数据结构，将 Deck 中的所有 Slide / Step / Transition 映射为 timeline 区间。

```typescript
type TimelineMap = {
  totalFrames: number;
  slides: Array<{
    slideId: string;
    segment: [number, number];
    steps: Array<{
      stepIndex: number;
      segment: [number, number];
      kind: 'fixed' | 'wait-for-event' | 'computed';
    }>;
    transitionIn?: TransitionSegment;
    transitionOut?: TransitionSegment;
  }>;
};

type TransitionSegment = {
  kind: string;
  segment: [number, number];
  from: string;
  to: string;
};
```

### **2.3 暴露运行时导航 API**

Compiler 产出的 runtime 对象暴露：

```typescript
interface CadenzaRuntime {
  goto(slideId: string, stepIndex?: number): void;
  next(): void;
  previous(): void;
  getCursor(): Cursor;
  onCursorChange(handler: (cursor: Cursor) => void): void;
}

type Cursor =
  | { kind: 'at-step'; slideId: string; stepIndex: number }
  | { kind: 'in-transition'; from: string; to: string; progress: number }
  | { kind: 'loading'; reason: 'asset' | 'font' | 'video'; slideId: string };
```

### **2.4 把 Intent 翻译为 Remotion seekTo 调用**

每个 `next()` / `previous()` / `goto()` 最终落到 `playerRef.current.seekTo(frame)` + `play()` / `pause()` 上。这一翻译过程是 compiler 的"运行时最后一公里"。

**Non-goal**：compiler 不负责实际渲染，也不实现任何动画。它只生产 timeline 结构 + 路由 intent。

---

## **3. 核心模型：Discrete State ↔ Continuous Timeline**

### **3.1 双向映射的本质**

- **离散侧（作者视角）**：一棵 Slide/Step 树。作者写 `<Step>` 时不关心帧。
- **连续侧（Remotion 视角）**：一条 timeline，每帧 `useCurrentFrame()` 都是确定的。

Compiler 的工作是维护一个**双向函数**：

```txt
f: (slideId, stepIndex) → [entryFrame, exitFrame]
g: currentFrame → Cursor
```

`f` 在编译期确定；`g` 在运行时用 `currentFrame` 在 TimelineMap 上二分查找得到。

### **3.2 两条恒等关系（不变量）**

这是所有设计决策的地基：

1. **Temporal monotonicity**：对同一 Deck，`f(slide_i, step_j)` 的 `entryFrame` 严格单调递增（除非存在循环，本版不支持循环）。
2. **Cursor completeness**：任意合法的 `currentFrame ∈ [0, totalFrames)` 必定对应一个唯一的 `Cursor`，不存在"黑洞帧"。

如果任一恒等关系在实现中被破坏，说明 compiler 有 bug，应立刻失败而非静默继续。

### **3.3 运行时状态机**

Cursor 只有三种状态：

```txt
         ┌─────────┐
  start  │ at-step │ ◄──┐
    ─────►         │    │
         └────┬────┘    │
              │         │
        next/ │         │ asset ready
       prev   │         │
              ▼         │
         ┌─────────────────┐
         │ in-transition   │
         │  (overlap)      │
         └────────┬────────┘
                  │
          asset   │
          missing │
                  ▼
         ┌─────────────┐
         │   loading   │
         └─────────────┘
```

状态转换规则：

- `at-step → in-transition`：触发 next/prev 且目标是下一个 Slide（非同 Slide 下的 step）
- `at-step → at-step`：触发 next/prev 且目标是同 Slide 下的另一个 step
- `in-transition → at-step`：转场 progress 达到 1
- `in-transition → loading`：转场中途发现目标 slide 资产未就绪
- `loading → at-step`：资产就绪
- `loading → in-transition`：资产就绪且需要恢复未完成的转场

---

## **4. Public API 草案（typed API 表面）**

> **注意**：这一层仅列出 compiler 入口，不涵盖所有 typed API 原语。完整 typed API 草案另起文档。

```typescript
// 作者写的
<Deck fps={30} theme={theme}>
  <Slide duration="4s" notes="Welcome">
    <Step>{(ctx) => <Title>Hello</Title>}</Step>
    <Step kind="wait-for-event">{(ctx) => <Title>World</Title>}</Step>
  </Slide>
  <Transition kind="slide" duration="400ms" />
  <Slide>
    <Step>{(ctx) => <Chart data={data} />}</Step>
  </Slide>
</Deck>
```

```typescript
// Compiler 入口
import { compile, createRuntime } from '@cadenza-dev/core';

const timelineMap = compile(deckElement);
const runtime = createRuntime(timelineMap, playerRef);

runtime.goto('slide-2', 0);
runtime.next();
```

---

## **5. 已知边界情形（Edge Cases）**

每个边界情形必须包含：**问题陈述** / **决策** / **理由** / **测试用例**。

### **5.1 变长 Step（Variable-duration Steps）**

**问题**：某些 step 的时长不是预先确定的 —— 它等待用户点击（`wait-for-event`），或依赖运行时计算（`computed`，如等待数据加载完成）。这打破了"timeline 在编译期完全确定"的假设。

**决策**：

- 引入三类 step：
  - `fixed`：编译期确定时长
  - `wait-for-event`：在 timeline 上占据**可扩展区间**，默认占位 `2s`（作者可配置），runtime 按需延长
  - `computed`：占位 `0s`，由 runtime 依据 promise resolve 动态插入帧
- Runtime 通过修改内部 TimelineMap 实现"延长"：将当前 segment 的 `end` 推后，后续所有 segment 的 `entry/exit` 平移
- 这个修改只在**内存中**发生，不触发 Remotion 重新编译视频

**理由**：

- Remotion 本身允许运行时 `seekTo` 任意帧；我们不必依赖编译期固定 timeline
- `wait-for-event` 的占位默认时长保证即使事件永不触发，demo 也不会卡死
- 把变长复杂度限制在"整体 timeline 可伸缩，但每段区间的内部顺序不变"

**测试用例**：

```txt
# TC-5.1.1 fixed step basic
given deck with 2 fixed steps of 1s each
when compiled at 30fps
then slide segment is [0, 60], step 0 is [0, 30], step 1 is [30, 60]

# TC-5.1.2 wait-for-event placeholder
given deck with 1 wait-for-event step
when compiled at 30fps
then step segment length = 60 (2s default placeholder)
and step kind is 'wait-for-event'

# TC-5.1.3 wait-for-event expansion
given runtime cursor at wait-for-event step
when 5 seconds elapse without next() call
then cursor remains at-step, segment extended to accommodate

# TC-5.1.4 computed step with pending promise
given deck with computed step whose promise resolves at t=3s
when runtime enters that step at t=0
then cursor becomes loading for 3s, then transitions to at-step
and subsequent slides' segments shift by 3s
```

---

### **5.2 中途跳转（Mid-transition Navigation）**

**问题**：用户在转场动画播放到一半时按了"下一页"或"上一页"。此时当前 cursor 处于 `in-transition`，compiler 必须决定怎么响应新 intent。

**决策**：提供三种策略，作者可配置，默认 `cut-to-next`。

| 策略 | 行为 |
| :---- | :---- |
| `finish-then-advance` | 忽略新 intent，等转场完成后再处理 |
| `cut-to-next`（默认） | 立即终止转场，跳到下一个 slide 的起点；上一次转场的目标帧作为新起点 |
| `queue-next` | 等转场完成后自动执行 next() |

**理由**：

- `cut-to-next` 是 PowerPoint / Keynote 的默认行为；对演讲者最友好（按第二次键不会感到"无响应"）
- `finish-then-advance` 是"尊重动画完整性"派的选择，适合有精密编排的 deck
- `queue-next` 是"批量推进"派的选择，适合快速过 slide

**理由**（补充）：作者能感知到这个策略影响。在 `<Deck navigationPolicy="cut-to-next">` 上配置即可，不提供 per-slide 覆盖（避免状态爆炸）。

**测试用例**：

```txt
# TC-5.2.1 cut-to-next default
given runtime at cursor in-transition (from=S1, to=S2, progress=0.4)
when next() called
then cursor immediately becomes at-step(S2, 0)
and transition animation is terminated (no visual pop)

# TC-5.2.2 finish-then-advance
given deck with navigationPolicy='finish-then-advance'
and runtime at cursor in-transition progress=0.4
when next() called
then intent is discarded (or logged)
and runtime waits for transition to complete

# TC-5.2.3 queue-next
given deck with navigationPolicy='queue-next'
and runtime at cursor in-transition progress=0.4
when next() called
then intent is queued
and upon transition complete, cursor advances one more step
```

---

### **5.3 异步资源对齐（Async Asset Alignment）**

**问题**：下一个 slide 依赖的图片、字体、视频尚未加载完毕，用户按下一页。如果不做处理：

- 图片会"突然"出现，造成闪烁
- 字体回退会导致 FOUT/FOIT
- 视频没 metadata 会导致播放失败

**决策**：

- Compiler 不直接处理资产加载，而是**与 render-safe component layer 协作**
- `<SafeImage>` 等组件通过内部 `useAssetReadiness(assetId)` hook 注册自己的就绪状态
- Compiler 的 runtime 维护一个 `assetRegistry: Map<slideId, Set<assetId>>`
- 当 cursor 将要进入某个 slide 时，runtime 检查该 slide 所有 asset 是否 ready：
  - **全部 ready**：立即进入 `at-step` 或 `in-transition`
  - **部分未 ready**：cursor 变为 `loading`，暂停 Remotion player，显示全屏 loading overlay（默认 spinner + slide 预览）
  - **超时（默认 10s）**：降级为"无资产状态"直接进入，同时触发错误事件

**理由**：

- 把资产就绪的决策集中到 compiler runtime，避免组件各自处理导致的不一致
- `loading` 状态对用户可见，避免"为什么按了翻页没反应"的困惑
- 10s 超时是工程上的务实选择：永远不让演讲者被卡死

**测试用例**：

```txt
# TC-5.3.1 all assets ready
given all images on S2 are loaded
when runtime advances from S1 to S2
then cursor transitions directly to in-transition or at-step(S2, 0)

# TC-5.3.2 asset not ready, becomes loading
given one image on S2 is still loading
when runtime attempts to advance to S2
then cursor becomes loading(reason='asset', slideId='S2')
and loading overlay is shown
and Remotion player is paused

# TC-5.3.3 asset ready after loading state
given cursor is loading for S2
when the missing asset reports ready
then cursor transitions to the intended target (at-step or in-transition)

# TC-5.3.4 asset timeout
given cursor is loading for S2
when 10 seconds elapse without asset readiness
then cursor transitions to at-step(S2, 0) anyway
and an onAssetTimeout error event is emitted
```

---

### **5.4 Overlap 转场（Overlapping Transitions）**

**问题**：Remotion 的 `TransitionSeries` 允许 transition 与相邻 slide 在 timeline 上 overlap —— 转场的开始帧早于前一 slide 的结束帧。这会在单帧内出现"两个 slide 同时渲染"的情况，cursor 语义需要独立的 `in-transition` 状态。

**决策**：

- `in-transition` 是第三种 cursor 状态（与 `at-step`、`loading` 并列），不归属于任何单一 slide
- 在 overlap 区间内，`currentFrame → Cursor` 的映射返回 `in-transition(from=prevSlide, to=nextSlide, progress=...)`
- `progress` 在 overlap 起点为 0，终点为 1；按线性插值（compiler 层不考虑 easing，easing 由 transition 组件自行处理）

**理由**：

- 不给 in-transition 绑定任何一个 slide，避免"光标到底属于 S1 还是 S2"的哲学困境
- 把 easing 等视觉细节留给组件层，compiler 层只负责数值进度

**Non-goal**：compiler 不支持 3+ slides 同时 overlap 的转场。如果 Phase 2+ 需要，再扩展。

**测试用例**：

```txt
# TC-5.4.1 basic overlap
given S1 ends at frame 60, S2 starts at frame 48 (12-frame overlap transition)
when currentFrame = 54
then cursor is in-transition(from=S1, to=S2, progress=0.5)

# TC-5.4.2 overlap boundary precisely at 0
given overlap [48, 60]
when currentFrame = 48
then progress = 0
and cursor is in-transition(from=S1, to=S2, progress=0)

# TC-5.4.3 overlap boundary precisely at 1
given overlap [48, 60]
when currentFrame = 59 (last frame of overlap, exclusive of 60)
then progress is close to 1 (e.g., 11/12 ≈ 0.917)
and the next frame 60 yields cursor at-step(S2, 0)

# TC-5.4.4 cursor never ambiguous
given any overlap configuration
when iterating currentFrame from 0 to totalFrames
then each frame maps to exactly one Cursor (invariant from §3.2)
```

---

### **5.5 Scrubbing 与回放（Scrubbing and Replay）**

**问题**：Remotion Player 允许用户拖动进度条（scrubbing）到任意帧。对于一个有 step 的 Deck，如果用户从 S1.step0 直接拖到 S3.step2，中间跳过的 step 状态该如何处理？有两种语义：

- **视觉 seek**：直接跳转，不 replay 中间的 step 副作用
- **逻辑回放**：逐个模拟中间每个 step 的状态转换

**决策**：默认**视觉 seek**。不提供"逻辑回放"模式。

**理由**：

- 视觉 seek 语义清晰、实现简单、与 Remotion 原生行为一致
- 逻辑回放一旦引入，step 的副作用（`useEffect`、数据请求）语义会变得极其复杂
- 作者如果确实需要"step 副作用"，应该用 render-safe 组件的 declarative 设计表达，而不是依赖 compiler 回放

**特殊规则**：scrubbing 期间 cursor 的状态：

- 若落在 overlap 区间 → `in-transition`
- 若落在某 slide 的 segment 内 → `at-step`，`stepIndex` 为该帧所属的 step（不管 step 副作用是否"跑过"）
- 若落在 `wait-for-event` 占位区 → cursor 直接在占位末尾，等同于"用户已触发过该事件"

**测试用例**：

```txt
# TC-5.5.1 scrub to middle of a slide
given currentFrame = 150, which falls within S3.step2 segment
when compiler maps frame to cursor
then cursor is at-step(S3, 2)
and no step 0/1 side effects are executed

# TC-5.5.2 scrub backwards
given cursor at S5.step0
when user scrubs to S2.step1
then cursor becomes at-step(S2, 1)
and no replay of S3, S4 occurs

# TC-5.5.3 scrub into wait-for-event segment
given S3.step1 is wait-for-event with 2s placeholder starting at frame 120
when user scrubs to frame 160 (within placeholder)
then cursor is at-step(S3, 1)
and runtime treats the event as 'virtually fired' (next scrub/next() advances)
```

---

### **5.6 嵌套 Deck（Nested Decks）**

**问题**：未来是否允许 `<Deck>` 嵌套 `<Deck>`（类似"章节 deck"）？如果允许，timeline 如何组合？

**决策**：**Phase 1 不支持嵌套 Deck**。

- `<Deck>` 只能出现在组件树的根
- 如果 compiler 在非根位置检测到 `<Deck>`，抛出编译错误
- Phase 2 若引入嵌套，需扩展 TimelineMap 为树形结构并重新设计 Cursor

**理由**：

- 嵌套 Deck 引入的"slide 归属于哪个 deck"问题会污染整个导航 API
- 用 `<Chapter>` 原语（Phase 3 计划）已足够表达"章节分组"，不需要嵌套
- 保持 Phase 1 MVP 的抽象简单至关重要

**测试用例**：

```txt
# TC-5.6.1 nested deck rejected
given component tree with <Deck> inside another <Deck>
when compiled
then compile error is thrown: "Nested <Deck> is not supported in Phase 1"

# TC-5.6.2 chapter primitive is allowed (Phase 3)
given component tree with <Chapter> inside <Deck>
when compiled
then compilation succeeds (if Phase 3 feature enabled)
and <Chapter> contributes outline metadata only, not timeline structure
```

---

## **6. 不变量清单（Invariants）**

这些在实现和测试中必须被自动化验证：

1. **Temporal monotonicity**：`f(S_i, step_j).entry < f(S_i, step_{j+1}).entry < f(S_{i+1}, step_0).entry`
2. **Cursor completeness**：任意 `frame ∈ [0, totalFrames)` 对应唯一 Cursor
3. **Segment non-overlap (except transitions)**：两个非转场 segment 不得 overlap
4. **Transition boundedness**：任一 transition segment 长度 > 0 且 < 前后 slide segment 长度之和
5. **Public API stability (post-MVP)**：MVP 发布后 1 个月内 `compile()` / `CadenzaRuntime` 接口不得 breaking change（来自 analysis-final §7 Phase 1 退出条件）

---

## **7. Non-goals（本 compiler 明确不做的事）**

1. **不做动画插值**：`spring` / `interpolate` / easing 交给组件层
2. **不做资产加载**：交给 render-safe component layer
3. **不做渲染**：完全依赖 Remotion Player / Lambda
4. **不做嵌套 Deck**（Phase 1）
5. **不做逻辑回放**（scrubbing 永远是视觉 seek）
6. **不保证跨 Remotion 大版本的兼容性**：Remotion 的 major version 升级时，compiler 内部实现可能需要重写，但 public API 保持稳定

---

## **8. 未解问题（Open Questions）**

以下问题需在 Phase 0 评审期间达成共识，或明确"暂时搁置，Phase 1 中期再决定"：

### **OQ-1：FPS 应否在 Deck 层强制统一？**

- 选项 A：强制整个 Deck 使用单一 FPS
- 选项 B：允许每个 Slide 自定义 FPS（需处理 transition 跨 FPS 问题）

**倾向**：选项 A。多 FPS 在 Remotion 中极其复杂，且对 slides 语义无收益。

### **OQ-2：Cursor onChange 事件的节流粒度？**

- `in-transition` 期间 `progress` 每帧都在变化，是否每帧都 emit？
- 还是只在状态切换时 emit？

**倾向**：只在状态切换（at-step ↔ in-transition ↔ loading）时 emit；`progress` 通过单独 API 查询。

### **OQ-3：Deck duration 的上限？**

- 是否限制单个 Deck 最长时长？防止 timeline 过长导致内存/渲染问题

**倾向**：不硬限制，但在 timeline 超过 60 分钟时发出 compile-time warning。

### **OQ-4：多语言 slides（i18n）**

- Slide 内容若随 locale 变化，timeline 长度可能变化（文字渲染差异导致 overflow）
- 是否在 compile 阶段为每个 locale 产出独立 TimelineMap？

**倾向**：Phase 1 不处理 i18n；Phase 3 若需要，每 locale 独立 compile。

### **OQ-5：与 Remotion Lambda 的帧一致性**

- 作者本地用 Remotion Player 预览，compiler 动态调整 timeline
- 导出到 Lambda 时，timeline 需要"冻结"为静态版本
- 如何保证两者产出的 MP4 与本地 preview 完全一致？

**倾向**：导出时 compiler 运行 "offline mode"，将所有 `wait-for-event` 用作者预设的 "export duration" 替代，生成静态 TimelineMap 交给 Lambda。

---

## **9. Phase 0 评审 Checklist**

本文档须通过以下评审方可关闭 Phase 0：

- [ ] §2 四项职责边界清晰、互不越界
- [ ] §3 两条恒等关系（monotonicity + completeness）正确且可自动化验证
- [ ] §5 六个边界情形每项都有：问题 / 决策 / 理由 / 测试用例
- [ ] §5 测试用例命名与 given-when-then 结构一致，可直接转为 Vitest / Playwright 测试
- [ ] §6 不变量可在单元测试中自动化校验
- [ ] §7 Non-goals 被认可为本 compiler 的硬边界
- [ ] §8 Open questions 或有明确倾向，或被显式 park 到 Phase 1 中期

本文档评审不通过 ⇒ Phase 1 不启动。

---

## **10. 版本历史**

| 版本 | 日期 | 说明 |
| :---- | :---- | :---- |
| v0.1 | 2026-04-17 | 初稿，覆盖 6 项已知边界情形 + 不变量 + non-goals + 5 个 open questions |
