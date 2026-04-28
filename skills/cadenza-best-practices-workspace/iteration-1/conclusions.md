# Iteration 1 Conclusions

## Result

The first `skill-creator` loop shows that `cadenza-best-practices` adds clear
value over the baseline on the three starter evals.

- `with_skill`: 88.9% mean pass rate.
- `without_skill`: 38.1% mean pass rate.
- Delta: +0.51 absolute pass-rate improvement.

The strongest signal is Eval 1: the skill-guided run used the current
`@cadenza-dev/core` API, `Theme` tokens, `SafeImage`, `MediaFrame`,
`wait-for-event` with `exportDuration`, and `Notes`. The baseline produced a
plausible deck, but with stale or unsupported primitives.

## Interpretation

The benchmark supports keeping `cadenza-best-practices` as the Cadenza authoring
surface. It demonstrates practical value in three places:

- current API usage instead of generic deck-shaped TSX;
- render-safe authoring and preview/export boundary discipline;
- review/debug guidance that routes problems through Cadenza diagnostics rather
  than ad hoc visual patches.

## Follow-Up

The skill is not perfect yet. Eval 2 and Eval 3 exposed a small precision gap:
skill-guided answers used the validation-repair loop, but did not always name
`createValidationReport`, `repairQueue`, or fatal-before-warning ordering
explicitly.

The next useful iteration is a narrow wording update to make diagnostics-driven
repair plans surface those terms when the user asks for review or debugging.

## Metric Caveats

- This was one run per eval per configuration, not a statistical benchmark.
- Timing metrics were unavailable from the subagent notifications.
- Token figures in `benchmark.md` use `output_chars` as a proxy and should not
  be treated as model-token accounting.

## Repository Handling

Keep a curated record of the result, but do not treat the full raw workspace as
permanent source material by default.

Recommended committed evidence:

- `skills/cadenza/evals/evals.json`
- `skills/cadenza-best-practices-workspace/iteration-1/conclusions.md`
- optionally `skills/cadenza-best-practices-workspace/iteration-1/benchmark.md`

Recommended generated/ignored material:

- per-run `outputs/`, `transcript.md`, `grading.json`, and `timing.json`;
- `benchmark.json`, `analysis.json`, and `review.html`, unless a maintainer
  wants a fully reproducible audit snapshot for this milestone.

This keeps the repo trustworthy without making normal development feel like it
is carrying a large pile of generated eval artifacts.
