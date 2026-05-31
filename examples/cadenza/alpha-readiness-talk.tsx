import {
  ContentSlot,
  Deck,
  type DeckNode,
  Notes,
  ProductTransition,
  SafeFont,
  Slide,
  Step,
  Theme,
  type ThemeDefinition,
  type TypographyAutoFitConfig,
  TypographyBox,
} from "@cadenza-dev/core";

export type CadenzaAlphaReadinessTalkOutlineEntry = {
  chapterId: string;
  purpose: "boundary" | "evidence" | "pipeline" | "positioning";
  slideId: string;
  summary: string;
  title: string;
};

export type CadenzaAlphaReadinessTalkChapter = {
  id: string;
  slideIds: string[];
  title: string;
};

export type CadenzaAlphaReadinessTalkMetadata = {
  boundaryGuards: string[];
  chapters: CadenzaAlphaReadinessTalkChapter[];
  deckId: "cadenza-alpha-readiness-talk";
  exportCommand: "cadenza export cadenza-alpha-readiness-talk";
  outline: CadenzaAlphaReadinessTalkOutlineEntry[];
  scope: "technical-talk";
  sourcePath: "examples/cadenza/alpha-readiness-talk.tsx";
  targetAudience: string;
  title: "Cadenza Alpha Readiness Talk";
};

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

export const cadenzaAlphaReadinessTalkTheme = (
  <Theme
    name="cadenza-alpha-readiness"
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
            "Split operational detail into another reveal before accepting dense copy.",
        },
        compact: {
          maxCharactersPer1000Px2: 1.6,
          maxEstimatedLineCount: 3,
          repairDirection:
            "Move operational detail into Notes or evidence before claiming readiness.",
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

export const cadenzaDeckMetadata = {
  boundaryGuards: [
    "no hosted rendering claim",
    "no npm publication claim",
    "no external alpha adoption claim",
    "no broad arbitrary-deck export claim",
    "no Player App export claim",
  ],
  chapters: [
    {
      id: "positioning",
      slideIds: ["local-alpha-contract", "product-layer-to-local-export"],
      title: "Alpha contract",
    },
    {
      id: "export-pipeline",
      slideIds: ["local-export-command", "deterministic-manifest"],
      title: "Local export pipeline",
    },
    {
      id: "readiness",
      slideIds: ["evidence-gates", "alpha-boundaries"],
      title: "Readiness boundaries",
    },
  ],
  deckId: "cadenza-alpha-readiness-talk",
  exportCommand: "cadenza export cadenza-alpha-readiness-talk",
  outline: [
    {
      chapterId: "positioning",
      purpose: "positioning",
      slideId: "local-alpha-contract",
      summary:
        "Cadenza has a local alpha candidate path without hosted, release, or adoption claims.",
      title: "Local alpha contract",
    },
    {
      chapterId: "positioning",
      purpose: "positioning",
      slideId: "product-layer-to-local-export",
      summary:
        "The product layer becomes an export-focused talk source rather than a preview-only artifact.",
      title: "From product layer to export proof",
    },
    {
      chapterId: "export-pipeline",
      purpose: "pipeline",
      slideId: "local-export-command",
      summary:
        "The command surface wraps local deck loading, validation, rendering, and evidence behind cadenza export.",
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
        "Export evidence feeds diagnostics, format scope, browser smoke, and Reviewer closeout gates.",
      title: "Evidence gates",
    },
    {
      chapterId: "readiness",
      purpose: "boundary",
      slideId: "alpha-boundaries",
      summary:
        "Readiness remains local and traceable until Reviewer acceptance and explicit release approval.",
      title: "Alpha boundaries",
    },
  ],
  scope: "technical-talk",
  sourcePath: "examples/cadenza/alpha-readiness-talk.tsx",
  targetAudience:
    "developers and technical maintainers evaluating Cadenza local export readiness",
  title: "Cadenza Alpha Readiness Talk",
} satisfies CadenzaAlphaReadinessTalkMetadata;

const cadenzaAlphaReadinessTalk = (
  <Deck
    fps={24}
    navigationPolicy="queue-next"
    theme={cadenzaAlphaReadinessTalkTheme}
  >
    <Slide id="local-alpha-contract">
      <Notes>
        Open by naming the local alpha candidate as reviewable infrastructure,
        not a hosted or published release.
      </Notes>
      <SafeFont id="alpha-talk-font" family="Inter" timeoutMs={200} />
      <Step duration="3s">
        <ContentSlot
          id="local-alpha-contract-title"
          density="comfortable"
          readability="headline"
        >
          <TypographyBox
            autoFit={TITLE_AUTO_FIT}
            id="local-alpha-contract-title"
            maxHeight={148}
            maxWidth={860}
          >
            Cadenza has a local export path worth reviewing
          </TypographyBox>
        </ContentSlot>
      </Step>
      <Step duration="2s">
        The alpha candidate is a repository artifact: authored TSX, local
        command, generated web bundle, MP4 output, manifest, and trace evidence.
      </Step>
    </Slide>
    <ProductTransition kind="soft-fade" />
    <Slide id="product-layer-to-local-export">
      <Notes>
        Connect the product-layer preview loop to the export source without
        widening the local export claim.
      </Notes>
      <Step duration="3s">
        <ContentSlot id="product-layer-to-local-export-slot" readability="body">
          <TypographyBox
            autoFit={BODY_AUTO_FIT}
            id="product-layer-to-local-export-copy"
            maxHeight={184}
            maxWidth={840}
          >
            The product layer makes talks previewable; local export makes the
            same authoring discipline inspectable through deterministic offline
            compilation.
          </TypographyBox>
        </ContentSlot>
      </Step>
      <Step duration="2s">
        The visible story is durable Cadenza behavior: author a technical talk,
        validate it, export it locally, and inspect the evidence.
      </Step>
    </Slide>
    <ProductTransition kind="chapter-shift" />
    <Slide id="local-export-command">
      <Step duration="3s">
        <ContentSlot id="local-export-command-slot" readability="body">
          <TypographyBox
            autoFit={BODY_AUTO_FIT}
            id="local-export-command-copy"
            maxHeight={184}
            maxWidth={840}
          >
            pnpm cadenza export cadenza-alpha-readiness-talk --format web,mp4
          </TypographyBox>
        </ContentSlot>
      </Step>
      <Step duration="2s">
        The command produces local artifacts and structured evidence without
        claiming cloud rendering, publication, or unsupported formats.
      </Step>
    </Slide>
    <ProductTransition kind="soft-fade" />
    <Slide id="deterministic-manifest">
      <Step duration="3s">
        <ContentSlot id="deterministic-manifest-slot" readability="body">
          <TypographyBox
            autoFit={BODY_AUTO_FIT}
            id="deterministic-manifest-copy"
            maxHeight={184}
            maxWidth={840}
          >
            The manifest records deck identity, selected formats, artifact
            inventory, capability status, timeline digest, and repair-friendly
            diagnostics.
          </TypographyBox>
        </ContentSlot>
      </Step>
    </Slide>
    <ProductTransition kind="chapter-shift" />
    <Slide id="evidence-gates">
      <Step duration="3s">
        <ContentSlot id="evidence-gates-slot" readability="body">
          <TypographyBox
            autoFit={BODY_AUTO_FIT}
            id="evidence-gates-copy"
            maxHeight={184}
            maxWidth={840}
          >
            Evidence is meant for maintainers and agents: it makes each local
            export inspectable, repeatable, and bounded by explicit diagnostics.
          </TypographyBox>
        </ContentSlot>
      </Step>
    </Slide>
    <ProductTransition kind="soft-fade" />
    <Slide id="alpha-boundaries">
      <Step duration="3s">
        <ContentSlot id="alpha-boundaries-slot" readability="body">
          <TypographyBox
            autoFit={BODY_AUTO_FIT}
            id="alpha-boundaries-copy"
            maxHeight={184}
            maxWidth={840}
          >
            The local workflow is ready for review before it is ready for a
            public release announcement.
          </TypographyBox>
        </ContentSlot>
      </Step>
    </Slide>
  </Deck>
) as DeckNode;

export function createCadenzaDeck(): DeckNode {
  return cadenzaAlphaReadinessTalk;
}
