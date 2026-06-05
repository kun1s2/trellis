# Analyze Trellis-Herbivore with Understand-Anything

## Raw Goal Input

```text
创建文件夹去下载[LonelyHerbivore/Trellis-Herbivore](https://github.com/LonelyHerbivore/Trellis-Herbivore),并且用 [$understand-anything:understand](D:\\Users\\Kun\\.understand-anything\\repo\\understand-anything-plugin\\skills\\understand\\SKILL.md) 去分析[LonelyHerbivore/Trellis-Herbivore](https://github.com/LonelyHerbivore/Trellis-Herbivore),分析内容放在同一个文件夹里,可以排除无关的内容后再分析,并且走 [$trellis-goal](D:\\IdeaProjects\\trellis-plus\\.agents\\skills\\trellis-goal\\SKILL.md) 去实现这个需求

下载可以走本地10808代理

允许创建trellis task
```

## Goal Contract

- Objective: 在新建文件夹中下载 `LonelyHerbivore/Trellis-Herbivore`，并在同一文件夹内生成 Understand-Anything 分析产物。
- Scope: 目标仓库下载目录为 `D:\IdeaProjects\trellis-plus\.trellis\workspace\codex\external-repos\Trellis-Herbivore`；分析产物写入该目录下的 `.understand-anything/`，必要时添加该目录内的 `.understand-anything/.understandignore` 以排除无关内容。
- Constraints:
  - 下载和可能的依赖安装优先使用本地代理 `http://127.0.0.1:10808`。
  - 不修改当前 `trellis-plus` 业务源码；初始化阶段只写本 Trellis task artifacts。
  - 不把下载仓库的分析产物写到当前 `trellis-plus` 根目录。
  - 不静默回退到其他联网搜索或下载路径；如代理、网络、GitHub 访问或 Understand-Anything 分析失败，记录失败原因和可恢复步骤。
  - 分析前允许排除 `.git/`、构建产物、缓存、依赖目录、二进制资源和锁文件等无关内容。
- Done When:
  1. `D:\IdeaProjects\trellis-plus\.trellis\workspace\codex\external-repos\Trellis-Herbivore` 存在并包含 `LonelyHerbivore/Trellis-Herbivore` 的 Git checkout。
  2. 同一目录下存在 `.understand-anything/knowledge-graph.json` 或等价 Understand-Anything 分析产物，并能通过文件存在性、JSON 可解析性或工具输出来验证。
  3. `.understand-anything/.understandignore` 已存在，且包含排除无关内容的明确规则。
  4. `implement.md` 记录下载、分析、验证证据、剩余风险和最终状态。
- Stop If:
  1. `git clone` 在启用 `http_proxy` / `https_proxy` 后仍无法访问 GitHub；检测方法为 `git clone` 非零退出码和错误输出。
  2. Understand-Anything plugin 缺少可执行依赖且无法通过本地环境安装或构建；检测方法为 `pnpm` / `node` / plugin build 命令非零退出码。
  3. 分析命令多次失败且没有生成可验证的 `.understand-anything` 产物；检测方法为命令退出码、缺失目标文件或 JSON 解析失败。
- Token Budget: not specified
- Project Type: read-only external repository analysis; evidence: user requested cloning and Understand-Anything analysis only, no source modification.
- Scenario: Custom
- Cadence Hint: checkpoint-bounded; user requested Trellis Goal execution but did not request run-to-completion wording or token budget.

## Default Assumptions

- Assumption: 下载目录使用 `D:\IdeaProjects\trellis-plus\.trellis\workspace\codex\external-repos\Trellis-Herbivore`。
  Evidence: current workspace is `D:\IdeaProjects\trellis-plus`; Trellis workspace path is `.trellis/workspace/codex/`; user asked to create a folder but did not name one.
  Why safe: keeps external checkout and analysis artifacts together while avoiding current project source directories.
  Stop if: user specifies a different destination path or directory already contains incompatible non-repository content.
- Assumption: `10808` proxy means HTTP(S) proxy at `http://127.0.0.1:10808`.
  Evidence: user said "本地10808代理"; this is the common local HTTP proxy shape for Git and package tools.
  Why safe: applies only to network commands and can be removed without changing files.
  Stop if: Git reports an unsupported proxy protocol or the user supplies a different proxy URI.
- Assumption: 无关内容可通过 `.understand-anything/.understandignore` 排除 `.git/`、依赖目录、构建产物、缓存、二进制文件和锁文件。
  Evidence: Understand-Anything skill documents `.understandignore` for excluding analysis noise.
  Why safe: these files do not usually represent architecture source and excluding them keeps the analysis bounded.
  Stop if: target repository relies on generated artifacts as primary source and no source equivalent exists.

## Ambiguity Handling

| Topic | Level | Decision | Evidence | Trellis Record |
|---|---|---|---|---|
| Destination folder | low | Use `.trellis/workspace/codex/external-repos/Trellis-Herbivore` | Workspace and user request | `prd.md` Default Assumptions |
| Proxy format | low | Use `http://127.0.0.1:10808` | User specified local 10808 proxy | `prd.md` Default Assumptions |
| Exclusion list | low | Exclude standard non-source noise | Understand-Anything skill ignore guidance | `prd.md`, `implement.md` |

## Acceptance Criteria

- [x] GitHub repository is downloaded into `D:\IdeaProjects\trellis-plus\.trellis\workspace\codex\external-repos\Trellis-Herbivore`.
- [x] Understand-Anything analysis output exists inside `D:\IdeaProjects\trellis-plus\.trellis\workspace\codex\external-repos\Trellis-Herbivore\.understand-anything`.
- [x] Analysis ignores obvious non-source noise through `.understand-anything/.understandignore`.
- [x] Final report includes exact artifact paths and verification evidence.

## Context Manifest Plan

| Action | File | Reason |
|---|---|---|
| implement | `.agents/skills/trellis-goal/SKILL.md` | Required user-selected Trellis Goal workflow. |
| implement | `D:\Users\Kun\.understand-anything\repo\understand-anything-plugin\skills\understand\SKILL.md` | Required user-selected Understand-Anything workflow. |
| check | `.trellis/tasks/06-05-06-05-analyze-trellis-herbivore-understand/implement.md` | Checkpoints and evidence source. |

## Out of Scope

- Modifying `LonelyHerbivore/Trellis-Herbivore` source code.
- Creating a pull request or committing downloaded external repository content.
- Building or launching the downloaded project unless required by Understand-Anything analysis.
- Changing current `trellis-plus` source behavior.

## Initialization Gate Evidence

- Goal marker: `task.py mark-goal .trellis/tasks/06-05-06-05-analyze-trellis-herbivore-understand --source new-request --cadence checkpoint-bounded` succeeded.
- Done When mapping: download maps to Checkpoint 1; ignore setup maps to Checkpoint 2; Understand-Anything output maps to Checkpoint 3; evidence report maps to Checkpoint 4.
- Stop If detection: each Stop If condition includes command exit code or artifact existence detection.
- Ambiguity handling: low-risk defaults recorded above; no medium or high ambiguity remains.
- Context curation: inline context references recorded in Context Manifest Plan.
- Checkpoint counts: 3 work checkpoints and 1 check checkpoint.
- Native handoff: `create_goal` called successfully; native goal status became `active`.
- Dirty-state review: initialization was limited to this Trellis task directory; execution outputs were written under `D:\IdeaProjects\trellis-plus\.trellis\workspace\codex\external-repos\Trellis-Herbivore`.
- Validation: `task.py validate .trellis/tasks/06-05-06-05-analyze-trellis-herbivore-understand` passed.
