import { describe, expect, it } from "vitest";
import {
  classifyCiChanges,
  formatGitHubOutputs,
} from "./classify-ci-changes.js";

describe("CI change classification", () => {
  it("routes ordinary documentation changes to Markdown checks only", () => {
    expect(
      classifyCiChanges(["README.md", "docs/agentic-workflow.md"]),
    ).toMatchObject({
      browser: false,
      format: false,
      full: false,
      governance: false,
      markdown: true,
      shell: false,
      ts: false,
    });
  });

  it("routes Cadenza authoring skill docs through Markdown, governance, and TS tests", () => {
    expect(classifyCiChanges(["skills/cadenza/SKILL.md"])).toMatchObject({
      browser: false,
      format: false,
      full: false,
      governance: true,
      markdown: true,
      shell: false,
      ts: true,
    });
  });

  it("routes Cadenza skill eval JSON through formatter, governance, and TS tests", () => {
    expect(
      classifyCiChanges(["skills/cadenza/evals/evals.json"]),
    ).toMatchObject({
      browser: false,
      format: true,
      full: false,
      governance: true,
      markdown: false,
      shell: false,
      ts: true,
    });
  });

  it("routes the Phase 1 exit demo handoff through the TS test that reads it", () => {
    expect(
      classifyCiChanges(["trace/phase1/phase-exit-demo.md"]),
    ).toMatchObject({
      browser: false,
      format: false,
      full: false,
      governance: true,
      markdown: true,
      shell: false,
      ts: true,
    });
  });

  it("routes core source changes through formatter, unit TS, and browser preview checks", () => {
    expect(
      classifyCiChanges(["packages/core/src/runtime/createRuntime.ts"]),
    ).toMatchObject({
      browser: true,
      format: true,
      full: false,
      governance: false,
      markdown: false,
      shell: false,
      ts: true,
    });
  });

  it("routes browser harness changes through formatter, unit TS, and browser preview checks", () => {
    expect(
      classifyCiChanges(["tests/browser/render-safe-preview.spec.ts"]),
    ).toMatchObject({
      browser: true,
      format: true,
      full: false,
      governance: false,
      markdown: false,
      shell: false,
      ts: true,
    });
  });

  it("routes status and trace metadata through governance checks without TS", () => {
    expect(classifyCiChanges(["STATUS.yaml"])).toMatchObject({
      browser: false,
      format: false,
      full: false,
      governance: true,
      markdown: false,
      shell: false,
      ts: false,
    });
  });

  it("routes agent operating docs through governance checks", () => {
    expect(classifyCiChanges(["AGENTS.md"])).toMatchObject({
      browser: false,
      format: false,
      full: false,
      governance: true,
      markdown: true,
      shell: false,
      ts: false,
    });
  });

  it("routes frozen spec docs through Markdown and governance checks", () => {
    expect(classifyCiChanges(["spec/phase1/SPEC_TYPED_API.md"])).toMatchObject({
      browser: false,
      format: false,
      full: false,
      governance: true,
      markdown: true,
      shell: false,
      ts: false,
    });
  });

  it("routes shell script changes through shell formatting checks", () => {
    expect(classifyCiChanges(["scripts/hooks/session-brief.sh"])).toMatchObject(
      {
        browser: false,
        format: false,
        full: false,
        governance: false,
        markdown: false,
        shell: true,
        ts: false,
      },
    );
  });

  it("routes CI and toolchain changes through the full verification path", () => {
    expect(classifyCiChanges([".github/workflows/ci.yml"])).toMatchObject({
      browser: false,
      format: false,
      full: true,
      governance: false,
      markdown: false,
      shell: false,
      ts: false,
    });
  });

  it("routes governance TypeScript scripts through formatter, typecheck, and governance checks", () => {
    expect(classifyCiChanges(["scripts/phase-check.ts"])).toMatchObject({
      browser: false,
      format: true,
      full: false,
      governance: true,
      markdown: false,
      shell: false,
      ts: true,
    });
  });

  it("serializes classifications as GitHub Actions boolean outputs", () => {
    expect(formatGitHubOutputs(classifyCiChanges(["README.md"]))).toContain(
      "markdown=true",
    );
  });
});
