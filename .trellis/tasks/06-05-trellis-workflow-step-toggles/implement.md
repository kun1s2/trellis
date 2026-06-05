# Implement Plan: Trellis workflow step toggles

## Status

Planning only. Do not run `task.py start` until the user reviews this plan and explicitly approves implementation.

## Grill Gate

Grill Gate: `trellis-grill-me required` before implementation, because toggle defaults alter Trellis product policy and quality gates. The recommended answers are recorded in `design.md`, but implementation should not begin until the user accepts or revises them.

## Latest Scope Adjustment

After re-reading the latest user changes, Phase A should prioritize Codex inline UX:

- Keep existing `codex.dispatch_mode: inline | sub-agent`; do not reintroduce removed `codex.disabled_skills` launcher config.
- Treat JSONL curation as a sub-agent-only concern, but add a separate policy for JSONL file seeding/visibility because Codex inline users can still see seeded `implement.jsonl` / `check.jsonl`.
- User's first implementation direction is skip nodes: Phase A should expose `workflow.skip.<node>: true | false`, not a full depth/mode system.
- Skipping a node means it no longer blocks, prompts, or requires its artifact. It may leave a short skipped record for audit.
- Collapse duplicated check ceremony by allowing Phase 3.1 to be skipped when the user enables that node skip.
- Add finish skip controls for spec update, work commit plan, and finish-work archive/journal behavior.

## Checklist

1. Confirm scope with user
   - Accept Phase A only, or adjust defaults / included toggles.
   - Confirm `workflow.preset` is the normal user-facing entry and `workflow.skip` is the advanced override surface.
   - Confirm which nodes are in Phase A: small-task prompt, Architecture Shaping, Grill Gate, complex artifacts, context manifests, final verification, spec update, commit plan, finish-work.
   - Confirm this task still excludes local environment upgrade.

2. Add workflow skip resolver
   - Add a single Python resolver for `workflow.preset` + `workflow.skip` defaults and validation.
   - Reuse existing simple YAML parser behavior; do not add a new YAML dependency.
   - Missing/invalid config must fall back to safe defaults from `design.md`.
   - Expose normalized booleans by node name, plus the effective preset name and any invalid-value warnings.

3. Inject skip state into runtime context
   - Update `inject-workflow-state.py` to include a compact `<workflow-skip>` block.
   - Update `get_context.py --mode phase` / `workflow_phase.py` path to include the same skip view.
   - Keep `codex.dispatch_mode` behavior unchanged and compatible with the new skip block.

4. Update native workflow wording
   - Update `packages/cli/src/templates/trellis/workflow.md`.
   - Keep hard invariants absolute.
   - Mark skippable nodes as controlled by `workflow.skip.<node>`.
   - Preserve required `[workflow-state:*]` blocks and platform markers.

5. Add config template section
   - Add commented `workflow.preset` + short `workflow.skip` examples to `packages/cli/src/templates/trellis/config.yaml`.
   - Add migration manifest `configSectionsAdded` for existing projects.
   - Avoid touching this checkout's generated `.trellis/config.yaml` for this planning task.

6. Add user education surfaces
   - Add a docs-site guide: "Workflow skip presets" or equivalent under advanced/guides.
   - Add CLI explain command or extend an existing command to print current effective workflow preset + skipped nodes.
   - Make runtime `<workflow-skip>` show both machine-readable values and a short human explanation.
   - Include config comment copy that teaches `full`, `balanced`, `lean`, and `manual`.

7. Adjust task/context runtime behavior
   - Teach `task.py create` / shared task store to honor `workflow.skip.context_manifests`.
   - Keep sub-agent mode and non-Codex sub-agent platforms able to seed JSONL manifests.
   - Teach planning readiness validation to apply planning node skips without weakening lifecycle invariants.
   - Keep `task.py start` as the implementation boundary.

8. Update specs and docs
   - Update `.trellis/spec/cli/backend/workflow-state-contract.md` if breadcrumb body contract changes.
   - Update `.trellis/spec/cli/backend/commands-update.md` if config section append behavior changes.
   - Update relevant docs/changelog if this becomes a release feature.

9. Tests
   - Add unit/regression tests for skip parse defaults and invalid values.
   - Add tests for preset expansion: `full`, `balanced`, `lean`, `manual`, invalid preset fallback.
   - Add regression tests that `[workflow-state:planning]` and `[workflow-state:in_progress]` still mention required hard gates.
   - Add Codex tests for `codex.dispatch_mode=inline`, `sub-agent`, missing, invalid with skip injection.
   - Add `get_context.py --mode phase --step <X.Y> --platform codex` tests proving phase context sees the effective skip values.
   - Add tests for JSONL manifest seeding under inline vs sub-agent policy.
   - Add planning readiness tests with each skippable planning node true/false.
   - Add finish skip prompt/context tests for spec update, work commit plan, and wrap-up behavior.
   - Add docs/config snapshot tests if the project has existing docs snapshot coverage.
   - Add update/config section tests for idempotent append.

10. Validation commands
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
- `packages/cli/src/templates/trellis/scripts/common/task_store.py`
- `packages/cli/src/templates/trellis/scripts/common/task_validation.py`
- `packages/cli/src/templates/trellis/scripts/common/workflow_phase.py`
- `packages/cli/src/templates/trellis/scripts/get_context.py`
- `packages/cli/src/commands/update.ts`
- `packages/cli/src/migrations/manifest*.json` or release-specific manifest path
- `packages/cli/test/regression.test.ts`
- `packages/cli/test/commands/update*.test.ts`

## Rollback Points

- If skip injection causes breadcrumb drift, revert hook changes first and keep workflow wording conservative.
- If config section append is noisy or non-idempotent, revert manifest/config template changes before release.
- If phase context and breadcrumb disagree, stop implementation and consolidate resolver usage before adding more toggles.
- If JSONL seeding policy risks breaking sub-agent platforms, keep existing seeding behavior for non-Codex platforms and apply `sub-agent-only` only to Codex dispatch mode first.

## Context Manifests

`implement.jsonl` and `check.jsonl` should include the relevant spec files plus `research/architecture-shaping.md`. Do not list source files that will be edited.
