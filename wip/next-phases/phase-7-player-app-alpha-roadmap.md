# Phase 7 Roadmap - Cadenza Player App and Alpha Launch

> Status: WIP planning note, not a contract.
> Created: 2026-05-28.
> Source: maintainer roadmap adjustment after Phase 5 closeout review.

## Purpose

Phase 7 should build the Cadenza Player App as the product-facing playback,
preview, and exported-web shell. It should then connect that app back into the
CLI export workflow and use the result as the first credible public alpha
surface.

## Thesis

Remotion Player is the lower-level playback engine, not the Cadenza product
surface. Cadenza needs its own app shell for deck identity, navigation,
presenter metadata, diagnostics, readiness state, export evidence, and
shareable web playback. The same design and logic should power local preview
and exported web output.

## Candidate Scope

- Product shell: design and implement a Cadenza-branded player interface around
  the existing Remotion Player adapter.
- Interaction model: support slide/step navigation, playback controls, outline
  or chapter navigation, speaker-note boundaries, readiness/diagnostic state,
  and export metadata inspection where useful.
- Design system: define UI tokens, layout rules, responsive behavior, empty and
  error states, and visual quality gates for desktop and mobile browser
  playback.
- Local preview app: provide a maintainer-facing preview path that uses the
  Player App rather than raw Playwright or a minimal embedded player page.
- App-based web bundler: export a self-contained web app bundle that reuses the
  Player App design and logic, replacing the Phase 6 static compatibility bundle
  as the long-term web export target.
- CLI connection: add or refine CLI commands/options so `cadenza preview` and
  `cadenza export` can target the Player App and app-based web bundle without
  duplicating deck loading or diagnostics logic.
- Alpha launch material: prepare the README, quickstart, demo talk page or
  equivalent public material, package metadata, known limitations, and small
  technical-talk starters needed for a developer alpha.
- Dogfood loop: collect maintainer or small external-developer feedback only
  after the local app and export path are stable enough to evaluate.

## Design Workflow Note

This phase is intentionally design-heavy. Before implementation starts, the
maintainer expects a separate brainstorming and design pass, likely using the
Superpowers workflow, to refine technical choices, UI direction, interaction
details, and release framing.

## Non-Goals

- No hosted SaaS tier.
- No Remotion Lambda production deployment.
- No cloud queue, credential, or cost system.
- No broad template marketplace.
- No PPTX/PDF import/export IR.
- No general-purpose WYSIWYG editor.
- No collaboration, comments, accounts, SSO, or enterprise features by default.

## Promotion Triggers

- Phase 6 has a stable local CLI/export engine with real MP4 export and
  structured diagnostics.
- The static web compatibility bundle is useful but visibly below the desired
  product experience.
- The maintainer is ready to invest in UI/product design before public alpha
  announcement.

## Exit Evidence

- A Cadenza Player App can open the canonical/public deck locally with polished
  navigation, playback, diagnostics, and responsive UI.
- The app-based web bundle is exported through the CLI and supersedes the static
  compatibility bundle as the preferred web export path.
- The public alpha claim is narrow, documented, and backed by accepted local
  preview, web export, and MP4 export evidence.
- Release material avoids overclaiming hosted rendering, cross-format parity,
  editor maturity, or broad non-developer deck-product scope.

## Phase 8 Handoff

Phase 8+ should start from a working local product loop: stable CLI, real local
MP4 export, Player App preview, app-based web export, and alpha feedback. Cloud
and agent expansion should wrap these stable surfaces instead of exposing
unstable internals.
