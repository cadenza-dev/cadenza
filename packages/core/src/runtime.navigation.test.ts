import { compile, createRuntime, Deck, Slide, Step } from "@cadenza-dev/core";
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
