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
- **Remotion preview before export** — prove the React + Remotion Player adapter before promising MP4/PDF output or hosted rendering.
- **Skills first, MCP later** — early AI investment goes into authorial voice through the `cadenza-best-practices` mono-skill, mirrored into `.agents/skills/`; MCP is layered once it earns its place.

## Phases and exit criteria

| Phase | Focus | Exit criteria |
| :---- | :---- | :------------ |
| **0. Technical pre-commitment** | Compiler design approved, ADRs captured, Phase 1 specs frozen, Remotion upstream notified, infra scaffolded | See [`trace/phase0/status.yaml`](./trace/phase0/status.yaml) |
| **1. Core Semantics & Typed API** | Typed API primitives, state-to-timeline compiler, render-safe metadata, runtime intent, validation reports, `cadenza-best-practices` mono-skill | Frozen Phase 1 scenarios are green; the all-domain fixture compiles to deterministic preview/offline `TimelineMap` signatures; trace records the explicit boundary that real React/Remotion rendering, MP4 export, PDF export, external alpha usage, and public API stability are not claimed |
| **2. React + Remotion Preview Adapter** | React/Remotion package boundary, `@remotion/player` integration, real browser preview, render-safe components backed by Remotion readiness patterns | The all-domain fixture renders in a real React + Remotion browser preview; navigation seeks via Remotion Player frame control; image/font/video readiness and typography/media checks run against the preview; MP4/PDF export remains out of scope |
| **3. AI Authoring Strengthening** | Compile → error → repair loop, `cadenza-best-practices` rule/eval expansion, thin IR if earned, optional read-only MCP | Agent-authored decks can be generated, previewed, diagnosed, and repaired through the local validation loop without hand-editing the core framework |
| **4. Presentation Product Layer *(pruned)*** | Presenter view, chapters/outline, stronger transitions, smart typography & density engine, targeted technical-talk starters | Maintainer dogfoods a production-adjacent technical talk through preview and presenter workflows; feedback from real users becomes relevant after this point but is not a phase gate |
| **5. Export + 0.1 Alpha Readiness** | Local/web/MP4/PDF export, Remotion Lambda evaluation, multi-device presenter console if justified, tool-based MCP if justified | A longer agent-authored technical talk exports through the supported pipeline; the public API has remained stable for 1 month; hosted/commercial work is considered only after export infrastructure exists |

**Explicitly deferred indefinitely** (see [`goals-non-goals.md`](./goals-non-goals.md)): template marketplace, real-time collaboration, comments, version history, WYSIWYG editor, SSO / enterprise features, i18n infrastructure.

## Commercialization posture (OSS core + hosted tier, eventually)

- The OSS core (everything under `packages/`, shipped under Apache 2.0) is the long-term focus.
- A hosted cloud-render + team-templates tier is considered only **after export infrastructure exists**, not during core semantics, preview adapter, or early AI-authoring work.
- Remotion licensing: individuals free; companies above the threshold remain subject to [Remotion's license](https://www.remotion.dev/docs/license) — Cadenza does not redistribute Remotion.
- Two-stage upstream engagement with Remotion: Phase 0 light notification; commercial conversation only if export infrastructure and a hosted tier become concrete enough to discuss.

## What "shipped" means per phase

- **Phase 1 ships** when the semantic core is trace-complete: typed API, compiler, runtime intent, render-safe metadata, validation report, authoring mono-skill, and all-domain fixture.
- **Phase 2 ships** when that fixture runs through a real React + Remotion browser preview with player navigation and render-safe readiness behavior.
- **Phase 3 ships** when agents can generate, preview, validate, and repair small technical decks through the local loop.
- **Phase 4 ships** when a production-adjacent technical talk can be dogfooded through the preview and presenter workflows.
- **Phase 5 ships** as `0.1 alpha readiness`: export infrastructure exists, a longer agent-authored technical talk exports through the supported path, and the public API has been stable for 1 month.

## What we will say no to

- Requests to support Vue or Svelte — Cadenza is React-native by design (NG4).
- Requests to ship a prompt-to-deck UI — that is Gamma's product (NG7).
- Requests to add presenter-mode features before Phase 4 — see the roadmap.
- Requests to gate early phases on external alpha-user counts — user feedback matters after `0.1 alpha readiness`, not before the runtime and export path exist.
- Requests to ship a template marketplace at any phase — not a goal (NG3).

## Review cadence

- **Monthly**: maintainer re-reads this file, updates phase status, and either reaffirms or supersedes priorities via ADR.
- **At each phase boundary**: archive this snapshot to `trace/phase<N>/`, and update `STATUS.yaml`.
