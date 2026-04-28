import {
  compile,
  Deck,
  type DeckNode,
  Notes,
  Slide,
  Step,
  Theme,
  type ThemeDefinition,
  Transition,
} from "@cadenza-dev/core";

const theme = (
  <Theme name="phase-1" tokens={{ color: { accent: "#4f46e5" } }} />
) as ThemeDefinition;

export const tsxAuthoredDeck = (
  <Deck fps={24} navigationPolicy="queue-next" theme={theme}>
    <Slide id="intro">
      <Notes>Introduce the TSX public API surface.</Notes>
      <Step duration="1s">Static content</Step>
      <Step kind="computed">
        {(context) =>
          `Slide ${context.slideId} step ${context.stepIndex} at ${context.fps}fps`
        }
      </Step>
    </Slide>
    <Transition kind="fade" duration="250ms" />
    <Slide id="details">
      <Step kind="wait-for-event" exportDuration="2s">
        Runtime-elastic content
      </Step>
    </Slide>
  </Deck>
) as DeckNode;

export const tsxAuthoredTimeline = compile(tsxAuthoredDeck);
