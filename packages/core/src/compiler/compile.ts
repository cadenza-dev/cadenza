import type {
  DeckNode,
  DurationToken,
  NavigationPolicy,
  SlideNode,
  StepKind,
  StepNode,
  TransitionKind,
  TransitionNode,
} from "../typed-api/primitives.js";

export type FrameSegment = [number, number];

export type TimelineStep = {
  stepIndex: number;
  segment: FrameSegment;
  kind: StepKind;
};

export type TransitionSegment = {
  kind: TransitionKind;
  segment: FrameSegment;
  from: string;
  to: string;
};

export type TimelineSlide = {
  slideId: string;
  segment: FrameSegment;
  steps: TimelineStep[];
  transitionIn?: TransitionSegment;
  transitionOut?: TransitionSegment;
};

export type TimelineMap = {
  fps: number;
  navigationPolicy: NavigationPolicy;
  totalFrames: number;
  slides: TimelineSlide[];
};

export function compile(deck: DeckNode): TimelineMap {
  let cursor = 0;
  const slides: TimelineSlide[] = [];
  let pendingTransition: TransitionNode | undefined;

  for (const node of deck.children) {
    if (node.kind === "transition") {
      pendingTransition = node;
      continue;
    }

    if (node.kind !== "slide") {
      continue;
    }

    const previousSlide = slides.at(-1);
    const transition =
      previousSlide && pendingTransition
        ? compileTransition(
            pendingTransition,
            previousSlide.slideId,
            node.id,
            cursor,
            deck.fps,
          )
        : undefined;

    if (previousSlide && transition) {
      previousSlide.transitionOut = transition;
    }

    const steps = compileSteps(node, deck.fps, cursor);
    const slideStart = transition?.segment[0] ?? cursor;
    const slideEnd = steps.at(-1)?.segment[1] ?? cursor;

    slides.push({
      slideId: node.id,
      segment: [slideStart, slideEnd],
      steps,
      ...(transition ? { transitionIn: transition } : {}),
    });

    cursor = slideEnd;
    pendingTransition = undefined;
  }

  return {
    fps: deck.fps,
    navigationPolicy: deck.navigationPolicy,
    totalFrames: cursor,
    slides,
  };
}

function compileTransition(
  transition: TransitionNode,
  from: string,
  to: string,
  nextSlideStepStart: number,
  fps: number,
): TransitionSegment {
  const durationFrames = durationToFrames(transition.duration, fps);
  const transitionStart = Math.max(0, nextSlideStepStart - durationFrames);

  return {
    kind: transition.transitionKind,
    segment: [transitionStart, nextSlideStepStart],
    from,
    to,
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
