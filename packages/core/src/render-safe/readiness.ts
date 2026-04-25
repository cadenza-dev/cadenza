export type ResourceReadiness = {
  isReady(resourceId: string): boolean;
  onChange(handler: () => void): () => void;
};

export type ResourceReadinessRegistry = ResourceReadiness & {
  markPending(resourceId: string): void;
  markReady(resourceId: string): void;
};

export function createResourceReadiness(
  readyResourceIds: string[] = [],
): ResourceReadinessRegistry {
  const ready = new Set(readyResourceIds);
  const listeners = new Set<() => void>();

  function emitChange(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    isReady(resourceId) {
      return ready.has(resourceId);
    },
    markPending(resourceId) {
      ready.delete(resourceId);
      emitChange();
    },
    markReady(resourceId) {
      ready.add(resourceId);
      emitChange();
    },
    onChange(handler) {
      listeners.add(handler);

      return () => {
        listeners.delete(handler);
      };
    },
  };
}
