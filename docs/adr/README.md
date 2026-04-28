# Architectural Decision Records (ADRs)

This directory captures significant architectural and strategic decisions made in the Cadenza project, using a lightweight [MADR](https://adr.github.io/madr/) style.

## Why ADRs?

Cadenza starts as a single-maintainer project with an AI agent as decision sparring partner. ADRs serve three purposes in this model:

1. **Future-self onboarding**: Six months from now, the maintainer will need to remember *why* a decision was made, not just *what* it was. ADRs preserve rationale.
2. **Co-maintainer onboarding**: When the project brings in advisors or co-maintainers, ADRs let them catch up on the reasoning chain without reconstructing the entire conversation history.
3. **Community debate surface**: External contributors can challenge a decision by proposing a superseding ADR, instead of having to argue against implicit tribal knowledge.

## Conventions

- **One decision per file**: If you notice a single ADR contains two orthogonal decisions, split them.
- **Numbered sequentially**: `NNNN-kebab-case-title.md`, starting at `0001`. No gaps.
- **Status is a lifecycle**: `Proposed → Accepted → (Deprecated | Superseded by NNNN)`. Never delete an ADR — supersede it.
- **Keep them short**: A good ADR is 200–500 words. If you need more space, link to a design doc.
- **Link back to analysis**: Reference the relevant section of [`docs/analysis/analysis-final.md`](../analysis/analysis-final.md) for full context.

## Template

See [`template.md`](./template.md).

## Index

| # | Title | Status | Date |
| :---- | :---- | :---- | :---- |
| [0001](./0001-primary-audience.md) | Primary audience: developers writing technical talks | Accepted | 2026-04-17 |
| [0002](./0002-typed-api-first-architecture.md) | Typed API + render-safe layer as architectural spine | Accepted | 2026-04-17 |
| [0003](./0003-skills-before-mcp.md) | Skills-first AI integration; MCP deferred | Accepted | 2026-04-17 |
| [0004](./0004-tsx-first-authoring.md) | TSX-first authoring; DSL deferred | Accepted | 2026-04-17 |
| [0005](./0005-apache-2-0-license.md) | Apache License 2.0 for the project | Accepted | 2026-04-17 |
| [0006](./0006-dual-oss-core-hosted-commercial-tier.md) | Dual OSS core plus hosted commercial tier | Accepted | 2026-04-25 |
| [0007](./0007-two-stage-remotion-engagement.md) | Two-stage Remotion engagement | Accepted | 2026-04-25 |
| [0008](./0008-single-maintainer-ai-agent-decision-loop.md) | Single-maintainer plus AI-agent decision loop | Accepted | 2026-04-25 |
| [0009](./0009-advisory-role-binding.md) | Advisory role binding with Startup Protocol | Accepted | 2026-04-25 |
| [0010](./0010-project-name-cadenza-github-org.md) | Project name Cadenza and GitHub org cadenza-dev | Accepted | 2026-04-25 |
| [0011](./0011-remotion-notification-outcome.md) | Remotion notification sent | Accepted | 2026-04-25 |
| [0012](./0012-reviewer-wizard-memory-workflow.md) | Reviewer, Wizard, and Project Memory Workflow | Accepted | 2026-04-28 |
| [0013](./0013-bootstrap-wizard-scout-architect-handoff.md) | Bootstrap Wizard for Scout-to-Architect Handoff | Accepted | 2026-04-28 |
