# Phase 7 UI Prototype Presenter View Guideline

> Status: UI prototype presenter-view note, not a contract.
> Date: 2026-06-04.
> Scope: `design/ui-prototype/` only.

This note records the presenter-view direction for the Phase 7 UI prototype.
It is not a Phase 7 spec, browser API contract, desktop-app contract,
implementation plan, or public Player App promise. Architect Stage A must
restate any promoted behavior as options, Freeze Candidates, evidence
requirements, or rejected alternatives.

## Core Position

Presenter view is strategically meaningful for Cadenza because technical talks
need speaker notes, current/next context, navigation confidence, and diagnostic
awareness while the audience sees only the deck content.

However, presenter view should be treated as a staged capability:

- browser/web local-ready can offer presenter view as an explicit,
  feature-detected enhancement, but should not promise PowerPoint-grade
  reliable automatic multi-screen placement;
- desktop app local-ready can target a stronger, reliable presenter-view
  promise if the phase scope includes a desktop shell such as Electron, Tauri,
  or an equivalent app runtime with OS-level window and display APIs;
- third-party libraries are useful only insofar as they wrap or expose those
  app-runtime and OS-level capabilities. A normal browser dependency alone does
  not change the browser reliability boundary.
- the UI prototype may design the complete presenter view and interaction flow
  now, while leaving implementation guarantees to Stage A/B.

## Browser Versus Desktop App Reality

In a plain browser runtime, multi-screen behavior depends on browser support,
permissions, secure context, popup/window behavior, and experimental APIs such
as Window Management. It can be useful, but it is not a safe cross-browser P0
promise.

In a desktop app shell, the app can use runtime APIs to inspect displays,
create windows, position windows, and enter fullscreen or simple-fullscreen
modes more directly. This makes app-side reliable presenter mode a plausible
local-ready target, subject to a later explicit runtime choice, platform matrix,
and evidence gate. Official examples and APIs exist for this class of behavior:

- Electron's `screen` module exposes display information such as primary and
  external displays and can be used with `BrowserWindow` placement.
- Tauri exposes window/webview APIs for creating windows, setting position and
  size, and controlling fullscreen behavior.
- Browser Window Management exposes `getScreenDetails()` and screen-targeted
  fullscreen as web capabilities, but with permission and support limitations.

References for future Stage A research:

- Electron `screen`: <https://www.electronjs.org/docs/latest/api/screen>
- Tauri `webviewWindow`: <https://tauri.app/reference/javascript/api/namespacewebviewwindow/>
- MDN `getScreenDetails`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/getScreenDetails>
- MDN Window Management API usage: <https://developer.mozilla.org/en-US/docs/Web/API/Window_Management_API/Using>

## Prototype Presenter-View Flow

The prototype should express this intended behavior:

- If multiple displays are detected, offer or simulate split presentation:
  - presenter view on the primary or smaller screen;
  - audience view on the extended or larger screen.
- If multiple displays are not detected, default to normal player view.
- At any time, a right-click menu may force presenter view on the current
  screen.
- If display placement cannot be trusted, show a clear setup prompt rather than
  silently claiming automatic placement worked.

The prototype should moderately reference PowerPoint's presenter-view concept:
current slide, next context, notes, timer/progress where useful, and navigation
confidence. Detailed presenter-view UI layout can be discussed separately if it
becomes a dedicated design topic.

## Notes Boundary

Normal audience/player view:

- notes are hidden by default;
- notes are not audience content;
- notes can be inspected only through explicit presenter metadata affordances.

Presenter view:

- notes become visible as presenter metadata;
- current/next context may be visible;
- diagnostics/readiness may appear as summary signals;
- source editing and repair actions remain out of scope.

## Local-Ready Meaning

Reliable presenter mode is meaningful for local-ready because it makes Cadenza
credible as a real presentation tool, not only a deck viewer or export demo.
For a developer giving a technical talk, presenter view can be as important as
export quality.

That does not mean browser-only Phase 7 must deliver full reliable presenter
mode. A better staged posture is:

- Phase 7 UI prototype: design complete presenter-view flow and note browser
  limitations.
- Browser/web local-ready: support explicit presenter view and feature-detected
  multi-screen enhancement, with documented limitations.
- Desktop/app local-ready or later: target reliable multi-screen presenter mode
  if a desktop shell is accepted in scope, with OS display/window integration
  and cross-platform evidence.

## Out Of Scope For The First Prototype

- Freezing final presenter-view layout.
- Guaranteeing automatic multi-screen placement in all browsers.
- Choosing Electron, Tauri, or another desktop shell.
- Implementing OS-specific presenter-controller handling.
- Persisting per-device presentation setups.
- Adding source editing, AI repair, or WYSIWYG controls.
