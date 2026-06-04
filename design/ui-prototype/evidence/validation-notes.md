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
| `npm --prefix design/ui-prototype run validate` | Passed outside sandbox | Sandbox Vite bind fails with `listen EPERM`; approved external run on default port `4177` captured screenshots and wrote `evidence/validation-smoke.json`. |
| `pnpm exec biome check design/ui-prototype` | Passed | Scope remains design-only. |
| `pnpm exec markdownlint-cli2 "design/ui-prototype/**/*.md"` | Passed | Scope remains design-only. |
| `git diff --check -- design/ui-prototype` | Passed | Scope remains design-only. |

Visual-smoke observations:

- `desktop-normal-shell.png`: deck title visible; horizontal overflow false.
  Interaction checks passed for next action-anchor, thumbnail jump, and Outline
  jump.
- `desktop-diagnostics-state.png`: deck title visible; horizontal overflow false.
  Locator copy feedback passed.
- `desktop-provenance-state.png`: deck title visible; horizontal overflow false.
- `desktop-swapped-rails.png`: deck title visible; horizontal overflow false;
  health signal followed the semantic inspector side.
- `desktop-fullscreen-state.png`: deck title visible; horizontal overflow false;
  fullscreen `next` navigation changed action anchor without blacking out the
  deck.
- `mobile-viewer-state.png`: deck title visible; horizontal overflow false at
  390 x 844.
- `mobile-slides-drawer.png`: deck title visible; horizontal overflow false;
  drawer thumbnail navigation passed.
- `mobile-inspector-drawer.png`: deck title visible; horizontal overflow false;
  inspector drawer and Diagnostics topic reachability passed.
- `presenter-view-state.png`: deck title visible; horizontal overflow false.

## Scope

This validation intentionally checks the design evidence packet only:

- TypeScript compilation for the prototype files.
- Local preview opening through Vite.
- Desktop/mobile browser smoke with screenshot capture.
- Nonblank deck surface.
- Horizontal overflow signal per captured viewport.
- Interaction evidence for action-anchor navigation, slide rail navigation,
  Outline navigation, copy feedback, fullscreen navigation, semantic side swap,
  and mobile drawer reachability.
- Markdown and Biome hygiene for `design/ui-prototype/`.

It does not claim production accessibility acceptance, broad browser coverage,
pixel parity, CI visual regression, real Remotion integration, or package-level
Player App behavior.
