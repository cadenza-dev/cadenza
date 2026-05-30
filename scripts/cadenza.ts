import { pathToFileURL } from "node:url";
import { runPhase6CliEntrypoint } from "../packages/cli/src/index.ts";

export type {
  Phase5AlphaReadinessEvidence,
  Phase5BoundaryEvaluationEvidence,
  Phase5ExportEvidence,
  Phase5FormatScopeEvidence,
  Phase5LocalWebExportManifest,
  Phase5RepairRoutingEvidence,
} from "../packages/export-local/src/legacyPhase5.ts";
export { runCadenzaCli } from "../packages/export-local/src/legacyPhase5.ts";

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runPhase6CliEntrypoint(process.argv.slice(2)).then((exitCode) => {
    process.exitCode = exitCode;
  });
}
