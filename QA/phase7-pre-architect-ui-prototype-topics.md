# Phase 7 Pre-Architect UI Prototype Topics

> Status: QA topic map; Q1-Q20 settled in companion decisions; not a contract.
> Date: 2026-06-04.
> Companion decision log:
> [phase7-pre-architect-ui-prototype-decisions.md](./phase7-pre-architect-ui-prototype-decisions.md).
> Scope: Phase 7 UI prototype discussion only.

This file expands the open blocker in
[phase7-pre-architect-ui-prototype-follow-up.md](./phase7-pre-architect-ui-prototype-follow-up.md)
and Topic 3 in
[phase7-pre-architect-brainstorming-decisions.md](./phase7-pre-architect-brainstorming-decisions.md).
It is the topic map for the Phase 7 UI prototype discussion.

It does not freeze `spec/phase7/`, create a `@cadenza-dev/player-app` package,
define public API, or replace Architect Stage A/B. Decisions and Stage A
handoff notes live in the companion decision log.

## Current Ground Truth

- Phase 7 direction is a deck-primary, read-only Player App plus inspector.
- Current repo state has no `@cadenza-dev/player-app` package yet.
- `@cadenza-dev/preview-remotion` already exposes `CadenzaPlayer`,
  `createCadenzaPreviewController`, `createCadenzaPreviewMount`, and runtime
  snapshots containing cursor, diagnostics, presenter metadata, readiness, and
  pending resources.
- `examples/phase4/preview.jsx`, `examples/phase4/preview.ts`, and
  `examples/phase4/serve-preview.mjs` already provide a historical dogfood
  preview shell, but they are not the future Player App surface.
- The CLI currently has `export`, `validate`, and `inspect`; there is no
  `preview` command yet.
- Phase 6 local export already exposes manifest, per-format evidence,
  `validate`, `export`, and artifact-only `inspect` surfaces.
- `inspect` reads generated artifacts. It does not reload deck source, compile a
  current deck, or perform source drift detection.
- Deck module metadata owns canonical display identity. Config aliases and CLI
  selectors resolve paths but must not invent Player App display identity.
- Phase 7 should not introduce WYSIWYG editing, source editing, in-app repair
  workbench behavior, AI patching UI, hosted rendering, accounts, marketplace,
  PDF/PPTX IR, or broad non-developer deck-product scope.
- Existing generated artifacts under `dist/` can be useful evidence examples,
  but they are live generated outputs, not tracked canonical fixtures.

## Recommended Discussion Order

1. Q1 prototype artifact and lifetime.
2. Q2 prototype technology stack.
3. Q3 fixture and data strategy.
4. Q4 required prototype states.
5. Q5 desktop layout and Q6 mobile/narrow viewport model.
6. Q7 bottom controls and Q8 inspector IA.
7. Q9 deck identity, Q10 notes boundary, Q11 diagnostics, and Q12 provenance.
8. Q13 visual quality, Q14 visual style, Q15 accessibility, and Q16 read-only
   non-goals.
9. Q17 promotion evidence.
10. Q18 Stage A handoff, Q19 visual verification, and Q20 visual companion
    usage.

## Q1. Prototype Artifact And Lifetime

- 问题: Phase 7 UI prototype 应该以什么 artifact 存在, 它是一次性设计草图,
  可复用 frontend artifact, 还是未来 Phase 7 package 的雏形?

- 问题描述: Topic 3 需要一个 previewable frontend page 来把 UI 方向从
  `open` 推向 `decided`, 但 pre-Architect 阶段不能偷偷创建 package boundary 或
  冻结 contract。artifact 的位置和生命周期会决定后续是否安全。

- 可行的方案:
  - A. Design-only disposable prototype: 放在 `design/ui-prototype/`, 明确不是
    workspace package, public package surface, frozen spec, or production code。
  - B. Reusable playground prototype: 放在 `examples/` 或 `playground/`,
    作为可运行但非 public surface 的 prototype。
  - C. Early package prototype: 直接新建 `packages/player-app` 或
    `@cadenza-dev/player-app`。

- 各个方案的利弊:
  - A 优点: 最符合当前 scope, 不碰 packages, 不冻结 public API, 可以快速比较
    layout/IA; `design/ui-prototype/` 也比 QA 路径更清楚表达这是 UI design
    artifact。缺点: 与真实 runtime 的距离较远, 后续需要重新实现或转译。
  - B 优点: 比 QA-only 更接近真实运行环境, 未来可作为 Stage A evidence。
    缺点: 容易被误读为半正式 implementation, 还可能进入 workspace 约束。
  - C 优点: 最接近未来 Phase 7 build path。缺点: 在 pre-Architect 阶段过早
    冻结 package topology, 违反本轮只写 QA notes 的边界。

- 我的建议: 选 A, 但将原先的 QA-only 路径调整为 `design/ui-prototype/`。
  该目录用于承载 pre-Architect UI prototype 和 design exploration, 不作为
  workspace package、Stage A contract、Builder implementation, or public API。

## Q2. Prototype Technology Stack

- 问题: prototype 应使用 standalone HTML/CSS/JS, React-only shell, 还是直接接入
  React/Remotion/`preview-remotion`?

- 问题描述: 技术栈必须服务本轮问题。当前需要验证的是 Player App shell,
  inspector IA, responsive layout, 和 visual polish, 不是验证 Remotion renderer
  或 package boundary。

- 可行的方案:
  - A. Static HTML/CSS/vanilla JS with fixture JSON.
  - B. React browser prototype with fixture JSON, still outside packages.
  - C. React plus `CadenzaPlayer` and real timeline/deck imports.
  - D. Adapt the historical `examples/phase4/preview.*` preview shell into a
    QA prototype reference without promoting it to Player App.

- 各个方案的利弊:
  - A 优点: 最轻, 无依赖, 最不可能误伤 repo architecture。缺点: 不能验证
    React composition、Remotion sizing、snapshot plumbing。
  - B 优点: 与未来 Player App 组件形态更接近, 仍可保持 QA-only。缺点:
    需要更明确的 local serve/build story。
  - C 优点: 能验证真实 preview runtime 和 snapshot data。缺点: 容易把
    prototype 变成 implementation spike, 并且会受 Remotion/React package
    boundary 影响。
  - D 优点: 复用 repo 中已有 preview dogfood 知识。缺点: Phase 4 preview
    不是 Phase 7 product shell, 直接沿用会继承旧语义和视觉妥协。

- 我的建议: 选 B。Prototype 使用 React browser shell with fixture JSON,
  仍放在 `design/ui-prototype/`, 不进入 workspace package。React 允许复用
  高质量组件库和样式库, 也更接近未来 Player App component thinking; 但首轮不
  直接接入真实 Remotion/`preview-remotion`, 避免把 UI prototype 变成 runtime
  integration spike。

## Q3. Fixture And Data Strategy

- 问题: prototype 使用纯静态假数据, 真实 Cadenza snapshots, 还是 hybrid fixture?

- 问题描述: UI 需要展示 deck identity, outline, chapters, readiness,
  diagnostics, notes boundary, manifest/evidence, known limitations。单一路径
  很难同时表达这些内容, 因为 `inspect` 是 artifact-only, 而 outline/chapters
  更接近 deck module metadata 或 validate/runtime snapshot。

- 可行的方案:
  - A. Pure mock fixture: 手写 UI 数据, 不声称来自真实 Cadenza output。
  - B. Real exported data only: 只用 `manifest.json`, `web-evidence.json`,
    `mp4-evidence.json`, 和 `inspect --json` 摘要。
  - C. Hybrid fixture: 从真实 deck metadata, validate summary,
    `CadenzaPlayerSnapshot`, manifest/evidence 中抽取代表性 JSON, 再冻结成
    QA prototype fixture。

- 各个方案的利弊:
  - A 优点: 最快, 可覆盖边界状态。缺点: 容易设计出当前系统无法供给的数据。
  - B 优点: 最忠于 Phase 6 artifact truth。缺点: 缺少实时 cursor、runtime
    readiness、outline/chapter 细节和 notes 边界。
  - C 优点: 既保留真实性, 又能覆盖 Player App inspector 所需信息。
    缺点: 需要明确每个字段来源, 防止把 hybrid fixture 误认为已冻结 API。

- 我的建议: 选 C。每个 fixture section 都标注 source: `deck metadata`,
  `validate summary`, `player snapshot`, `manifest`, `format evidence`, 或
  `prototype-only`. 已生成的 `dist/` 样本只能作为 source material, 不应被当作
  tracked canonical fixture。这样 grill-with-docs 时可以逐项追问字段是否真实存在。

## Q4. Required Prototype States

- 问题: prototype 至少需要展示哪些状态才足以支撑 UI 方向讨论?

- 问题描述: 只有 happy path 容易让 UI 过度乐观。Phase 7 Player App 需要面对
  readiness pending, diagnostics, export limitations, and artifact provenance。

- 可行的方案:
  - A. Happy path only: canonical deck 正常播放。
  - B. Happy path plus one warning state: 加入 readiness 或 diagnostic。
  - C. Multi-state prototype: happy path, pending readiness, diagnostic/error,
    and export provenance/known-limitation state。

- 各个方案的利弊:
  - A 优点: 快速验证 first viewport。缺点: inspector IA 几乎无法被验证。
  - B 优点: 可以测试 UI 不只为成功状态服务。缺点: 仍不能覆盖 export evidence。
  - C 优点: 足以验证 inspector 的真实密度和 edge cases。缺点: 原型工作量更高。

- 我的建议: 选 C, 但控制为 3-4 个 curated states, 不做状态爆炸。

## Q5. Desktop Layout Model

- 问题: desktop 上 deck canvas, bottom controls, inspector 应怎样布局?

- 问题描述: 已有方向是 deck-primary balanced shell。关键是 inspector 不能夺走
  deck 的第一视觉对象地位, 但又要足够 discoverable, 让开发者能检查 outline,
  diagnostics, readiness, provenance。

- 可行的方案:
  - A. Right rail inspector: deck canvas 居中, bottom controls 稳定, inspector
    在右侧 rail。
  - A-expanded. Three-rail layout: center deck canvas, left static slide-preview
    rail, right inspector rail, and collapsible/resizable bottom controls.
  - B. Bottom inspector drawer: deck 和 controls 保持横向宽度, details 从底部
    展开。
  - C. Overlay inspector: inspector 以 modal/popover 覆盖 deck。

- 各个方案的利弊:
  - A 优点: desktop 信息架构最清晰, 同时可见 deck 和 evidence。缺点:
    小屏宽时需要折叠策略。
  - A-expanded 优点: 更接近 presentation authoring/viewing intuition:
    左侧像 PowerPoint 一样给静态 slide preview, 右侧像 VS Code side bar 一样给
    inspector topics, 下侧承载 controls; 同时保留 deck-primary。缺点: 需要
    明确 rail 折叠、调宽高、层级和 swap 规则, 否则容易膨胀成完整 workbench。
  - B 优点: 保留 canvas 宽度。缺点: 与 bottom controls 冲突, 容易挤压 deck。
  - C 优点: 适合临时查看。缺点: 会遮挡 deck, 不适合作为开发者 inspect surface。

- 我的建议: 选 A-expanded, 并以
  [layout-guideline.md](../design/ui-prototype/layout-guideline.md) 作为
  prototype layout direction。工作量是可控的, 前提是 prototype 只实现固定角色的
  left/right/bottom rails、基础 collapse toggles、基础 resize handles、右侧 topic
  buttons、top-bar rail controls 和 side swap; 不做完整 VS Code workbench docking。

## Q6. Mobile And Narrow Viewport Model

- 问题: mobile browser 是正式 presenter surface, 还是最低可接受 responsive viewer?

- 问题描述: Phase 7 roadmap 要 responsive UI, 但不等于要完整移动端 presenter
  app。需要明确 mobile 的承诺, 避免把 P0 扩成复杂手持演示产品。

- 可行的方案:
  - A. Responsive viewer only: deck first, controls sticky, inspector as drawer。
  - B. Mobile presenter mode: notes, timer, controls, diagnostics 都为手机优化。
  - C. Mobile unsupported or documented limitation。

- 各个方案的利弊:
  - A 优点: 符合 alpha, 可验证 mobile 不崩坏。缺点: 不是完整演讲者体验。
  - B 优点: 产品感强。缺点: scope 大, notes/privacy/focus/gesture 问题复杂。
  - C 优点: 最省。缺点: 与 Phase 7 responsive exit evidence 冲突。

- 我的建议: 选 A。把 mobile 定义为可用 viewer, 不是正式 presenter surface。

## Q7. Bottom Controls IA

- 问题: bottom controls 应包含哪些 P0 控件, 哪些应留给 inspector 或 future?

- 问题描述: Controls 是稳定底栏, 但如果塞入过多文字和 metadata, 会破坏
  presentation player 的节奏。当前 runtime 支持 previous, next, goto, play,
  pause, toggle, frame seek 等能力, 但 UI 不必暴露全部。

- 可行的方案:
  - A. Minimal navigation: previous, next, play/pause, slide/step indicator。
  - A-expanded. Minimal navigation plus required fullscreen support and
    fullscreen input behavior.
  - B. Full player controls: scrubber, time, fullscreen, speed, frame metadata。
  - C. Developer controls: navigation plus copyable frame/cursor/debug state。

- 各个方案的利弊:
  - A 优点: 清晰稳定, 不把 app 变成 debug panel。缺点: 可能无法表达 timeline。
  - A-expanded 优点: 保持 bottom controls 克制, 同时满足成熟 presentation
    player 的 fullscreen expectation。缺点: fullscreen 后的 keyboard, pointer,
    touch, and external controller behavior 需要单独记录, 避免在 Q7 中塞入过多
    实现细节。
  - B 优点: 像完整 media player。缺点: speed/frame controls 可能误导 Cadenza
    action-anchor semantics。
  - C 优点: 对开发者有用。缺点: debug 信息应进入 inspector, 不宜常驻底栏。

- 我的建议: 选 A-expanded, 并以
  [fullscreen-navigation-guideline.md](../design/ui-prototype/fullscreen-navigation-guideline.md)
  作为 fullscreen/input behavior direction。Bottom controls P0 包含 previous,
  next, play/pause, slide/step or action-anchor indicator, and fullscreen toggle。
  Debug/frame/cursor/provenance detail 放进 inspector。

## Q8. Inspector Information Architecture

- 问题: 单一 discoverable inspector 内部应如何组织 outline, readiness,
  diagnostics, provenance, notes, known limitations?

- 问题描述: Inspector 是 Topic 3 的关键。它既要给开发者检查信心, 又不能变成
  repair workbench 或 source editor。

- 可行的方案:
  - A. Tabs: Outline, Health, Export, Notes。
  - B. Single scroll narrative: Deck, Readiness, Diagnostics, Evidence,
    Limitations 顺序排列。
  - C. Summary-first with expandable groups: 顶部 health summary, 下方按组展开。
  - C-expanded. Summary-first plus VS Code-like collapsible/resizable sections
    inside the selected right-rail topic pane.

- 各个方案的利弊:
  - A 优点: 可发现, 信息边界清楚。缺点: tab 间可能隐藏重要 warning。
  - B 优点: 适合审阅证据。缺点: 长内容让 navigation 变慢。
  - C 优点: 同时保留 summary 和 details。缺点: 需要更细的空态和展开状态设计。
  - C-expanded 优点: 右侧 activity topic buttons 保持 discoverability, pane
    内部则像 VS Code side bar 一样支持 section 展开/折叠和区域高度占比调整。
    缺点: 需要约束为 inspector IA, 不能膨胀成 full workbench 或 source editor。

- 我的建议: 选 C-expanded, 并以
  [inspector-ia-guideline.md](../design/ui-prototype/inspector-ia-guideline.md)
  作为 right inspector IA direction。默认 `Summary` 展开, `Outline` 和
  `Timeline` 等 detail sections 可折叠并可调整高度占比; diagnostics/provenance
  用 badges 和默认展开规则提示重要状态。

## Q9. Outline, Chapters, And Deck Identity

- 问题: Player App 第一屏如何呈现 deck identity, outline, chapters?

- 问题描述: `cadenza-alpha-readiness-talk` 已有 `deckId`, `title`, `outline`,
  `chapters`, `sourcePath`, target audience 等 metadata。UI 需要显示这些信息,
  但不能让 alias 或 config title override 成为新身份来源。

- 可行的方案:
  - A. Header shows canonical title and deck ID, inspector owns outline。
  - B. Header shows human title only, technical identity hidden in inspector。
  - C. Config/selector display name can override title。

- 各个方案的利弊:
  - A 优点: 最清楚, 与 manifest identity 一致。缺点: header 可能显得偏工程。
  - B 优点: 更像 polished product。缺点: 开发者需要 extra click 找到 identity。
  - C 优点: 灵活。缺点: 冲突 Phase 6 deck identity authority。

- 我的建议: 选 A 的温和版本: first viewport 显示 title, inspector metadata
  显示 `deckId`, selector, source path, and manifest identity。

## Q10. Speaker Notes Boundary

- 问题: speaker notes 在 Player App prototype 中应该隐藏, 可检查, 还是形成
  presenter-only view?

- 问题描述: Cadenza deck 有 notes/presenter metadata, 但 Phase 7 不应扩成完整
  presenter console。notes 也可能包含不适合 exported web 默认公开展示的内容。

- 可行的方案:
  - A. Notes hidden by default, inspector has explicit Notes section。
  - B. Notes always visible in inspector。
  - C. Separate presenter mode。
  - C-staged. Notes hidden in normal audience/player view, with a staged
    presenter-view direction recorded separately.

- 各个方案的利弊:
  - A 优点: 尊重边界, 仍可检查 metadata。缺点: 需要清晰 label。
  - B 优点: 简单直接。缺点: exported web 中可能泄露 presenter-only material。
  - C 优点: 产品完整。缺点: P0 scope 大, 会拖入 presenter workflow。
  - C-staged 优点: 保留 normal Player/audience view 的 privacy 边界, 同时承认
    presenter view 对成熟 presentation tool 的重要性。缺点: 需要明确 browser
    和 app-side local-ready 的可靠性边界, 不能把 desktop app 能力偷换成
    browser P0 promise。

- 我的建议: 选 C-staged。普通 Player/audience view 中 notes hidden by default,
  只通过 explicit `Notes` section / `presenter metadata` label 检查; 同时把完整
  presenter-view flow 作为 UI prototype direction 记录到
  [presenter-view-guideline.md](../design/ui-prototype/presenter-view-guideline.md)。

## Q11. Readiness And Diagnostics Presentation

- 问题: readiness 和 diagnostics 应常驻显示、只在 inspector 中显示、还是以
  toast/error overlay 呈现?

- 问题描述: `CadenzaPlayerSnapshot` 有 `readiness.pendingResourceIds`,
  resource statuses, and diagnostics。Phase 6 CLI diagnostics 有 category,
  code, severity, locator, related requirements, and repair hint。UI 必须能
  显示问题, 但不能变成 repair UI。

- 可行的方案:
  - A. Global health strip plus inspector details。
  - A-expanded. VS Code-like persistent bottom status bar health signal plus
    inspector details, with a top-center blocking error bar.
  - B. Inspector-only diagnostics。
  - C. Toast/overlay driven diagnostics。

- 各个方案的利弊:
  - A 优点: 用户不会错过重要状态, details 仍有归宿。缺点: 要避免状态条抢戏。
  - A-expanded 优点: 用窄而常驻的 bottom status bar 承载概要状态, 中间留空,
    左右角显示轻量信息, health signal 跟随 inspector rail 所在侧; 点击后直接
    打开 `Readiness` 或 `Diagnostics` topic。Blocking case 用 top-center error
    message bar 明确打断, 不把全局中断塞到低可见度底角。缺点: 需要把 bottom
    status bar 和可折叠 bottom controls rail 区分清楚。
  - B 优点: deck 更干净。缺点: pending/error 可能不可见。
  - C 优点: 适合急性错误。缺点: 不适合 persistent evidence review。

- 我的建议: 选 A-expanded。常驻 bottom status bar 只显示 `Ready`,
  `Checking`, `Warnings`, or `Blocked` 加计数, 并放在靠近 inspector rail 的
  左/右下角; 点击 health signal 后 inspector rail 切到 `Readiness` 或
  `Diagnostics` topic。具体 diagnostic code, locator, repair hint, requirement
  refs 进入 inspector。Blocking case 需要显式 error message bar, 推荐放在
  top-center / top-nav 下方, 约束在 center deck column 或窄全局 banner, 因为
  blocking 是全局中断, 不应被底角 status signal 弱化。

## Q12. Export Provenance And Known Limitations

- 问题: inspector 应如何展示 manifest, per-format evidence, stable hash,
  capabilities, artifacts, and known limitations?

- 问题描述: Phase 7 app-based web export 需要区别于 Phase 6 static compatibility。
  Prototype 应验证 export provenance 的可读性, 但不能声称 Phase 7 evidence
  fields 已冻结。

- 可行的方案:
  - A. Compact export summary card with expandable raw details。
  - A-expanded. Compact provenance summary plus structured expandable evidence
    details.
  - B. Full evidence browser inside inspector。
  - C. Only link to artifact paths, UI 不解释 evidence。

- 各个方案的利弊:
  - A 优点: 对人可读, 对 agent 可定位, 不变成 JSON viewer。缺点: 需要选择字段。
  - A-expanded 优点: 承接 Phase 6 artifact-only `inspect` 语义, 把 manifest,
    per-format evidence, artifact inventory, capabilities, known limitations
    做成人类可读 summary 和可定位 detail。缺点: 需要明确 raw JSON 只是折叠
    affordance, 不能成为默认主视图或未来 schema 冻结。
  - B 优点: 完整。缺点: 过度工具化, 像 debug console。
  - C 优点: 最少 UI。缺点: 没有产品层可信度。

- 我的建议: 选 A-expanded。`Provenance` topic 默认显示 compact summary:
  deck title/id, selected formats, export status, stable hash, schema version,
  manifest path; 下方用可展开 sections 显示 format capabilities, evidence files,
  artifact inventory, selector provenance, known limitations, and raw details。
  Raw manifest/evidence JSON 只作为 view/copy/link affordance, 不把 inspector
  变成 JSON browser。

## Q13. Visual Quality Bar

- 问题: 什么程度的 visual polish 足以把 UI direction 从 `open` 推到
  `decided`?

- 问题描述: Phase 7 不是 marketing landing page, 但 Player App 是 Cadenza 的
  第一个产品面。过低的 polish 会让 alpha 不可信, 过高的 polish 会把 prototype
  拖成 design-system build。

- 可行的方案:
  - A. Wireframe quality only。
  - B. High-fidelity static shell with realistic spacing, typography, colors,
    controls, empty/error states。
  - C. Production-polished interactive UI。

- 各个方案的利弊:
  - A 优点: 快。缺点: 不能判断 product feel。
  - B 优点: 足以验证 first impression 和 IA。缺点: 仍不证明 production code。
  - C 优点: 最接近 Phase 7 implementation。缺点: 过早, 可能越过 Architect。

- 我的建议: 选 B。Prototype 应达到 high-fidelity direction, 但不要求 production
  component completeness。

## Q14. Visual Style And Design Tokens

- 问题: Cadenza Player App 的视觉气质应偏 presentation player, developer tool,
  还是 technical artifact inspector?

- 问题描述: Topic 3 的“deck-primary balanced shell”意味着三者都存在, 但主次
  不同。视觉语言会影响颜色、密度、typography、inspector contrast、控件重量。

- 可行的方案:
  - A. Presentation-player first: cinematic canvas, subdued chrome。
  - B. Developer-tool first: dense panels, explicit metadata。
  - C. Balanced technical player: deck has visual priority, inspector uses
    quiet developer-tool density。

- 各个方案的利弊:
  - A 优点: 产品感强。缺点: diagnostics/evidence 可能变弱。
  - B 优点: 信息效率高。缺点: 像 dashboard, 不是 presentation product。
  - C 优点: 最贴合当前共识。缺点: 需要更细的 visual hierarchy。

- 我的建议: 选 C。Deck surface 使用 presentation quality; inspector 使用紧凑、
  安静、可扫描的 developer-tool grammar。

## Q15. Accessibility And Keyboard Scope

- 问题: pre-Architect prototype 是否需要覆盖 keyboard, focus, reduced motion,
  and screen-reader semantics?

- 问题描述: Phase 7 Player App 是 browser app, 不能忽略 basic accessibility。
  但 prototype 不应提前冻结完整 accessibility contract。

- 可行的方案:
  - A. Ignore in prototype, Stage A 再处理。
  - B. Prototype demonstrates basic keyboard/focus/reduced-motion posture。
  - C. Prototype defines full accessibility acceptance matrix。

- 各个方案的利弊:
  - A 优点: 快。缺点: controls/inspector layout 可能之后返工。
  - B 优点: 能验证核心交互不会反设计。缺点: 需要额外 annotation。
  - C 优点: 最完整。缺点: 不适合 pre-Architect QA。

- 我的建议: 选 B。Prototype 记录 basic focus order, keyboard navigation intent,
  and reduced-motion note, 但 acceptance matrix 留给 Stage A。

## Q16. Source Editing And Repair Non-Goals In UI

- 问题: Prototype 如何显式表达 read-only inspector, 避免用户期待 in-app repair,
  source editing, or AI patching?

- 问题描述: Inspector 会显示 diagnostic repair hints, 这很容易诱导 UI 放入
  "Fix" button、agent prompt、source editor。Topic 3 已明确排除这些行为。

- 可行的方案:
  - A. Show repair hints as read-only text with source/evidence locator。
  - B. Add copy command or copy locator affordance, but no repair action。
  - C. Add disabled/future repair actions to signal roadmap。

- 各个方案的利弊:
  - A 优点: 边界最稳。缺点: 交互少。
  - B 优点: 对 developer/agent 有帮助, 仍保持 read-only。缺点: 要防止 copy
    affordance 变成 implied workflow。
  - C 优点: 让未来想象更明显。缺点: 会 overclaim Phase 7。

- 我的建议: 选 B 的保守版: 可复制 diagnostic code, locator, and command path,
  不展示 "Fix" 或 "Ask AI"。

## Q17. Prototype Promotion Evidence

- 问题: 需要什么证据才能把 Topic 3 从 `open` 改为 `decided`?

- 问题描述: `phase7-remaining-discussions.md` 说 Topic 3 只能在 previewable
  prototype 或 explicitly accepted design substitute resolve blocker 后移动。
  这里要定义 promotion evidence, 否则后续无法判断讨论何时完成。

- 可行的方案:
  - A. Text-only consensus is enough。
  - B. Previewable prototype plus annotated screenshots and QA decisions。
  - C. Prototype plus browser/mobile sanity checks and fixture provenance map。
  - B-expanded/C-light. Previewable prototype plus annotated screenshots, QA
    decisions, and fixture provenance map, with lightweight desktop/mobile
    sanity but no production verification gate.

- 各个方案的利弊:
  - A 优点: 快。缺点: 不符合当前 follow-up 对 previewable frontend page 的期待。
  - B 优点: 足以支撑 UI direction。缺点: 未验证 responsive/browser basics。
  - C 优点: 证据最强。缺点: 容易靠近 implementation/test scope。
  - B-expanded/C-light 优点: 能证明 UI direction 可看见、可追溯、可交接、
    不会误冻结。缺点: 需要准备截图和 fixture provenance map, 但仍不证明
    production readiness。

- 我的建议: 选 B, 并把 C 中的 lightweight mobile/desktop visual sanity 作为
  recommended but not mandatory unless maintainer wants stronger evidence。

## Q18. Stage A Handoff Boundary

- 问题: prototype findings 应如何进入 Architect Stage A, 才不会变成 accidental
  frozen contract?

- 问题描述: Prototype 会产生 layout, field names, UI labels, fixture shape,
  and possibly CSS/component ideas。Stage A 应吸收 decisions 和 tradeoffs, 而
  不是复制 prototype implementation 细节。

- 可行的方案:
  - A. Copy prototype directly into Stage A as baseline。
  - B. Summarize decisions, rejected options, open risks, and evidence needs。
  - C. Keep prototype separate and ignore it during Stage A。

- 各个方案的利弊:
  - A 优点: 快。缺点: 容易冻结偶然设计。
  - B 优点: 最符合 Cadenza Stage A/B discipline。缺点: 需要额外整理。
  - C 优点: 避免污染 specs。缺点: 浪费 prototype 学到的东西。

- 我的建议: 选 B。Stage A handoff 应写成 Freeze Candidates, baseline direction,
  non-goals, required evidence, and deferred risks, 不直接冻结 prototype CSS 或
  fixture names。

## Q19. Visual Verification Strategy For The Prototype

- 问题: Prototype 本身是否需要 desktop/mobile screenshots, browser smoke, or
  pixel checks?

- 问题描述: Topic 10 已决定 Phase 7 不应把 broad pixel parity 做成 primary gate。
  但 prototype 若完全没有 visual evidence, 很难比较 layout。

- 可行的方案:
  - A. Manual review only。
  - B. Desktop and mobile screenshots as supplemental evidence。
  - C. Automated Playwright smoke and pixel thresholds。

- 各个方案的利弊:
  - A 优点: 快。缺点: 证据弱。
  - B 优点: 能支持讨论, 不冻结 test contract。缺点: 仍需维护 screenshot paths。
  - C 优点: 最强。缺点: pre-Architect 阶段过重, 还可能误导为 Phase 7 gate。

- 我的建议: 选 B。若后续实际实现 prototype, 保留 desktop/mobile screenshots 和
  notes; automated checks等 Stage A 决定。

## Q20. Visual Companion Or Text-Only Discussion

- 问题: 后续逐题讨论 layout/IA 时, 是否启用 visual companion 或本地浏览器
  mockup 来比较方案?

- 问题描述: layout 和 visual quality 很适合看图讨论, 但 visual companion 会增加
  token 和本地运行成本。当前这份文档先建立 text-only question inventory。

- 可行的方案:
  - A. Text-only discussion, until consensus is nearly settled。
  - B. Use visual companion for layout-heavy questions only。
  - C. Use visual companion for every question。

- 各个方案的利弊:
  - A 优点: 低成本, 决策记录清晰。缺点: 容易低估 layout friction。
  - B 优点: 只在视觉问题上用视觉工具, 成本和收益平衡。缺点: 需要选择触发点。
  - C 优点: 视觉反馈最多。缺点: 成本高, 对非视觉问题反而拖慢。

- 我的建议: 选 B。先用文字收束 Q1-Q3; 从 Q5 desktop layout 或 Q8 inspector IA
  开始, 如果 maintainer 愿意, 再看 visual companion/mockup。
