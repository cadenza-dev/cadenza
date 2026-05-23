import type { DeckNode, TimelineMap } from "@cadenza-dev/core";
import {
  createPhase4DogfoodTalkFixture,
  phase4DogfoodTalkMetadata,
} from "./dogfood-talk.js";

export const PHASE4_DOGFOOD_PREVIEW_ROUTE = "/";

export type Phase4DogfoodPreviewConfig = {
  compositionHeight?: number;
  compositionWidth?: number;
};

export type Phase4DogfoodPreviewPlayerProps = {
  compositionHeight: number;
  compositionWidth: number;
  controls: true;
  deck: DeckNode;
  timeline: TimelineMap;
};

export const phase4DogfoodPreviewDescriptor = {
  bundlePath: "/phase4-dogfood-preview.js",
  command: "pnpm preview:phase4",
  rootElementId: "cadenza-phase4-preview-root",
  route: PHASE4_DOGFOOD_PREVIEW_ROUTE,
  talkSource: phase4DogfoodTalkMetadata.sourcePath,
  title: "Cadenza Phase 4 Dogfood Preview",
} as const;

export function createPhase4DogfoodPreviewProps(
  config: Phase4DogfoodPreviewConfig = {},
): Phase4DogfoodPreviewPlayerProps {
  const fixture = createPhase4DogfoodTalkFixture();

  return {
    compositionHeight: config.compositionHeight ?? 720,
    compositionWidth: config.compositionWidth ?? 1280,
    controls: true,
    deck: fixture.deck,
    timeline: fixture.timeline,
  };
}
