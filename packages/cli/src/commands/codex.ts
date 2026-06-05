import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { DIR_NAMES } from "../constants/paths.js";

export interface CodexLauncherOptions {
  args?: string[];
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
}

export function buildCodexLaunchPlan(
  options: CodexLauncherOptions = {},
  platform: NodeJS.Platform = process.platform,
): CodexLaunchPlan {
  const passthroughArgs = options.args ?? [];
  const spawnOptions: SpawnOptions = { stdio: "inherit", shell: false };
  if (platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", "codex", ...passthroughArgs],
      spawnOptions,
    };
  }

  return {
    command: "codex",
    args: passthroughArgs,
    spawnOptions,
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

  const plan = buildCodexLaunchPlan(options);
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
