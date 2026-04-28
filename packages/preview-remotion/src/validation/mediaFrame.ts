import type { CadenzaDiagnostic } from "@cadenza-dev/core";

export type MediaFramePreviewMeasurement = {
  clientHeight: number;
  clientWidth: number;
  expectedAspectRatio: number;
  measuredAspectRatio: number;
  source: string;
  tolerance: number;
};

const DEFAULT_ASPECT_RATIO_TOLERANCE = 0.01;

export function measureMediaFrame(
  element: HTMLElement,
  input: {
    expectedAspectRatio: number;
    source: string;
    tolerance?: number | undefined;
  },
): MediaFramePreviewMeasurement {
  const measuredAspectRatio = element.clientWidth / element.clientHeight;

  return {
    clientHeight: element.clientHeight,
    clientWidth: element.clientWidth,
    expectedAspectRatio: input.expectedAspectRatio,
    measuredAspectRatio,
    source: input.source,
    tolerance: input.tolerance ?? DEFAULT_ASPECT_RATIO_TOLERANCE,
  };
}

export function validateMediaFrameMeasurement(
  measurement: MediaFramePreviewMeasurement,
): CadenzaDiagnostic[] {
  if (
    Number.isFinite(measurement.measuredAspectRatio) &&
    Math.abs(
      measurement.measuredAspectRatio - measurement.expectedAspectRatio,
    ) <= measurement.tolerance
  ) {
    return [];
  }

  return [
    {
      code: "RSRM_MEDIAFRAME_ASPECT_RATIO",
      message: `MediaFrame '${measurement.source}' measured aspect ratio ${measurement.measuredAspectRatio.toFixed(3)} instead of expected ${measurement.expectedAspectRatio.toFixed(3)} during Remotion browser preview.`,
      requirementId: "RSRM-007",
      severity: "warning",
      source: measurement.source,
    },
  ];
}
