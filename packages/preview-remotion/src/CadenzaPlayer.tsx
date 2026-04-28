/** @jsxImportSource react */

import type {
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
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type CadenzaPreviewController,
  createCadenzaPreviewController,
} from "./navigation.js";
import { createCadenzaPreviewMount } from "./playerProps.js";

export type CadenzaPlayerProps = {
  className?: string;
  compositionHeight: number;
  compositionWidth: number;
  controls?: boolean;
  deck: DeckNode;
  onPreviewReady?: (handle: CadenzaPlayerHandle) => (() => void) | undefined;
  playerStyle?: CSSProperties;
  timeline: TimelineMap;
};

export type CadenzaPlayerHandle = {
  getSnapshot(): CadenzaPlayerSnapshot;
  goto(slideId: string, stepIndex?: number): void;
  nativeSeekToFrame(frame: number): void;
  next(): void;
  previous(): void;
};

export type CadenzaPlayerSnapshot = {
  cursor: Cursor;
  playerFrame: number;
  presenterMetadata: PresenterMetadata;
};

type CadenzaTimelineCompositionProps = {
  deck: DeckNode;
  timeline: TimelineMap;
};

export function CadenzaPlayer({
  className,
  compositionHeight,
  compositionWidth,
  controls = false,
  deck,
  onPreviewReady,
  playerStyle,
  timeline,
}: CadenzaPlayerProps): ReactNode {
  const mount = createCadenzaPreviewMount({
    compositionHeight,
    compositionWidth,
    timeline,
  });
  const playerRef = useRef<PlayerRef>(null);
  const controllerRef = useRef<CadenzaPreviewController | undefined>(undefined);
  const [snapshot, setSnapshot] = useState<CadenzaPlayerSnapshot>(() =>
    createInitialSnapshot(timeline),
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    const controller = createCadenzaPreviewController({
      player,
      timeline,
    });
    controllerRef.current = controller;

    const updateSnapshot = () => {
      setSnapshot(createSnapshot(controller, player));
    };
    const unbindCursor = controller.onCursorChange(updateSnapshot);
    const handle: CadenzaPlayerHandle = {
      getSnapshot: () => createSnapshot(controller, player),
      goto(slideId, stepIndex) {
        controller.goto(slideId, stepIndex);
        updateSnapshot();
      },
      nativeSeekToFrame(frame) {
        player.seekTo(frame);
      },
      next() {
        controller.next();
        updateSnapshot();
      },
      previous() {
        controller.previous();
        updateSnapshot();
      },
    };
    const unbindReady = onPreviewReady?.(handle);

    updateSnapshot();

    return () => {
      unbindReady?.();
      unbindCursor();
      controller.dispose();
      if (controllerRef.current === controller) {
        controllerRef.current = undefined;
      }
    };
  }, [onPreviewReady, timeline]);

  return (
    <section
      className={className}
      data-cadenza-cursor-kind={snapshot.cursor.kind}
      data-cadenza-cursor-slide-id={cursorSlideId(snapshot.cursor)}
      data-cadenza-cursor-step-index={cursorStepIndex(snapshot.cursor)}
      data-cadenza-duration-in-frames={mount.durationInFrames}
      data-cadenza-fps={mount.fps}
      data-cadenza-height={mount.compositionHeight}
      data-cadenza-player-frame={snapshot.playerFrame}
      data-cadenza-presenter-slide-id={snapshot.presenterMetadata.slideId}
      data-cadenza-presenter-step-index={snapshot.presenterMetadata.stepIndex}
      data-cadenza-remotion-preview=""
      data-cadenza-requirements="PRAD-001 PRAD-002 PRAD-003 PRAD-004 PRAD-005 PRAD-006 BROW-001 BROW-002 BROW-003 BROW-004"
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
        fps={mount.fps}
        inputProps={{ deck, timeline }}
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

function createInitialSnapshot(timeline: TimelineMap): CadenzaPlayerSnapshot {
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
    playerFrame: slide.steps[0]?.segment[0] ?? 0,
    presenterMetadata: {
      elapsedActiveTimeMs: 0,
      elapsedWallTimeMs: 0,
      notes: slide.notes,
      slideId: slide.slideId,
      stepIndex: slide.steps[0]?.stepIndex ?? 0,
    },
  };
}

function createSnapshot(
  controller: CadenzaPreviewController,
  player: PlayerRef,
): CadenzaPlayerSnapshot {
  return {
    cursor: controller.getCursor(),
    playerFrame: player.getCurrentFrame(),
    presenterMetadata: controller.getPresenterMetadata(),
  };
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

function CadenzaTimelineComposition({
  deck,
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
      {deck.children.map((node, index) =>
        renderCadenzaNode(node, {
          key: `deck:${index}`,
          slideId: undefined,
          stepIndex: undefined,
          timeline,
        }),
      )}
    </main>
  );
}

function renderCadenzaNode(
  node: CadenzaNode,
  context: {
    key: string;
    slideId: string | undefined;
    stepIndex: number | undefined;
    timeline: TimelineMap;
  },
): ReactNode {
  switch (node.kind) {
    case "deck":
      return node.children.map((child, index) =>
        renderCadenzaNode(child, {
          key: `${context.key}:deck:${index}`,
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
    key: string;
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
            key,
            slideId: slide.id,
            stepIndex,
            timeline: context.timeline,
          });
          stepIndex += 1;

          return rendered;
        }

        return renderCadenzaNode(child, {
          key,
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
    key: string;
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
    key: string;
    slideId?: string | undefined;
    stepIndex?: number | undefined;
    timeline?: TimelineMap | undefined;
  },
): ReactNode {
  switch (node.kind) {
    case "safe-resource":
      return (
        <span
          data-cadenza-resource-id={node.resourceId}
          data-cadenza-resource-kind={node.resourceKind}
          data-cadenza-resource-timeout-ms={node.timeoutMs}
          key={context.key}
        >
          {node.resourceKind}: {node.resourceId}
        </span>
      );
    case "typography-box":
      return (
        <div
          data-cadenza-typography-box={node.id}
          key={context.key}
          style={{
            maxHeight: node.maxHeight,
            maxWidth: node.maxWidth,
            overflow: "hidden",
          }}
        >
          {renderUnknown(node.children, `${context.key}:children`, context)}
        </div>
      );
    case "content-slot":
      return (
        <div
          data-cadenza-content-slot={node.id}
          data-cadenza-density={node.metadata.density}
          data-cadenza-readability={node.metadata.readability}
          key={context.key}
        >
          {renderUnknown(node.children, `${context.key}:children`, context)}
        </div>
      );
    case "media-frame":
      return (
        <figure
          data-cadenza-media-frame={node.id}
          data-cadenza-media-frame-aspect-ratio={node.aspectRatio}
          key={context.key}
          style={{
            aspectRatio: String(node.aspectRatio),
            margin: 0,
          }}
        >
          {renderUnknown(node.children, `${context.key}:children`, context)}
        </figure>
      );
  }
}

function renderUnknown(
  value: unknown,
  key: string,
  context: {
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
      key,
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
