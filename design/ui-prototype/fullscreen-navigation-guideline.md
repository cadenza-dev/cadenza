# Phase 7 UI Prototype Fullscreen Navigation Guideline

> Status: UI prototype interaction note, not a contract.
> Date: 2026-06-04.
> Scope: `design/ui-prototype/` only.

This note records the fullscreen and bottom-control navigation direction for
the Phase 7 UI prototype. It is not a Phase 7 spec, browser API contract,
package boundary, implementation plan, or public Player App promise. Architect
Stage A must restate any promoted behavior as options, Freeze Candidates,
evidence requirements, or rejected alternatives.

## Workload Assessment

The refinement is reasonable for a React UI prototype if the prototype treats it
as a constrained interaction shell:

- add a fullscreen button to the bottom controls;
- show the intended fullscreen navigation overlays;
- route configured/default keyboard navigation;
- demonstrate pointer and touch input branches with prototype logic;
- document external presenter-controller handling as future research.

The direction becomes too large if the first prototype tries to solve
cross-platform controller drivers, operating-system signal normalization,
production-grade hardware detection, or full PowerPoint compatibility. Those
belong in future Stage A research or Builder planning, not in the first design
prototype.

## Baseline Bottom Controls

Bottom controls should remain minimal, but fullscreen is part of the baseline.

Required prototype controls:

- previous action-anchor;
- next action-anchor;
- play/pause;
- slide/step or action-anchor indicator;
- fullscreen toggle.

The bottom controls should not carry debug, frame, cursor, provenance, or
diagnostic detail. Those details belong in the inspector.

## Fullscreen Requirement

The Cadenza Player App direction must support fullscreen mode. The prototype
should treat fullscreen as a mature-player expectation, comparable to
PowerPoint and other established presentation tools.

Prototype requirements:

- entering fullscreen hides nonessential app chrome;
- fullscreen preserves deck-first presentation;
- fullscreen keeps navigation available through keyboard, pointer, touch, or
  external controller input;
- exiting fullscreen restores the previous non-fullscreen rail layout.

## Navigation Terms

Use these canonical terms in prototype notes and future handoffs:

- `previous`: move backward by one Cadenza action anchor.
- `next`: move forward by one Cadenza action anchor.

The prototype may display user-facing copy such as previous/next, back/forward,
or localized labels, but the decision notes should keep `previous` and `next`
as the implementation-neutral terms.

## Keyboard And Configured Defaults

Fullscreen should support the Cadenza project's configured navigation keys,
falling back to Cadenza's default previous/next navigation keys when no project
configuration exists.

The prototype does not need to define the final keybinding config schema. It
should only show that fullscreen navigation respects a configurable/default
keyboard route instead of hard-coding one UI-only behavior.

Keyboard navigation remains active in fullscreen even when pointer, touch, or
external controller input is available. The prototype should show that
fullscreen can be exited and that overlay controls can be reached without a
mouse. It does not need to freeze the final shortcut names, modifier behavior,
or accessibility test matrix.

## Pointer Input

When the current device appears to support mouse-like pointer input, the
fullscreen prototype should use edge-reveal navigation:

- moving the pointer into a left-edge hit region fades in the previous button;
- moving the pointer out fades the previous button out;
- moving the pointer into a right-edge hit region fades in the next button;
- moving the pointer out fades the next button out;
- right-click opens a compact fullscreen navigation/control menu or overlay.

For the prototype, "mouse-like pointer input" should be treated as a UI
capability check such as fine pointer / hover support, not a final hardware
detection contract. Stage A may later choose the exact browser APIs and fallback
rules.

## Touch Input

When the current device does not appear to support mouse-like pointer input but
does support touch input, the fullscreen prototype should accept touch gestures
and actions:

- swipe left: `previous`;
- single tap: `previous`;
- swipe right: `next`;
- double tap: `next`.

This mapping follows the maintainer's explicit request for this prototype pass.
If Stage A later wants a different PowerPoint-like, carousel-like, locale-aware,
or handedness-aware mapping, it should reopen the mapping as a separate
decision.

## External Presenter Controllers

If neither mouse-like pointer input nor touch input is detected, fullscreen
navigation should rely on external controller signals such as presentation
remote events, where available.

The first prototype should not pretend to know the final standard for those
signals. Before production implementation, the responsible agent should research
public PowerPoint or mature presentation-tool documentation, browser and
operating-system behavior, and any relevant industry conventions. The safest
initial assumption is that many presenter remotes emit standard keyboard-like
events, but Stage A must verify this before freezing an implementation contract.

## Input Priority

The fullscreen prototype should choose the most concrete available input mode in
this order:

1. configured/default keyboard navigation always remains active;
2. mouse-like pointer affordances when fine pointer / hover behavior is
   available;
3. touch gestures when touch input is available and mouse-like affordances are
   not the primary interaction mode;
4. external presenter-controller signals as a fallback or parallel input route.

This priority is a prototype simplification, not a final hardware-detection
contract.

## Reduced Motion

Fullscreen edge controls, right-click overlays, rail restoration, and
fullscreen entry/exit may use subtle fades or transitions in the prototype.
They should also have a reduced-motion posture: when `prefers-reduced-motion`
is active, fades should become instant or very short, and navigation should not
depend on motion to be understandable.

The prototype does not need production animation tokens or a complete motion
policy. Stage A should decide those separately if fullscreen behavior is
promoted.

## Out Of Scope For The First Prototype

- Production-grade hardware detection.
- Operating-system controller integration.
- Full PowerPoint compatibility.
- Persistent per-device input profiles.
- Gesture customization UI.
- Full mobile presenter mode.
- Debug or source-editing actions in fullscreen controls.
