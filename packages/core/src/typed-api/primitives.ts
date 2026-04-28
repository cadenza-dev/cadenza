import type { RenderSafeNode } from "../render-safe/resources.js";

export type DurationToken = number | `${number}ms` | `${number}s`;

export type NavigationPolicy =
  | "cut-to-next"
  | "finish-then-advance"
  | "queue-next";

export type StepKind = "fixed" | "wait-for-event" | "computed";

export type TransitionKind = "cut" | "fade" | "slide" | (string & {});

export type StepContext = {
  fps: number;
  slideId: string;
  stepIndex: number;
};

export type StepStaticChild =
  | string
  | number
  | boolean
  | null
  | undefined
  | CadenzaNode
  | StepStaticChild[];

export type StepRenderFunction = (context: StepContext) => StepStaticChild;

export type StepChildren = StepStaticChild | StepRenderFunction;

export type ThemeTokens = {
  color?: Record<string, string>;
  typography?: Record<string, string>;
  spacing?: Record<string, number | string>;
  motion?: Record<string, DurationToken>;
};

export type ThemeProps = {
  name: string;
  tokens: ThemeTokens;
};

export type ThemeDefinition = {
  kind: "theme";
  name: string;
  tokens: ThemeTokens;
};

export type DeckProps = {
  fps?: number;
  theme?: ThemeDefinition;
  navigationPolicy?: NavigationPolicy;
  children?: CadenzaChildren;
};

export type SlideProps = {
  id: string;
  duration?: DurationToken;
  children?: CadenzaChildren;
};

export type StepProps = {
  kind?: StepKind;
  duration?: DurationToken;
  exportDuration?: DurationToken;
  children?: StepChildren;
};

export type TransitionProps = {
  kind: TransitionKind;
  duration: DurationToken;
};

export type NotesProps = {
  children?: string | string[];
};

export type DeckNode = {
  kind: "deck";
  fps: number;
  theme?: ThemeDefinition;
  navigationPolicy: NavigationPolicy;
  children: CadenzaNode[];
};

export type SlideNode = {
  kind: "slide";
  id: string;
  duration?: DurationToken;
  children: CadenzaNode[];
};

export type StepNode = {
  kind: "step";
  stepKind: StepKind;
  duration?: DurationToken;
  exportDuration?: DurationToken;
  children?: StepChildren;
};

export type TransitionNode = {
  kind: "transition";
  transitionKind: TransitionKind;
  duration: DurationToken;
};

export type NotesNode = {
  kind: "notes";
  children: string;
};

export type CadenzaNode =
  | DeckNode
  | SlideNode
  | StepNode
  | TransitionNode
  | NotesNode
  | ThemeDefinition
  | RenderSafeNode;

type CadenzaChildren = CadenzaNode | CadenzaNode[];

const DEFAULT_FPS = 30;
const DEFAULT_NAVIGATION_POLICY: NavigationPolicy = "cut-to-next";
const DEFAULT_STEP_KIND: StepKind = "fixed";

export function Theme(props: ThemeProps): ThemeDefinition {
  return {
    kind: "theme",
    name: props.name,
    tokens: props.tokens,
  };
}

export function Deck(props: DeckProps): DeckNode {
  return {
    kind: "deck",
    fps: props.fps ?? DEFAULT_FPS,
    theme: props.theme,
    navigationPolicy: props.navigationPolicy ?? DEFAULT_NAVIGATION_POLICY,
    children: normalizeChildren(props.children),
  };
}

export function Slide(props: SlideProps): SlideNode {
  return {
    kind: "slide",
    id: props.id,
    duration: props.duration,
    children: normalizeChildren(props.children),
  };
}

export function Step(props: StepProps): StepNode {
  return {
    kind: "step",
    stepKind: props.kind ?? DEFAULT_STEP_KIND,
    duration: props.duration,
    exportDuration: props.exportDuration,
    children: props.children,
  };
}

export function Transition(props: TransitionProps): TransitionNode {
  return {
    kind: "transition",
    transitionKind: props.kind,
    duration: props.duration,
  };
}

export function Notes(props: NotesProps): NotesNode {
  return {
    kind: "notes",
    children: normalizeTextChildren(props.children),
  };
}

function normalizeChildren(
  children: CadenzaChildren | undefined,
): CadenzaNode[] {
  if (children === undefined) {
    return [];
  }

  return Array.isArray(children) ? children : [children];
}

function normalizeTextChildren(children: NotesProps["children"]): string {
  if (children === undefined) {
    return "";
  }

  return Array.isArray(children) ? children.join("") : children;
}
