import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

type CadenzaExportDeckId = "phase5-alpha-readiness-talk";

type DeckDescriptor = {
  deckId: CadenzaExportDeckId;
  fixtureExport: string;
  metadataExport: string;
  sourcePath: string;
};

type ExportArgs = {
  deckId: CadenzaExportDeckId;
  runId: string;
};

type DeckFixture = {
  offlineTimeline: TimelineMap;
};

type DeckMetadata = {
  deckId: CadenzaExportDeckId;
  exportCommand: string;
  outline: {
    slideId: string;
    summary: string;
    title: string;
  }[];
  sourcePath: string;
  title: string;
};

type TimelineMap = {
  fps: number;
  navigationPolicy: string;
  totalFrames: number;
  slides: TimelineSlide[];
};

type TimelineSlide = {
  slideId: string;
  notes: string[];
  resources: {
    resourceId: string;
    resourceKind: string;
    timeoutMs: number;
  }[];
  segment: [number, number];
  steps: {
    kind: string;
    segment: [number, number];
    stepIndex: number;
  }[];
  transitionIn?: {
    durationFrames: number;
    kind: string;
    segment: [number, number];
  };
  transitionOut?: {
    durationFrames: number;
    kind: string;
    segment: [number, number];
  };
};

export type Phase5ExportArtifact = {
  format: "json" | "web";
  path: string;
  role: string;
};

export type Phase5LocalWebExportManifest = {
  artifacts: Phase5ExportArtifact[];
  command: string;
  deckId: CadenzaExportDeckId;
  deterministic: {
    fps: number;
    navigationPolicy: string;
    slideOrder: string[];
    stepOrdering: {
      slideId: string;
      steps: {
        kind: string;
        segment: [number, number];
        stepIndex: number;
      }[];
    }[];
    timelineIdentity: {
      totalFrames: number;
      transitionCount: number;
    };
  };
  generatedAt: string;
  localOnly: true;
  outputDirectory: string;
  requiresHostedInfrastructure: false;
  runId: string;
  sourceDeck: string;
  stableHash: string;
  webBundle: {
    entrypoint: "index.html";
    semanticAnchors: string[];
  };
};

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const DECK_REGISTRY = {
  "phase5-alpha-readiness-talk": {
    deckId: "phase5-alpha-readiness-talk",
    fixtureExport: "createPhase5AlphaReadinessTalkFixture",
    metadataExport: "phase5AlphaReadinessTalkMetadata",
    sourcePath: "examples/phase5/alpha-readiness-talk.tsx",
  },
} satisfies Record<CadenzaExportDeckId, DeckDescriptor>;

export async function runCadenzaCli(args: string[]): Promise<void> {
  const parsed = parseArgs(args);
  await exportLocalWebBundle(parsed);
}

async function exportLocalWebBundle(args: ExportArgs): Promise<void> {
  const descriptor = DECK_REGISTRY[args.deckId];
  const outputDirectory = path.join(
    rootDir,
    "dist/phase5",
    descriptor.deckId,
    args.runId,
  );
  const relativeOutputDirectory = toRepoPath(
    path.relative(rootDir, outputDirectory),
  );
  const { fixture, metadata } = await loadDeck(descriptor, args.runId);
  const timeline = fixture.offlineTimeline;
  const deterministic = createDeterministicFields(timeline);
  const artifacts: Phase5ExportArtifact[] = [
    {
      format: "web",
      path: "index.html",
      role: "web-bundle-entrypoint",
    },
    {
      format: "json",
      path: "deck.json",
      role: "deck-metadata",
    },
    {
      format: "json",
      path: "timeline.json",
      role: "offline-timeline",
    },
    {
      format: "json",
      path: "manifest.json",
      role: "export-manifest",
    },
  ];
  const stableHash = createStableHash({
    artifacts,
    deterministic,
    sourceDeck: metadata.sourcePath,
  });
  const manifest: Phase5LocalWebExportManifest = {
    artifacts,
    command: metadata.exportCommand,
    deckId: metadata.deckId,
    deterministic,
    generatedAt: new Date().toISOString(),
    localOnly: true,
    outputDirectory: relativeOutputDirectory,
    requiresHostedInfrastructure: false,
    runId: args.runId,
    sourceDeck: metadata.sourcePath,
    stableHash,
    webBundle: {
      entrypoint: "index.html",
      semanticAnchors: metadata.outline.map((entry) => entry.slideId),
    },
  };

  await mkdir(outputDirectory, { recursive: true });
  await writeJson(path.join(outputDirectory, "deck.json"), {
    deckId: metadata.deckId,
    outline: metadata.outline,
    sourceDeck: metadata.sourcePath,
    title: metadata.title,
  });
  await writeJson(path.join(outputDirectory, "timeline.json"), timeline);
  await writeFile(
    path.join(outputDirectory, "index.html"),
    renderWebBundleHtml(metadata, manifest, timeline),
  );
  await writeJson(path.join(outputDirectory, "manifest.json"), manifest);

  process.stdout.write(
    `${JSON.stringify(
      {
        manifest: `${relativeOutputDirectory}/manifest.json`,
        outputDirectory: relativeOutputDirectory,
      },
      null,
      2,
    )}\n`,
  );
}

function parseArgs(args: string[]): ExportArgs {
  const [command, deckArg, ...rest] = args;

  if (command !== "export" || deckArg === undefined) {
    throw new Error("Usage: cadenza export <deck> [--run-id <run-id>]");
  }

  if (!isSupportedDeckId(deckArg)) {
    throw new Error(
      `Unsupported deck "${deckArg}". Supported decks: ${Object.keys(
        DECK_REGISTRY,
      ).join(", ")}`,
    );
  }

  let runId = defaultRunId();
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (token !== "--run-id") {
      throw new Error(`Unsupported cadenza export option "${token}"`);
    }

    const value = rest[index + 1];
    if (value === undefined || value.startsWith("-")) {
      throw new Error("--run-id requires a value");
    }

    runId = sanitizeRunId(value);
    index += 1;
  }

  return {
    deckId: deckArg,
    runId,
  };
}

async function loadDeck(
  descriptor: DeckDescriptor,
  runId: string,
): Promise<{ fixture: DeckFixture; metadata: DeckMetadata }> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "cadenza-export-"));
  const bundlePath = path.join(tempDir, `${descriptor.deckId}.mjs`);

  try {
    await build({
      absWorkingDir: rootDir,
      alias: {
        "@cadenza-dev/core": path.join(rootDir, "packages/core/src/index.ts"),
        "@cadenza-dev/core/jsx-dev-runtime": path.join(
          rootDir,
          "packages/core/src/jsx-dev-runtime.ts",
        ),
        "@cadenza-dev/core/jsx-runtime": path.join(
          rootDir,
          "packages/core/src/jsx-runtime.ts",
        ),
      },
      bundle: true,
      entryPoints: [path.join(rootDir, descriptor.sourcePath)],
      format: "esm",
      jsx: "automatic",
      jsxImportSource: "@cadenza-dev/core",
      logLevel: "silent",
      outfile: bundlePath,
      platform: "node",
      target: "node22",
    });

    const bundled = (await import(
      `${pathToFileURL(bundlePath).href}?runId=${encodeURIComponent(runId)}`
    )) as Record<string, unknown>;
    const fixtureFactory = bundled[descriptor.fixtureExport];
    const metadata = bundled[descriptor.metadataExport];

    if (typeof fixtureFactory !== "function") {
      throw new Error(
        `Deck module ${descriptor.sourcePath} does not export ${descriptor.fixtureExport}.`,
      );
    }

    if (!isDeckMetadata(metadata)) {
      throw new Error(
        `Deck module ${descriptor.sourcePath} does not export valid ${descriptor.metadataExport}.`,
      );
    }

    return {
      fixture: fixtureFactory() as DeckFixture,
      metadata,
    };
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

function createDeterministicFields(
  timeline: TimelineMap,
): Phase5LocalWebExportManifest["deterministic"] {
  const transitionCount = timeline.slides.reduce((count, slide) => {
    return (
      count +
      (slide.transitionIn === undefined ? 0 : 1) +
      (slide.transitionOut === undefined ? 0 : 1)
    );
  }, 0);

  return {
    fps: timeline.fps,
    navigationPolicy: timeline.navigationPolicy,
    slideOrder: timeline.slides.map((slide) => slide.slideId),
    stepOrdering: timeline.slides.map((slide) => ({
      slideId: slide.slideId,
      steps: slide.steps.map((step) => ({
        kind: step.kind,
        segment: step.segment,
        stepIndex: step.stepIndex,
      })),
    })),
    timelineIdentity: {
      totalFrames: timeline.totalFrames,
      transitionCount,
    },
  };
}

function renderWebBundleHtml(
  metadata: DeckMetadata,
  manifest: Phase5LocalWebExportManifest,
  timeline: TimelineMap,
): string {
  const slideSections = metadata.outline
    .map((entry) => {
      const slide = timeline.slides.find(
        (candidate) => candidate.slideId === entry.slideId,
      );

      return `<section class="slide" data-cadenza-slide-id="${escapeHtml(
        entry.slideId,
      )}" data-cadenza-step-count="${slide?.steps.length ?? 0}">
  <h2>${escapeHtml(entry.title)}</h2>
  <p>${escapeHtml(entry.summary)}</p>
</section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(metadata.title)}</title>
  <style>
    body { margin: 0; font-family: Inter, Arial, sans-serif; background: #101820; color: #f8fafc; }
    main { min-height: 100vh; padding: 48px; display: grid; gap: 24px; }
    .slide { border: 1px solid #334155; border-radius: 8px; padding: 24px; background: #0b1220; }
    .slide h2 { margin: 0 0 12px; font-size: 28px; }
    .slide p { margin: 0; color: #cbd5e1; line-height: 1.5; }
  </style>
</head>
<body data-cadenza-export-deck="${escapeHtml(metadata.deckId)}">
  <main>
    <h1>${escapeHtml(metadata.title)}</h1>
${slideSections}
  </main>
  <script type="application/json" id="cadenza-export-manifest">${escapeScriptJson(
    JSON.stringify(manifest),
  )}</script>
</body>
</html>
`;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function isSupportedDeckId(value: string): value is CadenzaExportDeckId {
  return value in DECK_REGISTRY;
}

function isDeckMetadata(value: unknown): value is DeckMetadata {
  return (
    typeof value === "object" &&
    value !== null &&
    "deckId" in value &&
    "exportCommand" in value &&
    "outline" in value &&
    "sourcePath" in value &&
    "title" in value
  );
}

function sanitizeRunId(value: string): string {
  const sanitized = value.trim();

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(sanitized)) {
    throw new Error(
      "--run-id must start with an alphanumeric character and contain only letters, numbers, dots, underscores, or dashes.",
    );
  }

  return sanitized;
}

function defaultRunId(): string {
  return new Date().toISOString().replaceAll(/[:.]/g, "-");
}

function toRepoPath(value: string): string {
  return value.split(path.sep).join("/");
}

function createStableHash(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
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

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runCadenzaCli(process.argv.slice(2)).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
