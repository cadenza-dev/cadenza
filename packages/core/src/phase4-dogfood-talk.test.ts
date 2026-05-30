import { readFileSync } from "node:fs";
import path from "node:path";
import { compile, type DeckNode } from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";
import {
  createPhase4DogfoodTalkFixture,
  phase4DogfoodTalkMetadata,
} from "../../../examples/phase4/dogfood-talk.tsx";

describe("B4.1 Phase 4 dogfood technical talk", () => {
  it("TC-DOGF-001 uses public Cadenza TSX, render-safe surfaces, notes, chapters, and previewable transitions", () => {
    const fixture = createPhase4DogfoodTalkFixture();
    const source = readText("examples/phase4/dogfood-talk.tsx");

    expect(source).toContain('from "@cadenza-dev/core";');
    expect(source).not.toMatch(/from ["'](?:\.\.?\/|@remotion\/|remotion\b)/);
    expect(source).not.toContain("useCurrentFrame");
    expect(source).not.toContain("delayRender");
    expect(source).not.toContain("continueRender");
    expect(source).not.toContain("TransitionSeries");

    expect(path.dirname(phase4DogfoodTalkMetadata.sourcePath)).toBe(
      "examples/phase4",
    );
    expect(phase4DogfoodTalkMetadata.sourcePath).not.toMatch(
      /(?:^|\/)(?:packages\/.*\/src|tests?\/)/,
    );
    expect(phase4DogfoodTalkMetadata.topic).toBe("Cadenza architecture talk");
    expect(
      phase4DogfoodTalkMetadata.outline.map((entry) => entry.slideId),
    ).toEqual([
      "architecture-contract",
      "timeline-compiler",
      "preview-reliability-budget",
      "product-layer-loop",
    ]);
    expect(
      phase4DogfoodTalkMetadata.outline.some(
        (entry) => entry.kind === "data-explainer",
      ),
    ).toBe(true);
    expect(phase4DogfoodTalkMetadata.chapters).toEqual([
      {
        id: "architecture",
        slideIds: ["architecture-contract", "timeline-compiler"],
        title: "Architecture spine",
      },
      {
        id: "product-layer",
        slideIds: ["preview-reliability-budget", "product-layer-loop"],
        title: "Product-layer dogfooding",
      },
    ]);

    expect(fixture.timeline.slides.map((slide) => slide.slideId)).toEqual(
      phase4DogfoodTalkMetadata.outline.map((entry) => entry.slideId),
    );
    expect(fixture.timeline.slides.flatMap((slide) => slide.notes)).toEqual(
      expect.arrayContaining([
        "Frame Cadenza as a typed presentation system for developers writing technical talks.",
        "Use the reliability budget as a data-explainer: the compiler, render-safe layer, and preview workflow each own a different risk.",
      ]),
    );
    expect(
      fixture.timeline.slides.some(
        (slide) => slide.transitionIn || slide.transitionOut,
      ),
    ).toBe(true);
    expect(collectRenderSafeKinds(fixture.deck)).toEqual(
      expect.arrayContaining([
        "content-slot",
        "media-frame",
        "safe-resource",
        "typography-box",
      ]),
    );
    expect(compile(fixture.deck, { mode: "offline" }).totalFrames).toBe(
      fixture.offlineTimeline.totalFrames,
    );
  });
});

function readText(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function collectRenderSafeKinds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectRenderSafeKinds);
  }

  if (typeof value !== "object" || value === null || !("kind" in value)) {
    return [];
  }

  const node = value as {
    children?: unknown;
    kind: DeckNode["kind"] | string;
  };
  const current = [
    "content-slot",
    "media-frame",
    "safe-resource",
    "typography-box",
  ].includes(node.kind)
    ? [node.kind]
    : [];

  return [...current, ...collectRenderSafeKinds(node.children)];
}
