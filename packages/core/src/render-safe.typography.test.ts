import {
  ContentSlot,
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
});
