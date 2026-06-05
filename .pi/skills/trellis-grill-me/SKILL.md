---
name: trellis-grill-me
description: "Use inside Trellis-managed projects for attended Phase 1 Grill Gate interrogation with the real user. Pressure-test PRD, design, and implementation-plan artifacts one question at a time, prefer repo evidence before asking, recommend an answer with each question, write confirmed decisions back to Trellis artifacts, and stop on unresolved human blockers."
---

# Trellis Grill Me

Trellis Grill Me is the attended Phase 1 Grill Gate. It pressure-tests Trellis planning artifacts with the real user after initial artifacts exist and before `task.py start`.

Use it for product intent, scope, preference, UX, compatibility, security, data integrity, architecture tradeoffs, or implementation-plan choices that require the user.

It grills the plan, not the source code: `implement.md` is the Phase 1 implementation plan, while Phase 2 source changes are verified later by `trellis-check`.

## Workflow

1. Identify the active task. Run `python ./.trellis/scripts/task.py current --source` if needed, then read `prd.md`, `design.md` if present, and `implement.md` if present.
2. Choose the target artifact: `prd.md` for requirements and scope, `design.md` for technical choices, `implement.md` for execution order, verification, rollback, and stop conditions.
3. Freeze the original problem: request, scope, non-goals, success criteria, and acceptance bar. Do not let the interview silently change them.
4. Answer repository-answerable questions first by inspecting code, specs, tests, docs, or research artifacts. Ask the user only for human-authority decisions.
5. Interview relentlessly until shared understanding is reached. Ask exactly one question at a time, and include why it matters plus your recommended answer.
6. After each answer, write confirmed decisions, rejected branches, and acceptance changes into the target Trellis artifact. Keep notes concise.
7. Record unresolved human decisions as blockers. Do not answer them for the user.
8. Finish by recording the Grill Gate result in `prd.md` or `implement.md`.

## Grill Gate Results

- `trellis-grill-me required` while attended decisions remain.
- `trellis-grill-agents required` only when the user explicitly authorized unattended or proxy answers.
- `skip grill, because ...` only when repo/task evidence proves the task is mechanical, low-risk, and acceptance is explicit.

## Output

Keep the conversation active and short. The durable output is updated `prd.md`, `design.md`, or `implement.md`, plus a clear blocker if user input is still required.
