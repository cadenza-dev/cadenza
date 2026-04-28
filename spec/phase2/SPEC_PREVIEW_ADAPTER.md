---
Status: CONTRACT_DRAFT
Stage: A
Owner: Architect
---

# Phase 2 Preview Adapter Specification

## Purpose

This draft contract defines how Cadenza maps the Phase 1 compiler/runtime to a
real React + Remotion browser preview backed by `@remotion/player`.

The adapter owns the last mile between semantic presentation intent and
Remotion Player frame control. It does not own authoring semantics, compiler
semantics, export, or hosted rendering.

## Stage A Design Options

### Navigation Playback Policy

1. Seek directly to the target step anchor and pause.
2. For slide transitions, seek to the transition segment, play until the target
   anchor, then pause.
3. Let native Player controls decide transition playback.

**Leaning**: option 2. Phase 2 should prove that Remotion preview is real, which
includes transition playback, while preserving deterministic pauses at semantic
step anchors.

- **FC-ID**: FC-PRAD-01
- **Question**: Should Cadenza preview animate transition segments or use
  seek-only navigation for Phase 2?
- **Options considered**:
  1. Seek-only semantic navigation.
  2. Seek-and-play transition segments, then pause at the target anchor.
  3. Delegate transition behavior to native Player controls.
- **Leaning**: option 2 for honest preview behavior.
- **Must resolve before**: Stage B freeze.

### Frame Event Source

1. Subscribe to `frameupdate` for every frame.
2. Subscribe to throttled `timeupdate`.
3. Subscribe only to `seeked`.

**Leaning**: option 1 for internal cursor synchronization, with throttling only
for optional UI displays. Remotion's Player docs identify `frameupdate` as the
event that fires during both playback and seeking whenever the frame changes.

- **FC-ID**: FC-PRAD-02
- **Question**: Which Remotion Player event should drive Cadenza cursor sync?
- **Options considered**:
  1. `frameupdate`.
  2. `timeupdate`.
  3. `seeked`.
- **Leaning**: option 1 for deterministic sync; UI display components may use a
  throttled derived state.
- **Must resolve before**: Stage B freeze.

### Native Player Controls

1. Disable native Player controls by default and render Cadenza controls.
2. Enable native Player controls by default and listen to seeks.
3. Support both equally from the start.

**Leaning**: option 1 for the default path. Cadenza owns presentation navigation
semantics; native controls can exist as a debug/developer option if seek events
still update the Cadenza cursor.

## Requirements

- **ID**: PRAD-001
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The preview adapter MUST render the inherited all-domain
  Cadenza fixture inside a real React tree containing `@remotion/player`.
- **Verification**: Playwright scenario mounts the preview adapter and observes
  the all-domain fixture in the browser.

- **ID**: PRAD-002
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The adapter MUST pass `durationInFrames`, `fps`,
  `compositionWidth`, and `compositionHeight` to `@remotion/player` from a
  Cadenza preview configuration and the compiled `TimelineMap`; it MUST NOT
  derive those values from ad hoc UI state.
- **Verification**: Unit or browser test asserts Player props reflect the
  compiled timeline and preview configuration.

- **ID**: PRAD-003
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: Cadenza navigation intents (`next`, `previous`, and `goto`)
  MUST resolve through the Cadenza runtime and then call Remotion Player frame
  operations such as `seekTo`; UI code MUST NOT compute frame anchors directly.
- **Verification**: Mock PlayerRef test asserts frame operations use runtime
  outputs from the compiled `TimelineMap`.

- **ID**: PRAD-004
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The adapter MUST keep Cadenza cursor state deterministic when
  the Remotion Player frame changes during seeking, playback, or scrubbing.
- **Verification**: Browser test drives Player frame changes and asserts the
  exposed Cadenza cursor matches `cursorAtFrame` for the compiled timeline.

- **ID**: PRAD-005
- **Priority**: P0
- **Owner**: Architect -> Builder
- **Statement**: The adapter MUST pause at semantic step anchors after
  navigation completes so a deck behaves as an interactive presentation rather
  than a continuously playing video by default.
- **Verification**: Browser test advances across at least one step and one
  slide transition, then asserts the Player frame and cursor settle at the
  expected anchor.

- **ID**: PRAD-006
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: If native Player seeking is enabled, the adapter SHOULD update
  Cadenza cursor, diagnostics, and presenter metadata from Player events rather
  than treating native seeks as unsupported drift.
- **Verification**: Browser scenario scrubs or seeks through the Player and
  observes cursor and metadata updates.

- **ID**: PRAD-007
- **Priority**: P1
- **Owner**: Architect -> Builder
- **Statement**: The adapter SHOULD surface Remotion Player errors and Cadenza
  runtime diagnostics through one preview diagnostics channel.
- **Verification**: Error fixture emits a Player error or Cadenza diagnostic
  and asserts the preview diagnostics channel includes a structured entry.

- **ID**: PRAD-008
- **Priority**: P2
- **Owner**: Architect -> Builder
- **Statement**: The adapter MAY expose custom controls hooks if they subscribe
  to Player frame state without forcing the component that renders `<Player>` to
  re-render every frame.
- **Verification**: Optional type or unit fixture uses a hook based on an
  external-store style subscription to Player frame events.

## External API Notes

Remotion Player exposes `PlayerRef` methods such as `seekTo`,
`getCurrentFrame`, `pause`, `play`, `addEventListener`, and
`removeEventListener`. Phase 2 contracts should depend on those public APIs,
not private Player internals.
