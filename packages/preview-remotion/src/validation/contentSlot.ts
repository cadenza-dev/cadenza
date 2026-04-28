import type { ContentDensity, ContentReadability } from "@cadenza-dev/core";

export type ContentSlotPreviewMetadata = {
  density: ContentDensity;
  readability: ContentReadability;
  source: string;
};

export function createContentSlotPreviewMetadata(input: {
  density: ContentDensity;
  readability: ContentReadability;
  source: string;
}): ContentSlotPreviewMetadata {
  return {
    density: input.density,
    readability: input.readability,
    source: input.source,
  };
}
