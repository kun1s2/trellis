# Switch Report

## Candidate

- Working tree: `D:\tmp\trellis-0.6.0-beta.21-clean`
- Branch: `kun-port-v0.6.0-beta.21`
- Base: upstream Trellis `v0.6.0-beta.21`
- Scope: isolated migration candidate only; `D:\IdeaProjects\trellis-plus` was not overwritten.

## Ported Capabilities

- Kun package identity: `@kun/trellis` plus 0.6 `@kun/trellis-core`.
- Runtime imports and workspace scripts moved from `@mindfoldhq/trellis-core` to `@kun/trellis-core`.
- Release helpers and publish workflow adjusted for Kun package names.
- `trellis codex` launcher and project-level Codex skill exclusions.
- Codex inline remains the default path.
- Codex review-gate agent templates.
- Bundled `trellis-goal` and `trellis-grill-agents` skills.
- Goal workflow routing in Trellis workflow templates.
- `task.py mark-goal` and `task.py goal-info`.
- Windows-stable mem cwd handling for Claude project keys.
- Windows-stable test infrastructure for Python command naming, CRLF frontmatter parsing, and Git fixture line endings.

## Preserved From 0.6

- `packages/core`
- `trellis mem`
- `trellis channel`
- workflow template switching and existing 0.6 tests

## Verification

- `pnpm install --frozen-lockfile`: passed
- targeted migration tests: passed
- `pnpm typecheck`: passed
- `pnpm build`: passed
- `pnpm lint`: passed
- `pnpm test`: passed

Full test result:

- core: 17 files, 279 tests passed
- cli: 45 files passed, 1 skipped file, 1184 tests passed, 4 skipped tests

## Submodule Handling

- `marketplace` is a submodule.
- Its native workflow change was committed locally inside the submodule:
  - `4dcaacb feat(workflows): add Trellis goal routing`
- The isolated clone's superproject now records the marketplace pointer change from `8b9d9ac` to `4dcaacb`.
- A production switch still needs that submodule commit to become reachable from the chosen marketplace remote, or the superproject pointer must be amended to a reachable commit.

## Not Done

- GitHub push and npm publish are part of the final wrap-up after this report.

## Final Update

- `marketplace` commit `4dcaacb` is reachable from `kun1s2/marketplace:main`.
- Clean clone migration was committed as:
  - `7059a1e feat(trellis): port Kun workflow to 0.6 beta`
  - `0e8f196 chore(repo): align Kun distribution metadata`
  - `81120ac fix(workflow): fallback to git for default marketplace`
- Final verification passed:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm test`
  - `pnpm pack` for both packages
  - fresh tarball install smoke
- The default workflow marketplace now falls back to Git for the Kun marketplace when `raw.githubusercontent.com` times out.
