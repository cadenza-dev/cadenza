# Phase 7 UI Prototype Promotion Goal

> Status: pre-Architect implementation goal, not a contract.
> Date: 2026-06-04.
> Scope: `design/ui-prototype/` promotion evidence only.
> Approved session identity: `GPT-5/Codex` proceeding as an
> Architect-adjacent scout / pre-Architect prototype designer after maintainer
> approval.

This document is the goal-mode entrypoint for preparing the Phase 7 UI
prototype promotion evidence packet. A future Codex session may pair this file
with a goal prompt and iterate until the evidence target is complete.

This file does not freeze `spec/phase7/`, create or modify a package boundary,
define public API, choose final production dependencies, replace Architect
Stage A/B, or authorize Builder implementation in `packages/`.

## Goal

Prepare the evidence needed to move Phase 7 Topic 3, Player App role and UI /
App Design direction, from `open` to `decided`.

The goal is complete when there is a visible, inspectable UI direction for a
deck-primary, read-only Player App plus inspector, backed by the Q17 promotion
evidence packet:

- a previewable React prototype in `design/ui-prototype/`, or an explicitly
  maintainer-accepted design substitute;
- annotated screenshots for desktop normal shell, desktop
  diagnostics/provenance state, and narrow/mobile viewer state;
- a fixture provenance map that marks each field source;
- a prototype limitation note;
- guideline cross-references that explain which source decision supports each
  major visible choice;
- an explicit non-freeze note.

The preferred path is the previewable React prototype. Use a design substitute
only if the maintainer explicitly accepts that substitute in the goal prompt or
in the same session.

## Product Direction

The prototype should express a balanced technical-player posture:

- deck playback is the primary surface;
- app chrome, rails, controls, and status areas are quiet and work-focused;
- the Player App is read-only;
- the inspector explains outline, readiness, diagnostics, provenance, notes
  boundaries, and limitations;
- diagnostics may offer copyable locators or repair hints, but never source
  editing, in-app repair, AI patching, regeneration, or re-export actions.

The prototype should feel credible as Cadenza's first product surface without
becoming a marketing page, dashboard, WYSIWYG editor, repair workbench, or full
VS Code workbench clone.

## Non-Goals

Do not do any of the following while pursuing this goal:

- write or modify `spec/phase7/`;
- write or modify ADRs;
- edit `packages/`, package manifests, production source, or workspace
  topology;
- create `@cadenza-dev/player-app`;
- freeze shadcn, CSS, component structure, fixture names, field names,
  screenshots, exact pixels, icon choices, or production behavior;
- wire real Remotion, `CadenzaPlayer`, or `preview-remotion` runtime
  integration unless a later explicit task promotes that work;
- implement hosted rendering, accounts, cloud queues, marketplace, PDF/PPTX,
  editor, source repair, AI patching, or public alpha release work;
- publish to npm, create a release tag, push to `main`, or make external
  launch claims;
- broaden visual verification into broad pixel parity, broad browser matrices,
  production accessibility acceptance, or CI visual regression.

If a future prompt asks for any item above, stop and ask whether the role is
being switched to Architect or Builder scope.

## Input Documents

Read these inputs before making prototype or evidence changes:

- `AGENTS.md`, especially Startup Protocol, authority order, role boundaries,
  and non-freeze rules.
- `STATUS.yaml` to confirm current routing and that this remains
  pre-Architect work.
- `QA/phase7-pre-architect-brainstorming-decisions.md`, especially Topic 3,
  Topic 5, and Topic 10.
- `QA/phase7-pre-architect-ui-prototype-topics.md`, Q1-Q20.
- `QA/phase7-pre-architect-ui-prototype-decisions.md`, especially Q17, Q18,
  and Q19.
- `QA/phase7-remaining-discussions.md`, especially the UI Prototype section.
- `QA/phase7-pre-architect-ui-prototype-follow-up.md`.
- all `*guideline.md` files in `design/ui-prototype/docs/`.

The current guideline set is:

- `design/ui-prototype/docs/layout-guideline.md`;
- `design/ui-prototype/docs/fullscreen-navigation-guideline.md`;
- `design/ui-prototype/docs/inspector-ia-guideline.md`;
- `design/ui-prototype/docs/presenter-view-guideline.md`;
- `design/ui-prototype/docs/visual-style-guideline.md`;
- `design/ui-prototype/docs/stage-a-handoff-guideline.md`.

## Skills

Load these local skills for future goal-mode execution:

- `cadenza-architect`: use for Cadenza role discipline, Stage A handoff
  language, authority preservation, and non-freeze boundaries.
- `superpowers:brainstorming`: use only for unresolved visual or UI design
  questions. Q1-Q20 are already settled, so do not reopen them by default.
- `ui-ux-pro-max`: use as the primary UI/UX quality skill for app-shell,
  inspector, accessibility, interaction, responsive, and product-surface
  checks.
- `design-taste-frontend`: use as a secondary visual-polish and anti-slop
  guardrail. Apply only the parts that fit a product UI shell. Do not treat
  landing-page-specific rules as requirements for the Player App.

Do not make `superpowers:subagent-driven-development` or
`superpowers:test-driven-development` mandatory for this design-only promotion
goal. If a later task promotes the work into production Builder scope or
package implementation, the responsible session should decide separately
whether to load `cadenza-builder`, `tdd`, `superpowers:test-driven-development`,
or `superpowers:subagent-driven-development`.

## Provisional UI Library

Treat shadcn as the provisional UI layout, component, and style library for the
prototype. Do not brainstorm alternative component-library combinations during
this goal.

This is not a production dependency decision. The prototype may use shadcn
components, shadcn-compatible CSS variables, and a neutral light/dark token
posture to make the shell previewable and visually coherent. Architect Stage A
must still decide the production component library, design tokens, dependency
boundary, accessibility contract, and verification gates.

If shadcn cannot be installed or used because of sandbox, dependency, or
network limits, do not silently switch to another library. Record the blocker,
ask for approval if dependency installation is required, or continue only with
an explicitly labeled shadcn-compatible temporary approximation.

## Prototype Requirements

The prototype should stay inside `design/ui-prototype/` and remain outside the
workspace package boundary.

Minimum visible states:

- happy path;
- pending readiness;
- diagnostic or blocking/error state;
- export provenance and known-limitation state.

Desktop layout:

- center deck canvas as the primary visual object;
- left collapsible/resizable static slide-preview rail;
- right collapsible/resizable inspector rail;
- bottom collapsible/resizable action-anchor controls;
- persistent bottom status bar;
- top navigation cluster with left, bottom, right, and side-swap controls.

Mobile and narrow viewports:

- deck-first responsive viewer;
- sticky or collapsible controls;
- rails and inspector represented as drawer, sheet, or folded layers;
- no full mobile presenter promise.

Bottom controls:

- previous action-anchor;
- next action-anchor;
- play/pause;
- slide, step, or action-anchor indicator;
- fullscreen toggle.

Fullscreen behavior:

- hide nonessential app chrome;
- preserve deck-first presentation;
- keep configured/default keyboard navigation active;
- show pointer edge-reveal previous/next controls for mouse-like input;
- support the settled touch mapping at the prototype level;
- document external presenter controllers as future research.

Inspector IA:

- right activity bar topics: `Outline`, `Readiness`, `Diagnostics`,
  `Provenance`, `Notes`, and `Limitations`;
- selected topic opens a content pane;
- `Summary` appears first and is expanded by default;
- detail sections can expand, collapse, and, if cheap, resize;
- raw JSON is folded detail, never the default view.

Status and errors:

- bottom status bar shows compact `Ready`, `Checking`, `Warnings`, or
  `Blocked` state with concise counts;
- health signal follows the inspector side when side rails are swapped;
- clicking or activating the health signal opens `Readiness` or `Diagnostics`;
- blocking render/playback errors use a top-center message bar with a route
  into `Diagnostics`.

Presenter-view representation:

- normal player view hides notes by default;
- notes appear only through explicit presenter metadata affordances;
- prototype may show a presenter-view flow or mock state;
- do not promise reliable browser multi-screen placement.

Basic accessibility posture:

- intentional focus order;
- visible focus states;
- accessible labels for icon-only controls;
- keyboard path for rail toggles, previous/next, fullscreen, inspector topics,
  section expansion, and status drilldown;
- reduced-motion posture for collapses, fades, and fullscreen transitions.

## Fixture Provenance

Use hybrid fixture data. Every field used by the prototype must be marked with
one of these sources:

- `deck metadata`;
- `validate summary`;
- `player snapshot`;
- `manifest`;
- `format evidence`;
- `prototype-only`.

Generated `dist/` artifacts may be used as source material, but they are not
tracked canonical fixtures. A prototype fixture is not proof that a production
runtime field exists.

The fixture provenance map may be a standalone Markdown file, a structured JSON
file plus Markdown explanation, or a section in the promotion evidence packet.
It must be easy for Architect Stage A to see which fields are available today,
which need a future Player App data contract, and which are layout-only.

## Evidence Packet

The promotion evidence packet should include or point to:

- prototype directory and preview command;
- fixture files;
- fixture provenance map;
- annotated screenshot paths;
- prototype limitation note;
- browser smoke notes if run;
- source and decision references;
- non-freeze note;
- Stage A risk notes.

Required annotated screenshots:

- desktop normal shell;
- desktop diagnostics/provenance state;
- narrow/mobile viewer state.

Recommended screenshots when cheap:

- light/dark mode pair;
- blocking/error state;
- presenter-view state.

Each annotation should state:

- what layout, IA, visual, responsive, fullscreen, or presenter-view decision
  the screenshot demonstrates;
- whether overlap, clipping, overflow, unreadable density, or blank rendering
  was observed;
- which issues remain Stage A decisions.

## Iteration Plan

Follow this sequence in goal mode:

1. Re-run the Startup Protocol and confirm this is still pre-Architect
   prototype work.
2. Read this goal file and the input documents listed above.
3. Inventory existing files under `design/ui-prototype/` and preserve
   unrelated user changes.
4. Choose the smallest preview setup that keeps all implementation inside
   `design/ui-prototype/`.
5. If dependency installation is needed, ask for approval before installing.
6. Add or update prototype fixture data and the fixture provenance map.
7. Build the deck-primary three-rail shell.
8. Add bottom controls, bottom status bar, and fullscreen prototype behavior.
9. Add right-rail inspector topics and core state switching.
10. Add mobile/narrow responsive behavior.
11. Apply shadcn-based or shadcn-compatible visual polish in light and dark
    modes.
12. Add basic keyboard, focus, label, and reduced-motion posture.
13. Capture required annotated screenshots, plus recommended screenshots when
    cheap.
14. Write the promotion evidence packet and limitation note.
15. Run focused validation and record results.
16. Prepare, but do not automatically apply, any QA status update unless the
    goal prompt explicitly authorizes QA note edits.

Stop and ask if the work would require edits outside `design/ui-prototype/`,
dependency installation without approval, package/workspace changes,
production runtime integration, or a change to frozen contracts or Accepted
ADRs.

## Validation

For this pre-Architect goal, validation is focused evidence, not full release
certification.

Minimum validation for the prototype:

- preview command opens the prototype;
- page is nonblank;
- desktop normal shell is inspectable;
- diagnostics/provenance state is inspectable;
- narrow/mobile viewer state is inspectable;
- key fixture states can switch;
- obvious overlap, clipping, unreadable density, and horizontal overflow are
  checked manually or with browser screenshots;
- light and dark mode are checked when implemented;
- reduced-motion path is checked when motion exists;
- fixture provenance map and limitation note exist;
- evidence packet includes the non-freeze note.

Recommended validation when cheap:

- Playwright or browser smoke for desktop and mobile viewport opening;
- screenshots captured from the local browser;
- basic keyboard traversal through top controls, rails, deck controls, status,
  inspector topics, and section toggles.

Do not require broad pixel thresholds, broad browser matrices, CI visual
regression, production accessibility tests, exact layout parity, real
`CadenzaPlayer` integration, or full AGENTS completion gates unless a later
role-scoped prompt expands the task.

For document-only edits to this file, run focused Markdown checks such as:

```bash
pnpm exec markdownlint-cli2 design/ui-prototype/docs/goal.md
git diff --check
```

## Non-Freeze Note

Every evidence packet produced under this goal must include this note:

> Prototype findings are directional evidence. They do not freeze package
> topology, public API, fixture field names, CSS, component structure, exact
> layout pixels, screenshots, icon choices, or production behavior.

Stage A may promote findings only by restating them as options, Freeze
Candidates, requirements, evidence gates, rejected alternatives, deferred
risks, or explicit non-goals.

## Completion Signal

This goal is complete when:

- the previewable prototype or accepted design substitute exists;
- Q17 required evidence exists;
- validation evidence is recorded;
- source references and guideline cross-references are present;
- non-freeze boundaries are explicit;
- no `spec/`, ADR, `packages/`, root phase pointer, production code, or public
  package boundary was changed;
- the final report can say whether Topic 3 is ready for maintainer-approved QA
  status closeout.

If the evidence packet is complete but QA status files were not authorized for
editing, finish by recommending the exact QA closeout change rather than making
it.
