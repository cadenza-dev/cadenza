# Remotion Notification Email — Draft

> **Purpose**: Phase 0 light-touch notification to the Remotion team. The goal is to **inform, not to request**. We want early warning if there is a roadmap conflict, and to establish a respectful baseline for any future commercial conversation.
> **When to send**: After the GitHub org `cadenza-dev` is created, the initial `compiler-design.md` draft is published, and the README is live.
> **Where to send**: Remotion's public contact channels. Primary: `hi@remotion.dev` (or whichever email is published on remotion.dev). Secondary: mention on X/Twitter if no response in 2 weeks.
> **What we are NOT doing**: asking for approval, requesting endorsement, negotiating licensing, asking for promotion.

---

## Draft v1

**Subject**: Heads-up: building an OSS presentation framework on Remotion

---

Hi Remotion team,

I wanted to introduce a project I'm starting in the open, in case it's useful context for your roadmap planning.

**What it is**: [Cadenza](https://github.com/cadenza-dev) — a React-based presentation framework that sits on top of Remotion. It adds a thin typed API for deck/slide/step semantics, a render-safe component layer that encapsulates common asset-loading and timing pitfalls, and AI-agent-focused authoring ergonomics (skill pack, system prompt, validation loop). Target audience is developers writing technical talks, not business users building quarterly decks.

**Relationship to Remotion**: Cadenza uses Remotion as its runtime, rendering, and export backbone. We recognize Remotion's license terms and will be clear in our docs that Cadenza users are still subject to them directly — Cadenza does not redistribute Remotion.

**Why I'm writing**: I read [your public stance on not building Lovable for Motion Graphics](https://www.remotion.dev/docs/lovable-for-motion-graphics) and took it as an implicit invitation for community-built product layers. That post is much of why I felt comfortable starting this. Still, I'd rather you hear about it from me now than discover it on HackerNews later.

**What I'm asking for**: nothing right now. No endorsement, no licensing conversation, no linking. If at any point in the next 12 months you see a conflict with your own direction — e.g., you're planning to ship a first-party presentation layer — I'd appreciate a heads-up in return, and I'll adjust Cadenza's scope accordingly. For reference:

- Project overview & analysis: [github.com/cadenza-dev](https://github.com/cadenza-dev)
- Compiler design draft: [compiler-design.md](https://github.com/cadenza-dev/cadenza/blob/main/docs/design/compiler-design.md)

We'll proceed with or without a response — but either way, I wanted you to know.

Thanks for making Remotion. It's doing something genuinely hard, and doing it well.

Best,

Eden Wang ([@DrEden33773](https://github.com/DrEden33773))
`edwardwang33773@gmail.com`

---

## Notes for the Author

### Tone Guardrails

- **Do not**: ask for endorsement, feature requests, licensing discounts, exposure, or co-marketing.
- **Do not**: promise anything about future deliverables, users, or revenue numbers.
- **Do not**: over-explain the thesis — point to the docs.
- **Do**: acknowledge their public statements as context for why this project exists.
- **Do**: close with an explicit "we'll proceed either way."
- **Do**: be warm but not deferential. This is a peer-to-peer note, not a supplication.

### If They Reply Positively

- Thank them briefly.
- Do **not** immediately ask for anything (mailing list inclusion, docs link, etc.).
- Offer to send a quick alpha demo once MVP is ready.
- Mark them as a contact for future licensing conversation (Phase 2/3).

### If They Reply with Concerns (e.g., "we might enter this space")

- Thank them for the transparency.
- Ask (in follow-up) for a rough timeline so we can make scope decisions.
- Do **not** commit to pivoting on the spot. Take the information, discuss with the maintainer team (AI agent included), and respond in writing within a week.
- Update `docs/analysis/analysis-final.md` §3.5 "Unknown" with their position.

### If No Reply in 4 Weeks

- Do **not** resend.
- Do **not** chase on X/Twitter.
- Note in `docs/adr/0006-remotion-notification-outcome.md` that notification was sent, no reply received, project continues as planned.

### If They Publicly Announce a Competing Product

- Not an emergency. Take 1 week to assess differentiation.
- Decision tree:
  - Their product is AI-consumer-facing (like Gamma) → no conflict, continue as planned.
  - Their product is developer-facing and overlaps with Cadenza → assess whether Cadenza's differentiation (typed API + render-safe layer + technical-talk focus) holds; update positioning in README §Why Cadenza.
  - Their product is a complete supersedure → open an honest ADR, consider pausing Phase 1 until differentiation is clear.

---

## Version History

| Version | Date | Notes |
| :---- | :---- | :---- |
| v1 | 2026-04-17 | Initial draft. Pending final READ review before sending. |
