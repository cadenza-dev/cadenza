---
name: cadenza-best-practices
description: Best-practice authoring guidance for Cadenza decks. Use this skill whenever the user asks to create, revise, debug, validate, or review a Cadenza deck, Cadenza TSX, Cadenza skills, render-safe components, typed slide APIs, speaker notes, motion timing, browser preview behavior, or diagnostics-driven repair, even if they do not explicitly say "skill" or "best practices."
---

# Cadenza Best Practices

Use this skill when authoring or repairing Cadenza decks. Cadenza is a
React-native presentation framework built around a typed TSX API, a
state-to-timeline compiler, render-safe components, and AI-friendly validation
loops. Good output preserves author intent while keeping the deck inspectable,
previewable, and repairable by future agents.

## First Move

Before editing a deck or recommending code:

1. Identify whether the task is authoring, review, debugging, or handoff.
2. Read the smallest relevant source: deck file, diagnostics, trace note, or
   spec excerpt named by the user.
3. Prefer public Cadenza APIs over raw Remotion primitives.
4. Keep MP4/PDF/export claims out unless the current phase explicitly supports
   them.
5. If a compile or preview failure is involved, run the validation-repair loop
   before changing visual style.

## Local Authoring Loop

For Phase 3 authoring work, keep the loop explicit and local:

1. Author typed TSX with public Cadenza primitives.
2. Run compile validation and keep the machine-readable diagnostics.
3. Run browser preview when the issue is visual, resource, or DOM-observable.
4. Inspect diagnostics and turn them into a repair queue.
5. Repair the authored deck without editing framework internals.
6. Re-run checks after each focused repair before changing style or scope.

## Phase 4 Product-Layer Loop

For Phase 4 technical-talk starters, keep the output narrow and previewable:

1. Choose one of the three starter surfaces in
   `examples/phase4/technical-talk-starters.tsx`: architecture talk, data
   explainer, or live-demo talk.
2. Author with public Cadenza TSX, render-safe components, `Notes`, outline or
   chapter metadata, and typed product transitions.
3. Open the local preview route with `pnpm preview:phase4` when validating
   presenter context, visual acceptance, typography/density, or stronger
   transitions.
4. Repair authored TSX, starter guidance, or trace evidence before touching
   framework internals.
5. Keep starter work out of broad template catalogs, direct visual editors,
   distribution promises, hosted runtime promises, long-term API guarantees,
   outside-user validation, and MCP implementation claims.

## Rule Routing

Load only the rule files needed for the task:

| Task | Read |
| :--- | :--- |
| Creating or reorganizing slides | [`rules/typed-authoring.md`](rules/typed-authoring.md), [`rules/layout-composition.md`](rules/layout-composition.md) |
| Timing, reveals, transitions, navigation | [`rules/motion-timing.md`](rules/motion-timing.md) |
| Images, fonts, videos, bounded content | [`rules/render-safe-components.md`](rules/render-safe-components.md) |
| Speaker notes or presenter metadata | [`rules/speaker-notes.md`](rules/speaker-notes.md) |
| Data explainers, metrics, charts, or evidence slides | [`rules/data-explainers.md`](rules/data-explainers.md), [`rules/layout-composition.md`](rules/layout-composition.md) |
| Phase 4 product-layer workflows or technical-talk starters | [`rules/product-layer-workflow.md`](rules/product-layer-workflow.md), [`examples/phase4/technical-talk-starters.tsx`](../../examples/phase4/technical-talk-starters.tsx) |
| Compile, preview, browser, or export failures | [`rules/validation-repair.md`](rules/validation-repair.md), [`rules/browser-preview.md`](rules/browser-preview.md) |
| Reviewing an agent-authored deck | Read all rule files, then report gaps by risk |

## Core Principles

- Express slide semantics with `Deck`, `Slide`, `Step`, `Transition`, `Notes`,
  `Theme`, and render-safe components.
- Use `Theme` tokens and repeated structure for visual rhythm; avoid one-off
  constants scattered through steps.
- Keep `Step` intent semantic: fixed reveal, wait-for-event pause, or computed
  content. Avoid raw frame-coordinate manipulation.
- Use render-safe declarations for assets, fonts, video, typography bounds,
  content slots, and media frames so preview/export problems become diagnostics.
- Treat diagnostics as a repair queue. Fix fatal authoring errors before visual
  refinements, and re-run validation after each focused repair.
- Add raw Remotion primitives only as a local escape hatch with a short `// why:`
  comment explaining why Cadenza's typed/render-safe surface cannot express the
  need yet.

## Output Expectations

When producing code, include the smallest complete Cadenza slice that the user
can typecheck. When reviewing or debugging, lead with the concrete issue,
evidence, and repair path. For maintainer-facing chat in this repository, report
in Chinese while keeping API names and file paths in English.

## Quick Authoring Skeleton

```tsx
import {
  ContentSlot,
  Deck,
  Notes,
  SafeImage,
  Slide,
  Step,
  Theme,
  Transition,
  TypographyBox,
} from "@cadenza-dev/core";

export const deck = (
  <Deck
    fps={24}
    navigationPolicy="queue-next"
    theme={
      <Theme
        name="technical-talk"
        tokens={{
          color: { background: "#0f172a", foreground: "#f8fafc" },
          spacing: { framePadding: 48 },
        }}
      />
    }
  >
    <Slide id="opening">
      <Notes>Frame the audience takeaway before the first reveal.</Notes>
      <Step duration="2s">
        <ContentSlot id="hero-slot" density="comfortable" readability="headline">
          <TypographyBox id="hero-title" maxWidth={760} maxHeight={140}>
            Reliable AI-authored technical talks
          </TypographyBox>
        </ContentSlot>
      </Step>
    </Slide>
    <Transition kind="fade" duration="500ms" />
    <Slide id="demo">
      <SafeImage id="diagram" src="/assets/diagram.png" alt="System diagram" />
      <Step kind="wait-for-event" exportDuration="4s">
        Pause for questions before the live demo.
      </Step>
    </Slide>
  </Deck>
);
```
