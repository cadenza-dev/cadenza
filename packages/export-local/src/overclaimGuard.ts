export type AlphaSurfaceOverclaimViolation = {
  excerpt: string;
  label: string;
};

type AlphaSurfaceOverclaimRule = {
  label: string;
  pattern: RegExp;
};

const ALPHA_SURFACE_OVERCLAIM_RULES: AlphaSurfaceOverclaimRule[] = [
  {
    label: "hosted rendering readiness",
    pattern:
      /\b(?:ready for hosted rendering|hosted rendering\s+(?:is\s+)?(?:ready|supported|available|implemented|production-ready))\b/i,
  },
  {
    label: "npm publication",
    pattern:
      /\b(?:ready for npm publication|npm publication\s+(?:is\s+)?(?:complete|ready|performed|claimed|available|supported)|published\s+(?:to|on)\s+npm|publish(?:ed|ing)?\s+(?:to|on)\s+npm)\b/i,
  },
  {
    label: "unsupported format support",
    pattern:
      /\b(?:(?:supports?|supported)\s+(?:PDF|PPTX)(?:\s+export)?|(?:PDF|PPTX)\s+export\s+(?:is\s+)?(?:supported|available|implemented|ready))\b/i,
  },
  {
    label: "Player App export",
    pattern:
      /\b(?:exports?\s+(?:the\s+)?Player App|Player App\s+(?:web\s+)?export\s+(?:is\s+)?(?:supported|available|implemented|ready))\b/i,
  },
  {
    label: "arbitrary plugin loading",
    pattern:
      /\b(?:plugin loading\s+(?:is\s+)?(?:supported|available|implemented|ready)|plugins?\s+can\s+load\s+decks|arbitrary plugin-loaded deck support)\b/i,
  },
  {
    label: "final alpha readiness",
    pattern:
      /\b(?:(?:final|complete|ready)\s+(?:0\.1\s+)?alpha readiness|(?:0\.1\s+)?alpha readiness\s+(?:is\s+)?(?:complete|ready|achieved))\b/i,
  },
  {
    label: "release tag",
    pattern:
      /\b(?:release tag\s+(?:is\s+)?(?:created|ready|published)|gh release create)\b/i,
  },
  {
    label: "public API stability",
    pattern:
      /\b(?:public API\s+(?:is\s+)?stable|stable public API beyond the declared surface)\b/i,
  },
];

export function findAlphaSurfaceOverclaimViolations(
  text: string,
): AlphaSurfaceOverclaimViolation[] {
  const normalizedText = normalizeWhitespace(text);

  return ALPHA_SURFACE_OVERCLAIM_RULES.flatMap((rule) => {
    const match = rule.pattern.exec(normalizedText);

    if (match === null) {
      return [];
    }

    return [
      {
        excerpt: excerptAround(normalizedText, match.index, match[0].length),
        label: rule.label,
      },
    ];
  });
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function excerptAround(
  text: string,
  index: number,
  matchLength: number,
): string {
  const start = Math.max(0, index - 60);
  const end = Math.min(text.length, index + matchLength + 60);

  return text.slice(start, end);
}
