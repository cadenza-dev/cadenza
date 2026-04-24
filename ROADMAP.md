# Cadenza — Roadmap

> Strategic brief, operational summary of [`docs/analysis/analysis-final.md`](./docs/analysis/analysis-final.md). This document is the Scout's output: what we are building, for whom, in what sequence, and what "done" looks like at each stage. It is linkable evidence for positioning; it is not a contract. Specs in `spec/<phase>/` are the contracts.

---

## Thesis

There is a real but narrow gap in the presentation-tooling landscape: **React-native authoring**, **cinematic motion ceiling**, **complete presentation semantics**, and **first-class AI coding-agent ergonomics**. No shipping product sits in all four quadrants. Cadenza targets that intersection.

Cadenza is **not** a Gamma replacement, a WYSIWYG editor, a general-purpose AI deck generator, or a framework-agnostic motion library. See [`goals-non-goals.md`](./goals-non-goals.md).

## Primary audience

Developers and technical communicators who write talks, data explainers, and documentation-first decks — and the AI coding agents that increasingly help them do so.

## Architectural spine

- **Typed API first, DSL last** — thin TypeScript React surface over Remotion.
- **Render-safe component layer** — absorbs Remotion's asset-loading and timing invariants.
- **State-to-timeline compiler** — bridges discrete slide/step navigation to continuous Remotion frames. This is the project's deepest technical bet; it must ship as a design document before Phase 1 begins.
- **Skills first, MCP later** — Phase 1 invests in authorial voice through `.claude/skills/`; MCP is layered once it earns its place.

## Phases and exit criteria

| Phase | Focus | Exit criteria |
| :---- | :---- | :------------ |
| **0. Technical pre-commitment** *(current)* | Compiler design approved, ADRs captured, Phase 1 spec Stage A drafted, Remotion upstream notified, infra scaffolded | See [`trace/phase0/status.yaml`](./trace/phase0/status.yaml) |
| **1. Core Framework & Typed API (MVP)** | Typed API primitives, state-to-timeline compiler, render-safe layer, runtime player, minimal validation loop, first 5 skills | Agent-generated 30-slide technical talk runs and exports to MP4; 5 alpha users complete feedback cycles; public API stable for 1 month after MVP |
| **2. AI authoring strengthening** | Compile → error → repair loop, skill pack to 10+, thin IR, optional read-only MCP | Alpha users' prompt-to-shippable-deck iteration count ≤ 3 |
| **3. Presentation product layer *(pruned)*** | Presenter mode + metadata, chapters/outline, stronger transitions, smart typography & density engine | 10+ developers use Cadenza in real-world talks and provide feedback |
| **4. Export + protocol extensions *(further pruned)*** | Remotion Lambda integration, stable web/MP4/PDF export, multi-device presenter console, tool-based MCP | Determined by PMF state + commercialization decision |

**Explicitly deferred indefinitely** (see [`goals-non-goals.md`](./goals-non-goals.md)): template marketplace, real-time collaboration, comments, version history, WYSIWYG editor, SSO / enterprise features, i18n infrastructure.

## Commercialization posture (OSS core + hosted tier, eventually)

- The OSS core (everything under `packages/`, shipped under Apache 2.0) is the long-term focus.
- A hosted cloud-render + team-templates tier is a **Phase 4+** consideration, not a Phase 1 priority.
- Remotion licensing: individuals free; companies above the threshold remain subject to [Remotion's license](https://www.remotion.dev/docs/license) — Cadenza does not redistribute Remotion.
- Two-stage upstream engagement with Remotion: Phase 0 light notification; Phase 2+ commercial conversation if and when hosted tier is on the table.

## What "shipped" means per phase

- **Phase 1 ships** when an agent can generate a conforming 30-slide talk from a prompt and export it to MP4 without hand-fixing.
- **Phase 2 ships** when that agent's iteration count to an acceptable deck is 3 rounds or fewer.
- **Phase 3 ships** when 10 developers independently use Cadenza for real conference-grade talks.
- **Phase 4 ships** on commercial-path conditions (Lambda integration is working + hosted tier thesis validates).

## What we will say no to

- Requests to support Vue or Svelte — Cadenza is React-native by design (NG4).
- Requests to ship a prompt-to-deck UI — that is Gamma's product (NG7).
- Requests to add presenter-mode features before Phase 3 — see the roadmap.
- Requests to ship a template marketplace at any phase — not a goal (NG3).

## Review cadence

- **Monthly**: maintainer re-reads this file, updates phase status, and either reaffirms or supersedes priorities via ADR.
- **At each phase boundary**: archive this snapshot to `trace/phase<N>/`, and update `STATUS.yaml`.
