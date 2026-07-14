---
title: Active Flow Inventory
date: 2026-06-02
status: completed
completed-date: 2026-06-05
---

# Active Flow Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the active project flow inventory for research, paper, Zotero, Obsidian/wiki, PPT, and database-search skills.

**Architecture:** Use `references/flow-map.md` as the flow-level source of truth and enrich it from the active source repositories listed in `references/skill-map.md`. This plan does not migrate skills; it documents complete flow coverage, dependencies, blockers, and runnable entry points.

**Tech Stack:** Markdown, shell, `rg`, Git repository inspection

---

## File Structure

- Modify: `references/flow-map.md` — complete active flow definitions and dependency matrix.
- Modify: `references/skills-extraction.md` — active source skill inventory and migration status.
- Modify: `.claude/SESSION_CONTEXT.md` — active flow inventory thread state.
- Read-only sources:
  - `<source-repos-root>/Auto-claude-code-research-in-sleep/`
  - `<source-repos-root>/academic-skills/`
  - `<source-repos-root>/nature-skills/`
  - `<source-repos-root>/cnki-skills/`
  - `<source-repos-root>/ieee_skills/`
  - `<source-repos-root>/zotero-cli-cc/`
  - `<source-repos-root>/claude-obsidian/`
  - `<source-repos-root>/llm-wiki-skill/`
  - `<source-repos-root>/beamer-academic/`
  - `<source-repos-root>/guizang-ppt-skill/`

---

### Task 1: Inventory Active Skills by Source Repository

**Files:**
- Modify: `references/skills-extraction.md`

- [ ] **Step 1: List skill entry files in active repos**

Run:

```bash
for repo in Auto-claude-code-research-in-sleep academic-skills nature-skills cnki-skills ieee_skills zotero-cli-cc claude-obsidian llm-wiki-skill beamer-academic guizang-ppt-skill; do
  printf '\n## %s\n' "$repo"
  find "<source-repos-root>/$repo" -maxdepth 4 -type f \( -name 'SKILL.md' -o -name 'skill.md' \) | sort
done
```

Expected: entry files are listed for available skill repos. If a repo has no `SKILL.md` or `skill.md`, record its alternate documentation entry point.

- [ ] **Step 2: Extract frontmatter names and descriptions**

Run:

```bash
for f in $(find <source-repos-root>/{Auto-claude-code-research-in-sleep,academic-skills,nature-skills,cnki-skills,ieee_skills,zotero-cli-cc,claude-obsidian,llm-wiki-skill,beamer-academic,guizang-ppt-skill} -maxdepth 4 -type f \( -name 'SKILL.md' -o -name 'skill.md' \) 2>/dev/null | sort); do
  printf '\n### %s\n' "$f"
  sed -n '1,40p' "$f" | rg '^(name|description):|^# '
done
```

Expected: each skill’s name and purpose are visible.

- [ ] **Step 3: Add `2026-06-02 Active Source Audit` to `references/skills-extraction.md`**

Append a table in this shape, filling rows from command output:

```markdown
## 2026-06-02 Active Source Audit

| Repository | Skills found | Primary flows | Dependency class | Migration state |
|------------|--------------|---------------|------------------|-----------------|
| `Auto-claude-code-research-in-sleep` | at least 40 `skills/*/SKILL.md` entries in the first audit page, including `analyze-results`, `arxiv`, `auto-review-loop`, `dse-loop`, `experiment-plan`, `idea-discovery`, `novelty-check` | idea discovery, paper writing, experiment bridge | Codex MCP + helper scripts for many flows | inventory dependencies before migration |
| `academic-skills` | 8 top-level skills: `benchmark-extractor`, `experiment-log-summarizer`, `paper-deep-note`, `paper-feishu-digest`, `research-gap-finder`, `review-rebuttal`, `survey-writer`, `weekly-lab-update` | survey, weekly update, rebuttal, academic writing | mostly self-contained | migrate self-contained skills first |
| `nature-skills` | 9 skills: `nature-academic-search`, `nature-citation`, `nature-data`, `nature-figure`, `nature-paper2ppt`, `nature-polishing`, `nature-reader`, `nature-response`, `nature-writing` | Nature paper writing, slides, figures | LaTeX + image/figure tooling | map overlap with ARIS paper-writing flow |
| `cnki-skills` | 10 CNKI skills including search, advanced search, paper detail, export, download, journal browse | CNKI search and extraction | browser automation / site access | verify browser/login assumptions |
| `ieee_skills` | 15 IEEE skills including search, advanced search, get full text, paper markdown, export, download, research | IEEE search and extraction | browser automation / site access | verify browser/login assumptions |
| `zotero-cli-cc` | `skill/zotero-cli-cc/SKILL.md` | Zotero management and parsing | Zotero CLI/MCP | reconcile with Zotero MCP skills |
| `claude-obsidian` | 11 skills including `obsidian-markdown`, `save`, `wiki-ingest`, `wiki-lint`, `wiki-query`, `wiki` | Obsidian session/wiki sync | vault path + API/filesystem | standardize filesystem-first vault writes |
| `llm-wiki-skill` | root `SKILL.md` plus deps `baoyu-url-to-markdown` and `youtube-transcript` | wiki capture/compile/query | Obsidian/wiki storage | map wiki lifecycle stages |
| `beamer-academic` | root `SKILL.md` | academic PPT | xelatex | partially adapted as `pyrojewel-academic-ppt` |
| `guizang-ppt-skill` | root `SKILL.md` | HTML PPT | browser/static assets | add to flow and skill maps |
```

- [ ] **Step 4: Commit active source audit**

Run:

```bash
git add references/skills-extraction.md
git commit -m "docs: audit active skill source repos"
```

Expected: commit succeeds unless unrelated staged files exist.

---

### Task 2: Complete Active Flow Coverage in Flow Map

**Files:**
- Modify: `references/flow-map.md`

- [ ] **Step 1: Check current flow numbering**

Run:

```bash
rg '^## Flow|^## 依赖矩阵|^## Skill → Flow' references/flow-map.md
```

Expected: existing flows 1 through 8 are visible, with dependency and skill-to-flow sections.

- [ ] **Step 2: Add missing active flow sections before `## 依赖矩阵`**

Insert these concrete sections before the dependency matrix:

```markdown
## Flow 9：数据库检索与全文抽取流 ⚠️

**场景**：CNKI/IEEE/Zotero 联合检索，补齐正式出版物全文和PDF解析。

```
输入：关键词 / DOI / Zotero item key
  │
  ├─→ cnki-research ─────────── 知网搜索、详情提取、PDF/CAJ下载
  │     依赖：Chrome DevTools MCP 或浏览器自动化；站点登录状态
  │     输出：检索结果、论文详情、下载文件
  │
  ├─→ ieee-research ─────────── IEEE Xplore检索、详情提取、全文/PDF获取
  │     依赖：Chrome DevTools MCP；机构访问或可访问PDF
  │     输出：检索结果、论文详情、PDF/全文
  │
  ├─→ zotero-manager ────────── Zotero库浏览、分类、标签、字段更新
  │     依赖：Zotero MCP / Zotero CLI
  │     输出：整理后的文献库条目和集合
  │
  └─→ zotero-pdf-parse ──────── PDF转Markdown
        依赖：MarkerPDF脚本和Zotero attachment key
        输出：content.md和图片资产
```

**自洽条件**：Zotero MCP 已配置；CNKI/IEEE 依赖浏览器会话和站点可访问性。
**阻塞点**：登录态、下载权限、MarkerPDF硬编码路径。

## Flow 10：知识库沉淀流 ⚠️

**场景**：把session、论文、实验和想法沉淀到Obsidian/wiki，支持后续查询和复用。

```
输入：session日志 / paper notes / experiment reports / raw inbox
  │
  ├─→ claude-obsidian ───────── Obsidian vault读写与同步
  │     依赖：Vault路径 `<configure-local-obsidian-vault>/` 或Obsidian API
  │     输出：vault内markdown文件
  │
  ├─→ llm-wiki-skill ────────── capture → compile → crystallize → query
  │     依赖：wiki目录规范；部分流程可纯文件运行
  │     输出：source packets、compiled notes、query answers
  │
  └─→ session lifecycle hooks ─ SESSION_CONTEXT.md → Obsidian inbox
        依赖：`PJ_OBSIDIAN_VAULT`或默认vault路径
        输出：session log和learning条目
```

**自洽条件**：filesystem写入可用。
**阻塞点**：Obsidian同步策略需要统一为文件写入优先，MCP只作交互补充。

## Flow 11：学术PPT与可视化汇报流 ⚠️

**场景**：把论文、调研报告或组会材料生成Beamer或HTML PPT。

```
输入：paper/report markdown + images
  │
  ├─→ pyrojewel-academic-ppt ── 论文/调研材料 → Beamer
  │     依赖：xelatex；本repo `.claude/skills/pyrojewel-academic-ppt`
  │     输出：presentation.tex + presentation.pdf + assets
  │
  ├─→ beamer-academic ───────── 上游Beamer参考skill
  │     依赖：xelatex；layout registry
  │     输出：defense.tex + defense.pdf
  │
  └─→ guizang-ppt-skill ─────── 横向翻页HTML PPT
        依赖：浏览器；静态HTML/JS/CSS
        输出：single HTML deck
```

**自洽条件**：Beamer路径需要xelatex；HTML路径需要浏览器验证。
**当前状态**：`pyrojewel-academic-ppt` 已在 `.claude/skills/` 新增，但仍需测试和文档完善。
```

- [ ] **Step 3: Update Flow Overview table**

Add rows:

```markdown
| 9 | 数据库检索与全文抽取 | ⚠️ 半自洽 | Zotero MCP + Chrome登录态 + MarkerPDF路径 | 开新方向/补全文时 |
| 10 | 知识库沉淀 | ⚠️ 半自洽 | Vault路径统一 | 每次session后 |
| 11 | 学术PPT与可视化汇报 | ⚠️ 半自洽 | xelatex或浏览器验证 | 组会/汇报前 |
```

- [ ] **Step 4: Update dependency matrix**

Add rows:

```markdown
| CNKI/IEEE browser session | Flow 9 | ⚠️ 依赖登录态 |
| MarkerPDF service/script | Flow 1, 9 | ⚠️ 路径待统一 |
| xelatex | Flow 1, 11 | ⚠️ 需本机验证 |
| Obsidian vault filesystem | Flow 10 | ✅ 默认路径 `<configure-local-obsidian-vault>/` |
```

- [ ] **Step 5: Verify flow references**

Run:

```bash
rg 'Flow 9|Flow 10|Flow 11|pyrojewel-academic-ppt|cnki-research|ieee-research|llm-wiki' references/flow-map.md
```

Expected: each new flow and its primary skills appears at least once.

- [ ] **Step 6: Commit flow map update**

Run:

```bash
git add references/flow-map.md
git commit -m "docs: add active project flow inventory"
```

Expected: commit succeeds unless unrelated staged files exist.

---

### Task 3: Update Session Context for Active Flow Work

**Files:**
- Modify: `.claude/SESSION_CONTEXT.md`

- [ ] **Step 1: Add active flow thread bullets**

Add these bullets under `Active Threads`:

```markdown
- [ ] Complete active source repo flow inventory in `references/flow-map.md`.
- [ ] Validate `pyrojewel-academic-ppt` with xelatex and document expected input/output.
- [ ] Normalize MarkerPDF and Zotero storage paths across Zotero-related skills.
```

- [ ] **Step 2: Add key decision**

Add:

```markdown
- Flow documentation is the coordination layer: migration decisions should point back to `references/flow-map.md` and `references/skill-map.md`.
```

- [ ] **Step 3: Verify no duplicate active thread section**

Run:

```bash
rg '^## Active Threads|pyrojewel-academic-ppt|flow-map' .claude/SESSION_CONTEXT.md
```

Expected: one `Active Threads` heading and visible bullets for PPT and flow-map work.

- [ ] **Step 4: Commit session context update**

Run:

```bash
git add .claude/SESSION_CONTEXT.md
git commit -m "docs: update active flow session context"
```

Expected: commit succeeds unless unrelated staged files exist.

---

## Self-Review

- Confirm this plan only updates documentation and session state.
- Confirm every new flow has input, skill chain, dependencies, outputs, and blockers.
- Confirm `references/flow-map.md` and `references/skills-extraction.md` agree on skill names.
