# Code Context Search

Use `code-context-search` / Fast Context as the preferred semantic locator when
bootstrapping Trellis specs. It helps identify relevant files, modules, routes,
commands, tests, and line ranges before the agent reads source directly.

## When To Use It

Use `code-context-search` when:

- the relevant package, module, route, command, or template file is unclear;
- broad repository search would produce too many matches;
- the task needs architecture or flow candidates before exact verification.

Skip semantic location and read files directly when the user or task already
names the exact target files.

## Workflow

1. Ask a natural-language codebase question.
2. Review the candidate files and line ranges.
3. Read the returned source files directly.
4. Use exact search only inside identified files or directories.
5. Capture spec rules only after source files, tests, or docs confirm the
   behavior.

## Good Queries

```text
Find CLI command dispatch and option parsing
Find template generation and update migration flow
Find docs-site navigation and version routing
Find task lifecycle state transitions
```

## Verification

Semantic search is a locator, not proof. Before writing a Trellis spec rule,
verify the finding with direct source reads and, when useful, package scripts
such as typecheck, lint, tests, or docs checks.
