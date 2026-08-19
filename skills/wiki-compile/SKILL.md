---
name: wiki-compile
description: |
  Convert raw sources into concise, queryable wiki pages. This is the core
  compilation workflow that transforms raw content into structured wiki knowledge.
  Use this skill whenever the user says "compile", "ingest", "process sources",
  "generate wiki pages", "run ingestion", or when raw files need to be converted
  to wiki pages. Also trigger after inbox-prepare has prepared new raw files.
trigger:
  - "compile wiki"
  - "编译wiki"
  - "process sources"
  - "generate wiki pages"
  - "处理素材"
---

# wiki-compile

Convert `raw/` content into concise, queryable wiki pages. This skill is
**fully self-contained** — follow these instructions to execute the complete workflow.

## Overview

```
raw/*.md → [wiki-compile] → wiki/<type>/*.md
                   ↓
         + review items (knowledge gaps)
         + wiki/index.md updates
```

**Pipeline position:** `capture → inbox-prepare → compile → crystallize → query`

---

## Execution Steps

### Step 1: Identify Source

Receive source to compile from one of:
- Specific file path: `raw/sources/example.pdf` (or `.md` after preprocessing)
- Directory: All files in `raw/sources/`
- After `inbox-prepare`: New files in `raw/` subdirectories

**Tool:** Use `listDirectory` to scan, `readFile` to read content.

---

### Step 2: Read and Analyze Source

#### 2a. Extract Metadata

From source file:
- Filename (for slug generation)
- Directory context (folder hierarchy)
- File content

#### 2b. Detect Language

Identify primary language:
- Chinese: Contains CJK characters (一-鿿)
- English: Latin script dominant
- Mixed: Both present

**Why:** Generate output in the same language as source.

#### 2c. Identify Key Concepts

Scan content for:
- **Entities:** Names, organizations, tools, systems
- **Concepts:** Ideas, theories, patterns, methods
- **Procedures:** Steps, processes, workflows
- **Claims:** Assertions, facts, findings

#### 2d. Page Type Priority Rules

**When content matches multiple types, use this priority:**

| Priority | Type | Reason |
|----------|------|--------|
| 1 | `procedure` | Most actionable, highest query value |
| 2 | `troubleshooting` | Problem-solution pairs are high-value |
| 3 | `entity` | Specific names anchor knowledge |
| 4 | `concept` | Abstract ideas support understanding |
| 5 | `claim` | Facts support procedures |
| 6 | `source` | Summary only if no other type fits |

**Example:** Content with steps AND problem-solution → create `procedure` first, optionally create `troubleshooting` if distinct.

---

### Step 3: Generate Wiki Pages

For each identified concept, generate a wiki page.

#### 3a. Determine Page Type

| Concept Type | Indicators | Output Directory |
|--------------|------------|------------------|
| **entity** | Specific name, organization, tool, framework | `wiki/entities/` |
| **concept** | Abstract idea, theory, pattern | `wiki/concepts/` |
| **procedure** | Steps, how-to, workflow | `wiki/procedures/` |
| **troubleshooting** | Problem-solution pair | `wiki/troubleshooting/` |
| **claim** | Verifiable assertion, fact | `wiki/claims/` |
| **source** | Document summary | `wiki/sources/` |

#### 3b. Generate Page Content

Use LLM to create concise wiki page:

**Prompt template:**
```
You are creating a wiki page from source content.

Source: <filename>
Type: <page type>
Language: <detected language>

Content to process:
<source content excerpt>

Create a concise wiki page that:
1. Explains the concept clearly
2. Uses [[wikilink]] syntax to reference related concepts
3. Includes key points as bullet list
4. Is written in the same language as the source
5. Is scannable and queryable

Output format:
---
type: <type>
title: "<title>"
created: YYYY-MM-DD
sources: ["<source path>"]
tags: [<auto-detected tags>]
---

# <title>

<concise explanation>

## Key Points
- Point 1
- Point 2

## Related
- [[Related Entity]]
- [[Related Concept]]
```

#### 3c. Generate Slug

From title:
1. Lowercase
2. Replace spaces with hyphens
3. Remove special characters (keep alphanumeric, CJK, hyphens)
4. Limit to 60 characters

---

### Step 3.5: ⚠️ User Confirmation Checkpoint (IMPORTANT)

**Before writing pages, confirm with user:**

When generating multiple pages (≥3) or pages with significant scope, pause and ask:

```
Found N wiki pages to create:
- [Page 1] (type) → wiki/<type>/<slug>.md
- [Page 2] (type) → wiki/<type>/<slug>.md
- [Page 3] (type) → wiki/<type>/<slug>.md

Proceed with all? Or select specific ones?
```

**Why this checkpoint matters:**
- Prevents creating unwanted pages from low-value content
- Allows user to prioritize which pages to create first
- Avoids duplicate pages when similar content already exists

**Skip checkpoint only when:**
- Single page to create (auto-proceed)
- User explicitly requested "compile all" or "process everything"
- Running in automated/batch mode with prior approval

---

### Step 4: Write Wiki Pages

#### 4a. Check for Existing Pages

Before writing, check if page already exists:
- Use `listDirectory` to scan `wiki/<type>/`
- Compare slugs

**If exists:**
- Skip if content is truly duplicate
- Append if extends existing content
- Create with `-2` suffix if different angle

#### 4b. Write New Pages

Create file at `wiki/<type>/<slug>.md`:

```markdown
---
type: <type>
title: "<title>"
created: YYYY-MM-DD
sources: ["<source path>"]
tags: [<tags>]
related: [<wikilinks>]
---

# <title>

<content>

## Key Points
- <point 1>
- <point 2>

## Related
- [[<related page>]]
```

---

### Step 5: Update Wiki Index

Read `wiki/index.md`, add new entries:

```markdown
# Wiki Index

## Entities
- [[entity-name]] 👤 Entity Title

## Concepts
- [[concept-name]] 💡 Concept Title

## Procedures
- [[procedure-name]] 📋 Procedure Title

## Troubleshooting
- [[troubleshooting-name]] 🔧 Troubleshooting Title

## Claims
- [[claim-name]] 📌 Claim Title

## Sources
- [[source-name]] 📄 Source Title
```

**Type emojis:** entity=👤, concept=💡, procedure=📋, troubleshooting=🔧, claim=📌, source=📄

---

### Step 6: Generate Review Items

Identify knowledge gaps and create review items:

#### 6a. Missing Pages

When content references a concept without explanation:

```json
{
  "type": "missing-page",
  "title": "<referenced concept>",
  "description": "Referenced in <source> but no dedicated page exists",
  "affectedPages": ["<source page>"],
  "source": "compile"
}
```

#### 6b. Suggestions

When content could be expanded:

```json
{
  "type": "suggestion",
  "title": "<suggestion title>",
  "description": "<what could be added>",
  "affectedPages": ["<related pages>"],
  "source": "compile"
}
```

#### 6c. Contradictions

When new content conflicts with existing:

```json
{
  "type": "contradiction",
  "title": "<conflicting topic>",
  "description": "<nature of conflict>",
  "affectedPages": ["<page 1>", "<page 2>"],
  "source": "compile"
}
```

---

### Step 7: Generate Embeddings (Optional)

If embedding system is available:
- Create vector embeddings for each new page
- Enable semantic search

**Tool:** Use embedding API if configured.

---

### Step 8: Report Results

```markdown
# Compile Report

**Source:** raw/sources/example.pdf
**Processed:** YYYY-MM-DD HH:mm

## Pages Created

| Type | Title | Path |
|------|-------|------|
| entity | Example Entity | wiki/entities/example-entity.md |
| concept | Example Concept | wiki/concepts/example-concept.md |

## Review Items

| Type | Title | Action Needed |
|------|-------|---------------|
| missing-page | Related Concept | Create page or link to existing |

## Statistics

- Pages created: 2
- Review items: 1
- Index updated: ✅
```

---

## Tools to Use

| Tool | Purpose |
|------|---------|
| `readFile` | Read source content |
| `writeFile` | Write wiki pages |
| `listDirectory` | Scan directories, check existing pages |
| LLM API | Generate page content |
| Embedding API | Create vector embeddings (optional) |

---

## Page Type Detection Heuristics

```python
def detect_page_type(title, content):
    title_lower = title.lower()
    content_lower = content.lower()

    # Entity: specific names
    if any(word in title_lower for word in ['公司', 'organization', 'team', '工具', 'tool', '框架', 'framework']):
        return 'entity'

    # Procedure: steps
    if any(word in content_lower for word in ['步骤', 'step', '如何', 'how to', '教程', 'tutorial']):
        return 'procedure'

    # Troubleshooting: problems
    if any(word in content_lower for word in ['问题', 'error', '错误', '解决', 'solution', 'fix']):
        return 'troubleshooting'

    # Claim: assertions
    if any(word in content_lower for word in ['认为', 'believe', '证明', 'prove', '研究表明']):
        return 'claim'

    # Concept: abstract ideas (default for technical content)
    if any(word in title_lower for word in ['概念', 'concept', '理论', 'theory', '模式', 'pattern']):
        return 'concept'

    # Source: document summary (default)
    return 'source'
```

---

## Examples

### Example 1: Compile a PDF Source

**Input:** `raw/sources/research-paper.pdf` (preprocessed to `.md`)

**Process:**
1. Read preprocessed markdown
2. Detect language: English
3. Identify concepts: "Attention Mechanism", "Transformer Architecture"
4. Generate pages:
   - `wiki/concepts/attention-mechanism.md`
   - `wiki/entities/transformer-architecture.md`
5. Update index
6. Generate review item: "Missing page: Self-Attention"

### Example 2: Compile Raw Procedure

**Input:** `raw/procedure/git-workflow.md`

**Process:**
1. Read content
2. Detect language: Chinese
3. Type: procedure (already classified)
4. Generate: `wiki/procedures/git-workflow.md`
5. Cross-reference with existing git-related pages
6. Update index

---

## Quality Principles

1. **Concise pages** — Wiki pages should be scannable
2. **Cross-reference** — Use [[wikilinks]] liberally
3. **Preserve sources** — Always attribute origin
4. **Language consistency** — Output in source language
5. **Conservative on pages** — Prefer merging related concepts

---

## Error Handling

| Error | Action |
|-------|--------|
| Cannot read source | Log error, skip file |
| LLM generation fails | Retry once, then log error |
| Cannot write page | Log error, continue with other pages |
| Page already exists | Skip or append based on content |

---

## Completion Checklist

- [ ] Source content read
- [ ] Key concepts identified
- [ ] Wiki pages generated
- [ ] Pages written to correct directories
- [ ] Wiki index updated
- [ ] Review items generated
- [ ] Report provided to user
