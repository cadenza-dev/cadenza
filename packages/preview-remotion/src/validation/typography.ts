import type { CadenzaDiagnostic } from "@cadenza-dev/core";

export type TypographyPreviewMeasurement = {
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollWidth: number;
  source: string;
};

export function measureTypographyBox(
  element: HTMLElement,
  source: string,
): TypographyPreviewMeasurement {
  return {
    clientHeight: element.clientHeight,
    clientWidth: element.clientWidth,
    scrollHeight: element.scrollHeight,
    scrollWidth: element.scrollWidth,
    source,
  };
}

export function validateTypographyBoxMeasurement(
  measurement: TypographyPreviewMeasurement,
): CadenzaDiagnostic[] {
  if (
    measurement.scrollWidth <= measurement.clientWidth &&
    measurement.scrollHeight <= measurement.clientHeight
  ) {
    return [];
  }

  return [
    {
      code: "RSRM_TYPOGRAPHY_OVERFLOW",
      message: `TypographyBox '${measurement.source}' overflowed during Remotion browser preview.`,
      requirementId: "RSRM-006",
      severity: "warning",
      source: measurement.source,
    },
  ];
}
