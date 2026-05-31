import { access, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { TimelineMap } from "../../core/src/index.ts";
import {
  type CadenzaExportFormat,
  type CadenzaProjectConfig,
  ensureGeneratedOutputSafety,
  LOCAL_EXPORT_ARTIFACT_FILENAMES,
  resolveLocalExportRuntimeConfig,
} from "./config.ts";
import {
  type LoadedDeckModule,
  loadDeckModule,
  loadLocalExportProjectConfig,
} from "./deckLoader.ts";
import {
  LOCAL_EXPORT_EXIT_CODES,
  type LocalExportDiagnostic,
  localExportError,
} from "./diagnostics.ts";
import {
  LocalMp4RendererError,
  type LocalMp4RendererResult,
  renderLocalMp4,
} from "./mp4Renderer.ts";
import { createSha256, createStableHash } from "./stableJson.ts";
import {
  renderStaticWebCompatibility,
  type StaticWebCompatibilityAdapterResult,
} from "./staticWebCompatibility.ts";

export const LOCAL_EXPORT_SCHEMA_VERSION = 1;

export type LocalExportCapabilityStatus =
  | "limited"
  | "supported"
  | "unsupported"
  | "waived";

export type LocalExportFormatCapability = {
  description: string;
  futureReusableConcepts: string[];
  status: LocalExportCapabilityStatus;
};

export type LocalExportArtifactRecord = {
  byteSize?: number;
  format?: CadenzaExportFormat;
  path: string;
  role: string;
  sha256?: string;
};

export type LocalExportFormatEvidence = {
  adapterProvenance?: StaticWebCompatibilityAdapterResult["adapterProvenance"];
  artifacts: LocalExportArtifactRecord[];
  browserSmoke?: StaticWebCompatibilityAdapterResult["browserSmoke"];
  capability: LocalExportFormatCapability;
  cleanup?: LocalMp4RendererResult["cleanup"];
  compatibilityMode?: StaticWebCompatibilityAdapterResult["compatibilityMode"];
  composition?: LocalMp4RendererResult["composition"];
  containerMetadata?: LocalMp4RendererResult["containerMetadata"];
  diagnostics: LocalExportDiagnostic[];
  entrypointPath?: StaticWebCompatibilityAdapterResult["entrypointPath"];
  format: CadenzaExportFormat;
  knownLimitations: string[];
  localPrerequisites?: LocalMp4RendererResult["localPrerequisites"];
  manifestReference?: StaticWebCompatibilityAdapterResult["manifestReference"];
  notesBoundary?: StaticWebCompatibilityAdapterResult["notesBoundary"];
  rendererProvenance?: LocalMp4RendererResult["rendererProvenance"];
  schemaVersion: number;
  semanticAnchors?: StaticWebCompatibilityAdapterResult["semanticAnchors"];
  status: LocalExportCapabilityStatus;
  timingEvidence?: StaticWebCompatibilityAdapterResult["timingEvidence"];
};

export type LocalExportManifest = {
  artifacts: LocalExportArtifactRecord[];
  capabilities: Partial<
    Record<CadenzaExportFormat, LocalExportFormatCapability>
  >;
  command: "export";
  deck: {
    id: string;
    sourcePath: string;
    title: string;
  };
  deterministic: {
    capabilities: Partial<
      Record<CadenzaExportFormat, LocalExportFormatCapability>
    >;
    configDefaults: {
      defaultFormats: CadenzaExportFormat[];
      evidenceFilenames: {
        manifest: string;
        mp4: string;
        web: string;
      };
    };
    formatSelection: CadenzaExportFormat[];
    timeline: ReturnType<typeof createDeterministicTimeline>;
    timelineDigest: string;
  };
  diagnostics: LocalExportDiagnostic[];
  evidence: Partial<Record<CadenzaExportFormat, string>>;
  formats: CadenzaExportFormat[];
  knownLimitations: string[];
  outputDirectory: string;
  outputRoot: string;
  runId: string;
  schemaVersion: number;
  selector: {
    alias?: string;
    requested: string;
    resolvedPath: string;
    source: string;
  };
  stableHash: string;
  volatile: {
    generatedAt: string;
    outputDirectory: string;
    selectorProvenance: {
      absolutePath: string;
    };
  };
};

export type ExportLocalOptions = {
  cwd: string;
  force?: boolean;
  formats?: CadenzaExportFormat[];
  outputRoot?: string;
  runId?: string;
  selector?: string;
  workspaceRoot?: string;
};

export type ExportLocalResult = {
  evidencePaths: Partial<Record<CadenzaExportFormat, string>>;
  manifest: LocalExportManifest;
  manifestPath: string;
  outputDirectory: string;
};

export type ValidateDeckLocalOptions = {
  cwd: string;
  selector?: string;
  workspaceRoot?: string;
};

export type ValidateDeckLocalResult = {
  deck: LocalExportManifest["deck"];
  diagnostics: LocalExportDiagnostic[];
  schemaVersion: number;
  selector: LocalExportManifest["selector"];
  timeline: LocalExportManifest["deterministic"]["timeline"] & {
    digest: string;
  };
};

export type InspectExportArtifactOptions = {
  inputPath: string;
};

export type InspectExportArtifactResult = {
  artifacts: LocalExportArtifactRecord[];
  capabilities: Partial<
    Record<CadenzaExportFormat, LocalExportFormatCapability>
  >;
  deck: LocalExportManifest["deck"];
  diagnostics: LocalExportDiagnostic[];
  evidence: Partial<Record<CadenzaExportFormat, LocalExportFormatEvidence>>;
  formats: CadenzaExportFormat[];
  knownLimitations: string[];
  manifest: LocalExportManifest;
  manifestPath: string;
  outputDirectory: string;
  schemaVersion: number;
  selector: LocalExportManifest["selector"];
};

export async function exportDeckLocal(
  options: ExportLocalOptions,
): Promise<ExportLocalResult> {
  const cwd = options.cwd;
  const workspaceRoot = options.workspaceRoot ?? cwd;
  const projectConfig = await loadLocalExportProjectConfig({
    cwd,
    workspaceRoot,
  });
  const runtime = resolveLocalExportRuntimeConfig({
    cli: {
      defaultFormats: options.formats,
      force: options.force,
      outputRoot: options.outputRoot,
    },
    config: projectConfig,
  });
  const formats = normalizeFormats(runtime.defaultFormats);
  const loaded = await loadDeckModule({
    cwd,
    selector: options.selector,
    workspaceRoot,
  });
  const runId = sanitizeRunId(options.runId ?? defaultRunId());
  const outputRoot = path.resolve(cwd, runtime.outputRoot);
  const outputDirectory = path.join(outputRoot, loaded.metadata.deckId, runId);
  const safety = await ensureGeneratedOutputSafety({
    force: runtime.generatedOutputSafety.force,
    outputDirectory,
  });

  if (safety.status !== "fresh") {
    await rm(outputDirectory, { force: true, recursive: true });
  }

  await mkdir(outputDirectory, { recursive: true });
  await writeJson(path.join(outputDirectory, ".cadenza-generated.json"), {
    deckId: loaded.metadata.deckId,
    generator: "@cadenza-dev/export-local",
    runId,
    schemaVersion: LOCAL_EXPORT_SCHEMA_VERSION,
  });

  const capabilities = createCapabilities(formats);
  const deterministicTimeline = createDeterministicTimeline(loaded.timeline);
  const timelineDigest = createStableHash(deterministicTimeline);
  const evidencePaths: Partial<Record<CadenzaExportFormat, string>> = {};
  const evidenceReferences: Partial<Record<CadenzaExportFormat, string>> = {};
  const renderedArtifacts: LocalExportArtifactRecord[] = [];

  if (formats.includes("web")) {
    const webCompatibility = await renderStaticWebCompatibility({
      manifestReferencePath: LOCAL_EXPORT_ARTIFACT_FILENAMES.manifest,
      metadata: loaded.metadata,
      outputDirectory,
      runId,
      timeline: loaded.timeline,
    });
    const webArtifact = await artifactRecord({
      format: "web",
      outputDirectory,
      relativePath: webCompatibility.entrypointPath,
      role: "entrypoint",
    });
    const webEvidence: LocalExportFormatEvidence = {
      adapterProvenance: webCompatibility.adapterProvenance,
      artifacts: [webArtifact],
      browserSmoke: webCompatibility.browserSmoke,
      capability: capabilities.web ?? webCapability(),
      compatibilityMode: webCompatibility.compatibilityMode,
      diagnostics: [],
      entrypointPath: webCompatibility.entrypointPath,
      format: "web",
      knownLimitations: webCompatibility.knownLimitations,
      manifestReference: webCompatibility.manifestReference,
      notesBoundary: webCompatibility.notesBoundary,
      schemaVersion: LOCAL_EXPORT_SCHEMA_VERSION,
      semanticAnchors: webCompatibility.semanticAnchors,
      status: "supported",
      timingEvidence: webCompatibility.timingEvidence,
    };
    const evidencePath = path.join(
      outputDirectory,
      LOCAL_EXPORT_ARTIFACT_FILENAMES.webEvidence,
    );
    await writeJson(evidencePath, webEvidence);
    evidencePaths.web = evidencePath;
    evidenceReferences.web = LOCAL_EXPORT_ARTIFACT_FILENAMES.webEvidence;
  }

  if (formats.includes("mp4")) {
    const evidencePath = path.join(
      outputDirectory,
      LOCAL_EXPORT_ARTIFACT_FILENAMES.mp4Evidence,
    );

    try {
      const mp4Render = await renderLocalMp4({
        metadata: loaded.metadata,
        outputDirectory,
        rendererTempRoot: runtime.rendererTempRoot,
        runId,
        timeline: loaded.timeline,
        workspaceRoot,
      });
      capabilities.mp4 = mp4CapabilityWithStatus("supported");
      const mp4Artifact = await artifactRecord({
        format: "mp4",
        outputDirectory,
        relativePath: mp4Render.relativePath,
        role: "mp4-render",
      });
      renderedArtifacts.push(mp4Artifact);
      const mp4Evidence: LocalExportFormatEvidence = {
        artifacts: [mp4Artifact],
        capability: capabilities.mp4,
        cleanup: mp4Render.cleanup,
        composition: mp4Render.composition,
        containerMetadata: mp4Render.containerMetadata,
        diagnostics: mp4Render.diagnostics,
        format: "mp4",
        knownLimitations: mp4Render.knownLimitations,
        localPrerequisites: mp4Render.localPrerequisites,
        rendererProvenance: mp4Render.rendererProvenance,
        schemaVersion: LOCAL_EXPORT_SCHEMA_VERSION,
        status: "supported",
      };
      await writeJson(evidencePath, mp4Evidence);
      evidencePaths.mp4 = evidencePath;
      evidenceReferences.mp4 = LOCAL_EXPORT_ARTIFACT_FILENAMES.mp4Evidence;
    } catch (error) {
      if (error instanceof LocalMp4RendererError) {
        capabilities.mp4 = mp4CapabilityWithStatus("unsupported");
        await writeJson(evidencePath, {
          artifacts: [],
          capability: capabilities.mp4,
          cleanup: error.failureEvidence.cleanup,
          diagnostics: error.failureEvidence.diagnostics,
          format: "mp4",
          knownLimitations: error.failureEvidence.knownLimitations,
          localPrerequisites: error.failureEvidence.localPrerequisites,
          rendererProvenance: error.failureEvidence.rendererProvenance,
          schemaVersion: LOCAL_EXPORT_SCHEMA_VERSION,
          status: "unsupported",
        } satisfies LocalExportFormatEvidence);
      }

      throw error;
    }
  }

  const artifactInventory = await collectArtifactInventory({
    evidenceReferences,
    formats,
    outputDirectory,
    renderedArtifacts,
  });
  const manifestWithoutHash = createManifestWithoutHash({
    capabilities,
    deterministicTimeline,
    evidenceReferences,
    formats,
    loaded,
    outputDirectory,
    outputRoot,
    projectConfig,
    runId,
    timelineDigest,
  });
  const stableHash = createStableHash({
    capabilities,
    configDefaults: manifestWithoutHash.deterministic.configDefaults,
    deck: manifestWithoutHash.deck,
    formatSelection: formats,
    schemaVersion: LOCAL_EXPORT_SCHEMA_VERSION,
    timelineDigest,
  });
  const manifest: LocalExportManifest = {
    ...manifestWithoutHash,
    artifacts: artifactInventory,
    stableHash,
  };
  const manifestPath = path.join(
    outputDirectory,
    LOCAL_EXPORT_ARTIFACT_FILENAMES.manifest,
  );
  await writeJson(manifestPath, manifest);

  return {
    evidencePaths,
    manifest,
    manifestPath,
    outputDirectory,
  };
}

export async function validateDeckLocal(
  options: ValidateDeckLocalOptions,
): Promise<ValidateDeckLocalResult> {
  const loaded = await loadDeckModule(options);
  const deterministicTimeline = createDeterministicTimeline(loaded.timeline);

  return {
    deck: {
      id: loaded.metadata.deckId,
      sourcePath: loaded.metadata.sourcePath,
      title: loaded.metadata.title,
    },
    diagnostics: [],
    schemaVersion: LOCAL_EXPORT_SCHEMA_VERSION,
    selector: {
      ...(loaded.selector.alias === undefined
        ? {}
        : { alias: loaded.selector.alias }),
      requested: loaded.selector.requested,
      resolvedPath: loaded.selector.resolvedPath,
      source: loaded.selector.source,
    },
    timeline: {
      ...deterministicTimeline,
      digest: createStableHash(deterministicTimeline),
    },
  };
}

export async function inspectExportArtifact({
  inputPath,
}: InspectExportArtifactOptions): Promise<InspectExportArtifactResult> {
  const manifestPath = await resolveManifestPath(inputPath);
  const manifest = await readLocalExportManifest(manifestPath);
  const outputDirectory = path.dirname(manifestPath);
  const evidence: Partial<
    Record<CadenzaExportFormat, LocalExportFormatEvidence>
  > = {};

  for (const format of manifest.formats) {
    const evidenceReference = manifest.evidence[format];
    if (evidenceReference === undefined) {
      throw localExportError(LOCAL_EXPORT_EXIT_CODES.usage, {
        category: "inspect",
        code: "VINS_MISSING_EVIDENCE_REFERENCE",
        locator: manifestPath,
        message: `Manifest is missing a ${format} evidence reference.`,
        relatedRequirements: ["VINS-005", "EXEN-010", "CDIA-008"],
        repairHint:
          "Regenerate the export so each selected format has an evidence file reference.",
        severity: "error",
      });
    }

    evidence[format] = await readLocalExportFormatEvidence(
      path.join(outputDirectory, evidenceReference),
      format,
    );
  }

  return {
    artifacts: manifest.artifacts,
    capabilities: manifest.capabilities,
    deck: manifest.deck,
    diagnostics: manifest.diagnostics,
    evidence,
    formats: manifest.formats,
    knownLimitations: manifest.knownLimitations,
    manifest,
    manifestPath,
    outputDirectory,
    schemaVersion: LOCAL_EXPORT_SCHEMA_VERSION,
    selector: manifest.selector,
  };
}

export async function readLocalExportManifest(
  manifestPath: string,
): Promise<LocalExportManifest> {
  const raw = await readJsonFile(manifestPath, "manifest");

  if (!isRecord(raw) || raw.command !== "export") {
    throw localExportError(LOCAL_EXPORT_EXIT_CODES.usage, {
      category: "inspect",
      code: "VINS_NON_CADENZA_ARTIFACT",
      locator: manifestPath,
      message: "The selected artifact is not a Cadenza local export.",
      relatedRequirements: ["VINS-005", "CDIA-008"],
      repairHint:
        "Pass a local export manifest.json path or an artifact directory containing one.",
      severity: "error",
    });
  }

  if (raw.schemaVersion !== LOCAL_EXPORT_SCHEMA_VERSION) {
    throw unsupportedSchemaDiagnostic(manifestPath, "manifest");
  }

  if (
    !Array.isArray(raw.formats) ||
    !isRecord(raw.evidence) ||
    !isRecord(raw.deck) ||
    typeof raw.stableHash !== "string"
  ) {
    throw localExportError(LOCAL_EXPORT_EXIT_CODES.usage, {
      category: "inspect",
      code: "VINS_MALFORMED_MANIFEST",
      locator: manifestPath,
      message: "Cadenza local export manifest is missing required fields.",
      relatedRequirements: ["VINS-005", "EXEN-002", "CDIA-008"],
      repairHint:
        "Regenerate the export or inspect a complete local export artifact directory.",
      severity: "error",
    });
  }

  return raw as LocalExportManifest;
}

export async function readLocalExportFormatEvidence(
  evidencePath: string,
  expectedFormat?: CadenzaExportFormat,
): Promise<LocalExportFormatEvidence> {
  const raw = await readJsonFile(evidencePath, "evidence");

  if (!isRecord(raw)) {
    throw malformedEvidenceDiagnostic(evidencePath);
  }

  if (raw.schemaVersion !== LOCAL_EXPORT_SCHEMA_VERSION) {
    throw unsupportedSchemaDiagnostic(evidencePath, "evidence");
  }

  if (
    (expectedFormat !== undefined && raw.format !== expectedFormat) ||
    (raw.format !== "web" && raw.format !== "mp4") ||
    !Array.isArray(raw.artifacts) ||
    !isRecord(raw.capability)
  ) {
    throw malformedEvidenceDiagnostic(evidencePath);
  }

  return raw as LocalExportFormatEvidence;
}

function createManifestWithoutHash({
  capabilities,
  deterministicTimeline,
  evidenceReferences,
  formats,
  loaded,
  outputDirectory,
  outputRoot,
  projectConfig,
  runId,
  timelineDigest,
}: {
  capabilities: Partial<
    Record<CadenzaExportFormat, LocalExportFormatCapability>
  >;
  deterministicTimeline: ReturnType<typeof createDeterministicTimeline>;
  evidenceReferences: Partial<Record<CadenzaExportFormat, string>>;
  formats: CadenzaExportFormat[];
  loaded: LoadedDeckModule;
  outputDirectory: string;
  outputRoot: string;
  projectConfig: CadenzaProjectConfig | undefined;
  runId: string;
  timelineDigest: string;
}): Omit<LocalExportManifest, "artifacts" | "stableHash"> {
  return {
    capabilities,
    command: "export",
    deck: {
      id: loaded.metadata.deckId,
      sourcePath: loaded.metadata.sourcePath,
      title: loaded.metadata.title,
    },
    deterministic: {
      capabilities,
      configDefaults: {
        defaultFormats: [
          ...(projectConfig?.export?.defaultFormats ?? ["web", "mp4"]),
        ],
        evidenceFilenames: {
          manifest: LOCAL_EXPORT_ARTIFACT_FILENAMES.manifest,
          mp4: LOCAL_EXPORT_ARTIFACT_FILENAMES.mp4Evidence,
          web: LOCAL_EXPORT_ARTIFACT_FILENAMES.webEvidence,
        },
      },
      formatSelection: formats,
      timeline: deterministicTimeline,
      timelineDigest,
    },
    diagnostics: [],
    evidence: evidenceReferences,
    formats,
    knownLimitations: createKnownLimitations(formats),
    outputDirectory,
    outputRoot,
    runId,
    schemaVersion: LOCAL_EXPORT_SCHEMA_VERSION,
    selector: {
      ...(loaded.selector.alias === undefined
        ? {}
        : { alias: loaded.selector.alias }),
      requested: loaded.selector.requested,
      resolvedPath: loaded.selector.resolvedPath,
      source: loaded.selector.source,
    },
    volatile: {
      generatedAt: new Date().toISOString(),
      outputDirectory,
      selectorProvenance: {
        absolutePath: loaded.selector.absolutePath,
      },
    },
  };
}

async function collectArtifactInventory({
  evidenceReferences,
  formats,
  outputDirectory,
  renderedArtifacts,
}: {
  evidenceReferences: Partial<Record<CadenzaExportFormat, string>>;
  formats: CadenzaExportFormat[];
  outputDirectory: string;
  renderedArtifacts: LocalExportArtifactRecord[];
}): Promise<LocalExportArtifactRecord[]> {
  const artifacts: LocalExportArtifactRecord[] = [...renderedArtifacts];

  if (formats.includes("web")) {
    artifacts.push(
      await artifactRecord({
        format: "web",
        outputDirectory,
        relativePath: "index.html",
        role: "web-entrypoint",
      }),
    );
  }

  for (const format of formats) {
    const evidenceReference = evidenceReferences[format];
    if (evidenceReference !== undefined) {
      artifacts.push(
        await artifactRecord({
          format,
          outputDirectory,
          relativePath: evidenceReference,
          role: "format-evidence",
        }),
      );
    }
  }

  return artifacts;
}

async function artifactRecord({
  format,
  outputDirectory,
  relativePath,
  role,
}: {
  format?: CadenzaExportFormat;
  outputDirectory: string;
  relativePath: string;
  role: string;
}): Promise<LocalExportArtifactRecord> {
  const bytes = await readFile(path.join(outputDirectory, relativePath));

  return {
    byteSize: bytes.byteLength,
    ...(format === undefined ? {} : { format }),
    path: relativePath,
    role,
    sha256: createSha256(bytes),
  };
}

function createCapabilities(
  formats: CadenzaExportFormat[],
): Partial<Record<CadenzaExportFormat, LocalExportFormatCapability>> {
  const capabilities: Partial<
    Record<CadenzaExportFormat, LocalExportFormatCapability>
  > = {};

  if (formats.includes("web")) {
    capabilities.web = webCapability();
  }
  if (formats.includes("mp4")) {
    capabilities.mp4 = mp4Capability();
  }

  return capabilities;
}

function webCapability(): LocalExportFormatCapability {
  return {
    description:
      "Static web compatibility artifact with semantic anchors and manifest-linked evidence.",
    futureReusableConcepts: [
      "deck identity",
      "artifact inventory",
      "diagnostic records",
      "format capability status",
    ],
    status: "supported",
  };
}

function mp4Capability(): LocalExportFormatCapability {
  return mp4CapabilityWithStatus("limited");
}

function mp4CapabilityWithStatus(
  status: Extract<
    LocalExportCapabilityStatus,
    "limited" | "supported" | "unsupported"
  >,
): LocalExportFormatCapability {
  return {
    description:
      status === "unsupported"
        ? "Local MP4 renderer capability was selected but the local renderer prerequisites or render stage failed."
        : status === "supported"
          ? "Local MP4 renderer capability produced through the local export renderer adapter."
          : "Local MP4 renderer capability selected, with media rendering completed by the local renderer adapter.",
    futureReusableConcepts: [
      "renderer provenance",
      "media artifact metadata",
      "diagnostic records",
      "format capability status",
    ],
    status,
  };
}

function createKnownLimitations(formats: CadenzaExportFormat[]): string[] {
  const limitations = [
    "Cadenza local export is local-only and does not claim hosted, cloud, Player App, PDF, PPTX, plugin, or npm-publication support.",
  ];

  if (formats.includes("mp4")) {
    limitations.push(
      "MP4 media artifact generation is implemented by the local renderer adapter.",
    );
  }

  return limitations;
}

function createDeterministicTimeline(timeline: TimelineMap) {
  return {
    fps: timeline.fps,
    navigationPolicy: timeline.navigationPolicy,
    slideCount: timeline.slides.length,
    slides: timeline.slides.map((slide) => ({
      resources: slide.resources,
      segment: slide.segment,
      slideId: slide.slideId,
      stepCount: slide.steps.length,
      steps: slide.steps,
      transitionIn: slide.transitionIn,
      transitionOut: slide.transitionOut,
    })),
    totalFrames: timeline.totalFrames,
  };
}

function normalizeFormats(
  formats: readonly CadenzaExportFormat[],
): CadenzaExportFormat[] {
  const normalized: CadenzaExportFormat[] = [];

  for (const format of formats) {
    if (!normalized.includes(format)) {
      normalized.push(format);
    }
  }

  if (normalized.length === 0) {
    throw localExportError(LOCAL_EXPORT_EXIT_CODES.usage, {
      category: "usage",
      code: "CLIS_FORMAT_REQUIRED",
      message: "At least one export format must be selected.",
      relatedRequirements: ["CLIS-002"],
      repairHint: "Pass --format web, --format mp4, or --format web,mp4.",
      severity: "error",
    });
  }

  return normalized;
}

async function resolveManifestPath(inputPath: string): Promise<string> {
  try {
    const inputStat = await stat(inputPath);

    if (inputStat.isDirectory()) {
      return path.join(inputPath, LOCAL_EXPORT_ARTIFACT_FILENAMES.manifest);
    }

    return inputPath;
  } catch {
    throw localExportError(LOCAL_EXPORT_EXIT_CODES.usage, {
      category: "inspect",
      code: "VINS_MISSING_MANIFEST",
      locator: inputPath,
      message:
        "No Cadenza local export manifest was found at the selected path.",
      relatedRequirements: ["VINS-005", "CDIA-008"],
      repairHint:
        "Pass a manifest.json path or a directory containing a local export manifest.json.",
      severity: "error",
    });
  }
}

async function readJsonFile(filePath: string, kind: "evidence" | "manifest") {
  try {
    await access(filePath);
  } catch {
    throw localExportError(LOCAL_EXPORT_EXIT_CODES.usage, {
      category: "inspect",
      code:
        kind === "manifest" ? "VINS_MISSING_MANIFEST" : "VINS_MISSING_EVIDENCE",
      locator: filePath,
      message:
        kind === "manifest"
          ? "Cadenza local export manifest is missing."
          : "Cadenza local export format evidence file is missing.",
      relatedRequirements: ["VINS-005", "EXEN-010", "CDIA-008"],
      repairHint:
        "Regenerate the export or inspect a complete local export artifact directory.",
      severity: "error",
    });
  }

  try {
    return JSON.parse(await readFile(filePath, "utf8")) as unknown;
  } catch {
    throw localExportError(LOCAL_EXPORT_EXIT_CODES.usage, {
      category: "inspect",
      code:
        kind === "manifest"
          ? "VINS_MALFORMED_MANIFEST"
          : "VINS_MALFORMED_EVIDENCE",
      locator: filePath,
      message:
        kind === "manifest"
          ? "Cadenza local export manifest is not valid JSON."
          : "Cadenza local export format evidence is not valid JSON.",
      relatedRequirements: ["VINS-005", "EXEN-010", "CDIA-008"],
      repairHint:
        "Regenerate the export or fix the malformed JSON before inspecting it.",
      severity: "error",
    });
  }
}

function unsupportedSchemaDiagnostic(
  filePath: string,
  kind: "evidence" | "manifest",
) {
  return localExportError(LOCAL_EXPORT_EXIT_CODES.usage, {
    category: "inspect",
    code:
      kind === "manifest"
        ? "EXEN_UNSUPPORTED_MANIFEST_SCHEMA"
        : "EXEN_UNSUPPORTED_EVIDENCE_SCHEMA",
    locator: filePath,
    message: `Unsupported local export ${kind} schema version.`,
    relatedRequirements: ["EXEN-010", "VINS-005"],
    repairHint: "Regenerate the artifact with the current local exporter.",
    severity: "error",
  });
}

function malformedEvidenceDiagnostic(evidencePath: string) {
  return localExportError(LOCAL_EXPORT_EXIT_CODES.usage, {
    category: "inspect",
    code: "VINS_MALFORMED_EVIDENCE",
    locator: evidencePath,
    message: "Cadenza local export format evidence is missing required fields.",
    relatedRequirements: ["VINS-005", "EXEN-010", "CDIA-008"],
    repairHint:
      "Regenerate the export so each selected format has a valid evidence file.",
    severity: "error",
  });
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function sanitizeRunId(runId: string): string {
  const sanitized = runId.trim();

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(sanitized)) {
    throw localExportError(LOCAL_EXPORT_EXIT_CODES.usage, {
      category: "usage",
      code: "CLIS_INVALID_RUN_ID",
      locator: runId,
      message:
        "--run-id must start with an alphanumeric character and contain only letters, numbers, dots, underscores, or dashes.",
      relatedRequirements: ["CLIS-002", "CDIA-002"],
      repairHint:
        "Choose a run identifier such as local-check, build_001, or 2026-05-30.",
      severity: "error",
    });
  }

  return sanitized;
}

function defaultRunId(): string {
  return new Date().toISOString().replaceAll(/[:.]/g, "-");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
