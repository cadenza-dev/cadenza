# Phase 7 Pre-Architect Brainstorming Decisions

> Status: living QA decision log, not a contract.
> Date: 2026-06-03.
> Companion topic map:
> [phase7-pre-architect-brainstorming-topics.md](./phase7-pre-architect-brainstorming-topics.md).

本文件用于记录 Phase 7 pre-Architect brainstorming 过程中已经达成共识的决策。
每个 topic 的“核心问题、可行解决方案、利弊、建议讨论方式”不在这里重复展开；
对应背景请回到
[topic map](./phase7-pre-architect-brainstorming-topics.md)。

使用方式：

- 每讨论完一个 topic，就更新本文件对应 section。
- 未讨论的 topic 保持 `Status: pending`。
- 如果讨论结果还不足以形成决策，标为 `Status: open` 并记录 blocking question。
- 如果共识足以进入 Phase 7 Architect Stage A，标为 `Status: decided`，并记录
  Stage A implications。
- 本文件不冻结 contract；未来 `spec/phase7/`、ADR、prompt、trace 才是正式
  workflow artifacts。

## Decision Summary

| Order | Topic | Decision Status | Topic Reference |
| :---- | :---- | :---- | :---- |
| 1 | Alpha claim boundary and audience promise | decided | [Topic 1](./phase7-pre-architect-brainstorming-topics.md#1-alpha-claim-boundary-and-audience-promise) |
| 2 | Phase 7 success slice and non-goals | decided | [Topic 2](./phase7-pre-architect-brainstorming-topics.md#2-phase-7-success-slice-and-non-goals) |
| 3 | Player App role and UI / App Design direction | open | [Topic 3](./phase7-pre-architect-brainstorming-topics.md#3-player-app-role-and-ui--app-design-direction) |
| 4 | Player App package boundary and `preview-remotion` transition | decided | [Topic 4](./phase7-pre-architect-brainstorming-topics.md#4-player-app-package-boundary-and-preview-remotion-transition) |
| 5 | Visual-fidelity export posture | decided | [Topic 5](./phase7-pre-architect-brainstorming-topics.md#5-visual-fidelity-export-posture) |
| 6 | App-based web export and bundler contract | decided | [Topic 6](./phase7-pre-architect-brainstorming-topics.md#6-app-based-web-export-and-bundler-contract) |
| 7 | CLI install, invocation, and pure JSON path | decided | [Topic 7](./phase7-pre-architect-brainstorming-topics.md#7-cli-install-invocation-and-pure-json-path) |
| 8 | Canonical deck identity, starters, and demo material | decided | [Topic 8](./phase7-pre-architect-brainstorming-topics.md#8-canonical-deck-identity-starters-and-demo-material) |
| 9 | Diagnostics, readiness, and progress model | decided | [Topic 9](./phase7-pre-architect-brainstorming-topics.md#9-diagnostics-readiness-and-progress-model) |
| 10 | Evidence gates and visual regression strategy | decided | [Topic 10](./phase7-pre-architect-brainstorming-topics.md#10-evidence-gates-and-visual-regression-strategy) |
| 11 | Config surface expansion | decided | [Topic 11](./phase7-pre-architect-brainstorming-topics.md#11-config-surface-expansion) |
| 12 | Fresh-project dogfood harness | decided | [Topic 12](./phase7-pre-architect-brainstorming-topics.md#12-fresh-project-dogfood-harness) |

## 1. Alpha Claim Boundary And Audience Promise

- Topic reference:
  [Alpha claim boundary and audience promise](./phase7-pre-architect-brainstorming-topics.md#1-alpha-claim-boundary-and-audience-promise)
- Status: decided
- Consensus decision: Phase 7 should target a local developer alpha candidate,
  not a default public alpha claim. Public alpha wording is a gated claim that
  may only be promoted after fresh-project dogfood, release wording, known
  limitations, pure JSON CLI invocation, and Reviewer-accepted evidence support
  it.
- Rationale: This posture is stronger than a repo-local developer preview
  because Phase 7 is expected to prove the Player App, local preview, app-based
  web export, CLI alpha invocation, and dogfood loop. It is still narrower than
  public alpha, which would overclaim until install/docs/evidence paths are
  proven outside the monorepo fixture path.
- Stage A implications: Architect Stage A should separate the Phase 7 completion
  claim from public launch wording. Stage A options may compare alpha promotion
  gates, but the baseline contract should keep public alpha as conditional
  wording, not the default exit state.
- Blocking question: resolved.
- Updated: 2026-06-03.

## 2. Phase 7 Success Slice And Non-Goals

- Topic reference:
  [Phase 7 success slice and non-goals](./phase7-pre-architect-brainstorming-topics.md#2-phase-7-success-slice-and-non-goals)
- Status: decided
- Consensus decision: Phase 7 completion should be a local product loop:
  Player App opens the canonical deck, local preview uses the Player App, CLI
  can export an app-based web bundle, MP4 visual limitations are explicit, and
  alpha docs/evidence avoid overclaiming. Hosted SaaS, Remotion Lambda or cloud
  queues, WYSIWYG editing, PPTX/PDF IR, collaboration/accounts/SSO, and broad
  non-developer deck-product scope remain explicit non-goals. Npm publication is
  not required for local product loop completion, but any external public alpha
  promotion is gated on an npm alpha publication decision or an explicitly
  accepted low-friction install alternative.
- Rationale: The local product loop keeps Phase 7 focused on the first credible
  Cadenza product surface without collapsing into hosted, editor, or broad
  format work. At the same time, public promotion to real external users should
  not require cloning the monorepo and discovering workspace scripts; it needs a
  package-hardened install path or an accepted equivalent.
- Stage A implications: Architect Stage A should separate completion gates from
  promotion gates. The baseline Phase 7 scope can finish without npm publish,
  but Stage A should include release/install options for public alpha promotion,
  including package metadata, `bin` entrypoint, non-workspace dependency
  resolution, fresh-project install smoke, pure JSON command behavior, and
  overclaim guards. Any change to public package posture should be considered
  for ADR routing.
- Blocking question: resolved.
- Updated: 2026-06-03.

## 3. Player App Role And UI / App Design Direction

- Topic reference:
  [Player App role and UI / App Design direction](./phase7-pre-architect-brainstorming-topics.md#3-player-app-role-and-ui--app-design-direction)
- Status: open
- Consensus decision: The emerging direction is a deck-primary balanced shell:
  a full-featured, polished, visually strong, read-only Player App where deck
  playback is the primary surface, controls live in a stable bottom bar, and a
  single discoverable inspector carries outline or chapter navigation,
  readiness, diagnostics, and export provenance. The app should be a player plus
  inspector, not a WYSIWYG editor, source editor, in-app repair workbench, or AI
  patching surface.
- Rationale: This direction preserves the product feel of a presentation player
  while keeping Cadenza's alpha evidence inspectable for developers and agents.
  A read-only inspector can expose diagnostic codes, readiness state, provenance,
  known limitations, and copyable command or evidence references without turning
  Phase 7 into an editor or repair product.
- Stage A implications: Before Phase 7 Architect freezes UI or package
  contracts, the maintainer should run a dedicated UI prototype pass that
  produces a previewable frontend page. That prototype pass should discuss the
  prototype technology stack, fixture or real-data strategy, responsive desktop
  and mobile behavior, inspector information architecture, visual quality bar,
  and how prototype findings flow into Stage A without becoming a frozen
  contract by accident.
- Blocking question: What prototype artifact and technology stack should be
  used before Phase 7 Architect work, and what evidence is enough to promote the
  UI direction from open to decided?
- Updated: 2026-06-03.

## 4. Player App Package Boundary And `preview-remotion` Transition

- Topic reference:
  [Player App package boundary and preview-remotion transition](./phase7-pre-architect-brainstorming-topics.md#4-player-app-package-boundary-and-preview-remotion-transition)
- Status: decided
- Consensus decision: Phase 7 should default to a private workspace
  `@cadenza-dev/player-app` product-shell boundary that depends on the existing
  `@cadenza-dev/preview-remotion` adapter. `preview-remotion` should remain a
  transition dependency and should not be deprecated, removed, or renamed before
  the Player App proves local preview parity and app-based web export becomes
  the preferred web export path.
- Rationale: `preview-remotion` already owns useful Remotion Player adapter,
  navigation, readiness snapshot, and preview-controller behavior, but its name
  and scope describe an implementation adapter rather than the Cadenza product
  surface. A separate Player App package keeps product shell, inspector layout,
  local preview reuse, and app-based web runtime work from being coupled to the
  adapter's public meaning too early.
- Stage A implications: Architect Stage A should compare package topology
  options but use `@cadenza-dev/player-app` plus `preview-remotion` adapter as
  the baseline. Stage A should define the package boundary as private unless
  public alpha promotion explicitly chooses a package surface. If Player App
  posture affects public package stability, npm publication, or long-term
  compatibility, Stage B should route the decision through an ADR or equivalent
  accepted architecture record.
- Blocking question: resolved.
- Updated: 2026-06-03.

## 5. Visual-Fidelity Export Posture

- Topic reference:
  [Visual-fidelity export posture](./phase7-pre-architect-brainstorming-topics.md#5-visual-fidelity-export-posture)
- Status: decided
- Consensus decision: Phase 7 should split web and MP4 visual-fidelity claims.
  App-based web export should package the slides and Player App together into an
  immediately openable runtime environment and should become the preferred
  visual web output. MP4 export should produce a standard video artifact that
  can be opened by ordinary video players, without Player App chrome or runtime
  environment UI. Navigation should remain at `step/action anchor` granularity,
  with `action anchor` as the preferred working term, and Phase 7 should not
  introduce a separate navigable `motion unit`. Current-page continuous
  animation may be promoted to P0 only as a scoped Player App / app-web visual
  capability bound to the active action anchor. MP4 duration should keep the
  finite offline compiled timeline as the baseline; project, CLI, or authored
  duration parameters may feed finite segments where supported, but continuous
  animation must be clipped rather than expanding deck duration.
- Rationale: Web export is an interactive playback environment, so reusing the
  Player App route is the right alpha product promise. MP4 export is a portable
  media artifact, so including player chrome would confuse the output contract
  and make video evidence less reusable. The critical documentation boundary is
  to distinguish app-based web bundles, deck-content MP4, static compatibility
  output, and remaining visual limitations instead of making broad "web export"
  or "MP4 supported" claims. Keeping action-anchor navigation avoids both
  page-only navigation that is too coarse for step reveals and motion-unit
  navigation that would make authoring, preview, and export semantics too fine
  grained for the Phase 7 alpha. The scoped continuous-animation P0 gives the
  Player App enough visual life for alpha polish while avoiding paused-anchor
  infinite looping or full MP4 animated visual parity as default commitments.
- Stage A implications: Architect Stage A should define separate evidence and
  wording for app-based web export and MP4 export. Stage A should preserve
  action-anchor navigation, define the exact API or visual-context surface for
  scoped current-page continuous animation, and choose per-format evidence field
  names for duration baseline and animation clipping. Stage A should treat
  interactive paused-anchor infinite looping and full MP4 animated visual parity
  as deferred enhancements unless the maintainer explicitly expands P0 scope;
  see
  [phase7-pre-architect-mp4-duration-follow-up.md](./phase7-pre-architect-mp4-duration-follow-up.md).
- Blocking question: resolved for web/MP4 posture, action-anchor navigation,
  scoped current-page continuous animation, and MP4 finite-duration baseline.
- Updated: 2026-06-04.

## 6. App-Based Web Export And Bundler Contract

- Topic reference:
  [App-based web export and bundler contract](./phase7-pre-architect-brainstorming-topics.md#6-app-based-web-export-and-bundler-contract)
- Status: decided
- Consensus decision: Phase 7 should define a dedicated app-based web bundler
  contract whose baseline artifact is a static-hostable Player App bundle. The
  exported directory should include a Player App `index.html`, runtime chunks,
  CSS, assets, manifest/evidence files, and enough metadata to distinguish
  `player-app-web` output from Phase 6 `static-web-compatibility` output.
  Direct `file://` offline portability should not be a P0 alpha promise.
- Rationale: Web export should feel like a real Player App runtime that can be
  opened through a local static server or deployed to ordinary static hosting.
  This is the right user-facing shape for sharing, previewing, and future web
  deployment without prematurely freezing browser-specific `file://` behavior,
  dynamic chunk loading, fetch semantics, router base paths, fonts, media, and
  cross-platform path quirks as alpha contract.
- Stage A implications: Architect Stage A should specify the artifact shape,
  local/static HTTP serving assumption, manifest/evidence linkage, asset and
  media packaging expectations, and the distinction between preferred
  Player-App web output and compatibility fallback output. Stage A may include a
  convenience command such as `cadenza preview-export <web-output-dir>` as a
  low-friction local open path, while treating direct `file://` support as an
  enhancement or explicit alpha limitation.
- Blocking question: resolved.
- Updated: 2026-06-03.

## 7. CLI Install, Invocation, And Pure JSON Path

- Topic reference:
  [CLI install, invocation, and pure JSON path](./phase7-pre-architect-brainstorming-topics.md#7-cli-install-invocation-and-pure-json-path)
- Status: decided
- Consensus decision: Phase 7 should use a two-track CLI invocation posture.
  The local product loop baseline should support a repo-local machine path such
  as `pnpm --silent cadenza ... --json`, backed by tests that assert stdout is
  parseable pure JSON. Public alpha promotion should be gated on a lower-friction
  binary/package path, such as a package `bin` entrypoint, alpha dist-tag, or an
  explicitly accepted equivalent install route.
- Rationale: `pnpm --silent cadenza ... --json` is the smallest path that fits
  the current Phase 6 local-only contract and avoids pulling Player App work into
  premature release engineering. However, real external promotion should not ask
  users or agents to clone the monorepo and remember package-manager banner
  details; the public alpha path needs package-hardened invocation with Cadenza
  owning JSON stdout behavior directly.
- Stage A implications: Architect Stage A should treat repo-local pure JSON as
  a Phase 7 completion requirement and package/binary invocation as a public
  alpha promotion gate. Stage A options should compare `pnpm --silent`, local
  binary wrapper, package `bin`, `pnpm dlx @cadenza-dev/cli@alpha`, dependency
  resolution outside the workspace, build output shape, package metadata, and
  fresh-project JSON smoke evidence. Any shift in public package posture should
  be considered for ADR routing.
- Blocking question: resolved.
- Updated: 2026-06-03.

## 8. Canonical Deck Identity, Starters, And Demo Material

- Topic reference:
  [Canonical deck identity, starters, and demo material](./phase7-pre-architect-brainstorming-topics.md#8-canonical-deck-identity-starters-and-demo-material)
- Status: decided
- Consensus decision: Phase 7 should use a two-role content posture:
  `cadenza-alpha-readiness-talk` remains the canonical alpha/evidence deck, and
  a smaller technical-talk starter should serve the first-run user experience.
  Both roles must derive display identity from authored deck module metadata
  such as `deckId`, `title`, `outline`, `chapters`, `sourcePath`, and presenter
  metadata. Config aliases and selectors may resolve paths or provide command
  shortcuts, but they must not override or invent Player App display identity.
- Rationale: The canonical alpha deck is useful for evidence, local product-loop
  smoke, and Reviewer-facing proof, while a smaller starter is better for an
  external user's first successful preview/export run. Keeping identity inside
  authored deck metadata prevents config aliases, filenames, or CLI selectors
  from silently diverging from manifest identity and Player App display state.
- Stage A implications: Architect Stage A should preserve separate evidence and
  starter roles and decide whether Phase 7 needs a new or refreshed small
  starter. After Phase 7 features are implemented, the canonical deck and
  starter decks should be redesigned or polished so they are not only valid
  evidence artifacts but also visually attractive, designed, and credible as
  Cadenza examples. That redesign should respect the read-only Player App
  posture and should not turn starters into a broad template marketplace.
- Blocking question: resolved.
- Updated: 2026-06-03.

## 9. Diagnostics, Readiness, And Progress Model

- Topic reference:
  [Diagnostics, readiness, and progress model](./phase7-pre-architect-brainstorming-topics.md#9-diagnostics-readiness-and-progress-model)
- Status: decided
- Consensus decision: Phase 7 should define a shared diagnostics/readiness
  vocabulary across CLI, export evidence, Player App inspector, and agent repair
  surfaces. It should not freeze JSONL streaming, fine-grained progress events,
  cancellation protocol, or interactive prompt protocol unless Architect finds a
  concrete P0 scenario that requires them.
- Rationale: Phase 6 already provides typed diagnostics, stable JSON command
  summaries, evidence files, deterministic exit codes, and repair routing.
  Preview runtime code already exposes readiness and diagnostics snapshots.
  Sharing vocabulary is enough for a read-only Player App inspector, while
  freezing a streaming or cancellation protocol before long-running Player App,
  export, hosted, or IDE workflows need it would create brittle public surface.
- Stage A implications: Architect Stage A should distinguish runtime readiness
  from export readiness and define the fields Player App can display read-only:
  diagnostic code, category, severity, message, source or artifact locator,
  repair hint, requirement references, pending resources, readiness state,
  evidence paths, and known limitations. JSONL streaming, detailed progress,
  cancellation, and interactive prompts should remain future-support candidates
  unless promoted by an explicit Phase 7 requirement.
- Blocking question: resolved.
- Updated: 2026-06-03.

## 10. Evidence Gates And Visual Regression Strategy

- Topic reference:
  [Evidence gates and visual regression strategy](./phase7-pre-architect-brainstorming-topics.md#10-evidence-gates-and-visual-regression-strategy)
- Status: decided
- Consensus decision: Phase 7 should keep semantic browser smoke, structured
  manifest/evidence, and inspectable export records as the primary alpha
  evidence. Pixel or screenshot checks should be targeted visual sanity checks,
  not a broad release gate or frame-perfect visual parity contract.
- Rationale: Player App is a visual product surface, so Phase 7 needs stronger
  visual sanity than Phase 6 static compatibility, but broad screenshot or pixel
  parity is brittle across browsers, operating systems, fonts, media tooling,
  and rendering environments. A combined evidence model can support alpha claims
  more honestly: semantic browser checks prove behavior and structure, structured
  evidence records provenance and limitations, and targeted visual sanity catches
  blank, misframed, or obviously overlapping UI without overclaiming pixel
  equivalence.
- Stage A implications: Architect Stage A should require browser smoke for
  canonical and starter Player App paths, structured `player-app-web` evidence,
  `inspect` support that distinguishes Player App web output from static
  compatibility output, MP4 media metadata and provenance, and limited desktop
  plus mobile visual sanity checks. Pixel/screenshot artifacts may supplement
  review but must not become the sole or broad pass/fail oracle.
- Blocking question: resolved.
- Updated: 2026-06-03.

## 11. Config Surface Expansion

- Topic reference:
  [Config surface expansion](./phase7-pre-architect-brainstorming-topics.md#11-config-surface-expansion)
- Status: decided
- Consensus decision: Phase 7 should keep the existing minimal config posture
  and add only narrowly scoped, namespaced keys that are P0 for the alpha
  workflow. Every candidate key must pass this review question: is this
  something alpha users must configure, or can the implementation infer it from
  CLI flags, registry defaults, authored deck metadata, manifest/evidence, or
  the Player App runtime?
- Rationale: `cadenza.config.ts` is a public-ish alpha surface once documented.
  Adding broad namespaces before Player App preview, app-based web export, and
  dogfood usage are proven would make later rename/removal expensive. Minimal
  additive config keeps Phase 7 focused on the local product loop while avoiding
  premature hosted, plugin, template, migration, or interactive setup promises.
- Stage A implications: Architect Stage A may consider narrowly scoped
  `preview`, `playerApp`, `web`, `renderer`, `diagnostics`, or `experimental`
  keys only when a concrete alpha workflow is blocked without them. `hosted`,
  `cloud`, accounts or credentials, plugin registries, template marketplaces,
  interactive init, and migration tooling should remain deferred unless a later
  phase explicitly accepts that product surface.
- Blocking question: resolved.
- Updated: 2026-06-03.

## 12. Fresh-Project Dogfood Harness

- Topic reference:
  [Fresh-project dogfood harness](./phase7-pre-architect-brainstorming-topics.md#12-fresh-project-dogfood-harness)
- Status: decided
- Consensus decision: Fresh-project dogfood is required for public alpha
  promotion and should be part of the Phase 7 local product loop unless
  explicitly downgraded to a documented alpha limitation. The dogfood route
  should run outside the Cadenza monorepo and exercise a realistic sample
  project, `cadenza.config.ts`, pure JSON invocation, Player App preview,
  static-hostable Player App web export, MP4 export, `inspect` over manifest and
  evidence, and docs from fresh checkout to successful artifacts.
- Rationale: Without a repo-external dogfood route, Phase 7 success would look
  too much like monorepo fixture success. A fresh project exposes install,
  discovery, config, trusted local deck loading, browser prerequisites, MP4
  renderer behavior, JSON output cleanliness, web artifact serving, and docs
  gaps in the shape alpha users will actually encounter.
- Stage A implications: Architect Stage A should define the dogfood project
  shape, whether it is checked into the repo or generated in a temporary
  workspace, how install posture interacts with public alpha promotion, which
  commands must run in human and machine modes, what artifacts and evidence must
  be inspected, and what failures are blockers versus documented alpha
  limitations. Public alpha wording should not be promoted until this path is
  accepted or explicitly waived by the maintainer.
- Blocking question: resolved.
- Updated: 2026-06-03.
