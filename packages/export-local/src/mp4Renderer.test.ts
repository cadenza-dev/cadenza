import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LocalMp4RendererInput } from "./mp4Renderer.ts";

type Mp4RendererModule = typeof import("./mp4Renderer.ts");

afterEach(() => {
  vi.doUnmock("node:fs/promises");
  vi.doUnmock("@remotion/bundler");
  vi.doUnmock("@remotion/renderer");
  vi.resetModules();
});

describe("REV-P6-002 local MP4 renderer stage diagnostics", () => {
  it("classifies bundle failures and cleanup failures with stable renderer stages", async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), "cadenza-mp4-stage-"),
    );
    const rmMock = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("cleanup locked"));
    const bundleMock = vi.fn().mockRejectedValue(new Error("bundle exploded"));
    const { LocalMp4RendererError, renderLocalMp4 } =
      await loadRendererWithMocks({
        bundle: bundleMock,
        rm: rmMock,
      });

    try {
      await renderLocalMp4(createRendererInput(tempRoot));
      throw new Error("Expected renderLocalMp4 to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(LocalMp4RendererError);
      expect(error).toMatchObject({
        diagnostics: [
          {
            category: "renderer",
            code: "VIDO_BUNDLE_FAILED",
            rendererStage: "bundle",
          },
          {
            category: "renderer",
            code: "VIDO_CLEANUP_FAILED",
            rendererStage: "cleanup",
          },
        ],
        failureEvidence: {
          cleanup: {
            status: "failed",
          },
        },
      });
    } finally {
      await rm(tempRoot, { force: true, recursive: true });
    }
  });

  it("classifies render media failures by renderer, codec/media-tool, and cancellation stages", async () => {
    const cases = [
      {
        code: "VIDO_RENDER_INVOCATION_FAILED",
        error: new Error("Chromium page closed while rendering frames"),
        stage: "renderer-invocation",
      },
      {
        code: "VIDO_CODEC_MEDIA_TOOL_FAILED",
        error: new Error("ffmpeg exited while encoding h264 output"),
        stage: "codec-media-tool",
      },
      {
        code: "VIDO_RENDER_CANCELLED",
        error: new Error("renderMedia() got cancelled"),
        stage: "cancellation",
      },
    ] as const;

    for (const rendererCase of cases) {
      const tempRoot = await mkdtemp(
        path.join(os.tmpdir(), "cadenza-mp4-render-stage-"),
      );
      const { LocalMp4RendererError, renderLocalMp4 } =
        await loadRendererWithMocks({
          renderMedia: vi.fn().mockRejectedValue(rendererCase.error),
        });

      try {
        await renderLocalMp4(createRendererInput(tempRoot));
        throw new Error("Expected renderLocalMp4 to fail.");
      } catch (error) {
        expect(error).toBeInstanceOf(LocalMp4RendererError);
        expect(error).toMatchObject({
          diagnostics: [
            {
              category: "renderer",
              code: rendererCase.code,
              rendererStage: rendererCase.stage,
            },
          ],
          failureEvidence: {
            cleanup: {
              status: "completed",
            },
          },
        });
      } finally {
        await rm(tempRoot, { force: true, recursive: true });
      }
    }
  });

  it("classifies composition preparation failures with a stable renderer stage", async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), "cadenza-mp4-composition-stage-"),
    );
    const { LocalMp4RendererError, renderLocalMp4 } =
      await loadRendererWithMocks({
        selectComposition: vi
          .fn()
          .mockRejectedValue(new Error("composition not found")),
      });

    try {
      await renderLocalMp4(createRendererInput(tempRoot));
      throw new Error("Expected renderLocalMp4 to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(LocalMp4RendererError);
      expect(error).toMatchObject({
        diagnostics: [
          {
            category: "renderer",
            code: "VIDO_COMPOSITION_FAILED",
            rendererStage: "composition",
          },
        ],
        failureEvidence: {
          cleanup: {
            status: "completed",
          },
        },
      });
    } finally {
      await rm(tempRoot, { force: true, recursive: true });
    }
  });

  it("classifies missing MP4 output after render completion as an output write failure", async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), "cadenza-mp4-output-stage-"),
    );
    const { LocalMp4RendererError, renderLocalMp4 } =
      await loadRendererWithMocks();

    try {
      await renderLocalMp4(createRendererInput(tempRoot));
      throw new Error("Expected renderLocalMp4 to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(LocalMp4RendererError);
      expect(error).toMatchObject({
        diagnostics: [
          {
            category: "renderer",
            code: "VIDO_OUTPUT_WRITE_FAILED",
            rendererStage: "output-write",
          },
        ],
        failureEvidence: {
          cleanup: {
            status: "completed",
          },
        },
      });
    } finally {
      await rm(tempRoot, { force: true, recursive: true });
    }
  });

  it("passes cancellation signals to renderMedia and preserves cancellation cleanup evidence", async () => {
    const tempRoot = await mkdtemp(
      path.join(os.tmpdir(), "cadenza-mp4-cancel-stage-"),
    );
    const cancelSignal = vi.fn();
    const renderMediaMock = vi
      .fn()
      .mockRejectedValue(new Error("renderMedia() got cancelled"));
    const { LocalMp4RendererError, renderLocalMp4 } =
      await loadRendererWithMocks({
        renderMedia: renderMediaMock,
      });

    try {
      await renderLocalMp4({
        ...createRendererInput(tempRoot),
        cancelSignal,
      });
      throw new Error("Expected renderLocalMp4 to fail.");
    } catch (error) {
      expect(renderMediaMock).toHaveBeenCalledWith(
        expect.objectContaining({ cancelSignal }),
      );
      expect(error).toBeInstanceOf(LocalMp4RendererError);
      expect(error).toMatchObject({
        diagnostics: [
          {
            category: "renderer",
            code: "VIDO_RENDER_CANCELLED",
            rendererStage: "cancellation",
          },
        ],
        failureEvidence: {
          cleanup: {
            status: "completed",
          },
        },
      });
    } finally {
      await rm(tempRoot, { force: true, recursive: true });
    }
  });
});

async function loadRendererWithMocks({
  bundle = vi.fn().mockResolvedValue("file:///tmp/cadenza-remotion"),
  getVideoMetadata = vi.fn().mockResolvedValue({
    codec: "h264",
    durationInSeconds: 1,
    fps: 24,
    height: 360,
    width: 640,
  }),
  renderMedia = vi.fn().mockResolvedValue(undefined),
  rm: rmOverride,
  selectComposition = vi.fn().mockResolvedValue({
    durationInFrames: 24,
    fps: 24,
    height: 360,
    id: "CadenzaPhase6Mp4",
    width: 640,
  }),
}: {
  bundle?: ReturnType<typeof vi.fn>;
  getVideoMetadata?: ReturnType<typeof vi.fn>;
  renderMedia?: ReturnType<typeof vi.fn>;
  rm?: ReturnType<typeof vi.fn>;
  selectComposition?: ReturnType<typeof vi.fn>;
} = {}): Promise<Mp4RendererModule> {
  vi.resetModules();
  vi.doMock("@remotion/bundler", () => ({
    bundle,
  }));
  vi.doMock("@remotion/renderer", () => ({
    getVideoMetadata,
    renderMedia,
    selectComposition,
  }));

  if (rmOverride !== undefined) {
    vi.doMock("node:fs/promises", async (importOriginal) => {
      const actual = await importOriginal<typeof import("node:fs/promises")>();

      return {
        ...actual,
        rm: rmOverride,
      };
    });
  }

  return import("./mp4Renderer.ts");
}

function createRendererInput(tempRoot: string): LocalMp4RendererInput {
  return {
    metadata: {
      deckId: "stage-talk",
      outline: [
        {
          slideId: "intro",
          summary: "Stage diagnostics",
          title: "Stage Diagnostics",
        },
      ],
      sourcePath: "stage.deck.tsx",
      title: "Stage Diagnostics",
    },
    outputDirectory: tempRoot,
    rendererTempRoot: "tmp/cadenza-render",
    runId: "stage-run",
    timeline: {
      diagnostics: [],
      fps: 24,
      navigationPolicy: "queue-next",
      slides: [
        {
          notes: [],
          resources: [],
          segment: [0, 24],
          slideId: "intro",
          steps: [],
        },
      ],
      totalFrames: 24,
    },
    workspaceRoot: tempRoot,
  };
}
