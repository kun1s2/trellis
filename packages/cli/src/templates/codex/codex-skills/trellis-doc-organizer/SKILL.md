---
name: trellis-doc-organizer
description: "Organize existing Trellis task/spec/research docs in place to reduce downstream agent context and prevent duplicate or drifting facts across prd.md, design.md, implement.md, research/*.md, and .trellis/spec. Use when task conclusions were promoted to specs, PRD/design/implement repeat the same facts, research docs contain stale directions, or the user asks to clean up Trellis docs without creating a new summary layer."
---

# Trellis Doc Organizer

Use this Codex-specific skill to organize existing Trellis documents in place so
future agents can read less context and still get the current facts right.

This skill is about document authority and context reduction. It is not a
Markdown formatter, not a semantic duplicate scanner, and not a replacement for
`trellis-update-spec`, `trellis-spec-bootstarp`, or `trellis-check`.

## Core Rule

Organize the existing Trellis artifacts. Do not create a new default brief,
summary, source map, ADR directory, second task queue, or other new context
layer.

The default outcome is shorter, clearer versions of the files that Trellis
agents already read:

- `prd.md`
- `design.md`
- `implement.md`
- `research/*.md`
- `.trellis/spec/**`

Only create a new document if the user explicitly asks for it, or if the
existing artifacts cannot safely carry a tiny pointer/status note. When you do,
write the reason in the task artifact before creating it.

## Use When

Use this skill when existing Trellis docs make downstream agents read too much
context or risk reading stale facts:

- The user asks to organize, clean up, compress, or reduce context in current
  Trellis task docs.
- `prd.md`, `design.md`, and `implement.md` repeat the same product, design, or
  implementation facts.
- A task conclusion has been promoted into `.trellis/spec/`, but the original
  task docs still repeat the full rule.
- Multiple `research/*.md` files cover the same topic without a clear current
  source.
- Old prompts, concept notes, or research drafts remain searchable and could be
  mistaken for the current direction.
- `implement.jsonl` or `check.jsonl` would need many research files just to
  make an agent understand the task.
- `trellis-check` reports doc drift, duplicate facts, or stale research
  guidance across task/spec documents.

## Skip When

Do not use this skill when:

- The task is small, PRD-only, and has no duplicated or drifting facts.
- The only needed action is to capture a new long-term rule in `.trellis/spec/`;
  use `trellis-update-spec`.
- The project needs a full `.trellis/spec/` bootstrap or refresh; use
  `trellis-spec-bootstarp`.
- The work is post-implementation quality verification; use `trellis-check`.
- The request is only to make Markdown prettier and does not affect downstream
  agent context or fact accuracy.

## Document Authority Model

Use these ownership rules when deciding where a fact belongs:

| Artifact | Owns | Must Not Own |
| --- | --- | --- |
| `.trellis/spec/**` | Long-term project rules, reusable implementation contracts, cross-task conventions | Current task goals, one-off product scope, temporary mock decisions |
| `prd.md` | Current task goal, scope, user value, constraints, acceptance criteria | Detailed design, execution checklist, long repeated spec rules |
| `design.md` | Current task architecture, stable boundaries, design decisions, tradeoffs, conflict resolution | Product wish list, step-by-step execution plan |
| `implement.md` | Ordered work plan, validation commands, quality gates, rollback/risk points | Product vision, repeated design rationale |
| `research/*.md` | Evidence, explorations, alternatives, detailed topic notes, historical record | Final authority when a task/spec artifact has superseded it |
| `.trellis/workspace/**` | Session journal and memory | Product, design, or implementation source of truth |

## Workflow

### 1. Resolve Scope

Find the active task and read the current artifacts:

```bash
python3 ./.trellis/scripts/task.py current --source
```

Read, when present:

1. `prd.md`
2. `design.md`
3. `implement.md`
4. relevant `research/*.md`
5. relevant `.trellis/spec/**` indexes and referenced spec files

Do not organize from memory or from a chat summary alone. Read the real files
before editing.

### 2. Identify Repeated Topics

Look for topic-level repetition, not only identical text:

- same product direction repeated across PRD/design/implement
- same boundary repeated in task docs and `.trellis/spec/`
- same screen/session/API/module rule repeated in several research files
- old notes that contradict the current task direction
- task-specific facts that were accidentally promoted into `.trellis/spec/`

For each topic, decide the owner using the authority model above.

### 3. Organize In Place

Move or reduce content according to ownership:

- Put task goal, scope, constraints, and acceptance criteria in `prd.md`.
- Put stable boundaries, design decisions, and tradeoffs in `design.md`.
- Put ordered execution, validation commands, gates, and rollback notes in
  `implement.md`.
- Put long-term reusable rules in `.trellis/spec/**`.
- Keep detailed evidence and exploration in `research/*.md`.

After a long-term rule is promoted to `.trellis/spec/**`, shorten task docs to
a pointer such as:

```markdown
This task follows the project boundary in `.trellis/spec/frontend/project-boundaries.md`.
Task-specific scope: build the frontend prototype only.
```

Do not copy the full spec rule back into PRD/design/implement.

### 4. Lower Authority For Stale Sources

Preserve source documents by default. Do not delete historical research just
because it is no longer current.

Add a clear status note at the top of a stale or duplicate research file:

```markdown
> Document status: superseded.
> Current source: `research/screen-flow-and-session-boundaries.md`.
> Keep this file only as historical exploration.
```

Use these statuses:

- `canonical`: current detailed source for the topic.
- `supporting`: evidence or details that support another current source.
- `historical`: old exploration that should not guide current implementation.
- `superseded`: replaced by a newer task/spec/research document.
- `pointer`: intentionally short file that redirects to the current source.

If two research files say the same thing, keep the stronger one as the current
source and turn the weaker one into a pointer/status note. Do not create a new
source-map file by default.

### 5. Keep Specs Clean

Before adding or keeping content in `.trellis/spec/**`, ask:

- Will this rule still be true for future tasks?
- Is it an implementation convention or contract, not just this task's product
  scope?
- Can another task safely rely on it without reading this task's PRD?

If the answer is no, keep the fact in the task artifacts or research instead.
Do not turn `.trellis/spec/**` into a copy of the task PRD.

### 6. Update Context Manifests Only If Needed

If the task uses `implement.jsonl` or `check.jsonl`, keep those manifests
pointing to the few current files downstream agents actually need.

Prefer curated existing artifacts:

```jsonl
{"file": ".trellis/spec/frontend/project-boundaries.md", "reason": "Current frontend boundary"}
{"file": ".trellis/tasks/<task>/research/screen-flow-and-session-boundaries.md", "reason": "Canonical screen/session flow"}
```

Do not add stale `historical` or `superseded` files unless the downstream agent
needs evidence for a dispute or audit.

## Downstream Agent Consumption

After organization, downstream agents should still use the normal Trellis read
order:

1. `prd.md`
2. `design.md` when present
3. `implement.md` when present
4. curated files from `implement.jsonl` or `check.jsonl`
5. relevant `.trellis/spec/**`

The improvement comes from those existing files being shorter, clearer, and
less contradictory. Do not require downstream agents to read a new default
summary first.

## Relationship To Other Skills

| Skill | Relationship |
| --- | --- |
| `trellis-brainstorm` | Creates and refines task planning artifacts. This skill cleans up repetition after planning grows messy. |
| `trellis-update-spec` | Promotes long-term rules into `.trellis/spec/**`. This skill cleans up task/research duplication after promotion. |
| `trellis-spec-bootstarp` | Builds or refreshes project specs. This skill prevents refreshed specs from becoming a second copy of task docs. |
| `trellis-check` | Verifies implementation and catches drift. This skill can fix doc drift when check reports it. |

## Done Criteria

Before finishing, confirm:

- Each important fact has one clear owner.
- `prd.md`, `design.md`, and `implement.md` do not repeat long passages.
- Task docs reference `.trellis/spec/**` instead of copying long-term rules.
- Stale research is marked `historical`, `superseded`, or `pointer`.
- No new default summary/source-map layer was created.
- Downstream agents can understand the current task by reading fewer current
  artifacts and curated context manifests.
