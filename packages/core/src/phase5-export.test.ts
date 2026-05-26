import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { compile, type DeckNode } from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";
import {
  createPhase5AlphaReadinessTalkFixture,
  phase5AlphaReadinessTalkMetadata,
} from "../../../examples/phase5/alpha-readiness-talk.js";
import { runCadenzaCli } from "../../../scripts/cadenza.js";

describe("B5.1 Phase 5 export source and local web export", () => {
  it("TC-EXPT-001 ships a longer launch-grade technical talk on public Cadenza authoring surfaces", () => {
    const fixture = createPhase5AlphaReadinessTalkFixture();
    const source = readText("examples/phase5/alpha-readiness-talk.tsx");
    const timeline = compile(fixture.deck, { mode: "offline" });

    expect(source).toContain('from "@cadenza-dev/core";');
    expect(source).not.toMatch(/from ["'](?:\.\.?\/|@remotion\/|remotion\b)/);
    expect(source).not.toContain("useCurrentFrame");
    expect(source).not.toContain("delayRender");
    expect(source).not.toContain("continueRender");
    expect(source).not.toContain("TransitionSeries");

    expect(phase5AlphaReadinessTalkMetadata.sourcePath).toBe(
      "examples/phase5/alpha-readiness-talk.tsx",
    );
    expect(phase5AlphaReadinessTalkMetadata.sourcePath).not.toMatch(
      /(?:^|\/)(?:packages\/.*\/src|tests?\/)/,
    );
    expect(phase5AlphaReadinessTalkMetadata.deckId).toBe(
      "phase5-alpha-readiness-talk",
    );
    expect(phase5AlphaReadinessTalkMetadata.exportCommand).toBe(
      "cadenza export phase5-alpha-readiness-talk",
    );
    expect(phase5AlphaReadinessTalkMetadata.scope).toBe("technical-talk");
    expect(phase5AlphaReadinessTalkMetadata.targetAudience).toContain(
      "developers",
    );
    expect(phase5AlphaReadinessTalkMetadata.boundaryGuards).toEqual(
      expect.arrayContaining([
        "no hosted rendering claim",
        "no npm publication claim",
        "no external alpha adoption claim",
      ]),
    );

    expect(phase5AlphaReadinessTalkMetadata.outline).toHaveLength(6);
    expect(phase5AlphaReadinessTalkMetadata.chapters).toEqual([
      {
        id: "positioning",
        slideIds: ["launch-contract", "phase4-to-phase5"],
        title: "Launch contract",
      },
      {
        id: "export-pipeline",
        slideIds: ["local-export-command", "deterministic-manifest"],
        title: "Local export pipeline",
      },
      {
        id: "readiness",
        slideIds: ["evidence-gates", "alpha-boundaries"],
        title: "Alpha readiness boundaries",
      },
    ]);
    expect(timeline.slides.map((slide) => slide.slideId)).toEqual(
      phase5AlphaReadinessTalkMetadata.outline.map((entry) => entry.slideId),
    );
    expect(timeline.slides.flatMap((slide) => slide.notes)).toEqual(
      expect.arrayContaining([
        "Open by naming Phase 5 as a local launch-candidate proof, not a hosted or published release.",
        "Keep the closeout honest: web export is baseline, MP4 is scoped later in Phase 5, and PDF remains waived by default.",
      ]),
    );
    expect(
      timeline.slides.some(
        (slide) => slide.transitionIn || slide.transitionOut,
      ),
    ).toBe(true);
    expect(collectRenderSafeKinds(fixture.deck)).toEqual(
      expect.arrayContaining([
        "content-slot",
        "media-frame",
        "safe-resource",
        "typography-box",
      ]),
    );
    expect(timeline.totalFrames).toBe(fixture.offlineTimeline.totalFrames);
  });

  it("TC-EXPT-002 exports a deterministic local web bundle baseline and manifest", async () => {
    const deckId = phase5AlphaReadinessTalkMetadata.deckId;
    const packageJson = readJson<{ scripts: Record<string, string> }>(
      path.join(process.cwd(), "package.json"),
    );
    const runIds = ["vitest-b5-1-a", "vitest-b5-1-b"];
    const manifests = [];

    expect(packageJson.scripts.cadenza).toBe(
      "node --experimental-strip-types scripts/cadenza.ts",
    );

    for (const runId of runIds) {
      const outputDir = path.join(process.cwd(), "dist/phase5", deckId, runId);
      rmSync(outputDir, { force: true, recursive: true });

      await runCadenzaCli(["export", deckId, "--run-id", runId]);

      manifests.push(
        readJson<Phase5ExportManifest>(path.join(outputDir, "manifest.json")),
      );
    }

    for (const [index, manifest] of manifests.entries()) {
      const runId = runIds[index] ?? "";
      expect(manifest.deckId).toBe(deckId);
      expect(manifest.sourceDeck).toBe(
        phase5AlphaReadinessTalkMetadata.sourcePath,
      );
      expect(manifest.command).toBe(
        phase5AlphaReadinessTalkMetadata.exportCommand,
      );
      expect(manifest.runId).toBe(runId);
      expect(manifest.localOnly).toBe(true);
      expect(manifest.requiresHostedInfrastructure).toBe(false);
      expect(manifest.outputDirectory).toBe(`dist/phase5/${deckId}/${runId}`);
      expect(
        manifest.artifacts.map((artifact) => artifact.path).sort(),
      ).toEqual(["deck.json", "index.html", "manifest.json", "timeline.json"]);
      expect(manifest.webBundle.entrypoint).toBe("index.html");
      expect(manifest.webBundle.semanticAnchors).toEqual(
        phase5AlphaReadinessTalkMetadata.outline.map((entry) => entry.slideId),
      );
      expect(
        existsSync(path.join(process.cwd(), manifest.outputDirectory)),
      ).toBe(true);
      expect(
        readText(path.join(manifest.outputDirectory, "index.html")),
      ).toContain('data-cadenza-export-deck="phase5-alpha-readiness-talk"');
    }

    expect(manifests[0]?.deterministic).toEqual(manifests[1]?.deterministic);
    expect(manifests[0]?.stableHash).toBe(manifests[1]?.stableHash);
  });
});

type Phase5ExportManifest = {
  artifacts: {
    format: "json" | "web";
    path: string;
    role: string;
  }[];
  command: string;
  deckId: string;
  deterministic: {
    fps: number;
    navigationPolicy: string;
    slideOrder: string[];
    stepOrdering: {
      slideId: string;
      steps: {
        kind: string;
        segment: [number, number];
        stepIndex: number;
      }[];
    }[];
    timelineIdentity: {
      totalFrames: number;
      transitionCount: number;
    };
  };
  localOnly: boolean;
  outputDirectory: string;
  requiresHostedInfrastructure: boolean;
  runId: string;
  sourceDeck: string;
  stableHash: string;
  webBundle: {
    entrypoint: "index.html";
    semanticAnchors: string[];
  };
};

function readText(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function readJson<T>(absolutePath: string): T {
  return JSON.parse(readFileSync(absolutePath, "utf8")) as T;
}

function collectRenderSafeKinds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectRenderSafeKinds);
  }

  if (typeof value !== "object" || value === null || !("kind" in value)) {
    return [];
  }

  const node = value as {
    children?: unknown;
    kind: DeckNode["kind"] | string;
  };
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
