import { useEffect, useRef, useState } from "react";
import { useBufferState } from "remotion";
import type { PreviewReadinessRegistry } from "./registry.js";

type DelayPlaybackHandle = ReturnType<
  ReturnType<typeof useBufferState>["delayPlayback"]
>;

export type PreviewBufferingInput = {
  readiness: PreviewReadinessRegistry;
  resourceId?: string | undefined;
};

export function usePreviewBuffering({
  readiness,
  resourceId,
}: PreviewBufferingInput): boolean {
  const bufferState = useBufferState();
  const delayHandle = useRef<DelayPlaybackHandle | undefined>(undefined);
  const [pending, setPending] = useState(() =>
    resourceId === undefined ? false : !readiness.isReady(resourceId),
  );

  useEffect(() => {
    function syncPending(): void {
      setPending(
        resourceId === undefined ? false : !readiness.isReady(resourceId),
      );
    }

    syncPending();
    return readiness.onChange(syncPending);
  }, [readiness, resourceId]);

  useEffect(() => {
    if (!pending) {
      delayHandle.current?.unblock();
      delayHandle.current = undefined;
      return;
    }

    delayHandle.current ??= bufferState.delayPlayback();

    return () => {
      delayHandle.current?.unblock();
      delayHandle.current = undefined;
    };
  }, [bufferState, pending]);

  return pending;
}
