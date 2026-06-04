export const sourceTypes = [
  "deck metadata",
  "validate summary",
  "player snapshot",
  "manifest",
  "format evidence",
  "prototype-only",
] as const;

export type SourceType = (typeof sourceTypes)[number];

export type Tone = "blocked" | "checking" | "neutral" | "ready" | "warning";

export type HealthState = "Blocked" | "Checking" | "Ready" | "Warnings";

type ReadinessStatus = "blocked" | "checking" | "limited" | "pending" | "ready";

type SourceMaterial = {
  readonly path: string;
  readonly role: string;
};

type DeckMetadata = {
  readonly boundaryGuards: readonly string[];
  readonly chapters: readonly {
    readonly id: string;
    readonly slideIds: readonly string[];
    readonly title: string;
  }[];
  readonly deckId: string;
  readonly exportCommand: string;
  readonly sourcePath: string;
  readonly stableHash: string;
  readonly targetAudience: string;
  readonly title: string;
};

export type OutlineEntry = {
  readonly chapterId: string;
  readonly purpose: "boundary" | "evidence" | "pipeline" | "positioning";
  readonly segment: readonly [number, number];
  readonly slideId: string;
  readonly summary: string;
  readonly title: string;
};

type Diagnostic = {
  readonly code: string;
  readonly hint: string;
  readonly locator: string;
  readonly message: string;
  readonly severity: "blocked" | "warning";
};

type Limitation = {
  readonly affected: string;
  readonly copy: string;
  readonly severity: "blocked" | "note" | "warning";
};

type Provenance = {
  readonly artifacts: readonly {
    readonly byteSize: number;
    readonly format: string;
    readonly path: string;
    readonly role: string;
    readonly sha256: string;
  }[];
  readonly formatCapabilities: readonly {
    readonly description: string;
    readonly format: string;
    readonly status: "limited" | "supported";
  }[];
  readonly manifestPath: string;
  readonly outputDirectory: string;
  readonly schemaVersion: string;
  readonly selector: {
    readonly alias: string;
    readonly requested: string;
    readonly resolvedPath: string;
    readonly source: string;
  };
};

export type PrototypeState = {
  readonly accent: Exclude<Tone, "neutral">;
  readonly defaultTopic: Topic;
  readonly description: string;
  readonly diagnostics: readonly Diagnostic[];
  readonly health: HealthState;
  readonly id: StateId;
  readonly label: string;
  readonly limitations: readonly Limitation[];
  readonly provenance: Provenance;
  readonly readiness: readonly {
    readonly label: string;
    readonly source: SourceType;
    readonly status: ReadinessStatus;
  }[];
  readonly selectedIndex: number;
  readonly statusCopy: string;
};

export const sourceMaterials = [
  {
    path: "examples/cadenza/alpha-readiness-talk.tsx",
    role: "deck metadata source",
  },
  {
    path: "dist/cadenza/cadenza-alpha-readiness-talk/playwright-b6-3-web/manifest.json",
    role: "Phase 6 local export manifest source material",
  },
  {
    path: "dist/cadenza/cadenza-alpha-readiness-talk/playwright-b6-3-web/web-evidence.json",
    role: "Phase 6 web format evidence source material",
  },
  {
    path: "QA/phase7-pre-architect-ui-prototype-decisions.md",
    role: "Q1-Q20 decision source",
  },
] as const satisfies readonly SourceMaterial[];

export const deck = {
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
  sourcePath: "examples/cadenza/alpha-readiness-talk.tsx",
  stableHash:
    "836218a30637584ef949bf545459625448a6938b91205ab0fddab1d4acc0bb97",
  targetAudience:
    "developers and technical maintainers evaluating Cadenza local export readiness",
  title: "Cadenza Alpha Readiness Talk",
} as const satisfies DeckMetadata;

export const outline = [
  {
    chapterId: "positioning",
    purpose: "positioning",
    segment: [0, 120],
    slideId: "local-alpha-contract",
    summary:
      "Cadenza has a local alpha candidate path without hosted, release, or adoption claims.",
    title: "Local alpha contract",
  },
  {
    chapterId: "positioning",
    purpose: "positioning",
    segment: [109, 240],
    slideId: "product-layer-to-local-export",
    summary:
      "The product layer becomes an export-focused talk source rather than a preview-only artifact.",
    title: "From product layer to export proof",
  },
  {
    chapterId: "export-pipeline",
    purpose: "pipeline",
    segment: [223, 360],
    slideId: "local-export-command",
    summary:
      "The command surface wraps local deck loading, validation, rendering, and evidence behind cadenza export.",
    title: "Command surface",
  },
  {
    chapterId: "export-pipeline",
    purpose: "evidence",
    segment: [342, 480],
    slideId: "deterministic-manifest",
    summary:
      "Stable timeline fields, slide order, and artifact inventory make repeat exports reviewable.",
    title: "Deterministic manifest",
  },
  {
    chapterId: "readiness",
    purpose: "evidence",
    segment: [464, 600],
    slideId: "evidence-gates",
    summary:
      "Export evidence feeds diagnostics, format scope, browser smoke, and Reviewer closeout gates.",
    title: "Evidence gates",
  },
  {
    chapterId: "readiness",
    purpose: "boundary",
    segment: [583, 720],
    slideId: "alpha-boundaries",
    summary:
      "Readiness remains local and traceable until Reviewer acceptance and explicit release approval.",
    title: "Alpha boundaries",
  },
] as const satisfies readonly OutlineEntry[];

const provenance = {
  artifacts: [
    {
      byteSize: 5720,
      format: "web",
      path: "index.html",
      role: "web-entrypoint",
      sha256: "956bcff4fb0b",
    },
    {
      byteSize: 4180,
      format: "web",
      path: "web-evidence.json",
      role: "format-evidence",
      sha256: "e8b7e651a97d",
    },
  ],
  formatCapabilities: [
    {
      description:
        "Static web compatibility artifact with semantic anchors and manifest-linked evidence.",
      format: "web",
      status: "supported",
    },
    {
      description:
        "MP4 evidence remains a finite media artifact without Player App chrome; current-page animation clipping stays a Stage A topic.",
      format: "mp4",
      status: "limited",
    },
  ],
  manifestPath: "manifest.json",
  outputDirectory:
    "dist/cadenza/cadenza-alpha-readiness-talk/playwright-b6-3-web",
  schemaVersion: "phase6-local-export",
  selector: {
    alias: "cadenza-alpha-readiness-talk",
    requested: "cadenza-alpha-readiness-talk",
    resolvedPath: "examples/cadenza/alpha-readiness-talk.tsx",
    source: "built-in-alias",
  },
} as const satisfies Provenance;

export const topics = [
  "Outline",
  "Readiness",
  "Diagnostics",
  "Provenance",
  "Notes",
  "Limitations",
] as const;

export type Topic = (typeof topics)[number];

export type StateId = "blocked" | "pending" | "provenance" | "ready";

export const states = {
  ready: {
    accent: "ready",
    defaultTopic: "Outline",
    description: "Happy path with all readiness checks complete.",
    diagnostics: [],
    health: "Ready",
    id: "ready",
    label: "Happy path",
    limitations: [
      {
        affected: "web export",
        copy: "This prototype is not the app-based web export contract.",
        severity: "note",
      },
    ],
    provenance,
    readiness: [
      { label: "Deck metadata", source: "deck metadata", status: "ready" },
      {
        label: "Validate summary",
        source: "validate summary",
        status: "ready",
      },
      { label: "Manifest evidence", source: "manifest", status: "ready" },
      { label: "Player snapshot", source: "player snapshot", status: "ready" },
    ],
    selectedIndex: 3,
    statusCopy: "All visible evidence is ready for inspection.",
  },
  pending: {
    accent: "checking",
    defaultTopic: "Readiness",
    description: "Pending readiness state for resource and snapshot stress.",
    diagnostics: [
      {
        code: "CADENZA_RESOURCE_PENDING",
        hint: "Wait for the font/video readiness branch or inspect the runtime snapshot.",
        locator: "slide:evidence-gates resource:runtime-demo-video",
        message: "One media resource is still reporting pending metadata.",
        severity: "warning",
      },
    ],
    health: "Checking",
    id: "pending",
    label: "Pending readiness",
    limitations: [
      {
        affected: "runtime snapshot",
        copy: "Pending resource names are prototype fixture fields, not a frozen snapshot schema.",
        severity: "note",
      },
    ],
    provenance,
    readiness: [
      { label: "Deck metadata", source: "deck metadata", status: "ready" },
      {
        label: "Validate summary",
        source: "validate summary",
        status: "ready",
      },
      {
        label: "Runtime demo video",
        source: "player snapshot",
        status: "checking",
      },
      { label: "Browser smoke", source: "format evidence", status: "pending" },
    ],
    selectedIndex: 4,
    statusCopy: "One pending resource, one non-blocking diagnostic.",
  },
  blocked: {
    accent: "blocked",
    defaultTopic: "Diagnostics",
    description: "Blocking diagnostic state with read-only repair guidance.",
    diagnostics: [
      {
        code: "RSRM_VIDEO_METADATA_TIMEOUT",
        hint: "Check media declaration and export evidence; do not repair inside Player App.",
        locator: "slide:evidence-gates component:runtime-demo-video",
        message:
          "Playback cannot proceed because video metadata did not resolve.",
        severity: "blocked",
      },
      {
        code: "CADENZA_LIMITATION_MP4_CLIPPING",
        hint: "Record finite MP4 clipping evidence in Stage A if promoted.",
        locator: "format:mp4 capability:current-page-animation",
        message: "MP4 continuous animation clipping remains limited.",
        severity: "warning",
      },
    ],
    health: "Blocked",
    id: "blocked",
    label: "Blocking diagnostic",
    limitations: [
      {
        affected: "playback",
        copy: "The top-center error bar is directional layout evidence, not final error copy.",
        severity: "blocked",
      },
      {
        affected: "repair path",
        copy: "Diagnostics expose locators and hints only; no Fix, AI patch, regenerate, or re-export action is present.",
        severity: "warning",
      },
    ],
    provenance,
    readiness: [
      { label: "Deck metadata", source: "deck metadata", status: "ready" },
      {
        label: "Validate summary",
        source: "validate summary",
        status: "ready",
      },
      {
        label: "Runtime video metadata",
        source: "player snapshot",
        status: "blocked",
      },
      {
        label: "Export evidence",
        source: "format evidence",
        status: "limited",
      },
    ],
    selectedIndex: 4,
    statusCopy: "One blocking playback issue, one limitation warning.",
  },
  provenance: {
    accent: "warning",
    defaultTopic: "Provenance",
    description: "Export provenance and known-limitation inspection state.",
    diagnostics: [
      {
        code: "CADENZA_WEB_EXPORT_COMPAT_ONLY",
        hint: "Stage A must distinguish app-based Player App web output from Phase 6 compatibility output.",
        locator:
          "dist/cadenza/cadenza-alpha-readiness-talk/playwright-b6-3-web/web-evidence.json",
        message:
          "Current source material is a static web compatibility artifact.",
        severity: "warning",
      },
    ],
    health: "Warnings",
    id: "provenance",
    label: "Provenance",
    limitations: [
      {
        affected: "fixture",
        copy: "Generated dist artifacts are source material only, not canonical fixtures.",
        severity: "warning",
      },
      {
        affected: "production data",
        copy: "Field names and grouping remain Stage A data-contract questions.",
        severity: "note",
      },
    ],
    provenance,
    readiness: [
      { label: "Manifest reference", source: "manifest", status: "ready" },
      { label: "Web evidence", source: "format evidence", status: "ready" },
      { label: "MP4 limitation", source: "format evidence", status: "limited" },
      {
        label: "Prototype fixture",
        source: "prototype-only",
        status: "limited",
      },
    ],
    selectedIndex: 3,
    statusCopy: "Two provenance warnings; app-web contract remains Stage A.",
  },
} as const satisfies Record<StateId, PrototypeState>;

export const provenanceRows = [
  ["deck.title", "deck metadata", "examples/cadenza/alpha-readiness-talk.tsx"],
  ["deck.deckId", "deck metadata", "examples/cadenza/alpha-readiness-talk.tsx"],
  [
    "deck.sourcePath",
    "deck metadata",
    "examples/cadenza/alpha-readiness-talk.tsx",
  ],
  [
    "outline[]",
    "deck metadata + format evidence",
    "deck metadata and web-evidence semanticAnchors",
  ],
  ["chapters[]", "deck metadata", "examples/cadenza/alpha-readiness-talk.tsx"],
  ["stableHash", "manifest", "dist/cadenza/.../manifest.json"],
  ["selector.*", "manifest", "dist/cadenza/.../manifest.json"],
  [
    "artifacts[]",
    "manifest + format evidence",
    "manifest.json and web-evidence.json",
  ],
  [
    "readiness[]",
    "validate summary + player snapshot + prototype-only",
    "representative state fixture",
  ],
  [
    "diagnostics[]",
    "player snapshot + prototype-only",
    "representative state fixture",
  ],
  [
    "limitations[]",
    "format evidence + prototype-only",
    "Q5/Q12/Q17 decisions and state fixture",
  ],
  ["layout state", "prototype-only", "Q5-Q8 visual prototype controls"],
  [
    "fullscreen/touch behavior",
    "prototype-only",
    "fullscreen-navigation-guideline.md",
  ],
  [
    "presenter-view representation",
    "prototype-only",
    "presenter-view-guideline.md",
  ],
] as const satisfies readonly (readonly [
  field: string,
  source: string,
  note: string,
])[];
