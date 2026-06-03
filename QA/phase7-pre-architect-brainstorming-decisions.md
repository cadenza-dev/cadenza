# Phase 7 Pre-Architect Brainstorming Decisions

> Status: living QA decision log, not a contract.
> Date: 2026-06-03.
> Companion topic map:
> [phase7-pre-architect-brainstorming-topics.md](./phase7-pre-architect-brainstorming-topics.md).

本文件用于记录 Phase 7 pre-Architect brainstorming 过程中已经达成共识的决策。
每个 topic 的“核心问题、可行解决方案、利弊、建议讨论方式”不在这里重复展开；
对应背景请回到
[topic map](./phase7-pre-architect-brainstorming-topics.md)。

使用方式：

- 每讨论完一个 topic，就更新本文件对应 section。
- 未讨论的 topic 保持 `Status: pending`。
- 如果讨论结果还不足以形成决策，标为 `Status: open` 并记录 blocking question。
- 如果共识足以进入 Phase 7 Architect Stage A，标为 `Status: decided`，并记录
  Stage A implications。
- 本文件不冻结 contract；未来 `spec/phase7/`、ADR、prompt、trace 才是正式
  workflow artifacts。

## Decision Summary

| Order | Topic | Decision Status | Topic Reference |
| :---- | :---- | :---- | :---- |
| 1 | Alpha claim boundary and audience promise | pending | [Topic 1](./phase7-pre-architect-brainstorming-topics.md#1-alpha-claim-boundary-and-audience-promise) |
| 2 | Phase 7 success slice and non-goals | pending | [Topic 2](./phase7-pre-architect-brainstorming-topics.md#2-phase-7-success-slice-and-non-goals) |
| 3 | Player App role and UI / App Design direction | pending | [Topic 3](./phase7-pre-architect-brainstorming-topics.md#3-player-app-role-and-ui--app-design-direction) |
| 4 | Player App package boundary and `preview-remotion` transition | pending | [Topic 4](./phase7-pre-architect-brainstorming-topics.md#4-player-app-package-boundary-and-preview-remotion-transition) |
| 5 | Visual-fidelity export posture | pending | [Topic 5](./phase7-pre-architect-brainstorming-topics.md#5-visual-fidelity-export-posture) |
| 6 | App-based web export and bundler contract | pending | [Topic 6](./phase7-pre-architect-brainstorming-topics.md#6-app-based-web-export-and-bundler-contract) |
| 7 | CLI install, invocation, and pure JSON path | pending | [Topic 7](./phase7-pre-architect-brainstorming-topics.md#7-cli-install-invocation-and-pure-json-path) |
| 8 | Canonical deck identity, starters, and demo material | pending | [Topic 8](./phase7-pre-architect-brainstorming-topics.md#8-canonical-deck-identity-starters-and-demo-material) |
| 9 | Diagnostics, readiness, and progress model | pending | [Topic 9](./phase7-pre-architect-brainstorming-topics.md#9-diagnostics-readiness-and-progress-model) |
| 10 | Evidence gates and visual regression strategy | pending | [Topic 10](./phase7-pre-architect-brainstorming-topics.md#10-evidence-gates-and-visual-regression-strategy) |
| 11 | Config surface expansion | pending | [Topic 11](./phase7-pre-architect-brainstorming-topics.md#11-config-surface-expansion) |
| 12 | Fresh-project dogfood harness | pending | [Topic 12](./phase7-pre-architect-brainstorming-topics.md#12-fresh-project-dogfood-harness) |

## 1. Alpha Claim Boundary And Audience Promise

- Topic reference:
  [Alpha claim boundary and audience promise](./phase7-pre-architect-brainstorming-topics.md#1-alpha-claim-boundary-and-audience-promise)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: What alpha posture should Phase 7 target before public
  wording is allowed?
- Updated: not yet discussed.

## 2. Phase 7 Success Slice And Non-Goals

- Topic reference:
  [Phase 7 success slice and non-goals](./phase7-pre-architect-brainstorming-topics.md#2-phase-7-success-slice-and-non-goals)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: Which capabilities are required for Phase 7 completion,
  and which remain explicit non-goals?
- Updated: not yet discussed.

## 3. Player App Role And UI / App Design Direction

- Topic reference:
  [Player App role and UI / App Design direction](./phase7-pre-architect-brainstorming-topics.md#3-player-app-role-and-ui--app-design-direction)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: What should the Player App's first product surface make
  developers trust immediately?
- Updated: not yet discussed.

## 4. Player App Package Boundary And `preview-remotion` Transition

- Topic reference:
  [Player App package boundary and preview-remotion transition](./phase7-pre-architect-brainstorming-topics.md#4-player-app-package-boundary-and-preview-remotion-transition)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: Should Phase 7 introduce a product-facing player package,
  and when should `preview-remotion` shrink to an adapter role?
- Updated: not yet discussed.

## 5. Visual-Fidelity Export Posture

- Topic reference:
  [Visual-fidelity export posture](./phase7-pre-architect-brainstorming-topics.md#5-visual-fidelity-export-posture)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: Must Phase 7 web and MP4 outputs use the Player App or a
  Player App-equivalent visual route?
- Updated: not yet discussed.

## 6. App-Based Web Export And Bundler Contract

- Topic reference:
  [App-based web export and bundler contract](./phase7-pre-architect-brainstorming-topics.md#6-app-based-web-export-and-bundler-contract)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: What artifact contract replaces Phase 6 static web
  compatibility as the preferred web export?
- Updated: not yet discussed.

## 7. CLI Install, Invocation, And Pure JSON Path

- Topic reference:
  [CLI install, invocation, and pure JSON path](./phase7-pre-architect-brainstorming-topics.md#7-cli-install-invocation-and-pure-json-path)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: What command path should humans and agents use so JSON
  output is not polluted by package-manager banners?
- Updated: not yet discussed.

## 8. Canonical Deck Identity, Starters, And Demo Material

- Topic reference:
  [Canonical deck identity, starters, and demo material](./phase7-pre-architect-brainstorming-topics.md#8-canonical-deck-identity-starters-and-demo-material)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: Which deck or starter should be the first public Cadenza
  example, and where should its identity come from?
- Updated: not yet discussed.

## 9. Diagnostics, Readiness, And Progress Model

- Topic reference:
  [Diagnostics, readiness, and progress model](./phase7-pre-architect-brainstorming-topics.md#9-diagnostics-readiness-and-progress-model)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: Should Player App, CLI, export evidence, and agent repair
  share one diagnostics/readiness vocabulary?
- Updated: not yet discussed.

## 10. Evidence Gates And Visual Regression Strategy

- Topic reference:
  [Evidence gates and visual regression strategy](./phase7-pre-architect-brainstorming-topics.md#10-evidence-gates-and-visual-regression-strategy)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: What evidence is strong enough to support the Phase 7
  alpha claim without creating brittle cross-platform gates?
- Updated: not yet discussed.

## 11. Config Surface Expansion

- Topic reference:
  [Config surface expansion](./phase7-pre-architect-brainstorming-topics.md#11-config-surface-expansion)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: Which config keys are truly necessary for Phase 7 alpha,
  and which should stay deferred?
- Updated: not yet discussed.

## 12. Fresh-Project Dogfood Harness

- Topic reference:
  [Fresh-project dogfood harness](./phase7-pre-architect-brainstorming-topics.md#12-fresh-project-dogfood-harness)
- Status: pending
- Consensus decision: pending discussion.
- Rationale: pending discussion.
- Stage A implications: pending discussion.
- Blocking question: Does Phase 7 require a dogfood run outside the Cadenza
  monorepo before any public alpha claim?
- Updated: not yet discussed.
