# Phase 7+ CLI Diagnostics Candidates

> Status: WIP planning note, not a contract.
> Source date: 2026-05-29.

These candidates came from Phase 6 Stage A CLI research and maintainer
brainstorming. Phase 6 recommends human output by default, stable `--json`
command summaries, structured export evidence, deterministic exit codes, and
non-interactive no-prompt behavior. The items below are intentionally deferred:
future Architects must promote them into a phase spec before Builder treats
them as requirements.

## JSONL Diagnostic Event Stream

- **Source**: Phase 6 Stage A comparison against Remotion CLI's internal
  structured render progress and `skills.sh` JSON command output patterns.
- **Phase 6 disposition**: defer. Phase 6 should expose stable `--json` command
  summaries and evidence files, not a streaming protocol.
- **Future support**: reconsider JSONL events when Cadenza has a long-running
  Player App workflow, hosted render queue, IDE integration, or agent workflow
  that needs incremental progress, cancellation, or live diagnostics.
- **Reason to defer**: JSONL is a public protocol once documented. Freezing it
  before local export semantics settle would make early render progress fields
  harder to revise.

## One Exit Code Per Diagnostic Category

- **Source**: Phase 6 `FC-CDIA-02`.
- **Phase 6 disposition**: use a small typed taxonomy for usage, deck loading
  or validation, export or renderer, environment, and internal failures.
- **Future support**: expand to one shell exit code per diagnostic category if
  downstream automation proves that diagnostic JSON is insufficient.
- **Reason to defer**: very granular shell APIs are brittle across terminals,
  package managers, and future command families. The diagnostic record should
  carry most routing detail first.

## Generated Command Evidence In Documentation

- **Source**: Phase 6 `FC-CDOC-02`.
- **Phase 6 disposition**: document expected commands, output paths, and
  manifest and per-format evidence fields; verify behavior through tests.
  Do not make long generated command transcripts or refreshed logs normative
  documentation artifacts in Phase 6.
- **Future support**: add generated command-evidence snippets refreshed by
  tests if local export docs start drifting from actual command behavior.
- **Reason to defer**: generated docs evidence adds maintenance cost and can
  make documentation harder to read while Phase 6 command text is still
  settling.

## Interactive Prompt Layer

- **Source**: `skills.sh` uses interactive selection in human contexts and
  no-prompt behavior in agent or non-TTY contexts.
- **Phase 6 disposition**: define deterministic no-prompt behavior for non-TTY,
  CI, and agent contexts; do not freeze an interactive prompt framework.
- **Future support**: add interactive deck selection, format selection, or
  scaffold prompts after command semantics and deck discovery are stable.
- **Reason to defer**: prompts are ergonomic sugar. Phase 6 needs reliable local
  export, validation, diagnostics, and evidence before introducing an
  interactive UI layer.
