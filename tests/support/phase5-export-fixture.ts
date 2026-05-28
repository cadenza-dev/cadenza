import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { phase5AlphaReadinessTalkMetadata } from "../../examples/phase5/alpha-readiness-talk.js";
import {
  type Phase5AlphaReadinessEvidence,
  type Phase5BoundaryEvaluationEvidence,
  type Phase5ExportEvidence,
  type Phase5FormatScopeEvidence,
  type Phase5LocalWebExportManifest,
  type Phase5RepairRoutingEvidence,
  runCadenzaCli,
} from "../../scripts/cadenza.js";

export type Phase5ExportManifest = Phase5LocalWebExportManifest;
export type {
  Phase5AlphaReadinessEvidence,
  Phase5BoundaryEvaluationEvidence,
  Phase5ExportEvidence,
  Phase5FormatScopeEvidence,
  Phase5RepairRoutingEvidence,
};

export type Phase5GeneratedExportRun = {
  artifactPaths: string[];
  deckId: string;
  manifest: Phase5ExportManifest;
  outputDir: string;
  readArtifactBytes: (artifactPath: string) => Buffer;
  readArtifactJson: <T>(artifactPath: string) => T;
  readArtifactText: (artifactPath: string) => string;
};

export async function runPhase5ExportFixture(
  runId: string,
): Promise<Phase5GeneratedExportRun> {
  const deckId = phase5AlphaReadinessTalkMetadata.deckId;
  const outputDir = path.join(process.cwd(), "dist/phase5", deckId, runId);
  rmSync(outputDir, { force: true, recursive: true });

  await runCadenzaCli(["export", deckId, "--run-id", runId]);

  const readArtifactJson = <T>(artifactPath: string): T =>
    readJson<T>(path.join(outputDir, artifactPath));
  const readArtifactText = (artifactPath: string): string =>
    readText(path.join(outputDir, artifactPath));
  const readArtifactBytes = (artifactPath: string): Buffer =>
    readBytes(path.join(outputDir, artifactPath));
  const manifest = readArtifactJson<Phase5ExportManifest>("manifest.json");

  return {
    artifactPaths: manifest.artifacts.map((artifact) => artifact.path),
    deckId,
    manifest,
    outputDir,
    readArtifactBytes,
    readArtifactJson,
    readArtifactText,
  };
}

export function repoPath(relativePath: string): string {
  return path.join(process.cwd(), relativePath);
}

export function repoFileExists(relativePath: string): boolean {
  return existsSync(repoPath(relativePath));
}

export function readRepoText(relativePath: string): string {
  return readText(repoPath(relativePath));
}

export function readRepoJson<T>(relativePath: string): T {
  return readJson<T>(repoPath(relativePath));
}

export function readRepoBytes(relativePath: string): Buffer {
  return readBytes(repoPath(relativePath));
}

export function readText(file: string): string {
  return readFileSync(file, "utf8");
}

export function readBytes(file: string): Buffer {
  return readFileSync(file);
}

export function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}
