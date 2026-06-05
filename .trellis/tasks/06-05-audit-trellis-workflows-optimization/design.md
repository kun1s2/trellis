# Design: Trellis workflow audit

## Scope / 边界

本任务产出分析与建议，不修改 Trellis runtime、skills、scripts、source code 或 generated templates。

审计对象包括：

- `.trellis/workflow.md`
- `.agents/skills/**/SKILL.md`
- `.agents/skills/**/references/**`
- `.trellis/scripts/**`
- `.trellis/spec/**`
- 当前 task artifacts 与可参考的历史 task artifacts
- 必要时参考 `.trellis/workspace/codex/external-repos/Trellis-Herbivore/**`

## Output Contract / 输出约定

最终报告保存为 `research/trellis-workflow-audit.md`，并在聊天中给用户摘要。

报告结构：

1. 高层结论：回答“三种模式?”，并解释 mode、phase、skill、state 不是同一层级。
2. 全部 workflow / phase / state 清单。
3. 全部核心 skill 功能清单：触发条件、特点、输入输出、优化机会。
4. task lifecycle / script 行为清单。
5. 关键分支与组合流程审视。
6. Mermaid 流程图。
7. 优化机会按优先级排序。
8. 假设、证据路径和开放问题。

## Evidence Rules / 证据规则

- 优先引用仓库文件事实，不凭记忆补 Trellis 行为。
- 对已读文件中的不一致、乱码、dead flow、重复规则、注入边界等问题，明确标为观察结果。
- 对未完整验证的推断，标为假设。
- 报告中的流程图必须能从 workflow/skill/script 证据推导。

## Mode Model / 模式模型

审计时采用四层模型，避免把概念混成一层：

- Collaboration mode：ordinary task、sub-agent dispatch、inline variant、Codex native Goal Mode bridge。
- Lifecycle phase：no_task、planning、in_progress、completed/archive。
- Skill router：start、continue、brainstorm、goal、architecture-shaping、grill、before-dev、check、break-loop、update-spec、finish-work、meta。
- Script/runtime substrate：task lifecycle、current-task pointer、context injection、spec discovery、journal/archive/commit support。

## Architecture Shaping Decision

Architecture Shaping: skipped, because this task is an analysis/report artifact and does not create modules, change runtime contracts, alter testability, or implement durable domain behavior. Architecture-related findings will be reported as optimization opportunities rather than applied changes.
