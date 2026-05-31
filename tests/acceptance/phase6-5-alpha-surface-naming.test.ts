import { readFileSync } from "node:fs";
import path from "node:path";
import { commandRegistry, runCadenzaCli } from "@cadenza-dev/cli";
import {
  CADENZA_ALPHA_DECK_SELECTOR,
  CADENZA_ALPHA_DECK_SOURCE_PATH,
  type CadenzaDeckMetadata,
  CadenzaLocalExportError,
  findAlphaSurfaceOverclaimViolations,
  LOCAL_EXPORT_EXIT_CODES,
  LOCAL_EXPORT_SCHEMA_VERSION,
  type LocalExportManifest,
  loadDeckModule,
  readLocalExportManifest,
  resolveLocalExportRuntimeConfig,
} from "@cadenza-dev/export-local";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function readRepoText(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("Phase 6.5 alpha surface naming hygiene", () => {
  it("exposes durable CLI and local-export API names without active Phase aliases", async () => {
    expect(commandRegistry.map((command) => command.name)).toEqual([
      "export",
      "validate",
      "inspect",
    ]);
    await expect(runCadenzaCli(["--version"], repoRoot)).resolves.toMatchObject(
      {
        exitCode: 0,
        stdout: "cadenza 0.0.0\n",
      },
    );

    expect(LOCAL_EXPORT_SCHEMA_VERSION).toBe(1);
    expect(LOCAL_EXPORT_EXIT_CODES).toMatchObject({
      success: 0,
      usage: 2,
    });
    expect(resolveLocalExportRuntimeConfig({})).toMatchObject({
      outputRoot: "dist/cadenza",
      rendererTempRoot: "tmp/cadenza-render",
    });
    expect(
      findAlphaSurfaceOverclaimViolations("ready for npm publication"),
    ).toEqual([
      expect.objectContaining({
        label: "npm publication",
      }),
    ]);

    const error = new CadenzaLocalExportError(2, [
      {
        category: "usage",
        code: "EXAMPLE",
        message: "Example diagnostic",
        relatedRequirements: [],
        repairHint: "Fix the example.",
        severity: "error",
      },
    ]);
    expect(error.name).toBe("CadenzaLocalExportError");

    const typedMetadata: CadenzaDeckMetadata = {
      deckId: CADENZA_ALPHA_DECK_SELECTOR,
      outline: [],
      sourcePath: CADENZA_ALPHA_DECK_SOURCE_PATH,
      title: "Cadenza Alpha Readiness Talk",
    };
    const typedManifest = {
      command: "export",
      deck: {
        id: typedMetadata.deckId,
        sourcePath: typedMetadata.sourcePath,
        title: typedMetadata.title,
      },
      schemaVersion: LOCAL_EXPORT_SCHEMA_VERSION,
    } as LocalExportManifest;
    expect(typedManifest.deck.id).toBe(CADENZA_ALPHA_DECK_SELECTOR);
    expect(readLocalExportManifest).toEqual(expect.any(Function));

    expect(readRepoText("packages/cli/src/index.ts")).not.toMatch(
      /\brunPhase6Cli\b|\brunPhase6CliEntrypoint\b/,
    );
    expect(readRepoText("packages/export-local/src/index.ts")).not.toMatch(
      /\b(?:Phase5|Phase6|PHASE6|phase6|runPhase5CadenzaCli)\b/,
    );
    expect(readRepoText("scripts/cadenza.ts")).not.toMatch(
      /\b(?:Phase5|Phase6|legacyPhase5|runPhase5CadenzaCli|runPhase6Cli)\b/,
    );
  });

  it("uses a product-neutral canonical alpha deck and leaves Phase 5 as historical fixture only", async () => {
    const loaded = await loadDeckModule({
      cwd: repoRoot,
    });

    expect(CADENZA_ALPHA_DECK_SELECTOR).toBe("cadenza-alpha-readiness-talk");
    expect(CADENZA_ALPHA_DECK_SOURCE_PATH).toBe(
      "examples/cadenza/alpha-readiness-talk.tsx",
    );
    expect(loaded.selector).toMatchObject({
      alias: CADENZA_ALPHA_DECK_SELECTOR,
      requested: CADENZA_ALPHA_DECK_SELECTOR,
      resolvedPath: CADENZA_ALPHA_DECK_SOURCE_PATH,
      source: "built-in-alias",
    });
    expect(loaded.metadata).toMatchObject({
      deckId: CADENZA_ALPHA_DECK_SELECTOR,
      sourcePath: CADENZA_ALPHA_DECK_SOURCE_PATH,
      title: "Cadenza Alpha Readiness Talk",
    });
    expect(loaded.timeline.totalFrames).toBeGreaterThan(0);

    const activeExample = readRepoText(CADENZA_ALPHA_DECK_SOURCE_PATH);
    expect(activeExample).not.toMatch(/\b(?:Phase 5|Phase5|phase5)\b/);

    const legacy = await runCadenzaCli(
      ["validate", "phase5-alpha-readiness-talk", "--json"],
      repoRoot,
    );
    expect(legacy.exitCode).toBe(2);
    expect(JSON.parse(legacy.stdout)).toMatchObject({
      command: "validate",
      diagnostics: [
        expect.objectContaining({
          code: "DLOD_UNKNOWN_SELECTOR",
        }),
      ],
      status: "failure",
    });
  });
});
