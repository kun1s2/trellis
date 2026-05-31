# Trellis Task Mapping

Trellis Goal uses the existing Trellis task lifecycle. The goal marker is metadata, not a second lifecycle.

## Durable Files

| Purpose | Location |
|---|---|
| Lifecycle status | `task.json.status` (`planning`, `in_progress`, existing archive flow) |
| Goal routing marker | `task.json.meta.trellis_goal` |
| Raw request and Goal Contract | `prd.md` |
| Technical notes, evidence, risks, verification commands | `info.md` |
| Task Slices and progress log | `implement.md` |
| Implementation context manifest | `implement.jsonl` |
| Check context manifest | `check.jsonl` |
| Long research or grill output | `research/*.md` |

Do not create another goal directory, slice queue, task status, runtime mailbox, or hidden durable state.

## Metadata Shape

Use `task.py mark-goal` to write this metadata:

```json
{
  "meta": {
    "trellis_goal": {
      "enabled": true,
      "version": 1,
      "cadence": "one-slice-per-turn",
      "source": "new-request",
      "converted_from_status": "planning",
      "converted_at": "2026-05-31T12:00:00+08:00",
      "updated_at": "2026-05-31T12:00:00+08:00"
    }
  }
}
```

Allowed `cadence` values:

- `one-slice-per-turn`
- `run-to-completion`

Allowed `source` values:

- `new-request`
- `planning-task`
- `in-progress-task`

The marker helps agents route and resume. It must not duplicate the Goal Contract, slice list, or task lifecycle.

## New Goal Request

1. Create a normal Trellis task with `task.py create`.
2. Write `prd.md`, `info.md`, `implement.md`, `implement.jsonl`, and `check.jsonl`.
3. Run:

```bash
python3 ./.trellis/scripts/task.py mark-goal <task> --source new-request --cadence one-slice-per-turn
```

Use `--cadence run-to-completion` only when the user explicitly requested same-turn draining.

## Planning Task Conversion

Use this when an existing task is still `planning`.

1. Read the current `prd.md` and task artifacts.
2. Preserve material that matters under `## Existing Planning Notes` or equivalent.
3. Rewrite the goal-facing sections into `Raw Goal Input`, `Goal Contract`, `Default Assumptions`, `Acceptance Criteria`, `Out of Scope`, and `Initialization Gate Evidence`.
4. Create or update `implement.md` slices from the contract.
5. Configure `implement.jsonl` and `check.jsonl`.
6. Run:

```bash
python3 ./.trellis/scripts/task.py mark-goal <task> --source planning-task --cadence one-slice-per-turn
```

Do not run `task.py start` until initialization has passed.

## In-Progress Task Conversion

Use this when the task is already `in_progress`.

1. Perform a Conversion Audit before changing execution shape.
2. Record the audit in `prd.md` or `info.md`:
   - what work already exists
   - what evidence proves it
   - what remains unknown
   - whether current work matches the new Goal Contract
3. Add the first `implement.md` slice as `Reconcile Existing Work`.
4. Mark existing verified work as done only when evidence is present.
5. Run:

```bash
python3 ./.trellis/scripts/task.py mark-goal <task> --source in-progress-task --cadence one-slice-per-turn
```

In-progress conversion does not reset status to `planning` and does not erase existing progress.

## Resume And Audit

Run:

```bash
python3 ./.trellis/scripts/task.py goal-info <task>
```

Use the output to confirm cadence, source, original status, conversion time, and slice summary before choosing the next execution step.
