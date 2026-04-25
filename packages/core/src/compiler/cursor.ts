import type { TimelineMap, TransitionSegment } from "./compile.js";

export type Cursor =
  | { kind: "at-step"; slideId: string; stepIndex: number }
  | { kind: "in-transition"; from: string; to: string; progress: number }
  | { kind: "loading"; reason: "asset" | "font" | "video"; slideId: string };

export function cursorAtFrame(timeline: TimelineMap, frame: number): Cursor {
  if (!Number.isInteger(frame) || frame < 0 || frame >= timeline.totalFrames) {
    throw new RangeError(`Frame ${frame} is outside the timeline range.`);
  }

  const transition = transitionAtFrame(timeline, frame);
  if (transition) {
    const [start, end] = transition.segment;
    const duration = end - start;

    return {
      kind: "in-transition",
      from: transition.from,
      to: transition.to,
      progress: duration === 0 ? 1 : (frame - start) / duration,
    };
  }

  for (const slide of timeline.slides) {
    for (const step of slide.steps) {
      if (ownsFrame(step.segment, frame)) {
        return {
          kind: "at-step",
          slideId: slide.slideId,
          stepIndex: step.stepIndex,
        };
      }
    }
  }

  throw new Error(`No cursor found for frame ${frame}.`);
}

function transitionAtFrame(
  timeline: TimelineMap,
  frame: number,
): TransitionSegment | undefined {
  return timeline.slides
    .map((slide) => slide.transitionOut)
    .find((transition) => transition && ownsFrame(transition.segment, frame));
}

function ownsFrame(segment: [number, number], frame: number): boolean {
  return frame >= segment[0] && frame < segment[1];
}
