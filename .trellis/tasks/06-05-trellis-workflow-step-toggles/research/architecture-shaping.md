# Architecture Shaping

## Scope Reviewed

- `.trellis/workflow.md`
- `packages/cli/src/templates/trellis/workflow.md`
- `.trellis/config.yaml`
- `packages/cli/src/templates/trellis/config.yaml`
- `packages/cli/src/templates/shared-hooks/inject-workflow-state.py`
- `packages/cli/src/templates/trellis/scripts/common/config.py`
- `packages/cli/src/templates/trellis/scripts/common/trellis_config.py`
- `packages/cli/src/templates/trellis/scripts/common/workflow_phase.py`
- `.trellis/scripts/common/task_store.py`
- `.trellis/scripts/common/task_validation.py`
- `packages/cli/src/templates/trellis/scripts/task.py`
- `packages/cli/src/commands/codex.ts`
- `.codex/hooks/session-start.py`
- `.agents/skills/trellis-before-dev/SKILL.md`
- `.agents/skills/trellis-check/SKILL.md`
- `.agents/skills/trellis-grill-me/SKILL.md`
- `.agents/skills/trellis-grill-agents/SKILL.md`
- `.agents/skills/trellis-goal/SKILL.md`
- `.trellis/spec/cli/backend/workflow-state-contract.md`
- `.trellis/spec/cli/backend/commands-update.md`
- `.trellis/spec/cli/backend/commands-workflow.md`
- `.trellis/spec/cli/backend/platform-integration.md`

## Long-Lived Assumptions

- Trellis projects are long-lived, so workflow gates should default to preserving planning quality, artifact persistence, and user-change protection.
- `.trellis/workflow.md` remains the semantic center for workflow phases and breadcrumb body text.
- `.trellis/config.yaml` is the right place for user policy preferences, but config interpretation must be centralized.
- Codex is the default priority for this fork; other platforms should not drive scope unless shared files already affect Codex.
- Codex inline is now the default operating path; sub-agent context and JSONL behavior should be treated as an opt-in or platform-specific branch.
- Removed Codex launcher skill exclusion knobs should stay removed from this workflow policy design.

## Durable Domain Concepts

- Workflow state: `no_task`, `planning`, `in_progress`, `completed`, plus Codex virtual inline tags.
- Lifecycle command boundary: `create`, `start`, `finish`, `archive`.
- Skippable node: a workflow step that can stop blocking, prompting, or requiring artifacts without breaking Trellis task integrity.
- Policy gate: a workflow step whose strictness can vary without breaking Trellis task integrity.
- Hard invariant: a workflow rule that protects data, task state, or runtime reachability and cannot become a normal off switch.
- Mode toggle: a config value that chooses a route, such as `codex.dispatch_mode`, rather than enabling/disabling a step.
- UX ceremony: a visible planning or finish node that can be hidden, merged, downgraded, or summarized without changing task state integrity.
- Preset: a user-facing named skip bundle such as `full`, `balanced`, `lean`, or `manual`.

## Proposed Module Boundaries

- Keep config defaults and validation in one resolver, not scattered across hook scripts, phase extraction, and skills.
- Keep `workflow.md` as source of truth for prose and routing, but make configurable steps explicitly defer to injected policy.
- Keep TypeScript update/init code responsible for template shipping and config section append, not runtime policy interpretation.
- Keep task lifecycle commands (`task.py create/start/archive`) free from workflow policy toggles unless a future design intentionally adds a new status writer.
- Allow task/context helpers to consume workflow policy only when they already enforce the affected behavior, such as JSONL manifest seeding and planning readiness validation.
- Keep user education close to the config surface: config comments, runtime explanation, CLI explain output, and docs-site guide must all describe the same preset semantics.

## Test Surfaces

- Policy parser accepts missing config, valid nested config, invalid modes, and inline comments.
- Preset expansion is deterministic for `full`, `balanced`, `lean`, `manual`, and invalid values.
- `inject-workflow-state.py` emits both `<codex-mode>` and `<workflow-policy>` without breaking existing Codex routing.
- `workflow_phase.py` / `get_context.py --mode phase` exposes the same effective policy.
- `task.py create` respects `context.manifest_files` without breaking sub-agent platforms.
- `task.py start` readiness validation respects planning policy modes without allowing implementation before `in_progress`.
- Regression tests still protect task creation consent, planning artifact gates, Architecture Shaping, Grill Gate, and Phase 3.4 commit reachability.
- `trellis update` appends config section idempotently through `configSectionsAdded`.

## Toy-MVP Risks Avoided

- Avoided a one-off string replacement in `workflow.md` that would create separate policy truth in docs only.
- Avoided boolean-only config that cannot express safe middle states like `merge-with-check` or `required-plan`.
- Avoided hook-only implementation where per-turn breadcrumbs obey config but phase detail still says the old rule.
- Avoided making dangerous rules like sub-agent recursion guard configurable.

## Accepted Shallow Areas

- No implementation in this task.
- No local environment upgrade.
- No cross-platform UI design beyond preserving shared contracts.
- No new command UX in Phase A; direct config editing is acceptable for first implementation.

## Accepted Constraints

- Hard invariants listed in `design.md` must not become ordinary off switches.
- A single skip/policy resolver must be the source for effective workflow skip behavior.
- `workflow.md` whole-file update behavior must remain intact.
- Missing/invalid skip config must fall back to safe defaults that still preserve hard invariants.
- Codex inline/sub-agent behavior must continue to be controlled by `codex.dispatch_mode`.
- Do not reintroduce `codex.disabled_skills` / `codex.disabled_skill_paths` as workflow complexity controls.
- JSONL curation must be treated as sub-agent-mode context behavior; Codex inline should not surface it as a primary required node.

## Recommended But Adjustable

- Use `workflow.skip` as the Phase A config namespace.
- Use boolean skip flags for Phase A because the user-facing goal is to skip nodes; named modes can be Phase B.
- Add `workflow.preset` as the normal user-facing entry and treat `workflow.skip` as overrides.
- Implement Phase A before adding a command or UI surface.
- Keep skippable node names aligned with workflow nodes instead of internal implementation details.
- Include `context.manifest_files` in Phase A because Codex inline currently still sees seeded JSONL files when `.codex/` exists.

## Open Decisions

- Whether the first implementation should include every skippable node in the matrix or only Phase A core toggles.
- Whether `workflow.skip.goal_bridge` should ship in the first version or wait until Goal Mode usage stabilizes.
- Whether `final_quality_verification` should allow a true `off` value; current recommendation is no.
- Whether Phase B should add depth/mode policy after the skip-first implementation lands.
- Exact preset membership for `balanced` and `lean`.

## Rejected / Speculative Abstractions

- Multiple generated workflow templates for every policy combination.
- Runtime mutation of `.trellis/workflow.md` whenever config changes.
- A new `task.json.status` for each gate.
- A generic plugin system for policy gates in the first implementation.

## Open User Decisions

- Confirm whether the skip-first `workflow.skip` surface in `design.md` should be implemented as proposed.
- Confirm whether `workflow.preset` should be the primary user-facing entry for the skip switches.
