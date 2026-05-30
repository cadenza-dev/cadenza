import type { CadenzaDiagnostic } from "../diagnostics/types.ts";
import {
  isRenderSafeResourceNode,
  type ResourceKind,
} from "../render-safe/resources.ts";
import type {
  DeckNode,
  DurationToken,
  NavigationPolicy,
  NotesNode,
  SlideNode,
  StepKind,
  StepNode,
  ThemeTokens,
  TransitionKind,
  TransitionNode,
} from "../typed-api/primitives.ts";
import { CadenzaValidationError } from "../validation/errors.ts";
import { validateDeck } from "../validation/static.ts";

export type FrameSegment = [number, number];

export type CompileMode = "preview" | "offline";

export type CompileOptions = {
  mode?: CompileMode;
};

export type TimelineStep = {
  stepIndex: number;
  segment: FrameSegment;
  kind: StepKind;
  pending?: boolean;
};

export type TimelineResource = {
  resourceId: string;
  resourceKind: ResourceKind;
  timeoutMs: number;
};

export type TransitionSegment = {
  durationFrames: number;
  kind: TransitionKind;
  segment: FrameSegment;
  from: string;
  timingToken?: string;
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
  diagnostics: CadenzaDiagnostic[];
  slides: TimelineSlide[];
};

export function compile(
  deck: DeckNode,
  options: CompileOptions = {},
): TimelineMap {
  const mode = options.mode ?? "preview";
  const diagnostics = validateDeck(deck);
  diagnostics.push(...validateCompileMode(deck, mode));

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
            deck.theme?.tokens.motion,
          )
        : undefined;

    if (previousSlide && transition) {
      previousSlide.transitionOut = transition;
    }

    const steps = compileSteps(node, deck.fps, cursor, mode);
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

  if (cursor > deck.fps * 60 * 60) {
    diagnostics.push({
      severity: "warning",
      code: "COMP_LONG_DECK",
      message: `Compiled deck is ${cursor} frames (${(cursor / deck.fps).toFixed(2)} seconds), exceeding the 60 minute Phase 1 warning threshold.`,
      requirementId: "COMP-009",
      source: "deck",
    });
  }

  return {
    fps: deck.fps,
    navigationPolicy: deck.navigationPolicy,
    totalFrames: cursor,
    diagnostics,
    slides,
  };
}

function validateCompileMode(
  deck: DeckNode,
  mode: CompileMode,
): CadenzaDiagnostic[] {
  if (mode !== "offline") {
    return [];
  }

  const diagnostics: CadenzaDiagnostic[] = [];

  for (const node of deck.children) {
    if (node.kind !== "slide") {
      continue;
    }

    for (const child of node.children) {
      if (child.kind !== "step") {
        continue;
      }

      if (
        child.stepKind === "wait-for-event" &&
        child.exportDuration === undefined
      ) {
        diagnostics.push({
          severity: "fatal",
          code: "COMP_MISSING_EXPORT_DURATION",
          message:
            "wait-for-event steps require exportDuration during offline compilation.",
          requirementId: "COMP-005",
          source: node.id,
        });
      }

      if (
        child.stepKind === "computed" &&
        child.duration === undefined &&
        child.exportDuration === undefined
      ) {
        diagnostics.push({
          severity: "fatal",
          code: "COMP_UNRESOLVED_COMPUTED_STEP",
          message:
            "computed steps require duration or exportDuration during offline compilation.",
          requirementId: "COMP-006",
          source: node.id,
        });
      }
    }
  }

  return diagnostics;
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
  motionTokens: ThemeTokens["motion"] | undefined,
): TransitionSegment {
  const duration = resolveTransitionDuration(transition, motionTokens);
  const durationFrames = durationToFrames(duration, fps);
  const transitionStart = Math.max(0, nextSlideStepStart - durationFrames);

  return {
    durationFrames,
    kind: transition.transitionKind,
    segment: [transitionStart, nextSlideStepStart],
    from,
    ...(transition.timingToken ? { timingToken: transition.timingToken } : {}),
    to,
  };
}

function resolveTransitionDuration(
  transition: TransitionNode,
  motionTokens: ThemeTokens["motion"] | undefined,
): DurationToken {
  if (!transition.timingToken) {
    return transition.duration;
  }

  return motionTokens?.[transition.timingToken] ?? transition.duration;
}

function compileSteps(
  slide: SlideNode,
  fps: number,
  startFrame: number,
  mode: CompileMode,
): TimelineStep[] {
  let cursor = startFrame;

  return slide.children
    .filter((node): node is StepNode => node.kind === "step")
    .map((step, stepIndex) => {
      const durationFrames = stepDurationFrames(
        step,
        slide.duration,
        fps,
        mode,
      );
      const segment: FrameSegment = [cursor, cursor + durationFrames];

      cursor += durationFrames;

      return {
        stepIndex,
        segment,
        kind: step.stepKind,
        ...(step.stepKind === "computed" && durationFrames === 0
          ? { pending: true }
          : {}),
      };
    });
}

function stepDurationFrames(
  step: StepNode,
  slideDuration: DurationToken | undefined,
  fps: number,
  mode: CompileMode,
): number {
  if (mode === "offline" && step.exportDuration !== undefined) {
    return durationToFrames(step.exportDuration, fps);
  }

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
