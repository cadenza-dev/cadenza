import type {
  ContentDensity,
  ContentReadability,
  ReadableDensityBudget,
  TypographyBoxNode,
} from "../render-safe/resources.ts";
import type { ThemeDefinition } from "../typed-api/primitives.ts";

export type TypographyFontReadinessState = "pending" | "ready";

export type TypographyFitMeasurement = {
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollWidth: number;
  source: string;
};

export type TypographyFitResultStatus =
  | "disabled"
  | "fitted"
  | "overflow-fallback"
  | "unchanged";

export type TypographyFitResult = {
  fontSizePx: number;
  lineHeight: number;
  spacingPx: number;
  status: TypographyFitResultStatus;
};

export type TypographyDiagnosticLocator = {
  chapterId?: string | undefined;
  componentId: string;
  slideId?: string | undefined;
};

export type TypographyFitDiagnostic = {
  category: "fit" | "overflow";
  code: "TYPO_AUTO_FIT_APPLIED" | "TYPO_AUTO_FIT_OVERFLOW_FALLBACK";
  locator: TypographyDiagnosticLocator;
  measured: TypographyFitMeasurement;
  message: string;
  repairDirection: string;
  requirementId: "TYPO-001" | "TYPO-002";
  severity: "warning";
};

export type TypographyDensityCategory = "dense" | "over-dense";

export type TypographyDensityMeasuredValues = {
  characterCount: number;
  charactersPer1000Px2: number;
  estimatedLineCount: number;
};

export type TypographyDensityDiagnostic = {
  category: TypographyDensityCategory;
  code: "TYPO_DENSITY_OVER_BUDGET";
  locator: TypographyDiagnosticLocator;
  measured: TypographyDensityMeasuredValues;
  message: string;
  repairDirection: string;
  requirementId: "TYPO-003";
  severity: "warning";
  testRefs: ["TC-TYPO-002"];
  themeBudget: ReadableDensityBudget;
};

export type TypographyDensityInput = {
  box: {
    maxHeight: number;
    maxWidth: number;
  };
  density: ContentDensity;
  locator: TypographyDiagnosticLocator;
  readability: ContentReadability;
  text: string;
  theme?: ThemeDefinition | undefined;
};

export type TypographyFitInput = {
  fontReadiness: TypographyFontReadinessState;
  locator?: Partial<TypographyDiagnosticLocator> | undefined;
  measurement: TypographyFitMeasurement;
  typography: TypographyBoxNode;
  viewport: {
    height: number;
    width: number;
  };
};

export type TypographyFitEvaluation = {
  diagnostics: TypographyFitDiagnostic[];
  result: TypographyFitResult;
};

export function fitTypographyBox({
  fontReadiness,
  locator,
  measurement,
  typography,
}: TypographyFitInput): TypographyFitEvaluation {
  const autoFit = typography.autoFit;

  if (!autoFit || fontReadiness !== "ready") {
    return {
      diagnostics: [],
      result: {
        fontSizePx: autoFit?.baseFontSizePx ?? 0,
        lineHeight: autoFit?.baseLineHeight ?? 0,
        spacingPx: autoFit?.baseSpacingPx ?? 0,
        status: autoFit ? "unchanged" : "disabled",
      },
    };
  }

  const widthRatio = safeRatio(
    measurement.clientWidth,
    measurement.scrollWidth,
  );
  const heightRatio = safeRatio(
    measurement.clientHeight,
    measurement.scrollHeight,
  );
  const scale = Math.min(widthRatio, heightRatio, 1);
  const unclampedFontSize = autoFit.baseFontSizePx * scale;
  const result = {
    fontSizePx: roundOne(
      clamp(
        unclampedFontSize,
        autoFit.minFontSizePx,
        autoFit.maxFontSizePx ?? autoFit.baseFontSizePx,
      ),
    ),
    lineHeight: roundTwo(
      clamp(
        autoFit.baseLineHeight * scale,
        autoFit.minLineHeight,
        autoFit.maxLineHeight ?? autoFit.baseLineHeight,
      ),
    ),
    spacingPx: roundOne(
      clamp(
        scale < 1 ? autoFit.minSpacingPx : autoFit.baseSpacingPx,
        autoFit.minSpacingPx,
        autoFit.maxSpacingPx ?? autoFit.baseSpacingPx,
      ),
    ),
    status:
      scale >= 1
        ? "unchanged"
        : unclampedFontSize < autoFit.minFontSizePx
          ? "overflow-fallback"
          : "fitted",
  } satisfies TypographyFitResult;

  const componentId = locator?.componentId ?? typography.id;
  const diagnosticLocator = {
    chapterId: locator?.chapterId,
    componentId,
    slideId: locator?.slideId,
  };

  if (result.status === "unchanged") {
    return {
      diagnostics: [],
      result,
    };
  }

  if (result.status === "overflow-fallback") {
    return {
      diagnostics: [
        {
          category: "overflow",
          code: "TYPO_AUTO_FIT_OVERFLOW_FALLBACK",
          locator: diagnosticLocator,
          measured: measurement,
          message: `TypographyBox '${componentId}' could not fit inside readable auto-fit bounds.`,
          repairDirection:
            "Shorten authored deck copy, split the content across steps, or increase the box size.",
          requirementId: "TYPO-002",
          severity: "warning",
        },
      ],
      result,
    };
  }

  return {
    diagnostics: [
      {
        category: "fit",
        code: "TYPO_AUTO_FIT_APPLIED",
        locator: diagnosticLocator,
        measured: measurement,
        message: `TypographyBox '${componentId}' used deterministic auto-fit within readable bounds.`,
        repairDirection:
          "Review the authored deck if fitted text still feels visually dense.",
        requirementId: "TYPO-001",
        severity: "warning",
      },
    ],
    result,
  };
}

export function validateTypographyDensity({
  box,
  density,
  locator,
  readability,
  text,
  theme,
}: TypographyDensityInput): TypographyDensityDiagnostic[] {
  const budget = resolveReadableDensityBudget(theme, density);
  const characterCount = countReadableCharacters(text);
  const averageGlyphWidthPx = readability === "headline" ? 13.2 : 8.8;
  const estimatedCharactersPerLine = Math.max(
    1,
    Math.floor(box.maxWidth / averageGlyphWidthPx),
  );
  const estimatedLineCount = Math.ceil(
    characterCount / estimatedCharactersPerLine,
  );
  const area = Math.max(1, box.maxWidth * box.maxHeight);
  const charactersPer1000Px2 = roundTwo(characterCount / (area / 1000));
  const measured = {
    characterCount,
    charactersPer1000Px2,
    estimatedLineCount,
  };
  const overBudget =
    charactersPer1000Px2 > budget.maxCharactersPer1000Px2 ||
    estimatedLineCount > budget.maxEstimatedLineCount;

  if (!overBudget) {
    return [];
  }

  return [
    {
      category:
        charactersPer1000Px2 > budget.maxCharactersPer1000Px2 * 1.2 ||
        estimatedLineCount > budget.maxEstimatedLineCount + 1
          ? "over-dense"
          : "dense",
      code: "TYPO_DENSITY_OVER_BUDGET",
      locator,
      measured,
      message: `Typography density for '${locator.componentId}' exceeds the '${density}' theme budget.`,
      repairDirection:
        budget.repairDirection ??
        "Repair the authored deck by shortening prose, splitting steps, or increasing layout space.",
      requirementId: "TYPO-003",
      severity: "warning",
      testRefs: ["TC-TYPO-002"],
      themeBudget: budget,
    },
  ];
}

export function resolveReadableDensityBudget(
  theme: ThemeDefinition | undefined,
  density: ContentDensity,
): ReadableDensityBudget {
  return (
    theme?.tokens.density?.[density] ??
    DEFAULT_READABLE_DENSITY_BUDGETS[density]
  );
}

function safeRatio(client: number, scroll: number): number {
  if (scroll <= 0) {
    return 1;
  }

  return client / scroll;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundOne(value: number): number {
  return Math.floor(value * 10) / 10;
}

function roundTwo(value: number): number {
  return Math.floor(value * 100) / 100;
}

function countReadableCharacters(text: string): number {
  return text.replace(/\s+/g, " ").trim().length;
}

const DEFAULT_READABLE_DENSITY_BUDGETS: Record<
  ContentDensity,
  ReadableDensityBudget
> = {
  compact: {
    maxCharactersPer1000Px2: 3.8,
    maxEstimatedLineCount: 7,
    repairDirection:
      "Repair the authored deck by splitting compact copy into smaller reveal steps.",
  },
  comfortable: {
    maxCharactersPer1000Px2: 2.6,
    maxEstimatedLineCount: 5,
    repairDirection:
      "Repair the authored deck by shortening prose or increasing layout space.",
  },
  spacious: {
    maxCharactersPer1000Px2: 1.8,
    maxEstimatedLineCount: 3,
    repairDirection:
      "Repair the authored deck by moving supporting detail into notes or another slide.",
  },
};
