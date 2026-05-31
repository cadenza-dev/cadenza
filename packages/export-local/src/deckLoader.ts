import { access, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import {
  CadenzaValidationError,
  compile,
  type DeckNode,
  type TimelineMap,
} from "../../core/src/index.ts";
import { type CadenzaProjectConfig, validateProjectConfig } from "./config.ts";
import { CadenzaLocalExportError, localExportError } from "./diagnostics.ts";

export type DeckSelectorSource =
  | "built-in-alias"
  | "config-alias"
  | "config-default"
  | "explicit-alias"
  | "explicit-path";

export type LoadedDeckSelector = {
  absolutePath: string;
  alias?: string;
  requested: string;
  resolvedPath: string;
  source: DeckSelectorSource;
};

export type CadenzaDeckMetadata = {
  deckId: string;
  outline: {
    slideId: string;
    summary?: string;
    title?: string;
  }[];
  sourcePath: string;
  title: string;
};

export type LoadedDeckModule = {
  contractExports: string[];
  deck: DeckNode;
  metadata: CadenzaDeckMetadata;
  selector: LoadedDeckSelector;
  timeline: TimelineMap;
};

export type LoadDeckModuleOptions = {
  cwd: string;
  selector?: string;
  workspaceRoot?: string;
};

export const CADENZA_ALPHA_DECK_SELECTOR = "cadenza-alpha-readiness-talk";
export const CADENZA_ALPHA_DECK_SOURCE_PATH =
  "examples/cadenza/alpha-readiness-talk.tsx";

const BUILT_IN_DECK_ALIASES = {
  [CADENZA_ALPHA_DECK_SELECTOR]: CADENZA_ALPHA_DECK_SOURCE_PATH,
} as const;

export async function loadDeckModule({
  cwd,
  selector,
  workspaceRoot = cwd,
}: LoadDeckModuleOptions): Promise<LoadedDeckModule> {
  const projectConfig = await loadLocalExportProjectConfig({
    cwd,
    workspaceRoot,
  });
  const resolved = resolveDeckSelector({
    cwd,
    projectConfig,
    selector,
    workspaceRoot,
  });
  const bundled = await bundleAndImportDeck(
    workspaceRoot,
    resolved.absolutePath,
  );
  try {
    const metadata = readDeckMetadata(bundled, resolved.resolvedPath);
    const deck = readDeckValue(bundled, resolved.resolvedPath);

    return {
      contractExports: readContractExports(bundled),
      deck,
      metadata,
      selector: resolved,
      timeline: compile(deck, { mode: "offline" }),
    };
  } catch (error) {
    throw mapDeckContractError(error, resolved.resolvedPath);
  }
}

type ResolveDeckSelectorOptions = {
  cwd: string;
  projectConfig: CadenzaProjectConfig | undefined;
  selector: string | undefined;
  workspaceRoot: string;
};

function resolveDeckSelector({
  cwd,
  projectConfig,
  selector,
  workspaceRoot,
}: ResolveDeckSelectorOptions): LoadedDeckSelector {
  if (selector !== undefined && isPathLikeSelector(selector)) {
    return createPathSelector({
      cwd,
      requested: selector,
      source: "explicit-path",
      workspaceRoot,
    });
  }

  if (
    selector !== undefined &&
    projectConfig?.decks?.[selector] !== undefined
  ) {
    return createPathSelector({
      alias: selector,
      cwd,
      requested: selector,
      source: "config-alias",
      targetPath: projectConfig.decks[selector],
      workspaceRoot,
    });
  }

  if (selector === undefined && projectConfig?.decks !== undefined) {
    const aliases = Object.keys(projectConfig.decks).sort();
    if (aliases.length === 1) {
      const alias = aliases[0] ?? "";
      return createPathSelector({
        alias,
        cwd,
        requested: alias,
        source: "config-default",
        targetPath: projectConfig.decks[alias],
        workspaceRoot,
      });
    }
  }

  if (selector !== undefined) {
    return resolveBuiltInDeck(workspaceRoot, selector);
  }

  return resolveBuiltInDeck(workspaceRoot, CADENZA_ALPHA_DECK_SELECTOR);
}

function resolveBuiltInDeck(
  workspaceRoot: string,
  selector: string,
): LoadedDeckSelector {
  const sourcePath =
    BUILT_IN_DECK_ALIASES[selector as keyof typeof BUILT_IN_DECK_ALIASES];

  if (sourcePath === undefined) {
    throw localExportError(2, {
      category: "deck-loading",
      code: "DLOD_UNKNOWN_SELECTOR",
      locator: selector,
      message: `Unknown Cadenza deck selector "${selector}".`,
      relatedRequirements: ["DLOD-002", "DLOD-003", "DLOD-006"],
      repairHint:
        "Use a built-in alias, a cadenza.config.ts deck alias, or a direct local module path.",
      severity: "error",
    });
  }

  return {
    absolutePath: path.join(workspaceRoot, sourcePath),
    alias: selector,
    requested: selector,
    resolvedPath: sourcePath,
    source: "built-in-alias",
  };
}

function createPathSelector({
  alias,
  cwd,
  requested,
  source,
  targetPath = requested,
  workspaceRoot,
}: {
  alias?: string;
  cwd: string;
  requested: string;
  source: DeckSelectorSource;
  targetPath?: string;
  workspaceRoot: string;
}): LoadedDeckSelector {
  const absolutePath = path.isAbsolute(targetPath)
    ? targetPath
    : path.resolve(cwd, targetPath);

  return {
    absolutePath,
    alias,
    requested,
    resolvedPath: toPortablePath(path.relative(workspaceRoot, absolutePath)),
    source,
  };
}

async function bundleAndImportDeck(
  workspaceRoot: string,
  absolutePath: string,
): Promise<Record<string, unknown>> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "cadenza-deck-"));
  const bundlePath = path.join(tempDir, "deck.mjs");

  try {
    await build({
      absWorkingDir: workspaceRoot,
      alias: {
        "@cadenza-dev/core": path.join(
          workspaceRoot,
          "packages/core/src/index.ts",
        ),
        "@cadenza-dev/core/jsx-dev-runtime": path.join(
          workspaceRoot,
          "packages/core/src/jsx-dev-runtime.ts",
        ),
        "@cadenza-dev/core/jsx-runtime": path.join(
          workspaceRoot,
          "packages/core/src/jsx-runtime.ts",
        ),
      },
      bundle: true,
      entryPoints: [absolutePath],
      format: "esm",
      jsx: "automatic",
      jsxImportSource: "@cadenza-dev/core",
      logLevel: "silent",
      outfile: bundlePath,
      platform: "node",
      target: "node22",
    });

    return (await import(
      `${pathToFileURL(bundlePath).href}?cacheBust=${Date.now()}`
    )) as Record<string, unknown>;
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

export async function loadLocalExportProjectConfig({
  cwd,
  workspaceRoot,
}: {
  cwd: string;
  workspaceRoot: string;
}): Promise<CadenzaProjectConfig | undefined> {
  const configPath = path.join(cwd, "cadenza.config.ts");

  try {
    await access(configPath);
  } catch {
    return undefined;
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "cadenza-config-"));
  const bundlePath = path.join(tempDir, "config.mjs");

  try {
    await build({
      absWorkingDir: cwd,
      alias: {
        "@cadenza-dev/cli": path.join(
          workspaceRoot,
          "packages/cli/src/config.ts",
        ),
        "@cadenza-dev/export-local": path.join(
          workspaceRoot,
          "packages/export-local/src/index.ts",
        ),
      },
      bundle: true,
      entryPoints: [configPath],
      format: "esm",
      logLevel: "silent",
      outfile: bundlePath,
      platform: "node",
      target: "node22",
    });

    const bundled = (await import(
      `${pathToFileURL(bundlePath).href}?cacheBust=${Date.now()}`
    )) as { default?: unknown };

    validateProjectConfig(bundled.default);
    return bundled.default;
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

function isPathLikeSelector(selector: string): boolean {
  return (
    selector.startsWith(".") ||
    selector.startsWith("/") ||
    selector.endsWith(".ts") ||
    selector.endsWith(".tsx") ||
    selector.includes(path.sep)
  );
}

function toPortablePath(value: string): string {
  return value.split(path.sep).join("/");
}

function readDeckMetadata(
  moduleExports: Record<string, unknown>,
  resolvedPath: string,
): CadenzaDeckMetadata {
  const metadata = moduleExports.cadenzaDeckMetadata;

  if (!isCadenzaDeckMetadata(metadata)) {
    throw localExportError(3, {
      category: "deck-loading",
      code: "DLOD_INVALID_METADATA",
      locator: resolvedPath,
      message: `Deck module ${resolvedPath} must export valid cadenzaDeckMetadata.`,
      relatedRequirements: ["DLOD-001", "DLOD-003", "VINS-002"],
      repairHint:
        "Export cadenzaDeckMetadata with deckId, title, sourcePath, and outline fields.",
      severity: "error",
    });
  }

  return metadata;
}

function readDeckValue(
  moduleExports: Record<string, unknown>,
  resolvedPath: string,
): DeckNode {
  const createDeck = moduleExports.createCadenzaDeck;
  const deckValue = moduleExports.cadenzaDeck;

  if (typeof createDeck === "function") {
    return createDeck() as DeckNode;
  }

  if (deckValue !== undefined) {
    return deckValue as DeckNode;
  }

  throw localExportError(3, {
    category: "deck-loading",
    code: "DLOD_MISSING_DECK_EXPORT",
    locator: resolvedPath,
    message: `Deck module ${resolvedPath} must export createCadenzaDeck() or cadenzaDeck.`,
    relatedRequirements: ["DLOD-001", "DLOD-003", "VINS-002"],
    repairHint:
      "Export a createCadenzaDeck function or a cadenzaDeck value that provides a typed Cadenza Deck node.",
    severity: "error",
  });
}

function readContractExports(moduleExports: Record<string, unknown>): string[] {
  return ["cadenzaDeckMetadata", "createCadenzaDeck", "cadenzaDeck"].filter(
    (exportName) => exportName in moduleExports,
  );
}

function mapDeckContractError(error: unknown, resolvedPath: string): Error {
  if (error instanceof CadenzaLocalExportError) {
    return error;
  }

  if (error instanceof CadenzaValidationError) {
    return localExportError(3, {
      category: "validation",
      code: "VINS_COMPILE_FAILED",
      locator: resolvedPath,
      message: "Deck validation or offline timeline compilation failed.",
      relatedRequirements: ["VINS-002", "CDIA-008"],
      repairHint:
        "Fix the authored deck diagnostics before running export or validate again.",
      severity: "error",
    });
  }

  return localExportError(3, {
    category: "deck-loading",
    code: "DLOD_CONTRACT_ERROR",
    locator: resolvedPath,
    message: error instanceof Error ? error.message : "Deck module failed.",
    relatedRequirements: ["DLOD-003", "VINS-002", "CDIA-008"],
    repairHint:
      "Check the deck module exports and ensure createCadenzaDeck or cadenzaDeck provides a valid Deck.",
    severity: "error",
  });
}

function isCadenzaDeckMetadata(value: unknown): value is CadenzaDeckMetadata {
  return (
    typeof value === "object" &&
    value !== null &&
    "deckId" in value &&
    "outline" in value &&
    "sourcePath" in value &&
    "title" in value &&
    typeof value.deckId === "string" &&
    Array.isArray(value.outline) &&
    typeof value.sourcePath === "string" &&
    typeof value.title === "string"
  );
}
