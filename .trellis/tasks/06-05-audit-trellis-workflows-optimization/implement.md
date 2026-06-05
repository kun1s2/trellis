# Implementation Plan: Trellis workflow audit

## Checklist

- [x] Read canonical workflow and phase step details.
- [x] Inventory skills and summarize each core skill's routing role.
- [x] Inspect scripts that write/read task state, workflow-state context, session context, current-task pointer, manifests, archive, goal metadata, and commit support.
- [x] Inspect relevant spec docs for workflow-state contract and script conventions.
- [x] Inspect recent/related task artifacts only when useful for behavior examples.
- [x] Write `research/trellis-workflow-audit.md` with complete workflow map, branch map, mode model, Mermaid diagrams, and optimization list.
- [x] Review the report against `prd.md` acceptance criteria.
- [ ] Ask user whether they want to proceed from audit into implementation optimizations as a separate follow-up task.

## Validation / 验证

- `python ./.trellis/scripts/task.py validate .trellis/tasks/06-05-audit-trellis-workflows-optimization`
- Manual validation: check that the report contains evidence paths, all major workflow states, all core skills, all requested mode distinctions, Mermaid diagrams, and prioritized optimization opportunities.

## Grill Gate

skip grill, because this task is a read-only evidence audit/report with explicit acceptance criteria from the user's request and repository evidence. Any recommendation that would change user workflow preference or runtime behavior will be recorded as an option and routed back to the user before implementation.

## Notes

- This plan does not require `task.py start` unless the user wants implementation changes. The audit report can be produced during planning as research evidence.
- Do not include unrelated dirty files in any commit plan.
