/** @jsxImportSource react */

import type { RenderSafeResourceNode } from "@cadenza-dev/core";
import { type ReactNode, useEffect } from "react";
import type { PreviewReadinessRegistry } from "../readiness/registry.js";
import { useResourceReady } from "../readiness/useResourceReady.js";

export type PreviewFontReadinessMode = "browser" | "manual";

export type SafeFontPreviewProps = {
  fontReadiness: PreviewFontReadinessMode;
  readiness: PreviewReadinessRegistry;
  resource: RenderSafeResourceNode;
};

export function SafeFontPreview({
  fontReadiness,
  readiness,
  resource,
}: SafeFontPreviewProps): ReactNode {
  const ready = useResourceReady(readiness, resource.resourceId);
  const family =
    resource.family ?? fontFamilyFromResourceId(resource.resourceId);

  useEffect(() => {
    if (fontReadiness === "manual") {
      return;
    }

    const fonts = document.fonts;
    if (!fonts) {
      return;
    }

    let cancelled = false;
    const fontSpec = `1em ${quoteFontFamily(family)}`;

    if (fonts.check(fontSpec)) {
      readiness.markReady(resource.resourceId);
      return;
    }

    fonts
      .load(fontSpec)
      .then(() => fonts.ready)
      .then(() => {
        if (!cancelled) {
          readiness.markReady(resource.resourceId);
        }
      })
      .catch(() => {
        if (!cancelled) {
          readiness.pushDiagnostic({
            code: "RSRM_FONT_LOAD_FAILED",
            message: `font resource '${resource.resourceId}' failed to load in browser preview.`,
            requirementId: "RSRM-003",
            severity: "warning",
            source: resource.resourceId,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [family, fontReadiness, readiness, resource]);

  return (
    <span
      data-cadenza-font-family={family}
      data-cadenza-resource-id={resource.resourceId}
      data-cadenza-resource-kind={resource.resourceKind}
      data-cadenza-resource-ready={String(ready)}
      data-cadenza-resource-timeout-ms={resource.timeoutMs}
      style={{
        display: "none",
        fontFamily: family,
        visibility: ready ? "visible" : "hidden",
      }}
    >
      font: {resource.resourceId}
    </span>
  );
}

function fontFamilyFromResourceId(resourceId: string): string {
  return resourceId.startsWith("font:") ? resourceId.slice(5) : resourceId;
}

function quoteFontFamily(family: string): string {
  return family.includes(" ") ? `"${family.replaceAll('"', '\\"')}"` : family;
}
