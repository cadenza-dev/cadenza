import type { CadenzaRuntime } from "../runtime/createRuntime.ts";

export type ClickRegionAction =
  | "next"
  | "previous"
  | { kind: "goto"; slideId: string; stepIndex?: number };

export type ClickRegionRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ClickRegion = {
  id: string;
  action: ClickRegionAction;
  rect: ClickRegionRect;
};

export type ClickRegionEvent = {
  clientX: number;
  clientY: number;
  preventDefault(): void;
};

export type ClickRegionTarget = {
  addEventListener(
    type: "click",
    handler: (event: ClickRegionEvent) => void,
  ): void;
  removeEventListener(
    type: "click",
    handler: (event: ClickRegionEvent) => void,
  ): void;
  getBoundingClientRect(): {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

export function bindClickRegions(
  runtime: CadenzaRuntime,
  target: ClickRegionTarget,
  regions: ClickRegion[],
): () => void {
  function handleClick(event: ClickRegionEvent): void {
    const bounds = target.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const region = regions.find((item) => isInsideRegion(item.rect, x, y));

    if (!region) {
      return;
    }

    event.preventDefault();
    invokeRegionAction(runtime, region.action);
  }

  target.addEventListener("click", handleClick);

  return () => {
    target.removeEventListener("click", handleClick);
  };
}

function isInsideRegion(rect: ClickRegionRect, x: number, y: number): boolean {
  return (
    x >= rect.left &&
    x <= rect.left + rect.width &&
    y >= rect.top &&
    y <= rect.top + rect.height
  );
}

function invokeRegionAction(
  runtime: CadenzaRuntime,
  action: ClickRegionAction,
): void {
  if (action === "next") {
    runtime.next();
    return;
  }

  if (action === "previous") {
    runtime.previous();
    return;
  }

  runtime.goto(action.slideId, action.stepIndex);
}
