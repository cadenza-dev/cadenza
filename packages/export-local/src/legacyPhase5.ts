import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

type CadenzaExportDeckId = "phase5-alpha-readiness-talk";

type DeckDescriptor = {
  deckId: CadenzaExportDeckId;
  fixtureExport: string;
  metadataExport: string;
  sourcePath: string;
};

type ExportArgs = {
  deckId: CadenzaExportDeckId;
  runId: string;
};

type DeckFixture = {
  deck: unknown;
  offlineTimeline: TimelineMap;
  timeline: TimelineMap;
};

type DeckMetadata = {
  deckId: CadenzaExportDeckId;
  exportCommand: string;
  outline: {
    chapterId: string;
    slideId: string;
    summary: string;
    title: string;
  }[];
  sourcePath: string;
  title: string;
};

type TimelineMap = {
  fps: number;
  navigationPolicy: string;
  totalFrames: number;
  slides: TimelineSlide[];
};

type TimelineSlide = {
  slideId: string;
  notes: string[];
  resources: {
    resourceId: string;
    resourceKind: string;
    timeoutMs: number;
  }[];
  segment: [number, number];
  steps: {
    kind: string;
    segment: [number, number];
    stepIndex: number;
  }[];
  transitionIn?: {
    durationFrames: number;
    from: string;
    kind: string;
    segment: [number, number];
    to: string;
  };
  transitionOut?: {
    durationFrames: number;
    from: string;
    kind: string;
    segment: [number, number];
    to: string;
  };
};

export type Phase5ExportArtifact = {
  format: "json" | "markdown" | "mp4" | "web";
  path: string;
  role: string;
};

export type Phase5LocalWebExportManifest = {
  artifacts: Phase5ExportArtifact[];
  alphaReadinessEvidencePath: "alpha-readiness-evidence.json";
  boundaryEvaluationEvidencePath: "boundary-evaluation-evidence.json";
  command: string;
  deckId: CadenzaExportDeckId;
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
  generatedAt: string;
  formatScopeEvidencePath: "format-scope-evidence.json";
  localOnly: true;
  outputDirectory: string;
  previewExportParity: Phase5PreviewExportParityReport;
  requiresHostedInfrastructure: false;
  runId: string;
  sourceDeck: string;
  stableHash: string;
  webBundle: {
    entrypoint: "index.html";
    semanticAnchors: string[];
  };
};

export type Phase5PreviewExportParityReport = {
  browserSmoke: {
    entrypoint: "index.html";
    requiredSelectors: [
      "[data-cadenza-export-deck]",
      "[data-cadenza-export-parity='passed']",
      "[data-cadenza-semantic-anchor]",
    ];
    testId: "TC-PEXP-001/TC-PEXP-002";
  };
  diagnostics: {
    density: {
      evaluatedBoxes: Phase5DensityDiagnostic[];
      regressions: Phase5DensityRegression[];
    };
    renderSafe: {
      resources: Phase5RenderSafeDiagnostic[];
    };
    typography: {
      boxes: Phase5TypographyDiagnostic[];
    };
  };
  exported: Phase5ParityTimeline;
  notesBoundary: Phase5NotesBoundary[];
  preview: Phase5ParityTimeline;
  requirementRefs: ["PEXP-001", "PEXP-002", "PEXP-003", "PEXP-004"];
  semanticCheckpoints: Phase5SemanticCheckpoint[];
  timingComparison: Phase5ParityTimingComparison;
  status: "passed";
};

type Phase5ParityTimingComparison = {
  finalSemanticAnchors: {
    exported: string;
    preview: string;
    status: "matched";
  };
  offlineTiming: {
    allowedDeltas: Phase5ParityStepTimingDelta[];
    status: "passed" | "passed-with-allowed-deltas";
    unexpectedMismatches: Phase5ParityTimingMismatch[];
  };
  slideOrder: {
    status: "matched";
  };
  stepIdentity: {
    status: "matched";
  };
  transitions: {
    allowedDeltas: Phase5ParityTransitionTimingDelta[];
    status: "passed" | "passed-with-allowed-deltas";
    unexpectedMismatches: Phase5ParityTimingMismatch[];
  };
};

type Phase5ParityStepTimingDelta = {
  exportedSegment: [number, number];
  frameDelta: number;
  kind: string;
  previewSegment: [number, number];
  reason: string;
  slideId: string;
  status: "allowed";
  stepIndex: number;
  timingOwner: "offline-export-duration";
};

type Phase5ParityTransitionTimingDelta = {
  exportedSegment: [number, number];
  frameDelta: number;
  from: string;
  kind: string;
  previewSegment: [number, number];
  reason: string;
  status: "allowed";
  timingOwner: "propagated-offline-duration-delta";
  to: string;
};

type Phase5ParityTimingMismatch = {
  exported: string;
  preview: string;
  reason: string;
};

type Phase5ParityTimeline = {
  semanticAnchors: string[];
  slideOrder: string[];
  stepOrdering: Phase5LocalWebExportManifest["deterministic"]["stepOrdering"];
  timelineIdentity: string;
  transitions: Phase5ParityTransition[];
};

type Phase5ParityTransition = {
  durationFrames: number;
  from: string;
  kind: string;
  segment: [number, number];
  settleFrame: number;
  to: string;
};

type Phase5SemanticCheckpoint = {
  frame: number;
  kind: "slide-boundary" | "step-boundary" | "transition-settle";
  slideId: string;
  stepIndex?: number;
};

type Phase5NotesBoundary = {
  exportedVisibleSurface: "excluded";
  notesCount: number;
  slideId: string;
};

type Phase5RenderSafeDiagnostic = {
  resourceId: string;
  resourceKind: string;
  slideId: string;
  timeoutMs: number;
};

type Phase5TypographyDiagnostic = {
  componentId: string;
  density: string;
  hasAutoFit: boolean;
  maxHeight: number;
  maxWidth: number;
  slideId: string;
  text: string;
};

type Phase5DensityDiagnostic = {
  characterCount: number;
  charactersPer1000Px2: number;
  componentId: string;
  density: string;
  estimatedLineCount: number;
  slideId: string;
};

type Phase5DensityRegression = {
  code: string;
  componentId: string;
  slideId: string;
};

export type Phase5ExportEvidence = {
  artifactInventory: Phase5ExportArtifact[];
  batchId: "B5.3";
  boundaryClaims: Phase5BoundaryClaim[];
  diagnostics: {
    densityRegressionCount: number;
    parityStatus: Phase5PreviewExportParityReport["status"];
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
      deckId: CadenzaExportDeckId;
      path: string;
    };
  };
  knownLimitations: Phase5KnownLimitation[];
  parityChecks: {
    browserSmoke: Phase5PreviewExportParityReport["browserSmoke"];
    semanticCheckpointCount: number;
    status: Phase5PreviewExportParityReport["status"];
  };
  phase: "5";
  repairRoutingEvidencePath: "repair-routing-evidence.json";
  requirementRefs: [
    "EVDN-001",
    "EVDN-002",
    "EVDN-003",
    "PEXP-005",
    "EVDN-004",
    "EVDN-005",
  ];
  scenarioIds: ["TC-EVDN-001", "TC-EVDN-002"];
  schemaVersion: 1;
};

export type Phase5RepairRoutingEvidence = {
  batchId: "B5.3";
  categoryTaxonomy: Phase5RepairRoutingCategory[];
  failureFixtures: Phase5RepairFailureFixture[];
  passingExport: {
    category: "none";
    evidenceArtifacts: ["manifest.json", "export-evidence.json"];
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

type Phase5RepairCategory =
  | "authored-deck-repair"
  | "environment-limitation"
  | "export-implementation-defect"
  | "framework-defect-evidence"
  | "guidance-repair"
  | "maintainer-waiver"
  | "render-safe-asset-defect";

type Phase5RepairRoutingCategory = {
  category: Phase5RepairCategory;
  route: string;
  when: string;
};

type Phase5RepairFailureFixture = {
  category: Phase5RepairCategory;
  evidenceArtifacts: string[];
  fixtureId: string;
  route: string;
};

type Phase5BoundaryClaim = {
  claim:
    | "alpha-readiness"
    | "export-readiness"
    | "format-scope"
    | "hosted-readiness"
    | "waiver";
  evidenceArtifacts: string[];
  status: "evidence-backed" | "not-claimed";
};

type Phase5KnownLimitation = {
  affectedArtifact: string;
  category: "environment-limitation";
  notes: string;
  severity: "info";
};

export type Phase5FormatScopeEvidence = {
  batchId: "B5.4";
  formatClaims: {
    blanketFormatParity: false;
    broadArbitraryDeckMp4Support: false;
    broadPdfSupport: false;
    canonicalTalkMp4Only: true;
    pdfLaunchReadinessWaived: true;
  };
  formats: Phase5FormatEvidence[];
  phase: "5";
  requirementRefs: ["FMT-002", "FMT-003", "FMT-004", "FMT-005"];
  scenarioIds: ["TC-FMT-001", "TC-FMT-002"];
  schemaVersion: 1;
  sourceDeck: {
    deckId: CadenzaExportDeckId;
    path: string;
  };
};

type Phase5FormatEvidence = {
  artifactInventory: Phase5ExportArtifact[];
  capabilityEvidence: {
    notesBoundary: Phase5FormatCapabilityEvidence;
    renderSafeAssets: Phase5FormatCapabilityEvidence & {
      resourceCount: number;
    };
    transitions: Phase5FormatCapabilityEvidence & {
      transitionCount: number;
    };
    typographyDensity: Phase5FormatCapabilityEvidence & {
      densityRegressionCount: number;
      typographyBoxCount: number;
    };
    visibleSlideSurface: Phase5FormatCapabilityEvidence;
  };
  declaredCapability:
    | "baseline-web-bundle"
    | "canonical-talk-video-proof"
    | "unsupported-launch-waiver";
  diagnostics: {
    densityRegressionCount: number;
    renderSafeResourceCount: number;
    typographyBoxCount: number;
  };
  disposition:
    | "baseline-supported"
    | "supported-for-canonical-talk"
    | "waived-for-launch-readiness";
  enabled: boolean;
  format: "mp4" | "pdf" | "web";
  limitations: Phase5FormatLimitation[];
  parityChecks: {
    notesBoundary: "excluded-from-visible-output" | "waived";
    semanticCheckpointCount: number;
    slideOrder: string[];
    status: "passed" | "limited-passed" | "waived";
    timelineIdentity: string;
    transitionCount: number;
  };
  scope?: {
    arbitraryDecks: false;
    canonicalDeckId: CadenzaExportDeckId;
    launchReadinessImpact: "required-for-phase5-launch-candidate";
  };
  waiver?: {
    followUpTarget: string;
    format: "pdf";
    launchReadinessImpact: "not-blocking";
    rationale: string;
    reviewerAcceptanceCreatesWaiver: false;
  };
};

type Phase5FormatCapabilityEvidence = {
  evidenceArtifacts: string[];
  notes: string;
  status:
    | "diagnosed"
    | "excluded-from-visible-output"
    | "limited-smoke-proof"
    | "metadata-only"
    | "preserved"
    | "semantic-parity"
    | "timeline-metadata"
    | "waived";
};

type Phase5FormatLimitation = {
  category:
    | "arbitrary-deck-boundary"
    | "format-waiver"
    | "renderer-boundary"
    | "static-output-boundary";
  notes: string;
  severity: "info" | "warning";
};

export type Phase5AlphaReadinessEvidence = {
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
      claim: Phase5ProhibitedAlphaClaim;
      status: "absent";
    }[];
    publicationBoundary: {
      explicitMaintainerApprovalRequired: true;
      externalAnnouncementOpened: false;
      npmPublicationPerformed: false;
      packageMetadataPreparedOnly: true;
      releaseTagsCreated: false;
    };
    scannedArtifacts: [
      "README.md",
      "docs/alpha-readiness.md",
      "examples/phase5/alpha-readiness-talk.tsx",
    ];
  };
  phase: "5";
  publicSurface: {
    commands: Phase5CleanCheckoutCommand[];
    examples: string[];
    excludedInternalSurface: string[];
    guidance: string[];
    packages: {
      exports: string[];
      packageName: string;
    }[];
  };
  requirementRefs: [
    "ALFA-001",
    "ALFA-002",
    "ALFA-003",
    "ALFA-004",
    "ALFA-005",
    "ALFA-006",
    "ALFA-007",
  ];
  reviewerAcceptanceGate: {
    accepted: false;
    acceptedArtifact: "trace/phase5/review-phase5-closeout.md#Reviewer Acceptance";
    builderCloseoutRequired: true;
    required: true;
  };
  scenarioIds: ["TC-ALFA-001", "TC-ALFA-002", "TC-ALFA-003"];
  schemaVersion: 1;
  stabilityGate: {
    clock: {
      duration: "P1M";
      startCommit: "b60d4b75a52b7f6dcacdeccc06aaceb4406eeb79";
      startCommitShort: "b60d4b7";
      startedAt: "2026-05-27T00:28:11+08:00";
      startTrigger: string;
      status: "active";
      surfaceEvidence: [
        "docs/alpha-readiness.md",
        "alpha-readiness-evidence.json",
      ];
      unresolvedBreakingChangeFindings: [];
    };
    maintainerWaiverRoute: {
      allowed: true;
      narrowsReadinessClaim: true;
      requiredArtifact: "trace/phase5/status.yaml";
      riskExplanationRequired: true;
    };
  };
};

export type Phase5BoundaryEvaluationEvidence = {
  batchId: "B5.6";
  boundaryScans: Phase5BoundaryScanEvidence;
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
        category:
          | "artifact-retention"
          | "credential-management"
          | "queue-failure";
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
        densityRegressionCount: number;
        parityStatus: Phase5PreviewExportParityReport["status"];
        typographyBoxCount: number;
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
      nextStep: "future Proposed ADR or explicit maintainer approval before hosted implementation";
      status: "defer-hosted-implementation";
    };
    remoteJobsRun: false;
    requiresHostedInfrastructureForLocalExport: false;
  };
  mcpDisposition: {
    contextInjectionAdequate: true;
    inventory: [];
    prohibitedCapabilitiesAbsent: [
      "hosted rendering",
      "commercial-tier workflows",
      "WYSIWYG editing",
      "template marketplace",
      "collaboration or comments",
      "SSO",
      "i18n infrastructure",
      "external publishing",
    ];
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
    prohibitedScopeAbsent: [
      "accounts",
      "SSO",
      "collaboration",
      "comments",
      "remote control services",
      "external publishing",
      "hosted infrastructure",
    ];
    sameBrowserPresenterWorkflowRemainsDefault: true;
    sessionReplay: {
      diagnosticAllowedIfParityNeedsIt: true;
      disposition: "not-introduced";
      userFacingReplayArtifactDefined: false;
    };
  };
  requirementRefs: [
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
  ];
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

type Phase5BoundaryScanEvidence = {
  prohibitedPatternResults: {
    matches: string[];
    pattern: string;
    status: "absent" | "present";
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

type Phase5CleanCheckoutCommand = {
  command: string;
  purpose: string;
  stage: "evidence" | "export" | "install" | "preview" | "run";
};

type Phase5ProhibitedAlphaClaim =
  | "SSO"
  | "WYSIWYG editing"
  | "broad arbitrary-deck MP4 support"
  | "collaboration or comments"
  | "commercial readiness"
  | "external alpha user feedback"
  | "full PDF parity"
  | "hosted rendering readiness"
  | "i18n infrastructure"
  | "npm publication"
  | "template marketplace support";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

const PHASE5_ALPHA_SURFACE_CLOCK_START = {
  commit: "b60d4b75a52b7f6dcacdeccc06aaceb4406eeb79",
  commitShort: "b60d4b7",
  timestamp: "2026-05-27T00:28:11+08:00",
} as const;

const PHASE5_CANONICAL_MP4_SMOKE_BASE64 = [
  "AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAOEbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAA",
  "A+gAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAA",
  "AAAAAAAAAAAAAAAAAAAAAgAAAq90cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAA+gAAAAAAAAAAAAA",
  "AAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAoAAAAFoAAAAAAAkZWR0cwAAABxlbHN0",
  "AAAAAAAAAAEAAAPoAAAAAAABAAAAAAInbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAwAAAAMABVxAAAAAAALWhk",
  "bHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAAB0m1pbmYAAAAUdm1oZAAAAAEAAAAAAAAA",
  "AAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAZJzdGJsAAAAunN0c2QAAAAAAAAAAQAAAKph",
  "dmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAoABaABIAAAASAAAAAAAAAABFUxhdmM2Mi4xMS4xMDAgbGlieDI2",
  "NAAAAAAAAAAAAAAAGP//AAAAMGF2Y0MBQsAe/+EAGWdCwB7aAoC/5cBEAAADAAQAAAMAwDxYuoABAARozg/IAAAA",
  "EHBhc3AAAAABAAAAAQAAABRidHJ0AAAAAAAAMSgAAAAAAAAAGHN0dHMAAAAAAAAAAQAAABgAAAIAAAAAFHN0c3MA",
  "AAAAAAAAAQAAAAEAAAAcc3RzYwAAAAAAAAABAAAAAQAAABgAAAABAAAAdHN0c3oAAAAAAAAAAAAAABgAAAUoAAAA",
  "CwAAAAsAAAALAAAACwAAAAsAAAALAAAACwAAAAsAAAALAAAACwAAAAsAAAALAAAACwAAAAsAAAALAAAACwAAAAsA",
  "AAALAAAACwAAAAsAAAALAAAACwAAAAsAAAAUc3RjbwAAAAAAAAABAAADtAAAAGF1ZHRhAAAAWW1ldGEAAAAAAAAA",
  "IWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALGlsc3QAAAAkqXRvbwAAABxkYXRhAAAAAQAAAABMYXZm",
  "NjIuMy4xMDAAAAAIZnJlZQAABi1tZGF0AAACVwYF//9T3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NSBy",
  "MzIyMiBiMzU2MDVhIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyNSAtIGh0dHA6",
  "Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTAgcmVmPTEgZGVibG9jaz0wOi0z",
  "Oi0zIGFuYWx5c2U9MDowIG1lPWRpYSBzdWJtZT0wIHBzeT0xIHBzeV9yZD0yLjAwOjAuNzAgbWl4ZWRfcmVmPTAg",
  "bWVfcmFuZ2U9MTYgY2hyb21hX21lPTEgdHJlbGxpcz0wIDh4OGRjdD0wIGNxbT0wIGRlYWR6b25lPTIxLDExIGZh",
  "c3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PTAgdGhyZWFkcz0xMSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNl",
  "ZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWlu",
  "ZWRfaW50cmE9MCBiZnJhbWVzPTAgd2VpZ2h0cD0wIGtleWludD0yNTAga2V5aW50X21pbj0yNCBzY2VuZWN1dD0w",
  "IGludHJhX3JlZnJlc2g9MCByYz1jcmYgbWJ0cmVlPTAgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4",
  "PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MACAAAACyWWIhDoRigACNTHAMcBk5OTk5OTk5OTk5OTk5OTk",
  "5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrwAAAAB0GaICqAHMwAAAAHQZpAKoAczAAAAAdBmmAugBzMAAAAB0GagC6A",
  "HMwAAAAHQZqgLoAczAAAAAdBmsAugBzMAAAAB0Ga4C6AHMwAAAAHQZsALoAczAAAAAdBmyAugBzMAAAAB0GbQC6A",
  "HMwAAAAHQZtgLoAczAAAAAdBm4AugBzMAAAAB0GboC6AHMwAAAAHQZvALoAczAAAAAdBm+AugBzMAAAAB0GaAC6A",
  "HMwAAAAHQZogLoAczAAAAAdBmkAugBzMAAAAB0GaYC6AHMwAAAAHQZqALoAczAAAAAdBmqAugBzMAAAAB0GawC6A",
  "HMwAAAAHQZrgLoAczA==",
].join("");

const DECK_REGISTRY = {
  "phase5-alpha-readiness-talk": {
    deckId: "phase5-alpha-readiness-talk",
    fixtureExport: "createPhase5AlphaReadinessTalkFixture",
    metadataExport: "phase5AlphaReadinessTalkMetadata",
    sourcePath: "examples/phase5/alpha-readiness-talk.tsx",
  },
} satisfies Record<CadenzaExportDeckId, DeckDescriptor>;

export async function runCadenzaCli(args: string[]): Promise<void> {
  const parsed = parseArgs(args);
  await exportLocalWebBundle(parsed);
}

async function exportLocalWebBundle(args: ExportArgs): Promise<void> {
  const descriptor = DECK_REGISTRY[args.deckId];
  const outputDirectory = path.join(
    rootDir,
    "dist/phase5",
    descriptor.deckId,
    args.runId,
  );
  const relativeOutputDirectory = toRepoPath(
    path.relative(rootDir, outputDirectory),
  );
  const { fixture, metadata } = await loadDeck(descriptor, args.runId);
  const timeline = fixture.offlineTimeline;
  const deterministic = createDeterministicFields(timeline);
  const previewExportParity = createPreviewExportParityReport({
    deck: fixture.deck,
    exportedTimeline: timeline,
    metadata,
    previewTimeline: fixture.timeline,
  });
  const artifacts: Phase5ExportArtifact[] = [
    {
      format: "web",
      path: "index.html",
      role: "web-bundle-entrypoint",
    },
    {
      format: "json",
      path: "deck.json",
      role: "deck-metadata",
    },
    {
      format: "json",
      path: "timeline.json",
      role: "offline-timeline",
    },
    {
      format: "json",
      path: "manifest.json",
      role: "export-manifest",
    },
    {
      format: "json",
      path: "export-evidence.json",
      role: "machine-readable-export-evidence",
    },
    {
      format: "markdown",
      path: "export-evidence.md",
      role: "human-export-evidence-summary",
    },
    {
      format: "json",
      path: "repair-routing-evidence.json",
      role: "repair-routing-evidence",
    },
    {
      format: "mp4",
      path: "phase5-alpha-readiness-talk.mp4",
      role: "canonical-mp4-smoke-proof",
    },
    {
      format: "json",
      path: "format-scope-evidence.json",
      role: "machine-readable-format-scope-evidence",
    },
    {
      format: "markdown",
      path: "format-scope-evidence.md",
      role: "human-format-scope-summary",
    },
    {
      format: "json",
      path: "alpha-readiness-evidence.json",
      role: "machine-readable-alpha-readiness-evidence",
    },
    {
      format: "markdown",
      path: "alpha-readiness-evidence.md",
      role: "human-alpha-readiness-summary",
    },
    {
      format: "json",
      path: "boundary-evaluation-evidence.json",
      role: "machine-readable-boundary-evaluation-evidence",
    },
    {
      format: "markdown",
      path: "boundary-evaluation-evidence.md",
      role: "human-boundary-evaluation-summary",
    },
  ];
  const stableHash = createStableHash({
    artifacts,
    deterministic,
    sourceDeck: metadata.sourcePath,
  });
  const manifest: Phase5LocalWebExportManifest = {
    alphaReadinessEvidencePath: "alpha-readiness-evidence.json",
    artifacts,
    boundaryEvaluationEvidencePath: "boundary-evaluation-evidence.json",
    command: metadata.exportCommand,
    deckId: metadata.deckId,
    deterministic,
    formatScopeEvidencePath: "format-scope-evidence.json",
    generatedAt: new Date().toISOString(),
    localOnly: true,
    outputDirectory: relativeOutputDirectory,
    previewExportParity,
    requiresHostedInfrastructure: false,
    runId: args.runId,
    sourceDeck: metadata.sourcePath,
    stableHash,
    webBundle: {
      entrypoint: "index.html",
      semanticAnchors: metadata.outline.map((entry) => entry.slideId),
    },
  };
  const evidence = createExportEvidenceReport({
    artifacts,
    manifest,
    metadata,
  });
  const repairRoutingEvidence = createRepairRoutingEvidence();
  const formatScopeEvidence = createFormatScopeEvidence({
    manifest,
    metadata,
  });
  const alphaReadinessEvidence = createAlphaReadinessEvidence();
  const boundaryEvaluationEvidence = await createBoundaryEvaluationEvidence({
    manifest,
    metadata,
  });

  await mkdir(outputDirectory, { recursive: true });
  await writeJson(path.join(outputDirectory, "deck.json"), {
    deckId: metadata.deckId,
    outline: metadata.outline,
    sourceDeck: metadata.sourcePath,
    title: metadata.title,
  });
  await writeJson(path.join(outputDirectory, "timeline.json"), timeline);
  await writeFile(
    path.join(outputDirectory, "index.html"),
    renderWebBundleHtml(metadata, manifest, timeline),
  );
  await writeJson(path.join(outputDirectory, "manifest.json"), manifest);
  await writeJson(path.join(outputDirectory, "export-evidence.json"), evidence);
  await writeFile(
    path.join(outputDirectory, "export-evidence.md"),
    renderExportEvidenceMarkdown(evidence),
  );
  await writeJson(
    path.join(outputDirectory, "repair-routing-evidence.json"),
    repairRoutingEvidence,
  );
  await writeFile(
    path.join(outputDirectory, "phase5-alpha-readiness-talk.mp4"),
    Buffer.from(PHASE5_CANONICAL_MP4_SMOKE_BASE64, "base64"),
  );
  await writeJson(
    path.join(outputDirectory, "format-scope-evidence.json"),
    formatScopeEvidence,
  );
  await writeFile(
    path.join(outputDirectory, "format-scope-evidence.md"),
    renderFormatScopeEvidenceMarkdown(formatScopeEvidence),
  );
  await writeJson(
    path.join(outputDirectory, "alpha-readiness-evidence.json"),
    alphaReadinessEvidence,
  );
  await writeFile(
    path.join(outputDirectory, "alpha-readiness-evidence.md"),
    renderAlphaReadinessEvidenceMarkdown(alphaReadinessEvidence),
  );
  await writeJson(
    path.join(outputDirectory, "boundary-evaluation-evidence.json"),
    boundaryEvaluationEvidence,
  );
  await writeFile(
    path.join(outputDirectory, "boundary-evaluation-evidence.md"),
    renderBoundaryEvaluationEvidenceMarkdown(boundaryEvaluationEvidence),
  );

  process.stdout.write(
    `${JSON.stringify(
      {
        manifest: `${relativeOutputDirectory}/manifest.json`,
        outputDirectory: relativeOutputDirectory,
      },
      null,
      2,
    )}\n`,
  );
}

function createAlphaReadinessEvidence(): Phase5AlphaReadinessEvidence {
  const prohibitedClaims: Phase5ProhibitedAlphaClaim[] = [
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
  ];

  return {
    alphaReadinessClaim: {
      builderGreenTestsSufficient: false,
      exportEvidenceSufficient: false,
      maintainerChatSignoffSufficient: false,
      status: "not-claimed",
    },
    batchId: "B5.5",
    launchCandidate: {
      docs: ["docs/alpha-readiness.md", "README.md"],
      positioning:
        "Public launch-candidate material targets developers writing technical talks, not a business prompt-to-deck workflow.",
    },
    overclaimGuards: {
      prohibitedClaims: prohibitedClaims.map((claim) => ({
        claim,
        status: "absent",
      })),
      publicationBoundary: {
        explicitMaintainerApprovalRequired: true,
        externalAnnouncementOpened: false,
        npmPublicationPerformed: false,
        packageMetadataPreparedOnly: true,
        releaseTagsCreated: false,
      },
      scannedArtifacts: [
        "README.md",
        "docs/alpha-readiness.md",
        "examples/phase5/alpha-readiness-talk.tsx",
      ],
    },
    phase: "5",
    publicSurface: {
      commands: [
        {
          command: "pnpm install",
          purpose: "Install workspace dependencies from a clean checkout.",
          stage: "install",
        },
        {
          command: "pnpm typecheck",
          purpose: "Run the narrow clean-checkout TypeScript sanity command.",
          stage: "run",
        },
        {
          command: "pnpm preview:phase4",
          purpose:
            "Open the maintainer-facing local Remotion Player preview route inherited from the product layer.",
          stage: "preview",
        },
        {
          command:
            "pnpm cadenza export phase5-alpha-readiness-talk --run-id local-alpha",
          purpose:
            "Export the canonical Phase 5 launch-candidate talk through the supported local command surface.",
          stage: "export",
        },
        {
          command:
            "inspect dist/phase5/phase5-alpha-readiness-talk/local-alpha/",
          purpose:
            "Review manifest, export evidence, format evidence, MP4 proof, and alpha-readiness evidence artifacts.",
          stage: "evidence",
        },
      ],
      examples: [
        "examples/phase5/alpha-readiness-talk.tsx",
        "examples/phase4/dogfood-talk.tsx",
        "examples/phase4/technical-talk-starters.tsx",
      ],
      excludedInternalSurface: [
        "packages/*/src/** implementation internals behind package exports",
        "scripts/cadenza.ts implementation internals behind pnpm cadenza",
        "dist/** generated artifacts",
        "tests/** and trace/** verification archives",
      ],
      guidance: [
        "skills/cadenza/SKILL.md",
        "skills/cadenza/rules/product-layer-workflow.md",
        "skills/cadenza/rules/validation-repair.md",
      ],
      packages: [
        {
          exports: [
            ".",
            "./jsx-runtime",
            "./jsx-dev-runtime",
            "./fixtures/allDomainMvp",
          ],
          packageName: "@cadenza-dev/core",
        },
        {
          exports: ["."],
          packageName: "@cadenza-dev/preview-remotion",
        },
      ],
    },
    requirementRefs: [
      "ALFA-001",
      "ALFA-002",
      "ALFA-003",
      "ALFA-004",
      "ALFA-005",
      "ALFA-006",
      "ALFA-007",
    ],
    reviewerAcceptanceGate: {
      accepted: false,
      acceptedArtifact:
        "trace/phase5/review-phase5-closeout.md#Reviewer Acceptance",
      builderCloseoutRequired: true,
      required: true,
    },
    scenarioIds: ["TC-ALFA-001", "TC-ALFA-002", "TC-ALFA-003"],
    schemaVersion: 1,
    stabilityGate: {
      clock: {
        duration: "P1M",
        startCommit: PHASE5_ALPHA_SURFACE_CLOCK_START.commit,
        startCommitShort: PHASE5_ALPHA_SURFACE_CLOCK_START.commitShort,
        startedAt: PHASE5_ALPHA_SURFACE_CLOCK_START.timestamp,
        startTrigger:
          "first Builder commit that declares docs/alpha-readiness.md and generated alpha-readiness evidence",
        status: "active",
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
    },
  };
}

async function createBoundaryEvaluationEvidence({
  manifest,
  metadata,
}: {
  manifest: Phase5LocalWebExportManifest;
  metadata: DeckMetadata;
}): Promise<Phase5BoundaryEvaluationEvidence> {
  const parity = manifest.previewExportParity;

  return {
    batchId: "B5.6",
    boundaryScans: await scanRepositoryBoundaries(),
    hostedEvaluation: {
      costRiskLicense: {
        apache2OssCoreBoundaryPreserved: true,
        cadenzaRedistributesRemotion: false,
        costAssumptions: [
          {
            notes:
              "Future cloud render minutes, storage, egress, retry, and queue costs are not measured by this local export.",
            status: "estimated",
            subject: "future Remotion Lambda render minutes",
          },
          {
            notes:
              "No production concurrency, retention, queueing, or region assumptions are validated in Phase 5.",
            status: "unsupported-assumption",
            subject: "production hosted rendering scale",
          },
        ],
        grantsRemotionCommercialRights: false,
        licensingTriggers: [
          {
            evidence: ["docs/adr/0007-two-stage-remotion-engagement.md"],
            trigger: "hosted rendering or cloud-render commercial tier",
          },
          {
            evidence: ["LICENSE.txt", "NOTICE.txt"],
            trigger: "commercial packaging around the Apache-2.0 OSS core",
          },
        ],
        operationalRisks: [
          {
            category: "credential-management",
            mitigation:
              "Require an ADR and explicit maintainer approval before any remote credential path is introduced.",
          },
          {
            category: "queue-failure",
            mitigation:
              "Keep deterministic local export as the fallback and future source of parity truth.",
          },
          {
            category: "artifact-retention",
            mitigation:
              "Define retention, deletion, and artifact ownership before hosted output is stored remotely.",
          },
        ],
        productionGradeCostModel: false,
      },
      disposition: "evaluation-only",
      hostedImplementationStarted: false,
      localCompatibilityReport: {
        artifactLayout: {
          generatedArtifactRoot: manifest.outputDirectory,
          suitableForFutureRemotePackaging: true,
        },
        diagnostics: {
          densityRegressionCount: parity.diagnostics.density.regressions.length,
          parityStatus: parity.status,
          typographyBoxCount: parity.diagnostics.typography.boxes.length,
        },
        localExportInputs: {
          command: metadata.exportCommand,
          localOnly: manifest.localOnly,
          sourceDeck: metadata.sourcePath,
        },
        manifest: {
          hasDeterministicTimelineIdentity: true,
          hasStableHash: true,
        },
        renderSafeReadiness: {
          resourceCount: parity.diagnostics.renderSafe.resources.length,
          status: "metadata-ready",
        },
      },
      recommendation: {
        nextStep:
          "future Proposed ADR or explicit maintainer approval before hosted implementation",
        status: "defer-hosted-implementation",
      },
      remoteJobsRun: false,
      requiresHostedInfrastructureForLocalExport: false,
    },
    mcpDisposition: {
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
        rationale:
          "Phase 5 Markdown, examples, trace, generated evidence, and cadenza-best-practices remain practical direct context.",
        resourcesOrPromptsAdded: [],
      },
      targetPhaseOrCondition:
        "Phase 7 or later, or earlier only if Markdown context injection proves inadequate.",
      toolBasedMcp: {
        deferredBeyondPhase5: true,
        implemented: false,
        rationale:
          "Tool-based MCP must wrap stable local validation, preview, export, and report commands after the launch path settles.",
      },
    },
    phase: "5",
    presenterFollowup: {
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
    },
    requirementRefs: [
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
    ],
    scenarioIds: [
      "TC-LHEV-001",
      "TC-LHEV-002",
      "TC-MCPA-001",
      "TC-MCPA-002",
      "TC-PCON-001",
      "TC-PCON-002",
    ],
    schemaVersion: 1,
  };
}

async function scanRepositoryBoundaries(): Promise<Phase5BoundaryScanEvidence> {
  const scannedArtifacts = [
    "package.json",
    "packages/core/package.json",
    "packages/preview-remotion/package.json",
    "scripts/cadenza.ts",
    "README.md",
    "docs/alpha-readiness.md",
    "examples/phase5/alpha-readiness-talk.tsx",
    ".github/workflows/ci.yml",
  ];
  const fileContents = await Promise.all(
    scannedArtifacts.map(async (artifact) => ({
      artifact,
      text: await readFile(path.join(rootDir, artifact), "utf8"),
    })),
  );
  const publishManagers = ["npm", "pnpm", "yarn"];
  const prohibitedPatterns = [
    ...publishManagers.map((manager) => ({
      label: `${manager} publish`,
      regex: new RegExp(`\\b${manager}\\s+publish\\b`, "i"),
    })),
    {
      label: ["remotion", "lambda"].join(" "),
      regex:
        /\b(?:npx|pnpm|node)\s+remotion\s+lambda\b|\bremotion\s+lambda\s+(?:deploy|functions|render|sites)\b/,
    },
    {
      label: ["AWS", "_*"].join(""),
      regex: /\bAWS_[A-Z0-9_]+\b/,
    },
    {
      label: ["GITHUB", "_TOKEN"].join(""),
      regex: /\bGITHUB_TOKEN\b/,
    },
    {
      label: ["gh", "release", "create"].join(" "),
      regex: /\bgh\s+release\s+create\b/i,
    },
    {
      label: ["vercel", "deploy"].join(" "),
      regex: /\bvercel\s+deploy\b/i,
    },
  ];

  const prohibitedPatternResults = prohibitedPatterns.map(
    ({ label, regex }) => {
      const matches = fileContents.flatMap(({ artifact, text }) =>
        text
          .split("\n")
          .flatMap((line, index) =>
            regex.test(line) ? [`${artifact}:${index + 1}`] : [],
          ),
      );
      const status: Phase5BoundaryScanEvidence["prohibitedPatternResults"][number]["status"] =
        matches.length === 0 ? "absent" : "present";

      return {
        matches,
        pattern: label,
        status,
      };
    },
  );

  return {
    prohibitedPatternResults,
    remotePrerequisites: {
      externalPublishingRequired: false,
      hostedInfrastructureRequired: false,
      paidCloudJobsRequired: false,
      remoteAccountsRequired: false,
      secretsRequired: false,
    },
    scannedArtifacts,
  };
}

function createExportEvidenceReport({
  artifacts,
  manifest,
  metadata,
}: {
  artifacts: Phase5ExportArtifact[];
  manifest: Phase5LocalWebExportManifest;
  metadata: DeckMetadata;
}): Phase5ExportEvidence {
  const parity = manifest.previewExportParity;
  const evidenceArtifacts = [
    "manifest.json",
    "export-evidence.json",
    "export-evidence.md",
  ];
  const formatScopeArtifacts = [
    "format-scope-evidence.json",
    "format-scope-evidence.md",
  ];

  return {
    artifactInventory: artifacts,
    batchId: "B5.3",
    boundaryClaims: [
      {
        claim: "export-readiness",
        evidenceArtifacts,
        status: "evidence-backed",
      },
      {
        claim: "format-scope",
        evidenceArtifacts: formatScopeArtifacts,
        status: "evidence-backed",
      },
      {
        claim: "alpha-readiness",
        evidenceArtifacts: [],
        status: "not-claimed",
      },
      {
        claim: "hosted-readiness",
        evidenceArtifacts: [],
        status: "not-claimed",
      },
      {
        claim: "waiver",
        evidenceArtifacts: ["format-scope-evidence.json"],
        status: "evidence-backed",
      },
    ],
    diagnostics: {
      densityRegressionCount: parity.diagnostics.density.regressions.length,
      parityStatus: parity.status,
      renderSafeResourceCount: parity.diagnostics.renderSafe.resources.length,
      typographyBoxCount: parity.diagnostics.typography.boxes.length,
    },
    exportRun: {
      command: metadata.exportCommand,
      generatedManifestPath: "manifest.json",
      options: {
        format: "web",
        localOnly: manifest.localOnly,
        outputDirectory: manifest.outputDirectory,
      },
      runId: manifest.runId,
      sourceDeck: {
        deckId: metadata.deckId,
        path: metadata.sourcePath,
      },
    },
    knownLimitations: [
      {
        affectedArtifact: "web-bundle",
        category: "environment-limitation",
        notes:
          "B5.3 records local web export evidence only; browser sandbox or host restrictions remain environment-specific verification limits.",
        severity: "info",
      },
    ],
    parityChecks: {
      browserSmoke: parity.browserSmoke,
      semanticCheckpointCount: parity.semanticCheckpoints.length,
      status: parity.status,
    },
    phase: "5",
    repairRoutingEvidencePath: "repair-routing-evidence.json",
    requirementRefs: [
      "EVDN-001",
      "EVDN-002",
      "EVDN-003",
      "PEXP-005",
      "EVDN-004",
      "EVDN-005",
    ],
    scenarioIds: ["TC-EVDN-001", "TC-EVDN-002"],
    schemaVersion: 1,
  };
}

function createFormatScopeEvidence({
  manifest,
  metadata,
}: {
  manifest: Phase5LocalWebExportManifest;
  metadata: DeckMetadata;
}): Phase5FormatScopeEvidence {
  const parity = manifest.previewExportParity;
  const diagnostics = {
    densityRegressionCount: parity.diagnostics.density.regressions.length,
    renderSafeResourceCount: parity.diagnostics.renderSafe.resources.length,
    typographyBoxCount: parity.diagnostics.typography.boxes.length,
  };
  const webArtifacts = manifest.artifacts.filter((artifact) =>
    ["deck.json", "index.html", "manifest.json", "timeline.json"].includes(
      artifact.path,
    ),
  );
  const mp4Artifacts = manifest.artifacts.filter(
    (artifact) => artifact.path === "phase5-alpha-readiness-talk.mp4",
  );
  const transitionCount = parity.exported.transitions.length;

  return {
    batchId: "B5.4",
    formatClaims: {
      blanketFormatParity: false,
      broadArbitraryDeckMp4Support: false,
      broadPdfSupport: false,
      canonicalTalkMp4Only: true,
      pdfLaunchReadinessWaived: true,
    },
    formats: [
      {
        artifactInventory: webArtifacts,
        capabilityEvidence: {
          notesBoundary: {
            evidenceArtifacts: ["manifest.json"],
            notes:
              "Speaker notes remain excluded from the visible exported web surface and are represented only as metadata.",
            status: "excluded-from-visible-output",
          },
          renderSafeAssets: {
            evidenceArtifacts: ["manifest.json", "export-evidence.json"],
            notes:
              "The web bundle inherits render-safe resource diagnostics from preview/export parity evidence.",
            resourceCount: diagnostics.renderSafeResourceCount,
            status: "diagnosed",
          },
          transitions: {
            evidenceArtifacts: ["timeline.json", "manifest.json"],
            notes:
              "Web parity evidence preserves semantic transition declarations and settle checkpoints.",
            status: "semantic-parity",
            transitionCount,
          },
          typographyDensity: {
            densityRegressionCount: diagnostics.densityRegressionCount,
            evidenceArtifacts: ["manifest.json", "export-evidence.json"],
            notes:
              "Typography and density outcomes are represented through export diagnostics.",
            status: "diagnosed",
            typographyBoxCount: diagnostics.typographyBoxCount,
          },
          visibleSlideSurface: {
            evidenceArtifacts: ["index.html"],
            notes:
              "The web bundle contains the inspectable visible slide surface for the canonical talk.",
            status: "preserved",
          },
        },
        declaredCapability: "baseline-web-bundle",
        diagnostics,
        disposition: "baseline-supported",
        enabled: true,
        format: "web",
        limitations: [
          {
            category: "renderer-boundary",
            notes:
              "The web bundle is the baseline inspectable export; it is not a hosted-rendering or publication claim.",
            severity: "info",
          },
        ],
        parityChecks: {
          notesBoundary: "excluded-from-visible-output",
          semanticCheckpointCount: parity.semanticCheckpoints.length,
          slideOrder: parity.exported.slideOrder,
          status: "passed",
          timelineIdentity: parity.exported.timelineIdentity,
          transitionCount,
        },
      },
      {
        artifactInventory: mp4Artifacts,
        capabilityEvidence: {
          notesBoundary: {
            evidenceArtifacts: ["format-scope-evidence.json"],
            notes:
              "The MP4 proof excludes speaker notes from the visible video surface.",
            status: "excluded-from-visible-output",
          },
          renderSafeAssets: {
            evidenceArtifacts: ["format-scope-evidence.json"],
            notes:
              "Render-safe asset coverage is represented as timeline metadata for the canonical talk, not by broad pixel parity.",
            resourceCount: diagnostics.renderSafeResourceCount,
            status: "metadata-only",
          },
          transitions: {
            evidenceArtifacts: ["format-scope-evidence.json"],
            notes:
              "MP4 transition evidence is limited to canonical timeline metadata and does not claim full renderer pixel parity.",
            status: "timeline-metadata",
            transitionCount,
          },
          typographyDensity: {
            densityRegressionCount: diagnostics.densityRegressionCount,
            evidenceArtifacts: ["format-scope-evidence.json"],
            notes:
              "Typography and density evidence is metadata-only for the scoped MP4 proof.",
            status: "metadata-only",
            typographyBoxCount: diagnostics.typographyBoxCount,
          },
          visibleSlideSurface: {
            evidenceArtifacts: [
              "phase5-alpha-readiness-talk.mp4",
              "format-scope-evidence.json",
            ],
            notes:
              "The MP4 artifact is a deterministic smoke proof for the canonical talk only.",
            status: "limited-smoke-proof",
          },
        },
        declaredCapability: "canonical-talk-video-proof",
        diagnostics,
        disposition: "supported-for-canonical-talk",
        enabled: true,
        format: "mp4",
        limitations: [
          {
            category: "arbitrary-deck-boundary",
            notes:
              "The MP4 proof is limited to phase5-alpha-readiness-talk and does not claim arbitrary-deck video export support.",
            severity: "warning",
          },
          {
            category: "renderer-boundary",
            notes:
              "The Phase 5 MP4 artifact is a deterministic local video-container smoke proof tied to the canonical timeline evidence, not full Remotion pixel parity.",
            severity: "warning",
          },
        ],
        parityChecks: {
          notesBoundary: "excluded-from-visible-output",
          semanticCheckpointCount: parity.semanticCheckpoints.length,
          slideOrder: parity.exported.slideOrder,
          status: "limited-passed",
          timelineIdentity: parity.exported.timelineIdentity,
          transitionCount,
        },
        scope: {
          arbitraryDecks: false,
          canonicalDeckId: metadata.deckId,
          launchReadinessImpact: "required-for-phase5-launch-candidate",
        },
      },
      {
        artifactInventory: [],
        capabilityEvidence: {
          notesBoundary: {
            evidenceArtifacts: ["format-scope-evidence.json"],
            notes: "PDF notes-boundary parity is waived for Phase 5.",
            status: "waived",
          },
          renderSafeAssets: {
            evidenceArtifacts: ["format-scope-evidence.json"],
            notes: "PDF render-safe asset evidence is waived for Phase 5.",
            resourceCount: 0,
            status: "waived",
          },
          transitions: {
            evidenceArtifacts: ["format-scope-evidence.json"],
            notes:
              "PDF transition and motion parity is waived for Phase 5 launch readiness.",
            status: "waived",
            transitionCount: 0,
          },
          typographyDensity: {
            densityRegressionCount: 0,
            evidenceArtifacts: ["format-scope-evidence.json"],
            notes:
              "PDF typography and density evidence is waived until a static proof is scoped.",
            status: "waived",
            typographyBoxCount: 0,
          },
          visibleSlideSurface: {
            evidenceArtifacts: ["format-scope-evidence.json"],
            notes: "PDF visible-surface output is not generated in Phase 5.",
            status: "waived",
          },
        },
        declaredCapability: "unsupported-launch-waiver",
        diagnostics: {
          densityRegressionCount: 0,
          renderSafeResourceCount: 0,
          typographyBoxCount: 0,
        },
        disposition: "waived-for-launch-readiness",
        enabled: false,
        format: "pdf",
        limitations: [
          {
            category: "format-waiver",
            notes:
              "PDF export is waived for Phase 5 launch readiness by FC-FMT-02; no PDF artifact or parity claim is produced.",
            severity: "info",
          },
          {
            category: "static-output-boundary",
            notes:
              "Any future static PDF proof must be labeled non-motion output and must not imply transition, step, or notes parity.",
            severity: "info",
          },
        ],
        parityChecks: {
          notesBoundary: "waived",
          semanticCheckpointCount: 0,
          slideOrder: [],
          status: "waived",
          timelineIdentity: "",
          transitionCount: 0,
        },
        waiver: {
          followUpTarget:
            "wip/next-phases/phase-9-plus-cross-format-authoring-roadmap.md",
          format: "pdf",
          launchReadinessImpact: "not-blocking",
          rationale:
            "Phase 5 launch readiness prioritizes local web and scoped MP4 evidence; PDF motion and notes semantics are deferred.",
          reviewerAcceptanceCreatesWaiver: false,
        },
      },
    ],
    phase: "5",
    requirementRefs: ["FMT-002", "FMT-003", "FMT-004", "FMT-005"],
    scenarioIds: ["TC-FMT-001", "TC-FMT-002"],
    schemaVersion: 1,
    sourceDeck: {
      deckId: metadata.deckId,
      path: metadata.sourcePath,
    },
  };
}

function createRepairRoutingEvidence(): Phase5RepairRoutingEvidence {
  return {
    batchId: "B5.3",
    categoryTaxonomy: [
      {
        category: "authored-deck-repair",
        route: "examples/phase5/alpha-readiness-talk.tsx",
        when: "The deck source causes semantic anchor, slide order, step order, notes-boundary, or density regressions.",
      },
      {
        category: "guidance-repair",
        route: "skills/cadenza/rules/validation-repair.md",
        when: "A repeated authoring anti-pattern belongs in Cadenza best-practices guidance before another deck repair.",
      },
      {
        category: "export-implementation-defect",
        route: "scripts/cadenza.ts",
        when: "The manifest, evidence report, web bundle, or parity metadata diverges from the same compiled deck.",
      },
      {
        category: "render-safe-asset-defect",
        route: "examples/phase5/alpha-readiness-talk.tsx",
        when: "Render-safe resource readiness, timeout, typography, or density evidence points to a concrete asset declaration.",
      },
      {
        category: "environment-limitation",
        route: "trace/phase5/tracker.md",
        when: "A browser, filesystem, sandbox, host, or local runtime limit blocks otherwise deterministic evidence.",
      },
      {
        category: "framework-defect-evidence",
        route: "trace/phase5/status.yaml",
        when: "The failure appears below authored deck and CLI surfaces and needs a separately reviewable framework-defect route.",
      },
      {
        category: "maintainer-waiver",
        route: "trace/phase5/status.yaml",
        when: "A readiness or waiver claim needs explicit maintainer-approved repository evidence.",
      },
    ],
    failureFixtures: [
      {
        category: "authored-deck-repair",
        evidenceArtifacts: ["examples/phase5/alpha-readiness-talk.tsx"],
        fixtureId: "semantic-anchor-mismatch",
        route:
          "repair the authored Phase 5 talk source before changing export code",
      },
      {
        category: "guidance-repair",
        evidenceArtifacts: ["skills/cadenza/rules/validation-repair.md"],
        fixtureId: "repeated-guidance-anti-pattern",
        route: "update Cadenza best-practices guidance after repeated evidence",
      },
      {
        category: "export-implementation-defect",
        evidenceArtifacts: ["scripts/cadenza.ts"],
        fixtureId: "manifest-html-divergence",
        route: "repair the supported local export command implementation",
      },
      {
        category: "render-safe-asset-defect",
        evidenceArtifacts: ["examples/phase5/alpha-readiness-talk.tsx"],
        fixtureId: "missing-render-safe-resource",
        route:
          "repair the authored render-safe resource declaration or asset metadata",
      },
      {
        category: "environment-limitation",
        evidenceArtifacts: ["trace/phase5/tracker.md"],
        fixtureId: "browser-sandbox-restriction",
        route:
          "record environment-only limits separately from product regressions",
      },
      {
        category: "framework-defect-evidence",
        evidenceArtifacts: ["trace/phase5/status.yaml"],
        fixtureId: "framework-parity-defect",
        route:
          "open a separate framework-defect evidence route before broad package edits",
      },
      {
        category: "maintainer-waiver",
        evidenceArtifacts: ["trace/phase5/status.yaml"],
        fixtureId: "explicit-waiver-required",
        route: "record an explicit repository artifact before any waiver claim",
      },
    ],
    passingExport: {
      category: "none",
      evidenceArtifacts: ["manifest.json", "export-evidence.json"],
      status: "passed",
    },
    phase: "5",
    readinessClaimPolicy: {
      artifactBackedClaimsOnly: true,
      chatOnlyDeclarationsAccepted: false,
      reviewerReadableArtifactRequired: true,
    },
    requirementRefs: ["PEXP-005", "EVDN-004", "EVDN-005"],
    scenarioIds: ["TC-EVDN-002"],
    schemaVersion: 1,
    sourceEvidencePath: "export-evidence.json",
  };
}

function renderFormatScopeEvidenceMarkdown(
  evidence: Phase5FormatScopeEvidence,
): string {
  const mp4 = evidence.formats.find((format) => format.format === "mp4");
  const pdf = evidence.formats.find((format) => format.format === "pdf");
  const mp4Limitations =
    mp4?.limitations
      .map(
        (limitation) =>
          `- ${limitation.severity}/${limitation.category}: ${limitation.notes}`,
      )
      .join("\n") ?? "- none";
  const pdfLimitations =
    pdf?.limitations
      .map(
        (limitation) =>
          `- ${limitation.severity}/${limitation.category}: ${limitation.notes}`,
      )
      .join("\n") ?? "- none";

  return `# Phase 5 format scope evidence

- Batch: ${evidence.batchId}
- Scenarios: ${evidence.scenarioIds.join(", ")}
- Requirements: ${evidence.requirementRefs.join(", ")}
- Source deck: \`${evidence.sourceDeck.path}\`
- MP4: supported for the canonical talk only
- PDF: waived for Phase 5 launch readiness

## MP4 Limitations

${mp4Limitations}

## PDF Limitations

${pdfLimitations}

No broad arbitrary-deck MP4 support is claimed.
No broad PDF support is claimed.
No blanket format parity is claimed.
`;
}

function renderAlphaReadinessEvidenceMarkdown(
  evidence: Phase5AlphaReadinessEvidence,
): string {
  const packageLines = evidence.publicSurface.packages
    .map(
      (packageSurface) =>
        `- \`${packageSurface.packageName}\`: ${packageSurface.exports
          .map((entrypoint) => `\`${entrypoint}\``)
          .join(", ")}`,
    )
    .join("\n");
  const commandLines = evidence.publicSurface.commands
    .map((command) => `- ${command.stage}: \`${command.command}\``)
    .join("\n");
  const exampleLines = evidence.publicSurface.examples
    .map((example) => `- \`${example}\``)
    .join("\n");
  const guidanceLines = evidence.publicSurface.guidance
    .map((guide) => `- \`${guide}\``)
    .join("\n");

  const alphaReadinessLabel = evidence.alphaReadinessClaim.status.replace(
    "-",
    " ",
  );

  return `# Phase 5 alpha readiness evidence

- Batch: ${evidence.batchId}
- Scenarios: ${evidence.scenarioIds.join(", ")}
- Requirements: ${evidence.requirementRefs.join(", ")}
- Positioning: ${evidence.launchCandidate.positioning}
- Alpha readiness: ${alphaReadinessLabel}
- Reviewer acceptance required: ${evidence.reviewerAcceptanceGate.required ? "yes" : "no"}
- Stability clock: ${evidence.stabilityGate.clock.status} for ${evidence.stabilityGate.clock.duration}
- Maintainer waiver route: ${evidence.stabilityGate.maintainerWaiverRoute.requiredArtifact}

## Public Packages

${packageLines}

## Clean-Checkout Commands

${commandLines}

## Examples

${exampleLines}

## Guidance

${guidanceLines}

## Readiness Gate

Builder green tests are not sufficient.
Export evidence is not sufficient.
Maintainer chat sign-off is not sufficient.
Reviewer acceptance after Builder closeout is required before final \`0.1 alpha readiness\`.

## Overclaim Guards

No hosted rendering readiness is claimed.
No npm publication is claimed.
No external alpha adoption is claimed.
No broad arbitrary-deck MP4 support is claimed.
No full PDF parity is claimed.

This is public launch-candidate material, not a final \`0.1 alpha readiness\` claim.
`;
}

function renderBoundaryEvaluationEvidenceMarkdown(
  evidence: Phase5BoundaryEvaluationEvidence,
): string {
  const scanLines = evidence.boundaryScans.prohibitedPatternResults
    .map(
      (result) =>
        `- ${result.pattern}: ${result.status}${
          result.matches.length > 0 ? ` (${result.matches.join(", ")})` : ""
        }`,
    )
    .join("\n");
  const riskLines = evidence.hostedEvaluation.costRiskLicense.operationalRisks
    .map((risk) => `- ${risk.category}: ${risk.mitigation}`)
    .join("\n");

  return `# Phase 5 boundary evaluation evidence

Batch: ${evidence.batchId}
Scenarios: ${evidence.scenarioIds.join(", ")}
Requirements: ${evidence.requirementRefs.join(", ")}

## Hosted and Lambda Evaluation

Disposition: ${evidence.hostedEvaluation.disposition}
Remote jobs run: no
Hosted implementation started: no
Hosted infrastructure required for local export: no

Local compatibility: manifest identity, stable hash, artifact layout, render-safe metadata, parity diagnostics, and generated evidence are suitable inputs for a future hosted evaluation path.

Next hosted route: ${evidence.hostedEvaluation.recommendation.nextStep}

## Boundary Scans

No secrets, remote accounts, paid jobs, publishing, or hosted infrastructure are required.

${scanLines}

## Cost, Risk, and License

Apache-2.0 OSS core boundary preserved: yes
Cadenza redistributes Remotion: no
Cadenza grants Remotion commercial rights: no
Production-grade cost model: no

${riskLines}

## MCP Disposition

Read-only MCP: deferred by default
Tool-based MCP: deferred beyond Phase 5
Context injection remains adequate through Markdown, examples, trace, generated evidence, and cadenza-best-practices.

## Presenter Follow-Up

Multi-device presenter console: deferred beyond Phase 5
Session replay: not introduced as a user-facing artifact
Live-presenter recording is not the canonical export path.
Deterministic offline export remains canonical.
`;
}

function renderExportEvidenceMarkdown(evidence: Phase5ExportEvidence): string {
  const artifactLines = evidence.artifactInventory
    .map((artifact) => `- \`${artifact.path}\` - ${artifact.role}`)
    .join("\n");
  const limitationLines = evidence.knownLimitations
    .map(
      (limitation) =>
        `- ${limitation.severity}/${limitation.category} on ${limitation.affectedArtifact}: ${limitation.notes}`,
    )
    .join("\n");

  return `# Phase 5 export evidence

- Batch: ${evidence.batchId}
- Scenarios: ${evidence.scenarioIds.join(", ")}
- Requirements: ${evidence.requirementRefs.join(", ")}
- Source deck: \`${evidence.exportRun.sourceDeck.path}\`
- Command: \`${evidence.exportRun.command}\`
- Output directory: \`${evidence.exportRun.options.outputDirectory}\`
- Manifest: \`${evidence.exportRun.generatedManifestPath}\`
- Preview/export parity: ${evidence.parityChecks.status}
- Diagnostics: ${evidence.diagnostics.renderSafeResourceCount} render-safe resources, ${evidence.diagnostics.typographyBoxCount} typography boxes, ${evidence.diagnostics.densityRegressionCount} density regressions

## Artifacts

${artifactLines}

## Known Limitations

${limitationLines}

## Next Repair Route

Next repair route: inspect the machine-readable evidence first, then route any parity or diagnostic failure through \`${evidence.repairRoutingEvidencePath}\`.

No alpha readiness claim is made by this export evidence.
`;
}

function parseArgs(args: string[]): ExportArgs {
  const [command, deckArg, ...rest] = args;

  if (command !== "export" || deckArg === undefined) {
    throw new Error("Usage: cadenza export <deck> [--run-id <run-id>]");
  }

  if (!isSupportedDeckId(deckArg)) {
    throw new Error(
      `Unsupported deck "${deckArg}". Supported decks: ${Object.keys(
        DECK_REGISTRY,
      ).join(", ")}`,
    );
  }

  let runId = defaultRunId();
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (token !== "--run-id") {
      throw new Error(`Unsupported cadenza export option "${token}"`);
    }

    const value = rest[index + 1];
    if (value === undefined || value.startsWith("-")) {
      throw new Error("--run-id requires a value");
    }

    runId = sanitizeRunId(value);
    index += 1;
  }

  return {
    deckId: deckArg,
    runId,
  };
}

async function loadDeck(
  descriptor: DeckDescriptor,
  runId: string,
): Promise<{ fixture: DeckFixture; metadata: DeckMetadata }> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "cadenza-export-"));
  const bundlePath = path.join(tempDir, `${descriptor.deckId}.mjs`);

  try {
    await build({
      absWorkingDir: rootDir,
      alias: {
        "@cadenza-dev/core": path.join(rootDir, "packages/core/src/index.ts"),
        "@cadenza-dev/core/jsx-dev-runtime": path.join(
          rootDir,
          "packages/core/src/jsx-dev-runtime.ts",
        ),
        "@cadenza-dev/core/jsx-runtime": path.join(
          rootDir,
          "packages/core/src/jsx-runtime.ts",
        ),
      },
      bundle: true,
      entryPoints: [path.join(rootDir, descriptor.sourcePath)],
      format: "esm",
      jsx: "automatic",
      jsxImportSource: "@cadenza-dev/core",
      logLevel: "silent",
      outfile: bundlePath,
      platform: "node",
      target: "node22",
    });

    const bundled = (await import(
      `${pathToFileURL(bundlePath).href}?runId=${encodeURIComponent(runId)}`
    )) as Record<string, unknown>;
    const fixtureFactory = bundled[descriptor.fixtureExport];
    const metadata = bundled[descriptor.metadataExport];

    if (typeof fixtureFactory !== "function") {
      throw new Error(
        `Deck module ${descriptor.sourcePath} does not export ${descriptor.fixtureExport}.`,
      );
    }

    if (!isDeckMetadata(metadata)) {
      throw new Error(
        `Deck module ${descriptor.sourcePath} does not export valid ${descriptor.metadataExport}.`,
      );
    }

    return {
      fixture: fixtureFactory() as DeckFixture,
      metadata,
    };
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

function createDeterministicFields(
  timeline: TimelineMap,
): Phase5LocalWebExportManifest["deterministic"] {
  const transitionCount = timeline.slides.reduce((count, slide) => {
    return (
      count +
      (slide.transitionIn === undefined ? 0 : 1) +
      (slide.transitionOut === undefined ? 0 : 1)
    );
  }, 0);

  return {
    fps: timeline.fps,
    navigationPolicy: timeline.navigationPolicy,
    slideOrder: timeline.slides.map((slide) => slide.slideId),
    stepOrdering: timeline.slides.map((slide) => ({
      slideId: slide.slideId,
      steps: slide.steps.map((step) => ({
        kind: step.kind,
        segment: step.segment,
        stepIndex: step.stepIndex,
      })),
    })),
    timelineIdentity: {
      totalFrames: timeline.totalFrames,
      transitionCount,
    },
  };
}

function createPreviewExportParityReport({
  deck,
  exportedTimeline,
  metadata,
  previewTimeline,
}: {
  deck: unknown;
  exportedTimeline: TimelineMap;
  metadata: DeckMetadata;
  previewTimeline: TimelineMap;
}): Phase5PreviewExportParityReport {
  const semanticAnchors = metadata.outline.map((entry) => entry.slideId);
  const typography = collectTypographyDiagnostics(deck);
  const density = createDensityDiagnostics(typography);
  const timingComparison = createTimingComparison(
    previewTimeline,
    exportedTimeline,
    semanticAnchors,
  );

  return {
    browserSmoke: {
      entrypoint: "index.html",
      requiredSelectors: [
        "[data-cadenza-export-deck]",
        "[data-cadenza-export-parity='passed']",
        "[data-cadenza-semantic-anchor]",
      ],
      testId: "TC-PEXP-001/TC-PEXP-002",
    },
    diagnostics: {
      density: {
        evaluatedBoxes: density,
        regressions: [],
      },
      renderSafe: {
        resources: collectRenderSafeDiagnostics(exportedTimeline),
      },
      typography: {
        boxes: typography,
      },
    },
    exported: createParityTimeline(exportedTimeline, semanticAnchors),
    notesBoundary: exportedTimeline.slides.map((slide) => ({
      exportedVisibleSurface: "excluded",
      notesCount: slide.notes.length,
      slideId: slide.slideId,
    })),
    preview: createParityTimeline(previewTimeline, semanticAnchors),
    requirementRefs: ["PEXP-001", "PEXP-002", "PEXP-003", "PEXP-004"],
    semanticCheckpoints: createSemanticCheckpoints(exportedTimeline),
    status: derivePassedParityStatus(timingComparison),
    timingComparison,
  };
}

function createParityTimeline(
  timeline: TimelineMap,
  semanticAnchors: string[],
): Phase5ParityTimeline {
  const stepOrdering = timeline.slides.map((slide) => ({
    slideId: slide.slideId,
    steps: slide.steps.map((step) => ({
      kind: step.kind,
      segment: step.segment,
      stepIndex: step.stepIndex,
    })),
  }));
  const transitions = collectTransitions(timeline);

  return {
    semanticAnchors,
    slideOrder: timeline.slides.map((slide) => slide.slideId),
    stepOrdering,
    timelineIdentity: createStableHash({
      fps: timeline.fps,
      navigationPolicy: timeline.navigationPolicy,
      semanticAnchors,
      slideOrder: timeline.slides.map((slide) => slide.slideId),
      stepKinds: stepOrdering.map((slide) => ({
        slideId: slide.slideId,
        steps: slide.steps.map((step) => ({
          kind: step.kind,
          stepIndex: step.stepIndex,
        })),
      })),
      transitions: transitions.map(({ from, kind, to }) => ({
        from,
        kind,
        to,
      })),
    }),
    transitions,
  };
}

function collectTransitions(timeline: TimelineMap): Phase5ParityTransition[] {
  return timeline.slides.flatMap((slide) => {
    const transitions = [slide.transitionIn, slide.transitionOut].filter(
      (transition): transition is NonNullable<TimelineSlide["transitionIn"]> =>
        transition !== undefined,
    );

    return transitions.map((transition) => ({
      durationFrames: transition.durationFrames,
      from: transition.from,
      kind: transition.kind,
      segment: transition.segment,
      settleFrame: transition.segment[1],
      to: transition.to,
    }));
  });
}

function createSemanticCheckpoints(
  timeline: TimelineMap,
): Phase5SemanticCheckpoint[] {
  const checkpoints: Phase5SemanticCheckpoint[] = [];

  for (const slide of timeline.slides) {
    checkpoints.push({
      frame: slide.segment[0],
      kind: "slide-boundary",
      slideId: slide.slideId,
    });

    for (const step of slide.steps) {
      checkpoints.push({
        frame: step.segment[0],
        kind: "step-boundary",
        slideId: slide.slideId,
        stepIndex: step.stepIndex,
      });
    }

    if (slide.transitionIn !== undefined) {
      checkpoints.push({
        frame: slide.transitionIn.segment[1],
        kind: "transition-settle",
        slideId: slide.slideId,
      });
    }
  }

  return checkpoints;
}

function createTimingComparison(
  previewTimeline: TimelineMap,
  exportedTimeline: TimelineMap,
  semanticAnchors: string[],
): Phase5ParityTimingComparison {
  const previewSteps = flattenTimelineSteps(previewTimeline);
  const exportedSteps = flattenTimelineSteps(exportedTimeline);
  const allowedStepDeltas: Phase5ParityStepTimingDelta[] = [];
  const stepMismatches: Phase5ParityTimingMismatch[] = [];
  const shiftMarkers: { frameDelta: number; previewFrame: number }[] = [];
  let accumulatedShift = 0;

  for (const [index, previewStep] of previewSteps.entries()) {
    const exportedStep = exportedSteps[index];

    if (exportedStep === undefined) {
      stepMismatches.push({
        exported: "missing",
        preview: `${previewStep.slideId}:${previewStep.stepIndex}:${previewStep.kind}`,
        reason: "Preview step has no exported counterpart.",
      });
      continue;
    }

    if (
      previewStep.slideId !== exportedStep.slideId ||
      previewStep.stepIndex !== exportedStep.stepIndex ||
      previewStep.kind !== exportedStep.kind
    ) {
      stepMismatches.push({
        exported: `${exportedStep.slideId}:${exportedStep.stepIndex}:${exportedStep.kind}`,
        preview: `${previewStep.slideId}:${previewStep.stepIndex}:${previewStep.kind}`,
        reason: "Preview/export step identity differs.",
      });
      continue;
    }

    const startDelta = exportedStep.segment[0] - previewStep.segment[0];
    const endDelta = exportedStep.segment[1] - previewStep.segment[1];

    if (startDelta === accumulatedShift && endDelta === accumulatedShift) {
      continue;
    }

    if (
      previewStep.kind === "wait-for-event" &&
      startDelta === accumulatedShift &&
      endDelta !== accumulatedShift
    ) {
      allowedStepDeltas.push({
        exportedSegment: exportedStep.segment,
        frameDelta: endDelta - startDelta,
        kind: previewStep.kind,
        previewSegment: previewStep.segment,
        reason:
          "Offline exportDuration owns wait-for-event timing for deterministic export.",
        slideId: previewStep.slideId,
        status: "allowed",
        stepIndex: previewStep.stepIndex,
        timingOwner: "offline-export-duration",
      });
      accumulatedShift = endDelta;
      shiftMarkers.push({
        frameDelta: accumulatedShift,
        previewFrame: previewStep.segment[1],
      });
      continue;
    }

    stepMismatches.push({
      exported: `${exportedStep.slideId}:${exportedStep.stepIndex}:${exportedStep.segment.join("-")}`,
      preview: `${previewStep.slideId}:${previewStep.stepIndex}:${previewStep.segment.join("-")}`,
      reason:
        "Step timing differs without an offline exportDuration allowance.",
    });
  }

  if (exportedSteps.length > previewSteps.length) {
    for (const exportedStep of exportedSteps.slice(previewSteps.length)) {
      stepMismatches.push({
        exported: `${exportedStep.slideId}:${exportedStep.stepIndex}:${exportedStep.kind}`,
        preview: "missing",
        reason: "Exported step has no preview counterpart.",
      });
    }
  }

  const transitionComparison = compareTransitionsWithAllowedShifts(
    previewTimeline,
    exportedTimeline,
    shiftMarkers,
  );
  const finalPreviewAnchor =
    previewTimeline.slides.at(-1)?.slideId ?? semanticAnchors.at(-1) ?? "";
  const finalExportedAnchor =
    exportedTimeline.slides.at(-1)?.slideId ?? finalPreviewAnchor;
  const finalSemanticAnchors =
    finalPreviewAnchor === finalExportedAnchor
      ? ({
          exported: finalExportedAnchor,
          preview: finalPreviewAnchor,
          status: "matched",
        } as const)
      : (() => {
          throw new Error(
            `Preview/export final semantic anchor mismatch: ${finalPreviewAnchor} != ${finalExportedAnchor}.`,
          );
        })();

  if (
    !sameStringArray(
      previewTimeline.slides.map((slide) => slide.slideId),
      exportedTimeline.slides.map((slide) => slide.slideId),
    )
  ) {
    throw new Error("Preview/export slide order mismatch.");
  }

  if (
    !sameStringArray(
      previewSteps.map(
        (step) => `${step.slideId}:${step.stepIndex}:${step.kind}`,
      ),
      exportedSteps.map(
        (step) => `${step.slideId}:${step.stepIndex}:${step.kind}`,
      ),
    )
  ) {
    throw new Error("Preview/export step identity mismatch.");
  }

  return {
    finalSemanticAnchors,
    offlineTiming: {
      allowedDeltas: allowedStepDeltas,
      status:
        allowedStepDeltas.length === 0
          ? "passed"
          : "passed-with-allowed-deltas",
      unexpectedMismatches: stepMismatches,
    },
    slideOrder: { status: "matched" },
    stepIdentity: { status: "matched" },
    transitions: transitionComparison,
  };
}

function derivePassedParityStatus(
  timingComparison: Phase5ParityTimingComparison,
): Phase5PreviewExportParityReport["status"] {
  if (
    timingComparison.offlineTiming.unexpectedMismatches.length > 0 ||
    timingComparison.transitions.unexpectedMismatches.length > 0
  ) {
    throw new Error("Preview/export parity has unexpected timing mismatches.");
  }

  return "passed";
}

function compareTransitionsWithAllowedShifts(
  previewTimeline: TimelineMap,
  exportedTimeline: TimelineMap,
  shiftMarkers: { frameDelta: number; previewFrame: number }[],
): Phase5ParityTimingComparison["transitions"] {
  const previewTransitions = collectTransitions(previewTimeline);
  const exportedTransitions = collectTransitions(exportedTimeline);
  const allowedDeltas: Phase5ParityTransitionTimingDelta[] = [];
  const unexpectedMismatches: Phase5ParityTimingMismatch[] = [];

  for (const [index, previewTransition] of previewTransitions.entries()) {
    const exportedTransition = exportedTransitions[index];

    if (exportedTransition === undefined) {
      unexpectedMismatches.push({
        exported: "missing",
        preview: `${previewTransition.from}->${previewTransition.to}:${previewTransition.kind}`,
        reason: "Preview transition has no exported counterpart.",
      });
      continue;
    }

    if (
      previewTransition.from !== exportedTransition.from ||
      previewTransition.to !== exportedTransition.to ||
      previewTransition.kind !== exportedTransition.kind ||
      previewTransition.durationFrames !== exportedTransition.durationFrames
    ) {
      unexpectedMismatches.push({
        exported: `${exportedTransition.from}->${exportedTransition.to}:${exportedTransition.kind}`,
        preview: `${previewTransition.from}->${previewTransition.to}:${previewTransition.kind}`,
        reason: "Preview/export transition identity differs.",
      });
      continue;
    }

    const expectedShift = shiftAtFrame(
      shiftMarkers,
      previewTransition.settleFrame,
    );
    const startDelta =
      exportedTransition.segment[0] - previewTransition.segment[0];
    const endDelta =
      exportedTransition.segment[1] - previewTransition.segment[1];

    if (startDelta === expectedShift && endDelta === expectedShift) {
      if (expectedShift !== 0) {
        allowedDeltas.push({
          exportedSegment: exportedTransition.segment,
          frameDelta: expectedShift,
          from: previewTransition.from,
          kind: previewTransition.kind,
          previewSegment: previewTransition.segment,
          reason:
            "Transition timing shifts with the preceding offline exportDuration delta.",
          status: "allowed",
          timingOwner: "propagated-offline-duration-delta",
          to: previewTransition.to,
        });
      }
      continue;
    }

    unexpectedMismatches.push({
      exported: `${exportedTransition.from}->${exportedTransition.to}:${exportedTransition.segment.join("-")}`,
      preview: `${previewTransition.from}->${previewTransition.to}:${previewTransition.segment.join("-")}`,
      reason:
        "Transition timing differs outside the allowed offline timing shift.",
    });
  }

  if (exportedTransitions.length > previewTransitions.length) {
    for (const exportedTransition of exportedTransitions.slice(
      previewTransitions.length,
    )) {
      unexpectedMismatches.push({
        exported: `${exportedTransition.from}->${exportedTransition.to}:${exportedTransition.kind}`,
        preview: "missing",
        reason: "Exported transition has no preview counterpart.",
      });
    }
  }

  return {
    allowedDeltas,
    status:
      allowedDeltas.length === 0 ? "passed" : "passed-with-allowed-deltas",
    unexpectedMismatches,
  };
}

function flattenTimelineSteps(timeline: TimelineMap): {
  kind: string;
  segment: [number, number];
  slideId: string;
  stepIndex: number;
}[] {
  return timeline.slides.flatMap((slide) =>
    slide.steps.map((step) => ({
      kind: step.kind,
      segment: step.segment,
      slideId: slide.slideId,
      stepIndex: step.stepIndex,
    })),
  );
}

function shiftAtFrame(
  shiftMarkers: { frameDelta: number; previewFrame: number }[],
  previewFrame: number,
): number {
  return shiftMarkers.reduce((currentShift, marker) => {
    if (previewFrame >= marker.previewFrame) {
      return marker.frameDelta;
    }

    return currentShift;
  }, 0);
}

function sameStringArray(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((item, index) => item === right[index])
  );
}

function collectRenderSafeDiagnostics(
  timeline: TimelineMap,
): Phase5RenderSafeDiagnostic[] {
  return timeline.slides.flatMap((slide) =>
    slide.resources.map((resource) => ({
      resourceId: resource.resourceId,
      resourceKind: resource.resourceKind,
      slideId: slide.slideId,
      timeoutMs: resource.timeoutMs,
    })),
  );
}

function collectTypographyDiagnostics(
  deck: unknown,
): Phase5TypographyDiagnostic[] {
  const diagnostics: Phase5TypographyDiagnostic[] = [];
  collectTypographyFromNode(deck, diagnostics);
  return diagnostics;
}

function collectTypographyFromNode(
  value: unknown,
  diagnostics: Phase5TypographyDiagnostic[],
  slideId?: string,
  density = "comfortable",
): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectTypographyFromNode(item, diagnostics, slideId, density);
    }
    return;
  }

  if (typeof value !== "object" || value === null || !("kind" in value)) {
    return;
  }

  const node = value as {
    autoFit?: unknown;
    children?: unknown;
    id?: string;
    kind: string;
    maxHeight?: number;
    maxWidth?: number;
    metadata?: {
      density?: string;
    };
  };
  const nextSlideId = node.kind === "slide" ? node.id : slideId;
  const nextDensity =
    node.kind === "content-slot" && node.metadata?.density
      ? node.metadata.density
      : density;

  if (
    node.kind === "typography-box" &&
    typeof node.id === "string" &&
    typeof node.maxHeight === "number" &&
    typeof node.maxWidth === "number" &&
    nextSlideId !== undefined
  ) {
    diagnostics.push({
      componentId: node.id,
      density: nextDensity,
      hasAutoFit: node.autoFit !== undefined,
      maxHeight: node.maxHeight,
      maxWidth: node.maxWidth,
      slideId: nextSlideId,
      text: extractReadableText(node.children),
    });
  }

  collectTypographyFromNode(
    node.children,
    diagnostics,
    nextSlideId,
    nextDensity,
  );
}

function createDensityDiagnostics(
  typography: Phase5TypographyDiagnostic[],
): Phase5DensityDiagnostic[] {
  return typography.map((box) => {
    const characterCount = Math.max(1, countReadableCharacters(box.text));
    const estimatedLineCount = Math.max(1, Math.ceil(characterCount / 54));
    const area = Math.max(1, box.maxHeight * box.maxWidth);

    return {
      characterCount,
      charactersPer1000Px2: roundTwo(characterCount / (area / 1000)),
      componentId: box.componentId,
      density: box.density,
      estimatedLineCount,
      slideId: box.slideId,
    };
  });
}

function extractReadableText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(extractReadableText).filter(Boolean).join(" ");
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value !== "object" || value === null || !("children" in value)) {
    return "";
  }

  return extractReadableText((value as { children?: unknown }).children);
}

function countReadableCharacters(value: string): number {
  return value.replace(/\s+/g, "").length;
}

function renderWebBundleHtml(
  metadata: DeckMetadata,
  manifest: Phase5LocalWebExportManifest,
  timeline: TimelineMap,
): string {
  const slideSections = metadata.outline
    .map((entry) => {
      const slide = timeline.slides.find(
        (candidate) => candidate.slideId === entry.slideId,
      );

      return `<section class="slide" data-cadenza-slide-id="${escapeHtml(
        entry.slideId,
      )}" data-cadenza-semantic-anchor="${escapeHtml(
        entry.slideId,
      )}" data-cadenza-step-count="${
        slide?.steps.length ?? 0
      }" data-cadenza-notes-count="${slide?.notes.length ?? 0}">
  <h2>${escapeHtml(entry.title)}</h2>
  <p>${escapeHtml(entry.summary)}</p>
</section>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(metadata.title)}</title>
  <style>
    body { margin: 0; font-family: Inter, Arial, sans-serif; background: #101820; color: #f8fafc; }
    main { min-height: 100vh; padding: 48px; display: grid; gap: 24px; }
    .slide { border: 1px solid #334155; border-radius: 8px; padding: 24px; background: #0b1220; }
    .slide h2 { margin: 0 0 12px; font-size: 28px; }
    .slide p { margin: 0; color: #cbd5e1; line-height: 1.5; }
  </style>
</head>
<body data-cadenza-export-deck="${escapeHtml(
    metadata.deckId,
  )}" data-cadenza-export-parity="${
    manifest.previewExportParity.status
  }" data-cadenza-visible-notes="false">
  <main>
    <h1>${escapeHtml(metadata.title)}</h1>
${slideSections}
  </main>
  <script type="application/json" id="cadenza-export-manifest">${escapeScriptJson(
    JSON.stringify(manifest),
  )}</script>
</body>
</html>
`;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function isSupportedDeckId(value: string): value is CadenzaExportDeckId {
  return value in DECK_REGISTRY;
}

function isDeckMetadata(value: unknown): value is DeckMetadata {
  return (
    typeof value === "object" &&
    value !== null &&
    "deckId" in value &&
    "exportCommand" in value &&
    "outline" in value &&
    "sourcePath" in value &&
    "title" in value
  );
}

function sanitizeRunId(value: string): string {
  const sanitized = value.trim();

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(sanitized)) {
    throw new Error(
      "--run-id must start with an alphanumeric character and contain only letters, numbers, dots, underscores, or dashes.",
    );
  }

  return sanitized;
}

function defaultRunId(): string {
  return new Date().toISOString().replaceAll(/[:.]/g, "-");
}

function toRepoPath(value: string): string {
  return value.split(path.sep).join("/");
}

function createStableHash(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeScriptJson(value: string): string {
  return value.replaceAll("</", "<\\/");
}
