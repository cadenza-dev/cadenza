# Phase 8+ Roadmap - Cloud, Hosted Export, and Agent Expansion

> Status: WIP planning note, not a contract.
> Created: 2026-05-28.
> Source: maintainer roadmap adjustment after Phase 5 closeout review.

## Purpose

Phase 8+ should evaluate and, if approved, implement the hosted/cloud export
path after the local CLI, MP4 renderer, Player App, and app-based web export are
stable enough to justify operational complexity.

## Thesis

Cloud rendering is not just another format flag. It changes licensing,
credentials, cost, queueing, security, artifact retention, support burden, and
possibly commercial posture. It should begin only after local export and alpha
usage prove that remote rendering solves a real problem.

## Candidate Scope

- Remotion renderer hardening: improve the local renderer boundary if Phase 6
  left cross-platform or dependency issues unresolved.
- Remotion Lambda or equivalent cloud proof: run only after an ADR or explicit
  maintainer approval defines licensing, account, and cost boundaries.
- Queue and job model: define job states, retries, progress reporting,
  cancellation, artifact retention, and failure diagnostics.
- Credentials and secrets: define local, CI, and hosted credential boundaries
  without leaking cloud assumptions into the OSS core.
- Cost evidence: estimate render cost, storage, bandwidth, cold starts,
  concurrency limits, and operational risk before any hosted claim.
- Hosted path: decide whether hosted export remains a maintainer-operated path,
  a narrow hosted tier, or only documented self-hosting guidance.
- Agent tools: wrap stable local or hosted capabilities such as validate,
  inspect, preview, export, and report only after their command and evidence
  schemas are stable.
- Presenter-console extensions: consider multi-device console, session replay,
  or live-presenter recording only if alpha dogfood shows deterministic offline
  export is not enough.

## Non-Goals

- No hosted commercial tier without a dedicated ADR and maintainer approval.
- No accounts, billing, comments, collaboration, SSO, or enterprise features by
  default.
- No direct exposure of unstable package internals through agent tools.
- No broad cross-format IR work unless Phase 9+ explicitly promotes it.

## Promotion Triggers

- Phase 7 alpha usage shows that local export alone is insufficient for an
  important workflow.
- Local CLI/export evidence schemas are stable enough to be consumed remotely.
- Remotion licensing and commercial implications are documented well enough for
  an implementation decision.

## Exit Evidence

- A cloud/hosted recommendation is recorded with cost, licensing, credentials,
  security, and operational risk evidence.
- If implementation is approved, a minimal cloud render proof produces artifacts
  whose manifest and diagnostics align with the local export model.
- Agent-facing tools expose stable command surfaces and include repairable error
  reports, not raw internal exceptions.

## Phase 9 Handoff

Phase 9+ should receive any evidence that hosted or agent workflows require a
stronger structured representation, cross-format mapping, or editing surface.
