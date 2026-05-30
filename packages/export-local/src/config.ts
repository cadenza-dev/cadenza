import { access } from "node:fs/promises";
import path from "node:path";
import { CadenzaPhase6Error, type Phase6Diagnostic } from "./diagnostics.ts";

export type CadenzaExportFormat = "mp4" | "web";

export type CadenzaProjectConfig = {
  decks?: Record<string, string>;
  export?: {
    defaultFormats?: CadenzaExportFormat[];
  };
  output?: {
    root?: string;
  };
};

export type Phase6RuntimeConfig = {
  defaultFormats: CadenzaExportFormat[];
  evidenceFilenames: {
    manifest: string;
    mp4: string;
    web: string;
  };
  generatedOutputSafety: {
    force: boolean;
    prompt: false;
  };
  outputRoot: string;
  rendererTempRoot: string;
};

export type ResolvePhase6RuntimeConfigOptions = {
  cli?: {
    defaultFormats?: CadenzaExportFormat[];
    force?: boolean;
    outputRoot?: string;
  };
  config?: CadenzaProjectConfig;
};

export type GeneratedOutputSafetyResult = {
  outputDirectory: string;
  status: "force-overwrite" | "fresh" | "regenerate-owned";
};

export type EnsureGeneratedOutputSafetyOptions = {
  force: boolean;
  outputDirectory: string;
};

export function defineConfig(
  config: CadenzaProjectConfig,
): CadenzaProjectConfig {
  return config;
}

export function validateProjectConfig(
  value: unknown,
): asserts value is CadenzaProjectConfig {
  const diagnostics: Phase6Diagnostic[] = [];

  if (!isRecord(value)) {
    throw new CadenzaPhase6Error(2, [
      {
        category: "config",
        code: "CNFG_INVALID_VALUE",
        message: "cadenza.config.ts must export an object.",
        relatedRequirements: ["CNFG-004"],
        repairHint:
          "Use defineConfig({ decks, output: { root }, export: { defaultFormats } }).",
        severity: "error",
      },
    ]);
  }

  for (const key of Object.keys(value).sort()) {
    if (!["decks", "export", "output"].includes(key)) {
      diagnostics.push({
        category: "config",
        code: "CNFG_UNKNOWN_KEY",
        locator: key,
        message: `Unknown Phase 6 config key "${key}".`,
        relatedRequirements: ["CNFG-004"],
        repairHint:
          "Use only decks, output.root, and export.defaultFormats in Phase 6 config.",
        severity: "error",
      });
    }
  }

  if (
    value.decks !== undefined &&
    (!isRecord(value.decks) ||
      Object.values(value.decks).some((entry) => typeof entry !== "string"))
  ) {
    diagnostics.push({
      category: "config",
      code: "CNFG_INVALID_VALUE",
      locator: "decks",
      message: "Phase 6 config decks must be an alias-to-path record.",
      relatedRequirements: ["CNFG-002", "CNFG-004", "CNFG-007"],
      repairHint:
        "Use decks: { alias: './path/to/deck.tsx' } without identity overrides.",
      severity: "error",
    });
  }

  if (
    value.output !== undefined &&
    (!isRecord(value.output) ||
      (value.output.root !== undefined &&
        typeof value.output.root !== "string"))
  ) {
    diagnostics.push({
      category: "config",
      code: "CNFG_INVALID_VALUE",
      locator: "output.root",
      message: "Phase 6 config output.root must be a string when provided.",
      relatedRequirements: ["CNFG-002", "CNFG-004"],
      repairHint: "Use output: { root: 'dist/cadenza' }.",
      severity: "error",
    });
  }

  if (
    value.export !== undefined &&
    (!isRecord(value.export) ||
      (value.export.defaultFormats !== undefined &&
        (!Array.isArray(value.export.defaultFormats) ||
          value.export.defaultFormats.some(
            (format) => format !== "web" && format !== "mp4",
          ))))
  ) {
    diagnostics.push({
      category: "config",
      code: "CNFG_INVALID_VALUE",
      locator: "export.defaultFormats",
      message:
        'Phase 6 config export.defaultFormats must contain only "web" and "mp4".',
      relatedRequirements: ["CNFG-002", "CNFG-004"],
      repairHint: 'Use export: { defaultFormats: ["web", "mp4"] }.',
      severity: "error",
    });
  }

  if (diagnostics.length > 0) {
    throw new CadenzaPhase6Error(2, diagnostics);
  }
}

export const PHASE6_DEFAULT_FORMATS: readonly CadenzaExportFormat[] = [
  "web",
  "mp4",
] as const;

export const PHASE6_DEFAULT_OUTPUT_ROOT = "dist/cadenza";

export const PHASE6_ARTIFACT_FILENAMES = {
  manifest: "manifest.json",
  mp4Evidence: "mp4-evidence.json",
  webEvidence: "web-evidence.json",
} as const;

export const PHASE6_RENDERER_TEMP_ROOT = "tmp/cadenza-render";

export function resolvePhase6RuntimeConfig({
  cli,
  config,
}: ResolvePhase6RuntimeConfigOptions): Phase6RuntimeConfig {
  return {
    defaultFormats: [
      ...(cli?.defaultFormats ??
        config?.export?.defaultFormats ??
        PHASE6_DEFAULT_FORMATS),
    ],
    evidenceFilenames: {
      manifest: PHASE6_ARTIFACT_FILENAMES.manifest,
      mp4: PHASE6_ARTIFACT_FILENAMES.mp4Evidence,
      web: PHASE6_ARTIFACT_FILENAMES.webEvidence,
    },
    generatedOutputSafety: {
      force: cli?.force ?? false,
      prompt: false,
    },
    outputRoot:
      cli?.outputRoot ?? config?.output?.root ?? PHASE6_DEFAULT_OUTPUT_ROOT,
    rendererTempRoot: PHASE6_RENDERER_TEMP_ROOT,
  };
}

export async function ensureGeneratedOutputSafety({
  force,
  outputDirectory,
}: EnsureGeneratedOutputSafetyOptions): Promise<GeneratedOutputSafetyResult> {
  if (!(await exists(outputDirectory))) {
    return {
      outputDirectory,
      status: "fresh",
    };
  }

  if (await exists(path.join(outputDirectory, ".cadenza-generated.json"))) {
    return {
      outputDirectory,
      status: "regenerate-owned",
    };
  }

  if (force) {
    return {
      outputDirectory,
      status: "force-overwrite",
    };
  }

  throw new CadenzaPhase6Error(2, [
    {
      category: "config",
      code: "CNFG_OUTPUT_OWNERSHIP",
      locator: outputDirectory,
      message:
        "Refusing to overwrite an existing directory that is not marked as Cadenza-generated.",
      relatedRequirements: ["CNFG-005", "CLIS-008"],
      repairHint:
        "Choose a fresh output directory, remove the directory yourself, or pass --force explicitly.",
      severity: "error",
    },
  ]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
