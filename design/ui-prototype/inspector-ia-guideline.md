# Phase 7 UI Prototype Inspector IA Guideline

> Status: UI prototype inspector note, not a contract.
> Date: 2026-06-04.
> Scope: `design/ui-prototype/` only.

This note records the right-rail inspector information architecture for the
Phase 7 UI prototype. It is not a Phase 7 spec, package boundary,
implementation plan, data contract, or public Player App promise. Architect
Stage A must restate any promoted behavior as options, Freeze Candidates,
evidence requirements, or rejected alternatives.

## IA Direction

The right inspector should use a summary-first structure with expandable
sections. This can moderately borrow from VS Code's side bar pattern:

- a narrow right activity bar selects the inspector topic;
- the selected topic opens a right content pane;
- the content pane contains stacked sections;
- sections can be expanded or collapsed;
- section height ratios can be adjusted when multiple sections are open.

This should not become a generic source editor, repair workbench, or full VS
Code workbench clone.

## Activity Topics

The right activity bar should include topic buttons for:

- Outline;
- Readiness;
- Diagnostics;
- Provenance;
- Notes;
- Limitations.

Clicking a topic button switches the right content pane to that topic. Clicking
the active topic button may collapse the right rail.

Activity buttons should have accessible labels, visible focus states, and
tooltips for visual discovery. The active topic should be visually and
semantically distinguishable without relying on color alone.

## Global Status Signal

Readiness and diagnostics should have a compact global signal without turning
the deck canvas into a diagnostic dashboard.

The prototype should use the persistent bottom status bar from
[layout-guideline.md](./layout-guideline.md) for this signal:

- `Ready`: no blocking issues; click opens `Readiness` summary.
- `Checking`: pending resources or active readiness work; click opens
  `Readiness`.
- `Warnings`: non-blocking diagnostics exist; click opens `Diagnostics`.
- `Blocked`: rendering or playback cannot proceed; click opens `Diagnostics`.

The health signal should sit on the side nearest the inspector rail and move
with the inspector rail when side rails are swapped. Counts should be concise:
for example, one blocked issue, two warnings, or three pending resources.

Details belong in the inspector topic pane, not the status bar. The status bar
should never include repair actions, source editing controls, or raw diagnostic
payloads.

The health signal should have a label that names both state and count, such as
`Warnings, two diagnostics` or `Blocked, one issue`. Clicking or keyboard
activating it should move focus to the relevant inspector topic or section.

## Section Model

Inside the right content pane, each topic should use sections rather than a
single long debug page.

The prototype baseline is:

- `Summary`: expanded by default.
- `Outline`: collapsed by default, expandable.
- `Timeline`: collapsed by default, expandable.
- `Readiness`: collapsed by default unless pending resources exist.
- `Diagnostics`: collapsed by default unless warnings or errors exist.
- `Provenance`: collapsed by default, expandable.
- `Notes`: collapsed by default, explicit presenter metadata boundary.
- `Limitations`: collapsed by default unless known limitations are present.

The `Summary` section should be the first section for every topic. It should
surface current health, selected deck/action-anchor context, warning counts, and
the most important provenance or limitation signal. Details live below it.

Section headers should be keyboard-reachable when they can expand or collapse.
They should expose their expanded/collapsed state in the prototype posture, even
if the final ARIA details are left to Stage A. Long sections should scroll
internally without trapping keyboard focus.

## Height And Resize Behavior

The content pane should allow section height adjustment when multiple sections
are open. A restrained prototype can implement this as simple draggable section
splitters or preset proportions. It does not need production-grade persistence
or arbitrary docking.

Recommended constraints:

- preserve enough height for `Summary` to remain readable;
- allow long sections such as `Outline` or `Diagnostics` to scroll internally;
- avoid pushing key warning badges below the fold;
- do not let raw JSON dominate the pane.

## Topic-Specific Defaults

### Outline

- `Summary`: current slide/action-anchor and deck progress.
- `Outline`: chapter and slide navigation, collapsed or partially expanded by
  default depending on available space.
- `Timeline`: action-anchor sequence, collapsed by default.

### Readiness

- `Summary`: ready, pending, or blocked state.
- `Readiness`: pending resources and resource statuses.
- `Diagnostics`: readiness-related warnings or errors.

### Diagnostics

- `Summary`: severity counts and current blocking issue.
- `Diagnostics`: grouped diagnostic codes, messages, locators, and repair hints.
- `Limitations`: relevant known limitations if diagnostics are limitation
  adjacent.

### Provenance

- `Summary`: deck title/id, selected formats, export status, stable hash,
  schema version, and manifest path.
- `Format Capabilities`: per-format status chips such as `web supported` or
  `mp4 limited`, with short descriptions.
- `Evidence Files`: manifest and per-format evidence file references with copy
  path, open artifact, or view raw affordances.
- `Artifact Inventory`: artifact role, format, path, byte size, and sha256
  summary, grouped by role where useful.
- `Selector Provenance`: requested selector, alias/source if available, and
  resolved path. This explains how the artifact was selected; it must not
  override canonical deck identity.
- `Limitations`: format-specific limitations.

Raw manifest or evidence JSON should be available only in a collapsed `Raw
Details` section or equivalent view/copy affordance. It should not be the
default presentation of provenance.

Stable identity and volatile generation facts should stay visually distinct:
`stableHash`, deck identity, and selected formats belong to stable summary;
`generatedAt`, output directory, and run-local paths are useful provenance but
should not be presented as stable deck identity.

### Notes

- `Summary`: whether notes exist and whether they are presenter metadata.
- `Notes`: speaker notes behind an explicit presenter-metadata boundary.

### Limitations

- `Summary`: most important limitation and affected format or workflow.
- `Limitations`: grouped known limitations.
- `Provenance`: evidence or manifest references that justify the limitation.

## Blocking Error Message Bar

Non-blocking warnings should stay in the bottom status signal and inspector
details. A visible error message bar is reserved for blocking cases where the
deck cannot render, playback cannot proceed, or the current player state is no
longer usable.

The recommended placement is top-center, directly below the top navigation bar,
constrained to the center deck column or a narrow full-app banner above the deck
surface. This is more appropriate than a lower corner because a blocking error
is a global interruption, not a passive status update, and should remain visible
even when the user's attention is on the deck.

The blocking bar should contain:

- severity and concise message;
- affected deck, slide, or action-anchor if available;
- a button or link that opens `Diagnostics` in the inspector;
- optional copyable diagnostic code or locator.

It should not contain source editing, automatic repair, "Fix", or "Ask AI"
actions. If the deck canvas cannot render at all, the bar may be paired with a
center-canvas placeholder, but the placeholder should not replace the inspector
diagnostic details.

## Read-Only Guidance And Copy Affordances

Diagnostics may show repair hints, but those hints are read-only guidance. They
should help a developer understand what to inspect next without turning the
Player App into a source editor, repair workbench, or agent patching UI.

Allowed prototype affordances:

- copy diagnostic code;
- copy locator;
- copy source or evidence path;
- copy a relevant command path or inspect command;
- open or reveal an external artifact reference when that does not imply
  in-app source editing.

Disallowed prototype affordances:

- `Fix`;
- `Apply patch`;
- `Ask AI`;
- `Open source editor`;
- `Regenerate`;
- `Re-export`;
- disabled or future repair buttons that imply the Player App should become a
  repair surface.

Recommended wording includes `Repair hint`, `Suggested next check`, `Evidence
locator`, and `Copy locator`. Avoid wording that implies the UI itself can or
should perform the repair, such as `Fix now` or `Action required`.

## Prototype Boundaries

The prototype may use realistic labels, badges, icons, and collapsible section
behavior. It should not:

- expose source editing;
- include "Fix" or "Ask AI" repair actions;
- include `Re-export`, source drift comparison, or source-aware refresh actions;
- include disabled/future repair actions;
- become a raw JSON inspector as the primary view;
- freeze final field names or evidence schema;
- implement full VS Code workbench layout persistence;
- require real `CadenzaPlayer` or Remotion runtime integration.
