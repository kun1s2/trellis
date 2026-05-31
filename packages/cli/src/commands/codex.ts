import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { DIR_NAMES } from "../constants/paths.js";

export interface CodexLauncherOptions {
  args?: string[];
}

export interface CodexSkillExclusions {
  disabledSkills: string[];
  disabledSkillPaths: string[];
}

interface SpawnResult {
  status: number | null;
  signal: NodeJS.Signals | null;
  error?: Error;
}

interface SpawnOptions {
  stdio: "inherit";
  shell: false;
}

type SpawnRunner = (
  command: string,
  args: string[],
  options: SpawnOptions,
) => SpawnResult;

export interface CodexLaunchPlan {
  command: string;
  args: string[];
  spawnOptions: SpawnOptions;
  skillsConfigOverride: string | null;
}

type SkillConfigKey = "name" | "path";

interface SkillConfigEntry {
  key: SkillConfigKey;
  value: string;
}

function unquoteYamlScalar(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function parseIndentedList(
  content: string,
  rootKey: string,
  listKey: string,
): string[] {
  const lines = content.split("\n");
  const values: string[] = [];
  let inRoot = false;
  let inList = false;
  let rootIndent = 0;
  let listIndent = 0;

  for (const rawLine of lines) {
    const trimmedEnd = rawLine.trimEnd();
    const trimmed = trimmedEnd.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const indent = trimmedEnd.length - trimmedEnd.trimStart().length;
    const rootMatch = trimmedEnd.match(/^(\s*)([A-Za-z0-9_-]+):\s*$/);
    if (rootMatch && indent === 0) {
      inRoot = rootMatch[2] === rootKey;
      inList = false;
      rootIndent = indent;
      continue;
    }

    if (!inRoot) {
      continue;
    }

    if (indent <= rootIndent) {
      inRoot = false;
      inList = false;
      continue;
    }

    const listMatch = trimmedEnd.match(/^(\s*)([A-Za-z0-9_-]+):\s*$/);
    if (listMatch) {
      inList = listMatch[2] === listKey;
      listIndent = indent;
      continue;
    }

    if (!inList || indent <= listIndent) {
      continue;
    }

    const itemMatch = trimmedEnd.match(/^\s*-\s+(.+)$/);
    if (!itemMatch) {
      continue;
    }

    const value = unquoteYamlScalar(itemMatch[1]);
    if (value !== "") {
      values.push(value);
    }
  }

  return values;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function loadCodexSkillExclusions(cwd: string): CodexSkillExclusions {
  const configPath = path.join(cwd, DIR_NAMES.WORKFLOW, "config.yaml");
  if (!fs.existsSync(configPath)) {
    return { disabledSkills: [], disabledSkillPaths: [] };
  }

  const content = fs.readFileSync(configPath, "utf-8").replace(/^\uFEFF/, "");
  return {
    disabledSkills: unique(parseIndentedList(content, "codex", "disabled_skills")),
    disabledSkillPaths: unique(
      parseIndentedList(content, "codex", "disabled_skill_paths"),
    ),
  };
}

function tomlString(value: string): string {
  return JSON.stringify(value);
}

export function buildSkillsConfigOverride(
  exclusions: CodexSkillExclusions,
): string | null {
  const entries: SkillConfigEntry[] = [
    ...exclusions.disabledSkills.map((value) => ({ key: "name" as const, value })),
    ...exclusions.disabledSkillPaths.map((value) => ({
      key: "path" as const,
      value,
    })),
  ];

  if (entries.length === 0) {
    return null;
  }

  const configItems = entries.map(
    (entry) => `{${entry.key}=${tomlString(entry.value)},enabled=false}`,
  );
  return `skills.config=[${configItems.join(",")}]`;
}

export function buildCodexLaunchPlan(
  options: CodexLauncherOptions = {},
  exclusions: CodexSkillExclusions = { disabledSkills: [], disabledSkillPaths: [] },
  platform: NodeJS.Platform = process.platform,
): CodexLaunchPlan {
  const passthroughArgs = options.args ?? [];
  const skillsConfigOverride = buildSkillsConfigOverride(exclusions);
  const args =
    skillsConfigOverride === null
      ? passthroughArgs
      : ["-c", skillsConfigOverride, ...passthroughArgs];

  const spawnOptions: SpawnOptions = { stdio: "inherit", shell: false };
  if (platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", "codex", ...args],
      spawnOptions,
      skillsConfigOverride,
    };
  }

  return {
    command: "codex",
    args,
    spawnOptions,
    skillsConfigOverride,
  };
}

export async function runCodexLauncher(
  options: CodexLauncherOptions = {},
  runner: SpawnRunner = spawnSync,
): Promise<void> {
  const cwd = process.cwd();
  if (!fs.existsSync(path.join(cwd, DIR_NAMES.WORKFLOW))) {
    throw new Error("No .trellis/ directory found. Run `trellis init` first.");
  }

  const exclusions = loadCodexSkillExclusions(cwd);
  const plan = buildCodexLaunchPlan(options, exclusions);
  const result = runner(plan.command, plan.args, plan.spawnOptions);

  if (result.error) {
    throw new Error(
      `Failed to launch Codex. Ensure the codex CLI is installed and available on PATH.`,
    );
  }
  if (result.signal) {
    throw new Error(`Codex was interrupted by ${result.signal}.`);
  }
  if (result.status === null) {
    throw new Error("Codex exited without an exit status.");
  }
  if (result.status !== 0) {
    process.exitCode = result.status;
  }
}
