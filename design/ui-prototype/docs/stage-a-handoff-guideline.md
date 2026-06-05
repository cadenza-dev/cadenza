# Phase 7 UI Prototype Stage A Handoff Guideline

> Status: UI prototype handoff note, not a contract.
> Date: 2026-06-04.
> Scope: `design/ui-prototype/` only.

This note records how Phase 7 UI prototype findings should be handed to
Architect Stage A. It is not a Phase 7 spec, implementation plan, ADR,
package boundary, or frozen contract.

## Handoff Shape

The handoff should translate prototype findings into Architect material:

- baseline direction;
- rejected alternatives;
- Freeze Candidates;
- required evidence;
- open risks;
- non-goals;
- prototype-only details that must not be frozen accidentally.

The handoff should not tell Stage A to copy the prototype directly. Prototype
screens, component shapes, CSS, fixture names, and labels are evidence and
discussion material, not contracts.

## Required References

The handoff should maintain two kinds of references.

### Prototype Artifact References

Reference the prototype implementation or substitute artifact directly:

- prototype directory, normally `design/ui-prototype/`;
- prototype entrypoint or preview command if one exists;
- screenshot or annotated mockup paths;
- fixture files and fixture provenance map;
- notes that identify which states/screens were captured.

These references help future agents inspect the actual artifact rather than
reconstructing it from prose.

### Source And Decision References

Reference the files that explain why the prototype looks and behaves as it does:

- the UI prototype topic map:
  [../../QA/phase7-pre-architect-ui-prototype-topics.md](../../QA/phase7-pre-architect-ui-prototype-topics.md);
- the UI prototype decision log:
  [../../QA/phase7-pre-architect-ui-prototype-decisions.md](../../QA/phase7-pre-architect-ui-prototype-decisions.md);
- the remaining-discussions tracker:
  [../../QA/phase7-remaining-discussions.md](../../QA/phase7-remaining-discussions.md);
- layout direction:
  [layout-guideline.md](./layout-guideline.md);
- fullscreen navigation:
  [fullscreen-navigation-guideline.md](./fullscreen-navigation-guideline.md);
- inspector IA:
  [inspector-ia-guideline.md](./inspector-ia-guideline.md);
- presenter view:
  [presenter-view-guideline.md](./presenter-view-guideline.md);
- visual style:
  [visual-style-guideline.md](./visual-style-guideline.md).

If Stage A cites current implementation facts, it should also reference the
source file or generated record where the fact came from. Do not cite a
prototype fixture as proof that a production runtime field exists.

## Non-Freeze Note

Every Stage A handoff that uses the prototype should include a short non-freeze
note:

> Prototype findings are directional evidence. They do not freeze package
> topology, public API, fixture field names, CSS, component structure, exact
> layout pixels, screenshots, icon choices, or production behavior.

Stage A may promote specific findings only by restating them as options, Freeze
Candidates, requirements, evidence gates, rejected alternatives, or deferred
risks.

## Visual Evidence

The handoff packet should include lightweight visual evidence when a prototype
or accepted design substitute exists.

Required annotated screenshots:

- desktop normal shell;
- desktop diagnostics/provenance state;
- narrow/mobile viewer state.

Recommended annotated screenshots when cheap:

- light/dark mode pair;
- blocking or error state;
- presenter-view state if represented by the prototype.

Each screenshot note should explain:

- which layout, IA, visual, or responsive decision it demonstrates;
- whether there is visible overlap, clipping, overflow, or unreadable density;
- which issues remain Stage A decisions.

A lightweight browser smoke may be included: the page opens, is not blank, key
fixture states can switch, and desktop/mobile viewports are broadly inspectable.
Do not present automated pixel thresholds, broad browser matrices, CI visual
regression, production accessibility screenshots, or exact layout parity as
pre-Architect promotion requirements.

## Handoff Checklist

Before the UI prototype blocker is considered handoff-ready, the packet should
answer:

- What visible UI direction was accepted?
- Which alternatives were rejected and why?
- Which evidence files show the accepted direction?
- Which fixture fields are real, and which are `prototype-only`?
- Which source or decision file supports each major conclusion?
- Which items remain Stage A decisions?
- Which prototype details must not be frozen?
