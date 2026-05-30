import { access, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { TimelineMap } from "../../core/src/index.ts";
import {
  type CadenzaExportFormat,
  type CadenzaProjectConfig,
  ensureGeneratedOutputSafety,
  PHASE6_ARTIFACT_FILENAMES,
  resolvePhase6RuntimeConfig,
} from "./config.ts";
import {
  type LoadedDeckModule,
  loadDeckModule,
  loadPhase6ProjectConfig,
} from "./deckLoader.ts";
import {
  PHASE6_EXIT_CODES,
  type Phase6Diagnostic,
  phase6Error,
} from "./diagnostics.ts";
import { createSha256, createStableHash } from "./stableJson.ts";
import {
  renderStaticWebCompatibility,
  type StaticWebCompatibilityAdapterResult,
} from "./staticWebCompatibility.ts";

export const PHASE6_EXPORT_SCHEMA_VERSION = 1;

export type Phase6CapabilityStatus =
  | "limited"
  | "supported"
  | "unsupported"
  | "waived";

export type Phase6FormatCapability = {
  description: string;
  futureReusableConcepts: string[];
  status: Phase6CapabilityStatus;
};

export type Phase6ArtifactRecord = {
  byteSize?: number;
  format?: CadenzaExportFormat;
  path: string;
  role: string;
  sha256?: string;
};

export type Phase6FormatEvidence = {
  adapterProvenance?: StaticWebCompatibilityAdapterResult["adapterProvenance"];
  artifacts: Phase6ArtifactRecord[];
  browserSmoke?: StaticWebCompatibilityAdapterResult["browserSmoke"];
  capability: Phase6FormatCapability;
  compatibilityMode?: StaticWebCompatibilityAdapterResult["compatibilityMode"];
  diagnostics: Phase6Diagnostic[];
  entrypointPath?: StaticWebCompatibilityAdapterResult["entrypointPath"];
  format: CadenzaExportFormat;
  knownLimitations: string[];
  manifestReference?: StaticWebCompatibilityAdapterResult["manifestReference"];
  notesBoundary?: StaticWebCompatibilityAdapterResult["notesBoundary"];
  schemaVersion: number;
  semanticAnchors?: StaticWebCompatibilityAdapterResult["semanticAnchors"];
  status: Phase6CapabilityStatus;
  timingEvidence?: StaticWebCompatibilityAdapterResult["timingEvidence"];
};

export type Phase6ExportManifest = {
  artifacts: Phase6ArtifactRecord[];
  capabilities: Partial<Record<CadenzaExportFormat, Phase6FormatCapability>>;
  command: "export";
  deck: {
    id: string;
    sourcePath: string;
    title: string;
  };
  deterministic: {
    capabilities: Partial<Record<CadenzaExportFormat, Phase6FormatCapability>>;
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
  diagnostics: Phase6Diagnostic[];
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
  manifest: Phase6ExportManifest;
  manifestPath: string;
  outputDirectory: string;
};

export type ValidateDeckLocalOptions = {
  cwd: string;
  selector?: string;
  workspaceRoot?: string;
};

export type ValidateDeckLocalResult = {
  deck: Phase6ExportManifest["deck"];
  diagnostics: Phase6Diagnostic[];
  schemaVersion: number;
  selector: Phase6ExportManifest["selector"];
  timeline: Phase6ExportManifest["deterministic"]["timeline"] & {
    digest: string;
  };
};

export type InspectExportArtifactOptions = {
  inputPath: string;
};

export type InspectExportArtifactResult = {
  artifacts: Phase6ArtifactRecord[];
  capabilities: Partial<Record<CadenzaExportFormat, Phase6FormatCapability>>;
  deck: Phase6ExportManifest["deck"];
  diagnostics: Phase6Diagnostic[];
  evidence: Partial<Record<CadenzaExportFormat, Phase6FormatEvidence>>;
  formats: CadenzaExportFormat[];
  knownLimitations: string[];
  manifest: Phase6ExportManifest;
  manifestPath: string;
  outputDirectory: string;
  schemaVersion: number;
  selector: Phase6ExportManifest["selector"];
};

export async function exportDeckLocal(
  options: ExportLocalOptions,
): Promise<ExportLocalResult> {
  const cwd = options.cwd;
  const workspaceRoot = options.workspaceRoot ?? cwd;
  const projectConfig = await loadPhase6ProjectConfig({ cwd, workspaceRoot });
  const runtime = resolvePhase6RuntimeConfig({
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
    schemaVersion: PHASE6_EXPORT_SCHEMA_VERSION,
  });

  const capabilities = createCapabilities(formats);
  const deterministicTimeline = createDeterministicTimeline(loaded.timeline);
  const timelineDigest = createStableHash(deterministicTimeline);
  const evidencePaths: Partial<Record<CadenzaExportFormat, string>> = {};
  const evidenceReferences: Partial<Record<CadenzaExportFormat, string>> = {};

  if (formats.includes("web")) {
    const webCompatibility = await renderStaticWebCompatibility({
      manifestReferencePath: PHASE6_ARTIFACT_FILENAMES.manifest,
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
    const webEvidence: Phase6FormatEvidence = {
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
      schemaVersion: PHASE6_EXPORT_SCHEMA_VERSION,
      semanticAnchors: webCompatibility.semanticAnchors,
      status: "supported",
      timingEvidence: webCompatibility.timingEvidence,
    };
    const evidencePath = path.join(
      outputDirectory,
      PHASE6_ARTIFACT_FILENAMES.webEvidence,
    );
    await writeJson(evidencePath, webEvidence);
    evidencePaths.web = evidencePath;
    evidenceReferences.web = PHASE6_ARTIFACT_FILENAMES.webEvidence;
  }

  if (formats.includes("mp4")) {
    const mp4Evidence: Phase6FormatEvidence = {
      artifacts: [],
      capability: capabilities.mp4 ?? mp4Capability(),
      diagnostics: [],
      format: "mp4",
      knownLimitations: [
        "B6.4 renderer adapter produces the MP4 media artifact; B6.2 records the selected MP4 capability without claiming renderer completion.",
      ],
      schemaVersion: PHASE6_EXPORT_SCHEMA_VERSION,
      status: "limited",
    };
    const evidencePath = path.join(
      outputDirectory,
      PHASE6_ARTIFACT_FILENAMES.mp4Evidence,
    );
    await writeJson(evidencePath, mp4Evidence);
    evidencePaths.mp4 = evidencePath;
    evidenceReferences.mp4 = PHASE6_ARTIFACT_FILENAMES.mp4Evidence;
  }

  const artifactInventory = await collectArtifactInventory({
    evidenceReferences,
    formats,
    outputDirectory,
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
    schemaVersion: PHASE6_EXPORT_SCHEMA_VERSION,
    timelineDigest,
  });
  const manifest: Phase6ExportManifest = {
    ...manifestWithoutHash,
    artifacts: artifactInventory,
    stableHash,
  };
  const manifestPath = path.join(
    outputDirectory,
    PHASE6_ARTIFACT_FILENAMES.manifest,
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
    schemaVersion: PHASE6_EXPORT_SCHEMA_VERSION,
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
  const manifest = await readPhase6ExportManifest(manifestPath);
  const outputDirectory = path.dirname(manifestPath);
  const evidence: Partial<Record<CadenzaExportFormat, Phase6FormatEvidence>> =
    {};

  for (const format of manifest.formats) {
    const evidenceReference = manifest.evidence[format];
    if (evidenceReference === undefined) {
      throw phase6Error(PHASE6_EXIT_CODES.usage, {
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

    evidence[format] = await readPhase6FormatEvidence(
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
    schemaVersion: PHASE6_EXPORT_SCHEMA_VERSION,
    selector: manifest.selector,
  };
}

export async function readPhase6ExportManifest(
  manifestPath: string,
): Promise<Phase6ExportManifest> {
  const raw = await readJsonFile(manifestPath, "manifest");

  if (!isRecord(raw) || raw.command !== "export") {
    throw phase6Error(PHASE6_EXIT_CODES.usage, {
      category: "inspect",
      code: "VINS_NON_CADENZA_ARTIFACT",
      locator: manifestPath,
      message: "The selected artifact is not a Phase 6 Cadenza export.",
      relatedRequirements: ["VINS-005", "CDIA-008"],
      repairHint:
        "Pass a Phase 6 manifest.json path or an artifact directory containing one.",
      severity: "error",
    });
  }

  if (raw.schemaVersion !== PHASE6_EXPORT_SCHEMA_VERSION) {
    throw unsupportedSchemaDiagnostic(manifestPath, "manifest");
  }

  if (
    !Array.isArray(raw.formats) ||
    !isRecord(raw.evidence) ||
    !isRecord(raw.deck) ||
    typeof raw.stableHash !== "string"
  ) {
    throw phase6Error(PHASE6_EXIT_CODES.usage, {
      category: "inspect",
      code: "VINS_MALFORMED_MANIFEST",
      locator: manifestPath,
      message: "Phase 6 export manifest is missing required fields.",
      relatedRequirements: ["VINS-005", "EXEN-002", "CDIA-008"],
      repairHint:
        "Regenerate the export or inspect a complete Phase 6 artifact directory.",
      severity: "error",
    });
  }

  return raw as Phase6ExportManifest;
}

export async function readPhase6FormatEvidence(
  evidencePath: string,
  expectedFormat?: CadenzaExportFormat,
): Promise<Phase6FormatEvidence> {
  const raw = await readJsonFile(evidencePath, "evidence");

  if (!isRecord(raw)) {
    throw malformedEvidenceDiagnostic(evidencePath);
  }

  if (raw.schemaVersion !== PHASE6_EXPORT_SCHEMA_VERSION) {
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

  return raw as Phase6FormatEvidence;
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
  capabilities: Partial<Record<CadenzaExportFormat, Phase6FormatCapability>>;
  deterministicTimeline: ReturnType<typeof createDeterministicTimeline>;
  evidenceReferences: Partial<Record<CadenzaExportFormat, string>>;
  formats: CadenzaExportFormat[];
  loaded: LoadedDeckModule;
  outputDirectory: string;
  outputRoot: string;
  projectConfig: CadenzaProjectConfig | undefined;
  runId: string;
  timelineDigest: string;
}): Omit<Phase6ExportManifest, "artifacts" | "stableHash"> {
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
          manifest: PHASE6_ARTIFACT_FILENAMES.manifest,
          mp4: PHASE6_ARTIFACT_FILENAMES.mp4Evidence,
          web: PHASE6_ARTIFACT_FILENAMES.webEvidence,
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
    schemaVersion: PHASE6_EXPORT_SCHEMA_VERSION,
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
}: {
  evidenceReferences: Partial<Record<CadenzaExportFormat, string>>;
  formats: CadenzaExportFormat[];
  outputDirectory: string;
}): Promise<Phase6ArtifactRecord[]> {
  const artifacts: Phase6ArtifactRecord[] = [];

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
}): Promise<Phase6ArtifactRecord> {
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
): Partial<Record<CadenzaExportFormat, Phase6FormatCapability>> {
  const capabilities: Partial<
    Record<CadenzaExportFormat, Phase6FormatCapability>
  > = {};

  if (formats.includes("web")) {
    capabilities.web = webCapability();
  }
  if (formats.includes("mp4")) {
    capabilities.mp4 = mp4Capability();
  }

  return capabilities;
}

function webCapability(): Phase6FormatCapability {
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

function mp4Capability(): Phase6FormatCapability {
  return {
    description:
      "Local MP4 renderer capability selected for Phase 6, with media rendering completed by the B6.4 renderer adapter.",
    futureReusableConcepts: [
      "renderer provenance",
      "media artifact metadata",
      "diagnostic records",
      "format capability status",
    ],
    status: "limited",
  };
}

function createKnownLimitations(formats: CadenzaExportFormat[]): string[] {
  const limitations = [
    "Phase 6 export is local-only and does not claim hosted, cloud, Player App, PDF, PPTX, plugin, or npm-publication support.",
  ];

  if (formats.includes("mp4")) {
    limitations.push(
      "MP4 media artifact generation is implemented by the B6.4 renderer adapter; B6.2 records capability and evidence shape only.",
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
    throw phase6Error(PHASE6_EXIT_CODES.usage, {
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
      return path.join(inputPath, PHASE6_ARTIFACT_FILENAMES.manifest);
    }

    return inputPath;
  } catch {
    throw phase6Error(PHASE6_EXIT_CODES.usage, {
      category: "inspect",
      code: "VINS_MISSING_MANIFEST",
      locator: inputPath,
      message: "No Phase 6 export manifest was found at the selected path.",
      relatedRequirements: ["VINS-005", "CDIA-008"],
      repairHint:
        "Pass a manifest.json path or a directory containing a Phase 6 manifest.json.",
      severity: "error",
    });
  }
}

async function readJsonFile(filePath: string, kind: "evidence" | "manifest") {
  try {
    await access(filePath);
  } catch {
    throw phase6Error(PHASE6_EXIT_CODES.usage, {
      category: "inspect",
      code:
        kind === "manifest" ? "VINS_MISSING_MANIFEST" : "VINS_MISSING_EVIDENCE",
      locator: filePath,
      message:
        kind === "manifest"
          ? "Phase 6 export manifest is missing."
          : "Phase 6 format evidence file is missing.",
      relatedRequirements: ["VINS-005", "EXEN-010", "CDIA-008"],
      repairHint:
        "Regenerate the export or inspect a complete Phase 6 artifact directory.",
      severity: "error",
    });
  }

  try {
    return JSON.parse(await readFile(filePath, "utf8")) as unknown;
  } catch {
    throw phase6Error(PHASE6_EXIT_CODES.usage, {
      category: "inspect",
      code:
        kind === "manifest"
          ? "VINS_MALFORMED_MANIFEST"
          : "VINS_MALFORMED_EVIDENCE",
      locator: filePath,
      message:
        kind === "manifest"
          ? "Phase 6 export manifest is not valid JSON."
          : "Phase 6 format evidence is not valid JSON.",
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
  return phase6Error(PHASE6_EXIT_CODES.usage, {
    category: "inspect",
    code:
      kind === "manifest"
        ? "EXEN_UNSUPPORTED_MANIFEST_SCHEMA"
        : "EXEN_UNSUPPORTED_EVIDENCE_SCHEMA",
    locator: filePath,
    message: `Unsupported Phase 6 ${kind} schema version.`,
    relatedRequirements: ["EXEN-010", "VINS-005"],
    repairHint: "Regenerate the artifact with the current Phase 6 exporter.",
    severity: "error",
  });
}

function malformedEvidenceDiagnostic(evidencePath: string) {
  return phase6Error(PHASE6_EXIT_CODES.usage, {
    category: "inspect",
    code: "VINS_MALFORMED_EVIDENCE",
    locator: evidencePath,
    message: "Phase 6 format evidence is missing required fields.",
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
    throw phase6Error(PHASE6_EXIT_CODES.usage, {
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
