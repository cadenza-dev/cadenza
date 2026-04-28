import {
  CadenzaValidationError,
  compile,
  createRuntime,
  Deck,
  Slide,
  Step,
} from "@cadenza-dev/core";
import { describe, expect, it, vi } from "vitest";

describe("B1.4-B1 compiler/runtime semantic closeout", () => {
  it("expands wait-for-event intervals at runtime and freezes exportDuration offline", () => {
    let frameHandler: ((frame: number) => void) | undefined;
    const player = {
      getCurrentFrame: vi.fn(() => 0),
      onFrameChange: vi.fn((handler: (frame: number) => void) => {
        frameHandler = handler;

        return () => {
          frameHandler = undefined;
        };
      }),
      seekTo: vi.fn(),
    };
    const previewTimeline = compile(
      Deck({
        fps: 10,
        children: Slide({
          id: "interactive",
          children: [
            Step({ kind: "wait-for-event", children: "Audience Q&A" }),
            Step({ duration: "1s", children: "Continue" }),
          ],
        }),
      }),
    );

    expect(
      previewTimeline.slides[0]?.steps.map((step) => step.segment),
    ).toEqual([
      [0, 20],
      [20, 30],
    ]);

    const runtime = createRuntime(previewTimeline, player);

    frameHandler?.(45);

    expect(runtime.getCursor()).toEqual({
      kind: "at-step",
      slideId: "interactive",
      stepIndex: 0,
    });

    runtime.next();

    expect(player.seekTo).toHaveBeenLastCalledWith(46);

    const offlineTimeline = compile(
      Deck({
        fps: 10,
        children: Slide({
          id: "offline",
          children: [
            Step({
              kind: "wait-for-event",
              exportDuration: "5s",
              children: "Narrated pause",
            }),
            Step({ duration: "1s", children: "Continue" }),
          ],
        }),
      }),
      { mode: "offline" },
    );

    expect(
      offlineTimeline.slides[0]?.steps.map((step) => step.segment),
    ).toEqual([
      [0, 50],
      [50, 60],
    ]);

    try {
      compile(
        Deck({
          children: Slide({
            id: "missing-export-duration",
            children: Step({
              kind: "wait-for-event",
              children: "No offline duration",
            }),
          }),
        }),
        { mode: "offline" },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(CadenzaValidationError);
      expect((error as CadenzaValidationError).diagnostics).toEqual([
        expect.objectContaining({
          code: "COMP_MISSING_EXPORT_DURATION",
          requirementId: "COMP-005",
          severity: "fatal",
          source: "missing-export-duration",
        }),
      ]);
      return;
    }

    throw new Error("Expected offline compilation to fail.");
  });

  it("loads unresolved computed steps at runtime and rejects them offline", () => {
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
              id: "computed",
              children: Step({
                kind: "computed",
                children: () => "Computed result",
              }),
            }),
          ],
        }),
      ),
      player,
    );

    runtime.next();

    expect(player.pause).toHaveBeenCalledOnce();
    expect(player.seekTo).not.toHaveBeenCalled();
    expect(runtime.getCursor()).toEqual({
      kind: "loading",
      reason: "computed",
      slideId: "computed",
    });

    try {
      compile(
        Deck({
          children: Slide({
            id: "unresolved-computed",
            children: Step({
              kind: "computed",
              children: () => "Still unresolved",
            }),
          }),
        }),
        { mode: "offline" },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(CadenzaValidationError);
      expect((error as CadenzaValidationError).diagnostics).toEqual([
        expect.objectContaining({
          code: "COMP_UNRESOLVED_COMPUTED_STEP",
          requirementId: "COMP-006",
          severity: "fatal",
          source: "unresolved-computed",
        }),
      ]);
      return;
    }

    throw new Error(
      "Expected unresolved computed step to fail offline export.",
    );
  });

  it("resolves a first computed step and shifts subsequent anchors", () => {
    const player = { pause: vi.fn(), seekTo: vi.fn() };
    const runtime = createRuntime(
      compile(
        Deck({
          fps: 10,
          children: Slide({
            id: "computed-first",
            children: [
              Step({
                kind: "computed",
                children: () => "Computed result",
              }),
              Step({ duration: "1s", children: "After computed" }),
            ],
          }),
        }),
      ),
      player,
    );

    runtime.goto("computed-first", 0);

    expect(runtime.getCursor()).toEqual({
      kind: "loading",
      reason: "computed",
      slideId: "computed-first",
    });

    runtime.resolveComputedStep("computed-first", 0, "3s");

    expect(runtime.getCursor()).toEqual({
      kind: "at-step",
      slideId: "computed-first",
      stepIndex: 0,
    });
    expect(player.seekTo).toHaveBeenLastCalledWith(0);

    runtime.next();

    expect(player.seekTo).toHaveBeenLastCalledWith(30);
  });

  it("emits warning metadata for decks longer than 60 minutes", () => {
    const timeline = compile(
      Deck({
        fps: 1,
        children: Slide({
          id: "long-form",
          children: Step({ duration: "3601s", children: "Long talk" }),
        }),
      }),
    );

    expect(timeline.diagnostics).toEqual([
      expect.objectContaining({
        code: "COMP_LONG_DECK",
        requirementId: "COMP-009",
        severity: "warning",
        source: "deck",
      }),
    ]);
  });

  it("emits cursor-change events only for semantic cursor transitions", () => {
    let frameHandler: ((frame: number) => void) | undefined;
    const runtime = createRuntime(
      compile(
        Deck({
          fps: 10,
          children: [
            Slide({
              id: "intro",
              children: Step({ duration: "2s", children: "Intro" }),
            }),
            Slide({
              id: "details",
              children: Step({ duration: "1s", children: "Details" }),
            }),
          ],
        }),
      ),
      {
        getCurrentFrame: vi.fn(() => 0),
        onFrameChange: vi.fn((handler: (frame: number) => void) => {
          frameHandler = handler;

          return () => {
            frameHandler = undefined;
          };
        }),
        seekTo: vi.fn(),
      },
    );
    const cursorChanges: unknown[] = [];
    runtime.onCursorChange((cursor) => cursorChanges.push(cursor));

    frameHandler?.(1);
    frameHandler?.(2);
    frameHandler?.(20);
    frameHandler?.(21);

    expect(cursorChanges).toEqual([
      {
        kind: "at-step",
        slideId: "details",
        stepIndex: 0,
      },
    ]);
  });
});
