# Conditional Or Later Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-04-25.

These items should not be assigned to a fixed phase yet. They need evidence from
alpha usage, Builder bootstrap, export infrastructure, or later product
pressure before becoming contracts.

## Slide-level FPS

- **Source**: `docs/design/compiler-design.md` OQ-1.
- **Frozen Phase 1 decision**: one deck-wide FPS.
- **Future support**: reconsider only if an alpha deck demonstrates a real
  slide-level FPS need that cannot be represented through duration tokens or
  animation primitives.
- **Reason to defer**: mixed FPS complicates transition math, anchors,
  navigation, and preview/export parity.

## Hard deck-duration cap

- **Source**: `docs/design/compiler-design.md` OQ-3.
- **Frozen Phase 1 decision**: warn after 60 minutes; do not hard-cap.
- **Future support**: introduce a hard cap if alpha decks reveal concrete memory,
  Player, or Lambda limits.
- **Reason to defer**: long-form technical talks are legitimate, and artificial
  caps should be justified by observed limits.

## Live-presenter recording as canonical export

- **Source**: `docs/design/compiler-design.md` OQ-5.
- **Frozen Phase 1 decision**: exported MP4 parity is guaranteed for the offline
  TimelineMap, not arbitrary live-presenter dwell times.
- **Future support**: add a session recording or replay format if users need a
  live talk to become the canonical export.
- **Reason to defer**: interactive preview and deterministic export have
  different timing semantics.

## Nested decks or chapter-deck composition

- **Source**: `docs/design/compiler-design.md` §5.6.
- **Frozen Phase 1 decision**: nested `Deck` is rejected.
- **Future support**: revisit nested composition only after simpler `Chapter`
  and outline primitives prove insufficient.
- **Reason to defer**: nested decks force a larger cursor and TimelineMap model.

## Screenshot diffing as stronger visual QA

- **Source**: `spec/phase1/SPEC_VALIDATION.md` `FC-VAL-02`.
- **Frozen Phase 1 decision**: screenshot diffing may be manual and
  experimental, never a required Phase 1 CI gate.
- **Future support**: promote screenshot or pixel-based checks only if the test
  stack proves stable and cheap.
- **Reason to defer**: visual diffing is useful but can be flaky and expensive.

## Browser export smoke test

- **Source**: `spec/phase1/SPEC_TEST_MATRIX.md` frozen decision.
- **Frozen Phase 1 decision**: include one all-domain MVP fixture, but do not
  require a browser export smoke test until Builder bootstrap confirms the stack.
- **Future support**: add browser export smoke once the test environment is
  stable.
- **Reason to defer**: export smoke tests are valuable, but Phase 1 should not
  assume tooling cost before workspace bootstrap.

## Concrete package-name traceability

- **Source**: `spec/phase1/SPEC_TRACEABILITY.md` `FC-TAPI-98`.
- **Frozen Phase 1 decision**: use `packages/*` placeholders.
- **Future support**: replace placeholders with concrete package paths after
  Builder workspace bootstrap.
- **Reason to defer**: package boundaries are not final before scaffold.
