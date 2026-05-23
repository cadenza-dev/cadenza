import {
  ContentSlot,
  compile,
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

export type Phase4DogfoodTalkFixture = {
  deck: DeckNode;
  offlineTimeline: TimelineMap;
  timeline: TimelineMap;
};

export type Phase4DogfoodTalkOutlineEntry = {
  chapterId: string;
  kind: "architecture" | "data-explainer" | "workflow";
  slideId: string;
  summary: string;
  title: string;
};

export type Phase4DogfoodTalkChapter = {
  id: string;
  slideIds: string[];
  title: string;
};

const RELIABILITY_BUDGET_SRC =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='640'%20height='360'%20viewBox='0%200%20640%20360'%3E%3Crect%20width='640'%20height='360'%20fill='%230f172a'/%3E%3Ctext%20x='48'%20y='72'%20fill='%23f8fafc'%20font-family='Inter%2C%20Arial'%20font-size='30'%3EPreview%20Reliability%20Budget%3C/text%3E%3Crect%20x='64'%20y='130'%20width='160'%20height='150'%20rx='8'%20fill='%2322c55e'/%3E%3Crect%20x='240'%20y='95'%20width='160'%20height='185'%20rx='8'%20fill='%230ea5e9'/%3E%3Crect%20x='416'%20y='170'%20width='160'%20height='110'%20rx='8'%20fill='%23f59e0b'/%3E%3Ctext%20x='92'%20y='310'%20fill='%23f8fafc'%20font-family='Inter%2C%20Arial'%20font-size='20'%3ECompiler%3C/text%3E%3Ctext%20x='258'%20y='310'%20fill='%23f8fafc'%20font-family='Inter%2C%20Arial'%20font-size='20'%3ERender-safe%3C/text%3E%3Ctext%20x='444'%20y='310'%20fill='%23f8fafc'%20font-family='Inter%2C%20Arial'%20font-size='20'%3EPreview%3C/text%3E%3C/svg%3E";

const theme = (
  <Theme
    name="phase-4-product-layer"
    tokens={{
      color: {
        accent: "#22c55e",
        background: "#0f172a",
        foreground: "#f8fafc",
        muted: "#94a3b8",
      },
      motion: {
        chapterShift: "700ms",
        reveal: "450ms",
      },
      spacing: {
        framePadding: 56,
        gutter: 28,
      },
      typography: {
        body: "Inter",
        heading: "Inter Tight",
      },
    }}
  />
) as ThemeDefinition;

export const phase4DogfoodTalkMetadata = {
  chapters: [
    {
      id: "architecture",
      slideIds: ["architecture-contract", "timeline-compiler"],
      title: "Architecture spine",
    },
    {
      id: "product-layer",
      slideIds: ["preview-reliability-budget", "product-layer-loop"],
      title: "Product-layer dogfooding",
    },
  ],
  outline: [
    {
      chapterId: "architecture",
      kind: "architecture",
      slideId: "architecture-contract",
      summary:
        "The opening contract: developers author typed TSX, Cadenza compiles timeline semantics, and preview stays render-safe.",
      title: "Why Cadenza needs a product layer",
    },
    {
      chapterId: "architecture",
      kind: "architecture",
      slideId: "timeline-compiler",
      summary:
        "The state-to-timeline compiler turns semantic slides into deterministic player anchors.",
      title: "Compiler spine",
    },
    {
      chapterId: "product-layer",
      kind: "data-explainer",
      slideId: "preview-reliability-budget",
      summary:
        "A data-explainer slide assigns reliability work to compiler, render-safe, and local preview surfaces.",
      title: "Preview reliability budget",
    },
    {
      chapterId: "product-layer",
      kind: "workflow",
      slideId: "product-layer-loop",
      summary:
        "The maintainer loop keeps repair in authored examples and product-layer diagnostics.",
      title: "Dogfood loop",
    },
  ],
  previewCommand: "pnpm preview:phase4",
  sourcePath: "examples/phase4/dogfood-talk.tsx",
  topic: "Cadenza architecture talk",
} satisfies {
  chapters: Phase4DogfoodTalkChapter[];
  outline: Phase4DogfoodTalkOutlineEntry[];
  previewCommand: string;
  sourcePath: string;
  topic: "Cadenza architecture talk";
};

const phase4DogfoodTalk = (
  <Deck fps={24} navigationPolicy="queue-next" theme={theme}>
    <Slide id="architecture-contract">
      <Notes>
        Frame Cadenza as a typed presentation system for developers writing
        technical talks.
      </Notes>
      <SafeFont id="phase-4-talk-font" family="Inter" timeoutMs={200} />
      <Step duration="3s">
        <ContentSlot
          id="architecture-contract-title"
          density="comfortable"
          readability="headline"
        >
          <TypographyBox
            id="architecture-contract-title"
            maxHeight={144}
            maxWidth={820}
          >
            Cadenza turns typed TSX into inspectable technical talks
          </TypographyBox>
        </ContentSlot>
      </Step>
      <Step duration="3s">
        Authoring, compiler timeline, and render-safe preview each keep one
        contract visible to the maintainer.
      </Step>
    </Slide>
    <Transition kind="fade" duration="500ms" />
    <Slide id="timeline-compiler">
      <Notes>
        Show how semantic slide structure becomes deterministic player anchors
        before the product layer adds workflow.
      </Notes>
      <Step duration="3s">
        <ContentSlot
          id="timeline-compiler-map"
          density="comfortable"
          readability="body"
        >
          <TypographyBox
            id="timeline-compiler-map"
            maxHeight={180}
            maxWidth={860}
          >
            Slide semantics compile into frame anchors, notes, resources, and
            transition windows.
          </TypographyBox>
        </ContentSlot>
      </Step>
      <Step
        kind="computed"
        duration="2s"
        exportDuration="2s"
        children={({ fps, slideId, stepIndex }) =>
          `${slideId}:${stepIndex} resolves against ${fps}fps timeline metadata.`
        }
      />
    </Slide>
    <Transition kind="slide" duration="600ms" />
    <Slide id="preview-reliability-budget">
      <Notes>
        Use the reliability budget as a data-explainer: the compiler,
        render-safe layer, and preview workflow each own a different risk.
      </Notes>
      <SafeImage
        id="phase-4-reliability-budget"
        src={RELIABILITY_BUDGET_SRC}
        alt="Preview reliability budget split across compiler, render-safe, and preview workflow"
        timeoutMs={200}
      />
      <Step duration="3s">
        <MediaFrame
          id="reliability-budget-chart"
          aspectRatio={16 / 9}
          poster="/assets/phase4-reliability-budget.png"
        >
          Compiler validates structure; render-safe resources guard readiness;
          preview diagnostics route focused repairs.
        </MediaFrame>
      </Step>
      <Step duration="2s">
        The product layer is credible only when those three bars are visible in
        the same local preview.
      </Step>
    </Slide>
    <Transition kind="fade" duration="500ms" />
    <Slide id="product-layer-loop">
      <Notes>
        Close by showing the maintainer-facing loop: write the talk, open the
        local Player preview, inspect notes and diagnostics, then repair the
        authored example.
      </Notes>
      <Step duration="3s">
        <ContentSlot
          id="product-layer-loop"
          density="comfortable"
          readability="body"
        >
          <TypographyBox id="product-layer-loop" maxHeight={168} maxWidth={840}>
            The Phase 4 loop is preview-first: authored example, local Player,
            presenter context, and traceable repair evidence.
          </TypographyBox>
        </ContentSlot>
      </Step>
      <Step duration="2s">
        Normal talk repair stays in examples and guidance, not framework
        internals.
      </Step>
    </Slide>
  </Deck>
) as DeckNode;

export function createPhase4DogfoodTalkFixture(): Phase4DogfoodTalkFixture {
  return {
    deck: phase4DogfoodTalk,
    offlineTimeline: compile(phase4DogfoodTalk, { mode: "offline" }),
    timeline: compile(phase4DogfoodTalk),
  };
}
