# ADR 0005: Apache License 2.0 for the project

- **Status**: Accepted
- **Date**: 2026-04-17
- **Deciders**: @DrEden33773
- **References**: [analysis-final §B1](../analysis/analysis-final.md), [Apache 2.0 license text](https://www.apache.org/licenses/LICENSE-2.0)

## Context

The project must choose a license before first public push. The choice interacts with:

- The commercialization plan (see [ADR 0006] — forthcoming — dual OSS + hosted model).
- Contributor expectations in the React ecosystem.
- The ability of downstream commercial users to adopt Cadenza without legal friction.
- Remotion's own licensing model (separate; see [Remotion License](https://www.remotion.dev/docs/license)).

Candidates considered:

| License | Fit |
| :---- | :---- |
| MIT | Minimal; widely compatible; no patent clause |
| Apache 2.0 | Widely compatible + patent grant + NOTICE requirement |
| AGPL-3.0 | Strong copyleft; network distribution triggers source disclosure |
| BSL / Fair Source | Time-locked OSS (e.g., converts to OSS after N years) |

## Decision

Cadenza is released under the **Apache License 2.0**.

The `LICENSE` file at the repo root contains the full Apache 2.0 text. The README includes a standard license section plus an explicit note that **Remotion's separate license applies transitively to Cadenza users** — Cadenza does not redistribute Remotion.

## Consequences

### Positive

- **Patent grant**: Apache 2.0 includes an explicit patent license, protecting contributors and users from patent claims arising from the code itself.
- **Commercial friendliness**: Enterprises can adopt Cadenza without the compliance uncertainty that AGPL triggers. This aligns with the planned dual OSS + hosted commercialization model.
- **Ecosystem alignment**: React itself is MIT-licensed; many adjacent tools (Next.js, Remix, Astro) are MIT or BSD. Apache 2.0 is close enough in spirit to not create friction, and the patent clause is a net improvement for contributors.
- **NOTICE requirement is mild**: We maintain a `NOTICE` file for any required attributions; in practice, this is a non-issue for well-behaved dependencies.

### Negative

- Slightly more ceremony than MIT (NOTICE file, longer license header in source files).
- Unlike AGPL, Apache 2.0 does **not** prevent competitors from building a closed-source fork. This is a conscious trade-off: we prefer broad adoption to copyleft enforcement.
- If the project later wants to adopt a source-available model (BSL, SSPL) for business-layer code, doing so while keeping OSS core as Apache will require careful packaging.

### Open

- Should individual source files carry the Apache boilerplate header, or is repo-level `LICENSE` sufficient? Current plan: headers in public-API files (`core/`, `runtime/`, etc.), omitted in internal utils.
- Do we need a Contributor License Agreement (CLA) or a Developer Certificate of Origin (DCO)? Deferred — will revisit when the first external contribution arrives.

## Alternatives Considered

- **MIT**: Rejected. No patent clause; less protection for contributors. Minor simplicity gain is not worth the loss.
- **AGPL-3.0**: Rejected. Triggers source disclosure for network services, which would deter enterprise adoption of Cadenza's future hosted tier and discourage commercial use of the OSS core.
- **BSL / SSPL / Fair Source**: Rejected for the core. These licenses are useful for protecting a commercial moat but are inappropriate for developer-tool OSS that wants broad ecosystem adoption. If a business-layer product ships in Phase 4+, we may use a source-available license *for that layer specifically*, while keeping the core under Apache 2.0.
- **Dual licensing (Apache for non-commercial, commercial license for commercial)**: Rejected. Administrative overhead is high for a solo maintainer; the distinction is blurry and frequently contested.
