# Validation Repair

When a deck fails, repair from structured evidence instead of guessing from the
rendered appearance.
Cadenza's validate-and-repair loop starts from diagnostics and validates one
focused repair before the next change.

## Loop

1. Run compile-time validation.
2. Run browser/preview validation if the issue is visual, readiness, or DOM
   measurement related.
3. Pass diagnostics to `createValidationReport` when available.
4. Follow `repairQueue`: fatal authoring errors first, warnings second.
5. Apply one focused repair.
6. Re-run validation before making the next change.

## Priority

- Missing or duplicate slide IDs.
- Invalid step kinds or durations.
- Nested decks.
- Missing offline duration for wait-for-event export.
- Unresolved computed steps in offline mode.
- Render-safe readiness timeouts.
- Typography overflow and media-frame aspect ratio warnings.

## Avoid

- Patching around diagnostics with raw Remotion primitives.
- Making several unrelated visual changes before re-running validation.
- Treating a green unit test as proof that browser-observable preview behavior
  is correct.
- Editing framework internals when the diagnostic points to authored deck
  structure, render-safe metadata, or skill guidance.
