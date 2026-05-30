import { createHash } from "node:crypto";

export function createSha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createStableHash(value: unknown): string {
  return createSha256(stableStringify(value));
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}
