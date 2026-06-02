# Project Type Defaults

Use these defaults only as starting points. Project `AGENTS.md`, `.trellis/spec/`, `package.json`, lockfiles, CI config, and existing scripts override them.

## Node / TypeScript

- Test: `npm test`, `npm test -- <path>`, or the repository's package-manager equivalent.
- Type/build: `npx tsc --noEmit`, `npm run typecheck`, or `npm run build`.
- Stop if: new dependency is required, lockfile changes unexpectedly, existing tests begin failing, new `any` appears in a strict TypeScript area.
- Trap: skipped tests can still make a suite look green.

## Python

- Test: `pytest -q` or a narrower real test path.
- Type/lint: `mypy <package>`, `ruff check .`, or repository scripts.
- Stop if: new dependency is required, Python version constraints must change, existing tests begin failing, new module-level mutable state is introduced.
- Trap: `skip` and `xfail` can hide missing behavior.

## Swift / iOS

- Test/build: repository `xcodebuild` or `swift test` command.
- Stop if: project file edits are required but forbidden, a new Swift Package is needed, simulator destination is unavailable, existing tests fail.
- Trap: disabled Swift Testing or XCTest cases can appear as a pass while behavior is untested.

## Go

- Test/build: `go test ./...`, `go build ./...`, optionally `go test -race ./...`.
- Stop if: `go.mod` or `go.sum` changes unexpectedly, existing tests fail, race detector finds a new issue.
- Trap: `t.Skip` and removed table cases can create false success.

## Rust

- Test/build: `cargo test --all-features`, `cargo check --all-targets`, `cargo clippy --all-targets -- -D warnings` when used by the project.
- Stop if: new crate is required, `Cargo.lock` changes unexpectedly, `unsafe` is introduced against policy, existing tests fail.
- Trap: `#[ignore]` can hide missing coverage.

## Static / Docs

- Validate: markdown lint, link check, or docs build when available.
- Stop if: assets, frontmatter, navigation, or generated metadata change unexpectedly.
- Trap: formatting-only table churn can obscure content changes.

## Unknown

Derive commands from repository scripts and Trellis specs. If commands cannot be found, record an assumption and create a verification checkpoint that discovers the right command before implementation.
