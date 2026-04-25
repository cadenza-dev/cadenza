import type { TimelineMap } from "../compiler/compile.js";
import { type Cursor, cursorAtFrame } from "../compiler/cursor.js";

export type SeekPlayer = {
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
  let currentAnchorIndex = 0;
  let currentFrame = anchors[0]?.frame ?? 0;

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
      seekToAnchor(Math.min(currentAnchorIndex + 1, anchors.length - 1));
    },
    previous() {
      seekToAnchor(Math.max(currentAnchorIndex - 1, 0));
    },
    getCursor() {
      return cursorAtFrame(timeline, currentFrame);
    },
    onCursorChange(handler) {
      listeners.add(handler);

      return () => {
        listeners.delete(handler);
      };
    },
  };
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
