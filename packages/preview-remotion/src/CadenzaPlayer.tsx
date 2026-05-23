/** @jsxImportSource react */

import type {
  CadenzaDiagnostic,
  CadenzaNode,
  Cursor,
  DeckNode,
  PresenterMetadata,
  RenderSafeNode,
  SlideNode,
  StepContext,
  StepNode,
  TimelineMap,
} from "@cadenza-dev/core";
import { Player, type PlayerRef } from "@remotion/player";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type CadenzaPreviewController,
  createCadenzaPreviewController,
} from "./navigation.js";
import { createCadenzaPreviewMount } from "./playerProps.js";
import {
  createPreviewReadinessRegistry,
  loadingResourceIdForCursor,
  type PreviewReadinessRegistry,
  type PreviewResourceStatus,
} from "./readiness/registry.js";
import { usePreviewBuffering } from "./readiness/usePreviewBuffering.js";
import {
  type PreviewFontReadinessMode,
  SafeFontPreview,
} from "./render-safe/SafeFontPreview.js";
import { SafeImagePreview } from "./render-safe/SafeImagePreview.js";
import { SafeVideoPreview } from "./render-safe/SafeVideoPreview.js";
import { createContentSlotPreviewMetadata } from "./validation/contentSlot.js";
import {
  type MediaFramePreviewMeasurement,
  measureMediaFrame,
  validateMediaFrameMeasurement,
} from "./validation/mediaFrame.js";
import {
  measureTypographyBox,
  type TypographyPreviewMeasurement,
  validateTypographyBoxMeasurement,
} from "./validation/typography.js";

export type CadenzaPlayerProps = {
  className?: string;
  compositionHeight: number;
  compositionWidth: number;
  controls?: boolean;
  deck: DeckNode;
  fontReadiness?: PreviewFontReadinessMode;
  onPreviewReady?: (handle: CadenzaPlayerHandle) => (() => void) | undefined;
  onSnapshotChange?: (snapshot: CadenzaPlayerSnapshot) => void;
  playerStyle?: CSSProperties;
  timeline: TimelineMap;
};

export type CadenzaPlayerHandle = {
  getSnapshot(): CadenzaPlayerSnapshot;
  goto(slideId: string, stepIndex?: number): void;
  isPlaying(): boolean;
  markResourceReady(resourceId: string): void;
  nativeSeekToFrame(frame: number): void;
  next(): void;
  pause(): void;
  play(): void;
  previous(): void;
  togglePlayback(): void;
};

export type CadenzaPlayerSnapshot = {
  bufferingResourceId?: string | undefined;
  cursor: Cursor;
  diagnostics: CadenzaDiagnostic[];
  playerFrame: number;
  presenterMetadata: PresenterMetadata;
  readiness: {
    pendingResourceIds: string[];
    resources: PreviewResourceStatus[];
  };
};

type CadenzaTimelineCompositionProps = {
  bufferingResourceId?: string | undefined;
  deck: DeckNode;
  fontReadiness: PreviewFontReadinessMode;
  readiness: PreviewReadinessRegistry;
  timeline: TimelineMap;
};

export function CadenzaPlayer({
  className,
  compositionHeight,
  compositionWidth,
  controls = false,
  deck,
  fontReadiness = "browser",
  onPreviewReady,
  onSnapshotChange,
  playerStyle,
  timeline,
}: CadenzaPlayerProps): ReactNode {
  const mount = createCadenzaPreviewMount({
    compositionHeight,
    compositionWidth,
    timeline,
  });
  const readiness = useMemo(
    () => createPreviewReadinessRegistry(timeline),
    [timeline],
  );
  const playerRef = useRef<PlayerRef>(null);
  const playerDiagnosticsRef = useRef<CadenzaDiagnostic[]>([]);
  const controllerRef = useRef<CadenzaPreviewController | undefined>(undefined);
  const [snapshot, setSnapshot] = useState<CadenzaPlayerSnapshot>(() =>
    createInitialSnapshot(timeline, readiness),
  );
  const publishSnapshot = useCallback(
    (nextSnapshot: CadenzaPlayerSnapshot) => {
      setSnapshot(nextSnapshot);
      onSnapshotChange?.(nextSnapshot);
    },
    [onSnapshotChange],
  );
  const recordPlayerError = useCallback(
    (error: Error) => {
      const diagnostic = createRemotionPlayerDiagnostic(error);
      playerDiagnosticsRef.current = mergeDiagnostics([
        ...playerDiagnosticsRef.current,
        diagnostic,
      ]);
      setSnapshot((current) => {
        const nextSnapshot = {
          ...current,
          diagnostics: mergeDiagnostics([...current.diagnostics, diagnostic]),
        };
        onSnapshotChange?.(nextSnapshot);
        return nextSnapshot;
      });
    },
    [onSnapshotChange],
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    const controller = createCadenzaPreviewController({
      player,
      readiness,
      timeline,
    });
    controllerRef.current = controller;

    const updateSnapshot = () => {
      publishSnapshot(
        createSnapshot(
          controller,
          player,
          timeline,
          readiness,
          playerDiagnosticsRef.current,
        ),
      );
    };
    const unbindCursor = controller.onCursorChange(updateSnapshot);
    const unbindReadiness = readiness.onChange(updateSnapshot);
    const handle: CadenzaPlayerHandle = {
      getSnapshot: () =>
        createSnapshot(
          controller,
          player,
          timeline,
          readiness,
          playerDiagnosticsRef.current,
        ),
      goto(slideId, stepIndex) {
        controller.goto(slideId, stepIndex);
        updateSnapshot();
      },
      isPlaying() {
        return player.isPlaying();
      },
      markResourceReady(resourceId) {
        readiness.markReady(resourceId);
        updateSnapshot();
      },
      nativeSeekToFrame(frame) {
        player.seekTo(frame);
      },
      next() {
        controller.next();
        updateSnapshot();
      },
      pause() {
        player.pause();
        updateSnapshot();
      },
      play() {
        player.play();
        updateSnapshot();
      },
      previous() {
        controller.previous();
        updateSnapshot();
      },
      togglePlayback() {
        player.toggle();
        updateSnapshot();
      },
    };
    const unbindReady = onPreviewReady?.(handle);

    updateSnapshot();

    return () => {
      unbindReady?.();
      unbindCursor();
      unbindReadiness();
      controller.dispose();
      if (controllerRef.current === controller) {
        controllerRef.current = undefined;
      }
    };
  }, [onPreviewReady, publishSnapshot, readiness, timeline]);

  return (
    <section
      className={className}
      data-cadenza-cursor-kind={snapshot.cursor.kind}
      data-cadenza-cursor-slide-id={cursorSlideId(snapshot.cursor)}
      data-cadenza-cursor-step-index={cursorStepIndex(snapshot.cursor)}
      data-cadenza-diagnostic-count={snapshot.diagnostics.length}
      data-cadenza-duration-in-frames={mount.durationInFrames}
      data-cadenza-fps={mount.fps}
      data-cadenza-height={mount.compositionHeight}
      data-cadenza-loading-reason={loadingReason(snapshot.cursor)}
      data-cadenza-pending-resource-ids={snapshot.readiness.pendingResourceIds.join(
        " ",
      )}
      data-cadenza-player-frame={snapshot.playerFrame}
      data-cadenza-preview-buffering={String(
        snapshot.bufferingResourceId !== undefined,
      )}
      data-cadenza-preview-buffering-resource-id={snapshot.bufferingResourceId}
      data-cadenza-presenter-slide-id={snapshot.presenterMetadata.slideId}
      data-cadenza-presenter-step-index={snapshot.presenterMetadata.stepIndex}
      data-cadenza-ready-resource-ids={snapshot.readiness.resources
        .filter((resource) => resource.ready)
        .map((resource) => resource.resourceId)
        .join(" ")}
      data-cadenza-remotion-preview=""
      data-cadenza-requirements="PKG-004 PRAD-001 PRAD-002 PRAD-003 PRAD-004 PRAD-005 PRAD-006 PRAD-007 RSRM-001 RSRM-002 RSRM-003 RSRM-004 RSRM-005 RSRM-006 RSRM-007 RSRM-008 BROW-001 BROW-002 BROW-003 BROW-004 BROW-005 BROW-006 BROW-007 BROW-008"
      data-cadenza-width={mount.compositionWidth}
    >
      <div data-cadenza-preview-controls="">
        <button onClick={() => controllerRef.current?.previous()} type="button">
          Previous
        </button>
        <button onClick={() => controllerRef.current?.next()} type="button">
          Next
        </button>
        <button
          onClick={() => controllerRef.current?.goto("render-safe-demo", 0)}
          type="button"
        >
          Goto render-safe-demo
        </button>
      </div>
      <Player
        acknowledgeRemotionLicense
        className="cadenza-remotion-player"
        clickToPlay={false}
        component={CadenzaTimelineComposition}
        compositionHeight={mount.compositionHeight}
        compositionWidth={mount.compositionWidth}
        controls={controls}
        durationInFrames={mount.durationInFrames}
        errorFallback={({ error }: { error: Error }) => (
          <RemotionPlayerErrorFallback
            error={error}
            onError={recordPlayerError}
          />
        )}
        fps={mount.fps}
        inputProps={{
          bufferingResourceId: snapshot.bufferingResourceId,
          deck,
          fontReadiness,
          readiness,
          timeline,
        }}
        loop={false}
        noSuspense
        ref={playerRef}
        style={{
          aspectRatio: `${mount.compositionWidth} / ${mount.compositionHeight}`,
          maxWidth: mount.compositionWidth,
          width: "100%",
          ...playerStyle,
        }}
      />
    </section>
  );
}

function createInitialSnapshot(
  timeline: TimelineMap,
  readiness: PreviewReadinessRegistry,
): CadenzaPlayerSnapshot {
  const slide = timeline.slides[0];

  if (!slide) {
    throw new Error("Cadenza preview requires at least one slide.");
  }

  return {
    cursor: {
      kind: "at-step",
      slideId: slide.slideId,
      stepIndex: slide.steps[0]?.stepIndex ?? 0,
    },
    diagnostics: readiness.getDiagnostics(),
    playerFrame: slide.steps[0]?.segment[0] ?? 0,
    presenterMetadata: {
      elapsedActiveTimeMs: 0,
      elapsedWallTimeMs: 0,
      notes: slide.notes,
      slideId: slide.slideId,
      stepIndex: slide.steps[0]?.stepIndex ?? 0,
    },
    readiness: {
      pendingResourceIds: readiness.getPendingResourceIds(),
      resources: readiness.getResourceStatuses(),
    },
  };
}

function createSnapshot(
  controller: CadenzaPreviewController,
  player: PlayerRef,
  timeline: TimelineMap,
  readiness: PreviewReadinessRegistry,
  playerDiagnostics: CadenzaDiagnostic[] = [],
): CadenzaPlayerSnapshot {
  const cursor = controller.getCursor();

  return {
    bufferingResourceId: loadingResourceIdForCursor(
      cursor,
      timeline,
      readiness,
    ),
    cursor,
    diagnostics: mergeDiagnostics([
      ...controller.getDiagnostics(),
      ...readiness.getDiagnostics(),
      ...playerDiagnostics,
    ]),
    playerFrame: player.getCurrentFrame(),
    presenterMetadata: controller.getPresenterMetadata(),
    readiness: {
      pendingResourceIds: readiness.getPendingResourceIds(),
      resources: readiness.getResourceStatuses(),
    },
  };
}

function createRemotionPlayerDiagnostic(error: Error): CadenzaDiagnostic {
  return {
    code: "PRAD_REMOTION_PLAYER_ERROR",
    message: error.message,
    requirementId: "PRAD-007",
    severity: "fatal",
    source: "remotion-player",
  };
}

function mergeDiagnostics(
  diagnostics: CadenzaDiagnostic[],
): CadenzaDiagnostic[] {
  const seen = new Set<string>();
  const merged: CadenzaDiagnostic[] = [];

  for (const diagnostic of diagnostics) {
    const key = [
      diagnostic.code,
      diagnostic.requirementId,
      diagnostic.source,
      diagnostic.message,
    ].join("\0");

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(diagnostic);
  }

  return merged;
}

function RemotionPlayerErrorFallback({
  error,
  onError,
}: {
  error: Error;
  onError: (error: Error) => void;
}): ReactNode {
  useEffect(() => {
    onError(error);
  }, [error, onError]);

  return <div data-cadenza-remotion-player-error="">{error.message}</div>;
}

function cursorSlideId(cursor: Cursor): string {
  if (cursor.kind === "in-transition") {
    return cursor.to;
  }

  return cursor.slideId;
}

function cursorStepIndex(cursor: Cursor): number | undefined {
  if (cursor.kind !== "at-step") {
    return undefined;
  }

  return cursor.stepIndex;
}

function loadingReason(cursor: Cursor): string | undefined {
  if (cursor.kind !== "loading") {
    return undefined;
  }

  return cursor.reason;
}

function CadenzaTimelineComposition({
  bufferingResourceId,
  deck,
  fontReadiness,
  readiness,
  timeline,
}: CadenzaTimelineCompositionProps): ReactNode {
  const colors = deck.theme?.tokens.color ?? {};

  return (
    <main
      data-cadenza-composition=""
      data-cadenza-total-frames={timeline.totalFrames}
      style={{
        background: String(colors.background ?? "#111827"),
        boxSizing: "border-box",
        color: String(colors.foreground ?? "#f9fafb"),
        display: "grid",
        fontFamily: "Inter, Arial, sans-serif",
        gap: 16,
        minHeight: "100%",
        padding: 32,
      }}
    >
      <PreviewBufferingBridge
        readiness={readiness}
        resourceId={bufferingResourceId}
      />
      {deck.children.map((node, index) =>
        renderCadenzaNode(node, {
          fontReadiness,
          key: `deck:${index}`,
          readiness,
          slideId: undefined,
          stepIndex: undefined,
          timeline,
        }),
      )}
    </main>
  );
}

function PreviewBufferingBridge({
  readiness,
  resourceId,
}: {
  readiness: PreviewReadinessRegistry;
  resourceId?: string | undefined;
}): ReactNode {
  usePreviewBuffering({ readiness, resourceId });

  return null;
}

function renderCadenzaNode(
  node: CadenzaNode,
  context: {
    fontReadiness: PreviewFontReadinessMode;
    key: string;
    readiness: PreviewReadinessRegistry;
    slideId: string | undefined;
    stepIndex: number | undefined;
    timeline: TimelineMap;
  },
): ReactNode {
  switch (node.kind) {
    case "deck":
      return node.children.map((child, index) =>
        renderCadenzaNode(child, {
          fontReadiness: context.fontReadiness,
          key: `${context.key}:deck:${index}`,
          readiness: context.readiness,
          slideId: undefined,
          stepIndex: undefined,
          timeline: context.timeline,
        }),
      );
    case "slide":
      return renderSlide(node, context);
    case "step":
      return renderStep(node, context);
    case "notes":
      return (
        <aside data-cadenza-presenter-notes="" key={context.key}>
          {node.children}
        </aside>
      );
    case "transition":
      return null;
    case "theme":
      return null;
    default:
      return renderSafeNode(node, context);
  }
}

function renderSlide(
  slide: SlideNode,
  context: {
    fontReadiness: PreviewFontReadinessMode;
    key: string;
    readiness: PreviewReadinessRegistry;
    timeline: TimelineMap;
  },
): ReactNode {
  let stepIndex = 0;

  return (
    <section data-cadenza-slide-id={slide.id} key={context.key}>
      {slide.children.map((child, index) => {
        const key = `${context.key}:child:${index}`;

        if (child.kind === "step") {
          const rendered = renderStep(child, {
            fontReadiness: context.fontReadiness,
            key,
            readiness: context.readiness,
            slideId: slide.id,
            stepIndex,
            timeline: context.timeline,
          });
          stepIndex += 1;

          return rendered;
        }

        return renderCadenzaNode(child, {
          fontReadiness: context.fontReadiness,
          key,
          readiness: context.readiness,
          slideId: slide.id,
          stepIndex: undefined,
          timeline: context.timeline,
        });
      })}
    </section>
  );
}

function renderStep(
  step: StepNode,
  context: {
    fontReadiness: PreviewFontReadinessMode;
    key: string;
    readiness: PreviewReadinessRegistry;
    slideId: string | undefined;
    stepIndex: number | undefined;
    timeline: TimelineMap;
  },
): ReactNode {
  const slideId = context.slideId ?? "unknown-slide";
  const stepIndex = context.stepIndex ?? 0;
  const stepContext: StepContext = {
    fps: context.timeline.fps,
    slideId,
    stepIndex,
  };
  const children =
    typeof step.children === "function"
      ? step.children(stepContext)
      : step.children;

  return (
    <div
      data-cadenza-step-index={stepIndex}
      data-cadenza-step-kind={step.stepKind}
      data-cadenza-step-slide-id={slideId}
      key={context.key}
    >
      {renderUnknown(children, `${context.key}:children`, context)}
    </div>
  );
}

function renderSafeNode(
  node: RenderSafeNode,
  context: {
    fontReadiness: PreviewFontReadinessMode;
    key: string;
    readiness: PreviewReadinessRegistry;
    slideId?: string | undefined;
    stepIndex?: number | undefined;
    timeline?: TimelineMap | undefined;
  },
): ReactNode {
  switch (node.kind) {
    case "safe-resource":
      if (node.resourceKind === "asset") {
        return (
          <SafeImagePreview
            key={context.key}
            readiness={context.readiness}
            resource={node}
          />
        );
      }

      if (node.resourceKind === "font") {
        return (
          <SafeFontPreview
            fontReadiness={context.fontReadiness}
            key={context.key}
            readiness={context.readiness}
            resource={node}
          />
        );
      }

      return (
        <SafeVideoPreview
          key={context.key}
          readiness={context.readiness}
          resource={node}
        />
      );
    case "typography-box":
      return (
        <TypographyBoxPreview
          key={context.key}
          maxHeight={node.maxHeight}
          maxWidth={node.maxWidth}
          readiness={context.readiness}
          source={node.id}
        >
          {renderUnknown(node.children, `${context.key}:children`, context)}
        </TypographyBoxPreview>
      );
    case "content-slot": {
      const metadata = createContentSlotPreviewMetadata({
        density: node.metadata.density,
        readability: node.metadata.readability,
        source: node.id,
      });

      return (
        <div
          data-cadenza-content-slot={node.id}
          data-cadenza-density={metadata.density}
          data-cadenza-readability={metadata.readability}
          data-cadenza-requirements="RSRM-008 BROW-005"
          key={context.key}
        >
          {renderUnknown(node.children, `${context.key}:children`, context)}
        </div>
      );
    }
    case "media-frame":
      return (
        <MediaFramePreview
          expectedAspectRatio={node.aspectRatio}
          key={context.key}
          readiness={context.readiness}
          source={node.id}
        >
          {renderUnknown(node.children, `${context.key}:children`, context)}
        </MediaFramePreview>
      );
  }
}

function TypographyBoxPreview({
  children,
  maxHeight,
  maxWidth,
  readiness,
  source,
}: {
  children: ReactNode;
  maxHeight: number;
  maxWidth: number;
  readiness: PreviewReadinessRegistry;
  source: string;
}): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const [measurement, setMeasurement] = useState<
    TypographyPreviewMeasurement | undefined
  >(undefined);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const nextMeasurement = measureTypographyBox(element, source);
    setMeasurement(nextMeasurement);

    for (const diagnostic of validateTypographyBoxMeasurement(
      nextMeasurement,
    )) {
      readiness.pushDiagnostic(diagnostic);
    }
  }, [readiness, source]);

  return (
    <div
      data-cadenza-requirements="RSRM-006 BROW-005"
      data-cadenza-typography-box={source}
      data-cadenza-typography-client-height={measurement?.clientHeight}
      data-cadenza-typography-client-width={measurement?.clientWidth}
      data-cadenza-typography-scroll-height={measurement?.scrollHeight}
      data-cadenza-typography-scroll-width={measurement?.scrollWidth}
      ref={ref}
      style={{
        maxHeight,
        maxWidth,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function MediaFramePreview({
  children,
  expectedAspectRatio,
  readiness,
  source,
}: {
  children: ReactNode;
  expectedAspectRatio: number;
  readiness: PreviewReadinessRegistry;
  source: string;
}): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const [measurement, setMeasurement] = useState<
    MediaFramePreviewMeasurement | undefined
  >(undefined);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const nextMeasurement = measureMediaFrame(element, {
      expectedAspectRatio,
      source,
    });
    setMeasurement(nextMeasurement);

    for (const diagnostic of validateMediaFrameMeasurement(nextMeasurement)) {
      readiness.pushDiagnostic(diagnostic);
    }
  }, [expectedAspectRatio, readiness, source]);

  return (
    <figure
      data-cadenza-media-frame={source}
      data-cadenza-media-frame-aspect-ratio={expectedAspectRatio}
      data-cadenza-media-frame-client-height={measurement?.clientHeight}
      data-cadenza-media-frame-client-width={measurement?.clientWidth}
      data-cadenza-media-frame-measured-aspect-ratio={
        measurement?.measuredAspectRatio
      }
      data-cadenza-requirements="RSRM-007 BROW-005"
      ref={ref}
      style={{
        aspectRatio: String(expectedAspectRatio),
        margin: 0,
      }}
    >
      {children}
    </figure>
  );
}

function renderUnknown(
  value: unknown,
  key: string,
  context: {
    fontReadiness: PreviewFontReadinessMode;
    readiness: PreviewReadinessRegistry;
    slideId?: string | undefined;
    stepIndex?: number | undefined;
    timeline?: TimelineMap | undefined;
  },
): ReactNode {
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      renderUnknown(item, `${key}:${index}`, context),
    );
  }

  if (value === null || value === undefined || typeof value === "boolean") {
    return null;
  }

  if (typeof value === "string" || typeof value === "number") {
    return <span key={key}>{value}</span>;
  }

  if (typeof value === "object" && "kind" in value) {
    return renderCadenzaNode(value as CadenzaNode, {
      fontReadiness: context.fontReadiness,
      key,
      readiness: context.readiness,
      slideId: context.slideId,
      stepIndex: context.stepIndex,
      timeline: requireTimeline(context.timeline),
    });
  }

  return null;
}

function requireTimeline(timeline: TimelineMap | undefined): TimelineMap {
  if (!timeline) {
    throw new Error("Cadenza preview rendering requires a compiled timeline.");
  }

  return timeline;
}
