# Cadenza

> **For developers and technical communicators who want cinematic, code-reviewable, AI-augmented presentations.**

Cadenza is a React + Remotion based presentation framework that brings together four qualities no existing tool has put in one place: **React-native authoring**, a **cinematic motion ceiling**, **complete presentation semantics** (decks, slides, steps, transitions, notes, presenter view), and **first-class ergonomics for AI coding agents**.

It is not a Gamma replacement. It is not a WYSIWYG slide editor. It is a developer-facing framework for people who write technical talks, data-heavy explainers, and documentation-first decks — and for the AI agents that increasingly help them do so.

---

## Status

**Pre-alpha. Current routing phase: Phase 1 closeout-ready.**

Phase 1 has produced the semantic core: the typed TSX API surface, state-to-timeline
compiler, runtime intent/navigation layer, render-safe metadata and DOM helper,
validation reports, first authoring skills, and an all-domain MVP fixture.
Builder work and the selected closeout remediations are trace-complete in
[`trace/phase1/`](./trace/phase1/).

The root project pointer still intentionally remains on Phase 1 until the
maintainer approves the phase transition. The prepared next step is Phase 2
Architect Stage A for the React + Remotion Preview Adapter, starting from
[`prompt/PHASE2_KICK_ARCHITECT.md`](./prompt/PHASE2_KICK_ARCHITECT.md).

The current roadmap is [`ROADMAP.md`](./ROADMAP.md). Earlier strategic analysis
that led to the project lives in
[`docs/analysis/analysis-final.md`](./docs/analysis/analysis-final.md)
(English) and [`docs/analysis/analysis-final.zh.md`](./docs/analysis/analysis-final.zh.md)
(中文).

---

## Why Cadenza

The state of the art, honestly stated:

- **Slidev** is mature for Markdown-driven slides, but it is Vue-native and caps out on animation complexity.
- **Motion Canvas** has world-class motion primitives but an imperative generator paradigm that is hostile to AI code generation and decoupled from DOM ergonomics.
- **Spectacle** is React-native but the presentation product layer has been under-invested for years.
- **Remotion** is an outstanding rendering and animation backbone — but Remotion upstream has [explicitly declined to build a presentation product on top of itself](https://www.remotion.dev/docs/lovable-for-motion-graphics), and its frame-driven model is fundamentally at odds with the event-driven navigation slides require.
- **Gamma, Tome, Beautiful.ai, Copilot + Designer** are excellent AI deck tools for business users. They are not developer tools. We are not competing with them.

Cadenza sits in the gap those leave open.

---

## Architecture at a Glance

```text
┌────────────────────────────────────────────────────────────┐
│  Author-facing Typed API (thin, React-native)              │
│  <Deck> / <Slide> / <Step> / <Transition> / <Notes> / ...  │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│  State-to-Timeline Compiler                                │
│  discrete deck tree → continuous Remotion timeline         │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────▼────────────────────────────────────┐
│  Render-Safe Component Layer                                  │
│  <SafeImage> / <SafeFont> / <TypographyBox> / <MediaFrame>    │
│  Encapsulates Remotion's asset-loading and timing invariants  │
└──────────────────────────┬────────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│  Remotion Runtime (Player / Transitions / Lambda export)   │
└────────────────────────────────────────────────────────────┘
```

Four ideas carry the architecture:

1. **Typed API first, DSL last.** Agents and authors target a stable TypeScript surface. DSL (if ever needed) is a Phase 3+ concern.
2. **Render-safe layer as default path.** Asset-loading traps, font timing, export determinism are absorbed by controlled components. Raw Remotion remains available as an escape hatch.
3. **Skills before MCP.** Early AI investment goes into `AI-ready docs + system prompts + skill pack`. MCP is layered later, once structured lookup becomes a real bottleneck.
4. **TSX-first authoring.** Modern LLMs write usable TSX today. We constrain them through the typed API, not through a new language.

See [`docs/analysis/analysis-final.md`](./docs/analysis/analysis-final.md) §4 for the full argument.

---

## Who This Is For

**Built for:**

- Developers giving React Summit / KubeCon / JSConf technical talks
- Technical writers building data-heavy explainers (statistics, distributed systems, compilers, etc.)
- Educators producing programming course material
- Documentation-first teams who want slides as code-reviewable artifacts
- AI coding agents that generate decks for any of the above

**Not built for:**

- Business users looking for AI-generated quarterly decks — see [Gamma](https://gamma.app/) or [Tome](https://tome.app/)
- Teams that need WYSIWYG editing, real-time collaboration, comments, or version history as a primary workflow — at least not before the core framework reaches 1.0
- Users who don't want to touch code

If you're not sure whether this is for you, skim [`goals-non-goals.md`](./goals-non-goals.md) and [`docs/analysis/analysis-final.md`](./docs/analysis/analysis-final.md) §1.2.

---

## License

Cadenza is licensed under the **Apache License 2.0**. See [`LICENSE.txt`](./LICENSE.txt) and [`NOTICE.txt`](./NOTICE.txt).

### A Note on Remotion Licensing

Cadenza is built on top of [Remotion](https://www.remotion.dev/). **Remotion has its own license** that is separate from Cadenza's Apache 2.0 license:

- Individuals, students, and small teams can use Remotion for free under its [Remotion License](https://www.remotion.dev/docs/license).
- Companies above a specified employee threshold require a commercial Remotion license.
- Remotion Lambda (cloud rendering) is a paid service.

**Using Cadenza does not exempt you from Remotion's license requirements.** If your organization is subject to Remotion's commercial licensing, you must obtain that license directly from Remotion. Cadenza does not redistribute Remotion; it depends on it as a peer dependency.

---

## Project Governance

- **Maintainer**: [@DrEden33773](https://github.com/DrEden33773) (Eden Wang)
- **Co-maintainers**: None yet. Interested? `CONTRIBUTING.md` will land after the Phase 2 contracts are frozen.
- **Decision record**: All significant architectural decisions live in [`docs/adr/`](./docs/adr/).

---

## Roadmap

| Phase | Focus | Exit Criteria |
| :---- | :---- | :---- |
| **0** | Technical pre-commitment | See [`trace/phase0/status.yaml`](./trace/phase0/status.yaml) |
| **1** | Core Semantics & Typed API | Frozen Phase 1 scenarios are green; the all-domain fixture compiles to deterministic preview/offline `TimelineMap` signatures; real React/Remotion rendering and export are not claimed |
| **2** | React + Remotion Preview Adapter | The all-domain fixture renders in a real React + Remotion browser preview with player navigation and render-safe readiness behavior; MP4/PDF export remains out of scope |
| **3** | AI Authoring Strengthening | Agent-authored decks can be generated, previewed, diagnosed, and repaired through the local validation loop |
| **4** | Presentation Product Layer *(pruned)* | Maintainer dogfoods a production-adjacent technical talk through preview and presenter workflows |
| **5** | Export + 0.1 Alpha Readiness | A longer agent-authored technical talk exports through the supported pipeline; the public API has remained stable for 1 month |

Full roadmap and rationale: [`ROADMAP.md`](./ROADMAP.md).

---

## Contributing

Pre-alpha contributions are currently limited to:

- Review feedback on [`ROADMAP.md`](./ROADMAP.md), frozen Phase 1 trace, and
  Phase 2 preview-adapter planning
- Discussion of architectural decisions in [`docs/adr/`](./docs/adr/)
- Focused issues that respect [`goals-non-goals.md`](./goals-non-goals.md)

Broader code contributions should wait until Phase 2 contracts are frozen and
`CONTRIBUTING.md` lands.

---

## Acknowledgements

Cadenza stands on the shoulders of several projects:

- [**Remotion**](https://www.remotion.dev/) — the rendering, transition, and export backbone
- [**Slidev**](https://sli.dev/) — the proof that developer-first slides are viable and worth investing in
- [**Motion Canvas**](https://motioncanvas.io/) — demonstrating just how high a programmatic motion ceiling can go

---

## Links

- Strategic analysis (English): [`docs/analysis/analysis-final.md`](./docs/analysis/analysis-final.md)
- Strategic analysis (中文): [`docs/analysis/analysis-final.zh.md`](./docs/analysis/analysis-final.zh.md)
- Compiler design: [`docs/design/compiler-design.md`](./docs/design/compiler-design.md)
- Testing taxonomy: [`docs/design/testing-taxonomy.md`](./docs/design/testing-taxonomy.md)
- Architectural decisions: [`docs/adr/`](./docs/adr/)
- Goals and non-goals: [`goals-non-goals.md`](./goals-non-goals.md)
