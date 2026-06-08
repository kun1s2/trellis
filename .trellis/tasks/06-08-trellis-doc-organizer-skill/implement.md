# Implementation Plan

## Scope

Implement the Codex-only first version of `trellis-doc-organizer`.

## Ordered Checklist

- [x] Create `packages/cli/src/templates/codex/codex-skills/trellis-doc-organizer/SKILL.md`.
- [x] Write skill frontmatter:
  - `name: trellis-doc-organizer`
  - description that triggers on Trellis doc organization, context reduction, duplicate task/spec facts, PRD/design/implement drift, stale research, and historical/superseded docs.
- [x] Write skill body with:
  - purpose and non-goals
  - trigger conditions and skip conditions
  - document authority model
  - in-place organization workflow
  - source document handling rules
  - downstream agent consumption rules
  - relationship to `trellis-update-spec`, `trellis-spec-bootstarp`, `trellis-check`, and `trellis-brainstorm`
  - done criteria
- [x] Update `packages/cli/test/templates/codex.test.ts`:
  - replace the empty Codex-specific skills expectation with `trellis-doc-organizer`
  - assert key guardrails in skill content
- [x] Update `packages/cli/test/configurators/platforms.test.ts`:
  - assert Codex configure writes `.codex/skills/trellis-doc-organizer/SKILL.md`
  - rely on existing configure/collect parity test for update tracking
- [x] Run targeted validation:
  - `pnpm test test/templates/codex.test.ts test/configurators/platforms.test.ts`
  - `pnpm typecheck`
- [x] Run final diff review for:
  - no shared `.agents/skills/` distribution
  - no accidental edits to stale `codex/skills/`
  - no default new summary/source-map artifact requirement

## Validation Commands

```powershell
pnpm test test/templates/codex.test.ts test/configurators/platforms.test.ts
pnpm typecheck
```

If targeted tests reveal broader configurator failures, run:

```powershell
pnpm test
```

## Risky Files / Rollback Points

- `packages/cli/src/templates/codex/codex-skills/trellis-doc-organizer/SKILL.md`
  - Rollback: delete this directory.
- `packages/cli/test/templates/codex.test.ts`
  - Rollback: restore previous expectation only if the skill is removed.
- `packages/cli/test/configurators/platforms.test.ts`
  - Rollback: remove only new assertions tied to the skill.

## Grill Gate Decision

skip grill, because the remaining user-authority decisions are resolved: user explicitly chose Codex-only first, rejected default new summary/source-map documents, and confirmed the skill should preserve original in-place organization. Implementation is template/test work with no product UX, security, data-integrity, or external compatibility decision remaining.
