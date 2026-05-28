import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
import { runCadenzaCli } from "../../scripts/cadenza.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "../..");
const deckId = "phase5-alpha-readiness-talk";

test.describe("B5.2 Phase 5 exported web parity smoke", () => {
  test("TC-PEXP-001 and TC-PEXP-002 expose parity, semantic anchors, and notes boundaries in a browser", async ({
    page,
  }) => {
    const runId = "playwright-b5-2-smoke";
    const outputDir = path.join(repoRoot, "dist/phase5", deckId, runId);
    rmSync(outputDir, { force: true, recursive: true });

    await runCadenzaCli(["export", deckId, "--run-id", runId]);
    await page.goto(pathToFileURL(path.join(outputDir, "index.html")).href);

    const exportedDeck = page.locator(`[data-cadenza-export-deck="${deckId}"]`);
    await expect(exportedDeck).toHaveAttribute(
      "data-cadenza-export-parity",
      "passed",
    );
    await expect(exportedDeck).toHaveAttribute(
      "data-cadenza-visible-notes",
      "false",
    );

    const manifest = JSON.parse(
      (await page.locator("#cadenza-export-manifest").textContent()) ?? "{}",
    ) as {
      previewExportParity: {
        browserSmoke: {
          testId: string;
        };
        notesBoundary: Array<{
          exportedVisibleSurface: string;
          notesCount: number;
          slideId: string;
        }>;
        status: string;
        timingComparison: {
          offlineTiming: {
            status: string;
            unexpectedMismatches: unknown[];
          };
          transitions: {
            status: string;
            unexpectedMismatches: unknown[];
          };
        };
      };
      webBundle: {
        semanticAnchors: string[];
      };
    };

    expect(manifest.previewExportParity.status).toBe("passed");
    expect(manifest.previewExportParity.browserSmoke.testId).toBe(
      "TC-PEXP-001/TC-PEXP-002",
    );
    expect(
      manifest.previewExportParity.notesBoundary.every(
        (boundary) =>
          boundary.exportedVisibleSurface === "excluded" &&
          boundary.notesCount > 0,
      ),
    ).toBe(true);

    await expect(page.locator("[data-cadenza-semantic-anchor]")).toHaveCount(
      manifest.webBundle.semanticAnchors.length,
    );
    await expect(
      page.locator("[data-cadenza-semantic-anchor]").first(),
    ).toHaveAttribute("data-cadenza-semantic-anchor", "launch-contract");
    const browserAnchorOrder = await page
      .locator("[data-cadenza-semantic-anchor]")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-cadenza-semantic-anchor")),
      );
    expect(browserAnchorOrder).toEqual(manifest.webBundle.semanticAnchors);
    expect(manifest.previewExportParity.timingComparison.offlineTiming).toEqual(
      expect.objectContaining({
        status: "passed-with-allowed-deltas",
        unexpectedMismatches: [],
      }),
    );
    expect(manifest.previewExportParity.timingComparison.transitions).toEqual(
      expect.objectContaining({
        status: "passed-with-allowed-deltas",
        unexpectedMismatches: [],
      }),
    );
    await expect(
      page.getByText(
        "Open by naming Phase 5 as a local launch-candidate proof",
      ),
    ).toHaveCount(0);
  });
});
