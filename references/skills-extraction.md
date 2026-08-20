# Skill Source Registry & Migration Guide

> Canonical live map: [skill-source-map.md](skill-source-map.md)
>
> This file explains migration method and source audit.
> `skill-source-map.md` records what is actually adopted in the current project, who owns it, and how to review upstream updates.

## Update Flow

```
upstream repos ──git fetch+merge──► fork repos ──analyze──► migrate to pyrojewel_claude_code
                                        │
                                        └── scripts/sync-sources.sh
```

### Step 1: Sync upstream changes

```bash
# Sync all source repos
bash scripts/sync-sources.sh

# Or sync individually
bash scripts/sync-sources.sh ljg       # ljg-skills only
bash scripts/sync-sources.sh beamer    # beamer-academic only
bash scripts/sync-sources.sh manager   # skill_manager only
```

This script will:
- Fetch upstream and merge into fork (ljg-skills, beamer-academic)
- Pull latest from origin (skill_manager, self-built)
- Show new commits from upstream
- Push merged result to origin

### Step 2: Analyze what changed

```bash
# After sync, check what's new in each source repo
cd /home/DataTransfer/Pyrojewel/02_claudeSkill/ljg-skills && git log --oneline -10
cd /home/DataTransfer/Pyrojewel/02_claudeSkill/beamer-academic && git log --oneline -10
cd /home/DataTransfer/Pyrojewel/02_claudeSkill/skill_manager && git log --oneline -10
```

### Step 3: Migrate skills (manual, case-by-case)

For each changed skill, compare with current version and decide:
1. **New skill** → copy from source, apply standard adaptations (SKILL.md → skill.md, etc.)
2. **Updated skill** → diff source vs current, merge relevant changes, preserve local adaptations
3. **Removed skill** → evaluate if still needed locally

---

## Source Repositories

| Repository | Path | origin | upstream | Sync method |
|------------|------|--------|----------|-------------|
| ljg-skills | `/home/DataTransfer/Pyrojewel/02_claudeSkill/ljg-skills/` | `git@github.com:Pyrojewel-zard/ljg-skills.git` | `https://github.com/lijigang/ljg-skills.git` | fetch upstream → merge → push origin |
| beamer-academic | `/home/DataTransfer/Pyrojewel/02_claudeSkill/beamer-academic/` | `git@github.com:Pyrojewel-zard/beamer-academic.git` | `https://github.com/Faust-Donf/beamer-academic.git` | fetch upstream → merge → push origin |
| skill_manager | `/home/DataTransfer/Pyrojewel/02_claudeSkill/skill_manager/` | `git@github.com:Pyrojewel-zard/claude-skills-personal.git` | _(self-built, no upstream)_ | git pull origin |

---

## Skill Inventory (All Sources)

### From ECC

| Skill | Source Path | Purpose | Adaptation Needed |
|-------|-------------|---------|-------------------|
| `scientific-thinking-literature-review` | `ECC/skills/scientific-thinking-literature-review/` | Systematic literature survey | Add Zotero MCP calls |
| `deep-research` | `ECC/skills/deep-research/` | Multi-source deep search | No change |
| `search-first` | `ECC/skills/search-first/` | Search before coding | No change |
| `mle-workflow` | `ECC/skills/mle-workflow/` | ML engineering lifecycle | Prune DevOps/MLOps sections |
| `verification-loop` | `ECC/skills/verification-loop/` | 6-stage verification | No change |
| `continuous-learning-v2` | `ECC/skills/continuous-learning-v2/` | Experience accumulation loop | Simplify 4-layer → 2-layer |

**ECC sync**: `cd /home/DataTransfer/Pyrojewel/02_claudeSkill/ECC && git pull`

### From beamer-academic

| Skill | Source Path | Purpose | Adaptation Needed |
|-------|-------------|---------|-------------------|
| `beamer-academic` | `beamer-academic/` (whole repo) | 论文→Beamer PPT生成，13版式+5配色+反AI风格 | Rename `SKILL.md` → `skill.md` |

### From skill_manager

| Skill | Source Path | Purpose | Adaptation Needed |
|-------|-------------|---------|-------------------|
| `cnki-research` | `skill_manager/skills/cnki-research/` | 知网文献检索全流程 | Rename SKILL.md → skill.md |
| `ieee-research` | `skill_manager/skills/ieee-research/` | IEEE Xplore文献检索 | Rename SKILL.md → skill.md |
| `zotero-pdf-parse` | `skill_manager/skills/zotero-pdf-parse/` | Zotero PDF→Markdown转换 | Rename SKILL.md → skill.md |
| `zotero-semantic-search` | `skill_manager/skills/zotero-semantic-search/` | Zotero统一语义检索 | Rename SKILL.md → skill.md |
| `darwin-skill` | `skill_manager/skills/darwin-skill/` | Skill自动优化(元skill) | Rename SKILL.md → skill.md; prune marketing assets |
| `python-test-hygiene` | `skill_manager/skills/python-test-hygiene/` | Python测试卫生最佳实践 | Rename SKILL.md → skill.md |
| `docx-redline-reviewer` | `skill_manager/skills/docx-redline-reviewer/` | Word修订痕迹+AI批注 | Rename SKILL.md → skill.md |
| `markerpdf-cli` | `skill_manager/skills/markerpdf-cli/` | PDF→Markdown远程转换 | Rename SKILL.md → skill.md |
| `inspectional-reading` | `skill_manager/skills/inspectional-reading/` | 检视阅读引导 | Rename SKILL.md → skill.md |

### From ljg-skills

| Skill | Source Path | Purpose | Adaptation Needed | Status |
|-------|-------------|---------|-------------------|--------|
| `ljg-plain` | `ljg-skills/skills/ljg-plain/` | 白话引擎(改写到12岁能懂) | Rename SKILL.md → skill.md | Deferred |
| `ljg-think` | `ljg-skills/skills/ljg-think/` | 追本之箭(纵向深钻本质) | Rename SKILL.md → skill.md | Deferred |
| `ljg-writes` | `ljg-skills/skills/ljg-writes/` | 写作引擎(批判性层层剥底) | Rename SKILL.md → skill.md | Deferred |
| `ljg-word` | `ljg-skills/skills/ljg-word/` | 单词精通(深度拆解英文单词) | Rename SKILL.md → skill.md | Deferred |
| `ljg-book` | `ljg-skills/skills/ljg-book/` | 拆书(五件事抽骨架) | Rename SKILL.md → skill.md | Deferred |
| `ljg-invest` | `ljg-skills/sskills/ljg-invest/` | 投资分析(秩序创造机器判定) | Rename SKILL.md → skill.md | Deferred |

**已迁移为pyrojewel系列**：

| 原Skill | 新Skill | 改造内容 |
|---------|---------|----------|
| `ljg-paper` | `pyrojewel-paper` | 改名+图片管理+路径变量+输出目录+删AI_WRITING_PATTERNS |
| `ljg-paper-river` | `pyrojewel-paper-river` | 同上+递归溯源图片管理 |
| `ljg-qa` | `pyrojewel-paper-qa` | 重写workflow为对齐拷打，保留Q设计方法论 |

### Deferred (not yet migrated)

| Skill | Source | Priority | Reason for Deferral |
|-------|--------|----------|---------------------|
| `ljg-card` | ljg-skills | P3 | 需Playwright依赖+输出路径适配 |
| `ljg-rank` | ljg-skills | P3 | 需Unicode→ASCII替换 |
| `ljg-learn` | ljg-skills | P2 | 需确认输出目录规范兼容 |
| `ljg-present` | ljg-skills | P3 | 需增加markdown输入兼容 |
| `ljg-read` | ljg-skills | P3 | 需简化交互模式 |
| `ljg-relationship` | ljg-skills | P3 | 需简化交互+Unicode替换 |
| `ljg-roundtable` | ljg-skills | P3 | 需标注交互式skill |
| wiki skill族(10个) | skill_manager | P3 | 需Obsidian基础设施就绪 |
| `beamer-academic-pro` | skill_manager | P3 | 与beamer-academic重叠，暂缓 |

### Self-Built (TODO)

| Skill | Purpose | Status |
|-------|---------|--------|
| `reproduce-plan` | Structured paper reproduction plan | TODO |
| `dev-cycle` | Daily development cycle for ML | TODO |

---

## 2026-06-02 Active Source Audit

| Repository | Skills found | Primary flows | Dependency class | Migration state |
|------------|--------------|---------------|------------------|-----------------|
| `Auto-claude-code-research-in-sleep` | 81 unique top-level skills (excl. skills-codex* variants); key: `analyze-results`, `arxiv`, `auto-review-loop`, `dse-loop`, `experiment-plan`, `idea-creator`, `novelty-check`, `paper-compile`, `paper-plan`, `paper-write`, `research-lit`, `research-refine`, `research-review`, `research-wiki`, `wiki-enrich` | idea discovery (8), paper writing (5), experiment bridge (4), search (6) | Codex MCP + helper scripts for many flows; self-contained for ~20 skills | inventory dependencies before migration |
| `academic-skills` | 8 top-level: `benchmark-extractor`, `experiment-log-summarizer`, `paper-deep-note`, `paper-feishu-digest`, `research-gap-finder`, `review-rebuttal`, `survey-writer`, `weekly-lab-update` | survey (2), weekly update (6), rebuttal (7), academic writing (5) | mostly self-contained | migrate self-contained skills first |
| `nature-skills` | 9: `nature-academic-search`, `nature-citation`, `nature-data`, `nature-figure`, `nature-paper2ppt`, `nature-polishing`, `nature-reader`, `nature-response`, `nature-writing` | Nature paper writing, slides, figures | LaTeX + image/figure tooling | map overlap with ARIS paper-writing flow |
| `cnki-skills` | 10: `cnki-search`, `cnki-advanced-search`, `cnki-paper-detail`, `cnki-parse-results`, `cnki-navigate-pages`, `cnki-export`, `cnki-download`, `cnki-journal-search`, `cnki-journal-index`, `cnki-journal-toc` | CNKI search and extraction (9) | Chrome DevTools MCP / browser automation | verify browser/login assumptions |
| `ieee_skills` | 15: `ieee-search`, `ieee-advanced-search`, `ieee-massive-search`, `ieee-paper-detail`, `ieee-parse-results`, `ieee-navigate-pages`, `ieee-get-fulltext`, `ieee-paper-fullcontent`, `ieee-paper-markdown`, `ieee-paper-classify`, `ieee-export`, `ieee-download`, `ieee-journal-browse`, `ieee-standards-search`, `ieee-research` | IEEE search and extraction (9) | Chrome DevTools MCP / browser automation | verify browser/login assumptions |
| `zotero-cli-cc` | 1: `zotero-cli-cc` | Zotero management and parsing (1, 9) | Zotero CLI/MCP | reconcile with Zotero MCP skills |
| `claude-obsidian` | 11: `autoresearch`, `canvas`, `defuddle`, `obsidian-bases`, `obsidian-markdown`, `save`, `wiki-fold`, `wiki-ingest`, `wiki-lint`, `wiki-query`, `wiki` | Obsidian session/wiki sync (10) | vault path + API/filesystem | standardize filesystem-first vault writes |
| `llm-wiki-skill` | 1 root + 2 deps: `llm-wiki-skill`, `baoyu-url-to-markdown`, `youtube-transcript` | wiki capture/compile/query (10) | Obsidian/wiki storage | map wiki lifecycle stages |
| `beamer-academic` | 1: `beamer-academic` | academic PPT (11) | xelatex | partially adapted as `pyrojewel-academic-ppt` |
| `guizang-ppt-skill` | 1: `guizang-ppt-skill` | HTML PPT (11) | browser/static assets | add to flow and skill maps |

---

## Standard Adaptations (apply on every migration)

- [ ] Rename `SKILL.md` → `skill.md` (Claude Code standard)
- [ ] Verify `skill.md` has proper frontmatter (name, description, trigger)
- [ ] Remove hardcoded absolute paths
- [ ] Remove platform-specific commands (e.g., Voice Notification on macOS)
