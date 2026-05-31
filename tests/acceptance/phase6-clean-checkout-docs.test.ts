import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  exportDeckLocal,
  findAlphaSurfaceOverclaimViolations,
} from "@cadenza-dev/export-local";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const walkthroughPath = path.join(repoRoot, "docs", "local-export.md");

async function readRepoText(relativePath: string): Promise<string> {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

function expectAll(text: string, snippets: string[]): void {
  for (const snippet of snippets) {
    expect(text).toContain(snippet);
  }
}

describe("B6.5 Phase 6 clean-checkout documentation", () => {
  it("TC-CDOC-001 documents the clean-checkout local export workflow and evidence contract", async () => {
    const readme = await readRepoText("README.md");
    const walkthrough = await readFile(walkthroughPath, "utf8");

    expect(readme).toContain("[`docs/local-export.md`]");
    expect(readme).toContain("Cadenza local export");
    expect(readme).not.toContain("docs/local-export.md#generated-transcript");
    expect(readme).toMatch(
      /The preview adapter keeps Remotion Player integration behind peer\s+dependencies\./,
    );
    expect(readme).toMatch(
      /`@cadenza-dev\/export-local` declares direct local\s+renderer\s+dependencies/,
    );
    expect(readme).not.toContain(
      "Cadenza does not redistribute Remotion; it depends on it as a peer dependency.",
    );

    expectAll(walkthrough, [
      "# Cadenza Local Export Walkthrough",
      "pnpm install",
      "pnpm cadenza --help",
      "pnpm cadenza --version",
      "pnpm cadenza validate cadenza-alpha-readiness-talk --json",
      "pnpm cadenza export cadenza-alpha-readiness-talk --run-id local-web --format web",
      "pnpm cadenza export cadenza-alpha-readiness-talk --run-id local-mp4 --format mp4",
      "pnpm cadenza inspect dist/cadenza/cadenza-alpha-readiness-talk/local-web/manifest.json --json",
      "dist/cadenza/<deck-id>/<run-id>/",
      "manifest.json",
      "web-evidence.json",
      "mp4-evidence.json",
      "index.html",
      "cadenza-alpha-readiness-talk.mp4",
      "local deck modules and `cadenza.config.ts` are trusted local code",
      "No sandbox is provided by the local export workflow.",
      "Node.js",
      "pnpm",
      "Remotion renderer",
      "browser executable",
      "ffmpeg",
      "local-only",
      "renderer adapter boundary",
      "renderer provenance",
      "temporary renderer state",
      "`--json`",
      "no prompts",
      "`--force`",
      "`defineConfig`",
      "decks",
      "output.root",
      "export.defaultFormats",
      "CLI flags override config",
      "schemaVersion",
      "stableHash",
      "selector",
      "artifacts",
      "capabilities",
      "knownLimitations",
      "rendererProvenance",
      "localPrerequisites",
      "cleanup",
      "compatibility export",
      "not the future Player App web export",
      "compatibility adapter boundary",
      "semantic browser smoke",
      "future work",
    ]);
  });

  it("TC-CDOC-002 guards docs and generated evidence summaries against Phase 6 overclaims", async () => {
    const readme = await readRepoText("README.md");
    const walkthrough = await readFile(walkthroughPath, "utf8");
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "cadenza-b6-5-"));

    try {
      const exportResult = await exportDeckLocal({
        cwd: repoRoot,
        formats: ["web"],
        outputRoot: tempRoot,
        runId: "overclaim-guard",
        selector: "cadenza-alpha-readiness-talk",
        workspaceRoot: repoRoot,
      });
      const manifestText = JSON.stringify(exportResult.manifest, null, 2);
      const webEvidenceText = await readFile(
        exportResult.evidencePaths.web ?? "",
        "utf8",
      );

      expect(
        findAlphaSurfaceOverclaimViolations(
          [
            "Phase 6 is ready for hosted rendering.",
            "Phase 6 is ready for npm publication.",
            "Phase 6 supports PDF export.",
            "Phase 6 exports the Player App.",
            "Phase 6 plugin loading is supported.",
          ].join("\n"),
        ).map((violation) => violation.label),
      ).toEqual([
        "hosted rendering readiness",
        "npm publication",
        "unsupported format support",
        "Player App export",
        "arbitrary plugin loading",
      ]);

      for (const [artifact, text] of [
        ["README.md", readme],
        ["docs/local-export.md", walkthrough],
        ["manifest.json", manifestText],
        ["web-evidence.json", webEvidenceText],
      ] as const) {
        expect(findAlphaSurfaceOverclaimViolations(text), artifact).toEqual([]);
      }

      expect(walkthrough).toContain("## Generated Output Ownership");
      expect(walkthrough).toContain("not tracked fixtures");
      expect(walkthrough).toContain("docs/design/testing-taxonomy.md");
      expect(walkthrough).not.toMatch(
        /generated command transcripts are required/i,
      );
      expect(manifestText).toContain("knownLimitations");
      expect(webEvidenceText).toContain("knownLimitations");
    } finally {
      await rm(tempRoot, { force: true, recursive: true });
    }
  });
});
