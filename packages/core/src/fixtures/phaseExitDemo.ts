import {
  type CadenzaValidationReport,
  createValidationReport,
  type StepKind,
  type TimelineMap,
} from "../index.js";
import { createAllDomainMvpFixture } from "./allDomainMvp.js";

export type TimelineStepSignature = {
  stepIndex: number;
  kind: StepKind;
  segment: [number, number];
};

export type TimelineSlideSignature = {
  slideId: string;
  segment: [number, number];
  steps: TimelineStepSignature[];
};

export type TimelineSignature = {
  fps: number;
  totalFrames: number;
  slides: TimelineSlideSignature[];
};

export type PhaseExitDemoHandoff = {
  schemaVersion: 1;
  batchId: "B1.4-C";
  fixtureName: "agent-authored-technical-talk";
  previewTimeline: TimelineSignature;
  offlineTimeline: TimelineSignature;
  validationReport: CadenzaValidationReport;
  browserPreview: {
    command: "pnpm test:browser";
    checks: string[];
  };
  exportBoundary: {
    handoffArtifacts: string[];
    unsupportedOutputs: ["MP4", "PDF"];
    statement: string;
  };
};

export function createPhaseExitDemoHandoff(): PhaseExitDemoHandoff {
  const fixture = createAllDomainMvpFixture();

  return {
    schemaVersion: 1,
    batchId: "B1.4-C",
    fixtureName: "agent-authored-technical-talk",
    previewTimeline: signatureForTimeline(fixture.previewTimeline),
    offlineTimeline: signatureForTimeline(fixture.offlineTimeline),
    validationReport: createValidationReport(fixture.previewDiagnostics),
    browserPreview: {
      command: "pnpm test:browser",
      checks: [
        "TypographyBox overflow measurement",
        "click-region navigation",
        "fullscreen capability smoke",
        "keyboard navigation",
        "font and video readiness gating",
        "MediaFrame aspect-ratio measurement",
      ],
    },
    exportBoundary: {
      handoffArtifacts: [
        "all-domain offline TimelineMap",
        "validation report repair queue",
        "browser preview verification command",
      ],
      unsupportedOutputs: ["MP4", "PDF"],
      statement:
        "No MP4/PDF export support is claimed in Phase 1; B1.4-C proves the deterministic TimelineMap and validation handoff boundary only.",
    },
  };
}

function signatureForTimeline(timeline: TimelineMap): TimelineSignature {
  return {
    fps: timeline.fps,
    totalFrames: timeline.totalFrames,
    slides: timeline.slides.map((slide) => ({
      slideId: slide.slideId,
      segment: [...slide.segment],
      steps: slide.steps.map((step) => ({
        stepIndex: step.stepIndex,
        kind: step.kind,
        segment: [...step.segment],
      })),
    })),
  };
}
