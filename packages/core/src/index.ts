export type {
  FrameSegment,
  TimelineMap,
  TimelineResource,
  TimelineSlide,
  TimelineStep,
  TransitionSegment,
} from "./compiler/compile.ts";
export { compile } from "./compiler/compile.ts";
export type { Cursor } from "./compiler/cursor.ts";
export { cursorAtFrame } from "./compiler/cursor.ts";
export type {
  CadenzaDiagnostic,
  DiagnosticSeverity,
} from "./diagnostics/types.ts";
export type {
  ClickRegion,
  ClickRegionAction,
  ClickRegionEvent,
  ClickRegionRect,
  ClickRegionTarget,
} from "./player/clickRegions.ts";
export { bindClickRegions } from "./player/clickRegions.ts";
export type {
  FullscreenControls,
  FullscreenPlayer,
} from "./player/fullscreen.ts";
export { createFullscreenControls } from "./player/fullscreen.ts";
export type {
  KeyboardNavigationEvent,
  KeyboardNavigationMap,
  KeyboardNavigationTarget,
} from "./player/keyboard.ts";
export { bindKeyboardNavigation } from "./player/keyboard.ts";
export type {
  FontVisibilityBinding,
  RenderSafeDomAdapter,
  RenderSafeDomAdapterOptions,
  VideoMetadataReadinessBinding,
} from "./render-safe/domAdapter.ts";
export { createRenderSafeDomAdapter } from "./render-safe/domAdapter.ts";
export type {
  ResourceReadiness,
  ResourceReadinessRegistry,
} from "./render-safe/readiness.ts";
export { createResourceReadiness } from "./render-safe/readiness.ts";
export type {
  ContentDensity,
  ContentReadability,
  ContentSlotMetadata,
  ContentSlotNode,
  ContentSlotProps,
  MediaFrameNode,
  MediaFrameProps,
  MediaFrameSnapshot,
  ReadableDensityBudget,
  ReadableDensityBudgets,
  RenderSafeNode,
  RenderSafeResourceNode,
  ResourceKind,
  SafeFontProps,
  SafeImageProps,
  SafeVideoProps,
  TypographyAutoFitConfig,
  TypographyBoxNode,
  TypographyBoxProps,
} from "./render-safe/resources.ts";
export {
  ContentSlot,
  MediaFrame,
  SafeFont,
  SafeImage,
  SafeVideo,
  TypographyBox,
} from "./render-safe/resources.ts";
export type {
  CadenzaRuntime,
  CadenzaRuntimeOptions,
  PresenterMetadata,
  RuntimeClock,
  SeekPlayer,
} from "./runtime/createRuntime.ts";
export { createRuntime } from "./runtime/createRuntime.ts";
export type {
  CadenzaNode,
  DeckNode,
  DeckProps,
  DurationToken,
  MotionTimingToken,
  NavigationPolicy,
  NotesNode,
  NotesProps,
  ProductTransitionKind,
  ProductTransitionMetadata,
  ProductTransitionProps,
  SlideNode,
  SlideProps,
  StepChildren,
  StepContext,
  StepKind,
  StepNode,
  StepProps,
  StepRenderFunction,
  StepStaticChild,
  ThemeDefinition,
  ThemeProps,
  ThemeTokens,
  TransitionKind,
  TransitionNode,
  TransitionProps,
} from "./typed-api/primitives.ts";
export {
  Deck,
  Notes,
  ProductTransition,
  Slide,
  Step,
  Theme,
  Transition,
} from "./typed-api/primitives.ts";
export type {
  Phase3BoundaryArtifact,
  RawRemotionUsageOptions,
} from "./validation/aiBoundaries.ts";
export {
  validatePhase3BoundaryClaims,
  validatePhase3DeferredScopeClaims,
  validateRawRemotionUsage,
} from "./validation/aiBoundaries.ts";
export type {
  MediaFrameMeasurement,
  PreviewLayoutMeasurement,
  TypographyBoxMeasurement,
} from "./validation/browser.ts";
export { validatePreviewLayout } from "./validation/browser.ts";
export { CadenzaValidationError } from "./validation/errors.ts";
export type {
  Phase3RepairEvidence,
  Phase3RepairEvidenceFinding,
} from "./validation/repairEvidence.ts";
export { validatePhase3RepairEvidence } from "./validation/repairEvidence.ts";
export type {
  CadenzaValidationReport,
  ValidationRepairQueueItem,
  ValidationReportSummary,
} from "./validation/report.ts";
export { createValidationReport } from "./validation/report.ts";
export { validateDeck } from "./validation/static.ts";
export type {
  TypographyDensityCategory,
  TypographyDensityDiagnostic,
  TypographyDensityInput,
  TypographyDensityMeasuredValues,
  TypographyDiagnosticLocator,
  TypographyFitDiagnostic,
  TypographyFitEvaluation,
  TypographyFitInput,
  TypographyFitMeasurement,
  TypographyFitResult,
  TypographyFitResultStatus,
  TypographyFontReadinessState,
} from "./validation/typographyDensity.ts";
export {
  fitTypographyBox,
  resolveReadableDensityBudget,
  validateTypographyDensity,
} from "./validation/typographyDensity.ts";
export type {
  Phase4OptionalVisualArtifact,
  Phase4VisualAcceptanceEvidence,
  Phase4VisualAcceptanceEvidenceFinding,
  Phase4VisualDiagnostic,
  Phase4VisualEvidenceReference,
  Phase4VisualFinding,
  Phase4VisualFindingCategory,
} from "./validation/visualAcceptanceEvidence.ts";
export {
  validatePhase4VisualAcceptanceEvidence,
  validatePhase4VisualCloseoutEvidence,
} from "./validation/visualAcceptanceEvidence.ts";
