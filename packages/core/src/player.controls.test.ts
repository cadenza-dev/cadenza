import {
  bindClickRegions,
  type CadenzaRuntime,
  createFullscreenControls,
} from "@cadenza-dev/core";
import { describe, expect, it, vi } from "vitest";

type ClickHandler = (event: {
  clientX: number;
  clientY: number;
  preventDefault(): void;
}) => void;

describe("TC-PLAY-004 browser preview controls", () => {
  it("routes configurable click regions and fullscreen controls through runtime/player capabilities", async () => {
    const runtime = {
      next: vi.fn(),
      previous: vi.fn(),
      goto: vi.fn(),
    } as unknown as CadenzaRuntime;

    let clickHandler: ClickHandler | undefined;
    const target = {
      addEventListener: vi.fn((_type: "click", handler: ClickHandler) => {
        clickHandler = handler;
      }),
      removeEventListener: vi.fn(),
      getBoundingClientRect: () => ({
        left: 100,
        top: 50,
        width: 400,
        height: 200,
      }),
    };

    const unbind = bindClickRegions(runtime, target, [
      {
        id: "next-half",
        action: "next",
        rect: { left: 0.5, top: 0, width: 0.5, height: 1 },
      },
      {
        id: "previous-corner",
        action: "previous",
        rect: { left: 0, top: 0, width: 0.25, height: 0.25 },
      },
    ]);

    clickHandler?.({
      clientX: 350,
      clientY: 120,
      preventDefault: vi.fn(),
    });
    clickHandler?.({
      clientX: 120,
      clientY: 60,
      preventDefault: vi.fn(),
    });

    expect(runtime.next).toHaveBeenCalledOnce();
    expect(runtime.previous).toHaveBeenCalledOnce();

    unbind();

    expect(target.removeEventListener).toHaveBeenCalledOnce();

    const player = {
      requestFullscreen: vi.fn(),
      exitFullscreen: vi.fn(),
      isFullscreen: vi.fn().mockReturnValue(false),
    };
    const fullscreen = createFullscreenControls(player);

    expect(fullscreen.isSupported).toBe(true);
    expect(fullscreen.isFullscreen()).toBe(false);

    await fullscreen.enter();
    await fullscreen.exit();

    expect(player.requestFullscreen).toHaveBeenCalledOnce();
    expect(player.exitFullscreen).toHaveBeenCalledOnce();
  });
});
