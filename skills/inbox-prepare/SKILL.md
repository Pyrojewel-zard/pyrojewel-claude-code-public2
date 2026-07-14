---
name: inbox-prepare
description: |
  Transform inbox content into high-quality raw files with intelligent deduplication.
  Use this skill whenever the user mentions "process inbox", "prepare raw", "move to raw",
  "deduplicate", "organize inbox", or when inbox items need processing. Also trigger
  when the user has captured content that needs to enter the knowledge pipeline.
  This is the critical intake layer for knowledge quality.
trigger:
  - "process inbox"
  - "prepare raw"
  - "deduplicate"
  - "organize inbox"
  - "处理收件箱"
---

# inbox-prepare

Transform `inbox/` content into high-quality `raw/` entries through intelligent
deduplication, domain classification, and type classification. This skill is **fully self-contained** —
follow these instructions to execute the complete workflow.

## Overview

```
inbox/*.md (+ referenced images)
    → [inbox-prepare]
    → raw/<domain-kind>/<domain>/<type>/*.md
    → 08-Assets/<image-filename>  (images consolidated here)
                    ↓
         Decision: existing | append | new
```

**Pipeline position:** `capture → inbox-prepare → compile → crystallize → query`

**Directory strategy:** Classify raw material first by domain, then by content type.
- `projects/` for concrete codebases, repos, services, research projects
- `topics/` for software/tool usage, technical themes, platforms, concepts
- `unclassified/` when domain is still unclear

**Attachment policy:** All images are stored in a single flat directory `08-Assets/` at vault root. Image references in raw markdown are always rewritten to Obsidian wikilink format `![[filename.png]]`. No images are copied or moved — they remain in their original location, and the wikilink references them by filename alone (Obsidian resolves the filename across the vault). If the image does not yet exist in `08-Assets/`, copy it there from the inbox source location.

---

## Execution Steps

### Step 1: Scan Inbox

List all files in `inbox/` directory. For each `.md` file:

1. Read the file content
2. Parse frontmatter (YAML between `---` markers)
3. Extract: `type`, `source`, `created`, `project`, `tags`
4. Detect image references in:
   - Obsidian format: `![[image.png]]`
   - Standard Markdown: `![](path/to/image.png)`
5. Resolve image paths relative to the inbox note first, then `inbox/assets/`

**Tool:** Use `listDirectory` then `readFile` for each file.

---

### Step 2: Analyze Each Inbox Entry

For each inbox file, perform content analysis:

#### 2a. Extract Title

Priority order:
1. First `# heading` in content
2. `title:` from frontmatter
3. First 50 characters of content

#### 2b. Detect Content Type

Analyze content to determine type:

| Type | Indicators | File Pattern |
|------|------------|--------------|
| **log** | Date patterns (`YYYY-MM-DD`), project context, chronological entries | `raw/<domain-kind>/<domain>/log/YYYY-MM-DD-<slug>.md` |
| **procedure** | Numbered steps, "how to", "步骤", "first/then/finally" | `raw/<domain-kind>/<domain>/procedure/<topic>.md` |
| **troubleshooting** | Problem-solution pattern, "error", "fix", "解决", "问题" | `raw/<domain-kind>/<domain>/troubleshooting/<issue>.md` |
| **note** | Short content, no clear structure, miscellaneous | `raw/<domain-kind>/<domain>/note/YYYY-MM-DD-<slug>.md` |

**Detection heuristics:**

```
IF content has date pattern AND (project name OR "项目")
  → type = log
ELSE IF content has numbered steps AND NOT problem keywords
  → type = procedure
ELSE IF content has (problem keywords AND solution keywords)
  → type = troubleshooting
ELSE
  → type = note
```

#### 2c. Generate Slug

Convert title to URL-safe slug:
1. Lowercase
2. Replace spaces with hyphens
3. Remove special characters (keep alphanumeric, CJK, hyphens)
4. Limit to 50 characters

**Example:** "React Hooks 使用指南" → `react-hooks-使用指南`

#### 2d. Detect Domain

Classify the note into one of three domain kinds:

| Domain Kind | Use For | Example Path Prefix |
|-------------|---------|---------------------|
| **projects** | Concrete code repo, app, service, plugin, research project | `raw/projects/llm-wiki/` |
| **topics** | Software usage, tool tutorial, platform knowledge, technical theme | `raw/topics/obsidian/` |
| **unclassified** | Domain not yet clear | `raw/unclassified/general/` |

**Heuristics:**

```
IF content/frontmatter mentions a specific repo, codebase, app under development,
service name, plugin name, or active engineering project
  → domain-kind = projects

ELSE IF content is about using or understanding a tool/software/topic/platform
without being tied to a specific codebase
  → domain-kind = topics

ELSE
  → domain-kind = unclassified
```

Extract `domain` from:
1. Frontmatter `project:` if present and specific
2. Explicit repo/software/tool name in title
3. Repeated named entity in content
4. Fallback:
   - `general` for `unclassified`
   - a concise inferred slug for `projects` or `topics`

**Examples:**
- "给 llm_wiki 加 Obsidian MCP" → `projects/llm-wiki`
- "Obsidian 插件安装步骤" → `topics/obsidian`
- "如何配置 Docker 网络" → `topics/docker`
- "零散想法，没有明确对象" → `unclassified/general`

#### 2e. Plan Image Consolidation

If the inbox note contains image references, consolidate them into `08-Assets/`:

**Image reference normalization rules:**
1. Standard Markdown `![](path/to/image.png)` → rewrite to Obsidian `![[image.png]]`
2. Obsidian `![[image.png]]` → keep as-is (already correct format)
3. Obsidian `![[path/to/image.png]]` → simplify to `![[image.png]]` (filename only)

**Image file consolidation:**
- Target directory: `08-Assets/` (flat, no subdirectories)
- For each referenced image file:
  1. If the file already exists in `08-Assets/` with the same name → skip (already consolidated)
  2. If the file does not exist in `08-Assets/` → copy it there from the inbox source location
  3. If a different file with the same name exists in `08-Assets/` → rename by prepending a short project/domain prefix (e.g., `xbr818d-pasted-image-20260315.png`)

**Examples:**
- `![](宽角域隐身..._image00001.jpeg)` → `![[image00001.jpeg]]` (copy to `08-Assets/`)
- `![[Pasted image 20250215212101.png]]` → keep as-is (copy to `08-Assets/` if not already there)
- `![[Pasted image 20250215212101.png]]` in XBR818D context where `08-Assets/Pasted image 20250215212101.png` already exists from another project → rename to `xbr818d-Pasted image 20250215212101.png` and reference as `![[xbr818d-Pasted image 20250215212101.png]]`

---

### Step 3: Search for Similar Content

**Critical step for deduplication.** Use Obsidian semantic search:

```
mcp__obsidian-mcp-tools__search_vault_smart(
  query: "<main keywords from content>",
  filter: {
    folders: [
      "raw/<domain-kind>/<domain>/",
      "raw/",
      "wiki/sources/",
      "wiki/entities/"
    ],
    limit: 10
  }
)
```

**Extract keywords:**
- Title words (excluding stop words)
- Key technical terms
- Project names
- Main concepts

**Stop words to exclude:**
```
的, 是, 了, 什么, 在, 有, 和, 与, 对, 从
the, is, a, an, what, how, are, was, were, do, does, did
```

---

### Step 4: Make Decision

Based on search results, decide for each inbox entry:

#### Decision Matrix

| Condition | Decision | Action |
|-----------|----------|--------|
| No similar results found | `new` | Create new raw file |
| Similar result with >85% topic overlap in same domain | `existing` | Skip, log as duplicate |
| Similar result with 50-85% overlap in same domain | `append` | Append to existing file |
| Multiple partial matches | `new` | Create new, link to related |

**Similarity assessment:**

Compare the inbox content with each search result:
- **Title similarity:** Do titles refer to the same topic?
- **Content overlap:** Do they cover the same information?
- **Type match:** Are they the same content type?
- **Domain match:** Are they under the same project/topic domain?

**Conservative principle:** When in doubt, prefer `new` over `existing`. False duplicates are worse than missed duplicates.

**⚠️ Index cache validation:** Search results may include stale cached entries. Before deciding `existing`, verify the target file actually exists using `readFile`. If file not found, treat as `new`.

---

### Step 5: Enforce Granularity

Check content size against targets:

| Type | Min | Target | Max | Action if too small |
|------|-----|--------|-----|---------------------|
| log | 800 | 1500 | 3000 | Consider merging with related log |
| procedure | 800 | 1200 | 2000 | Expand with context or merge |
| troubleshooting | 800 | 1200 | 2000 | Add more context |
| note | 500 | 800 | 1500 | Merge with existing note |

**For content > max:** Split into logical chunks, each with context.

**For content < min:** Strongly prefer `append` over `new`.

---

### Step 5.5: ⚠️ Decision Confirmation Checkpoint (IMPORTANT)

**Before writing files, confirm decisions with user:**

When processing multiple inbox entries (≥3) or making significant decisions, pause and ask:

```
Inbox Prepare Decisions:

| Inbox File | Decision | Target |
|------------|----------|--------|
| session-1.md | new | raw/projects/frontend-handbook/procedure/react-patterns.md |
| debug-log.md | append | raw/projects/my-service/troubleshooting/memory-leak.md |
| duplicate.md | existing | (skip - same domain, 90% overlap) |

Proceed with all decisions? Or adjust specific ones?
```

**Why this checkpoint matters:**
- Prevents incorrect deduplication decisions
- Allows user to override `existing` → `new` when needed
- Catches type misclassifications before writing
- Ensures granularity decisions are appropriate

**Skip checkpoint only when:**
- Single inbox entry (auto-proceed)
- User explicitly requested "process all inbox"
- Running in automated/batch mode with prior approval

---

### Step 6: Write Raw Files

#### 6a. For `new` Decision

Create new file at determined path with this structure:

```markdown
---
domain_type: <projects|topics|unclassified>
domain: <domain-slug>
type: <log|procedure|troubleshooting|note>
title: "<inferred title>"
created: YYYY-MM-DD
project: <project-name>  # Only for logs
tags: [<auto-detected-tags>]
sources: ["inbox/<original-filename>"]
images: [<list of image filenames in 08-Assets/>]
---

# <title>

<processed content>

<!-- Prepared from: inbox/<original-filename> -->
<!-- Prepared on: YYYY-MM-DD -->
```

Before writing markdown:
1. Normalize all image references to Obsidian `![[filename.ext]]` format
2. For each referenced image, copy to `08-Assets/` if not already present
3. If filename collision in `08-Assets/`, prepend domain prefix (e.g., `xbr818d-`)
4. Update the `images:` frontmatter list with the consolidated filenames

**Example rewritten image links:**

```markdown
![[obsidian-settings.png]]
![[image00001.jpeg]]
```

#### 6b. For `append` Decision

Read existing file, then append:

```markdown
---

## <YYYY-MM-DD> — <source description>

<new content>

<!-- Appended from: inbox/<original-filename> -->
<!-- Appended on: YYYY-MM-DD -->
```

**Important:** Preserve existing content exactly. Only append new section.

For appended content with images:
1. Normalize image references to `![[filename.ext]]` format
2. Copy new images to `08-Assets/` if not already present (prepend domain prefix on collision)
3. Update `images:` frontmatter with any new filenames

#### 6c. For `existing` Decision

Do not write. Log the decision with reason.

---

### Step 7: Generate Decision Log

After processing all inbox entries, output a summary:

```markdown
# Inbox Prepare Report

**Processed:** YYYY-MM-DD HH:mm

## Decisions

| Inbox File | Decision | Type | Raw Target | Reason |
|------------|----------|------|------------|--------|
| inbox/session-1.md | new | procedure | raw/projects/frontend-handbook/procedure/react-patterns.md | No similar content found |
| inbox/debug-log.md | append | troubleshooting | raw/projects/my-service/troubleshooting/memory-leak.md | Extends existing troubleshooting |
| inbox/duplicate.md | existing | - | raw/topics/react/note/react-hooks.md | Already exists with 90% overlap |

## Statistics

- Total processed: 3
- New files created: 1
- Files appended: 1
- Duplicates skipped: 1

## Handoff

Ready for `wiki-compile`:
- raw/projects/frontend-handbook/procedure/react-patterns.md
- raw/projects/my-service/troubleshooting/memory-leak.md (updated)
```

---

## File Structure Reference

### Inbox Entry Format (Input)

```markdown
---
type: log | note | procedure | troubleshooting  # Optional hint
source: chat | file | snippet | command
created: YYYY-MM-DD
project: <project-name>  # Optional
tags: [tag1, tag2]  # Optional
---

# <title>

<content>
```

### Raw File Format (Output)

```
raw/
├── projects/
│   └── <project-slug>/
│       ├── log/
│       ├── procedure/
│       ├── troubleshooting/
│       └── note/
├── topics/
│   └── <topic-slug>/
│       ├── log/
│       ├── procedure/
│       ├── troubleshooting/
│       └── note/
└── unclassified/
    └── general/
        ├── log/
        ├── procedure/
        ├── troubleshooting/
        └── note/
08-Assets/
├── <image1.png>
├── <image2.jpeg>
└── <image3.webp>
```

---

## Tools to Use

| Tool | Purpose | When |
|------|---------|------|
| `listDirectory` | Scan inbox and raw directories | Step 1, Step 3 |
| `readFile` | Read inbox entries and existing raw files | Step 1, Step 6b |
| `writeFile` | Create or append to raw files | Step 6 |
| `mcp__obsidian-mcp-tools__search_vault_smart` | Semantic search for duplicates | Step 3 |

---

## Examples

### Example 1: New Procedure

**Input:** `inbox/2026-05-12-git-workflow.md`

```markdown
---
type: procedure
source: chat
created: 2026-05-12
---

# Git 分支管理流程

1. 从 main 创建 feature 分支
2. 开发完成后提交 PR
3. Code review 通过后合并
```

**Process:**
1. Type: procedure (has numbered steps)
2. Search: "git 分支管理 workflow" → no similar results
3. Decision: `new`
4. Domain: `topics/git`
5. Write: `raw/topics/git/procedure/git-分支管理流程.md`

### Example 2: Append to Troubleshooting

**Input:** `inbox/2026-05-12-memory-fix.md`

```markdown
---
type: troubleshooting
source: debug
created: 2026-05-12
---

# 内存泄漏修复

发现 Worker 进程内存持续增长，原因是连接未正确关闭。
解决方案：在 finally 块中显式关闭连接。
```

**Process:**
1. Type: troubleshooting (problem + solution)
2. Domain: `projects/my-service`
3. Search: "内存泄漏 worker" → found `raw/projects/my-service/troubleshooting/memory-leak.md`
4. Compare: Same issue, new solution
5. Decision: `append`
6. Append new solution section to existing file

### Example 3: Duplicate Detection

**Input:** `inbox/2026-05-12-react-hooks.md`

```markdown
# React Hooks 基础

useState 和 useEffect 是最常用的两个 Hook...
```

**Process:**
1. Type: note
2. Domain: `topics/react`
3. Search: "react hooks" → found `raw/topics/react/note/react-hooks.md` with 90%+ overlap
4. Decision: `existing`
5. Skip, log as duplicate

### Example 4: Software Tutorial With Images

**Input:** `inbox/2026-05-12-obsidian-plugin-install.md`

```markdown
# Obsidian 插件安装

1. 打开设置
2. 进入 Community plugins

![[obsidian-settings.png]]
```

**Process:**
1. Type: procedure
2. Domain: `topics/obsidian`
3. Decision: `new`
4. Write: `raw/topics/obsidian/procedure/obsidian-插件安装.md`
5. Image `obsidian-settings.png` already in `08-Assets/` → skip copy
6. Image reference remains `![[obsidian-settings.png]]`

### Example 5: Markdown Image References Normalized

**Input:** `inbox/2026-05-12-nsfc-paper.md`

```markdown
# NSFC 申请书

![](宽角域隐身_image00001.jpeg)

![](宽角域隐身_image00002.jpeg)
```

**Process:**
1. Type: note
2. Domain: `projects/nsfc-rf-ic-2026`
3. Decision: `new`
4. Write: `raw/projects/nsfc-rf-ic-2026/note/nsfc-申请书.md`
5. Normalize image references: `![](宽角域隐身_image00001.jpeg)` → `![[image00001.jpeg]]`
6. Copy `image00001.jpeg`, `image00002.jpeg` to `08-Assets/` (if not already there)
7. If `image00001.jpeg` already exists in `08-Assets/` from another source → rename to `nsfc-image00001.jpeg`

---

## Quality Principles

1. **Conservative on `existing`** — Only skip if truly redundant
2. **Prefer `append` over `new`** — Related knowledge should be together
3. **Log all decisions** — Transparency enables debugging
4. **Size targets are guidelines** — Content quality > strict limits
5. **Preserve context** — When splitting or merging, keep essential context
6. **Keep domains stable** — Prefer reusing an existing project/topic slug over inventing near-duplicates

---

## Error Handling

| Error | Action |
|-------|--------|
| Inbox directory not found | Create it, report empty inbox |
| Cannot read inbox file | Log error, skip file, continue |
| Cannot write to raw | Log error, report failure |
| Search tool unavailable | Fall back to filename comparison |
| Existing raw file corrupted | Log warning, create new file |
| Referenced image missing in inbox | Log warning, keep `![[filename]]` reference, do not invent fake paths |
| Image filename collision in 08-Assets/ | Prepend domain prefix (e.g., `xbr818d-filename.png`) |
| Domain unclear | Use `raw/unclassified/general/` and report the ambiguity |

---

## Completion Checklist

- [ ] All inbox files processed
- [ ] Decision made for each entry
- [ ] Raw files written (new or appended)
- [ ] Decision log generated
- [ ] Original inbox files remain (do not delete)
- [ ] Report provided to user
