import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
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

async function readRepoJson<T>(relativePath: string): Promise<T> {
  return readJson(path.join(repoRoot, relativePath));
}

async function withTempRoot<T>(callback: (tempRoot: string) => Promise<T>) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "cadenza-b6-4-"));

  try {
    return await callback(tempRoot);
  } finally {
    await rm(tempRoot, { force: true, recursive: true });
  }
}

describe("B6.4 Phase 6 local MP4 rendering", () => {
  it("TC-VIDO-001 and TC-VIDO-002 render the canonical deck through the local MP4 adapter with evidence", async () => {
    await withTempRoot(async (tempRoot) => {
      const exported = await runCadenza([
        "export",
        "cadenza-alpha-readiness-talk",
        "--run-id",
        "b6-4-mp4",
        "--output",
        tempRoot,
        "--format",
        "mp4",
        "--json",
      ]);

      expect(exported.exitCode).toBe(0);
      expect(exported.stderr).toBe("");
      const summary = JSON.parse(exported.stdout) as {
        evidencePaths: { mp4: string };
        manifestPath: string;
        outputDirectory: string;
      };
      const manifest = await readJson<{
        artifacts: Array<{ format?: string; path: string; role: string }>;
        capabilities: { mp4: { status: string } };
        formats: string[];
      }>(summary.manifestPath);
      const mp4Evidence = await readJson<{
        artifacts: Array<{
          byteSize: number;
          path: string;
          role: string;
          sha256: string;
        }>;
        cleanup: {
          status: string;
          tempDirectories: string[];
        };
        composition: {
          durationInFrames: number;
          fps: number;
          height: number;
          width: number;
        };
        diagnostics: unknown[];
        format: string;
        knownLimitations: string[];
        localPrerequisites: Array<{
          name: string;
          status: string;
        }>;
        rendererProvenance: {
          adapterName: string;
          implementationFamily: string;
          packageName: string;
        };
        schemaVersion: number;
        status: string;
      }>(summary.evidencePaths.mp4);

      expect(manifest.formats).toEqual(["mp4"]);
      expect(manifest.capabilities.mp4.status).toBe("supported");
      expect(manifest.artifacts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            format: "mp4",
            path: "cadenza-alpha-readiness-talk.mp4",
            role: "mp4-render",
          }),
        ]),
      );
      expect(mp4Evidence).toMatchObject({
        cleanup: {
          status: "completed",
        },
        composition: {
          fps: 24,
          height: expect.any(Number),
          width: expect.any(Number),
        },
        diagnostics: [],
        format: "mp4",
        rendererProvenance: {
          adapterName: "local-mp4-renderer",
          implementationFamily: "remotion-renderer-api",
          packageName: "@cadenza-dev/export-local",
        },
        schemaVersion: 1,
        status: "supported",
      });
      expect(mp4Evidence.composition.durationInFrames).toBeGreaterThan(0);
      expect(mp4Evidence.localPrerequisites).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "browser", status: "available" }),
          expect.objectContaining({ name: "ffmpeg", status: "available" }),
          expect.objectContaining({
            name: "remotion-renderer",
            status: "available",
          }),
        ]),
      );
      expect(mp4Evidence.cleanup.tempDirectories).toEqual(
        expect.arrayContaining([expect.stringContaining("tmp/cadenza-render")]),
      );
      expect(mp4Evidence.knownLimitations.join("\n")).toContain("local-only");
      expect(mp4Evidence.knownLimitations.join("\n")).not.toMatch(
        /lambda|hosted|cloud queue|remote account|npm publication/i,
      );

      const artifact = mp4Evidence.artifacts[0];
      expect(artifact).toMatchObject({
        path: "cadenza-alpha-readiness-talk.mp4",
        role: "mp4-render",
      });
      expect(artifact?.byteSize).toBeGreaterThan(1_000);
      expect(artifact?.sha256).toMatch(/^[a-f0-9]{64}$/);

      const bytes = await readFile(
        path.join(summary.outputDirectory, "cadenza-alpha-readiness-talk.mp4"),
      );
      expect(bytes.subarray(0, 128).includes(Buffer.from("ftyp"))).toBe(true);
    });
  }, 60_000);

  it("TC-VIDO-004 routes missing local renderer prerequisites through diagnostics and failure evidence", async () => {
    await withTempRoot(async (tempRoot) => {
      const previousBrowserExecutable =
        process.env.CADENZA_REMOTION_BROWSER_EXECUTABLE;
      const missingBrowser = path.join(tempRoot, "missing-browser");

      process.env.CADENZA_REMOTION_BROWSER_EXECUTABLE = missingBrowser;

      try {
        const failed = await runCadenza([
          "export",
          "cadenza-alpha-readiness-talk",
          "--run-id",
          "b6-4-missing-browser",
          "--output",
          tempRoot,
          "--format",
          "mp4",
          "--json",
        ]);

        expect(failed.stderr).toBe("");
        expect(failed.exitCode).toBe(5);
        const summary = JSON.parse(failed.stdout) as {
          diagnostics: Array<{
            category: string;
            code: string;
            locator?: string;
            repairHint: string;
          }>;
          status: string;
        };
        expect(summary).toMatchObject({
          diagnostics: [
            {
              category: "environment",
              code: "VIDO_BROWSER_UNAVAILABLE",
              locator: missingBrowser,
            },
          ],
          status: "failure",
        });
        expect(summary.diagnostics[0]?.repairHint).toContain(
          "CADENZA_REMOTION_BROWSER_EXECUTABLE",
        );

        const outputDirectory = path.join(
          tempRoot,
          "cadenza-alpha-readiness-talk",
          "b6-4-missing-browser",
        );
        const mp4Evidence = await readJson<{
          artifacts: unknown[];
          cleanup: {
            status: string;
            tempDirectories: string[];
          };
          diagnostics: Array<{
            category: string;
            code: string;
            locator?: string;
          }>;
          localPrerequisites: Array<{
            detail?: string;
            name: string;
            status: string;
          }>;
          status: string;
        }>(path.join(outputDirectory, "mp4-evidence.json"));

        expect(mp4Evidence).toMatchObject({
          artifacts: [],
          cleanup: {
            status: "completed",
          },
          diagnostics: [
            {
              category: "environment",
              code: "VIDO_BROWSER_UNAVAILABLE",
              locator: missingBrowser,
            },
          ],
          status: "unsupported",
        });
        expect(mp4Evidence.localPrerequisites).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              detail: missingBrowser,
              name: "browser",
              status: "missing",
            }),
          ]),
        );
        expect(mp4Evidence.cleanup.tempDirectories).toEqual(
          expect.arrayContaining([
            expect.stringContaining("tmp/cadenza-render"),
          ]),
        );
      } finally {
        if (previousBrowserExecutable === undefined) {
          delete process.env.CADENZA_REMOTION_BROWSER_EXECUTABLE;
        } else {
          process.env.CADENZA_REMOTION_BROWSER_EXECUTABLE =
            previousBrowserExecutable;
        }
      }
    });
  });

  it("TC-DBND-001, TC-DBND-002, TC-DBND-003, TC-DBND-004, and TC-DBND-005 isolate renderer dependencies behind export-local adapter code", async () => {
    const coreManifest = await readRepoJson<{
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    }>("packages/core/package.json");
    const cliManifest = await readRepoJson<{
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    }>("packages/cli/package.json");
    const exportLocalManifest = await readRepoJson<{
      dependencies?: Record<string, string>;
    }>("packages/export-local/package.json");
    const previewManifest = await readRepoJson<{
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    }>("packages/preview-remotion/package.json");

    expect(packageDependencyNames(coreManifest)).not.toEqual(
      expect.arrayContaining(rendererDependencyNames()),
    );
    expect(packageDependencyNames(cliManifest)).not.toEqual(
      expect.arrayContaining(rendererDependencyNames()),
    );
    expect(packageDependencyNames(previewManifest)).not.toEqual(
      expect.arrayContaining(["@remotion/bundler", "@remotion/renderer"]),
    );
    expect(packageDependencyNames(exportLocalManifest)).toEqual(
      expect.arrayContaining([
        "@remotion/bundler",
        "@remotion/renderer",
        "remotion",
      ]),
    );

    const coreSource = await readSourceFiles("packages/core/src");
    const cliSource = await readSourceFiles("packages/cli/src");
    const previewSource = await readSourceFiles(
      "packages/preview-remotion/src",
    );
    const exportLocalSource = await readSourceFiles(
      "packages/export-local/src",
    );

    expect(joinSource(coreSource)).not.toMatch(rendererBoundaryPattern());
    expect(joinSource(cliSource)).not.toMatch(rendererBoundaryPattern());
    expect(joinSource(previewSource)).not.toMatch(
      /@remotion\/(?:bundler|renderer)|mp4Renderer|renderLocalMp4|renderMedia|bundle\(/,
    );
    expect(
      exportLocalSource
        .filter((file) => rendererBoundaryPattern().test(file.contents))
        .map((file) => file.relativePath),
    ).toEqual(["packages/export-local/src/mp4Renderer.ts"]);
    expect(joinSource(exportLocalSource)).not.toMatch(/CadenzaPlayer/);
  });
});

type SourceFile = {
  contents: string;
  relativePath: string;
};

async function readSourceFiles(relativeDir: string): Promise<SourceFile[]> {
  const absoluteDir = path.join(repoRoot, relativeDir);
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  const sources = await Promise.all(
    entries.map(async (entry): Promise<SourceFile[]> => {
      const absoluteChild = path.join(absoluteDir, entry.name);
      const relativeChild = path.relative(repoRoot, absoluteChild);

      if (entry.isDirectory()) {
        return readSourceFiles(relativeChild);
      }
      if (
        !entry.isFile() ||
        !(entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) ||
        entry.name.endsWith(".test.ts") ||
        entry.name.endsWith(".test.tsx")
      ) {
        return [];
      }

      return [
        {
          contents: await readFile(absoluteChild, "utf8"),
          relativePath: toPortablePath(relativeChild),
        },
      ];
    }),
  );

  return sources
    .flat()
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function packageDependencyNames(manifest: {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}): string[] {
  return [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ].sort();
}

function rendererDependencyNames(): string[] {
  return ["@remotion/bundler", "@remotion/renderer", "remotion"];
}

function rendererBoundaryPattern(): RegExp {
  return /@remotion\/(?:bundler|renderer)|from "remotion"|renderMedia|bundle\(/;
}

function joinSource(files: SourceFile[]): string {
  return files.map((file) => file.contents).join("\n");
}

function toPortablePath(value: string): string {
  return value.split(path.sep).join("/");
}
