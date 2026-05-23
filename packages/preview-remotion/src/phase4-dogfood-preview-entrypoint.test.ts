import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  createPhase4DogfoodPreviewProps,
  PHASE4_DOGFOOD_PREVIEW_ROUTE,
  phase4DogfoodPreviewDescriptor,
} from "../../../examples/phase4/preview.js";

describe("B4.1 Phase 4 dogfood local preview entrypoint", () => {
  it("TC-DOGF-002 exposes a maintainer-facing Remotion Player preview command without Playwright as the primary interface", () => {
    const playerProps = createPhase4DogfoodPreviewProps({
      compositionHeight: 720,
      compositionWidth: 1280,
    });
    const rootManifest = readJson("package.json");
    const previewSource = readText("examples/phase4/preview.jsx");
    const previewServerSource = readText("examples/phase4/serve-preview.mjs");
    const previewHtml = readText("examples/phase4/index.html");

    expect(PHASE4_DOGFOOD_PREVIEW_ROUTE).toBe("/");
    expect(phase4DogfoodPreviewDescriptor).toMatchObject({
      command: "pnpm preview:phase4",
      rootElementId: "cadenza-phase4-preview-root",
      route: "/",
      talkSource: "examples/phase4/dogfood-talk.tsx",
    });
    expect(rootManifest.scripts?.["preview:phase4"]).toBe(
      "node examples/phase4/serve-preview.mjs",
    );

    expect(playerProps).toMatchObject({
      compositionHeight: 720,
      compositionWidth: 1280,
      controls: true,
    });
    expect(playerProps.timeline.slides[0]?.slideId).toBe(
      "architecture-contract",
    );
    expect(playerProps.timeline.totalFrames).toBeGreaterThan(0);

    expect(previewSource).toContain("CadenzaPlayer");
    expect(previewSource).toContain("data-cadenza-phase4-dogfood-preview");
    expect(previewSource).toContain("phase4DogfoodTalkMetadata.outline");
    expect(previewHtml).toContain("cadenza-phase4-preview-root");
    expect(previewHtml).toContain("phase4-dogfood-preview.js");
    expect(previewServerSource).toContain("phase4-dogfood-preview.js");
    expect(previewServerSource).toContain("http://127.0.0.1");

    for (const text of [
      previewSource,
      previewHtml,
      previewServerSource,
      rootManifest.scripts?.["preview:phase4"] ?? "",
    ]) {
      expect(text).not.toContain("playwright");
      expect(text).not.toContain("@playwright/test");
    }
  });
});

function readJson(relativePath: string): {
  scripts?: Record<string, string>;
} {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}
