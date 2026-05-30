export type {
  ExportLocalOptions,
  ExportLocalResult,
  InspectExportArtifactOptions,
  InspectExportArtifactResult,
  Phase6ArtifactRecord,
  Phase6CapabilityStatus,
  Phase6ExportManifest,
  Phase6FormatCapability,
  Phase6FormatEvidence,
  ValidateDeckLocalOptions,
  ValidateDeckLocalResult,
} from "./artifacts.ts";
export {
  exportDeckLocal,
  inspectExportArtifact,
  PHASE6_EXPORT_SCHEMA_VERSION,
  readPhase6ExportManifest,
  readPhase6FormatEvidence,
  validateDeckLocal,
} from "./artifacts.ts";
export type {
  CadenzaExportFormat,
  CadenzaProjectConfig,
  EnsureGeneratedOutputSafetyOptions,
  GeneratedOutputSafetyResult,
  Phase6RuntimeConfig,
  ResolvePhase6RuntimeConfigOptions,
} from "./config.ts";
export {
  defineConfig,
  ensureGeneratedOutputSafety,
  PHASE6_ARTIFACT_FILENAMES,
  PHASE6_DEFAULT_FORMATS,
  PHASE6_DEFAULT_OUTPUT_ROOT,
  PHASE6_RENDERER_TEMP_ROOT,
  resolvePhase6RuntimeConfig,
  validateProjectConfig,
} from "./config.ts";
export type {
  DeckSelectorSource,
  LoadDeckModuleOptions,
  LoadedDeckModule,
  LoadedDeckSelector,
  Phase6DeckMetadata,
} from "./deckLoader.ts";
export { loadDeckModule } from "./deckLoader.ts";
export type {
  Phase6Diagnostic,
  Phase6DiagnosticCategory,
  Phase6DiagnosticSeverity,
} from "./diagnostics.ts";
export {
  CadenzaPhase6Error,
  PHASE6_EXIT_CODES,
  phase6Error,
} from "./diagnostics.ts";
export type {
  Phase5AlphaReadinessEvidence,
  Phase5BoundaryEvaluationEvidence,
  Phase5ExportEvidence,
  Phase5FormatScopeEvidence,
  Phase5LocalWebExportManifest,
  Phase5RepairRoutingEvidence,
} from "./legacyPhase5.ts";
export { runCadenzaCli as runPhase5CadenzaCli } from "./legacyPhase5.ts";
export type {
  StaticWebCompatibilityAdapterInput,
  StaticWebCompatibilityAdapterResult,
  StaticWebNotesBoundary,
  StaticWebSemanticAnchor,
  StaticWebTimingEvidence,
} from "./staticWebCompatibility.ts";
export { renderStaticWebCompatibility } from "./staticWebCompatibility.ts";
