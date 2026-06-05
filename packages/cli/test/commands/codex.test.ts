import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildCodexLaunchPlan,
  runCodexLauncher,
} from "../../src/commands/codex.js";

let tmpDir: string;
let originalCwd: string;
let originalExitCode: string | number | undefined;

function writeTrellisProject(): void {
  fs.mkdirSync(path.join(tmpDir, ".trellis"), { recursive: true });
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

describe("buildCodexLaunchPlan", () => {
  it("passes Codex args through unchanged on non-Windows platforms", () => {
    const plan = buildCodexLaunchPlan(
      { args: ["exec", "--model", "gpt-5"] },
      "linux",
    );

    expect(plan).toEqual({
      command: "codex",
      args: ["exec", "--model", "gpt-5"],
      spawnOptions: { stdio: "inherit", shell: false },
    });
  });

  it("uses cmd.exe on Windows so npm command shims can launch", () => {
    const plan = buildCodexLaunchPlan(
      { args: ["exec", "hello"] },
      "win32",
    );

    expect(plan).toEqual({
      command: "cmd.exe",
      args: [
        "/d",
        "/s",
        "/c",
        "codex",
        "exec",
        "hello",
      ],
      spawnOptions: { stdio: "inherit", shell: false },
    });
  });
});

describe("runCodexLauncher", () => {
  it("launches Codex with passthrough args", async () => {
    writeTrellisProject();
    process.chdir(tmpDir);
    const runner = vi.fn(() => ({ status: 0, signal: null }));

    await runCodexLauncher({ args: ["exec", "hello"] }, runner);

    const expectedPlan = buildCodexLaunchPlan({ args: ["exec", "hello"] });
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
