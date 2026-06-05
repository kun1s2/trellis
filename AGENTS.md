<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->

## 本地协作身份与任务范围

- 本仓库当前按 Codex 专用魔改版维护。后续修改 Trellis 行为时，默认只维护 Codex 相关路径、提示、技能、hooks、agents、命令和用户体验。
- 不主动为 Claude、Cursor、OpenCode、Gemini、Qoder、Copilot、Pi 等其他平台做兼容、同步或回归，除非用户明确要求。
- 如果共享文件会影响 Codex，可以修改共享文件；但目标仍以 Codex 版体验和行为正确为准，不以跨平台一致性为默认目标。
- 用户提到“当前 task”时，只把 `@codex`、6 月及之后、或用户明确指定的新分支 / task 视为当前工作候选。
- 6 月以前由 `@taosu`、`@kleinhe` 等前项目负责人留下的 Trellis tasks 视为历史遗留任务，不应混入当前 task 汇报或后续工作范围，除非用户明确指定要处理某个遗留任务。

## Project Tooling

- GitNexus and ABCoder are not available in this project. Do not require or
  invoke `gitnexus_*`, `mcp__gitnexus__*`, `abcoder`, or `mcp__abcoder__*`
  tools for exploration, impact analysis, implementation, review, or finish
  checks.
- For codebase semantic location, use
  `D:\Users\Kun\.skills-manager\skills\code-context-search\SKILL.md` first.
  Treat Fast Context results as candidates, then verify by reading real source
  files directly.
- Use `rg` only after `code-context-search` returns concrete candidates, or
  when doing exact follow-up checks inside already identified files/directories.
