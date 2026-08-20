---
title: Implementation Report Research Pipeline
date: 2026-08-19
status: completed
completed-date: 2026-08-19
---

# Implementation Report Research Pipeline Implementation Plan

> **For agentic workers:** Implement this plan task-by-task and run the
> validation commands after each task.

**Goal:** Make `implementation-report` the single entry point for plan-driven
implementation analysis, evidence/data provenance, theory derivation, Python
figures, direct diagrams, and compile/read-back Beamer QA.

**Architecture:** Keep specialist skills independent. The orchestrator defines
phase order, inputs, outputs, hard gates, and recovery states; each specialist
produces an artifact referenced by a versioned manifest. Replace Mermaid with a
structured diagram brief consumed directly by `diagram-design`.

**Tech Stack:** Markdown skill contracts, YAML manifests, Python/matplotlib via
`nature-figure`, `diagram-design` HTML/SVG/PNG, XeLaTeX/Beamer, shell/YAML
validation already present in the repository.

**Spec:** `docs/superpowers/specs/2026-08-19-implementation-report-pipeline-design.md`

## Global Constraints

- Read planning files before code.
- Never fabricate evidence, data identifiers, formulas, or completion status.
- Use Python exclusively for `nature-figure` rendering and visual QA.
- Do not emit or require `workflow.mmd`.
- Keep report paths relative and versioned.
- Compile and read back Beamer output before final status.
- Repair layout for no more than three bounded iterations.

---

### Task 1: Replace the implementation-report contract

**Files:**
- Modify: `skills/implementation-report/SKILL.md`
- Modify: `skills/implementation-report/agents/openai.yaml`

**Deliverable:** A concise two-mode orchestrator contract covering plan intake,
execution evidence, result analysis, required specialist handoffs, artifact
manifest, resumability, and compile/read-back QA.

- [x] Rewrite the trigger description to mention code/run/result analysis,
  scientific visualization, theory alignment, workflow diagrams, and academic
  slide production.
- [x] Add `status-only` and `full-analysis` modes with explicit selection rules.
- [x] Define the phase order and phase-level inputs/outputs.
- [x] Remove all Mermaid source/engine requirements and replace them with a
  `diagram-spec.yaml` or equivalent direct diagram brief.
- [x] Define hard gates, blocked/unknown states, no-mock-data rules, and the
  maximum three-iteration Beamer layout loop.
- [x] Update the agent interface prompt so it no longer asks for Mermaid.

### Task 2: Add specialist handoff contracts

**Files:**
- Create: `skills/implementation-report/references/full-analysis-contract.md`
- Create: `skills/implementation-report/references/figure-and-layout-contract.md`
- Modify: `skills/implementation-report/references/workflow-diagram-contract.md`
- Modify: `skills/implementation-report/references/diagram-design-profile.md`

**Deliverable:** Focused contracts for result/data/theory/figure/diagram/slide
artifacts and visual/layout QA.

- [x] Define the manifest schema and required artifact paths.
- [x] Define evidence levels and the separation between observation,
  interpretation, and claim.
- [x] Define the `nature-data` inventory fields and unresolved-field behavior.
- [x] Define the `formula-derivation` target handoff and blocker statuses.
- [x] Define the Python figure contract, source-data linkage, exports, and
  natural-aspect-ratio rules.
- [x] Define the direct `diagram-design` brief, visual dials, and fidelity
  ledger without Mermaid.
- [x] Define Beamer compile, PDF read-back, and layout repair checks.

### Task 3: Update Beamer consumer integration

**Files:**
- Modify: `skills/beamer-academic/references/layouts.md`
- Modify: `skills/beamer-academic/references/layout-registry.yaml`
- Modify: `skills/beamer-academic/references/tex-header.md`
- Modify: `skills/beamer-academic/assets/config.yaml`
- Modify: `skills/beamer-academic/CHANGELOG.md`

**Deliverable:** Beamer consumes the new manifest and direct diagram/figure
artifacts, while retaining `workflow-overview` as a layout name for backward
compatibility.

- [x] Replace `workflow.mmd` prerequisites with `diagram-spec.yaml` and
  `diagram/workflow.*` paths.
- [x] Add result-analysis, data-audit, derivation, and figure artifact slots.
- [x] Require `keepaspectratio` and bounded image dimensions in the handoff.
- [x] Document compile/read-back repair and final QA status.
- [x] Ensure missing diagrams or figures are marked blocked rather than
  silently replaced.

### Task 4: Synchronize repository maps and public docs

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `references/flow-map.md`
- Modify: `references/skill-source-map.md`
- Modify: `docs/superpowers/README.md`

**Deliverable:** Public documentation describes the new end-to-end flow and no
longer claims that implementation-report emits Mermaid.

- [x] Update the paper/implementation flow text.
- [x] Record specialist ownership and direct diagram handoff.
- [x] Update generated-plan/spec index entries.
- [x] Keep unrelated existing work untouched.

### Task 5: Validate the contract

**Files:**
- Test: repository validation commands and targeted text scans.

- [x] Run `bash tools/verify-superpowers-index.sh`.
- [x] Run `python3 tools/check_skills_inventory.py` if its current interface
  supports the repository snapshot.
- [x] Run YAML/frontmatter checks for the edited skill and manifests.
- [x] Scan implementation-report, Beamer, README, and flow maps for stale
  `workflow.mmd`, Mermaid, and unsupported manifest keys.
- [x] Run `git diff --check` and inspect only the intended diff.
