import type { SeekPlayer } from "@cadenza-dev/core";

export type CadenzaPreviewFrameEvent = {
  detail: {
    frame: number;
  };
};

export type CadenzaPreviewFramePlayer = {
  addEventListener(
    eventName: "frameupdate",
    listener: (event: CadenzaPreviewFrameEvent) => void,
  ): void;
  getCurrentFrame(): number;
  pause(): void;
  removeEventListener(
    eventName: "frameupdate",
    listener: (event: CadenzaPreviewFrameEvent) => void,
  ): void;
  seekTo(frame: number): void;
};

export function createFrameSynchronizedPlayer(
  player: CadenzaPreviewFramePlayer,
  onFrameUpdate?: (frame: number) => void,
): SeekPlayer {
  return {
    getCurrentFrame: () => player.getCurrentFrame(),
    onFrameChange(handler) {
      const listener = (event: CadenzaPreviewFrameEvent) => {
        const frame = event.detail.frame;

        handler(frame);
        onFrameUpdate?.(frame);
      };

      player.addEventListener("frameupdate", listener);

      return () => {
        player.removeEventListener("frameupdate", listener);
      };
    },
    pause: () => player.pause(),
    seekTo: (frame) => player.seekTo(frame),
  };
}
