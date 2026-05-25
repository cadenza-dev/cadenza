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

## Multi-locale timeline compilation

- **Source**: `docs/design/compiler-design.md` OQ-4 and the old Phase 3
  candidate note.
- **Frozen Phase 1 decision**: Phase 1 does not support multi-locale slide
  variants.
- **Current roadmap stance**: `ROADMAP.md` explicitly defers i18n
  infrastructure indefinitely.
- **Future support**: compile one independent TimelineMap per locale only if
  i18n re-enters scope through a future ADR.
- **Reason to defer**: locale-specific text density can change layout and
  timing, so shared anchors would be unsafe; i18n is not part of the current
  phase sequence.

## Authoring-loop orchestration command

- **Source**: `spec/phase3/SPEC_AUTHORING_LOOP.md` `FC-AUTH-01`.
- **Frozen Phase 3 decision**: Phase 3 uses an explicit documented command
  sequence for authoring, compile, preview, diagnostics, repair, and verification
  instead of a single wrapper command.
- **Future support**: add a local orchestration command only if repeated
  repair-loop evidence shows that command choreography, not deck authoring or
  diagnostics quality, is the bottleneck.
- **Reason to defer**: a wrapper command would hide useful failure boundaries
  before the local repair loop is proven.

## Complete deck IR / system-layer deck representation

- **Source**: `spec/phase3/SPEC_REPAIR_DIAGNOSTICS.md` `FC-DIAG-01` and
  `docs/analysis/analysis-final.md` §6.4.
- **Frozen Phase 3 decision**: Phase 3 uses a normalized repair report with
  optional thin locator fields. It does not introduce a standalone complete deck
  IR or a second authoritative deck representation.
- **Future support**: reconsider a complete deck IR when at least one of these
  pressures is real: stable local edits instead of full-page regeneration,
  structured diff/merge, visual editor requirements, strong audit or multi-tenant
  constraints, cross-format import/export, or non-programmer long-term deck
  maintenance.
- **Reason to defer**: complete deck IR would effectively become a second deck
  source. It should not be built before the project proves that a repair report
  plus typed TSX cannot carry the workflow.

## 2026-05-26 Phase 5 Stage B disposition

Phase 5 Architect resolved the export and alpha-readiness candidates as
follows:

- **Browser export smoke test** is promoted and frozen into
  `spec/phase5/SPEC_PREVIEW_EXPORT_PARITY.md` as a required browser-observable
  smoke test for the exported web bundle.
- **Live-presenter recording as canonical export** is explicitly deferred by
  `spec/phase5/SPEC_PRESENTER_CONSOLE_FOLLOWUP.md`; deterministic offline
  export remains canonical for Phase 5.
- **Session replay** may appear only as debugging evidence if parity work needs
  it. It is not a public Phase 5 feature.
- **Hard deck-duration cap** and **slide-level FPS** remain conditional. Phase
  5 export diagnostics may surface duration or timing evidence, but the frozen
  contract does not promote either as a requirement.
- **Screenshot diffing as stronger visual QA** remains optional supplemental
  evidence. Browser smoke plus semantic parity is the primary gate.
- **Complete deck IR**, **DSL**, visual-editor pressure, and non-programmer
  long-term maintenance remain deferred. Phase 5 did not show two concrete ADR
  0004 pressures that would justify a second authoritative deck representation.

Follow-up owner: future Architect. Revisit presenter recording, replay, visual
diffing, or deeper authoring surfaces only after public developer launch
evidence shows real pressure.
