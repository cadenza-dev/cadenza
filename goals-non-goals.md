# Cadenza — Goals & Non-Goals

> **Why this document exists**: Every open-source project that does not say "no" clearly ends up saying "yes" to too much. Cadenza has a narrow, defensible positioning ([ADR 0001](./docs/adr/0001-primary-audience.md)) that only survives if scope creep is rejected explicitly. This document makes the boundaries visible so contributors, AI agents, and future-us can check their work against them.
>
> **How to read this**: Non-goals here are **not "maybe later."** They are "not in this project." Some may be revisited in Phase 3+, but the default stance is exclusion.
>
> **How to propose a change**: Open an issue titled `Scope change: <thing>`, reference the specific goal or non-goal, and argue the shift. The maintainer responds with an ADR that either supersedes or reaffirms.

---

## **Goals**

### **G1. Authoring experience**

- A thin TypeScript + React typed API with six core primitives: `Deck`, `Slide`, `Step`, `Transition`, `Notes`, `Theme`.
- Reliable TSX authoring for both humans and AI agents, with raw Remotion available as an escape hatch.
- Compile-time validation: structural checks, prop checks, asset-ref checks.
- Minimal runtime validation: overflow, density, timing sanity.

### **G2. Runtime experience**

- Keyboard-driven navigation (arrow keys, space) with deterministic response.
- Click-to-advance with configurable hit regions.
- Fullscreen support.
- Step-level forward/backward.
- Presenter metadata surface: current slide, current step, elapsed time, notes.

### **G3. Motion and rendering**

- Full access to Remotion's animation primitives (`spring`, `interpolate`, transitions) through the typed API and render-safe layer.
- Deterministic rendering: browser preview must match MP4 export frame-for-frame.
- Render-safe components absorbing: image loading (`delayRender` / `continueRender`), font readiness (FOUT/FOIT prevention), video metadata gating, overflow detection, media framing.

### **G4. Export**

- Browser-bundled web deck (standalone `index.html` + assets).
- MP4 video export via Remotion (local and eventually Lambda-backed in Phase 4).
- PDF export (one slide per page).

### **G5. AI agent ergonomics**

- AI-ready documentation written in a format optimized for context injection into coding agents.
- A curated `cadenza-best-practices` mono-skill in Phase 1, with
  progressive-disclosure rules for layout composition, motion timing, speaker
  notes, render debugging, render-safe components, browser preview, and
  validation repair.
- A system prompt that captures the project's authorial voice.
- A validate-and-repair loop structured enough for agents to iterate without human intervention.

### **G6. Developer tooling**

- First-class TypeScript types and inference.
- Source maps for runtime debugging.
- Useful error messages (not raw Remotion tracebacks).
- A CLI for initializing, previewing, and exporting decks.

---

## **Non-Goals**

### **NG1. WYSIWYG visual editor for the core framework**

**Reason**: [ADR 0001](./docs/adr/0001-primary-audience.md). Cadenza serves developers who write code. A visual editor would be a different product with a different user base, and building one would force the architecture to compromise the typed-API-first design.

**When revisited**: Not before Phase 4, and only as a commercial hosted-tier feature — never as part of the OSS core.

### **NG2. Real-time collaboration, comments, version history**

**Reason**: These features are table stakes for business-user SaaS products (Gamma, Tome) but are a multi-year engineering investment orthogonal to Cadenza's differentiation (React-native + cinematic motion + AI agent ergonomics). Building them would dilute the core framework without improving it.

**When revisited**: Possibly in Phase 4's hosted tier, if it ships. Never in the OSS core.

### **NG3. Template marketplace**

**Reason**: A template marketplace is a commodity feature that competes on template breadth, not on technical differentiation. Gamma, Beautiful.ai, and Canva already compete on this dimension. Cadenza's moat is elsewhere.

**When revisited**: A small curated set of technical-talk layouts is part of [G1](#g1-authoring-experience). A marketplace — where users publish and monetize templates — is explicitly out of scope.

### **NG4. Supporting frameworks other than React**

**Reason**: React + Remotion is the architectural spine. Supporting Vue, Svelte, Solid, or vanilla JS would require rebuilding the render-safe layer, the compiler, and the skill pack for each framework. This is the cost of being "React-native"; it is not a temporary limitation.

**When revisited**: Never in the core. If framework-agnosticism becomes critical, it is a separate project using Cadenza's design as inspiration, not a branch of this one.

### **NG5. Supporting rendering engines other than Remotion**

**Reason**: The state-to-timeline compiler is designed against Remotion's frame-driven model. Abstracting to "any rendering engine" would be premature generalization, and no competitive alternative exists today.

**When revisited**: The renderer abstraction is intentionally left thin so the *option* exists ([analysis-final §3.5](./docs/analysis/analysis-final.md)), but an actual swap is not planned for Phase 1–4. If Remotion's licensing or direction forces a swap, it becomes a new ADR at that time.

### **NG6. Native desktop or mobile apps**

**Reason**: Browser-bundled decks cover the "distribution" use case. Native presenter apps add platform complexity (Electron, Tauri, React Native) without meaningfully improving the core experience.

**When revisited**: Phase 4 "演讲者模式" (presenter mode, see [analysis-final §7](./docs/analysis/analysis-final.md)) may include a browser-based multi-device control console, but no native installers.

### **NG7. Generating slides from natural language without code**

**Reason**: The "type a prompt, get a full deck" interaction is Gamma's core product. Cadenza's AI integration is about agents writing typed-API-constrained TSX, not about users bypassing code.

**When revisited**: Third-party tools may layer natural-language interfaces on top of Cadenza via the typed API. Cadenza itself does not ship a prompt-to-deck UI.

### **NG8. Enterprise features: SSO, audit logs, RBAC, SCIM**

**Reason**: These belong in the commercial hosted tier (if it ships) or in a separate enterprise distribution. The OSS core does not need them.

**When revisited**: Phase 4 hosted tier, if applicable.

### **NG9. Internationalization (i18n) infrastructure in Phase 1**

**Reason**: Content i18n (slides rendered differently per locale) introduces timeline-length variability that the compiler's MVP does not handle. Adding it to Phase 1 expands the compiler's test matrix significantly.

**When revisited**: Phase 3. See [compiler-design.md OQ-4](./docs/design/compiler-design.md) for the technical question.

### **NG10. "Batteries included" design system**

**Reason**: Cadenza provides theme tokens and primitive layout slots, not opinionated components beyond the render-safe set. Users compose their own components using Tailwind, shadcn/ui, vanilla-extract, or whatever they prefer.

**When revisited**: A `@cadenza-dev/ui-starter` package could ship in Phase 3 with reference components, but it is explicitly a starter, not a framework's official design system.

---

## **Ambiguous Cases**

Where the line is not obvious, we err on the side of **exclusion until demonstrated need**:

- **Data visualization components**: Cadenza provides layout slots; it does not ship charting. If alpha users consistently request basic charts, a `@cadenza-dev/charts` package ships in Phase 3 with a minimal set (line, bar, area).
- **Animation presets**: A small library of curated transitions is part of G3. An exhaustive "all 50 PowerPoint transitions" catalog is not.
- **Speaker timer**: Part of G2 presenter metadata. An elaborate rehearsal analytics product is not.

---

## **Review cadence**

This document is reviewed at the end of every Phase. Entries that remain non-goals for two consecutive Phases without serious contest stay closed. Entries that are revisited must move via ADR.
