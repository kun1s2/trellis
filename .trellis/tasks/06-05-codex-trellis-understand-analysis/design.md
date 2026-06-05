# Technical Design

## Project Detection

- 根目录 `package.json` 使用 `pnpm@10.32.1`，脚本通过 `pnpm --filter psymoth-core` 和 `pnpm --filter psymoth` 操作 core/cli packages。
- `packages/core/` 和 `packages/cli/` 是主要 TypeScript source package。
- `.trellis/` 保存 workflow、spec、task、workspace；`.agents/skills/` 保存项目级 Trellis skills；`.codex/` 保存 Codex agents、hooks、skills 和配置。
- 根级 `AGENTS.md` 指定当前仓库按 Codex 专用魔改版维护，默认不主动维护非 Codex 平台。

## Relevant Files

- `.understand-anything/.understandignore`: UA 扫描排除规则。
- `.understand-anything/knowledge-graph.json`: UA interactive knowledge graph 输出。
- `analysis/codex-trellis-understand/README.md`: 分析目录入口。
- `analysis/codex-trellis-understand/scope-and-exclusions.md`: 本次分析范围与排除说明。
- `analysis/codex-trellis-understand/architecture-map.md`: 图谱摘要、层级、主模块和关系。
- `analysis/codex-trellis-understand/codex-customization-notes.md`: Codex 魔改重点、入口、风险和阅读路线。
- `.trellis/tasks/06-05-codex-trellis-understand-analysis/implement.md`: native goal 检查点和证据。

## Technical Boundary

- UA graph 生成使用 understand-anything skill 的本地插件和脚本，输出保存在仓库 `.understand-anything/`。
- `.understandignore` 先约束扫描范围，避免依赖、历史任务、workspace journal、缓存和非 Codex 本地平台目录污染主图谱。
- 分析目录从 UA graph、scan result、真实仓库文件和 root README/manifest 综合生成；结论必须能追溯到文件或命令输出。
- 本任务不修改 `packages/`、`.agents/skills/`、`.codex/`、`.trellis/spec/` 或 `docs-site/` 内既有实现文件。

## Verification Commands

- `Get-Command node, pnpm`: 确认 UA 插件所需 runtime。
- `pnpm --filter @understand-anything/core build`: 确认 UA core 可 build。
- `node D:\Users\Kun\.understand-anything\repo\understand-anything-plugin\skills\understand\scan-project.mjs D:\IdeaProjects\trellis-plus`: 生成/验证 UA scan inventory。
- `node D:\Users\Kun\.understand-anything\repo\understand-anything-plugin\skills\understand\compute-batches.mjs D:\IdeaProjects\trellis-plus`: 验证 UA batch 构造。
- `node <validation script>` 或等价 one-off JSON parse: 验证 `.understand-anything/knowledge-graph.json` 有 `nodes`、`edges`、`layers`、`tour`。
- `git status --short -- .understand-anything analysis .trellis/tasks/06-05-codex-trellis-understand-analysis`: 确认变更范围。

## Risks

- UA skill 的完整 7 阶段流程在部分平台依赖专用 analyzer subagents；如果当前环境无法直接调用这些 agent，需要用 UA 本地脚本和可审计 synthesis 产出等价图谱，并记录限制。
- 排除范围过宽可能漏掉主体文件；通过检查 scan result 和 graph node path 是否覆盖 `packages/core`、`packages/cli`、`.codex`、`.agents/skills` 缓解。
- 仓库已有大量未提交改动；通过限定 path 和最终 diff review 避免混入用户改动。

## Rollback Notes

- 删除本次新增的 `analysis/codex-trellis-understand/` 可撤销分析目录。
- 删除或回滚 `.understand-anything/` 本次新增/更新文件可撤销 UA 产物。
- Trellis task artifacts 保留为审计记录；除非用户明确要求，不删除 task。

## Grill Gate

- Decision: skip grill, because the task is read-only analysis plus new artifact creation, the user explicitly approved task creation, and the remaining choices are low-risk defaults recorded in `prd.md`.
