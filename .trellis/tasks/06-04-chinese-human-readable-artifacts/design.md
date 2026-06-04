# 中文 human-readable artifacts 设计

## 目标边界

第一阶段只改变 Trellis 自动生成或要求 agent 生成的人类阅读材料。核心对象是 task planning / checking 产物：

- `prd.md`
- `design.md`
- `implement.md`
- agent 在 planning / execute / check 阶段写入的 Markdown 总结、检查结果或任务说明

不改变机器可读 contract：

- `task.json`
- `implement.jsonl`
- `check.jsonl`
- CLI 参数、status value、JSON key、文件名、symbol name

## 语言策略

默认输出语言是中文，但原始 English technical terms 保留英文。推荐形态：

- 中文句子承载解释和要求。
- 专有名词、文件名、命令、状态、API、symbol 使用原文，例如 `PRD`、`task`、`design.md`、`implement.md`、`Grill Gate`、`sub-agent`、`quality gate`。
- 对首次出现且可能有歧义的术语，可用“中文解释 + English term”的方式，但不强制翻译术语本身。

## 触点

Fast Context 和源码读取确认的初始触点：

- `packages/cli/src/templates/trellis/scripts/common/task_store.py`
  - `task.py create` 的默认 `prd.md` skeleton。
  - `task.py create` 后的下一步提示。
- `packages/cli/src/configurators/shared.ts`
  - Class-2 platform 的 pull-based prelude，指导 `trellis-implement` / `trellis-check` 读取 task artifacts。
  - 可补充 agent 输出语言约定，但不改变 active task 发现逻辑。
- `packages/cli/src/templates/trellis/workflow.md`
  - Workflow step 文本是长期参考文档，第一阶段不做全面中文化。
  - 只在必要时添加面向 agent 生成 artifact 的语言约定；如改动过大则留到后续任务。
- `packages/cli/src/commands/init.ts`
  - Bootstrap task skeleton 的 `prd.md` 仍需检查是否需要同步语言策略。

## 兼容性

- Markdown headings 可以中文化，但文件名、section intent 和验收项必须仍清楚对应 `Goal`、`Requirements`、`Acceptance Criteria` 等概念。
- 不修改 JSON / JSONL schema，因此 existing parsers 和 hooks 不需要迁移。
- Python 写入 Markdown 必须继续使用 `encoding="utf-8"`。
- Windows 验证应包含一次实际 `task.py create` smoke test 或等价测试，确认中文内容能读写。

## 验证策略

- 优先添加或更新覆盖 `task.py create` 的测试 / smoke test，断言默认 `prd.md` 包含中文提示和保留的 English technical terms。
- 对 agent prelude / template 文本改动，优先使用现有 template tests 或 snapshot-style assertions。
- 最后运行目标测试，再按风险选择 `pnpm typecheck` / `pnpm lint` / build。

## 取舍

- 不进行全仓文档中文化，避免把工作扩大到 docs-site、long-form workflow docs 和全部 bundled skills。
- 不为语言策略引入配置项；当前需求是魔改版默认行为，新增配置会扩大测试矩阵和维护成本。
- 不翻译机器 contract，避免破坏自动化和跨版本兼容。
