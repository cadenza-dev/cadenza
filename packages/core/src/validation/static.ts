import type { CadenzaDiagnostic } from "../diagnostics/types.ts";
import type {
  CadenzaNode,
  DeckNode,
  SlideNode,
} from "../typed-api/primitives.ts";

const STEP_KINDS = new Set(["fixed", "wait-for-event", "computed"]);

export function validateDeck(deck: DeckNode): CadenzaDiagnostic[] {
  const diagnostics: CadenzaDiagnostic[] = [];
  const slideIds = new Set<string>();
  const duplicateSlideIds = new Set<string>();

  for (const node of deck.children) {
    validateNode(node, diagnostics, slideIds, duplicateSlideIds, "deck");
  }

  return diagnostics;
}

function validateNode(
  node: CadenzaNode,
  diagnostics: CadenzaDiagnostic[],
  slideIds: Set<string>,
  duplicateSlideIds: Set<string>,
  source: string,
): void {
  if (node.kind === "deck") {
    diagnostics.push({
      severity: "fatal",
      code: "VAL_NESTED_DECK",
      message: "Nested Deck usage is not supported in Phase 1.",
      requirementId: "COMP-008",
      source,
    });
    return;
  }

  if (node.kind === "slide") {
    validateSlide(node, diagnostics, slideIds, duplicateSlideIds, source);
    return;
  }

  if (node.kind === "step" && !STEP_KINDS.has(node.stepKind)) {
    diagnostics.push({
      severity: "fatal",
      code: "VAL_INVALID_STEP_KIND",
      message: `Invalid Step kind '${String(node.stepKind)}'.`,
      requirementId: "VAL-001",
      source,
    });
  }
}

function validateSlide(
  slide: SlideNode,
  diagnostics: CadenzaDiagnostic[],
  slideIds: Set<string>,
  duplicateSlideIds: Set<string>,
  source: string,
): void {
  if (!slide.id) {
    diagnostics.push({
      severity: "fatal",
      code: "VAL_MISSING_SLIDE_ID",
      message: "Slide id is required.",
      requirementId: "VAL-001",
      source,
    });
  } else {
    if (slideIds.has(slide.id) && !duplicateSlideIds.has(slide.id)) {
      duplicateSlideIds.add(slide.id);
      diagnostics.push({
        severity: "fatal",
        code: "VAL_DUPLICATE_SLIDE_ID",
        message: `Duplicate slide id '${slide.id}'.`,
        requirementId: "VAL-001",
        source,
      });
    }

    slideIds.add(slide.id);
  }

  const childSource = slide.id || source;
  for (const child of slide.children) {
    validateNode(child, diagnostics, slideIds, duplicateSlideIds, childSource);
  }
}
