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
  type TypographyAutoFitConfig,
  TypographyBox,
} from "@cadenza-dev/core";

export type Phase5AlphaReadinessTalkOutlineEntry = {
  chapterId: string;
  purpose: "positioning" | "pipeline" | "evidence" | "boundary";
  slideId: string;
  summary: string;
  title: string;
};

export type Phase5AlphaReadinessTalkChapter = {
  id: string;
  slideIds: string[];
  title: string;
};

export type Phase5AlphaReadinessTalkMetadata = {
  boundaryGuards: string[];
  chapters: Phase5AlphaReadinessTalkChapter[];
  deckId: "phase5-alpha-readiness-talk";
  exportCommand: "cadenza export phase5-alpha-readiness-talk";
  outline: Phase5AlphaReadinessTalkOutlineEntry[];
  scope: "technical-talk";
  sourcePath: "examples/phase5/alpha-readiness-talk.tsx";
  targetAudience: string;
  title: string;
};

export type Phase5AlphaReadinessTalkFixture = {
  deck: DeckNode;
  offlineTimeline: TimelineMap;
  timeline: TimelineMap;
};

const EXPORT_PIPELINE_SRC =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='720'%20height='405'%20viewBox='0%200%20720%20405'%3E%3Crect%20width='720'%20height='405'%20fill='%230b1220'/%3E%3Crect%20x='64'%20y='112'%20width='148'%20height='84'%20rx='8'%20fill='%2338bdf8'/%3E%3Crect%20x='286'%20y='112'%20width='148'%20height='84'%20rx='8'%20fill='%2322c55e'/%3E%3Crect%20x='508'%20y='112'%20width='148'%20height='84'%20rx='8'%20fill='%23f59e0b'/%3E%3Cpath%20d='M212%20154h74M434%20154h74'%20stroke='%23f8fafc'%20stroke-width='8'/%3E%3Ctext%20x='92'%20y='162'%20fill='%230b1220'%20font-family='Inter%2CArial'%20font-size='22'%3ETSX%20talk%3C/text%3E%3Ctext%20x='310'%20y='162'%20fill='%230b1220'%20font-family='Inter%2CArial'%20font-size='22'%3Ecompile%3C/text%3E%3Ctext%20x='530'%20y='162'%20fill='%230b1220'%20font-family='Inter%2CArial'%20font-size='22'%3Eweb%20bundle%3C/text%3E%3Ctext%20x='80'%20y='286'%20fill='%23f8fafc'%20font-family='Inter%2CArial'%20font-size='26'%3EDeterministic%20manifest%20anchors%20review%20and%20repair.%3C/text%3E%3C/svg%3E";

const ALPHA_BOUNDARY_SRC =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='720'%20height='405'%20viewBox='0%200%20720%20405'%3E%3Crect%20width='720'%20height='405'%20fill='%23101820'/%3E%3Ccircle%20cx='172'%20cy='178'%20r='80'%20fill='%2322c55e'/%3E%3Ccircle%20cx='360'%20cy='178'%20r='80'%20fill='%2338bdf8'/%3E%3Ccircle%20cx='548'%20cy='178'%20r='80'%20fill='%23f97316'/%3E%3Ctext%20x='126'%20y='184'%20fill='%230f172a'%20font-family='Inter%2CArial'%20font-size='24'%3Elocal%3C/text%3E%3Ctext%20x='312'%20y='184'%20fill='%230f172a'%20font-family='Inter%2CArial'%20font-size='24'%3Eevidence%3C/text%3E%3Ctext%20x='504'%20y='184'%20fill='%230f172a'%20font-family='Inter%2CArial'%20font-size='24'%3Escope%3C/text%3E%3Ctext%20x='110'%20y='314'%20fill='%23f8fafc'%20font-family='Inter%2CArial'%20font-size='26'%3EAlpha%20readiness%20is%20traceable%2C%20not%20announced.%3C/text%3E%3C/svg%3E";

const BODY_AUTO_FIT = {
  baseFontSizePx: 30,
  baseLineHeight: 1.3,
  baseSpacingPx: 12,
  minFontSizePx: 20,
  minLineHeight: 1.12,
  minSpacingPx: 4,
} satisfies TypographyAutoFitConfig;

const TITLE_AUTO_FIT = {
  baseFontSizePx: 46,
  baseLineHeight: 1.12,
  baseSpacingPx: 10,
  minFontSizePx: 30,
  minLineHeight: 1.04,
  minSpacingPx: 4,
} satisfies TypographyAutoFitConfig;

export const phase5AlphaReadinessTalkTheme = (
  <Theme
    name="phase-5-alpha-readiness"
    tokens={{
      color: {
        accent: "#22c55e",
        background: "#101820",
        foreground: "#f8fafc",
        muted: "#94a3b8",
        warning: "#f97316",
      },
      density: {
        comfortable: {
          maxCharactersPer1000Px2: 2.2,
          maxEstimatedLineCount: 5,
          repairDirection:
            "Split launch-candidate detail into another reveal before accepting dense copy.",
        },
        compact: {
          maxCharactersPer1000Px2: 1.6,
          maxEstimatedLineCount: 3,
          repairDirection:
            "Move operational detail into Notes or evidence before claiming alpha readiness.",
        },
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

export const phase5AlphaReadinessTalkMetadata = {
  boundaryGuards: [
    "no hosted rendering claim",
    "no npm publication claim",
    "no external alpha adoption claim",
    "no broad arbitrary-deck export claim",
    "no tool-based MCP claim",
  ],
  chapters: [
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
  ],
  deckId: "phase5-alpha-readiness-talk",
  exportCommand: "cadenza export phase5-alpha-readiness-talk",
  outline: [
    {
      chapterId: "positioning",
      purpose: "positioning",
      slideId: "launch-contract",
      summary:
        "Phase 5 proves a local launch-candidate path without hosted, release, or adoption claims.",
      title: "Local launch contract",
    },
    {
      chapterId: "positioning",
      purpose: "positioning",
      slideId: "phase4-to-phase5",
      summary:
        "The Phase 4 product layer becomes an export-focused talk source rather than a preview-only artifact.",
      title: "From product layer to export proof",
    },
    {
      chapterId: "export-pipeline",
      purpose: "pipeline",
      slideId: "local-export-command",
      summary:
        "The public command shape wraps the implementation detail behind cadenza export.",
      title: "Command surface",
    },
    {
      chapterId: "export-pipeline",
      purpose: "evidence",
      slideId: "deterministic-manifest",
      summary:
        "Stable timeline fields, slide order, and artifact inventory make repeat exports reviewable.",
      title: "Deterministic manifest",
    },
    {
      chapterId: "readiness",
      purpose: "evidence",
      slideId: "evidence-gates",
      summary:
        "Export evidence feeds parity, diagnostics, format scope, and Reviewer closeout gates.",
      title: "Evidence gates",
    },
    {
      chapterId: "readiness",
      purpose: "boundary",
      slideId: "alpha-boundaries",
      summary:
        "Alpha readiness remains local and traceable until Reviewer acceptance and explicit release approval.",
      title: "Alpha boundaries",
    },
  ],
  scope: "technical-talk",
  sourcePath: "examples/phase5/alpha-readiness-talk.tsx",
  targetAudience:
    "developers and technical maintainers evaluating Cadenza local export readiness",
  title: "Cadenza Phase 5 Alpha Readiness Talk",
} satisfies Phase5AlphaReadinessTalkMetadata;

export const cadenzaDeckMetadata = phase5AlphaReadinessTalkMetadata;

const phase5AlphaReadinessTalk = (
  <Deck
    fps={24}
    navigationPolicy="queue-next"
    theme={phase5AlphaReadinessTalkTheme}
  >
    <Slide id="launch-contract">
      <Notes>
        Open by naming Phase 5 as a local launch-candidate proof, not a hosted
        or published release.
      </Notes>
      <SafeFont id="phase-5-talk-font" family="Inter" timeoutMs={200} />
      <Step duration="3s">
        <ContentSlot
          id="launch-contract-title"
          density="comfortable"
          readability="headline"
        >
          <TypographyBox
            autoFit={TITLE_AUTO_FIT}
            id="launch-contract-title"
            maxHeight={148}
            maxWidth={860}
          >
            Cadenza Phase 5 proves a local export path worth reviewing
          </TypographyBox>
        </ContentSlot>
      </Step>
      <Step duration="2s">
        The launch candidate is a repository artifact: authored TSX, local
        command, generated web bundle, manifest, and trace evidence.
      </Step>
    </Slide>
    <ProductTransition kind="soft-fade" />
    <Slide id="phase4-to-phase5">
      <Notes>
        Connect the accepted Phase 4 product-layer loop to the export source
        without mutating the dogfood talk into a catch-all.
      </Notes>
      <Step duration="3s">
        <ContentSlot id="phase4-to-phase5-slot" readability="body">
          <TypographyBox
            autoFit={BODY_AUTO_FIT}
            id="phase4-to-phase5-copy"
            maxHeight={184}
            maxWidth={840}
          >
            Phase 4 made the talk previewable; Phase 5 makes the same product
            discipline exportable through deterministic offline compilation.
          </TypographyBox>
        </ContentSlot>
      </Step>
      <Step
        kind="computed"
        duration="2s"
        exportDuration="2s"
        children={({ fps, slideId, stepIndex }) =>
          `${slideId}:${stepIndex} anchors the export timeline at ${fps}fps.`
        }
      />
    </Slide>
    <ProductTransition kind="chapter-shift" />
    <Slide id="local-export-command">
      <Notes>
        Treat the command as the user-facing contract; the script behind it can
        stay narrow while Phase 5 proves the canonical deck.
      </Notes>
      <SafeImage
        id="phase-5-export-pipeline"
        src={EXPORT_PIPELINE_SRC}
        alt="Cadenza export pipeline from TSX talk through compile evidence into a web bundle"
        timeoutMs={200}
      />
      <Step duration="3s">
        <MediaFrame
          id="phase-5-export-pipeline-frame"
          aspectRatio={16 / 9}
          poster="/assets/phase5-export-pipeline.png"
        >
          cadenza export phase5-alpha-readiness-talk writes a reviewable local
          web bundle.
        </MediaFrame>
      </Step>
      <Step duration="2s">
        Temporary implementation detail stays wrapped behind the supported
        command surface.
      </Step>
    </Slide>
    <ProductTransition kind="lateral-slide" />
    <Slide id="deterministic-manifest">
      <Notes>
        Emphasize stable fields: the run directory may change, but timeline
        identity, slide order, and artifact inventory should not.
      </Notes>
      <Step duration="3s">
        <ContentSlot id="deterministic-manifest-slot" density="compact">
          <TypographyBox
            autoFit={BODY_AUTO_FIT}
            id="deterministic-manifest-copy"
            maxHeight={160}
            maxWidth={800}
          >
            Determinism means repeat exports preserve timeline identity, slide
            and step ordering, transition windows, and declared artifacts.
          </TypographyBox>
        </ContentSlot>
      </Step>
      <Step duration="2s">
        The manifest names source deck, command, output directory, artifacts,
        stable hash, and local-only boundary.
      </Step>
    </Slide>
    <ProductTransition kind="soft-fade" />
    <Slide id="evidence-gates">
      <Notes>
        Route later Phase 5 batches through evidence rather than chat-only
        declarations.
      </Notes>
      <Step duration="3s">
        <ContentSlot id="evidence-gates-slot" readability="body">
          <TypographyBox
            autoFit={BODY_AUTO_FIT}
            id="evidence-gates-copy"
            maxHeight={168}
            maxWidth={840}
          >
            Export evidence becomes the shared input for preview parity,
            diagnostics, MP4 scope, alpha readiness, and Reviewer closeout.
          </TypographyBox>
        </ContentSlot>
      </Step>
      <Step kind="wait-for-event" exportDuration="3s">
        Pause before separating readiness evidence from release claims.
      </Step>
    </Slide>
    <ProductTransition kind="chapter-shift" />
    <Slide id="alpha-boundaries">
      <Notes>
        Keep the closeout honest: web export is baseline, MP4 is scoped later in
        Phase 5, and PDF remains waived by default.
      </Notes>
      <SafeImage
        id="phase-5-alpha-boundaries"
        src={ALPHA_BOUNDARY_SRC}
        alt="Alpha readiness boundary diagram showing local evidence and explicit scope"
        timeoutMs={200}
      />
      <Step duration="3s">
        <MediaFrame
          id="phase-5-alpha-boundaries-frame"
          aspectRatio={16 / 9}
          poster="/assets/phase5-alpha-boundaries.png"
        >
          Local evidence first; Reviewer acceptance before readiness; separate
          approval before release or publication.
        </MediaFrame>
      </Step>
      <Step duration="2s">
        No hosted rendering, npm publication, external alpha adoption, or broad
        arbitrary-deck export claim is made by this talk.
      </Step>
    </Slide>
  </Deck>
) as DeckNode;

export function createCadenzaDeck(): DeckNode {
  return phase5AlphaReadinessTalk;
}

export function createPhase5AlphaReadinessTalkFixture(): Phase5AlphaReadinessTalkFixture {
  return {
    deck: phase5AlphaReadinessTalk,
    offlineTimeline: compile(phase5AlphaReadinessTalk, { mode: "offline" }),
    timeline: compile(phase5AlphaReadinessTalk),
  };
}
