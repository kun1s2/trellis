# Architecture Shaping

## Scope Reviewed

P0 hardening from the workflow audit:

- repair Trellis user-facing Chinese mojibake / encoding drift;
- add planning gate validation;
- add Goal Contract validation.

Relevant source areas include local `.trellis/` runtime scripts, local generated platform files, `.agents/skills/`, packaged `packages/cli/src/templates/**`, CLI command/test files, and `.trellis/spec/**`.

## Long-Lived Assumptions

- Trellis projects are long-lived and generated files must stay in sync with packaged templates when the generator owns them.
- `.trellis/workflow.md` remains the editable source of truth for breadcrumb bodies.
- `task.json.status` remains the lifecycle status source; adding status writers requires spec updates.
- Goal Mode is a Codex native bridge, not a Trellis-local execution runtime.
- Session-scoped active task state remains under `.trellis/.runtime/sessions/`.

## Durable Domain Concepts

- Planning readiness validation.
- Goal Contract validation.
- Template/source-of-truth ownership.
- Encoding-safe human-facing output.
- Evidence Chain and checkpoint recovery.

## Proposed Module Boundaries

- Validation logic should live in reusable script/helper code, not only in skill prose.
- CLI command wiring should call validation helpers and format actionable messages.
- Template repair should happen at the template source where possible, then generated/local mirrors only when needed.
- Tests should target validation helpers and command behavior, not fragile chat wording.

## Test Surfaces

- Unit tests for validation helpers.
- Regression tests for workflow-state gate invariants and Chinese text preservation.
- Integration-style tests for `task.py` validation commands if existing harness supports Python template scripts.
- Manual validation commands recorded in `implement.md` when automated coverage is not yet available.

## Toy-MVP Risks Avoided

- Avoid scattered ad hoc string checks in `cmd_start` or `cmd_mark_goal`.
- Avoid fixing only local generated files while leaving packaged templates broken.
- Avoid local native-goal simulation.
- Avoid broad P1/P2 backlog implementation inside a P0 goal.

## Accepted Shallow Areas

- The exact validation command name may remain simple if tests and docs make it discoverable.
- Markdown-based checkpoint validation may be initially conservative if it detects required headings/status lines and produces actionable errors.

## Accepted Constraints

- Keep workflow-state body source in `.trellis/workflow.md`.
- Preserve session-scoped active task model.
- Do not add a second goal runtime.
- Keep validation evidence-backed and deterministic.
- Update specs when new runtime contracts are introduced.

## Recommended But Adjustable

- Prefer a reusable validation helper module for planning and goal checks.
- Prefer warning-first compatibility when hard-blocking could break existing local tasks, unless the Goal agent finds evidence that hard-blocking is expected.
- Prefer `task.py goal-validate` plus optional `mark-goal` integration over hidden validation behavior.

## Open Decisions

- Whether planning gate validation should block `task.py start` by default.
- Whether Goal validation should be a dedicated command, an option on `mark-goal`, or both.
- Whether mojibake repair requires broad template regeneration or targeted template/local edits.

## Rejected / Speculative Abstractions

- A new task lifecycle engine.
- A new goal checkpoint queue file.
- A new runtime mailbox.
- An ADR directory or architecture registry for this goal.

## Open User Decisions

- Expanding to P1/P2 audit items.
- Changing default Codex dispatch behavior.
- Removing or redesigning the `completed` breadcrumb flow.
