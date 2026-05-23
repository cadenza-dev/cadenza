export type ResourceKind = "asset" | "font" | "video";

export type ContentDensity = "compact" | "comfortable" | "spacious";
export type ContentReadability = "headline" | "body" | "caption";

export type TypographyAutoFitConfig = {
  baseFontSizePx: number;
  baseLineHeight: number;
  baseSpacingPx: number;
  minFontSizePx: number;
  minLineHeight: number;
  minSpacingPx: number;
  maxFontSizePx?: number | undefined;
  maxLineHeight?: number | undefined;
  maxSpacingPx?: number | undefined;
};

export type ReadableDensityBudget = {
  maxCharactersPer1000Px2: number;
  maxEstimatedLineCount: number;
  repairDirection?: string | undefined;
};

export type ReadableDensityBudgets = Partial<
  Record<ContentDensity, ReadableDensityBudget>
>;

export type RenderSafeResourceNode = {
  kind: "safe-resource";
  resourceKind: ResourceKind;
  resourceId: string;
  timeoutMs: number;
  alt?: string;
  family?: string;
  src?: string;
};

export type TypographyBoxNode = {
  kind: "typography-box";
  id: string;
  maxWidth: number;
  maxHeight: number;
  autoFit?: TypographyAutoFitConfig | undefined;
  children?: unknown;
};

export type ContentSlotMetadata = {
  density: ContentDensity;
  readability: ContentReadability;
};

export type ContentSlotNode = {
  kind: "content-slot";
  id: string;
  metadata: ContentSlotMetadata;
  children?: unknown;
};

export type MediaFrameSnapshot =
  | {
      kind: "poster";
      src: string;
    }
  | {
      kind: "first-frame";
    };

export type MediaFrameNode = {
  kind: "media-frame";
  id: string;
  aspectRatio: number;
  poster?: string;
  exportSnapshot: MediaFrameSnapshot;
  children?: unknown;
};

export type RenderSafeNode =
  | RenderSafeResourceNode
  | TypographyBoxNode
  | ContentSlotNode
  | MediaFrameNode;

export type SafeImageProps = {
  src: string;
  alt: string;
  id?: string;
  timeoutMs?: number;
};

export type SafeFontProps = {
  family: string;
  id?: string;
  timeoutMs?: number;
};

export type SafeVideoProps = {
  src: string;
  id?: string;
  timeoutMs?: number;
};

export type TypographyBoxProps = {
  id: string;
  maxWidth: number;
  maxHeight: number;
  autoFit?: TypographyAutoFitConfig | undefined;
  children?: unknown;
};

export type ContentSlotProps = {
  id: string;
  density?: ContentDensity;
  readability?: ContentReadability;
  children?: unknown;
};

export type MediaFrameProps = {
  id: string;
  aspectRatio: number;
  poster?: string;
  children?: unknown;
};

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_CONTENT_DENSITY: ContentDensity = "comfortable";
const DEFAULT_CONTENT_READABILITY: ContentReadability = "body";

export function SafeImage(props: SafeImageProps): RenderSafeResourceNode {
  return {
    alt: props.alt,
    kind: "safe-resource",
    resourceKind: "asset",
    resourceId: props.id ?? `image:${props.src}`,
    src: props.src,
    timeoutMs: props.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };
}

export function SafeFont(props: SafeFontProps): RenderSafeResourceNode {
  return {
    family: props.family,
    kind: "safe-resource",
    resourceKind: "font",
    resourceId: props.id ?? `font:${props.family}`,
    timeoutMs: props.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };
}

export function SafeVideo(props: SafeVideoProps): RenderSafeResourceNode {
  return {
    kind: "safe-resource",
    resourceKind: "video",
    resourceId: props.id ?? `video:${props.src}`,
    src: props.src,
    timeoutMs: props.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };
}

export function TypographyBox(props: TypographyBoxProps): TypographyBoxNode {
  return {
    autoFit: props.autoFit,
    kind: "typography-box",
    id: props.id,
    maxWidth: props.maxWidth,
    maxHeight: props.maxHeight,
    children: props.children,
  };
}

export function ContentSlot(props: ContentSlotProps): ContentSlotNode {
  return {
    kind: "content-slot",
    id: props.id,
    metadata: {
      density: props.density ?? DEFAULT_CONTENT_DENSITY,
      readability: props.readability ?? DEFAULT_CONTENT_READABILITY,
    },
    children: props.children,
  };
}

export function MediaFrame(props: MediaFrameProps): MediaFrameNode {
  return {
    kind: "media-frame",
    id: props.id,
    aspectRatio: props.aspectRatio,
    poster: props.poster,
    exportSnapshot:
      props.poster === undefined
        ? { kind: "first-frame" }
        : { kind: "poster", src: props.poster },
    children: props.children,
  };
}

export function isRenderSafeResourceNode(
  value: unknown,
): value is RenderSafeResourceNode {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    value.kind === "safe-resource"
  );
}
