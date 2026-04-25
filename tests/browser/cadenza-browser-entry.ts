import {
  bindClickRegions,
  type CadenzaDiagnostic,
  type CadenzaRuntime,
  type ClickRegionTarget,
  createFullscreenControls,
  validatePreviewLayout,
} from "@cadenza-dev/core";

type BrowserFixture = {
  clickCalls(): string[];
  fullscreenSupport(): {
    isFullscreen: boolean;
    isSupported: boolean;
  };
  installClickRegions(selector: string): void;
  unbindClickRegions(): void;
  validateTypographyOverflow(source: string): CadenzaDiagnostic[];
};

declare global {
  interface Window {
    CadenzaBrowserFixture: BrowserFixture;
  }
}

const clickCalls: string[] = [];
let unbindClickRegions: (() => void) | undefined;

const runtime = {
  getCursor() {
    return {
      kind: "at-step",
      slideId: "browser-fixture",
      stepIndex: 0,
    };
  },
  getPresenterMetadata() {
    return {
      elapsedActiveTimeMs: 0,
      elapsedWallTimeMs: 0,
      notes: [],
      slideId: "browser-fixture",
      stepIndex: 0,
    };
  },
  goto(slideId: string, stepIndex = 0) {
    clickCalls.push(`goto:${slideId}:${stepIndex}`);
  },
  next() {
    clickCalls.push("next");
  },
  onCursorChange() {
    return () => {};
  },
  previous() {
    clickCalls.push("previous");
  },
} satisfies CadenzaRuntime;

window.CadenzaBrowserFixture = {
  clickCalls() {
    return [...clickCalls];
  },
  fullscreenSupport() {
    const controls = createFullscreenControls({
      exitFullscreen: () => document.exitFullscreen(),
      isFullscreen: () => document.fullscreenElement !== null,
      requestFullscreen: () => document.documentElement.requestFullscreen(),
    });

    return {
      isFullscreen: controls.isFullscreen(),
      isSupported: controls.isSupported,
    };
  },
  installClickRegions(selector: string) {
    const target = document.querySelector(selector);
    if (!(target instanceof HTMLElement)) {
      throw new Error(`Missing click-region target '${selector}'.`);
    }

    clickCalls.length = 0;
    unbindClickRegions?.();
    unbindClickRegions = bindClickRegions(
      runtime,
      target as unknown as ClickRegionTarget,
      [
        {
          action: "previous",
          id: "previous-corner",
          rect: { height: 0.5, left: 0, top: 0, width: 0.5 },
        },
        {
          action: { kind: "goto", slideId: "details", stepIndex: 2 },
          id: "details-corner",
          rect: { height: 0.5, left: 0, top: 0.5, width: 0.5 },
        },
        {
          action: "next",
          id: "next-half",
          rect: { height: 1, left: 0.5, top: 0, width: 0.5 },
        },
      ],
    );
  },
  unbindClickRegions() {
    unbindClickRegions?.();
    unbindClickRegions = undefined;
  },
  validateTypographyOverflow(source: string) {
    const element = document.querySelector(`[data-cadenza-source="${source}"]`);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`Missing TypographyBox fixture '${source}'.`);
    }

    return validatePreviewLayout([
      {
        clientHeight: element.clientHeight,
        clientWidth: element.clientWidth,
        kind: "typography-box",
        scrollHeight: element.scrollHeight,
        scrollWidth: element.scrollWidth,
        source,
      },
    ]);
  },
};
