import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  bindKeyboardNavigation,
  createResourceReadiness,
  createRuntime,
  createValidationReport,
  cursorAtFrame,
} from "@cadenza-dev/core";
import { describe, expect, it, vi } from "vitest";
import {
  createAllDomainMvpFixture,
  REQUIRED_ALL_DOMAIN_MVP_SKILLS,
} from "./fixtures/allDomainMvp.ts";

describe("B1.4-B3 all-domain MVP fixture", () => {
  it("spans typed API, compiler, render-safe, runtime, validation, and skills for an agent-authored technical talk", () => {
    const fixture = createAllDomainMvpFixture();

    expect(fixture.deck.theme?.tokens.color?.accent).toBe("#2563eb");
    expect(fixture.previewTimeline.fps).toBe(12);
    expect(
      fixture.previewTimeline.slides.map((slide) => slide.slideId),
    ).toEqual(["opening", "render-safe-demo", "agent-repair-loop"]);
    expect(fixture.previewTimeline.slides[1]?.resources).toEqual([
      expect.objectContaining({
        resourceId: "architecture-map",
        resourceKind: "asset",
      }),
      expect.objectContaining({
        resourceId: "talk-font",
        resourceKind: "font",
      }),
      expect.objectContaining({
        resourceId: "runtime-demo-video",
        resourceKind: "video",
      }),
    ]);

    const previewPause = fixture.previewTimeline.slides[1]?.steps[1];
    const offlinePause = fixture.offlineTimeline.slides[1]?.steps[1];

    expect(previewPause?.kind).toBe("wait-for-event");
    expect(offlinePause?.segment).toEqual([72, 120]);

    const cursorKinds = new Set<string>();
    for (
      let frame = 0;
      frame < fixture.previewTimeline.totalFrames;
      frame += 1
    ) {
      cursorKinds.add(cursorAtFrame(fixture.previewTimeline, frame).kind);
    }

    expect(cursorKinds).toEqual(new Set(["at-step", "in-transition"]));

    const readiness = createResourceReadiness();
    const player = { pause: vi.fn(), seekTo: vi.fn() };
    const runtime = createRuntime(fixture.previewTimeline, player, {
      readiness,
      clock: { now: () => 10_000 },
    });
    const cursorChanges: unknown[] = [];
    runtime.onCursorChange((cursor) => cursorChanges.push(cursor));

    runtime.next();

    expect(runtime.getCursor()).toEqual({
      kind: "at-step",
      slideId: "opening",
      stepIndex: 1,
    });

    runtime.next();

    expect(runtime.getCursor()).toEqual({
      kind: "loading",
      reason: "asset",
      slideId: "render-safe-demo",
    });

    readiness.markReady("architecture-map");
    readiness.markReady("talk-font");
    readiness.markReady("runtime-demo-video");

    expect(player.seekTo).toHaveBeenLastCalledWith(60);
    expect(runtime.getPresenterMetadata()).toEqual({
      slideId: "render-safe-demo",
      stepIndex: 0,
      notes: [
        "Show that render-safe resources are declared before the demo slide.",
      ],
      elapsedWallTimeMs: 0,
      elapsedActiveTimeMs: 0,
    });

    bindKeyboardNavigation(runtime, {
      addEventListener(_eventName, handler) {
        handler({ key: "ArrowRight", preventDefault() {} });
      },
      removeEventListener() {},
    });

    expect(runtime.getCursor()).toEqual({
      kind: "at-step",
      slideId: "render-safe-demo",
      stepIndex: 1,
    });
    expect(cursorChanges).toContainEqual({
      kind: "loading",
      reason: "asset",
      slideId: "render-safe-demo",
    });

    const report = createValidationReport(fixture.previewDiagnostics);

    expect(report.ok).toBe(true);
    expect(report.summary.byRequirement).toMatchObject({
      "RSAF-006": 1,
      "VAL-004": 1,
    });
    expect(report.repairQueue.map((item) => item.code)).toEqual([
      "RSAF_MEDIAFRAME_ASPECT_RATIO",
      "RSAF_TYPOGRAPHY_OVERFLOW",
    ]);

    for (const skillName of REQUIRED_ALL_DOMAIN_MVP_SKILLS) {
      const skillContent = readSkillMarkdown(skillName);

      for (const cue of fixture.skillGuidanceCues[skillName]) {
        expect(skillContent).toContain(cue);
      }
    }
  });
});

function readSkillMarkdown(skillName: string): string {
  const skillDir =
    skillName === "cadenza-best-practices"
      ? path.join(process.cwd(), "skills", "cadenza")
      : path.join(process.cwd(), ".agents", "skills", skillName);

  return readMarkdownFiles(skillDir).join("\n");
}

function readMarkdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return readMarkdownFiles(child);
    }
    return child.endsWith(".md") ? [readFileSync(child, "utf8")] : [];
  });
}
