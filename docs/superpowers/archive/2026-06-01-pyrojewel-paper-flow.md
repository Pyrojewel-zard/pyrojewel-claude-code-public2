---
title: Pyrojewel Paper Flow
date: 2026-06-01
status: completed
completed-date: 2026-06-05
---

# Pyrojewel Paper Flow 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建完整的论文阅读闭环flow：检索→阅读→溯源→QA对齐→报告，产出research-map.md + paper-report + qa-report，图片随笔记自包含。

**Architecture:** 将ljg-skills的3个skill改编为pyrojewel系列（改名+图片管理+路径变量+输出目录统一），新建pyrojewel-paper-qa做对齐拷打（基于ljg-qa的Q设计方法论但重写workflow），新建pyrojewel-paper-flow做编排入口，最后用darwin-skill优化。

**Tech Stack:** Claude Code skills (skill.md + YAML frontmatter), Zotero MCP, Bash (cp/mkdir/date), Markdown

---

## File Structure

```
skills/
  pyrojewel-paper/
    skill.md                              ← 基于ljg-paper改造（图片管理+路径变量+输出目录）
    references/
      template.md                         ← 从template.org转markdown
  pyrojewel-paper-river/
    skill.md                              ← 基于ljg-paper-river改造（同上）
    references/
      template.md                         ← 从template.org转markdown
  pyrojewel-paper-qa/
    skill.md                              ← 基于ljg-qa改造，重写workflow为对齐拷打
    References/
      QuestionDesign.md                   ← 直接复用ljg-qa原文件
    Workflows/
      Align.md                            ← 新写：对齐拷打workflow（替代Extract.md）
  pyrojewel-paper-flow/
    skill.md                              ← 全新编排skill
  darwin-skill/
    skill.md                              ← 从skill_manager复制，去掉marketing assets
    docs/
      exceptions.md
      result-card.md
    scripts/
      screenshot.mjs
    templates/
      result-card.html
      result-card-dark.html
      result-card-white.html
    test-prompts.json
    results.tsv
```

输出目录约定（所有pyrojewel-paper系列skill统一）：

```
{project}/notes/papers/
  research-map.md
  {ts}--paper-{title}.md
  {ts}--paper-river-{title}.md
  {ts}--qa-{title}.md
  images/{attachmentKey}/*.jpeg
  sources/{attachmentKey}.md
```

---

## Constants & Conventions

所有skill共享的常量（在skill.md开头定义）：

```
ZOTERO_STORAGE = <configure-local-zotero-storage>
OUTPUT_DIR = {project}/notes/papers/
IMAGES_DIR = {OUTPUT_DIR}/images/
SOURCES_DIR = {OUTPUT_DIR}/sources/
```

---

### Task 1: 复制pyrojewel-paper基础文件

**Files:**
- Create: `skills/pyrojewel-paper/skill.md`
- Create: `skills/pyrojewel-paper/references/template.md`
- Source: `<source-repos-root>/ljg-skills/skills/ljg-paper/SKILL.md`
- Source: `<source-repos-root>/ljg-skills/skills/ljg-paper/references/template.org`

- [ ] **Step 1: 复制ljg-paper目录**

```bash
cp -r <source-repos-root>/ljg-skills/skills/ljg-paper <source-repos-root>/pyrojewel_claude_code/skills/pyrojewel-paper
```

- [ ] **Step 2: 重命名SKILL.md为skill.md**

```bash
mv skills/pyrojewel-paper/SKILL.md skills/pyrojewel-paper/skill.md
```

- [ ] **Step 3: 替换frontmatter中的name**

在 `skills/pyrojewel-paper/skill.md` 中：
- `name: ljg-paper` → `name: pyrojewel-paper`
- description中所有 `ljg-paper` → `pyrojewel-paper`
- description中触发词增加 `'论文阅读'`, `'读论文'`

- [ ] **Step 4: 删除Voice Notification**

删除skill.md中所有 `curl -s -X POST http://localhost:31337/notify` 块和 `Running **Extract** in **ljg-qa**...` 输出文本。

- [ ] **Step 5: 替换硬编码Zotero路径为常量**

在skill.md开头（frontmatter之后、正文之前）增加常量区：

```markdown
## Constants

- **ZOTERO_STORAGE** = `<configure-local-zotero-storage>`
- **OUTPUT_DIR** = `{project}/notes/papers/`
- **IMAGES_DIR** = `{OUTPUT_DIR}/images/`
- **SOURCES_DIR** = `{OUTPUT_DIR}/sources/`
```

然后将正文中所有 `<configure-local-zotero-storage>` 替换为 `$ZOTERO_STORAGE`。

- [ ] **Step 6: 替换输出目录**

将正文中所有 `/raw/paper/` 替换为 `$OUTPUT_DIR`。

- [ ] **Step 7: 增加图片资产管理逻辑**

在"获取内容"步骤的Zotero Markdown优先路径之后，增加：

```markdown
**图片资产管理（pyrojewel新增）**：

Zotero路径命中后，执行以下资产管理：
1. 创建目录：`mkdir -p $IMAGES_DIR/{attachmentKey}` 和 `mkdir -p $SOURCES_DIR`
2. 复制关键图片：`cp $ZOTERO_STORAGE/{attachmentKey}/*.{jpeg,png,jpg} $IMAGES_DIR/{attachmentKey}/`
3. 复制content.md备份：`cp $ZOTERO_STORAGE/{attachmentKey}/content.md $SOURCES_DIR/{attachmentKey}.md`
4. 笔记中图片引用使用相对路径：`images/{attachmentKey}/xxx.jpeg`
5. QA对齐时可通过 `$SOURCES_DIR/{attachmentKey}.md` 回看原文
```

- [ ] **Step 8: 删除AI_WRITING_PATTERNS引用**

删除 `~/.claude/PAI/USER/AI_WRITING_PATTERNS.md` 相关的引用行和检查逻辑。

- [ ] **Step 9: 转换template.org为template.md**

将 `references/template.org` 内容从org-mode语法转为markdown：
- `#+title:` → YAML frontmatter `title:`
- `#+subtitle:` → YAML frontmatter `subtitle:`
- `#+date:` → YAML frontmatter `date:`
- `#+filetags:` → YAML frontmatter `tags:`
- `#+identifier:` → YAML frontmatter `identifier:`
- `* 标题` → `## 标题`
- `** 子标题` → `### 子标题`
- `*** 子子标题` → `#### 子子标题`
- `*bold*` → `**bold**`
- `~code~` → `` `code` ``
- `#+begin_example` → ```` ``` ````

重命名为 `references/template.md`，删除 `references/template.org`。

- [ ] **Step 10: Commit**

```bash
git add skills/pyrojewel-paper/
git commit -m "feat: add pyrojewel-paper skill (from ljg-paper)"
```

---

### Task 2: 复制pyrojewel-paper-river基础文件

**Files:**
- Create: `skills/pyrojewel-paper-river/skill.md`
- Create: `skills/pyrojewel-paper-river/references/template.md`
- Source: `<source-repos-root>/ljg-skills/skills/ljg-paper-river/SKILL.md`
- Source: `<source-repos-root>/ljg-skills/skills/ljg-paper-river/references/template.org`

- [ ] **Step 1: 复制ljg-paper-river目录**

```bash
cp -r <source-repos-root>/ljg-skills/skills/ljg-paper-river <source-repos-root>/pyrojewel_claude_code/skills/pyrojewel-paper-river
```

- [ ] **Step 2: 重命名SKILL.md为skill.md**

```bash
mv skills/pyrojewel-paper-river/SKILL.md skills/pyrojewel-paper-river/skill.md
```

- [ ] **Step 3: 替换frontmatter和触发词**

- `name: ljg-paper-river` → `name: pyrojewel-paper-river`
- description中所有 `ljg-paper-river` → `pyrojewel-paper-river`
- description中触发词增加 `'论文溯源'`, `'论文脉络'`

- [ ] **Step 4: 删除Voice Notification**（同Task 1 Step 4）

- [ ] **Step 5: 增加常量区**（同Task 1 Step 5，完全相同的常量定义）

- [ ] **Step 6: 替换硬编码路径和输出目录**（同Task 1 Step 5-6）

- [ ] **Step 7: 增加图片资产管理逻辑**

与Task 1 Step 7相同，额外注意：river递归读取5层论文，每层都有自己的attachmentKey。在递归溯源的每一步，都执行图片复制：

```markdown
**递归溯源中的图片资产管理**：

每递归到一篇新论文时：
1. 如果该论文来自Zotero（有attachmentKey）：
   - `mkdir -p $IMAGES_DIR/{attachmentKey}`
   - `cp $ZOTERO_STORAGE/{attachmentKey}/*.{jpeg,png,jpg} $IMAGES_DIR/{attachmentKey}/`
   - `cp $ZOTERO_STORAGE/{attachmentKey}/content.md $SOURCES_DIR/{attachmentKey}.md`
2. 笔记中引用该论文图片：`images/{attachmentKey}/xxx.jpeg`
3. 不同论文的图片按attachmentKey分区，不会冲突
```

- [ ] **Step 8: 转换template.org为template.md**（同Task 1 Step 9）

- [ ] **Step 9: Commit**

```bash
git add skills/pyrojewel-paper-river/
git commit -m "feat: add pyrojewel-paper-river skill (from ljg-paper-river)"
```

---

### Task 3: 改造pyrojewel-paper-qa（对齐拷打skill）

**Files:**
- Create: `skills/pyrojewel-paper-qa/skill.md`
- Create: `skills/pyrojewel-paper-qa/Workflows/Align.md`
- Create: `skills/pyrojewel-paper-qa/References/QuestionDesign.md`
- Source: `<source-repos-root>/ljg-skills/skills/ljg-qa/`

- [ ] **Step 1: 复制ljg-qa目录**

```bash
cp -r <source-repos-root>/ljg-skills/skills/ljg-qa <source-repos-root>/pyrojewel_claude_code/skills/pyrojewel-paper-qa
```

- [ ] **Step 2: 重命名SKILL.md为skill.md**

```bash
mv skills/pyrojewel-paper-qa/SKILL.md skills/pyrojewel-paper-qa/skill.md
```

- [ ] **Step 3: 重写skill.md frontmatter**

```yaml
---
name: pyrojewel-paper-qa
description: "论文阅读对齐拷打。基于pyrojewel-paper的分析结果，与用户自己的理解进行逐Q对齐——差异点、逼问、对齐结论。不是纠错，是深度理解。触发词：'论文拷打', '对齐', 'QA对齐', 'paper qa', '拷打论文'。输入是paper-report的markdown文件。"
user_invocable: true
version: "1.0.0"
---
```

- [ ] **Step 4: 重写skill.md正文**

完整替换skill.md正文为：

```markdown
# pyrojewel-paper-qa: 论文对齐拷打

拿到pyrojewel-paper的分析后，和你自己读论文的理解对齐。不是纠错——是逼自己想清楚"我到底理解了没有"。

## 你不是

- 不是纠错工具（AI说错了我要纠正）——是验证理解的工具
- 不是摘要生成器——摘要不产生理解
- 不是FAQ——FAQ回答已知问题，拷打暴露未知问题

## 你是

从AI分析和人的理解的差异中，找到理解还没到位的地方，逼问到底，直到对齐。

## 核心逻辑

ljg-qa提取Q链的目的是"复现作者推理"——单向理解论文。
pyrojewel-paper-qa提取Q链的目的是"验证我的理解"——双向对撞：AI分析和人的理解互相拷问。

Q链的来源不是论文原文，而是pyrojewel-paper产出的paper-report。Q链就是拷打的弹药——每个Q我都需要能回答才算真懂了。

## Constants

- **OUTPUT_DIR** = `{project}/notes/papers/`

## 格式约束

- Markdown语法：`**bold**`双星号加粗
- 输出目录：`$OUTPUT_DIR`
- 文件命名：`{YYYYMMDDTHHMMSS}--qa-{short-title}.md`
- YAML frontmatter：

```yaml
---
title: qa-{short-title}
date: {YYYY-MM-DD HH:MM}
tags: [qa, paper-alignment]
identifier: {YYYYMMDDTHHMMSS}
source: {paper-report文件路径}
paper: {论文标题}
---
```

## Workflow

按 `Workflows/Align.md` 执行。

## Q设计方法论

Q的四类（动/对/因/界）和A的四段结构（结论/形式化/步骤/边界）见 `References/QuestionDesign.md`。

## 输出

qa-report-X.md，结构：

```markdown
# 对齐QA：{论文标题}

## 论文信息
- 论文：{标题}
- AI分析来源：{paper-report路径}
- 原文备份：{sources/attachmentKey.md路径}

## Q1: {从paper-report提取的尖锐问题}

### AI的判断
{从paper-report中提取的相关分析}

### 你的理解
{用户交互输入——你怎么看？}

### 逼问
{如果AI和用户理解不同：为什么不同？哪个更有道理？}

### 对齐结论
*结论*：{一句话}
*形式化*：{一行可视关系}
*怎么想到的*：{论证步}
*边界*：{不成立条件}

### 状态
✅ 已对齐 / ⚠️ 需进一步阅读 / ❌ 根本性分歧

## Q2: ...

## 对齐总览

| Q | 状态 | 关键差异 |
|---|------|----------|
| Q1 | ✅ | 无差异 |
| Q2 | ⚠️ | AI认为核心是X，我认为是Y |
| Q3 | ❌ | 对方法适用范围有根本分歧 |

## 综合判断
{基于所有QA后的理解——这篇论文对我来说意味着什么}
```
```

- [ ] **Step 5: 创建Workflows/Align.md**

删除 `Workflows/Extract.md`，创建 `Workflows/Align.md`：

```markdown
# Align Workflow

基于paper-report进行对齐拷打。

## Step 1: 读取paper-report

读取用户指定的paper-report-X.md文件。提取以下AI分析内容：
- 问题体验（问题section）
- 方法翻译（翻译section）
- 核心概念（核心概念section）
- 洞见（洞见section）
- 博导审稿（博导审稿section）
- 启发（启发section）

## Step 2: 生成Q链

基于AI分析内容，生成5-10个拷问式Q。Q的设计遵循 `References/QuestionDesign.md` 的四类分类：

| Q类型 | 在对齐中的含义 |
|--------|---------------|
| 动作 | AI说方法X这样work——我理解它为什么work吗？ |
| 对比 | AI认为核心贡献是A——我认为是B，哪个对？ |
| 因果 | AI的启发说可以迁移——具体到我的领域怎么迁移？ |
| 边界 | AI没讨论的局限——我看到了什么AI没看到的？ |

Q链按论证依赖关系排序，不按paper-report的章节顺序。

## Step 3: 逐Q交互对齐

对每个Q，执行以下交互：

1. 展示Q和AI的判断（从paper-report提取）
2. 询问用户："你怎么看？"（等待用户输入）
3. 比较AI判断和用户理解：
   - 一致 → 标记 ✅，简短记录
   - 用户补充了AI没看到的 → 标记 ✅，记录补充内容
   - 用户不同意AI → 标记 ⚠️/❌，进入逼问
4. 逼问（仅差异点）：
   - "为什么你的理解和AI不同？"
   - "哪个更有道理？依据是什么？"
   - "如果AI是对的，意味着什么？如果你是对的，意味着什么？"
5. 写对齐结论（四段结构：结论/形式化/步骤/边界）

## Step 4: 生成对齐总览

汇总所有Q的对齐状态，生成表格：

| Q | 状态 | 关键差异 |

## Step 5: 综合判断

基于所有QA，写出对这篇论文的综合判断：
- 这篇论文对我的研究意味着什么
- 哪些理解已对齐，哪些还需要进一步阅读
- 与其他论文的交叉对比点

## Step 6: 写文件

获取时间戳，写入 `$OUTPUT_DIR/{timestamp}--qa-{short-title}.md`。
报告文件路径给用户。
```

- [ ] **Step 6: QuestionDesign.md保持不变**

`References/QuestionDesign.md` 直接复用ljg-qa原文件，无需修改。

- [ ] **Step 7: Commit**

```bash
git add skills/pyrojewel-paper-qa/
git commit -m "feat: add pyrojewel-paper-qa skill (from ljg-qa, rewritten for alignment)"
```

---

### Task 4: 新建pyrojewel-paper-flow编排skill

**Files:**
- Create: `skills/pyrojewel-paper-flow/skill.md`

- [ ] **Step 1: 创建skill.md**

```markdown
---
name: pyrojewel-paper-flow
description: "论文调研闭环flow：检索→阅读→溯源→QA对齐→报告。编排pyrojewel-paper, pyrojewel-paper-river, pyrojewel-paper-qa三个skill，产出research-map.md + paper-report + qa-report。触发词：'论文调研', 'paper flow', '调研报告', '读论文'。"
user_invocable: true
version: "1.0.0"
---

# pyrojewel-paper-flow: 论文调研闭环

从检索论文到深度阅读到组会汇报到形成判断的完整闭环。

## Constants

- **ZOTERO_STORAGE** = `<configure-local-zotero-storage>`
- **OUTPUT_DIR** = `{project}/notes/papers/`
- **IMAGES_DIR** = `{OUTPUT_DIR}/images/`
- **SOURCES_DIR** = `{OUTPUT_DIR}/sources/`

## Workflow

### Step 1: 检索论文

调用 `/zotero-semantic-search`，输入研究方向关键词。

输出：论文列表表（# | Title | Item Key | Attachment Key | PDF | MD | Images）

询问用户：选择哪篇作为核心论文？还有哪些需要额外关注？

### Step 2: 资产准备

对每篇选中论文：

1. 检查是否有content.md（MD列是否为✅）
2. 无content.md → 调用 `/zotero-pdf-parse {itemKey}` 转换
3. 创建目录：`mkdir -p $IMAGES_DIR/{attachmentKey}` 和 `mkdir -p $SOURCES_DIR`
4. 复制图片：`cp $ZOTERO_STORAGE/{attachmentKey}/*.{jpeg,png,jpg} $IMAGES_DIR/{attachmentKey}/ 2>/dev/null`
5. 复制content.md：`cp $ZOTERO_STORAGE/{attachmentKey}/content.md $SOURCES_DIR/{attachmentKey}.md`

### Step 3: 溯源阅读

调用 `/pyrojewel-paper-river`，输入核心论文。

输出：river报告（溯源地图 + 问题演化线 + 洞见）→ 保存到 `$OUTPUT_DIR/{timestamp}--paper-river-{title}.md`

从river报告中提取演化线上的论文清单。

### Step 4: 逐篇精读

对river链上每篇论文 + 用户额外关注的论文：

调用 `/pyrojewel-paper`，输入论文标题/URL/Zotero item key。

输出：paper-report → 保存到 `$OUTPUT_DIR/{timestamp}--paper-{title}.md`

### Step 5: QA对齐（交互式）

对每篇paper-report：

调用 `/pyrojewel-paper-qa`，输入paper-report文件路径。

输出：qa-report → 保存到 `$OUTPUT_DIR/{timestamp}--qa-{title}.md`

此步骤需要用户交互——逐Q回答自己的理解。

### Step 6: 生成research-map.md

整合所有产出，写入 `$OUTPUT_DIR/research-map.md`：

```markdown
# 调研地图：{研究方向}

> 生成时间：{timestamp}

## 溯源脉络

{从river报告提取：溯源地图 + 问题演化线}

## 论文索引

| # | 论文 | 阅读报告 | QA对齐 | 关键判断 |
|---|------|----------|--------|----------|
| 1 | {titleA} | [paper-report]({ts}--paper-{titleA}.md) | [qa-report]({ts}--qa-{titleA}.md) | {一句话} |
| 2 | {titleB} | [paper-report]({ts}--paper-{titleB}.md) | [qa-report]({ts}--qa-{titleB}.md) | {一句话} |

## 综合判断

{基于所有QA后的理解——这个方向值不值得继续，下一步做什么}
```

### Step 7: 可选→PPT

询问用户是否需要生成组会PPT。

如果需要：调用 `/beamer-academic`，输入research-map.md。

## 输出文件结构

```
notes/papers/
  research-map.md                     ← 调研地图
  {ts}--paper-river-{core}.md         ← 溯源报告
  {ts}--paper-{titleA}.md             ← 论文A阅读报告
  {ts}--paper-{titleB}.md             ← 论文B阅读报告
  {ts}--qa-{titleA}.md               ← 论文A的QA对齐
  {ts}--qa-{titleB}.md               ← 论文B的QA对齐
  images/
    {attachmentKey1}/                  ← 论文A的图片
    {attachmentKey2}/                  ← 论文B的图片
  sources/
    {attachmentKey1}.md               ← 论文A的content.md备份
    {attachmentKey2}.md               ← 论文B的content.md备份
```
```

- [ ] **Step 2: Commit**

```bash
git add skills/pyrojewel-paper-flow/
git commit -m "feat: add pyrojewel-paper-flow orchestration skill"
```

---

### Task 5: 复制darwin-skill

**Files:**
- Create: `skills/darwin-skill/skill.md`
- Create: `skills/darwin-skill/docs/exceptions.md`
- Create: `skills/darwin-skill/docs/result-card.md`
- Create: `skills/darwin-skill/scripts/screenshot.mjs`
- Create: `skills/darwin-skill/templates/result-card.html`
- Create: `skills/darwin-skill/templates/result-card-dark.html`
- Create: `skills/darwin-skill/templates/result-card-white.html`
- Create: `skills/darwin-skill/test-prompts.json`
- Create: `skills/darwin-skill/results.tsv`
- Source: `<source-repos-root>/skill_manager/skills/darwin-skill/`

- [ ] **Step 1: 复制darwin-skill核心文件（去掉marketing assets）**

```bash
mkdir -p skills/darwin-skill/docs skills/darwin-skill/scripts skills/darwin-skill/templates
cp <source-repos-root>/skill_manager/skills/darwin-skill/SKILL.md skills/darwin-skill/skill.md
cp <source-repos-root>/skill_manager/skills/darwin-skill/docs/exceptions.md skills/darwin-skill/docs/
cp <source-repos-root>/skill_manager/skills/darwin-skill/docs/result-card.md skills/darwin-skill/docs/
cp <source-repos-root>/skill_manager/skills/darwin-skill/scripts/screenshot.mjs skills/darwin-skill/scripts/
cp <source-repos-root>/skill_manager/skills/darwin-skill/templates/result-card.html skills/darwin-skill/templates/
cp <source-repos-root>/skill_manager/skills/darwin-skill/templates/result-card-dark.html skills/darwin-skill/templates/
cp <source-repos-root>/skill_manager/skills/darwin-skill/templates/result-card-white.html skills/darwin-skill/templates/
cp <source-repos-root>/skill_manager/skills/darwin-skill/test-prompts.json skills/darwin-skill/
cp <source-repos-root>/skill_manager/skills/darwin-skill/results.tsv skills/darwin-skill/
```

不复制：`README.md`, `README_EN.md`, `showcase.html`, `assets/` 目录（marketing素材）。

- [ ] **Step 2: Commit**

```bash
git add skills/darwin-skill/
git commit -m "feat: add darwin-skill (from skill_manager, without marketing assets)"
```

---

### Task 6: 更新项目文档

**Files:**
- Modify: `references/flow-map.md`
- Modify: `references/skills-extraction.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: 更新flow-map.md的Flow 1 skill列表**

将Flow 1中的skill从 `ljg-paper`, `ljg-paper-river`, `ljg-qa` 更新为 `pyrojewel-paper`, `pyrojewel-paper-river`, `pyrojewel-paper-qa`, `pyrojewel-paper-flow`。增加图片管理和QA对齐的描述。

- [ ] **Step 2: 更新skills-extraction.md**

在"From ljg-skills"部分增加3个新skill的记录，标注已迁移为pyrojewel系列。在"From skill_manager"部分增加darwin-skill的记录。

- [ ] **Step 3: 更新CLAUDE.md Active Skills表**

增加4个新skill：

| Skill | Source | Purpose | Status |
|-------|--------|---------|--------|
| `pyrojewel-paper` | ljg-skills改编 | 论文精读+图片管理 | Active |
| `pyrojewel-paper-river` | ljg-skills改编 | 论文溯源脉络 | Active |
| `pyrojewel-paper-qa` | ljg-qa改编 | 论文阅读对齐拷打 | Active |
| `pyrojewel-paper-flow` | 自建 | 论文调研闭环编排 | Active |
| `darwin-skill` | skill_manager | Skill自动优化 | Active |

- [ ] **Step 4: Commit**

```bash
git add references/flow-map.md references/skills-extraction.md CLAUDE.md
git commit -m "docs: update flow-map and skill registry for pyrojewel-paper series"
```

---

### Task 7: darwin-skill优化（手动，在所有skill完成后）

此任务不在自动化执行范围内——需要用户在所有skill创建完成后，手动运行：

```bash
# 对每个新skill运行darwin-skill优化
/pyrojewel-paper       → /darwin-skill
/pyrojewel-paper-river → /darwin-skill
/pyrojewel-paper-qa    → /darwin-skill
/pyrojewel-paper-flow  → /darwin-skill
```

darwin-skill会：评估8维度打分 → 针对最低维度改进 → 用测试prompt验证 → 保留或回滚。

---

## Verification

### 冒烟测试（每个skill完成后立即验证）

1. **pyrojewel-paper**: 确认 `skills/pyrojewel-paper/skill.md` 存在，frontmatter name为 `pyrojewel-paper`，无 `/raw/paper/` 残留路径，无 Voice Notification，有 Constants 区，有图片资产管理逻辑

2. **pyrojewel-paper-river**: 同上检查，额外确认有递归溯源的图片管理逻辑

3. **pyrojewel-paper-qa**: 确认 `Workflows/Align.md` 存在且 `Workflows/Extract.md` 已删除，frontmatter name为 `pyrojewel-paper-qa`，有对齐拷打的workflow描述

4. **pyrojewel-paper-flow**: 确认skill.md存在，workflow包含7个Step，有research-map.md的输出结构描述

5. **darwin-skill**: 确认skill.md存在，无assets/目录，无README.md

### 集成测试（所有skill完成后）

1. 给一篇Zotero中的论文标题，运行 `/pyrojewel-paper-flow`
2. 验证完整流程：检索→资产准备→溯源→精读→QA→research-map
3. 验证图片复制到 `notes/papers/images/{key}/`
4. 验证笔记中图片引用为相对路径
5. 验证research-map.md中链接到paper-report和qa-report的路径正确
