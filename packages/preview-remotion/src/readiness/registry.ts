import {
  type CadenzaDiagnostic,
  type Cursor,
  createResourceReadiness,
  type ResourceKind,
  type ResourceReadinessRegistry,
  type TimelineMap,
  type TimelineResource,
} from "@cadenza-dev/core";

export type PreviewResourceStatus = TimelineResource & {
  ready: boolean;
};

export type PreviewReadinessRegistry = ResourceReadinessRegistry & {
  getDiagnostics(): CadenzaDiagnostic[];
  getPendingResourceIds(): string[];
  getResourceStatuses(): PreviewResourceStatus[];
  pushDiagnostic(diagnostic: CadenzaDiagnostic): void;
};

export function createPreviewReadinessRegistry(
  timeline: TimelineMap,
): PreviewReadinessRegistry {
  const resources = uniqueResources(timeline);
  const readiness = createResourceReadiness();
  const diagnostics: CadenzaDiagnostic[] = [];
  const listeners = new Set<() => void>();

  function emitChange(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  for (const resource of resources) {
    readiness.markPending(resource.resourceId);
  }

  return {
    isReady: readiness.isReady,
    getDiagnostics() {
      return [...diagnostics];
    },
    getPendingResourceIds() {
      return resources
        .filter((resource) => !readiness.isReady(resource.resourceId))
        .map((resource) => resource.resourceId);
    },
    getResourceStatuses() {
      return resources.map((resource) => ({
        ...resource,
        ready: readiness.isReady(resource.resourceId),
      }));
    },
    markPending(resourceId) {
      readiness.markPending(resourceId);
      emitChange();
    },
    markReady(resourceId) {
      readiness.markReady(resourceId);
      emitChange();
    },
    onChange(handler) {
      listeners.add(handler);

      return () => {
        listeners.delete(handler);
      };
    },
    pushDiagnostic(diagnostic) {
      if (
        diagnostics.some(
          (item) =>
            item.code === diagnostic.code &&
            item.requirementId === diagnostic.requirementId &&
            item.source === diagnostic.source,
        )
      ) {
        return;
      }

      diagnostics.push(diagnostic);
      emitChange();
    },
  };
}

export function loadingResourceIdForCursor(
  cursor: Cursor,
  timeline: TimelineMap,
  readiness: PreviewReadinessRegistry,
): string | undefined {
  if (cursor.kind !== "loading" || cursor.reason === "computed") {
    return undefined;
  }

  return timeline.slides
    .find((slide) => slide.slideId === cursor.slideId)
    ?.resources.find(
      (resource) =>
        resource.resourceKind === cursor.reason &&
        !readiness.isReady(resource.resourceId),
    )?.resourceId;
}

function uniqueResources(timeline: TimelineMap): TimelineResource[] {
  const resources = new Map<string, TimelineResource>();

  for (const slide of timeline.slides) {
    for (const resource of slide.resources) {
      resources.set(resource.resourceId, resource);
    }
  }

  return [...resources.values()];
}

export function resourceKindLabel(resourceKind: ResourceKind): string {
  return resourceKind === "asset" ? "image" : resourceKind;
}
