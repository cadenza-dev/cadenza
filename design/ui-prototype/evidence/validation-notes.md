# Validation Notes

> Status: focused validation for a design-only prototype.

## Commands

Run from the repository root:

```bash
pnpm exec tsc -p design/ui-prototype/tsconfig.json
node --experimental-strip-types design/ui-prototype/scripts/visual-smoke.ts
pnpm exec biome check design/ui-prototype
pnpm exec markdownlint-cli2 "design/ui-prototype/**/*.md"
git diff --check -- design/ui-prototype
```

The visual smoke uses the concrete Vite store path because the current
checkout's `node_modules/.bin/vite` symlink points at a stale pnpm store entry.

## Latest Run

Date: 2026-06-04.

| Check | Result | Notes |
| :---- | :---- | :---- |
| `pnpm exec tsc -p design/ui-prototype/tsconfig.json` | Passed | Design-local TypeScript check only. |
| `node --experimental-strip-types design/ui-prototype/scripts/visual-smoke.ts` | Passed outside sandbox | Sandbox Vite bind failed with `listen EPERM`; approved external run captured screenshots and wrote `evidence/validation-smoke.json`. |
| `pnpm exec biome check --write design/ui-prototype` | Passed | Applied formatting/import fixes and semantic a11y cleanup. |
| `pnpm exec markdownlint-cli2 "design/ui-prototype/**/*.md"` | Passed | Repo markdownlint config reported 0 errors. |
| `git diff --check -- design/ui-prototype` | Passed | No whitespace conflict markers or trailing whitespace in the prototype diff. |

Visual-smoke observations:

- `desktop-normal-shell.png`: deck title visible; horizontal overflow false.
- `desktop-diagnostics-state.png`: deck title visible; horizontal overflow false.
- `desktop-provenance-state.png`: deck title visible; horizontal overflow false.
- `mobile-viewer-state.png`: deck title visible; horizontal overflow false at
  390 x 844.
- `presenter-view-state.png`: deck title visible; horizontal overflow false.

## Scope

This validation intentionally checks the design evidence packet only:

- TypeScript compilation for the prototype files.
- Local preview opening through Vite.
- Desktop/mobile browser smoke with screenshot capture.
- Nonblank deck surface.
- Horizontal overflow signal per captured viewport.
- Markdown and Biome hygiene for `design/ui-prototype/`.

It does not claim production accessibility acceptance, broad browser coverage,
pixel parity, CI visual regression, real Remotion integration, or package-level
Player App behavior.
