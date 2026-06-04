# Prototype Limitation Note

> Status: Q17 evidence note, not a contract.

Prototype findings are directional evidence. They do not freeze package
topology, public API, fixture field names, CSS, component structure, exact
layout pixels, screenshots, icon choices, or production behavior.

## Implementation Limits

- The prototype is a React + TypeScript design artifact under
  `design/ui-prototype/`, not a workspace package.
- The prototype uses shadcn-compatible CSS variables and component patterns, but
  it does not install or freeze shadcn as a production dependency.
- Runtime data is hybrid fixture data in `src/fixture.ts`; generated `dist/`
  artifacts are source material only.
- It does not import or instantiate `CadenzaPlayer`, Remotion,
  `preview-remotion`, authored deck modules, or package source.
- Pseudo-fullscreen hides app chrome and shows the intended navigation overlay,
  but it is not a browser fullscreen API contract.
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
