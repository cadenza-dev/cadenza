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

type RemotionPreviewSnapshot = {
  cursor: {
    kind: string;
    slideId?: string;
    stepIndex?: number;
  };
  playerFrame: number;
  presenterMetadata: {
    notes: string[];
    slideId: string;
    stepIndex: number;
  };
};

type RemotionPreviewWindow = Window & {
  CadenzaRemotionPreview: {
    goto(slideId: string, stepIndex?: number): void;
    mountAllDomainMvpPreview(
      selector: string,
      config: { compositionHeight: number; compositionWidth: number },
    ): RemotionPreviewMountResult;
    nativeSeekToFrame(frame: number): void;
    navigateNext(): void;
    navigatePrevious(): void;
    snapshot(): RemotionPreviewSnapshot;
  };
  remotion_isPlayer?: boolean;
};

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
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountAllDomainMvpPreview("#preview-root", {
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
    expect(
      await page.evaluate(
        () => (window as unknown as RemotionPreviewWindow).remotion_isPlayer,
      ),
    ).toBe(true);
  });
});

test.describe("B2.3 Remotion preview navigation", () => {
  test("TC-PRAD-003 advances through runtime anchors and pauses at semantic anchors after transitions", async ({
    page,
  }) => {
    await page.setContent('<main><div id="preview-root"></div></main>');
    await loadCadenzaFixture(page);

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountAllDomainMvpPreview("#preview-root", {
        compositionHeight: 540,
        compositionWidth: 960,
      }),
    );

    const preview = page.locator("[data-cadenza-remotion-preview]");
    await expect(preview).toBeVisible();

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.navigateNext(),
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-slide-id",
      "opening",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-step-index",
      "1",
    );

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.navigateNext(),
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-slide-id",
      "render-safe-demo",
      { timeout: 4_000 },
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-step-index",
      "0",
    );
    await expect(preview).toHaveAttribute("data-cadenza-player-frame", "60");
  });

  test("TC-PRAD-004 synchronizes cursor and presenter metadata from native Player seeking", async ({
    page,
  }) => {
    await page.setContent('<main><div id="preview-root"></div></main>');
    await loadCadenzaFixture(page);

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountAllDomainMvpPreview("#preview-root", {
        compositionHeight: 540,
        compositionWidth: 960,
      }),
    );

    const preview = page.locator("[data-cadenza-remotion-preview]");
    await expect(preview).toBeVisible();

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.nativeSeekToFrame(96),
    );

    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-slide-id",
      "render-safe-demo",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-step-index",
      "2",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-presenter-slide-id",
      "render-safe-demo",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-presenter-step-index",
      "2",
    );
    await expect(preview).toHaveAttribute("data-cadenza-player-frame", "96");

    await expect
      .poll(() => windowSnapshot(page))
      .toMatchObject({
        cursor: {
          kind: "at-step",
          slideId: "render-safe-demo",
          stepIndex: 2,
        },
        playerFrame: 96,
        presenterMetadata: {
          notes: [
            "Show that render-safe resources are declared before the demo slide.",
          ],
          slideId: "render-safe-demo",
          stepIndex: 2,
        },
      });
  });
});

async function windowSnapshot(page: Page): Promise<RemotionPreviewSnapshot> {
  return page.evaluate(() =>
    (
      window as unknown as RemotionPreviewWindow
    ).CadenzaRemotionPreview.snapshot(),
  );
}
