export type ResourceKind = "asset" | "font" | "video";

export type RenderSafeResourceNode = {
  kind: "safe-resource";
  resourceKind: ResourceKind;
  resourceId: string;
  timeoutMs: number;
};

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

const DEFAULT_TIMEOUT_MS = 10_000;

export function SafeImage(props: SafeImageProps): RenderSafeResourceNode {
  return {
    kind: "safe-resource",
    resourceKind: "asset",
    resourceId: props.id ?? `image:${props.src}`,
    timeoutMs: props.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };
}

export function SafeFont(props: SafeFontProps): RenderSafeResourceNode {
  return {
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
    timeoutMs: props.timeoutMs ?? DEFAULT_TIMEOUT_MS,
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
