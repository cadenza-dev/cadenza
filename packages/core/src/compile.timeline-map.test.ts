import {
  compile,
  cursorAtFrame,
  Deck,
  Slide,
  Step,
  Transition,
} from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";

describe("TC-COMP-001 TimelineMap compilation", () => {
  it("compiles a multi-slide deck into monotonic segments with complete cursor coverage", () => {
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
          Transition({ kind: "fade", duration: "500ms" }),
          Slide({
            id: "details",
            children: Step({ duration: "1s", children: "Details" }),
          }),
        ],
      }),
    );

    expect(timeline.totalFrames).toBe(30);
    expect(timeline.slides.map((slide) => slide.slideId)).toEqual([
      "intro",
      "details",
    ]);
    expect(timeline.slides.map((slide) => slide.segment)).toEqual([
      [0, 20],
      [15, 30],
    ]);
    expect(timeline.slides[0]?.steps.map((step) => step.segment)).toEqual([
      [0, 10],
      [10, 20],
    ]);
    expect(timeline.slides[0]?.transitionOut?.segment).toEqual([15, 20]);
    expect(timeline.slides[1]?.transitionIn?.segment).toEqual([15, 20]);
    expect(timeline.slides[1]?.steps.map((step) => step.segment)).toEqual([
      [20, 30],
    ]);

    expect(cursorAtFrame(timeline, 0)).toEqual({
      kind: "at-step",
      slideId: "intro",
      stepIndex: 0,
    });
    expect(cursorAtFrame(timeline, 15)).toEqual({
      kind: "in-transition",
      from: "intro",
      to: "details",
      progress: 0,
    });
    expect(cursorAtFrame(timeline, 29)).toEqual({
      kind: "at-step",
      slideId: "details",
      stepIndex: 0,
    });

    const cursors = Array.from({ length: timeline.totalFrames }, (_, frame) =>
      cursorAtFrame(timeline, frame),
    );

    expect(cursors).toHaveLength(30);
    expect(cursors.every(Boolean)).toBe(true);
  });
});
