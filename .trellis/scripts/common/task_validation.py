#!/usr/bin/env python3
"""Task readiness and Goal Contract validation helpers."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

from .io import read_json
from .paths import FILE_TASK_JSON


_CHECKPOINT_STATUS_RE = re.compile(r"^\s*-\s*Status:\s*([A-Za-z0-9_-]+)\s*$")
_CHECKPOINT_HEADING_RE = re.compile(r"^###\s+Checkpoint\s+\d+:.+")

_COMPLEX_SIGNALS = (
    "complex task",
    "complex `task`",
    "architecture shaping",
    "grill gate",
    "trellis-grill-me",
    "trellis-grill-agents",
    "sub-agent",
    "cross-layer",
    "module boundaries",
    "goal contract",
)

_PRD_GUIDANCE_LINE_MARKERS = (
    ("`prd.md`", "requirements", "acceptance criteria", "technical design", "execution checklist"),
    ("lightweight `task`", "prd-only"),
    ("complex `task`", "task.py start", "design.md", "implement.md"),
    ("technical terms", "grill gate", "sub-agent", "quality gate"),
)

_GOAL_CONTRACT_SECTIONS = (
    "## Raw Goal Input",
    "## Goal Contract",
    "### Objective",
    "### Scope",
    "### Constraints",
    "### Done When",
    "### Stop If",
    "## Autonomy Charter",
    "### Frozen Invariants",
    "### Delegated Decisions",
    "### User-Owned Decisions",
    "### Decision Harness",
    "### Evidence Chain",
)


@dataclass(frozen=True)
class ValidationIssue:
    """A single actionable validation issue."""

    severity: str
    message: str


@dataclass(frozen=True)
class ValidationReport:
    """Validation result with hard errors and compatibility warnings."""

    title: str
    issues: tuple[ValidationIssue, ...]

    @property
    def errors(self) -> tuple[ValidationIssue, ...]:
        return tuple(issue for issue in self.issues if issue.severity == "error")

    @property
    def warnings(self) -> tuple[ValidationIssue, ...]:
        return tuple(issue for issue in self.issues if issue.severity == "warning")

    @property
    def ok(self) -> bool:
        return not self.errors


def validate_planning_readiness(task_dir: Path, repo_root: Path) -> ValidationReport:
    """Validate whether a planning task is ready for ``task.py start``."""
    issues: list[ValidationIssue] = []
    task_json = read_json(task_dir / FILE_TASK_JSON) or {}
    prd_text = _read_text(task_dir / "prd.md")
    design_text = _read_text(task_dir / "design.md")
    implement_text = _read_text(task_dir / "implement.md")
    complex_task = _is_complex_task(task_dir, task_json, prd_text, design_text, implement_text)

    if not prd_text.strip():
        issues.append(_error("Missing prd.md or prd.md is empty."))

    grill_text = "\n".join((prd_text, implement_text)).lower()
    if not _has_grill_gate_decision(grill_text):
        severity = "error" if complex_task else "warning"
        issues.append(
            ValidationIssue(
                severity,
                "Missing Grill Gate decision: record `trellis-grill-me required`, "
                "`trellis-grill-agents required`, or `skip grill, because ...`.",
            )
        )

    if complex_task:
        if not design_text.strip():
            issues.append(_error("Complex planning task is missing design.md."))
        if not implement_text.strip():
            issues.append(_error("Complex planning task is missing implement.md."))
        if not _has_architecture_shaping_decision("\n".join((prd_text, design_text))):
            issues.append(
                _error(
                    "Missing Architecture Shaping decision: record "
                    "`Architecture Shaping: required; see research/architecture-shaping.md.` "
                    "or `Architecture Shaping: skipped, because ...`."
                )
            )
        issues.extend(_validate_subagent_manifests(task_dir, repo_root))

    return ValidationReport("Planning readiness", tuple(issues))


def validate_goal_contract(
    task_dir: Path,
    repo_root: Path,
    task_json: dict | None = None,
) -> ValidationReport:
    """Validate Trellis Goal metadata and required Goal Contract artifacts."""
    del repo_root
    issues: list[ValidationIssue] = []
    task_json = task_json if task_json is not None else read_json(task_dir / FILE_TASK_JSON) or {}
    meta = task_json.get("meta")
    goal = meta.get("trellis_goal") if isinstance(meta, dict) else None

    if not isinstance(goal, dict) or goal.get("enabled") is not True:
        issues.append(_error("task.json meta.trellis_goal.enabled must be true."))
    else:
        for key in ("version", "cadence", "source", "converted_from_status", "converted_at", "updated_at"):
            if not goal.get(key):
                issues.append(_error(f"task.json meta.trellis_goal.{key} is required."))

    prd_text = _read_text(task_dir / "prd.md")
    design_text = _read_text(task_dir / "design.md")
    implement_text = _read_text(task_dir / "implement.md")

    for section in _GOAL_CONTRACT_SECTIONS:
        if section.lower() not in prd_text.lower():
            issues.append(_error(f"prd.md missing Goal Contract section: {section}"))

    if "### Token Budget" not in prd_text and "### Token budget" not in prd_text:
        issues.append(_warning("prd.md should record Token Budget, even when it is not specified."))

    if not design_text.strip():
        issues.append(_error("Trellis Goal is missing design.md technical boundary."))
    elif "Architecture Shaping:" not in design_text:
        issues.append(_warning("design.md should record an Architecture Shaping decision."))

    if not implement_text.strip():
        issues.append(_error("Trellis Goal is missing implement.md checkpoint/evidence plan."))
    else:
        issues.extend(_validate_goal_checkpoints(implement_text))
        for section in ("## Delegated Decision Log", "## Rejected Options", "## Evidence Chain"):
            if section.lower() not in implement_text.lower():
                issues.append(_error(f"implement.md missing evidence section: {section}"))

    return ValidationReport("Goal Contract", tuple(issues))


def _validate_goal_checkpoints(implement_text: str) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    headings = 0
    current_has_status = False
    missing_status = 0

    for line in implement_text.splitlines():
        if _CHECKPOINT_HEADING_RE.match(line):
            if headings > 0 and not current_has_status:
                missing_status += 1
            headings += 1
            current_has_status = False
            continue
        if headings > 0 and _CHECKPOINT_STATUS_RE.match(line):
            current_has_status = True

    if headings == 0:
        issues.append(_error("implement.md must contain `### Checkpoint N: ...` headings."))
    elif not current_has_status:
        missing_status += 1

    if missing_status:
        issues.append(_error("Every implement.md checkpoint must include a `- Status:` line."))

    for phrase in (
        "Acceptance / Evidence Required",
        "Work Performed",
        "Verification Command / Result",
        "Remaining Uncertainty",
        "Next Recovery Point",
    ):
        if phrase.lower() not in implement_text.lower():
            issues.append(_error(f"implement.md checkpoints missing evidence field: {phrase}"))

    return issues


def _is_complex_task(
    task_dir: Path,
    task_json: dict,
    prd_text: str,
    design_text: str,
    implement_text: str,
) -> bool:
    if _goal_metadata_enabled(task_json):
        return True
    if (task_dir / "design.md").is_file() or (task_dir / "implement.md").is_file():
        return True
    if task_json.get("children") or task_json.get("subtasks"):
        return True
    signal_prd_text = _strip_template_guidance_lines(prd_text)
    combined = "\n".join((signal_prd_text, design_text, implement_text)).lower()
    return any(signal in combined for signal in _COMPLEX_SIGNALS)


def _strip_template_guidance_lines(text: str) -> str:
    lines: list[str] = []
    for line in text.splitlines():
        lowered = line.lower()
        if any(all(marker in lowered for marker in markers) for markers in _PRD_GUIDANCE_LINE_MARKERS):
            continue
        lines.append(line)
    return "\n".join(lines)


def _goal_metadata_enabled(task_json: dict) -> bool:
    meta = task_json.get("meta")
    if not isinstance(meta, dict):
        return False
    goal = meta.get("trellis_goal")
    return isinstance(goal, dict) and goal.get("enabled") is True


def _has_grill_gate_decision(text: str) -> bool:
    return (
        "trellis-grill-me required" in text
        or "trellis-grill-agents required" in text
        or "skip grill, because" in text
    )


def _has_architecture_shaping_decision(text: str) -> bool:
    lowered = re.sub(r"[`*_]", "", text.lower())
    return (
        "architecture shaping: required; see research/architecture-shaping.md" in lowered
        or "architecture shaping: skipped, because" in lowered
    )


def _validate_subagent_manifests(task_dir: Path, repo_root: Path) -> list[ValidationIssue]:
    issues: list[ValidationIssue] = []
    for name in ("implement.jsonl", "check.jsonl"):
        path = task_dir / name
        if not path.is_file():
            issues.append(_warning(f"{name} is missing; sub-agent context may be incomplete."))
            continue
        if _jsonl_real_entry_count(path, repo_root) == 0:
            issues.append(_warning(f"{name} has only seed/comment rows; curate spec/research context when sub-agents need it."))
    return issues


def _jsonl_real_entry_count(path: Path, repo_root: Path) -> int:
    count = 0
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            continue
        file_path = data.get("file")
        if not file_path:
            continue
        full_path = repo_root / str(file_path)
        if full_path.is_file() or full_path.is_dir():
            count += 1
    return count


def _read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return ""


def _error(message: str) -> ValidationIssue:
    return ValidationIssue("error", message)


def _warning(message: str) -> ValidationIssue:
    return ValidationIssue("warning", message)
