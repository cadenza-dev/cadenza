import type { CadenzaRuntime } from "../runtime/createRuntime.js";

export type KeyboardNavigationMap = {
  next?: string[];
  previous?: string[];
};

export type KeyboardNavigationTarget = {
  addEventListener(
    type: "keydown",
    handler: (event: KeyboardNavigationEvent) => void,
  ): void;
  removeEventListener(
    type: "keydown",
    handler: (event: KeyboardNavigationEvent) => void,
  ): void;
};

export type KeyboardNavigationEvent = {
  key: string;
  preventDefault(): void;
};

const DEFAULT_KEYBOARD_MAP: Required<KeyboardNavigationMap> = {
  next: ["ArrowRight", "PageDown", " "],
  previous: ["ArrowLeft", "PageUp"],
};

export function bindKeyboardNavigation(
  runtime: CadenzaRuntime,
  target: KeyboardNavigationTarget,
  keyboardMap: KeyboardNavigationMap = {},
): () => void {
  const keys = {
    next: keyboardMap.next ?? DEFAULT_KEYBOARD_MAP.next,
    previous: keyboardMap.previous ?? DEFAULT_KEYBOARD_MAP.previous,
  };

  function handleKeyDown(event: KeyboardNavigationEvent): void {
    if (keys.next.includes(event.key)) {
      event.preventDefault();
      runtime.next();
      return;
    }

    if (keys.previous.includes(event.key)) {
      event.preventDefault();
      runtime.previous();
    }
  }

  target.addEventListener("keydown", handleKeyDown);

  return () => {
    target.removeEventListener("keydown", handleKeyDown);
  };
}
