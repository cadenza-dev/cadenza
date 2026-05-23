import {
  type CadenzaNode,
  CadenzaValidationError,
  type CadenzaValidationReport,
  ContentSlot,
  compile,
  createValidationReport,
  Deck,
  type DeckNode,
  MediaFrame,
  Notes,
  SafeFont,
  SafeImage,
  Slide,
  Step,
  Theme,
  type ThemeDefinition,
  type TimelineMap,
  Transition,
  TypographyBox,
} from "@cadenza-dev/core";

export type Phase3AcceptanceFixture = {
  deck: DeckNode;
  timeline: TimelineMap;
  offlineTimeline: TimelineMap;
};

type Phase3AcceptanceDeckOptions = {
  titleBox: {
    maxHeight: number;
    maxWidth: number;
  };
};

const DIAGNOSTIC_MAP_SRC =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='9'%20viewBox='0%200%2016%209'%3E%3Crect%20width='16'%20height='9'%20fill='%2314b8a6'/%3E%3C/svg%3E";

const theme = (
  <Theme
    name="phase-3-authoring-loop"
    tokens={{
      color: {
        background: "#111827",
        foreground: "#f9fafb",
        accent: "#14b8a6",
      },
      typography: {
        heading: "Inter Tight",
        body: "Inter",
      },
      spacing: {
        framePadding: 48,
        gutter: 24,
      },
      motion: {
        reveal: "600ms",
        repair: "1s",
      },
    }}
  />
) as ThemeDefinition;

const phase3AcceptanceDeck = createPhase3AcceptanceDeck({
  titleBox: {
    maxHeight: 128,
    maxWidth: 760,
  },
});

const phase3PreviewRepairCandidateDeck = createPhase3AcceptanceDeck({
  titleBox: {
    maxHeight: 24,
    maxWidth: 96,
  },
});

function createPhase3AcceptanceDeck(
  options: Phase3AcceptanceDeckOptions,
): DeckNode {
  return (
    <Deck fps={24} navigationPolicy="queue-next" theme={theme}>
      <Slide id="loop-contract">
        <Notes>
          Explain the explicit local authoring loop before any wrapper command
          exists.
        </Notes>
        <SafeFont id="phase-3-talk-font" family="Inter" timeoutMs={200} />
        <Step duration="2s">
          <ContentSlot
            id="local-loop-title"
            density="comfortable"
            readability="headline"
          >
            <TypographyBox
              id="local-loop-title"
              maxHeight={options.titleBox.maxHeight}
              maxWidth={options.titleBox.maxWidth}
            >
              AI-authored decks start with typed Cadenza TSX
            </TypographyBox>
          </ContentSlot>
        </Step>
        <Step duration="2s">
          {"compile -> preview -> inspect diagnostics -> repair -> rerun"}
        </Step>
      </Slide>
      <Transition kind="fade" duration="500ms" />
      <Slide id="diagnostic-surface">
        <Notes>
          Show that compile diagnostics are structured before browser preview.
        </Notes>
        <SafeImage
          id="diagnostic-map"
          src={DIAGNOSTIC_MAP_SRC}
          alt="Compile diagnostics flowing into a deterministic repair queue"
          timeoutMs={200}
        />
        <Step duration="2s">
          <MediaFrame
            id="diagnostic-preview-frame"
            aspectRatio={16 / 9}
            poster="/assets/phase3-diagnostics-poster.png"
          >
            Browser preview diagnostic channel
          </MediaFrame>
        </Step>
        <Step kind="wait-for-event" exportDuration="3s">
          Pause on the first repair queue item before editing the authored deck.
        </Step>
      </Slide>
      <Transition kind="slide" duration="500ms" />
      <Slide id="repair-boundary">
        <Notes>
          Close by keeping repairs in authored deck surfaces, not framework
          internals.
        </Notes>
        <Step
          kind="computed"
          duration="2s"
          exportDuration="2s"
          children={({ slideId }) =>
            `Repair evidence is attached to ${slideId}, not framework internals.`
          }
        />
      </Slide>
    </Deck>
  ) as DeckNode;
}

export function createPhase3AcceptanceFixture(): Phase3AcceptanceFixture {
  return {
    deck: phase3AcceptanceDeck,
    timeline: compile(phase3AcceptanceDeck),
    offlineTimeline: compile(phase3AcceptanceDeck, { mode: "offline" }),
  };
}

export function createPhase3PreviewRepairCandidateFixture(): Phase3AcceptanceFixture {
  return {
    deck: phase3PreviewRepairCandidateDeck,
    timeline: compile(phase3PreviewRepairCandidateDeck),
    offlineTimeline: compile(phase3PreviewRepairCandidateDeck, {
      mode: "offline",
    }),
  };
}

export function createPhase3InvalidCompileReport(): CadenzaValidationReport {
  try {
    compile(createPhase3InvalidDeck(), { mode: "offline" });
  } catch (error) {
    if (error instanceof CadenzaValidationError) {
      return createValidationReport(error.diagnostics);
    }

    throw error;
  }

  throw new Error("Expected the Phase 3 invalid deck to fail compilation.");
}

function createPhase3InvalidDeck(): DeckNode {
  const missingIdSlide = {
    kind: "slide",
    children: [],
  } as unknown as CadenzaNode;

  return Deck({
    fps: 24,
    children: [
      missingIdSlide,
      Slide({
        id: "duplicate-topic",
        children: Step({ duration: "1s", children: "First duplicate" }),
      }),
      Slide({
        id: "duplicate-topic",
        children: Step({ duration: "1s", children: "Second duplicate" }),
      }),
      Slide({
        id: "bad-step-kind",
        children: Step({
          kind: "raw-remotion-timeline" as never,
          children: "Invalid step kind from an authored deck.",
        }),
      }),
      Slide({
        id: "missing-export-duration",
        children: Step({
          kind: "wait-for-event",
          children: "Offline compile needs an explicit export duration.",
        }),
      }),
    ],
  });
}
