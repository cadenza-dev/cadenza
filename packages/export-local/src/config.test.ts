import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CadenzaLocalExportError,
  ensureGeneratedOutputSafety,
  resolveLocalExportRuntimeConfig,
  validateProjectConfig,
} from "./index.ts";

describe("B6.1 Phase 6 config and path registry", () => {
  it("TC-CNFG-001 and TC-CNFG-003 centralize path defaults and apply CLI over config over registry precedence", () => {
    expect(resolveLocalExportRuntimeConfig({})).toEqual({
      defaultFormats: ["web", "mp4"],
      evidenceFilenames: {
        manifest: "manifest.json",
        mp4: "mp4-evidence.json",
        web: "web-evidence.json",
      },
      generatedOutputSafety: {
        force: false,
        prompt: false,
      },
      outputRoot: "dist/cadenza",
      rendererTempRoot: "tmp/cadenza-render",
    });

    expect(
      resolveLocalExportRuntimeConfig({
        cli: {
          defaultFormats: ["mp4"],
          force: true,
          outputRoot: "dist/from-cli",
        },
        config: {
          export: {
            defaultFormats: ["web"],
          },
          output: {
            root: "dist/from-config",
          },
        },
      }),
    ).toMatchObject({
      defaultFormats: ["mp4"],
      generatedOutputSafety: {
        force: true,
        prompt: false,
      },
      outputRoot: "dist/from-cli",
    });

    expect(
      resolveLocalExportRuntimeConfig({
        config: {
          export: {
            defaultFormats: ["web"],
          },
          output: {
            root: "dist/from-config",
          },
        },
      }),
    ).toMatchObject({
      defaultFormats: ["web"],
      outputRoot: "dist/from-config",
    });
  });

  it("TC-CNFG-004 rejects unknown config keys and invalid value shapes with structured diagnostics", () => {
    expect(() =>
      validateProjectConfig({
        decks: ["not-a-record"],
        preview: {},
      }),
    ).toThrow(CadenzaLocalExportError);

    try {
      validateProjectConfig({
        decks: ["not-a-record"],
        preview: {},
      });
    } catch (error) {
      expect(error).toBeInstanceOf(CadenzaLocalExportError);
      const localExportError = error as CadenzaLocalExportError;
      expect(localExportError.exitCode).toBe(2);
      expect(localExportError.diagnostics.map((item) => item.code)).toEqual([
        "CNFG_UNKNOWN_KEY",
        "CNFG_INVALID_VALUE",
      ]);
      expect(localExportError.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "config",
            repairHint:
              "Use only decks, output.root, and export.defaultFormats in Cadenza config.",
            severity: "error",
          }),
        ]),
      );
    }
  });

  it("TC-CNFG-005 rejects unknown existing output directories unless force is explicit", async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), "cadenza-output-safety-"),
    );
    const freshOutput = path.join(tempRoot, "fresh");
    const ownedOutput = path.join(tempRoot, "owned");
    const unknownOutput = path.join(tempRoot, "unknown");

    try {
      await mkdir(ownedOutput, { recursive: true });
      await writeFile(
        path.join(ownedOutput, ".cadenza-generated.json"),
        `${JSON.stringify({ schemaVersion: 1 })}\n`,
      );
      await mkdir(unknownOutput, { recursive: true });
      await writeFile(path.join(unknownOutput, "notes.txt"), "not cadenza\n");

      await expect(
        ensureGeneratedOutputSafety({
          force: false,
          outputDirectory: freshOutput,
        }),
      ).resolves.toMatchObject({ status: "fresh" });
      await expect(
        ensureGeneratedOutputSafety({
          force: false,
          outputDirectory: ownedOutput,
        }),
      ).resolves.toMatchObject({ status: "regenerate-owned" });
      await expect(
        ensureGeneratedOutputSafety({
          force: true,
          outputDirectory: unknownOutput,
        }),
      ).resolves.toMatchObject({ status: "force-overwrite" });
      await expect(
        ensureGeneratedOutputSafety({
          force: false,
          outputDirectory: unknownOutput,
        }),
      ).rejects.toMatchObject({
        diagnostics: [
          expect.objectContaining({
            category: "config",
            code: "CNFG_OUTPUT_OWNERSHIP",
          }),
        ],
        exitCode: 2,
      });
    } finally {
      await rm(tempRoot, { force: true, recursive: true });
    }
  });
});
