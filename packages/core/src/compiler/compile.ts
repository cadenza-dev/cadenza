import type { DeckNode } from "../typed-api/primitives.js";

export type TimelineMap = {
  fps: number;
  totalFrames: number;
  slides: [];
};

export function compile(deck: DeckNode): TimelineMap {
  return {
    fps: deck.fps,
    totalFrames: 0,
    slides: [],
  };
}
