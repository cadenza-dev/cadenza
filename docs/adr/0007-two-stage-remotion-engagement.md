# ADR 0007: Two-stage Remotion engagement

- **Status**: Accepted
- **Date**: 2026-04-25
- **Deciders**: @DrEden33773
- **References**: [analysis-final §3.5](../analysis/analysis-final.md), [§9 Q3](../analysis/analysis-final.md), [§9 Q5](../analysis/analysis-final.md), [notification draft](../communications/remotion-notification-email.md)

## Context

Cadenza depends on Remotion as its runtime, rendering, transitions, Player, and eventual Lambda export backbone. Remotion is sufficient for those lower layers, but it is not a presentation product. Cadenza intentionally lives above that boundary.

The commercial risk is licensing and roadmap overlap. Remotion's license applies separately to downstream users, and any future hosted tier wrapping Lambda may require direct commercial clarity. At the same time, Phase 0 is too early for a negotiation: there is no product, usage, revenue, or hosted offering to price.

## Decision

Cadenza uses a **two-stage engagement model** with Remotion.

Stage 1, in Phase 0, is a light notification: tell Remotion what Cadenza is, clarify that Cadenza does not redistribute Remotion, and invite an early warning if there is roadmap conflict.

Stage 2, no earlier than Phase 2 and more likely Phase 4, is a commercial conversation only if Cadenza pursues hosted rendering or another hosted tier that depends on Remotion's commercial terms.

## Consequences

### Positive

- Remotion hears about the project early and respectfully.
- Phase 0 does not pretend to negotiate before there is a product.
- The hosted commercial path remains conditional on real adoption.

### Negative

- The commercial boundary remains partially uncertain until later.
- Remotion may not respond, leaving only public license terms as guidance.
- If Remotion enters developer-facing slides directly, Cadenza may need to revisit positioning.

### Open

- Whether Remotion would support or object to a future hosted tier is unknown until direct conversation.

## Alternatives Considered

- **Do nothing**: rejected because silence increases roadmap and relationship risk.
- **Negotiate immediately**: rejected because Phase 0 has no concrete commercial surface.
- **Ask for endorsement**: rejected; the Phase 0 note is informational, not promotional.
