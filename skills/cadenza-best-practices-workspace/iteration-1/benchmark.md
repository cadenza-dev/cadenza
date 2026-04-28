# Skill Benchmark: cadenza-best-practices

**Model**: GPT-5-family/codex subagents
**Date**: 2026-04-28T15:56:17Z
**Evals**: 1, 2, 3 (1 run each per configuration)

## Summary

| Metric    | With Skill  | Without Skill | Delta |
| --------- | ----------- | ------------- | ----- |
| Pass Rate | 89% ± 10%   | 38% ± 21%     | +0.51 |
| Time      | 0.0s ± 0.0s | 0.0s ± 0.0s   | +0.0s |
| Tokens    | 2870 ± 785  | 2300 ± 532    | +570  |

## Notes

- with_skill improved mean pass rate from 38.1% to 88.9%, a +0.51 absolute
  delta across the three starter evals.
- Eval 1 is the strongest differentiator: with_skill used current
  `@cadenza-dev/core` primitives, `Theme` tokens, `SafeImage`, `MediaFrame`,
  `wait-for-event` `exportDuration`, and `Notes`; without_skill produced
  deck-shaped TSX with stale or unsupported primitives.
- Eval 2 and Eval 3 surfaced a small precision gap: with_skill used the
  validation-repair loop but did not always explicitly name
  `createValidationReport`, `repairQueue`, or fatal-before-warning ordering.
- Timing metrics are unavailable from this harness's subagent completion
  notification; benchmark token numbers use `output_chars` as a proxy and
  should not be read as model-token accounting.
- No skill body rewrite was applied in this iteration; the review artifact is
  intended to support human qualitative review before deciding whether to
  strengthen validation-repair wording.
