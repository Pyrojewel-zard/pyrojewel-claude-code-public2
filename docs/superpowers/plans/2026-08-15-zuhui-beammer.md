---
title: zuhui-beammer implementation
date: 2026-08-15
status: completed
completed-date: 2026-08-15
---

# zuhui-beammer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local `zuhui-beammer` skill and a reusable standalone Beamer theme that reproduce the ADC Calibration PDF's white/red technical group-meeting language while inheriting the parent evidence and QA contract.

**Architecture:** Keep the new skill isolated under `skills/zuhui-beammer/`. `SKILL.md` contains discovery triggers, inherited workflow rules, ADC-specific content/page contracts, and verification requirements. `assets/beamerthemeZuhuiBeammer.sty` is an independent visual theme derived from the parent skill's workflow contract; it does not load `beamerthemeAcademic.sty`, so the parent theme remains unchanged and cannot leak navy/card defaults into ADC slides.

**Tech Stack:** Markdown skill instructions, XeLaTeX/Beamer, TikZ, xcolor, shell-based static validation, `pdfinfo`, `pdftotext`, and `pdftoppm`.

**Spec:** `docs/superpowers/specs/2026-08-15-zuhui-beammer-design.md`

## Global Constraints

- Preserve all unrelated user changes in the worktree.
- Keep the requested skill directory name exactly `skills/zuhui-beammer/`.
- The skill must inherit evidence status labels `reported`, `synthesized`, `project_result`, and `unknown`.
- The Zuhui theme must not load or edit `beamerthemeAcademic.sty`; derivation occurs at the skill/workflow level.
- The PDF reference is `ADC_Calibration.pdf` at the repository root.
- All delivered links and paths must be repository-relative or environment-configurable; do not add machine-specific paths to the skill.

---

### Task 1: Establish the RED baseline and test fixture

**Files:**
- Create: `skills/zuhui-beammer/examples/test-prompts.json`
- Create: `skills/zuhui-beammer/examples/baseline-no-skill.md`

**Interfaces:**
- Consumes: The approved design and `ADC_Calibration.pdf`.
- Produces: Reproducible pressure prompts and a record of the no-skill failure modes that the final skill must prevent.

- [ ] **Step 1: Write the pressure scenarios**

  Include three prompts: a PDF-style extraction task, an ADC simulation-results task, and a “make it quickly” pressure task. Each prompt must tempt the agent to use the parent navy/gold card layout, omit source labels, or collapse circuit/code/plot evidence into generic bullets.

- [ ] **Step 2: Record the baseline**

  Record the clean-context agent's observed defaults under headings `natural defaults`, `failure modes`, and `missing contracts`. If a subagent backend is unavailable, state that limitation and use the observable parent-skill defaults as the baseline evidence.

- [ ] **Step 3: Check the fixture shape**

  Run `python3 -m json.tool skills/zuhui-beammer/examples/test-prompts.json`.
  Expected: valid JSON with three scenario objects, each containing `id`, `prompt`, and `expected_constraints`.

### Task 2: Implement the Beamer overlay

**Files:**
- Create: `skills/zuhui-beammer/assets/beamerthemeZuhuiBeammer.sty`
- Create: `skills/zuhui-beammer/examples/minimal.tex`

**Interfaces:**
- Consumes: the standalone Beamer base class and standard packages; it must not load `beamerthemeAcademic.sty`.
- Produces: `beamerthemeZuhuiBeammer.sty`, defining the `zuhui` colors and reusable commands `\zuhuiframetitle`, `\zuhuisectionbar`, `\zuhuifigcap`, `\zuhuicodebox`, and `\zuhuiresultlegend`.

- [ ] **Step 1: Define visual tokens**

  Define configurable colors for `zuhui-red`, `zuhui-red-light`, `zuhui-ink`, `zuhui-gray`, `zuhui-grid`, `zuhui-blue`, and `zuhui-green`. Keep the canvas white and use red as the primary accent.

- [ ] **Step 2: Override page chrome**

  Set the headline to a thin white area with a short red rule, keep body text dark, add a pale-red footline rule and page number, and leave a configurable `\zuhuiwatermark` empty by default.

- [ ] **Step 3: Add technical primitives**

  Implement title, section rule, source-aware figure caption, code box, and legend helpers with no rounded dark cards. Preserve readable minimum sizes and avoid fixed absolute image paths.

- [ ] **Step 4: Build the minimal example**

  Load `xeCJK`, then `beamerthemeZuhuiBeammer`; demonstrate a title page, equation-plus-figure page, code-plus-equation page, and calibrated-vs-raw result legend without requiring external figure files.

- [ ] **Step 5: Compile or document the environment result**

  Run `xelatex -interaction=nonstopmode -halt-on-error minimal.tex` twice from the example directory when available. Expected: a PDF with no LaTeX errors; otherwise record the missing dependency in the final QA instead of weakening the overlay.

### Task 3: Write the new skill contract

**Files:**
- Create: `skills/zuhui-beammer/SKILL.md`
- Create: `skills/zuhui-beammer/references/adc-style.md`
- Create: `skills/zuhui-beammer/assets/config.yaml`

**Interfaces:**
- Consumes: The parent `pyrojewel-beamer-academic` skill and `beamerthemeZuhuiBeammer.sty`.
- Produces: A discoverable skill with exact and alias triggers, ADC-specific page contracts, examples, anti-patterns, and QA gates.

- [ ] **Step 1: Write frontmatter and discovery content**

  Use the exact name `zuhui-beammer`, a `Use when...` description, and triggers for `zuhui-beammer`, `zuhui-beamer`, `ADC Calibration PPT`, `ADC标定PPT`, and `电路组会PPT`.

- [ ] **Step 2: State inheritance before specialization**

  Require the parent skill for the two-stage workflow, evidence contract, coverage matrix for literature notes, page-type diversity, and content/theory/visual QA. State that the local skill overrides visual language only.

- [ ] **Step 3: Add ADC page contracts**

  Document page patterns for literature principle, charge-redistribution equation, behavioral-model code, raw-vs-calibrated result, LMS/perturbation flow, and parameter/result summary. Each pattern must specify takeaway, evidence, source location, interpretation, and boundary.

- [ ] **Step 4: Add style rules and anti-patterns**

  Require white/red technical layout, source labels, semantic curve legends, and plot/circuit/code readability. Explicitly reject inherited navy/gold banners, decorative rounded cards, unsupported numeric claims, unlabeled curves, and screenshots used as the only evidence.

- [ ] **Step 5: Add the executable handoff**

  Document the independent theme load, required `\graphicspath`, the minimal example, and PDF QA commands.

### Task 4: Register provenance and verify

**Files:**
- Modify: `references/skill-source-map.md`
- Modify: `docs/superpowers/README.md`
- Create: `skills/zuhui-beammer/examples/verification.sh`

**Interfaces:**
- Consumes: All files from Tasks 1–3.
- Produces: Provenance entry, indexed active plan/spec, and a repeatable static validation command.

- [ ] **Step 1: Register the local derivative**

  Add `zuhui-beammer` to the local/adapted skills section with source `pyrojewel-beamer-academic` plus `ADC_Calibration.pdf`, and state that no external mirror is implied.

- [ ] **Step 2: Index the plan and spec**

  Add both filenames to the active plan/spec tables in `docs/superpowers/README.md`.

- [ ] **Step 3: Implement static verification**

  Make `verification.sh` fail for missing frontmatter, absent trigger names, missing inherited-contract keywords, missing style tokens, stale example paths, or undefined example commands.

- [ ] **Step 4: Run all checks**

  Run `bash skills/zuhui-beammer/examples/verification.sh`, `bash tools/verify-superpowers-index.sh`, and `git diff --check`.
  Expected: all checks pass; existing unrelated worktree changes remain untouched.

- [ ] **Step 5: Update completion status**

  Change the plan/spec status to `completed`, add `completed-date: 2026-08-15`, and update the index status after verification succeeds.
