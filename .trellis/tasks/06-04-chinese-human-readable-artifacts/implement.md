# 实施计划

## Context

- `prd.md` 已确认第一阶段 scope：覆盖 `task artifacts` 和 agent 会生成/要求生成的人类阅读材料。
- `design.md` 记录了语言策略：中文表达 + 保留原始 English technical terms。

## Checklist

- [x] 读取相关 spec：
  - `.trellis/spec/cli/backend/script-conventions.md`
  - `.trellis/spec/cli/backend/configurator-shared.md`
  - `.trellis/spec/cli/backend/workflow-state-contract.md`
  - `.trellis/spec/cli/unit-test/conventions.md`
  - `.trellis/spec/guides/code-reuse-thinking-guide.md`
  - `.trellis/spec/guides/cross-platform-thinking-guide.md`
- [x] 尝试按 GitNexus 规则运行 `gitnexus_impact`；当前环境无该命令，改用 fallback evidence（见 Implementation Notes）。
- [x] 修改 `task.py create` 默认 `prd.md` skeleton，使新建 task 的人类阅读说明为中文，同时保留 `Goal`、`Requirements`、`Acceptance Criteria`、`task`、`prd.md` 等 English terms。
- [x] 检查并按 scope 更新 agent 指令 / prelude，使 agent 生成 `prd.md`、`design.md`、`implement.md`、check summary 等人类阅读 Markdown 时默认中文表达并保留 English technical terms。
- [x] 确认 `task.json`、`implement.jsonl`、`check.jsonl` schema / key / status value 未改变。
- [x] 添加或更新测试：
  - 新建 task 的默认 `prd.md` 含中文提示。
  - 默认 `prd.md` 保留关键 English technical terms。
  - JSONL seed / task JSON 机器字段保持不变。
- [x] 运行目标测试。
- [x] 运行适用的 lint / typecheck / build 验证。
- [x] 尝试运行 `gitnexus_detect_changes()`；当前环境无该命令，改用 fallback evidence（见 Implementation Notes）。

## Implementation Notes

- `Get-Command gitnexus_impact` and `Get-Command gitnexus_detect_changes` returned no command in the current PowerShell environment, so GitNexus impact/detect steps could not run. Fallback evidence used Fast Context candidate discovery, targeted source reads, `rg` verification, focused tests, `typecheck`, `lint`, Python syntax checks, and `git diff --check`.
- `task.py create` now writes a Chinese `prd.md` skeleton with bilingual headings and preserved English technical terms.
- `task.py create` `Next steps` output now uses Chinese guidance while keeping `prd.md`, `Acceptance Criteria`, `design.md`, `implement.md`, `sub-agent`, and JSONL terms intact.
- Pull-based class-2 `trellis-implement` / `trellis-check` prelude now instructs agents to write human-readable Markdown in Chinese while leaving machine-readable artifacts unchanged.

## Validation Results

- [x] `pnpm --dir packages/cli test test/regression.test.ts test/configurators/platforms.test.ts`
- [x] `pnpm --dir packages/cli typecheck`
- [x] `pnpm --dir packages/cli lint`
- [x] `python -m py_compile packages\cli\src\templates\trellis\scripts\common\task_store.py .trellis\scripts\common\task_store.py`
- [x] `git diff --check -- packages/cli/src/templates/trellis/scripts/common/task_store.py packages/cli/src/configurators/shared.ts packages/cli/test/regression.test.ts .trellis/scripts/common/task_store.py`

## Validation Commands

优先目标验证：

```powershell
pnpm test packages/cli/test/scripts/task-create.integration.test.ts
```

如果没有现成目标测试文件，使用最接近的 existing CLI / regression tests，并补充临时 smoke：

```powershell
$env:PYTHONUTF8='1'
python ./.trellis/scripts/task.py create "中文 artifact smoke" --slug chinese-artifact-smoke
```

最终验证按改动面选择：

```powershell
pnpm typecheck
pnpm lint
pnpm test
```

## Rollback Points

- 如果 template 文本修改导致大量 snapshot / hash churn，先收窄到 `task_store.py` 默认 `prd.md` 和明确的 agent output instruction。
- 如果 agent prelude 改动影响 class-2 active task 发现流程，撤回 prelude 行为改动，只保留输出语言约定到 task artifact templates。

## Grill Gate

- `skip grill, because ...` - 用户已确认第一阶段 scope；实现事项是机械地把已确认语言策略落到模板 / 指令，并保持机器 contract 不变。
