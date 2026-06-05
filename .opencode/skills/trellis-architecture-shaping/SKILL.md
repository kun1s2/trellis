---
name: trellis-architecture-shaping
description: "Shape Trellis task architecture before implementation for long-lived projects. Use for architecture-sensitive planning, module boundaries, testability, refactoring opportunities, anti-toy-MVP concerns, durable domain behavior, or when a Trellis project must stay maintainable beyond a small MVP."
---

# Trellis Architecture Shaping

Trellis projects are long-lived by default. A task may reduce feature scope, but it must not collapse durable behavior into a toy single-file structure when the work clearly needs maintainable boundaries, test seams, or future change points.

Use this skill to turn architecture-sensitive planning into a normal Trellis research artifact. It is not a broad refactor command, an ADR system, or a replacement for `trellis-code-architecture-review`.

## When To Use

Use this skill during Phase 1 planning, before `task.py start`, when any of these are true:

- The task creates or reshapes modules, packages, APIs, schemas, routes, services, state stores, CLI commands, workflows, or cross-layer contracts.
- The user asks for architecture shaping, architecture improvement, refactoring opportunities, module boundaries, testability, maintainability, production readiness, large/long-lived project structure, or anti-toy-MVP guidance.
- The task introduces durable domain behavior whose responsibilities could be split several plausible ways.
- The implementation could be tempting as a quick one-file MVP even though the project will be maintained over time.
- `design.md`, `implement.md`, or a review gate asks for architecture-shaping evidence.

Skip this skill only for mechanical, local, low-risk edits where the task artifacts can record a clear low-risk reason.

## Hard Rules

- Keep all durable state in normal Trellis files: `prd.md`, `design.md`, `implement.md`, context manifests, `.trellis/spec/`, and task `research/`.
- Do not create `CONTEXT.md`, ADR directories, a second task queue, a separate architecture registry, or any other competing source of truth.
- Do not automatically refactor existing code. This skill shapes the current task scope and may identify follow-up candidates.
- Do not turn maintainability into architecture astronaut mode. A seam must earn its cost through locality, leverage, testing value, or expected repeated change.
- Do not ask the user for facts that repository inspection, specs, task artifacts, or research can answer.
- Open human decisions block planning. Open technical checks become validation work or explicit risks.

## Workflow

1. Resolve the active Trellis task and read `prd.md`, then `design.md` and `implement.md` when present.
2. Read `implement.jsonl` / `check.jsonl` rows and relevant `.trellis/spec/` indexes or guides when they exist.
3. Inspect the real codebase, templates, routes, schemas, tests, and existing module patterns before proposing structure.
4. Identify long-lived assumptions, durable domain concepts, change axes, system boundaries, and test surfaces.
5. Propose the smallest production-shaped architecture that prevents toy-MVP collapse.
6. Separate accepted constraints from adjustable recommendations, open decisions, and rejected speculative abstractions.
7. When running inside an active task, write or update `research/architecture-shaping.md`.
8. Reference accepted constraints from `design.md` or `implement.md` only when the planning phase owns that artifact or the user approved the promotion.
9. Add `research/architecture-shaping.md` to `implement.jsonl` / `check.jsonl` when sub-agents or review gates need it.

## Trigger Decision Record

Every complex task should record an architecture-shaping trigger decision before `task.py start`.

Use one of these forms in `design.md` for complex tasks, or in `prd.md` for PRD-only tasks:

```text
Architecture Shaping: required; see research/architecture-shaping.md.
```

```text
Architecture Shaping: skipped, because <low-risk reason backed by task/repo evidence>.
```

If shaping is required but not complete, planning is not ready to start.

## Research Output Contract

Write `research/architecture-shaping.md` with these sections when the skill runs inside a task:

```markdown
# Architecture Shaping

## Scope Reviewed

## Long-Lived Assumptions

## Durable Domain Concepts

## Proposed Module Boundaries

## Test Surfaces

## Toy-MVP Risks Avoided

## Accepted Shallow Areas

## Accepted Constraints

## Recommended But Adjustable

## Open Decisions

## Rejected / Speculative Abstractions

## Open User Decisions
```

### Constraint Strength

- `Accepted Constraints`: binding only when referenced from `design.md` or `implement.md`. Implementation and check agents must follow them or explicitly revise the planning artifact with evidence.
- `Recommended But Adjustable`: useful guidance that implementers may revise with evidence while preserving the task objective.
- `Open Decisions`: unresolved technical checks or human decisions. Human decisions block activation; technical checks become validation steps.
- `Rejected / Speculative Abstractions`: ideas explicitly not adopted, so later agents do not reintroduce them as "best practice" filler.

## Review Standard

Architecture findings become blockers only when they are inside the current task scope and backed by task artifacts or changed-code evidence. Blocking findings include accepted-constraint violations, mixed responsibilities introduced by the task, second sources of truth, hidden fallback behavior, untestable core behavior, or a single file/module carrying multiple long-lived change axes for the task's domain.

Warnings are appropriate for adjustable recommendations, task-external legacy debt, or shallow areas explicitly accepted in `research/architecture-shaping.md` or `design.md`.
