---
name: trellis-goal
description: "Use inside Trellis-managed projects when a user invokes /goal, mentions goal mode, target mode, unattended autonomous Trellis work, run-to-completion goals, long-running auto-advance tasks, or asks to initialize, convert, continue, pause, block, or complete an audit-friendly Trellis goal. Also trigger on 目标模式, 无人值守任务, 自动推进, 长期任务, 一次性跑完, 跑完整个父 task, and keep working until done."
---

# Trellis Goal

Trellis Goal runs unattended work inside the normal Trellis task lifecycle. It turns a raw request into a Goal Contract, stores the contract in `prd.md`, stores execution slices in `implement.md`, marks the task with `task.json.meta.trellis_goal`, and then advances the task through existing Trellis phases.

## Entry Modes

1. **New goal request**: when the user invokes `/goal <request>` or asks Trellis to run an unattended goal, read `references/goal-contract.md`, `references/task-mapping.md`, `references/ambiguity-handling.md`, `references/trellis-goal-protocol.md`, and `references/prd-mapping.md`. Create a normal Trellis task, initialize the Goal Contract and slices, then run `task.py mark-goal <task> --source new-request`.
2. **Planning task conversion**: when an existing planning task should become a goal, preserve the current PRD content as evidence, rewrite it into the Goal Contract structure, create/update `implement.md`, then run `task.py mark-goal <task> --source planning-task`.
3. **In-progress task conversion**: when an already-started task should become a goal, first perform a Conversion Audit and add the first slice as `Reconcile Existing Work`. Then run `task.py mark-goal <task> --source in-progress-task`. Do not pretend existing work was goal-planned from the start.
4. **Continuation**: if `task.json.meta.trellis_goal.enabled` is true, or `prd.md` contains a Trellis Goal Contract, load this skill before continuing implementation or checks.
5. **Contract-only mode**: only when the user explicitly asks to write, review, or improve goal text without running it, use `references/goal-contract.md` and do not create, mark, start, or modify a Trellis task.

## Hard Rules

- Use ordinary Trellis task state only: `task.json`, `prd.md`, `info.md`, `implement.md`, `implement.jsonl`, `check.jsonl`, and `research/`.
- Do not add a new `task.json.status`, a separate goal directory, a slice queue file, or another durable source of truth.
- Do not edit business/source code during goal initialization. Initialization writes only Trellis task artifacts and context manifests.
- Preserve the raw user request verbatim in `prd.md`.
- `prd.md` is the Goal Contract source of truth; `implement.md` is the Task Slice execution source of truth.
- Use `task.py mark-goal` for `task.json.meta.trellis_goal`; do not hand-edit goal metadata.
- Use `task.py goal-info` when resuming or auditing goal metadata and slice progress.
- Configure `implement.jsonl` and `check.jsonl` during initialization unless the local workflow explicitly runs inline; if inline, record the same context manifest in `prd.md` or `info.md`.
- Default cadence is one pending Task Slice per assistant turn. Explicit "run to completion", "drain all pending slices", "一次性跑完", or "跑完整个父 task" enables same-turn draining.
- Low-risk ambiguity becomes a recorded default assumption; medium ambiguity uses `trellis-grill-agents`; high-risk or scope-changing ambiguity becomes `BLOCKED`.
- Goal execution must not bypass Trellis Phase 3.4 commit confirmation policy.

## Sentinels

Use these exact final outputs only for initialization outcomes:

```text
TRELLIS_GOAL_INIT_DONE
TRELLIS_GOAL_INIT_BLOCKED
```

Use this exact final output when every slice and required Trellis finish step is complete:

```text
TRELLIS_GOAL_COMPLETE
```

Do not emit an initialization sentinel as the final response in run-to-completion cadence; continue into execution after initialization succeeds.

## References

- `references/trellis-goal-protocol.md`: canonical initialization, continuation, run-to-completion, and finalization protocol.
- `references/task-mapping.md`: Trellis persistence model, metadata shape, and conversion rules.
- `references/goal-contract.md`: Goal Contract fields and quality gate.
- `references/ambiguity-handling.md`: low/medium/high ambiguity policy and `trellis-grill-agents` recording rules.
- `references/prd-mapping.md`: `prd.md`, `info.md`, and `implement.md` skeletons.
- `references/project-types.md`: project-type defaults for verification and stop conditions.
- `references/scenarios.md`: common goal scenario patterns.
- `references/examples.md`: compact examples and anti-examples.
- `references/upstream-license.md`: license notice for prompt-shaping material.
