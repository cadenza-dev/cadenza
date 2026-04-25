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
  const clock = options.clock ?? { now: () => Date.now() };
  const anchors = collectStepAnchors(timeline);
  const listeners = new Set<(cursor: Cursor) => void>();
  const startedAtMs = clock.now();
  let inactiveElapsedMs = 0;
  let loadingStartedAtMs: number | undefined;
  let currentFrame = player.getCurrentFrame?.() ?? anchors[0]?.frame ?? 0;
  let currentAnchorIndex = anchorIndexForFrame(anchors, timeline, currentFrame);
  let loadingAnchorIndex: number | undefined;
  let loadingCursor: Cursor | undefined;
  let queuedAnchorIndex: number | undefined;

  options.readiness?.onChange(() => {
    if (loadingAnchorIndex === undefined) {
      return;
    }

    seekToAnchor(loadingAnchorIndex);
  });

  player.onFrameChange?.((frame) => {
    currentFrame = frame;
    currentAnchorIndex = anchorIndexForFrame(anchors, timeline, currentFrame);

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
    const missingResource = firstMissingResource(
      timeline,
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

        if (timeline.navigationPolicy === "finish-then-advance") {
          return;
        }

        if (timeline.navigationPolicy === "queue-next") {
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
      const slide = timeline.slides.find((item) => item.slideId === slideId);
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

    return cursorAtFrame(timeline, currentFrame);
  }
}

function presenterSlideId(cursor: Cursor): string {
  if (cursor.kind === "at-step" || cursor.kind === "loading") {
    return cursor.slideId;
  }

  return cursor.to;
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
