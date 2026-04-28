import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { compile, Deck, Slide, Step } from "@cadenza-dev/core";
import { createAllDomainMvpFixture } from "@cadenza-dev/core/fixtures/allDomainMvp";
import { createCadenzaPreviewMount } from "@cadenza-dev/preview-remotion";
import { describe, expect, it } from "vitest";

describe("TC-PKG-001 public preview package boundary", () => {
  it("compiles public imports while keeping Remotion dependencies outside core", () => {
    const fixture = createAllDomainMvpFixture();
    const tinyTimeline = compile(
      Deck({
        fps: 24,
        children: Slide({
          id: "pkg-boundary",
          children: Step({ duration: "1s", children: "Package boundary" }),
        }),
      }),
    );

    const mount = createCadenzaPreviewMount({
      compositionHeight: 720,
      compositionWidth: 1280,
      timeline: fixture.previewTimeline,
    });

    expect(tinyTimeline.totalFrames).toBe(24);
    expect(mount).toMatchObject({
      compositionHeight: 720,
      compositionWidth: 1280,
      durationInFrames: fixture.previewTimeline.totalFrames,
      fps: fixture.previewTimeline.fps,
    });
    expect(mount.timeline).toBe(fixture.previewTimeline);

    const previewManifest = readJson("packages/preview-remotion/package.json");
    const coreManifest = readJson("packages/core/package.json");

    expect(previewManifest.name).toBe("@cadenza-dev/preview-remotion");
    expect(previewManifest.dependencies).toMatchObject({
      "@cadenza-dev/core": "workspace:*",
    });
    expect(previewManifest.peerDependencies).toMatchObject({
      "@remotion/player": expect.any(String),
      react: expect.any(String),
      "react-dom": expect.any(String),
      remotion: expect.any(String),
    });
    expect(coreManifest.dependencies?.["@remotion/player"]).toBeUndefined();

    const previewSource = readSourceFiles("packages/preview-remotion/src").join(
      "\n",
    );

    expect(previewSource).toContain('from "@cadenza-dev/core"');
    expect(previewSource).not.toMatch(
      /from ["'](?:@cadenza-dev\/core\/src|.*packages\/core\/src)/,
    );
  });
});

function readJson(relativePath: string): {
  dependencies?: Record<string, string>;
  name?: string;
  peerDependencies?: Record<string, string>;
} {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), relativePath), "utf8"),
  );
}

function readSourceFiles(relativeDir: string): string[] {
  const absoluteDir = path.join(process.cwd(), relativeDir);

  return readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(absoluteDir, entry.name);

    if (entry.isDirectory()) {
      return readSourceFiles(path.relative(process.cwd(), child));
    }
    if (
      !entry.isFile() ||
      !(entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
    ) {
      return [];
    }
    if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) {
      return [];
    }

    return [readFileSync(child, "utf8")];
  });
}
