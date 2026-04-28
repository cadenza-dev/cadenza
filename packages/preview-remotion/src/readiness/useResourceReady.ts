import { useEffect, useState } from "react";
import type { PreviewReadinessRegistry } from "./registry.js";

export function useResourceReady(
  readiness: PreviewReadinessRegistry,
  resourceId: string,
): boolean {
  const [ready, setReady] = useState(() => readiness.isReady(resourceId));

  useEffect(
    () =>
      readiness.onChange(() => {
        setReady(readiness.isReady(resourceId));
      }),
    [readiness, resourceId],
  );

  return ready;
}
