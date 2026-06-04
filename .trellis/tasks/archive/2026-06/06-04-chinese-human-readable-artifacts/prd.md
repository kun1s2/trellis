# Chinese human-readable Trellis artifacts

## Goal

让我们魔改版 Trellis 生成的面向人类阅读的产物默认使用中文，同时在中文材料中保留原始 English technical terms，避免把 `PRD`、`design.md`、`implement.md`、`task`、`workflow`、`Grill Gate`、`sub-agent` 等术语翻译到失真。

用户价值：中文读者可以直接理解 Trellis 任务、规划、检查和总结材料，而熟悉英文工具链术语的人仍能准确对应到代码、命令、文件名和流程概念。

## Confirmed Facts

- 用户明确希望“魔改的 Trellis 的那些给人类阅读的产物是中文的”。
- 用户明确要求“中文阅读材料里保留原英文术语”。
- 当前仓库的 task 创建逻辑会生成 `prd.md` 默认骨架，源码候选位置包括 `packages/cli/src/templates/trellis/scripts/common/task_store.py`。
- Trellis workflow 文档定义了人类阅读的 planning artifacts：`prd.md`、`design.md`、`implement.md`，以及 `implement.jsonl` / `check.jsonl` 这类机器/上下文 manifest。
- 部分 agent prelude / workflow 文本也会面向人类或 agent 阅读，候选位置包括 `packages/cli/src/templates/trellis/workflow.md` 和 `packages/cli/src/configurators/shared.ts`。

## Requirements

- 面向人类阅读的 Trellis 生成产物默认使用中文表达。
- 中文材料必须保留原始 English technical terms，尤其是：
  - 文件名、命令、状态值、JSON key、API name、package name、symbol name。
  - Trellis 专有术语和常用工作流术语，例如 `task`、`PRD`、`design.md`、`implement.md`、`workflow`、`Grill Gate`、`sub-agent`、`quality gate`。
- 机器可读格式保持稳定，不因为中文化改变 JSON schema、status value、CLI 参数、文件名或自动化解析契约。
- 修改范围应优先覆盖我们魔改版 Trellis 会自动生成或提示 agent 生成的人类阅读材料，而不是盲目翻译整个代码库。
- 生成材料必须保持 UTF-8，避免 Windows / PowerShell 中文乱码。
- 第一阶段 scope 已确认：覆盖 `task artifacts` 和 agent 会生成/要求生成的人类阅读材料，例如 `prd.md`、`design.md`、`implement.md`、检查总结类 Markdown；暂不做 `.trellis/workflow.md`、skills、`AGENTS.md` template 等长期参考文档的全面中文化。

## Acceptance Criteria

- [ ] 新建 task 时生成的默认 `prd.md` 骨架是中文说明，并保留 `prd.md`、`Requirements` / `Acceptance Criteria` 等必要英文术语或文件术语。
- [ ] 规划/执行/检查相关模板或 agent 指令明确要求：第一阶段 scope 内的人类阅读材料用中文书写，原始 English technical terms 保留英文。
- [ ] `implement.jsonl`、`check.jsonl`、`task.json` 等机器可读 artifact 的 schema、key、状态值和文件名不被中文化。
- [ ] 相关测试、snapshot 或最小 smoke test 能证明新建 task 的默认人类阅读材料符合中文输出策略。
- [ ] Windows 下读取/生成包含中文的 Markdown 时保持 UTF-8，不引入 GBK 依赖或乱码。

## Notes

- Fast Context 初步定位到以下候选实现/模板文件，需要后续源码验证后再改：
  - `packages/cli/src/templates/trellis/scripts/common/task_store.py`
  - `packages/cli/src/templates/trellis/workflow.md`
  - `packages/cli/src/configurators/shared.ts`
  - `packages/cli/src/commands/init.ts`
- 这个任务大概率不是 PRD-only。进入实现前应补充 `design.md` 和 `implement.md`，明确“人类阅读 material”和“机器可读 contract”的边界。

## Out of Scope

- 不翻译代码 symbol、CLI command、JSON key、status value、文件名或 package/API 名称。
- 不把第三方工具或官方英文术语强行译成中文。
- 不在本任务中完成全站文档或 docs-site 的大规模中文化，除非它们是 Trellis 自动生成产物策略的一部分。

## Open Questions

- None. 用户已确认第一阶段 scope：仅覆盖 `task artifacts` 和 agent 会生成/要求生成的人类阅读材料；暂不做长期参考文档全面中文化。

## Grill Gate

- `skip grill, because ...` - 用户已经确认第一阶段 scope，剩余工作是按已确认边界修改模板 / agent 指令并验证机器可读 contract 不变。无需继续进行产品偏好或兼容范围追问。
