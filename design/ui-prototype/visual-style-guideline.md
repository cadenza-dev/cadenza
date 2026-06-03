# Phase 7 UI Prototype Visual Style Guideline

> Status: UI prototype visual-style note, not a contract.
> Date: 2026-06-04.
> Scope: `design/ui-prototype/` only.

This note records the visual-style direction for the Phase 7 UI prototype. It
is not a Phase 7 spec, design-system contract, component-library decision,
package dependency decision, or public Player App promise. Architect Stage A
must restate any promoted behavior as options, Freeze Candidates, evidence
requirements, or rejected alternatives.

## Visual Posture

The prototype should use a balanced technical-player posture:

- the deck canvas is the first visual object and should feel presentation-ready;
- app chrome, rails, inspector sections, and status surfaces should stay quiet,
  compact, and developer-tool-like;
- inspector density should support scanning, comparison, and evidence review
  without becoming a dashboard or repair workbench;
- presentation quality should come from hierarchy, spacing, typography, and
  restraint rather than oversized marketing composition or decorative effects.

This is a middle path between a pure presentation player and a pure developer
tool. Cadenza should feel like a credible presentation surface with a serious
inspection layer attached.

## Non-Color Direction

The following visual choices are accepted for the prototype direction:

- Deck surface: stable, uncluttered, visually primary, with enough contrast to
  make the deck feel like the product focus.
- App chrome: restrained, dense, and work-focused.
- Rails: compact but readable; avoid oversized cards and decorative containers.
- Inspector: section-based, scannable, badge-friendly, and evidence-oriented.
- Status surfaces: compact summary first; details remain in the inspector.
- Typography: clear sans-serif UI typography, with tighter metadata treatment
  in rails and inspector.
- Motion: subtle transitions only; no animation-driven proof of quality.
- Decorative style: no gradient-orb, bokeh, or marketing-style backgrounds.

## Color Direction

Color is accepted as a shadcn-compatible direction for the prototype:

- support light and dark modes;
- use a neutral or zinc-like shadcn base rather than a colorful custom theme;
- keep deck-area chrome low-interference in both modes;
- use one restrained interaction or brand accent for selected topics, focus
  states, and primary controls;
- use semantic status colors for health signals:
  - ready: restrained green;
  - checking: restrained blue or neutral accent;
  - warning: amber;
  - blocked/destructive: red;
- avoid a broad custom palette, saturated gradients, or a one-hue product skin.

This direction is intentionally close to shadcn's official light/dark visual
grammar, while allowing a small amount of accent and semantic color so the
Player App has clearer hierarchy and status meaning.

If a later UI layout/style/component-library discussion rejects shadcn or picks
a substantially different system, color may be redesigned. The accepted
non-color posture above should remain the baseline unless explicitly reopened.

## shadcn Consideration

shadcn is a reasonable candidate for the prototype's UI/layout/style/component
exploration because it is built around editable component code and semantic CSS
variables rather than a closed package-only component API.

For this QA note, shadcn is a color and component-system consideration, not a
frozen dependency. The prototype may use a shadcn-like light/dark neutral base
and semantic tokens, but Stage A must still decide whether shadcn, another
library, or custom components are the right production path.

## Prototype Boundaries

The prototype should not:

- freeze final design tokens;
- freeze shadcn as a production dependency;
- introduce a broad brand palette;
- use visual style to imply source editing or repair behavior;
- prioritize decorative style over deck readability;
- require production-grade accessibility, motion, or component completeness.
