# Audit Trellis workflows and optimization opportunities

## Goal / 目标

系统审视当前仓库中魔改后的 Trellis 工作流体系，完整列出全部 workflow、phase、skill、mode、branch 和关键脚本行为，逐个功能判断是否存在可优化点，并进一步审视多个功能/流程组合后的协作边界、冲突、重复、缺口和改进机会。

最终交付应使用中文说明，保留 English technical terms，并包含可读的流程图。流程图优先使用 Mermaid；只有在 Mermaid 不足以表达或用户另行要求视觉化海报/插图时，才考虑 AI 生图。

## Raw User Request / 原始请求

用户先提出：

> 详细 完整列出魔改后的trellis的全部工作流,以及它的全部流程分支,说明特点,并绘制对应流程图(如果需要ai生图就使用,也可以不用ai生图)

随后补充：

> 一共有三种模式?普通 子agent goal?

并指定参考：

> [$trellis-brainstorm](D:\\IdeaProjects\\trellis-plus\\.agents\\skills\\trellis-brainstorm\\SKILL.md) [$trellis-goal](D:\\IdeaProjects\\trellis-plus\\.agents\\skills\\trellis-goal\\SKILL.md) 去审视全部功能,逐个功能审视判断是否可以优化,后续多个功能 流程一起审视,判断是否可以优化,总之就是全方面审视但也要仔细

## Confirmed Facts / 已确认事实

- 当前任务路径：`.trellis/tasks/06-05-audit-trellis-workflows-optimization`。
- 当前 Trellis 状态：`planning`。
- `trellis-start` 已加载；当前没有把该请求升级为 Codex native Goal Mode，因为用户没有显式请求 `/goal`、unattended execution 或 long-running autonomous execution。
- 用户已经同意创建 Trellis task 并进入 planning。
- 当前仓库有大量未提交改动，审计必须避免误改或回滚非本任务文件。
- 已确认主要 skill 入口至少包括：
  - `trellis-start`
  - `trellis-continue`
  - `trellis-brainstorm`
  - `trellis-goal`
  - `trellis-architecture-shaping`
  - `trellis-grill-me`
  - `trellis-grill-agents`
  - `trellis-before-dev`
  - `trellis-check`
  - `trellis-break-loop`
  - `trellis-update-spec`
  - `trellis-finish-work`
  - `trellis-meta`
  - `trellis-spec-bootstarp`
  - plus project/non-core skills such as `contribute`, `first-principles-thinking`, `python-design`, `ts-sdk-author`
- `.trellis/workflow.md` is the canonical workflow-state and phase guide source. It defines at least:
  - Phase 1 Plan
  - Phase 2 Execute
  - Phase 3 Finish
  - `workflow-state:no_task`
  - `workflow-state:planning`
  - `workflow-state:planning-inline`
  - `workflow-state:in_progress`
  - `workflow-state:in_progress-inline`
  - `workflow-state:completed` currently marked as effectively dead in the normal archive flow.

## Requirements / 需求

- 输出一份完整中文审计报告，覆盖当前魔改 Trellis 的全部可见 workflow 和功能面。
- 明确回答用户的“三种模式”问题：普通 Trellis flow、sub-agent flow、Codex native Goal Mode bridge 是否成立，以及它们和 phase/skill 的关系。
- 逐个审视核心 skill、workflow-state、phase step、task lifecycle script、context/spec injection、parent/child task、Grill Gate、Architecture Shaping、Goal Contract、finish/commit/archive 等功能，判断特点和优化机会。
- 审视多个功能组合后的流程分支，例如：
  - no_task -> planning -> start -> in_progress -> check -> spec update -> commit -> finish/archive
  - planning-inline vs planning sub-agent
  - in_progress-inline vs in_progress sub-agent
  - ordinary task vs Goal Contract task
  - lightweight PRD-only task vs complex task
  - user Grill vs agent Grill
  - parent/child task trees
  - rollback to Plan / repeated debugging / spec update
- 每个优化建议需要说明：
  - 涉及的功能或流程组合
  - 现状特点
  - 风险或摩擦点
  - 可选优化方向
  - 优先级或收益判断
- 绘制对应流程图，优先 Mermaid，可包含：
  - 总览模式图
  - phase/lifecycle 图
  - routing/branch 图
  - Goal Mode bridge 图
  - sub-agent vs inline 图
- 审计必须基于仓库证据：`.trellis/workflow.md`、`.agents/skills/**/SKILL.md`、`.agents/skills/**/references/**`、`.trellis/scripts/**`、`.trellis/spec/**`、相关 task artifacts 和外部 Trellis-Herbivore 参考材料（若需要）。
- 不直接修改业务/source code。若发现可实施优化，先作为报告建议列出，除非用户后续明确要求进入 implementation。

## Out of Scope / 非目标

- 本任务不直接重构 Trellis workflow、skills 或 scripts。
- 本任务不启动 Codex native Goal Mode。
- 本任务不承诺 AI 生图；流程图用 Mermaid 即可满足可读、可维护和可复制需求。
- 不清理或提交当前仓库中已有的 129 个未提交改动，除非它们是本审计任务的 artifact。

## Acceptance Criteria / 验收标准

- [x] `research/` 中保存证据驱动的审计材料或最终报告草稿，不能只留在聊天记录中。
- [x] 报告列出所有核心 workflow/mode/phase/state/skill/script 功能，并说明它们的触发条件、输入、输出和特点。
- [x] 报告明确区分 ordinary Trellis task、sub-agent dispatch、Codex native Goal Mode bridge、inline variant 之间的关系。
- [x] 报告覆盖逐个功能审视和跨功能组合审视。
- [x] 报告包含 Mermaid 流程图。
- [x] 报告包含优化机会清单，并按优先级或影响面排序。
- [x] 对无法从仓库证据确认的结论标明假设或开放问题。
- [x] 规划完成后，在用户批准前不运行 `task.py start`。

## Open Questions / 开放问题

- 用户后续是否希望把审计报告中的优化建议拆分成 implementation tasks。当前任务只交付审计报告和建议。
