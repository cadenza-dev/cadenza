import type { CadenzaExportFormat } from "@cadenza-dev/export-local";
import { usageError } from "./output.ts";

export function readFlagValue(
  args: string[],
  index: number,
  flag: string,
): string {
  const value = args[index + 1];

  if (value === undefined || value.startsWith("--")) {
    throw usageError(
      "CLIS_MISSING_FLAG_VALUE",
      `${flag} requires a value.`,
      `Pass a value after ${flag}.`,
    );
  }

  return value;
}

export function parseFormats(value: string): CadenzaExportFormat[] {
  const formats = value
    .split(",")
    .map((format) => format.trim())
    .filter((format) => format.length > 0);
  const parsed: CadenzaExportFormat[] = [];

  for (const format of formats) {
    if (format !== "web" && format !== "mp4") {
      throw usageError(
        "CLIS_UNKNOWN_FORMAT",
        `Unknown export format "${format}".`,
        "Use --format web, --format mp4, or --format web,mp4.",
      );
    }

    if (!parsed.includes(format)) {
      parsed.push(format);
    }
  }

  if (parsed.length === 0) {
    throw usageError(
      "CLIS_FORMAT_REQUIRED",
      "At least one export format must be selected.",
      "Use --format web, --format mp4, or --format web,mp4.",
    );
  }

  return parsed;
}
