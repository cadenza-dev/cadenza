# Iteration 2 Conclusions

## Result

The Phase 3 update strengthens `cadenza-best-practices` in two material areas:

- `rules/data-explainers.md` teaches data-explainer authoring with
  chart/story framing, bounded labels, `Notes`, and render-safe composition.
- Eval 5 makes diagnostics-driven repair explicit and penalizes raw Remotion
  drift, framework internal edits, export claims, and Phase 4 product-layer
  claims.

## RULE-006 rationale

The new rule is justified as a single mono-skill rule file because it improves
more than one acceptance scenario: `TC-RULE-002` uses it for data-explainer
guidance and typecheckable examples, while `TC-RULE-003` uses it in evals that
check repair and boundary behavior. It stays inside the existing mono-skill and
does not introduce a separate skill or chart package.

## Repository Handling

Keep the curated evidence small and reviewable:

- committed source: `skills/cadenza/rules/data-explainers.md`;
- committed example: `skills/cadenza/examples/data-explainer.tsx`;
- committed evals: `skills/cadenza/evals/evals.json`;
- committed evidence: this file and `benchmark.md`.

The evidence is intentionally qualitative. It records with_skill /
without_skill comparison notes for the material behavior change without
committing generated workspaces.
