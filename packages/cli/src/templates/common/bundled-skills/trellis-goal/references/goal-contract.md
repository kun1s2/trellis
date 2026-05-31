# Goal Contract

The Goal Contract turns a loose Trellis goal request into a bounded, verifiable task contract. It lives in `prd.md` and drives `implement.md` Task Slices.

## Required Fields

Every execution goal must contain:

1. **Objective**: one concrete sentence describing the final state.
2. **Scope**: files, subsystem, feature area, output artifact, and explicit boundaries.
3. **Constraints**: what must not change, compatibility rules, project instructions, and safety limits.
4. **Done When**: verifiable artifacts, exact commands, tests, file paths, or measurable outputs.
5. **Stop If**: mechanically detectable conditions that force `BLOCKED`, pause, or escalation.
6. **Token Budget**: a number when the user provides one; otherwise `not specified`.
7. **Project Type**: detected type plus evidence.
8. **Scenario**: selected scenario from `scenarios.md`, or `Custom`.
9. **Execution Cadence**: `one-slice-per-turn` or `run-to-completion`, with user evidence for run-to-completion.

## Quality Gate

Before starting or continuing execution, verify:

- The raw user request is preserved verbatim.
- Objective has one concrete final state.
- Scope is smaller than "the whole repository" unless the goal is read-only or the output is tightly bounded.
- At least three `Done When` items exist.
- At least three `Stop If` items exist.
- Each `Done When` item maps to one or more slice acceptance checks or final verification items.
- Each `Stop If` item includes a detection method.
- Vague words such as "improve", "optimize", "all", "everything", and "clean up" are converted into bounded actions.
- Existing tests must not be skipped, weakened, or rewritten to hide a regression.
- Every default assumption records evidence, why it is safe enough, and when it stops being safe.
- Medium ambiguity has a `trellis-grill-agents` record or has been reclassified.
- High-risk or scope-changing ambiguity is recorded as `BLOCKED`.

If the gate fails during initialization, keep the task unstarted or unchanged, record `Blocked Initialization`, and output `TRELLIS_GOAL_INIT_BLOCKED`.

## Field Mapping

| Contract Field | Trellis Location |
|---|---|
| Raw request | `prd.md` `## Raw Goal Input` |
| Objective / Scope / Constraints / Done When / Stop If / Token Budget / Project Type / Scenario / Cadence | `prd.md` `## Goal Contract` |
| Default assumptions | `prd.md` `## Default Assumptions` |
| User-visible acceptance | `prd.md` `## Acceptance Criteria` |
| Out-of-scope boundaries | `prd.md` `## Out of Scope` |
| Technical evidence and commands | `info.md` |
| Execution slices | `implement.md` `## Task Slices` |
| Context manifests | `implement.jsonl`, `check.jsonl`, and `prd.md` or `info.md` when inline-only |
| Ambiguity review | `prd.md`, `implement.md`, and `research/grill-agents-<topic>.md` |

The Goal Contract is not complete until `implement.md` contains independently verifiable slices derived from it.
