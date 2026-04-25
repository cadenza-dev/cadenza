import type { TimelineMap } from "../compiler/compile.js";
import { type Cursor, cursorAtFrame } from "../compiler/cursor.js";
import type { ResourceReadiness } from "../render-safe/readiness.js";

export type SeekPlayer = {
  getCurrentFrame?(): number;
  onFrameChange?(handler: (frame: number) => void): () => void;
  pause?(): void;
  seekTo(frame: number): void;
};

export type RuntimeClock = {
  now(): number;
};

export type CadenzaRuntimeOptions = {
  clock?: RuntimeClock;
  readiness?: ResourceReadiness;
};

export type PresenterMetadata = {
  slideId: string;
  stepIndex: number;
  notes: string[];
  elapsedWallTimeMs: number;
  elapsedActiveTimeMs: number;
};

export type CadenzaRuntime = {
  goto(slideId: string, stepIndex?: number): void;
  next(): void;
  previous(): void;
  getCursor(): Cursor;
  getPresenterMetadata(): PresenterMetadata;
  onCursorChange(handler: (cursor: Cursor) => void): () => void;
};

type StepAnchor = {
  slideId: string;
  stepIndex: number;
  frame: number;
};

export function createRuntime(
  timeline: TimelineMap,
  player: SeekPlayer,
  options: CadenzaRuntimeOptions = {},
): CadenzaRuntime {
  const runtimeTimeline = cloneTimeline(timeline);
  const clock = options.clock ?? { now: () => Date.now() };
  let anchors = collectStepAnchors(runtimeTimeline);
  const listeners = new Set<(cursor: Cursor) => void>();
  const startedAtMs = clock.now();
  let inactiveElapsedMs = 0;
  let loadingStartedAtMs: number | undefined;
  let currentFrame = player.getCurrentFrame?.() ?? anchors[0]?.frame ?? 0;
  let currentAnchorIndex = anchorIndexForFrame(
    anchors,
    runtimeTimeline,
    currentFrame,
  );
  let loadingAnchorIndex: number | undefined;
  let loadingCursor: Cursor | undefined;
  let queuedAnchorIndex: number | undefined;
  let lastEmittedCursor = cursorAtFrame(runtimeTimeline, currentFrame);

  options.readiness?.onChange(() => {
    if (loadingAnchorIndex === undefined) {
      return;
    }

    seekToAnchor(loadingAnchorIndex);
  });

  player.onFrameChange?.((frame) => {
    expandCurrentWaitForEventStep(runtimeTimeline, currentAnchorIndex, frame);
    anchors = collectStepAnchors(runtimeTimeline);
    currentFrame = frame;
    currentAnchorIndex = anchorIndexForFrame(
      anchors,
      runtimeTimeline,
      currentFrame,
    );

    if (
      queuedAnchorIndex !== undefined &&
      getCursor().kind !== "in-transition"
    ) {
      const anchorIndex = queuedAnchorIndex;
      queuedAnchorIndex = undefined;
      seekToAnchor(anchorIndex);
      return;
    }

    emitCursorChange();
  });

  function seekToAnchor(anchorIndex: number): void {
    const anchor = anchors[anchorIndex];
    if (!anchor) {
      throw new RangeError(
        `Step anchor ${anchorIndex} is outside the timeline.`,
      );
    }
    const targetStep = stepForAnchor(runtimeTimeline, anchor);
    if (targetStep?.pending) {
      loadingStartedAtMs ??= clock.now();
      loadingAnchorIndex = anchorIndex;
      loadingCursor = {
        kind: "loading",
        reason: "computed",
        slideId: anchor.slideId,
      };
      player.pause?.();
      emitCursorChange();
      return;
    }

    const missingResource = firstMissingResource(
      runtimeTimeline,
      anchor.slideId,
      options.readiness,
    );

    if (missingResource) {
      loadingStartedAtMs ??= clock.now();
      loadingAnchorIndex = anchorIndex;
      loadingCursor = {
        kind: "loading",
        reason: missingResource.resourceKind,
        slideId: anchor.slideId,
      };
      player.pause?.();
      emitCursorChange();
      return;
    }

    if (loadingStartedAtMs !== undefined) {
      inactiveElapsedMs += clock.now() - loadingStartedAtMs;
      loadingStartedAtMs = undefined;
    }

    loadingAnchorIndex = undefined;
    loadingCursor = undefined;
    currentAnchorIndex = anchorIndex;
    currentFrame = anchor.frame;
    player.seekTo(anchor.frame);
    emitCursorChange();
  }

  function emitCursorChange(): void {
    const cursor = getCursor();
    if (sameSemanticCursor(lastEmittedCursor, cursor)) {
      return;
    }

    lastEmittedCursor = cursor;

    for (const listener of listeners) {
      listener(cursor);
    }
  }

  return {
    goto(slideId, stepIndex = 0) {
      const anchorIndex = anchors.findIndex(
        (anchor) =>
          anchor.slideId === slideId && anchor.stepIndex === stepIndex,
      );

      if (anchorIndex === -1) {
        throw new RangeError(`Unknown step anchor ${slideId}:${stepIndex}.`);
      }

      seekToAnchor(anchorIndex);
    },
    next() {
      const cursor = getCursor();

      if (cursor.kind === "in-transition") {
        const targetAnchorIndex = findAnchorIndex(anchors, cursor.to, 0);

        if (runtimeTimeline.navigationPolicy === "finish-then-advance") {
          return;
        }

        if (runtimeTimeline.navigationPolicy === "queue-next") {
          queuedAnchorIndex = Math.min(
            targetAnchorIndex + 1,
            anchors.length - 1,
          );
          return;
        }

        seekToAnchor(targetAnchorIndex);
        return;
      }

      currentAnchorIndex = anchorIndexForCursor(anchors, cursor);
      seekToAnchor(Math.min(currentAnchorIndex + 1, anchors.length - 1));
    },
    previous() {
      currentAnchorIndex = anchorIndexForCursor(anchors, getCursor());
      seekToAnchor(Math.max(currentAnchorIndex - 1, 0));
    },
    getCursor() {
      return getCursor();
    },
    getPresenterMetadata() {
      const cursor = getCursor();
      const slideId = presenterSlideId(cursor);
      const stepIndex = cursor.kind === "at-step" ? cursor.stepIndex : 0;
      const slide = runtimeTimeline.slides.find(
        (item) => item.slideId === slideId,
      );
      const elapsedWallTimeMs = clock.now() - startedAtMs;
      const currentInactiveMs =
        loadingStartedAtMs === undefined ? 0 : clock.now() - loadingStartedAtMs;

      return {
        slideId,
        stepIndex,
        notes: slide?.notes ?? [],
        elapsedWallTimeMs,
        elapsedActiveTimeMs:
          elapsedWallTimeMs - inactiveElapsedMs - currentInactiveMs,
      };
    },
    onCursorChange(handler) {
      listeners.add(handler);

      return () => {
        listeners.delete(handler);
      };
    },
  };

  function getCursor(): Cursor {
    if (loadingCursor) {
      return loadingCursor;
    }

    return cursorAtFrame(runtimeTimeline, currentFrame);
  }
}

function presenterSlideId(cursor: Cursor): string {
  if (cursor.kind === "at-step" || cursor.kind === "loading") {
    return cursor.slideId;
  }

  return cursor.to;
}

function sameSemanticCursor(left: Cursor, right: Cursor): boolean {
  if (left.kind !== right.kind) {
    return false;
  }

  if (left.kind === "at-step" && right.kind === "at-step") {
    return left.slideId === right.slideId && left.stepIndex === right.stepIndex;
  }

  if (left.kind === "in-transition" && right.kind === "in-transition") {
    return left.from === right.from && left.to === right.to;
  }

  if (left.kind === "loading" && right.kind === "loading") {
    return left.slideId === right.slideId && left.reason === right.reason;
  }

  return false;
}

function collectStepAnchors(timeline: TimelineMap): StepAnchor[] {
  return timeline.slides.flatMap((slide) =>
    slide.steps.map((step) => ({
      slideId: slide.slideId,
      stepIndex: step.stepIndex,
      frame: step.segment[0],
    })),
  );
}

function stepForAnchor(timeline: TimelineMap, anchor: StepAnchor) {
  return timeline.slides
    .find((slide) => slide.slideId === anchor.slideId)
    ?.steps.find((step) => step.stepIndex === anchor.stepIndex);
}

function cloneTimeline(timeline: TimelineMap): TimelineMap {
  return {
    ...timeline,
    diagnostics: [...timeline.diagnostics],
    slides: timeline.slides.map((slide) => ({
      ...slide,
      segment: [...slide.segment],
      notes: [...slide.notes],
      resources: slide.resources.map((resource) => ({ ...resource })),
      steps: slide.steps.map((step) => ({
        ...step,
        segment: [...step.segment],
      })),
      ...(slide.transitionIn
        ? {
            transitionIn: {
              ...slide.transitionIn,
              segment: [...slide.transitionIn.segment],
            },
          }
        : {}),
      ...(slide.transitionOut
        ? {
            transitionOut: {
              ...slide.transitionOut,
              segment: [...slide.transitionOut.segment],
            },
          }
        : {}),
    })),
  };
}

function expandCurrentWaitForEventStep(
  timeline: TimelineMap,
  anchorIndex: number,
  frame: number,
): void {
  const anchor = collectStepAnchors(timeline)[anchorIndex];
  if (!anchor) {
    return;
  }

  const slide = timeline.slides.find((item) => item.slideId === anchor.slideId);
  const step = slide?.steps[anchor.stepIndex];
  if (!step || step.kind !== "wait-for-event" || frame < step.segment[1]) {
    return;
  }

  const oldEnd = step.segment[1];
  const delta = frame - oldEnd + 1;
  shiftTimelineAfter(timeline, oldEnd, delta);
}

function shiftTimelineAfter(
  timeline: TimelineMap,
  frame: number,
  delta: number,
): void {
  for (const slide of timeline.slides) {
    shiftSegment(slide.segment, frame, delta);
    for (const step of slide.steps) {
      shiftSegment(step.segment, frame, delta);
    }
    if (slide.transitionIn) {
      shiftSegment(slide.transitionIn.segment, frame, delta);
    }
    if (slide.transitionOut) {
      shiftSegment(slide.transitionOut.segment, frame, delta);
    }
  }

  timeline.totalFrames += delta;
}

function shiftSegment(
  segment: [number, number],
  frame: number,
  delta: number,
): void {
  if (segment[0] >= frame) {
    segment[0] += delta;
    segment[1] += delta;
    return;
  }

  if (segment[1] >= frame) {
    segment[1] += delta;
  }
}

function anchorIndexForFrame(
  anchors: StepAnchor[],
  timeline: TimelineMap,
  frame: number,
): number {
  return anchorIndexForCursor(anchors, cursorAtFrame(timeline, frame));
}

function anchorIndexForCursor(anchors: StepAnchor[], cursor: Cursor): number {
  if (cursor.kind !== "at-step") {
    return 0;
  }

  return findAnchorIndex(anchors, cursor.slideId, cursor.stepIndex);
}

function findAnchorIndex(
  anchors: StepAnchor[],
  slideId: string,
  stepIndex: number,
): number {
  const anchorIndex = anchors.findIndex(
    (anchor) => anchor.slideId === slideId && anchor.stepIndex === stepIndex,
  );

  if (anchorIndex === -1) {
    throw new RangeError(`Unknown step anchor ${slideId}:${stepIndex}.`);
  }

  return anchorIndex;
}

function firstMissingResource(
  timeline: TimelineMap,
  slideId: string,
  readiness: ResourceReadiness | undefined,
) {
  if (!readiness) {
    return undefined;
  }

  const slide = timeline.slides.find((item) => item.slideId === slideId);

  return slide?.resources.find(
    (resource) => !readiness.isReady(resource.resourceId),
  );
}
