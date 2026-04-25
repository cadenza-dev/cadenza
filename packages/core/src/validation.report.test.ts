import {
  type CadenzaDiagnostic,
  createValidationReport,
} from "@cadenza-dev/core";
import { describe, expect, it } from "vitest";

describe("TC-VAL-006 validation repair report", () => {
  it("builds a stable machine-readable repair queue from structured diagnostics", () => {
    const diagnostics: CadenzaDiagnostic[] = [
      {
        severity: "warning",
        code: "RSAF_TYPOGRAPHY_OVERFLOW",
        message:
          "TypographyBox 'hero-title' overflowed during browser preview.",
        requirementId: "VAL-004",
        source: "hero-title",
      },
      {
        severity: "fatal",
        code: "VAL_MISSING_SLIDE_ID",
        message: "Slide id is required.",
        requirementId: "VAL-001",
        source: "deck",
      },
      {
        severity: "fatal",
        code: "VAL_MISSING_SLIDE_ID",
        message: "Slide id is required.",
        requirementId: "VAL-001",
        source: "deck",
      },
    ];

    expect(createValidationReport(diagnostics)).toMatchInlineSnapshot(`
      {
        "diagnostics": [
          {
            "code": "RSAF_TYPOGRAPHY_OVERFLOW",
            "message": "TypographyBox 'hero-title' overflowed during browser preview.",
            "requirementId": "VAL-004",
            "severity": "warning",
            "source": "hero-title",
          },
          {
            "code": "VAL_MISSING_SLIDE_ID",
            "message": "Slide id is required.",
            "requirementId": "VAL-001",
            "severity": "fatal",
            "source": "deck",
          },
          {
            "code": "VAL_MISSING_SLIDE_ID",
            "message": "Slide id is required.",
            "requirementId": "VAL-001",
            "severity": "fatal",
            "source": "deck",
          },
        ],
        "ok": false,
        "repairQueue": [
          {
            "action": "Add a stable unique id to each Slide.",
            "code": "VAL_MISSING_SLIDE_ID",
            "count": 2,
            "messages": [
              "Slide id is required.",
            ],
            "requirementId": "VAL-001",
            "severity": "fatal",
            "sources": [
              "deck",
            ],
          },
          {
            "action": "Revise TypographyBox content, sizing, or layout so browser preview no longer overflows.",
            "code": "RSAF_TYPOGRAPHY_OVERFLOW",
            "count": 1,
            "messages": [
              "TypographyBox 'hero-title' overflowed during browser preview.",
            ],
            "requirementId": "VAL-004",
            "severity": "warning",
            "sources": [
              "hero-title",
            ],
          },
        ],
        "schemaVersion": 1,
        "summary": {
          "byRequirement": {
            "VAL-001": 2,
            "VAL-004": 1,
          },
          "fatal": 2,
          "warning": 1,
        },
      }
    `);
  });
});
