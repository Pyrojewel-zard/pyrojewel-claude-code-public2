---
name: wiki-crystallize
description: |
  Turn useful but unstable material into reusable structured knowledge.
  Promote logs, notes, and review candidates into stable procedures,
  troubleshooting guides, and claims. Use this skill whenever the user says
  "crystallize", "promote", "make reusable", "formalize", or when review items
  need to be resolved into permanent knowledge. Also trigger when patterns
  emerge from repeated logs or notes.
trigger:
  - "crystallize"
  - "promote knowledge"
  - "知识结晶"
  - "make reusable"
  - "formalize"
---

# wiki-crystallize

Transform unstable material into stable, reusable knowledge artifacts. This skill is
**fully self-contained** — follow these instructions to execute the complete workflow.

## Overview

```
Unstable content → [wiki-crystallize] → Stable wiki pages
     ↓                                      ↓
- Logs                              - Procedures
- Notes                              - Troubleshooting guides
- Review items                       - Claims
                                     - Entities/Concepts
```

**Pipeline position:** `capture → inbox-prepare → compile → crystallize → query`

---

## Execution Steps

### Step 1: Identify Crystallization Candidates

Scan for content that should be formalized:

#### 1a. Review Items

Read review queue or `wiki/.review/` for:
- `missing-page` items that have been addressed
- `suggestion` items ready for implementation
- `confirm` items needing formalization

#### 1b. Repeated Patterns

Scan `raw/log/` and `raw/note/` for:
- Same procedure mentioned 3+ times
- Same troubleshooting solution appearing repeatedly
- Same concept explained multiple ways

#### 1c. High-Value Notes

Identify notes with:
- Multiple inbound references
- Useful but buried in `raw/note/`
- Content that should be queryable

---

### Step 2: Analyze Each Candidate

For each candidate, determine:

#### 2a. Content Type

| Source | Target Type | Condition |
|--------|-------------|-----------|
| Log with repeated steps | `procedure` | Steps appear 3+ times |
| Note solving a problem | `troubleshooting` | Clear problem-solution structure |
| Repeated assertion | `claim` | Verifiable statement |
| Draft concept | `concept` | Stable definition |
| Draft entity | `entity` | Multiple references |

#### 2b. Reusable Core

Extract the essential, reusable part:
- Remove project-specific context (for procedures)
- Generalize specific instances (for troubleshooting)
- Identify the core assertion (for claims)

#### 2c. Prerequisites and Context

For procedures and troubleshooting:
- What knowledge is assumed?
- What tools/dependencies are needed?
- What are common pitfalls?

---

### Step 2.5: ⚠️ User Confirmation Checkpoint (IMPORTANT)

**Before generating artifacts, confirm with user:**

When processing multiple candidates (≥3), pause and ask:

```
Found N crystallization candidates:
- [Candidate 1] → procedure
- [Candidate 2] → troubleshooting
- [Candidate 3] → entity

Proceed with all? Or select specific ones?
```

**Why this checkpoint matters:**
- Prevents unwanted formalization of trivial content
- Allows user to prioritize which content to crystallize first
- Avoids creating duplicate pages when similar content exists

**Skip checkpoint only when:**
- Single candidate (auto-proceed)
- User explicitly requested "crystallize all"
- Running in automated/batch mode with prior approval

---

### Step 3: Generate Artifact

Create the appropriate artifact type:

#### 3a. Procedure Format

```markdown
---
type: procedure
title: "<action> <object>"
created: YYYY-MM-DD
tags: [how-to, <domain>]
sources: ["<origin files>"]
---

# <title>

## Prerequisites

- <requirement 1>
- <requirement 2>

## Steps

1. **<step 1 title>**
   <step 1 details>

2. **<step 2 title>**
   <step 2 details>

3. **<step 3 title>**
   <step 3 details>

## Notes

- <important consideration>
- <common pitfall>

## Related

- [[<related procedure>]]
- [[<related concept>]]
```

#### 3b. Troubleshooting Format

```markdown
---
type: troubleshooting
title: "Fix: <problem description>"
created: YYYY-MM-DD
tags: [debug, <domain>]
sources: ["<origin files>"]
---

# Fix: <problem>

## Symptoms

- <observable behavior 1>
- <observable behavior 2>

## Cause

<root cause explanation>

## Solution

1. <fix step 1>
2. <fix step 2>
3. <fix step 3>

## Prevention

- <how to avoid this issue>

## Related

- [[<related troubleshooting>]]
- [[<related concept>]]
```

#### 3c. Claim Format

```markdown
---
type: claim
title: "<assertion>"
created: YYYY-MM-DD
tags: [fact, <domain>]
evidence: ["<source>"]
---

# <assertion>

## Statement

<the claim in clear terms>

## Evidence

- <supporting evidence 1>
- <supporting evidence 2>

## Context

<when/where this applies>

## Limitations

<exceptions or counter-evidence>

## Related

- [[<related claim>]]
- [[<related concept>]]
```

---

### Step 4: Check for Existing Pages

Before writing:

1. Search `wiki/<type>/` for similar content
2. Use `mcp__obsidian-mcp-tools__search_vault_smart`:
   ```json
   {
     "query": "<main keywords>",
     "filter": { "folders": ["wiki/"], "limit": 10 }
   }
   ```

**Decision:**
- **Exact match exists:** Skip, update source references instead
- **Similar exists:** Consider merging or cross-referencing
- **No match:** Proceed with new page

---

### Step 5: Write Crystallized Page

Create file at `wiki/<type>/<slug>.md`:

**Slug generation:**
- Procedures: `<action>-<object>` (e.g., `deploy-application`)
- Troubleshooting: `fix-<issue>` (e.g., `fix-memory-leak`)
- Claims: `<topic>-<aspect>` (e.g., `api-rate-limits`)

---

### Step 6: Update References

#### 6a. Add Wikilinks to Source Pages

Edit source files (logs, notes) to reference new page:

```markdown
<!-- Original content -->

> **Crystallized as:** [[<new-page-name>]]
```

#### 6b. Update Wiki Index

Add entry to `wiki/index.md` under appropriate section.

#### 6c. Resolve Review Items

Mark related review items as resolved:
- Update status in review store
- Add resolution note

---

### Step 7: Archive Source (Optional)

If source is now superseded:

1. Move from `raw/note/` to `raw/archive/`
2. Or add frontmatter: `crystallized: true`
3. Keep for historical reference

---

### Step 8: Report Results

```markdown
# Crystallization Report

**Processed:** YYYY-MM-DD HH:mm

## Pages Created

| Type | Title | Source |
|------|-------|--------|
| procedure | Deploy Application | raw/log/project/2026-05-10.md |
| troubleshooting | Fix Memory Leak | raw/note/2026-05-11.md |

## Review Items Resolved

- "Document deployment process" → [[deploy-application]]
- "Memory leak solution" → [[fix-memory-leak]]

## Statistics

- Candidates analyzed: 5
- Pages created: 2
- Review items resolved: 2
- Sources archived: 1
```

---

## Tools to Use

| Tool | Purpose |
|------|---------|
| `readFile` | Read candidates and existing pages |
| `writeFile` | Write crystallized pages |
| `listDirectory` | Scan directories |
| `mcp__obsidian-mcp-tools__search_vault_smart` | Find similar existing pages |

---

## Promotion Decision Matrix

| Source Pattern | Target | Threshold |
|----------------|--------|-----------|
| Same steps in 3+ logs | procedure | 3 occurrences |
| Problem-solution in note | troubleshooting | 1 clear case |
| Assertion repeated 2+ times | claim | 2 occurrences |
| Concept defined in note | concept | Multiple references |
| Entity mentioned 3+ times | entity | 3 references |

---

## Examples

### Example 1: Log to Procedure

**Source:** `raw/log/project/2026-05-10-deployment.md`

```markdown
# Deployment Session

Today deployed the app:
1. Build the bundle: npm run build
2. Upload to server: scp dist/ server:/app
3. Restart service: systemctl restart app

Had to fix permissions first...
```

**Crystallized:** `wiki/procedures/deploy-application.md`

```markdown
---
type: procedure
title: "Deploy Application"
created: 2026-05-12
tags: [how-to, deployment]
---

# Deploy Application

## Prerequisites

- Build environment configured
- Server access (SSH)
- Appropriate permissions

## Steps

1. **Build Production Bundle**
   ```bash
   npm run build
   ```

2. **Upload to Server**
   ```bash
   scp dist/ server:/app
   ```

3. **Restart Service**
   ```bash
   systemctl restart app
   ```

## Notes

- Verify permissions before deployment
- Check logs after restart
```

### Example 2: Note to Troubleshooting

**Source:** `raw/note/2026-05-11-memory-fix.md`

```markdown
# Memory Leak Debug

Worker process memory kept growing.
Found: connections not closed in finally block.
Fixed by adding explicit close.
```

**Crystallized:** `wiki/troubleshooting/fix-memory-leak-worker.md`

```markdown
---
type: troubleshooting
title: "Fix: Worker Memory Leak"
created: 2026-05-12
tags: [debug, memory, worker]
---

# Fix: Worker Memory Leak

## Symptoms

- Worker process memory continuously grows
- Process eventually crashes with OOM

## Cause

Database connections not properly closed when errors occur.

## Solution

Always close connections in `finally` block:

```javascript
try {
  const conn = await getConnection();
  // ... work
} finally {
  conn?.close();
}
```

## Prevention

- Use connection pooling
- Always implement cleanup in finally blocks
```

---

## Quality Principles

1. **Extract reusable core** — Remove project-specific details
2. **Add context** — Prerequisites, pitfalls, prevention
3. **Cross-reference** — Link to related wiki pages
4. **Preserve attribution** — Note source files
5. **Conservative promotion** — Don't over-formalize trivial content

---

## Error Handling

| Error | Action |
|-------|--------|
| Cannot read source | Log error, skip candidate |
| Similar page exists | Consider merging instead |
| Cannot write page | Log error, report failure |
| Source too vague | Skip, note in report |

---

## Completion Checklist

- [ ] Candidates identified
- [ ] Content analyzed
- [ ] Target types determined
- [ ] Pages generated
- [ ] Existing pages checked
- [ ] Pages written
- [ ] References updated
- [ ] Review items resolved
- [ ] Report provided
