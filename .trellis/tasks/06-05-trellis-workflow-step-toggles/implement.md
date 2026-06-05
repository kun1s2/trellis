# Implement Plan: Trellis workflow step toggles

## Status

Planning only. Do not run `task.py start` until the user reviews this plan and explicitly approves implementation.

## Grill Gate

Grill Gate: `trellis-grill-me required` before implementation, because toggle defaults alter Trellis product policy and quality gates. The recommended answers are recorded in `design.md`, but implementation should not begin until the user accepts or revises them.

## Checklist

1. Confirm scope with user
   - Accept Phase A only, or adjust defaults / included toggles.
   - Confirm this task still excludes local environment upgrade.

2. Add workflow policy resolver
   - Add a single Python resolver for `workflow.policy` defaults and validation.
   - Reuse existing simple YAML parser behavior; do not add a new YAML dependency.
   - Missing/invalid config must fall back to conservative defaults.

3. Inject policy into runtime context
   - Update `inject-workflow-state.py` to include a compact `<workflow-policy>` block.
   - Update `get_context.py --mode phase` / `workflow_phase.py` path to include the same policy view.
   - Keep `codex.dispatch_mode` behavior unchanged and compatible with the new policy block.

4. Update native workflow wording
   - Update `packages/cli/src/templates/trellis/workflow.md`.
   - Keep hard invariants absolute.
   - Mark configurable steps as default policy controlled by `workflow.policy`.
   - Preserve required `[workflow-state:*]` blocks and platform markers.

5. Add config template section
   - Add commented `workflow.policy` section to `packages/cli/src/templates/trellis/config.yaml`.
   - Add migration manifest `configSectionsAdded` for existing projects.
   - Avoid touching this checkout's generated `.trellis/config.yaml` for this planning task.

6. Update specs and docs
   - Update `.trellis/spec/cli/backend/workflow-state-contract.md` if breadcrumb body contract changes.
   - Update `.trellis/spec/cli/backend/commands-update.md` if config section append behavior changes.
   - Update relevant docs/changelog if this becomes a release feature.

7. Tests
   - Add unit/regression tests for policy parse defaults and invalid values.
   - Add regression tests that `[workflow-state:planning]` and `[workflow-state:in_progress]` still mention required hard gates.
   - Add Codex tests for `codex.dispatch_mode=inline`, `sub-agent`, missing, invalid with policy injection.
   - Add `get_context.py --mode phase --step <X.Y> --platform codex` tests proving phase context sees the effective policy.
   - Add update/config section tests for idempotent append.

8. Validation commands
   - `pnpm --filter psymoth test`
   - `pnpm --filter psymoth typecheck`
   - `pnpm --filter psymoth lint`
   - `pnpm --filter psymoth build`
   - Targeted smoke:
     - `python ./.trellis/scripts/get_context.py --mode phase`
     - `python ./.trellis/scripts/get_context.py --mode phase --step 1.1 --platform codex`
     - `python ./.trellis/scripts/get_context.py --mode phase --step 2.1 --platform codex`

## Risk Files / 风险文件

- `packages/cli/src/templates/trellis/workflow.md`
- `packages/cli/src/templates/trellis/config.yaml`
- `packages/cli/src/templates/shared-hooks/inject-workflow-state.py`
- `packages/cli/src/templates/trellis/scripts/common/config.py`
- `packages/cli/src/templates/trellis/scripts/common/trellis_config.py`
- `packages/cli/src/templates/trellis/scripts/common/workflow_phase.py`
- `packages/cli/src/templates/trellis/scripts/get_context.py`
- `packages/cli/src/commands/update.ts`
- `packages/cli/src/migrations/manifest*.json` or release-specific manifest path
- `packages/cli/test/regression.test.ts`
- `packages/cli/test/commands/update*.test.ts`

## Rollback Points

- If policy injection causes breadcrumb drift, revert hook changes first and keep workflow wording conservative.
- If config section append is noisy or non-idempotent, revert manifest/config template changes before release.
- If phase context and breadcrumb disagree, stop implementation and consolidate resolver usage before adding more toggles.

## Context Manifests

`implement.jsonl` and `check.jsonl` should include the relevant spec files plus `research/architecture-shaping.md`. Do not list source files that will be edited.
