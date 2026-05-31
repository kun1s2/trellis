# PRD Mapping

Use these skeletons when initializing or converting a Trellis goal task. Keep raw user input verbatim.

## `prd.md`

````markdown
# <task title>

## Raw Goal Input

```text
<verbatim user input or existing task request>
```

## Existing Planning Notes

Only include this section when converting an existing task. Preserve useful prior PRD material here before rewriting the goal-facing contract.

## Goal Contract

- Objective: <one concrete final state>
- Scope: <files, directories, subsystem, output artifact, and boundaries>
- Constraints:
  - <constraint>
- Done When:
  1. <verifiable artifact>
  2. <verifiable artifact>
  3. <verifiable artifact>
- Stop If:
  1. <mechanically detectable condition plus detection method>
  2. <mechanically detectable condition plus detection method>
  3. <mechanically detectable condition plus detection method>
- Token Budget: <number or "not specified">
- Project Type: <detected type and evidence>
- Scenario: <scenario or Custom>
- Execution Cadence: <one-slice-per-turn | run-to-completion; include user evidence for run-to-completion>

## Default Assumptions

- Assumption: <default>
  Evidence: <file, command, spec, or observed convention>
  Why safe: <why this does not expand scope>
  Stop if: <condition that invalidates it>

## Ambiguity Handling

| Topic | Level | Decision | Evidence | Trellis Record |
|---|---|---|---|---|
| <topic> | low/medium/high | <default/grill-agents/BLOCKED> | <evidence> | <prd/info/implement/research path> |

## Acceptance Criteria

- [ ] <user-visible or artifact-visible result>

## Context Manifest Plan

| Action | File | Reason |
|---|---|---|
| implement | `.trellis/spec/.../index.md` | <why implement work needs it> |
| check | `.trellis/spec/.../quality-guidelines.md` | <why check work needs it> |

## Out of Scope

- <explicit non-goal>

## Conversion Audit

Only include for in-progress conversion.

- Existing work:
- Verified evidence:
- Unverified work:
- Reconciliation slice:

## Blocked Initialization

Only include if initialization fails. Include the blocked condition, evidence, and next safe action.

## Initialization Gate Evidence

- Goal marker: `task.py mark-goal ...` <result or pending reason>
- Done When mapping: <each item maps to slice acceptance or final verification>
- Stop If detection: <each stop condition has a detection method>
- Ambiguity handling: <low defaults / grill-agents files / blocked>
- Context curation: <implement.jsonl/check.jsonl entries or inline equivalent>
- Slice counts: <work slice count and check slice positions>
- Dirty-state review: <evidence no source code changed during initialization>
- Validation: `task.py validate <task>` <result or reason unavailable>
````

## `info.md`

````markdown
# Technical Notes

## Project Detection

- <evidence from files, scripts, specs, or repository layout>

## Relevant Files

- `<path>`: <why it matters>

## Verification Commands

- `<command>`: <what it proves>

## Risks

- <risk and mitigation>

## Rollback Notes

- <rollback or recovery route>

## Grill-Agent Notes

- `<research/grill-agents-<topic>.md>`: <summary and accepted execution impact>
````

## `implement.md`

````markdown
# Implementation Plan

## Execution Cadence

- Mode: <one-slice-per-turn | run-to-completion>
- Trigger: <default | user explicitly requested run-to-completion>
- Same-Turn Drain: <disabled | enabled until finalization or terminal stop>
- Stop Conditions: Goal Contract `Stop If`, unresolved blocker, high-risk out-of-scope action, required commit confirmation, insufficient context/tool budget, user pause/cancel.

## Task Slices

### Slice 1: <small independently verifiable action>
- Slice Type: work
- Status: pending
- Acceptance: <how this slice is verified>
- Work Performed:
- Verification Evidence:
- Remaining Risk:
- Next Step:

### Slice 2: <small independently verifiable action>
- Slice Type: work
- Status: pending
- Acceptance: <how this slice is verified>
- Work Performed:
- Verification Evidence:
- Remaining Risk:
- Next Step:

### Slice 3: <small independently verifiable action>
- Slice Type: work
- Status: pending
- Acceptance: <how this slice is verified>
- Work Performed:
- Verification Evidence:
- Remaining Risk:
- Next Step:

### Slice 4: Comprehensive Check After Slices 1-3
- Slice Type: check
- Status: pending
- Acceptance: scope, tests, typecheck/build, UI/UX if relevant, security, data consistency, docs, rollback, and remaining risks are reviewed.
- Work Performed:
- Verification Evidence:
- Remaining Risk:
- Next Step:

## Progress Log

- <timestamp/session>: <summary>
````

## Slice Status Values

Use plain text status values only:

- `pending`
- `in_progress`
- `blocked`
- `done`

Do not add new `task.json.status` values for slices.
