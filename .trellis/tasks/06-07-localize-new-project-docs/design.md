# 新 Trellis 项目文档汉化设计

## 目标边界

本任务修改“新项目生成链路”的人类可读文档策略，而不是做全仓逐句翻译。核心目标是：`trellis init` 之后，新项目中指导用户和 AI 继续维护 Trellis 的默认文档使用中文表达，并保留 English technical terms。

优先级从高到低：

1. `trellis init` 直接写入新项目的 root / `.trellis/` 文档。
2. `trellis init` 创建的 bootstrap / joiner onboarding task 内容。
3. 新项目默认加载的 workflow / skill / agent guidance 中与“输出语言”和“文档语言”有关的规则。
4. `trellis init --template` 可能写入新项目的 marketplace spec language rule。

## 语言策略

默认输出语言是中文，但原始 English technical terms 保留英文。

应该中文化：

- 说明性句子、协作提示、bootstrap task 文案、journal / workspace 说明、spec 填写说明、验收项。
- 新项目初始化后用户和 agent 会读到的“如何填写/维护 Trellis 文档”的指导。

必须保留原语言：

- file name、path、command、CLI argument、status value、JSON key、API name、package name、symbol name、framework / library 名称。
- Trellis 专有术语，例如 `PRD`、`task`、`workflow`、`Grill Gate`、`sub-agent`、`quality gate`、`task.json`、`implement.jsonl`、`check.jsonl`。

必须保持不变：

- `task.json` / JSONL schema。
- status values、CLI args、filenames、hash ownership、template update / uninstall contract。

## 代码与模板触点

### Init task generation

- `packages/cli/src/commands/init.ts`
  - `getBootstrapChecklistItems()` 生成 bootstrap checklist 文案。
  - `getBootstrapPrdContent()` 生成 `00-bootstrap-guidelines/prd.md`。
  - `getJoinerPrdContent()` 生成 joiner onboarding `prd.md`。
  - 这些是新项目启动时最直接的人类可读文档，必须中文化。

### Markdown scaffold source

- `packages/cli/src/templates/markdown/agents.md`
  - 生成新项目 `AGENTS.md` managed block。
  - 应加入默认中文交流 / 文档策略，保留 English technical terms。
- `packages/cli/src/templates/markdown/workspace-index.md`
  - 生成 `.trellis/workspace/index.md`。
  - 当前 `Language` rule 要求 English，必须改。
- `packages/cli/src/templates/markdown/spec/backend/index.md.txt`
- `packages/cli/src/templates/markdown/spec/frontend/index.md.txt`
  - 默认 blank spec scaffold 的入口，必须改 language rule。
- `packages/cli/src/templates/markdown/spec/*/*.md.txt`
  - 需要扫描是否还有强制 English 或与语言策略冲突的说明。

### Workflow / skill / agent guidance

- `packages/cli/src/templates/trellis/workflow.md`
  - 新项目会直接生成 `.trellis/workflow.md`。
  - 可以不逐句翻译全文件，但不应与中文默认策略冲突；若全文暂留 English，需要添加明确的 human-readable output language rule。
- `packages/cli/src/configurators/shared.ts`
  - 已有 class-2 pull-based prelude 的 artifact language rule。
  - 需要确认 wording 与新项目全局策略一致。
- `packages/cli/src/templates/common/**`
  - 共享 skill / command 模板会写进多个平台，Codex 也会使用；应扫描并修正会要求 English 输出的人类可读文档规则。

### Marketplace spec templates

- `marketplace/specs/**`
  - `trellis init --template` 可下载 marketplace spec，导致新项目继续携带 English language rule。
  - 本任务至少修改 language rule，不要求翻译每一篇模板正文。
  - 如果 marketplace 是 submodule 或独立发布链路，最终报告需说明是否需要额外提交 / 同步。

### Dogfood copies

- 当前仓库 `.trellis/spec/**`、`.trellis/workspace/index.md` 是本项目已生成后的 dogfood 副本，不是新项目模板源头。
- 这些文件可作为本仓自用一致性同步，但不能替代修改 `packages/cli/src/templates/**`。

## 兼容性与 update contract

- 修改 template text 会改变 hash-tracked 文件；这是预期行为。
- 不新增 language config，避免扩大 init / update / migration 测试矩阵。
- 不修改 template path、managed file path、JSON schema 或 status value。
- 对 marketplace spec 只改 language rule 可以保持目录结构和下载流程不变。

## 测试与验证设计

优先补集成 / regression 检查，而不是只靠文本搜索：

- 更新 `packages/cli/test/commands/init.integration.test.ts`：
  - 默认 init 后读取 bootstrap task `prd.md`，断言包含中文语言策略和关键 English technical terms。
  - 默认 init 后读取 `.trellis/spec/backend/index.md`、`.trellis/spec/frontend/index.md`、`.trellis/workspace/index.md`、`AGENTS.md`，断言不含通用 `written in English` language rule，且包含中文默认策略。
  - monorepo bootstrap task 仍保留 per-package spec paths 和 archive commands。
- 更新或新增 regression test：
  - 针对 template exports 检查 `workspaceIndexContent`、`backendIndexContent`、`frontendIndexContent` 没有旧 English language rule。
  - 对 marketplace spec templates 可用 deterministic file scan 脚本或 Vitest 断言，限制 `All documentation should/must be written in English` 这类规则残留。
- 运行目标测试，再运行 `pnpm --dir packages/cli typecheck`、`pnpm --dir packages/cli lint`。

## 风险与取舍

- 风险：只改当前 `.trellis/` dogfood 文件会让本仓看起来中文，但新用户 init 仍是英文。缓解：优先改 source templates。
- 风险：大规模全文翻译 workflow / skills 会造成 review 噪声和跨平台 drift。缓解：本任务先收口语言规则和新项目启动文档，保留 technical terms。
- 风险：marketplace spec 与 CLI 主包可能有不同发布节奏。缓解：单独列出 marketplace 修改和验证；如需要额外发布，最终报告说明。

## Architecture Shaping Decision

Architecture Shaping: required; see research/architecture-shaping.md.
