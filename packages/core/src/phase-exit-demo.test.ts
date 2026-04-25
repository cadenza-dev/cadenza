import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createPhaseExitDemoHandoff } from "./fixtures/phaseExitDemo.js";

describe("B1.4-C phase exit demo handoff", () => {
  it("proves deterministic TimelineMap output and documents the current export boundary", () => {
    const first = createPhaseExitDemoHandoff();
    const second = createPhaseExitDemoHandoff();

    expect(second).toEqual(first);
    expect(first.batchId).toBe("B1.4-C");
    expect(first.fixtureName).toBe("agent-authored-technical-talk");
    expect(first.previewTimeline.totalFrames).toBe(168);
    expect(first.offlineTimeline.totalFrames).toBe(192);
    expect(first.offlineTimeline.slides).toEqual([
      {
        slideId: "opening",
        segment: [0, 60],
        steps: [
          { stepIndex: 0, kind: "fixed", segment: [0, 36] },
          { stepIndex: 1, kind: "fixed", segment: [36, 60] },
        ],
      },
      {
        slideId: "render-safe-demo",
        segment: [48, 144],
        steps: [
          { stepIndex: 0, kind: "fixed", segment: [60, 72] },
          { stepIndex: 1, kind: "wait-for-event", segment: [72, 120] },
          { stepIndex: 2, kind: "computed", segment: [120, 144] },
        ],
      },
      {
        slideId: "agent-repair-loop",
        segment: [138, 192],
        steps: [
          { stepIndex: 0, kind: "fixed", segment: [144, 168] },
          { stepIndex: 1, kind: "fixed", segment: [168, 192] },
        ],
      },
    ]);
    expect(first.browserPreview.command).toBe("pnpm test:browser");
    expect(first.exportBoundary.unsupportedOutputs).toEqual(["MP4", "PDF"]);
    expect(first.exportBoundary.statement).toContain(
      "No MP4/PDF export support is claimed",
    );

    const handoffDoc = readFileSync(
      path.join(process.cwd(), "trace", "phase1", "phase-exit-demo.md"),
      "utf8",
    );

    expect(handoffDoc).toContain("# Phase 1 Exit Demo Handoff");
    expect(handoffDoc).toContain("B1.4-C");
    expect(handoffDoc).toContain("preview total frames: 168");
    expect(handoffDoc).toContain("offline total frames: 192");
    expect(handoffDoc).toContain("pnpm test:browser");
    expect(handoffDoc).toContain("No MP4/PDF export support is claimed");
  });
});
