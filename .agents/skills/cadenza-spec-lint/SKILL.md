---
name: cadenza-spec-lint
description: Lint Cadenza spec files and surface structural findings. Use this when the user invokes cadenza-spec-lint, asks to validate spec structure, edits spec/**/*.md, or needs the spec:lint completion gate.
---

# Cadenza Spec Lint

Use this skill to validate Cadenza `spec/` Markdown contracts. Treat it as a
read-only verification workflow unless the user separately asks you to fix
findings.

## Inputs

If the user passed an argument, treat it as the target scope. Otherwise lint the
whole `spec/` tree.

## Workflow

1. If `package.json` exists and defines a `spec:lint` script, run:

   ```bash
   pnpm spec:lint <target-if-any>
   ```

   Capture and report the exit code.

2. If `package.json` is absent or has no `spec:lint` script, report:

   ```text
   Phase 0 pre-B-M4: `pnpm spec:lint` is not yet implemented. Falling back to bundled hygiene.
   ```

   Then run the bundled fallback script from this skill directory:

   ```bash
   bash ${CLAUDE_SKILL_DIR}/scripts/spec-lint-fallback.sh <target-if-any>
   ```

   In non-Claude runtimes, locate the active `cadenza-spec-lint` skill
   directory and run `scripts/spec-lint-fallback.sh` from there.

## Report Shape

Return this structure:

```text
Scope:         <file or "all specs">
Tool used:     <pnpm spec:lint | bundled fallback>
Files scanned: <N>
Findings:
  - <file> : <level: info|warn|error> : <message>

Summary:      <OK | N warnings | N errors>
Exit:         <0 or non-zero>
```

If errors are present, do not claim the work is done. Cadenza completion gates
require verification commands to exit successfully.
