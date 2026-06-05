# Phase 7 UI Prototype Layout Guideline

> Status: UI prototype layout note, not a contract.
> Date: 2026-06-04.
> Scope: `design/ui-prototype/` only.

This note records the desktop layout direction for the Phase 7 UI prototype.
It is not a Phase 7 spec, package boundary, implementation plan, public API, or
Player App contract. Architect Stage A must restate any promoted decisions as
options, Freeze Candidates, evidence requirements, or rejected alternatives.

## Layout Direction

The desktop prototype should use a deck-primary three-rail layout:

- Center: the deck canvas remains the primary visual object.
- Left rail: a static slide/deck preview rail, visually similar in role to
  PowerPoint's slide thumbnail strip.
- Right rail: an inspector rail for outline, readiness, diagnostics, and export
  provenance.
- Bottom rail: playback and action-anchor controls.
- Bottom status bar: a narrow persistent status row for compact summaries.
- Top navigation bar: global app controls, including rail toggles and side-rail
  swap.

This refines the earlier "right rail inspector" direction rather than replacing
it. The right inspector remains important, but the left slide-preview rail and
collapsible bottom controls are also part of the prototype baseline.

## Rail Behavior

### Left Rail

- Shows static deck/slide previews.
- Can collapse toward the left edge.
- Has adjustable width.
- Does not need live animated thumbnails for the prototype.
- Should remain a navigation/preview surface, not a source editor or slide
  editor.

### Right Rail

- Carries the inspector content for:
  - outline;
  - readiness;
  - diagnostics;
  - provenance.
- Should borrow the interaction idea of an activity bar plus content pane from
  VS Code's side bar: each topic has a button, and the selected button controls
  which inspector topic is visible.
- Clicking the active topic button may collapse the right rail; clicking another
  topic opens or switches the inspector content.
- The prototype may borrow layout ideas from VS Code's public source or
  observable behavior, but it must follow the explicit Cadenza requirements in
  this note rather than copying VS Code's full workbench model.

### Bottom Rail

- Carries playback controls and action-anchor status.
- Can collapse downward.
- Has adjustable height.
- Must not become the primary place for inspector details; diagnostics and
  provenance detail belong in the right rail.
- Sits above the persistent bottom status bar.

### Bottom Status Bar

- Stays visible in the normal desktop shell.
- Spans the full viewport width as app chrome, visually similar in density to
  the top navigation bar.
- Uses compact left and right clusters while leaving the center mostly empty.
- The cluster nearest the slide-preview rail may show deck, slide, cursor, or
  provenance summary.
- The cluster nearest the inspector rail should show the health signal:
  `Ready`, `Checking`, `Warnings`, or `Blocked`, with counts where useful.
- When side rails are swapped, the health signal follows the inspector rail.
- Clicking the health signal opens the inspector rail and switches to the
  relevant `Readiness` or `Diagnostics` topic.
- The status bar must not contain diagnostic detail, repair actions, raw JSON,
  or dense controls.

## Top Navigation Controls

The top navigation bar should reserve a right-side control cluster, excluding
any window operation area. That cluster should contain four layout buttons:

- toggle left rail;
- toggle bottom rail;
- toggle right rail;
- swap left and right rails.

The swap control is for exploring whether the slide-preview rail and inspector
rail should trade sides. It is a prototype affordance and does not imply a
Phase 7 production preference until Stage A accepts one.

## Layering And Resize Rules

The rail hierarchy is:

1. left and right rails share the top layout priority;
2. bottom rail has lower priority.

When side rails and the bottom rail are open at the same time, the bottom rail
must avoid the open left and right rail regions. In practical terms, the bottom
rail should occupy the center column below the deck canvas rather than extending
under the side rails.

The bottom status bar is app chrome rather than a rail. It may span the full
width below all rails, while the collapsible bottom rail remains attached to the
center deck column above it.

## Basic Keyboard And Focus Posture

The prototype should demonstrate that the three-rail layout has a keyboard and
focus path, without freezing production shortcuts or a full accessibility
matrix.

Recommended focus order:

1. top navigation and layout controls;
2. left slide-preview rail;
3. center deck canvas and bottom controls;
4. bottom status bar;
5. right activity bar;
6. active inspector content pane.

Keyboard users should be able to reach and operate the prototype's core layout
affordances:

- collapse or expand the left, right, and bottom rails;
- move between slide-preview items;
- operate previous/next/play/fullscreen controls;
- open the health signal in the relevant inspector topic;
- switch inspector topics;
- expand or collapse inspector sections.

All icon-only layout controls should have accessible labels and visible focus
states. Tooltips are useful for visual discovery, but they are not a substitute
for labels. The prototype does not need production focus persistence, complex
shortcut customization, command palette behavior, or a full ARIA acceptance
matrix.

For a React prototype, a restrained implementation is enough:

- top bar row;
- main content area with left rail, deck canvas, and right rail columns;
- bottom controls row attached to the center deck column;
- resize handles for left width, right width, and bottom height;
- collapsed states for each rail;
- optional side swap by exchanging left/right rail assignments.

The prototype should not implement full VS Code workbench behavior such as
arbitrary panel docking, drag-to-any-side layouts, persistent workbench state,
multi-window management, command palette wiring, or complex keyboard shortcut
systems unless a later explicit task asks for them.

## Workload Assessment

This direction is reasonable for a React prototype and should not create an
oversized implementation if the scope stays limited to:

- fixed rail roles;
- basic collapse toggles;
- basic width/height adjustment;
- simple side swapping;
- static slide thumbnails;
- right-rail topic switching.

The risky expansion points are:

- live animated slide thumbnails;
- arbitrary drag-and-drop docking;
- persisted layout profiles;
- full presenter-mode mobile behavior;
- production accessibility acceptance matrices;
- real `CadenzaPlayer` / Remotion runtime integration.

Those expansion points should stay outside the first prototype unless the
maintainer explicitly promotes them.
