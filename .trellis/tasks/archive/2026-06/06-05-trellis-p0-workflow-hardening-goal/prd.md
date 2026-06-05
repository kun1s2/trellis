# Implement P0 Trellis workflow hardening goal

## Raw Goal Input

用户请求：

> 后续优化我打算走goal,并且使用里面的ai自我反思去优化trellis项目

用户确认：

> 可以 去执行

## Existing Evidence

- Parent audit task: `.trellis/tasks/06-05-audit-trellis-workflows-optimization`
- Audit report: `.trellis/tasks/06-05-audit-trellis-workflows-optimization/research/trellis-workflow-audit.md`
- Current local Trellis config: `.trellis/config.yaml` has `codex.dispatch_mode: sub-agent`.
- Native Codex goal state was checked before initialization: no active goal existed.

## Goal Contract

### Objective

Implement the P0 Trellis workflow hardening items from the audit report in a bounded, evidence-driven way, using the Goal Mode Decision Harness and AI self-reflection for medium technical ambiguity.

### Scope

In scope:

- P0-1: repair user-facing Chinese mojibake and encoding-drift sources in current Trellis workflow/skill/script/template surfaces that are owned by this repository.
- P0-2: add script-level validation so planning gates cannot be silently bypassed before implementation starts.
- P0-3: add Goal Contract validation so Trellis goal metadata cannot be treated as valid without required Goal Contract artifacts and checkpoint evidence.
- Update affected local generated files, packaged templates, specs, tests, and task artifacts when repository evidence shows they are part of the same source-of-truth chain.
- Use `trellis-grill-agents` / AI self-reflection only for medium technical ambiguity, not for user-owned product decisions.

Out of immediate implementation scope:

- P1/P2 audit items unless directly required to make a P0 fix coherent or tested.
- Changing the fundamental Trellis lifecycle model.
- Replacing Codex native Goal Mode or implementing a local goal runner.
- Changing default user workflow preferences such as `codex.dispatch_mode` unless required by evidence and preserved as compatible behavior.

### Constraints

- Preserve the raw user request and this Goal Contract.
- Do not weaken `workflow.md` as the single source of truth for workflow-state breadcrumb bodies.
- Do not introduce a second task lifecycle, local checkpoint runner, runtime mailbox, or extra goal directory.
- Preserve session-scoped active task behavior under `.trellis/.runtime/sessions/`.
- Do not silently include or revert unrelated dirty files; the repository already has unrelated uncommitted work.
- Keep human-facing Trellis artifacts in Chinese where appropriate while preserving English technical terms.
- Keep machine-readable keys, filenames, status values, CLI args, and schema fields stable.
- Do not push to remote or perform destructive git operations.
- Do not use external image generation or exposed image API credentials for this code-hardening goal.

### Done When

- P0 mojibake repair is implemented for the repository-owned source surfaces that caused or preserve the broken Chinese text, with evidence showing the fixed text renders as intended from source or generated output.
- Planning gate validation exists at script level and can detect missing complex-task artifacts, missing Architecture Shaping decision, missing Grill Gate decision, and uncurated sub-agent context when required.
- Goal Contract validation exists at script level and can detect missing raw goal input, Goal Contract required fields, Autonomy Charter, Done When, Stop If, and checkpoint/evidence structure before a goal is treated as ready.
- Relevant specs and task artifacts are updated so future agents know the validation and encoding contracts.
- Tests or regression checks cover the new validation behavior and encoding/mojibake guardrails where logic changed.
- Verification commands appropriate to touched areas have passed or any skipped command has a recorded reason and risk.
- The Goal Evidence Chain in `implement.md` records accepted decisions, rejected options, verification output, remaining risk, and final recovery point.

### Stop If

- A required fix would overwrite unrelated user changes or unrecognized dirty work.
- A P0 item requires changing user-owned workflow semantics, task lifecycle policy, or default execution mode beyond the stated scope.
- A validation design would require new task statuses, a second goal lifecycle, or a local native-goal replacement.
- Required source files, templates, tests, or specs cannot be inspected.
- Verification reveals a broad migration/release problem that cannot be safely solved inside this P0 scope.
- Credentials, external accounts, production resources, payment, legal approval, or destructive operations become necessary.

### Token Budget

1000000 (project default)

### Project Type

TypeScript / pnpm monorepo CLI project with generated Trellis local assets and Python template scripts.

Evidence:

- Root `package.json` defines `pnpm` scripts and filters for `psymoth-core` and `psymoth`.
- `packages/cli/package.json` defines TypeScript, Vitest, ESLint, and Python lint scripts.
- `.trellis/scripts/**` contains local Python runtime scripts; `packages/cli/src/templates/**` contains packaged templates.

### Scenario

Custom: Trellis workflow/runtime hardening after a repository-backed audit.

### Cadence Hint

checkpoint-bounded

## Autonomy Charter

### Frozen Invariants

The Goal agent must not weaken, replace, or reinterpret:

- Objective, Scope, Constraints, Done When, Stop If, and Out of Scope.
- The distinction between ordinary Trellis task flow, sub-agent dispatch, and Codex native Goal Mode bridge.
- Trellis ownership of task artifacts and Codex ownership of native goal state.
- The rule that Goal checkpoints are evidence/recovery landmarks, not a local queue or runner.
- Session-scoped active task behavior.
- The requirement to preserve unrelated user changes.
- The no-push and no-destructive-git boundary.

### Delegated Decisions

The agent may decide autonomously when Frozen Invariants stay unchanged:

- Which P0 fix to implement first.
- Whether to fix local generated files, packaged templates, or both after tracing the source-of-truth chain.
- The smallest compatible validation API shape, command flags, helper functions, and tests.
- Whether a discovered issue is direct P0 scope, a required supporting fix, or a follow-up.
- How to structure tests and regression checks.
- Which verification commands are proportionate to touched files.

All delegated decisions must be recorded in `implement.md`.

### User-Owned Decisions

Stop and ask the user before:

- Expanding this Goal to P1/P2 backlog items as first-class scope.
- Changing default user workflow preference or Codex dispatch behavior in a breaking way.
- Removing or redesigning the dead `completed` breadcrumb state instead of documenting or validating around it.
- Introducing new durable Trellis lifecycle states or a new goal runtime.
- Performing destructive git operations or including unrelated dirty files.

### Decision Harness

- Low ambiguity: decide from repository/spec/test evidence and record the default assumption.
- Medium ambiguity: use AI self-reflection and, when helpful and supported, `trellis-grill-agents` as a pressure test. Record accepted and rejected conclusions in `implement.md` or `research/`.
- High ambiguity or user-owned decision: Stop/Block and record the blocker before any native `update_goal(blocked)` action.

### Autonomous Research Protocol

Repository evidence, local specs, tests, and runnable commands are the primary sources. External/current web evidence is not expected for this local hardening goal. If external evidence becomes necessary, use only the project-approved research path available in the environment and record source URL, evidence path, adopted/rejected conclusion, and remaining uncertainty.

### Evidence Chain

`implement.md` is the recovery source. It must record:

- checkpoint status;
- current evidence;
- work performed;
- accepted decisions;
- rejected options;
- overturned assumptions;
- verification commands/results;
- remaining uncertainty;
- next recovery point.

### Stop/Block Boundary

Before stopping, write a Stop/Block record into `implement.md` with blocker type, triggering evidence, blocked decision, why not delegated, required human answer, recovery checkpoint, and native goal action.

## Default Assumptions

- Assumption: P0 scope means the three P0 rows in the audit report: mojibake/encoding, planning gate validation, Goal Contract validation.
  Evidence: parent audit report section `Optimization backlog`.
  Why safe: it bounds "优化trellis项目" to the highest-impact findings already reviewed.
  Stop if: the implementation requires changing P1/P2 behavior as first-class scope.

- Assumption: "AI 自我反思" means the Goal Decision Harness should pressure-test medium technical decisions autonomously, not override user-owned decisions.
  Evidence: user explicitly requested Goal and AI self-reflection, while Trellis Goal docs distinguish medium ambiguity from high/user-owned blockers.
  Why safe: it keeps the agent moving without changing Frozen Invariants.
  Stop if: a decision changes user-visible workflow semantics or scope.

- Assumption: packaged source/templates should be preferred over editing only generated local files when both exist and the generated file is template-owned.
  Evidence: `.trellis/spec/cli/backend/workflow-state-contract.md` and `.trellis/spec/cli/backend/script-conventions.md` require source-of-truth/template synchronization for generated Trellis assets.
  Why safe: it prevents fixing only the local symptom while leaving the generator broken.
  Stop if: a local file is clearly user-modified and not template-owned.

## Acceptance Criteria

- [ ] P0 scope is implemented or a Stop/Block record explains why a specific P0 path cannot proceed.
- [ ] Chinese mojibake repair is source-backed and covered by a regression or deterministic check where logic changed.
- [ ] Planning gate validation can be invoked from the task tooling and reports actionable missing gate/artifact/context problems.
- [ ] Goal Contract validation can be invoked from the task tooling or goal command path and reports actionable missing contract/checkpoint problems.
- [ ] Specs/task docs are updated for new validation and encoding contracts.
- [ ] Relevant lint/typecheck/test commands pass, or skipped commands are justified with residual risk.
- [ ] Trellis artifacts record delegated decisions, rejected options, verification evidence, and any blockers.

## Out of Scope

- Full P1/P2 backlog implementation.
- UI/website work.
- AI image generation.
- Release publishing.
- Remote push.
- Rewriting the whole Trellis workflow architecture.

## Initialization Gate Evidence

- Raw user request preserved: yes.
- Objective is one concrete final state: yes.
- Scope is bounded to P0 audit items: yes.
- At least three `Done When` items: yes.
- At least three `Stop If` items: yes.
- Token budget: project default `1000000` applies; user did not supply a different positive budget.
- Autonomy Charter present: yes.
- Medium ambiguity route: AI self-reflection / `trellis-grill-agents` when appropriate.
- High/user-owned ambiguity route: Stop/Block.
- Context evidence exists: parent audit report and local specs.
