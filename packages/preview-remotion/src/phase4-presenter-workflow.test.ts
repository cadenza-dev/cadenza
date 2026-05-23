import { readFileSync } from "node:fs";
import path from "node:path";
import type { CadenzaPlayerSnapshot } from "@cadenza-dev/preview-remotion";
import { describe, expect, it, vi } from "vitest";
import { phase4DogfoodTalkMetadata } from "../../../examples/phase4/dogfood-talk.js";
import {
  createPhase4DogfoodPreviewProps,
  createPhase4PresenterControls,
  createPhase4PresenterWorkflow,
} from "../../../examples/phase4/preview.js";

describe("B4.2 Phase 4 presenter workflow", () => {
  it("TC-PRES-001 derives current and next presenter context from runtime metadata while preserving notes and elapsed time", () => {
    const preview = createPhase4DogfoodPreviewProps();
    const firstStep = createSnapshot({
      elapsedActiveTimeMs: 1_500,
      elapsedWallTimeMs: 2_000,
      notes: [
        "Frame Cadenza as a typed presentation system for developers writing technical talks.",
      ],
      slideId: "architecture-contract",
      stepIndex: 0,
    });
    const workflow = createPhase4PresenterWorkflow({
      snapshot: firstStep,
      timeline: preview.timeline,
    });

    expect(workflow.current).toMatchObject({
      chapterId: "architecture",
      chapterTitle: "Architecture spine",
      slideId: "architecture-contract",
      stepCount: 2,
      stepIndex: 0,
      title: "Why Cadenza needs a product layer",
    });
    expect(workflow.next).toMatchObject({
      chapterId: "architecture",
      slideId: "architecture-contract",
      stepIndex: 1,
      title: "Why Cadenza needs a product layer",
    });
    expect(workflow.notes).toEqual(firstStep.presenterMetadata.notes);
    expect(workflow.elapsed).toEqual({
      activeMs: 1_500,
      wallMs: 2_000,
    });
    expect(workflow.timelineTotalFrames).toBe(preview.timeline.totalFrames);

    const slideBoundary = createPhase4PresenterWorkflow({
      snapshot: createSnapshot({
        elapsedActiveTimeMs: 3_000,
        elapsedWallTimeMs: 3_500,
        notes: firstStep.presenterMetadata.notes,
        slideId: "architecture-contract",
        stepIndex: 1,
      }),
      timeline: preview.timeline,
    });

    expect(slideBoundary.next).toMatchObject({
      chapterId: "architecture",
      slideId: "timeline-compiler",
      stepIndex: 0,
      title: "Compiler spine",
    });
  });

  it("TC-PRES-002 routes outline, chapter, and playback controls through runtime-mediated presenter handle APIs", () => {
    const handle = {
      getSnapshot: () =>
        createSnapshot({
          elapsedActiveTimeMs: 0,
          elapsedWallTimeMs: 0,
          notes: [],
          slideId: "architecture-contract",
          stepIndex: 0,
        }),
      goto: vi.fn(),
      isPlaying: vi.fn(() => false),
      markResourceReady: vi.fn(),
      nativeSeekToFrame: vi.fn(),
      next: vi.fn(),
      pause: vi.fn(),
      play: vi.fn(),
      previous: vi.fn(),
      togglePlayback: vi.fn(),
    };
    const controls = createPhase4PresenterControls(handle);

    controls.next();
    controls.previous();
    controls.restart();
    controls.gotoOutline(phase4DogfoodTalkMetadata.outline[2]);
    controls.gotoChapter(phase4DogfoodTalkMetadata.chapters[1]);
    controls.play();
    controls.pause();
    controls.togglePlayback();

    expect(handle.next).toHaveBeenCalledOnce();
    expect(handle.previous).toHaveBeenCalledOnce();
    expect(handle.goto).toHaveBeenNthCalledWith(1, "architecture-contract", 0);
    expect(handle.goto).toHaveBeenNthCalledWith(
      2,
      "preview-reliability-budget",
      0,
    );
    expect(handle.goto).toHaveBeenNthCalledWith(
      3,
      "preview-reliability-budget",
      0,
    );
    expect(handle.play).toHaveBeenCalledOnce();
    expect(handle.pause).toHaveBeenCalledOnce();
    expect(handle.togglePlayback).toHaveBeenCalledOnce();
    expect(handle.nativeSeekToFrame).not.toHaveBeenCalled();

    const previewSource = readText("examples/phase4/preview.jsx");

    expect(previewSource).toContain("data-cadenza-phase4-presenter-panel");
    expect(previewSource).toContain("data-cadenza-phase4-presenter-current");
    expect(previewSource).toContain("data-cadenza-phase4-presenter-next");
    expect(previewSource).toContain(
      "data-cadenza-phase4-presenter-outline-button",
    );
    expect(previewSource).toContain(
      "data-cadenza-phase4-presenter-chapter-button",
    );
    expect(previewSource).toContain("onSnapshotChange");
    expect(previewSource).not.toContain("nativeSeekToFrame");
    expect(previewSource).not.toMatch(/\bseekTo\s*\(/);
    expect(previewSource).not.toContain("data-cadenza-player-frame");
  });
});

function createSnapshot(
  presenterMetadata: CadenzaPlayerSnapshot["presenterMetadata"],
): CadenzaPlayerSnapshot {
  return {
    cursor: {
      kind: "at-step",
      slideId: presenterMetadata.slideId,
      stepIndex: presenterMetadata.stepIndex,
    },
    diagnostics: [],
    playerFrame: 0,
    presenterMetadata,
    readiness: {
      pendingResourceIds: [],
      resources: [],
    },
  };
}

function readText(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}
