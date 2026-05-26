# Phase 5 Public Launch Candidate

This guide describes the local developer-preview candidate for Cadenza Phase 5.
It is for developers writing technical talks with code-reviewable TSX and AI
agent help. It is not a business prompt-to-deck workflow and it is not a final
`0.1 alpha readiness` claim.

## Public Surface

The Phase 5 launch-candidate public surface is:

- `@cadenza-dev/core`: package exports `.`, `./jsx-runtime`,
  `./jsx-dev-runtime`, and `./fixtures/allDomainMvp`.
- `@cadenza-dev/preview-remotion`: package export `.`.
- Documented commands: `pnpm preview:phase4` and
  `pnpm cadenza export phase5-alpha-readiness-talk --run-id local-alpha`.
- Examples: `examples/phase5/alpha-readiness-talk.tsx`,
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
pnpm preview:phase4
pnpm cadenza export phase5-alpha-readiness-talk --run-id local-alpha
```

Then inspect `dist/phase5/phase5-alpha-readiness-talk/local-alpha/` for:

- `manifest.json`
- `export-evidence.json` and `export-evidence.md`
- `repair-routing-evidence.json`
- `phase5-alpha-readiness-talk.mp4`
- `format-scope-evidence.json` and `format-scope-evidence.md`
- `alpha-readiness-evidence.json` and `alpha-readiness-evidence.md`

Evidence command: `inspect dist/phase5/phase5-alpha-readiness-talk/local-alpha/`.

## Launch-Candidate Positioning

The launch candidate demonstrates a longer technical talk exported through the
supported local pipeline. It positions Cadenza for developers and technical
communicators who want React-native, cinematic, inspectable presentation
authoring.

## Readiness Gate

Final `0.1 alpha readiness` is not claimed by this guide, by Builder green
tests, by export evidence, or by maintainer chat sign-off alone. The readiness
gate requires Builder closeout plus traceable Reviewer acceptance in
`trace/phase5/review-phase5-closeout.md#Reviewer Acceptance`.

The public-surface stability clock starts at the first Builder commit that
declares `docs/alpha-readiness.md` and generated
`alpha-readiness-evidence.json`. If the one-month stability requirement is
waived, the maintainer waiver must be recorded in `trace/phase5/status.yaml`,
narrow the readiness claim, and explain the risk.

The material deliberately does not claim hosted rendering, external alpha user
adoption, broad format parity, npm publication, commercial readiness, a
marketplace, WYSIWYG editing, collaboration, comments, SSO, or i18n
infrastructure.
