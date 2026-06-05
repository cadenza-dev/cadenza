# Validation Notes

> Status: focused validation for a design-only prototype.

## Commands

Run from the repository root:

```bash
npm --prefix design/ui-prototype run typecheck
npm --prefix design/ui-prototype run validate
pnpm exec biome check design/ui-prototype
pnpm exec markdownlint-cli2 "design/ui-prototype/**/*.md"
git diff --check -- design/ui-prototype
```

## Latest Run

Date: 2026-06-05 Asia/Shanghai.

| Check | Result | Notes |
| :---- | :---- | :---- |
| `npm --prefix design/ui-prototype run typecheck` | Passed | Checks `src/**/*.ts(x)`, `scripts/**/*.ts`, and `vite.config.ts`. |
| `npm --prefix design/ui-prototype run validate` | Passed outside sandbox | Sandbox attempt was blocked by browser/server environment issues; approved external run captured screenshots, checked theme preference behavior, and wrote `evidence/validation-smoke.json`. |
| `pnpm exec biome check design/ui-prototype` | Passed | Scope remains design-only. |
| `pnpm exec markdownlint-cli2 "design/ui-prototype/**/*.md"` | Passed | Scope remains design-only. |
| `git diff --check -- design/ui-prototype` | Passed | Scope remains design-only. |

Visual-smoke observations:

- `desktop-normal-shell.png`: deck title visible; horizontal overflow false.
  Interaction checks passed for next action-anchor, thumbnail jump, and Outline
  jump.
- `desktop-diagnostics-state.png`: deck title visible; horizontal overflow false.
  Locator copy feedback passed.
- `desktop-provenance-state.png`: deck title visible; horizontal overflow
  false; Raw Details no longer renders JSON as a visible `<pre>`, `Copy to the
  Clipboard` feedback passed, and inspector section bodies report `overflow-y:
  auto`.
- `desktop-right-inspector-collapsed.png`: deck title visible; horizontal
  overflow false; right-side activity bar remains on the right edge, inspector
  pane is absent, and the measured collapsed rail width is 42px.
- `desktop-swapped-rails.png`: deck title visible; horizontal overflow false;
  status bar remains fixed with health on the right after rail swap; inspector
  and slide rail widths remain tied to their rail kind rather than their
  physical side.
- `desktop-activity-tooltip-state.png`: deck title visible; horizontal overflow
  false; activity-bar tooltip is visible above the rail layer without clipping.
- `desktop-fullscreen-state.png`: deck title visible; horizontal overflow false;
  fullscreen `next` navigation changed action anchor without blacking out the
  deck; fullscreen letterbox background matches the active slide background,
  the darker edge-hit overlay remains visible on that background, and
  pointer-position context menu open/left-click dismissal passes.
- `desktop-fullscreen-final-exit.png`: deck title visible; horizontal overflow
  false; right navigation on the final action anchor exits fullscreen.
- `desktop-fullscreen-presenter-menu.png`: deck title visible; horizontal
  overflow false; fullscreen context-menu presenter action routes to the
  presenter representation.
- `desktop-fullscreen-menu-open.png`: deck title visible; horizontal overflow
  false; theme-aware context menu remains open near the pointer for visual
  evidence.
- `mobile-viewer-state.png`: deck title visible; horizontal overflow false at
  390 x 844.
- `mobile-slides-drawer.png`: deck title visible; horizontal overflow false;
  drawer thumbnail navigation passed.
- `mobile-inspector-drawer.png`: deck title visible; horizontal overflow false;
  inspector drawer and Diagnostics topic reachability passed.
- `presenter-view-state.png`: deck title visible; horizontal overflow false.
- `themePreferenceChecks`: theme toggle persisted dark mode through reload and
  no-query navigation; fresh no-query contexts followed browser-reported OS
  light and OS dark preferences; a context without `matchMedia` fell back to
  dark.

## Scope

This validation intentionally checks the design evidence packet only:

- TypeScript compilation for the prototype files.
- Local preview opening through Vite.
- Desktop/mobile browser smoke with screenshot capture.
- Nonblank deck surface.
- Horizontal overflow signal per captured viewport.
- Interaction evidence for action-anchor navigation, slide rail navigation,
  Outline navigation, copy feedback, fullscreen navigation, final-anchor
  fullscreen exit, pointer-position context menus, presenter-menu routing,
  activity-bar tooltip layering, right-inspector collapsed rail behavior,
  provenance raw-detail copy behavior, fullscreen slide-background letterbox
  behavior, fixed status bar behavior under side swap, rail-kind width retention
  under side swap, theme preference persistence, OS theme defaulting, dark
  fallback when OS theme detection is unavailable, and mobile drawer
  reachability.
- Markdown and Biome hygiene for `design/ui-prototype/`.

It does not claim production accessibility acceptance, broad browser coverage,
pixel parity, CI visual regression, real Remotion integration, or package-level
Player App behavior.
