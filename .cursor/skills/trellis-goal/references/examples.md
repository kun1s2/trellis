# Compact Examples

## Good Trellis Goal Contract

```markdown
## Goal Contract

- Objective: Add API-key rotation support to the auth middleware.
- Scope: `src/auth/middleware.ts` and `tests/auth/middleware.test.ts`.
- Constraints:
  - Do not change database schema or migrations.
  - Do not add dependencies.
  - Do not weaken existing auth tests.
- Done When:
  1. Middleware accepts the current key and previous key inside the grace window.
  2. Tests cover current-only, previous-in-window, previous-expired, and both-expired cases.
  3. `npm test -- tests/auth` exits 0.
  4. Typecheck exits 0.
- Stop If:
  1. A schema or migration change becomes necessary; detect by diff touching migration/schema files.
  2. A new dependency is required; detect by package manifest or lockfile diff.
  3. Existing auth tests fail for reasons unrelated to this change; detect by baseline or targeted failure output.
- Token Budget: 80000
- Project Type: TypeScript backend, inferred from `package.json` and auth tests.
- Scenario: Code Change
- Cadence Hint: checkpoint-bounded
```

```markdown
## Ambiguity Handling

| Topic | Level | Decision | Evidence | Trellis Record |
|---|---|---|---|---|
| Grace window value | low | Assume existing config owns it. | `src/auth/config.ts` already defines the grace period. | `prd.md` Default Assumptions |
```

## Bad Contract To Repair

```markdown
Make the whole project better and faster.
Done when tests pass.
Stop if unclear.
```

Problems:

- Scope is unbounded.
- "Better" and "faster" are not measurable.
- "Tests pass" does not name a command.
- "If unclear" is not mechanically detectable.

## Trellis Native Goal Checkpoints

Use `implement.md` checkpoints as evidence and recovery landmarks:

```markdown
### Checkpoint 1: Locate auth middleware and current tests
- Type: work
- Status: pending
- Acceptance: relevant files and commands are identified in `design.md`.

### Checkpoint 2: Add failing rotation tests
- Type: work
- Status: pending
- Acceptance: new tests fail for missing rotation behavior.

### Checkpoint 3: Implement rotation support
- Type: work
- Status: pending
- Acceptance: targeted tests pass.

### Checkpoint 4: Comprehensive Check
- Type: check
- Status: pending
- Acceptance: scope, regression, typecheck, tests, docs, and security checks are recorded.
```

## In-Progress Conversion

```markdown
## Conversion Audit

- Existing work: middleware parsing was already refactored.
- Verified evidence: `git diff -- src/auth/middleware.ts` and current tests.
- Unverified work: rotation behavior has no test coverage yet.
- Reconciliation checkpoint: Checkpoint 1 reconciles existing middleware changes with the Goal Contract.
```
