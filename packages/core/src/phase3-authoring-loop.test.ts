import { readFileSync } from "node:fs";
import path from "node:path";
import { compile } from "@cadenza-dev/core";
import {
  createPhase3AcceptanceFixture,
  createPhase3InvalidCompileReport,
} from "@cadenza-dev/core/fixtures/phase3Acceptance";
import { describe, expect, it } from "vitest";

describe("B3.1 Phase 3 authoring deck and compile repair surface", () => {
  it("proves the canonical technical deck uses public surfaces and compile diagnostics become an ordered repair queue", () => {
    const fixture = createPhase3AcceptanceFixture();

    expect(readFixtureSource()).toMatch(/from "@cadenza-dev\/core";/);
    expect(readFixtureSource()).not.toMatch(
      /from "(?:\.\.?\/|@remotion\/|remotion\b)/,
    );

    const renderSafeKinds = collectRenderSafeKinds(fixture.deck);
    expect(renderSafeKinds).toEqual(
      expect.arrayContaining([
        "content-slot",
        "media-frame",
        "safe-resource",
        "typography-box",
      ]),
    );
    expect(fixture.timeline.slides.map((slide) => slide.slideId)).toEqual([
      "loop-contract",
      "diagnostic-surface",
      "repair-boundary",
    ]);
    expect(fixture.timeline.slides.flatMap((slide) => slide.notes)).toEqual(
      expect.arrayContaining([
        "Explain the explicit local authoring loop before any wrapper command exists.",
        "Show that compile diagnostics are structured before browser preview.",
        "Close by keeping repairs in authored deck surfaces, not framework internals.",
      ]),
    );
    expect(compile(fixture.deck, { mode: "offline" }).totalFrames).toBe(
      fixture.offlineTimeline.totalFrames,
    );

    const invalidReport = createPhase3InvalidCompileReport();

    expect(invalidReport.ok).toBe(false);
    expect(invalidReport.schemaVersion).toBe(1);
    expect(invalidReport.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
          requirementId: expect.any(String),
          severity: "fatal",
          source: expect.any(String),
        }),
      ]),
    );
    expect(invalidReport.repairQueue.map((item) => item.code)).toEqual([
      "VAL_MISSING_SLIDE_ID",
      "VAL_DUPLICATE_SLIDE_ID",
      "VAL_INVALID_STEP_KIND",
      "COMP_MISSING_EXPORT_DURATION",
    ]);
  });
});

function readFixtureSource(): string {
  return readFileSync(
    path.join(
      process.cwd(),
      "packages",
      "core",
      "src",
      "fixtures",
      "phase3Acceptance.tsx",
    ),
    "utf8",
  );
}

function collectRenderSafeKinds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectRenderSafeKinds);
  }

  if (typeof value !== "object" || value === null || !("kind" in value)) {
    return [];
  }

  const node = value as { kind: string; children?: unknown };
  const current = [
    "content-slot",
    "media-frame",
    "safe-resource",
    "typography-box",
  ].includes(node.kind)
    ? [node.kind]
    : [];

  return [...current, ...collectRenderSafeKinds(node.children)];
}
