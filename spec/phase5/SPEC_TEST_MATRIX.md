---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 5 Test Matrix

## Purpose

This frozen matrix maps Phase 5 requirements to acceptance scenarios Builder
will consume during implementation. Every scenario references requirement IDs
from the frozen Phase 5 domain specs.

## Builder Batch Shape

The Builder ordering should keep one vertical slice at a time:

1. Longer Phase 5 export source and local web-bundle export command.
2. Preview/export parity checks for web output and inherited product-layer
   behavior.
3. Export diagnostics, machine-readable evidence, human summary, and repair
   routing.
4. MP4/PDF format disposition, waiver path, and format-specific limitation
   evidence.
5. Alpha-readiness declaration, clean-checkout docs, public-surface stability
   gate, public launch-candidate material, and Reviewer acceptance route.
6. Remotion Lambda/hosted evaluation, MCP disposition, and presenter-console
   follow-up boundary checks.

## Acceptance Scenarios

| Test ID | Priority | Requirement IDs | Scenario |
| :--- | :--- | :--- | :--- |
| TC-EXPT-001 | P0 | EXPT-001, EXPT-005 | A longer technical-talk source uses public Cadenza TSX, Phase 4 product-layer patterns, and discoverable export workflow surfaces rather than package-internal fixtures. |
| TC-EXPT-002 | P0 | EXPT-002, EXPT-003, FMT-001 | A supported local command produces a deterministic reviewable web bundle baseline and manifest without hosted infrastructure. |
| TC-PEXP-001 | P0 | PEXP-001, PEXP-002 | Exported web output is compared with local preview for timeline identity, slide/step ordering, timing, transitions, and semantic anchors. |
| TC-PEXP-002 | P0 | PEXP-003, PEXP-004 | Exported output preserves notes boundaries and records render-safe, typography, and density parity diagnostics. |
| TC-EVDN-001 | P0 | EVDN-001, EVDN-002, EVDN-003 | Export runs emit machine-readable evidence plus a concise human summary naming source, command, artifacts, diagnostics, parity checks, and limitations. |
| TC-EVDN-002 | P1 | PEXP-005, EVDN-004, EVDN-005 | Export and parity failures route to actionable repair categories, and readiness or waiver claims require artifact-backed evidence. |
| TC-FMT-001 | P0 | FMT-002, FMT-004 | MP4 is supported for the canonical launch-candidate talk and PDF is waived or scoped as static proof, with no silent support claims. |
| TC-FMT-002 | P1 | FMT-003, FMT-005 | Every enabled or scoped format has artifact inventory, diagnostics, parity checks, and known limitations matching its declared capability. |
| TC-ALFA-001 | P0 | ALFA-001, ALFA-002, ALFA-007 | The declared alpha surface, clean-checkout install/run/preview/export documentation, and public launch-candidate material are coherent and route through supported commands. |
| TC-ALFA-002 | P0 | ALFA-003, ALFA-004 | The public-surface stability clock or waiver exists, and alpha readiness requires Reviewer acceptance after Builder closeout. |
| TC-ALFA-003 | P0 | ALFA-005, ALFA-006 | Phase 5 artifacts avoid external-alpha, hosted, commercial, marketplace, editor, collaboration, SSO, i18n, and publication overreach claims. |
| TC-LHEV-001 | P1 | LHEV-001, LHEV-002, LHEV-005 | Remotion Lambda and hosted rendering remain evaluation-only, with local compatibility, cost/risk, and license-boundary evidence. |
| TC-LHEV-002 | P0 | EXPT-004, LHEV-003, LHEV-004 | No local export or alpha-readiness gate requires secrets, remote accounts, paid jobs, publishing, or hosted infrastructure; hosted implementation routes through ADR or explicit approval. |
| TC-MCPA-001 | P1 | MCPA-001, MCPA-003, MCPA-005 | Read-only MCP resources and prompts are either justified by context limits and contract-defined inventory, or deferred with rationale. |
| TC-MCPA-002 | P1 | MCPA-002, MCPA-004 | Tool-based MCP remains deferred beyond Phase 5, and prohibited hosted/editor/commercial capabilities stay absent. |
| TC-PCON-001 | P1 | PCON-001, PCON-003, PCON-004 | Multi-device presenter console and replay artifacts are deferred or scoped as diagnostic evidence without accounts, SSO, collaboration, or hosted infrastructure. |
| TC-PCON-002 | P1 | PCON-002 | Live-presenter recording does not become the canonical export path. |

## Resolved Design Decisions

- `FC-EXPT-01`: canonical export source is a launch-grade longer technical
  talk under `examples/phase5/`.
- `FC-EXPT-02`: supported local export uses the narrow generic command shape
  `cadenza export <deck>`.
- `FC-EXPT-03`: generated artifacts use
  `dist/phase5/<deck-id>/<run-id>/`, with trace summaries pointing to accepted
  generated paths.
- `FC-PEXP-01`: parity covers the web baseline, canonical launch-candidate
  MP4, and any scoped static PDF proof if present.
- `FC-PEXP-02`: exported web output requires a browser-observable smoke test.
- `FC-PEXP-03`: parity uses semantic checkpoints plus deterministic offline
  frame fields.
- `FC-EVDN-01`: export evidence is JSON plus a concise Markdown summary.
- `FC-EVDN-02`: generated reports live with artifacts, while accepted summaries
  are recorded in trace after routing opens.
- `FC-EVDN-03`: known limitations use severity, category, affected artifact,
  and notes.
- `FC-FMT-01`: MP4 is supported for the canonical launch-candidate technical
  talk, with explicit limitations.
- `FC-FMT-02`: PDF is waived by default for launch readiness; a cheap static
  proof may be added without implying motion parity.
- `FC-FMT-03`: format claims are capability-specific, not blanket parity
  claims.
- `FC-ALFA-01`: the public surface includes package exports, documented preview
  and export commands, examples, and `cadenza-best-practices` guidance.
- `FC-ALFA-02`: the stability clock starts at the first Builder commit that
  declares the explicit public surface; otherwise it starts after Reviewer
  acceptance.
- `FC-ALFA-03`: Phase 5 may prepare package metadata, but publishing remains
  out of scope without separate maintainer approval.
- `FC-LHEV-01`: Remotion Lambda and hosted rendering get a structured local
  compatibility report without real remote jobs.
- `FC-LHEV-02`: a positive hosted recommendation routes through a Proposed ADR.
- `FC-LHEV-03`: evaluation evidence includes estimated costs, operational
  risks, licensing triggers, and assumptions.
- `FC-MCPA-01`: read-only MCP is deferred by default; focused read-only
  resources are allowed only if Markdown context injection proves inadequate.
- `FC-MCPA-02`: tool-based MCP is deferred beyond Phase 5.
- `FC-MCPA-03`: any Phase 5 MCP surface is limited to resources or prompts.
- `FC-PCON-01`: multi-device presenter console is deferred beyond Phase 5.
- `FC-PCON-02`: deterministic offline export remains canonical; live-presenter
  recording is not canonical.
- `FC-PCON-03`: no user-facing replay artifact is defined; diagnostic replay is
  allowed only if parity work needs it.

## Explicit Non-Scenarios

The following are not Phase 5 acceptance scenarios unless a later approved ADR
and frozen spec supersede this contract:

- Hosted SaaS implementation.
- Remotion Lambda production deployment.
- npm publishing, public release tags, or external alpha announcements.
- Template marketplace, WYSIWYG editor, real-time collaboration, comments, SSO,
  enterprise accounts, or i18n infrastructure.
- Business prompt-to-deck workflows.
- Full DSL, visual editor, or second authoritative deck representation.
- Live-presenter recording as canonical export.
