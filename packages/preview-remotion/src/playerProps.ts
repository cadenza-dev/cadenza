import type { TimelineMap } from "@cadenza-dev/core";

export type CadenzaPreviewMountInput = {
  compositionHeight: number;
  compositionWidth: number;
  timeline: TimelineMap;
};

export type CadenzaPreviewMount = CadenzaPreviewMountInput & {
  durationInFrames: number;
  fps: number;
};

export function createCadenzaPreviewMount(
  input: CadenzaPreviewMountInput,
): CadenzaPreviewMount {
  return {
    compositionHeight: input.compositionHeight,
    compositionWidth: input.compositionWidth,
    durationInFrames: input.timeline.totalFrames,
    fps: input.timeline.fps,
    timeline: input.timeline,
  };
}
