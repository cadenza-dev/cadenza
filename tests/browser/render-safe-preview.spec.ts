import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixtureBundlePath = path.resolve(
  currentDir,
  "../../tmp/cadenza-browser-fixture.js",
);

async function loadCadenzaFixture(page: Page) {
  await page.addScriptTag({
    path: fixtureBundlePath,
  });
}

test.describe("B1.3 browser preview harness", () => {
  test("TC-RSAF-005 measures TypographyBox overflow in a real browser DOM", async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div
          data-cadenza-source="hero-title"
          style="
            box-sizing: border-box;
            font: 20px Arial, sans-serif;
            height: 28px;
            overflow: hidden;
            white-space: nowrap;
            width: 120px;
          "
        >
          This technical talk title is intentionally too wide.
        </div>
      </main>
    `);
    await loadCadenzaFixture(page);

    const diagnostics = await page.evaluate(() =>
      window.CadenzaBrowserFixture.validateTypographyOverflow("hero-title"),
    );

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "RSAF_TYPOGRAPHY_OVERFLOW",
        requirementId: "VAL-004",
        severity: "warning",
        source: "hero-title",
      }),
    ]);
  });

  test("TC-PLAY-004 routes real browser click coordinates through hit regions", async ({
    page,
  }) => {
    await page.setContent(`
      <button
        id="preview-surface"
        style="
          border: 0;
          display: block;
          height: 200px;
          margin: 40px;
          padding: 0;
          width: 400px;
        "
      >
        preview surface
      </button>
    `);
    await loadCadenzaFixture(page);
    await page.evaluate(() =>
      window.CadenzaBrowserFixture.installClickRegions("#preview-surface"),
    );

    const bounds = await page.locator("#preview-surface").boundingBox();
    expect(bounds).not.toBeNull();
    if (bounds === null) {
      throw new Error("Missing preview surface bounds.");
    }

    await page.mouse.click(bounds.x + bounds.width * 0.75, bounds.y + 20);
    await page.mouse.click(bounds.x + 20, bounds.y + 20);
    await page.mouse.click(bounds.x + 20, bounds.y + bounds.height * 0.75);

    expect(
      await page.evaluate(() => window.CadenzaBrowserFixture.clickCalls()),
    ).toEqual(["next", "previous", "goto:details:2"]);

    await page.evaluate(() =>
      window.CadenzaBrowserFixture.unbindClickRegions(),
    );
    await page.mouse.click(bounds.x + bounds.width * 0.75, bounds.y + 20);

    expect(
      await page.evaluate(() => window.CadenzaBrowserFixture.clickCalls()),
    ).toEqual(["next", "previous", "goto:details:2"]);
  });

  test("TC-PLAY-004 exposes browser fullscreen capability to controls", async ({
    page,
  }) => {
    await page.setContent("<main>preview surface</main>");
    await loadCadenzaFixture(page);

    await expect
      .poll(() =>
        page.evaluate(() => window.CadenzaBrowserFixture.fullscreenSupport()),
      )
      .toEqual({
        isFullscreen: false,
        isSupported: true,
      });
  });
});
