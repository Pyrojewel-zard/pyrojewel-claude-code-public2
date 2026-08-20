---
title: ECC Adaptation Inventory
date: 2026-06-02
status: completed
completed-date: 2026-06-05
---

# ECC Adaptation Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a precise inventory of ECC-derived hooks, rules, agents, and copied skills, and reconcile the remaining adaptation backlog.

**Architecture:** Treat ECC as the primary source of truth and this repo as the adapted target. The work is documentation-first: compare source and target files, update extraction references, then update the top-level project state without changing hook implementations.

**Tech Stack:** Markdown, Git, shell, `rg`, `diff`, Node.js syntax checks where relevant

---

## File Structure

- Modify: `references/hooks-extraction.md` — authoritative ECC hook extraction/adaptation status.
- Modify: `references/agents-extraction.md` — ECC agent inventory and relevance status.
- Modify: `references/rules-extraction.md` — ECC rule inventory and target mapping.
- Modify: `CLAUDE.md` — short summary tables and priority backlog only.
- Modify: `.claude/SESSION_CONTEXT.md` — current session state and active threads.
- Do not modify: `hooks/*.js`, `.claude/hooks/*.js`, `skills/*`, or output artifacts.

---

### Task 1: Establish Current ECC Source/Target Inventory

**Files:**
- Modify: `references/hooks-extraction.md`
- Modify: `references/agents-extraction.md`
- Modify: `references/rules-extraction.md`

- [ ] **Step 1: List copied target files**

Run:

```bash
find hooks -maxdepth 2 -type f | sort
find rules -maxdepth 2 -type f | sort
find agents -maxdepth 1 -type f 2>/dev/null | sort
```

Expected: hook and rule files are listed. If `agents/` is missing, record that `CLAUDE.md` lists active agents but no target `agents/` directory exists.

- [ ] **Step 2: List ECC source files**

Run:

```bash
find <source-repos-root>/ECC -maxdepth 3 -type f | rg '/(scripts/hooks|hooks|agents|rules)/'
```

Expected: ECC source hook, agent, and rule files are listed. If ECC uses a different directory shape, record the discovered source paths in the relevant reference file.

- [ ] **Step 3: Add an audit section to `references/hooks-extraction.md`**

Append this section and fill the status values from the command output:

```markdown
## 2026-06-02 ECC Hook Audit

| Target | Source checked | Runtime copy present | Adaptation status | Next action |
|--------|----------------|----------------------|-------------------|-------------|
| `hooks/session-start.js` | yes | `.claude/hooks/session-start.js` | adapted | verify by running SessionStart fixture |
| `hooks/session-end.js` | yes | `.claude/hooks/session-end.js` | adapted | verify Obsidian env fallback |
| `hooks/gateguard-fact-force.js` | yes | `.claude/hooks/gateguard-fact-force.js` | adapted | add fixture for Python import warning |
| `hooks/config-protection.js` | yes | `.claude/hooks/config-protection.js` | adapted | add fixture for protected Python config paths |
| `hooks/post-edit-accumulator.js` | yes | `.claude/hooks/post-edit-accumulator.js` | adapted | verify `.py` accumulation only |
| `hooks/stop-format-typecheck.js` | yes | `.claude/hooks/stop-format-typecheck.js` | adapted | verify ruff resolution with and without `.venv` |
| `hooks/ecc-context-monitor.js` | yes | `.claude/hooks/ecc-context-monitor.js` | pending | calibrate thresholds for current API pricing |
| `hooks/cost-tracker.js` | yes | `.claude/hooks/cost-tracker.js` | copied | verify cost log path |
| `hooks/desktop-notify.js` | yes | `.claude/hooks/desktop-notify.js` | copied | verify Linux notification command |
| `hooks/pre-compact.js` | yes | `.claude/hooks/pre-compact.js` | copied | verify context preservation output |
| `hooks/evaluate-session.js` | yes | `.claude/hooks/evaluate-session.js` | copied | verify report path |
```

- [ ] **Step 4: Add an audit section to `references/agents-extraction.md`**

Append:

```markdown
## 2026-06-02 Agent Audit

Current mismatch: `CLAUDE.md` lists ECC agents as active, but this repo should verify whether target agent files exist under `agents/` or another runtime location.

| Agent | ECC source | Target present | Decision |
|-------|------------|----------------|----------|
| `planner` | `ECC/agents/planner.md` | no `agents/` target found in current repo audit | listed in `CLAUDE.md` but not installed in a visible target directory |
| `mle-reviewer` | `ECC/agents/mle-reviewer.md` | no `agents/` target found in current repo audit | listed in `CLAUDE.md` but not installed in a visible target directory |
| `pytorch-build-resolver` | `ECC/agents/pytorch-build-resolver.md` | no `agents/` target found in current repo audit | listed in `CLAUDE.md` but not installed in a visible target directory |
| `code-explorer` | `ECC/agents/code-explorer.md` | no `agents/` target found in current repo audit | listed in `CLAUDE.md` but not installed in a visible target directory |
| `python-reviewer` | `ECC/agents/python-reviewer.md` | no `agents/` target found in current repo audit | listed in `CLAUDE.md` but not installed in a visible target directory |
```

- [ ] **Step 5: Add an audit section to `references/rules-extraction.md`**

Append:

```markdown
## 2026-06-02 Rule Audit

| Rule group | Target files | Source checked | Status | Next action |
|------------|--------------|----------------|--------|-------------|
| Python | `rules/python/*.md` | yes | copied | verify no TypeScript-only assumptions remain |
| Common | `rules/common/*.md` | yes | copied | verify model/performance guidance matches Codex setup |
| Chinese | `rules/zh/*.md` | yes | copied | verify wording fits current workflow |
```

- [ ] **Step 6: Commit the reference audit**

Run:

```bash
git add references/hooks-extraction.md references/agents-extraction.md references/rules-extraction.md
git commit -m "docs: audit ECC adaptation inventory"
```

Expected: commit succeeds. If the worktree has unrelated staged files, do not commit; report the exact staged files and leave the changes unstaged.

---

### Task 2: Reconcile CLAUDE.md ECC Backlog

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the Active Hooks table**

In `CLAUDE.md`, make the hook statuses match the audit:

```markdown
| `gateguard-fact-force.js` | PreToolUse | ECC | Adapted; needs fixture coverage |
| `config-protection.js` | PreToolUse | ECC | Adapted; needs fixture coverage |
| `stop-format-typecheck.js` | Stop | ECC | Adapted to ruff; needs fixture coverage |
| `session-end.js` | Stop | ECC | Adapted with Obsidian env sync; needs fixture coverage |
| `ecc-context-monitor.js` | PostToolUse | ECC | Pending threshold calibration |
```

- [ ] **Step 2: Update the Adaptation Backlog**

Replace the priority order with:

```markdown
Priority order:
1. `ecc-context-monitor.js` — Calibrate token/cost thresholds for current API usage.
2. Hook fixture coverage — `gateguard-fact-force.js`, `config-protection.js`, `stop-format-typecheck.js`, `session-start.js`, `session-end.js`.
3. Agent installation audit — confirm whether ECC agents exist in the runtime target directory.
4. Self-built skills: `reproduce-plan`, `dev-cycle`.
5. Skill pruning: `mle-workflow`, `continuous-learning-v2`.
6. Flow/repo map completion in `references/skill-map.md`.
```

- [ ] **Step 3: Verify no stale backlog language contradicts the audit**

Run:

```bash
rg 'needs adaptation|replace Biome|add Obsidian|Python import check|Python config' CLAUDE.md references/hooks-extraction.md
```

Expected: any remaining match is either intentionally pending or described as completed with fixture coverage still needed.

- [ ] **Step 4: Commit CLAUDE.md update**

Run:

```bash
git add CLAUDE.md
git commit -m "docs: reconcile ECC adaptation backlog"
```

Expected: commit succeeds unless unrelated staged files exist.

---

### Task 3: Update Session Context for ECC Thread

**Files:**
- Modify: `.claude/SESSION_CONTEXT.md`

- [ ] **Step 1: Update Current State**

Set `Last Updated` to the current ISO timestamp and replace `Current State` with:

```markdown
## Current State

- ECC adaptation inventory is being reconciled against `CLAUDE.md`, `references/hooks-extraction.md`, `references/agents-extraction.md`, and `references/rules-extraction.md`.
- Most hook adaptation work is already documented as complete; remaining work is threshold calibration plus fixture coverage.
```

- [ ] **Step 2: Update Active Threads**

Ensure these bullets exist:

```markdown
- [ ] Calibrate `hooks/ecc-context-monitor.js` thresholds for current API pricing and usage.
- [ ] Add hook fixture coverage for Python import guard, config protection, ruff formatting, session start, and session end.
- [ ] Verify ECC agent files are actually installed in the runtime target path, not only listed in `CLAUDE.md`.
```

- [ ] **Step 3: Verify session context is still readable**

Run:

```bash
sed -n '1,220p' .claude/SESSION_CONTEXT.md
```

Expected: file has one `Current State`, one `Active Threads`, one `Key Decisions`, one `Pitfalls & Gotchas`, and one `Learnings` section.

- [ ] **Step 4: Commit session context update**

Run:

```bash
git add .claude/SESSION_CONTEXT.md
git commit -m "docs: update ECC session context"
```

Expected: commit succeeds unless unrelated staged files exist.

---

## Self-Review

- Confirm the plan did not require implementation edits to hooks.
- Confirm all new audit rows are grounded in local command output.
- Confirm no unrelated dirty files are staged or committed.
