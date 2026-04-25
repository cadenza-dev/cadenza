import type {
  CadenzaDiagnostic,
  DiagnosticSeverity,
} from "../diagnostics/types.js";

export type ValidationReportSummary = {
  fatal: number;
  warning: number;
  byRequirement: Record<string, number>;
};

export type ValidationRepairQueueItem = {
  severity: DiagnosticSeverity;
  code: string;
  requirementId: string;
  sources: string[];
  messages: string[];
  count: number;
  action: string;
};

export type CadenzaValidationReport = {
  schemaVersion: 1;
  ok: boolean;
  summary: ValidationReportSummary;
  diagnostics: CadenzaDiagnostic[];
  repairQueue: ValidationRepairQueueItem[];
};

type MutableRepairQueueItem = ValidationRepairQueueItem & {
  messageSet: Set<string>;
  sourceSet: Set<string>;
};

export function createValidationReport(
  diagnostics: CadenzaDiagnostic[],
): CadenzaValidationReport {
  const summary: ValidationReportSummary = {
    fatal: 0,
    warning: 0,
    byRequirement: {},
  };
  const repairGroups = new Map<string, MutableRepairQueueItem>();

  for (const diagnostic of diagnostics) {
    summary[diagnostic.severity] += 1;
    summary.byRequirement[diagnostic.requirementId] =
      (summary.byRequirement[diagnostic.requirementId] ?? 0) + 1;

    const groupKey = [
      diagnostic.severity,
      diagnostic.requirementId,
      diagnostic.code,
      diagnostic.source ?? "",
    ].join("\u0000");
    const group = repairGroups.get(groupKey) ?? createRepairGroup(diagnostic);

    group.count += 1;
    group.messageSet.add(diagnostic.message);
    if (diagnostic.source) {
      group.sourceSet.add(diagnostic.source);
    }

    repairGroups.set(groupKey, group);
  }

  const repairQueue = [...repairGroups.values()]
    .map(finalizeRepairGroup)
    .sort(compareRepairQueueItems);

  return {
    schemaVersion: 1,
    ok: summary.fatal === 0,
    summary,
    diagnostics: [...diagnostics],
    repairQueue,
  };
}

function createRepairGroup(
  diagnostic: CadenzaDiagnostic,
): MutableRepairQueueItem {
  return {
    severity: diagnostic.severity,
    code: diagnostic.code,
    requirementId: diagnostic.requirementId,
    sources: [],
    messages: [],
    count: 0,
    action: repairActionFor(diagnostic.code),
    messageSet: new Set(),
    sourceSet: new Set(),
  };
}

function finalizeRepairGroup(
  group: MutableRepairQueueItem,
): ValidationRepairQueueItem {
  return {
    severity: group.severity,
    code: group.code,
    requirementId: group.requirementId,
    sources: [...group.sourceSet].sort(),
    messages: [...group.messageSet].sort(),
    count: group.count,
    action: group.action,
  };
}

function compareRepairQueueItems(
  left: ValidationRepairQueueItem,
  right: ValidationRepairQueueItem,
): number {
  return (
    severityRank(left.severity) - severityRank(right.severity) ||
    left.requirementId.localeCompare(right.requirementId) ||
    left.code.localeCompare(right.code) ||
    left.sources.join("\u0000").localeCompare(right.sources.join("\u0000"))
  );
}

function severityRank(severity: DiagnosticSeverity): number {
  return severity === "fatal" ? 0 : 1;
}

function repairActionFor(code: string): string {
  switch (code) {
    case "VAL_MISSING_SLIDE_ID":
      return "Add a stable unique id to each Slide.";
    case "VAL_DUPLICATE_SLIDE_ID":
      return "Rename duplicate Slide ids so each slide has one stable unique id.";
    case "VAL_NESTED_DECK":
      return "Flatten nested Deck nodes into the top-level Deck.";
    case "VAL_INVALID_STEP_KIND":
      return "Use a supported Step kind: fixed, wait-for-event, or computed.";
    case "RSAF_TYPOGRAPHY_OVERFLOW":
      return "Revise TypographyBox content, sizing, or layout so browser preview no longer overflows.";
    default:
      return "Inspect the diagnostic message and repair the referenced source.";
  }
}
