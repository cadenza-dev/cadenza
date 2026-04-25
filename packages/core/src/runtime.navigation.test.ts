import {
  compile,
  createRuntime,
  Deck,
  type NavigationPolicy,
  Slide,
  Step,
  Transition,
} from "@cadenza-dev/core";
import { describe, expect, it, vi } from "vitest";

describe("TC-COMP-004 runtime navigation", () => {
  it("seeks goto, next, and previous to compiler-provided frame anchors", () => {
    const timeline = compile(
      Deck({
        fps: 10,
        children: [
          Slide({
            id: "intro",
            children: [
              Step({ duration: "1s", children: "Open" }),
              Step({ duration: "1s", children: "Reveal" }),
            ],
          }),
          Slide({
            id: "details",
            children: Step({ duration: "1s", children: "Details" }),
          }),
        ],
      }),
    );
    const player = { seekTo: vi.fn() };
    const runtime = createRuntime(timeline, player);

    runtime.goto("intro", 1);
    runtime.next();
    runtime.previous();

    expect(player.seekTo).toHaveBeenNthCalledWith(1, 10);
    expect(player.seekTo).toHaveBeenNthCalledWith(2, 20);
    expect(player.seekTo).toHaveBeenNthCalledWith(3, 10);
    expect(runtime.getCursor()).toEqual({
      kind: "at-step",
      slideId: "intro",
      stepIndex: 1,
    });
  });
});

describe("TC-COMP-007 transition navigation policy", () => {
  it("applies the deck-level policy when next is pressed mid-transition", () => {
    const cutToNext = createRuntimeAtTransition("cut-to-next");

    cutToNext.runtime.next();

    expect(cutToNext.player.seekTo).toHaveBeenCalledWith(20);
    expect(cutToNext.runtime.getCursor()).toEqual({
      kind: "at-step",
      slideId: "details",
      stepIndex: 0,
    });

    const finishThenAdvance = createRuntimeAtTransition("finish-then-advance");

    finishThenAdvance.runtime.next();

    expect(finishThenAdvance.player.seekTo).not.toHaveBeenCalled();
    expect(finishThenAdvance.runtime.getCursor()).toEqual({
      kind: "in-transition",
      from: "intro",
      to: "details",
      progress: 0.4,
    });

    const queueNext = createRuntimeAtTransition("queue-next");

    queueNext.runtime.next();
    queueNext.emitFrame(20);

    expect(queueNext.player.seekTo).toHaveBeenCalledWith(30);
    expect(queueNext.runtime.getCursor()).toEqual({
      kind: "at-step",
      slideId: "details",
      stepIndex: 1,
    });
  });
});

function createRuntimeAtTransition(navigationPolicy: NavigationPolicy) {
  let frameHandler: ((frame: number) => void) | undefined;
  const player = {
    getCurrentFrame: vi.fn(() => 14),
    onFrameChange: vi.fn((handler: (frame: number) => void) => {
      frameHandler = handler;

      return () => {
        frameHandler = undefined;
      };
    }),
    seekTo: vi.fn(),
  };
  const runtime = createRuntime(
    compile(
      Deck({
        fps: 10,
        navigationPolicy,
        children: [
          Slide({
            id: "intro",
            children: Step({ duration: "2s", children: "Intro" }),
          }),
          Transition({ kind: "fade", duration: "1s" }),
          Slide({
            id: "details",
            children: [
              Step({ duration: "1s", children: "Details" }),
              Step({ duration: "1s", children: "More details" }),
            ],
          }),
        ],
      }),
    ),
    player,
  );

  return {
    emitFrame(frame: number) {
      frameHandler?.(frame);
    },
    player,
    runtime,
  };
}
