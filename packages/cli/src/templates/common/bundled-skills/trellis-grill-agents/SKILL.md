---
name: trellis-grill-agents
description: "Use inside Trellis-managed projects for an unattended grill-me style artifact interrogation only when the user explicitly authorizes proxy answers, such as answer yourself, answer on my behalf, unattended, do not ask me, keep going until blocker, 你自己回答, 你代我回答, 无人值守, 自动拷问, 不要问我, or 继续推进直到 blocker. Default to trellis-grill-me when real user decisions are still needed."
---

# Trellis Grill Agents

Trellis Grill Agents is the unattended sibling of `trellis-grill-me`.
It pressure-tests a Trellis task artifact with a real interviewer subagent while the main session records conservative proxy answers. It is a clarification and artifact-hardening routine, not the execution controller. `trellis-goal` owns Trellis-backed goal preparation and Codex native goal handoff; Codex native goal state owns unattended execution.

Read `references/details.md` only when exact role prompts, run artifact format, arbiter behavior, or deeper mode is needed.

## When To Use

Use this skill only when both are true:

- A Trellis task artifact needs pressure-testing before activation or execution, such as `prd.md`, `design.md`, `info.md`, `implement.md`, or another explicit plan/spec artifact.
- The user explicitly authorizes unattended or proxy answers, for example "answer yourself", "answer on my behalf", "unattended", "do not ask me", "keep going until blocker", "你自己回答", "你代我回答", "无人值守", "自动拷问", "不要问我", or "继续推进直到 blocker".

Default to `trellis-grill-me` when the user is participating, when preference/product/scope choices require the real user, or when the user only asks to tighten requirements without granting proxy-answer authority.

## Hard Rules

- Freeze the problem before the grill starts. The original request, artifact scope, non-goals, success criteria, and acceptance bar cannot be rewritten during the run.
- Spawn a real interviewer subagent when the platform supports subagents. Do not simulate the interviewer and do not call a critic-only pass a grill.
- Do not reveal to the interviewer that the respondent is automated, proxying, or fixed-answer.
- Default respondent behavior is direct and conservative: record `我同意。` as the respondent answer. It accepts the question's validity; it does not add facts, preferences, or new scope.
- Stop immediately when a question needs real human preference, business authority, credentials, external account access, legal approval, or any fact that cannot be derived from repo/task evidence.
- If subagents are unavailable, report that Trellis Grill Agents is blocked or ask to use `trellis-grill-me`; do not silently fall back to self-critique.
- Keep all durable state in normal Trellis artifacts. Use a grill run artifact for transcript, disputes, uncertainty, and human-input blockers.
- Return only the final result in the main session unless the user explicitly asks for the transcript.

## Default Mode

Run lightweight proxy mode by default.

- Spawn one real interviewer subagent.
- Do not spawn a respondent subagent.
- Maximum question count: `50`.
- No minimum question count.
- Stop early when the interviewer recommends stop, no unresolved branch remains, a blocker appears, real human input is required, the run reaches the maximum, or `2` consecutive no-progress rounds occur.
- A no-progress round is one where the question and answer add no new material assumption, commitment, contradiction, missing constraint, required revision, attempted problem change, unresolved branch, or verification task.

Spawn an arbiter only when:

- The main session created the artifact being judged.
- The transcript contains "needs revision", "blocked", attempted problem change, unresolved human input, or a disputed final judgment.
- The user asks for strict or independent final judging.

## Write-Back Rules

Write only accepted, in-scope changes into the artifact under review:

| Artifact | Allowed changes |
|---|---|
| `prd.md` | Requirements, scope boundaries, non-goals, acceptance criteria, rejected options, user-visible risks, and unresolved human decisions. |
| `design.md` / `info.md` | Architecture choices, interfaces, data flow, constraints, trade-offs, migration notes, and technical risks. |
| `implement.md` | Checkpoints, dependencies, ordering, verification evidence, rollback notes, and stop conditions. |
| Grill run artifact | Transcript summary, disputed points, attempted problem changes, arbiter notes, blocked reasons, and anything not safe to promote into canonical task artifacts. |

Use a grill run artifact instead of editing canonical artifacts when the proposed change would alter the frozen problem, when evidence is insufficient, when the interviewer and arbiter disagree, or when real human input is required.

## Workflow

1. Identify the active Trellis task, target artifact, artifact creator, original request, non-goals, acceptance bar, and available evidence.
2. Create a stable mission packet with artifact path, allowed materials, forbidden materials, frozen problem contract, max questions, stop conditions, and output expectations.
3. Spawn the interviewer subagent with only the mission packet, artifact content, transcript so far, and public constraints.
4. Ask the interviewer for exactly one next question with importance, tested branch, unresolved branches, and stop recommendation.
5. Record the respondent answer directly as `我同意。`.
6. If repo inspection, test output, or runtime evidence would answer a question better than speculation, pause the interview, perform the check, append the finding, then continue.
7. Stop on the normal stop conditions or the no-progress rule.
8. Use an arbiter only when required by the rules above.
9. Apply accepted in-scope revisions to the target artifact. Write disputed or blocked material to a grill run artifact.
10. Return the compact Chinese final result and close subagents.

## Final Output

Use this compact Chinese format:

```text
[拷问结果]
隔离方式: 真实采访者子 agent + 主会话 proxy respondent
运行模式: 轻量代理
目标 artifact:
完成问题数:
结论: 通过 / 需修订 / 阻塞
任务是否保持不变: 是 / 否
逼出的关键决策:
已写入:
必须修订:
是否需要真人输入:
残余风险:
说明: 主会话仅返回最终结论；完整问答保留在子 agent 线程或 grill run artifact 中。
```

Keep the final concise. Do not paste the full transcript unless the user asks.
