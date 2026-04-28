import type { ResourceReadinessRegistry } from "./readiness.js";

export type RenderSafeDomAdapterOptions = {
  readiness: ResourceReadinessRegistry;
};

export type FontVisibilityBinding = {
  element: HTMLElement;
  resourceId: string;
  hiddenVisibility?: string;
  readyVisibility?: string;
};

export type VideoMetadataReadinessBinding = {
  element: HTMLVideoElement;
  resourceId: string;
};

export type RenderSafeDomAdapter = {
  bindFontVisibility(binding: FontVisibilityBinding): () => void;
  bindVideoMetadataReadiness(
    binding: VideoMetadataReadinessBinding,
  ): () => void;
};

export function createRenderSafeDomAdapter(
  options: RenderSafeDomAdapterOptions,
): RenderSafeDomAdapter {
  return {
    bindFontVisibility(binding) {
      const hiddenVisibility = binding.hiddenVisibility ?? "hidden";
      const readyVisibility = binding.readyVisibility ?? "visible";

      function syncVisibility(): void {
        binding.element.style.visibility = options.readiness.isReady(
          binding.resourceId,
        )
          ? readyVisibility
          : hiddenVisibility;
      }

      syncVisibility();
      return options.readiness.onChange(syncVisibility);
    },
    bindVideoMetadataReadiness(binding) {
      function syncDataset(): void {
        binding.element.dataset.ready = options.readiness.isReady(
          binding.resourceId,
        )
          ? "true"
          : "false";
      }

      function markReady(): void {
        options.readiness.markReady(binding.resourceId);
      }

      syncDataset();
      const unbindReadiness = options.readiness.onChange(syncDataset);
      binding.element.addEventListener("loadedmetadata", markReady);

      if (binding.element.readyState >= HTMLMediaElement.HAVE_METADATA) {
        markReady();
      }

      return () => {
        binding.element.removeEventListener("loadedmetadata", markReady);
        unbindReadiness();
      };
    },
  };
}
