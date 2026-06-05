# Design: Trellis workflow step toggles

## Architecture Shaping

Architecture Shaping: required; see `research/architecture-shaping.md`.

## Summary / 结论

开关不应该直接做成“把 workflow.md 的某段删掉”。最新 Trellis flow 的运行时入口分散在三类读者：

- `workflow-state` hook 读取 `[workflow-state:STATUS]` blocks。
- `get_context.py --mode phase` / `workflow_phase.py` 读取 phase headings、step headings 和 platform marker blocks。
- skills / agents 读取 task artifacts、JSONL manifests 和 injected context。

因此推荐做法是增加一个统一的 `workflow_policy` 解析层，把 `.trellis/config.yaml` 里的开关解析成稳定 policy，再由 breadcrumb、phase context 和后续 skill/agent 文案读取同一个 policy。`workflow.md` 仍保留 source of truth 地位，只把可配置步骤表述成“default policy + config override”，不生成多份 workflow variants。

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

### B. Policy toggles, recommended

这些适合给用户开关或 mode：

| Policy | Recommended default | Values | Notes |
|---|---|---|---|
| Architecture Shaping gate | `required` | `required`, `advisory`, `off` | `off` 只适合小型个人项目；默认继续保护 long-lived Trellis projects。 |
| Grill Gate | `required` | `required`, `advisory`, `off` | `required` 仍允许记录 `skip grill, because ...`，不是强制每次都问用户。 |
| Complex planning artifacts | `required` | `required`, `recommended`, `prd-only` | 控制 complex task 是否必须有 `design.md` + `implement.md`。 |
| Research artifact persistence | `when-researched` | `required-for-complex`, `when-researched`, `off` | 不建议关闭“已做 research 必须落盘”的原则；`off` 仅关闭额外强制 research。 |
| Parent/child task suggestion | `suggest` | `off`, `suggest`, `aggressive` | 只影响 AI 主动建议，不改变 task tree semantics。 |
| Sub-agent JSONL curation | `recommended` | `required`, `recommended`, `off` | Codex inline 自动等价 `off`；sub-agent mode 可保留 `recommended`，因为 agents 已有 fallback。 |
| Final quality verification | `required` | `required`, `merge-with-check` | 不建议 `off`。`merge-with-check` 表示 Phase 2.2 足够新且覆盖同一 diff 时可合并。 |
| Spec update review | `required` | `required`, `ask`, `off` | 即使不写 spec，也应有可见判断；`off` 明确跳过 Phase 3.3。 |
| Work commit planning | `required-plan` | `required-plan`, `reminder`, `off` | 不自动 commit；只控制 Phase 3.4 是否要求生成 commit plan。 |
| Debug retrospective | `on-demand` | `on-demand`, `off` | 关闭后不再主动触发 `trellis-break-loop`。 |
| Goal mode routing | `enabled` | `enabled`, `disabled` | 只影响明确 `/goal` / native Goal Mode request，不影响普通 tasks。 |

### C. Existing / adjacent mode toggles

| Existing knob | Keep / extend |
|---|---|
| `codex.dispatch_mode: inline | sub-agent` | 保留。它已经决定 Codex 用 `planning-inline` / `in_progress-inline` 还是 plain tags。 |
| `session_auto_commit: true | false` | 已存在，只控制 journal/archive auto-commit，不应混同 Phase 3.4 work commit。 |
| `channel.worker_guard.*` | 已存在，不属于 workflow step toggle。 |
| `update.skip` | update pipeline 已支持，和 workflow policy 不合并。 |

## Proposed Config Shape / 推荐配置形状

推荐把新配置集中在 `workflow.policy`，避免和现有 top-level knobs 混杂：

```yaml
workflow:
  policy:
    planning:
      architecture_shaping: required        # required | advisory | off
      grill_gate: required                  # required | advisory | off
      complex_artifacts: required           # required | recommended | prd-only
      research_persistence: when-researched # required-for-complex | when-researched | off
      task_tree_suggestions: suggest        # off | suggest | aggressive
    context:
      subagent_jsonl: recommended           # required | recommended | off
    execution:
      final_quality_verification: required  # required | merge-with-check
      debug_retrospective: on-demand        # on-demand | off
    finish:
      spec_update_review: required          # required | ask | off
      work_commit_plan: required-plan       # required-plan | reminder | off
    goal:
      enabled: true
```

设计原则：

- 优先用 named modes，不把所有东西压成 boolean。`off` 的含义必须可读、可测试。
- Missing/invalid value 使用 conservative default，并在可见上下文里给 warning 或 policy banner，而不是静默进入危险状态。
- `.trellis/config.yaml` 的 template 只放 commented section；existing projects 通过 migration manifest 的 `configSectionsAdded` 追加。
- 后续如果想做 UI switch，可以把 mode 简化显示为 on/off，但底层 config 仍保留 mode。

## Runtime Boundaries / 运行边界

### Single resolver

新增一个 policy resolver，作为唯一解释器：

- Python runtime：`.trellis/scripts/common/workflow_policy.py` 或合并到 `common/config.py`，供 `get_context.py`、`workflow_phase.py`、hooks 读取。
- Shared hook：`inject-workflow-state.py` 通过 `.trellis/scripts/common/trellis_config.py` 或同等轻量 helper 读取同一 policy。
- TypeScript side：只负责 template/default/migration tests，不在 `update.ts` 里重新解释 policy。

### Injection strategy

建议让 hook 和 phase context 都注入同一个短块：

```text
<workflow-policy>
architecture_shaping=required
grill_gate=required
complex_artifacts=required
...
</workflow-policy>
```

然后调整 native `workflow.md` 中可配置步骤的 wording：

- hard invariants 继续写绝对规则。
- policy steps 写“default: required; if workflow.policy.* changes this, follow the injected workflow-policy block”。

这样不会生成多份 workflow.md，也不会让 phase detail 和 per-turn breadcrumb 各说各话。

## Update / Compatibility Strategy

- `.trellis/config.yaml` 新 section 走 migration manifest `configSectionsAdded`，sentinel 建议用 `workflow:` 或 `workflow.policy:`；若用户已有 `workflow:`，实现时要避免重复追加冲突，可能需要更窄 sentinel 和文档提示。
- `.trellis/workflow.md` 仍走 whole-file managed template update。不要做 partial merge。
- 改 breadcrumb contract 时必须更新 `.trellis/spec/cli/backend/workflow-state-contract.md` 和 regression tests。
- 改 `get_context.py --mode phase` 输出时必须验证 `--platform codex`、`codex-inline`、`codex-sub-agent`。
- 现有本地 checkout 的 `.trellis/config.yaml` 还写着 `codex.dispatch_mode: sub-agent`，模板默认是 commented inline。此 drift 是用户明确排除的本 task 范围。

## Recommended Implementation Slice

Phase A 只实现以下最小可用闭环：

- `workflow.policy` parser + conservative defaults。
- `<workflow-policy>` 注入到 Codex hook 和 `get_context.py --mode phase`。
- Native `workflow.md` wording 更新，让 policy steps 可被 config override。
- Tests 覆盖 config parse、missing/invalid fallback、Codex inline/sub-agent routing、phase context injection。

Phase B 再考虑：

- 更友好的 `trellis config` / `trellis workflow policy` 命令。
- UI-style switch 文档。
- 对非 Codex 平台的文案同步。

## Risks

- 最大风险是第二事实来源：某个 hook 读了 config，但 skill 或 phase detail 仍按旧规则执行。
- 第二风险是把 hard invariant 做成开关，例如关闭 task creation consent 或 sub-agent recursion guard。
- 第三风险是 `workflow.md` update 方式被误改成 partial merge，重现历史 platform marker drift。

## Open Decision

实现前需要用户确认：是否接受本设计的 conservative defaults，尤其是 `Architecture Shaping`、`Grill Gate`、`complex_artifacts` 默认仍为 `required`。
