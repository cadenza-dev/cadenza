import type { CadenzaDiagnostic } from "../diagnostics/types.js";

export type TypographyBoxMeasurement = {
  kind: "typography-box";
  source: string;
  clientWidth: number;
  scrollWidth: number;
  clientHeight: number;
  scrollHeight: number;
};

export type PreviewLayoutMeasurement = TypographyBoxMeasurement;

export function validatePreviewLayout(
  measurements: PreviewLayoutMeasurement[],
): CadenzaDiagnostic[] {
  const diagnostics: CadenzaDiagnostic[] = [];

  for (const measurement of measurements) {
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
