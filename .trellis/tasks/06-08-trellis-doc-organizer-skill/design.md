# Design

Architecture Shaping: required; see `research/architecture-shaping.md`.

## Overview

Add a Codex-only `trellis-doc-organizer` skill that helps an AI organize existing Trellis documents in place. The skill should reduce downstream agent context load by clarifying document roles, moving repeated facts back to their proper owner, and marking stale research as historical or superseded.

The implementation should use the existing Codex-specific skill pipeline:

```text
packages/cli/src/templates/codex/codex-skills/trellis-doc-organizer/SKILL.md
  -> configureCodex()
  -> .codex/skills/trellis-doc-organizer/SKILL.md
```

This keeps the first version Codex-only and avoids shared `.agents/skills/` distribution.

## Boundaries

- In scope:
  - Add the Codex-specific skill template.
  - Update tests that currently assume Codex-specific skills are empty.
  - Verify Codex configure/update tracking writes the skill.
- Out of scope:
  - Common/bundled skill distribution.
  - CLI commands or automatic document scanning.
  - Changes to task lifecycle, workflow status, hooks, agents, or `.trellis/spec/` structure.
  - Actual cleanup of another project's task documents.

## Skill Behavior Contract

The skill must guide an AI to:

- Trigger when existing Trellis docs make downstream agents read too much or risk reading stale facts.
- Skip when the task is small, only has PRD, and has no duplicated or drifting facts.
- Read real files before editing.
- Treat `.trellis/spec/`, `prd.md`, `design.md`, `implement.md`, `research/*.md`, and `.trellis/workspace/` as different authority layers.
- Organize existing files in place rather than creating a new default brief/source-map layer.
- Preserve research/history by default and add explicit status notes when lowering authority.
- Keep task-specific requirements out of `.trellis/spec/`.
- Leave `trellis-update-spec`, `trellis-spec-bootstarp`, and `trellis-check` ownership intact.

## File Placement

Create:

```text
packages/cli/src/templates/codex/codex-skills/trellis-doc-organizer/SKILL.md
```

Do not create the skill under:

```text
packages/cli/src/templates/common/skills/
packages/cli/src/templates/common/bundled-skills/
packages/cli/src/templates/codex/skills/
```

The current `codex/skills/` directory contains stale legacy templates and is not read by `getAllCodexSkills()`. The active Codex-specific source directory is `codex/codex-skills/`.

## Template / Update Contract

`getAllCodexSkills()` already lists subdirectories under `codex-skills` and reads `SKILL.md`.

`configureCodex()` already writes each returned Codex-specific skill to:

```text
.codex/skills/<skill-name>/SKILL.md
```

`collectPlatformTemplates("codex")` already tracks each returned Codex-specific skill at the same path.

Therefore this task should not need a new resolver. Adding the template directory should be enough, with tests updated to prove the behavior.

## Compatibility

- Existing Codex installs without the skill are unaffected until `trellis update` writes the new file.
- Existing shared `.agents/skills/` content is unchanged.
- Other platforms do not receive the skill in this task.

## Risks

- Risk: placing the file under stale `codex/skills/` would make tests pass only if they read source directly, but init/update would not install it.
  - Mitigation: place under `codex/codex-skills/` and assert `getAllCodexSkills()` sees it.
- Risk: skill text accidentally encourages a new summary document layer.
  - Mitigation: tests assert the in-place organization guardrail and no-default-summary language.
- Risk: skill overlaps with `trellis-update-spec`.
  - Mitigation: skill text explicitly delegates spec promotion to existing spec skills and handles cleanup after promotion.

## Planning Gates

- Architecture Shaping: required; completed in `research/architecture-shaping.md`.
- Grill Gate: record in `implement.md`.
