import {
  bindClickRegions,
  bindKeyboardNavigation,
  type CadenzaDiagnostic,
  type CadenzaRuntime,
  type ClickRegionTarget,
  ContentSlot,
  compile,
  createFullscreenControls,
  createRenderSafeDomAdapter,
  createResourceReadiness,
  createRuntime,
  Deck,
  type KeyboardNavigationTarget,
  MediaFrame,
  type MediaFrameMeasurement,
  SafeFont,
  SafeImage,
  SafeVideo,
  Slide,
  Step,
  TypographyBox,
  validatePreviewLayout,
} from "@cadenza-dev/core";
import { createAllDomainMvpFixture } from "@cadenza-dev/core/fixtures/allDomainMvp";
import {
  CadenzaPlayer,
  type CadenzaPlayerHandle,
  createCadenzaPreviewMount,
} from "@cadenza-dev/preview-remotion";
import React from "react";
import { createRoot, type Root } from "react-dom/client";

type BrowserFixture = {
  clickCalls(): string[];
  dispatchControlledVideoMetadata(): ControlledReadinessState;
  fullscreenSupport(): {
    isFullscreen: boolean;
    isSupported: boolean;
  };
  installClickRegions(selector: string): void;
  installKeyboardNavigation(): void;
  installReadinessGate(
    titleSelector: string,
    videoSelector: string,
  ): ControlledReadinessState;
  keyboardCalls(): string[];
  markControlledFontReady(): ControlledReadinessState;
  unbindClickRegions(): void;
  unbindKeyboardNavigation(): void;
  validateMediaFrames(
    requests: MediaFrameRequest[],
  ): MediaFrameValidationResult;
  validateTypographyOverflow(source: string): CadenzaDiagnostic[];
};

type RemotionPreviewFixture = {
  dispatchPreviewImageError(resourceId: string): void;
  dispatchPreviewImageLoad(resourceId: string): void;
  dispatchPreviewVideoMetadata(resourceId: string): void;
  goto(slideId: string, stepIndex?: number): void;
  mountAllDomainMvpPreview(
    selector: string,
    config: { compositionHeight: number; compositionWidth: number },
  ): {
    playerProps: {
      compositionHeight: number;
      compositionWidth: number;
      durationInFrames: number;
      fps: number;
    };
    timeline: {
      fps: number;
      totalFrames: number;
    };
  };
  mountControlledReadinessPreview(
    selector: string,
    config: {
      compositionHeight: number;
      compositionWidth: number;
      resourceTimeoutMs?: number;
    },
  ): {
    playerProps: {
      compositionHeight: number;
      compositionWidth: number;
      durationInFrames: number;
      fps: number;
    };
    timeline: {
      fps: number;
      totalFrames: number;
    };
  };
  mountControlledValidationPreview(
    selector: string,
    config: { compositionHeight: number; compositionWidth: number },
  ): {
    playerProps: {
      compositionHeight: number;
      compositionWidth: number;
      durationInFrames: number;
      fps: number;
    };
    timeline: {
      fps: number;
      totalFrames: number;
    };
  };
  markPreviewResourceReady(resourceId: string): void;
  nativeSeekToFrame(frame: number): void;
  navigateNext(): void;
  navigatePrevious(): void;
  snapshot(): ReturnType<CadenzaPlayerHandle["getSnapshot"]>;
};

type ControlledReadinessState = {
  cursor: ReturnType<CadenzaRuntime["getCursor"]>;
  titleVisibility: string;
  videoReady: boolean;
};

type MediaFrameRequest = {
  expectedAspectRatio: number;
  source: string;
};

type MediaFrameValidationResult = {
  diagnostics: CadenzaDiagnostic[];
  measurements: Array<{
    clientHeight: number;
    clientWidth: number;
    measuredAspectRatio: number;
    source: string;
  }>;
};

declare global {
  interface Window {
    CadenzaBrowserFixture: BrowserFixture;
    CadenzaRemotionPreview: RemotionPreviewFixture;
  }
}

const clickCalls: string[] = [];
const keyboardCalls: string[] = [];
let unbindClickRegions: (() => void) | undefined;
let unbindKeyboardNavigation: (() => void) | undefined;
let controlledReadiness:
  | {
      readiness: ReturnType<typeof createResourceReadiness>;
      runtime: CadenzaRuntime;
      title: HTMLElement;
      video: HTMLVideoElement;
      unbind: () => void;
    }
  | undefined;
let remotionPreviewRoot: Root | undefined;
let remotionPreviewHandle: CadenzaPlayerHandle | undefined;

const runtime = {
  getCursor() {
    return {
      kind: "at-step",
      slideId: "browser-fixture",
      stepIndex: 0,
    };
  },
  getDiagnostics() {
    return [];
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
  resolveComputedStep() {},
} satisfies CadenzaRuntime;

const keyboardRuntime = {
  ...runtime,
  goto(slideId: string, stepIndex = 0) {
    keyboardCalls.push(`goto:${slideId}:${stepIndex}`);
  },
  next() {
    keyboardCalls.push("next");
  },
  previous() {
    keyboardCalls.push("previous");
  },
} satisfies CadenzaRuntime;

window.CadenzaBrowserFixture = {
  clickCalls() {
    return [...clickCalls];
  },
  dispatchControlledVideoMetadata() {
    const gate = requireReadinessGate();
    gate.video.dispatchEvent(new Event("loadedmetadata"));

    return controlledReadinessState(gate);
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
  installKeyboardNavigation() {
    keyboardCalls.length = 0;
    unbindKeyboardNavigation?.();
    unbindKeyboardNavigation = bindKeyboardNavigation(
      keyboardRuntime,
      document as unknown as KeyboardNavigationTarget,
    );
  },
  installReadinessGate(titleSelector: string, videoSelector: string) {
    const title = document.querySelector(titleSelector);
    if (!(title instanceof HTMLElement)) {
      throw new Error(`Missing font readiness title '${titleSelector}'.`);
    }

    const video = document.querySelector(videoSelector);
    if (!(video instanceof HTMLVideoElement)) {
      throw new Error(`Missing video readiness element '${videoSelector}'.`);
    }

    const readiness = createResourceReadiness();
    const domAdapter = createRenderSafeDomAdapter({ readiness });
    controlledReadiness?.unbind();
    const runtime = createRuntime(
      compile(
        Deck({
          fps: 10,
          children: [
            Slide({
              id: "intro",
              children: Step({ duration: "1s", children: "Intro" }),
            }),
            Slide({
              id: "media",
              children: [
                SafeFont({ family: "Inter" }),
                SafeVideo({ src: "/demo.mp4" }),
                Step({ duration: "1s", children: "Media" }),
              ],
            }),
          ],
        }),
      ),
      { pause() {}, seekTo() {} },
      { readiness },
    );
    const unbindFont = domAdapter.bindFontVisibility({
      element: title,
      resourceId: "font:Inter",
    });
    const unbindVideo = domAdapter.bindVideoMetadataReadiness({
      element: video,
      resourceId: "video:/demo.mp4",
    });

    controlledReadiness = {
      readiness,
      runtime,
      title,
      unbind: () => {
        unbindFont();
        unbindVideo();
      },
      video,
    };
    runtime.next();

    return controlledReadinessState(controlledReadiness);
  },
  keyboardCalls() {
    return [...keyboardCalls];
  },
  markControlledFontReady() {
    const gate = requireReadinessGate();
    gate.readiness.markReady("font:Inter");

    return controlledReadinessState(gate);
  },
  unbindClickRegions() {
    unbindClickRegions?.();
    unbindClickRegions = undefined;
  },
  unbindKeyboardNavigation() {
    unbindKeyboardNavigation?.();
    unbindKeyboardNavigation = undefined;
  },
  validateMediaFrames(requests: MediaFrameRequest[]) {
    const measurements: MediaFrameMeasurement[] = requests.map((request) => {
      const element = document.querySelector(
        `[data-cadenza-media-frame="${request.source}"]`,
      );
      if (!(element instanceof HTMLElement)) {
        throw new Error(`Missing MediaFrame fixture '${request.source}'.`);
      }

      return {
        kind: "media-frame",
        source: request.source,
        expectedAspectRatio: request.expectedAspectRatio,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
      };
    });

    return {
      diagnostics: validatePreviewLayout(measurements),
      measurements: measurements.map((measurement) => ({
        clientHeight: measurement.clientHeight,
        clientWidth: measurement.clientWidth,
        measuredAspectRatio: measurement.clientWidth / measurement.clientHeight,
        source: measurement.source,
      })),
    };
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

window.CadenzaRemotionPreview = {
  dispatchPreviewImageError(resourceId) {
    requirePreviewResource<HTMLImageElement>(resourceId).dispatchEvent(
      new Event("error"),
    );
  },
  dispatchPreviewImageLoad(resourceId) {
    requirePreviewResource<HTMLImageElement>(resourceId).dispatchEvent(
      new Event("load"),
    );
  },
  dispatchPreviewVideoMetadata(resourceId) {
    requirePreviewResource<HTMLVideoElement>(resourceId).dispatchEvent(
      new Event("loadedmetadata"),
    );
  },
  goto(slideId, stepIndex) {
    requireRemotionPreviewHandle().goto(slideId, stepIndex);
  },
  mountAllDomainMvpPreview(selector, config) {
    const host = document.querySelector(selector);
    if (!(host instanceof HTMLElement)) {
      throw new Error(`Missing Remotion preview host '${selector}'.`);
    }

    const fixture = createAllDomainMvpFixture();
    const playerProps = createCadenzaPreviewMount({
      compositionHeight: config.compositionHeight,
      compositionWidth: config.compositionWidth,
      timeline: fixture.previewTimeline,
    });

    remotionPreviewRoot?.unmount();
    remotionPreviewRoot = createRoot(host);
    remotionPreviewRoot.render(
      React.createElement(CadenzaPlayer, {
        compositionHeight: config.compositionHeight,
        compositionWidth: config.compositionWidth,
        deck: fixture.deck,
        onPreviewReady(handle) {
          remotionPreviewHandle = handle;

          return () => {
            if (remotionPreviewHandle === handle) {
              remotionPreviewHandle = undefined;
            }
          };
        },
        timeline: fixture.previewTimeline,
      }),
    );

    return {
      playerProps: {
        compositionHeight: playerProps.compositionHeight,
        compositionWidth: playerProps.compositionWidth,
        durationInFrames: playerProps.durationInFrames,
        fps: playerProps.fps,
      },
      timeline: {
        fps: fixture.previewTimeline.fps,
        totalFrames: fixture.previewTimeline.totalFrames,
      },
    };
  },
  markPreviewResourceReady(resourceId) {
    requireRemotionPreviewHandle().markResourceReady(resourceId);
  },
  mountControlledValidationPreview(selector, config) {
    const host = document.querySelector(selector);
    if (!(host instanceof HTMLElement)) {
      throw new Error(`Missing Remotion preview host '${selector}'.`);
    }

    const deck = Deck({
      fps: 12,
      navigationPolicy: "queue-next",
      children: [
        Slide({
          id: "validation",
          children: Step({
            duration: "1s",
            children: ContentSlot({
              id: "validation-slot",
              density: "compact",
              readability: "headline",
              children: [
                TypographyBox({
                  id: "validation-title",
                  maxHeight: 24,
                  maxWidth: 120,
                  children: "ThisTitleIsIntentionallyTooWideForThePreviewBox",
                }),
                MediaFrame({
                  id: "validation-frame",
                  aspectRatio: 16 / 9,
                  children: "Preview validation frame",
                }),
              ],
            }),
          }),
        }),
      ],
    });
    const timeline = compile(deck);
    const playerProps = createCadenzaPreviewMount({
      compositionHeight: config.compositionHeight,
      compositionWidth: config.compositionWidth,
      timeline,
    });

    remotionPreviewRoot?.unmount();
    remotionPreviewRoot = createRoot(host);
    remotionPreviewRoot.render(
      React.createElement(CadenzaPlayer, {
        compositionHeight: config.compositionHeight,
        compositionWidth: config.compositionWidth,
        deck,
        onPreviewReady(handle) {
          remotionPreviewHandle = handle;

          return () => {
            if (remotionPreviewHandle === handle) {
              remotionPreviewHandle = undefined;
            }
          };
        },
        timeline,
      }),
    );

    return {
      playerProps: {
        compositionHeight: playerProps.compositionHeight,
        compositionWidth: playerProps.compositionWidth,
        durationInFrames: playerProps.durationInFrames,
        fps: playerProps.fps,
      },
      timeline: {
        fps: timeline.fps,
        totalFrames: timeline.totalFrames,
      },
    };
  },
  mountControlledReadinessPreview(selector, config) {
    const host = document.querySelector(selector);
    if (!(host instanceof HTMLElement)) {
      throw new Error(`Missing Remotion preview host '${selector}'.`);
    }

    const deck = Deck({
      fps: 12,
      navigationPolicy: "queue-next",
      children: [
        Slide({
          id: "intro",
          children: Step({ duration: "1s", children: "Intro" }),
        }),
        Slide({
          id: "readiness",
          children: [
            SafeImage({
              alt: "Controlled preview image",
              id: "controlled-image",
              src: "",
              timeoutMs: config.resourceTimeoutMs ?? 10_000,
            }),
            SafeFont({
              family: "Cadenza Controlled",
              id: "controlled-font",
              timeoutMs: config.resourceTimeoutMs ?? 10_000,
            }),
            SafeVideo({
              id: "controlled-video",
              src: "",
              timeoutMs: config.resourceTimeoutMs ?? 10_000,
            }),
            Step({
              duration: "1s",
              children: "Readiness target",
            }),
          ],
        }),
      ],
    });
    const timeline = compile(deck);
    const playerProps = createCadenzaPreviewMount({
      compositionHeight: config.compositionHeight,
      compositionWidth: config.compositionWidth,
      timeline,
    });

    remotionPreviewRoot?.unmount();
    remotionPreviewRoot = createRoot(host);
    remotionPreviewRoot.render(
      React.createElement(CadenzaPlayer, {
        compositionHeight: config.compositionHeight,
        compositionWidth: config.compositionWidth,
        deck,
        fontReadiness: "manual",
        onPreviewReady(handle) {
          remotionPreviewHandle = handle;

          return () => {
            if (remotionPreviewHandle === handle) {
              remotionPreviewHandle = undefined;
            }
          };
        },
        timeline,
      }),
    );

    return {
      playerProps: {
        compositionHeight: playerProps.compositionHeight,
        compositionWidth: playerProps.compositionWidth,
        durationInFrames: playerProps.durationInFrames,
        fps: playerProps.fps,
      },
      timeline: {
        fps: timeline.fps,
        totalFrames: timeline.totalFrames,
      },
    };
  },
  navigateNext() {
    requireRemotionPreviewHandle().next();
  },
  navigatePrevious() {
    requireRemotionPreviewHandle().previous();
  },
  nativeSeekToFrame(frame) {
    requireRemotionPreviewHandle().nativeSeekToFrame(frame);
  },
  snapshot() {
    return requireRemotionPreviewHandle().getSnapshot();
  },
};

function requireRemotionPreviewHandle(): CadenzaPlayerHandle {
  if (!remotionPreviewHandle) {
    throw new Error("Remotion preview handle is not ready.");
  }

  return remotionPreviewHandle;
}

function requirePreviewResource<TElement extends Element>(
  resourceId: string,
): TElement {
  const element = document.querySelector(
    `[data-cadenza-resource-id="${resourceId}"]`,
  );
  if (!element) {
    throw new Error(`Missing preview resource '${resourceId}'.`);
  }

  return element as TElement;
}

function requireReadinessGate() {
  if (!controlledReadiness) {
    throw new Error("Controlled readiness gate is not installed.");
  }

  return controlledReadiness;
}

function controlledReadinessState(
  gate: NonNullable<typeof controlledReadiness>,
): ControlledReadinessState {
  return {
    cursor: gate.runtime.getCursor(),
    titleVisibility: gate.title.style.visibility,
    videoReady: gate.video.dataset.ready === "true",
  };
}
