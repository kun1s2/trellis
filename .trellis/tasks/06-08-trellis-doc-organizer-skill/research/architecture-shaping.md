# Architecture Shaping

## Scope Reviewed

- User requirement: add a Trellis skill that organizes existing task/spec/research docs in place so downstream agents need less context and read fewer stale facts.
- Scope decision: first version is Codex-only.
- Relevant repo evidence:
  - `packages/cli/src/configurators/codex.ts` writes shared skills to `.agents/skills/` and Codex-specific skills to `.codex/skills/`.
  - `packages/cli/src/templates/codex/index.ts` reads Codex-specific skills from `packages/cli/src/templates/codex/codex-skills/<name>/SKILL.md`.
  - `packages/cli/test/templates/codex.test.ts` currently expects `getAllCodexSkills()` to return no Codex-specific skills.
  - `packages/cli/test/configurators/platforms.test.ts` checks configure/collect parity for every platform and specifically verifies Codex writes shared skill templates.
  - `.trellis/spec/cli/backend/configurator-shared.md` requires init write path and update collect path to agree byte-for-byte.

## Long-Lived Assumptions

- Trellis will continue to support both shared `.agents/skills/` and platform-specific `.codex/skills/`.
- Codex-only work should not force all platforms to consume a new workflow skill.
- Template tracking via `collectPlatformTemplates("codex")` must include every file written by `configureCodex()`.
- A documentation organizer skill is prompt/tooling behavior, not a runtime CLI feature.

## Durable Domain Concepts

- **Codex-specific skill**: a skill installed under `.codex/skills/`, consumed only by Codex.
- **Shared skill**: a skill installed under `.agents/skills/`, potentially consumed by Codex, Gemini, and future Agent Skills consumers.
- **In-place organization**: rewriting existing Trellis task/spec/research documents to restore ownership boundaries without creating a new default summary layer.
- **Document authority**: the current role of a document or section, such as canonical, supporting, historical, superseded, or pointer.

## Proposed Module Boundaries

- Place the new skill source under `packages/cli/src/templates/codex/codex-skills/trellis-doc-organizer/SKILL.md`.
- Reuse existing `getAllCodexSkills()` and `configureCodex()` behavior to write it to `.codex/skills/trellis-doc-organizer/SKILL.md`.
- Reuse existing `collectPlatformTemplates("codex")` logic to track it through update.
- Do not add a common skill template or bundled skill in this first version.
- Do not add TypeScript helper logic unless existing `codex-skills` loading proves insufficient.

## Test Surfaces

- `packages/cli/test/templates/codex.test.ts`
  - Update `getAllCodexSkills()` expectation from empty to `trellis-doc-organizer`.
  - Assert `SKILL.md` includes key trigger and in-place organization guardrails.
- `packages/cli/test/configurators/platforms.test.ts`
  - Assert `configurePlatform("codex")` writes `.codex/skills/trellis-doc-organizer/SKILL.md`.
  - Existing byte-for-byte parity test should cover collect/update path.
- Optional targeted run:
  - `pnpm test test/templates/codex.test.ts test/configurators/platforms.test.ts`
  - `pnpm typecheck`

## Toy-MVP Risks Avoided

- Avoid adding a global common skill that all platforms inherit before the behavior is validated.
- Avoid inventing a new CLI scanner or source-map file format when a skill prompt can solve the first user need.
- Avoid creating another summary artifact that becomes a second source of truth.
- Avoid copying current project runtime `.agents/skills` content into templates.

## Accepted Shallow Areas

- No automatic semantic duplicate detection in the first version.
- No cross-platform distribution in the first version.
- No docs-site page unless implementation reveals an existing docs surface that must be updated for consistency.

## Accepted Constraints

- First version is Codex-only.
- The skill must be installed through Codex-specific template source, not shared `.agents/skills/`.
- The skill must default to organizing existing Trellis artifacts in place.
- The skill must explicitly prohibit creating new summary/source-map docs by default.
- The skill must preserve source research by default and use status/pointer notes to lower authority.
- Init and update paths must remain byte-identical through existing template tracking.

## Recommended But Adjustable

- Name the skill `trellis-doc-organizer`.
- Keep the skill single-file unless later examples/references become large enough to justify a bundled skill.
- Keep tests focused on template presence and core instruction text rather than snapshotting the full skill.

## Open Decisions

- None blocking. Future all-platform distribution should be a separate task after Codex-only usage stabilizes.

## Rejected / Speculative Abstractions

- Rejected for this task: `trellis-context-distiller` that creates `agent-context-brief.md`.
- Rejected for this task: a standalone source-map artifact created by default.
- Rejected for this task: automatic semantic similarity scanner.
- Rejected for this task: common bundled skill distribution to all platforms.

## Open User Decisions

- None. User chose Codex-only first.
