import {
  compile,
  createResourceReadiness,
  createRuntime,
  Deck,
  SafeFont,
  SafeImage,
  SafeVideo,
  Slide,
  Step,
} from "@cadenza-dev/core";
import { describe, expect, it, vi } from "vitest";

describe("TC-RSAF-002 render-safe readiness", () => {
  it("moves runtime into loading until target slide image, font, and video readiness is reported", () => {
    const readiness = createResourceReadiness();
    const player = { pause: vi.fn(), seekTo: vi.fn() };
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
                SafeImage({ src: "/hero.png", alt: "Hero" }),
                SafeFont({ family: "Inter" }),
                SafeVideo({ src: "/demo.mp4" }),
                Step({ duration: "1s", children: "Media slide" }),
              ],
            }),
          ],
        }),
      ),
      player,
      { readiness },
    );

    runtime.next();

    expect(player.pause).toHaveBeenCalledOnce();
    expect(player.seekTo).not.toHaveBeenCalled();
    expect(runtime.getCursor()).toEqual({
      kind: "loading",
      reason: "asset",
      slideId: "media",
    });

    readiness.markReady("image:/hero.png");

    expect(runtime.getCursor()).toEqual({
      kind: "loading",
      reason: "font",
      slideId: "media",
    });

    readiness.markReady("font:Inter");

    expect(runtime.getCursor()).toEqual({
      kind: "loading",
      reason: "video",
      slideId: "media",
    });

    readiness.markReady("video:/demo.mp4");

    expect(player.seekTo).toHaveBeenCalledWith(10);
    expect(runtime.getCursor()).toEqual({
      kind: "at-step",
      slideId: "media",
      stepIndex: 0,
    });
  });
});
