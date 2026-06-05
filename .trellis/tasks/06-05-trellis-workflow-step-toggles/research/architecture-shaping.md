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
- `packages/cli/src/templates/trellis/scripts/task.py`
- `.trellis/spec/cli/backend/workflow-state-contract.md`
- `.trellis/spec/cli/backend/commands-update.md`
- `.trellis/spec/cli/backend/commands-workflow.md`
- `.trellis/spec/cli/backend/platform-integration.md`

## Long-Lived Assumptions

- Trellis projects are long-lived, so workflow gates should default to preserving planning quality, artifact persistence, and user-change protection.
- `.trellis/workflow.md` remains the semantic center for workflow phases and breadcrumb body text.
- `.trellis/config.yaml` is the right place for user policy preferences, but config interpretation must be centralized.
- Codex is the default priority for this fork; other platforms should not drive scope unless shared files already affect Codex.

## Durable Domain Concepts

- Workflow state: `no_task`, `planning`, `in_progress`, `completed`, plus Codex virtual inline tags.
- Lifecycle command boundary: `create`, `start`, `finish`, `archive`.
- Policy gate: a workflow step whose strictness can vary without breaking Trellis task integrity.
- Hard invariant: a workflow rule that protects data, task state, or runtime reachability and cannot become a normal off switch.
- Mode toggle: a config value that chooses a route, such as `codex.dispatch_mode`, rather than enabling/disabling a step.

## Proposed Module Boundaries

- Keep config defaults and validation in one resolver, not scattered across hook scripts, phase extraction, and skills.
- Keep `workflow.md` as source of truth for prose and routing, but make configurable steps explicitly defer to injected policy.
- Keep TypeScript update/init code responsible for template shipping and config section append, not runtime policy interpretation.
- Keep task lifecycle commands (`task.py create/start/archive`) free from workflow policy toggles unless a future design intentionally adds a new status writer.

## Test Surfaces

- Policy parser accepts missing config, valid nested config, invalid modes, and inline comments.
- `inject-workflow-state.py` emits both `<codex-mode>` and `<workflow-policy>` without breaking existing Codex routing.
- `workflow_phase.py` / `get_context.py --mode phase` exposes the same effective policy.
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
- A single policy resolver must be the source for effective workflow policy.
- `workflow.md` whole-file update behavior must remain intact.
- Missing/invalid policy config must fall back to conservative defaults.
- Codex inline/sub-agent behavior must continue to be controlled by `codex.dispatch_mode`.

## Recommended But Adjustable

- Use `workflow.policy` as the config namespace.
- Use named modes instead of plain booleans for most gates.
- Implement Phase A before adding a command or UI surface.
- Keep `Architecture Shaping`, `Grill Gate`, and `complex_artifacts` defaulting to `required`.

## Open Decisions

- Whether the first implementation should include every policy in the matrix or only Phase A core toggles.
- Whether `workflow.policy.goal.enabled` should ship in the first version or wait until Goal Mode usage stabilizes.
- Whether `final_quality_verification` should allow a true `off` value; current recommendation is no.

## Rejected / Speculative Abstractions

- Multiple generated workflow templates for every policy combination.
- Runtime mutation of `.trellis/workflow.md` whenever config changes.
- A new `task.json.status` for each gate.
- A generic plugin system for policy gates in the first implementation.

## Open User Decisions

- Confirm whether the conservative defaults in `design.md` should be implemented as proposed.
