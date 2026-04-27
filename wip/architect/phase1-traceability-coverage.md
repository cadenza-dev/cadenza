# Phase 1 Traceability Coverage Follow-up

> Status: WIP planning note, not a contract.
> Source date: 2026-04-28.
> Source finding: `REV-P1-004` in
> `trace/phase1/review-phase1-closeout.md`.

## Finding Summary

The Phase 1 closeout reviewer found that `traceability_recorded: met` can be
overread because the current spec lint gate proves ID validity but does not
prove that every frozen requirement appears in the normative test matrix or has
implementation evidence.

## Why This Belongs to Architect Follow-up

This is primarily a governance and traceability-design issue:

- changing `spec/phase1/SPEC_TEST_MATRIX.md` would touch a frozen contract;
- changing spec lint semantics affects future phase governance;
- a richer coverage report should be designed before becoming a required gate.

It should not be bundled into the selected Phase 1 Builder remediation for
`REV-P1-001`, `REV-P1-002`, and `REV-P1-003`.

## Future Support

During the next Architect governance pass, consider adding a non-mutating
coverage report or stricter gate that compares requirement IDs across:

- domain specs under `spec/<phase>/`;
- `SPEC_TEST_MATRIX.md`;
- `SPEC_TRACEABILITY.md`;
- phase trace status;
- tests and implementation evidence.

If the frozen Phase 1 test matrix itself must be changed, get explicit
maintainer approval before editing the frozen spec.
