import {
  compile,
  Deck,
  Notes,
  Slide,
  Step,
  Theme,
  Transition,
} from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";

describe("TC-TAPI-001 public typed API primitives", () => {
  it("imports every primitive and compiles deck-level fps into the timeline map", () => {
    const theme = Theme({
      name: "demo",
      tokens: {
        color: { background: "#ffffff", text: "#111111" },
        typography: { fontFamily: "Inter" },
        spacing: { unit: 8 },
        motion: { duration: "300ms" },
      },
    });

    const deck = Deck({
      fps: 24,
      theme,
      navigationPolicy: "cut-to-next",
      children: [
        Slide({
          id: "intro",
          duration: "4s",
          children: [
            Step({ children: "Hello Cadenza" }),
            Notes({ children: "Introduce the typed API surface." }),
          ],
        }),
        Transition({ kind: "cut", duration: "0s" }),
      ],
    });

    expect(compile(deck).fps).toBe(24);
  });
});
