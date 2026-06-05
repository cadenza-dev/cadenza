# Phase 7 UI Prototype Promotion Evidence

> Status: Q17 promotion evidence packet, not a Phase 7 contract.

## Prototype Artifact

- Directory: `design/ui-prototype/`
- Preview command: `npm --prefix design/ui-prototype run dev`
- Validation command: `npm --prefix design/ui-prototype run validate`
- React entrypoint: `src/main.tsx`
- App shell: `src/App.tsx`
- Prototype-local UI primitives: `src/ui.tsx`
- Fixture data: `src/fixture.ts`
- Local typecheck: `tsconfig.json`
- Dependency boundary: local `package.json` / `package-lock.json` under
  `design/ui-prototype/`; this is a design package only, not a production
  `packages/` workspace package.

## Q17 Required Evidence

| Requirement | Evidence |
| :---- | :---- |
| Previewable React prototype or accepted substitute | React + TypeScript prototype in `design/ui-prototype/`; no substitute path used. |
| Desktop normal shell screenshot | `evidence/screenshots/desktop-normal-shell.png` after smoke capture. |
| Desktop diagnostics/provenance screenshot | `evidence/screenshots/desktop-diagnostics-state.png` and `evidence/screenshots/desktop-provenance-state.png` after smoke capture. |
| Narrow/mobile viewer screenshot | `evidence/screenshots/mobile-viewer-state.png` after smoke capture. |
| Strengthening screenshots | `desktop-right-inspector-collapsed.png`, `desktop-swapped-rails.png`, `desktop-activity-tooltip-state.png`, `desktop-fullscreen-state.png`, `desktop-fullscreen-final-exit.png`, `desktop-fullscreen-presenter-menu.png`, `desktop-fullscreen-menu-open.png`, `mobile-slides-drawer.png`, `mobile-inspector-drawer.png`, and `presenter-view-state.png`. |
| Fixture provenance map | `evidence/fixture-provenance.md`. |
| Prototype limitation note | `evidence/prototype-limitations.md`. |
| Guideline cross-references | `evidence/guideline-cross-references.md`. |
| Non-freeze note | Included below and in `prototype-limitations.md`. |
| Validation notes | `evidence/validation-notes.md` and generated `evidence/validation-smoke.json`. |

## Non-Freeze Note

Prototype findings are directional evidence. They do not freeze package
topology, public API, fixture field names, CSS, component structure, exact
layout pixels, screenshots, icon choices, or production behavior.

Stage A may promote findings only by restating them as options, Freeze
Candidates, requirements, evidence gates, rejected alternatives, deferred
risks, or explicit non-goals.

## Topic 3 Closeout Reading

The current packet is intended to satisfy Q17's evidence shape for
maintainer-approved QA closeout: previewable prototype, annotated screenshots,
fixture provenance, limitations, guideline cross-references, non-freeze note,
and focused validation notes.

Because this goal does not authorize QA status-file edits, the recommended
closeout change, after maintainer visual review, is to update Topic 3 from
`open` to `decided` in
`QA/phase7-pre-architect-brainstorming-decisions.md`, and to mark the UI
prototype item resolved in `QA/phase7-remaining-discussions.md`.
