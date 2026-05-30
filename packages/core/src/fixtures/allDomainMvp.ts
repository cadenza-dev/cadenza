import {
  type CadenzaDiagnostic,
  ContentSlot,
  compile,
  Deck,
  type DeckNode,
  MediaFrame,
  Notes,
  SafeFont,
  SafeImage,
  SafeVideo,
  Slide,
  Step,
  Theme,
  type TimelineMap,
  Transition,
  TypographyBox,
  validatePreviewLayout,
} from "../index.ts";

export const REQUIRED_ALL_DOMAIN_MVP_SKILLS = [
  "cadenza-best-practices",
] as const;

type RequiredAllDomainMvpSkill =
  (typeof REQUIRED_ALL_DOMAIN_MVP_SKILLS)[number];

export type AllDomainMvpFixture = {
  deck: DeckNode;
  previewTimeline: TimelineMap;
  offlineTimeline: TimelineMap;
  previewDiagnostics: CadenzaDiagnostic[];
  skillGuidanceCues: Record<RequiredAllDomainMvpSkill, string[]>;
};

export function createAllDomainMvpFixture(): AllDomainMvpFixture {
  const deck = Deck({
    fps: 12,
    navigationPolicy: "queue-next",
    theme: Theme({
      name: "agent-technical-talk",
      tokens: {
        color: {
          background: "#0f172a",
          foreground: "#f8fafc",
          accent: "#2563eb",
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
          handoff: "500ms",
          reveal: "1s",
        },
      },
    }),
    children: [
      Slide({
        id: "opening",
        children: [
          Notes({
            children:
              "Frame the talk as a practical guide for reliable AI-authored decks.",
          }),
          Step({
            duration: "3s",
            children: ContentSlot({
              id: "opening-title-slot",
              density: "comfortable",
              readability: "headline",
              children: TypographyBox({
                id: "opening-title",
                maxWidth: 720,
                maxHeight: 120,
                children: "Cadenza: reliable AI-authored technical talks",
              }),
            }),
          }),
          Step({
            duration: "2s",
            children:
              "The compiler keeps semantic slide intent separate from frame math.",
          }),
        ],
      }),
      Transition({ kind: "fade", duration: "1s" }),
      Slide({
        id: "render-safe-demo",
        children: [
          Notes({
            children:
              "Show that render-safe resources are declared before the demo slide.",
          }),
          SafeImage({
            id: "architecture-map",
            src: "/assets/cadenza-architecture.png",
            alt: "Cadenza typed API to render-safe compiler map",
            timeoutMs: 200,
          }),
          SafeFont({
            id: "talk-font",
            family: "Inter",
            timeoutMs: 200,
          }),
          SafeVideo({
            id: "runtime-demo-video",
            src: "/assets/runtime-demo.mp4",
            timeoutMs: 200,
          }),
          Step({
            duration: "1s",
            children: [
              MediaFrame({
                id: "runtime-demo-frame",
                aspectRatio: 16 / 9,
                poster: "/assets/runtime-demo-poster.png",
                children: "Runtime preview clip",
              }),
              TypographyBox({
                id: "resource-contract",
                maxWidth: 640,
                maxHeight: 96,
                children:
                  "Resources declare readiness, timeout behavior, and validation surfaces.",
              }),
            ],
          }),
          Step({
            kind: "wait-for-event",
            exportDuration: "4s",
            children: "Pause for audience questions before showing repair.",
          }),
          Step({
            kind: "computed",
            duration: "2s",
            exportDuration: "2s",
            children: () => "Computed preview readiness summary",
          }),
        ],
      }),
      Transition({ kind: "slide", duration: "500ms" }),
      Slide({
        id: "agent-repair-loop",
        children: [
          Notes({
            children:
              "Close by showing how diagnostics become an agent repair queue.",
          }),
          Step({
            duration: "2s",
            children: ContentSlot({
              id: "repair-loop-slot",
              density: "compact",
              readability: "body",
              children:
                "compile -> browser validation -> createValidationReport -> repairQueue",
            }),
          }),
          Step({
            duration: "2s",
            children:
              "Agents follow skills before reaching for raw Remotion escape hatches.",
          }),
        ],
      }),
    ],
  });

  return {
    deck,
    previewTimeline: compile(deck),
    offlineTimeline: compile(deck, { mode: "offline" }),
    previewDiagnostics: validatePreviewLayout([
      {
        kind: "media-frame",
        source: "runtime-demo-frame",
        expectedAspectRatio: 16 / 9,
        clientWidth: 600,
        clientHeight: 400,
      },
      {
        kind: "typography-box",
        source: "resource-contract",
        clientWidth: 640,
        scrollWidth: 680,
        clientHeight: 96,
        scrollHeight: 96,
      },
    ]),
    skillGuidanceCues: {
      "cadenza-best-practices": [
        "Theme",
        "TypographyBox",
        "wait-for-event",
        "computed",
        "navigationPolicy",
        "SafeImage",
        "SafeFont",
        "SafeVideo",
        "createValidationReport",
        "repairQueue",
        "Notes",
        "presenter metadata",
      ],
    },
  };
}
