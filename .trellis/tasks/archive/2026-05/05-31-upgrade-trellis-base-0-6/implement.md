# Implementation Plan

## Task Slices

### Slice 0: 0.6 rebase feasibility spike

- Status: done
- Goal: create and inspect the latest 0.6 base without committing to it.
- Verify:
  - latest 0.6 is inspected in an isolated clone/worktree, not merged into `main`.
  - clone path is `D:\tmp\trellis-0.6.0-beta.21-clean`.
  - clone HEAD is `30beb8e3ed379b7ef9270e14d4b406fc330044d2` / `v0.6.0-beta.21`.
  - current fork-only features that must be ported are listed.

### Slice 1: Package identity and workspace metadata

- Status: done
- Goal: make clean 0.6 build as the Kun distribution.
- Verify:
  - root workspace scripts filter `@kun/trellis` and `@kun/trellis-core`.
  - CLI package is `@kun/trellis`.
  - core package is renamed or explicitly scoped for Kun before publishing.
  - upgrade/install/session hints use `@kun/trellis`.
  - release helpers still preserve manifest continuity.

### Slice 2: Codex-first behavior

- Status: done
- Goal: port current fork's Codex launcher, exclusions, inline default, and review-gate templates.
- Verify:
  - `trellis codex` exists and passes project-scoped skill exclusions to Codex.
  - config template documents `codex.disabled_skills` and `disabled_skill_paths`.
  - Codex default stays inline in generated config/guidance.
  - Codex review-gate agents are included and tested.

### Slice 3: Trellis Goal / Grill

- Status: done
- Goal: port Trellis Goal and unattended Grill support.
- Verify:
  - bundled `trellis-goal` and `trellis-grill-agents` install through common bundled skills.
  - `task.py mark-goal` writes `meta.trellis_goal` without changing task status.
  - `task.py goal-info` reports metadata and slice summary.
  - task-goal integration test passes.

### Slice 4: Verification and switch report

- Status: done
- Goal: prove the migrated clean clone is usable before replacing current mainline.
- Verify:
  - targeted tests for migrated features pass.
  - `pnpm build`, `pnpm typecheck`, and relevant lint/test checks are run or failures are recorded.
  - report clearly says which files/features were ported and what remains.

## Current Result

Slices 1-4 are implemented and verified in the isolated clean clone:

- Clone: `D:\tmp\trellis-0.6.0-beta.21-clean`
- Branch: `kun-port-v0.6.0-beta.21`
- Base: upstream `v0.6.0-beta.21`
- Main `D:\IdeaProjects\trellis-plus` working tree has not been overwritten.

Verification passed:

- `pnpm install --frozen-lockfile`
- targeted migration tests for Codex, Goal/Grill, templates, configurators, upgrade, and mem
- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`
- `pnpm test`

Submodule follow-up:

- The `marketplace` native workflow change was committed locally inside the submodule as `4dcaacb feat(workflows): add Trellis goal routing`.
- The superproject now points at that local submodule commit in the isolated clone.
- Formalizing the switch still requires pushing/hosting that submodule commit, or amending the superproject to use a reachable marketplace commit.

## Finalization

- Status: done
- Migration commits in the clean clone:
  - `7059a1e feat(trellis): port Kun workflow to 0.6 beta`
  - `0e8f196 chore(repo): align Kun distribution metadata`
  - `81120ac fix(workflow): fallback to git for default marketplace`
- Submodule reachability:
  - `marketplace` commit `4dcaacb` was fast-forward pushed to `kun1s2/marketplace:main`.
  - `.gitmodules` in the candidate points to `kun1s2/docs` and `kun1s2/marketplace`.
- Verification on final candidate:
  - `pnpm lint`: passed
  - `pnpm typecheck`: passed
  - `pnpm build`: passed
  - `pnpm test`: passed (`core`: 279 passed; `cli`: 1184 passed, 4 skipped)
  - `pnpm pack` for `@kun/trellis-core` and `@kun/trellis`: passed
  - Fresh tarball install smoke: passed
  - Smoke covered `trellis --version`, `trellis init --codex -u smoke --yes`, bundled `trellis-goal` / `trellis-grill-agents`, `task.py mark-goal`, `task.py goal-info`, and `trellis workflow --template tdd --force`.
