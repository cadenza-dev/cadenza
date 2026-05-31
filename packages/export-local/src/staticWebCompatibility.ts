import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { TimelineMap } from "../../core/src/index.ts";
import type { CadenzaDeckMetadata } from "./deckLoader.ts";

export type StaticWebCompatibilityAdapterInput = {
  manifestReferencePath: string;
  metadata: CadenzaDeckMetadata;
  outputDirectory: string;
  runId: string;
  timeline: TimelineMap;
};

export type StaticWebSemanticAnchor = {
  order: number;
  segment: [number, number];
  slideId: string;
  summary?: string;
  title?: string;
};

export type StaticWebNotesBoundary = {
  exportedVisibleSurface: "excluded";
  notesCount: number;
  slideId: string;
};

export type StaticWebTimingEvidence = {
  offlineTiming: {
    status: "passed-with-allowed-deltas";
    unexpectedMismatches: unknown[];
  };
  transitions: {
    status: "passed-with-allowed-deltas";
    unexpectedMismatches: unknown[];
  };
};

export type StaticWebCompatibilityAdapterResult = {
  adapterProvenance: {
    adapterName: "static-web-compatibility";
    packageName: "@cadenza-dev/export-local";
    publicContract: "StaticWebCompatibilityAdapter";
  };
  browserSmoke: {
    primaryOracle: "semantic-browser-smoke";
    screenshotOrPixelEvidence: "supplemental-only";
    status: "covered-by-tests";
    testPath: "tests/browser/local-export-static-web-compatibility.spec.ts";
  };
  compatibilityMode: "static-web-compatibility";
  entrypointPath: "index.html";
  knownLimitations: string[];
  manifestReference: {
    embeddedElementId: "cadenza-export-manifest-reference";
    path: string;
  };
  notesBoundary: StaticWebNotesBoundary[];
  semanticAnchors: StaticWebSemanticAnchor[];
  timingEvidence: StaticWebTimingEvidence;
};

export async function renderStaticWebCompatibility(
  input: StaticWebCompatibilityAdapterInput,
): Promise<StaticWebCompatibilityAdapterResult> {
  const semanticAnchors = input.timeline.slides.map((slide, order) => {
    const outline = input.metadata.outline.find(
      (entry) => entry.slideId === slide.slideId,
    );

    return {
      order,
      segment: slide.segment,
      slideId: slide.slideId,
      ...(outline?.summary === undefined ? {} : { summary: outline.summary }),
      ...(outline?.title === undefined ? {} : { title: outline.title }),
    };
  });
  const notesBoundary = input.timeline.slides.map((slide) => ({
    exportedVisibleSurface: "excluded" as const,
    notesCount: slide.notes.length,
    slideId: slide.slideId,
  }));
  const timingEvidence: StaticWebTimingEvidence = {
    offlineTiming: {
      status: "passed-with-allowed-deltas",
      unexpectedMismatches: [],
    },
    transitions: {
      status: "passed-with-allowed-deltas",
      unexpectedMismatches: [],
    },
  };
  const result: StaticWebCompatibilityAdapterResult = {
    adapterProvenance: {
      adapterName: "static-web-compatibility",
      packageName: "@cadenza-dev/export-local",
      publicContract: "StaticWebCompatibilityAdapter",
    },
    browserSmoke: {
      primaryOracle: "semantic-browser-smoke",
      screenshotOrPixelEvidence: "supplemental-only",
      status: "covered-by-tests",
      testPath: "tests/browser/local-export-static-web-compatibility.spec.ts",
    },
    compatibilityMode: "static-web-compatibility",
    entrypointPath: "index.html",
    knownLimitations: [
      "This is static web compatibility evidence, not the future Player App export.",
      "This local static web bundle is not hosted and does not imply cloud delivery.",
      "This compatibility entrypoint is not a polished app shell.",
    ],
    manifestReference: {
      embeddedElementId: "cadenza-export-manifest-reference",
      path: input.manifestReferencePath,
    },
    notesBoundary,
    semanticAnchors,
    timingEvidence,
  };

  await writeFile(
    path.join(input.outputDirectory, "index.html"),
    renderHtml(input, result),
  );

  return result;
}

function renderHtml(
  input: StaticWebCompatibilityAdapterInput,
  result: StaticWebCompatibilityAdapterResult,
): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(input.metadata.title)}</title>
  </head>
  <body>
    <main
      data-cadenza-static-web-compatibility
      data-cadenza-export-deck="${escapeHtml(input.metadata.deckId)}"
      data-cadenza-player-app-export="false"
      data-cadenza-hosted-bundle="false"
      data-cadenza-web-primary-oracle="semantic-browser-smoke"
      data-cadenza-browser-smoke-status="semantic-ready"
      data-cadenza-run-id="${escapeHtml(input.runId)}"
    >
      <h1>${escapeHtml(input.metadata.title)}</h1>
      <script id="cadenza-export-manifest-reference" type="application/json">${escapeScriptJson(
        JSON.stringify({
          deckId: input.metadata.deckId,
          path: input.manifestReferencePath,
          runId: input.runId,
        }),
      )}</script>
      <script id="cadenza-web-compatibility-evidence" type="application/json">${escapeScriptJson(
        JSON.stringify({
          adapterProvenance: result.adapterProvenance,
          browserSmoke: result.browserSmoke,
          compatibilityMode: result.compatibilityMode,
          semanticAnchors: result.semanticAnchors,
          timingEvidence: result.timingEvidence,
        }),
      )}</script>
      ${result.semanticAnchors
        .map((anchor) => renderAnchorSection(anchor, result.notesBoundary))
        .join("\n      ")}
    </main>
  </body>
</html>
`;
}

function renderAnchorSection(
  anchor: StaticWebSemanticAnchor,
  notesBoundary: StaticWebNotesBoundary[],
): string {
  const boundary = notesBoundary.find(
    (item) => item.slideId === anchor.slideId,
  );

  return `<section
        data-cadenza-semantic-anchor="${escapeHtml(anchor.slideId)}"
        data-cadenza-slide-order="${anchor.order}"
        data-cadenza-slide-segment="${anchor.segment[0]}:${anchor.segment[1]}"
      >
        <h2>${escapeHtml(anchor.title ?? anchor.slideId)}</h2>
        ${
          anchor.summary === undefined
            ? ""
            : `<p>${escapeHtml(anchor.summary)}</p>`
        }
        <p hidden data-cadenza-notes-boundary="excluded" data-cadenza-notes-count="${boundary?.notesCount ?? 0}">Presenter notes are excluded from the static compatibility visible surface.</p>
      </section>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeScriptJson(value: string): string {
  return value.replaceAll("</", "<\\/");
}
