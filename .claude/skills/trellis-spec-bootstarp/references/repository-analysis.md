# Repository Analysis

The goal is to discover the project's real architecture before writing rules. Do not start from generic spec templates and fill blanks. Start from the code, then let the spec structure follow.

## Analysis Order

1. Read the existing `.trellis/spec/` tree and note which files are templates, outdated, or already project-specific.
2. Inspect package manifests, build scripts, workspace config, and top-level documentation to identify packages and runtime layers.
3. Use `code-context-search` / Fast Context first when relevant files, modules, routes, or flows are unclear.
4. Use language-native tooling and direct source reads for exact signatures, types, class boundaries, and implementation examples.
5. Read representative source and test files directly before turning any finding into a spec rule.

## What To Capture

| Area | Questions |
|------|-----------|
| Package boundaries | What does each package own? What imports cross boundaries? |
| Runtime layers | Which code is CLI, backend, frontend, worker, shared library, test-only, or tooling? |
| Core abstractions | Which types, services, stores, commands, routes, or adapters define the system shape? |
| Data flow | Where does user input enter, how is it validated, and where does state persist? |
| Error handling | How are failures represented, logged, surfaced, and tested? |
| Configuration | Where do defaults, environment config, generated files, and templates live? |
| Tests | Which test styles are trusted examples for new work? |

## Code Context Search Usage

Start with semantic location, then inspect specific files:

```text
Use code-context-search to find "CLI command execution flow"
Use code-context-search to find "template generation and migration"
Read the returned files and line ranges directly
Use exact search only after candidates are identified
```

Treat Fast Context results as candidates. Do not quote a semantic search
summary as final authority until you have checked the relevant source files.

## Source Inspection Usage

Use direct source reads and language-native tooling when the spec needs exact
code shapes:

```text
Read representative source files
Read matching tests and fixtures
Run typecheck, lint, or package scripts when behavior needs verification
```

Source inspection is the final authority for documenting constructor patterns,
function signatures, type contracts, and reference chains.

## Analysis Notes

Keep short notes while analyzing. The notes should include:

- Package or layer name.
- Files that define the local pattern.
- Rules the spec should teach.
- Anti-patterns found in old code, comments, tests, or migration paths.
- Spec files that should be created, deleted, renamed, or merged.
