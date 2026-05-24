import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { expect, type Page, test } from "@playwright/test";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixtureBundlePath = path.resolve(
  currentDir,
  "../../tmp/cadenza-browser-fixture.js",
);
const phase3RepairEvidenceJsonPath = path.resolve(
  currentDir,
  "../../trace/phase3/evidence/b3.2-repair-evidence.json",
);
const phase3RepairEvidenceSummaryPath = path.resolve(
  currentDir,
  "../../trace/phase3/evidence/b3.2-repair-evidence.md",
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
  diagnostics: Array<{
    code: string;
    requirementId: string;
    severity: string;
    source?: string | undefined;
  }>;
  playerFrame: number;
  presenterMetadata: {
    notes: string[];
    slideId: string;
    stepIndex: number;
  };
};

type RemotionPreviewWindow = Window & {
  CadenzaRemotionPreview: {
    dispatchPreviewImageError(resourceId: string): void;
    dispatchPreviewImageLoad(resourceId: string): void;
    dispatchPreviewVideoMetadata(resourceId: string): void;
    goto(slideId: string, stepIndex?: number): void;
    mountAllDomainMvpPreview(
      selector: string,
      config: { compositionHeight: number; compositionWidth: number },
    ): RemotionPreviewMountResult;
    mountControlledReadinessPreview(
      selector: string,
      config: {
        compositionHeight: number;
        compositionWidth: number;
        resourceTimeoutMs?: number;
      },
    ): RemotionPreviewMountResult;
    mountControlledValidationPreview(
      selector: string,
      config: { compositionHeight: number; compositionWidth: number },
    ): RemotionPreviewMountResult;
    mountErrorDiagnosticsPreview(
      selector: string,
      config: { compositionHeight: number; compositionWidth: number },
    ): RemotionPreviewMountResult;
    mountPhase3AcceptancePreview(
      selector: string,
      config: { compositionHeight: number; compositionWidth: number },
    ): RemotionPreviewMountResult;
    mountPhase3PreviewRepairCandidate(
      selector: string,
      config: { compositionHeight: number; compositionWidth: number },
    ): RemotionPreviewMountResult;
    mountPhase4DogfoodPreview(
      selector: string,
      config: {
        compositionHeight: number;
        compositionWidth: number;
        controls?: boolean;
      },
    ): RemotionPreviewMountResult;
    markPreviewResourceReady(resourceId: string): void;
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

test.describe("B4 dogfood preview visual navigation", () => {
  test("shows the current Phase 4 slide and cumulative step content like a presenter preview", async ({
    page,
  }) => {
    await page.setContent('<main><div id="preview-root"></div></main>');
    await loadCadenzaFixture(page);

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountPhase4DogfoodPreview("#preview-root", {
        compositionHeight: 540,
        compositionWidth: 960,
      }),
    );

    const preview = page.locator("[data-cadenza-remotion-preview]");
    await expect(preview).toBeVisible();
    await expect(
      page.locator('[data-cadenza-slide-id="architecture-contract"]'),
    ).toContainText("Cadenza turns typed TSX into inspectable technical talks");
    await expect(
      page.locator('[data-cadenza-slide-id="timeline-compiler"]'),
    ).toHaveCount(0);
    await expect(
      preview.locator("[data-cadenza-presenter-notes]"),
    ).toBeHidden();
    await expect(preview.getByText("font: phase-4-talk-font")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Goto render-safe-demo" }),
    ).toHaveCount(0);

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.navigateNext(),
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-slide-id",
      "architecture-contract",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-step-index",
      "1",
    );
    await expect(
      page.locator('[data-cadenza-slide-id="architecture-contract"]'),
    ).toContainText("Authoring, compiler timeline");

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.navigateNext(),
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-slide-id",
      "timeline-compiler",
      { timeout: 4_000 },
    );
    await expect(
      page.locator('[data-cadenza-slide-id="timeline-compiler"]'),
    ).toContainText("Slide semantics compile into frame anchors");
    await expect(
      page.locator('[data-cadenza-slide-id="architecture-contract"]'),
    ).toHaveCount(0);
  });

  test("keeps dense reliability-budget copy readable inside the Player viewport", async ({
    page,
  }) => {
    await page.setContent('<main><div id="preview-root"></div></main>');
    await loadCadenzaFixture(page);

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountPhase4DogfoodPreview("#preview-root", {
        compositionHeight: 540,
        compositionWidth: 960,
        controls: true,
      }),
    );

    const preview = page.locator("[data-cadenza-remotion-preview]");
    await expect(preview).toBeVisible();

    await page.evaluate(() =>
      (window as unknown as RemotionPreviewWindow).CadenzaRemotionPreview.goto(
        "preview-reliability-budget",
        1,
      ),
    );

    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-slide-id",
      "preview-reliability-budget",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-step-index",
      "1",
    );

    const typography = page.locator(
      '[data-cadenza-typography-box="preview-reliability-budget-density"]',
    );
    await expect(typography).toContainText("Compiler evidence");
    await expect(typography).toHaveAttribute(
      "data-cadenza-typography-auto-fit",
      "fitted",
    );
    await expect(typography).toHaveAttribute(
      "data-cadenza-typography-overflow-fallback",
      "false",
    );

    const typographyOverflow = await typography.evaluate((element) => ({
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      scrollWidth: element.scrollWidth,
    }));
    expect(typographyOverflow.scrollHeight).toBeLessThanOrEqual(
      typographyOverflow.clientHeight,
    );
    expect(typographyOverflow.scrollWidth).toBeLessThanOrEqual(
      typographyOverflow.clientWidth,
    );

    const player = preview.locator(".cadenza-remotion-player");
    const playerBox = await player.boundingBox();
    const typographyBox = await typography.boundingBox();
    expect(playerBox).not.toBeNull();
    expect(typographyBox).not.toBeNull();
    if (playerBox === null || typographyBox === null) {
      throw new Error("Missing dogfood Player or reliability copy bounds.");
    }

    expect(typographyBox.y + typographyBox.height).toBeLessThanOrEqual(
      playerBox.y + playerBox.height - 56,
    );
  });
});

test.describe("B2.4 render-safe readiness in Remotion preview", () => {
  test("TC-RSRM-001 reports structured image diagnostics from the browser load path", async ({
    page,
  }) => {
    await page.setContent('<main><div id="preview-root"></div></main>');
    await loadCadenzaFixture(page);

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountControlledReadinessPreview(
        "#preview-root",
        {
          compositionHeight: 540,
          compositionWidth: 960,
        },
      ),
    );

    const preview = page.locator("[data-cadenza-remotion-preview]");
    await expect(preview).toBeVisible();

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.dispatchPreviewImageError("controlled-image"),
    );

    await expect
      .poll(() => windowSnapshot(page))
      .toMatchObject({
        diagnostics: [
          {
            code: "RSRM_IMAGE_LOAD_FAILED",
            requirementId: "RSRM-002",
            severity: "warning",
            source: "controlled-image",
          },
        ],
      });
    await expect(preview).toHaveAttribute("data-cadenza-diagnostic-count", "1");
  });

  test("TC-RSRM-001 gates slide entry and preview buffering until image, font, and video readiness are observable", async ({
    page,
  }) => {
    await page.setContent('<main><div id="preview-root"></div></main>');
    await loadCadenzaFixture(page);

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountControlledReadinessPreview(
        "#preview-root",
        {
          compositionHeight: 540,
          compositionWidth: 960,
        },
      ),
    );

    const preview = page.locator("[data-cadenza-remotion-preview]");
    await expect(preview).toBeVisible();

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.navigateNext(),
    );

    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-kind",
      "loading",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-slide-id",
      "readiness",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-loading-reason",
      "asset",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-preview-buffering",
      "true",
    );
    await expect(
      page.locator('[data-cadenza-resource-id="controlled-image"]'),
    ).toHaveAttribute("data-cadenza-resource-ready", "false");

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.dispatchPreviewImageLoad("controlled-image"),
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-loading-reason",
      "font",
    );
    await expect(
      page.locator('[data-cadenza-resource-id="controlled-font"]'),
    ).toHaveCSS("visibility", "hidden");

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.markPreviewResourceReady("controlled-font"),
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-loading-reason",
      "video",
    );
    await expect(
      page.locator('[data-cadenza-resource-id="controlled-font"]'),
    ).toHaveCSS("visibility", "visible");

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.dispatchPreviewVideoMetadata("controlled-video"),
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-kind",
      "at-step",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-slide-id",
      "readiness",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-cursor-step-index",
      "0",
    );
    await expect(preview).toHaveAttribute(
      "data-cadenza-preview-buffering",
      "false",
    );
    await expect(
      page.locator('[data-cadenza-resource-id="controlled-video"]'),
    ).toHaveAttribute("data-cadenza-resource-ready", "true");
  });

  test("TC-RSRM-001 degrades video readiness after metadata timeout with diagnostics", async ({
    page,
  }) => {
    await page.setContent('<main><div id="preview-root"></div></main>');
    await loadCadenzaFixture(page);

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountControlledReadinessPreview(
        "#preview-root",
        {
          compositionHeight: 540,
          compositionWidth: 960,
          resourceTimeoutMs: 30,
        },
      ),
    );

    const preview = page.locator("[data-cadenza-remotion-preview]");
    await expect(preview).toBeVisible();

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.navigateNext(),
    );
    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.dispatchPreviewImageLoad("controlled-image"),
    );
    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.markPreviewResourceReady("controlled-font"),
    );

    await expect(preview).toHaveAttribute(
      "data-cadenza-loading-reason",
      "video",
    );
    await expect
      .poll(() => windowSnapshot(page))
      .toMatchObject({
        cursor: {
          kind: "at-step",
          slideId: "readiness",
          stepIndex: 0,
        },
        diagnostics: [
          {
            code: "RSAF_RESOURCE_TIMEOUT",
            requirementId: "VAL-005",
            severity: "warning",
            source: "controlled-video",
          },
        ],
      });
    await expect(preview).toHaveAttribute("data-cadenza-diagnostic-count", "1");
    await expect(preview).toHaveAttribute(
      "data-cadenza-preview-buffering",
      "false",
    );
  });
});

test.describe("B2.5 render-safe browser validation", () => {
  test("TC-RSRM-006 exposes browser measurements and metadata for render-safe preview surfaces", async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <style>
          [data-cadenza-typography-box="validation-title"] span {
            white-space: nowrap;
          }

          [data-cadenza-media-frame="validation-frame"] {
            aspect-ratio: auto !important;
            display: block;
            height: 240px !important;
            width: 240px !important;
          }
        </style>
        <div id="preview-root"></div>
      </main>
    `);
    await loadCadenzaFixture(page);

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountControlledValidationPreview(
        "#preview-root",
        {
          compositionHeight: 540,
          compositionWidth: 960,
        },
      ),
    );

    const preview = page.locator("[data-cadenza-remotion-preview]");
    await expect(preview).toBeVisible();

    const typography = page.locator(
      '[data-cadenza-typography-box="validation-title"]',
    );
    await expect(typography).toHaveAttribute(
      "data-cadenza-requirements",
      /RSRM-006/,
    );
    await expect(typography).toHaveAttribute(
      "data-cadenza-typography-client-width",
      /[1-9]\d*/,
    );
    const typographyMeasurement = await typography.evaluate((element) => ({
      clientWidth: Number(
        element.getAttribute("data-cadenza-typography-client-width"),
      ),
      scrollWidth: Number(
        element.getAttribute("data-cadenza-typography-scroll-width"),
      ),
    }));
    expect(typographyMeasurement.scrollWidth).toBeGreaterThan(
      typographyMeasurement.clientWidth,
    );

    const mediaFrame = page.locator(
      '[data-cadenza-media-frame="validation-frame"]',
    );
    await expect(mediaFrame).toHaveAttribute(
      "data-cadenza-requirements",
      /RSRM-007/,
    );
    await expect(mediaFrame).toHaveAttribute(
      "data-cadenza-media-frame-client-width",
      "240",
    );
    await expect(mediaFrame).toHaveAttribute(
      "data-cadenza-media-frame-client-height",
      "240",
    );

    const contentSlot = page.locator(
      '[data-cadenza-content-slot="validation-slot"]',
    );
    await expect(contentSlot).toHaveAttribute(
      "data-cadenza-requirements",
      /RSRM-008/,
    );
    await expect(contentSlot).toHaveAttribute(
      "data-cadenza-density",
      "compact",
    );
    await expect(contentSlot).toHaveAttribute(
      "data-cadenza-readability",
      "headline",
    );

    await expect
      .poll(() => windowSnapshot(page))
      .toMatchObject({
        diagnostics: expect.arrayContaining([
          expect.objectContaining({
            code: "RSRM_TYPOGRAPHY_OVERFLOW",
            requirementId: "RSRM-006",
            severity: "warning",
            source: "validation-title",
          }),
          expect.objectContaining({
            code: "RSRM_MEDIAFRAME_ASPECT_RATIO",
            requirementId: "RSRM-007",
            severity: "warning",
            source: "validation-frame",
          }),
        ]),
      });
  });

  test("TC-BROW-006 samples preview pixels for nonblank and correctly framed Player output", async ({
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
    await expect(preview).toHaveAttribute(
      "data-cadenza-requirements",
      /BROW-006/,
    );

    const player = preview.locator(".cadenza-remotion-player");
    await expect(player).toBeVisible();

    const playerBox = await player.boundingBox();
    expect(playerBox).not.toBeNull();
    if (playerBox === null) {
      throw new Error("Missing Remotion Player bounds.");
    }
    expect(playerBox.width).toBeGreaterThan(300);
    expect(playerBox.height).toBeGreaterThan(160);
    expect(playerBox.width / playerBox.height).toBeCloseTo(16 / 9, 1);

    const screenshot = await player.screenshot();
    expect(inspectPngVisualSanity(screenshot)).toMatchObject({
      hasNonBackgroundContrast: true,
      height: expect.any(Number),
      sampledOpaquePixels: expect.any(Number),
      uniqueRgbColors: expect.any(Number),
      width: expect.any(Number),
    });
  });
});

test.describe("B2.7 closeout remediation evidence", () => {
  test("TC-PRAD-007 reports Remotion Player errors and Cadenza diagnostics through one preview channel", async ({
    page,
  }) => {
    await page.setContent('<main><div id="preview-root"></div></main>');
    await loadCadenzaFixture(page);

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountErrorDiagnosticsPreview("#preview-root", {
        compositionHeight: 540,
        compositionWidth: 960,
      }),
    );

    const preview = page.locator("[data-cadenza-remotion-preview]");
    await expect(preview).toHaveAttribute(
      "data-cadenza-requirements",
      /PRAD-007/,
    );

    await expect
      .poll(() => windowSnapshot(page))
      .toMatchObject({
        diagnostics: expect.arrayContaining([
          expect.objectContaining({
            code: "PRAD_REMOTION_PLAYER_ERROR",
            requirementId: "PRAD-007",
            severity: "fatal",
            source: "remotion-player",
          }),
        ]),
      });
    await expect(preview).toHaveAttribute("data-cadenza-diagnostic-count", "1");
  });
});

test.describe("B3.2 Phase 3 preview diagnostics and repair evidence", () => {
  test("TC-AUTH-003 + TC-AUTH-004 + TC-DIAG-002 + TC-DIAG-003 mounts, diagnoses, and records one repair loop", async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <style>
          [data-cadenza-typography-box="local-loop-title"] span {
            white-space: nowrap;
          }
        </style>
        <div id="preview-root"></div>
      </main>
    `);
    await loadCadenzaFixture(page);

    const beforeMount = await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountPhase3PreviewRepairCandidate(
        "#preview-root",
        {
          compositionHeight: 540,
          compositionWidth: 960,
        },
      ),
    );
    expect(beforeMount.timeline.totalFrames).toBeGreaterThan(0);

    await expect
      .poll(() => phase3TypographyDiagnostic(page))
      .toMatchObject({
        code: "RSRM_TYPOGRAPHY_OVERFLOW",
        requirementId: "RSRM-006",
        severity: "warning",
        source: "local-loop-title",
      });

    const beforeSnapshot = await windowSnapshot(page);
    await expect(
      page.locator("[data-cadenza-remotion-preview]"),
    ).toHaveAttribute("data-cadenza-diagnostic-count", /[1-9]\d*/);

    const afterMount = await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountPhase3AcceptancePreview("#preview-root", {
        compositionHeight: 540,
        compositionWidth: 960,
      }),
    );
    expect(afterMount.timeline.totalFrames).toBe(
      beforeMount.timeline.totalFrames,
    );

    await expect
      .poll(async () => (await windowSnapshot(page)).cursor)
      .toMatchObject({
        kind: "at-step",
        slideId: "loop-contract",
        stepIndex: 0,
      });

    const afterSnapshot = await windowSnapshot(page);
    expect(afterSnapshot.diagnostics).toEqual([]);
    expect(phase3TypographyDiagnosticFrom(afterSnapshot)).toBeUndefined();
    await expect(
      page.locator('[data-cadenza-slide-id="loop-contract"]'),
    ).toContainText("AI-authored decks start with typed Cadenza TSX");

    await page.evaluate(() =>
      (
        window as unknown as RemotionPreviewWindow
      ).CadenzaRemotionPreview.mountErrorDiagnosticsPreview("#preview-root", {
        compositionHeight: 540,
        compositionWidth: 960,
      }),
    );
    await expect
      .poll(() => windowSnapshot(page))
      .toMatchObject({
        diagnostics: expect.arrayContaining([
          expect.objectContaining({
            code: "PRAD_REMOTION_PLAYER_ERROR",
            requirementId: "PRAD-007",
            severity: "fatal",
            source: "remotion-player",
          }),
        ]),
      });

    const evidence = readPhase3RepairEvidence();
    const beforeDiagnostic = phase3TypographyDiagnosticFrom(beforeSnapshot);
    if (beforeDiagnostic === undefined) {
      throw new Error("Expected the Phase 3 repair candidate diagnostic.");
    }
    expect(evidence).toMatchObject({
      schemaVersion: 1,
      acceptanceEvidenceKind: "browser-preview-snapshot",
      authoredDeckPath: "examples/phase3/acceptance-deck.tsx",
      repairedDeckPath: "examples/phase3/acceptance-deck.tsx",
      scenarioIds: ["TC-AUTH-003", "TC-AUTH-004", "TC-DIAG-002", "TC-DIAG-003"],
      repairScope: {
        allowedEdits: ["examples/phase3/acceptance-deck.tsx"],
        frameworkInternalEdits: [],
      },
    });
    expect(evidence.before.previewDiagnostics).toEqual([
      expect.objectContaining(beforeDiagnostic),
    ]);
    expect(evidence.after.previewDiagnostics).toEqual([]);
    expect(evidence.before.repairQueue[0]).toMatchObject({
      code: "RSRM_TYPOGRAPHY_OVERFLOW",
      locator: {
        componentId: "local-loop-title",
        slideId: "loop-contract",
      },
      requirementRefs: ["DIAG-002", "DIAG-005", "DIAG-006"],
      testRefs: ["TC-AUTH-004", "TC-DIAG-003"],
    });
    expect(readPhase3RepairEvidenceSummary()).toContain("B3.2 repair evidence");
  });
});

async function windowSnapshot(page: Page): Promise<RemotionPreviewSnapshot> {
  return page.evaluate(() =>
    (
      window as unknown as RemotionPreviewWindow
    ).CadenzaRemotionPreview.snapshot(),
  );
}

async function phase3TypographyDiagnostic(
  page: Page,
): Promise<RemotionPreviewSnapshot["diagnostics"][number] | undefined> {
  return phase3TypographyDiagnosticFrom(await windowSnapshot(page));
}

function phase3TypographyDiagnosticFrom(
  snapshot: RemotionPreviewSnapshot,
): RemotionPreviewSnapshot["diagnostics"][number] | undefined {
  return snapshot.diagnostics.find(
    (diagnostic) =>
      diagnostic.code === "RSRM_TYPOGRAPHY_OVERFLOW" &&
      diagnostic.source === "local-loop-title",
  );
}

function readPhase3RepairEvidence(): {
  acceptanceEvidenceKind: string;
  after: {
    previewDiagnostics: unknown[];
  };
  authoredDeckPath: string;
  before: {
    previewDiagnostics: unknown[];
    repairQueue: Array<{
      code: string;
      locator: {
        componentId: string;
        slideId: string;
      };
      requirementRefs: string[];
      testRefs: string[];
    }>;
  };
  repairedDeckPath: string;
  repairScope: {
    allowedEdits: string[];
    frameworkInternalEdits: string[];
  };
  scenarioIds: string[];
  schemaVersion: number;
} {
  return JSON.parse(readFileSync(phase3RepairEvidenceJsonPath, "utf8"));
}

function readPhase3RepairEvidenceSummary(): string {
  return readFileSync(phase3RepairEvidenceSummaryPath, "utf8");
}

type PngVisualSanity = {
  hasNonBackgroundContrast: boolean;
  height: number;
  sampledOpaquePixels: number;
  uniqueRgbColors: number;
  width: number;
};

function inspectPngVisualSanity(buffer: Buffer): PngVisualSanity {
  const png = decodePng(buffer);
  const colors = new Set<string>();
  let sampledOpaquePixels = 0;
  let hasLightPixel = false;
  let hasDarkPixel = false;
  const stride = Math.max(1, Math.floor((png.width * png.height) / 1_000));

  for (let pixel = 0; pixel < png.width * png.height; pixel += stride) {
    const offset = pixel * 4;
    const red = png.pixels[offset] ?? 0;
    const green = png.pixels[offset + 1] ?? 0;
    const blue = png.pixels[offset + 2] ?? 0;
    const alpha = png.pixels[offset + 3] ?? 255;

    if (alpha < 16) {
      continue;
    }

    sampledOpaquePixels += 1;
    colors.add(`${red}:${green}:${blue}`);

    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    hasLightPixel ||= luminance > 180;
    hasDarkPixel ||= luminance < 80;
  }

  return {
    hasNonBackgroundContrast:
      sampledOpaquePixels > 100 &&
      colors.size > 4 &&
      hasLightPixel &&
      hasDarkPixel,
    height: png.height,
    sampledOpaquePixels,
    uniqueRgbColors: colors.size,
    width: png.width,
  };
}

function decodePng(buffer: Buffer): {
  height: number;
  pixels: Uint8Array;
  width: number;
} {
  if (buffer.toString("ascii", 1, 4) !== "PNG") {
    throw new Error("Expected a PNG screenshot.");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idatChunks: Buffer[] = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;

    if (type === "IHDR") {
      width = buffer.readUInt32BE(dataStart);
      height = buffer.readUInt32BE(dataStart + 4);
      const bitDepth = buffer[dataStart + 8];
      colorType = buffer[dataStart + 9] ?? 0;
      if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
        throw new Error(
          `Unsupported PNG format bitDepth=${bitDepth} colorType=${colorType}.`,
        );
      }
    } else if (type === "IDAT") {
      idatChunks.push(buffer.subarray(dataStart, dataEnd));
    } else if (type === "IEND") {
      break;
    }

    offset = dataEnd + 4;
  }

  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const rawStride = width * bytesPerPixel;
  const previous = new Uint8Array(rawStride);
  const current = new Uint8Array(rawStride);
  const pixels = new Uint8Array(width * height * 4);
  let readOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[readOffset] ?? 0;
    readOffset += 1;
    current.set(inflated.subarray(readOffset, readOffset + rawStride));
    readOffset += rawStride;
    unfilterPngScanline(current, previous, bytesPerPixel, filter);

    for (let x = 0; x < width; x += 1) {
      const inputOffset = x * bytesPerPixel;
      const outputOffset = (y * width + x) * 4;
      pixels[outputOffset] = current[inputOffset] ?? 0;
      pixels[outputOffset + 1] = current[inputOffset + 1] ?? 0;
      pixels[outputOffset + 2] = current[inputOffset + 2] ?? 0;
      pixels[outputOffset + 3] =
        colorType === 6 ? (current[inputOffset + 3] ?? 255) : 255;
    }

    previous.set(current);
  }

  return { height, pixels, width };
}

function unfilterPngScanline(
  current: Uint8Array,
  previous: Uint8Array,
  bytesPerPixel: number,
  filter: number,
): void {
  for (let index = 0; index < current.length; index += 1) {
    const left =
      index >= bytesPerPixel ? (current[index - bytesPerPixel] ?? 0) : 0;
    const up = previous[index] ?? 0;
    const upLeft =
      index >= bytesPerPixel ? (previous[index - bytesPerPixel] ?? 0) : 0;

    if (filter === 1) {
      current[index] = ((current[index] ?? 0) + left) & 255;
    } else if (filter === 2) {
      current[index] = ((current[index] ?? 0) + up) & 255;
    } else if (filter === 3) {
      current[index] =
        ((current[index] ?? 0) + Math.floor((left + up) / 2)) & 255;
    } else if (filter === 4) {
      current[index] =
        ((current[index] ?? 0) + paethPredictor(left, up, upLeft)) & 255;
    } else if (filter !== 0) {
      throw new Error(`Unsupported PNG filter ${filter}.`);
    }
  }
}

function paethPredictor(left: number, up: number, upLeft: number): number {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) {
    return left;
  }

  return upDistance <= upLeftDistance ? up : upLeft;
}
