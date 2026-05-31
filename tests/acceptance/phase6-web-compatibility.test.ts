import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { type CommandResult, runCadenzaCli } from "@cadenza-dev/cli";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

async function runCadenza(args: string[]): Promise<CommandResult> {
  return runCadenzaCli(args, repoRoot);
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function withTempRoot<T>(callback: (tempRoot: string) => Promise<T>) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "cadenza-b6-3-"));

  try {
    return await callback(tempRoot);
  } finally {
    await rm(tempRoot, { force: true, recursive: true });
  }
}

describe("B6.3 Phase 6 static web compatibility", () => {
  it("TC-WEBC-001 writes an inspectable static compatibility entrypoint and web evidence", async () => {
    await withTempRoot(async (tempRoot) => {
      const exported = await runCadenza([
        "export",
        "cadenza-alpha-readiness-talk",
        "--run-id",
        "b6-3-web",
        "--output",
        tempRoot,
        "--format",
        "web",
        "--json",
      ]);

      expect(exported.exitCode).toBe(0);
      const summary = JSON.parse(exported.stdout) as {
        evidencePaths: { web: string };
        outputDirectory: string;
      };
      const indexHtml = await readFile(
        path.join(summary.outputDirectory, "index.html"),
        "utf8",
      );
      const webEvidence = await readJson<{
        adapterProvenance: {
          adapterName: string;
          packageName: string;
          publicContract: string;
        };
        browserSmoke: {
          primaryOracle: string;
          screenshotOrPixelEvidence: string;
          status: string;
          testPath: string;
        };
        compatibilityMode: string;
        entrypointPath: string;
        knownLimitations: string[];
        manifestReference: {
          embeddedElementId: string;
          path: string;
        };
        semanticAnchors: Array<{
          order: number;
          segment: [number, number];
          slideId: string;
        }>;
        timingEvidence: {
          offlineTiming: {
            status: string;
            unexpectedMismatches: unknown[];
          };
          transitions: {
            status: string;
            unexpectedMismatches: unknown[];
          };
        };
      }>(summary.evidencePaths.web);

      expect(indexHtml).toContain("data-cadenza-static-web-compatibility");
      expect(indexHtml).toContain('data-cadenza-player-app-export="false"');
      expect(indexHtml).toContain(
        'data-cadenza-web-primary-oracle="semantic-browser-smoke"',
      );
      expect(indexHtml).toContain('id="cadenza-export-manifest-reference"');
      expect(indexHtml).toContain(
        'data-cadenza-semantic-anchor="local-alpha-contract"',
      );
      expect(indexHtml).toContain('data-cadenza-notes-boundary="excluded"');
      expect(indexHtml).not.toContain(
        "Open by naming the local alpha candidate as reviewable infrastructure",
      );

      expect(webEvidence).toMatchObject({
        adapterProvenance: {
          adapterName: "static-web-compatibility",
          packageName: "@cadenza-dev/export-local",
          publicContract: "StaticWebCompatibilityAdapter",
        },
        browserSmoke: {
          primaryOracle: "semantic-browser-smoke",
          screenshotOrPixelEvidence: "supplemental-only",
          status: "covered-by-tests",
          testPath:
            "tests/browser/local-export-static-web-compatibility.spec.ts",
        },
        compatibilityMode: "static-web-compatibility",
        entrypointPath: "index.html",
        manifestReference: {
          embeddedElementId: "cadenza-export-manifest-reference",
          path: "manifest.json",
        },
      });
      expect(
        webEvidence.semanticAnchors.map((anchor) => anchor.slideId),
      ).toEqual([
        "local-alpha-contract",
        "product-layer-to-local-export",
        "local-export-command",
        "deterministic-manifest",
        "evidence-gates",
        "alpha-boundaries",
      ]);
      expect(webEvidence.semanticAnchors.map((anchor) => anchor.order)).toEqual(
        [0, 1, 2, 3, 4, 5],
      );
      expect(
        webEvidence.semanticAnchors.every(
          (anchor) =>
            Array.isArray(anchor.segment) &&
            anchor.segment.length === 2 &&
            anchor.segment[1] > anchor.segment[0],
        ),
      ).toBe(true);
      expect(webEvidence.timingEvidence.offlineTiming).toEqual({
        status: "passed-with-allowed-deltas",
        unexpectedMismatches: [],
      });
      expect(webEvidence.timingEvidence.transitions).toEqual({
        status: "passed-with-allowed-deltas",
        unexpectedMismatches: [],
      });
      expect(webEvidence.knownLimitations.join("\n")).toContain(
        "not the future Player App export",
      );
      expect(webEvidence.knownLimitations.join("\n")).toContain("not hosted");
      expect(webEvidence.knownLimitations.join("\n")).toContain(
        "not a polished app shell",
      );
      expect(JSON.stringify(webEvidence)).not.toContain("historical helper");
    });
  });
});
