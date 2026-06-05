# Phase 7 Pre-Architect UI Prototype Decisions

> Status: QA decisions settled; promotion evidence pending; not a contract.
> Date: 2026-06-04.
> Companion topic map:
> [phase7-pre-architect-ui-prototype-topics.md](./phase7-pre-architect-ui-prototype-topics.md).
> Scope: Phase 7 UI prototype discussion only.
> Approved session identity: `GPT-5/Codex` proceeding as Architect-adjacent
> pre-Architect QA partner after maintainer approval. This file is the session
> note required by the approval gate; it does not update trace, specs, ADRs, or
> packages.

This file records the settled decisions from the Phase 7 UI prototype topic map.
Each question's problem statement, options, tradeoffs, and recommendation live
in [the topic map](./phase7-pre-architect-ui-prototype-topics.md).

It does not freeze `spec/phase7/`, create a `@cadenza-dev/player-app` package,
define public API, or replace Architect Stage A/B. Only after the full prototype
blocker is resolved should Topic 3 move from `open` to `decided`.

## Discussion Status

Q1-Q20 are settled. Topic 3 remains blocked from moving to `decided` until the
promotion evidence in Q17 exists: a previewable prototype in
`design/ui-prototype/` or an explicitly maintainer-accepted design substitute,
annotated screenshots, fixture provenance map, limitation note, and guideline
cross-references.

## Decision Summary

| Question | Topic | Decision Status | Topic Reference |
| :---- | :---- | :---- | :---- |
| Q1 | Prototype Artifact And Lifetime | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q1-prototype-artifact-and-lifetime) |
| Q2 | Prototype Technology Stack | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q2-prototype-technology-stack) |
| Q3 | Fixture And Data Strategy | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q3-fixture-and-data-strategy) |
| Q4 | Required Prototype States | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q4-required-prototype-states) |
| Q5 | Desktop Layout Model | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q5-desktop-layout-model) |
| Q6 | Mobile And Narrow Viewport Model | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q6-mobile-and-narrow-viewport-model) |
| Q7 | Bottom Controls IA | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q7-bottom-controls-ia) |
| Q8 | Inspector Information Architecture | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q8-inspector-information-architecture) |
| Q9 | Outline, Chapters, And Deck Identity | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q9-outline-chapters-and-deck-identity) |
| Q10 | Speaker Notes Boundary | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q10-speaker-notes-boundary) |
| Q11 | Readiness And Diagnostics Presentation | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q11-readiness-and-diagnostics-presentation) |
| Q12 | Export Provenance And Known Limitations | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q12-export-provenance-and-known-limitations) |
| Q13 | Visual Quality Bar | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q13-visual-quality-bar) |
| Q14 | Visual Style And Design Tokens | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q14-visual-style-and-design-tokens) |
| Q15 | Accessibility And Keyboard Scope | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q15-accessibility-and-keyboard-scope) |
| Q16 | Source Editing And Repair Non-Goals In UI | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q16-source-editing-and-repair-non-goals-in-ui) |
| Q17 | Prototype Promotion Evidence | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q17-prototype-promotion-evidence) |
| Q18 | Stage A Handoff Boundary | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q18-stage-a-handoff-boundary) |
| Q19 | Visual Verification Strategy For The Prototype | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q19-visual-verification-strategy-for-the-prototype) |
| Q20 | Visual Companion Or Text-Only Discussion | decided | [Topic](./phase7-pre-architect-ui-prototype-topics.md#q20-visual-companion-or-text-only-discussion) |

## Q1. Prototype Artifact And Lifetime

- Topic reference:
  [Q1. Prototype Artifact And Lifetime](./phase7-pre-architect-ui-prototype-topics.md#q1-prototype-artifact-and-lifetime)

- Status: decided.

- Consensus decision: Use `design/ui-prototype/` for the UI prototype artifact.
  Treat it as a design-only disposable prototype unless a later explicit
  Architect/Builder task promotes a specific result.

- Stage A handoff note: Stage A may cite findings from `design/ui-prototype/`,
  but must restate them as options, Freeze Candidates, evidence expectations,
  or rejected alternatives rather than copying prototype structure as frozen
  contract.

- Updated: 2026-06-04.

## Q2. Prototype Technology Stack

- Topic reference:
  [Q2. Prototype Technology Stack](./phase7-pre-architect-ui-prototype-topics.md#q2-prototype-technology-stack)

- Status: decided.

- Consensus decision: Use a React browser prototype with fixture data in
  `design/ui-prototype/`. The prototype may use high-quality component and
  styling libraries where useful, but it remains design-only and outside the
  package/workspace/public API boundary.

- Stage A handoff note: Architect Stage A may use the React prototype to reason
  about component decomposition, layout states, and visual system direction.
  Stage A must still decide separately whether to depend on `CadenzaPlayer`,
  `preview-remotion`, a new `player-app` package, or any concrete component
  library.

- Updated: 2026-06-04.

## Q3. Fixture And Data Strategy

- Topic reference:
  [Q3. Fixture And Data Strategy](./phase7-pre-architect-ui-prototype-topics.md#q3-fixture-and-data-strategy)

- Status: decided.

- Consensus decision: Use a hybrid fixture strategy. Prototype data should draw
  representative JSON from real deck metadata, validate summary,
  `CadenzaPlayerSnapshot`, manifest, and per-format evidence where possible,
  with each field marked by source. Fields that exist only for layout
  exploration must be explicitly marked `prototype-only`.

- Stage A handoff note: Architect Stage A may use the hybrid fixture map to
  identify which data fields are already available, which require a Player App
  data contract, and which should remain prototype-only. The fixture shape
  itself is not a Phase 7 API or evidence schema.

- Updated: 2026-06-04.

## Q4. Required Prototype States

- Topic reference:
  [Q4. Required Prototype States](./phase7-pre-architect-ui-prototype-topics.md#q4-required-prototype-states)

- Status: decided.

- Consensus decision: Use a multi-state prototype with a small curated state
  set: happy path, pending readiness, diagnostic/error, and export
  provenance/known-limitation. The prototype should demonstrate enough state
  density to test inspector IA and layout resilience, but should not model a
  complete Player App state machine.

- Stage A handoff note: Architect Stage A may use these states as candidate
  evidence scenarios and layout stress cases. Stage A must still decide exact
  runtime states, diagnostic categories, and acceptance coverage separately.

- Updated: 2026-06-04.

## Q5. Desktop Layout Model

- Topic reference:
  [Q5. Desktop Layout Model](./phase7-pre-architect-ui-prototype-topics.md#q5-desktop-layout-model)

- Status: decided.

- Consensus decision: Use the three-rail desktop layout recorded in
  [layout-guideline.md](../design/ui-prototype/docs/layout-guideline.md): center deck
  canvas, left collapsible/resizable static slide-preview rail, right
  collapsible/resizable inspector rail, and bottom collapsible/resizable
  controls. Left and right rails have higher layout priority than the bottom
  rail, so the bottom rail avoids open side rails. The top-right nav cluster
  should expose left/bottom/right collapse buttons plus a side-rail swap button.

- Stage A handoff note: Architect Stage A may cite
  [layout-guideline.md](../design/ui-prototype/docs/layout-guideline.md) as the
  accepted pre-Architect desktop layout direction, while still deciding exact
  responsive behavior, implementation package, component library, and production
  acceptance criteria separately.

- Updated: 2026-06-04.

## Q6. Mobile And Narrow Viewport Model

- Topic reference:
  [Q6. Mobile And Narrow Viewport Model](./phase7-pre-architect-ui-prototype-topics.md#q6-mobile-and-narrow-viewport-model)

- Status: decided.

- Consensus decision: Mobile and narrow viewport behavior should be a
  responsive viewer, not a full mobile presenter surface. The prototype should
  keep the deck first, keep controls sticky or collapsible, and represent
  rails/inspector content as drawer, sheet, or folded layers. It should not
  promise a complete mobile notes, timer, presenter-console, or gesture-heavy
  presenting workflow.

- Stage A handoff note: Architect Stage A may use this as the mobile baseline:
  prove that the Player App remains usable on narrow viewports, while keeping
  formal mobile presenter mode as a future enhancement unless explicitly
  promoted.

- Updated: 2026-06-04.

## Q7. Bottom Controls IA

- Topic reference:
  [Q7. Bottom Controls IA](./phase7-pre-architect-ui-prototype-topics.md#q7-bottom-controls-ia)

- Status: decided.

- Consensus decision: Use minimal bottom controls plus required fullscreen
  support. Fullscreen behavior follows
  [fullscreen-navigation-guideline.md](../design/ui-prototype/docs/fullscreen-navigation-guideline.md):
  configured/default keyboard navigation remains active; mouse-like pointer
  input uses left/right edge-reveal previous/next buttons plus right-click
  controls; touch input uses the maintainer-requested swipe/tap mapping; and
  external presenter-controller handling remains a future research item before
  any production contract is frozen.

- Stage A handoff note: Architect Stage A may cite
  [fullscreen-navigation-guideline.md](../design/ui-prototype/docs/fullscreen-navigation-guideline.md)
  as the accepted pre-Architect fullscreen/navigation direction. Stage A should
  research external presenter-controller standards and mature presentation-tool
  behavior before freezing implementation details for hardware/controller input.

- Updated: 2026-06-04.

## Q8. Inspector Information Architecture

- Topic reference:
  [Q8. Inspector Information Architecture](./phase7-pre-architect-ui-prototype-topics.md#q8-inspector-information-architecture)

- Status: decided.

- Consensus decision: Use summary-first inspector IA with a right activity bar
  plus collapsible/resizable sections inside the active topic pane, following
  [inspector-ia-guideline.md](../design/ui-prototype/docs/inspector-ia-guideline.md).
  `Summary` is expanded by default; `Outline`, `Timeline`, `Readiness`,
  `Diagnostics`, `Provenance`, `Notes`, and `Limitations` are expandable
  sections with topic-specific default expansion rules.

- Stage A handoff note: Architect Stage A may cite
  [inspector-ia-guideline.md](../design/ui-prototype/docs/inspector-ia-guideline.md)
  as the accepted pre-Architect inspector IA direction. Stage A should still
  decide exact data contracts, field names, component library, and accessibility
  acceptance separately.

- Updated: 2026-06-04.

## Q9. Outline, Chapters, And Deck Identity

- Topic reference:
  [Q9. Outline, Chapters, And Deck Identity](./phase7-pre-architect-ui-prototype-topics.md#q9-outline-chapters-and-deck-identity)

- Status: decided.

- Consensus decision: Use the mild version of option A. The first viewport
  should display the human-readable deck title and keep the deck canvas as the
  primary product surface. Engineering-facing identity belongs in inspector
  metadata and summary sections: `deckId`, selector, source path, manifest
  identity, and stable hash where available. Outline and chapters are primarily
  represented by the left slide-preview rail and the right inspector `Outline`
  section.

- Stage A handoff note: Architect Stage A may choose exact labels and metadata
  placement, but should preserve the Phase 6 identity authority: deck module
  metadata owns canonical deck identity. Config aliases, CLI selectors, and
  filenames may appear as resolver/provenance information only; they must not
  override or invent Player App display identity.

- Updated: 2026-06-04.

## Q10. Speaker Notes Boundary

- Topic reference:
  [Q10. Speaker Notes Boundary](./phase7-pre-architect-ui-prototype-topics.md#q10-speaker-notes-boundary)

- Status: decided.

- Consensus decision: Use the staged notes/presenter-view model. Normal
  audience/player view keeps speaker notes hidden by default; notes are not
  audience content and are inspectable only through explicit presenter metadata
  affordances. The UI prototype may design a complete presenter-view flow,
  following
  [presenter-view-guideline.md](../design/ui-prototype/docs/presenter-view-guideline.md):
  multi-display split presentation when the runtime can support it, normal
  player view when it cannot, and right-click force-open presenter view on the
  current screen. Browser/web local-ready should not promise reliable automatic
  multi-screen placement, but a desktop app shell can target reliable
  multi-display presenter mode if OS-level display/window APIs are accepted in
  scope and validated.

- Stage A handoff note: Architect Stage A should keep notes privacy and
  presenter metadata boundaries explicit, then decide whether presenter view is
  prototype-only, a browser feature-detected enhancement, a local-ready
  promotion gate, or an app-shell follow-up. Before freezing any presenter mode
  contract, Stage A should research browser Window Management support,
  Electron/Tauri/equivalent display/window APIs, platform behavior, and the
  evidence required for reliable app-side presenter mode.

- Updated: 2026-06-04.

## Q11. Readiness And Diagnostics Presentation

- Topic reference:
  [Q11. Readiness And Diagnostics Presentation](./phase7-pre-architect-ui-prototype-topics.md#q11-readiness-and-diagnostics-presentation)

- Status: decided.

- Consensus decision: Use the expanded global status model recorded in
  [layout-guideline.md](../design/ui-prototype/docs/layout-guideline.md) and
  [inspector-ia-guideline.md](../design/ui-prototype/docs/inspector-ia-guideline.md).
  The normal desktop shell has a narrow persistent bottom status bar with left
  and right summary clusters and an intentionally empty center. The health
  signal sits on the side nearest the inspector rail, follows the inspector
  rail when side rails are swapped, shows `Ready`, `Checking`, `Warnings`, or
  `Blocked` with compact counts, and opens the relevant inspector topic when
  clicked. Readiness and diagnostics details live in the inspector. Blocking
  render/playback cases use a top-center error message bar below the top
  navigation area, with a path into inspector diagnostics; non-blocking warnings
  do not cover the deck.

- Stage A handoff note: Architect Stage A may cite the bottom status bar and
  top-center blocking error bar as the accepted pre-Architect visibility model.
  Stage A should still decide exact state taxonomy, severity thresholds, copy,
  accessibility behavior, responsive behavior, and whether the bottom status
  bar exists in fullscreen or only in the normal desktop shell.

- Updated: 2026-06-04.

## Q12. Export Provenance And Known Limitations

- Topic reference:
  [Q12. Export Provenance And Known Limitations](./phase7-pre-architect-ui-prototype-topics.md#q12-export-provenance-and-known-limitations)

- Status: decided.

- Consensus decision: Use compact provenance summary plus structured
  expandable evidence details, following
  [inspector-ia-guideline.md](../design/ui-prototype/docs/inspector-ia-guideline.md).
  The prototype should make Phase 6-style export evidence readable and
  locatable: deck identity, selected formats, stable hash, schema version,
  manifest path, per-format capability status, evidence file references,
  artifact roles, byte sizes, sha256 summaries, selector provenance, and known
  limitations. `stableHash` and canonical deck identity should stay visually
  distinct from volatile generation facts such as `generatedAt`, output
  directory, and run-local paths. Raw JSON is optional folded detail, not the
  primary provenance UI. The prototype must not add `Re-export`, `Fix`,
  source-drift comparison, source-aware refresh, or source editing actions.

- Stage A handoff note: Architect Stage A may cite this as the accepted
  pre-Architect export provenance direction. Stage A should still decide exact
  Player App data source, field names, copy/open affordances, and which Phase 6
  manifest/evidence fields are promoted, transformed, or explicitly omitted
  for Phase 7.

- Updated: 2026-06-04.

## Q13. Visual Quality Bar

- Topic reference:
  [Q13. Visual Quality Bar](./phase7-pre-architect-ui-prototype-topics.md#q13-visual-quality-bar)

- Status: decided.

- Consensus decision: Use a high-fidelity static shell as the visual quality
  bar for resolving the UI direction. The prototype should have realistic
  spacing, typography, color treatment, icon/button styling, rail density,
  status surfaces, empty states, warning/error states, and representative
  fixture-driven content. It should be polished enough to evaluate product feel,
  visual hierarchy, inspector density, and responsive layout direction. It does
  not need production component completeness, real runtime integration,
  persisted settings, production animation polish, full accessibility
  acceptance, or exhaustive interaction coverage.

- Stage A handoff note: Architect Stage A may cite the prototype's visual
  quality as directional evidence only. Stage A should still decide production
  component library, design tokens, accessibility acceptance, interaction
  completeness, animation/motion policy, and final verification requirements
  separately.

- Updated: 2026-06-04.

## Q14. Visual Style And Design Tokens

- Topic reference:
  [Q14. Visual Style And Design Tokens](./phase7-pre-architect-ui-prototype-topics.md#q14-visual-style-and-design-tokens)

- Status: decided.

- Consensus decision: Use the balanced technical-player direction recorded in
  [visual-style-guideline.md](../design/ui-prototype/docs/visual-style-guideline.md).
  Non-color style is accepted now: the deck canvas remains visually primary and
  presentation-ready, while chrome, rails, inspector sections, and status
  surfaces stay quiet, compact, scannable, and developer-tool-like. Color is
  accepted as a shadcn-compatible light/dark direction: neutral or zinc-like
  base, support for dark and light mode, low-interference deck-area chrome, one
  restrained interaction or brand accent, and semantic health/status colors.
  shadcn is a reasonable candidate for prototype UI/layout/style/component
  exploration, but it is not frozen as a production dependency. If a later
  component-library decision rejects shadcn or chooses a substantially different
  system, the color direction may be reopened; the non-color balanced
  technical-player posture remains the baseline unless explicitly reopened.

- Stage A handoff note: Architect Stage A may cite
  [visual-style-guideline.md](../design/ui-prototype/docs/visual-style-guideline.md)
  as the accepted pre-Architect visual style direction. Stage A should still
  decide production design tokens, component library, theme implementation,
  accessibility constraints, final color palette, and visual verification
  requirements separately.

- Updated: 2026-06-04.

## Q15. Accessibility And Keyboard Scope

- Topic reference:
  [Q15. Accessibility And Keyboard Scope](./phase7-pre-architect-ui-prototype-topics.md#q15-accessibility-and-keyboard-scope)

- Status: decided.

- Consensus decision: Use option B. The prototype should demonstrate a basic
  accessibility posture without defining a full acceptance matrix. It should
  record and, where useful, lightly implement keyboard paths for previous/next,
  fullscreen navigation, rail collapse/expand, inspector topic switching,
  section expansion, and status-signal drilldown. It should have an intentional
  focus order, visible focus states, named icon controls or tooltips,
  reduced-motion handling for collapses/fades, and screen-reader-oriented
  labels for core regions such as deck, controls, status, and inspector. This
  direction is distributed across
  [layout-guideline.md](../design/ui-prototype/docs/layout-guideline.md),
  [fullscreen-navigation-guideline.md](../design/ui-prototype/docs/fullscreen-navigation-guideline.md),
  and
  [inspector-ia-guideline.md](../design/ui-prototype/docs/inspector-ia-guideline.md).

- Stage A handoff note: Architect Stage A may cite this as the accepted
  pre-Architect accessibility posture. Stage A should still decide production
  keyboard shortcuts, focus traps, ARIA details, touch/pointer parity,
  reduced-motion policy, screen-reader acceptance, and test coverage
  separately.

- Updated: 2026-06-04.

## Q16. Source Editing And Repair Non-Goals In UI

- Topic reference:
  [Q16. Source Editing And Repair Non-Goals In UI](./phase7-pre-architect-ui-prototype-topics.md#q16-source-editing-and-repair-non-goals-in-ui)

- Status: decided.

- Consensus decision: Use the conservative version of option B, following
  [inspector-ia-guideline.md](../design/ui-prototype/docs/inspector-ia-guideline.md).
  The prototype may show read-only repair hints and copy affordances for
  diagnostic code, locator, source/evidence path, command path, or inspect
  command. It must not show `Fix`, `Apply patch`, `Ask AI`, source editor,
  `Regenerate`, `Re-export`, source-aware refresh, or disabled/future repair
  buttons. The wording should frame diagnostics as guidance and evidence
  location, not as in-app repair actions.

- Stage A handoff note: Architect Stage A may cite this as the accepted
  read-only inspector boundary. Stage A should still decide exact copy
  affordances, command labels, external artifact links, and how diagnostics
  route users back to terminal/editor workflows without becoming Player App
  repair features.

- Updated: 2026-06-04.

## Q17. Prototype Promotion Evidence

- Topic reference:
  [Q17. Prototype Promotion Evidence](./phase7-pre-architect-ui-prototype-topics.md#q17-prototype-promotion-evidence)

- Status: decided.

- Consensus decision: Use B-expanded/C-light promotion evidence. Topic 3 may
  move from `open` to `decided` only when the UI prototype blocker is resolved
  by either a previewable React prototype in `design/ui-prototype/` or an
  explicitly maintainer-accepted design substitute. Required evidence:
  all Q1-Q20 entries in this decision log are resolved; the prototype or design
  substitute is previewable or inspectable; annotated screenshots cover at
  least desktop normal shell, desktop diagnostics/provenance state, and
  narrow/mobile viewer state; a fixture provenance map distinguishes fields
  from deck metadata, validate summary, player snapshot, manifest/evidence,
  and `prototype-only`; the evidence explicitly states that the prototype is
  not a package boundary, public API, frozen spec, or production UI; and the
  evidence cross-references the relevant guideline files under
  `design/ui-prototype/`.

- Strengthening evidence: A lightweight browser smoke, light/dark screenshot
  pair, blocking/error-state screenshot, and brief Stage A risk notes are
  recommended when cheap. Automated pixel thresholds, broad browser matrices,
  production accessibility tests, and real runtime integration are not required
  for this pre-Architect promotion decision.

- Stage A handoff note: Architect Stage A may cite the promotion evidence as
  proof that the UI direction is visible, traceable, and handoff-ready. Stage A
  must still translate the evidence into options, Freeze Candidates,
  non-goals, risks, and evidence needs rather than treating screenshots,
  fixture field names, CSS, or prototype component structure as frozen
  contracts.

- Updated: 2026-06-04.

## Q18. Stage A Handoff Boundary

- Topic reference:
  [Q18. Stage A Handoff Boundary](./phase7-pre-architect-ui-prototype-topics.md#q18-stage-a-handoff-boundary)

- Status: decided.

- Consensus decision: Use option B, following
  [stage-a-handoff-guideline.md](../design/ui-prototype/docs/stage-a-handoff-guideline.md).
  Prototype findings should enter Architect Stage A as a decision/evidence
  packet, not as implementation baseline. The handoff should summarize baseline
  direction, rejected alternatives, Freeze Candidates, required evidence, open
  risks, non-goals, and prototype-only details that must not be frozen
  accidentally. It should maintain references to the prototype artifact
  directory or accepted design substitute, and also to the source or decision
  files that justify each major conclusion. Stage A may promote findings only
  by restating them as options, Freeze Candidates, requirements, evidence
  gates, rejected alternatives, or deferred risks.

- Stage A handoff note: The handoff packet should include an explicit
  non-freeze note: prototype screenshots, CSS, component structure, fixture
  names, icon choices, exact pixels, and labels are directional evidence, not
  package topology, public API, frozen spec, or production behavior. When Stage
  A cites implementation facts, it should reference the source file or generated
  record, not only the prototype fixture.

- Updated: 2026-06-04.

## Q19. Visual Verification Strategy For The Prototype

- Topic reference:
  [Q19. Visual Verification Strategy For The Prototype](./phase7-pre-architect-ui-prototype-topics.md#q19-visual-verification-strategy-for-the-prototype)

- Status: decided.

- Consensus decision: Use option B as lightweight visual verification. The
  prototype packet should keep annotated screenshots for at least desktop
  normal shell, desktop diagnostics/provenance state, and narrow/mobile viewer
  state. Recommended additional screenshots include light/dark mode, blocking
  or error state, and presenter-view state when the prototype expresses them.
  Each screenshot should have a short note explaining which layout, IA, visual,
  or responsive decision it verifies and which issues remain for Stage A. A
  lightweight browser smoke is acceptable when cheap: page opens, is nonblank,
  key fixture states can switch, and desktop/mobile viewports are broadly
  inspectable. Automated pixel thresholds, broad browser matrices, CI visual
  regression, production accessibility screenshot tests, and exact layout
  parity assertions are not required in pre-Architect promotion evidence.

- Stage A handoff note: Architect Stage A may use screenshots and visual notes
  as supplemental evidence for layout and visual direction. It must not treat
  screenshots as pixel-perfect baselines, production visual regression tests, or
  final responsive acceptance criteria.

- Updated: 2026-06-04.

## Q20. Visual Companion Or Text-Only Discussion

- Topic reference:
  [Q20. Visual Companion Or Text-Only Discussion](./phase7-pre-architect-ui-prototype-topics.md#q20-visual-companion-or-text-only-discussion)

- Status: decided.

- Consensus decision: Use option B. Future discussion should stay text-only for
  boundary, data, evidence, non-goal, technology, and handoff questions. Use a
  visual companion, local browser mockup, annotated screenshots, or design
  substitute only when the question depends on seeing layout, visual hierarchy,
  density, overlap, responsive behavior, fullscreen/presenter-view layout, or
  light/dark styling. Visual aids are discussion tools and promotion evidence;
  they do not freeze CSS, component structure, pixels, or production behavior.

- Stage A handoff note: Architect Stage A may use visual companion output or
  local mockups as supporting evidence when they clarify a layout-heavy
  decision. Stage A should still restate any promoted finding as options,
  Freeze Candidates, requirements, risks, or rejected alternatives rather than
  copying visual-companion artifacts as contracts.

- Updated: 2026-06-04.

## Discussion Closeout

Q1-Q20 已决定。下一步不是继续提问, 而是准备 Q17 定义的 promotion
evidence:

- previewable React prototype in `design/ui-prototype/` or explicitly accepted
  design substitute;
- annotated desktop/mobile screenshots;
- fixture provenance map;
- prototype limitation note;
- references to the topic map, decision log, and guideline files.

Only after that packet exists should Topic 3 move from `open` to `decided`.
