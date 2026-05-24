# REV-P4 visual navigation framework-defect route

## Scope

- Source: maintainer visual review during Phase 4 closeout.
- Related findings: `VARR-P4-CLOSEOUT-001`, `VARR-P4-CLOSEOUT-002`.
- Related reviewer blocker: `REV-P4-001` was resolved by maintainer
  `signed-off` visual decision after dogfood preview recheck.
- Route kind: framework-defect route, because the repair required
  `packages/preview-remotion/src/**` changes rather than authored dogfood deck
  content only.

## Observed Problem

The Phase 4 dogfood preview did not behave like a presentation preview:

- the right presenter panel advanced through semantic slides and steps;
- the left Remotion Player visual output stayed on static rendered deck
  content;
- presenter-only notes and a font readiness marker appeared in the slide visual
  surface;
- the generic preview controls still exposed `Goto render-safe-demo`, a stale
  target that is not a Phase 4 dogfood slide.
- after visual navigation was repaired, the `Compiler evidence...` dense copy on
  `preview-reliability-budget` step 2 was visibly clipped near the bottom of the
  left Player surface.

The dense-copy clipping had mixed responsibility. The authored dogfood sample
used a too-small compact `TypographyBox` for a long sentence, and the preview
renderer measured auto-fit before applying the configured base typography style
while leaving the preceding `MediaFrame` too unconstrained for a slide-like
preview.

## Repair

- `CadenzaPlayer` now renders the visual composition from Remotion's current
  frame, preserving Cadenza runtime/controller ownership for navigation.
- The visual surface renders only the current slide and cumulative step content.
- Render-safe resources remain observable through a hidden preload layer, so
  readiness diagnostics continue to work without making future slide content
  visible.
- Presenter notes stay available as hidden metadata and no longer appear in the
  visible slide.
- The stale `Goto render-safe-demo` button was removed from the generic preview
  controls.
- `SafeFontPreview` keeps readiness attributes while preventing font readiness
  markers from appearing in the visible slide.
- `TypographyBoxPreview` now measures after applying the configured base
  auto-fit typography, applies the fitted result to the live DOM, and preserves
  no-overflow browser evidence for the dense copy.
- The reliability-budget dense-copy box now uses a shared authored size in
  `examples/phase4/dogfood-talk.tsx` and `examples/phase4/preview.ts`, so visual
  layout and presenter diagnostics remain aligned.
- Slide, step, content-slot, and media-frame preview layout now stay bounded
  within the Player composition so a preceding `MediaFrame` cannot push
  cumulative step text into the control area.

## Verification

- RED: focused Phase 4 browser test failed because `timeline-compiler` was
  already present before navigation.
- GREEN: focused Phase 4 browser test passed after current-frame visual
  rendering was implemented.
- RED: focused dense-copy browser test failed first with
  `data-cadenza-typography-overflow-fallback=true`, then with live
  `scrollHeight` exceeding `clientHeight` while the measured auto-fit state was
  stale.
- GREEN: focused dense-copy browser test passed after the shared authored box,
  styled measurement, live fitted-style application, and bounded layout repair.
- Regression: full `pnpm test:browser` passed 18/18 under Chromium-capable
  execution.

## Boundary

No `CONTRACT_FROZEN` spec, Accepted ADR, export, hosted rendering, Remotion
Lambda, public-stability, external-alpha, WYSIWYG, marketplace, collaboration,
MCP implementation, or root phase pointer changes were made.
