/** @jsxImportSource react */

import type { RenderSafeResourceNode } from "@cadenza-dev/core";
import { type ReactNode, useEffect, useRef } from "react";
import {
  type PreviewReadinessRegistry,
  resourceKindLabel,
} from "../readiness/registry.js";
import { useResourceReady } from "../readiness/useResourceReady.js";

export type SafeImagePreviewProps = {
  readiness: PreviewReadinessRegistry;
  resource: RenderSafeResourceNode;
};

export function SafeImagePreview({
  readiness,
  resource,
}: SafeImagePreviewProps): ReactNode {
  const imageRef = useRef<HTMLImageElement>(null);
  const ready = useResourceReady(readiness, resource.resourceId);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) {
      return;
    }

    function markReady(): void {
      readiness.markReady(resource.resourceId);
    }

    function markFailed(): void {
      readiness.pushDiagnostic({
        code: "RSRM_IMAGE_LOAD_FAILED",
        message: `${resourceKindLabel(resource.resourceKind)} resource '${resource.resourceId}' failed to load in browser preview.`,
        requirementId: "RSRM-002",
        severity: "warning",
        source: resource.resourceId,
      });
    }

    image.addEventListener("load", markReady);
    image.addEventListener("error", markFailed);

    if (image.complete && image.naturalWidth > 0) {
      markReady();
    }

    return () => {
      image.removeEventListener("load", markReady);
      image.removeEventListener("error", markFailed);
    };
  }, [readiness, resource]);

  return (
    <img
      alt={resource.alt ?? resource.resourceId}
      data-cadenza-resource-id={resource.resourceId}
      data-cadenza-resource-kind={resource.resourceKind}
      data-cadenza-resource-ready={String(ready)}
      data-cadenza-resource-timeout-ms={resource.timeoutMs}
      height={1}
      ref={imageRef}
      src={
        resource.src === "" ? undefined : (resource.src ?? resource.resourceId)
      }
      style={{ display: "none" }}
      width={1}
    />
  );
}
