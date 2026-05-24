import {
  type DeckNode,
  type TimelineMap,
  type TypographyDensityDiagnostic,
  validateTypographyDensity,
} from "@cadenza-dev/core";
import type {
  CadenzaPlayerHandle,
  CadenzaPlayerSnapshot,
} from "@cadenza-dev/preview-remotion";
import {
  createPhase4DogfoodTalkFixture,
  PHASE4_RELIABILITY_DENSITY_BOX,
  PHASE4_RELIABILITY_DENSITY_TEXT,
  type Phase4DogfoodTalkChapter,
  type Phase4DogfoodTalkOutlineEntry,
  phase4DogfoodTalkMetadata,
  phase4DogfoodTalkTheme,
} from "./dogfood-talk.js";

export const PHASE4_DOGFOOD_PREVIEW_ROUTE = "/";

export type Phase4DogfoodPreviewConfig = {
  compositionHeight?: number;
  compositionWidth?: number;
};

export type Phase4DogfoodPreviewPlayerProps = {
  compositionHeight: number;
  compositionWidth: number;
  controls: true;
  deck: DeckNode;
  timeline: TimelineMap;
};

export type Phase4PresenterContext = {
  chapterId: string;
  chapterTitle: string;
  kind: Phase4DogfoodTalkOutlineEntry["kind"];
  slideId: string;
  stepCount: number;
  stepIndex: number;
  summary: string;
  title: string;
};

export type Phase4PresenterWorkflow = {
  chapters: Phase4DogfoodTalkChapter[];
  current: Phase4PresenterContext;
  cursor: CadenzaPlayerSnapshot["cursor"];
  diagnostics: CadenzaPlayerSnapshot["diagnostics"];
  elapsed: {
    activeMs: number;
    wallMs: number;
  };
  next: Phase4PresenterContext | null;
  notes: string[];
  outline: Phase4DogfoodTalkOutlineEntry[];
  timelineTotalFrames: number;
};

export type Phase4PresenterWorkflowInput = {
  snapshot: CadenzaPlayerSnapshot;
  timeline: TimelineMap;
};

export type Phase4PresenterControlTarget = Pick<
  CadenzaPlayerHandle,
  | "goto"
  | "isPlaying"
  | "next"
  | "pause"
  | "play"
  | "previous"
  | "togglePlayback"
>;

export type Phase4PresenterControls = {
  gotoChapter(chapter: Phase4DogfoodTalkChapter): void;
  gotoOutline(entry: Phase4DogfoodTalkOutlineEntry): void;
  isPlaying(): boolean;
  next(): void;
  pause(): void;
  play(): void;
  previous(): void;
  restart(): void;
  togglePlayback(): void;
};

export type Phase4VisualAcceptanceDiagnostic = {
  code: "VARR_VISUAL_ACCEPTANCE_REPAIRED";
  requirementRefs: ["PRES-006", "VARR-005"];
  source: "phase4-presenter-panel";
  summary: string;
  testRefs: ["TC-VARR-001"];
};

export type Phase4TypographyDiagnostic = TypographyDensityDiagnostic;

export type Phase4TransitionProgressPhase = "start" | "progress" | "settled";

export type Phase4TransitionDiagnostic = {
  code:
    | "TRPR_TRANSITION_START"
    | "TRPR_TRANSITION_PROGRESS"
    | "TRPR_TRANSITION_SETTLED";
  requirementRefs: ["TRPR-003", "TRPR-004"];
  source: "phase4-transition-progress";
  summary: string;
  testRefs: ["TC-TRPR-002"];
  transition: {
    durationFrames: number;
    from: string;
    kind: string;
    progress: number;
    progressPhase: Phase4TransitionProgressPhase;
    settleBehavior: "semantic-anchor";
    settleFrame: number;
    timingToken?: string | undefined;
    to: string;
  };
};

export const phase4DogfoodPreviewDescriptor = {
  bundlePath: "/phase4-dogfood-preview.js",
  command: "pnpm preview:phase4",
  rootElementId: "cadenza-phase4-preview-root",
  route: PHASE4_DOGFOOD_PREVIEW_ROUTE,
  talkSource: phase4DogfoodTalkMetadata.sourcePath,
  title: "Cadenza Phase 4 Dogfood Preview",
} as const;

export function createPhase4DogfoodPreviewProps(
  config: Phase4DogfoodPreviewConfig = {},
): Phase4DogfoodPreviewPlayerProps {
  const fixture = createPhase4DogfoodTalkFixture();

  return {
    compositionHeight: config.compositionHeight ?? 720,
    compositionWidth: config.compositionWidth ?? 1280,
    controls: true,
    deck: fixture.deck,
    timeline: fixture.timeline,
  };
}

export function createPhase4VisualAcceptanceDiagnostics(): Phase4VisualAcceptanceDiagnostic[] {
  return [
    {
      code: "VARR_VISUAL_ACCEPTANCE_REPAIRED",
      requirementRefs: ["PRES-006", "VARR-005"],
      source: "phase4-presenter-panel",
      summary:
        "Presenter workflow exposes the repaired visual acceptance cue and routes review to trace evidence.",
      testRefs: ["TC-VARR-001"],
    },
  ];
}

export function createPhase4TypographyDiagnostics(): Phase4TypographyDiagnostic[] {
  return validateTypographyDensity({
    box: {
      maxHeight: PHASE4_RELIABILITY_DENSITY_BOX.maxHeight,
      maxWidth: PHASE4_RELIABILITY_DENSITY_BOX.maxWidth,
    },
    density: "compact",
    locator: {
      chapterId: "product-layer",
      componentId: "preview-reliability-budget-density",
      slideId: "preview-reliability-budget",
    },
    readability: "body",
    text: PHASE4_RELIABILITY_DENSITY_TEXT,
    theme: phase4DogfoodTalkTheme,
  });
}

export function createPhase4TransitionDiagnostics({
  snapshot,
  timeline,
}: Phase4PresenterWorkflowInput): Phase4TransitionDiagnostic[] {
  const transition = transitionEvidenceAtFrame(timeline, snapshot.playerFrame);

  if (!transition) {
    return [];
  }

  const code =
    transition.progressPhase === "start"
      ? "TRPR_TRANSITION_START"
      : transition.progressPhase === "settled"
        ? "TRPR_TRANSITION_SETTLED"
        : "TRPR_TRANSITION_PROGRESS";

  return [
    {
      code,
      requirementRefs: ["TRPR-003", "TRPR-004"],
      source: "phase4-transition-progress",
      summary: `${transition.kind} ${transition.progressPhase} from ${transition.from} to ${transition.to}; progress ${(transition.progress * 100).toFixed(0)}% and settles at frame ${transition.settleFrame}.`,
      testRefs: ["TC-TRPR-002"],
      transition,
    },
  ];
}

export function createPhase4PresenterWorkflow({
  snapshot,
  timeline,
}: Phase4PresenterWorkflowInput): Phase4PresenterWorkflow {
  const current = createPresenterContext(
    timeline,
    snapshot.presenterMetadata.slideId,
    snapshot.presenterMetadata.stepIndex,
  );

  return {
    chapters: phase4DogfoodTalkMetadata.chapters,
    current,
    cursor: snapshot.cursor,
    diagnostics: snapshot.diagnostics,
    elapsed: {
      activeMs: snapshot.presenterMetadata.elapsedActiveTimeMs,
      wallMs: snapshot.presenterMetadata.elapsedWallTimeMs,
    },
    next: createNextPresenterContext(timeline, current),
    notes: [...snapshot.presenterMetadata.notes],
    outline: phase4DogfoodTalkMetadata.outline,
    timelineTotalFrames: timeline.totalFrames,
  };
}

export function createPhase4PresenterControls(
  target: Phase4PresenterControlTarget,
): Phase4PresenterControls {
  return {
    gotoChapter(chapter) {
      const [firstSlideId] = chapter.slideIds;
      if (!firstSlideId) {
        throw new RangeError(`Chapter '${chapter.id}' has no slide target.`);
      }

      target.goto(firstSlideId, 0);
    },
    gotoOutline(entry) {
      target.goto(entry.slideId, 0);
    },
    isPlaying: () => target.isPlaying(),
    next: () => target.next(),
    pause: () => target.pause(),
    play: () => target.play(),
    previous: () => target.previous(),
    restart() {
      const firstEntry = phase4DogfoodTalkMetadata.outline[0];
      if (!firstEntry) {
        throw new RangeError("Phase 4 presenter outline has no start target.");
      }

      target.goto(firstEntry.slideId, 0);
    },
    togglePlayback: () => target.togglePlayback(),
  };
}

function transitionEvidenceAtFrame(
  timeline: TimelineMap,
  frame: number,
): Phase4TransitionDiagnostic["transition"] | undefined {
  for (const slide of timeline.slides) {
    const transition = slide.transitionOut;
    if (!transition) {
      continue;
    }

    const [startFrame, settleFrame] = transition.segment;
    const durationFrames = transition.durationFrames;

    if (frame === settleFrame) {
      return {
        durationFrames,
        from: transition.from,
        kind: transition.kind,
        progress: 1,
        progressPhase: "settled",
        settleBehavior: "semantic-anchor",
        settleFrame,
        ...(transition.timingToken
          ? { timingToken: transition.timingToken }
          : {}),
        to: transition.to,
      };
    }

    if (frame < startFrame || frame >= settleFrame) {
      continue;
    }

    const progress =
      durationFrames === 0 ? 1 : (frame - startFrame) / durationFrames;

    return {
      durationFrames,
      from: transition.from,
      kind: transition.kind,
      progress,
      progressPhase: progress === 0 ? "start" : "progress",
      settleBehavior: "semantic-anchor",
      settleFrame,
      ...(transition.timingToken
        ? { timingToken: transition.timingToken }
        : {}),
      to: transition.to,
    };
  }

  return undefined;
}

function createNextPresenterContext(
  timeline: TimelineMap,
  current: Phase4PresenterContext,
): Phase4PresenterContext | null {
  const slideIndex = timeline.slides.findIndex(
    (slide) => slide.slideId === current.slideId,
  );
  const slide = timeline.slides[slideIndex];

  if (!slide) {
    return null;
  }

  const nextStepIndex = current.stepIndex + 1;
  if (slide.steps[nextStepIndex]) {
    return createPresenterContext(timeline, current.slideId, nextStepIndex);
  }

  const nextSlide = timeline.slides[slideIndex + 1];
  if (!nextSlide) {
    return null;
  }

  return createPresenterContext(timeline, nextSlide.slideId, 0);
}

function createPresenterContext(
  timeline: TimelineMap,
  slideId: string,
  stepIndex: number,
): Phase4PresenterContext {
  const slide = timeline.slides.find(
    (candidate) => candidate.slideId === slideId,
  );
  if (!slide) {
    throw new RangeError(`Unknown presenter slide '${slideId}'.`);
  }

  const outlineEntry = phase4DogfoodTalkMetadata.outline.find(
    (entry) => entry.slideId === slideId,
  );
  if (!outlineEntry) {
    throw new RangeError(`Missing presenter outline entry for '${slideId}'.`);
  }

  const chapter = phase4DogfoodTalkMetadata.chapters.find(
    (candidate) => candidate.id === outlineEntry.chapterId,
  );
  if (!chapter) {
    throw new RangeError(
      `Missing presenter chapter '${outlineEntry.chapterId}'.`,
    );
  }

  return {
    chapterId: outlineEntry.chapterId,
    chapterTitle: chapter.title,
    kind: outlineEntry.kind,
    slideId,
    stepCount: slide.steps.length,
    stepIndex,
    summary: outlineEntry.summary,
    title: outlineEntry.title,
  };
}
