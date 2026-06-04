# Phase 7 UI Prototype Promotion Evidence

> Status: Q17 promotion evidence packet, not a Phase 7 contract.

## Prototype Artifact

- Directory: `design/ui-prototype/`
- Preview command:
  `node node_modules/.pnpm/vite@8.0.10_@types+node@25.6.0_esbuild@0.28.0_terser@5.48.0/node_modules/vite/bin/vite.js --config design/ui-prototype/vite.config.ts design/ui-prototype --host 127.0.0.1 --port 4177`
- React entrypoint: `src/main.tsx`
- Fixture data: `src/fixture.ts`
- Local typecheck: `tsconfig.json`

## Q17 Required Evidence

| Requirement | Evidence |
| :---- | :---- |
| Previewable React prototype or accepted substitute | React + TypeScript prototype in `design/ui-prototype/`; no substitute path used. |
| Desktop normal shell screenshot | `evidence/screenshots/desktop-normal-shell.png` after smoke capture. |
| Desktop diagnostics/provenance screenshot | `evidence/screenshots/desktop-diagnostics-state.png` and `evidence/screenshots/desktop-provenance-state.png` after smoke capture. |
| Narrow/mobile viewer screenshot | `evidence/screenshots/mobile-viewer-state.png` after smoke capture. |
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

If the screenshots and focused validation pass, Topic 3 has the required Q17
promotion evidence needed for maintainer-approved QA closeout. Because this
goal does not authorize QA status-file edits, the recommended closeout change is
to update Topic 3 from `open` to `decided` in
`QA/phase7-pre-architect-brainstorming-decisions.md`, and to mark the UI
prototype item resolved in `QA/phase7-remaining-discussions.md`.
