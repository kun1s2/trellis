# Design: Trellis workflow step toggles

## Architecture Shaping

Architecture Shaping: required; see `research/architecture-shaping.md`.

## Summary / 结论

开关不应该直接做成“把 workflow.md 的某段删掉”。最新 Trellis flow 的运行时入口分散在三类读者：

- `workflow-state` hook 读取 `[workflow-state:STATUS]` blocks。
- `get_context.py --mode phase` / `workflow_phase.py` 读取 phase headings、step headings 和 platform marker blocks。
- skills / agents 读取 task artifacts、JSONL manifests 和 injected context。

因此推荐做法是增加一个统一的 `workflow_policy` 解析层，把 `.trellis/config.yaml` 里的开关解析成稳定 policy，再由 breadcrumb、phase context 和后续 skill/agent 文案读取同一个 policy。`workflow.md` 仍保留 source of truth 地位，只把可配置步骤表述成“default policy + config override”，不生成多份 workflow variants。

## Latest Flow Reassessment / 最新流程复核

用户最新修改后，Codex 主路径已经比早先方案更简单：

- `codex.dispatch_mode` missing/invalid 默认 `inline`。per-turn hook 注入 `<codex-mode>inline...do not dispatch implement/check sub-agents</codex-mode>`，`workflow_phase.py` 把 `--platform codex` 映射到 `codex-inline`。
- Codex inline 的 Phase 1.3 已经跳过 JSONL curation；Phase 2.1 直接要求主会话加载 `trellis-before-dev`，读 `prd.md` / `design.md` / `implement.md` / relevant specs 后实现。
- `packages/cli/src/commands/codex.ts` 已移除 launcher 层 skill exclusion override，所以本次不再设计 `codex.disabled_skills` 之类开关。
- `task.py start` 已经把 planning readiness validation 做成真实 gate：复杂任务缺 `Grill Gate` / `Architecture Shaping` 会阻止 start，JSONL seed-only 只是 warning。
- `finish-work` 仍是 archive + journal；work commit plan 留在 Phase 3.4。这是用户能明显感到繁琐的独立节点，适合做 finish policy。

因此最新排序应从“减少用户能看见的节点”出发：先处理 small-task Trellis prompt、Architecture Shaping / Grill Gate / complex artifacts、JSONL 文件可见性、重复 quality check、spec/commit/finish ceremony。JSONL curation 只保留为 sub-agent mode 的次级 policy。

用户当前第一阶段方向是“让用户可以跳过 workflow 的某些 nodes”。这里的 skip 不是删除 lifecycle，也不是让 AI 静默绕过安全边界，而是：

- 该 node 不再阻塞进入下一步。
- 该 node 不主动打断用户。
- 该 node 不要求生成对应 artifact。
- 如果后续审计需要，只记录一行 `skipped by workflow.skip...`，而不是展开完整流程。

## Toggle Taxonomy / 开关分类

### UX principle / 用户复杂度原则

这批开关的目标不是让用户拆掉 Trellis 的安全边界，而是减少每个 task 暴露给用户的节点数量。优先级如下：

1. 能自动判断的节点，默认自动判断，必要时只提示结果。
2. 能从 required 降级为 advisory 的节点，提供 mode，而不是只给 boolean。
3. 能和相邻步骤合并的节点，提供 merge mode。
4. 只有偏好性、成本高、不会破坏 task integrity 的节点，才提供 true `off`。

### A. Hard invariants, no toggle

这些规则不提供关闭开关，只能优化文案或错误提示：

| Step / Rule | Reason |
|---|---|
| No active task 时先 triage，并在创建 Trellis task 前取得用户同意 | 防止 AI 擅自创建长期状态；`workflow-state:no_task` regression 明确保护。 |
| `task.py create` 不等于 implementation approval；必须 `task.py start` 后才能进入 implementation | `planning -> in_progress` 是核心 lifecycle boundary。 |
| `task.json.status` writer table 和 breadcrumb reachability contract | 新 status writer 会影响每 turn routing，不能用普通开关绕过。 |
| `.trellis/workflow.md` 是 breadcrumb body source of truth，无 fallback dict | 这是防 drift 的 runtime contract。 |
| Sub-agent recursion guard | 历史上 Codex sub-agent 递归/自等待是高风险 bug，不能关闭。 |
| 不覆盖用户本地修改、`trellis update` hash-gated protection | 保护用户数据，不是流程偏好。 |
| `after_finish` 不代表 completed，完成应以 `after_archive` 为准 | lifecycle event semantics，不能由 workflow 开关改写。 |
| 禁止无 guard 地跳过所有 quality checks | 质量门槛只能调整 depth 或合并步骤，不能静默关闭。 |

### B. Skip-first toggles, recommended for Phase A

这些适合作为第一阶段“跳过节点”开关；按当前 Codex inline 用户最可能感到繁琐的顺序排列：

| Skip node | Recommended default | Config | Reason |
|---|---|---|---|
| Small-task Trellis prompt | not skipped | `skip.small_task_prompt: true` | 明显小任务直接完成，不再问“要不要创建 Trellis task”。仍然不允许无 consent 创建 task。 |
| Architecture Shaping node | not skipped | `skip.architecture_shaping: true` | 省掉 `research/architecture-shaping.md` 和 trigger decision；适合个人/低风险项目。风险是跨模块设计少一层保护。 |
| Grill Gate node | not skipped | `skip.grill_gate: true` | 省掉 attended/proxy grill 以及 `trellis-grill-*` artifact hardening；适合需求已很明确的任务。风险是隐藏 user-owned decision。 |
| Complex artifact node | not skipped | `skip.complex_artifacts: true` | 复杂任务也可 PRD-only，不强制 `design.md` / `implement.md`。这是降低 planning ceremony 最大的一刀，但不适合 Goal/high-risk tasks。 |
| Research artifact node | not skipped | `skip.research_artifacts: true` | 允许 research 只留在当前会话或最终摘要，不强制写 `research/*.md`。风险是 compaction 后证据丢失。 |
| Parent/child suggestion node | skipped for simple tasks | `skip.task_tree_suggestions: true` | 不再主动建议 parent/child，避免大任务树吓人；不改变已存在 task tree。 |
| Context manifest node | skipped in Codex inline | `skip.context_manifests: true` | 不生成/不要求 `implement.jsonl` / `check.jsonl`；Codex inline 不需要，sub-agent mode 应默认不跳过。 |
| Phase 3.1 final verification node | merge by default | `skip.final_verification: true` | 跳过独立 3.1，只信任最近一次 2.2 check。风险是 commit 前少一次全局回看；建议只有同一 diff 刚检查过才允许。 |
| Phase 3.3 spec update node | not skipped | `skip.spec_update: true` | 不再要求走 `trellis-update-spec` 判断。适合一次性项目；风险是长期知识不沉淀。 |
| Phase 3.4 commit plan node | not skipped | `skip.commit_plan: true` | 不再生成 batched commit plan，只提醒用户可自行 commit。风险是 finish-work 前可能还会因 dirty worktree 被挡。 |
| finish-work archive/journal node | reminder only | `skip.finish_work: true` | 不主动 archive/journal，只在最后提醒。风险是 active task 和 journal 积压。 |
| Debug retrospective node | skipped unless explicit | `skip.debug_retrospective: true` | 不主动触发 `trellis-break-loop`。风险是重复 bug 的经验不固化。 |
| Goal bridge node | not skipped for explicit `/goal` | `skip.goal_bridge: true` | 明确关闭 Trellis-to-Codex native Goal bridge；用户仍可做普通 Trellis task。 |

Phase A 不建议把 `quality_check` 做成 `skip.quality_check`。如果用户需要轻量化，先做 `quality_check_depth: smoke` 或 `skip.final_verification`；完整关闭质量检查会破坏 Trellis 最基本的完成可信度。

### C. Existing / adjacent mode toggles

| Existing knob | Keep / extend |
|---|---|
| `codex.dispatch_mode: inline | sub-agent` | 保留。它已经决定 Codex 用 `planning-inline` / `in_progress-inline` 还是 plain tags。 |
| `session_auto_commit: true | false` | 已存在，只控制 journal/archive auto-commit，不应混同 Phase 3.4 work commit。 |
| `channel.worker_guard.*` | 已存在，不属于 workflow step toggle。 |
| `update.skip` | update pipeline 已支持，和 workflow policy 不合并。 |

## Proposed Config Shape / 推荐配置形状

第一阶段推荐把跳过节点集中在 `workflow.skip`，避免和现有 top-level knobs 混杂。后续需要更细颗粒度时，再补 `workflow.policy` depth/mode。

但用户不应该从 15 个 boolean 开始学。配置表面应分两层：

1. `workflow.preset` 是用户入口，适合说明书、CLI help、docs-site 和首次配置。
2. `workflow.skip` 是高级 override，用来覆盖 preset 中的某个节点。

```yaml
workflow:
  # Presets:
  # - full: keep the current Trellis workflow.
  # - balanced: skip common ceremony but keep planning/check/finish guardrails.
  # - lean: skip most planning/finish ceremony; keep task lifecycle and minimum checks.
  # - manual: no preset; use workflow.skip values exactly.
  preset: balanced

  skip:
    small_task_prompt: false
    architecture_shaping: false
    grill_gate: false
    complex_artifacts: false
    research_artifacts: false
    task_tree_suggestions: true
    context_manifests: false
    final_verification: false
    spec_update: false
    commit_plan: false
    finish_work: false
    debug_retrospective: true
    goal_bridge: false
```

设计原则：

- Phase A 用 boolean skip，名称必须对应 workflow node，用户不需要理解内部档位。
- `workflow.preset` 先给普通用户可选路径，`workflow.skip` 只作为 override。
- Missing/invalid value 使用 safe default，并在可见上下文里给 warning 或 policy banner，而不是静默进入危险状态。
- `.trellis/config.yaml` 的 template 只放 commented section；existing projects 通过 migration manifest 的 `configSectionsAdded` 追加。
- 后续如果想做 UI switch，可以直接映射这些 skip boolean；更细的 depth/mode 留到 Phase B。

## User Education / 用户说明书设计

说明书要避免“配置大全”味道。推荐四层入口：

| Surface | What user sees | Why |
|---|---|---|
| `.trellis/config.yaml` commented block | 3-4 个 presets + 5 个最常用 skip 示例 | 用户真正会打开的地方；能复制就能用。 |
| `trellis workflow presets` or `trellis config explain workflow` | 输出 preset 差异表和当前有效 skip | 不要求用户去 docs-site；也方便 AI 解释当前配置。 |
| Runtime `<workflow-skip>` / warning block | “Skipped: grill_gate, complex_artifacts. Still required: task consent, task.py start, user-change protection.” | 用户看到 AI 为什么没走某节点，降低“是不是坏了”的疑惑。 |
| docs-site guide | “选择你的 Trellis 工作流强度” + presets + 每个 skip 的风险表 | 深入解释和团队 onboarding。 |

### Recommended Presets

| Preset | Intended user | Skips |
|---|---|---|
| `full` | 团队、长期项目、严格审计 | none by default |
| `balanced` | 默认推荐；想减少仪式但保留质量 | small-task prompt, task-tree suggestions, debug retrospective; merge/skip duplicate final verification when recent check exists |
| `lean` | 个人快速迭代 | architecture shaping, grill gate, complex artifacts, research artifacts, context manifests, spec update, commit plan, finish-work reminder only |
| `manual` | 高级用户 | 不套 preset，只读取显式 `workflow.skip` |

### Config Comment Copy

`config.yaml` 里不应该粘完整长表，建议只放这个短块：

```yaml
#-------------------------------------------------------------------------------
# Workflow Skip Preset
#-------------------------------------------------------------------------------
# Choose how much Trellis ceremony to skip.
# full     = current strict workflow
# balanced = recommended; fewer prompts, keeps core guardrails
# lean     = fast personal workflow, skips most planning/finish ceremony
# manual   = ignore presets; use workflow.skip below exactly
#
# workflow:
#   preset: balanced
#   skip:
#     grill_gate: true          # skip Phase 1 Grill Gate
#     complex_artifacts: true   # allow PRD-only tasks
#     spec_update: true         # skip Phase 3.3 spec review
```

### Runtime Explanation

每次注入 skip state 时，除了机器可读值，还应有一句人话：

```text
<workflow-skip>
preset=balanced
skipped=small_task_prompt, task_tree_suggestions, debug_retrospective
still_required=task_creation_consent, task.py_start_before_implementation, user_change_protection, at_least_minimum_verification
</workflow-skip>
```

这样用户不用读说明书也能知道：哪些节点被跳过，哪些底线还在。

## Runtime Boundaries / 运行边界

### Single resolver

新增一个 workflow skip resolver，作为唯一解释器：

- Python runtime：`.trellis/scripts/common/workflow_policy.py` 或合并到 `common/config.py`，供 `get_context.py`、`workflow_phase.py`、hooks、task validation 读取。
- Shared hook：`inject-workflow-state.py` 通过 `.trellis/scripts/common/trellis_config.py` 或同等轻量 helper 读取同一 skip view。
- TypeScript side：只负责 template/default/migration tests，不在 `update.ts` 里重新解释 skip 语义。

### Injection strategy

建议让 hook 和 phase context 都注入同一个短块：

```text
<workflow-skip>
architecture_shaping=false
grill_gate=false
complex_artifacts=false
...
</workflow-skip>
```

然后调整 native `workflow.md` 中可配置步骤的 wording：

- hard invariants 继续写绝对规则。
- configurable nodes 写“if workflow.skip.<node> is true, skip this node and continue to the next applicable step”。

这样不会生成多份 workflow.md，也不会让 phase detail 和 per-turn breadcrumb 各说各话。

## Update / Compatibility Strategy

- `.trellis/config.yaml` 新 section 走 migration manifest `configSectionsAdded`，sentinel 建议用 `workflow:` 或 `workflow.skip:`；若用户已有 `workflow:`，实现时要避免重复追加冲突，可能需要更窄 sentinel 和文档提示。
- `.trellis/workflow.md` 仍走 whole-file managed template update。不要做 partial merge。
- 改 breadcrumb contract 时必须更新 `.trellis/spec/cli/backend/workflow-state-contract.md` 和 regression tests。
- 改 `get_context.py --mode phase` 输出时必须验证 `--platform codex`、`codex-inline`、`codex-sub-agent`。
- 最新本地 checkout 和模板的 `.trellis/config.yaml` 都是 commented Codex default inline。用户明确表示本 task 不负责升级其他环境里的 generated Trellis 文件。

## Recommended Implementation Slice

Phase A 只实现以下最小可用闭环：

- `workflow.skip` parser + safe defaults。
- `<workflow-skip>` 注入到 Codex hook 和 `get_context.py --mode phase`。
- Native `workflow.md` wording 更新，让 skippable nodes 可被 config override。
- Tests 覆盖 config parse、missing/invalid fallback、Codex inline/sub-agent routing、phase context injection。
- 优先包含 `small_task_prompt`、planning 三件套、`context_manifests`、`final_verification`、`spec_update` / `commit_plan` / `finish_work`。

Phase B 再考虑：

- 更友好的 `trellis config` / `trellis workflow policy` 命令。
- UI-style switch 文档。
- 对非 Codex 平台的文案同步。

## Risks

- 最大风险是第二事实来源：某个 hook 读了 config，但 skill 或 phase detail 仍按旧规则执行。
- 第二风险是把 hard invariant 做成开关，例如关闭 task creation consent 或 sub-agent recursion guard。
- 第三风险是 `workflow.md` update 方式被误改成 partial merge，重现历史 platform marker drift。

## Open Decision

实现前需要用户确认：Phase A 是否采用 `workflow.skip` boolean 作为用户开关主界面，并把 depth/mode 留到 Phase B。
