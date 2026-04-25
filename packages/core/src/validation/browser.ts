import type { CadenzaDiagnostic } from "../diagnostics/types.js";

export type TypographyBoxMeasurement = {
  kind: "typography-box";
  source: string;
  clientWidth: number;
  scrollWidth: number;
  clientHeight: number;
  scrollHeight: number;
};

export type MediaFrameMeasurement = {
  kind: "media-frame";
  source: string;
  expectedAspectRatio: number;
  clientWidth: number;
  clientHeight: number;
  tolerance?: number;
};

export type PreviewLayoutMeasurement =
  | TypographyBoxMeasurement
  | MediaFrameMeasurement;

export function validatePreviewLayout(
  measurements: PreviewLayoutMeasurement[],
): CadenzaDiagnostic[] {
  const diagnostics: CadenzaDiagnostic[] = [];

  for (const measurement of measurements) {
    if (measurement.kind === "media-frame") {
      const measuredAspectRatio =
        measurement.clientWidth / measurement.clientHeight;
      const tolerance = measurement.tolerance ?? 0.01;

      if (
        !Number.isFinite(measuredAspectRatio) ||
        Math.abs(measuredAspectRatio - measurement.expectedAspectRatio) >
          tolerance
      ) {
        diagnostics.push({
          severity: "warning",
          code: "RSAF_MEDIAFRAME_ASPECT_RATIO",
          message: `MediaFrame '${measurement.source}' measured aspect ratio ${measuredAspectRatio.toFixed(3)} instead of expected ${measurement.expectedAspectRatio.toFixed(3)} during browser preview.`,
          requirementId: "RSAF-006",
          source: measurement.source,
        });
      }

      continue;
    }

    if (
      measurement.scrollWidth > measurement.clientWidth ||
      measurement.scrollHeight > measurement.clientHeight
    ) {
      diagnostics.push({
        severity: "warning",
        code: "RSAF_TYPOGRAPHY_OVERFLOW",
        message: `TypographyBox '${measurement.source}' overflowed during browser preview.`,
        requirementId: "VAL-004",
        source: measurement.source,
      });
    }
  }

  return diagnostics;
}
