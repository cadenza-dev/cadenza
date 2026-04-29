import {
  ContentSlot,
  Deck,
  MediaFrame,
  Notes,
  Slide,
  Step,
  Theme,
  Transition,
  TypographyBox,
} from "@cadenza-dev/core";

const dataExplainerTheme = Theme({
  name: "data-explainer",
  tokens: {
    color: {
      background: "#101820",
      foreground: "#f5f7fa",
      accent: "#2dd4bf",
    },
    spacing: {
      framePadding: 48,
      labelGap: 16,
    },
  },
});

export const dataExplainerDeck = (
  <Deck fps={24} navigationPolicy="queue-next" theme={dataExplainerTheme}>
    <Slide id="question">
      <Notes>
        Start by naming the comparison before showing the metric delta.
      </Notes>
      <Step duration="2s">
        <ContentSlot
          id="latency-question"
          density="comfortable"
          readability="headline"
        >
          <TypographyBox
            id="latency-question-title"
            maxHeight={120}
            maxWidth={780}
          >
            Which authoring loop produces repairable diagnostics?
          </TypographyBox>
        </ContentSlot>
      </Step>
    </Slide>
    <Transition kind="fade" duration="500ms" />
    <Slide id="comparison">
      <Notes>
        Emphasize that the chart is a previewable explanation, not an export
        claim.
      </Notes>
      <Step duration="2s">
        <MediaFrame
          id="diagnostic-delta-frame"
          aspectRatio={16 / 9}
          poster="/assets/diagnostic-delta.png"
        >
          with_skill surfaces repairQueue evidence; without_skill drifts into
          raw visual patches.
        </MediaFrame>
      </Step>
      <Step duration="2s">
        <ContentSlot id="bounded-labels" density="compact" readability="body">
          <TypographyBox id="delta-label" maxHeight={96} maxWidth={640}>
            Delta: diagnostics-driven repair before visual restyling
          </TypographyBox>
        </ContentSlot>
      </Step>
    </Slide>
  </Deck>
);
