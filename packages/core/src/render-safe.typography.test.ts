import {
  ContentSlot,
  MediaFrame,
  TypographyBox,
  validatePreviewLayout,
} from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";

describe("TC-RSAF-005 TypographyBox preview validation", () => {
  it("reports overflow diagnostics and exposes ContentSlot readability metadata", () => {
    const typography = TypographyBox({
      id: "hero-title",
      maxWidth: 320,
      maxHeight: 80,
      children: "A long title that can overflow during browser preview",
    });

    const slot = ContentSlot({
      id: "title-slot",
      density: "compact",
      readability: "headline",
      children: typography,
    });

    expect(slot.metadata).toEqual({
      density: "compact",
      readability: "headline",
    });

    expect(
      validatePreviewLayout([
        {
          kind: "typography-box",
          source: typography.id,
          clientWidth: typography.maxWidth,
          scrollWidth: typography.maxWidth + 1,
          clientHeight: typography.maxHeight,
          scrollHeight: typography.maxHeight,
        },
      ]),
    ).toEqual([
      expect.objectContaining({
        code: "RSAF_TYPOGRAPHY_OVERFLOW",
        message: expect.stringContaining("overflow"),
        requirementId: "VAL-004",
        severity: "warning",
        source: "hero-title",
      }),
    ]);
  });

  it("exposes MediaFrame aspect ratio and poster snapshot metadata", () => {
    expect(
      MediaFrame({
        id: "demo-video-frame",
        aspectRatio: 16 / 9,
        poster: "/assets/demo-poster.png",
        children: "Demo video",
      }),
    ).toEqual({
      kind: "media-frame",
      id: "demo-video-frame",
      aspectRatio: 16 / 9,
      poster: "/assets/demo-poster.png",
      exportSnapshot: {
        kind: "poster",
        src: "/assets/demo-poster.png",
      },
      children: "Demo video",
    });
  });
});
