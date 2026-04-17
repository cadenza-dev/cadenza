# GitHub Copilot — Instructions for Cadenza

Cadenza uses [`AGENTS.md`](../AGENTS.md) at the repository root as the **canonical guide** for every AI agent. GitHub Copilot and any Copilot-style coding agent (Copilot Chat, Copilot PR coding agent, Copilot Workspace) must read `AGENTS.md` before proposing any change, and must follow its Authority Order when suggestions conflict with chat context.

## Quick orientation for Copilot suggestions

- Do **not** propose edits to files under `spec/**` that are marked `CONTRACT_FROZEN`. Surface the freeze and ask for explicit user approval before suggesting any change. The same applies to `docs/adr/**` ADRs whose status is `Accepted`.
- Do **not** propose edits under `packages/**/src/**` when the session is architect-driven. Architects write specs, ADRs, and designs; Builders write production code. See AGENTS.md §3 Roles.
- **Prefer the typed API** (`<Deck>`, `<Slide>`, `<Step>`, `<Transition>`, `<Notes>`, render-safe components) over raw Remotion primitives. Flag `useCurrentFrame`, `delayRender`, `continueRender`, and direct `TransitionSeries` usage as escape-hatch only — require a `// why:` comment explaining the reason.
- **Never propose `--no-verify` or `--force` flags** in commit commands. Fix the underlying hook failure instead.
- When uncertain between spec, ADR, ROADMAP, README, or chat context, defer to [`AGENTS.md`](../AGENTS.md) §2 Authority Order (higher wins).

## Workflow context

Cadenza operates a three-role agentic workflow (scout / architect / builder) with spec-driven design and test-first development. Contracts under `spec/<phase>/` are the highest authority. Every change flows through the phase lifecycle documented in [`docs/agentic-workflow.md`](../docs/agentic-workflow.md).

If a Copilot suggestion would bypass the workflow (edit a frozen spec, skip tests, or commit across role boundaries), prefer a smaller, compliant suggestion and note the constraint.

## Full references

- [`AGENTS.md`](../AGENTS.md) — map (≤ 150 lines; read in full)
- [`docs/agentic-workflow.md`](../docs/agentic-workflow.md) — long-form workflow explainer
- [`docs/adr/README.md`](../docs/adr/README.md) — index of architectural decisions
- [`goals-non-goals.md`](../goals-non-goals.md) — scope ceiling
