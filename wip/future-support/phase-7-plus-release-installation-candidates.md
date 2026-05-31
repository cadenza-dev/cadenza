# Phase 7+ Release and Installation Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-05-30.

These candidates come from Phase 6 closeout assessment of the gap between a
working local workspace CLI and a truly general presentation export CLI. Future
Architects must promote them into a phase spec before Builder treats them as
requirements.

## Alpha Install And Invocation Posture

- **Source**: Phase 7 roadmap pressure for public alpha material and Phase 6
  evidence that `@cadenza-dev/cli` and `@cadenza-dev/export-local` remain
  private workspace packages behind the root `pnpm cadenza` wrapper.
- **Phase 6 disposition**: keep the CLI local-only, private, and
  clean-checkout oriented. Do not claim npm publication, package stability, or
  broad installability.
- **Future support**: define the Phase 7 alpha-safe install and invocation
  posture. Candidate options include documented repo-local invocation,
  `pnpm --silent cadenza` for machine output, a generated local binary wrapper,
  private package metadata hardening, or an explicitly deferred npm publication
  plan.
- **Reason to defer**: installation posture is a public-product commitment. It
  should follow Player App, app-based web export, and alpha framing decisions
  rather than be inferred from the Phase 6 monorepo wrapper.

## Fresh-Project Dogfood Harness

- **Source**: Phase 7 roadmap dogfood loop and Phase 6 assessment that CLI
  generality is currently proven mainly through monorepo fixtures, temporary
  project directories, direct deck paths, and the canonical Phase 5 talk.
- **Phase 6 disposition**: validate config aliases, direct local module paths,
  generated-output safety, web export, MP4 export, and inspect behavior through
  focused acceptance tests. Do not require a separate external sample project.
- **Future support**: add a fresh-project dogfood route once the Player App and
  alpha invocation posture are stable enough. The route should exercise a deck
  outside the Cadenza workspace with realistic `cadenza.config.ts`, preview,
  app-based web export, MP4 export, inspect, docs, and JSON command behavior.
- **Reason to defer**: a fresh-project harness has high signal only after the
  user-facing Player App and CLI invocation contract are close enough to alpha
  shape. Before then it can turn into noisy scaffolding churn.

## Public Package Metadata And Overclaim Guards

- **Source**: Phase 6 clean-checkout docs and overclaim guards, plus Phase 7
  roadmap alpha material.
- **Phase 6 disposition**: package manifests stay `private: true`; docs guard
  against npm publication, hosted rendering, Player App export, unsupported
  formats, and alpha-readiness overclaims.
- **Future support**: expand overclaim guards to cover alpha package metadata,
  README quickstart, install commands, generated evidence summaries, and any
  release or tag language before public alpha material is accepted.
- **Reason to defer**: public package metadata is meaningful only once the
  maintainer chooses the alpha release surface. Guarding it too early risks
  freezing placeholder language.
