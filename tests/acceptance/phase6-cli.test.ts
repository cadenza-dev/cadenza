import { readFileSync } from "node:fs";
import path from "node:path";
import { commandRegistry, runPhase6Cli } from "@cadenza-dev/cli";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

async function runCadenza(args: string[]): Promise<{
  stderr: string;
  stdout: string;
}> {
  const result = await runPhase6Cli(args, repoRoot);

  return {
    stderr: result.stderr,
    stdout: result.stdout,
  };
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(
    readFileSync(path.join(repoRoot, relativePath), "utf8"),
  ) as T;
}

describe("B6.1 Phase 6 CLI topology and discovery", () => {
  it("TC-CLIS-001 exposes deterministic help and version from a clean checkout without hosted or publication claims", async () => {
    const cliPackage = readJson<{ name: string; private: boolean }>(
      "packages/cli/package.json",
    );
    const exportLocalPackage = readJson<{ name: string; private: boolean }>(
      "packages/export-local/package.json",
    );
    const rootPackage = readJson<{ scripts: Record<string, string> }>(
      "package.json",
    );

    expect(cliPackage).toMatchObject({
      name: "@cadenza-dev/cli",
      private: true,
    });
    expect(exportLocalPackage).toMatchObject({
      name: "@cadenza-dev/export-local",
      private: true,
    });
    expect(rootPackage.scripts.cadenza).toBe(
      "node --experimental-strip-types scripts/cadenza.ts",
    );

    const help = await runCadenza(["--help"]);
    expect(help.stderr).toBe("");
    expect(help.stdout).toContain("Usage: cadenza <command> [options]");
    expect(help.stdout).toContain("Commands:");
    expect(help.stdout).toContain("export");
    expect(help.stdout).toContain("validate");
    expect(help.stdout).toContain("inspect");
    expect(help.stdout).toContain("Formats: web, mp4");
    expect(help.stdout).toContain("Local CLI for trusted Cadenza deck modules");
    expect(help.stdout).not.toMatch(
      /\b(?:hosted|lambda|cloud queue|npm publish|publication|player app|pdf|pptx)\b/i,
    );

    const version = await runCadenza(["--version"]);
    expect(version.stderr).toBe("");
    expect(version.stdout).toBe("cadenza 0.0.0\n");
  });

  it("TC-CLIS-005 discovers public commands through typed command adapters without export-local process-global behavior", () => {
    expect(commandRegistry.map((command) => command.name)).toEqual([
      "export",
      "validate",
      "inspect",
    ]);
    expect(new Set(commandRegistry.map((command) => command.name)).size).toBe(
      commandRegistry.length,
    );

    for (const command of commandRegistry) {
      expect(command.summary).toMatch(/\S/);
      expect(command.usage).toContain(`cadenza ${command.name}`);
      expect(command.run).toEqual(expect.any(Function));
    }

    for (const adapter of ["export", "validate", "inspect"]) {
      const source = readFileSync(
        path.join(repoRoot, "packages/cli/src/commands", `${adapter}.ts`),
        "utf8",
      );
      expect(source).toContain("satisfies CommandAdapter");
      expect(source).not.toMatch(/\bprocess\.(?:argv|exit|exitCode)\b/);
    }

    const exportLocalSources = [
      "packages/export-local/src/config.ts",
      "packages/export-local/src/index.ts",
      "packages/export-local/src/legacyPhase5.ts",
    ]
      .map((file) => readFileSync(path.join(repoRoot, file), "utf8"))
      .join("\n");

    expect(exportLocalSources).not.toMatch(/\bprocess\.(?:argv|exit)\b/);
  });
});
