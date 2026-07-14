---
name: wiki-lint
description: |
  Health-check the wiki for structural and semantic issues. Find contradictions,
  missing pages, broken links, duplicates, and stale structures. Use this skill
  whenever the user wants to audit wiki quality, says "lint wiki", "check health",
  "audit wiki", "find issues", "validate wiki", or for periodic maintenance.
trigger:
  - "lint wiki"
  - "wiki健康检查"
  - "check wiki health"
  - "audit wiki"
  - "validate wiki"
---

# wiki-lint

Health-check the wiki for issues and generate maintenance suggestions. This skill is
**fully self-contained** — follow these instructions to execute the complete workflow.

## Overview

```
wiki/ → [wiki-lint] → Lint Report
              ↓
       - Structural issues (orphan pages, broken links)
       - Semantic issues (contradictions, stale content)
       - Maintenance suggestions
       - Crystallization candidates
```

---

## Execution Steps

### Step 1: Scan Wiki Structure

#### 1a. List All Pages

Use `listDirectory` to scan `wiki/` recursively.

Collect all `.md` files, excluding:
- `index.md` (index page)
- `log.md` (activity log)

#### 1b. Build Page Index

For each page:
- Read content
- Extract frontmatter (type, title, created, tags)
- Extract wikilinks `[[link]]`
- Record file path

---

### Step 2: Structural Lint

#### 2a. Check Orphan Pages

Find pages with no inbound links:

```
For each page P:
  inbound_count = count of pages that link to P
  if inbound_count == 0:
    report orphan
```

**Note:** Case-insensitive matching for wikilinks.

#### 2b. Check Broken Links

Find wikilinks to non-existent pages:

```
For each page P:
  for each wikilink L in P:
    if L.target does not exist:
      report broken link in P
```

#### 2c. Check Connectivity

Find pages with no outbound links:

```
For each page P:
  if P has no wikilinks:
    report no-outlinks
```

---

### Step 3: Semantic Lint (Optional)

Requires LLM. Skip if not available.

#### 3a. Build Page Summaries

For each page:
- Extract frontmatter
- Take first 500 characters
- Create summary: `### <path>\n<preview>`

#### 3b. LLM Analysis

Prompt:
```
You are a wiki quality analyst. Review the following wiki page summaries and identify issues.

For each issue, output:
---LINT: type | severity | Short title---
Description of the issue.
PAGES: page1.md, page2.md
---END LINT---

Types:
- contradiction: conflicting claims
- stale: outdated information
- missing-page: heavily referenced but no dedicated page
- suggestion: question or source worth adding

Severities:
- warning: should be addressed
- info: nice to have

Only report genuine issues. Do not invent problems.

## Wiki Pages

<page summaries>
```

#### 3c. Parse LLM Results

Extract `---LINT---` blocks and parse:
- type
- severity
- title
- description
- affected pages

---

### Step 4: Generate Report

#### 4a. Group by Type

Organize issues:

| Type | Severity | Description |
|------|----------|-------------|
| orphan | info | No inbound links |
| broken-link | warning | Link to non-existent page |
| no-outlinks | info | No outbound links |
| contradiction | warning | Conflicting claims |
| stale | info | Outdated information |
| missing-page | info | Referenced but no page |
| suggestion | info | Worth adding |

#### 4b. Sort by Severity

Warnings first, then info.

#### 4c. Add Recommendations

For each issue type, suggest action:

| Issue | Recommendation |
|-------|----------------|
| orphan | Add links from related pages, or consider removing |
| broken-link | Create missing page or fix link |
| no-outlinks | Add links to related concepts |
| contradiction | Review and resolve conflict |
| missing-page | Create page or use `/wiki-crystallize` |
| suggestion | Consider adding to wiki |

---

### Step 5: Identify Crystallization Candidates

From lint results, identify content ready for crystallization:

- `missing-page` items → candidates for creation
- Repeated concepts in suggestions → formalize
- Orphan procedures → integrate or remove

---

### Step 5.5: ⚠️ Lint Action Checkpoint (IMPORTANT)

**Before outputting final report, confirm with user:**

When lint finds significant issues (≥5 warnings or ≥10 total issues), pause and ask:

```
Lint Scan Complete

Found:
- W warnings (broken links, contradictions)
- I info items (orphans, missing pages)
- C crystallization candidates

Priority actions:
1. <most critical issue>
2. <second critical issue>
3. <third critical issue>

Proceed with full report? Or focus on specific issue type?
```

**Why this checkpoint matters:**
- Prevents overwhelming user with too many issues at once
- Allows prioritizing critical fixes first
- Enables focused cleanup sessions

**Skip checkpoint only when:**
- Few issues found (<5 total)
- User explicitly requested "full lint report"
- Running in automated maintenance mode

---

### Step 6: Output Report

```markdown
# Wiki Lint Report

**Generated:** YYYY-MM-DD HH:mm
**Pages scanned:** N
**Issues found:** M (W warnings, I info)

---

## Warnings

### Broken Links

| Source | Broken Link | Action |
|--------|-------------|--------|
| wiki/entities/foo.md | [[missing-concept]] | Create page or fix link |
| wiki/concepts/bar.md | [[typo-pgae]] | Fix typo |

### Contradictions

| Issue | Affected Pages |
|-------|----------------|
| "API limit is 100/min" vs "API limit is 1000/min" | wiki/entities/api.md, wiki/concepts/rate-limit.md |

---

## Info

### Orphan Pages

| Page | Suggestion |
|------|------------|
| wiki/entities/unused.md | Add links from related pages |

### Missing Pages

| Referenced As | Reference Count | Suggestion |
|---------------|-----------------|------------|
| attention-mechanism | 5 | Create concept page |

### No Outbound Links

| Page | Suggestion |
|------|------------|
| wiki/queries/research-x.md | Add links to related concepts |

---

## Crystallization Candidates

- `attention-mechanism` — referenced 5 times, consider creating
- `deployment-process` — mentioned in 3 logs, consider formalizing

---

## Statistics

| Metric | Count |
|--------|-------|
| Total pages | N |
| Orphan pages | O |
| Broken links | B |
| Contradictions | C |
| Missing pages | M |

## Next Steps

1. Fix broken links (warnings)
2. Resolve contradictions (warnings)
3. Create missing pages
4. Run `/wiki-crystallize` on candidates
```

---

## Tools to Use

| Tool | Purpose |
|------|---------|
| `listDirectory` | Scan wiki structure |
| `readFile` | Read page content |
| LLM API | Semantic analysis (optional) |

---

## Link Extraction

```python
def extract_wikilinks(content):
    links = []
    regex = r'\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]'
    for match in re.finditer(regex, content):
        links.append(match.group(1).strip())
    return links
```

---

## Page Existence Check

```python
def page_exists(link, slug_map):
    normalized = link.lower()
    # Check exact match
    if normalized in slug_map:
        return True
    # Check with hyphens
    if normalized.replace(' ', '-') in slug_map:
        return True
    return False
```

---

## Examples

### Example 1: Structural Lint Only

**Input:** User says "lint the wiki"

**Process:**
1. Scan all wiki pages
2. Build link graph
3. Find orphans, broken links, no-outlinks
4. Generate report

**Output:**
```markdown
# Wiki Lint Report

**Generated:** 2026-05-12 14:30
**Pages scanned:** 45
**Issues found:** 8 (2 warnings, 6 info)

## Warnings

### Broken Links

| Source | Broken Link |
|--------|-------------|
| wiki/entities/api.md | [[rate-limt]] | Typo? Should be [[rate-limit]] |

## Info

### Orphan Pages

| Page |
|------|
| wiki/entities/legacy-system.md |

### Missing Pages

| Referenced As | Count |
|---------------|-------|
| authentication-flow | 3 |
```

### Example 2: Full Lint with Semantics

**Input:** User says "check wiki health including contradictions"

**Process:**
1. Structural lint
2. LLM semantic analysis
3. Find contradictions and stale content
4. Generate comprehensive report

---

## Quality Principles

1. **Conservative on semantic issues** — Avoid false positives
2. **Actionable recommendations** — Every issue should have a suggested fix
3. **Prioritize warnings** — Address broken links and contradictions first
4. **Exclude index/log** — These are special pages
5. **Case-insensitive links** — [[Transformer]] matches transformer.md

---

## Error Handling

| Error | Action |
|-------|--------|
| Cannot read page | Skip, note in report |
| Wiki directory empty | Report "No wiki pages found" |
| LLM unavailable | Skip semantic lint, do structural only |

---

## Completion Checklist

- [ ] Wiki structure scanned
- [ ] Page index built
- [ ] Structural lint completed
- [ ] Semantic lint completed (if LLM available)
- [ ] Issues grouped and sorted
- [ ] Recommendations generated
- [ ] Crystallization candidates identified
- [ ] Report generated
