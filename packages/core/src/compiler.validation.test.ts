import {
  type CadenzaNode,
  CadenzaValidationError,
  compile,
  Deck,
  type DeckNode,
  Slide,
  Step,
} from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";

describe("TC-VAL-001 compiler validation", () => {
  it("throws typed fatal diagnostics for invalid authoring", () => {
    const missingIdSlide = {
      kind: "slide",
      children: [],
    } as unknown as CadenzaNode;

    const invalidDeck = Deck({
      children: [
        missingIdSlide,
        Slide({ id: "duplicate", children: Step({ children: "A" }) }),
        Slide({ id: "duplicate", children: Step({ children: "B" }) }),
        Deck({ children: Slide({ id: "nested", children: [] }) }),
        Slide({
          id: "bad-step",
          children: Step({ kind: "invalid" as never, children: "Bad" }),
        }),
      ],
    }) as DeckNode;

    expect(() => compile(invalidDeck)).toThrow(CadenzaValidationError);

    try {
      compile(invalidDeck);
    } catch (error) {
      expect(error).toBeInstanceOf(CadenzaValidationError);
      expect((error as CadenzaValidationError).diagnostics).toEqual([
        expect.objectContaining({
          code: "VAL_MISSING_SLIDE_ID",
          message: expect.any(String),
          requirementId: "VAL-001",
          severity: "fatal",
          source: "deck",
        }),
        expect.objectContaining({
          code: "VAL_DUPLICATE_SLIDE_ID",
          message: expect.any(String),
          requirementId: "VAL-001",
          severity: "fatal",
          source: "deck",
        }),
        expect.objectContaining({
          code: "VAL_NESTED_DECK",
          message: expect.any(String),
          requirementId: "COMP-008",
          severity: "fatal",
          source: "deck",
        }),
        expect.objectContaining({
          code: "VAL_INVALID_STEP_KIND",
          message: expect.any(String),
          requirementId: "VAL-001",
          severity: "fatal",
          source: "bad-step",
        }),
      ]);
      return;
    }

    throw new Error("Expected compile to throw CadenzaValidationError.");
  });
});
