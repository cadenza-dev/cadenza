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
      maxHeight: 96,
      maxWidth: 420,
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
