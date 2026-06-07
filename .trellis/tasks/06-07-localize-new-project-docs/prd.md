# Localize new Trellis project docs

## Goal / 目标

让新的 Trellis 项目在 `trellis init` 后生成的人类可读文档默认使用中文表达，同时保留原始 English technical terms，避免把 file name、command、API name、JSON key、status value、symbol name 或 Trellis 专有术语翻译到失真。

用户价值：中文用户第一次初始化 Trellis 项目后，看到的 bootstrap task、`.trellis/spec/` scaffold、`.trellis/workspace/` 说明、`AGENTS.md` managed block、核心 workflow / skill 引导都能直接阅读和继续维护；熟悉工具链的人仍能准确对应 `PRD`、`task`、`workflow`、`sub-agent`、`implement.jsonl`、`check.jsonl` 等原始概念。

## Confirmed Facts / 已确认事实

- 用户明确需要“新的 Trellis 项目的文档是汉化的”。
- 用户明确补充“术语之类的可以保留原语言”。
- 之前的 `06-04-chinese-human-readable-artifacts` task 只覆盖了 `task.py create` 的默认 `prd.md` skeleton 和 class-2 pull-based prelude，没有覆盖 `trellis init` 生成的新项目文档体系。
- 当前 `trellis init` bootstrap task 文案仍在 `packages/cli/src/commands/init.ts` 中以 English 输出。
- 当前内置 blank spec scaffold 的 `backend/index.md.txt` 和 `frontend/index.md.txt` 仍写着 `All documentation should be written in English`。
- 当前 `packages/cli/src/templates/markdown/workspace-index.md` 仍写着 `All documentation must be written in English`。
- `trellis init --template` / marketplace spec template 下载路径会把 marketplace specs 带进新项目；本仓 `marketplace/specs/**` 里也有大量 English language rule。
- 本仓当前按 Codex 专用魔改版维护；除共享文件会影响 Codex 体验外，不默认为其他平台做全面同步。

## Requirements / 需求

- 新项目由 `trellis init` 生成或引导填写的人类可读 Trellis 文档默认使用中文表达。
- 中文材料必须保留原始 English technical terms，包括但不限于：
  - 文件名、路径、命令、CLI 参数、status value、JSON key、API name、package name、symbol name、framework / library 名称。
  - Trellis 专有术语，例如 `PRD`、`task`、`workflow`、`Grill Gate`、`sub-agent`、`quality gate`、`implement.jsonl`、`check.jsonl`、`task.json`。
- 机器可读 contract 不中文化：`task.json`、`implement.jsonl`、`check.jsonl`、schema key、status value、CLI argument、file name 和 parser contract 必须保持稳定。
- 覆盖 `trellis init` 的内置 blank scaffold：bootstrap task、`.trellis/spec/` index / language rules、`.trellis/workspace/index.md`、`AGENTS.md` managed block，以及新项目可见的核心 Trellis workflow / skill guidance 中与文档语言相关的规则。
- 覆盖本仓维护的 marketplace spec templates 的 language rule，至少避免通过 `trellis init --template` 生成的新项目继续被明确要求写 English。
- 不做第三方/历史平台全量翻译；非 Codex 平台专有文档只有在共享模板或新项目通用文档链路中影响 Codex / Trellis 默认体验时才修改。
- 保持 UTF-8 文本读写，Windows / PowerShell 下不引入乱码。

## Acceptance Criteria / 验收标准

- [x] 运行默认 `trellis init` 的新项目中，bootstrap task 的 `prd.md` 使用中文说明，并保留 `trellis init`、`.trellis/spec/`、`trellis-implement`、`trellis-check`、`implement.jsonl`、`check.jsonl` 等 English technical terms。
- [x] 默认 `trellis init` 生成的 `.trellis/spec/backend/index.md`、`.trellis/spec/frontend/index.md`、`.trellis/workspace/index.md` 不再包含要求通用文档写 English 的 language rule，而是明确“默认中文表达，保留 English technical terms”。
- [x] 新项目生成的 `AGENTS.md` managed block 或等效项目级 instruction 明确默认使用中文与用户交流 / 编写人类可读 Trellis 文档，同时保留 technical terms 原语言。
- [x] 新项目可见的核心 workflow / skill guidance 不与上述语言策略冲突；如果保留 English long-form reference text，必须至少有明确的中文输出策略约束。
- [x] 本仓维护的 marketplace spec templates 不再通过 language rule 要求新项目文档统一写 English；如暂不翻译全文，也必须把 language rule 改为中文默认 + technical terms 原语言。
- [x] 机器可读 artifact 和 contract 不变：`task.json`、`implement.jsonl`、`check.jsonl`、schema keys、status values、CLI arguments、filenames 不被中文化。
- [x] 测试或 deterministic check 覆盖默认 init 输出中的关键语言规则，并防止 `All documentation should/must be written in English` 这类通用 Trellis 文档规则重新进入内置新项目模板。
- [x] Windows 下目标验证使用 UTF-8 读取/断言中文，不出现 mojibake。

## Out of Scope / 非目标

- 不翻译代码 symbol、命令、文件名、status value、JSON key、schema 或 parser contract。
- 不把所有长期参考文档逐句翻译成中文；本任务优先保证新项目生成物的语言规则和用户可见启动文档正确。
- 不默认维护 Claude、Cursor、OpenCode、Gemini、Qoder、Copilot、Pi 等非 Codex 平台专有体验，除非相关文件是共享模板或直接影响 Codex 魔改版。
- 不引入可配置的 language selector；当前需求是魔改版默认行为。

## Open Questions / 开放问题

- None. 用户已确认目标语言策略：新 Trellis 项目文档默认中文，术语保留原语言。

## Architecture Shaping

- `Architecture Shaping: required; see research/architecture-shaping.md.`

## Grill Gate

- `skip grill, because ...` - 用户已明确产品意图和语言策略，剩余工作是按已确认范围修改新项目生成模板、共享 guidance 和验证链路；没有悬而未决的偏好 / 兼容性 / 数据安全决策需要继续追问。
