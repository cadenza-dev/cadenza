# Cadenza Alpha Readiness Candidate

This guide describes the local developer-preview candidate for Cadenza. It is
for developers writing technical talks with code-reviewable TSX and AI agent
help. It is not a business prompt-to-deck workflow and it is not a final
`0.1 alpha readiness` claim.

## Public Surface

The current local alpha-candidate public surface is:

- `@cadenza-dev/core`: package exports `.`, `./jsx-runtime`,
  `./jsx-dev-runtime`, and `./fixtures/allDomainMvp`.
- `@cadenza-dev/preview-remotion`: package export `.`.
- `@cadenza-dev/cli`: local CLI entrypoint API and command adapters.
- `@cadenza-dev/export-local`: local export, diagnostics, manifest, renderer,
  and evidence APIs.
- Documented command:
  `pnpm cadenza export cadenza-alpha-readiness-talk --run-id local-alpha`.
- Examples: `examples/cadenza/alpha-readiness-talk.tsx`,
  `examples/phase4/dogfood-talk.tsx`, and
  `examples/phase4/technical-talk-starters.tsx`.
- `cadenza-best-practices` guidance:
  `skills/cadenza/SKILL.md`,
  `skills/cadenza/rules/product-layer-workflow.md`, and
  `skills/cadenza/rules/validation-repair.md`.

Excluded internal surfaces include package implementation internals under
`packages/*/src/**` behind package exports, `scripts/cadenza.ts` internals
behind `pnpm cadenza`, generated `dist/**` artifacts, and verification archives
under `tests/**` or `trace/**`.

## Clean-Checkout Path

From a fresh checkout:

```bash
pnpm install
pnpm typecheck
pnpm cadenza validate cadenza-alpha-readiness-talk --json
pnpm cadenza export cadenza-alpha-readiness-talk --run-id local-alpha --format web,mp4
```

Then inspect `dist/cadenza/cadenza-alpha-readiness-talk/local-alpha/` for:

- `manifest.json`
- `web-evidence.json`
- `mp4-evidence.json`
- `index.html`
- `cadenza-alpha-readiness-talk.mp4`

Evidence command:
`pnpm cadenza inspect dist/cadenza/cadenza-alpha-readiness-talk/local-alpha --json`.

## Candidate Positioning

The candidate demonstrates a longer technical talk exported through the
supported local pipeline. It positions Cadenza for developers and technical
communicators who want React-native, cinematic, inspectable presentation
authoring.

## Readiness Gate

Final `0.1 alpha readiness` is not claimed by this guide, by Builder green
tests, by export evidence, or by maintainer chat sign-off alone. The readiness
gate requires Builder closeout plus traceable Reviewer acceptance and explicit
release approval.

The material deliberately does not claim hosted rendering, external alpha user
adoption, broad format parity, npm publication, commercial readiness, a
marketplace, WYSIWYG editing, collaboration, comments, SSO, or i18n
infrastructure.
