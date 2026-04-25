import {
  isRenderSafeResourceNode,
  type ResourceKind,
} from "../render-safe/resources.js";
import type {
  DeckNode,
  DurationToken,
  NavigationPolicy,
  NotesNode,
  SlideNode,
  StepKind,
  StepNode,
  TransitionKind,
  TransitionNode,
} from "../typed-api/primitives.js";
import { CadenzaValidationError } from "../validation/errors.js";
import { validateDeck } from "../validation/static.js";

export type FrameSegment = [number, number];

export type TimelineStep = {
  stepIndex: number;
  segment: FrameSegment;
  kind: StepKind;
};

export type TimelineResource = {
  resourceId: string;
  resourceKind: ResourceKind;
  timeoutMs: number;
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
  notes: string[];
  resources: TimelineResource[];
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
  const diagnostics = validateDeck(deck);

  if (diagnostics.some((diagnostic) => diagnostic.severity === "fatal")) {
    throw new CadenzaValidationError(diagnostics);
  }

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
      notes: collectSlideNotes(node),
      resources: collectSlideResources(node),
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

function collectSlideNotes(slide: SlideNode): string[] {
  return slide.children
    .filter((node): node is NotesNode => node.kind === "notes")
    .map((node) => node.children);
}

function collectSlideResources(slide: SlideNode): TimelineResource[] {
  const resources: TimelineResource[] = [];

  for (const child of slide.children) {
    collectResources(child, resources);
  }

  return resources;
}

function collectResources(value: unknown, resources: TimelineResource[]): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectResources(item, resources);
    }
    return;
  }

  if (isRenderSafeResourceNode(value)) {
    resources.push({
      resourceId: value.resourceId,
      resourceKind: value.resourceKind,
      timeoutMs: value.timeoutMs,
    });
    return;
  }

  if (typeof value !== "object" || value === null || !("kind" in value)) {
    return;
  }

  if (value.kind === "step" && "children" in value) {
    collectResources(value.children, resources);
  }
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
