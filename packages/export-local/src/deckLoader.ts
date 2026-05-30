import { access, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import {
  compile,
  type DeckNode,
  type TimelineMap,
} from "../../core/src/index.ts";
import { type CadenzaProjectConfig, validateProjectConfig } from "./config.ts";
import { phase6Error } from "./diagnostics.ts";

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

export type Phase6DeckMetadata = {
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
  metadata: Phase6DeckMetadata;
  selector: LoadedDeckSelector;
  timeline: TimelineMap;
};

export type LoadDeckModuleOptions = {
  cwd: string;
  selector?: string;
  workspaceRoot?: string;
};

const BUILT_IN_DECK_ALIASES = {
  "phase5-alpha-readiness-talk": "examples/phase5/alpha-readiness-talk.tsx",
} as const;

export async function loadDeckModule({
  cwd,
  selector,
  workspaceRoot = cwd,
}: LoadDeckModuleOptions): Promise<LoadedDeckModule> {
  const projectConfig = await loadProjectConfig({ cwd, workspaceRoot });
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
  const metadata = readDeckMetadata(bundled, resolved.resolvedPath);
  const deck = readDeckValue(bundled, resolved.resolvedPath);

  return {
    contractExports: ["cadenzaDeckMetadata", "createCadenzaDeck"],
    deck,
    metadata,
    selector: resolved,
    timeline: compile(deck, { mode: "offline" }),
  };
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

  return resolveBuiltInDeck(workspaceRoot, "phase5-alpha-readiness-talk");
}

function resolveBuiltInDeck(
  workspaceRoot: string,
  selector: string,
): LoadedDeckSelector {
  const sourcePath =
    BUILT_IN_DECK_ALIASES[selector as keyof typeof BUILT_IN_DECK_ALIASES];

  if (sourcePath === undefined) {
    throw phase6Error(2, {
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

async function loadProjectConfig({
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
): Phase6DeckMetadata {
  const metadata = moduleExports.cadenzaDeckMetadata;

  if (!isPhase6DeckMetadata(metadata)) {
    throw new Error(
      `Deck module ${resolvedPath} must export valid cadenzaDeckMetadata.`,
    );
  }

  return metadata;
}

function readDeckValue(
  moduleExports: Record<string, unknown>,
  resolvedPath: string,
): DeckNode {
  const createDeck = moduleExports.createCadenzaDeck;

  if (typeof createDeck !== "function") {
    throw new Error(
      `Deck module ${resolvedPath} must export createCadenzaDeck().`,
    );
  }

  return createDeck() as DeckNode;
}

function isPhase6DeckMetadata(value: unknown): value is Phase6DeckMetadata {
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
