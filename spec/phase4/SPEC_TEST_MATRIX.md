---
Status: CONTRACT_FROZEN
Stage: B
Owner: Architect
---

# Phase 4 Test Matrix

## Purpose

This frozen matrix defines the acceptance scenarios Builder will consume for
Phase 4. Every scenario references requirement IDs from the Phase 4 domain
specs.

## Builder Batch Shape

The initial Builder ordering should keep one vertical slice at a time:

1. Dogfood talk source and local Remotion Player preview entrypoint.
2. Presenter workflow with notes, current/next context, and outline navigation.
3. Visual acceptance evidence and repair routing.
4. Typography auto-fit and density diagnostics.
5. Stronger transitions and transition-progress boundary.
6. Technical-talk starters, `cadenza-best-practices`, and deferred-scope guards.

## Acceptance Scenarios

| Test ID | Priority | Requirement IDs | Scenario |
| :--- | :--- | :--- | :--- |
| TC-DOGF-001 | P0 | DOGF-001, DOGF-002, DOGF-004 | A production-adjacent Phase 4 dogfood talk uses public TSX and render-safe surfaces outside package source or test-only fixtures. |
| TC-DOGF-002 | P0 | DOGF-003 | A local maintainer-facing preview route or command opens the dogfood talk in Remotion Player without making Playwright the primary interface. |
| TC-PRES-001 | P0 | PRES-001, PRES-002, PRES-003 | Presenter workflow stays synchronized with runtime cursor, notes, elapsed time, and current/next context while navigating the dogfood talk. |
| TC-PRES-002 | P1 | PRES-004, PRES-005 | Outline, chapter, and presenter controls navigate through runtime-mediated behavior rather than direct UI frame math. |
| TC-VARR-001 | P0 | PRES-006, VARR-001, VARR-004, VARR-005 | Human visual findings are recorded with diagnostics, commands or routes, repair surfaces, and maintainer-readable summary. |
| TC-VARR-002 | P0 | VARR-002, VARR-006 | Trace-only visual acceptance remains insufficient; optional screenshots or pixel artifacts supplement, not replace, real acceptance evidence. |
| TC-VARR-003 | P0 | VARR-003 | A visual finding is repaired through authored deck or guidance changes, with framework-internal defects routed separately. |
| TC-TYPO-001 | P0 | TYPO-001, TYPO-002 | Typography auto-fit or fallback behavior is deterministic, bounded, and diagnostic-rich for fitting and non-fitting cases. |
| TC-TYPO-002 | P1 | TYPO-003, TYPO-004 | Density and overflow diagnostics are preview-observable and contain locator, measured value, category, and repair direction. |
| TC-TRPR-001 | P0 | TRPR-001, TRPR-002 | Stronger transitions use typed Cadenza semantics and play through local preview while settling at deterministic anchors. |
| TC-TRPR-002 | P1 | TRPR-003, TRPR-004 | Transition progress uses the internal product-layer surface and exposes actionable transition diagnostics without overloading cursor changes. |
| TC-STAR-001 | P0 | STAR-001, STAR-002 | Technical-talk starters target developers and use public Cadenza surfaces, notes, presenter metadata, and local preview repair workflow. |
| TC-STAR-002 | P1 | STAR-003, STAR-004 | `cadenza-best-practices` teaches Phase 4 product-layer workflows and evals reward technical-talk structure while penalizing boundary drift. |
| TC-STAR-003 | P0 | DOGF-005, TYPO-005, TRPR-005, STAR-005, STAR-006 | Phase 4 artifacts avoid export, hosted-rendering, Remotion Lambda, public-stability, external-alpha, WYSIWYG, marketplace, collaboration, and MCP overreach claims. |

## Resolved Stage A Decisions

- `FC-DOGF-01`: canonical dogfood talk location is `examples/phase4/`.
- `FC-DOGF-02`: maintainer-facing preview entrypoint is a local preview command
  or example entrypoint, not Playwright as the primary interface.
- `FC-DOGF-03`: canonical dogfood topic is a Cadenza architecture talk with at
  least one data-explainer slide.
- `FC-PRES-01`: presenter workflow uses a same-browser panel.
- `FC-PRES-02`: next context uses lightweight next-slide preview or metadata
  from the same runtime source, not a second authoritative Player.
- `FC-PRES-03`: outline and chapters use optional metadata on existing typed
  surfaces.
- `FC-VARR-01`: visual acceptance evidence is JSON plus concise Markdown.
- `FC-VARR-02`: Phase 4 closeout requires maintainer visual sign-off or an
  explicit maintainer waiver with supporting evidence.
- `FC-VARR-03`: visual findings use structured categories plus free-form notes.
- `FC-TYPO-01`: auto-fit is opt-in and deterministic.
- `FC-TYPO-02`: auto-fit may adjust font size, line height, and spacing within
  deterministic limits, but does not rewrite text.
- `FC-TYPO-03`: density thresholds come from theme-level budgets with
  deterministic defaults.
- `FC-TRPR-01`: Phase 4 uses a small typed transition roster.
- `FC-TRPR-02`: transition progress uses an internal product-layer surface, not
  a public hook or callback.
- `FC-TRPR-03`: transition evidence records start, progress, and settle
  diagnostics.
- `FC-STAR-01`: Phase 4 requires three narrow technical-talk starters.
- `FC-STAR-02`: starter guidance lives in the mono-skill plus TSX examples.
- `FC-STAR-03`: read-only MCP is evaluated at closeout or Phase 5 startup, not
  implemented in Phase 4.

## Explicit Non-Scenarios

The following are not Phase 4 acceptance scenarios:

- MP4 export.
- PDF export.
- hosted rendering or Remotion Lambda.
- public API stability over time.
- external alpha usage as a phase gate.
- template marketplace, WYSIWYG editor, collaboration, comments, SSO, or i18n
  infrastructure.
- tool-based MCP.
- package-source edits as normal dogfood-talk repair.
- a broad screenshot-diff suite as the only visual acceptance oracle.
