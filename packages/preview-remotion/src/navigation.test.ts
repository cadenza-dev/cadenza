import { compile, Deck, Slide, Step, Transition } from "@cadenza-dev/core";
import {
  type CadenzaPreviewController,
  createCadenzaPreviewController,
} from "@cadenza-dev/preview-remotion";
import { describe, expect, it, vi } from "vitest";

describe("TC-PKG-004 preview controller surface", () => {
  it("exposes semantic state, diagnostics, and presenter metadata without raw frame math", () => {
    const timeline = compile(
      Deck({
        fps: 10,
        children: Slide({
          id: "semantic",
          children: Step({ duration: "1s", children: "Semantic state" }),
        }),
      }),
    );
    const controller: CadenzaPreviewController = createCadenzaPreviewController(
      {
        player: createMockPreviewPlayer(),
        timeline,
      },
    );

    expect(Object.keys(controller).sort()).toEqual([
      "dispose",
      "getCursor",
      "getDiagnostics",
      "getPresenterMetadata",
      "goto",
      "next",
      "onCursorChange",
      "previous",
    ]);
    expect("seekTo" in controller).toBe(false);
    expect("getCurrentFrame" in controller).toBe(false);
    expect(controller.getCursor()).toEqual({
      kind: "at-step",
      slideId: "semantic",
      stepIndex: 0,
    });
    expect(controller.getDiagnostics()).toEqual([]);
    expect(controller.getPresenterMetadata()).toMatchObject({
      notes: [],
      slideId: "semantic",
      stepIndex: 0,
    });
  });
});

describe("TC-PRAD-003 preview navigation", () => {
  it("routes next, previous, and goto through runtime anchors and plays transition segments before pausing at semantic anchors", () => {
    const timeline = compile(
      Deck({
        fps: 10,
        children: [
          Slide({
            id: "intro",
            children: [
              Step({ duration: "1s", children: "Open" }),
              Step({ duration: "2s", children: "Reveal" }),
            ],
          }),
          Transition({ kind: "fade", duration: "1s" }),
          Slide({
            id: "details",
            children: Step({ duration: "1s", children: "Details" }),
          }),
        ],
      }),
    );
    const player = createMockPreviewPlayer();
    const controller = createCadenzaPreviewController({ player, timeline });

    controller.goto("intro", 1);
    controller.next();
    player.emitFrameUpdate(30);
    controller.previous();

    expect(player.seekTo).toHaveBeenNthCalledWith(1, 10);
    expect(player.seekTo).toHaveBeenNthCalledWith(2, 20);
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(player.pause.mock.invocationCallOrder[0]).toBeLessThan(
      player.play.mock.invocationCallOrder[0] ?? 0,
    );
    expect(player.pause).toHaveBeenLastCalledWith();
    expect(player.seekTo).toHaveBeenNthCalledWith(3, 30);
    expect(player.seekTo).toHaveBeenNthCalledWith(4, 10);
    expect(controller.getCursor()).toEqual({
      kind: "at-step",
      slideId: "intro",
      stepIndex: 1,
    });
  });
});

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
