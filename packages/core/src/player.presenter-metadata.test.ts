import {
  compile,
  createRuntime,
  Deck,
  Notes,
  Slide,
  Step,
} from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";

describe("TC-PLAY-006 presenter metadata", () => {
  it("exposes current slide, step, notes, and elapsed time without notes affecting duration", () => {
    let nowMs = 1_000;
    const timeline = compile(
      Deck({
        fps: 10,
        children: Slide({
          id: "intro",
          children: [
            Notes({ children: "Open with the product promise." }),
            Step({ duration: "2s", children: "Title" }),
            Notes({ children: "Pause before the demo." }),
            Step({ duration: "1s", children: "Demo setup" }),
          ],
        }),
      }),
    );
    const runtime = createRuntime(
      timeline,
      { seekTo() {} },
      {
        clock: { now: () => nowMs },
      },
    );

    expect(timeline.totalFrames).toBe(30);
    expect(timeline.slides[0]?.notes).toEqual([
      "Open with the product promise.",
      "Pause before the demo.",
    ]);

    nowMs = 3_500;

    expect(runtime.getPresenterMetadata()).toEqual({
      slideId: "intro",
      stepIndex: 0,
      notes: ["Open with the product promise.", "Pause before the demo."],
      elapsedWallTimeMs: 2_500,
      elapsedActiveTimeMs: 2_500,
    });

    runtime.next();
    nowMs = 4_000;

    expect(runtime.getPresenterMetadata()).toEqual({
      slideId: "intro",
      stepIndex: 1,
      notes: ["Open with the product promise.", "Pause before the demo."],
      elapsedWallTimeMs: 3_000,
      elapsedActiveTimeMs: 3_000,
    });
  });
});
