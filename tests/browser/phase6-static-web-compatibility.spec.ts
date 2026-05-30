import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";
import { runPhase6Cli } from "../../packages/cli/src/index.ts";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "../..");
const deckId = "phase5-alpha-readiness-talk";

test.describe("B6.3 Phase 6 static web compatibility browser evidence", () => {
  test("TC-WEBC-002 uses semantic browser smoke as the primary web oracle", async ({
    page,
  }) => {
    const runId = "playwright-b6-3-web";
    const outputDir = path.join(repoRoot, "dist/cadenza", deckId, runId);
    rmSync(outputDir, { force: true, recursive: true });

    const exported = await runPhase6Cli(
      ["export", deckId, "--run-id", runId, "--format", "web", "--json"],
      repoRoot,
    );
    expect(exported.exitCode).toBe(0);

    await page.goto(pathToFileURL(path.join(outputDir, "index.html")).href);

    const compatibilityRoot = page.locator(
      "[data-cadenza-static-web-compatibility]",
    );
    await expect(compatibilityRoot).toBeVisible();
    await expect(compatibilityRoot).toHaveAttribute(
      "data-cadenza-player-app-export",
      "false",
    );
    await expect(compatibilityRoot).toHaveAttribute(
      "data-cadenza-hosted-bundle",
      "false",
    );
    await expect(compatibilityRoot).toHaveAttribute(
      "data-cadenza-web-primary-oracle",
      "semantic-browser-smoke",
    );
    await expect(compatibilityRoot).toHaveAttribute(
      "data-cadenza-browser-smoke-status",
      "semantic-ready",
    );

    const manifestReference = JSON.parse(
      (await page
        .locator("#cadenza-export-manifest-reference")
        .textContent()) ?? "{}",
    ) as { path: string; runId: string };
    expect(manifestReference).toEqual({
      path: "manifest.json",
      runId,
      deckId,
    });

    const browserEvidence = JSON.parse(
      (await page
        .locator("#cadenza-web-compatibility-evidence")
        .textContent()) ?? "{}",
    ) as {
      browserSmoke: {
        primaryOracle: string;
        screenshotOrPixelEvidence: string;
      };
      semanticAnchors: { slideId: string }[];
      timingEvidence: {
        offlineTiming: { status: string; unexpectedMismatches: unknown[] };
        transitions: { status: string; unexpectedMismatches: unknown[] };
      };
    };
    expect(browserEvidence.browserSmoke).toMatchObject({
      primaryOracle: "semantic-browser-smoke",
      screenshotOrPixelEvidence: "supplemental-only",
    });

    const browserAnchorOrder = await page
      .locator("[data-cadenza-semantic-anchor]")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-cadenza-semantic-anchor")),
      );
    expect(browserAnchorOrder).toEqual(
      browserEvidence.semanticAnchors.map((anchor) => anchor.slideId),
    );
    expect(browserAnchorOrder).toEqual([
      "launch-contract",
      "phase4-to-phase5",
      "local-export-command",
      "deterministic-manifest",
      "evidence-gates",
      "alpha-boundaries",
    ]);
    await expect(page.locator("[data-cadenza-notes-boundary]")).toHaveCount(6);
    await expect(
      page.getByText(
        "Open by naming Phase 5 as a local launch-candidate proof",
      ),
    ).toHaveCount(0);
    expect(browserEvidence.timingEvidence.offlineTiming).toEqual({
      status: "passed-with-allowed-deltas",
      unexpectedMismatches: [],
    });
    expect(browserEvidence.timingEvidence.transitions).toEqual({
      status: "passed-with-allowed-deltas",
      unexpectedMismatches: [],
    });
  });
});
