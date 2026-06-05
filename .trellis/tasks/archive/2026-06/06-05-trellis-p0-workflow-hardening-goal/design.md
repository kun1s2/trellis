# Design: P0 Trellis workflow hardening goal

## Architecture Shaping

Architecture Shaping: required; see research/architecture-shaping.md.

## Technical Boundary

This goal may touch Trellis workflow/runtime code, generated local assets, packaged templates, tests, and specs only when the change is directly tied to the P0 scope in `prd.md`.

Likely areas:

- Local Trellis runtime:
  - `.trellis/scripts/task.py`
  - `.trellis/scripts/common/task_store.py`
  - `.trellis/scripts/common/task_context.py`
  - `.trellis/scripts/common/workflow_phase.py`
  - `.trellis/scripts/common/session_context.py`
  - `.trellis/workflow.md`
- Packaged templates and source:
  - `packages/cli/src/templates/trellis/**`
  - `packages/cli/src/templates/common/**`
  - `packages/cli/src/templates/codex/**`
  - `packages/cli/src/templates/claude/**`
  - `packages/cli/src/templates/shared-hooks/**`
  - `packages/cli/src/commands/**`
  - `packages/cli/src/utils/**`
- Platform-local files when they are template-generated mirrors:
  - `.agents/skills/**`
  - `.codex/**`
  - `.claude/**`
- Specs and tests:
  - `.trellis/spec/cli/backend/workflow-state-contract.md`
  - `.trellis/spec/cli/backend/script-conventions.md`
  - `.trellis/spec/cli/backend/quality-guidelines.md`
  - `.trellis/spec/cli/unit-test/conventions.md`
  - `packages/cli/test/**` or equivalent test files discovered during implementation.

## Design Principles

- Prefer fixing source-of-truth templates or shared helpers before patching generated local copies.
- Keep `.trellis/workflow.md` as the editable source of truth for breadcrumb body text.
- Validation should be deterministic, inspect files on disk, and produce actionable messages.
- Validation should be reusable by CLI commands and tests rather than duplicated as scattered string checks.
- Goal validation should validate Trellis artifacts, not native Codex goal state.
- Planning validation should check start-readiness without replacing human review.
- All new validation must preserve existing task lifecycle statuses unless a user-approved redesign is recorded.
- Existing dirty files must be classified before edits are committed; do not reset unrelated work.

## Validation Shape

The Goal agent may choose the exact command/API shape, but the result must support:

- start-readiness validation for complex planning gates;
- goal-contract validation for `prd.md`, `design.md`, `implement.md`, and `task.json.meta.trellis_goal`;
- JSONL/context validation integration or clear warning when manifests are seed-only in sub-agent mode;
- tests or regression coverage for the validation behavior.

Preferred options to evaluate:

- Extend `task.py validate` with a phase/goal mode.
- Add a dedicated `task.py goal-validate` command.
- Integrate validation into `mark-goal` as a default or explicit `--validate` path only if backward compatibility is acceptable.

## Decision Harness Details

Low-risk decisions:

- Naming helper functions.
- Choosing internal helper module placement after reading existing code.
- Adding tests near existing regression/integration coverage.
- Repairing obvious mojibake where the intended Chinese text is available from adjacent docs, templates, or user-facing instructions.

Medium ambiguity:

- Whether validation should block by default or warn by default.
- Whether `mark-goal` should fail on missing Goal Contract or only report validation failures.
- Whether local generated files and packaged templates should both be edited in the same checkpoint.
- Whether a P1 item is required to make a P0 fix coherent.

High/user-owned ambiguity:

- Changing default execution mode semantics.
- Adding new status values.
- Removing the `completed` breadcrumb state.
- Expanding to P1/P2 implementation as first-class scope.

## Verification Policy

Minimum verification after implementation:

- `python ./.trellis/scripts/task.py validate .trellis/tasks/06-05-trellis-p0-workflow-hardening-goal`
- Targeted CLI/script tests for changed validation logic.
- `pnpm --filter psymoth lint`
- `pnpm --filter psymoth typecheck`
- `pnpm --filter psymoth test`

If local Python template scripts are changed, also run relevant Python syntax/static checks when available, such as `pnpm --filter psymoth lint:py` or direct `python -m py_compile` on touched local/template scripts.

If full validation is too slow or blocked by unrelated dirty work, record the skipped command, blocker, and residual risk in `implement.md`.

## Compatibility Notes

- Existing projects may have planning tasks without new validation fields. New validation should distinguish warnings from hard failures when compatibility requires it.
- Seed-only JSONL files are valid for lightweight tasks but should be reported for complex sub-agent tasks.
- Goal Contract validation must not require a native Codex goal to exist.
- The `checkpoint-bounded` cadence remains a hint, not a local queue.

## Rollback / Recovery

- Before source edits, inspect `git status --porcelain` and identify dirty files touched by this goal.
- If a change collides with unrelated dirty work, stop and record a Stop/Block.
- Prefer small commits/checkpoints so changes can be reverted by file group if needed.
- Do not use destructive git reset/checkout operations.
