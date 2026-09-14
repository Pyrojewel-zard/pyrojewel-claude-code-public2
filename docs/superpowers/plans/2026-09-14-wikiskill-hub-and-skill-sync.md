---
title: WikiSkill Hub and Skill Sync
date: 2026-09-14
status: completed
completed-date: 2026-09-14
---

# WikiSkill Hub and Skill Sync Implementation Plan

> **For agentic workers:** Execute this plan inline in the current session. Preserve unrelated worktree changes and use the verification gates below before committing.

**Goal:** Create a project-routed WikiSkill knowledge hub for `nfsc-eda`, update the repository's existing DOCX fidelity and WikiSkill evolution skills with the successful reusable flow, push the intentional repository changes, and synchronize the updated skills into cc-switch's managed skill storage.

**Architecture:** Keep the public skill repository portable and free of machine-specific paths. Store the local routing map and project workspace under the configured `WIKISKILL_HUB_ROOT`; resolve a project explicitly or through the map, keep raw traces immutable, and prefer project-local patterns before shared patterns. Keep `md-to-word-fidelity` as the single DOCX skill and extend `wikiskill-evolve` with the Hub/map routing contract.

**Tech Stack:** Markdown `SKILL.md` files, YAML metadata/configuration, existing shell/Python validators, Git, and the cc-switch managed skill directory.

**Spec:** User-approved architecture from the 2026-09-14 conversation: one central Hub, one global map, per-project workspaces, shared patterns/skills, project-specific naming, and map-based discovery during later evolution.

## Global Constraints

- Preserve the pre-existing deletion and untracked files in the target repository; stage only files changed by this plan.
- Do not hardcode a machine path into portable skills; use `WIKISKILL_HUB_ROOT` and `WIKISKILL_PROJECT_ID` in the skill contract. The local Hub map may contain the actual local project root.
- Do not fabricate benchmark tasks, graders, scores, or traces. Mark the `nfsc-eda` benchmark as not configured until real evaluation artifacts exist.
- Keep raw transcripts/traces immutable and prevent cross-project knowledge leakage.
- Remove the long failed-attempt/code narrative from the DOCX skill; retain only the successful path and concise risk/stop-gate notes.
- Back up installed cc-switch skills before replacing them. Do not modify the separate dirty upstream `~/.cc-switch/wikiskill` clone.

## Tasks

### 1. Create the local WikiSkill Hub skeleton

**Files:** `${WIKISKILL_HUB_ROOT}/README.md`, `map.yaml`, `.gitignore`, `shared/`, `projects/nfsc-eda/`, `inbox/`

- Create the central catalog, shared layers, project workspace, and inbox.
- Register `nfsc-eda` with its explicit repository root, aliases, tags, inheritance, and privacy scope.
- Add project-local wiki, trace, run, candidate/accepted/rejected skill paths.
- Explain that benchmark files are intentionally absent until configured with real tasks and graders.

### 2. Condense the DOCX skill to the verified successful path

**File:** `skills/md-to-word-fidelity/SKILL.md`

- Preserve the existing trigger and the core Markdown-to-existing-template contract.
- Keep block parsing, template cloning, explicit mapping/image policy, and structural/text/render verification.
- Remove the large reusable code listing and the detailed failed-branch table.
- Retain concise stop gates and risk notes so the skill does not encourage regex replacement or delivery based only on “Word opens.”
- Reuse the existing `test-prompts.json` scenarios as the regression/pressure-test set.

### 3. Add project-map routing to WikiSkill evolution

**Files:** `skills/wikiskill-evolve/SKILL.md`, `skills/wikiskill-evolve/agents/openai.yaml`, `references/skill-source-map.md`

- Document the Hub layout, environment variables, deterministic project-resolution order, and project-first/shared-second lookup.
- Define promotion rules: project acceptance requires the existing `R_val > R_best` gate; shared promotion requires evidence across projects.
- Keep summary-only transcript handling separate from benchmark evolution and preserve raw evidence immutability.
- Update the source map with the local adaptation note and date.

### 4. Validate and review before commit

**Files:** all plan/skill/source-map changes above

- Run `skill-creator` quick validation for both skills.
- Validate the Hub YAML and project metadata, the existing DOCX test prompts, superpowers index, `git diff --check`, and targeted static assertions for required routing and fidelity terms.
- Review the diff and confirm unrelated worktree changes are neither staged nor modified.

### 5. Commit and push the target repository

- Stage only the plan/index, two skill updates, metadata, and source-map note.
- Commit with a focused message describing project-routed WikiSkill and the DOCX fidelity flow.
- Push `master` to `origin` and verify the pushed commit and working-tree scope.

### 6. Synchronize cc-switch managed skills safely

- Create timestamped backups of the installed `md-to-word-fidelity` and `wikiskill-evolve` directories.
- Copy the repository's updated `SKILL.md` and metadata into the configured cc-switch managed skill directory.
- Verify SHA-256 equality between repository and installed files. Avoid altering cc-switch settings or the separate upstream clone.

## Completion Criteria

- The local Hub contains a readable map and `nfsc-eda` workspace without invented benchmark artifacts.
- Both updated skills pass validators and targeted checks.
- Only intended repository files are in the new commit; the commit is pushed to `origin/master`.
- cc-switch installed copies match the pushed skill files and previous copies are recoverable from timestamped backups.
