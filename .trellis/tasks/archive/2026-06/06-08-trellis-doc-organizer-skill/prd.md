# Add Trellis doc organizer skill

## Goal / 目标

新增一个 Codex-only 的 `trellis-doc-organizer` skill，用于原地整理 Trellis task/spec/research 文档，让后续 agent 用更少上下文读到更准确、更新、更有权威归属的信息。

这个 skill 的目标不是创建新的 summary 文档，也不是做 Markdown 美化；它要把现有 AI-facing artifacts 恢复到各自职责，减少重复事实源和历史文档误导。

## Problem / 问题

用户在实际 Trellis 项目中观察到：`.trellis/spec/`、task 的 `prd.md`、`design.md`、`implement.md`、`research/*.md` 之间容易出现事实源漂移和重复维护。

典型症状包括：

- `prd.md`、`design.md`、`implement.md` 反复记录同一批产品决策，导致 PRD 里有设计细节，design 里有 execution checklist，implement 里又重复产品愿景。
- 多个 `research/*.md` 讨论同一主题，但没有明确哪个是当前 canonical source。
- task 中沉淀出的长期规则被提升到 `.trellis/spec/` 后，task 文档没有同步缩短，形成 task/spec 双事实源。
- 旧 prompt、旧 concept、旧 research 仍可被后续 agent 搜到，并可能被误认为当前方向。
- 为了让后续 agent 理解任务，必须加载大量历史 research，增加上下文成本并降低准确性。

## Confirmed Scope / 已确认范围

- 首版只做 Codex 支持。原因：本仓库当前按 Codex 专用魔改版维护，且用户明确选择“先 Codex”。
- 产物是一个可被 Codex 自动触发或显式调用的 skill。
- skill 默认只整理原有 Trellis 文档，不新增 `agent-context-brief.md`、独立 source map 或新的文档层。
- 如需表达 source ownership，应优先原地写入现有 `prd.md`、`design.md`、`implement.md` 或对应 `research/*.md` 顶部状态说明。
- 源文档默认不删除；过时或被合并的文档应被降权为 `historical`、`superseded` 或 pointer。
- 这不是 `trellis-update-spec` 的替代品；长期规则写入 `.trellis/spec/` 仍归 `trellis-update-spec` / `trellis-spec-bootstarp`。

## Requirements / 需求

- 新增 `trellis-doc-organizer` skill，说明何时触发、如何整理、如何避免新增第二上下文层。
- skill 必须指导 agent 先判断是否真的需要整理；小任务、无重复、无漂移时不应触发。
- skill 必须定义 Trellis 文档职责边界：
  - `.trellis/spec/`：长期项目规则和开发约定。
  - `prd.md`：当前 task 的目标、范围、约束、验收。
  - `design.md`：当前 task 的稳定设计边界、关键决策、取舍。
  - `implement.md`：执行步骤、验证命令、gate、rollback。
  - `research/*.md`：专题证据、探索、备选方案、历史记录。
  - `.trellis/workspace/`：会话日志，不作为产品或实现事实源。
- skill 必须指导 agent 原地整理：
  - 把 task 文档里的长期规则缩短为对 `.trellis/spec/` 的引用。
  - 把重复产品范围集中回 `prd.md`。
  - 把重复设计边界集中回 `design.md`。
  - 把重复执行计划集中回 `implement.md`。
  - 把重复 research 中的非 canonical 文件改成 pointer 或标记为 `historical` / `superseded`。
- skill 必须明确后续 agent 如何消费整理后的文档：按原 Trellis 顺序读 task artifacts 和 curated specs/research，而不是优先读新增 summary。
- skill 必须明确不应做的事：
  - 不默认新增 summary/source-map 文件。
  - 不把所有内容合并成一个大文档。
  - 不删除源 research 证据。
  - 不把 task-specific requirement 提升进 `.trellis/spec/`。
  - 不替代 `trellis-update-spec`、`trellis-spec-bootstarp`、`trellis-check`。
- Codex `init/update` 路径应能写入并跟踪这个 skill，避免升级后缺失。

## Out of Scope / 非目标

- 不做全平台 skill 分发。
- 不新增 CLI 命令或自动扫描器。
- 不实现语义相似度检测或文档重写程序。
- 不修改其他平台的 skills、agents、hooks、commands。
- 不为已有外部项目实际整理文档；本 task 只新增 Trellis 能力。

## Acceptance Criteria / 验收标准

- [ ] Codex 初始化或更新模板包含 `trellis-doc-organizer` skill。
- [ ] skill 的 description 能覆盖显式请求和语义症状触发，例如“整理当前 task 文档”“减少后续 agent 上下文”“task/spec 重复”“research 历史方向误导”。
- [ ] skill 正文清楚定义触发条件、跳过条件、文档职责边界、原地整理流程、源文档处理方式和后续 agent 消费方式。
- [ ] skill 明确首版 Codex-only，不要求其他平台同步。
- [ ] 对 Codex template tracking 添加或更新测试，证明 `trellis update` 会追踪该 skill。
- [ ] 相关测试通过，至少覆盖新增 skill 文件存在和关键语义内容。
- [ ] 不新增默认 summary/source-map 文件作为 skill 产物要求。

## Planning Decisions / 规划决策

- Scope decision: 首版 Codex-only，后续如需全平台化再开 follow-up。
- Artifact strategy: 默认原地整理现有 artifacts，不新增 agent brief/source-map 层。
- Source document strategy: 保留源文档，使用 `historical` / `superseded` / pointer 降权。

## Open Questions / 待决问题

无阻塞性用户问题。实现前仍需完成 `design.md`、`implement.md` 和 required planning gates。
