# Trellis Grill Agents Details

Read this file only when the main `SKILL.md` is not enough to run the grill safely.

## Mission Packet

Create a mission packet before spawning the interviewer:

```text
Task directory:
Target artifact:
Artifact creator:
Original request:
Frozen problem statement:
Non-goals:
Success criteria:
Acceptance bar:
Allowed evidence:
Forbidden evidence:
Mode: lightweight proxy
Maximum questions: 50
Stop conditions:
Main-session output: final result only
Write-back target:
Run artifact path, if needed:
```

The mission packet is the boundary. The interviewer may expose gaps inside that boundary, but must not expand or replace it.

## Interviewer Prompt Shape

Give the interviewer only public material:

```text
You are the interviewer for a Trellis artifact grill.

Interrogate the artifact one question at a time.
Do not assume the respondent is automated.
Do not rewrite the problem.
Ask only the next highest-value question.
Prefer questions that test scope, acceptance criteria, risks, contradictions, missing decisions, verification, and execution order.

Return exactly:
- Question:
- Why it matters:
- Branch being tested:
- Unresolved branches:
- Recommended answer direction, if any:
- Stop recommendation: continue / stop / blocked / needs human input
- Suggested artifact write-back, if the respondent agrees:
```

## Respondent Rule

In lightweight proxy mode, the main session records this respondent answer:

```text
我同意。
```

Interpretation:

- It means the respondent accepts the interviewer question as valid.
- It does not mean the respondent added new requirements.
- It does not authorize changing the frozen problem.
- It does not let the main session invent facts or preferences.

When a direct answer would require real human input, do not answer as proxy. Stop and mark the run as `needs human input`.

## Arbiter Prompt Shape

Use an arbiter only when required by the main skill:

```text
You are the arbiter for a Trellis Grill Agents run.

Inputs:
- Frozen problem
- Target artifact
- Interview transcript summary
- Proposed write-backs
- Evidence checks

Decide:
- pass / needs revision / blocked
- whether the task stayed unchanged
- which proposed write-backs are safe to promote into canonical artifacts
- which items must remain in the grill run artifact
- whether real human input is required

Do not create new requirements. Do not approve changes that alter the frozen problem.
```

## Run Artifact Format

Use a run artifact when the transcript, disagreement, or blocker should be durable but not canonical task state.

Recommended path:

```text
{TASK_DIR}/research/grill-agents/<artifact-name>-<YYYYMMDD-HHMM>.md
```

Recommended content:

```markdown
# Trellis Grill Agents Run

- Target artifact:
- Date:
- Mode: lightweight proxy
- Frozen problem:
- Conclusion: pass / needs revision / blocked
- Human input required: yes / no

## Transcript Summary

| Round | Question | Branch | Respondent | Result |
|---:|---|---|---|---|

## Accepted Write-Backs

## Rejected Or Deferred Changes

## Attempted Problem Changes

## Human-Input Blockers

## Arbiter Notes
```

## Deeper Mode

Use deeper mode only when the user explicitly requests it. Deeper mode may spawn a separate respondent subagent, but the same frozen-problem and human-input rules apply.

In deeper mode:

- The respondent subagent may answer from repository and task evidence only.
- It must label assumptions.
- It must not invent preferences or scope.
- Any answer that would normally require the user becomes `needs human input`.
- Use an arbiter by default before promoting revisions into canonical artifacts.

## Write-Back Promotion Test

Promote a finding into `prd.md`, `design.md`, `info.md`, or `implement.md` only when all are true:

- It is inside the frozen problem.
- It is supported by artifact/repository evidence or by an explicit prior user statement.
- It improves clarity, acceptance criteria, execution ordering, or verification.
- It does not hide uncertainty.
- It does not create a second source of truth.

Otherwise keep it in the grill run artifact.
