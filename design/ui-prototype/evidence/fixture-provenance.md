# Fixture Provenance Map

> Status: Q17 evidence note, not a production data contract.

The prototype uses a hybrid fixture. Generated `dist/` artifacts are source
material only; they are not tracked canonical fixtures and do not prove that a
future Player App data field exists.

| Prototype field group | Source class | Source material | Stage A reading |
| :---- | :---- | :---- | :---- |
| `deck.title`, `deck.deckId`, `deck.sourcePath`, `targetAudience` | `deck metadata` | `examples/cadenza/alpha-readiness-talk.tsx` | Available today as authored deck metadata; labels and placement remain Stage A decisions. |
| `chapters[]`, `outline[]` | `deck metadata` plus `format evidence` | authored metadata plus `web-evidence.json.semanticAnchors` | Candidate Player App outline model; exact field names are not frozen. |
| `stableHash` | `manifest` | `dist/cadenza/cadenza-alpha-readiness-talk/playwright-b6-3-web/manifest.json` | Stable identity/provenance signal can be promoted only after Stage A defines the Player App manifest contract. |
| `selector.*` | `manifest` | `manifest.json.selector` | Resolver provenance only; it must not override canonical deck identity. |
| `artifacts[]` | `manifest` plus `format evidence` | `manifest.json.artifacts`, `web-evidence.json.artifacts` | Useful evidence inventory shape; exact artifact roles and copy/open affordances remain Stage A decisions. |
| `formatCapabilities[]` | `format evidence` | `web-evidence.json`, Topic 5 export posture | Shows web supported / MP4 limited distinction; not a production capability schema. |
| `readiness[]` | `validate summary`, `player snapshot`, `prototype-only` | representative fixture state in `src/fixture.ts` | Layout stress data. Stage A must define the real snapshot/readiness source. |
| `diagnostics[]` | `player snapshot`, `prototype-only` | representative fixture state in `src/fixture.ts` | Demonstrates read-only diagnostic IA and locator copy posture; codes are not frozen UI copy. |
| `limitations[]` | `format evidence`, `prototype-only` | Topic 5, Topic 12, Q17 decisions and state fixture | Demonstrates known-limitation surfacing; production limitation taxonomy remains open. |
| rail collapse, direct sash handles, side swap, drawer, pseudo-fullscreen state | `prototype-only` | `src/App.tsx`, `src/ui.tsx`, layout/fullscreen guidelines | Interaction evidence only; not production layout persistence or browser API contract. |
| presenter-view mock state | `prototype-only` | `docs/presenter-view-guideline.md`, `src/App.tsx` | Shows intended notes boundary; browser/desktop presenter guarantees remain Stage A research. |

## Source Classes Used

- `deck metadata`
- `validate summary`
- `player snapshot`
- `manifest`
- `format evidence`
- `prototype-only`
