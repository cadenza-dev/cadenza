---
description: "Run the cold-start onboarding checklist for a fresh Cadenza session"
argument-hint: ""
allowed-tools: Read
---

You are entering a Cadenza session with cold context. Run this onboarding checklist before taking any action. Do not skim; read each file.

1. Read `AGENTS.md` in full. Pay special attention to §2 Authority Order, §3 Roles, §4 Startup Protocol, and §7 Hard Constraints.
2. Read `STATUS.yaml` and note the `current_phase`.
3. Read `docs/adr/README.md` to see which architectural decisions are accepted.
4. Read `docs/analysis/analysis-final.en.md` §0 Executive Summary only (the top ~30 lines).
5. Locate your role's kick file at `prompt/PHASE<N>_KICK_<ROLE>.md` where `<N>` is the current phase. Read it if present; say so explicitly if it is absent.
6. If a kick file was present and spelled out a Read Order of its own, follow it.
7. Execute AGENTS.md §4 Startup Protocol:
   - Self-report your model and tool (be specific: `claude-opus-4-7` / `claude-code`, etc.)
   - Compare to §3's suggested mapping for the role you were launched as
   - **If mismatch or uncertain**, STOP and reply to the user: "I was launched as **<role>**. My detected identity is **<model>/<tool>**; AGENTS.md §3 suggests **<suggested-model>/<suggested-tool>**. Proceed as <role>? (y/n)"
   - Wait for explicit approval (`y`, `yes`, `proceed`) before any write.

Respond with a compact numbered summary:

- Files read and one-line takeaways
- Current phase, role, open batches (from tracker.md if readable)
- Startup Protocol self-report result
- A single concrete question if anything is unclear, or "ready to proceed pending user confirmation" if the match is clean

**Do not begin work yet.** Stop here and wait.
