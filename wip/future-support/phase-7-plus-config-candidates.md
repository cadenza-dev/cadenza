# Phase 7+ Config Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-05-30.

These candidates came from Phase 6 Stage A config and path-registry
brainstorming. Phase 6 recommends a minimal `cadenza.config.ts` with
`defineConfig`, deck aliases, `output.root`, and `export.defaultFormats`, plus a
typed internal path/config registry and CLI override precedence. The items below
are intentionally deferred: future Architects must promote them into a phase
spec before Builder treats them as requirements.

## Full Project Config Surface

- **Source**: Phase 6 `FC-CNFG-01` and maintainer discussion about Phase 7 and
  alpha-readiness pressure.
- **Phase 6 disposition**: introduce only the minimal config needed for local
  export defaults and Phase 7 handoff.
- **Future support**: consider broader config after Player App preview and
  app-based web export are designed. Candidate namespaces include `preview`,
  `playerApp`, `web`, `renderer`, `diagnostics`, and `experimental`.
- **Reason to defer**: a broad config file becomes a public-ish alpha surface.
  Freezing many keys before Player App design would make later rename/removal
  expensive.

## Interactive Config Initialization

- **Source**: `skills.sh` interactive install/init patterns and Phase 6
  non-interactive CLI discussion.
- **Phase 6 disposition**: document a minimal hand-written config example; do
  not freeze `cadenza init` or interactive config prompts.
- **Future support**: add `cadenza init` only if alpha users need a guided
  setup path and the minimal config schema has proven stable.
- **Reason to defer**: interactive setup is a usability layer. Phase 6 should
  first prove local export, validation, diagnostics, and generated-output safety.

## Hosted And Cloud Config

- **Source**: Phase 7+ and Phase 8+ roadmap pressure for hosted rendering and
  remote workflows after local export and Player App alpha.
- **Phase 6 disposition**: no hosted, Remotion Lambda production, cloud queue,
  credentials, account, billing, or cost settings in config.
- **Future support**: introduce hosted configuration only after a future phase
  accepts a cloud or hosted-rendering architecture.
- **Reason to defer**: hosted settings carry security, cost, and public-product
  posture. They should not be implied by a local-only Phase 6 config file.

## Plugin Or Registry Discovery Config

- **Source**: Phase 6 deck-loading options considered config-driven discovery
  and arbitrary plugin-loaded decks.
- **Phase 6 disposition**: support built-in aliases, direct local module paths,
  and minimal project deck aliases only.
- **Future support**: consider plugin discovery, remote registries, or template
  marketplaces only if alpha usage shows that local TSX modules and project
  aliases are insufficient.
- **Reason to defer**: plugin discovery changes trust boundaries and likely
  needs sandboxing, versioning, provenance, and update policy.

## Config Migration And Deprecation Tooling

- **Source**: Maintainer concern that CLI/config additions, removals, or renames
  after Phase 6 should remain maintainable.
- **Phase 6 disposition**: require future config changes to be additive where
  possible and to use documented deprecation for frozen keys.
- **Future support**: add migration diagnostics, codemods, or `cadenza config
  doctor` after there are real config versions to migrate.
- **Reason to defer**: migration tooling before the first alpha config surface
  would be ceremony without real inputs.
