import { readFileSync } from "node:fs";
import path from "node:path";
import { type Cursor, cursorAtFrame } from "@cadenza-dev/core";
import type { CadenzaPlayerSnapshot } from "@cadenza-dev/preview-remotion";
import { describe, expect, it, vi } from "vitest";
import {
  createPhase4DogfoodPreviewProps,
  createPhase4TransitionDiagnostics,
} from "../../../examples/phase4/preview.js";
import { createCadenzaPreviewController } from "./navigation.js";

describe("B4.5 Phase 4 transitions and progress evidence", () => {
  it("TC-TRPR-001 uses typed product-layer transitions and local preview navigation settles at semantic anchors", () => {
    const source = readText("examples/phase4/dogfood-talk.tsx");
    const preview = createPhase4DogfoodPreviewProps();
    const transitions = preview.timeline.slides.flatMap((slide) =>
      slide.transitionOut ? [slide.transitionOut] : [],
    );

    expect(source).toContain("ProductTransition");
    expect(source).not.toMatch(/from ["'](?:@remotion\/|remotion\b)/);
    expect(source).not.toContain("TransitionSeries");
    expect(transitions).toEqual([
      expect.objectContaining({
        durationFrames: 11,
        from: "architecture-contract",
        kind: "soft-fade",
        timingToken: "reveal",
        to: "timeline-compiler",
      }),
      expect.objectContaining({
        durationFrames: 17,
        from: "timeline-compiler",
        kind: "chapter-shift",
        timingToken: "chapterShift",
        to: "preview-reliability-budget",
      }),
      expect.objectContaining({
        durationFrames: 11,
        from: "preview-reliability-budget",
        kind: "soft-fade",
        timingToken: "reveal",
        to: "product-layer-loop",
      }),
    ]);

    const player = createMockPreviewPlayer();
    const controller = createCadenzaPreviewController({
      player,
      timeline: preview.timeline,
    });
    const firstTransition = transitions[0];
    if (!firstTransition) {
      throw new Error("Expected the dogfood talk to contain a transition.");
    }

    controller.goto("architecture-contract", 1);
    controller.next();
    player.emitFrameUpdate(firstTransition.segment[0] + 1);

    expect(player.seekTo).toHaveBeenNthCalledWith(1, 72);
    expect(player.seekTo).toHaveBeenNthCalledWith(
      2,
      firstTransition.segment[0],
    );
    expect(player.play).toHaveBeenCalledOnce();
    expect(controller.getCursor()).toMatchObject({
      from: "architecture-contract",
      kind: "in-transition",
      to: "timeline-compiler",
    });

    player.emitFrameUpdate(firstTransition.segment[1]);

    expect(player.pause).toHaveBeenCalled();
    expect(player.seekTo).toHaveBeenLastCalledWith(firstTransition.segment[1]);
    expect(controller.getCursor()).toEqual({
      kind: "at-step",
      slideId: "timeline-compiler",
      stepIndex: 0,
    });
  });

  it("TC-TRPR-002 exposes internal transition diagnostics without turning cursor changes into progress events", () => {
    const preview = createPhase4DogfoodPreviewProps();
    const transition = preview.timeline.slides[0]?.transitionOut;
    if (!transition) {
      throw new Error("Expected the first dogfood slide to transition out.");
    }
    const [startFrame, settleFrame] = transition.segment;
    const progressFrame =
      startFrame + Math.floor(transition.durationFrames / 2);

    expect(
      createPhase4TransitionDiagnostics({
        snapshot: createSnapshot(preview.timeline, startFrame),
        timeline: preview.timeline,
      }),
    ).toEqual([
      expect.objectContaining({
        code: "TRPR_TRANSITION_START",
        requirementRefs: ["TRPR-003", "TRPR-004"],
        source: "phase4-transition-progress",
        testRefs: ["TC-TRPR-002"],
        transition: expect.objectContaining({
          durationFrames: transition.durationFrames,
          from: "architecture-contract",
          kind: "soft-fade",
          progress: 0,
          progressPhase: "start",
          settleBehavior: "semantic-anchor",
          settleFrame,
          timingToken: "reveal",
          to: "timeline-compiler",
        }),
      }),
    ]);
    expect(
      createPhase4TransitionDiagnostics({
        snapshot: createSnapshot(preview.timeline, progressFrame),
        timeline: preview.timeline,
      }),
    ).toEqual([
      expect.objectContaining({
        code: "TRPR_TRANSITION_PROGRESS",
        transition: expect.objectContaining({
          progress: expect.closeTo(0.45, 2),
          progressPhase: "progress",
        }),
      }),
    ]);
    expect(
      createPhase4TransitionDiagnostics({
        snapshot: createSnapshot(preview.timeline, settleFrame),
        timeline: preview.timeline,
      }),
    ).toEqual([
      expect.objectContaining({
        code: "TRPR_TRANSITION_SETTLED",
        transition: expect.objectContaining({
          progress: 1,
          progressPhase: "settled",
        }),
      }),
    ]);

    const player = createMockPreviewPlayer();
    const controller = createCadenzaPreviewController({
      player,
      timeline: preview.timeline,
    });
    const cursorChanges: Cursor[] = [];
    controller.onCursorChange((cursor) => cursorChanges.push(cursor));

    controller.goto("architecture-contract", 1);
    controller.next();
    player.emitFrameUpdate(startFrame + 1);
    player.emitFrameUpdate(startFrame + 2);
    player.emitFrameUpdate(startFrame + 3);

    expect(
      cursorChanges.filter((cursor) => cursor.kind === "in-transition"),
    ).toHaveLength(1);
    expect(readText("packages/preview-remotion/src/index.ts")).not.toMatch(
      /onTransitionProgress|TransitionProgress/,
    );
    expect(readText("examples/phase4/preview.jsx")).toContain(
      "data-cadenza-phase4-transition-progress",
    );
  });
});

function createSnapshot(
  timeline: ReturnType<typeof createPhase4DogfoodPreviewProps>["timeline"],
  playerFrame: number,
): CadenzaPlayerSnapshot {
  const cursor = cursorAtFrame(timeline, playerFrame);
  const slideId = cursor.kind === "in-transition" ? cursor.to : cursor.slideId;

  return {
    cursor,
    diagnostics: [],
    playerFrame,
    presenterMetadata: {
      elapsedActiveTimeMs: 0,
      elapsedWallTimeMs: 0,
      notes: [],
      slideId,
      stepIndex: cursor.kind === "at-step" ? cursor.stepIndex : 0,
    },
    readiness: {
      pendingResourceIds: [],
      resources: [],
    },
  };
}

function createMockPreviewPlayer() {
  let frame = 0;
  let frameUpdate: ((event: { detail: { frame: number } }) => void) | undefined;

  return {
    addEventListener: vi.fn(
      (
        eventName: string,
        listener: (event: { detail: { frame: number } }) => void,
      ) => {
        if (eventName === "frameupdate") {
          frameUpdate = listener;
        }
      },
    ),
    emitFrameUpdate(nextFrame: number) {
      frame = nextFrame;
      frameUpdate?.({ detail: { frame: nextFrame } });
    },
    getCurrentFrame: vi.fn(() => frame),
    pause: vi.fn(),
    play: vi.fn(),
    removeEventListener: vi.fn(),
    seekTo: vi.fn((nextFrame: number) => {
      frame = nextFrame;
    }),
  };
}

function readText(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}
