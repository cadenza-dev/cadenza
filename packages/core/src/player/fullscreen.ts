export type FullscreenPlayer = {
  requestFullscreen?: () => void | Promise<void>;
  exitFullscreen?: () => void | Promise<void>;
  isFullscreen?: () => boolean;
};

export type FullscreenControls = {
  isSupported: boolean;
  isFullscreen(): boolean;
  enter(): Promise<void>;
  exit(): Promise<void>;
  toggle(): Promise<void>;
};

export function createFullscreenControls(
  player: FullscreenPlayer,
): FullscreenControls {
  const isSupported = Boolean(
    player.requestFullscreen && player.exitFullscreen,
  );

  return {
    isSupported,
    isFullscreen() {
      return player.isFullscreen?.() ?? false;
    },
    async enter() {
      await player.requestFullscreen?.();
    },
    async exit() {
      await player.exitFullscreen?.();
    },
    async toggle() {
      if (this.isFullscreen()) {
        await this.exit();
        return;
      }

      await this.enter();
    },
  };
}
