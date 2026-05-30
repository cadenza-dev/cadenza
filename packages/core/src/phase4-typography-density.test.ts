import { readFileSync } from "node:fs";
import path from "node:path";
import {
  fitTypographyBox,
  Theme,
  TypographyBox,
  validateTypographyDensity,
} from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";
import { createPhase4TypographyDiagnostics } from "../../../examples/phase4/preview.ts";

describe("B4.4 typography auto-fit and density diagnostics", () => {
  it("TC-TYPO-001 produces deterministic bounded auto-fit and overflow fallback diagnostics", () => {
    const typography = TypographyBox({
      id: "phase4-fit-copy",
      maxHeight: 120,
      maxWidth: 420,
      autoFit: {
        baseFontSizePx: 32,
        baseLineHeight: 1.32,
        baseSpacingPx: 12,
        minFontSizePx: 20,
        minLineHeight: 1.12,
        minSpacingPx: 4,
      },
      children:
        "A product-layer paragraph that should fit by shrinking typography within readable deterministic bounds.",
    });

    const fittingRun = fitTypographyBox({
      fontReadiness: "ready",
      measurement: {
        clientHeight: 120,
        clientWidth: 420,
        scrollHeight: 148,
        scrollWidth: 470,
        source: typography.id,
      },
      typography,
      viewport: { height: 720, width: 1280 },
    });
    const repeatRun = fitTypographyBox({
      fontReadiness: "ready",
      measurement: {
        clientHeight: 120,
        clientWidth: 420,
        scrollHeight: 148,
        scrollWidth: 470,
        source: typography.id,
      },
      typography,
      viewport: { height: 720, width: 1280 },
    });

    expect(repeatRun).toEqual(fittingRun);
    expect(fittingRun.result).toMatchObject({
      fontSizePx: 25.9,
      lineHeight: 1.12,
      spacingPx: 4,
      status: "fitted",
    });
    expect(fittingRun.diagnostics).toEqual([
      expect.objectContaining({
        code: "TYPO_AUTO_FIT_APPLIED",
        locator: {
          componentId: "phase4-fit-copy",
        },
        measured: expect.objectContaining({
          clientHeight: 120,
          clientWidth: 420,
          scrollHeight: 148,
          scrollWidth: 470,
        }),
        repairDirection:
          "Review the authored deck if fitted text still feels visually dense.",
        requirementId: "TYPO-001",
      }),
    ]);

    const fallbackRun = fitTypographyBox({
      fontReadiness: "ready",
      measurement: {
        clientHeight: 120,
        clientWidth: 420,
        scrollHeight: 360,
        scrollWidth: 760,
        source: "phase4-too-dense-copy",
      },
      typography: TypographyBox({
        id: "phase4-too-dense-copy",
        maxHeight: 120,
        maxWidth: 420,
        autoFit: typography.autoFit,
        children:
          "A deliberately over-dense product-layer paragraph that cannot safely fit without asking the author to repair the deck prose.",
      }),
      viewport: { height: 720, width: 1280 },
    });

    expect(fallbackRun.result).toMatchObject({
      fontSizePx: 20,
      lineHeight: 1.12,
      spacingPx: 4,
      status: "overflow-fallback",
    });
    expect(fallbackRun.diagnostics).toEqual([
      expect.objectContaining({
        code: "TYPO_AUTO_FIT_OVERFLOW_FALLBACK",
        locator: {
          componentId: "phase4-too-dense-copy",
        },
        repairDirection:
          "Shorten authored deck copy, split the content across steps, or increase the box size.",
        requirementId: "TYPO-002",
      }),
    ]);
  });

  it("TC-TYPO-002 exposes theme-budget density diagnostics through the Phase 4 preview workflow", () => {
    const theme = Theme({
      name: "phase4-density-test-theme",
      tokens: {
        density: {
          comfortable: {
            maxCharactersPer1000Px2: 1.8,
            maxEstimatedLineCount: 3,
            repairDirection:
              "Split the authored deck copy across steps or convert one clause into a diagram.",
          },
        },
      },
    });

    const diagnostics = validateTypographyDensity({
      box: { maxHeight: 96, maxWidth: 420 },
      density: "comfortable",
      locator: {
        chapterId: "product-layer",
        componentId: "preview-density-copy",
        slideId: "preview-reliability-budget",
      },
      readability: "body",
      text: [
        "Compiler evidence, render-safe resource status, local preview diagnostics,",
        "presenter notes, and visual acceptance repair paths all compete for the",
        "same dogfood slide and must stay readable.",
      ].join(" "),
      theme,
    });

    expect(diagnostics).toEqual([
      expect.objectContaining({
        category: "over-dense",
        code: "TYPO_DENSITY_OVER_BUDGET",
        locator: {
          chapterId: "product-layer",
          componentId: "preview-density-copy",
          slideId: "preview-reliability-budget",
        },
        measured: expect.objectContaining({
          characterCount: expect.any(Number),
          charactersPer1000Px2: expect.any(Number),
          estimatedLineCount: expect.any(Number),
        }),
        repairDirection:
          "Split the authored deck copy across steps or convert one clause into a diagram.",
        requirementId: "TYPO-003",
        testRefs: ["TC-TYPO-002"],
        themeBudget: expect.objectContaining({
          maxCharactersPer1000Px2: 1.8,
          maxEstimatedLineCount: 3,
        }),
      }),
    ]);

    expect(createPhase4TypographyDiagnostics()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "over-dense",
          code: "TYPO_DENSITY_OVER_BUDGET",
          locator: expect.objectContaining({
            slideId: "preview-reliability-budget",
          }),
          measured: expect.objectContaining({
            charactersPer1000Px2: expect.any(Number),
          }),
          repairDirection: expect.stringContaining("authored deck"),
          testRefs: ["TC-TYPO-002"],
        }),
      ]),
    );

    const previewSource = readText("examples/phase4/preview.jsx");

    expect(previewSource).toContain("data-cadenza-phase4-typography-density");
    expect(previewSource).toContain("data-cadenza-phase4-density-category");
    expect(previewSource).toContain("data-cadenza-phase4-density-measured");
    expect(previewSource).toContain("data-cadenza-phase4-density-repair");
  });
});

function readText(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}
