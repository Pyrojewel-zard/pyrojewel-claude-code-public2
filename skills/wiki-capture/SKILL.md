---
name: wiki-capture
description: |
  Capture user-provided content into the inbox directory for later processing.
  Use this skill whenever the user wants to save chat transcripts, session notes,
  project snippets, command outputs, or any raw material into the knowledge base.
  Triggers on phrases like "save this to wiki", "capture this conversation",
  "add to inbox", "save session", "remember this", or when user provides content
  that should be preserved for later knowledge processing.
trigger:
  - "capture this"
  - "add to inbox"
  - "保存到收件箱"
  - "save session"
  - "remember this"
---

# wiki-capture

Capture raw user material into `inbox/` with lightweight metadata. This skill is
**fully self-contained** — follow these instructions to execute the complete workflow.

## Overview

```
User content → [wiki-capture] → inbox/YYYY-MM-DD-<slug>.md
```

**Pipeline position:** `capture → inbox-prepare → compile → crystallize → query`

---

## Execution Steps

### Step 1: Accept Content

Receive content from one of these sources:

| Source Type | How to Identify |
|-------------|-----------------|
| Chat text | User says "save this conversation" or "capture this" |
| Session notes | User provides meeting/session summary |
| Code snippet | User shares code with "save this" intent |
| Command output | User shares terminal output or logs |
| File content | User drops or references a file |

---

### Step 2: Normalize Content

Transform input into standardized markdown:

#### 2a. For Chat/Session Text

1. Extract the key content (not the "save this" instruction)
2. Identify the main topic or title
3. Preserve the original text structure
4. Do NOT summarize — keep original content

#### 2b. For Code Snippets

Wrap in appropriate code blocks:

````markdown
```<language>
<code content>
```
````

Add context about what the code does.

#### 2c. For Command Output

Wrap in code block with context:

````markdown
```bash
<command output>
```
````

Note the command that produced this output.

#### 2d. For Files

1. Read file content
2. Convert to markdown if needed
3. Preserve original formatting where possible

---

### Step 3: Infer Metadata

#### 3a. Detect Content Type Hint

| Pattern | Type Hint |
|---------|-----------|
| Date + project context | `log` |
| Steps, "how to", numbered list | `procedure` |
| Error, problem, fix, solution | `troubleshooting` |
| None of above | `note` |

#### 3b. Detect Source

| Input | Source Value |
|-------|--------------|
| Chat conversation | `chat` |
| Dropped file | `file` |
| Code snippet | `snippet` |
| Command output | `command` |

#### 3c. Extract Tags

Identify key concepts, technologies, project names:
- Technical terms (React, Python, Docker, etc.)
- Project names
- Domain keywords

#### 3d. Detect Project

If content mentions a specific project, extract project name.

---

### Step 4: Generate Filename

Format: `inbox/YYYY-MM-DD-<slug>.md`

**Slug generation:**
1. Use main topic/title
2. Lowercase
3. Replace spaces with hyphens
4. Remove special characters (keep alphanumeric, CJK, hyphens)
5. Limit to 50 characters

**Example:** "React Hooks Discussion" → `inbox/2026-05-12-react-hooks-discussion.md`

**Handle collisions:** If file exists, append `-2`, `-3`, etc.

---

### Step 5: Build Frontmatter

```yaml
---
type: <log|procedure|troubleshooting|note>
source: <chat|file|snippet|command>
created: YYYY-MM-DD
project: <project-name>  # Optional, for logs
tags: [tag1, tag2, tag3]
---
```

---

### Step 6: Write Inbox File

Create file with this structure:

```markdown
---
type: <type>
source: <source>
created: YYYY-MM-DD
project: <project>  # Optional
tags: [<tags>]
---

# <title>

<normalized content>

<!--
Captured from: <source description>
Captured on: YYYY-MM-DD HH:mm
Original length: <N> characters
-->
```

---

### Step 6.5: ⚠️ Capture Preview Checkpoint

**Before finalizing, show preview:**

When content is substantial (>500 characters), show brief preview:

```
Capture Preview:
- File: inbox/<filename>.md
- Type: <type>
- Tags: <tags>
- Preview: <first 100 chars>...

Save to inbox? [Y/n]
```

**Why this checkpoint matters:**
- Confirms correct metadata inference
- Allows user to adjust tags or type before saving
- Prevents saving with wrong filename

**Skip checkpoint only when:**
- Short content (<200 characters)
- User explicitly requested "capture this" without preview

---

### Step 7: Confirm Capture

Report to user:
- File created: `inbox/<filename>`
- Content type: `<type>`
- Size: `<N> characters`
- Next step: "Ready for `inbox-prepare` to process"

---

## Tools to Use

| Tool | Purpose |
|------|---------|
| `writeFile` | Create inbox file |
| `listDirectory` | Check for filename collisions |
| `readFile` | Read dropped file content (if applicable) |

---

## Output Format

### Success Response

```markdown
✅ Captured to: inbox/2026-05-12-react-hooks.md

**Type:** procedure
**Source:** chat
**Size:** 1,234 characters

Ready for `/inbox-prepare` to process into raw files.
```

### File Structure

```
inbox/
├── 2026-05-12-react-hooks.md
├── 2026-05-12-debug-session.md
└── 2026-05-12-meeting-notes.md
```

---

## Examples

### Example 1: Chat Transcript

**User says:** "Save this conversation about React hooks"

**Process:**
1. Extract conversation content
2. Type hint: `procedure` (contains how-to info)
3. Source: `chat`
4. Tags: `[react, hooks, frontend]`
5. Filename: `inbox/2026-05-12-react-hooks.md`

**Output file:**
```markdown
---
type: procedure
source: chat
created: 2026-05-12
tags: [react, hooks, frontend]
---

# React Hooks Discussion

<User's conversation content>

<!--
Captured from: chat session
Captured on: 2026-05-12 14:30
Original length: 2,456 characters
-->
```

### Example 2: Debug Log

**User provides:** Terminal output showing an error

**Process:**
1. Wrap in code block
2. Type hint: `troubleshooting`
3. Source: `command`
4. Tags: `[debug, error, <technology>]`

**Output file:**
```markdown
---
type: troubleshooting
source: command
created: 2026-05-12
tags: [debug, error, docker]
---

# Docker Container Error Log

```bash
Error: Container failed to start...
```

Context: Attempting to start the development container.

<!--
Captured from: terminal output
Captured on: 2026-05-12 09:15
Original length: 567 characters
-->
```

### Example 3: Dropped File

**User drops:** `project-notes.md`

**Process:**
1. Read file content
2. Detect type from content
3. Source: `file`
4. Preserve original formatting

---

## Quality Principles

1. **Preserve original content** — Do not summarize or rewrite
2. **Accurate type hints** — Help downstream `inbox-prepare`
3. **Useful tags** — Enable future search
4. **Unique filenames** — Never overwrite existing files
5. **Clear context** — Include capture metadata in comments

---

## Error Handling

| Error | Action |
|-------|--------|
| Cannot write to inbox | Report error, suggest manual save |
| Filename collision | Append counter (-2, -3, etc.) |
| Content too large | Split into multiple files with clear naming |
| Cannot detect type | Default to `note` |

---

## Completion Checklist

- [ ] Content normalized to markdown
- [ ] Metadata inferred (type, source, tags)
- [ ] Unique filename generated
- [ ] File written to `inbox/`
- [ ] User confirmation provided
- [ ] Original content preserved (not modified)
