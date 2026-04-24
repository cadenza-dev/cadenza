---
description: "Run pnpm spec:lint (whole repo, or a target file) and surface the results"
argument-hint: "[file-path-or-empty]"
---


Lint Cadenza's spec/ directory for structural and semantic issues. Target scope is $ARGUMENTS if provided, else the whole `spec/` tree.

Steps:

1. If `package.json` exists and has a `spec:lint` script, run `pnpm spec:lint $ARGUMENTS`. Capture exit code.
2. If `package.json` does not exist or the script is missing, report: "Phase 0 pre-B-M4: `pnpm spec:lint` is not yet implemented. Falling back to in-shell hygiene." Then list every file under `spec/**/*.md` and, for each, check:
   - Presence of a Status marker (one of `CONTRACT_DRAFT`, `CONTRACT_FROZEN`, `DEPRECATED`).
   - Presence of properly formatted requirement IDs (`<PREFIX>-<DIGITS>`).
   - If it is a `SPEC_TEST_MATRIX.md`, cross-reference each requirement ID back to the originating spec in the same phase.

Report in this shape:

```text
Scope:        <file or "all specs">
Tool used:    <pnpm spec:lint | shell fallback>
Files scanned: <N>
Findings:
  - <file> : <level: info|warn|error> : <message>

Summary:     <OK | N warnings | N errors>
Exit:        <0 or non-zero>
```

If errors > 0, **do not mark the session as "done"** — per AGENTS.md §6, verification commands must exit 0 before you claim completion.
