# Technical Design

## Project Detection

- Current working project is Trellis-managed `trellis-plus`; evidence: `.trellis/` exists and `get_context.py` reported no current task before this request.
- Target project is an external GitHub repository, `LonelyHerbivore/Trellis-Herbivore`; it will be cloned read-only into Trellis workspace storage.
- Understand-Anything plugin root is expected at `D:\Users\Kun\.understand-anything\repo\understand-anything-plugin`; evidence: user supplied the skill path and `package.json` exists there.

## Relevant Files

- `D:\IdeaProjects\trellis-plus\.trellis\tasks\06-05-06-05-analyze-trellis-herbivore-understand\prd.md`: Goal Contract source of truth.
- `D:\IdeaProjects\trellis-plus\.trellis\tasks\06-05-06-05-analyze-trellis-herbivore-understand\design.md`: technical boundary and verification command source.
- `D:\IdeaProjects\trellis-plus\.trellis\tasks\06-05-06-05-analyze-trellis-herbivore-understand\implement.md`: checkpoint/evidence source.
- `D:\IdeaProjects\trellis-plus\.trellis\workspace\codex\external-repos\Trellis-Herbivore`: target checkout and analysis root.
- `D:\IdeaProjects\trellis-plus\.trellis\workspace\codex\external-repos\Trellis-Herbivore\.understand-anything`: Understand-Anything output directory.
- `D:\Users\Kun\.understand-anything\repo\understand-anything-plugin\skills\understand\SKILL.md`: requested analysis workflow.

## Technical Boundary

- Use PowerShell-native commands with `-LiteralPath` for Windows path safety.
- Use `git clone` with `http_proxy` and `https_proxy` set to `http://127.0.0.1:10808`.
- If the target checkout already exists and is a Git repository for the same remote, reuse or update it conservatively instead of deleting it.
- Keep Understand-Anything output under the target checkout by running analysis with the clone directory as project root and by disabling worktree redirect only if needed.
- Create `.understand-anything/.understandignore` before scanning so noisy files are excluded from the first analysis pass.

## Verification Commands

- `git -C "<target>" remote -v`: proves the checkout points to the requested repository.
- `git -C "<target>" rev-parse HEAD`: records the analyzed commit.
- `Test-Path -LiteralPath "<target>\.understand-anything\knowledge-graph.json"`: proves primary graph output exists.
- `node -e "JSON.parse(require('fs').readFileSync('<graph>', 'utf8')); console.log('ok')"`: proves graph JSON is parseable when Node is available.
- Understand-Anything command output or generated `meta.json`: records analysis evidence.

## Risks

- GitHub or package installation may fail if the local proxy is unavailable; mitigation is to report the exact failing command and proxy assumption.
- Understand-Anything may require Node or pnpm dependencies to be built; mitigation is to inspect plugin scripts and build only the plugin dependencies needed for analysis.
- Large repository analysis can be slow; mitigation is to use `.understandignore` to exclude obvious non-source content before analysis.
- Running an external checkout inside `.trellis/workspace` may show as untracked files if not ignored by the parent repository; mitigation is to report that this is workspace output, not source change.

## Rollback Notes

- If the user wants to remove the downloaded repository later, delete only `D:\IdeaProjects\trellis-plus\.trellis\workspace\codex\external-repos\Trellis-Herbivore` after confirming the resolved path is inside `.trellis\workspace\codex\external-repos`.
- Trellis task artifacts can remain as the audit trail for this goal.

## Grill-Agent Notes

- No grill-agent step required. Ambiguity is low-risk and defaults are recorded in `prd.md`.
