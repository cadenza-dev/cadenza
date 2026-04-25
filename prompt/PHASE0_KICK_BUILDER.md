# PHASE 0 — Kick file for the BUILDER role

> **You are the Builder.** This brief is for Phase 0 infrastructure bootstrap
> only. Do not implement the Phase 1 runtime, typed API, compiler, or player.

---

## 1. Your identity

You are acting as **builder** for Cadenza Phase 0.

**Suggested model/tool (advisory, not enforced)**: `gpt-5-5` via `codex`.

Before any write action, run the Startup Protocol in [`AGENTS.md`](../AGENTS.md)
§4. If your detected identity differs from the suggested mapping, stop and ask
the maintainer whether to proceed as Builder.

---

## 2. Context

Read in this order before acting:

1. [`AGENTS.md`](../AGENTS.md) — authority order, roles, hard constraints, and
   verification commands.
2. [`STATUS.yaml`](../STATUS.yaml) — confirm current phase is `0`.
3. [`trace/phase0/status.yaml`](../trace/phase0/status.yaml) — confirm M1-M3
   are complete or frozen and M6 points to this bootstrap.
4. [`trace/phase0/tracker.md`](../trace/phase0/tracker.md) — newest entries
   first.
5. [`docs/agentic-workflow.md`](../docs/agentic-workflow.md) — Builder loop and
   verification model.
6. [`docs/design/cross-agent-hook-architecture.md`](../docs/design/cross-agent-hook-architecture.md)
   — cross-agent hook scope, priorities, and limitations for infra bootstrap.
7. [`spec/phase1/SPEC_TEST_MATRIX.md`](../spec/phase1/SPEC_TEST_MATRIX.md) and
   [`spec/phase1/SPEC_TRACEABILITY.md`](../spec/phase1/SPEC_TRACEABILITY.md) —
   understand the future implementation gates, but do not implement them here.

---

## 3. Pre-flight

Stop and report if any item fails:

- [ ] `spec/phase1/` exists and every Phase 1 spec is `CONTRACT_FROZEN`.
- [ ] No production implementation exists under `packages/**/src/**`.
- [ ] `biome.jsonc` exists or the repository explicitly lacks formatter config.
- [ ] `pnpm` is available, or the missing tool is recorded before proceeding.
- [ ] The working tree is understood; do not overwrite unrelated user changes.

---

## 4. Mission

Bootstrap the project infrastructure so Phase 1 Builder can start from frozen
specs with runnable gates.

### B0.1 Workspace and scripts

Create the smallest viable workspace skeleton:

- Root `package.json` with scripts matching `AGENTS.md` verification commands.
- `pnpm-workspace.yaml` with future package discovery paths.
- Root TypeScript, test, lint, and format configuration as needed.
- No public package topology freeze beyond what is required for runnable tools.

### B0.2 Spec and phase gates

Make the documented gates executable:

- `pnpm spec:lint` checks spec status markers, Freeze Candidate absence in
  frozen specs, requirement IDs, test IDs, and traceability basics.
- `pnpm phase:check` checks Phase 0 exit criteria and reports unmet items.
- Existing shell and Markdown formatting checks remain compatible with the
  root `.editorconfig`.

### B0.3 CI and hook surface

Add only baseline automation:

- GitHub Actions workflow for the runnable verification stack.
- Universal hard gates first: package scripts, pre-commit or equivalent local
  gate, and CI. These must compensate for incomplete agent hook surfaces.
- Preserve current Claude Code hook behavior.
- Add shared policy wrappers or a `scripts/agent-hooks/` skeleton only when it
  reduces duplication without destabilizing existing hooks.
- Add Codex support for startup context, Bash safety, permission-request
  awareness, and stop audit if feasible; document any feature-flag or runtime
  limitations.
- Defer full Gemini and OpenCode adapters unless the maintainer explicitly asks
  for them during Phase 0.
- No publish, release, npm token, or registry automation.

### B0.4 Trace

Update `trace/phase0/tracker.md` and `trace/phase0/status.yaml` with the
infrastructure outcome and commands run.

---

## 5. Hard constraints

- Do not modify `CONTRACT_FROZEN` specs or Accepted ADRs.
- Do not implement `Deck`, `Slide`, compiler, render-safe components, player,
  validation runtime, or skills in Phase 0.
- Do not create production files under `packages/**/src/**`.
- Do not lock in final package names unless a frozen spec or ADR already does.
- Do not bypass git hooks or use destructive git commands.
- Do not publish to npm or push to `main` without explicit maintainer approval.

---

## 6. Success criteria

Phase 0 Builder bootstrap is done when:

- The verification commands in `AGENTS.md` are runnable, or explicitly documented
  as no-op where Phase 0 has no implementation yet.
- `pnpm format:check`, `pnpm spec:lint`, and `pnpm phase:check` are green.
- Markdown, shell formatting, YAML parsing, and `git diff --check` pass.
- Existing Claude Code hooks still behave as before.
- File-edit-sensitive rules are enforced by pre-commit or CI even if a Codex
  hook misses them.
- Codex hook support is either implemented for startup/Bash/stop guardrails or
  explicitly documented as deferred with the reason.
- Trace files record the infra state and remaining Phase 0 blockers.
- Phase 1 Builder can start with `prompt/PHASE1_KICK_BUILDER.md`.

---

## 7. When stuck

1. Re-read `AGENTS.md` §6 and `docs/agentic-workflow.md` §3.4.
2. Check `trace/phase0/tracker.md` for the latest operational convention.
3. Ask the maintainer one concrete question.
4. Never invent production architecture to satisfy an infra gate.
