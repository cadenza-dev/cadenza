# ADR 0011: Remotion notification sent

- **Status**: Accepted
- **Date**: 2026-04-25
- **Deciders**: @DrEden33773
- **References**: [ADR 0007](./0007-two-stage-remotion-engagement.md), [analysis-final §9 Q3](../analysis/analysis-final.md), [Remotion contact](https://www.remotion.dev/contact)

## Context

ADR 0007 established a two-stage Remotion engagement model. Stage 1 is a
light-touch Phase 0 notification: tell Remotion what Cadenza is, clarify the
license boundary, and invite an early warning only if there is roadmap conflict.

The repository and frozen compiler-design link were made publicly visible before
sending. The maintainer then sent the notification email from
`edwardwang33773@gmail.com` to `hi@remotion.dev` at approximately
2026-04-25 21:00 +0800. The subject was:

> Heads-up: Cadenza, an Open-Source Presentation Framework built on Remotion

## Decision

Cadenza has completed the Phase 0 Remotion notification step.

The current outcome is: **sent, awaiting response**. No endorsement, approval,
license accommodation, roadmap confirmation, or commercial commitment has been
received or implied.

Follow-up rules:

- If Remotion replies positively, thank them briefly and do not immediately ask
  for promotion, endorsement, or licensing terms.
- If Remotion raises a roadmap or licensing concern, record the concern in trace
  and open a new ADR before changing Cadenza's scope.
- If there is no reply by 2026-05-23, record "no response" in trace and continue
  under public Remotion license terms and the existing two-stage model.

## Consequences

### Positive

- Remotion has been notified before any public launch push.
- Cadenza can proceed without relying on a private or implied upstream approval.
- Future Remotion-related decisions have a concrete contact-history anchor.

### Negative

- The commercial boundary remains unresolved until Remotion replies or a later
  hosted/commercial tier creates a concrete licensing need.
- Public visibility slightly increases idea-copying risk, which Cadenza accepts
  in exchange for public priority, clarity, and execution momentum.

### Open

- Whether Remotion will reply.
- Whether any future hosted tier will require a direct commercial license
  conversation.

## Alternatives Considered

- **Wait for a product before notifying Remotion**: rejected because Phase 0 is
  precisely the right point to reduce roadmap-conflict risk without asking for
  anything.
- **Ask for endorsement or partnership now**: rejected because Cadenza has no
  shipped product or adoption evidence yet.
- **Keep the project private longer**: rejected because public development,
  priority record, and early upstream awareness matter more than secrecy for
  this project.
