---
title: Skill Map Completion
date: 2026-06-02
status: completed
completed-date: 2026-06-05
---

# Skill Map Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `references/skill-map.md` from a repository list into a complete repo-to-flow map covering all remaining projects in `<source-repos-root>/`.

**Architecture:** Keep `references/skill-map.md` as the cross-repository index. It should point to `references/flow-map.md` for flow details and to extraction notes for migration status, while adding per-repo ownership, flow membership, sync policy, and next action.

**Tech Stack:** Markdown, shell, `find`, `rg`, Git remote inspection

---

## File Structure

- Modify: `references/skill-map.md` — complete repository-to-flow matrix and next-action backlog.
- Modify: `CLAUDE.md` — one-line pointer to the completed map if needed.
- Modify: `.claude/SESSION_CONTEXT.md` — remaining project map status.
- Read-only source root: `<source-repos-root>/`

---

### Task 1: Audit All Repositories and Remotes

**Files:**
- Modify: `references/skill-map.md`

- [ ] **Step 1: Generate repository list**

Run:

```bash
find <source-repos-root> -maxdepth 2 -type d -name .git -printf '%h\n' | sort
```

Expected: repository list includes `pyrojewel_claude_code` and all sibling repos. Current audit count is 22 Git repositories; the older map says 23 and is missing `guizang-ppt-skill` while listing absent `llm_test`.

- [ ] **Step 2: Generate remote list**

Run:

```bash
for repo in $(find <source-repos-root> -maxdepth 2 -type d -name .git -printf '%h\n' | sort); do
  printf '\n## %s\n' "$(basename "$repo")"
  git -C "$repo" remote -v
done
```

Expected: remotes are printed where configured. Repos without remotes should be marked `local/reference`.

- [ ] **Step 3: Generate skill/document entry list**

Run:

```bash
for repo in $(find <source-repos-root> -maxdepth 2 -type d -name .git -printf '%h\n' | sort); do
  printf '\n## %s\n' "$(basename "$repo")"
  find "$repo" -maxdepth 4 -type f \( -name 'SKILL.md' -o -name 'skill.md' -o -name 'README.md' \) | sed "s#^$repo/##" | sort | head -80
done
```

Expected: each repo has at least README or skill entries. If more than 80 entries exist, record that detailed inventory should use a separate extraction note.

- [ ] **Step 4: Add repository coverage audit section**

Append to `references/skill-map.md`:

```markdown
## 2026-06-02 Repository Coverage Audit

| Repository | Present locally | Remote status | Entry files found | Flow membership | Next action |
|------------|-----------------|---------------|-------------------|-----------------|-------------|
| `ECC/` | yes | origin `git@github.com:Pyrojewel-zard/ECC.git` | hooks/skills/rules/agents | session lifecycle, coding support | keep read-only; audit diffs periodically |
| `virtuoso/` | yes | origin Pyrojewel fork, upstream Arcadia-1 | README/source tree | reference patterns | inspect for hook ideas only |
| `everything-claude-code/` | yes | Git remote blocked by safe-directory check | README/source tree | ECC fork comparison | diff against `ECC/` only when needed |
| `oh-my-codex/` | yes | Git remote blocked by safe-directory check | README/source tree | Codex configuration | extract Codex-specific patterns selectively |
| `claude-code-best-practice/` | yes | Git remote blocked by safe-directory check | README/source tree | best practices | keep as read-only reference |
| `Auto-claude-code-research-in-sleep/` | yes | origin Pyrojewel fork, upstream wanshuiyin | at least 40 `skills/*/SKILL.md` entries | Flow 5, 8, experiment bridge | inventory dependencies before migration |
| `academic-skills/` | yes | Git remote blocked by safe-directory check | 8 top-level `*/SKILL.md` entries | Flow 2, 4, 6, 7 | migrate self-contained skills first |
| `nature-skills/` | yes | Git remote blocked by safe-directory check | 9 `skills/*/SKILL.md` entries | Flow 5, 11 | map overlap with paper-writing skills |
| `cnki-skills/` | yes | Git remote blocked by safe-directory check | 10 `skills/*/SKILL.md` entries | Flow 9 | verify browser/login assumptions |
| `ieee_skills/` | yes | Git remote blocked by safe-directory check | 15 `skills/*/SKILL.md` entries | Flow 9 | verify browser/login assumptions |
| `ljg-skills/` | yes | origin Pyrojewel fork, upstream lijigang | many `skills/*` entries | Flow 1, 5, auxiliary thinking | migrate selected skills with path cleanup |
| `beamer-academic/` | yes | origin Pyrojewel fork, upstream Faust-Donf | `SKILL.md` | Flow 1, 11 | compare with `pyrojewel-academic-ppt` |
| `guizang-ppt-skill/` | yes | origin `git@github.com:op7418/guizang-ppt-skill.git` | `SKILL.md` | Flow 11 | add to main relationship table |
| `andrej-karpathy-skills/` | yes | Git remote blocked by safe-directory check | README/source tree | coding support | keep as philosophy/reference |
| `claude-obsidian/` | yes | Git remote blocked by safe-directory check | 11 `skills/*/SKILL.md` entries | Flow 10 | standardize vault write path |
| `llm-wiki-skill/` | yes | Git remote blocked by safe-directory check | root `SKILL.md` plus two dependency skills | Flow 10 | map wiki lifecycle skills |
| `spec-kit/` | yes | Git remote blocked by safe-directory check | README/source tree | spec-driven planning | keep reference; no migration yet |
| `graphify/` | yes | Git remote blocked by safe-directory check | README/source tree | knowledge graph visualization | reference only |
| `graphiti/` | yes | Git remote blocked by safe-directory check | README/source tree | temporal graph memory | reference only |
| `zotero-cli-cc/` | yes | Git remote blocked by safe-directory check | `skill/zotero-cli-cc/SKILL.md` | Flow 1, 9 | reconcile with Zotero MCP skills |
| `skill_manager/` | yes | origin `git@github.com:Pyrojewel-zard/claude-skills-personal.git` | personal `skills/*` entries | Flow 1, 9, coding support | migrate selected personal skills |
| `llm_test/` | no | not present in current Git repo audit | none | testing support | remove from main map or mark absent |
| `llm_wiki/` | yes | Git remote blocked by safe-directory check | README/data tree | Flow 10 data/reference | read-only data/reference |
| `pyrojewel_claude_code/` | yes | no remote printed in current audit | this repo | all flows | central adapted config hub |
```

- [ ] **Step 5: Commit coverage audit**

Run:

```bash
git add references/skill-map.md
git commit -m "docs: audit repository coverage for skill map"
```

Expected: commit succeeds unless unrelated staged files exist.

---

### Task 2: Replace Relationship Table with Complete Flow-Aware Map

**Files:**
- Modify: `references/skill-map.md`

- [ ] **Step 1: Update repository count**

At the top, update the count based on the audit command:

```markdown
`<source-repos-root>/` contains 22 Git repositories as of 2026-06-02.
```

Use the exact count from:

```bash
find <source-repos-root> -maxdepth 2 -type d -name .git | wc -l
```

- [ ] **Step 2: Add missing `guizang-ppt-skill/` row if absent**

Add this row to the main relationship table:

```markdown
| `guizang-ppt-skill/` | Active | Skill source | HTML PPT generation; belongs to Flow 11 |
```

- [ ] **Step 3: Add `Flow Ownership Matrix` section**

Insert after `Relationship to This Repo`:

```markdown
## Flow Ownership Matrix

| Flow | Primary repos | Supporting repos | Status | Next action |
|------|---------------|------------------|--------|-------------|
| Flow 1 调研→阅读→汇报→判断 | `pyrojewel_claude_code`, `ljg-skills`, `beamer-academic`, `zotero-cli-cc` | `ieee_skills`, `cnki-skills` | mostly self-contained | normalize Zotero/MarkerPDF paths and test PPT path |
| Flow 2 文献检索+综述 | `Auto-claude-code-research-in-sleep`, `academic-skills` | `zotero-cli-cc` | self-contained for arXiv/S2 path | migrate or document arxiv, semantic-scholar, survey skills |
| Flow 3 DSE参数探索 | `Auto-claude-code-research-in-sleep` | `andrej-karpathy-skills` | self-contained | verify local skill availability |
| Flow 4 实验→分析 | `Auto-claude-code-research-in-sleep`, `academic-skills` | `skill_manager` | self-contained | map analyze/formula/log skills to installed names |
| Flow 5 论文写作 | `Auto-claude-code-research-in-sleep`, `nature-skills`, `ljg-skills` | `beamer-academic` | partially blocked | separate Codex-MCP-dependent skills from runnable skills |
| Flow 6 周报+组会 | `academic-skills` | `claude-obsidian` | self-contained | migrate weekly update skill if useful |
| Flow 7 审稿回复 | `academic-skills`, `Auto-claude-code-research-in-sleep` | `nature-skills` | lightweight path runnable; ARIS path blocked | document which rebuttal skill is default |
| Flow 8 Idea发现 | `Auto-claude-code-research-in-sleep` | `llm-wiki-skill`, `graphiti` | blocked | list Codex MCP and helper-script requirements |
| Flow 9 数据库检索与全文抽取 | `cnki-skills`, `ieee_skills`, `zotero-cli-cc`, `skill_manager` | `claude-obsidian` | semi-self-contained | verify login/browser and MarkerPDF assumptions |
| Flow 10 知识库沉淀 | `claude-obsidian`, `llm-wiki-skill`, `llm_wiki` | `graphify`, `graphiti` | semi-self-contained | standardize filesystem-first vault writes |
| Flow 11 学术PPT与可视化汇报 | `beamer-academic`, `guizang-ppt-skill`, `pyrojewel_claude_code` | `nature-skills` | needs verification | test xelatex/HTML rendering paths |
| Cross-flow coding support | `ECC`, `andrej-karpathy-skills`, `claude-code-best-practice`, `oh-my-codex`, `spec-kit` | `llm_test`, `virtuoso`, `everything-claude-code` | reference | extract only concrete rules/hooks when needed |
```

- [ ] **Step 4: Add `Remaining Project Backlog` section**

Append:

```markdown
## Remaining Project Backlog

| Priority | Project group | Work item | Output file |
|----------|---------------|-----------|-------------|
| P0 | ECC-derived runtime | Finish `ecc-context-monitor` calibration and hook fixtures | `references/hooks-extraction.md` |
| P0 | Flow map | Keep `references/flow-map.md` aligned with Flow 9-11 additions | `references/flow-map.md` |
| P1 | Zotero/database | Normalize Zotero storage and MarkerPDF paths | `references/skills-extraction.md` |
| P1 | PPT | Test `pyrojewel-academic-ppt` and compare with `beamer-academic` / `guizang-ppt-skill` | `.claude/skills/pyrojewel-academic-ppt/` docs |
| P2 | ARIS | Separate runnable skills from Codex-MCP-blocked skills | `references/flow-map.md` |
| P2 | Wiki/Obsidian | Decide filesystem-first sync contract | `references/flow-map.md` |
| P3 | Reference repos | Keep `virtuoso`, `graphify`, `graphiti`, `spec-kit`, `llm_test` read-only until a concrete need appears | `references/skill-map.md` |
```

- [ ] **Step 5: Verify map consistency**

Run:

```bash
rg 'guizang|Flow 11|Flow 10|Flow 9|Remaining Project Backlog|Flow Ownership Matrix' references/skill-map.md
```

Expected: all new sections and missing repo coverage are present.

- [ ] **Step 6: Commit completed map**

Run:

```bash
git add references/skill-map.md
git commit -m "docs: complete repo-to-flow skill map"
```

Expected: commit succeeds unless unrelated staged files exist.

---

### Task 3: Update CLAUDE and Session Pointers

**Files:**
- Modify: `CLAUDE.md`
- Modify: `.claude/SESSION_CONTEXT.md`

- [ ] **Step 1: Update `CLAUDE.md` external map pointer**

Replace the final sentence with:

```markdown
See `references/skill-map.md` for the complete repo-to-flow map of all Git repositories in `<source-repos-root>/`, including active flows, blocked dependencies, and remaining backlog.
```

- [ ] **Step 2: Update session active thread**

Add under `.claude/SESSION_CONTEXT.md` `Active Threads`:

```markdown
- [ ] Keep `references/skill-map.md` synchronized with `references/flow-map.md` whenever a new skill source repo is added or a flow changes status.
```

- [ ] **Step 3: Verify links**

Run:

```bash
rg 'references/skill-map.md|references/flow-map.md' CLAUDE.md .claude/SESSION_CONTEXT.md references/skill-map.md
```

Expected: both files point to the map and no stale "23 repositories" count remains if the audit found a different number.

- [ ] **Step 4: Commit pointers**

Run:

```bash
git add CLAUDE.md .claude/SESSION_CONTEXT.md
git commit -m "docs: point project state to completed skill map"
```

Expected: commit succeeds unless unrelated staged files exist.

---

## Self-Review

- Confirm every local Git repo appears in `references/skill-map.md`.
- Confirm every flow in `references/flow-map.md` appears in the Flow Ownership Matrix.
- Confirm `guizang-ppt-skill` is no longer missing from the top-level repository map.
- Confirm no source repo files outside this repo were modified.
