/** @jsxImportSource react */

import type { RenderSafeResourceNode } from "@cadenza-dev/core";
import { type ReactNode, useEffect, useRef } from "react";
import type { PreviewReadinessRegistry } from "../readiness/registry.js";
import { useResourceReady } from "../readiness/useResourceReady.js";

export type SafeVideoPreviewProps = {
  readiness: PreviewReadinessRegistry;
  resource: RenderSafeResourceNode;
};

export function SafeVideoPreview({
  readiness,
  resource,
}: SafeVideoPreviewProps): ReactNode {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ready = useResourceReady(readiness, resource.resourceId);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    function markReady(): void {
      readiness.markReady(resource.resourceId);
    }

    function markFailed(): void {
      readiness.pushDiagnostic({
        code: "RSRM_VIDEO_METADATA_FAILED",
        message: `video resource '${resource.resourceId}' metadata failed to load in browser preview.`,
        requirementId: "RSRM-004",
        severity: "warning",
        source: resource.resourceId,
      });
    }

    video.addEventListener("loadedmetadata", markReady);
    video.addEventListener("error", markFailed);

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      markReady();
    }

    return () => {
      video.removeEventListener("loadedmetadata", markReady);
      video.removeEventListener("error", markFailed);
    };
  }, [readiness, resource]);

  return (
    <video
      data-cadenza-resource-id={resource.resourceId}
      data-cadenza-resource-kind={resource.resourceKind}
      data-cadenza-resource-ready={String(ready)}
      data-cadenza-resource-timeout-ms={resource.timeoutMs}
      muted
      playsInline
      preload="metadata"
      ref={videoRef}
      src={resource.src ?? undefined}
      style={{ display: "none" }}
    />
  );
}
