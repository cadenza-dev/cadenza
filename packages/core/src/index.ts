export type {
  FrameSegment,
  TimelineMap,
  TimelineResource,
  TimelineSlide,
  TimelineStep,
  TransitionSegment,
} from "./compiler/compile.js";
export { compile } from "./compiler/compile.js";
export type { Cursor } from "./compiler/cursor.js";
export { cursorAtFrame } from "./compiler/cursor.js";
export type {
  CadenzaDiagnostic,
  DiagnosticSeverity,
} from "./diagnostics/types.js";
export type {
  ClickRegion,
  ClickRegionAction,
  ClickRegionEvent,
  ClickRegionRect,
  ClickRegionTarget,
} from "./player/clickRegions.js";
export { bindClickRegions } from "./player/clickRegions.js";
export type {
  FullscreenControls,
  FullscreenPlayer,
} from "./player/fullscreen.js";
export { createFullscreenControls } from "./player/fullscreen.js";
export type {
  KeyboardNavigationEvent,
  KeyboardNavigationMap,
  KeyboardNavigationTarget,
} from "./player/keyboard.js";
export { bindKeyboardNavigation } from "./player/keyboard.js";
export type {
  ResourceReadiness,
  ResourceReadinessRegistry,
} from "./render-safe/readiness.js";
export { createResourceReadiness } from "./render-safe/readiness.js";
export type {
  ContentDensity,
  ContentReadability,
  ContentSlotMetadata,
  ContentSlotNode,
  ContentSlotProps,
  MediaFrameNode,
  MediaFrameProps,
  MediaFrameSnapshot,
  RenderSafeNode,
  RenderSafeResourceNode,
  ResourceKind,
  SafeFontProps,
  SafeImageProps,
  SafeVideoProps,
  TypographyBoxNode,
  TypographyBoxProps,
} from "./render-safe/resources.js";
export {
  ContentSlot,
  MediaFrame,
  SafeFont,
  SafeImage,
  SafeVideo,
  TypographyBox,
} from "./render-safe/resources.js";
export type {
  CadenzaRuntime,
  CadenzaRuntimeOptions,
  PresenterMetadata,
  RuntimeClock,
  SeekPlayer,
} from "./runtime/createRuntime.js";
export { createRuntime } from "./runtime/createRuntime.js";
export type {
  CadenzaNode,
  DeckNode,
  DeckProps,
  DurationToken,
  NavigationPolicy,
  NotesNode,
  NotesProps,
  SlideNode,
  SlideProps,
  StepKind,
  StepNode,
  StepProps,
  ThemeDefinition,
  ThemeProps,
  ThemeTokens,
  TransitionKind,
  TransitionNode,
  TransitionProps,
} from "./typed-api/primitives.js";
export {
  Deck,
  Notes,
  Slide,
  Step,
  Theme,
  Transition,
} from "./typed-api/primitives.js";
export type {
  PreviewLayoutMeasurement,
  TypographyBoxMeasurement,
} from "./validation/browser.js";
export { validatePreviewLayout } from "./validation/browser.js";
export { CadenzaValidationError } from "./validation/errors.js";
export type {
  CadenzaValidationReport,
  ValidationRepairQueueItem,
  ValidationReportSummary,
} from "./validation/report.js";
export { createValidationReport } from "./validation/report.js";
export { validateDeck } from "./validation/static.js";
