# Cadenza Local Export Walkthrough

This walkthrough documents the Cadenza clean-checkout local developer workflow:
install dependencies, validate a trusted deck module, export static web
compatibility output, export a local MP4, and inspect generated artifacts.

Cadenza local export is local-only. It is not an alpha announcement, npm
publication, hosted rendering path, Remotion Lambda production path, Player App
export, PDF/PPTX support, arbitrary plugin loading surface, or release plan.

## Prerequisites

- Node.js and pnpm are required for the workspace scripts.
- The Remotion renderer dependencies are installed by `pnpm install`.
- Local MP4 export needs a browser executable that Remotion can launch. If the
  automatic lookup does not work, set `CADENZA_REMOTION_BROWSER_EXECUTABLE` to
  a local Chrome or Chrome Headless Shell path.
- Local MP4 export also depends on ffmpeg availability through the Remotion
  renderer stack.
- The workflow runs local deck modules and project config in the current
  checkout: local deck modules and `cadenza.config.ts` are trusted local code.
  No sandbox is provided by the local export workflow.

## Install and Discover

From a clean checkout:

```bash
pnpm install
pnpm cadenza --help
pnpm cadenza --version
```

The root `pnpm cadenza` command is a thin local wrapper around the Cadenza CLI
package. It does not require npm publication.

## Validate a Deck

Validate the canonical built-in deck:

```bash
pnpm cadenza validate cadenza-alpha-readiness-talk --json
```

Validation loads the selected trusted local deck module, checks deck metadata,
compiles the deck, derives timeline evidence, and exits without writing export
deliverables. Human output is the default; `--json` writes stable machine
output on stdout without ANSI progress text.

## Export Static Web Compatibility Output

Generate the static web compatibility output:

```bash
pnpm cadenza export cadenza-alpha-readiness-talk --run-id local-web --format web
```

By default, generated output is written under:

```text
dist/cadenza/<deck-id>/<run-id>/
```

For the command above, the expected directory shape is:

```text
dist/cadenza/cadenza-alpha-readiness-talk/local-web/
|-- .cadenza-generated.json
|-- index.html
|-- manifest.json
`-- web-evidence.json
```

The web output is a compatibility export, not the future Player App web export.
It is produced through the compatibility adapter boundary so later phases can
replace it with a fuller app surface. Local export web evidence records semantic
anchors, manifest linkage, static compatibility limitations, and the semantic browser smoke expectation checked in `tests/browser/` with semantic evidence as the primary oracle.

## Export a Local MP4

Generate a local MP4:

```bash
pnpm cadenza export cadenza-alpha-readiness-talk --run-id local-mp4 --format mp4
```

The expected directory shape is:

```text
dist/cadenza/cadenza-alpha-readiness-talk/local-mp4/
|-- .cadenza-generated.json
|-- manifest.json
|-- mp4-evidence.json
`-- cadenza-alpha-readiness-talk.mp4
```

MP4 rendering stays behind the renderer adapter boundary. Evidence records
renderer provenance, composition metadata, localPrerequisites, cleanup, and
knownLimitations. The temporary renderer state is routed through the registry-owned
renderer temp root and cleaned up where possible. If local browser or renderer
prerequisites are missing, the command reports structured diagnostics and
failure evidence instead of a partial success claim.

## Inspect Generated Artifacts

Inspect by manifest path:

```bash
pnpm cadenza inspect dist/cadenza/cadenza-alpha-readiness-talk/local-web/manifest.json --json
```

You can also inspect the artifact directory:

```bash
pnpm cadenza inspect dist/cadenza/cadenza-alpha-readiness-talk/local-web --json
```

`inspect` is artifact-only. It reads `manifest.json` plus per-format evidence
such as `web-evidence.json` and `mp4-evidence.json`; it does not reload deck
source modules.

## Manifest and Evidence Fields

`manifest.json` is the compact export summary. Expected fields include:

- `schemaVersion`
- `command`
- `deck`
- `selector`
- `formats`
- `outputRoot`
- `outputDirectory`
- `artifacts`
- `evidence`
- `capabilities`
- `knownLimitations`
- `stableHash`
- `deterministic`
- `volatile`
- `diagnostics`

`stableHash` covers deterministic contract fields such as deck identity,
timeline digest, selected formats, relevant config defaults, schema version,
and capability declarations. It intentionally excludes generated artifact bytes
and volatile paths/timestamps.

Per-format evidence files hold format-specific details. `web-evidence.json`
records compatibility adapter boundary information, semantic anchors,
manifestReference, browser smoke expectations, and static web limitations.
`mp4-evidence.json` records rendererProvenance, localPrerequisites,
composition, containerMetadata, cleanup, artifact metadata, diagnostics, and
MP4 limitations.

## Minimal Config

A minimal `cadenza.config.ts` uses `defineConfig` to define trusted deck
aliases, output defaults, and default formats:

```ts
import { defineConfig } from "@cadenza-dev/cli";

export default defineConfig({
  decks: {
    "local-talk": "./examples/cadenza/alpha-readiness-talk.tsx",
  },
  output: {
    root: "dist/cadenza",
  },
  export: {
    defaultFormats: ["web", "mp4"],
  },
});
```

CLI flags override config values. Config values override registry defaults.
Cadenza config is limited to `decks`, `output.root`, and
`export.defaultFormats`; broader preview, Player App, hosted, plugin, and
interactive config surfaces are future work.

## Non-Interactive Behavior

Commands use no prompts in CI or agent-style non-TTY runs. If an output
directory is already owned by Cadenza generated output, regeneration can clean
and rewrite it. If an existing directory is not recognized as generated output,
pass an explicit confirmation flag such as `--force`.

Use `--json` when a script or agent needs machine output. Human output may use
stderr for short progress or repair routing text, while JSON summaries stay on
stdout.

## Generated Output Ownership

Generated `dist/` and `tmp/` outputs are live artifacts, not tracked fixtures.
Tests may create and inspect them, following the placement rules in
[`docs/design/testing-taxonomy.md`](./design/testing-taxonomy.md). The manifest
is a compact summary; per-format evidence files own format-specific evidence.
Config-defined output roots still go through generated-output safety checks.

## Common Failure Routing

Common diagnostics use structured categories so callers can route repair:

- `usage`: unsupported flags, missing selectors, or invalid command shapes.
- `config`: unknown config keys or invalid config value shapes.
- `validation`: deck metadata, compile, or timeline validation failures.
- `inspect`: missing manifests, malformed evidence, or unsupported schema
  versions.
- `environment`: local browser or renderer prerequisites are unavailable.
- `renderer`: the MP4 render stage failed after prerequisites were resolved.

These diagnostics are local evidence for developer repair. They do not imply
hosted rendering, release readiness, Player App export, PDF/PPTX support, or
plugin-loaded deck execution.
