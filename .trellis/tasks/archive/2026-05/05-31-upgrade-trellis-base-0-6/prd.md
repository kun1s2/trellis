# Upgrade Trellis Base To 0.6

## Goal

将当前 `@kun/trellis` 从 `0.5.19-kun.x` 的 Codex Herbivore-lite 底座升级为可长期跟进 Trellis 0.6 beta 能力的底座，同时保留当前 Codex-first 工作流、Windows 兼容性、发布包名策略和已经完成的 workflow parity 改动。

## What I Already Know

- 当前仓库包名是 `@kun/trellis`，版本是 `0.5.19-kun.0`，`packages/` 下目前只有 `cli`。
- 当前仓库已经有 `trellis workflow`、`trellis upgrade`、`init --workflow`、`init --workflow-source`、Codex inline workflow 和 goal/grill 相关工作流能力。
- 当前仓库没有 `packages/core`，没有 `packages/core/src/mem`，没有 `packages/cli/src/commands/mem.ts`，也没有 `commands/channel`。
- 之前 `05-25-codex-herbivore-port` 任务明确把 `packages/core`、`trellis mem`、`trellis channel`、Codex app-server channel adapter 放进 v2 backlog，没有在 v1 实现。
- `@mindfoldhq/trellis@beta` 的 0.6 线主要新增 `trellis mem`、`packages/core`、`trellis channel`、workflow template switching、channel/forum/worker runtime、Claude-only switch/review gate 等能力。
- `@mindfoldhq/trellis-core@beta` 在 `0.6.0-beta.21` 暴露 `./mem`、`./channel`、`./task`、`./testing` exports。
- `trellis-hgl` 也存在自己的 beta/fork 发布线，但当前仓库不应直接继承它的包名和发布元数据。

## Requirements

- 明确当前 `0.5.19-kun.x` 与 Trellis 0.6 beta 的能力差异，避免把 0.6 beta 能力误认为当前 Codex fork 已有能力。
- 以干净的 `@mindfoldhq/trellis` `v0.6.0-beta.21` clone 作为新底座，在隔离目录中迁移当前 fork 的额外能力。
- 迁移要分阶段验证，避免包结构、发布流程、channel runtime 和 Codex app-server 行为一起失控。
- 保留当前 Codex-first 体验：Codex inline 是默认主路径，Codex sub-agent / channel worker 只能作为显式增强路径。
- 优先迁移稳定且直接有用的能力；高风险能力必须有单独任务、单独验收和 rollback plan。
- 升级后的包结构、测试命令、build、copy-templates、release scripts、manifest continuity 必须自洽。
- 如果引入 `packages/core`，必须明确 `@kun/trellis-core` 或其他包名策略，并同步 package exports、workspace scripts 和发布流程。

## Candidate Upgrade Slices

### Slice A: 0.6 Base Alignment

- 对齐当前仓库与 0.6 beta 的 CLI 命令面、workflow resolver、upgrade/update/init 语义。
- 不引入 `packages/core`、`mem`、`channel`。
- 目标是把已经移植的 workflow parity 做成明确的 0.6 base foundation。

### Slice B: Core Package Foundation

- 新增 `packages/core`，建立独立 build/test/export 边界。
- 先只迁移低耦合 core utilities 或 `task/testing` exports。
- 不直接引入 channel runtime。

### Slice C: Session Memory

- 迁移或重写 `trellis mem` 能力。
- 可选路径：
  - Trellis CLI 内置 `trellis mem`，依赖 `packages/core/mem`。
  - 先做通用 Codex skill/CLI，成熟后再决定是否纳入 Trellis。
- 第一优先级应覆盖 Codex session search，而不是一次性支持 Claude/OpenCode。

### Slice D: Channel Runtime

- 迁移 `trellis channel`、event store、forum/thread、worker inbox、provider adapters。
- Codex app-server adapter 必须真实验证 Windows + Codex Desktop/CLI 行为。
- 这块风险最高，必须独立任务处理。

## Acceptance Criteria

- [ ] 有一份升级路线文档，明确哪些 0.6 能力进入当前升级、哪些保持 backlog。
- [ ] 如果只做底座升级，不新增未验收的 `mem/channel` 用户可见命令。
- [ ] 如果引入 `packages/core`，`pnpm build`、`pnpm test`、`pnpm typecheck`、`pnpm lint` 覆盖 core 和 cli。
- [ ] 如果引入 `trellis mem`，`trellis mem list/search/context/extract/projects --platform codex` 能解析本机 Codex JSONL，并有测试 fixture 覆盖 compaction 和噪音清理。
- [ ] 如果引入 `trellis channel`，`create/send/messages/wait` 至少有本地 event-store 测试；Codex provider adapter 不能假成功。
- [ ] README/spec/migration manifests 不声明未实现的 0.6 能力。

## Out Of Scope Until Confirmed

- 直接全量 merge `@mindfoldhq/trellis@beta` 或 `trellis-hgl`。
- 未经验证直接覆盖当前 `main` 工作树。
- 改 npm owner、git remote、生产发布配置，或直接发布 npm。
- 默认启用 Codex app-server channel worker。
- 为了 OpenCode SQLite reader 引入 native dependency。
- 把 Claude-only `/trellis-switch` 或 Claude review gate 行为直接照搬为 Codex 默认行为。

## Technical Notes

- Current local package: `packages/cli/package.json`, package name `@kun/trellis`, version `0.5.19-kun.0`.
- Current command files: `codex.ts`, `init.ts`, `uninstall.ts`, `update.ts`, `upgrade.ts`, `workflow.ts`.
- Reference repo inspected at `D:\tmp\Trellis-Herbivore-ref`.
- 0.6 beta reference capabilities were summarized from `packages/cli/src/migrations/manifests/0.6.0-beta.*.json`.
- Prior boundary source: `.trellis/tasks/archive/2026-05/05-25-codex-herbivore-port/prd.md` and related research.

## Open Question

- 第一轮升级是做 **底座对齐 + core/mem**，还是直接追求 **完整 0.6 beta parity，包括 channel runtime**？

## Current Decision

用户已确认切换方向：先总结当前 fork 已完成内容，然后使用干净的 `v0.6.0-beta.21` clone 作为新底座，直接在该底座上迁移当前 fork 的额外功能逻辑。

当前迁移边界：

- clean 0.6 clone 已存在于 `D:\tmp\trellis-0.6.0-beta.21-clean`，HEAD 为 `30beb8e3ed379b7ef9270e14d4b406fc330044d2` / `v0.6.0-beta.21`。
- 第一轮在该 clone 内迁移和验证，不直接覆盖 `D:\IdeaProjects\trellis-plus` 主工作树。
- 必须迁移当前 fork 独有且已完成的能力：`@kun/trellis` 发布身份、Codex project launcher / skill exclusions、Trellis Goal / Grill bundled skills、`task.py mark-goal` / `goal-info`、Codex review-gate agent 模板、Codex inline 默认和相关测试。
- 0.6 已有的 `packages/core`、`trellis mem`、`trellis channel` 可以保留在新底座，但必须调整包名、workspace scripts 和发布边界，不能默认承诺 Codex app-server channel worker 已可用。
- `trellis-hgl` 继续只作为参考，不继承它的包名、remote 或发布元数据。

## Risk Audit Notes

### Planning artifacts

- Source template already has stronger planning artifact support: generated `task.py create` writes a default `prd.md`, and complex tasks are expected to add `design.md` / `implement.md` before `task.py start`.
- Source template `session_context.py` surfaces existing planning artifacts and context manifests.
- Codex source agent templates now read task context in the intended order: JSONL entries, then `prd.md`, then `design.md`, then `implement.md`.
- Risk: current repository dogfood files are not fully aligned with source templates. Local `.trellis/scripts/common/task_store.py`, `.trellis/scripts/common/session_context.py`, and `.codex/agents/trellis-*.toml` still show older behavior in this checkout. Upgrade work must decide whether to sync local dogfood files, template source, or both.

### Codex inline/sub-agent adaptation

- Source workflow supports two Codex modes: `codex-inline` and `codex-sub-agent`.
- Current `.trellis/config.yaml` sets `codex.dispatch_mode: inline`, so Codex is expected to implement directly in the main session.
- Source Codex sub-agent templates include a recursion guard and disable Codex multi-agent tools inside sub-agents to avoid `wait_agent` self-deadlock.
- Risk: docs/comments and generated local files still contain conflicting hints about default Codex dispatch behavior. This should be treated as a parity bug, not as a 0.6 upgrade feature.
- Concrete bug candidate: Codex `session-start.py` still reports a task as `NOT READY` when `implement.jsonl` / `check.jsonl` have only seed rows, even though `codex.dispatch_mode: inline` explicitly skips Phase 1.3 JSONL curation. The READY/NOT READY logic must respect dispatch mode.

### Trellis mem

- `mem` would solve a real workflow gap: quickly finding old Codex/Claude conversations, decisions, and task context across sessions without relying on memory.
- Current package does not ship `packages/core`, `packages/cli/src/commands/mem.ts`, or `commands/channel`.
- The existing `commands-mem.md` spec describes a valuable design, but it currently documents beta behavior that is not implemented in this package.
- Recommended first useful scope, if accepted later: Codex-first `mem list/search/context/extract/projects --platform codex` with JSONL fixtures for compaction and injected-noise cleanup.
