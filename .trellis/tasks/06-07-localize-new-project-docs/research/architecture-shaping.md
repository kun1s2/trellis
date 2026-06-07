# Architecture Shaping

## Scope Reviewed

- `packages/cli/src/commands/init.ts` bootstrap / joiner onboarding task generation.
- `packages/cli/src/templates/markdown/**` root, workspace, and spec scaffold templates.
- `packages/cli/src/templates/trellis/workflow.md` as the default generated workflow reference.
- `packages/cli/src/configurators/shared.ts` class-2 pull-based prelude language rule.
- `packages/cli/test/commands/init.integration.test.ts` init output verification surface.
- `marketplace/specs/**` language rules that can enter new projects through `trellis init --template`.
- Historical task `06-04-chinese-human-readable-artifacts` for prior scope boundary.

## Long-Lived Assumptions

- This repository's Trellis variant is maintained primarily for Codex; shared templates may still affect multiple platforms.
- New project defaults are defined by source templates under `packages/cli/src/templates/**`, not by the current repository's generated `.trellis/**` copies.
- `trellis update` relies on template hash ownership; text changes are acceptable, but path/schema changes are not part of this task.
- Marketplace spec templates can become new project content through `trellis init --template`, even though they are outside the built-in blank scaffold.

## Durable Domain Concepts

- Human-readable documentation: Markdown content intended for users or agents to read and maintain.
- Technical terms / machine contracts: file names, commands, JSON keys, status values, APIs, package names, symbols, and Trellis workflow terms that must remain exact.
- Template source of truth: files under `packages/cli/src/templates/**` and marketplace spec template files.
- Dogfood generated copy: current `.trellis/**` content inside this repository.

## Proposed Module Boundaries

- Keep implementation as template text updates plus focused tests; do not add a runtime i18n layer.
- Keep language policy repeated only at entry points that instruct downstream writing: `AGENTS.md`, spec indexes, workspace index, bootstrap / joiner task, and workflow / skill guidance where relevant.
- Use tests to validate generated output rather than relying only on template source string checks.

## Test Surfaces

- Init integration tests should read actual files created in a temp project.
- Template export regression checks should cover direct template strings for faster source-level failure.
- Marketplace language-rule scan can be deterministic and focused on old English language-rule phrases.

## Toy-MVP Risks Avoided

- Avoid only editing `.trellis/spec/**` in the current repo; that would not affect new projects.
- Avoid blind global replace of `English` because docs-site and bilingual docs have legitimate English / Chinese distinctions.
- Avoid adding a `language` config flag without a product requirement.
- Avoid translating machine-readable contracts.

## Accepted Shallow Areas

- Full translation of every workflow / skill / marketplace paragraph is not required for this task.
- Non-Codex platform-specific phrasing can remain English unless it conflicts with shared new-project language policy.

## Accepted Constraints

- Modify source templates, not only generated dogfood copies.
- Preserve machine-readable contracts and technical terms.
- Verify generated init output with UTF-8 reads.
- Prevent old blanket `All documentation should/must be written in English` rules from reappearing in new-project Trellis docs.

## Recommended But Adjustable

- Add a small constant in tests for the Chinese language policy phrase if it improves readability.
- Keep marketplace full-body translation as follow-up unless language rules alone are insufficient to meet acceptance.

## Open Decisions

- None that block planning.

## Rejected / Speculative Abstractions

- Runtime language selector.
- Full i18n resource system for templates.
- Cross-platform full translation campaign.

## Open User Decisions

- None.
