import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixtureBundlePath = path.resolve(
  currentDir,
  "../../tmp/cadenza-browser-fixture.js",
);

type RemotionPreviewMountResult = {
  playerProps: {
    compositionHeight: number;
    compositionWidth: number;
    durationInFrames: number;
    fps: number;
  };
  timeline: {
    fps: number;
    totalFrames: number;
  };
};

declare global {
  interface Window {
    CadenzaRemotionPreview: {
      mountAllDomainMvpPreview(
        selector: string,
        config: { compositionHeight: number; compositionWidth: number },
      ): RemotionPreviewMountResult;
    };
  }
}

async function loadCadenzaFixture(page: Page) {
  await page.addScriptTag({
    path: fixtureBundlePath,
  });
}

test.describe("B2.2 Remotion preview adapter", () => {
  test("TC-PRAD-001 mounts the all-domain fixture in a real Remotion Player with timeline-derived props", async ({
    page,
  }) => {
    await page.setContent('<main><div id="preview-root"></div></main>');
    await loadCadenzaFixture(page);

    const mount = await page.evaluate(() =>
      window.CadenzaRemotionPreview.mountAllDomainMvpPreview("#preview-root", {
        compositionHeight: 540,
        compositionWidth: 960,
      }),
    );

    const preview = page.locator("[data-cadenza-remotion-preview]");
    await expect(preview).toBeVisible();
    await expect(preview.locator(".__remotion-player")).toBeVisible();
    await expect(
      page.locator('[data-cadenza-slide-id="opening"]'),
    ).toContainText("Cadenza: reliable AI-authored technical talks");
    await expect(
      page.locator('[data-cadenza-resource-kind="font"]'),
    ).toHaveAttribute("data-cadenza-resource-id", "talk-font");
    await expect(
      page.locator("[data-cadenza-presenter-notes]").first(),
    ).toContainText("reliable AI-authored decks");

    await expect(preview).toHaveAttribute(
      "data-cadenza-duration-in-frames",
      String(mount.timeline.totalFrames),
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-fps",
      String(mount.timeline.fps),
    );
    await expect(preview).toHaveAttribute("data-cadenza-width", "960");
    await expect(preview).toHaveAttribute("data-cadenza-height", "540");

    expect(mount.playerProps).toEqual({
      compositionHeight: 540,
      compositionWidth: 960,
      durationInFrames: mount.timeline.totalFrames,
      fps: mount.timeline.fps,
    });
    expect(await page.evaluate(() => window.remotion_isPlayer)).toBe(true);
  });
});
