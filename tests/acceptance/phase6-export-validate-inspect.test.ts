import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { type CommandResult, runCadenzaCli } from "@cadenza-dev/cli";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const ansiEscapePrefix = `${String.fromCharCode(27)}[`;

async function runCadenza(
  args: string[],
  cwd = repoRoot,
): Promise<CommandResult> {
  return runCadenzaCli(args, cwd, repoRoot);
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function withTempRoot<T>(callback: (tempRoot: string) => Promise<T>) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "cadenza-b6-2-"));

  try {
    return await callback(tempRoot);
  } finally {
    await rm(tempRoot, { force: true, recursive: true });
  }
}

describe("B6.2 Phase 6 export, validate, and inspect commands", () => {
  it("TC-CLIS-002 and TC-EXEN-001 export a selected deck with web and MP4 evidence plus JSON summary", async () => {
    await withTempRoot(async (tempRoot) => {
      const run = await runCadenza([
        "export",
        "cadenza-alpha-readiness-talk",
        "--run-id",
        "b6-2-export",
        "--output",
        tempRoot,
        "--format",
        "web,mp4",
        "--json",
      ]);

      expect(run.exitCode).toBe(0);
      expect(run.stderr).toBe("");
      expect(run.stdout).not.toContain(ansiEscapePrefix);
      const summary = JSON.parse(run.stdout) as {
        command: string;
        diagnostics: unknown[];
        evidencePaths: Record<string, string>;
        exitCode: number;
        manifestPath: string;
        outputDirectory: string;
        status: string;
      };
      expect(summary).toMatchObject({
        command: "export",
        diagnostics: [],
        exitCode: 0,
        status: "success",
      });

      const outputDirectory = path.join(
        tempRoot,
        "cadenza-alpha-readiness-talk",
        "b6-2-export",
      );
      expect(summary.outputDirectory).toBe(outputDirectory);
      expect(summary.manifestPath).toBe(
        path.join(outputDirectory, "manifest.json"),
      );
      expect(summary.evidencePaths).toEqual({
        mp4: path.join(outputDirectory, "mp4-evidence.json"),
        web: path.join(outputDirectory, "web-evidence.json"),
      });

      const manifest = await readJson<{
        artifacts: { format?: string; path: string; role: string }[];
        command: string;
        deck: { id: string; sourcePath: string; title: string };
        deterministic: {
          capabilities: Record<string, { status: string }>;
          timelineDigest: string;
        };
        diagnostics: unknown[];
        evidence: Record<string, string>;
        formats: string[];
        outputRoot: string;
        runId: string;
        schemaVersion: number;
        selector: { alias?: string; requested: string; source: string };
        stableHash: string;
      }>(summary.manifestPath);

      expect(manifest).toMatchObject({
        command: "export",
        deck: {
          id: "cadenza-alpha-readiness-talk",
          sourcePath: "examples/cadenza/alpha-readiness-talk.tsx",
          title: "Cadenza Alpha Readiness Talk",
        },
        diagnostics: [],
        evidence: {
          mp4: "mp4-evidence.json",
          web: "web-evidence.json",
        },
        formats: ["web", "mp4"],
        outputRoot: tempRoot,
        runId: "b6-2-export",
        schemaVersion: 1,
        selector: {
          alias: "cadenza-alpha-readiness-talk",
          requested: "cadenza-alpha-readiness-talk",
          source: "built-in-alias",
        },
      });
      expect(manifest.stableHash).toMatch(/^[a-f0-9]{64}$/);
      expect(manifest.deterministic.timelineDigest).toMatch(/^[a-f0-9]{64}$/);
      expect(manifest.deterministic.capabilities).toMatchObject({
        mp4: { status: "supported" },
        web: { status: "supported" },
      });
      expect(manifest.artifacts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            format: "mp4",
            path: "cadenza-alpha-readiness-talk.mp4",
            role: "mp4-render",
          }),
          expect.objectContaining({
            format: "web",
            path: "index.html",
            role: "web-entrypoint",
          }),
          expect.objectContaining({
            format: "web",
            path: "web-evidence.json",
            role: "format-evidence",
          }),
          expect.objectContaining({
            format: "mp4",
            path: "mp4-evidence.json",
            role: "format-evidence",
          }),
        ]),
      );

      const webEvidence = await readJson<{
        artifacts: { path: string; role: string }[];
        format: string;
        schemaVersion: number;
        status: string;
      }>(summary.evidencePaths.web);
      const mp4Evidence = await readJson<{
        artifacts: { path: string; role: string }[];
        format: string;
        knownLimitations: string[];
        schemaVersion: number;
        status: string;
      }>(summary.evidencePaths.mp4);

      expect(webEvidence).toMatchObject({
        format: "web",
        schemaVersion: 1,
        status: "supported",
      });
      expect(webEvidence.artifacts).toEqual([
        expect.objectContaining({ path: "index.html", role: "entrypoint" }),
      ]);
      expect(mp4Evidence).toMatchObject({
        artifacts: [
          expect.objectContaining({
            path: "cadenza-alpha-readiness-talk.mp4",
            role: "mp4-render",
          }),
        ],
        format: "mp4",
        schemaVersion: 1,
        status: "supported",
      });
      expect(mp4Evidence.knownLimitations.join("\n")).toContain("local-only");
    });
  }, 60_000);

  it("TC-CLIS-003, TC-VINS-001, and TC-VINS-002 validate selectors without writing export deliverables", async () => {
    await withTempRoot(async (projectRoot) => {
      const deckPath = path.join(
        repoRoot,
        "examples/cadenza/alpha-readiness-talk.tsx",
      );
      const relativeDeckPath = path.relative(projectRoot, deckPath);
      const outputRoot = path.join(projectRoot, "dist", "validate-output");

      await writeFile(
        path.join(projectRoot, "cadenza.config.ts"),
        `import { defineConfig } from "@cadenza-dev/cli";

export default defineConfig({
  decks: {
    "project-talk": ${JSON.stringify(relativeDeckPath)},
  },
  output: {
    root: ${JSON.stringify(outputRoot)},
  },
  export: {
    defaultFormats: ["web", "mp4"],
  },
});
`,
      );
      await writeFile(
        path.join(projectRoot, "invalid.deck.tsx"),
        `import { Deck, Slide, Step } from "@cadenza-dev/core";

export const cadenzaDeckMetadata = {
  deckId: "invalid-talk",
  outline: [{ slideId: "duplicate", title: "Duplicate" }],
  sourcePath: "invalid.deck.tsx",
  title: "Invalid Talk",
};

export function createCadenzaDeck() {
  return (
    <Deck fps={24} navigationPolicy="queue-next">
      <Slide id="duplicate"><Step duration="1s">First</Step></Slide>
      <Slide id="duplicate"><Step duration="1s">Second</Step></Slide>
    </Deck>
  );
}
`,
      );

      const cases = [
        ["validate", "cadenza-alpha-readiness-talk", "--json"],
        ["validate", "project-talk", "--json"],
        ["validate", "--json"],
        ["validate", relativeDeckPath, "--json"],
      ];

      for (const args of cases) {
        const run = await runCadenza(args, projectRoot);
        expect(run.exitCode).toBe(0);
        expect(run.stderr).toBe("");
        const summary = JSON.parse(run.stdout) as {
          deckId: string;
          diagnostics: unknown[];
          status: string;
          timeline: { digest: string; slideCount: number; totalFrames: number };
        };
        expect(summary).toMatchObject({
          deckId: "cadenza-alpha-readiness-talk",
          diagnostics: [],
          status: "success",
        });
        expect(summary.timeline.digest).toMatch(/^[a-f0-9]{64}$/);
        expect(summary.timeline.slideCount).toBeGreaterThan(0);
        expect(summary.timeline.totalFrames).toBeGreaterThan(0);
      }

      await expect(access(outputRoot)).rejects.toMatchObject({
        code: "ENOENT",
      });

      const invalid = await runCadenza(
        ["validate", "./invalid.deck.tsx", "--json"],
        projectRoot,
      );
      expect(invalid.exitCode).toBe(3);
      expect(invalid.stderr).toBe("");
      const failure = JSON.parse(invalid.stdout) as {
        diagnostics: { category: string; code: string; repairHint: string }[];
        status: string;
      };
      expect(failure).toMatchObject({
        status: "failure",
      });
      expect(failure.diagnostics).toEqual([
        expect.objectContaining({
          category: "validation",
          code: "VINS_COMPILE_FAILED",
          repairHint:
            "Fix the authored deck diagnostics before running export or validate again.",
        }),
      ]);
    });
  });

  it("TC-CLIS-004, TC-VINS-003, TC-VINS-004, and TC-EXEN-005 inspect artifacts through the shared reader", async () => {
    await withTempRoot(async (tempRoot) => {
      const exported = await runCadenza([
        "export",
        "cadenza-alpha-readiness-talk",
        "--run-id",
        "b6-2-inspect",
        "--output",
        tempRoot,
        "--format",
        "web",
        "--json",
      ]);
      const exportSummary = JSON.parse(exported.stdout) as {
        manifestPath: string;
        outputDirectory: string;
      };

      for (const inputPath of [
        exportSummary.manifestPath,
        exportSummary.outputDirectory,
      ]) {
        const inspected = await runCadenza(["inspect", inputPath, "--json"]);
        expect(inspected.exitCode).toBe(0);
        expect(inspected.stderr).toBe("");
        const summary = JSON.parse(inspected.stdout) as {
          artifactCount: number;
          deckId: string;
          evidenceFormats: string[];
          formats: string[];
          status: string;
        };

        expect(summary).toMatchObject({
          deckId: "cadenza-alpha-readiness-talk",
          evidenceFormats: ["web"],
          formats: ["web"],
          status: "success",
        });
        expect(summary.artifactCount).toBeGreaterThanOrEqual(2);
      }

      const artifactOnlyDirectory = path.join(tempRoot, "artifact-only");
      await mkdir(artifactOnlyDirectory, { recursive: true });
      await writeFile(
        path.join(artifactOnlyDirectory, "manifest.json"),
        `${JSON.stringify(
          {
            artifacts: [],
            capabilities: {
              web: {
                description: "Fixture web capability.",
                futureReusableConcepts: ["artifact inventory"],
                status: "supported",
              },
            },
            command: "export",
            deck: {
              id: "artifact-only-talk",
              sourcePath: "missing/source.tsx",
              title: "Artifact Only Talk",
            },
            deterministic: {
              capabilities: {},
              configDefaults: {
                defaultFormats: ["web"],
                evidenceFilenames: {
                  manifest: "manifest.json",
                  mp4: "mp4-evidence.json",
                  web: "web-evidence.json",
                },
              },
              formatSelection: ["web"],
              timeline: {
                fps: 24,
                navigationPolicy: "queue-next",
                slideCount: 0,
                slides: [],
                totalFrames: 0,
              },
              timelineDigest:
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            },
            diagnostics: [],
            evidence: {
              web: "web-evidence.json",
            },
            formats: ["web"],
            knownLimitations: [],
            outputDirectory: artifactOnlyDirectory,
            outputRoot: tempRoot,
            runId: "artifact-only",
            schemaVersion: 1,
            selector: {
              requested: "artifact-only",
              resolvedPath: "missing/source.tsx",
              source: "explicit-path",
            },
            stableHash:
              "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
            volatile: {
              generatedAt: "2026-05-30T00:00:00.000Z",
              outputDirectory: artifactOnlyDirectory,
              selectorProvenance: {
                absolutePath: path.join(tempRoot, "missing", "source.tsx"),
              },
            },
          },
          null,
          2,
        )}\n`,
      );
      await writeFile(
        path.join(artifactOnlyDirectory, "web-evidence.json"),
        `${JSON.stringify(
          {
            artifacts: [],
            capability: {
              description: "Fixture web capability.",
              futureReusableConcepts: ["artifact inventory"],
              status: "supported",
            },
            diagnostics: [],
            format: "web",
            knownLimitations: [],
            schemaVersion: 1,
            status: "supported",
          },
          null,
          2,
        )}\n`,
      );

      const artifactOnly = await runCadenza([
        "inspect",
        artifactOnlyDirectory,
        "--json",
      ]);
      expect(artifactOnly.exitCode).toBe(0);
      expect(JSON.parse(artifactOnly.stdout)).toMatchObject({
        deckId: "artifact-only-talk",
        status: "success",
      });

      const malformedDirectory = path.join(tempRoot, "malformed");
      await mkdir(malformedDirectory);
      await writeFile(path.join(malformedDirectory, "manifest.json"), "{\n");
      const malformed = await runCadenza([
        "inspect",
        malformedDirectory,
        "--json",
      ]);
      expect(malformed.exitCode).toBe(2);
      expect(malformed.stderr).toBe("");
      expect(JSON.parse(malformed.stdout)).toMatchObject({
        diagnostics: [
          expect.objectContaining({
            category: "inspect",
            code: "VINS_MALFORMED_MANIFEST",
          }),
        ],
        status: "failure",
      });

      const unsupportedDirectory = path.join(tempRoot, "unsupported");
      await mkdir(unsupportedDirectory);
      await writeFile(
        path.join(unsupportedDirectory, "manifest.json"),
        `${JSON.stringify({
          command: "export",
          schemaVersion: 99,
        })}\n`,
      );
      const unsupported = await runCadenza([
        "inspect",
        unsupportedDirectory,
        "--json",
      ]);
      expect(JSON.parse(unsupported.stdout)).toMatchObject({
        diagnostics: [
          expect.objectContaining({
            code: "EXEN_UNSUPPORTED_MANIFEST_SCHEMA",
          }),
        ],
        status: "failure",
      });

      const missingEvidenceDirectory = path.join(tempRoot, "missing-evidence");
      await mkdir(missingEvidenceDirectory);
      await writeFile(
        path.join(missingEvidenceDirectory, "manifest.json"),
        `${JSON.stringify({
          command: "export",
          deck: {
            id: "missing-evidence",
            sourcePath: "deck.tsx",
            title: "Missing Evidence",
          },
          evidence: { web: "web-evidence.json" },
          formats: ["web"],
          schemaVersion: 1,
          stableHash:
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        })}\n`,
      );
      const missingEvidence = await runCadenza([
        "inspect",
        missingEvidenceDirectory,
        "--json",
      ]);
      expect(JSON.parse(missingEvidence.stdout)).toMatchObject({
        diagnostics: [
          expect.objectContaining({
            code: "VINS_MISSING_EVIDENCE",
          }),
        ],
        status: "failure",
      });
    });
  });

  it("TC-EXEN-001, TC-EXEN-002, and TC-EXEN-004 preserve deterministic manifest hash scope across roots and aliases", async () => {
    await withTempRoot(async (tempRoot) => {
      const projectRoot = path.join(tempRoot, "project");
      const configRoot = path.join(tempRoot, "config-output");
      const cliRoot = path.join(tempRoot, "cli-output");
      await mkdir(projectRoot);
      await writeFile(
        path.join(projectRoot, "cadenza.config.ts"),
        `import { defineConfig } from "@cadenza-dev/cli";

export default defineConfig({
  decks: {
    "project-talk": ${JSON.stringify(
      path.relative(
        projectRoot,
        path.join(repoRoot, "examples/cadenza/alpha-readiness-talk.tsx"),
      ),
    )},
  },
  output: {
    root: ${JSON.stringify(configRoot)},
  },
  export: {
    defaultFormats: ["web", "mp4"],
  },
});
`,
      );

      const builtIn = await runCadenza([
        "export",
        "cadenza-alpha-readiness-talk",
        "--run-id",
        "built-in",
        "--output",
        path.join(tempRoot, "built-in-output"),
        "--format",
        "web",
        "--json",
      ]);
      const configAlias = await runCadenza(
        [
          "export",
          "project-talk",
          "--run-id",
          "config-alias",
          "--format",
          "web",
          "--json",
        ],
        projectRoot,
      );
      const cliOverride = await runCadenza(
        [
          "export",
          "project-talk",
          "--run-id",
          "cli-override",
          "--output",
          cliRoot,
          "--format",
          "web",
          "--json",
        ],
        projectRoot,
      );
      const mp4Only = await runCadenza([
        "export",
        "cadenza-alpha-readiness-talk",
        "--run-id",
        "mp4-only",
        "--output",
        path.join(tempRoot, "mp4-only-output"),
        "--format",
        "mp4",
        "--json",
      ]);

      const summaries = [builtIn, configAlias, cliOverride, mp4Only].map(
        (run) =>
          JSON.parse(run.stdout) as {
            manifestPath: string;
            outputDirectory: string;
            stableHash: string;
          },
      );
      const manifests = await Promise.all(
        summaries.map((summary) =>
          readJson<{
            formats: string[];
            outputRoot: string;
            selector: { source: string };
            stableHash: string;
          }>(summary.manifestPath),
        ),
      );

      expect(summaries[1]?.outputDirectory).toBe(
        path.join(configRoot, "cadenza-alpha-readiness-talk", "config-alias"),
      );
      expect(summaries[2]?.outputDirectory).toBe(
        path.join(cliRoot, "cadenza-alpha-readiness-talk", "cli-override"),
      );
      expect(manifests[1]).toMatchObject({
        outputRoot: configRoot,
        selector: { source: "config-alias" },
      });
      expect(manifests[2]).toMatchObject({
        outputRoot: cliRoot,
        selector: { source: "config-alias" },
      });
      expect(manifests[0]?.stableHash).toBe(manifests[1]?.stableHash);
      expect(manifests[0]?.stableHash).toBe(manifests[2]?.stableHash);
      expect(manifests[3]?.formats).toEqual(["mp4"]);
      expect(manifests[3]?.stableHash).not.toBe(manifests[0]?.stableHash);
    });
  }, 60_000);

  it("TC-CLIS-006, TC-CLIS-007, TC-CDIA-001, TC-CDIA-002, and TC-CDIA-003 keep JSON failures deterministic and require --force for unknown output reuse", async () => {
    await withTempRoot(async (tempRoot) => {
      const occupiedOutput = path.join(
        tempRoot,
        "cadenza-alpha-readiness-talk",
        "occupied",
      );
      await mkdir(occupiedOutput, { recursive: true });
      await writeFile(path.join(occupiedOutput, "notes.txt"), "not cadenza\n");

      const blocked = await runCadenza([
        "export",
        "cadenza-alpha-readiness-talk",
        "--run-id",
        "occupied",
        "--output",
        tempRoot,
        "--json",
      ]);
      expect(blocked.exitCode).toBe(2);
      expect(blocked.stderr).toBe("");
      expect(blocked.stdout).not.toContain(ansiEscapePrefix);
      expect(blocked.stdout).not.toMatch(/prompt|continue|confirm/i);
      expect(JSON.parse(blocked.stdout)).toMatchObject({
        command: "export",
        diagnostics: [
          expect.objectContaining({
            category: "config",
            code: "CNFG_OUTPUT_OWNERSHIP",
          }),
        ],
        exitCode: 2,
        status: "failure",
      });

      const forced = await runCadenza([
        "export",
        "cadenza-alpha-readiness-talk",
        "--run-id",
        "occupied",
        "--output",
        tempRoot,
        "--format",
        "web",
        "--force",
        "--json",
      ]);
      expect(forced.exitCode).toBe(0);
      expect(JSON.parse(forced.stdout)).toMatchObject({
        command: "export",
        status: "success",
      });

      const badOption = await runCadenza([
        "validate",
        "--definitely-nope",
        "--json",
      ]);
      expect(badOption.exitCode).toBe(2);
      expect(badOption.stderr).toBe("");
      expect(JSON.parse(badOption.stdout)).toMatchObject({
        command: "validate",
        diagnostics: [
          expect.objectContaining({
            category: "usage",
            code: "CLIS_UNKNOWN_OPTION",
          }),
        ],
        status: "failure",
      });
    });
  });
});
