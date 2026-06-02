# Ambiguity Handling

Execution mode is unattended. Do not stop for non-blocking clarification questions. Classify ambiguity by risk and record the result in Trellis files.

## Risk Levels

| Level | Definition | Action |
|---|---|---|
| Low | A conservative default is obvious from repo evidence, existing specs, or normal Trellis workflow rules. | Record the default assumption and continue. |
| Medium | The contract has a meaningful product/scope/design question, but a conservative proxy challenge can resolve or narrow it without user input. | Use `trellis-grill-agents` unattended. |
| High | The answer can change scope, destroy data, alter production/auth/payment/deployment behavior, require secrets, or choose between incompatible outcomes. | Mark `BLOCKED`. |

## Low Ambiguity

Write the assumption in `prd.md` under `## Default Assumptions`:

```markdown
- Assumption: <default>
  Evidence: <file, command, spec, or observed convention>
  Why safe: <why this does not expand scope>
  Stop if: <mechanically detectable condition that invalidates it>
```

Then continue initialization or native goal handoff/continuation.

## Medium Ambiguity

Load and use `trellis-grill-agents`. The goal is unattended pressure-testing, not user questioning.

Persist outputs in three places:

- full material: `research/grill-agents-<topic>.md`
- summary and accepted assumptions: `prd.md`
- execution impact: `implement.md`

After the grill, update the Goal Contract or checkpoints. If the grill exposes a high-risk or scope-changing question, convert the result to `BLOCKED`.

## High Ambiguity

Do not guess. Record the block where it occurred:

- initialization: add `## Blocked Initialization` or `## Blocked Codex Native Goal Handoff` to `prd.md`
- native continuation: mark the current checkpoint `Status: blocked`, record evidence in `implement.md`, and report the blocked state; call `update_goal(status="blocked")` only under the native blocked-threshold policy

Use `BLOCKED` for conditions such as:

- user-visible behavior has mutually incompatible interpretations
- required files, APIs, or environments cannot be inspected
- completing the request requires credentials, destructive data changes, or production operations not already in scope
- the goal would require changing commit, archive, or task lifecycle policy
- existing dirty work would have to be overwritten or silently included

## Recording Rules

- Every ambiguity decision must name the evidence used.
- Every default assumption must say when it stops being safe.
- `trellis-grill-agents` output is advisory until the main session writes the synthesis into `prd.md` or `implement.md`.
- Do not use chat-only reasoning as durable state.
