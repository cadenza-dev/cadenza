import type { CadenzaDiagnostic } from "../diagnostics/types.js";

export type RawRemotionUsageOptions = {
  source?: string;
};

export type Phase3BoundaryArtifact = {
  path: string;
  text: string;
};

const RAW_REMOTION_PRIMITIVES = [
  "useCurrentFrame",
  "delayRender",
  "continueRender",
  "TransitionSeries",
] as const;

type RawRemotionPrimitive = (typeof RAW_REMOTION_PRIMITIVES)[number];

const PROHIBITED_PHASE3_CLAIMS: Array<{
  label: string;
  pattern: RegExp;
}> = [
  { label: "MP4 export", pattern: /\bMP4\b[^.\n]*\bexport\b/i },
  { label: "PDF export", pattern: /\bPDF\b[^.\n]*\bexport\b/i },
  { label: "hosted rendering", pattern: /\bhosted[- ]rendering\b/i },
  { label: "Remotion Lambda support", pattern: /\bRemotion Lambda\b/i },
  {
    label: "presenter product completeness",
    pattern:
      /\bpresenter(?:[- ]view|[- ]product| product)?[^.\n]*(?:complete|completeness|support|ship|ships|workflow|workflows)\b/i,
  },
  {
    label: "template marketplace support",
    pattern: /\btemplate marketplace\b/i,
  },
  {
    label: "public API stability",
    pattern: /\bpublic API\b[^.\n]*(?:stable|stability)\b/i,
  },
  {
    label: "external alpha usage",
    pattern:
      /\b(?:external )?alpha(?:[- ]user| user| usage| feedback| deck| decks)?\b/i,
  },
];

const DEFERRED_PHASE3_SCOPES: Array<{
  label: string;
  pattern: RegExp;
  requirementId: string;
}> = [
  {
    label: "authoring-loop wrapper command",
    pattern:
      /\b(?:authoring-loop wrapper command|single orchestration command|wrapper command)\b/i,
    requirementId: "AUTH-001",
  },
  {
    label: "complete deck IR",
    pattern:
      /\b(?:complete deck IR|second authoritative deck representation|standalone complete deck IR)\b/i,
    requirementId: "DIAG-006",
  },
  {
    label: "read-only MCP",
    pattern: /\bread-only MCP\b/i,
    requirementId: "AIBND-004",
  },
  {
    label: "tool-based MCP",
    pattern:
      /\b(?:tool-based MCP|validate_deck|render_preview|inspect_composition)\b/i,
    requirementId: "AIBND-006",
  },
];

export function validateRawRemotionUsage(
  sourceText: string,
  options: RawRemotionUsageOptions = {},
): CadenzaDiagnostic[] {
  const lines = sourceText.split(/\r?\n/);
  const unreasoned = new Set<RawRemotionPrimitive>();

  for (const [index, line] of lines.entries()) {
    for (const primitive of RAW_REMOTION_PRIMITIVES) {
      if (
        containsPrimitive(line, primitive) &&
        !hasWhyReasonNear(lines, index)
      ) {
        unreasoned.add(primitive);
      }
    }
  }

  return [...unreasoned].map((primitive) => ({
    severity: "warning",
    code: "AIBND_RAW_REMOTION_ESCAPE_HATCH",
    message: `Raw Remotion primitive '${primitive}' should include a short // why: reason or move back to typed Cadenza API / render-safe surfaces.`,
    requirementId: "AIBND-002",
    source: options.source,
  }));
}

export function validatePhase3BoundaryClaims(
  artifacts: Phase3BoundaryArtifact[],
): CadenzaDiagnostic[] {
  const diagnostics: CadenzaDiagnostic[] = [];

  for (const artifact of artifacts) {
    const lines = artifact.text.split(/\r?\n/);

    for (const [index, line] of lines.entries()) {
      if (isBoundaryContext(lines, index)) {
        continue;
      }

      for (const claim of PROHIBITED_PHASE3_CLAIMS) {
        if (claim.pattern.test(line)) {
          diagnostics.push({
            severity: "warning",
            code: "AIBND_UNSUPPORTED_PHASE3_CLAIM",
            message: `Phase 3 artifact '${artifact.path}' appears to claim ${claim.label}; Phase 3 must keep that capability out of scope or deferred.`,
            requirementId: "AIBND-001",
            source: artifact.path,
          });
        }
      }
    }
  }

  return diagnostics;
}

export function validatePhase3DeferredScopeClaims(
  artifacts: Phase3BoundaryArtifact[],
): CadenzaDiagnostic[] {
  const diagnostics: CadenzaDiagnostic[] = [];

  for (const artifact of artifacts) {
    const lines = artifact.text.split(/\r?\n/);

    for (const [index, line] of lines.entries()) {
      if (isBoundaryContext(lines, index)) {
        continue;
      }

      for (const scope of DEFERRED_PHASE3_SCOPES) {
        if (scope.pattern.test(line)) {
          diagnostics.push({
            severity: "warning",
            code: "AIBND_DEFERRED_SCOPE_IMPLEMENTATION",
            message: `Phase 3 artifact '${artifact.path}' appears to implement ${scope.label}; this scope must stay deferred in Phase 3.`,
            requirementId: scope.requirementId,
            source: artifact.path,
          });
        }
      }
    }
  }

  return diagnostics;
}

function containsPrimitive(
  line: string,
  primitive: RawRemotionPrimitive,
): boolean {
  return new RegExp(`\\b${primitive}\\b`).test(line);
}

function hasWhyReasonNear(lines: string[], index: number): boolean {
  const nearby = [
    lines[index - 1] ?? "",
    lines[index] ?? "",
    lines[index + 1] ?? "",
  ];

  return nearby.some((line) => /\/\/\s*why:\s*\S+/i.test(line));
}

function isBoundaryContext(lines: string[], index: number): boolean {
  const normalized = lines
    .slice(Math.max(0, index - 3), index + 4)
    .join(" ")
    .toLowerCase();
  const boundaryMarkers = [
    "avoid",
    "before any",
    "boundary",
    "claiming",
    "claims out",
    "defer",
    "deferred",
    "do not",
    "does not",
    "future",
    "later",
    "must not",
    "no ",
    "not ",
    "out of scope",
    "penalize",
    "phase 4",
    "phase 5",
    "reject",
    "remain",
    "remove",
    "consider",
    "if justified",
    "unsupported",
    "without",
  ];

  return boundaryMarkers.some((marker) => normalized.includes(marker));
}
