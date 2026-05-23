import {
  ContentSlot,
  compile,
  Deck,
  type DeckNode,
  MediaFrame,
  Notes,
  ProductTransition,
  SafeFont,
  SafeImage,
  Slide,
  Step,
  Theme,
  type ThemeDefinition,
  type TimelineMap,
  TypographyBox,
} from "@cadenza-dev/core";

export type Phase4TechnicalTalkStarterKind =
  | "architecture-talk"
  | "data-explainer"
  | "live-demo";

export type Phase4TechnicalTalkStarterOutlineEntry = {
  slideId: string;
  title: string;
  purpose: "setup" | "evidence" | "handoff";
};

export type Phase4TechnicalTalkStarterChapter = {
  id: string;
  slideIds: string[];
  title: string;
};

export type Phase4TechnicalTalkStarter = {
  boundaryGuards: string[];
  kind: Phase4TechnicalTalkStarterKind;
  localPreviewRepairWorkflow: string[];
  outline: Phase4TechnicalTalkStarterOutlineEntry[];
  presenterMetadata: {
    chapters: Phase4TechnicalTalkStarterChapter[];
    hasNotes: true;
    hasOutline: true;
  };
  requiredSurfaces: string[];
  scope: "technical-talk";
  sourcePath: "examples/phase4/technical-talk-starters.tsx";
  targetAudience: string;
  title: string;
};

export type Phase4TechnicalTalkStarterFixture = {
  deck: DeckNode;
  kind: Phase4TechnicalTalkStarterKind;
  offlineTimeline: TimelineMap;
  timeline: TimelineMap;
};

const STARTER_SOURCE_PATH = "examples/phase4/technical-talk-starters.tsx";
const REQUIRED_SURFACES = [
  "public-cadenza-tsx",
  "render-safe-components",
  "speaker-notes",
  "presenter-metadata",
  "local-preview-repair",
];
const LOCAL_PREVIEW_REPAIR_WORKFLOW = [
  "pnpm preview:phase4",
  "inspect presenter metadata and diagnostics",
  "repair the authored starter TSX",
  "re-run compile, preview, and focused verification",
];
const BOUNDARY_GUARDS = [
  "not a generic business prompt-to-deck template",
  "not a new starter package",
  "not a template marketplace",
  "not a WYSIWYG editor",
  "not an export, hosted-rendering, public-stability, external-alpha, or MCP implementation claim",
];

const architectureDiagramSrc =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='640'%20height='360'%20viewBox='0%200%20640%20360'%3E%3Crect%20width='640'%20height='360'%20fill='%23111827'/%3E%3Crect%20x='56'%20y='72'%20width='150'%20height='96'%20rx='8'%20fill='%2338bdf8'/%3E%3Crect%20x='245'%20y='72'%20width='150'%20height='96'%20rx='8'%20fill='%2322c55e'/%3E%3Crect%20x='434'%20y='72'%20width='150'%20height='96'%20rx='8'%20fill='%23f59e0b'/%3E%3Cpath%20d='M206%20120h39M395%20120h39'%20stroke='%23f8fafc'%20stroke-width='8'/%3E%3Ctext%20x='82'%20y='130'%20fill='%230f172a'%20font-size='22'%3ETSX%3C/text%3E%3Ctext%20x='269'%20y='130'%20fill='%230f172a'%20font-size='22'%3ECompile%3C/text%3E%3Ctext%20x='464'%20y='130'%20fill='%230f172a'%20font-size='22'%3EPreview%3C/text%3E%3C/svg%3E";
const dataEvidenceSrc =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='640'%20height='360'%20viewBox='0%200%20640%20360'%3E%3Crect%20width='640'%20height='360'%20fill='%23101820'/%3E%3Crect%20x='84'%20y='210'%20width='108'%20height='80'%20fill='%23ef4444'/%3E%3Crect%20x='266'%20y='140'%20width='108'%20height='150'%20fill='%232dd4bf'/%3E%3Crect%20x='448'%20y='92'%20width='108'%20height='198'%20fill='%2338bdf8'/%3E%3Ctext%20x='72'%20y='68'%20fill='%23f8fafc'%20font-size='30'%3ERepairability%20signals%3C/text%3E%3C/svg%3E";

const starterTheme = (
  <Theme
    name="phase-4-technical-talk-starter"
    tokens={{
      color: {
        accent: "#2dd4bf",
        background: "#101820",
        foreground: "#f8fafc",
        muted: "#9ca3af",
      },
      density: {
        comfortable: {
          maxCharactersPer1000Px2: 2.2,
          maxEstimatedLineCount: 5,
          repairDirection:
            "Shorten starter copy or split a reveal before accepting dense technical-talk text.",
        },
        compact: {
          maxCharactersPer1000Px2: 1.7,
          maxEstimatedLineCount: 3,
          repairDirection:
            "Move detail into Notes or a later Step when the starter becomes compact.",
        },
      },
      motion: {
        chapterShift: "650ms",
        reveal: "420ms",
      },
      spacing: {
        framePadding: 52,
        gutter: 24,
      },
      typography: {
        body: "Inter",
        heading: "Inter Tight",
      },
    }}
  />
) as ThemeDefinition;

export const phase4TechnicalTalkStarters = [
  {
    boundaryGuards: BOUNDARY_GUARDS,
    kind: "architecture-talk",
    localPreviewRepairWorkflow: LOCAL_PREVIEW_REPAIR_WORKFLOW,
    outline: [
      {
        purpose: "setup",
        slideId: "architecture-question",
        title: "Architecture question",
      },
      {
        purpose: "evidence",
        slideId: "architecture-spine",
        title: "Typed spine",
      },
    ],
    presenterMetadata: {
      chapters: [
        {
          id: "architecture",
          slideIds: ["architecture-question", "architecture-spine"],
          title: "Architecture talk",
        },
      ],
      hasNotes: true,
      hasOutline: true,
    },
    requiredSurfaces: REQUIRED_SURFACES,
    scope: "technical-talk",
    sourcePath: STARTER_SOURCE_PATH,
    targetAudience:
      "developers and technical communicators explaining a system architecture",
    title: "Architecture talk starter",
  },
  {
    boundaryGuards: BOUNDARY_GUARDS,
    kind: "data-explainer",
    localPreviewRepairWorkflow: LOCAL_PREVIEW_REPAIR_WORKFLOW,
    outline: [
      {
        purpose: "setup",
        slideId: "data-question",
        title: "Data question",
      },
      {
        purpose: "evidence",
        slideId: "data-evidence",
        title: "Evidence slice",
      },
    ],
    presenterMetadata: {
      chapters: [
        {
          id: "data",
          slideIds: ["data-question", "data-evidence"],
          title: "Data explainer",
        },
      ],
      hasNotes: true,
      hasOutline: true,
    },
    requiredSurfaces: REQUIRED_SURFACES,
    scope: "technical-talk",
    sourcePath: STARTER_SOURCE_PATH,
    targetAudience:
      "developers and technical communicators explaining a measured system tradeoff",
    title: "Data explainer starter",
  },
  {
    boundaryGuards: BOUNDARY_GUARDS,
    kind: "live-demo",
    localPreviewRepairWorkflow: LOCAL_PREVIEW_REPAIR_WORKFLOW,
    outline: [
      {
        purpose: "setup",
        slideId: "demo-contract",
        title: "Demo contract",
      },
      {
        purpose: "handoff",
        slideId: "demo-repair-loop",
        title: "Repair loop",
      },
    ],
    presenterMetadata: {
      chapters: [
        {
          id: "demo",
          slideIds: ["demo-contract", "demo-repair-loop"],
          title: "Live-demo talk",
        },
      ],
      hasNotes: true,
      hasOutline: true,
    },
    requiredSurfaces: REQUIRED_SURFACES,
    scope: "technical-talk",
    sourcePath: STARTER_SOURCE_PATH,
    targetAudience:
      "developers and technical communicators presenting a local demo or release readiness narrative",
    title: "Live-demo talk starter",
  },
] satisfies Phase4TechnicalTalkStarter[];

const architectureTalkStarter = (
  <Deck fps={24} navigationPolicy="queue-next" theme={starterTheme}>
    <Slide id="architecture-question">
      <Notes>
        Open with the architectural question, then name the contract each layer
        owns.
      </Notes>
      <SafeFont id="starter-architecture-font" family="Inter" timeoutMs={200} />
      <Step duration="2s">
        <ContentSlot
          id="architecture-question-slot"
          density="comfortable"
          readability="headline"
        >
          <TypographyBox
            id="architecture-question-title"
            maxHeight={132}
            maxWidth={820}
          >
            Which contract keeps an AI-authored talk repairable?
          </TypographyBox>
        </ContentSlot>
      </Step>
    </Slide>
    <ProductTransition kind="soft-fade" />
    <Slide id="architecture-spine">
      <Notes>
        Use the diagram as a presenter anchor: typed TSX, compile evidence, and
        preview diagnostics are separate responsibilities.
      </Notes>
      <SafeImage
        id="starter-architecture-diagram"
        src={architectureDiagramSrc}
        alt="Typed TSX flows through compile evidence into local preview diagnostics"
        timeoutMs={200}
      />
      <Step duration="2s">
        <MediaFrame
          id="starter-architecture-frame"
          aspectRatio={16 / 9}
          poster="/assets/phase4-starter-architecture.png"
        >
          TSX authoring, timeline compilation, and preview diagnostics stay
          inspectable.
        </MediaFrame>
      </Step>
    </Slide>
  </Deck>
) as DeckNode;

const dataExplainerStarter = (
  <Deck fps={24} navigationPolicy="queue-next" theme={starterTheme}>
    <Slide id="data-question">
      <Notes>
        State the measured question before choosing chart shape or visual
        emphasis.
      </Notes>
      <Step duration="2s">
        <ContentSlot
          id="data-question-slot"
          density="comfortable"
          readability="headline"
        >
          <TypographyBox
            id="data-question-title"
            maxHeight={120}
            maxWidth={780}
          >
            Which repair loop produces the most actionable diagnostics?
          </TypographyBox>
        </ContentSlot>
      </Step>
    </Slide>
    <ProductTransition kind="lateral-slide" />
    <Slide id="data-evidence">
      <Notes>
        Narrate the comparison through source IDs and diagnostics, not a generic
        chart flourish.
      </Notes>
      <SafeImage
        id="starter-data-evidence"
        src={dataEvidenceSrc}
        alt="Repairability signal comparison for a technical data explainer"
        timeoutMs={200}
      />
      <Step duration="2s">
        <MediaFrame
          id="starter-data-frame"
          aspectRatio={16 / 9}
          poster="/assets/phase4-starter-data.png"
        >
          Diagnostics-driven repair beats raw visual patching because the source
          ID stays visible.
        </MediaFrame>
      </Step>
      <Step duration="2s">
        <ContentSlot id="data-callout" density="compact" readability="body">
          <TypographyBox id="data-callout-copy" maxHeight={96} maxWidth={620}>
            Repair queue first; visual restyling second.
          </TypographyBox>
        </ContentSlot>
      </Step>
    </Slide>
  </Deck>
) as DeckNode;

const liveDemoStarter = (
  <Deck fps={24} navigationPolicy="queue-next" theme={starterTheme}>
    <Slide id="demo-contract">
      <Notes>
        Define what the live demo proves, what the audience should ignore, and
        where the maintainer can inspect the local preview.
      </Notes>
      <Step duration="2s">
        <ContentSlot
          id="demo-contract-slot"
          density="comfortable"
          readability="headline"
        >
          <TypographyBox
            id="demo-contract-title"
            maxHeight={128}
            maxWidth={820}
          >
            The demo proves the local product-layer loop, not a hosted service
          </TypographyBox>
        </ContentSlot>
      </Step>
      <Step kind="wait-for-event" exportDuration="3s">
        Pause before switching to the local preview route.
      </Step>
    </Slide>
    <ProductTransition kind="chapter-shift" />
    <Slide id="demo-repair-loop">
      <Notes>
        Keep the handoff practical: inspect presenter metadata, read
        diagnostics, edit authored TSX, and re-run the narrow check.
      </Notes>
      <Step duration="2s">
        <ContentSlot id="demo-repair-loop-slot" density="compact">
          <TypographyBox
            id="demo-repair-loop-copy"
            maxHeight={150}
            maxWidth={760}
          >
            Local Player, presenter context, diagnostics, authored repair,
            focused verification.
          </TypographyBox>
        </ContentSlot>
      </Step>
    </Slide>
  </Deck>
) as DeckNode;

const starterDecks = {
  "architecture-talk": architectureTalkStarter,
  "data-explainer": dataExplainerStarter,
  "live-demo": liveDemoStarter,
} satisfies Record<Phase4TechnicalTalkStarterKind, DeckNode>;

export function createPhase4TechnicalTalkStarterFixtures(): Phase4TechnicalTalkStarterFixture[] {
  return phase4TechnicalTalkStarters.map((starter) => {
    const deck = starterDecks[starter.kind];

    return {
      deck,
      kind: starter.kind,
      offlineTimeline: compile(deck, { mode: "offline" }),
      timeline: compile(deck),
    };
  });
}
