---
title: Superpowers Output Governance
date: 2026-06-04
status: completed
completed-date: 2026-06-05
---

# Superpowers Output Governance Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a lightweight governance layer for Superpowers-generated spec/plan docs so they remain discoverable, non-dense, and easy to manage — without deleting any existing files.

**Architecture:** Add an index file (`docs/superpowers/README.md`) as the single entry point for all specs/plans, a naming/status convention enforced by convention (not code), and a small shell verification script. Add a policy doc to `references/` so the convention is part of the canonical project docs.

**Tech Stack:** Markdown, shell (`rg`, `find`), Git

---

## Problem Statement

`$superpowers:brainstorming` and `$superpowers:writing-plans` generate markdown files under `docs/superpowers/specs/` and `docs/superpowers/plans/`. Over time these accumulate, become dense, and lack any discoverability layer. There is no index, no status tracking, and no convention for when a plan is superseded or completed.

Current state (2026-06-04):
- `docs/superpowers/plans/` contains 5 plan files (2026-06-01 through 2026-06-02)
- `docs/superpowers/specs/` does not yet exist but will appear when brainstorming is used
- No index or README exists in `docs/superpowers/`
- No convention links these generated docs to the canonical project docs in `references/`

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Index file | `docs/superpowers/README.md` | Single entry point; lives alongside the content it indexes |
| Policy doc | `references/workflow-output-policy.md` | AGENTS.md declares `references/` as canonical; policy belongs there |
| Status convention | YAML frontmatter `status:` field | Machine-greppable, no extra tooling needed |
| Archive convention | Move superseded files to `docs/superpowers/archive/` | Keeps active directory small; files are not deleted |
| Verification | Shell script `tools/verify-superpowers-index.sh` | `rg`/`find` based; no Python dependency; CI-friendly |
| No deletion | Existing files stay in place | Task constraint; migration only adds frontmatter |

---

## File Structure

```
docs/superpowers/
  README.md                                    ← NEW: index of all specs/plans
  plans/
    2026-06-01-pyrojewel-paper-flow.md         ← EXISTING: add frontmatter
    2026-06-02-active-flow-inventory.md        ← EXISTING: add frontmatter
    2026-06-02-ecc-adaptation-inventory.md     ← EXISTING: add frontmatter
    2026-06-02-skill-map-completion.md         ← EXISTING: add frontmatter
    2026-06-02-wiki-knowledge-line.md          ← EXISTING: add frontmatter
  specs/                                        ← FUTURE: brainstorming output
  archive/                                      ← NEW: superseded/completed docs

references/
  workflow-output-policy.md                     ← NEW: governance policy

tools/
  verify-superpowers-index.sh                   ← NEW: verification script
```

---

## Constants & Conventions

### Status Values

| Status | Meaning | Action |
|--------|---------|--------|
| `draft` | Newly generated, not yet reviewed | Keep in `plans/` or `specs/` |
| `active` | Currently being implemented or in use | Keep in `plans/` or `specs/` |
| `completed` | Implementation done, doc is historical | Move to `archive/` |
| `superseded` | Replaced by a newer plan/spec | Move to `archive/`, link to replacement |
| `abandoned` | No longer relevant | Move to `archive/` |

### Required Frontmatter for New Files

Every new file in `docs/superpowers/specs/` or `docs/superpowers/plans/` must include:

```yaml
---
title: {human-readable title}
date: {YYYY-MM-DD}
status: completed
completed-date: 2026-06-05
superseded-by: {filename}  # only if status=superseded
---
```

### Naming Convention

```
{YYYY-MM-DD}-{kebab-case-slug}.md
```

Date prefix ensures chronological sort. Slug is 3-6 words, lowercase, hyphen-separated.

---

### Task 1: Create `docs/superpowers/README.md` Index

**Files:**
- Create: `docs/superpowers/README.md`

- [ ] **Step 1: Create the index file**

```markdown
# Superpowers Output Index

Auto-generated and hand-maintained index of all spec and plan documents produced by `$superpowers:brainstorming` and `$superpowers:writing-plans`.

Governance policy: `references/workflow-output-policy.md`

## Active Plans

| Date | Title | Status | File |
|------|-------|--------|------|
| 2026-06-01 | Pyrojewel Paper Flow | active | [plans/2026-06-01-pyrojewel-paper-flow.md](plans/2026-06-01-pyrojewel-paper-flow.md) |
| 2026-06-02 | Active Flow Inventory | active | [plans/2026-06-02-active-flow-inventory.md](plans/2026-06-02-active-flow-inventory.md) |
| 2026-06-02 | ECC Adaptation Inventory | active | [plans/2026-06-02-ecc-adaptation-inventory.md](plans/2026-06-02-ecc-adaptation-inventory.md) |
| 2026-06-02 | Skill Map Completion | active | [plans/2026-06-02-skill-map-completion.md](plans/2026-06-02-skill-map-completion.md) |
| 2026-06-02 | Wiki Knowledge Line | active | [plans/2026-06-02-wiki-knowledge-line.md](plans/2026-06-02-wiki-knowledge-line.md) |

## Active Specs

_No specs yet._

## Archive

_No archived documents yet._

---

## Maintenance

When a new spec/plan is created:
1. Add frontmatter (`title`, `date`, `status`) to the new file
2. Add a row to the appropriate table above
3. Run `bash tools/verify-superpowers-index.sh` to verify consistency

When a plan is completed or superseded:
1. Update the file's `status` frontmatter
2. Move the file to `archive/`
3. Update the table: remove from active, add to archive
4. If superseded, add `superseded-by` field linking to the replacement
```

- [ ] **Step 2: Verify file was created**

```bash
test -f docs/superpowers/README.md && echo "OK" || echo "MISSING"
```

---

### Task 2: Add Frontmatter to Existing Plan Files

**Files:**
- Modify: `docs/superpowers/plans/2026-06-01-pyrojewel-paper-flow.md`
- Modify: `docs/superpowers/plans/2026-06-02-active-flow-inventory.md`
- Modify: `docs/superpowers/plans/2026-06-02-ecc-adaptation-inventory.md`
- Modify: `docs/superpowers/plans/2026-06-02-skill-map-completion.md`
- Modify: `docs/superpowers/plans/2026-06-02-wiki-knowledge-line.md`

- [ ] **Step 1: Add frontmatter to each existing plan file**

For each file, insert a YAML frontmatter block at the very top (before the existing `#` heading), preserving all existing content below it.

**2026-06-01-pyrojewel-paper-flow.md** — insert at line 1:

```yaml
---
title: Pyrojewel Paper Flow
date: 2026-06-01
status: completed
completed-date: 2026-06-05
---
```

**2026-06-02-active-flow-inventory.md** — insert at line 1:

```yaml
---
title: Active Flow Inventory
date: 2026-06-02
status: completed
completed-date: 2026-06-05
---
```

**2026-06-02-ecc-adaptation-inventory.md** — insert at line 1:

```yaml
---
title: ECC Adaptation Inventory
date: 2026-06-02
status: completed
completed-date: 2026-06-05
---
```

**2026-06-02-skill-map-completion.md** — insert at line 1:

```yaml
---
title: Skill Map Completion
date: 2026-06-02
status: completed
completed-date: 2026-06-05
---
```

**2026-06-02-wiki-knowledge-line.md** — insert at line 1:

```yaml
---
title: Wiki Knowledge Line
date: 2026-06-02
status: completed
completed-date: 2026-06-05
---
```

- [ ] **Step 2: Verify all files have frontmatter**

```bash
for f in docs/superpowers/plans/*.md; do
  printf '%-55s ' "$f"
  head -1 "$f" | rg -q '^---' && echo "OK" || echo "MISSING FRONTMATTER"
done
```

Expected: all 5 files print `OK`.

---

### Task 3: Create Archive Directory

**Files:**
- Create: `docs/superpowers/archive/.gitkeep`

- [ ] **Step 1: Create archive directory with gitkeep**

```bash
mkdir -p docs/superpowers/archive && touch docs/superpowers/archive/.gitkeep
```

- [ ] **Step 2: Verify**

```bash
test -d docs/superpowers/archive && echo "OK" || echo "MISSING"
```

---

### Task 4: Create `references/workflow-output-policy.md`

**Files:**
- Create: `references/workflow-output-policy.md`

- [ ] **Step 1: Create the policy document**

```markdown
# Workflow Output Policy

Governance rules for generated spec and plan documents produced by Superpowers skills (`$superpowers:brainstorming`, `$superpowers:writing-plans`).

## Scope

This policy covers all files under `docs/superpowers/`:
- `specs/` — brainstorming output
- `plans/` — implementation plans
- `archive/` — completed/superseded documents

## Index

`docs/superpowers/README.md` is the single entry point. Every spec/plan must appear in its index table.

## Frontmatter Convention

Every file in `specs/` or `plans/` must have YAML frontmatter:

```yaml
---
title: {human-readable title}
date: {YYYY-MM-DD}
status: completed
completed-date: 2026-06-05
superseded-by: {filename}  # only if status=superseded
---
```

## Lifecycle

1. **Creation**: Skill generates file with `status: draft`. Add row to README.md index.
2. **Activation**: When implementation begins, change `status` to `active`.
3. **Completion**: When done, change `status` to `completed`, move to `archive/`, update index.
4. **Supersession**: If a new plan replaces an old one, set old to `status: superseded`, add `superseded-by`, move to `archive/`, update index.
5. **Abandonment**: If no longer relevant, set `status: abandoned`, move to `archive/`, update index.

## Naming

```
{YYYY-MM-DD}-{kebab-case-slug}.md
```

Date prefix for chronological sort. Slug: 3-6 words, lowercase, hyphens.

## Verification

Run after any change to `docs/superpowers/`:

```bash
bash tools/verify-superpowers-index.sh
```

## Relationship to Canonical Docs

Per `AGENTS.md`, canonical project docs are `CLAUDE.md`, `AGENTS.md`, `README.md`, `SETUP.md`, and `references/*`. This policy file is canonical. The `docs/superpowers/` directory is **generated output** — it is useful for coordination but is not canonical project memory. Do not hand-maintain it as project guidance; maintain only the index and frontmatter for discoverability.
```

- [ ] **Step 2: Verify file exists**

```bash
test -f references/workflow-output-policy.md && echo "OK" || echo "MISSING"
```

---

### Task 5: Create `tools/verify-superpowers-index.sh`

**Files:**
- Create: `tools/verify-superpowers-index.sh`

- [ ] **Step 1: Create the verification script**

```bash
#!/usr/bin/env bash
# Verify consistency of docs/superpowers/ index and frontmatter.
# Exit 0 if all checks pass, 1 otherwise.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SP_DIR="$REPO_ROOT/docs/superpowers"
INDEX="$SP_DIR/README.md"
ERRORS=0

echo "=== Superpowers Index Verification ==="

# Check 1: Index file exists
if [[ ! -f "$INDEX" ]]; then
  echo "FAIL: $INDEX does not exist"
  exit 1
fi
echo "OK: Index file exists"

# Check 2: Every .md in plans/ and specs/ has YAML frontmatter with status
for dir in plans specs; do
  if [[ ! -d "$SP_DIR/$dir" ]]; then
    echo "SKIP: $SP_DIR/$dir does not exist yet"
    continue
  fi
  while IFS= read -r -d '' f; do
    fname="$(basename "$f")"
    if ! head -1 "$f" | rg -q '^---'; then
      echo "FAIL: $dir/$fname missing YAML frontmatter"
      ERRORS=$((ERRORS + 1))
    else
      # Check status field exists
      if ! rg -q '^status:' "$f"; then
        echo "FAIL: $dir/$fname missing 'status:' in frontmatter"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  done < <(find "$SP_DIR/$dir" -name '*.md' -print0)
done
echo "OK: Frontmatter checks done ($ERRORS errors so far)"

# Check 3: Every file in plans/specs is listed in the index
for dir in plans specs; do
  if [[ ! -d "$SP_DIR/$dir" ]]; then
    continue
  fi
  while IFS= read -r -d '' f; do
    fname="$(basename "$f")"
    if ! rg -q "$fname" "$INDEX"; then
      echo "FAIL: $dir/$fname not listed in README.md index"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(find "$SP_DIR/$dir" -name '*.md' -print0)
done
echo "OK: Index coverage checks done ($ERRORS errors so far)"

# Check 4: No active-status files in archive/
if [[ -d "$SP_DIR/archive" ]]; then
  while IFS= read -r -d '' f; do
    fname="$(basename "$f")"
    [[ "$fname" == ".gitkeep" ]] && continue
    status="$(rg '^status:' "$f" | head -1 | sed 's/status: *//')"
    if [[ "$status" == "active" || "$status" == "draft" ]]; then
      echo "FAIL: archive/$fname has status=$status (should be completed/superseded/abandoned)"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(find "$SP_DIR/archive" -name '*.md' -print0)
fi
echo "OK: Archive status checks done ($ERRORS errors so far)"

# Summary
echo ""
if [[ $ERRORS -eq 0 ]]; then
  echo "ALL CHECKS PASSED"
  exit 0
else
  echo "$ERRORS CHECK(S) FAILED"
  exit 1
fi
```

- [ ] **Step 2: Make executable**

```bash
chmod +x tools/verify-superpowers-index.sh
```

- [ ] **Step 3: Run verification (expect some failures before frontmatter is added)**

```bash
bash tools/verify-superpowers-index.sh
```

Expected after Task 2 is complete: all checks pass.

---

### Task 6: Update AGENTS.md with Policy Reference

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add reference to workflow output policy**

After the `## Do Not Treat As Canonical Project Guidance` section, add:

```markdown
## Generated Output Governance

Specs and plans generated by Superpowers skills live in `docs/superpowers/`. They are **not** canonical project memory — they are coordination artifacts.

- Index: `docs/superpowers/README.md`
- Policy: `references/workflow-output-policy.md`
- Verify: `bash tools/verify-superpowers-index.sh`
```

- [ ] **Step 2: Verify the section was added**

```bash
rg 'Generated Output Governance' AGENTS.md
```

Expected: one match.

---

### Task 7: Commit All Changes

- [ ] **Step 1: Stage and commit**

```bash
git add docs/superpowers/README.md \
        docs/superpowers/archive/.gitkeep \
        docs/superpowers/plans/ \
        references/workflow-output-policy.md \
        tools/verify-superpowers-index.sh \
        AGENTS.md
git commit -m "docs: add superpowers output governance layer (index, frontmatter, policy, verify script)"
```

- [ ] **Step 2: Run final verification**

```bash
bash tools/verify-superpowers-index.sh
```

Expected: `ALL CHECKS PASSED`.

---

## Verification Summary

| Check | Command | Expected |
|-------|---------|----------|
| Index exists | `test -f docs/superpowers/README.md` | OK |
| All plans have frontmatter | `for f in docs/superpowers/plans/*.md; do head -1 "$f"; done` | All print `---` |
| All plans have status | `rg '^status:' docs/superpowers/plans/*.md` | 5 matches |
| All plans indexed | `rg '2026-06-' docs/superpowers/README.md` | 5 matches |
| Archive dir exists | `test -d docs/superpowers/archive` | OK |
| Policy doc exists | `test -f references/workflow-output-policy.md` | OK |
| Verify script runs | `bash tools/verify-superpowers-index.sh` | ALL CHECKS PASSED |
| AGENTS.md updated | `rg 'Generated Output Governance' AGENTS.md` | 1 match |

---

## Risks & Blockers

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Future Superpowers runs don't add frontmatter | Medium | Policy doc + README maintenance instructions; verify script catches it |
| Index drifts out of sync with files | Medium | verify script checks coverage; run in CI or manually after changes |
| Archive grows unbounded | Low | Archive is git-tracked; old files can be pruned in future if needed |
| Frontmatter conflicts with existing content | Low | Existing files have no frontmatter; insertion is safe |

---

## Recommended Next Worker Assignment

**Worker**: any worker with file-edit access
**Scope**: Tasks 1-7 (all tasks in this plan)
**Estimated effort**: 15-20 minutes
**Dependencies**: none — all files are local, no external services needed
