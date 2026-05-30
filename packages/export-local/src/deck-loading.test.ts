import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { CadenzaPhase6Error, loadDeckModule } from "./index.ts";

const tempProjects: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempProjects
      .splice(0)
      .map((projectRoot) => rm(projectRoot, { force: true, recursive: true })),
  );
});

describe("B6.1 Phase 6 deck loading", () => {
  it("TC-DLOD-001 loads the canonical Phase 5 talk through the Phase 6 deck module contract", async () => {
    const loaded = await loadDeckModule({
      cwd: process.cwd(),
      selector: "phase5-alpha-readiness-talk",
    });

    expect(loaded.selector).toMatchObject({
      alias: "phase5-alpha-readiness-talk",
      source: "built-in-alias",
    });
    expect(loaded.metadata).toMatchObject({
      deckId: "phase5-alpha-readiness-talk",
      sourcePath: "examples/phase5/alpha-readiness-talk.tsx",
      title: "Cadenza Phase 5 Alpha Readiness Talk",
    });
    expect(loaded.contractExports).toEqual([
      "cadenzaDeckMetadata",
      "createCadenzaDeck",
    ]);
    expect(loaded.timeline.slides.map((slide) => slide.slideId)).toEqual(
      loaded.metadata.outline.map((entry) => entry.slideId),
    );
    expect(loaded.timeline.totalFrames).toBeGreaterThan(0);
  });

  it("TC-DLOD-002 and TC-DLOD-005 resolve selectors through the same loader while preserving canonical deck identity", async () => {
    const workspaceRoot = process.cwd();
    const projectRoot = await mkdtemp(
      path.join(os.tmpdir(), "cadenza-config-project-"),
    );
    tempProjects.push(projectRoot);
    const deckPath = path.join(
      workspaceRoot,
      "examples/phase5/alpha-readiness-talk.tsx",
    );
    const relativeDeckPath = path.relative(projectRoot, deckPath);

    await writeFile(
      path.join(projectRoot, "cadenza.config.ts"),
      `import { defineConfig } from "@cadenza-dev/cli";

export default defineConfig({
  decks: {
    "project-talk": ${JSON.stringify(relativeDeckPath)},
  },
  output: {
    root: "tmp/project-cadenza-output",
  },
  export: {
    defaultFormats: ["web"],
  },
});
`,
    );

    const builtIn = await loadDeckModule({
      cwd: projectRoot,
      selector: "phase5-alpha-readiness-talk",
      workspaceRoot,
    });
    const configAlias = await loadDeckModule({
      cwd: projectRoot,
      selector: "project-talk",
      workspaceRoot,
    });
    const configDefault = await loadDeckModule({
      cwd: projectRoot,
      workspaceRoot,
    });
    const directPath = await loadDeckModule({
      cwd: projectRoot,
      selector: relativeDeckPath,
      workspaceRoot,
    });

    expect(builtIn.selector.source).toBe("built-in-alias");
    expect(configAlias.selector).toMatchObject({
      alias: "project-talk",
      source: "config-alias",
    });
    expect(configDefault.selector).toMatchObject({
      alias: "project-talk",
      source: "config-default",
    });
    expect(directPath.selector.source).toBe("explicit-path");
    expect(
      [builtIn, configAlias, configDefault, directPath].map(
        (loaded) => loaded.metadata.deckId,
      ),
    ).toEqual([
      "phase5-alpha-readiness-talk",
      "phase5-alpha-readiness-talk",
      "phase5-alpha-readiness-talk",
      "phase5-alpha-readiness-talk",
    ]);
  });

  it("TC-DLOD-003 maps unknown selectors to structured deck-loading diagnostics", async () => {
    await expect(
      loadDeckModule({
        cwd: process.cwd(),
        selector: "missing-talk",
      }),
    ).rejects.toMatchObject({
      diagnostics: [
        expect.objectContaining({
          category: "deck-loading",
          code: "DLOD_UNKNOWN_SELECTOR",
          repairHint:
            "Use a built-in alias, a cadenza.config.ts deck alias, or a direct local module path.",
        }),
      ],
      exitCode: 2,
    });
    await expect(
      loadDeckModule({
        cwd: process.cwd(),
        selector: "missing-talk",
      }),
    ).rejects.toBeInstanceOf(CadenzaPhase6Error);
  });

  it("TC-DLOD-004 gives project config aliases precedence over built-in aliases when names collide", async () => {
    const workspaceRoot = process.cwd();
    const projectRoot = await mkdtemp(
      path.join(os.tmpdir(), "cadenza-shadow-project-"),
    );
    tempProjects.push(projectRoot);

    await writeFile(
      path.join(projectRoot, "shadow.deck.tsx"),
      `import { Deck, Slide, Step } from "@cadenza-dev/core";

export const cadenzaDeckMetadata = {
  deckId: "shadow-talk",
  outline: [{ slideId: "shadow", title: "Shadow", summary: "Config alias wins." }],
  sourcePath: "shadow.deck.tsx",
  title: "Shadow Talk",
};

export function createCadenzaDeck() {
  return (
    <Deck fps={24} navigationPolicy="queue-next">
      <Slide id="shadow">
        <Step duration="1s">Config alias wins.</Step>
      </Slide>
    </Deck>
  );
}
`,
    );
    await writeFile(
      path.join(projectRoot, "cadenza.config.ts"),
      `import { defineConfig } from "@cadenza-dev/cli";

export default defineConfig({
  decks: {
    "phase5-alpha-readiness-talk": "./shadow.deck.tsx",
  },
});
`,
    );

    const loaded = await loadDeckModule({
      cwd: projectRoot,
      selector: "phase5-alpha-readiness-talk",
      workspaceRoot,
    });

    expect(loaded.selector).toMatchObject({
      alias: "phase5-alpha-readiness-talk",
      source: "config-alias",
    });
    expect(loaded.metadata.deckId).toBe("shadow-talk");
  });
});
