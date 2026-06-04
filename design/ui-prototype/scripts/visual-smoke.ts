import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect, type Page } from "@playwright/test";

type Scenario = {
  readonly annotation: string;
  readonly interactions?: readonly InteractionCheck[];
  readonly name: string;
  readonly query: string;
  readonly viewport: {
    readonly height: number;
    readonly width: number;
  };
};

type InteractionCheck =
  | "copy-locator"
  | "fullscreen-next"
  | "mobile-inspector-open"
  | "mobile-slides-open"
  | "next-anchor"
  | "outline-anchor"
  | "side-swap-health"
  | "thumbnail-anchor";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.CADENZA_UI_PROTOTYPE_PORT ?? "4177");
const baseUrl = `http://127.0.0.1:${port}`;
const screenshotDir = resolve(packageRoot, "evidence/screenshots");
const viteBin = resolve(packageRoot, "node_modules/vite/bin/vite.js");
const validationPath = resolve(packageRoot, "evidence/validation-smoke.json");

const scenarios: readonly Scenario[] = [
  {
    annotation:
      "Desktop normal shell: deck-primary three-rail layout with clickable slide rail, Outline inspector, icon-only layout controls, direct sash boundaries, bottom action-anchor controls, and persistent status bar.",
    interactions: ["next-anchor", "thumbnail-anchor", "outline-anchor"],
    name: "desktop-normal-shell.png",
    query: "/?state=ready&topic=Outline&theme=light&anchor=2",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Desktop diagnostics state: blocking message bar, health route into Diagnostics, read-only locator/hint cards, copy affordances, and no repair/editor/re-export actions.",
    interactions: ["copy-locator"],
    name: "desktop-diagnostics-state.png",
    query: "/?state=blocked&topic=Diagnostics&theme=light&anchor=4",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Desktop provenance state: dark mode inspector with format capabilities, evidence files, selector provenance, artifact inventory, and raw details folded behind sections.",
    name: "desktop-provenance-state.png",
    query: "/?state=provenance&topic=Provenance&theme=dark&anchor=3",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Desktop swapped rails: inspector is on the left, slide rail is on the right, and the bottom health signal follows the semantic inspector side.",
    interactions: ["side-swap-health"],
    name: "desktop-swapped-rails.png",
    query: "/?state=provenance&topic=Provenance&theme=light&swap=true&anchor=3",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Fullscreen state: nonessential app chrome is hidden, deck content remains visible, keyboard/pointer navigation stays available, and action-anchor navigation does not black out the slide.",
    interactions: ["fullscreen-next"],
    name: "desktop-fullscreen-state.png",
    query: "/?state=ready&topic=Outline&theme=dark&fullscreen=true&anchor=1",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Narrow/mobile viewer state: deck-first responsive viewer with sticky action controls and compact drawer buttons, not a full mobile presenter promise.",
    name: "mobile-viewer-state.png",
    query: "/?state=pending&topic=Readiness&theme=dark&anchor=4",
    viewport: { height: 844, width: 390 },
  },
  {
    annotation:
      "Mobile slide drawer: folded slide rail opens as a sheet and can navigate action anchors without horizontal overflow.",
    interactions: ["mobile-slides-open"],
    name: "mobile-slides-drawer.png",
    query: "/?state=pending&topic=Readiness&theme=dark&panel=slides&anchor=4",
    viewport: { height: 844, width: 390 },
  },
  {
    annotation:
      "Mobile inspector drawer: folded inspector opens as a sheet with icon topic tabs and summary-first sections.",
    interactions: ["mobile-inspector-open"],
    name: "mobile-inspector-drawer.png",
    query:
      "/?state=pending&topic=Diagnostics&theme=dark&panel=inspector&anchor=4",
    viewport: { height: 844, width: 390 },
  },
  {
    annotation:
      "Presenter-view representation: current deck, next action anchor, notes boundary, timer/progress, and browser multi-screen limitation posture.",
    name: "presenter-view-state.png",
    query: "/?state=ready&topic=Notes&theme=dark&presenter=true&anchor=2",
    viewport: { height: 960, width: 1440 },
  },
];

async function main() {
  await mkdir(screenshotDir, { recursive: true });
  const server = startServer();

  try {
    await waitForServer(baseUrl, server);
    const browser = await chromium.launch();
    const results = [];

    try {
      for (const scenario of scenarios) {
        const page = await browser.newPage({ viewport: scenario.viewport });
        const result = await captureScenario(page, scenario);
        results.push(result);
        await page.close();
      }
    } finally {
      await browser.close();
    }

    await writeFile(
      validationPath,
      `${JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          focusedScope: "design/ui-prototype",
          previewUrl: baseUrl,
          results,
        },
        null,
        2,
      )}\n`,
    );

    console.log(JSON.stringify({ results, validationPath }, null, 2));
  } finally {
    server.kill("SIGTERM");
  }
}

function startServer(): ChildProcessWithoutNullStreams {
  return spawn(
    process.execPath,
    [viteBin, "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: packageRoot,
      env: { ...process.env, FORCE_COLOR: "0" },
    },
  );
}

async function waitForServer(
  url: string,
  server: ChildProcessWithoutNullStreams,
) {
  let lastError = "";
  const stderrChunks: string[] = [];
  server.stderr.on("data", (chunk: Buffer) => {
    stderrChunks.push(chunk.toString("utf8"));
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(
        `Vite server exited early with code ${server.exitCode}.\n${stderrChunks.join("")}`,
      );
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }

  throw new Error(`Timed out waiting for ${url}: ${lastError}`);
}

async function captureScenario(page: Page, scenario: Scenario) {
  const url = `${baseUrl}${scenario.query}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator(".deck-slide:visible").waitFor({ state: "visible" });
  const title = await page
    .locator(".deck-slide:visible h1")
    .first()
    .textContent();
  const interactionResults = [];

  for (const interaction of scenario.interactions ?? []) {
    interactionResults.push(await runInteraction(page, interaction));
  }

  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow:
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  }));

  const clippedButtons = await page.evaluate(() =>
    Array.from(document.querySelectorAll("button"))
      .filter((button) => {
        const rect = button.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .filter((button) => button.scrollWidth > button.clientWidth + 1)
      .map(
        (button) =>
          button.getAttribute("aria-label") ?? button.textContent?.trim(),
      )
      .filter(Boolean),
  );

  const screenshotPath = resolve(screenshotDir, scenario.name);
  await page.screenshot({ fullPage: false, path: screenshotPath });

  return {
    annotation: scenario.annotation,
    clippedButtons,
    hasDeckTitle: Boolean(title?.trim()),
    interactions: interactionResults,
    name: scenario.name,
    overflow,
    query: scenario.query,
    screenshotPath: `design/ui-prototype/evidence/screenshots/${scenario.name}`,
    viewport: scenario.viewport,
  };
}

async function runInteraction(page: Page, check: InteractionCheck) {
  if (check === "next-anchor") {
    const before = await page
      .locator("[data-anchor-title]:visible")
      .getAttribute("data-anchor-title");
    await page
      .locator('button[aria-label="Next action anchor"]:visible')
      .first()
      .click();
    const after = await page
      .locator("[data-anchor-title]:visible")
      .getAttribute("data-anchor-title");
    expect(after).not.toBe(before);
    return { check, passed: true, value: after };
  }

  if (check === "thumbnail-anchor") {
    await page.locator('[data-anchor-index="5"]').first().click();
    await expect(page.locator(".deck-slide:visible h1").first()).toHaveText(
      "Alpha boundaries",
    );
    return { check, passed: true, value: "Alpha boundaries" };
  }

  if (check === "outline-anchor") {
    await page
      .getByRole("button", { name: /Deterministic manifest/i })
      .first()
      .click();
    await expect(page.locator(".deck-slide:visible h1").first()).toHaveText(
      "Deterministic manifest",
    );
    return { check, passed: true, value: "Deterministic manifest" };
  }

  if (check === "copy-locator") {
    await page
      .getByRole("button", { name: /Locator/i })
      .first()
      .click();
    await expect(page.locator("[data-copy-status]").first()).toContainText(
      /Locator (copied|selected)/,
    );
    return { check, passed: true, value: "locator feedback visible" };
  }

  if (check === "side-swap-health") {
    await expect(
      page.locator('[data-health-side="left"]').first(),
    ).toBeVisible();
    return { check, passed: true, value: "health-left" };
  }

  if (check === "fullscreen-next") {
    await expect(
      page.locator(".fullscreen-shell .deck-slide:visible").first(),
    ).toBeVisible();
    const before = await page
      .locator(".deck-slide:visible h1")
      .first()
      .textContent();
    await page
      .locator('button[aria-label="Next action anchor"]:visible')
      .first()
      .click();
    const after = await page
      .locator(".deck-slide:visible h1")
      .first()
      .textContent();
    expect(after).not.toBe(before);
    return { check, passed: true, value: after };
  }

  if (check === "mobile-slides-open") {
    await expect(
      page.locator('[data-mobile-panel="slides"]').first(),
    ).toBeVisible();
    await page
      .locator('.mobile-sheet-panel [data-anchor-index="0"]')
      .first()
      .click();
    await expect(page.locator(".deck-slide:visible h1").first()).toHaveText(
      "Local alpha contract",
    );
    await page
      .locator('button[aria-label="Open slide drawer"]:visible')
      .click();
    await expect(
      page.locator('[data-mobile-panel="slides"]').first(),
    ).toBeVisible();
    return { check, passed: true, value: "slides drawer navigation" };
  }

  if (check === "mobile-inspector-open") {
    await expect(
      page.locator('[data-mobile-panel="inspector"]').first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Diagnostics" }),
    ).toBeVisible();
    return { check, passed: true, value: "inspector drawer visible" };
  }

  return { check, passed: false, value: "unhandled" };
}

await main();
