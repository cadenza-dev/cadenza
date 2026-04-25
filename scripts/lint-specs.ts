import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

type Finding = {
  file: string;
  level: "error" | "warn";
  message: string;
};

const repoRoot = process.cwd();
const args = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
const targetPaths = args.length > 0 ? args : ["spec"];

const requirementIdPattern = /^[A-Z]{2,6}-[0-9]{3,4}$/;
const testIdPattern = /^TC-[A-Z]{2,6}-[0-9]{3,4}$/;

function walkMarkdown(target: string): string[] {
  const absolute = path.resolve(repoRoot, target);
  if (!existsSync(absolute)) {
    return [];
  }

  const stats = statSync(absolute);
  if (stats.isFile()) {
    return absolute.endsWith(".md") ? [absolute] : [];
  }

  const files: string[] = [];
  for (const entry of readdirSync(absolute)) {
    const child = path.join(absolute, entry);
    const childStats = statSync(child);
    if (childStats.isDirectory()) {
      files.push(...walkMarkdown(path.relative(repoRoot, child)));
    } else if (child.endsWith(".md")) {
      files.push(child);
    }
  }
  return files;
}

function relative(file: string): string {
  return path.relative(repoRoot, file);
}

function read(file: string): string {
  return readFileSync(file, "utf8");
}

function extractTableRows(markdown: string): string[][] {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !/^\|\s*:?-{2,}/.test(line.trim()))
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim()),
    );
}

function findStatus(markdown: string): string | null {
  const match = markdown.match(/^Status:\s*(\S+)/m);
  return match?.[1] ?? null;
}

function findRequirementIds(markdown: string): string[] {
  const ids: string[] = [];
  for (const match of markdown.matchAll(/^- \*\*ID\*\*:\s*([A-Z]+-[0-9]+)/gm)) {
    const id = match[1];
    if (!id.startsWith("FC-")) {
      ids.push(id);
    }
  }
  return ids;
}

function validateRequirementBlocks(
  file: string,
  markdown: string,
  findings: Finding[],
) {
  const blocks = markdown.split(/\n(?=- \*\*ID\*\*: )/g);
  for (const block of blocks) {
    const idMatch = block.match(/^- \*\*ID\*\*:\s*([A-Z]+-[0-9]+)/m);
    if (!idMatch || idMatch[1].startsWith("FC-")) {
      continue;
    }
    const id = idMatch[1];
    if (!requirementIdPattern.test(id)) {
      findings.push({
        file,
        level: "error",
        message: `malformed requirement ID ${id}`,
      });
    }

    for (const field of ["Priority", "Owner", "Statement", "Verification"]) {
      if (!block.includes(`- **${field}**:`)) {
        findings.push({
          file,
          level: "error",
          message: `${id} is missing ${field}`,
        });
      }
    }
  }
}

function validateNoDuplicate(
  values: string[],
  label: string,
  findings: Finding[],
) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      findings.push({
        file: "spec/",
        level: "error",
        message: `duplicate ${label}: ${value}`,
      });
    }
    seen.add(value);
  }
}

const markdownFiles = targetPaths.flatMap(walkMarkdown).sort();
const specFiles = markdownFiles.filter((file) =>
  /spec\/phase[^/]+\/SPEC_.*\.md$/.test(relative(file)),
);

const findings: Finding[] = [];
const requirementIds = new Set<string>();
const testIds = new Set<string>();
const matrixRequirementIds = new Set<string>();
const traceRequirementIds = new Set<string>();
const traceTestIds = new Set<string>();
const allRequirementIds: string[] = [];
const allTestIds: string[] = [];

for (const file of specFiles) {
  const rel = relative(file);
  const markdown = read(file);
  const status = findStatus(markdown);

  if (!status) {
    findings.push({
      file: rel,
      level: "error",
      message: "missing front-matter Status marker",
    });
  } else if (
    !["CONTRACT_DRAFT", "CONTRACT_FROZEN", "DEPRECATED"].includes(status)
  ) {
    findings.push({
      file: rel,
      level: "error",
      message: `invalid Status marker ${status}`,
    });
  }

  if (status === "CONTRACT_FROZEN") {
    const unresolvedPatterns = [
      /Freeze Candidate/i,
      /\*\*FC-ID\*\*:/,
      /\*\*Must resolve before\*\*:/i,
    ];
    for (const pattern of unresolvedPatterns) {
      if (pattern.test(markdown)) {
        findings.push({
          file: rel,
          level: "error",
          message: "frozen spec contains unresolved Freeze Candidate marker",
        });
        break;
      }
    }
  }

  if (
    !rel.endsWith("SPEC_TEST_MATRIX.md") &&
    !rel.endsWith("SPEC_TRACEABILITY.md")
  ) {
    const ids = findRequirementIds(markdown);
    validateRequirementBlocks(rel, markdown, findings);
    for (const id of ids) {
      requirementIds.add(id);
      allRequirementIds.push(id);
    }
  }

  if (rel.endsWith("SPEC_TEST_MATRIX.md")) {
    const rows = extractTableRows(markdown).filter((row) =>
      testIdPattern.test(row[0] ?? ""),
    );
    for (const row of rows) {
      const testId = row[0];
      testIds.add(testId);
      allTestIds.push(testId);

      for (const requirementId of (row[2] ?? "")
        .split(",")
        .map((value) => value.trim())) {
        if (!requirementId) {
          continue;
        }
        if (!requirementIdPattern.test(requirementId)) {
          findings.push({
            file: rel,
            level: "error",
            message: `${testId} references malformed requirement ID ${requirementId}`,
          });
        }
        matrixRequirementIds.add(requirementId);
      }
    }
  }

  if (rel.endsWith("SPEC_TRACEABILITY.md")) {
    const rows = extractTableRows(markdown).filter((row) =>
      requirementIdPattern.test(row[0] ?? ""),
    );
    for (const row of rows) {
      const requirementId = row[0];
      traceRequirementIds.add(requirementId);

      for (const testId of (row[1] ?? "")
        .split(",")
        .map((value) => value.trim())) {
        if (!testId) {
          continue;
        }
        if (!testIdPattern.test(testId)) {
          findings.push({
            file: rel,
            level: "error",
            message: `${requirementId} maps to malformed test ID ${testId}`,
          });
        }
        traceTestIds.add(testId);
      }
    }
  }
}

validateNoDuplicate(allRequirementIds, "requirement ID", findings);
validateNoDuplicate(allTestIds, "test ID", findings);

for (const requirementId of requirementIds) {
  if (!traceRequirementIds.has(requirementId)) {
    findings.push({
      file: "spec/phase1/SPEC_TRACEABILITY.md",
      level: "error",
      message: `${requirementId} is missing from traceability matrix`,
    });
  }
}

for (const requirementId of matrixRequirementIds) {
  if (!requirementIds.has(requirementId)) {
    findings.push({
      file: "spec/phase1/SPEC_TEST_MATRIX.md",
      level: "error",
      message: `unknown requirement ID ${requirementId}`,
    });
  }
}

for (const requirementId of traceRequirementIds) {
  if (!requirementIds.has(requirementId)) {
    findings.push({
      file: "spec/phase1/SPEC_TRACEABILITY.md",
      level: "error",
      message: `unknown requirement ID ${requirementId}`,
    });
  }
}

for (const testId of traceTestIds) {
  if (!testIds.has(testId)) {
    findings.push({
      file: "spec/phase1/SPEC_TRACEABILITY.md",
      level: "error",
      message: `unknown test ID ${testId}`,
    });
  }
}

console.log(`spec:lint scanned ${specFiles.length} spec file(s)`);
if (findings.length > 0) {
  for (const finding of findings) {
    console.log(`${finding.file} : ${finding.level} : ${finding.message}`);
  }
}

const errorCount = findings.filter(
  (finding) => finding.level === "error",
).length;
const warnCount = findings.filter((finding) => finding.level === "warn").length;
console.log(
  errorCount === 0
    ? `spec:lint OK (${warnCount} warning(s))`
    : `spec:lint failed (${errorCount} error(s), ${warnCount} warning(s))`,
);
process.exit(errorCount === 0 ? 0 : 1);
