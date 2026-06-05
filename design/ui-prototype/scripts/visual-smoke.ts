import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { type Browser, chromium, expect, type Page } from "@playwright/test";

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
  | "activity-tooltip-visible"
  | "copy-locator"
  | "fullscreen-context-menu"
  | "fullscreen-last-exit"
  | "fullscreen-menu-open"
  | "fullscreen-next"
  | "fullscreen-presenter-menu"
  | "mobile-inspector-open"
  | "mobile-slides-open"
  | "next-anchor"
  | "outline-anchor"
  | "provenance-raw-copy"
  | "right-inspector-collapsed"
  | "side-swap-health"
  | "thumbnail-anchor";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.CADENZA_UI_PROTOTYPE_PORT ?? "4177");
const baseUrl = `http://127.0.0.1:${port}`;
const screenshotDir = resolve(packageRoot, "evidence/screenshots");
const viteBin = resolve(packageRoot, "node_modules/vite/bin/vite.js");
const validationPath = resolve(packageRoot, "evidence/validation-smoke.json");
const themeStorageKey = "cadenza.ui-prototype.theme";
const inspectorSectionLayoutStoragePrefix =
  "cadenza.uiPrototype.inspectorSectionLayout.v3";

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
      "Desktop provenance state: dark mode inspector with format capabilities, evidence files, selector provenance, artifact inventory, adaptive section scrolling, and Raw Details represented as a copy affordance.",
    interactions: ["provenance-raw-copy"],
    name: "desktop-provenance-state.png",
    query: "/?state=provenance&topic=Provenance&theme=dark&anchor=3",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Desktop right-inspector collapsed state: right-side activity bar remains on the right edge, inspector content is fully absent, and the collapsed panel is fixed to the icon rail width.",
    interactions: ["right-inspector-collapsed"],
    name: "desktop-right-inspector-collapsed.png",
    query:
      "/?state=provenance&topic=Provenance&theme=dark&inspector=closed&anchor=3",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Desktop swapped rails: inspector is on the left, slide rail is on the right, while the bottom status bar remains fixed instead of mirroring the rail order.",
    interactions: ["side-swap-health"],
    name: "desktop-swapped-rails.png",
    query: "/?state=provenance&topic=Provenance&theme=light&swap=true&anchor=3",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Activity-bar tooltip: hover tooltip renders as a pointer-style floating bubble above rails, without being clipped by the activity bar or side-panel boundary.",
    interactions: ["activity-tooltip-visible"],
    name: "desktop-activity-tooltip-state.png",
    query: "/?state=ready&topic=Outline&theme=dark&anchor=2",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Fullscreen state: nonessential app chrome is hidden, deck content remains visible, keyboard/pointer navigation stays available, and action-anchor navigation does not black out the slide.",
    interactions: ["fullscreen-next", "fullscreen-context-menu"],
    name: "desktop-fullscreen-state.png",
    query: "/?state=ready&topic=Outline&theme=dark&fullscreen=true&anchor=1",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Fullscreen final-anchor exit: the right edge advances out of fullscreen at the last action anchor instead of trapping the user at the end.",
    interactions: ["fullscreen-last-exit"],
    name: "desktop-fullscreen-final-exit.png",
    query: "/?state=ready&topic=Outline&theme=dark&fullscreen=true&anchor=5",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Fullscreen context-menu presenter entry: right-click menu is theme-aware, anchored to the pointer, closes on selection, and routes to the presenter-view representation.",
    interactions: ["fullscreen-presenter-menu"],
    name: "desktop-fullscreen-presenter-menu.png",
    query: "/?state=ready&topic=Outline&theme=dark&fullscreen=true&anchor=2",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Fullscreen context menu open: right-click opens a theme-aware pointer-anchored menu with presenter, copy, navigation, and exit actions.",
    interactions: ["fullscreen-menu-open"],
    name: "desktop-fullscreen-menu-open.png",
    query: "/?state=ready&topic=Outline&theme=dark&fullscreen=true&anchor=2",
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
    let themePreferenceChecks = [];
    let layoutRegressionChecks = [];

    try {
      for (const scenario of scenarios) {
        const page = await browser.newPage({ viewport: scenario.viewport });
        const result = await captureScenario(page, scenario);
        results.push(result);
        await page.close();
      }
      themePreferenceChecks = await runThemePreferenceChecks(browser);
      layoutRegressionChecks = await runLayoutRegressionChecks(browser);
    } finally {
      await browser.close();
    }

    await writeFile(
      validationPath,
      `${JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          focusedScope: "design/ui-prototype",
          layoutRegressionChecks,
          previewUrl: baseUrl,
          results,
          themePreferenceChecks,
        },
        null,
        2,
      )}\n`,
    );

    console.log(
      JSON.stringify(
        {
          layoutRegressionChecks,
          results,
          themePreferenceChecks,
          validationPath,
        },
        null,
        2,
      ),
    );
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

async function runThemePreferenceChecks(browser: Browser) {
  const checks = [];
  const page = await browser.newPage({
    viewport: { height: 720, width: 1024 },
  });
  try {
    await page.goto(`${baseUrl}/?state=ready&theme=light`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator(".app-shell").first()).toBeVisible();
    expect(await documentTheme(page)).toBe("light");

    await page.getByRole("button", { name: "Use dark theme" }).click();
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "dark",
    );
    expect(await storedTheme(page)).toBe("dark");
    expect(new URL(page.url()).searchParams.get("theme")).toBe("dark");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator(".app-shell").first()).toBeVisible();
    expect(await documentTheme(page)).toBe("dark");

    await page.goto(`${baseUrl}/?state=ready`, { waitUntil: "networkidle" });
    await expect(page.locator(".app-shell").first()).toBeVisible();
    expect(await documentTheme(page)).toBe("dark");
    checks.push({
      check: "theme-persistence",
      passed: true,
      value: "toggle persists through reload and no-query navigation",
    });
  } finally {
    await page.close();
  }

  const lightContext = await browser.newContext({
    colorScheme: "light",
    viewport: { height: 720, width: 1024 },
  });
  try {
    const lightPage = await lightContext.newPage();
    await lightPage.goto(`${baseUrl}/?state=ready`, {
      waitUntil: "networkidle",
    });
    await expect(lightPage.locator(".app-shell").first()).toBeVisible();
    expect(await documentTheme(lightPage)).toBe("light");
    checks.push({
      check: "theme-os-light-default",
      passed: true,
      value: "fresh no-query context follows OS light preference",
    });
  } finally {
    await lightContext.close();
  }

  const darkContext = await browser.newContext({
    colorScheme: "dark",
    viewport: { height: 720, width: 1024 },
  });
  try {
    const darkPage = await darkContext.newPage();
    await darkPage.goto(`${baseUrl}/?state=ready`, {
      waitUntil: "networkidle",
    });
    await expect(darkPage.locator(".app-shell").first()).toBeVisible();
    expect(await documentTheme(darkPage)).toBe("dark");
    checks.push({
      check: "theme-os-dark-default",
      passed: true,
      value: "fresh no-query context follows OS dark preference",
    });
  } finally {
    await darkContext.close();
  }

  const fallbackContext = await browser.newContext({
    viewport: { height: 720, width: 1024 },
  });
  await fallbackContext.addInitScript(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
    });
  });
  try {
    const fallbackPage = await fallbackContext.newPage();
    await fallbackPage.goto(`${baseUrl}/?state=ready`, {
      waitUntil: "networkidle",
    });
    await expect(fallbackPage.locator(".app-shell").first()).toBeVisible();
    expect(await documentTheme(fallbackPage)).toBe("dark");
    checks.push({
      check: "theme-fallback-dark",
      passed: true,
      value: "fresh no-query context falls back to dark without matchMedia",
    });
  } finally {
    await fallbackContext.close();
  }

  return checks;
}

async function documentTheme(page: Page) {
  return page.evaluate(() => document.documentElement.dataset.theme ?? "");
}

async function storedTheme(page: Page) {
  return page.evaluate(
    (storageKey) => window.localStorage.getItem(storageKey),
    themeStorageKey,
  );
}

async function runLayoutRegressionChecks(browser: Browser) {
  const checks = [];

  checks.push(
    await checkRailResizeRoundTrip(browser, {
      check: "slides-left-resize-collapse-roundtrip",
      deltaX: 96,
      handleName: "Resize left rail boundary",
      query: "/?state=ready&topic=Outline&theme=dark&anchor=3",
      railSelector: ".rail-panel-slides",
      toggleName: "Toggle left slides rail",
    }),
  );
  checks.push(
    await checkRailResizeRoundTrip(browser, {
      check: "slides-right-resize-collapse-roundtrip",
      deltaX: -96,
      handleName: "Resize right rail boundary",
      query: "/?state=ready&topic=Outline&theme=dark&swap=true&anchor=3",
      railSelector: ".rail-panel-slides",
      toggleName: "Toggle right slides rail",
    }),
  );
  checks.push(
    await checkRailResizeRoundTrip(browser, {
      check: "inspector-right-resize-collapse-roundtrip",
      deltaX: -96,
      handleName: "Resize right rail boundary",
      query: "/?state=ready&topic=Outline&theme=dark&anchor=3",
      railSelector: ".rail-panel-inspector",
      toggleName: "Toggle right inspector rail",
    }),
  );
  checks.push(
    await checkRailResizeRoundTrip(browser, {
      check: "inspector-left-resize-collapse-roundtrip",
      deltaX: 96,
      handleName: "Resize left rail boundary",
      query: "/?state=ready&topic=Outline&theme=dark&swap=true&anchor=3",
      railSelector: ".rail-panel-inspector",
      toggleName: "Toggle left inspector rail",
    }),
  );
  checks.push(await checkCollapsedSectionsAreHeaderOnly(browser));
  checks.push(await checkSummaryMinimumTracksWidth(browser));
  checks.push(await checkSummaryToggleRehydratesMeasurement(browser));
  checks.push(await checkSummaryZoomMeasurementStable(browser));
  checks.push(await checkCollapsedRailBoundaryHandleVisible(browser));
  checks.push(await checkRailBoundarySashesAreVisible(browser));
  checks.push(await checkSectionStackDoesNotScroll(browser));
  checks.push(await checkSectionDividerAcrossCollapsedPane(browser));
  checks.push(await checkSummaryDividerKeepsSummaryLocked(browser));
  checks.push(await checkActivitySectionLayoutStateRetained(browser));
  checks.push(await checkSectionToggleAnimation(browser));

  return checks;
}

type RailRoundTripOptions = {
  readonly check: string;
  readonly deltaX: number;
  readonly handleName: string;
  readonly query: string;
  readonly railSelector: string;
  readonly toggleName: string;
};

async function checkRailResizeRoundTrip(
  browser: Browser,
  options: RailRoundTripOptions,
) {
  const page = await browser.newPage({
    viewport: { height: 900, width: 1440 },
  });
  try {
    await page.goto(`${baseUrl}${options.query}`, { waitUntil: "networkidle" });
    await expect(page.locator(".deck-slide:visible").first()).toBeVisible();
    const rail = page.locator(options.railSelector).first();
    await expect(rail).toBeVisible();
    const before = await elementWidth(rail);

    await dragResizeHandle(page, options.handleName, options.deltaX, 0);
    await expect.poll(() => elementWidth(rail)).toBeGreaterThan(before + 40);
    const resized = await elementWidth(rail);

    await page.getByRole("button", { name: options.toggleName }).click();
    await page.getByRole("button", { name: options.toggleName }).click();
    await expect(rail).toBeVisible();
    await expect(page.locator(".deck-slide:visible h1").first()).toBeVisible();
    await expect.poll(() => elementWidth(rail)).toBeGreaterThan(resized - 12);

    await page.getByRole("button", { name: options.toggleName }).click();
    await page.getByRole("button", { name: options.toggleName }).click();
    await expect(rail).toBeVisible();
    await expect(page.locator(".deck-slide:visible h1").first()).toBeVisible();

    return {
      check: options.check,
      passed: true,
      value: `width-${Math.round(before)}-${Math.round(await elementWidth(rail))}`,
    };
  } finally {
    await page.close();
  }
}

async function checkCollapsedSectionsAreHeaderOnly(browser: Browser) {
  const page = await browser.newPage({
    viewport: { height: 760, width: 1280 },
  });
  try {
    await page.goto(`${baseUrl}/?state=ready&topic=Outline&theme=dark`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator(".inspector-pane").first()).toBeVisible();
    const summaries = page.locator(".inspector-pane .section-summary");
    const count = await summaries.count();
    for (let index = 0; index < count; index += 1) {
      const summary = summaries.nth(index);
      if ((await summary.getAttribute("aria-expanded")) === "true") {
        await summary.click();
      }
    }
    await page.waitForTimeout(240);

    const collapsedPanels = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          ".inspector-pane .section-panel",
        ),
      ).map((panel) => {
        const section = panel.querySelector<HTMLElement>(".section");
        const summary = panel.querySelector<HTMLElement>(".section-summary");
        return {
          bodyCount: panel.querySelectorAll(".section-body").length,
          panelHeight: panel.getBoundingClientRect().height,
          sectionHeight: section?.getBoundingClientRect().height ?? 0,
          summaryHeight: summary?.getBoundingClientRect().height ?? 0,
        };
      }),
    );
    const dividerCount = await page
      .locator(".inspector-pane .section-resize-handle")
      .count();

    expect(collapsedPanels.length).toBeGreaterThan(1);
    expect(dividerCount).toBe(collapsedPanels.length - 1);
    expect(
      collapsedPanels.every(
        (panel) =>
          panel.bodyCount === 0 &&
          panel.panelHeight <= panel.summaryHeight + 2 &&
          panel.sectionHeight <= panel.summaryHeight + 2,
      ),
    ).toBe(true);

    return {
      check: "collapsed-sections-header-only",
      passed: true,
      value: `panels-${collapsedPanels.map((panel) => Math.round(panel.panelHeight)).join("-")} dividers-${dividerCount}`,
    };
  } finally {
    await page.close();
  }
}

async function checkSummaryMinimumTracksWidth(browser: Browser) {
  const page = await browser.newPage({
    viewport: { height: 760, width: 1280 },
  });
  try {
    await page.goto(
      `${baseUrl}/?state=provenance&topic=Provenance&theme=dark&anchor=3`,
      { waitUntil: "networkidle" },
    );
    await expect(
      page.locator('[data-section-id="summary"] .section-body').first(),
    ).toBeVisible();
    await expect
      .poll(() => summaryBodyFits(page))
      .toEqual({ fits: true, overflow: 0 });

    return {
      check: "summary-minimum-fits-current-width",
      passed: true,
      value: "summary body has no internal clipping",
    };
  } finally {
    await page.close();
  }
}

async function checkSummaryToggleRehydratesMeasurement(browser: Browser) {
  const page = await browser.newPage({
    viewport: { height: 760, width: 1280 },
  });
  try {
    await page.goto(
      `${baseUrl}/?state=ready&topic=Outline&theme=dark&anchor=3`,
      {
        waitUntil: "networkidle",
      },
    );
    await resetInspectorLayoutStorage(page);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator('[data-section-id="summary"]')).toBeVisible();

    const summary = page.locator(
      '[data-section-id="summary"] .section-summary',
    );
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if ((await summary.getAttribute("aria-expanded")) === "true") {
        await summary.click();
      }
      await expect.poll(() => sectionBodyCount(page, "summary")).toBe(0);
      await summary.click();
      await expect
        .poll(() => summaryBodyFits(page))
        .toEqual({ fits: true, overflow: 0 });
    }

    const metrics = await summaryPanelMetrics(page);
    return {
      check: "summary-toggle-rehydrates-measurement",
      passed: true,
      value: `summary-${Math.round(metrics.panelHeight)} overflow-${metrics.overflow}`,
    };
  } finally {
    await page.close();
  }
}

async function checkSummaryZoomMeasurementStable(browser: Browser) {
  const page = await browser.newPage({
    viewport: { height: 1264, width: 2048 },
  });
  try {
    await page.goto(
      `${baseUrl}/?state=ready&topic=Outline&theme=dark&anchor=3`,
      {
        waitUntil: "networkidle",
      },
    );
    await resetInspectorLayoutStorage(page);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator('[data-section-id="summary"]')).toBeVisible();
    await expect
      .poll(() => summaryBodyFits(page))
      .toEqual({ fits: true, overflow: 0 });

    const initial = await summaryPanelMetrics(page);
    await setDocumentZoom(page, "1.24");
    await expect
      .poll(() => summaryBodyFits(page))
      .toEqual({ fits: true, overflow: 0 });
    await setDocumentZoom(page, "1.25");
    await page.waitForTimeout(500);
    const zoomedFirst = await summaryPanelMetrics(page);
    await page.waitForTimeout(500);
    const zoomedSecond = await summaryPanelMetrics(page);

    expect(
      Math.abs(zoomedSecond.panelHeight - zoomedFirst.panelHeight),
    ).toBeLessThanOrEqual(4);

    await setDocumentZoom(page, "1");
    await expect
      .poll(() => summaryBodyFits(page))
      .toEqual({ fits: true, overflow: 0 });
    await page.waitForTimeout(300);
    const restored = await summaryPanelMetrics(page);
    expect(restored.panelHeight).toBeLessThanOrEqual(initial.panelHeight + 8);

    return {
      check: "summary-zoom-measurement-stable",
      passed: true,
      value: `summary-${Math.round(initial.panelHeight)}-${Math.round(zoomedFirst.panelHeight)}-${Math.round(zoomedSecond.panelHeight)}-${Math.round(restored.panelHeight)}`,
    };
  } finally {
    await page.close();
  }
}

async function checkCollapsedRailBoundaryHandleVisible(browser: Browser) {
  const page = await browser.newPage({
    viewport: { height: 900, width: 1440 },
  });
  try {
    await page.goto(
      `${baseUrl}/?state=ready&topic=Outline&theme=dark&inspector=closed`,
      { waitUntil: "networkidle" },
    );
    await expect(page.locator(".rail-panel-inspector").first()).toBeVisible();
    const handle = page.getByLabel("Resize right rail boundary").first();
    await expect(handle).toBeVisible();
    const handleBox = await handle.boundingBox();
    expect(handleBox?.width).toBeGreaterThanOrEqual(8);

    return {
      check: "collapsed-rail-boundary-handle-visible",
      passed: true,
      value: `handle-width-${Math.round(handleBox?.width ?? 0)}`,
    };
  } finally {
    await page.close();
  }
}

async function checkRailBoundarySashesAreVisible(browser: Browser) {
  const page = await browser.newPage({
    viewport: { height: 900, width: 1440 },
  });
  try {
    await page.goto(
      `${baseUrl}/?state=ready&topic=Outline&theme=dark&anchor=3`,
      { waitUntil: "networkidle" },
    );
    await expect(page.locator(".rail-panel-inspector").first()).toBeVisible();
    const rightSash = await railSashGeometry(
      page,
      "Resize right rail boundary",
    );

    await page.goto(
      `${baseUrl}/?state=ready&topic=Outline&theme=dark&swap=true&anchor=3`,
      { waitUntil: "networkidle" },
    );
    await expect(page.locator(".rail-panel-inspector").first()).toBeVisible();
    const leftSash = await railSashGeometry(page, "Resize left rail boundary");

    expect(rightSash.height).toBeGreaterThanOrEqual(76);
    expect(leftSash.height).toBeGreaterThanOrEqual(76);
    expect(rightSash.width).toBeGreaterThanOrEqual(2);
    expect(leftSash.width).toBeGreaterThanOrEqual(2);

    return {
      check: "rail-boundary-sashes-visible",
      passed: true,
      value: `right-${Math.round(rightSash.width)}x${Math.round(rightSash.height)} left-${Math.round(leftSash.width)}x${Math.round(leftSash.height)}`,
    };
  } finally {
    await page.close();
  }
}

async function checkSectionStackDoesNotScroll(browser: Browser) {
  const page = await browser.newPage({
    viewport: { height: 760, width: 1280 },
  });
  try {
    await page.goto(
      `${baseUrl}/?state=ready&topic=Outline&theme=dark&anchor=5`,
      { waitUntil: "networkidle" },
    );
    await expect(page.locator(".inspector-pane").first()).toBeVisible();
    await expect
      .poll(() => sectionStackScrollState(page))
      .toEqual({
        bodyScrolls: true,
        stackScrolls: false,
      });

    return {
      check: "section-stack-does-not-scroll",
      passed: true,
      value: "outer stack fixed, section body scrolls",
    };
  } finally {
    await page.close();
  }
}

async function checkSectionDividerAcrossCollapsedPane(browser: Browser) {
  const page = await browser.newPage({
    viewport: { height: 900, width: 1440 },
  });
  try {
    await page.goto(
      `${baseUrl}/?state=provenance&topic=Provenance&theme=dark&anchor=3`,
      { waitUntil: "networkidle" },
    );
    await expect(page.locator('[data-section-id="raw-details"]')).toBeVisible();
    await page
      .locator('[data-section-id="raw-details"] .section-summary')
      .click();
    await expect(
      page.locator('[data-section-id="raw-details"] .section-body'),
    ).toBeVisible();

    const evidenceSummary = page.locator(
      '[data-section-id="evidence-files"] .section-summary',
    );
    if ((await evidenceSummary.getAttribute("aria-expanded")) === "true") {
      await evidenceSummary.click();
      await expect
        .poll(() => panelHeight(page, "evidence-files"))
        .toBeLessThanOrEqual(40);
    }

    const beforeFormat = await panelHeight(page, "format-capabilities");
    const beforeRaw = await panelHeight(page, "raw-details");
    await dragResizeHandle(page, "Resize Format Capabilities section", 0, -56);
    await expect
      .poll(() => panelHeight(page, "raw-details"))
      .toBeGreaterThan(beforeRaw + 30);
    const afterFormat = await panelHeight(page, "format-capabilities");
    const afterRaw = await panelHeight(page, "raw-details");
    expect(afterFormat).toBeLessThan(beforeFormat - 30);

    return {
      check: "section-divider-across-collapsed-pane",
      passed: true,
      value: `format-${Math.round(beforeFormat)}-${Math.round(afterFormat)} raw-${Math.round(beforeRaw)}-${Math.round(afterRaw)}`,
    };
  } finally {
    await page.close();
  }
}

async function checkSummaryDividerKeepsSummaryLocked(browser: Browser) {
  const page = await browser.newPage({
    viewport: { height: 900, width: 1440 },
  });
  try {
    await page.goto(`${baseUrl}/?state=ready&topic=Outline&theme=dark`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator('[data-section-id="summary"]')).toBeVisible();
    const before = await panelHeight(page, "summary");
    await dragResizeHandle(page, "Resize Summary section", 0, 72);
    const after = await panelHeight(page, "summary");
    expect(Math.abs(after - before)).toBeLessThanOrEqual(2);

    return {
      check: "summary-divider-keeps-summary-locked",
      passed: true,
      value: `summary-${Math.round(before)}-${Math.round(after)}`,
    };
  } finally {
    await page.close();
  }
}

async function checkActivitySectionLayoutStateRetained(browser: Browser) {
  const page = await browser.newPage({
    viewport: { height: 900, width: 1440 },
  });
  try {
    await page.goto(`${baseUrl}/?state=ready&topic=Outline&theme=dark`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator('[data-section-id="timeline"]')).toBeVisible();
    await page.locator('[data-section-id="timeline"] .section-summary').click();
    await expect.poll(() => sectionExpandedState(page, "timeline")).toBe(false);
    await expect
      .poll(() => panelHeight(page, "timeline"))
      .toBeLessThanOrEqual(40);
    const retainedOutlineHeight = await panelHeight(page, "outline");

    await page.getByLabel("Open Diagnostics").click();
    await expect(page.locator('[data-section-id="diagnostics"]')).toBeVisible();
    await page.getByLabel("Open Outline").click();
    await expect(page.locator('[data-section-id="outline"]')).toBeVisible();
    await expect.poll(() => sectionExpandedState(page, "timeline")).toBe(false);
    await expect
      .poll(() => panelHeight(page, "timeline"))
      .toBeLessThanOrEqual(40);
    const restoredOutlineHeight = await panelHeight(page, "outline");
    expect(
      Math.abs(restoredOutlineHeight - retainedOutlineHeight),
    ).toBeLessThanOrEqual(3);

    return {
      check: "activity-section-layout-state-retained",
      passed: true,
      value: `outline-${Math.round(retainedOutlineHeight)}-${Math.round(restoredOutlineHeight)}`,
    };
  } finally {
    await page.close();
  }
}

async function checkSectionToggleAnimation(browser: Browser) {
  const page = await browser.newPage({
    viewport: { height: 900, width: 1440 },
  });
  try {
    await page.goto(`${baseUrl}/?state=ready&topic=Outline&theme=dark`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator('[data-section-id="outline"]')).toBeVisible();
    const before = await panelHeight(page, "outline");
    await page.locator('[data-section-id="outline"] .section-summary').click();
    const transition = await page.evaluate(() => {
      const stack = document.querySelector<HTMLElement>(
        ".inspector-pane .section-stack",
      );
      const panel = document.querySelector<HTMLElement>(
        '[data-section-panel-id="outline"]',
      );
      const style = panel ? window.getComputedStyle(panel) : undefined;
      return {
        animated: stack?.classList.contains("section-stack-animated") ?? false,
        duration: style?.transitionDuration ?? "",
        property: style?.transitionProperty ?? "",
      };
    });
    expect(transition.animated).toBe(true);
    expect(transition.duration).not.toBe("0s");
    expect(transition.property).toContain("flex-basis");
    await expect.poll(() => panelHeight(page, "outline")).toBeLessThan(before);
    await expect.poll(() => sectionBodyCount(page, "outline")).toBe(0);

    return {
      check: "section-toggle-animation",
      passed: true,
      value: `duration-${transition.duration}`,
    };
  } finally {
    await page.close();
  }
}

async function sectionStackScrollState(page: Page) {
  return page.evaluate(() => {
    const stack = document.querySelector<HTMLElement>(
      ".inspector-pane .section-stack",
    );
    const body = document.querySelector<HTMLElement>(
      '[data-section-id="timeline"] .section-body',
    );
    return {
      bodyScrolls: body ? body.scrollHeight > body.clientHeight + 1 : false,
      stackScrolls: stack ? stack.scrollHeight > stack.clientHeight + 1 : true,
    };
  });
}

async function sectionExpandedState(page: Page, id: string) {
  return page.evaluate((sectionId) => {
    const summary = document.querySelector<HTMLElement>(
      `[data-section-id="${sectionId}"] .section-summary`,
    );
    return summary?.getAttribute("aria-expanded") === "true";
  }, id);
}

async function sectionBodyCount(page: Page, id: string) {
  return page.evaluate((sectionId) => {
    const section = document.querySelector<HTMLElement>(
      `[data-section-id="${sectionId}"]`,
    );
    return section?.querySelectorAll(".section-body").length ?? 0;
  }, id);
}

async function railSashGeometry(page: Page, name: string) {
  const handle = page.getByLabel(name).first();
  await expect(handle).toBeVisible();
  const sash = handle.locator("span").first();
  await expect(sash).toBeVisible();
  const box = await sash.boundingBox();
  if (!box) throw new Error(`Rail sash ${name} has no bounding box`);
  return box;
}

async function summaryBodyFits(page: Page) {
  return page.evaluate(() => {
    const body = document.querySelector<HTMLElement>(
      '[data-section-id="summary"] .section-body',
    );
    if (!body) return { fits: false, overflow: Number.POSITIVE_INFINITY };
    const overflow = body.scrollHeight - body.clientHeight;
    return { fits: overflow <= 1, overflow: Math.max(0, Math.round(overflow)) };
  });
}

async function summaryPanelMetrics(page: Page) {
  return page.evaluate(() => {
    const body = document.querySelector<HTMLElement>(
      '[data-section-id="summary"] .section-body',
    );
    const panel = document.querySelector<HTMLElement>(
      '[data-section-panel-id="summary"]',
    );
    const overflow = body ? body.scrollHeight - body.clientHeight : 0;
    return {
      bodyClientHeight: body?.clientHeight ?? 0,
      bodyScrollHeight: body?.scrollHeight ?? 0,
      overflow: Math.max(0, Math.round(overflow)),
      panelHeight: panel?.getBoundingClientRect().height ?? 0,
    };
  });
}

async function resetInspectorLayoutStorage(page: Page) {
  await page.evaluate((storagePrefix) => {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(storagePrefix)) {
        window.localStorage.removeItem(key);
      }
    }
  }, inspectorSectionLayoutStoragePrefix);
}

async function setDocumentZoom(page: Page, value: string) {
  await page.evaluate((zoom) => {
    document.documentElement.style.setProperty("zoom", zoom);
    window.dispatchEvent(new Event("resize"));
  }, value);
}

async function dragResizeHandle(
  page: Page,
  name: string,
  deltaX: number,
  deltaY: number,
) {
  const handle = page.getByLabel(name).first();
  await expect(handle).toBeVisible();
  const box = await handle.boundingBox();
  if (!box) throw new Error(`Resize handle ${name} has no bounding box`);
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + deltaX, startY + deltaY, { steps: 8 });
  await page.mouse.up();
}

async function elementWidth(locator: ReturnType<Page["locator"]>) {
  const box = await locator.boundingBox();
  return box?.width ?? 0;
}

async function panelHeight(page: Page, id: string) {
  return page.evaluate((sectionId) => {
    const panel = document.querySelector<HTMLElement>(
      `[data-section-panel-id="${sectionId}"]`,
    );
    return panel?.getBoundingClientRect().height ?? 0;
  }, id);
}

async function runInteraction(page: Page, check: InteractionCheck) {
  if (check === "activity-tooltip-visible") {
    await page
      .locator('.layout-frame .activity-button[aria-label="Open Diagnostics"]')
      .first()
      .hover();
    const tooltip = page.locator(".tooltip-content").first();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("Open Diagnostics");
    const box = await tooltip.boundingBox();
    expect(box?.width).toBeGreaterThan(80);
    return { check, passed: true, value: "activity tooltip visible" };
  }

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
      page.locator('[data-health-side="right"]').first(),
    ).toBeVisible();
    const inspectorBox = await page
      .locator(".rail-panel-inspector")
      .first()
      .boundingBox();
    const slideBox = await page
      .locator(".rail-panel-slides")
      .first()
      .boundingBox();
    expect(inspectorBox?.width).toBeGreaterThan(slideBox?.width ?? 0);
    return {
      check,
      passed: true,
      value: `health-fixed-right inspector-${Math.round(inspectorBox?.width ?? 0)} slide-${Math.round(slideBox?.width ?? 0)}`,
    };
  }

  if (check === "provenance-raw-copy") {
    await page
      .locator('[data-section-id="raw-details"] .section-summary')
      .first()
      .click();
    await expect(
      page.locator('[data-section-id="raw-details"] pre'),
    ).toHaveCount(0);
    await page.getByRole("button", { name: /Copy to the Clipboard/i }).click();
    await expect(page.locator("[data-copy-status]").first()).toContainText(
      /Raw provenance details (copied|selected)/,
    );
    const overflowModes = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>(".inspector-pane .section-body"),
      ).map((body) => ({
        id: body.closest<HTMLElement>(".section")?.dataset.sectionId ?? "",
        overflowY: getComputedStyle(body).overflowY,
      })),
    );
    expect(overflowModes.every((entry) => entry.overflowY === "auto")).toBe(
      true,
    );
    return { check, passed: true, value: "raw details copy affordance" };
  }

  if (check === "right-inspector-collapsed") {
    const rail = page.locator(".rail-panel-inspector.rail-panel-collapsed");
    await expect(rail.first()).toBeVisible();
    await expect(
      page.locator(".inspector-rail-right.inspector-rail-collapsed"),
    ).toBeVisible();
    await expect(page.locator(".inspector-pane")).toHaveCount(0);
    const railBox = await rail.first().boundingBox();
    expect(railBox?.width).toBeLessThanOrEqual(45);
    const activityBox = await page
      .locator(".inspector-rail-right.inspector-rail-collapsed .activity-bar")
      .first()
      .boundingBox();
    expect(activityBox?.x).toBeGreaterThan(1380);
    return {
      check,
      passed: true,
      value: `rail-width-${Math.round(railBox?.width ?? 0)}`,
    };
  }

  if (check === "fullscreen-next") {
    await expect(
      page.locator(".fullscreen-shell .deck-slide:visible").first(),
    ).toBeVisible();
    const fullscreenColors = await page.evaluate(() => {
      const shell = document.querySelector<HTMLElement>(".fullscreen-shell");
      const slide = document.querySelector<HTMLElement>(
        ".fullscreen-shell .deck-slide",
      );
      const edge = document.querySelector<HTMLElement>(".edge-hit");
      return {
        edgeBackground: edge ? getComputedStyle(edge).backgroundColor : "",
        shellBackground: shell ? getComputedStyle(shell).backgroundColor : "",
        slideBackground: slide ? getComputedStyle(slide).backgroundColor : "",
      };
    });
    expect(fullscreenColors.shellBackground).toBe(
      fullscreenColors.slideBackground,
    );
    expect(fullscreenColors.edgeBackground).toContain("rgba(0, 0, 0, 0.32)");
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

  if (check === "fullscreen-context-menu") {
    await page.mouse.click(320, 240, { button: "right" });
    const menu = page.locator(".fullscreen-menu").first();
    await expect(menu).toBeVisible();
    const box = await menu.boundingBox();
    expect(box?.x).toBeGreaterThanOrEqual(300);
    expect(box?.x).toBeLessThanOrEqual(330);
    expect(box?.y).toBeGreaterThanOrEqual(220);
    expect(box?.y).toBeLessThanOrEqual(250);
    await page.mouse.click(80, 80);
    await expect(menu).toBeHidden();
    await page.mouse.move(720, 480);
    return { check, passed: true, value: "menu anchored and dismissed" };
  }

  if (check === "fullscreen-menu-open") {
    await page.mouse.click(360, 260, { button: "right" });
    const menu = page.locator(".fullscreen-menu").first();
    await expect(menu).toBeVisible();
    const box = await menu.boundingBox();
    expect(box?.x).toBeGreaterThanOrEqual(340);
    expect(box?.x).toBeLessThanOrEqual(370);
    expect(box?.y).toBeGreaterThanOrEqual(240);
    expect(box?.y).toBeLessThanOrEqual(270);
    await expect(
      page.getByRole("button", { name: /presenter view/i }),
    ).toBeVisible();
    return { check, passed: true, value: "menu open at pointer" };
  }

  if (check === "fullscreen-last-exit") {
    await expect(page.locator(".fullscreen-shell").first()).toBeVisible();
    await page
      .locator('button[aria-label="Next action anchor"]:visible')
      .first()
      .click();
    await expect(page.locator(".fullscreen-shell")).toHaveCount(0);
    await expect(page.locator(".app-shell").first()).toBeVisible();
    return { check, passed: true, value: "last anchor exits fullscreen" };
  }

  if (check === "fullscreen-presenter-menu") {
    await page.mouse.click(360, 260, { button: "right" });
    await expect(page.locator(".fullscreen-menu").first()).toBeVisible();
    await page.getByRole("button", { name: /presenter view/i }).click();
    await expect(page.locator(".fullscreen-shell")).toHaveCount(0);
    await expect(page.locator(".presenter-grid").first()).toBeVisible();
    return { check, passed: true, value: "presenter route visible" };
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
      page.locator('.mobile-topic-tabs button[aria-label="Diagnostics"]'),
    ).toBeVisible();
    return { check, passed: true, value: "inspector drawer visible" };
  }

  return { check, passed: false, value: "unhandled" };
}

await main();
