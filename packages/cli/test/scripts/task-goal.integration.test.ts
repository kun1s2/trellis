/**
 * Integration tests for Trellis goal metadata commands in task.py.
 *
 * These tests stamp the Python script templates into a temporary Trellis
 * project and exercise the real CLI path.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  execFileSync,
  spawnSync,
  type SpawnSyncReturns,
} from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TEMPLATE_SCRIPTS = path.resolve(
  __dirname,
  "../../src/templates/trellis/scripts",
);

function findPython(): string | null {
  for (const command of ["python3", "python"]) {
    try {
      execFileSync(command, ["--version"], { stdio: "ignore" });
      return command;
    } catch {
      // Try the next common Python launcher name.
    }
  }
  return null;
}

const PYTHON_CMD = findPython();

function setupProject(tmp: string): void {
  fs.mkdirSync(tmp, { recursive: true });
  const scriptsDest = path.join(tmp, ".trellis", "scripts");
  fs.mkdirSync(scriptsDest, { recursive: true });
  fs.cpSync(TEMPLATE_SCRIPTS, scriptsDest, { recursive: true });
  fs.mkdirSync(path.join(tmp, ".trellis", "tasks"), { recursive: true });
  fs.writeFileSync(path.join(tmp, ".trellis", "config.yaml"), "\n");
}

function writeTask(
  repo: string,
  name: string,
  status: string,
  extra: Record<string, unknown> = {},
): string {
  const dir = path.join(repo, ".trellis", "tasks", name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "prd.md"), "# Goal\n");
  fs.writeFileSync(
    path.join(dir, "task.json"),
    JSON.stringify(
      {
        id: name,
        name,
        title: name,
        status,
        priority: "P2",
        createdAt: "2026-05-31",
        assignee: "test",
        creator: "test",
        subtasks: [],
        children: [],
        relatedFiles: [],
        meta: {},
        ...extra,
      },
      null,
      2,
    ) + "\n",
  );
  return dir;
}

function writeValidGoalArtifacts(taskDir: string): void {
  fs.writeFileSync(
    path.join(taskDir, "prd.md"),
    `# Goal

## Raw Goal Input

Original request.

## Goal Contract

### Objective

Complete the test goal.

### Scope

Validate goal metadata and checkpoints.

### Constraints

Preserve task lifecycle status.

### Done When

- Metadata is written.
- Checkpoints are visible.
- Validation passes.

### Stop If

- Required artifacts are missing.

### Token Budget

1000000

## Autonomy Charter

### Frozen Invariants

Do not change lifecycle semantics.

### Delegated Decisions

Choose low-risk implementation details.

### User-Owned Decisions

Stop on scope changes.

### Decision Harness

Low ambiguity is evidence-only; high ambiguity stops.

### Evidence Chain

implement.md records checkpoint evidence.
`,
    "utf-8",
  );
  fs.writeFileSync(
    path.join(taskDir, "design.md"),
    `# Design

## Architecture Shaping

Architecture Shaping: skipped, because this fixture validates command behavior only.
`,
    "utf-8",
  );
  fs.writeFileSync(
    path.join(taskDir, "implement.md"),
    `# Implementation Plan

## Checkpoints

### Checkpoint 1: Reconcile Existing Work

- Type: work
- Status: done
- Acceptance / Evidence Required:
  - Existing work reconciled.
- Current Evidence:
  - Fixture.
- Work Performed:
  - Fixture setup.
- Verification Command / Result:
  - Pending.
- Remaining Uncertainty:
  - None.
- Next Recovery Point:
  - Continue.

### Checkpoint 2: Add focused tests

- Type: work
- Status: pending
- Acceptance / Evidence Required:
  - Tests added.
- Current Evidence:
  - Fixture.
- Work Performed:
  - Pending.
- Verification Command / Result:
  - Pending.
- Remaining Uncertainty:
  - None.
- Next Recovery Point:
  - Continue.

## Delegated Decision Log

- None.

## Rejected Options

- None.

## Evidence Chain

- Fixture evidence.
`,
    "utf-8",
  );
}

function runTask(repo: string, ...args: string[]): SpawnSyncReturns<string> {
  if (!PYTHON_CMD) {
    throw new Error("Python is not available");
  }
  return spawnSync(PYTHON_CMD, [".trellis/scripts/task.py", ...args], {
    cwd: repo,
    encoding: "utf-8",
  });
}

describe.skipIf(PYTHON_CMD === null)("task.py Trellis goal commands", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "trellis-goal-test-"));
    setupProject(tmp);
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("mark-goal writes goal metadata without changing task status or custom meta", () => {
    const taskDir = writeTask(tmp, "05-31-demo-goal", "planning", {
      meta: { custom: "keep" },
    });
    writeValidGoalArtifacts(taskDir);

    const result = runTask(
      tmp,
      "mark-goal",
      "05-31-demo-goal",
      "--source",
      "planning-task",
      "--cadence",
      "run-to-completion",
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Marked Trellis goal");

    const taskJson = JSON.parse(
      fs.readFileSync(path.join(taskDir, "task.json"), "utf-8"),
    ) as {
      status: string;
      meta: {
        custom: string;
        trellis_goal: {
          enabled: boolean;
          version: number;
          cadence: string;
          source: string;
          converted_from_status: string;
          converted_at: string;
          updated_at: string;
        };
      };
    };

    expect(taskJson.status).toBe("planning");
    expect(taskJson.meta.custom).toBe("keep");
    expect(taskJson.meta.trellis_goal.enabled).toBe(true);
    expect(taskJson.meta.trellis_goal.version).toBe(1);
    expect(taskJson.meta.trellis_goal.cadence).toBe("run-to-completion");
    expect(taskJson.meta.trellis_goal.source).toBe("planning-task");
    expect(taskJson.meta.trellis_goal.converted_from_status).toBe("planning");
    expect(taskJson.meta.trellis_goal.converted_at.length).toBeGreaterThan(0);
    expect(taskJson.meta.trellis_goal.updated_at.length).toBeGreaterThan(0);
  });

  it("mark-goal refuses to write metadata when the Goal Contract is missing", () => {
    const taskDir = writeTask(tmp, "05-31-invalid-goal", "planning");

    const result = runTask(tmp, "mark-goal", "05-31-invalid-goal");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Goal Contract validation failed");
    expect(result.stderr).toContain("prd.md missing Goal Contract section");

    const taskJson = JSON.parse(
      fs.readFileSync(path.join(taskDir, "task.json"), "utf-8"),
    ) as { meta: Record<string, unknown> };
    expect(taskJson.meta.trellis_goal).toBeUndefined();
  });

  it("goal-info reports metadata and implement.md checkpoint summary", () => {
    const taskDir = writeTask(tmp, "05-31-checkpoint-goal", "in_progress");
    writeValidGoalArtifacts(taskDir);
    fs.appendFileSync(
      path.join(taskDir, "implement.md"),
      `
### Checkpoint 3: Comprehensive Check

- Type: check
- Status: blocked
- Acceptance / Evidence Required:
  - Final checks run.
- Current Evidence:
  - Fixture.
- Work Performed:
  - Pending.
- Verification Command / Result:
  - Pending.
- Remaining Uncertainty:
  - None.
- Next Recovery Point:
  - Continue.
`,
      "utf-8",
    );

    const mark = runTask(
      tmp,
      "mark-goal",
      "05-31-checkpoint-goal",
      "--source",
      "in-progress-task",
    );
    expect(mark.status).toBe(0);

    const info = runTask(tmp, "goal-info", "05-31-checkpoint-goal");

    expect(info.status).toBe(0);
    expect(info.stdout).toContain("Enabled: true");
    expect(info.stdout).toContain("Cadence: checkpoint-bounded");
    expect(info.stdout).toContain("Source: in-progress-task");
    expect(info.stdout).toContain("Converted From Status: in_progress");
    expect(info.stdout).toContain("Total: 3");
    expect(info.stdout).toContain("done: 1");
    expect(info.stdout).toContain("pending: 1");
    expect(info.stdout).toContain("blocked: 1");
    expect(info.stdout).toContain("Next: Checkpoint 2: Add focused tests (pending)");
  });

  it("goal-info reports child task hierarchy and drift warnings", () => {
    const parentDir = writeTask(tmp, "06-01-parent-goal", "in_progress", {
      children: [
        "06-01-child-done",
        "06-01-child-goal",
        "06-01-child-drift",
        "06-01-child-missing",
      ],
    });
    writeValidGoalArtifacts(parentDir);
    writeTask(tmp, "06-01-child-done", "completed", {
      parent: "06-01-parent-goal",
    });
    writeTask(tmp, "06-01-child-goal", "in_progress", {
      parent: "06-01-parent-goal",
      meta: {
        trellis_goal: {
          enabled: true,
          version: 1,
          cadence: "checkpoint-bounded",
          source: "planning-task",
        },
      },
    });
    writeTask(tmp, "06-01-child-drift", "planning", {
      parent: "06-01-other-parent",
    });
    writeTask(tmp, "06-01-orphan-child", "planning", {
      parent: "06-01-parent-goal",
    });

    const mark = runTask(tmp, "mark-goal", "06-01-parent-goal");
    expect(mark.status).toBe(0);

    const info = runTask(tmp, "goal-info", "06-01-parent-goal");

    expect(info.status).toBe(0);
    expect(info.stdout).toContain("Hierarchy:");
    expect(info.stdout).toContain("Parent: -");
    expect(info.stdout).toContain("Children: 4 [1/4 done]");
    expect(info.stdout).toContain(
      "06-01-child-done/ (completed) [test] parent=06-01-parent-goal",
    );
    expect(info.stdout).toContain(
      "06-01-child-goal/ (in_progress) [goal] [test] parent=06-01-parent-goal",
    );
    expect(info.stdout).toContain("Child listed but not found");
    expect(info.stdout).toContain("Child parent mismatch");
    expect(info.stdout).toContain(
      "Task points to this parent but is missing from children list: 06-01-orphan-child",
    );
  });

  it("list marks Trellis goal tasks in the task hierarchy", () => {
    const parentDir = writeTask(tmp, "06-01-parent-goal", "in_progress", {
      children: ["06-01-child-task"],
    });
    writeValidGoalArtifacts(parentDir);
    writeTask(tmp, "06-01-child-task", "planning", {
      parent: "06-01-parent-goal",
    });

    const mark = runTask(tmp, "mark-goal", "06-01-parent-goal");
    expect(mark.status).toBe(0);

    const list = runTask(tmp, "list");

    expect(list.status).toBe(0);
    expect(list.stdout).toContain("06-01-parent-goal/ (in_progress) [goal]");
    expect(list.stdout).toContain("06-01-child-task/ (planning)");
  });
});
