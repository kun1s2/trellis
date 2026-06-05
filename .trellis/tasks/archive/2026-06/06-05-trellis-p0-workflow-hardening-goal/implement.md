# Implementation Plan: P0 Trellis workflow hardening goal

## Checkpoints

### Checkpoint 1: Refresh evidence and dirty-state map

- Type: check
- Status: done
- Acceptance / Evidence Required:
  - Read parent audit report.
  - Inspect current dirty files and classify likely unrelated work.
  - Map source-of-truth chains for local generated files and packaged templates.
- Current Evidence:
  - Parent audit report exists at `.trellis/tasks/06-05-audit-trellis-workflows-optimization/research/trellis-workflow-audit.md`.
  - `task.py goal-info .trellis/tasks/06-05-trellis-p0-workflow-hardening-goal` reports parent `06-05-audit-trellis-workflows-optimization`, 6 checkpoints, and active Goal metadata.
  - `git status --short` shows a broad dirty worktree with many pre-existing platform/template changes; this Goal only treats P0 audit hardening files and current Goal artifacts as in-scope.
  - Source-of-truth chain for runtime validation is local `.trellis/scripts/**` plus packaged templates under `packages/cli/src/templates/trellis/scripts/**`; bundled Goal skill source lives under `packages/cli/src/templates/common/bundled-skills/trellis-goal/**` and local installed mirror under `.agents/skills/trellis-goal/**`.
- Work Performed:
  - Recovered current native Goal state with `get_goal`; status is active and token budget is the project default `1000000`.
  - Read `prd.md`, `design.md`, `implement.md`, `task.json`, and parent audit report.
  - Compared local/template validation-relevant snippets for `task.py`, `task_context.py`, `task_store.py`, and `task_validation.py`.
- Verification Command / Result:
  - `python ./.trellis/scripts/task.py goal-info .trellis/tasks/06-05-trellis-p0-workflow-hardening-goal` -> passed; metadata and hierarchy visible.
  - `git status --short` -> passed; dirty-state map captured, unrelated dirty work preserved.
  - `Get-FileHash` for `task_validation.py` local/template -> matched.
  - `git diff --no-index` for `task.py`, `task_context.py`, and `task_store.py` -> validation-related code matches; remaining local/template differences are existing `python` vs `python3` user-facing help text, not this Goal's validation contract.
- Remaining Uncertainty:
  - Broad unrelated dirty state remains outside this Goal; it should be ignored unless final verification surfaces direct conflicts.
- Next Recovery Point:
  - Resume from final verification if interrupted.

### Checkpoint 2: Repair mojibake and encoding guardrails

- Type: work
- Status: done
- Acceptance / Evidence Required:
  - Identify repository-owned mojibake sources.
  - Repair source templates/local mirrors as appropriate.
  - Add or update regression checks where logic changed.
  - Record any intentionally deferred mojibake surfaces.
- Current Evidence:
  - Audit report P0 identified mojibake across workflow, skills, scripts, and Chinese trigger examples.
  - Windows rules require UTF-8 reads and warn not to treat terminal mojibake as file corruption.
- Work Performed:
  - Repaired/reviewed repository-owned Chinese workflow/skill/template surfaces in the P0-owned paths.
  - Preserved UTF-8 file handling and did not convert files to GBK.
  - Kept current Goal and Trellis Goal bundled skill text aligned with the project default native budget rule.
- Verification Command / Result:
  - Targeted mojibake search over core paths using pattern `鈫|鐩|寰|涓|锛|銆|浠|妯|瀵|杩|姝|绛|鍚|瀹` -> passed previously; no matches in `.trellis/workflow.md`, `.agents/skills`, `packages/cli/src/templates/{trellis,common,codex,claude}`, or `packages/cli/src/commands`.
  - `pnpm --filter psymoth test -- test/regression.test.ts -t "planning-gates|chinese-artifacts|init-context-removal"` -> passed previously; 13 tests.
- Remaining Uncertainty:
  - Full repository still has unrelated generated/platform files dirty; this checkpoint only claims core P0-owned surfaces.
- Next Recovery Point:
  - Re-run targeted mojibake search after final edits.

### Checkpoint 3: Add planning gate validation

- Type: work
- Status: done
- Acceptance / Evidence Required:
  - Add deterministic script-level validation for complex task readiness before implementation.
  - Detect missing `design.md`, missing `implement.md`, missing Architecture Shaping decision, missing Grill Gate decision, and seed-only JSONL when sub-agent context is required.
  - Add/update tests.
- Current Evidence:
  - Audit report P0 says planning gates were instruction-only.
  - `task.py start` previously flipped `planning -> in_progress` without artifact gate enforcement.
- Work Performed:
  - Added `common/task_validation.py` in local scripts and packaged Trellis script templates.
  - Wired `task.py start` to call `validate_planning_readiness()` before flipping a planning task to `in_progress`.
  - Extended `task.py validate` with explicit `--planning`.
  - Kept plain `task.py validate <dir>` context-file compatible so seed-only JSONL remains valid unless planning validation is explicitly requested.
  - Fixed Architecture Shaping marker normalization so Markdown emphasis/backticks do not cause false negatives.
- Verification Command / Result:
  - `python ./.trellis/scripts/task.py validate .trellis/tasks/06-05-trellis-p0-workflow-hardening-goal --goal --planning` -> passed previously.
  - `pnpm --filter psymoth test -- test/regression.test.ts -t "planning-gates|chinese-artifacts|init-context-removal"` -> passed previously; 13 tests.
  - `pnpm --filter psymoth test -- test/scripts/task-goal.integration.test.ts test/templates/trellis.test.ts test/templates/trellis-goal-autonomy.test.ts` -> passed previously; 33 tests.
- Remaining Uncertainty:
  - Final re-run after spec/evidence edits still pending.
- Next Recovery Point:
  - Re-run validation and targeted tests.

### Checkpoint 4: Add Goal Contract validation

- Type: work
- Status: done
- Acceptance / Evidence Required:
  - Validate required `prd.md` Goal Contract fields, Autonomy Charter, Done When, Stop If, and `implement.md` checkpoint/evidence structure.
  - Connect validation to goal tooling in a discoverable way.
  - Add/update tests.
- Current Evidence:
  - Audit report P0 says `mark-goal` could write metadata without Goal Contract validation.
  - `task.py mark-goal` writes `task.json.meta.trellis_goal`.
- Work Performed:
  - Added `validate_goal_contract()` for `task.json.meta.trellis_goal`, `prd.md`, `design.md`, and `implement.md`.
  - Extended `task.py validate` with `--goal` and automatic Goal Contract validation when goal metadata is enabled.
  - Wired `task.py mark-goal` to validate the proposed Goal metadata and artifacts before writing `task.json`.
  - Updated integration fixtures so valid goal artifacts include the project default token budget `1000000`.
- Verification Command / Result:
  - `pnpm --filter psymoth test -- test/scripts/task-goal.integration.test.ts test/templates/trellis.test.ts test/templates/trellis-goal-autonomy.test.ts` -> passed previously; 33 tests.
  - `packages/cli/test/scripts/task-goal.integration.test.ts` now covers `mark-goal` refusing missing Goal Contract metadata.
- Remaining Uncertainty:
  - Final re-run after fixture/spec edits still pending.
- Next Recovery Point:
  - Re-run goal validation and targeted tests.

### Checkpoint 5: AI self-reflection / grill synthesis

- Type: check
- Status: done
- Acceptance / Evidence Required:
  - Review the implementation against Frozen Invariants, P0 scope, specs, and test evidence.
  - Record accepted/rejected decisions.
  - Use `trellis-grill-agents` only if medium ambiguity remains and a real interviewer subagent is useful.
- Current Evidence:
  - User explicitly asked to use Goal and AI self-reflection.
  - Repository evidence was sufficient to decide validation shape without changing Frozen Invariants.
- Work Performed:
  - Performed AI self-reflection against the Goal Contract and P0 audit scope.
  - Classified remaining technical ambiguity as low after implementation and tests: no user-owned workflow preference, production/credential/destructive boundary, or lifecycle redesign was required.
  - Did not dispatch `trellis-grill-agents`, because no medium ambiguity remained after repository evidence and the final decisions were bounded implementation choices.
- Verification Command / Result:
  - Frozen Invariants preserved: no local goal runner, no new lifecycle state, no push/destructive git action, no unrelated dirty-file reversion.
  - Goal budget rule preserved: native `token_budget` is `1000000`, and Trellis Goal skill/templates/tests record the same default.
- Remaining Uncertainty:
  - Full lint/typecheck/test scope may still reveal unrelated repository issues; final command results decide residual risk.
- Next Recovery Point:
  - Continue final verification.

### Checkpoint 6: Final verification, spec update, and Trellis finish policy

- Type: check
- Status: done
- Acceptance / Evidence Required:
  - Run validation commands appropriate to touched files.
  - Update `.trellis/spec/` when new workflow/runtime contracts are introduced.
  - Record final evidence and remaining risks.
  - Follow Trellis Phase 3.4 commit confirmation policy before finish/archive.
- Current Evidence:
  - Required commands are listed in `design.md`.
  - New script-level contracts have been added to `.trellis/spec/cli/backend/platform-integration.md` and `.trellis/spec/cli/backend/script-conventions.md`.
- Work Performed:
  - Updated spec docs for planning readiness validation, `task.py validate --planning`, `task.py validate --goal`, automatic goal metadata validation, and `mark-goal` pre-write validation.
  - Updated current Goal evidence chain to reflect completed P0 implementation work.
  - Updated goal test fixture token budget to `1000000`.
  - Fixed a final full-suite regression where the default `task.py create` PRD skeleton guidance text was misread as a complex-task signal; planning validation now ignores those template guidance lines while still detecting user-authored complex signals.
- Verification Command / Result:
  - `python ./.trellis/scripts/task.py validate .trellis/tasks/06-05-trellis-p0-workflow-hardening-goal --goal --planning` -> passed.
  - `python -m py_compile ./.trellis/scripts/task.py ./.trellis/scripts/common/task_validation.py ./.trellis/scripts/common/task_context.py ./.trellis/scripts/common/task_store.py ./packages/cli/src/templates/trellis/scripts/task.py ./packages/cli/src/templates/trellis/scripts/common/task_validation.py ./packages/cli/src/templates/trellis/scripts/common/task_context.py ./packages/cli/src/templates/trellis/scripts/common/task_store.py` -> passed.
  - `rg -n '鈫|鐩|寰|涓|锛|銆|浠|妯|瀵|杩|姝|绛|鍚|瀹' .trellis/workflow.md .agents/skills packages/cli/src/templates/trellis packages/cli/src/templates/common packages/cli/src/templates/codex packages/cli/src/templates/claude packages/cli/src/commands` -> no matches; `rg` returned 1 because no matches were found.
  - `pnpm --filter psymoth test -- test/scripts/task-goal.integration.test.ts test/templates/trellis.test.ts test/templates/trellis-goal-autonomy.test.ts` -> passed; 3 files / 33 tests.
  - `pnpm --filter psymoth test -- test/regression.test.ts -t "planning-gates|chinese-artifacts|init-context-removal|task.py create then task.py start is idempotent"` -> passed; 14 tests.
  - `pnpm --filter psymoth typecheck` -> passed.
  - `pnpm --filter psymoth lint` -> passed.
  - `pnpm --filter psymoth lint:py` -> passed with 0 errors, 64 existing unused-import warnings in script package export shims.
  - `pnpm --filter psymoth test` -> passed; 46 test files passed, 1 skipped, 1197 tests passed, 4 skipped.
- Remaining Uncertainty:
  - Broad unrelated dirty/untracked work remains in the repository. This Goal did not stage, commit, archive, or revert it.
  - Phase 3.4 commit/archive handoff remains user-confirmed by policy; no commit was created in this unattended Goal run.
- Next Recovery Point:
  - If the user wants to finish the Trellis task bookkeeping, prepare a scoped commit plan for this Goal's changed files, ask for confirmation, then run the normal finish/archive flow.

## Delegated Decision Log

- Accepted: implement reusable `common/task_validation.py` instead of scattering string checks through command handlers.
- Accepted: `task.py start` hard-blocks planning tasks on validation errors before changing status.
- Accepted: `task.py validate --planning` explicitly runs planning readiness; plain `task.py validate` remains context-file compatible for seed-only JSONL.
- Accepted: Goal Contract validation runs on `task.py validate --goal` and automatically when goal metadata exists.
- Accepted: `task.py mark-goal` validates the proposed Goal Contract before writing metadata.
- Accepted: local `.trellis/scripts` and packaged Trellis script templates are the runtime/template source-of-truth pair for validation logic.
- Accepted: the project default native Goal token budget is `1000000`; this is intentional and must be passed unless the user supplies a different positive value.
- Accepted: warnings are appropriate for missing/seed-only sub-agent manifests when artifact gates otherwise pass; missing complex artifacts and required decisions are errors.
- Accepted: targeted mojibake search plus Chinese artifact regression is the deterministic guardrail for P0 encoding repair.
- Accepted: default `task.py create` PRD skeleton guidance lines must be ignored by complex-task signal inference; otherwise lightweight tasks are falsely blocked before start.

## Rejected Options

- Rejected: implement a local Goal Mode runner or queue. Reason: violates Trellis Goal ownership boundary.
- Rejected: expand this Goal to all P1/P2 audit items. Reason: scope would become broad and less verifiable.
- Rejected: use AI image generation. Reason: unrelated to code-hardening goal and would expose unnecessary external dependency.
- Rejected: hidden fallback/mock success for planning or Goal validation. Reason: P0 requires failures to be visible and actionable.
- Rejected: run planning readiness on every plain `task.py validate`. Reason: it broke seed-only JSONL compatibility and made lightweight seeded tasks look invalid.
- Rejected: treat existing `python` vs `python3` local/template help text differences as this Goal's validation failure. Reason: validation-relevant logic is synchronized, and unrelated template text churn is outside this P0 scope.
- Rejected: make every mention of `Complex task`, `Grill Gate`, or `sub-agent` in the default PRD skeleton trigger complex planning gates. Reason: those lines are user guidance, not user-authored task scope.

## Overturned Assumptions

- Overturned: Token Budget can remain `not specified` in Goal fixtures. New project rule is default native `token_budget: 1000000`; fixtures and Goal artifacts now record `1000000`.
- Overturned: Plain `task.py validate` should include all workflow gates by default. The compatible contract is context validation by default, explicit `--planning` for readiness gates, and automatic Goal validation only when goal metadata exists.
- Overturned: Complex-task inference can scan the full PRD skeleton verbatim. The default skeleton contains guidance text and must be filtered before signal detection.

## Stop/Block Records

- None.

## Evidence Chain

- Native goal state checked: active Codex native goal with `tokenBudget: 1000000`.
- Goal task: `.trellis/tasks/06-05-trellis-p0-workflow-hardening-goal`.
- Parent task: `.trellis/tasks/06-05-audit-trellis-workflows-optimization`.
- Parent audit report is the source for P0 scope.
- Runtime validation helper: `.trellis/scripts/common/task_validation.py`.
- Packaged validation helper: `packages/cli/src/templates/trellis/scripts/common/task_validation.py`.
- Validation integration: `.trellis/scripts/task.py`, `.trellis/scripts/common/task_context.py`, `.trellis/scripts/common/task_store.py`, and packaged template mirrors.
- Template export integration: `packages/cli/src/templates/trellis/index.ts`.
- Goal budget rule restored in local and packaged Trellis Goal skill files.
- Spec update targets: `.trellis/spec/cli/backend/platform-integration.md` and `.trellis/spec/cli/backend/script-conventions.md`.
- Targeted tests previously passed:
  - `python ./.trellis/scripts/task.py validate .trellis/tasks/06-05-trellis-p0-workflow-hardening-goal --goal --planning`
  - `python -m py_compile ...` on touched local/template Python scripts
  - `pnpm --filter psymoth test -- test/scripts/task-goal.integration.test.ts test/templates/trellis.test.ts test/templates/trellis-goal-autonomy.test.ts`
  - `pnpm --filter psymoth test -- test/regression.test.ts -t "planning-gates|chinese-artifacts|init-context-removal"`
- Final verification passed:
  - Full `pnpm --filter psymoth test`: 46 files passed, 1 skipped; 1197 tests passed, 4 skipped.
  - `pnpm --filter psymoth lint`, `pnpm --filter psymoth typecheck`, and `pnpm --filter psymoth lint:py` passed.
  - `lint:py` reported warnings only: 64 existing unused-import warnings in compatibility/export shim files.
  - Trellis Goal validation passed with `--goal --planning`.
  - Targeted mojibake scan reported no core-path matches.

## Grill Gate / Autonomy Gate

trellis-grill-agents required for medium technical ambiguity and authorized by the user's request to use Goal and AI self-reflection. This does not authorize proxy decisions for user-owned scope, workflow preference, destructive operations, credentials, legal, production, payment, or data-integrity boundaries; those must Stop/Block.

AI self-reflection conclusion for this checkpoint: no medium ambiguity remains after repository evidence and tests. The remaining work is mechanical final verification and evidence recording.

## Initialization Quality Gate

- Raw user request preserved in `prd.md`: yes.
- Goal Contract present in `prd.md`: yes.
- Technical boundary present in `design.md`: yes.
- Checkpoints and Evidence Chain present in `implement.md`: yes.
- Architecture Shaping decision recorded: required; see `research/architecture-shaping.md`.
- Token budget uses the project default `1000000` unless the user supplies a different positive budget.
- Native `create_goal` objective should be compact and point to these artifacts, not paste them.
