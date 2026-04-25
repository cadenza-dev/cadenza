import {
  bindKeyboardNavigation,
  compile,
  createRuntime,
  Deck,
  Slide,
  Step,
} from "@cadenza-dev/core";
import { describe, expect, it, vi } from "vitest";

describe("TC-PLAY-001 keyboard navigation", () => {
  it("advances and retreats through slide steps with conventional arrow keys", () => {
    const player = { seekTo: vi.fn() };
    const runtime = createRuntime(
      compile(
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
      ),
      player,
    );
    const keyboard = createKeyboardTarget();
    const unbind = bindKeyboardNavigation(runtime, keyboard);

    keyboard.press("ArrowRight");
    keyboard.press("ArrowRight");
    keyboard.press("ArrowLeft");
    unbind();

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

function createKeyboardTarget() {
  let keydownHandler:
    | ((event: { key: string; preventDefault(): void }) => void)
    | undefined;

  return {
    addEventListener: vi.fn((type, handler) => {
      if (type === "keydown") {
        keydownHandler = handler;
      }
    }),
    press(key: string) {
      keydownHandler?.({ key, preventDefault: vi.fn() });
    },
    removeEventListener: vi.fn((type, handler) => {
      if (type === "keydown" && keydownHandler === handler) {
        keydownHandler = undefined;
      }
    }),
  };
}
