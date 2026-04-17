# **A React + Remotion-Based, AI-Native Presentation Framework — Final Analysis Report**

> **Edition**: v1.0 (Integrated)
> **Date**: 2026-04-17
> **Audience**: Potential open-source contributors and the broader technical community
> **Voice**: Industry analysis, in the lineage of a16z and Stratechery — narrative-driven, evidence-backed, editorially confident where warranted
> **Provenance**: Integrates `analysis-v0.1.md` (product narrative plus deep treatment of AI code-generation failure modes and the Remotion paradigm conflict) with `analysis-v0.2.md` (architectural consolidation: typed API, skills-first, TSX-first, render-safe layer), supplemented by original judgments on Remotion licensing, the state-to-timeline compiler's unresolved questions, the AI-consumer deck landscape, a risk register, and explicit go/no-go decisions.

---

## **0. Executive Summary**

There is a real but narrow gap in the presentation-tooling landscape today — the intersection of **React-native authoring**, **cinematic motion ceiling**, **complete presentation semantics**, and **first-class AI agent ergonomics**. No shipping product sits cleanly in all four quadrants simultaneously. A system built on Remotion can credibly target that intersection, but only if a handful of decisions are made *before* engineering begins. Without those decisions, the project quietly degenerates into "Slidev for React" or "yet another Remotion boilerplate" — both of which would be strategic failures rather than technical ones.

**Viability assessment by product shape**:

| Shape | Viability | Preconditions |
| :---- | :---- | :---- |
| Standalone open-source project | 65–70% | A deliverable state-to-timeline compiler design; audience narrowed to *developers writing technical talks*; deliberate exit from the general AI-deck race |
| Commercial SaaS | 30–40% | A negotiated arrangement with Remotion on licensing; build-out of crowded feature set (templates, collaboration, cloud rendering, comments); long PMF path |
| Dual model (OSS core + hosted cloud-render commercial tier) | 50–60% | Both of the above, but sequentially: establish OSS PMF first, then layer hosted offerings |

**The most defensible form is the dual model**. Enter as a high-quality OSS project targeting developers. Earn PMF on that basis. Only then monetize through hosted rendering, enterprise templates, and collaboration.

**Five decisions that must be made now, not in month six**:

1. **Who is the primary user?** Developers writing technical talks, or business users asking an AI to build a deck? Ninety percent of downstream decisions flow from this single answer.
2. **Can the state-to-timeline compiler design ship in Phase 0?** If not, Phase 1 should not begin.
3. **Will Remotion licensing be negotiated before Phase 1?** Commercial paths hinge on this.
4. **What is the OSS-to-commercial split?** OSS-only, SaaS-only, or dual model. Each implies a different code architecture, community cadence, and funding narrative.
5. **What is the relationship with Remotion upstream?** Partnership, independent, or a potential collision course if Remotion itself later enters the AI-deck space.

Each of the sections that follow argues for those positions with evidence, preserves what v0.1 and v0.2 each did well, and adds the risk and positioning analysis that both earlier drafts left out.

---

## **1. Positioning and Problem Definition**

The presentation-tooling market has no shortage of tools for writing slides, tools for producing complex animation, or tools that use AI to generate decks. What it lacks is any single product that does all three well while remaining React-native and genuinely pleasant for AI coding agents to target. That fourfold intersection is the opportunity. But the opportunity has to be distinguished carefully from two adjacent tracks where the competition is already dense: the developer-first slides track led by Slidev, and the consumer-facing AI-deck track dominated by Gamma, Tome, and Microsoft Copilot.

### **1.1 The developer-first code-driven presentation landscape**

| Framework | Stack | Strengths | Constraints |
| :---- | :---- | :---- | :---- |
| [Slidev](https://sli.dev/guide/why) | Markdown + Vue + Vite | Mature slide semantics, [strong AI-friendly docs](https://sli.dev/guide/work-with-ai), solid export story, active community | Tightly bound to Vue; animation ceiling tops out at CSS transitions; the React ecosystem cannot be plugged in cleanly |
| [Motion Canvas](https://motioncanvas.io/docs/presentation/) | TypeScript + Canvas | Physics-grade animation engine, frame-precise timing, native `beginSlide()` primitives | Imperative generator-based programming; decoupled from DOM ecosystem; presentation semantics still maturing (see [#213](https://github.com/motion-canvas/motion-canvas/issues/213), [#825](https://github.com/motion-canvas/motion-canvas/issues/825), [#1198](https://github.com/motion-canvas/motion-canvas/issues/1198)) |
| [reveal.js](https://revealjs.com/) | Vanilla JS + HTML | Venerable; complete speaker notes, fragments, PDF export | Limited animation ceiling; React is not a first-class citizen |
| [Marp](https://marp.app/) / [Marpit](https://marpit.marp.app/directives) | Markdown | Excellent portability of Markdown-to-slides | Document-style decks; thin on rich interaction |
| [Spectacle](https://github.com/FormidableLabs/spectacle) | React / JSX | React-native authoring, existing user base | Long-running community complaints about export, presenter mode, and transition reliability (see [#1247](https://github.com/FormidableLabs/spectacle/issues/1247), [#1287](https://github.com/FormidableLabs/spectacle/issues/1287)) |
| [Remotion](https://www.remotion.dev/) | React / TSX + timeline | Rendering, transitions, cinematic motion, Lambda-backed distributed rendering, serious AI code-generation infrastructure | Not a presentation product per se; upstream has [explicitly declined to build the consumer product layer itself](https://www.remotion.dev/docs/lovable-for-motion-graphics) |

What the table makes visible is the shape of the vacancy. Either slide semantics are mature but motion is capped. Or the framework is React-native but the presentation product layer is unfinished. Or the motion engine is world-class but the authoring paradigm is steep. No shipping product has put all four pillars in one place.

### **1.2 The AI-consumer deck track (a boundary both earlier drafts missed)**

Neither v0.1 nor v0.2 engaged seriously with Gamma, Tome, Beautiful.ai, or Microsoft's Copilot + Designer. That omission matters, because it is precisely the risk vector that could miscast this project if left unaddressed.

These products are a distinct species. They ship as SaaS with WYSIWYG editors, curated template libraries, and natural-language prompt inputs. Their users are marketing, sales, consulting, and education professionals — not engineers. Their animation ceiling is, appropriately, CSS transitions and template-swap. Their export story is web plus PPTX plus PDF; video is rarely the point. Under the hood, they do not need anything like a Remotion-grade engine, and their moats are template breadth, brand-control layers, collaboration features, and account systems.

**The strategic implication is that this project should not compete with them head-on.** Three reasons:

- They have first-mover advantage and well-capitalized runways (Gamma and Tome have completed multiple funding rounds).
- Their users do not want cinematic motion — no one building a business deck needs physics-grade spring animations.
- Entering the fight would force the project to backfill template marketplaces, collaboration, commenting, and account systems — none of which relate to the actual differentiator.

The risk is not that this project loses to Gamma in a fair fight. The risk is that the project gets *miscast* as "the open-source Gamma" by early community discourse or investor interest, and ends up with a feature roadmap shaped by a competitor it should never have been chasing. Mitigation is simple and must happen on day one: the README's opening line has to say "this is for developers writing technical talks, not business users prompting for quarterly decks." Positioning discipline at the documentation layer is the cheapest form of strategic insurance available.

### **1.3 Restating the four-condition vacancy**

| Condition | Slidev | Motion Canvas | reveal.js / Marp | Spectacle | Remotion (raw) | Gamma / Tome | **Proposed project** |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| React-native | ✗ | Partial | ✗ | ✓ | ✓ | Partial | ✓ |
| High animation ceiling | Mid | High | Low | Mid | High | Low | High |
| Complete presentation semantics | ✓ | Maturing | ✓ | Partial | ✗ | ✓ | ✓ |
| AI-agent friendly | High | Low | Low | Low | High | High (for end users) | High (for coding agents) |

The project's reason for existing is the ability to sit in all four columns at once. Conceding any one of them collapses the boundary with an existing competitor.

---

## **2. Why AI Agents Writing Raw TSX Is Not Enough**

If the goal were a single disposable HTML file, handing an AI agent the Remotion API and letting it write raw TSX would, in many cases, produce something that runs. The problem is that the real goal is different. The real goal is a system that can be maintained, revised, reused across decks, validated, and exported reliably. Against that goal, unconstrained TSX generation fails in four ways that compound each other. This section restores the argument from v0.1, which v0.2 compressed heavily — not out of editorial affection, but because this argument is the foundation for why the project needs to exist in the first place.

### **2.1 Output shape is unstable**

Without a stable interface surface, different agents, different models, and even the same agent on different days will produce wildly different code structures. One session puts all logic into a single fat component. Another invents its own step primitive. A third calls `useCurrentFrame()` directly. A fourth mixes `TransitionSeries`, a handmade transition, and a pile of ad-hoc `useEffect` hooks. This variance defeats the accumulation of standards, templates, examples, and automated repair heuristics. Every generation starts from a blank slate rather than extending an existing vocabulary.

Slidev's success is instructive here. It works well with AI in large part because it *gives* AI a stable surface: Markdown separators, YAML frontmatter, a fixed component set. The effectiveness of [Slidev's official AI workflow](https://sli.dev/guide/work-with-ai) is itself evidence that "stable interface beats longer prompt" is the right bet.

### **2.2 "Runs" does not imply "maintainable"**

When a slide simultaneously involves stepwise reveal, scene transitions, adaptive typography, resource loading, presenter notes, and export-runtime parity, asking a model to "just write React" leads rapidly to structural collapse. Under Remotion specifically, asynchronous resources, timeline logic, and export determinism enlarge the gap between "code that runs" and "code a team can live with." Known failure modes of AI-generated frontend code are well-documented: weak component architecture, overuse or misuse of `useMemo` and `useCallback`, violations of hooks dependency rules, context nesting and closure traps producing unreproducible re-renders. These are manageable problems in a CRUD app. In a timeline-driven presentation, a single misplaced effect destabilizes an entire page's animation timing.

### **2.3 Visual correctness is not caught by unit tests**

For business logic, agents can iterate via unit tests — write code, run test, observe, fix. For slides, correctness is overwhelmingly visual and temporal: does content overflow, is it too dense, is the step cadence natural, is the transition jarring, does the browser preview match the exported MP4? None of this is caught by a test runner. What the system actually needs is a **constrained authoring surface** that removes the space to go wrong in the first place, a **reproducible runtime validation loop** that runs after every generation, and **clear failure signals** so the agent knows what to fix next.

It is worth being honest that full automation of visual QA is likely impossible. Playwright-based screenshot diffing and overflow detection require real browser measurement; both cost compute and both are flaky. The pragmatic response is to split validation into two tiers: **compile-time checks** (typed API structure, props, resource references) should be exhaustive; **runtime visual checks** (overflow, density, timing) should ship in a minimal form with explicit room for human review. A system that silently *claims* to have validated visuals is more dangerous than one that openly admits the check is best-effort.

### **2.4 The conclusion: constraint, but not a heavy DSL**

v0.1 concluded that a "defensive component sandbox" was needed. v0.2 sharpened that into "constrained authoring surface + render-safe layer + repair loop." The final report stays with the v0.2 framing:

> The agent genuinely needs a stable constraint layer. But that layer's earliest form should not be a full DSL. It should be a thin typed API (TS DSL) plus a render-safe component layer plus a repeatable validate-and-repair loop.

When a full DSL *does* eventually become warranted is the subject of §6. Until then, effort goes into making the typed API and render-safe layer sharp and opinionated.

---

## **3. What Remotion Does and Does Not Do**

Remotion is more than sufficient as the runtime, rendering, and export backbone of this project. Its player, transition library, AI codegen infrastructure, and Lambda-backed cloud rendering cover the deep plumbing. What it is not, by its own framing, is a complete presentation product. And between those two facts sits the central technical question the project must answer: how to reconcile Remotion's frame-driven model with the event-driven nature of slide navigation. There is also a third fact both earlier drafts omitted — Remotion's licensing model — which the final report must surface, because it constrains the product's commercial shape in ways the engineering discussion cannot override.

### **3.1 What Remotion already provides**

| Capability | Official entry point |
| :---- | :---- |
| Embeddable playback | [`@remotion/player`](https://www.remotion.dev/docs/player/player) |
| Custom controls and fullscreen | [custom controls](https://www.remotion.dev/docs/player/custom-controls) |
| Scene transitions | [`@remotion/transitions`](https://www.remotion.dev/docs/transitions/) |
| AI code generation | [Generate](https://www.remotion.dev/docs/ai/generate) |
| JIT preview | [Dynamic compilation](https://www.remotion.dev/docs/ai/dynamic-compilation) |
| AI rules / system prompt / skills / MCP | [AI overview](https://www.remotion.dev/docs/ai/) |
| Editor starter | [Editor Starter](https://www.remotion.dev/docs/editor-starter) |
| Distributed rendering | Remotion Lambda |

On the checklist of "paginate, transition, animate, play in a browser, export to video," Remotion's primitives are already strong enough.

### **3.2 What Remotion does not natively provide**

Remotion's primitives are low-level by design. What it does not ship is the presentation product layer — and that layer is substantial:

- **Deck semantics**: slide, step, hidden slide, chapter, outline
- **Presenter semantics**: speaker notes, next slide preview, timer, presenter-side controls
- **Authoring semantics**: a stable authoring surface, templated layouts, local edits
- **Validation semantics**: overflow checks, cadence checks, asset-load safety, export parity

Public issues confirm the boundary. [Marp Support #5573](https://github.com/remotion-dev/remotion/issues/5573) reflects active demand for a "slides → Remotion" bridge. [More transition effects #3357](https://github.com/remotion-dev/remotion/issues/3357) shows that the community already treats Remotion as a presentation-grade motion system. [Custom control in player #6306](https://github.com/remotion-dev/remotion/issues/6306) demonstrates that the player alone is not a complete presentation surface. The gap is not imagined. It is visible in the issue tracker.

### **3.3 The core paradigm conflict: continuous frames vs. discrete events**

This is the single deepest technical question the project must answer, and it is where v0.1's treatment deserves to be preserved in full. A traditional slide deck is event-driven: show slide N, wait for input, advance to slide N+1. Everything is triggered by discrete events. Remotion, by contrast, is frame-driven: everything is a deterministic computation along a timeline, and every animation — `spring`, `interpolate`, all of it — depends on `useCurrentFrame()`. To simulate a slide deck using Remotion, an author must pre-plan the start and end frames of every page, pause on specific frames, wait for input, and resume into transitions. The entire timeline must be computed ahead of time.

Three concrete problems fall out of this mismatch.

First, the system is **precision-sensitive**. A `pause()` that fires one frame late produces a visible flash of the next slide. Browser compositor lag, a multi-process timing phenomenon Remotion itself documents under [flickering](https://www.remotion.dev/docs/flickering), amplifies the problem.

Second, it is **brittle under revision**. Inserting or deleting any single slide invalidates the absolute frame coordinates of every subsequent slide.

Third, and most importantly for this project, it is **hostile to agent authoring**. Asking a language model to maintain globally consistent frame coordinates across dozens of slides, while also writing the page content, is a path to compounding errors.

The state-to-timeline compiler described in §4 is this project's answer to that problem. Whether the compiler can be designed cleanly is the single largest open technical question, and it is also the first go/no-go decision.

### **3.4 Multi-threaded rendering safety (recovered from v0.1)**

To support Lambda's parallel rendering, Remotion's engine requires that animation logic be decoupled from real-world time and asynchronous state. Components with non-deterministic state from async fetches, uncontrolled `setTimeout` delays, or external-clock dependencies will produce out-of-order frames and flickering when rendered in parallel. The sanctioned pattern is to use `delayRender` and `continueRender` to hold the engine open until assets are ready; the escape hatch is `--concurrency=1`, which sacrifices Lambda's speed advantage. For this project, the implication is direct: agents generating code freely will walk into these traps routinely. The render-safe component layer described in §4.2 exists precisely to encapsulate these invariants into controlled components, so that agents never see the raw surface on which they could go wrong.

### **3.5 Remotion licensing and the commercial boundary (a gap in both prior drafts)**

[Remotion's license](https://www.remotion.dev/docs/license) is tiered. Individuals, students, and small teams use it for free. Larger companies, above a documented employee threshold, pay for commercial use. Remotion Lambda is billed by usage. These facts have three consequences the earlier drafts never surfaced:

A **pure OSS path** is straightforward: the project itself can ship under MIT or Apache. But end users whose companies exceed the licensing threshold still owe Remotion directly. This must be documented explicitly in the project's README, or the project will create a compliance blind spot for its users.

A **commercial path** — anything that wraps Remotion Lambda as a hosted SaaS — requires a direct conversation with Remotion upstream about reseller or enterprise arrangements. This is not a Phase 3 problem. If the license is unclear, pricing is unclear, and the entire commercial thesis is unbuildable.

A **continuity risk** exists independently: Remotion's licensing terms could evolve, and that evolution could reshape the project's economics. The risk is not that this is likely. The risk is that mitigation has to happen at the architectural level, by keeping the renderer abstraction clean enough that a different engine could, in principle, be swapped in — even if no equivalent exists today.

The single genuine unknown is whether Remotion upstream will itself enter the AI-deck space in the next three to five years. Their [public statement](https://www.remotion.dev/docs/lovable-for-motion-graphics) declines to build "Lovable for Motion Graphics" today. Statements can change.

### **3.6 The accurate framing**

The statement to make is not "Remotion can replace PowerPoint." Nor is it "wrap Remotion and you have a slides system." The accurate framing is narrower and more interesting:

> Remotion is sufficient as the runtime, rendering, and export backbone of a slides system, but the presentation product layer, the state-to-timeline abstraction, and the licensing boundary must be supplied by the project that sits on top of it. That is precisely why this project should exist.

---

## **4. The Core Architecture: Typed API plus Render-Safe Layer**

The single most important engineering decision in Phase 1 is to ship a **thin typed API** — a TS DSL in the sense of "a TypeScript surface that encodes presentation semantics" — paired with a **render-safe component layer**. The typed API gives agents and human authors a stable target. The render-safe layer absorbs Remotion's sharper edges into controlled components. Between them sits the **state-to-timeline compiler**, which translates discrete slide and step state into Remotion's continuous frame domain. The compiler is the project's deepest technical bet. Both earlier drafts mentioned it. Neither engaged seriously with its edge cases. This section does.

### **4.1 Why the typed API comes first**

Letting agents write against raw Remotion in Phase 1 creates three problems simultaneously. Output style diverges uncontrollably and prevents standards from accumulating. Static analysis and automated repair become impossible because the code shape is a moving target. Any later attempt to layer an IR, MDX authoring, or a visual editor runs aground on the inconsistent substrate below.

The typed API solves all three by giving agents a stable object to aim at. Importantly, it is not a DSL in the heavy sense. It is not a new language with a parser. It is not a visual syntax. It is not an attempt to abstract every animation detail. It is a React/TypeScript wrapper around presentation semantics — a surface for `Deck`, `Slide`, `Step`, `Transition`, `Notes`, `Theme`, duration tokens, and layout slots. That surface is what the agent writes against, what the compiler consumes, and what validation runs over.

Three principles keep the surface honest:

**Thin and sharp.** It encodes only the stable semantics of presentation. It does not attempt to abstract every visual or animation choice.

**Default path, not exclusive path.** Raw React and raw Remotion remain escape hatches. The typed API is what the system recommends; it is not a wall that prevents innovation.

**Compilation targets are explicit.** The value of the typed API is not prettier syntax. Its value is that the system can reliably produce a runtime state machine, a slide-and-step map, a timeline mapping, validation hooks, and presenter metadata from it.

### **4.2 The render-safe component layer**

v0.2 introduced this idea, and it is one of the most valuable contributions of the second draft. Put plainly:

> The render-safe layer takes Remotion's async traps, asset loading requirements, export timing constraints, and flickering pitfalls, and encapsulates them inside a small set of controlled components. The effect is that an agent generating code cannot easily bypass the safety invariants.

The initial roster covers the common failure surfaces:

| Component | Absorbs |
| :---- | :---- |
| `<SafeImage>` | Automatic `delayRender` until load; explicit failure path |
| `<SafeFont>` | No text render until font is ready; prevents FOUT/FOIT flashes |
| `<SafeVideo>` | Preloads video, withholds playback until metadata is available |
| `<TypographyBox>` | Built-in overflow detection; triggers auto-fit or errors loudly |
| `<MediaFrame>` | Uniform media container handling aspect ratio, poster, export snapshot |
| `<ContentSlot>` | Layout slot with density and readability heuristics |

A few design judgments keep the layer useful rather than ritual. It does not forbid raw React; it is the default, not a wall. It must fail loudly — silent fallbacks would let agents believe their output was correct when it was not. And the component boundaries must be orthogonal: `<SafeImage>` must not assume a layout; `<TypographyBox>` must not assume a media context.

### **4.3 The state-to-timeline compiler: the deepest technical bet**

Both earlier drafts mention a "state-to-frame compiler" or "state-to-timeline compiler" in a single sentence. For a report aimed at open-source contributors, that is not enough. The compiler is where the project's viability is won or lost. If its abstraction leaks, every typed API call above it will leak too.

Its responsibilities are straightforward to state:

1. Traverse the deck component tree and collect each slide's duration and step declarations.
2. Produce an internal global timeline map: `slideId → [entry frame, exit frame]`.
3. Map step state (which step is active) onto sub-intervals of the timeline.
4. Expose runtime APIs — `goto(slideId, stepIndex)`, `next()`, `previous()` — that translate into precise `seekTo(frame)` calls.

The known edge cases are where the design must be made honest:

| Edge case | The question | A starting answer |
| :---- | :---- | :---- |
| Variable-duration steps | Some steps last until user input, not a fixed duration | Distinguish fixed-duration from wait-for-event steps; the latter occupy expandable intervals on the timeline that the runtime stretches dynamically |
| Mid-transition navigation | What happens when the user hits "next" while the current transition is playing? | Three strategies — `finish-then-advance`, `cut-to-next`, `queue-next` — with `cut-to-next` as the default and author-configurable |
| Asynchronous asset alignment | What if the next slide's assets are not ready when the user advances? | Coordinate with the `delayRender` state from `<SafeImage>` and friends; provide a loading overlay as the default |
| Overlapping transitions | `TransitionSeries` overlaps two slides during a transition — how does the state machine represent "in transition"? | Introduce a third state: `in-transition(fromSlide, toSlide, progress)` |
| Scrubbing and replay | When the user rewinds or drags a progress handle, how should intermediate step state replay? | Distinguish visual seek (jump directly) from logical replay (step through); default to visual seek |
| Nested decks | Future support for decks inside decks — how do timelines compose? | Phase 2+ problem; Phase 1 does not support nesting |

Each row of that table is a real decision that will have to be made before Phase 1 begins. The right venue for those decisions is an independent `compiler-design.md` produced during Phase 0, written against a set of test cases that encode the boundary behavior. The compiler ships before the typed API. Not after.

The realistic unknown is that the above list is not exhaustive. Early alpha use will surface edge cases no reasonable design reviewer would anticipate. The mitigation is to keep the compiler surface small, the decisions explicit, and the test suite extensible.

### **4.4 The runtime player**

Thin wrapper around `@remotion/player`, providing keyboard navigation, click-to-advance regions (configurable), fullscreen (reusing `doubleClickToFullscreen`), step-level forward and back, presenter metadata (current slide, current step, elapsed time), and an extension point for the speaker view that Phase 3 will build on.

---

## **5. AI Integration: Skills First, MCP Later**

The priority in Phase 1 is to build skills, instructions, and system prompts — not MCP. MCP earns its place later, once dynamic resource lookup, structured tools, or cross-IDE reuse become actual bottlenecks rather than speculative ones. This is the posture v0.2 advocated, and it remains correct. The paragraphs that follow explain the reasoning in terms an open-source contributor can act on.

### **5.1 Skills and MCP solve different problems**

[Skills, instructions, and memory](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) answer the question "what should the agent do?" They encode taste, norms, constraints, and repair workflows. [MCP](https://modelcontextprotocol.io/docs/learn/architecture), by contrast, answers "what can the agent access?" It standardizes the exposure of resources, tools, and prompts. These are parallel mechanisms. They are not substitutes. In practice, skills tend to come first because they directly shape output quality, and MCP arrives when reuse or scale demand it.

### **5.2 Why Phase 1 skill work pays back more than Phase 1 MCP work**

The largest early risk is not that the agent cannot reach external tools. The largest early risk is that the agent cannot reliably *write correct slides*. Skill work directly addresses that risk with a short feedback loop: the author improves a skill, the next generation is visibly better, the skill improves again. MCP server maintenance, by contrast, is a meaningful cost — cross-IDE compatibility, versioning, authentication, discoverability — and pays back only when the documentation and template corpus has grown past what plain Markdown context can carry. Phase 1 will not be at that scale.

Remotion's own trajectory is consistent with this ordering. Upstream ships [skills](https://www.remotion.dev/docs/ai/skills) and [system prompts](https://www.remotion.dev/docs/ai/system-prompt) as first-class, with [MCP](https://www.remotion.dev/docs/ai/mcp) as parallel infrastructure rather than the primary entry point.

### **5.3 Recommended three-phase introduction**

| Phase | Capability | Trigger |
| :---- | :---- | :---- |
| Phase 1 | AI-ready docs + system prompt + skill pack + project instructions | Default |
| Phase 2 (optional) | Read-only MCP exposing resources and prompts | When docs and templates scale past what plain Markdown can carry |
| Phase 3 (conditional) | Tool-based MCP with `validate_deck`, `render_preview`, `inspect_composition` | When multiple agents or IDEs need a shared capability surface |

### **5.4 Phase 1 skill pack**

A recommended initial roster: `layout-composition` for layout and density; `motion-transitions` for transition selection and cadence; `speaker-notes` for tone and information density; `data-viz-slides` for visualization page generation and constraints; `brand-qa` for brand consistency; `render-debugging` for diagnosing common flickering and asset-loading issues; `render-safe-components` for correct use of the controlled component layer and its anti-patterns.

### **5.5 The operating principle**

> Taste, rules, and workflows go into skills and instructions. Dynamic data, structured lookup, and cross-tool actions go into MCP. Do not conflate them, and do not front-load MCP before the skills that define the project's authorial voice even exist.

---

## **6. Authoring Strategy: TSX-First, Schema-Assisted, DSL-Last**

Contemporary language models can write usable TSX and JSX today. That is not speculation; it is the explicit working assumption behind Remotion's own [AI codegen pipeline](https://www.remotion.dev/docs/ai/generate) and [dynamic compilation](https://www.remotion.dev/docs/ai/dynamic-compilation). The conclusion this project should draw is straightforward: in Phase 1, let the agent write typed-API-constrained TSX directly. JSON and MDX remain supporting media, not replacement media. A full DSL enters the picture only after specific pressures make it worth building; this section names those pressures and describes the form a future DSL should take.

### **6.1 Why TSX-first is viable now**

Remotion's own documentation demonstrates end-to-end workflows where LLMs generate TSX, the framework compiles it dynamically, and the output is playable and exportable. Combined with the typed API (§4), the agent is not writing raw Remotion — it is writing **typed-API-constrained TSX**. That constraint is what makes the approach tractable where unconstrained TSX generation would not be.

### **6.2 What JSON and MDX are good for, and what they are not**

JSON and schemas are excellent at deck metadata, slide structure, theme tokens, asset references, and validation contracts. They are poor at expressing complex animation, high-freedom layout, and the full combinatorial space of React component composition that the final render layer requires.

[MDX](https://mdxjs.com/docs/what-is-mdx/), which is simply Markdown plus JSX, is a strong authoring medium for text-heavy slides, notes, and documentation-first decks. It is *not* the right final execution format for a complex motion system, but it is an excellent intermediate layer for content.

The point is not that these formats are weak. The point is that they are supplementary. TSX remains the execution format.

### **6.3 When a full DSL actually earns its place**

A DSL becomes warranted when specific requirements appear — not before:

1. Stable local edits are required, rather than full-page regeneration.
2. Strong validation, auditing, or multi-tenant constraints are mandatory.
3. A visual editor with structured diff-and-merge is on the roadmap.
4. Cross-renderer or cross-format import/export is a requirement.
5. Non-programmers need to maintain decks for the long term.

Until these are primary concerns, introducing a DSL adds a compilation layer and a failure surface without paying for either. In practice, most projects that start with "we need a DSL" underestimate the combined cost of designing a language, writing a parser, iterating on authoring ergonomics, and maintaining runtime semantics — four problems that they end up solving in parallel at the expense of the product they set out to build.

### **6.4 If a DSL is eventually needed, prefer two layers to one**

The form that has the best track record in comparable domains is:

1. **Human layer**: MDX or Markdown with a constrained component library and a small amount of frontmatter.
2. **System layer**: Zod or JSON Schema IR.

Runtime still compiles to React, TSX, and Remotion. This two-layer structure is human-readable and -writable, easy for agents to generate and validate, trivial to allow-list at the component level, and failure-localized so that authoring, IR, and rendering can be debugged independently.

### **6.5 The operating principle**

> Build a code-generation system first. Do not become a language-design project by accident.

---

## **7. Staged Roadmap**

v0.2 proposed a four-phase roadmap. The final report preserves the structure, adds a Phase 0 for technical and licensing groundwork, narrows the Phase 1 MVP significantly, and prunes the commodity features that would otherwise creep into Phases 3 and 4. Each phase has an explicit exit condition and a go/no-go decision at its boundary.

### **Phase 0: Technical Pre-Commitment (new; required before Phase 1)**

The goal is to answer, concretely, the two most urgent questions from the executive summary: can the compiler be designed cleanly, and is the licensing arrangement with Remotion viable?

Four deliverables leave Phase 0:

1. **`compiler-design.md`** — an independent technical design for the state-to-timeline compiler, covering every edge case in §4.3 with decisions, test cases, and boundary behavior documented.
2. **Licensing notes with Remotion** — written confirmation of the commercial boundary, whether hosted-tier reselling is negotiable, and any constraints on commercial wrapping.
3. **Audience declaration** — a README draft that names the project's target user, and by exclusion, everyone it is *not* built for.
4. **MVP scope letter of intent** — what Phase 1 will ship, and what it will not.

Phase 0 exits when these four documents pass review by the core contributors. If any of them cannot be produced, the project should pause and re-evaluate rather than proceed on hope.

### **Phase 1: Core Framework and Typed API (narrowed MVP)**

The goal is a minimum viable presentation-semantics adapter — *not* a complete presentation system. Seven items constitute the work:

1. A thin typed API covering the six primitives `Deck`, `Slide`, `Step`, `Transition`, `Notes`, `Theme`.
2. The state-to-timeline compiler, implemented against the Phase 0 design.
3. The runtime player, with keyboard navigation, click-to-advance, fullscreen, step-level motion, and presenter metadata.
4. Escape hatches preserved: raw Remotion remains available.
5. The initial render-safe component layer — the six components enumerated in §4.2.
6. The minimum validation loop: compile-time checks, static props validation, asset-load safety, and a basic overflow/timing QA.
7. AI infrastructure: AI-ready docs, a system prompt, and five high-quality skills.

The list of what Phase 1 deliberately does *not* ship is equally important: template marketplace, collaboration, commenting, version history, multi-device control, hosted cloud rendering.

Exit conditions: an agent-generated thirty-page technical talk runs reliably and exports to MP4. Five external alpha users complete end-to-end feedback cycles. The public typed API surface remains stable (no breaking changes) for at least one month.

### **Phase 2: Strengthening AI Authoring**

The goal is for the agent to reliably produce conformant decks. Work includes: continued iteration on AI-ready docs and project instructions; the skill pack expanding to ten or more skills; an automated compile-error-repair loop; a thin IR introduced on an as-needed basis (slide IDs, layout kinds, theme tokens, notes, asset references, timing tokens); and, optionally, a read-only MCP exposing resources and prompts once the documentation and template corpus justifies it.

Exit condition: alpha users' average "prompt to shippable deck" iteration count is three or fewer.

### **Phase 3: Filling in the Presentation Product Layer (pruned)**

Preserved from v0.2: local presenter controls and metadata (next slide preview, timer, notes, presenter-side navigation); hidden slides, chapters, overview, and outline; more transition effects and page mode components; data visualization and complex page templates; an intelligent typography and density engine (auto-fit text, overflow prevention, density budgeting, readability heuristics).

Explicitly deferred: template marketplaces (a commodity feature that does not touch the differentiator), and collaboration / commenting / version history (an extraordinarily high-barrier feature set that is not the project's moat).

Exit condition: ten or more developers have used the system in production-adjacent real-world scenarios and delivered feedback.

### **Phase 4: Export, Collaboration, and Protocol Extensions (further pruned)**

Preserved: Remotion Lambda integration for cloud export; stable support for web bundle, MP4, and PDF; a two-way interactive, multi-device control console (the "speaker mode" framing from v0.2 remains the cleanest productization of this capability); and tool-based MCP once the use case is concrete rather than speculative.

Deferred indefinitely: template marketplace, comments, version history — these should not ship before PMF is clear and the commercial path is decided.

Exit condition: depends on PMF state and the commercialization decision (see §9).

---

## **8. Risk Register**

The risk register is where the report stops speaking in abstractions. Every major risk needs a clear trigger, a mitigation, and, where appropriate, an honest admission of what remains unknown.

### **8.1 Technical risks**

| Risk | Trigger | Mitigation | Unknown |
| :---- | :---- | :---- | :---- |
| Compiler design flaw | Abstraction leaks or a critical bug surfaces in real use | Independent design doc in Phase 0; compiler ships before typed API; extensive test suite | Count and severity of edge cases will only emerge in alpha |
| Incomplete render-safe coverage | Agent generates code that bypasses controlled components and hits Remotion's sharper edges | Component allowlist + static checks + an anti-pattern skill; escape hatches must include clear warnings | New unsafe patterns may emerge as Remotion itself evolves |
| Validation loop does not scale | Overflow/density/timing checks cannot be automated at acceptable cost | Two-tier model: compile-time checks exhaustive; runtime visual checks minimal and allow human review | Full automation of visual QA may never be feasible |
| Typed API instability | Frequent breaking changes in alpha prevent ecosystem formation | Freeze the shape of the first-tier primitives in Phase 0; internal implementation can evolve, public API changes with discipline | — |

### **8.2 Commercial and licensing risks**

| Risk | Trigger | Mitigation | Unknown |
| :---- | :---- | :---- | :---- |
| Unfavorable Remotion license terms | Future terms shift and impair commercialization | Direct conversation with Remotion in Phase 0; renderer abstraction preserves optionality | The trajectory of Remotion's licensing policy over the next three to five years |
| Uneconomical Lambda cost model | Hosted margins do not cover infrastructure | Ship self-hosted first; hosted SaaS deferred to Phase 4+ | Actual usage-to-cost ratios per deck |
| No commercial path | OSS adoption without paid conversion | Dual model: OSS reaches PMF, then hosted tier, enterprise templates, and collaboration layer | Conversion rates from developer-tool OSS to commercial revenue are generally weak |

### **8.3 Positioning risks**

| Risk | Trigger | Mitigation | Unknown |
| :---- | :---- | :---- | :---- |
| Fuzzy audience | The project tries to serve both developers and business users at once | README makes positioning explicit on line one; refuse the "open-source Gamma" framing | — |
| Pressure to build commodity features | Community or investors push for templates, collaboration, comments | Phase 3 and 4 prune these explicitly; accept a clear division of labor with Gamma/Tome | How much user drop-off the positioning discipline will cost |
| Developer-tool / AI-tool narrative conflict | TSX-first attracts developers; agent-first attracts AI-native users | These are not actually in tension; the typed API is the shared interface for both | Which narrative dominates long-term remains unclear |

### **8.4 Competitive risks**

| Risk | Trigger | Mitigation | Unknown |
| :---- | :---- | :---- | :---- |
| Slidev closes the React and motion gap | Slidev ships a React track or a motion plugin | Defend the dual moat of "React-native + cinematic motion"; prioritize time to market | Whether Slidev's maintainers have incentive to cross stacks |
| Remotion internalizes a slides product | Upstream reverses its current stance from the [lovable-for-motion-graphics statement](https://www.remotion.dev/docs/lovable-for-motion-graphics) | Maintain ongoing dialogue; keep the typed API design independent enough to adapt to another renderer if required | Whether market pressure will shift upstream's position |
| Gamma/Tome introduce a code mode | Consumer AI-deck products add developer-facing APIs | Stay focused on technical-talk differentiation; do not pursue generality | Whether either company will invest in a developer track |
| A competing OSS project ships first | An independent team reaches the same conclusion and executes faster | Speed in Phase 0–1; publish early and build brand | — |

### **8.5 Organizational and execution risks**

| Risk | Trigger | Mitigation | Unknown |
| :---- | :---- | :---- | :---- |
| Single-maintainer bus factor | All core knowledge lives in one person | Recruit co-maintainers early; document critical decisions | — |
| High contributor onboarding cost | Typed API, compiler, and render-safe layer combine into a steep learning curve | Invest in contributor-facing architecture docs; ship minimal complete examples per layer | — |
| Community governance vacuum | Discussion, triage, and RFC processes are absent | Establish an RFC process in Phase 1; publish a clear Code of Conduct and governance boundaries | — |

---

## **9. Go/No-Go Decision Points**

The following five questions are not deferrable. Answering them wrong — or refusing to answer them — is the most likely path to the project quietly failing in month six.

### **Q1. Is the primary user a developer writing technical talks, or a business user asking AI for a deck?**

Choosing developers means every downstream decision privileges developer ergonomics, code quality, and export fidelity. The MVP in §7 follows. Choosing business users means a multi-year buildout of templates, WYSIWYG editors, accounts, and collaboration — and a head-on fight with Gamma and Tome. The recommended answer, for the reasons laid out in §1.2, is developers. Not answering the question produces a feature roadmap that tries to serve both and ends up serving neither.

### **Q2. Can the state-to-timeline compiler design ship in Phase 0?**

If yes, Phase 1 can start. If no, the project should pause or re-scope. There is no version of this project where the compiler is not central; attempting to build the typed API on top of an unfinished compiler design is a recipe for the mid-Phase-1 rewrite nobody enjoys. The recommended allocation is four to six weeks of focused Phase 0 effort. The cost of not answering this question is a compiler abstraction that collapses mid-implementation and invalidates every line of typed API code built on it.

### **Q3. Will Remotion licensing be negotiated before Phase 1 begins?**

If yes, the dual-model commercial path can be scoped from day one. If no, the project should explicitly take the OSS-only path and defer commercialization until upstream's posture is clear. Even a written confirmation of intent — not a formal contract — is enough to de-risk the project's architecture. The recommendation is to reach out proactively in Phase 0 regardless of the longer-term plan. The cost of silence is discovering compliance problems in Phase 3 or 4, when the architecture is too entrenched to change cheaply.

### **Q4. What is the OSS-to-commercial split?**

Three options: OSS-only trades commercial upside for speed and clean compliance; SaaS-only incurs the cost of backfilling too many commodity features before PMF is plausible; the dual model accepts both and phases them — OSS first, hosted second. The recommended answer is the dual model, and the decision needs to be made up front because it affects code architecture. Deciding to commercialize after the fact, on a codebase that never anticipated the split, is a painful retrofit.

### **Q5. What is the relationship with Remotion upstream?**

Three postures: partnership (joint promotion, cross-referenced docs, possible licensing accommodation); independent (polite distance); potential collision (upstream later enters the AI-deck space, requiring demonstrable differentiation). The recommendation is to open the partnership conversation in Phase 0 while simultaneously building architectural optionality — a clean renderer abstraction — as long-term insurance. The cost of deferring this question is being caught flat-footed if upstream's position evolves.

---

## **10. Conclusion and Next Steps**

Seven statements summarize where the analysis lands.

The **project's direction is sound**. The gap it targets is not "another slides tool." It is a system layer built on React and Remotion, organized around presentation semantics, and designed for AI agents to co-author.

**Remotion is sufficient but incomplete**. It provides the runtime, rendering, and export backbone. The presentation product layer, the state-to-timeline abstraction, and the licensing boundary must be supplied above it. That requirement is precisely the project's reason for existing.

**The architectural spine is clear**: typed API first, render-safe layer first, skills first, MCP and heavy DSL deferred, TSX-first authoring. This is v0.2's most valuable contribution and it is preserved in full.

**The critical technical bet is the state-to-timeline compiler**. Its design must ship, in independent document form, in Phase 0. Phase 1 should not begin until it does.

**Commercial decisions belong up front**. The Remotion licensing boundary, the dual-model commercial structure, and the cloud-rendering cost model each need an intent-level answer before engineering accelerates.

**Audience must be narrowed**. The project serves developers writing technical talks and technical content creators. It does not compete with Gamma and Tome for the general AI-deck market. That discipline needs to live in the README's first line.

**The roadmap must be stoppable and turnable**. Each phase has explicit exit conditions. The commodity features that would otherwise accrete in Phases 3 and 4 are pruned deliberately, to prevent the project from becoming "another comprehensive tool with no PMF."

**Concrete next steps, in sequence:**

In weeks one and two, draft `compiler-design.md` and open a licensing conversation with Remotion. In weeks three and four, close review on the compiler design and formalize the audience declaration in the README. In weeks five through eight, begin Phase 1 engineering: the first typed API surface, the render-safe layer, and the compiler implementation. In weeks nine through twelve, onboard five external alpha users, ship the first skill pack, and deliver v1 of the validation loop. From month four onward, let the alpha feedback decide whether the project enters Phase 2 or returns to Phase 0 for correction.

**The project's final definition, condensed to one sentence:**

> A next-generation presentation system that uses React as its authoring surface, Remotion as its runtime, rendering, and export backbone, a thin typed API as its semantic bridge, skills as the primary AI collaboration entry point, and a render-safe component layer as its safety floor — built for developers writing technical talks and for the AI agents that help them do so.

---

## **References**

### Competitive and ecosystem landscape

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

### Remotion official documentation

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

### Protocols and AI agent workflows

- [Model Context Protocol: Architecture](https://modelcontextprotocol.io/docs/learn/architecture)
- [OpenAI Docs MCP](https://developers.openai.com/learn/docs-mcp)
- [GitHub Copilot: About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [MDX: What is MDX](https://mdxjs.com/docs/what-is-mdx/)

### AI-consumer deck reference points

- [Gamma](https://gamma.app/)
- [Tome](https://tome.app/)
- [Beautiful.ai](https://www.beautiful.ai/)
- [Microsoft Copilot in PowerPoint](https://www.microsoft.com/en-us/microsoft-365/copilot)
