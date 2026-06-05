# Plan Trellis workflow step toggles

## Goal / 目标

深入理解最新 Trellis workflow、config、hook、template update 流程，规划哪些 workflow 步骤应该提供可开启/关闭的开关，并产出后续可实现的配置边界、默认策略和验证清单。

用户的核心动机是降低当前整体 workflow 的复杂度：让不同强度的使用者可以关闭、降级、合并或隐藏部分节点，而不是被迫每个 task 都完整走完所有 Trellis gates。

本 task 只做规划，不启动实现，也不升级或修复当前 checkout 里的本地 `.trellis/` 环境。用户后续会自行升级本环境的 Trellis。

## Confirmed Facts / 已确认事实

- `.trellis/workflow.md` 和 `packages/cli/src/templates/trellis/workflow.md` 当前都包含最新 native flow：`Architecture Shaping Decision`、`Grill Gate`、Goal Contract 路由、parent/child task trees、Codex inline/sub-agent 分流、Phase 3.3 spec update、Phase 3.4 commit。
- `workflow-state` breadcrumb 的正文只从 `.trellis/workflow.md` 的 `[workflow-state:STATUS]` blocks 读取；hook scripts 没有 fallback dict。相关 contract 在 `.trellis/spec/cli/backend/workflow-state-contract.md`。
- `codex.dispatch_mode` 已经是一个现有开关：missing/invalid 默认 `inline`，显式 `sub-agent` 才回到 legacy dispatch flow。Codex hook 还会注入 `<codex-mode>` banner。
- 最新本地 `.trellis/config.yaml` 和模板里的 Codex section 都是 commented default inline；`packages/cli/src/commands/codex.ts` 已移除 `codex.disabled_skills` / `codex.disabled_skill_paths` launcher override，不应把 skill exclusion 当作本次 workflow toggle 继续设计。
- `get_context.py --mode phase --platform codex` 会通过 `workflow_phase.resolve_effective_platform()` 映射到 `codex-inline` 或 `codex-sub-agent`；当前 inline 实测下 1.3 直接跳过 JSONL curation，2.1 走 `trellis-before-dev`。
- `task.py create` 仍会在检测到 sub-agent-capable 平台目录时 seed `implement.jsonl` / `check.jsonl`。因为 `.codex/` 目录存在，Codex inline 项目仍可能看到 JSONL 文件，即使当前流程不要求用户 curate 它们。
- `task.py start` 现在会跑 planning readiness validation：复杂任务缺 `Grill Gate` 或 `Architecture Shaping` decision 会阻止 start；轻量任务缺 `Grill Gate` 是 warning；seed-only JSONL 是 warning 而不是阻断。
- `/trellis:finish-work` 和 `trellis-finish-work` 仍只负责 archive + journal；Phase 3.4 work commit plan 是独立节点，不受 `session_auto_commit` 控制。
- `.trellis/config.yaml` 通过 simple YAML parser 读取，已支持 nested dict、list、string，以及少数 helper 里的 boolean/string alias。
- `trellis update` 对 `.trellis/workflow.md` 采用 whole-file hash-gated update；不能只 merge `[workflow-state:*]` blocks，因为 phase headings 和 platform marker blocks 也是 runtime input。
- `.trellis/config.yaml` 新 section 的升级路径是 migration manifest 的 `configSectionsAdded`，以 sentinel 追加，不覆盖用户已有配置。
- `task.py create` 负责写 `status=planning` 并在有 session identity 时设置 active-task pointer；`task.py start` 才把 status 翻到 `in_progress`。创建 task 不是开始实现的许可。

## Requirements / 需求

- 输出一份 workflow step toggle 规划，明确每类步骤属于：
  - 不可关闭的 hard invariant。
  - 可配置的 policy toggle。
  - 已存在或应扩展的 mode toggle。
  - 危险或高级开关，需要更严格命名、默认值或 guard。
- 第一阶段开关方向以“允许用户跳过某些 workflow nodes”为主，而不是先做完整强度档位系统。跳过的含义是：该 node 不再阻塞、不主动提示、不要求生成对应产物；需要审计时只留下简短 skipped 记录。
- 用户教育必须作为功能的一部分：不能只暴露一组 `workflow.skip.*` booleans。需要提供可发现的 config 注释、少量 preset、逐项说明、运行时解释和 docs-site 页面，帮助用户知道应该选哪种复杂度。
- 开关设计必须以降低用户感知复杂度为目标，优先考虑“隐藏提示、降级为建议、合并重复检查、按 task 复杂度触发”，而不是只暴露底层实现开关。
- 对每个候选开关说明推荐默认值、允许的配置值、影响范围和不推荐做成简单 boolean 的原因。
- 设计的配置入口应优先放在 `.trellis/config.yaml`，并保持 `.trellis/workflow.md` 仍是 workflow 文案和 phase/routing 的 source of truth。
- 避免第二事实来源：hook、`get_context.py --mode phase`、skills、agents 不能各自硬编码不同的开关语义。
- 规划必须覆盖 Codex 当前重点路径：`codex-inline` 与 `codex-sub-agent`，不主动扩展其他平台兼容范围。
- 后续实现必须遵守 `workflow-state` contract、`trellis update` whole-file workflow update contract、config section append contract、sub-agent recursion guard。

## Out of Scope / 不在范围

- 不在本 task 中实现开关。
- 不修改当前本地 `.trellis/workflow.md`、`.trellis/config.yaml` 或平台文件来升级本环境。
- 不设计跨平台统一 UX，除非该文件已影响 Codex 行为。
- 不提供“跳过所有质量检查”这类无 guard 的开关。
- 不改变 task lifecycle status writer table，除非后续 implementation 明确选择引入新 status 并同步更新 spec/tests。

## Acceptance Criteria / 验收标准

- [x] 已创建当前 planning task：`.trellis/tasks/06-05-trellis-workflow-step-toggles`。
- [x] `design.md` 给出 toggle taxonomy、推荐 config shape、runtime/update 边界和兼容策略。
- [x] `implement.md` 给出后续实现步骤、测试/验证命令、风险文件和 rollback points。
- [x] `research/architecture-shaping.md` 记录 architecture-shaping 分析和约束。
- [x] `implement.jsonl` / `check.jsonl` 已从 seed row 更新为真实 spec/research context。
- [x] 规划明确哪些步骤不应该提供关闭开关，哪些步骤适合开关，哪些只能做成 mode/depth 而不是 boolean。
- [x] 规划根据最新 Codex inline 默认重新排序，避免把 JSONL curation 和 removed skill exclusions 当作普通 Codex 用户的主要开关。
- [x] 规划明确本 task 不负责升级当前本地 Trellis 环境。

## Open User Decisions / 待用户决策

- 是否按 `design.md` 的 Phase A 推荐范围开始实现：先做 config schema、policy resolver、breadcrumb/phase policy 注入和 tests，再考虑更深的 UI/命令层开关。

## Planning Gates / 规划门

- Architecture Shaping: required; see `research/architecture-shaping.md`.
- Grill Gate: `trellis-grill-me required` before implementation, because toggle defaults会改变 Trellis 的产品策略和质量门槛；当前 artifacts 给出推荐答案，但是否接受这些默认值属于 user-owned product decision。
