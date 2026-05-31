import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildCodexLaunchPlan,
  buildSkillsConfigOverride,
  loadCodexSkillExclusions,
  runCodexLauncher,
} from "../../src/commands/codex.js";

let tmpDir: string;
let originalCwd: string;
let originalExitCode: string | number | undefined;

function writeConfig(content: string): void {
  const trellisDir = path.join(tmpDir, ".trellis");
  fs.mkdirSync(trellisDir, { recursive: true });
  fs.writeFileSync(path.join(trellisDir, "config.yaml"), content, "utf-8");
}

beforeEach(() => {
  originalCwd = process.cwd();
  originalExitCode = process.exitCode;
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "trellis-codex-test-"));
});

afterEach(() => {
  process.chdir(originalCwd);
  process.exitCode = originalExitCode;
  vi.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("loadCodexSkillExclusions", () => {
  it("loads disabled Codex skills by name and path from config.yaml", () => {
    writeConfig(`
session_commit_message: "chore: record journal"

codex:
  dispatch_mode: inline
  disabled_skills:
    - grill-me
    - "global-helper"
    - grill-me
  disabled_skill_paths:
    - D:/Users/Kun/.agents/skills/grill-me/SKILL.md
`);

    expect(loadCodexSkillExclusions(tmpDir)).toEqual({
      disabledSkills: ["grill-me", "global-helper"],
      disabledSkillPaths: [
        "D:/Users/Kun/.agents/skills/grill-me/SKILL.md",
      ],
    });
  });

  it("returns empty exclusions when Trellis config is missing", () => {
    expect(loadCodexSkillExclusions(tmpDir)).toEqual({
      disabledSkills: [],
      disabledSkillPaths: [],
    });
  });

  it("handles UTF-8 BOM config files written by Windows editors", () => {
    writeConfig("\uFEFFcodex:\n  disabled_skills:\n    - grill-me\n");

    expect(loadCodexSkillExclusions(tmpDir).disabledSkills).toEqual([
      "grill-me",
    ]);
  });
});

describe("buildSkillsConfigOverride", () => {
  it("builds session-level Codex skills.config entries", () => {
    const override = buildSkillsConfigOverride({
      disabledSkills: ["grill-me"],
      disabledSkillPaths: ["D:\\Users\\Kun\\.agents\\skills\\grill-me\\SKILL.md"],
    });

    expect(override).toBe(
      'skills.config=[{name="grill-me",enabled=false},{path="D:\\\\Users\\\\Kun\\\\.agents\\\\skills\\\\grill-me\\\\SKILL.md",enabled=false}]',
    );
  });

  it("returns null when no skills are excluded", () => {
    expect(
      buildSkillsConfigOverride({
        disabledSkills: [],
        disabledSkillPaths: [],
      }),
    ).toBeNull();
  });
});

describe("buildCodexLaunchPlan", () => {
  it("passes Codex args through unchanged when no exclusions are configured", () => {
    const plan = buildCodexLaunchPlan(
      { args: ["exec", "--model", "gpt-5"] },
      { disabledSkills: [], disabledSkillPaths: [] },
      "linux",
    );

    expect(plan).toEqual({
      command: "codex",
      args: ["exec", "--model", "gpt-5"],
      spawnOptions: { stdio: "inherit", shell: false },
      skillsConfigOverride: null,
    });
  });

  it("prepends Trellis skills.config before passthrough Codex args", () => {
    const plan = buildCodexLaunchPlan(
      { args: ["--model", "gpt-5"] },
      { disabledSkills: ["grill-me"], disabledSkillPaths: [] },
      "linux",
    );

    expect(plan.args).toEqual([
      "-c",
      'skills.config=[{name="grill-me",enabled=false}]',
      "--model",
      "gpt-5",
    ]);
  });

  it("uses cmd.exe on Windows so npm command shims can launch", () => {
    const plan = buildCodexLaunchPlan(
      { args: ["exec", "hello"] },
      { disabledSkills: ["grill-me"], disabledSkillPaths: [] },
      "win32",
    );

    expect(plan).toEqual({
      command: "cmd.exe",
      args: [
        "/d",
        "/s",
        "/c",
        "codex",
        "-c",
        'skills.config=[{name="grill-me",enabled=false}]',
        "exec",
        "hello",
      ],
      spawnOptions: { stdio: "inherit", shell: false },
      skillsConfigOverride:
        'skills.config=[{name="grill-me",enabled=false}]',
    });
  });
});

describe("runCodexLauncher", () => {
  it("launches Codex with project-scoped skill exclusions", async () => {
    writeConfig(`
codex:
  disabled_skills:
    - grill-me
`);
    process.chdir(tmpDir);
    const runner = vi.fn(() => ({ status: 0, signal: null }));

    await runCodexLauncher({ args: ["exec", "hello"] }, runner);

    const expectedPlan = buildCodexLaunchPlan(
      { args: ["exec", "hello"] },
      { disabledSkills: ["grill-me"], disabledSkillPaths: [] },
    );
    expect(runner).toHaveBeenCalledWith(
      expectedPlan.command,
      expectedPlan.args,
      expectedPlan.spawnOptions,
    );
  });

  it("requires a Trellis project", async () => {
    process.chdir(tmpDir);
    const runner = vi.fn(() => ({ status: 0, signal: null }));

    await expect(runCodexLauncher({}, runner)).rejects.toThrow(
      /No \.trellis\/ directory/,
    );
    expect(runner).not.toHaveBeenCalled();
  });
});
