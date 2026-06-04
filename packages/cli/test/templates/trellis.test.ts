import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  scriptsInit,
  commonInit,
  commonPaths,
  commonDeveloper,
  commonGitContext,
  commonTaskQueue,
  commonTaskUtils,
  commonActiveTask,
  commonCliAdapter,
  getDeveloperScript,
  initDeveloperScript,
  taskScript,
  getContextScript,
  addSessionScript,
  workflowMdTemplate,
  gitignoreTemplate,
  getAllScripts,
} from "../../src/templates/trellis/index.js";

// =============================================================================
// Template Constants — module-level string exports
// =============================================================================

describe("trellis template constants", () => {
  const allTemplates = {
    scriptsInit,
    commonInit,
    commonPaths,
    commonDeveloper,
    commonGitContext,
    commonTaskQueue,
    commonTaskUtils,
    commonActiveTask,
    commonCliAdapter,
    getDeveloperScript,
    initDeveloperScript,
    taskScript,
    getContextScript,
    addSessionScript,
    workflowMdTemplate,
    gitignoreTemplate,
  };

  function inProgressBreadcrumb(): string {
    const inProgressMatch = /\[workflow-state:in_progress\]([\s\S]*?)\[\/workflow-state:in_progress\]/.exec(
      workflowMdTemplate,
    );
    if (!inProgressMatch) {
      throw new Error("in_progress breadcrumb block must exist in workflow.md");
    }
    return inProgressMatch[1];
  }

  function workflowStateBreadcrumb(status: string): string {
    const match = new RegExp(
      `\\[workflow-state:${status}\\]([\\s\\S]*?)\\[/workflow-state:${status}\\]`,
    ).exec(workflowMdTemplate);
    if (!match) {
      throw new Error(`${status} breadcrumb block must exist in workflow.md`);
    }
    return match[1];
  }

  function stepSection(step: string): string {
    const pattern = new RegExp(
      `#### ${step.replace(".", "\\.")}[^\\n]*\\n([\\s\\S]*?)(?=\\n#### |\\n### |$)`,
    );
    const match = pattern.exec(workflowMdTemplate);
    if (!match) {
      throw new Error(`workflow.md step ${step} must exist`);
    }
    return match[1];
  }

  it("all templates are non-empty strings", () => {
    for (const [name, content] of Object.entries(allTemplates)) {
      expect(content.length, `${name} should be non-empty`).toBeGreaterThan(0);
    }
  });

  it("Python scripts contain valid Python syntax indicators", () => {
    // scriptsInit (__init__.py) only has docstrings, so use scripts with actual code
    const pyScripts = [
      commonInit,
      commonPaths,
      commonActiveTask,
      getDeveloperScript,
      taskScript,
    ];
    for (const script of pyScripts) {
      expect(
        script.includes("import") ||
          script.includes("def ") ||
          script.includes("class ") ||
          script.includes("#"),
      ).toBe(true);
    }
  });

  it("scriptsInit is a Python docstring module", () => {
    expect(scriptsInit).toContain('"""');
  });

  it("workflowMdTemplate is markdown", () => {
    expect(workflowMdTemplate).toContain("#");
  });

  it("marketplace native workflow mirror matches the bundled workflow", () => {
    const repoRoot = fs.existsSync(path.join(process.cwd(), "marketplace"))
      ? process.cwd()
      : path.resolve(process.cwd(), "../..");
    const marketplaceNative = fs.readFileSync(
      path.join(repoRoot, "marketplace/workflows/native/workflow.md"),
      "utf-8",
    );
    expect(marketplaceNative).toBe(workflowMdTemplate);
  });

  it("marketplace TDD workflow planning breadcrumbs include behavior gates", () => {
    const repoRoot = fs.existsSync(path.join(process.cwd(), "marketplace"))
      ? process.cwd()
      : path.resolve(process.cwd(), "../..");
    const tddWorkflow = fs.readFileSync(
      path.join(repoRoot, "marketplace/workflows/tdd/workflow.md"),
      "utf-8",
    );
    const planning = /\[workflow-state:planning\]([\s\S]*?)\[\/workflow-state:planning\]/.exec(
      tddWorkflow,
    )?.[1];
    const planningInline = /\[workflow-state:planning-inline\]([\s\S]*?)\[\/workflow-state:planning-inline\]/.exec(
      tddWorkflow,
    )?.[1];

    for (const block of [planning, planningInline]) {
      expect(block).toContain("observable behavior slices");
      expect(block).toContain("public interface under test");
      expect(block).toContain("mock boundaries");
    }
  });

  it("[issue-225] workflow.md in_progress breadcrumb has class-2 sub-agent dispatch protocol", () => {
    // The in_progress breadcrumb instructs the main agent to prefix
    // dispatch prompts with "Active task: <path>" on class-2 platforms.
    // Without this line, codex/copilot/gemini/qoder sub-agents cannot
    // find the active task (no PreToolUse hook to inject context).
    const block = inProgressBreadcrumb();
    expect(block).toContain("Active task:");
    expect(block.toLowerCase()).toContain("class-2");
    expect(block).toMatch(/codex|copilot|gemini|qoder/);
  });

  it("[trellis-goal] workflow.md breadcrumbs route goal mode", () => {
    const noTask = workflowStateBreadcrumb("no_task");
    const planning = workflowStateBreadcrumb("planning");
    const inProgress = workflowStateBreadcrumb("in_progress");
    const inProgressInline = workflowStateBreadcrumb("in_progress-inline");

    expect(noTask).toContain("load `trellis-goal`");
    expect(noTask).toContain("create_goal");
    expect(planning).toContain("initialized or converted by `trellis-goal`");
    expect(planning).toContain("Codex native goal state");
    expect(inProgress).toContain("Goal execution override");
    expect(inProgress).toContain("Codex native goal state");
    expect(inProgress).toContain("rather than a local queue");
    expect(inProgressInline).toContain("Goal execution override");
    expect(inProgressInline).toContain("Codex native goal state");
  });

  it("[trellis-goal] workflow.md routes attended and unattended grilling", () => {
    const planning = workflowStateBreadcrumb("planning");
    const planningInline = workflowStateBreadcrumb("planning-inline");

    for (const block of [planning, planningInline]) {
      expect(block).toContain("Grill Gate");
      expect(block).toContain("skip grill, because ...");
      expect(block).toContain("trellis-grill-me required");
      expect(block).toContain("trellis-grill-agents required");
      expect(block).toContain("trellis-grill-me");
      expect(block).toContain("evidence proves");
      expect(block).toContain("unattended/proxy answers");
      expect(block).not.toContain("`grill-me required`");
      expect(block).not.toContain("`grill-me` / `trellis-grill-me`");
    }
  });

  it("[trellis-architecture-shaping] workflow.md records Phase 1 trigger decisions", () => {
    const planning = workflowStateBreadcrumb("planning");
    const planningInline = workflowStateBreadcrumb("planning-inline");

    expect(workflowMdTemplate).toContain("Production-shaped MVPs");
    expect(workflowMdTemplate).toContain("### Architecture Shaping Decision");
    expect(workflowMdTemplate).toContain("trellis-architecture-shaping");
    expect(workflowMdTemplate).toContain("research/architecture-shaping.md");
    expect(workflowMdTemplate).toContain("accepted constraints");

    for (const block of [planning, planningInline]) {
      expect(block).toContain("Architecture Shaping");
      expect(block).toContain("Architecture Shaping: required");
      expect(block).toContain("Architecture Shaping: skipped");
      expect(block).toContain("toy-MVP implementation");
    }
  });

  it("[trellis-grill] brainstorm and continue templates require an auditable Grill Gate", () => {
    const repoRoot = fs.existsSync(path.join(process.cwd(), "packages"))
      ? process.cwd()
      : path.resolve(process.cwd(), "../..");
    const brainstorm = fs.readFileSync(
      path.join(
        repoRoot,
        "packages/cli/src/templates/common/skills/brainstorm.md",
      ),
      "utf-8",
    );
    const continueCommand = fs.readFileSync(
      path.join(
        repoRoot,
        "packages/cli/src/templates/common/commands/continue.md",
      ),
      "utf-8",
    );

    expect(brainstorm).toContain("## Grill Gate");
    expect(brainstorm).toContain("The Grill Gate result is recorded");
    expect(brainstorm).toContain("trellis-grill-me required");
    expect(brainstorm).toContain("skip grill, because ...");
    expect(continueCommand).toContain("Grill Gate is missing");
    expect(continueCommand).toContain("Grill Gate recorded");
    expect(continueCommand).toContain("trellis-grill-me required");
    expect(brainstorm).not.toContain("`grill-me required`");
    expect(continueCommand).not.toContain("`grill-me required`");
  });
  it("[issue-237] workflow.md in_progress breadcrumb self-exempts implement/check sub-agents", () => {
    // The in_progress breadcrumb may be injected into sub-agent turns on some
    // hosts, so its main-session dispatch guidance must not recursively apply
    // to a sub-agent that is already doing the requested work.
    const block = inProgressBreadcrumb();
    expect(block).toContain("Main-session default");
    expect(block).toContain("Sub-agent self-exemption");
    expect(block).toContain("already running as `trellis-implement`");
    expect(block).toContain("do NOT spawn another `trellis-implement`");
    expect(block).toContain("already running as `trellis-check`");
    expect(block).toContain("do NOT spawn another `trellis-check`");
    expect(block).toContain("main session only");
  });

  it("[issue-237] workflow.md Phase 2 dispatch steps require prompt recursion guards", () => {
    expect(workflowMdTemplate).toContain("**Dispatch prompt guard**");
    expect(workflowMdTemplate).toContain(
      "already the `trellis-implement` sub-agent",
    );
    expect(workflowMdTemplate).toContain(
      "not spawn another `trellis-implement` / `trellis-check`",
    );
    expect(workflowMdTemplate).toContain(
      "already the `trellis-check` sub-agent",
    );
    expect(workflowMdTemplate).toContain(
      "not spawn another `trellis-check` / `trellis-implement`",
    );
  });

  it("workflow.md documents parent child task tree responsibilities", () => {
    expect(workflowMdTemplate).toContain("### Parent / Child Task Trees");
    expect(workflowMdTemplate).toContain(
      "several independently verifiable deliverables",
    );
    expect(workflowMdTemplate).toContain(
      "Parent/child structure is not a dependency system",
    );
    expect(workflowMdTemplate).toContain("--parent <parent-dir>");
    expect(workflowMdTemplate).toContain("task.py add-subtask <parent> <child>");
    expect(workflowMdTemplate).toContain(
      "start the child that owns the next independently verifiable deliverable",
    );
  });

  it("workflow.md step 1.1 includes parent child split guidance", () => {
    const step = stepSection("1.1");
    expect(step).toContain("When considering a parent/child split");
    expect(step).toContain("Parent tasks own source requirements");
    expect(step).toContain("Child tasks own actual deliverables");
    expect(step).toContain(
      "Parent/child structure is not a dependency system",
    );
    expect(step).toContain("Do not start the parent unless");
  });

  it("workflow.md planning breadcrumbs mention parent child split guidance", () => {
    const planning = workflowStateBreadcrumb("planning");
    const planningInline = workflowStateBreadcrumb("planning-inline");
    for (const block of [planning, planningInline]) {
      expect(block).toContain("Multi-deliverable scope");
      expect(block).toContain("parent task plus independently verifiable child tasks");
      expect(block).toContain("not implied by tree position");
    }
  });

  it("gitignoreTemplate contains ignore patterns", () => {
    expect(gitignoreTemplate).toContain(".developer");
    expect(gitignoreTemplate).toContain("__pycache__");
  });
});

// =============================================================================
// getAllScripts — pure function assembling pre-loaded strings
// =============================================================================

describe("getAllScripts", () => {
  it("returns a Map", () => {
    const scripts = getAllScripts();
    expect(scripts).toBeInstanceOf(Map);
  });

  it("contains expected script entries", () => {
    const scripts = getAllScripts();
    expect(scripts.has("__init__.py")).toBe(true);
    expect(scripts.has("common/__init__.py")).toBe(true);
    expect(scripts.has("common/paths.py")).toBe(true);
    expect(scripts.has("common/active_task.py")).toBe(true);
    expect(scripts.has("task.py")).toBe(true);
    expect(scripts.has("get_developer.py")).toBe(true);
  });

  it("has at least one entry", () => {
    const scripts = getAllScripts();
    expect(scripts.size).toBeGreaterThan(0);
  });

  it("all values are non-empty strings", () => {
    const scripts = getAllScripts();
    for (const [key, value] of scripts) {
      expect(value.length, `${key} should be non-empty`).toBeGreaterThan(0);
    }
  });

  it("values match the exported constants", () => {
    const scripts = getAllScripts();
    expect(scripts.get("__init__.py")).toBe(scriptsInit);
    expect(scripts.get("common/__init__.py")).toBe(commonInit);
    expect(scripts.get("task.py")).toBe(taskScript);
  });

  it("does not contain multi_agent entries", () => {
    const scripts = getAllScripts();
    for (const [key] of scripts) {
      expect(key, `${key} should not be a multi_agent script`).not.toContain("multi_agent");
    }
  });
});
