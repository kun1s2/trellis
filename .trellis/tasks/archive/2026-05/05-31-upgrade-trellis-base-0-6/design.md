# Design: Upgrade Trellis Base To 0.6

## Direction

The direction changed after user confirmation: use a clean upstream 0.6 beta clone as the new base and port the current fork-only logic onto it.

The first implementation target is:

1. Work in the isolated clean clone at `D:\tmp\trellis-0.6.0-beta.21-clean`.
2. Keep upstream 0.6 structure, including `packages/core`, `trellis mem`, and `trellis channel`, unless a verification failure forces deferral.
3. Change package identity and release hints to the Kun distribution (`@kun/trellis`, and `@kun/trellis-core` if core ships).
4. Port the current fork-only Codex and goal/grill features.
5. Verify with targeted tests plus build/typecheck before deciding how to switch the main repository.

The migration must preserve:

1. `@kun/trellis` package identity and release behavior.
2. Preserve Codex inline as the default project workflow.
3. Codex project launcher skill exclusions.
4. Trellis Goal / Grill workflow support.
5. Windows-compatible command spawning and UTF-8 behavior.

## Rebase Strategy Decision

Directly cloning latest 0.6 and porting custom features onto it is now the chosen path. The failure mode is still real: package identity, release scripts, `packages/core`, channel runtime, Claude-oriented review/switch behavior, and Codex-first local changes all move at the same time.

Use this rule:

- Default working strategy: modify the isolated 0.6 clone first.
- Current `trellis-plus` main working tree remains the reference and rollback source until the isolated clone passes verification.
- Do not replace the current repository base before a report lists ported features, failed checks, and remaining manual work.

The spike report must answer:

1. Which current `@kun/trellis` features are missing in upstream 0.6?
2. Which 0.6 files would overwrite Codex-first planning artifacts, goal/grill workflow, dispatch-mode behavior, Windows compatibility, release package naming, or manifest continuity?
3. Do build, typecheck, lint, and core CLI tests pass after a minimal feature port?
4. What is the rollback path if the rebase path fails?

## Evidence Checked

### Planning artifacts

Source template support exists:

- `packages/cli/src/templates/trellis/scripts/common/task_store.py` writes a default `prd.md` during `task.py create`.
- The default PRD explicitly says lightweight tasks can remain PRD-only and complex tasks should add `design.md` / `implement.md`.
- `packages/cli/src/templates/trellis/scripts/common/session_context.py` reports planning artifacts and context manifests.
- `packages/cli/src/templates/codex/agents/trellis-implement.toml` and `trellis-check.toml` read JSONL first, then `prd.md`, then `design.md`, then `implement.md`.

Known drift in this checkout:

- `.trellis/scripts/common/task_store.py` does not currently write the default `prd.md`.
- `.trellis/scripts/common/session_context.py` still only emits the older `This task has prd.md` hint.
- `.codex/agents/trellis-implement.toml` and `.codex/agents/trellis-check.toml` still read `prd.md` / `info.md` before JSONL and do not mention `design.md` / `implement.md`.

Interpretation: the source template direction is good, but local dogfood/generated files are not fully synchronized. Treat that as an implementation risk.

### Codex inline/sub-agent

Source support exists:

- `.trellis/workflow.md` has separate `planning-inline` and `in_progress-inline` blocks.
- `packages/cli/src/templates/trellis/scripts/common/workflow_phase.py` maps `codex` to `codex-inline` by default unless `codex.dispatch_mode: sub-agent`.
- Source tests cover inline/sub-agent workflow-state selection and config comment parsing.
- Source Codex sub-agent definitions have recursion guards and disable multi-agent tools inside the sub-agent.

Known drift/risk:

- Current `.trellis/config.yaml` comment still implies the default is sub-agent, while `workflow_phase.py` says the default is inline.
- Current `.codex/agents/*.toml` are older than source templates.
- `packages/cli/src/templates/codex/hooks/session-start.py` still requires curated JSONL before reporting READY. In `codex.dispatch_mode: inline`, Phase 1.3 says JSONL is skipped, so this hook can incorrectly block an inline task that already has `prd.md`.

Interpretation: the architecture is mostly correct, but wording and generated-local parity need cleanup so agents do not receive contradictory guidance.

### Trellis mem

Current package state:

- `packages/core` does not exist.
- `packages/cli/src/commands/mem.ts` does not exist.
- `packages/cli/src/commands/channel` does not exist.
- `.trellis/spec/cli/backend/commands-mem.md` describes beta behavior, not current shipped code.

Value:

- High value for cross-session recall: old Codex task decisions, prior AI work, and exact dialogue can be recovered without manual log digging.
- Especially useful for this user's workflow because Codex session history and cross-conversation search came up as a repeated need.

Boundary:

- `mem` is not required for the first base upgrade.
- If implemented, start Codex-first and offline-only.
- Do not pull in OpenCode native dependencies or channel runtime to justify `mem`.

## Migration Strategy

### Slice 0: Baseline inventory

Summarize what the current fork added and what clean 0.6 already provides.

### Slice 1: Package identity and workspace metadata

Port Kun package names, repository metadata, release scripts, package exports, and install/upgrade hints.

### Slice 2: Codex-first behavior

Port `trellis codex`, Codex skill exclusions, inline default docs/config, Codex review-gate agents, and related tests.

### Slice 3: Trellis Goal / Grill

Port multi-file bundled skills plus `task.py mark-goal` / `goal-info` and tests.

### Slice 4: Verification and switch report

Run targeted tests, build/typecheck, then report whether the isolated clone is ready to become the new main base.
