import {
  type Cursor,
  createRuntime,
  type PresenterMetadata,
  type TimelineMap,
  type TransitionSegment,
} from "@cadenza-dev/core";
import {
  type CadenzaPreviewFramePlayer,
  createFrameSynchronizedPlayer,
} from "./frameSync.js";

export type CadenzaPreviewNavigationPlayer = CadenzaPreviewFramePlayer & {
  play(): void;
};

export type CadenzaPreviewControllerInput = {
  player: CadenzaPreviewNavigationPlayer;
  timeline: TimelineMap;
};

export type CadenzaPreviewController = {
  dispose(): void;
  getCursor(): Cursor;
  getPresenterMetadata(): PresenterMetadata;
  goto(slideId: string, stepIndex?: number): void;
  next(): void;
  onCursorChange(handler: (cursor: Cursor) => void): () => void;
  previous(): void;
};

type PendingTransition = {
  targetFrame: number;
};

export function createCadenzaPreviewController({
  player,
  timeline,
}: CadenzaPreviewControllerInput): CadenzaPreviewController {
  let pendingTransition: PendingTransition | undefined;
  let unbindFrameSync: (() => void) | undefined;
  const framePlayer = createFrameSynchronizedPlayer(
    player,
    completePendingTransition,
  );
  const runtime = createRuntime(timeline, {
    getCurrentFrame: framePlayer.getCurrentFrame,
    onFrameChange(handler) {
      unbindFrameSync?.();
      unbindFrameSync = framePlayer.onFrameChange?.(handler);

      return () => {
        unbindFrameSync?.();
        unbindFrameSync = undefined;
      };
    },
    pause: framePlayer.pause,
    seekTo(frame) {
      const transition = transitionEndingAtFrame(timeline, frame);

      if (transition) {
        pendingTransition = { targetFrame: frame };
        player.seekTo(transition.segment[0]);
        player.play();
        return;
      }

      pendingTransition = undefined;
      player.seekTo(frame);
      player.pause();
    },
  });

  return {
    dispose() {
      unbindFrameSync?.();
      unbindFrameSync = undefined;
    },
    getCursor: () => runtime.getCursor(),
    getPresenterMetadata: () => runtime.getPresenterMetadata(),
    goto: (slideId, stepIndex) => runtime.goto(slideId, stepIndex),
    next: () => runtime.next(),
    onCursorChange: (handler) => runtime.onCursorChange(handler),
    previous: () => runtime.previous(),
  };

  function completePendingTransition(frame: number): void {
    const transition = pendingTransition;

    if (!transition || frame < transition.targetFrame) {
      return;
    }

    pendingTransition = undefined;
    player.pause();
    player.seekTo(transition.targetFrame);
  }
}

function transitionEndingAtFrame(
  timeline: TimelineMap,
  frame: number,
): TransitionSegment | undefined {
  return timeline.slides.find(
    (slide) =>
      slide.transitionIn &&
      slide.transitionIn.segment[0] !== frame &&
      slide.transitionIn.segment[1] === frame,
  )?.transitionIn;
}
