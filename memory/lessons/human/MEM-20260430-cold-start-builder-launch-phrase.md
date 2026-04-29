---
id: MEM-20260430-cold-start-builder-launch-phrase
source: human
severity: medium
applies_to:
  - workflow
  - handoff
  - builder
  - wizard
status: active
superseded_by:
---

# Make Builder Launch Phrases Cold-Start Safe

## Trigger

When giving the maintainer a one-line restart phrase for the next Builder
session after a completed batch, especially after commit, push, or CI
confirmation.

## Lesson

Do not make the launch phrase so short that it depends on live chat context.
A safe Builder restart phrase should name:

- the role;
- the phase;
- the kick file;
- required skills;
- the exact next batch and scenario IDs;
- the one-vertical-slice boundary;
- the trace update and stop rule.

Prefer this shape:

```text
请作为 Cadenza Phase <N> Builder，读取 prompt/PHASE<N>_KICK_BUILDER.md，
加载 cadenza-builder 与 tdd skill，从 <batch> / <scenario IDs> 开始；
只完成这一条 vertical slice，更新 trace 后停止。
```

This remains concise while preserving enough routing information for a cold
agent session, post-compaction recovery, or IDE-only restart.

## Evidence

- After Phase 3 `B3.1` was committed and pushed, the maintainer asked whether
  the shorter phrase `继续 B3.2 / TC-AUTH-003 + TC-AUTH-004 + TC-DIAG-002 +
  TC-DIAG-003` was too terse because it omitted the Builder role, kick-file
  source, skill loading, and stop boundary.
- The accepted replacement was:
  `请作为 Cadenza Phase 3 Builder，读取 prompt/PHASE3_KICK_BUILDER.md，加载
  cadenza-builder 与 tdd skill，从 B3.2 / TC-AUTH-003 + TC-AUTH-004 +
  TC-DIAG-002 + TC-DIAG-003 开始；只完成这一条 vertical slice，更新 trace 后停止。`
