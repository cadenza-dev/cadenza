# Cadenza

> **For developers and technical communicators who want cinematic, code-reviewable, AI-augmented presentations.**

Cadenza is a React + Remotion based presentation framework that brings together four qualities no existing tool has put in one place: **React-native authoring**, a **cinematic motion ceiling**, **complete presentation semantics** (decks, slides, steps, transitions, notes, presenter view), and **first-class ergonomics for AI coding agents**.

It is not a Gamma replacement. It is not a WYSIWYG slide editor. It is a developer-facing framework for people who write technical talks, data-heavy explainers, and documentation-first decks — and for the AI agents that increasingly help them do so.

---

## Status

**Phase 0 (Pre-alpha)** — design and groundwork.

No runtime code has been written yet. We are currently:

1. Finalizing the [state-to-timeline compiler design](./docs/design/compiler-design.md)
2. Locking in architectural decisions in [`docs/adr/`](./docs/adr/)
3. Establishing positioning and non-goals in [`goals-non-goals.md`](./goals-non-goals.md)

The full strategic analysis that led to this project lives in [`docs/analysis/analysis-final.md`](./docs/analysis/analysis-final.md) (English) and [`docs/analysis/analysis-final.zh.md`](./docs/analysis/analysis-final.zh.md) (中文).

Phase 1 (MVP) does not begin until the compiler design passes review.

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
3. **Skills before MCP.** Phase 1 AI investment goes into `AI-ready docs + system prompts + skill pack`. MCP is layered later, once structured lookup becomes a real bottleneck.
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
- **Co-maintainers**: None yet. Interested? See [`CONTRIBUTING.md`](./CONTRIBUTING.md) (coming in Phase 1).
- **Decision record**: All significant architectural decisions live in [`docs/adr/`](./docs/adr/).

---

## Roadmap

| Phase | Focus | Exit Criteria |
| :---- | :---- | :---- |
| **0** (current) | Compiler design, licensing groundwork, positioning | `compiler-design.md` passes review; initial ADRs in place |
| **1** | MVP: typed API, compiler, render-safe layer, runtime player, minimal validation loop, first 5 skills | Agent-generated 30-slide technical talk runs and exports to MP4; 5 alpha users complete feedback cycles; public API stable for 1 month |
| **2** | Strengthen AI authoring: compile → error → repair loop, thin IR, optional read-only MCP | Alpha users' average prompt-to-deck iteration count ≤ 3 |
| **3** | Presentation product layer: presenter mode, chapters, intelligent typography, data-viz templates | 10+ developers use Cadenza for real-world talks |
| **4** | Export, multi-device, tool-based MCP, Lambda integration | Determined by PMF state and commercialization decision |

Full roadmap and rationale: [`docs/analysis/analysis-final.md`](./docs/analysis/analysis-final.md) §7.

---

## Contributing

Phase 0 contributions are currently limited to:

- Review feedback on [`docs/design/compiler-design.md`](./docs/design/compiler-design.md)
- Discussion of architectural decisions in [`docs/adr/`](./docs/adr/)
- Positioning and scope feedback via Issues

Phase 1 will open up to code contributions once MVP scope is frozen. `CONTRIBUTING.md` will land at that time.

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
- Architectural decisions: [`docs/adr/`](./docs/adr/)
- Goals and non-goals: [`goals-non-goals.md`](./goals-non-goals.md)
