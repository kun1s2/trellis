# 实施计划

## Context

- 用户目标：新的 Trellis 项目文档默认中文；术语、文件名、命令、API、JSON key、status value 等保留原语言。
- `prd.md` 已确认验收标准。
- `design.md` 已确认模板源头、dogfood 副本和 marketplace scope。
- `research/architecture-shaping.md` 已记录模板边界和测试面。

## Checklist

- [ ] 读取实现前相关 spec：
  - `.trellis/spec/cli/backend/platform-integration.md`
  - `.trellis/spec/cli/backend/configurator-shared.md`（若改 `shared.ts`）
  - `.trellis/spec/cli/backend/quality-guidelines.md`
  - `.trellis/spec/cli/unit-test/conventions.md`
  - `.trellis/spec/guides/code-reuse-thinking-guide.md`
  - `.trellis/spec/guides/cross-platform-thinking-guide.md`
- [ ] 更新 `packages/cli/src/commands/init.ts`：
  - `getBootstrapChecklistItems()` checklist 文案中文化，保留 spec / frontend / backend / package name 等 terms。
  - `getBootstrapPrdContent()` 中文化 bootstrap task 文案、表格说明、runtime explainer、suggested opening line。
  - `getJoinerPrdContent()` 中文化 joiner onboarding task 文案。
  - 保持 `task.json` title / status / schema contract 不变，除非有明确必要。
- [ ] 更新 `packages/cli/src/templates/markdown/agents.md`：
  - 在 managed block 中加入默认中文交流 / 人类可读 Trellis 文档中文策略。
  - 明确 technical terms 保留原语言。
- [ ] 更新 `packages/cli/src/templates/markdown/workspace-index.md`：
  - 替换旧 English language rule。
  - 如必要，轻量中文化关键说明，不要求全文翻译。
- [ ] 更新内置 spec scaffold：
  - `packages/cli/src/templates/markdown/spec/backend/index.md.txt`
  - `packages/cli/src/templates/markdown/spec/frontend/index.md.txt`
  - 扫描同目录其他 `.md.txt`，修正冲突 language rule。
- [ ] 更新新项目可见的 workflow / shared guidance：
  - 检查 `packages/cli/src/templates/trellis/workflow.md` 是否需要增加 human-readable language policy。
  - 检查 `packages/cli/src/configurators/shared.ts` wording 是否与新策略一致。
  - 扫描 `packages/cli/src/templates/common/**`，只修正与输出语言冲突的规则。
- [ ] 更新 marketplace spec templates：
  - 扫描 `marketplace/specs/**` 中 `All documentation should/must be written in English` / `All documentation is written in English`。
  - 将 language rule 改为中文默认 + English technical terms 原语言。
  - 不做无关全文翻译。
- [ ] 视情况同步本仓 dogfood copies：
  - `.trellis/spec/**/index.md`
  - `.trellis/workspace/index.md`
  - 仅当它们作为当前项目规则会干扰后续 Codex 工作时同步。
- [ ] 更新测试：
  - `packages/cli/test/commands/init.integration.test.ts` 增加默认 init 输出语言策略断言。
  - 更新 monorepo bootstrap task 断言，匹配中文 checklist。
  - `packages/cli/test/regression.test.ts` 或合适 test file 增加 template export / marketplace language-rule guard。
- [ ] 运行验证：
  - `pnpm --dir packages/cli test test/commands/init.integration.test.ts`
  - `pnpm --dir packages/cli test test/regression.test.ts`（如有改动）
  - `pnpm --dir packages/cli typecheck`
  - `pnpm --dir packages/cli lint`
  - `git diff --check`
- [ ] 最终 diff 自查：
  - 没有机器 contract 中文化。
  - 没有隐藏 fallback / 新配置开关。
  - 没有盲目全仓翻译造成 docs-site / bilingual docs 语义错误。

## Validation Notes

- Windows / PowerShell 下运行测试前如涉及 Python / 中文读取，设置 `$env:PYTHONUTF8='1'`。
- 测试读取 Markdown 时使用 UTF-8；不要用默认编码判断中文内容。
- 对 marketplace 扫描要限定到 `marketplace/specs/**`，不要扫含历史 task / session 的目录。

## Rollback Points

- 如果 workflow / skill 全文中文化造成过大 diff，回退到只增加明确 language policy。
- 如果 marketplace 修改量过大，保留内置 template + init 生成链路为本任务主交付，把 marketplace full cleanup 拆为 follow-up；但必须在最终报告里说明该风险。
- 如果测试运行时间过长，优先保留目标 init integration 和 source-level language-rule guard。

## Grill Gate

- `skip grill, because ...` - 用户已确认目标和术语保留策略；implementation 是按 PRD / design 修改模板源头和验证新项目输出，不需要继续进行产品决策访谈。
