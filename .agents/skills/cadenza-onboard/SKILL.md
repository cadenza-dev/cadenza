---
name: cadenza-onboard
description: Run Cadenza's cold-start onboarding gate. Use this when the user explicitly invokes cadenza-onboard, asks to onboard a fresh Cadenza agent session, resumes after compaction, or needs the AGENTS.md startup protocol before doing project work.
---

# Cadenza Onboard

Use this skill as a command-like workflow. It prepares a cold Cadenza session and
then stops so the maintainer can confirm the next action.

## Workflow

1. Read `AGENTS.md` in full.
   Pay special attention to Authority Order, Roles, Startup Protocol, and Hard
   Constraints.
2. Read `STATUS.yaml` and record `current_phase`.
3. Read `docs/adr/README.md` and note accepted architectural decisions.
4. Read only section 0 of `docs/analysis/analysis-final.md`, the Executive
   Summary.
5. Locate the role kick file at `prompt/PHASE<N>_KICK_<ROLE>.md`, where `<N>`
   is the current phase and `<ROLE>` is the role the user launched or asked for.
   Read it if present. If it is absent, say so explicitly.
6. If the kick file has its own read order, follow it.
7. Execute `AGENTS.md` Startup Protocol:
   - Self-report your model and tool/harness.
   - Compare that identity to the suggested mapping for the launched role.
   - If the role is unclear, no kick file was used, or the identity differs,
     stop and ask the maintainer whether to proceed.
   - Wait for explicit approval before making any file edit or running any
     write tool.

## Response Shape

Return a compact numbered summary with:

- Files read and one-line takeaways.
- Current phase, role, and open batches if a tracker was read.
- Startup Protocol self-report result.
- One concrete question if anything is unclear, or "ready to proceed pending
  user confirmation" if the match is clean.

Do not begin the requested implementation after onboarding. Stop after the
summary and wait.
