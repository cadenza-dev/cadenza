export type {
  ExportLocalOptions,
  ExportLocalResult,
  InspectExportArtifactOptions,
  InspectExportArtifactResult,
  LocalExportArtifactRecord,
  LocalExportCapabilityStatus,
  LocalExportFormatCapability,
  LocalExportFormatEvidence,
  LocalExportManifest,
  ValidateDeckLocalOptions,
  ValidateDeckLocalResult,
} from "./artifacts.ts";
export {
  exportDeckLocal,
  inspectExportArtifact,
  LOCAL_EXPORT_SCHEMA_VERSION,
  readLocalExportFormatEvidence,
  readLocalExportManifest,
  validateDeckLocal,
} from "./artifacts.ts";
export type {
  CadenzaExportFormat,
  CadenzaProjectConfig,
  EnsureGeneratedOutputSafetyOptions,
  GeneratedOutputSafetyResult,
  LocalExportRuntimeConfig,
  ResolveLocalExportRuntimeConfigOptions,
} from "./config.ts";
export {
  defineConfig,
  ensureGeneratedOutputSafety,
  LOCAL_EXPORT_ARTIFACT_FILENAMES,
  LOCAL_EXPORT_DEFAULT_FORMATS,
  LOCAL_EXPORT_DEFAULT_OUTPUT_ROOT,
  LOCAL_EXPORT_RENDERER_TEMP_ROOT,
  resolveLocalExportRuntimeConfig,
  validateProjectConfig,
} from "./config.ts";
export type {
  CadenzaDeckMetadata,
  DeckSelectorSource,
  LoadDeckModuleOptions,
  LoadedDeckModule,
  LoadedDeckSelector,
} from "./deckLoader.ts";
export {
  CADENZA_ALPHA_DECK_SELECTOR,
  CADENZA_ALPHA_DECK_SOURCE_PATH,
  loadDeckModule,
} from "./deckLoader.ts";
export type {
  LocalExportDiagnostic,
  LocalExportDiagnosticCategory,
  LocalExportDiagnosticSeverity,
} from "./diagnostics.ts";
export {
  CadenzaLocalExportError,
  LOCAL_EXPORT_EXIT_CODES,
  localExportError,
} from "./diagnostics.ts";
export type {
  LocalMp4Prerequisite,
  LocalMp4RendererInput,
  LocalMp4RendererProvenance,
  LocalMp4RendererResult,
} from "./mp4Renderer.ts";
export { renderLocalMp4 } from "./mp4Renderer.ts";
export type { AlphaSurfaceOverclaimViolation } from "./overclaimGuard.ts";
export { findAlphaSurfaceOverclaimViolations } from "./overclaimGuard.ts";
export type {
  StaticWebCompatibilityAdapterInput,
  StaticWebCompatibilityAdapterResult,
  StaticWebNotesBoundary,
  StaticWebSemanticAnchor,
  StaticWebTimingEvidence,
} from "./staticWebCompatibility.ts";
export { renderStaticWebCompatibility } from "./staticWebCompatibility.ts";
