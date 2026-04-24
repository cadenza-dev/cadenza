# **Cadenza State-to-Timeline Compiler — Technical Design (v0.3 CONTRACT_FROZEN)**

> **Status**: CONTRACT_FROZEN
> **Author**: Eden Wang (`@DrEden33773`)
> **Review standard**: Phase 1 does not begin until this document passes core-contributor review.
> **Related documents**:
>
> - [`docs/analysis/analysis-final.md`](../analysis/analysis-final.md) §4.3 (problem statement and constraints)
> - [`docs/adr/0002-typed-api-first-architecture.md`](../adr/0002-typed-api-first-architecture.md) (architectural decision)

---

## **0. Why This Document Exists**

Cadenza's core technical bet is whether we can stably map **discrete presentation state** ("currently showing slide N, step M") onto **Remotion's continuous frame timeline**. This is the project's viability bottleneck.

If the compiler's abstraction leaks, every typed API call above it will leak too:

- Authors see slide / step semantics.
- The layer below has to handle frame coordinates, transition overlaps, asynchronous assets, and user-interrupted navigation.
- Any translation bug between the two surfaces to authors as "mysterious flickering / delayed navigation / preview-vs-export mismatch."

The purpose of this document is direct: **before a single line of runtime code is written, make every rule, every edge case, and every failure mode of the translation layer explicit**. If any boundary here is unresolved, Phase 1 should not begin.

---

## **1. Terminology and Notation**

All subsequent sections use these terms as defined here.

| Term | Meaning |
| :---- | :---- |
| **Deck** | A complete presentation, composed of multiple Slides. |
| **Slide** | A single page of content; may contain multiple Steps internally. |
| **Step** | A "stepwise reveal" unit within a Slide; advanced between steps by user intent. |
| **Transition** | An animated handoff between two Slides. |
| **Timeline** | Remotion's continuous frame axis; the Deck is ultimately mapped onto a single timeline. |
| **Anchor** | A frame coordinate on the Timeline marking the start or end of a Slide/Step. |
| **Segment** | A frame interval on the Timeline occupied by a Slide or a Step. |
| **Cursor** | The runtime's current playback position; may refer to a Slide/Step or to the interior of a transition. |
| **Intent** | A user-triggered navigation command such as `next()`, `previous()`, or `goto(slideId, stepIndex)`. |

Notation:

- `S_i` refers to the `i`-th Slide.
- `S_i.step_j` refers to the `j`-th Step of `S_i`.
- `[a, b]` denotes the frame interval `[a, b)` — left-closed, right-open.
- `FPS` is the frame rate (default 30 or 60, author-configurable).

---

## **2. Compiler Responsibilities**

The compiler does four things, **and only four**:

### **2.1 Traverse the Deck tree and collect declarations**

Input: the component tree produced by the typed API (`<Deck><Slide><Step>…</Step></Slide></Deck>`).

Collected:

- Each Slide's default duration (`duration`).
- Each Step's type and duration (`fixed` / `wait-for-event` / `computed`).
- Each Transition's kind and duration (`fade` / `slide` / `cut` / custom).
- Presenter metadata attached to each Slide (`notes`, `hidden`, `chapter`).

### **2.2 Produce an internal global Timeline Map**

Output: a data structure that maps every Slide / Step / Transition in the Deck to a timeline interval.

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

### **2.3 Expose a runtime navigation API**

The runtime object produced by the compiler exposes:

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

### **2.4 Translate Intent into Remotion `seekTo` calls**

Every `next()` / `previous()` / `goto()` ultimately lands as `playerRef.current.seekTo(frame)` plus `play()` or `pause()`. This translation is the compiler's "runtime last mile."

**Non-goal**: the compiler does not perform rendering and implements no animation. It produces a timeline structure and routes intent — nothing more.

---

## **3. Core Model: Discrete State ↔ Continuous Timeline**

### **3.1 The bidirectional mapping**

- **Discrete side (author's view)**: a tree of Slides and Steps. When an author writes `<Step>`, they do not think in frames.
- **Continuous side (Remotion's view)**: a timeline where every frame number accessed via `useCurrentFrame()` is deterministic.

The compiler maintains a **bidirectional function**:

```text
f: (slideId, stepIndex) → [entryFrame, exitFrame]
g: currentFrame → Cursor
```

`f` is fixed at compile time; `g` is resolved at runtime by binary search over the TimelineMap with `currentFrame`.

### **3.2 Two identity invariants**

These are the foundation of every design decision below:

1. **Temporal monotonicity**: for a single Deck, `f(slide_i, step_j).entry` is strictly increasing in `(i, j)` (no loops in this version).
2. **Cursor completeness**: every valid `currentFrame ∈ [0, totalFrames)` corresponds to exactly one Cursor — no "black hole" frames.

If either invariant is broken at runtime, the compiler has a bug and should fail loudly rather than continue silently.

### **3.3 Runtime state machine**

Cursor has three and only three states:

```text
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

State-transition rules:

- `at-step → in-transition`: triggered when next/prev moves to a different Slide (not another step in the current Slide).
- `at-step → at-step`: triggered when next/prev moves to another Step of the current Slide.
- `in-transition → at-step`: when transition progress reaches 1.
- `in-transition → loading`: when the target Slide's assets are found to be unready mid-transition.
- `loading → at-step`: when assets become ready.
- `loading → in-transition`: when assets become ready and there is an unfinished transition to resume.

---

## **4. Public API Sketch (Typed API Surface)**

> **Scope note**: this section lists only the compiler's entry points. The complete typed API surface is specified in a separate document.

```typescript
// Authored by the user
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
// Compiler entry points
import { compile, createRuntime } from '@cadenza-dev/core';

const timelineMap = compile(deckElement);
const runtime = createRuntime(timelineMap, playerRef);

runtime.goto('slide-2', 0);
runtime.next();
```

---

## **5. Known Edge Cases**

Each edge case must include: **problem statement** / **decision** / **rationale** / **test cases**.

### **5.1 Variable-duration Steps**

**Problem**: some steps do not have a duration known at compile time — they either wait for a user event (`wait-for-event`) or depend on a runtime computation (`computed`, e.g., awaiting data load). This violates the assumption that the timeline is fully determined at compile time.

**Decision**:

- Introduce three Step kinds:
  - `fixed`: duration is known at compile time.
  - `wait-for-event`: occupies an **expandable interval** on the timeline with a default placeholder of `2s` (author-configurable); runtime extends as needed.
  - `computed`: placeholder of `0s`; runtime inserts frames dynamically when the promise resolves.
- The runtime "extends" an interval by mutating the in-memory TimelineMap: push the current segment's `end` back, then shift every subsequent segment's `entry/exit` by the same delta.
- This mutation happens **in memory only** and does not trigger Remotion recompilation.

**Rationale**:

- Remotion allows runtime `seekTo` to any frame — we do not need a compile-time-frozen timeline.
- The `wait-for-event` placeholder ensures that even if the event never fires, a demo will not hang.
- This keeps variable-duration complexity bounded: "the overall timeline is elastic, but within-segment ordering never changes."

**Test cases**:

```text
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

### **5.2 Mid-transition Navigation**

**Problem**: the user presses "next" or "previous" while a transition animation is already in progress. The current cursor is `in-transition`, and the compiler must decide how to handle the new intent.

**Decision**: three policies, author-configurable; default is `cut-to-next`.

| Policy | Behavior |
| :---- | :---- |
| `finish-then-advance` | Ignore the new intent; wait for the transition to complete before processing it. |
| `cut-to-next` (default) | Terminate the transition immediately; jump to the next Slide's start; the previous transition's target frame becomes the new starting frame. |
| `queue-next` | Wait for the transition to complete, then automatically fire `next()`. |

**Rationale**:

- `cut-to-next` is PowerPoint / Keynote's default behavior and the most forgiving for presenters (a second keystroke never feels "unresponsive").
- `finish-then-advance` is the "respect the animation" choice, appropriate for decks with precise choreography.
- `queue-next` is the "batch advance" choice, appropriate for rapid slide review.

**Additional rationale**: this policy is a property the author should be aware of. It is configured on `<Deck navigationPolicy="cut-to-next">`; per-slide overrides are not supported (to avoid state explosion).

**Test cases**:

```text
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

### **5.3 Asynchronous Asset Alignment**

**Problem**: the next Slide's images, fonts, or videos are still loading when the user presses "next." Without handling:

- Images "pop" into view, causing flicker.
- Font fallback triggers FOUT/FOIT.
- Videos without metadata fail to play.

**Decision**:

- The compiler does not directly manage asset loading. Instead, it **cooperates with the render-safe component layer**.
- Components like `<SafeImage>` register their readiness via an internal `useAssetReadiness(assetId)` hook.
- The compiler runtime maintains an `assetRegistry: Map<slideId, Set<assetId>>`.
- When the cursor is about to enter a Slide, the runtime checks all of that Slide's assets:
  - **All ready**: enter `at-step` or `in-transition` immediately.
  - **Some unready**: cursor becomes `loading`, the Remotion player pauses, and a fullscreen loading overlay appears (default: spinner + Slide preview).
  - **Timeout (default 10s)**: degrade to "no-asset state" and enter anyway, emitting an error event.

**Rationale**:

- Centralizing the readiness decision in the compiler runtime avoids per-component inconsistency.
- The `loading` state is user-visible, avoiding the "why is nothing happening when I press next?" confusion.
- The 10-second timeout is a pragmatic engineering choice: a presenter must never be left stranded.

**Test cases**:

```text
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

### **5.4 Overlapping Transitions**

**Problem**: Remotion's `TransitionSeries` permits a transition to overlap adjacent Slides on the timeline — the transition's start frame precedes the previous Slide's end frame. A single frame can therefore render "two Slides at once." Cursor semantics require an independent `in-transition` state.

**Decision**:

- `in-transition` is a third Cursor state (alongside `at-step` and `loading`); it does not belong to any single Slide.
- Within the overlap interval, `currentFrame → Cursor` returns `in-transition(from=prevSlide, to=nextSlide, progress=...)`.
- `progress` is `0` at the overlap's start and `1` at its end, interpolated linearly. The compiler does not handle easing; easing is the transition component's concern.

**Rationale**:

- Not binding `in-transition` to any single Slide avoids the philosophical question of "does the cursor belong to S1 or S2?"
- Easing and other visual concerns stay at the component layer; the compiler provides raw numerical progress.

**Non-goal**: the compiler does not support transitions overlapping 3+ Slides simultaneously. If Phase 2+ requires it, the model is extended then.

**Test cases**:

```text
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

### **5.5 Scrubbing and Replay**

**Problem**: the Remotion Player lets users drag the progress bar (scrubbing) to any frame. If a user scrubs from S1.step0 directly to S3.step2 on a stepped Deck, what happens to the state of the skipped steps? Two possible semantics:

- **Visual seek**: jump directly, without replaying intermediate step side effects.
- **Logical replay**: simulate every intermediate step's state transition.

**Decision**: default to **visual seek**. Logical replay is not offered.

**Rationale**:

- Visual seek is semantically clean, trivial to implement, and consistent with Remotion's native behavior.
- Logical replay quickly makes step side effects (`useEffect`, data fetches) pathological to reason about.
- Authors who truly need "step side effects" should express them declaratively via render-safe components, not rely on compiler replay.

**Special rules** for cursor state during scrubbing:

- Landing inside an overlap interval → `in-transition`.
- Landing inside a Slide's segment → `at-step`, with `stepIndex` set to the step that owns the frame (regardless of whether side effects "ran").
- Landing inside a `wait-for-event` placeholder → cursor sits at the placeholder's end, treated as if the event had fired.

**Test cases**:

```text
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

### **5.6 Nested Decks**

**Problem**: should `<Deck>` eventually be allowed to nest inside another `<Deck>` (for "chapter decks")? If so, how do timelines compose?

**Decision**: **Phase 1 does not support nested Decks.**

- `<Deck>` may appear only at the root of the component tree.
- If the compiler detects `<Deck>` at a non-root position, a compile error is thrown.
- If Phase 2+ introduces nesting, the TimelineMap is extended to a tree structure and Cursor is redesigned.

**Rationale**:

- Nested Decks raise the question "which Deck does this Slide belong to?" which pollutes the entire navigation API.
- A `<Chapter>` primitive (planned for Phase 3) is sufficient for "chapter grouping" without introducing nesting.
- Keeping the Phase 1 abstraction simple is critical.

**Test cases**:

```text
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

## **6. Invariants**

These must be automatically verifiable in tests:

1. **Temporal monotonicity**: `f(S_i, step_j).entry < f(S_i, step_{j+1}).entry < f(S_{i+1}, step_0).entry`.
2. **Cursor completeness**: every `frame ∈ [0, totalFrames)` maps to exactly one Cursor.
3. **Segment non-overlap (except transitions)**: two non-transition segments must not overlap.
4. **Transition boundedness**: every transition segment has length > 0 and < the sum of its neighboring Slide segment lengths.
5. **Public API stability (post-MVP)**: for one month after MVP release, `compile()` / `CadenzaRuntime` must not break (from analysis-final §7 Phase 1 exit criteria).

---

## **7. Non-goals (What This Compiler Explicitly Does Not Do)**

1. **No animation interpolation**: `spring` / `interpolate` / easing live in the component layer.
2. **No asset loading**: delegated to the render-safe component layer.
3. **No rendering**: fully delegated to Remotion Player / Lambda.
4. **No nested Decks** (Phase 1).
5. **No logical replay**: scrubbing is always a visual seek.
6. **No compatibility guarantees across Remotion major versions**: the compiler's internals may need to be rewritten when Remotion ships a major version, but the public API remains stable.

---

## **8. Open Questions**

The following resolutions were approved by the maintainer on 2026-04-25 and are
part of the frozen Phase 1 compiler contract.

### **OQ-1: Should FPS be enforced uniformly across the Deck?**

- Option A: enforce a single FPS for the entire Deck.
- Option B: allow each Slide to configure its own FPS (requires handling transitions that cross FPS boundaries).

**Resolution**: Enforce a single FPS for the entire Deck in Phase 1. Slide-level FPS remains out of scope because transition math, step anchors, `seekTo(frame)` navigation, and preview/export parity all depend on one shared frame grid. Authors who need different visual cadence should express it through duration tokens, animation curves, or transition settings rather than changing the timeline's base clock.

**Decision note**: This favors deterministic compiler behavior over local expressiveness. Reopen only if a real alpha deck demonstrates a slide-level FPS need that cannot be represented through duration or animation primitives.

### **OQ-2: Throttling granularity for Cursor `onChange` events?**

- During `in-transition`, `progress` changes every frame — should every frame emit?
- Or emit only on state transitions?

**Resolution**: `onCursorChange` emits only on semantic state transitions: `at-step`, `in-transition`, and `loading`, plus changes to the slide or step identity. Frame-level transition progress remains observable through `getCursor()` while the cursor is `in-transition`, but it is not pushed every frame as an event.

**Decision note**: This keeps presenter UI updates predictable and avoids turning navigation metadata into a render-loop side channel. If Phase 1 implementation needs frame-granular progress subscriptions, add a separate, explicitly named transition-progress API instead of overloading `onCursorChange`.

### **OQ-3: Upper bound on Deck duration?**

- Should single-Deck duration be capped to prevent memory/render issues from over-long timelines?

**Resolution**: Do not impose a hard duration cap in Phase 1. Emit a compile-time warning when the compiled timeline exceeds 60 minutes, including total frames and estimated duration at the deck FPS.

**Decision note**: This preserves legitimate long-form decks while still surfacing risk early. A hard cap should be introduced only after real alpha decks expose concrete memory, Player, or Lambda constraints.

### **OQ-4: Multi-locale slides (i18n)**

- If Slide content varies by locale, timeline length may vary (text-rendering differences cause overflow).
- Should the compile step produce an independent TimelineMap per locale?

**Resolution**: Phase 1 does not support multi-locale slide variants. If i18n enters the roadmap in Phase 3, the compiler should produce one independent TimelineMap per locale rather than trying to share anchors across layouts whose text density may differ.

**Decision note**: This keeps the Phase 1 compiler focused on a single deterministic content tree. Reopen earlier only if a Phase 1 alpha deck has an unavoidable locale-switching requirement tied to the MVP acceptance scenario.

### **OQ-5: Frame consistency with Remotion Lambda**

- Local preview uses Remotion Player; the compiler dynamically adjusts the timeline at runtime.
- Exporting to Lambda requires a "frozen" static timeline.
- How do we guarantee the exported MP4 matches the local preview frame-for-frame?

**Resolution**: Export uses an explicit offline compilation mode. In offline mode, every `wait-for-event` step must resolve to an `exportDuration`, and every `computed` step must either resolve before compilation or fail with a typed export error.

**Decision note**: Cadenza guarantees frame-for-frame parity for the offline TimelineMap handed to Remotion Lambda, not for arbitrary live-presenter dwell times during an interactive preview. This makes export deterministic without pretending that an interactive talk has one canonical video length.

---

## **9. Phase 0 Review Checklist**

This document must pass the following review before Phase 0 closes.

- [x] §2's four responsibilities are clearly bounded and non-overlapping. Verified: collection, timeline map production, runtime API exposure, and intent-to-`seekTo` translation each own a distinct boundary.
- [x] §3's two identity invariants (monotonicity + completeness) are correct and automatable. Verified: both can be asserted by iterating compiled segments and frame ranges in unit tests.
- [x] §5's six edge cases each include: problem / decision / rationale / test cases. Verified: §§5.1–5.6 all follow this structure.
- [x] §5 test case naming and given-when-then structure are consistent and directly translatable into Vitest / Playwright tests. Verified: all edge-case tests use `TC-5.x.y` names and scenario clauses.
- [x] §6 invariants can be asserted in unit tests. Verified: each invariant has a concrete TimelineMap-level assertion target.
- [x] §7 non-goals are endorsed as hard boundaries for this compiler. Verified: they match ADR 0002 and the Phase 1 scope ceiling.
- [x] §8 open questions either have a clear resolution or an explicit reopen condition. Verified: OQ-1 through OQ-5 were approved by the maintainer on 2026-04-25.

If this document does not pass review, **Phase 1 does not begin.**

---

## **10. Version History**

| Version | Date | Notes |
| :---- | :---- | :---- |
| v0.3 | 2026-04-25 | Maintainer approved the five OQ resolutions and froze the compiler contract. |
| v0.2 | 2026-04-25 | Phase 0 Architect review pass: integrated bilingual OQ recommendations, verified review checklist, and advanced status to Review-ready. |
| v0.1 | 2026-04-17 | Initial draft: 6 known edge cases + invariants + non-goals + 5 open questions. |
