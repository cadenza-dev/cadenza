/** @jsxImportSource react */

import type {
  CadenzaNode,
  DeckNode,
  RenderSafeNode,
  SlideNode,
  StepContext,
  StepNode,
  TimelineMap,
} from "@cadenza-dev/core";
import { Player } from "@remotion/player";
import type { CSSProperties, ReactNode } from "react";
import { createCadenzaPreviewMount } from "./playerProps.js";

export type CadenzaPlayerProps = {
  className?: string;
  compositionHeight: number;
  compositionWidth: number;
  controls?: boolean;
  deck: DeckNode;
  playerStyle?: CSSProperties;
  timeline: TimelineMap;
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
  playerStyle,
  timeline,
}: CadenzaPlayerProps): ReactNode {
  const mount = createCadenzaPreviewMount({
    compositionHeight,
    compositionWidth,
    timeline,
  });

  return (
    <section
      className={className}
      data-cadenza-duration-in-frames={mount.durationInFrames}
      data-cadenza-fps={mount.fps}
      data-cadenza-height={mount.compositionHeight}
      data-cadenza-remotion-preview=""
      data-cadenza-requirements="PRAD-001 PRAD-002 BROW-001 BROW-002"
      data-cadenza-width={mount.compositionWidth}
    >
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
