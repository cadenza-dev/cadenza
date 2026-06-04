# Phase 7 UI Prototype

> Status: pre-Architect design prototype, not a package, spec, ADR, or public
> Player App contract.

This directory contains the Phase 7 Topic 3 / Q17 promotion evidence prototype:
a previewable React + TypeScript shell using shadcn-compatible CSS variables
and component patterns. It stays outside the workspace package boundary and does
not import `CadenzaPlayer`, Remotion, `preview-remotion`, or production package
code.

## Preview

```bash
node node_modules/.pnpm/vite@8.0.10_@types+node@25.6.0_esbuild@0.28.0_terser@5.48.0/node_modules/vite/bin/vite.js --config design/ui-prototype/vite.config.ts design/ui-prototype --host 127.0.0.1 --port 4177
```

Open <http://127.0.0.1:4177>.

Useful query examples:

```text
/?state=ready&topic=Outline&theme=light
/?state=blocked&topic=Diagnostics&theme=light
/?state=provenance&topic=Provenance&theme=dark
/?state=pending&topic=Readiness&theme=dark
/?state=pending&topic=Readiness&theme=dark&panel=inspector
/?state=ready&topic=Notes&theme=dark&presenter=true
```

## Focused Validation

```bash
pnpm exec tsc -p design/ui-prototype/tsconfig.json
node --experimental-strip-types design/ui-prototype/scripts/visual-smoke.ts
pnpm exec biome check design/ui-prototype
pnpm exec markdownlint-cli2 "design/ui-prototype/**/*.md"
git diff --check -- design/ui-prototype
```

The screenshot smoke starts a local Vite server, opens desktop/mobile viewports,
captures annotated evidence screenshots, and writes
`evidence/validation-smoke.json`.

Note: this uses the concrete Vite store path because the current checkout's
`node_modules/.bin/vite` symlink points at a stale pnpm store entry.
