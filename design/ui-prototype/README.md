# Phase 7 UI Prototype

> Status: pre-Architect design package, not a workspace package, spec, ADR,
> production dependency decision, or public Player App contract.

This directory contains the Phase 7 Topic 3 / Q17 promotion evidence prototype:
a previewable React + TypeScript shell using shadcn-compatible CSS variables
and component patterns, `lucide-react` icons, and direct resizable panel
handles. It stays outside the production workspace package boundary and does
not import `CadenzaPlayer`, Remotion, `preview-remotion`, or production package
code.

## Preview

Install the design-only package dependencies when needed:

```bash
npm --prefix design/ui-prototype install
npm --prefix design/ui-prototype run dev
```

Open <http://127.0.0.1:4177>.

Useful query examples:

```text
/?state=ready&topic=Outline&theme=light&anchor=2
/?state=blocked&topic=Diagnostics&theme=light&anchor=4
/?state=provenance&topic=Provenance&theme=dark&anchor=3
/?state=provenance&topic=Provenance&theme=dark&inspector=closed&anchor=3
/?state=ready&topic=Outline&theme=dark&fullscreen=true&anchor=1
/?state=pending&topic=Readiness&theme=dark&panel=slides&anchor=4
/?state=pending&topic=Diagnostics&theme=dark&panel=inspector&anchor=4
/?state=ready&topic=Notes&theme=dark&presenter=true&anchor=2
```

## Focused Validation

```bash
npm --prefix design/ui-prototype run typecheck
npm --prefix design/ui-prototype run validate
pnpm exec biome check design/ui-prototype
pnpm exec markdownlint-cli2 "design/ui-prototype/**/*.md"
git diff --check -- design/ui-prototype
```

The screenshot smoke starts this package's local Vite server, opens
desktop/mobile viewports, exercises action-anchor navigation, copy feedback,
fullscreen navigation, final-anchor fullscreen exit, pointer-position context
menus, activity-bar tooltip layering, right-inspector collapsed rail behavior,
fullscreen slide-background letterboxing, rail-kind width retention under side
swap, fixed status-bar behavior under side swap, theme preference persistence,
OS theme defaulting, dark fallback when OS theme detection is unavailable, and
drawer states, captures annotated evidence screenshots, and writes
`evidence/validation-smoke.json`.
