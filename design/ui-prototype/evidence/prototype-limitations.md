# Prototype Limitation Note

> Status: Q17 evidence note, not a contract.

Prototype findings are directional evidence. They do not freeze package
topology, public API, fixture field names, CSS, component structure, exact
layout pixels, screenshots, icon choices, or production behavior.

## Implementation Limits

- The prototype is a React + TypeScript design package under
  `design/ui-prototype/`, not a production workspace package under `packages/`.
- The prototype uses local `package.json` / `package-lock.json` dependencies so
  it can start with ordinary package commands. This local package does not
  create `@cadenza-dev/player-app` and does not change production workspace
  topology.
- The prototype uses shadcn-compatible CSS variables, component patterns,
  `lucide-react` icons, and `react-resizable-panels` handles, but it does not
  freeze shadcn, lucide, resizable panels, or any other production dependency.
- Light/dark mode changes Player App chrome only. Deck slides and slide
  thumbnails intentionally keep the authored/source slide theme in this
  prototype; dynamic deck theme switching is not implied.
- Runtime data is hybrid fixture data in `src/fixture.ts`; generated `dist/`
  artifacts are source material only.
- Raw Details copies the current provenance fixture payload to the clipboard as
  design evidence. It does not freeze a production raw-data viewer, JSON schema,
  or disclosure pattern.
- It does not import or instantiate `CadenzaPlayer`, Remotion,
  `preview-remotion`, authored deck modules, or package source.
- Pseudo-fullscreen hides app chrome, keeps edge navigation plus a
  pointer-position context menu, and fills by deck aspect ratio, but it is not a
  browser fullscreen API contract.
- Touch and pointer branches are prototype-level interaction evidence. They are
  not final hardware detection, controller-driver, or platform-normalization
  contracts.
- Presenter view is represented as an explicit metadata flow only. Browser
  multi-screen placement and desktop-app display control remain Stage A
  research topics.

## Product Limits

- The UI remains read-only. Diagnostic copy affordances do not imply in-app
  repair, source editing, AI patching, regeneration, or re-export.
- Mobile is a responsive viewer with folded rails/inspector. It is not a full
  mobile presenter console.
- Screenshots are visual evidence, not pixel-perfect baselines or CI visual
  regression gates.
- Accessibility posture covers labels, focus states, keyboard reachability, and
  reduced-motion treatment at prototype level only; production acceptance
  remains Stage A/B scope.
