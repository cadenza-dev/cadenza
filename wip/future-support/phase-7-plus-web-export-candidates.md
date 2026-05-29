# Phase 7+ Web Export Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-05-30.

These candidates came from Phase 6 Stage A static web compatibility
brainstorming. Phase 6 recommends a static web compatibility adapter with
semantic browser evidence and explicit non-claims about Player App export. The
items below are intentionally deferred: future Architects must promote them
into a phase spec before Builder treats them as requirements.

## Player App Web Export

- **Source**: Phase 6 `FC-WEBC-01` and `FC-WEBC-03`.
- **Phase 6 disposition**: keep static web as a compatibility export. Do not
  claim the output is the future Player App web export or a polished app shell.
- **Future support**: promote a Player App-based web export after the Player
  App architecture and bundle contract are designed.
- **Reason to defer**: freezing app export before the Player App exists would
  either overclaim Phase 6 or force Phase 7 to preserve compatibility details
  that should remain replaceable.

## App Bundler Contract

- **Source**: Phase 6 web adapter boundary and dependency-boundary discussion.
- **Phase 6 disposition**: the web adapter exposes compatibility inputs,
  outputs, evidence, and limitations; it does not freeze an app bundler.
- **Future support**: define a dedicated bundler contract if Player App export
  needs route assets, code splitting, CSS handling, or hosted deployment
  metadata.
- **Reason to defer**: bundler decisions depend on the Player App shape and
  should not be inferred from Phase 5 static helpers.

## Rich Offline Asset Strategy

- **Source**: Phase 6 static web compatibility limitations.
- **Phase 6 disposition**: require inspectable static output, manifest linkage,
  and semantic anchors. Do not guarantee a full offline application asset
  strategy.
- **Future support**: consider richer offline packaging after alpha dogfood
  shows which assets, fonts, media, and runtime chunks must be portable.
- **Reason to defer**: broad offline guarantees can turn a compatibility export
  into a product shell before the Player App is ready.

## Screenshot Or Pixel Diff As Primary Gate

- **Source**: Phase 6 `FC-WEBC-02`.
- **Phase 6 disposition**: require semantic browser smoke checks. Screenshot
  or pixel checks may be supplemental only.
- **Future support**: add visual diffing if alpha workflows reveal regressions
  that semantic anchors and export evidence cannot catch.
- **Reason to defer**: pixel output can vary across browsers, operating
  systems, fonts, graphics stacks, and viewport defaults.

## Hosted Web Sharing

- **Source**: Phase 6 local-only export boundary and future alpha workflow.
- **Phase 6 disposition**: no hosted web sharing, preview hosting, account
  system, credentials, public deployment, or release workflow.
- **Future support**: revisit hosted sharing after local export, Player App,
  and alpha feedback establish the public workflow.
- **Reason to defer**: hosted sharing carries product, security, cost, and
  launch decisions outside the local Phase 6 contract.
