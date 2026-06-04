import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "@playwright/test";

type Scenario = {
  readonly annotation: string;
  readonly name: string;
  readonly query: string;
  readonly viewport: {
    readonly height: number;
    readonly width: number;
  };
};

const repoRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const port = Number(process.env.CADENZA_UI_PROTOTYPE_PORT ?? "4177");
const baseUrl = `http://127.0.0.1:${port}`;
const screenshotDir = resolve(
  repoRoot,
  "design/ui-prototype/evidence/screenshots",
);
const viteBin = resolve(
  repoRoot,
  "node_modules/.pnpm/vite@8.0.10_@types+node@25.6.0_esbuild@0.28.0_terser@5.48.0/node_modules/vite/bin/vite.js",
);
const validationPath = resolve(
  repoRoot,
  "design/ui-prototype/evidence/validation-smoke.json",
);

const scenarios: readonly Scenario[] = [
  {
    annotation:
      "Desktop normal shell: deck-primary three-rail layout, quiet chrome, left static slide rail, right Outline inspector, bottom controls, and persistent status bar.",
    name: "desktop-normal-shell.png",
    query: "/?state=ready&topic=Outline&theme=light",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Desktop diagnostics state: top-center blocking bar, bottom health signal, read-only diagnostic locator/hint, and no repair/editor actions.",
    name: "desktop-diagnostics-state.png",
    query: "/?state=blocked&topic=Diagnostics&theme=light",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Desktop provenance state: dark mode, manifest selector, format capability chips, artifact inventory, and known-limitation sections.",
    name: "desktop-provenance-state.png",
    query: "/?state=provenance&topic=Provenance&theme=dark",
    viewport: { height: 960, width: 1440 },
  },
  {
    annotation:
      "Narrow/mobile viewer state: deck-first responsive viewer with sticky controls and folded inspector access, not a full mobile presenter promise.",
    name: "mobile-viewer-state.png",
    query: "/?state=pending&topic=Readiness&theme=dark",
    viewport: { height: 844, width: 390 },
  },
  {
    annotation:
      "Presenter-view representation: explicit presenter metadata flow with notes hidden from the normal player view and browser multi-screen limitations left for Stage A.",
    name: "presenter-view-state.png",
    query: "/?state=ready&topic=Notes&theme=dark&presenter=true",
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
    [
      viteBin,
      "--config",
      "design/ui-prototype/vite.config.ts",
      "design/ui-prototype",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      cwd: repoRoot,
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
  await page.locator(".deck-slide").waitFor({ state: "visible" });
  const title = await page.locator(".deck-slide h1").textContent();
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow:
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  }));
  const screenshotPath = resolve(screenshotDir, scenario.name);
  await page.screenshot({ fullPage: false, path: screenshotPath });

  return {
    annotation: scenario.annotation,
    hasDeckTitle: Boolean(title?.trim()),
    name: scenario.name,
    overflow,
    query: scenario.query,
    screenshotPath: `design/ui-prototype/evidence/screenshots/${scenario.name}`,
    viewport: scenario.viewport,
  };
}

await main();
