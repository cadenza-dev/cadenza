# Phase 5.5 -> Phase 6 Architect Handoff

> Wizard mode: Phase-boundary Wizard.
> Prepared: 2026-05-29 20:26 +0800.
> Approved Wizard identity: GPT-5/Codex, approved by maintainer with `y` after
> Startup Protocol mismatch check.

## Purpose

This handoff prepares the Phase 6 Architect entrypoint after Phase 5 export
closeout and Phase 5.5 test/harness hygiene. It does not open Phase 6, flip
`STATUS.yaml.current_phase`, freeze specs, implement code, or modify accepted
ADRs.

## Accepted Inputs

- Phase 5 closeout review was accepted in
  [`trace/phase5/review-phase5-closeout.md`](../phase5/review-phase5-closeout.md)
  after remediation of `REV-P5-001` and `REV-P5-002`.
- Phase 5 retained the boundary that final `0.1 alpha readiness` is not claimed;
  the public-surface stability clock remains governed by Phase 5 evidence and
  maintainer release decisions.
- Phase 5.5 hygiene status is `reviewer_accepted` in
  [`trace/phase5-5/status.yaml`](./status.yaml).
- Phase 5.5 Reviewer reported no remaining findings in
  [`trace/phase5-5/review-phase5-5-hygiene.md`](./review-phase5-5-hygiene.md).
- The Phase 6 roadmap input is
  [`wip/next-phases/phase-6-universal-cli-local-export-roadmap.md`](../../wip/next-phases/phase-6-universal-cli-local-export-roadmap.md).
- The Phase 5.5 roadmap input is
  [`wip/next-phases/phase-5-5-test-harness-hygiene-roadmap.md`](../../wip/next-phases/phase-5-5-test-harness-hygiene-roadmap.md).

## Phase 6 Scope Seed

Phase 6 should turn the narrow Phase 5 export proof into a general local CLI
and export engine. The Architect should start from roadmap-driven brainstorming
and Stage A, then freeze contracts only after maintainer review.

Scope seeds:

- universal local CLI surface;
- deck discovery and loading;
- export engine manifest, artifact layout, evidence, and limitations;
- static web compatibility export;
- real local MP4 rendering through a local Remotion path;
- Remotion renderer/bundler dependency boundary outside `@cadenza-dev/core`;
- structured diagnostics and error model;
- clean-checkout documentation;
- Phase 5.5 test/harness hygiene as the test strategy baseline.

## Explicit Non-Goals

- No Cadenza Player App product shell.
- No app-based web bundler or polished Player App export.
- No hosted rendering, Remotion Lambda production path, cloud queue, accounts,
  credentials, billing, cost system, or SaaS implementation.
- No PDF, PPTX, cross-format IR, import/export parity, or editor work.
- No visual editor or structured editing surface.
- No alpha announcement, public release claim, npm publication, release tag, or
  external launch without explicit maintainer approval.

## Test Strategy Input From Phase 5.5

The Phase 6 Architect should use Phase 5.5 hygiene as a placement and evidence
contract input:

- phase-bound CLI/export acceptance belongs under `tests/acceptance/`;
- package-local tests stay beside package source only for public package
  behavior;
- browser-only checks belong under `tests/browser/`;
- script governance and generated-evidence checks belong under `scripts/`;
- `dist/` and `tmp/` export output is regenerate-owned generated evidence, not
  tracked fixture data;
- reusable evidence readers and live export helpers should have small contracts
  instead of inheriting Phase 5's one-off generator shape.

## Architect Pre-Flight

The next Architect should:

1. Run `AGENTS.md` section 4 Startup Protocol before any write.
2. Load `cadenza-architect`.
3. Load `superpowers:brainstorming`.
4. Confirm Phase 6 is opened, or that the maintainer explicitly authorizes
   pre-open Phase 6 Architect planning while root status still points to Phase
   5.
5. Read `prompt/PHASE6_KICK_ARCHITECT.md` end-to-end.
6. Start with brainstorming and Stage A option exploration. Do not skip to
   frozen specs.

## Next Launch Phrase

Proceed as Cadenza Architect with
[`prompt/PHASE6_KICK_ARCHITECT.md`](../../prompt/PHASE6_KICK_ARCHITECT.md).
Load `cadenza-architect` and `superpowers:brainstorming`, start from the Phase
6 roadmap, draft Stage A options with Freeze Candidates in `spec/phase6/`, and
do not freeze contracts until maintainer approval.
