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
      ).toEqual(
        expect.arrayContaining([
          "deck.json",
          "index.html",
          "manifest.json",
          "timeline.json",
        ]),
      );
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

describe("B5.2 Phase 5 preview and export parity", () => {
  it("TC-PEXP-001 and TC-PEXP-002 emit semantic preview/export parity and notes/diagnostic boundaries", async () => {
    const deckId = phase5AlphaReadinessTalkMetadata.deckId;
    const runId = "vitest-b5-2-parity";
    const outputDir = path.join(process.cwd(), "dist/phase5", deckId, runId);
    rmSync(outputDir, { force: true, recursive: true });

    await runCadenzaCli(["export", deckId, "--run-id", runId]);

    const manifest = readJson<Phase5ExportManifest>(
      path.join(outputDir, "manifest.json"),
    );
    const html = readText(path.join(outputDir, "index.html"));
    const fixture = createPhase5AlphaReadinessTalkFixture();
    const previewTimeline = fixture.timeline;
    const exportTimeline = fixture.offlineTimeline;
    const transition = exportTimeline.slides.find(
      (slide) => slide.transitionIn !== undefined,
    )?.transitionIn;

    expect(manifest.previewExportParity.status).toBe("passed");
    expect(manifest.previewExportParity.requirementRefs).toEqual([
      "PEXP-001",
      "PEXP-002",
      "PEXP-003",
      "PEXP-004",
    ]);
    expect(manifest.previewExportParity.preview.timelineIdentity).toEqual(
      manifest.previewExportParity.exported.timelineIdentity,
    );
    expect(manifest.previewExportParity.preview.slideOrder).toEqual(
      phase5AlphaReadinessTalkMetadata.outline.map((entry) => entry.slideId),
    );
    expect(manifest.previewExportParity.exported.slideOrder).toEqual(
      manifest.deterministic.slideOrder,
    );
    expect(manifest.previewExportParity.exported.stepOrdering).toEqual(
      manifest.deterministic.stepOrdering,
    );
    expect(manifest.previewExportParity.semanticCheckpoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          frame: exportTimeline.slides[0]?.segment[0],
          kind: "slide-boundary",
          slideId: "launch-contract",
        }),
        expect.objectContaining({
          frame: exportTimeline.slides[0]?.steps[1]?.segment[0],
          kind: "step-boundary",
          slideId: "launch-contract",
          stepIndex: 1,
        }),
        expect.objectContaining({
          frame: transition?.segment[1],
          kind: "transition-settle",
          slideId: transition?.to,
        }),
      ]),
    );
    expect(manifest.previewExportParity.notesBoundary).toEqual(
      phase5AlphaReadinessTalkMetadata.outline.map((entry) =>
        expect.objectContaining({
          exportedVisibleSurface: "excluded",
          notesCount:
            exportTimeline.slides.find(
              (slide) => slide.slideId === entry.slideId,
            )?.notes.length ?? 0,
          slideId: entry.slideId,
        }),
      ),
    );
    expect(
      manifest.previewExportParity.diagnostics.renderSafe.resources.map(
        (resource) => resource.resourceId,
      ),
    ).toEqual(
      expect.arrayContaining([
        "phase-5-talk-font",
        "phase-5-export-pipeline",
        "phase-5-alpha-boundaries",
      ]),
    );
    expect(
      manifest.previewExportParity.diagnostics.typography.boxes.map(
        (box) => box.componentId,
      ),
    ).toEqual(
      expect.arrayContaining([
        "launch-contract-title",
        "deterministic-manifest-copy",
        "evidence-gates-copy",
      ]),
    );
    expect(
      manifest.previewExportParity.diagnostics.density.evaluatedBoxes.length,
    ).toBeGreaterThan(0);
    expect(
      manifest.previewExportParity.diagnostics.density.regressions,
    ).toEqual([]);
    expect(manifest.previewExportParity.browserSmoke).toEqual({
      entrypoint: "index.html",
      requiredSelectors: [
        "[data-cadenza-export-deck]",
        "[data-cadenza-export-parity='passed']",
        "[data-cadenza-semantic-anchor]",
      ],
      testId: "TC-PEXP-001/TC-PEXP-002",
    });

    expect(html).toContain('data-cadenza-export-parity="passed"');
    expect(html).toContain('data-cadenza-visible-notes="false"');
    expect(html).toContain('data-cadenza-semantic-anchor="launch-contract"');
    expect(html).not.toContain(previewTimeline.slides[0]?.notes[0] ?? "");
  });
});

describe("B5.3 Phase 5 export diagnostics and repair routing", () => {
  it("TC-EVDN-001 emits machine-readable export evidence plus a concise Markdown summary", async () => {
    const deckId = phase5AlphaReadinessTalkMetadata.deckId;
    const runId = "vitest-b5-3-evidence";
    const outputDir = path.join(process.cwd(), "dist/phase5", deckId, runId);
    rmSync(outputDir, { force: true, recursive: true });

    await runCadenzaCli(["export", deckId, "--run-id", runId]);

    const manifest = readJson<Phase5ExportManifest>(
      path.join(outputDir, "manifest.json"),
    );
    const evidence = readJson<Phase5ExportEvidence>(
      path.join(outputDir, "export-evidence.json"),
    );
    const summary = readText(path.join(outputDir, "export-evidence.md"));

    expect(manifest.artifacts.map((artifact) => artifact.path)).toEqual(
      expect.arrayContaining(["export-evidence.json", "export-evidence.md"]),
    );
    expect(evidence).toMatchObject({
      batchId: "B5.3",
      phase: "5",
      scenarioIds: ["TC-EVDN-001", "TC-EVDN-002"],
      schemaVersion: 1,
    });
    expect(evidence.requirementRefs).toEqual([
      "EVDN-001",
      "EVDN-002",
      "EVDN-003",
      "PEXP-005",
      "EVDN-004",
      "EVDN-005",
    ]);
    expect(evidence.exportRun).toMatchObject({
      command: phase5AlphaReadinessTalkMetadata.exportCommand,
      generatedManifestPath: "manifest.json",
      options: {
        format: "web",
        localOnly: true,
        outputDirectory: `dist/phase5/${deckId}/${runId}`,
      },
      runId,
      sourceDeck: {
        deckId,
        path: phase5AlphaReadinessTalkMetadata.sourcePath,
      },
    });
    expect(evidence.artifactInventory.map((artifact) => artifact.path)).toEqual(
      expect.arrayContaining([
        "index.html",
        "deck.json",
        "timeline.json",
        "manifest.json",
        "export-evidence.json",
        "export-evidence.md",
      ]),
    );
    expect(evidence.diagnostics).toMatchObject({
      densityRegressionCount: 0,
      parityStatus: "passed",
      renderSafeResourceCount:
        manifest.previewExportParity.diagnostics.renderSafe.resources.length,
      typographyBoxCount:
        manifest.previewExportParity.diagnostics.typography.boxes.length,
    });
    expect(evidence.parityChecks).toMatchObject({
      browserSmoke: manifest.previewExportParity.browserSmoke,
      status: "passed",
    });
    expect(evidence.knownLimitations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          affectedArtifact: "web-bundle",
          category: "environment-limitation",
          severity: "info",
        }),
      ]),
    );
    expect(evidence.boundaryClaims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          claim: "export-readiness",
          evidenceArtifacts: expect.arrayContaining([
            "manifest.json",
            "export-evidence.json",
            "export-evidence.md",
          ]),
          status: "evidence-backed",
        }),
        expect.objectContaining({
          claim: "alpha-readiness",
          status: "not-claimed",
        }),
      ]),
    );
    expect(summary).toContain("Phase 5 export evidence");
    expect(summary).toContain("cadenza export phase5-alpha-readiness-talk");
    expect(summary).toContain("Preview/export parity: passed");
    expect(summary).toContain("Next repair route");
    expect(summary).toContain(
      "No alpha readiness claim is made by this export evidence.",
    );
  });

  it("TC-EVDN-002 routes repair categories and keeps readiness or waiver claims artifact-backed", async () => {
    const deckId = phase5AlphaReadinessTalkMetadata.deckId;
    const runId = "vitest-b5-3-repair-routing";
    const outputDir = path.join(process.cwd(), "dist/phase5", deckId, runId);
    rmSync(outputDir, { force: true, recursive: true });

    await runCadenzaCli(["export", deckId, "--run-id", runId]);

    const manifest = readJson<Phase5ExportManifest>(
      path.join(outputDir, "manifest.json"),
    );
    const evidence = readJson<Phase5ExportEvidence>(
      path.join(outputDir, "export-evidence.json"),
    );
    const repairRouting = readJson<Phase5RepairRoutingEvidence>(
      path.join(outputDir, "repair-routing-evidence.json"),
    );
    const artifactPaths = evidence.artifactInventory.map(
      (artifact) => artifact.path,
    );

    expect(manifest.artifacts.map((artifact) => artifact.path)).toEqual(
      expect.arrayContaining(["repair-routing-evidence.json"]),
    );
    expect(evidence.repairRoutingEvidencePath).toBe(
      "repair-routing-evidence.json",
    );
    expect(repairRouting).toMatchObject({
      batchId: "B5.3",
      phase: "5",
      requirementRefs: ["PEXP-005", "EVDN-004", "EVDN-005"],
      scenarioIds: ["TC-EVDN-002"],
      schemaVersion: 1,
      sourceEvidencePath: "export-evidence.json",
    });
    expect(
      repairRouting.categoryTaxonomy.map((entry) => entry.category),
    ).toEqual([
      "authored-deck-repair",
      "guidance-repair",
      "export-implementation-defect",
      "render-safe-asset-defect",
      "environment-limitation",
      "framework-defect-evidence",
      "maintainer-waiver",
    ]);
    expect(repairRouting.failureFixtures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "authored-deck-repair",
          evidenceArtifacts: ["examples/phase5/alpha-readiness-talk.tsx"],
          fixtureId: "semantic-anchor-mismatch",
        }),
        expect.objectContaining({
          category: "guidance-repair",
          evidenceArtifacts: ["skills/cadenza/rules/validation-repair.md"],
          fixtureId: "repeated-guidance-anti-pattern",
        }),
        expect.objectContaining({
          category: "export-implementation-defect",
          evidenceArtifacts: ["scripts/cadenza.ts"],
          fixtureId: "manifest-html-divergence",
        }),
        expect.objectContaining({
          category: "render-safe-asset-defect",
          evidenceArtifacts: ["examples/phase5/alpha-readiness-talk.tsx"],
          fixtureId: "missing-render-safe-resource",
        }),
        expect.objectContaining({
          category: "environment-limitation",
          evidenceArtifacts: ["trace/phase5/tracker.md"],
          fixtureId: "browser-sandbox-restriction",
        }),
        expect.objectContaining({
          category: "framework-defect-evidence",
          evidenceArtifacts: ["trace/phase5/status.yaml"],
          fixtureId: "framework-parity-defect",
        }),
        expect.objectContaining({
          category: "maintainer-waiver",
          evidenceArtifacts: ["trace/phase5/status.yaml"],
          fixtureId: "explicit-waiver-required",
        }),
      ]),
    );
    expect(repairRouting.passingExport).toEqual({
      category: "none",
      evidenceArtifacts: ["manifest.json", "export-evidence.json"],
      status: "passed",
    });
    expect(repairRouting.readinessClaimPolicy).toEqual({
      artifactBackedClaimsOnly: true,
      chatOnlyDeclarationsAccepted: false,
      reviewerReadableArtifactRequired: true,
    });

    for (const claim of evidence.boundaryClaims) {
      if (claim.status === "evidence-backed") {
        expect(claim.evidenceArtifacts.length).toBeGreaterThan(0);
        expect(
          claim.evidenceArtifacts.every((artifact) =>
            artifactPaths.includes(artifact),
          ),
        ).toBe(true);
      }
    }
    expect(
      evidence.boundaryClaims.filter((claim) => claim.status === "not-claimed"),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ claim: "alpha-readiness" }),
        expect.objectContaining({ claim: "hosted-readiness" }),
      ]),
    );
  });
});

describe("B5.4 Phase 5 format scope", () => {
  it("TC-FMT-001 records the frozen MP4/PDF disposition and rejects silent broad claims", async () => {
    const deckId = phase5AlphaReadinessTalkMetadata.deckId;
    const runId = "vitest-b5-4-format-disposition";
    const outputDir = path.join(process.cwd(), "dist/phase5", deckId, runId);
    rmSync(outputDir, { force: true, recursive: true });

    await runCadenzaCli(["export", deckId, "--run-id", runId]);

    const manifest = readJson<Phase5ExportManifest>(
      path.join(outputDir, "manifest.json"),
    );
    const evidence = readJson<Phase5ExportEvidence>(
      path.join(outputDir, "export-evidence.json"),
    );
    const formatScope = readJson<Phase5FormatScopeEvidence>(
      path.join(outputDir, "format-scope-evidence.json"),
    );
    const summary = readText(path.join(outputDir, "format-scope-evidence.md"));
    const mp4 = formatScope.formats.find((format) => format.format === "mp4");
    const pdf = formatScope.formats.find((format) => format.format === "pdf");

    expect(manifest.formatScopeEvidencePath).toBe("format-scope-evidence.json");
    expect(manifest.artifacts.map((artifact) => artifact.path)).toEqual(
      expect.arrayContaining([
        "phase5-alpha-readiness-talk.mp4",
        "format-scope-evidence.json",
        "format-scope-evidence.md",
      ]),
    );
    expect(formatScope).toMatchObject({
      batchId: "B5.4",
      phase: "5",
      requirementRefs: ["FMT-002", "FMT-003", "FMT-004", "FMT-005"],
      scenarioIds: ["TC-FMT-001", "TC-FMT-002"],
      schemaVersion: 1,
    });
    expect(formatScope.sourceDeck).toEqual({
      deckId,
      path: phase5AlphaReadinessTalkMetadata.sourcePath,
    });
    expect(formatScope.formatClaims).toEqual({
      blanketFormatParity: false,
      broadArbitraryDeckMp4Support: false,
      broadPdfSupport: false,
      canonicalTalkMp4Only: true,
      pdfLaunchReadinessWaived: true,
    });

    expect(mp4).toMatchObject({
      declaredCapability: "canonical-talk-video-proof",
      disposition: "supported-for-canonical-talk",
      enabled: true,
      format: "mp4",
    });
    expect(mp4?.scope).toEqual({
      arbitraryDecks: false,
      canonicalDeckId: deckId,
      launchReadinessImpact: "required-for-phase5-launch-candidate",
    });
    expect(mp4?.artifactInventory.map((artifact) => artifact.path)).toEqual([
      "phase5-alpha-readiness-talk.mp4",
    ]);
    expect(
      existsSync(path.join(outputDir, "phase5-alpha-readiness-talk.mp4")),
    ).toBe(true);
    expect(
      readFileSync(path.join(outputDir, "phase5-alpha-readiness-talk.mp4"))
        .subarray(4, 8)
        .toString("utf8"),
    ).toBe("ftyp");

    expect(pdf).toMatchObject({
      declaredCapability: "unsupported-launch-waiver",
      disposition: "waived-for-launch-readiness",
      enabled: false,
      format: "pdf",
      waiver: {
        format: "pdf",
        launchReadinessImpact: "not-blocking",
        reviewerAcceptanceCreatesWaiver: false,
      },
    });
    expect(pdf?.artifactInventory).toEqual([]);
    expect(pdf?.limitations.map((limitation) => limitation.category)).toEqual(
      expect.arrayContaining(["format-waiver"]),
    );

    expect(evidence.boundaryClaims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          claim: "format-scope",
          evidenceArtifacts: expect.arrayContaining([
            "format-scope-evidence.json",
            "format-scope-evidence.md",
          ]),
          status: "evidence-backed",
        }),
        expect.objectContaining({
          claim: "waiver",
          evidenceArtifacts: expect.arrayContaining([
            "format-scope-evidence.json",
          ]),
          status: "evidence-backed",
        }),
      ]),
    );
    expect(summary).toContain("MP4: supported for the canonical talk only");
    expect(summary).toContain("PDF: waived for Phase 5 launch readiness");
    expect(summary).toContain(
      "No broad arbitrary-deck MP4 support is claimed.",
    );
    expect(summary).toContain("No broad PDF support is claimed.");
  });

  it("TC-FMT-002 emits format-specific evidence, diagnostics, parity checks, and limitations", async () => {
    const deckId = phase5AlphaReadinessTalkMetadata.deckId;
    const runId = "vitest-b5-4-format-evidence";
    const outputDir = path.join(process.cwd(), "dist/phase5", deckId, runId);
    rmSync(outputDir, { force: true, recursive: true });

    await runCadenzaCli(["export", deckId, "--run-id", runId]);

    const formatScope = readJson<Phase5FormatScopeEvidence>(
      path.join(outputDir, "format-scope-evidence.json"),
    );
    const web = formatScope.formats.find((format) => format.format === "web");
    const mp4 = formatScope.formats.find((format) => format.format === "mp4");
    const pdf = formatScope.formats.find((format) => format.format === "pdf");

    expect(web?.artifactInventory.map((artifact) => artifact.path)).toEqual(
      expect.arrayContaining(["index.html", "manifest.json", "timeline.json"]),
    );
    expect(web?.parityChecks.status).toBe("passed");
    expect(web?.diagnostics.renderSafeResourceCount).toBeGreaterThan(0);
    expect(web?.diagnostics.typographyBoxCount).toBeGreaterThan(0);
    expect(web?.capabilityEvidence).toMatchObject({
      notesBoundary: {
        evidenceArtifacts: ["manifest.json"],
        status: "excluded-from-visible-output",
      },
      renderSafeAssets: {
        status: "diagnosed",
      },
      transitions: {
        status: "semantic-parity",
      },
      typographyDensity: {
        status: "diagnosed",
      },
      visibleSlideSurface: {
        evidenceArtifacts: ["index.html"],
        status: "preserved",
      },
    });

    expect(mp4?.artifactInventory.map((artifact) => artifact.path)).toEqual([
      "phase5-alpha-readiness-talk.mp4",
    ]);
    expect(mp4?.parityChecks.status).toBe("limited-passed");
    expect(mp4?.parityChecks.slideOrder).toEqual(
      phase5AlphaReadinessTalkMetadata.outline.map((entry) => entry.slideId),
    );
    expect(mp4?.parityChecks.transitionCount).toBeGreaterThan(0);
    expect(mp4?.diagnostics.renderSafeResourceCount).toBeGreaterThan(0);
    expect(mp4?.capabilityEvidence).toMatchObject({
      notesBoundary: {
        evidenceArtifacts: ["format-scope-evidence.json"],
        status: "excluded-from-visible-output",
      },
      renderSafeAssets: {
        status: "metadata-only",
      },
      transitions: {
        status: "timeline-metadata",
      },
      typographyDensity: {
        status: "metadata-only",
      },
      visibleSlideSurface: {
        evidenceArtifacts: [
          "phase5-alpha-readiness-talk.mp4",
          "format-scope-evidence.json",
        ],
        status: "limited-smoke-proof",
      },
    });
    expect(mp4?.limitations.length).toBeGreaterThanOrEqual(2);

    expect(pdf?.capabilityEvidence).toMatchObject({
      notesBoundary: { status: "waived" },
      renderSafeAssets: { status: "waived" },
      transitions: { status: "waived" },
      typographyDensity: { status: "waived" },
      visibleSlideSurface: { status: "waived" },
    });
    expect(pdf?.parityChecks.status).toBe("waived");
    expect(pdf?.limitations.length).toBeGreaterThanOrEqual(2);
  });
});

describe("B5.5 Phase 5 alpha readiness and public launch-candidate surface", () => {
  it("TC-ALFA-001 declares the alpha public surface and clean-checkout launch-candidate path", async () => {
    const deckId = phase5AlphaReadinessTalkMetadata.deckId;
    const runId = "vitest-b5-5-alpha-surface";
    const outputDir = path.join(process.cwd(), "dist/phase5", deckId, runId);
    rmSync(outputDir, { force: true, recursive: true });

    await runCadenzaCli(["export", deckId, "--run-id", runId]);

    const manifest = readJson<Phase5ExportManifest>(
      path.join(outputDir, "manifest.json"),
    );
    const readiness = readJson<Phase5AlphaReadinessEvidence>(
      path.join(outputDir, "alpha-readiness-evidence.json"),
    );
    const launchGuide = readText("docs/alpha-readiness.md");
    const rootManifest = readJson<{
      scripts: Record<string, string>;
    }>(path.join(process.cwd(), "package.json"));
    const coreManifest = readJson<{
      exports: Record<string, unknown>;
      name: string;
    }>(path.join(process.cwd(), "packages/core/package.json"));
    const previewManifest = readJson<{
      exports: Record<string, unknown>;
      name: string;
    }>(path.join(process.cwd(), "packages/preview-remotion/package.json"));

    expect(manifest.alphaReadinessEvidencePath).toBe(
      "alpha-readiness-evidence.json",
    );
    expect(manifest.artifacts.map((artifact) => artifact.path)).toEqual(
      expect.arrayContaining([
        "alpha-readiness-evidence.json",
        "alpha-readiness-evidence.md",
      ]),
    );
    expect(readiness).toMatchObject({
      batchId: "B5.5",
      phase: "5",
      scenarioIds: ["TC-ALFA-001", "TC-ALFA-002", "TC-ALFA-003"],
      schemaVersion: 1,
    });
    expect(readiness.requirementRefs).toEqual(
      expect.arrayContaining(["ALFA-001", "ALFA-002", "ALFA-007"]),
    );
    expect(readiness.publicSurface.packages).toEqual([
      {
        exports: Object.keys(coreManifest.exports),
        packageName: coreManifest.name,
      },
      {
        exports: Object.keys(previewManifest.exports),
        packageName: previewManifest.name,
      },
    ]);
    expect(readiness.publicSurface.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: "pnpm install",
          stage: "install",
        }),
        expect.objectContaining({
          command: "pnpm typecheck",
          stage: "run",
        }),
        expect.objectContaining({
          command: "pnpm preview:phase4",
          stage: "preview",
        }),
        expect.objectContaining({
          command:
            "pnpm cadenza export phase5-alpha-readiness-talk --run-id local-alpha",
          stage: "export",
        }),
        expect.objectContaining({
          command:
            "inspect dist/phase5/phase5-alpha-readiness-talk/local-alpha/",
          stage: "evidence",
        }),
      ]),
    );
    expect(rootManifest.scripts.cadenza).toBe(
      "node --experimental-strip-types scripts/cadenza.ts",
    );
    expect(rootManifest.scripts["preview:phase4"]).toBe(
      "node examples/phase4/serve-preview.mjs",
    );
    expect(readiness.publicSurface.examples).toEqual(
      expect.arrayContaining([
        "examples/phase5/alpha-readiness-talk.tsx",
        "examples/phase4/dogfood-talk.tsx",
        "examples/phase4/technical-talk-starters.tsx",
      ]),
    );
    expect(readiness.publicSurface.guidance).toEqual(
      expect.arrayContaining([
        "skills/cadenza/SKILL.md",
        "skills/cadenza/rules/product-layer-workflow.md",
        "skills/cadenza/rules/validation-repair.md",
      ]),
    );
    expect(readiness.publicSurface.excludedInternalSurface).toEqual(
      expect.arrayContaining([
        "packages/*/src/** implementation internals behind package exports",
        "scripts/cadenza.ts implementation internals behind pnpm cadenza",
        "dist/** generated artifacts",
        "tests/** and trace/** verification archives",
      ]),
    );
    expect(readiness.launchCandidate.positioning).toContain(
      "developers writing technical talks",
    );
    expect(readiness.launchCandidate.positioning).toContain(
      "not a business prompt-to-deck workflow",
    );
    expect(readiness.launchCandidate.docs).toEqual(
      expect.arrayContaining(["docs/alpha-readiness.md", "README.md"]),
    );
    expect(launchGuide).toContain("Phase 5 Public Launch Candidate");
    expect(launchGuide).toContain(
      "pnpm cadenza export phase5-alpha-readiness-talk --run-id local-alpha",
    );
    expect(launchGuide).toContain(
      "inspect dist/phase5/phase5-alpha-readiness-talk/local-alpha/",
    );
    expect(launchGuide).toContain("@cadenza-dev/core");
    expect(launchGuide).toContain("@cadenza-dev/preview-remotion");
    expect(launchGuide).toContain("cadenza-best-practices");
  });

  it("TC-ALFA-002 records the public-surface stability gate and Reviewer acceptance dependency", async () => {
    const deckId = phase5AlphaReadinessTalkMetadata.deckId;
    const runId = "vitest-b5-5-stability-reviewer";
    const outputDir = path.join(process.cwd(), "dist/phase5", deckId, runId);
    rmSync(outputDir, { force: true, recursive: true });

    await runCadenzaCli(["export", deckId, "--run-id", runId]);

    const readiness = readJson<Phase5AlphaReadinessEvidence>(
      path.join(outputDir, "alpha-readiness-evidence.json"),
    );
    const summary = readText(
      path.join(outputDir, "alpha-readiness-evidence.md"),
    );

    expect(readiness.alphaReadinessClaim).toEqual({
      builderGreenTestsSufficient: false,
      exportEvidenceSufficient: false,
      maintainerChatSignoffSufficient: false,
      status: "not-claimed",
    });
    expect(readiness.stabilityGate).toEqual({
      clock: {
        duration: "P1M",
        startTrigger:
          "first Builder commit that declares docs/alpha-readiness.md and generated alpha-readiness evidence",
        status: "pending-first-builder-commit",
        surfaceEvidence: [
          "docs/alpha-readiness.md",
          "alpha-readiness-evidence.json",
        ],
        unresolvedBreakingChangeFindings: [],
      },
      maintainerWaiverRoute: {
        allowed: true,
        narrowsReadinessClaim: true,
        requiredArtifact: "trace/phase5/status.yaml",
        riskExplanationRequired: true,
      },
    });
    expect(readiness.reviewerAcceptanceGate).toEqual({
      accepted: false,
      acceptedArtifact:
        "trace/phase5/review-phase5-closeout.md#Reviewer Acceptance",
      builderCloseoutRequired: true,
      required: true,
    });
    expect(summary).toContain("Alpha readiness: not claimed");
    expect(summary).toContain("Reviewer acceptance required: yes");
    expect(summary).toContain("Builder green tests are not sufficient");
    expect(summary).toContain(
      "Maintainer waiver route: trace/phase5/status.yaml",
    );
  });

  it("TC-ALFA-003 records overclaim guards and keeps publication boundaries closed", async () => {
    const deckId = phase5AlphaReadinessTalkMetadata.deckId;
    const runId = "vitest-b5-5-overclaim-guards";
    const outputDir = path.join(process.cwd(), "dist/phase5", deckId, runId);
    rmSync(outputDir, { force: true, recursive: true });

    await runCadenzaCli(["export", deckId, "--run-id", runId]);

    const readiness = readJson<Phase5AlphaReadinessEvidence>(
      path.join(outputDir, "alpha-readiness-evidence.json"),
    );
    const summary = readText(
      path.join(outputDir, "alpha-readiness-evidence.md"),
    );
    const rootManifest = readJson<{
      private: boolean;
      scripts: Record<string, string>;
    }>(path.join(process.cwd(), "package.json"));
    const coreManifest = readJson<{ private: boolean }>(
      path.join(process.cwd(), "packages/core/package.json"),
    );
    const previewManifest = readJson<{ private: boolean }>(
      path.join(process.cwd(), "packages/preview-remotion/package.json"),
    );
    const scannedText = readiness.overclaimGuards.scannedArtifacts
      .map((artifact) => readText(artifact))
      .join("\n");

    expect(readiness.overclaimGuards.publicationBoundary).toEqual({
      explicitMaintainerApprovalRequired: true,
      externalAnnouncementOpened: false,
      npmPublicationPerformed: false,
      packageMetadataPreparedOnly: true,
      releaseTagsCreated: false,
    });
    expect(rootManifest.private).toBe(true);
    expect(coreManifest.private).toBe(true);
    expect(previewManifest.private).toBe(true);
    expect(Object.values(rootManifest.scripts).join("\n")).not.toMatch(
      /\bnpm publish\b|\bpnpm publish\b|\byarn publish\b/,
    );
    expect(readiness.overclaimGuards.prohibitedClaims).toEqual(
      [
        "external alpha user feedback",
        "hosted rendering readiness",
        "commercial readiness",
        "template marketplace support",
        "WYSIWYG editing",
        "collaboration or comments",
        "SSO",
        "i18n infrastructure",
        "npm publication",
        "broad arbitrary-deck MP4 support",
        "full PDF parity",
      ].map((claim) => ({ claim, status: "absent" })),
    );
    expect(readiness.overclaimGuards.scannedArtifacts).toEqual(
      expect.arrayContaining([
        "README.md",
        "docs/alpha-readiness.md",
        "examples/phase5/alpha-readiness-talk.tsx",
      ]),
    );
    expect(scannedText).not.toMatch(/0\.1 alpha readiness is claimed/i);
    expect(scannedText).not.toMatch(/hosted rendering readiness/i);
    expect(scannedText).not.toMatch(
      /external alpha users? (?:completed|validated|adopted)/i,
    );
    expect(scannedText).not.toMatch(/published to npm/i);
    expect(scannedText).not.toMatch(/commercial readiness is claimed/i);
    expect(scannedText).not.toMatch(/template marketplace support is ready/i);
    expect(scannedText).not.toMatch(/WYSIWYG editing is supported/i);
    expect(scannedText).not.toMatch(
      /collaboration (?:is supported|support is ready)/i,
    );
    expect(scannedText).not.toMatch(/SSO (?:is supported|support is ready)/i);
    expect(scannedText).not.toMatch(/i18n infrastructure is ready/i);
    expect(summary).toContain("No hosted rendering readiness is claimed.");
    expect(summary).toContain("No npm publication is claimed.");
    expect(summary).toContain("No external alpha adoption is claimed.");
  });
});

describe("B5.6 Phase 5 hosted evaluation, MCP boundary, and presenter follow-up", () => {
  it("TC-LHEV-001, TC-LHEV-002, TC-MCPA-001, TC-MCPA-002, TC-PCON-001, and TC-PCON-002 emit local boundary evidence without remote expansion", async () => {
    const deckId = phase5AlphaReadinessTalkMetadata.deckId;
    const runId = "vitest-b5-6-boundary-evidence";
    const outputDir = path.join(process.cwd(), "dist/phase5", deckId, runId);
    rmSync(outputDir, { force: true, recursive: true });

    await runCadenzaCli(["export", deckId, "--run-id", runId]);

    const manifest = readJson<Phase5ExportManifest>(
      path.join(outputDir, "manifest.json"),
    );
    const evidence = readJson<Phase5BoundaryEvaluationEvidence>(
      path.join(outputDir, "boundary-evaluation-evidence.json"),
    );
    const summary = readText(
      path.join(outputDir, "boundary-evaluation-evidence.md"),
    );
    const rootManifest = readJson<{
      scripts: Record<string, string>;
    }>(path.join(process.cwd(), "package.json"));

    expect(manifest.boundaryEvaluationEvidencePath).toBe(
      "boundary-evaluation-evidence.json",
    );
    expect(manifest.artifacts.map((artifact) => artifact.path)).toEqual(
      expect.arrayContaining([
        "boundary-evaluation-evidence.json",
        "boundary-evaluation-evidence.md",
      ]),
    );
    expect(evidence).toMatchObject({
      batchId: "B5.6",
      phase: "5",
      scenarioIds: [
        "TC-LHEV-001",
        "TC-LHEV-002",
        "TC-MCPA-001",
        "TC-MCPA-002",
        "TC-PCON-001",
        "TC-PCON-002",
      ],
      schemaVersion: 1,
    });
    expect(evidence.requirementRefs).toEqual([
      "LHEV-001",
      "LHEV-002",
      "LHEV-005",
      "EXPT-004",
      "LHEV-003",
      "LHEV-004",
      "MCPA-001",
      "MCPA-003",
      "MCPA-005",
      "MCPA-002",
      "MCPA-004",
      "PCON-001",
      "PCON-003",
      "PCON-004",
      "PCON-002",
    ]);

    expect(evidence.hostedEvaluation).toMatchObject({
      disposition: "evaluation-only",
      hostedImplementationStarted: false,
      remoteJobsRun: false,
      requiresHostedInfrastructureForLocalExport: false,
      recommendation: {
        nextStep:
          "future Proposed ADR or explicit maintainer approval before hosted implementation",
        status: "defer-hosted-implementation",
      },
    });
    expect(evidence.hostedEvaluation.localCompatibilityReport).toMatchObject({
      artifactLayout: {
        generatedArtifactRoot: `dist/phase5/${deckId}/${runId}`,
        suitableForFutureRemotePackaging: true,
      },
      diagnostics: {
        parityStatus: "passed",
      },
      localExportInputs: {
        command: phase5AlphaReadinessTalkMetadata.exportCommand,
        localOnly: true,
        sourceDeck: phase5AlphaReadinessTalkMetadata.sourcePath,
      },
      manifest: {
        hasDeterministicTimelineIdentity: true,
        hasStableHash: true,
      },
      renderSafeReadiness: {
        resourceCount:
          manifest.previewExportParity.diagnostics.renderSafe.resources.length,
        status: "metadata-ready",
      },
    });
    expect(evidence.hostedEvaluation.costRiskLicense).toMatchObject({
      apache2OssCoreBoundaryPreserved: true,
      cadenzaRedistributesRemotion: false,
      grantsRemotionCommercialRights: false,
      productionGradeCostModel: false,
    });
    expect(evidence.hostedEvaluation.costRiskLicense.costAssumptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: "estimated",
          subject: "future Remotion Lambda render minutes",
        }),
      ]),
    );
    expect(
      evidence.hostedEvaluation.costRiskLicense.operationalRisks.map(
        (risk) => risk.category,
      ),
    ).toEqual(
      expect.arrayContaining([
        "credential-management",
        "queue-failure",
        "artifact-retention",
      ]),
    );
    expect(evidence.hostedEvaluation.costRiskLicense.licensingTriggers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          trigger: "hosted rendering or cloud-render commercial tier",
        }),
      ]),
    );

    expect(evidence.boundaryScans.remotePrerequisites).toEqual({
      externalPublishingRequired: false,
      hostedInfrastructureRequired: false,
      paidCloudJobsRequired: false,
      remoteAccountsRequired: false,
      secretsRequired: false,
    });
    expect(evidence.boundaryScans.prohibitedPatternResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ pattern: "npm publish", status: "absent" }),
        expect.objectContaining({
          pattern: "pnpm publish",
          status: "absent",
        }),
        expect.objectContaining({
          pattern: "remotion lambda",
          status: "absent",
        }),
        expect.objectContaining({ pattern: "AWS_*", status: "absent" }),
      ]),
    );
    expect(evidence.boundaryScans.scannedArtifacts).toEqual(
      expect.arrayContaining([
        "package.json",
        "scripts/cadenza.ts",
        "README.md",
        "docs/alpha-readiness.md",
        ".github/workflows/ci.yml",
      ]),
    );
    expect(Object.values(rootManifest.scripts).join("\n")).not.toMatch(
      /\bnpm publish\b|\bpnpm publish\b|\byarn publish\b|remotion lambda/i,
    );

    expect(evidence.mcpDisposition).toEqual({
      contextInjectionAdequate: true,
      inventory: [],
      prohibitedCapabilitiesAbsent: [
        "hosted rendering",
        "commercial-tier workflows",
        "WYSIWYG editing",
        "template marketplace",
        "collaboration or comments",
        "SSO",
        "i18n infrastructure",
        "external publishing",
      ],
      readOnlyMcp: {
        disposition: "deferred-default",
        resourcesOrPromptsAdded: [],
        rationale:
          "Phase 5 Markdown, examples, trace, generated evidence, and cadenza-best-practices remain practical direct context.",
      },
      targetPhaseOrCondition:
        "Phase 7 or later, or earlier only if Markdown context injection proves inadequate.",
      toolBasedMcp: {
        deferredBeyondPhase5: true,
        implemented: false,
        rationale:
          "Tool-based MCP must wrap stable local validation, preview, export, and report commands after the launch path settles.",
      },
    });

    expect(evidence.presenterFollowup).toEqual({
      livePresenterRecording: {
        canonicalExportPath: "deterministic-offline-export",
        liveRecordingIsCanonical: false,
        recordingArtifactsProduced: [],
      },
      multiDevicePresenterConsole: {
        disposition: "deferred-beyond-phase5",
        implemented: false,
        rationale:
          "The inherited same-browser presenter workflow remains sufficient for the Phase 5 launch-candidate path.",
      },
      prohibitedScopeAbsent: [
        "accounts",
        "SSO",
        "collaboration",
        "comments",
        "remote control services",
        "external publishing",
        "hosted infrastructure",
      ],
      sameBrowserPresenterWorkflowRemainsDefault: true,
      sessionReplay: {
        diagnosticAllowedIfParityNeedsIt: true,
        disposition: "not-introduced",
        userFacingReplayArtifactDefined: false,
      },
    });

    expect(summary).toContain("Phase 5 boundary evaluation evidence");
    expect(summary).toContain("Remote jobs run: no");
    expect(summary).toContain("Read-only MCP: deferred by default");
    expect(summary).toContain(
      "Live-presenter recording is not the canonical export path.",
    );
    expect(summary).toContain(
      "No secrets, remote accounts, paid jobs, publishing, or hosted infrastructure are required.",
    );
  });
});

type Phase5ExportManifest = {
  artifacts: {
    format: "json" | "markdown" | "mp4" | "web";
    path: string;
    role: string;
  }[];
  boundaryEvaluationEvidencePath: "boundary-evaluation-evidence.json";
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
  alphaReadinessEvidencePath: "alpha-readiness-evidence.json";
  formatScopeEvidencePath: "format-scope-evidence.json";
  requiresHostedInfrastructure: boolean;
  runId: string;
  sourceDeck: string;
  stableHash: string;
  previewExportParity: {
    browserSmoke: {
      entrypoint: "index.html";
      requiredSelectors: string[];
      testId: "TC-PEXP-001/TC-PEXP-002";
    };
    diagnostics: {
      density: {
        evaluatedBoxes: {
          componentId: string;
          slideId: string;
        }[];
        regressions: unknown[];
      };
      renderSafe: {
        resources: {
          resourceId: string;
          resourceKind: string;
          slideId: string;
          timeoutMs: number;
        }[];
      };
      typography: {
        boxes: {
          componentId: string;
          hasAutoFit: boolean;
          maxHeight: number;
          maxWidth: number;
          slideId: string;
        }[];
      };
    };
    exported: Phase5ParityTimeline;
    notesBoundary: {
      exportedVisibleSurface: "excluded";
      notesCount: number;
      slideId: string;
    }[];
    preview: Phase5ParityTimeline;
    requirementRefs: ["PEXP-001", "PEXP-002", "PEXP-003", "PEXP-004"];
    semanticCheckpoints: {
      frame: number;
      kind: "slide-boundary" | "step-boundary" | "transition-settle";
      slideId: string;
      stepIndex?: number;
    }[];
    status: "passed";
  };
  webBundle: {
    entrypoint: "index.html";
    semanticAnchors: string[];
  };
};

type Phase5AlphaReadinessEvidence = {
  alphaReadinessClaim: {
    builderGreenTestsSufficient: false;
    exportEvidenceSufficient: false;
    maintainerChatSignoffSufficient: false;
    status: "not-claimed";
  };
  batchId: "B5.5";
  launchCandidate: {
    docs: string[];
    positioning: string;
  };
  overclaimGuards: {
    prohibitedClaims: {
      claim: string;
      status: "absent";
    }[];
    publicationBoundary: {
      explicitMaintainerApprovalRequired: true;
      externalAnnouncementOpened: false;
      npmPublicationPerformed: false;
      packageMetadataPreparedOnly: true;
      releaseTagsCreated: false;
    };
    scannedArtifacts: string[];
  };
  phase: "5";
  publicSurface: {
    commands: {
      command: string;
      stage: "evidence" | "export" | "install" | "preview" | "run";
    }[];
    examples: string[];
    excludedInternalSurface: string[];
    guidance: string[];
    packages: {
      exports: string[];
      packageName: string;
    }[];
  };
  requirementRefs: string[];
  reviewerAcceptanceGate: {
    accepted: false;
    acceptedArtifact: string;
    builderCloseoutRequired: true;
    required: true;
  };
  scenarioIds: ["TC-ALFA-001", "TC-ALFA-002", "TC-ALFA-003"];
  schemaVersion: 1;
  stabilityGate: {
    clock: {
      duration: "P1M";
      startTrigger: string;
      status: "pending-first-builder-commit";
      surfaceEvidence: string[];
      unresolvedBreakingChangeFindings: string[];
    };
    maintainerWaiverRoute: {
      allowed: true;
      narrowsReadinessClaim: true;
      requiredArtifact: string;
      riskExplanationRequired: true;
    };
  };
};

type Phase5ParityTimeline = {
  semanticAnchors: string[];
  slideOrder: string[];
  stepOrdering: Phase5ExportManifest["deterministic"]["stepOrdering"];
  timelineIdentity: string;
  transitions: {
    durationFrames: number;
    from: string;
    kind: string;
    segment: [number, number];
    settleFrame: number;
    to: string;
  }[];
};

type Phase5ExportEvidence = {
  artifactInventory: {
    format: "json" | "markdown" | "web";
    path: string;
    role: string;
  }[];
  batchId: "B5.3";
  boundaryClaims: {
    claim:
      | "alpha-readiness"
      | "export-readiness"
      | "format-scope"
      | "hosted-readiness"
      | "waiver";
    evidenceArtifacts: string[];
    status: "evidence-backed" | "not-claimed";
  }[];
  diagnostics: {
    densityRegressionCount: number;
    parityStatus: "passed";
    renderSafeResourceCount: number;
    typographyBoxCount: number;
  };
  exportRun: {
    command: string;
    generatedManifestPath: "manifest.json";
    options: {
      format: "web";
      localOnly: true;
      outputDirectory: string;
    };
    runId: string;
    sourceDeck: {
      deckId: string;
      path: string;
    };
  };
  knownLimitations: {
    affectedArtifact: string;
    category: string;
    severity: string;
  }[];
  parityChecks: {
    browserSmoke: Phase5ExportManifest["previewExportParity"]["browserSmoke"];
    status: "passed";
  };
  phase: "5";
  repairRoutingEvidencePath: "repair-routing-evidence.json";
  requirementRefs: string[];
  scenarioIds: ["TC-EVDN-001", "TC-EVDN-002"];
  schemaVersion: 1;
};

type Phase5FormatScopeEvidence = {
  batchId: "B5.4";
  formatClaims: {
    blanketFormatParity: false;
    broadArbitraryDeckMp4Support: false;
    broadPdfSupport: false;
    canonicalTalkMp4Only: true;
    pdfLaunchReadinessWaived: true;
  };
  formats: {
    artifactInventory: {
      format: "json" | "markdown" | "mp4" | "web";
      path: string;
      role: string;
    }[];
    declaredCapability:
      | "baseline-web-bundle"
      | "canonical-talk-video-proof"
      | "unsupported-launch-waiver";
    capabilityEvidence: Record<string, unknown>;
    disposition:
      | "baseline-supported"
      | "supported-for-canonical-talk"
      | "waived-for-launch-readiness";
    diagnostics: {
      densityRegressionCount: number;
      renderSafeResourceCount: number;
      typographyBoxCount: number;
    };
    enabled: boolean;
    format: "mp4" | "pdf" | "web";
    limitations: {
      category:
        | "arbitrary-deck-boundary"
        | "format-waiver"
        | "renderer-boundary"
        | "static-output-boundary";
      severity: "info" | "warning";
    }[];
    parityChecks: {
      slideOrder: string[];
      status: "limited-passed" | "passed" | "waived";
      transitionCount: number;
    };
    scope?: {
      arbitraryDecks: false;
      canonicalDeckId: string;
      launchReadinessImpact: string;
    };
    waiver?: {
      format: "pdf";
      launchReadinessImpact: "not-blocking";
      reviewerAcceptanceCreatesWaiver: false;
    };
  }[];
  phase: "5";
  requirementRefs: ["FMT-002", "FMT-003", "FMT-004", "FMT-005"];
  scenarioIds: ["TC-FMT-001", "TC-FMT-002"];
  schemaVersion: 1;
  sourceDeck: {
    deckId: string;
    path: string;
  };
};

type Phase5RepairRoutingEvidence = {
  batchId: "B5.3";
  categoryTaxonomy: {
    category: string;
  }[];
  failureFixtures: {
    category: string;
    evidenceArtifacts: string[];
    fixtureId: string;
  }[];
  passingExport: {
    category: "none";
    evidenceArtifacts: string[];
    status: "passed";
  };
  phase: "5";
  readinessClaimPolicy: {
    artifactBackedClaimsOnly: true;
    chatOnlyDeclarationsAccepted: false;
    reviewerReadableArtifactRequired: true;
  };
  requirementRefs: ["PEXP-005", "EVDN-004", "EVDN-005"];
  scenarioIds: ["TC-EVDN-002"];
  schemaVersion: 1;
  sourceEvidencePath: "export-evidence.json";
};

type Phase5BoundaryEvaluationEvidence = {
  batchId: "B5.6";
  boundaryScans: {
    prohibitedPatternResults: {
      matches: string[];
      pattern: string;
      status: "absent";
    }[];
    remotePrerequisites: {
      externalPublishingRequired: false;
      hostedInfrastructureRequired: false;
      paidCloudJobsRequired: false;
      remoteAccountsRequired: false;
      secretsRequired: false;
    };
    scannedArtifacts: string[];
  };
  hostedEvaluation: {
    costRiskLicense: {
      apache2OssCoreBoundaryPreserved: true;
      cadenzaRedistributesRemotion: false;
      costAssumptions: {
        notes: string;
        status: "estimated" | "unsupported-assumption";
        subject: string;
      }[];
      grantsRemotionCommercialRights: false;
      licensingTriggers: {
        evidence: string[];
        trigger: string;
      }[];
      operationalRisks: {
        category: string;
        mitigation: string;
      }[];
      productionGradeCostModel: false;
    };
    disposition: "evaluation-only";
    hostedImplementationStarted: false;
    localCompatibilityReport: {
      artifactLayout: {
        generatedArtifactRoot: string;
        suitableForFutureRemotePackaging: true;
      };
      diagnostics: {
        parityStatus: "passed";
      };
      localExportInputs: {
        command: string;
        localOnly: true;
        sourceDeck: string;
      };
      manifest: {
        hasDeterministicTimelineIdentity: true;
        hasStableHash: true;
      };
      renderSafeReadiness: {
        resourceCount: number;
        status: "metadata-ready";
      };
    };
    recommendation: {
      nextStep: string;
      status: "defer-hosted-implementation";
    };
    remoteJobsRun: false;
    requiresHostedInfrastructureForLocalExport: false;
  };
  mcpDisposition: {
    contextInjectionAdequate: true;
    inventory: [];
    prohibitedCapabilitiesAbsent: string[];
    readOnlyMcp: {
      disposition: "deferred-default";
      rationale: string;
      resourcesOrPromptsAdded: [];
    };
    targetPhaseOrCondition: string;
    toolBasedMcp: {
      deferredBeyondPhase5: true;
      implemented: false;
      rationale: string;
    };
  };
  phase: "5";
  presenterFollowup: {
    livePresenterRecording: {
      canonicalExportPath: "deterministic-offline-export";
      liveRecordingIsCanonical: false;
      recordingArtifactsProduced: [];
    };
    multiDevicePresenterConsole: {
      disposition: "deferred-beyond-phase5";
      implemented: false;
      rationale: string;
    };
    prohibitedScopeAbsent: string[];
    sameBrowserPresenterWorkflowRemainsDefault: true;
    sessionReplay: {
      diagnosticAllowedIfParityNeedsIt: true;
      disposition: "not-introduced";
      userFacingReplayArtifactDefined: false;
    };
  };
  requirementRefs: string[];
  scenarioIds: [
    "TC-LHEV-001",
    "TC-LHEV-002",
    "TC-MCPA-001",
    "TC-MCPA-002",
    "TC-PCON-001",
    "TC-PCON-002",
  ];
  schemaVersion: 1;
};

function readText(relativePath: string): string {
  return readFileSync(
    path.isAbsolute(relativePath)
      ? relativePath
      : path.join(process.cwd(), relativePath),
    "utf8",
  );
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
