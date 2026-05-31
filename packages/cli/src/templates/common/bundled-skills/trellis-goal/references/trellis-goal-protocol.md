# Trellis Goal Protocol

Trellis Goal prepares and executes a normal Trellis task with a Goal Contract. It does not replace Trellis phases, status values, commit policy, or finish/archive flow.

## Cadence

### One Slice Per Turn

Default cadence. Execute one pending `implement.md` Task Slice, record evidence, update progress, then stop so the client can continue automatically.

This is a throttle, not a scope limit. Do not ask the user to invoke `/goal` again between slices.

### Run To Completion

Use only when the user explicitly asks to run to completion, run the whole parent task, drain all pending slices, `一次性跑完`, `跑完整个父 task`, or equivalent.

In this cadence, finish initialization first, then continue executing pending slices in the same assistant turn until finalization or a terminal stop condition.

## Initialization

1. **Resolve entry source**
   - new request: create a normal Trellis task
   - planning conversion: use the current planning task
   - in-progress conversion: audit existing work and add `Reconcile Existing Work` as the first slice

2. **Register visible work**
   Use the platform todo/task tool when available. This is only per-turn visibility; durable state lives in Trellis files.

3. **Write the Goal Contract**
   Preserve the raw request in `prd.md`, then write `Goal Contract`, `Default Assumptions`, `Acceptance Criteria`, `Out of Scope`, and `Initialization Gate Evidence`.

4. **Handle ambiguity**
   Apply `ambiguity-handling.md`:
   - low risk: default assumption and continue
   - medium: use `trellis-grill-agents`
   - high risk: `BLOCKED`

5. **Write technical notes**
   Use `info.md` for project detection, relevant files, verification commands, risks, and rollback notes.

6. **Write execution slices**
   Use `implement.md`. Every slice must have:
   - `Slice Type: work` or `Slice Type: check`
   - `Status: pending`
   - an independent acceptance check
   - fields for work performed, verification evidence, remaining risk, and next step

   Insert one comprehensive check slice after every three non-check work slices. Check slices do not count toward the next group of three work slices.

7. **Configure context**
   Add relevant specs and research files to `implement.jsonl` and `check.jsonl`, or record the equivalent manifest in `prd.md`/`info.md` when the workflow is explicitly inline-only.

8. **Mark the task**
   Run `task.py mark-goal` with the correct `--source` and `--cadence`. Do not hand-edit `task.json`.

9. **Gate and activate**
   If the initialization gate passes:
   - for a planning task, run `task.py start <task>` when needed
   - for an already in-progress task, do not reset status
   - output `TRELLIS_GOAL_INIT_DONE` only when the turn stops after initialization

   If the gate fails:
   - record `## Blocked Initialization` in `prd.md`
   - do not start a planning task
   - output `TRELLIS_GOAL_INIT_BLOCKED`

## Continuation

At the start of every continuation:

1. Run or mentally reproduce `task.py goal-info <task>`.
2. Read `task.json`, `prd.md`, `info.md`, `implement.md`, `implement.jsonl`, and `check.jsonl`.
3. Confirm cadence from `task.json.meta.trellis_goal.cadence` and the current user message.
4. Execute the next pending slice.
5. Verify with evidence before marking it `done`.
6. Update the slice fields and `Progress Log`.

Evidence can be diff review, command output, logs, tests, typecheck, build, UI inspection, file review, or another concrete artifact suited to the slice. Do not mark a slice `done` from confidence alone.

## Run-To-Completion Loop

When cadence is `run-to-completion`:

1. Execute the first incomplete slice.
2. Verify and record evidence.
3. Immediately continue to the next incomplete slice.
4. Run comprehensive check slices at their planned positions.
5. Stop only at finalization or a terminal stop condition.

Terminal stop conditions:

- a Goal Contract `Stop If` condition triggers
- initialization, slice verification, or a comprehensive check finds an unresolved blocker
- the next action needs destructive data changes, production credentials, auth/payment/deployment changes, or other high-risk scope not explicitly allowed
- Trellis commit confirmation is required before continuing safely
- evidence cannot be preserved accurately due to context or tool-output limits
- the user pauses, redirects, or cancels the goal

When stopping early, update `implement.md` and report the blocked or paused state. Do not present an early stop as completion.

## Comprehensive Check Slice

Check all relevant dimensions before continuing:

- requirements drift
- code correctness
- lint/typecheck/build
- targeted and regression tests
- UI/UX states if relevant
- security and permission boundaries
- data consistency and migrations
- docs/spec synchronization
- rollback plan
- dirty git state and unrecognized files

Record results in the check slice.

## Finalization

When no pending slices remain:

1. Run final verification against the Goal Contract.
2. Fix high-risk issues found by final verification.
3. Run Trellis spec update judgment.
4. Follow Trellis Phase 3.4 commit confirmation policy.
5. Finish/archive through the normal Trellis workflow.
6. Output:

```text
TRELLIS_GOAL_COMPLETE
```

If commit confirmation or archive policy requires user confirmation, record the pending plan and stop there; do not claim full completion until the normal Trellis finish path is complete.
