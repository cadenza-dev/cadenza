import type {
  DeckNode,
  DurationToken,
  SlideNode,
  StepKind,
  StepNode,
} from "../typed-api/primitives.js";

export type FrameSegment = [number, number];

export type TimelineStep = {
  stepIndex: number;
  segment: FrameSegment;
  kind: StepKind;
};

export type TimelineSlide = {
  slideId: string;
  segment: FrameSegment;
  steps: TimelineStep[];
};

export type TimelineMap = {
  fps: number;
  totalFrames: number;
  slides: TimelineSlide[];
};

export function compile(deck: DeckNode): TimelineMap {
  let cursor = 0;
  const slides = deck.children
    .filter((node): node is SlideNode => node.kind === "slide")
    .map((slide) => {
      const steps = compileSteps(slide, deck.fps, cursor);
      const slideStart = cursor;
      const slideEnd = steps.at(-1)?.segment[1] ?? cursor;

      cursor = slideEnd;

      return {
        slideId: slide.id,
        segment: [slideStart, slideEnd] satisfies FrameSegment,
        steps,
      };
    });

  return {
    fps: deck.fps,
    totalFrames: cursor,
    slides,
  };
}

function compileSteps(
  slide: SlideNode,
  fps: number,
  startFrame: number,
): TimelineStep[] {
  let cursor = startFrame;

  return slide.children
    .filter((node): node is StepNode => node.kind === "step")
    .map((step, stepIndex) => {
      const durationFrames = stepDurationFrames(step, slide.duration, fps);
      const segment: FrameSegment = [cursor, cursor + durationFrames];

      cursor += durationFrames;

      return {
        stepIndex,
        segment,
        kind: step.stepKind,
      };
    });
}

function stepDurationFrames(
  step: StepNode,
  slideDuration: DurationToken | undefined,
  fps: number,
): number {
  if (step.stepKind === "computed") {
    return durationToFrames(step.duration ?? 0, fps);
  }

  if (step.stepKind === "wait-for-event") {
    return durationToFrames(step.duration ?? "2s", fps);
  }

  return durationToFrames(step.duration ?? slideDuration ?? "2s", fps);
}

function durationToFrames(duration: DurationToken, fps: number): number {
  if (typeof duration === "number") {
    return duration;
  }

  if (duration.endsWith("ms")) {
    return Math.round((Number.parseFloat(duration) / 1000) * fps);
  }

  return Math.round(Number.parseFloat(duration) * fps);
}
