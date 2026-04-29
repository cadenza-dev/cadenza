# Skill Benchmark: cadenza-best-practices Iteration 2

**Model**: curated GPT-5/Codex qualitative review
**Date**: 2026-04-30T03:52:00+08:00
**Evals**: 4, 5

## Summary

| Eval | without_skill | with_skill | Material Change |
| :--- | :--- | :--- | :--- |
| 4 data-explainer | Produced a plausible chart-slide request but treated the chart as generic React markup, did not bound labels, and did not keep the work inside the mono-skill surface. | Used chart/story framing, bounded labels, `Notes`, `Theme`, `Step`, `ContentSlot`, `TypographyBox`, and `MediaFrame` through public Cadenza imports. | Data-explainer guidance becomes typecheckable and repairable without a chart package. |
| 5 diagnostics-driven repair | Mixed visual restyling with repair, allowed raw Remotion drift as a shortcut, and treated export and presenter-product claims as acceptable follow-up polish. | Started from `repairQueue`, fixed authored deck surfaces before style, rejected framework internal edits, required a `// why:` reason for raw Remotion escape hatches, and removed export or Phase 4 claims. | Repair guidance now penalizes the exact drift cases named by Phase 3. |

## Notes

- with_skill improves the material eval signal by making the data-explainer
  example source-inspectable and by routing review answers through
  diagnostics-driven repair.
- without_skill remains useful as a contrast because it shows the failure mode:
  generic chart code, raw visual patches, and product/export claims that Phase 3
  explicitly does not own.
- This is curated qualitative evidence, not a generated workspace benchmark.
  The purpose is to document why the new rule and eval prompts materially change
  the authoring surface.
