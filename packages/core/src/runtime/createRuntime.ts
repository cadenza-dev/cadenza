import type { TimelineMap } from "../compiler/compile.js";
import { type Cursor, cursorAtFrame } from "../compiler/cursor.js";

export type SeekPlayer = {
  getCurrentFrame?(): number;
  onFrameChange?(handler: (frame: number) => void): () => void;
  seekTo(frame: number): void;
};

export type CadenzaRuntime = {
  goto(slideId: string, stepIndex?: number): void;
  next(): void;
  previous(): void;
  getCursor(): Cursor;
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
): CadenzaRuntime {
  const anchors = collectStepAnchors(timeline);
  const listeners = new Set<(cursor: Cursor) => void>();
  let currentFrame = player.getCurrentFrame?.() ?? anchors[0]?.frame ?? 0;
  let currentAnchorIndex = anchorIndexForFrame(anchors, timeline, currentFrame);
  let queuedAnchorIndex: number | undefined;

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

    currentAnchorIndex = anchorIndex;
    currentFrame = anchor.frame;
    player.seekTo(anchor.frame);
    emitCursorChange();
  }

  function emitCursorChange(): void {
    const cursor = cursorAtFrame(timeline, currentFrame);

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
    onCursorChange(handler) {
      listeners.add(handler);

      return () => {
        listeners.delete(handler);
      };
    },
  };

  function getCursor(): Cursor {
    return cursorAtFrame(timeline, currentFrame);
  }
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
