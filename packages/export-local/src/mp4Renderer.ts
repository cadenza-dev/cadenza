import { access, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import {
  getVideoMetadata,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import type { TimelineMap } from "../../core/src/index.ts";
import type { CadenzaDeckMetadata } from "./deckLoader.ts";
import {
  CadenzaLocalExportError,
  LOCAL_EXPORT_EXIT_CODES,
  type LocalExportDiagnostic,
} from "./diagnostics.ts";

export type LocalMp4RendererInput = {
  cancelSignal?: (callback: () => void) => void;
  metadata: CadenzaDeckMetadata;
  outputDirectory: string;
  rendererTempRoot: string;
  runId: string;
  timeline: TimelineMap;
  workspaceRoot: string;
};

export type LocalMp4Prerequisite = {
  detail?: string;
  name:
    | "browser"
    | "ffmpeg"
    | "output-directory"
    | "remotion-bundler"
    | "remotion-renderer";
  status: "available" | "missing" | "unsupported";
};

export type LocalMp4RendererProvenance = {
  adapterName: "local-mp4-renderer";
  implementationFamily: "remotion-renderer-api";
  packageName: "@cadenza-dev/export-local";
  publicContract: "LocalMp4RendererAdapter";
};

export type LocalMp4RendererStage =
  | "bundle"
  | "cleanup"
  | "cancellation"
  | "codec-media-tool"
  | "composition"
  | "container-metadata"
  | "output-write"
  | "prerequisite-detection"
  | "renderer-invocation"
  | "unexpected-internal";

export type LocalMp4RendererResult = {
  cleanup: {
    status: "completed" | "failed";
    tempDirectories: string[];
  };
  composition: {
    durationInFrames: number;
    fps: number;
    height: number;
    id: string;
    width: number;
  };
  containerMetadata: {
    codec: string;
    durationInSeconds: number | null;
    fps: number;
    height: number;
    width: number;
  };
  diagnostics: LocalExportDiagnostic[];
  knownLimitations: string[];
  localPrerequisites: LocalMp4Prerequisite[];
  outputPath: string;
  relativePath: string;
  rendererProvenance: LocalMp4RendererProvenance;
};

export type LocalMp4RendererFailureEvidence = Pick<
  LocalMp4RendererResult,
  | "cleanup"
  | "diagnostics"
  | "knownLimitations"
  | "localPrerequisites"
  | "rendererProvenance"
>;

export class LocalMp4RendererError extends CadenzaLocalExportError {
  readonly failureEvidence: LocalMp4RendererFailureEvidence;

  constructor(
    exitCode: number,
    diagnostics: LocalExportDiagnostic[],
    failureEvidence: LocalMp4RendererFailureEvidence,
  ) {
    super(exitCode, diagnostics);
    this.name = "LocalMp4RendererError";
    this.failureEvidence = failureEvidence;
  }
}

class RendererStageError extends Error {
  readonly diagnostic: LocalExportDiagnostic;
  readonly exitCode: number;

  constructor(exitCode: number, diagnostic: LocalExportDiagnostic) {
    super(diagnostic.message);
    this.name = "RendererStageError";
    this.diagnostic = diagnostic;
    this.exitCode = exitCode;
  }
}

const COMPOSITION_ID = "CadenzaLocalExportMp4";
const COMPOSITION_WIDTH = 640;
const COMPOSITION_HEIGHT = 360;
const RENDER_EVERY_NTH_FRAME = 6;

export async function renderLocalMp4(
  input: LocalMp4RendererInput,
): Promise<LocalMp4RendererResult> {
  const relativePath = `${input.metadata.deckId}.mp4`;
  const outputPath = path.join(input.outputDirectory, relativePath);
  const tempDirectory = path.join(
    input.workspaceRoot,
    input.rendererTempRoot,
    input.metadata.deckId,
    input.runId,
  );
  const tempDirectories = [
    toPortablePath(path.relative(input.workspaceRoot, tempDirectory)),
  ];
  const bundleDirectory = path.join(tempDirectory, "bundle");
  const entryPoint = path.join(tempDirectory, "remotion-entry.tsx");
  const rendererProvenance: LocalMp4RendererProvenance = {
    adapterName: "local-mp4-renderer",
    implementationFamily: "remotion-renderer-api",
    packageName: "@cadenza-dev/export-local",
    publicContract: "LocalMp4RendererAdapter",
  };

  await rm(tempDirectory, { force: true, recursive: true });
  await mkdir(tempDirectory, { recursive: true });

  const browser = await resolveBrowserExecutable(input.workspaceRoot);
  const localPrerequisites = createLocalPrerequisites(browser.prerequisite);

  if (browser.prerequisite.status === "missing") {
    const diagnostic = missingBrowserDiagnostic(browser.prerequisite);
    const cleanup = await cleanupTempDirectory(tempDirectory, tempDirectories);

    throw new LocalMp4RendererError(
      LOCAL_EXPORT_EXIT_CODES.environment,
      [diagnostic],
      {
        cleanup,
        diagnostics: [diagnostic],
        knownLimitations: createKnownLimitations(),
        localPrerequisites,
        rendererProvenance,
      },
    );
  }

  try {
    await runRendererStage({
      action: () => writeFile(entryPoint, createRemotionEntry(input)),
      code: "VIDO_BUNDLE_FAILED",
      locator: entryPoint,
      repairHint:
        "Check that the generated Remotion entrypoint can be written and bundled from the current workspace.",
      stage: "bundle",
    });
    const serveUrl = await runRendererStage({
      action: () =>
        bundle({
          entryPoint,
          enableCaching: false,
          onProgress: () => {},
          outDir: bundleDirectory,
          rootDir: input.workspaceRoot,
        }),
      code: "VIDO_BUNDLE_FAILED",
      locator: entryPoint,
      repairHint:
        "Check local Remotion bundler dependencies and rerun the export from the workspace root.",
      stage: "bundle",
    });
    const composition = await runRendererStage({
      action: () =>
        selectComposition({
          browserExecutable: browser.executable,
          chromeMode: "headless-shell",
          chromiumOptions: {
            enableMultiProcessOnLinux: false,
            gl: "swangle",
          },
          id: COMPOSITION_ID,
          logLevel: "error",
          serveUrl,
        }),
      code: "VIDO_COMPOSITION_FAILED",
      locator: COMPOSITION_ID,
      repairHint:
        "Check the generated Remotion composition and local browser prerequisites.",
      stage: "composition",
    });

    try {
      await renderMedia({
        browserExecutable: browser.executable,
        chromeMode: "headless-shell",
        chromiumOptions: {
          enableMultiProcessOnLinux: false,
          gl: "swangle",
        },
        cancelSignal: input.cancelSignal,
        codec: "h264",
        composition,
        concurrency: 1,
        crf: 28,
        everyNthFrame: RENDER_EVERY_NTH_FRAME,
        imageFormat: "jpeg",
        jpegQuality: 70,
        logLevel: "error",
        muted: true,
        outputLocation: outputPath,
        overwrite: true,
        serveUrl,
        x264Preset: "ultrafast",
      });
    } catch (error) {
      throw createRenderMediaStageError(error, outputPath);
    }

    await runRendererStage({
      action: () => verifyOutputArtifact(outputPath),
      code: "VIDO_OUTPUT_WRITE_FAILED",
      locator: outputPath,
      repairHint:
        "Check output directory permissions and local renderer write access before rerunning MP4 export.",
      stage: "output-write",
    });

    const metadata = await runRendererStage({
      action: () => getVideoMetadata(outputPath, { logLevel: "error" }),
      code: "VIDO_CONTAINER_METADATA_FAILED",
      locator: outputPath,
      repairHint:
        "Check that the rendered MP4 exists and can be read by the local media metadata tool.",
      stage: "container-metadata",
    });
    const cleanup = await cleanupTempDirectory(tempDirectory, tempDirectories);
    const cleanupDiagnostics = createCleanupDiagnostics(cleanup);

    return {
      cleanup,
      composition: {
        durationInFrames: composition.durationInFrames,
        fps: composition.fps,
        height: composition.height,
        id: composition.id,
        width: composition.width,
      },
      containerMetadata: {
        codec: metadata.codec,
        durationInSeconds: metadata.durationInSeconds,
        fps: metadata.fps,
        height: metadata.height,
        width: metadata.width,
      },
      diagnostics: cleanupDiagnostics,
      knownLimitations: createKnownLimitations(),
      localPrerequisites,
      outputPath,
      relativePath,
      rendererProvenance,
    };
  } catch (error) {
    if (error instanceof LocalMp4RendererError) {
      throw error;
    }

    const stageError =
      error instanceof RendererStageError
        ? error
        : createUnexpectedRendererStageError(error, outputPath);
    const cleanup = await cleanupTempDirectory(tempDirectory, tempDirectories);
    const diagnostics = [
      stageError.diagnostic,
      ...createCleanupDiagnostics(cleanup),
    ];

    throw new LocalMp4RendererError(stageError.exitCode, diagnostics, {
      cleanup,
      diagnostics,
      knownLimitations: createKnownLimitations(),
      localPrerequisites,
      rendererProvenance,
    });
  }
}

async function runRendererStage<T>({
  action,
  code,
  locator,
  repairHint,
  stage,
}: {
  action: () => Promise<T>;
  code: string;
  locator: string;
  repairHint: string;
  stage: LocalMp4RendererStage;
}): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new RendererStageError(
      LOCAL_EXPORT_EXIT_CODES.export,
      rendererStageDiagnostic({
        code,
        error,
        locator,
        repairHint,
        stage,
      }),
    );
  }
}

function createLocalPrerequisites(
  browserPrerequisite: LocalMp4Prerequisite,
): LocalMp4Prerequisite[] {
  return [
    browserPrerequisite,
    {
      name: "remotion-renderer",
      status: "available",
    },
    {
      name: "remotion-bundler",
      status: "available",
    },
    {
      name: "ffmpeg",
      status: "available",
    },
    {
      name: "output-directory",
      status: "available",
    },
  ];
}

async function resolveBrowserExecutable(workspaceRoot: string): Promise<{
  executable: string | null;
  prerequisite: LocalMp4Prerequisite;
}> {
  if (process.env.CADENZA_REMOTION_BROWSER_EXECUTABLE !== undefined) {
    const executable = process.env.CADENZA_REMOTION_BROWSER_EXECUTABLE;

    return {
      executable,
      prerequisite: {
        detail: executable,
        name: "browser",
        status: (await exists(executable)) ? "available" : "missing",
      },
    };
  }

  const candidates = [
    path.join(
      workspaceRoot,
      "node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell",
    ),
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/opt/google/chrome/chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ...(await playwrightBrowserCandidates()),
  ];

  for (const candidate of candidates) {
    if (await exists(candidate)) {
      return {
        executable: candidate,
        prerequisite: {
          detail: candidate,
          name: "browser",
          status: "available",
        },
      };
    }
  }

  return {
    executable: null,
    prerequisite: {
      detail: "Remotion-managed browser resolution",
      name: "browser",
      status: "available",
    },
  };
}

async function playwrightBrowserCandidates(): Promise<string[]> {
  const cacheRoot = path.join(
    process.env.HOME ?? process.env.USERPROFILE ?? "",
    ".cache/ms-playwright",
  );
  if (cacheRoot === ".cache/ms-playwright" || !(await exists(cacheRoot))) {
    return [];
  }

  const entries = await readdir(cacheRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => [
      path.join(
        cacheRoot,
        entry.name,
        "chrome-headless-shell-linux64/chrome-headless-shell",
      ),
      path.join(cacheRoot, entry.name, "chrome-linux64/chrome"),
    ]);
}

async function exists(candidatePath: string): Promise<boolean> {
  try {
    await access(candidatePath);
    return true;
  } catch {
    return false;
  }
}

async function cleanupTempDirectory(
  tempDirectory: string,
  tempDirectories: string[],
): Promise<LocalMp4RendererResult["cleanup"]> {
  try {
    await rm(tempDirectory, { force: true, recursive: true });

    return {
      status: "completed",
      tempDirectories,
    };
  } catch {
    return {
      status: "failed",
      tempDirectories,
    };
  }
}

function createKnownLimitations(): string[] {
  return [
    "MP4 rendering is local-only and depends on local browser and media-tool prerequisites.",
    "Renderer implementation family is recorded as provenance and is not a public control-flow contract.",
  ];
}

function missingBrowserDiagnostic(
  browserPrerequisite: LocalMp4Prerequisite,
): LocalExportDiagnostic {
  return {
    category: "environment",
    code: "VIDO_BROWSER_UNAVAILABLE",
    locator: browserPrerequisite.detail,
    message:
      "The configured local browser executable for MP4 rendering is not available.",
    rendererStage: "prerequisite-detection",
    relatedRequirements: ["VIDO-004", "VIDO-007", "VIDO-008", "CDIA-009"],
    repairHint:
      "Install a local Chromium/Chrome executable or point CADENZA_REMOTION_BROWSER_EXECUTABLE at an existing browser path.",
    severity: "error",
  };
}

function createCleanupDiagnostics({
  status,
  tempDirectories,
}: LocalMp4RendererResult["cleanup"]): LocalExportDiagnostic[] {
  if (status !== "failed") {
    return [];
  }

  return [
    {
      category: "renderer",
      code: "VIDO_CLEANUP_FAILED",
      locator: tempDirectories.join(", "),
      message:
        "The local MP4 renderer could not clean up temporary render state.",
      rendererStage: "cleanup",
      relatedRequirements: ["VIDO-004", "VIDO-008", "CDIA-007", "CDIA-009"],
      repairHint:
        "Inspect and remove the listed renderer temporary directories before rerunning the export.",
      severity: "error",
    },
  ];
}

function createUnexpectedRendererStageError(
  error: unknown,
  outputPath: string,
): RendererStageError {
  return new RendererStageError(
    LOCAL_EXPORT_EXIT_CODES.export,
    rendererStageDiagnostic({
      code: "VIDO_UNEXPECTED_RENDERER_FAILURE",
      error,
      locator: outputPath,
      repairHint:
        "Check local browser, codec, and media-tool prerequisites, then rerun the export with the same selector and output root.",
      stage: "unexpected-internal",
    }),
  );
}

function createRenderMediaStageError(
  error: unknown,
  outputPath: string,
): RendererStageError {
  if (isCancellationError(error)) {
    return new RendererStageError(
      LOCAL_EXPORT_EXIT_CODES.export,
      rendererStageDiagnostic({
        code: "VIDO_RENDER_CANCELLED",
        error,
        locator: outputPath,
        repairHint:
          "Rerun the export if cancellation was accidental; cleanup evidence records renderer temporary directory handling.",
        stage: "cancellation",
      }),
    );
  }

  if (isOutputWriteError(error)) {
    return new RendererStageError(
      LOCAL_EXPORT_EXIT_CODES.export,
      rendererStageDiagnostic({
        code: "VIDO_OUTPUT_WRITE_FAILED",
        error,
        locator: outputPath,
        repairHint:
          "Check output directory permissions and local renderer write access before rerunning MP4 export.",
        stage: "output-write",
      }),
    );
  }

  if (isCodecOrMediaToolError(error)) {
    return new RendererStageError(
      LOCAL_EXPORT_EXIT_CODES.export,
      rendererStageDiagnostic({
        code: "VIDO_CODEC_MEDIA_TOOL_FAILED",
        error,
        locator: outputPath,
        repairHint:
          "Check local ffmpeg, codec, and media-tool prerequisites before rerunning MP4 export.",
        stage: "codec-media-tool",
      }),
    );
  }

  return new RendererStageError(
    LOCAL_EXPORT_EXIT_CODES.export,
    rendererStageDiagnostic({
      code: "VIDO_RENDER_INVOCATION_FAILED",
      error,
      locator: outputPath,
      repairHint:
        "Check local renderer and browser prerequisites before rerunning MP4 export.",
      stage: "renderer-invocation",
    }),
  );
}

function isCancellationError(error: unknown): boolean {
  return /abort|cancelled|canceled/i.test(errorMessage(error));
}

function isOutputWriteError(error: unknown): boolean {
  return /\b(EACCES|ENOENT|EPERM|outputLocation|output path|permission denied|write)\b/i.test(
    errorMessage(error),
  );
}

function isCodecOrMediaToolError(error: unknown): boolean {
  return /\b(codec|encode|encoding|ffmpeg|ffprobe|h264|media tool|mux|x264)\b/i.test(
    errorMessage(error),
  );
}

async function verifyOutputArtifact(outputPath: string): Promise<void> {
  const output = await stat(outputPath);

  if (!output.isFile() || output.size <= 0) {
    throw new Error(`No non-empty MP4 output was written at ${outputPath}.`);
  }
}

function rendererStageDiagnostic({
  code,
  error,
  locator,
  repairHint,
  stage,
}: {
  code: string;
  error: unknown;
  locator: string;
  repairHint: string;
  stage: LocalMp4RendererStage;
}): LocalExportDiagnostic {
  return {
    category: "renderer",
    code,
    locator,
    message: `The local MP4 renderer failed during ${stage}: ${errorMessage(error)}`,
    rendererStage: stage,
    relatedRequirements: ["VIDO-004", "VIDO-007", "VIDO-008", "CDIA-009"],
    repairHint,
    severity: "error",
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown renderer error.";
}

function createRemotionEntry(input: LocalMp4RendererInput): string {
  const slides = input.timeline.slides.map((slide, order) => {
    const outline = input.metadata.outline.find(
      (entry) => entry.slideId === slide.slideId,
    );

    return {
      order,
      segment: slide.segment,
      slideId: slide.slideId,
      summary: outline?.summary ?? "",
      title: outline?.title ?? slide.slideId,
    };
  });

  return `/** @jsxImportSource react */
import React from "react";
import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from "remotion";

const DATA = ${JSON.stringify({
    deckId: input.metadata.deckId,
    fps: input.timeline.fps,
    height: COMPOSITION_HEIGHT,
    slides,
    title: input.metadata.title,
    totalFrames: Math.max(input.timeline.totalFrames, input.timeline.fps),
    width: COMPOSITION_WIDTH,
  })};

function CadenzaLocalExportMp4() {
  // why: the renderer adapter must bind Remotion's current frame to Cadenza's
  // deterministic offline timeline while keeping the public adapter strategy private.
  const frame = useCurrentFrame();
  const slide = DATA.slides.find((item) => frame >= item.segment[0] && frame < item.segment[1]) ?? DATA.slides.at(-1);
  const progress = DATA.totalFrames <= 1 ? 0 : frame / (DATA.totalFrames - 1);

  return (
    <AbsoluteFill
      data-cadenza-mp4-render=""
      data-cadenza-deck-id={DATA.deckId}
      data-cadenza-slide-id={slide?.slideId ?? ""}
      style={{
        background: "linear-gradient(135deg, #101820 0%, #12343b 55%, #1f2937 100%)",
        color: "#f8fafc",
        fontFamily: "Inter, Arial, sans-serif",
        justifyContent: "center",
        padding: 64,
      }}
    >
      <div style={{ maxWidth: 780 }}>
        <p style={{ color: "#38bdf8", fontSize: 24, marginBottom: 18 }}>
          Cadenza local MP4 export
        </p>
        <h1 style={{ fontSize: 48, lineHeight: 1.08, margin: 0 }}>
          {slide?.title ?? DATA.title}
        </h1>
        <p style={{ color: "#d1d5db", fontSize: 28, lineHeight: 1.32, marginTop: 28 }}>
          {slide?.summary ?? DATA.title}
        </p>
        <div style={{ background: "#38bdf8", height: 8, marginTop: 48, width: \`\${Math.max(8, progress * 100)}%\` }} />
      </div>
    </AbsoluteFill>
  );
}

function RemotionRoot() {
  return (
    <Composition
      component={CadenzaLocalExportMp4}
      durationInFrames={DATA.totalFrames}
      fps={DATA.fps}
      height={DATA.height}
      id="${COMPOSITION_ID}"
      width={DATA.width}
    />
  );
}

registerRoot(RemotionRoot);
`;
}

function toPortablePath(value: string): string {
  return value.split(path.sep).join("/");
}
