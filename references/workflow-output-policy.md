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
status: draft | active | completed | superseded | abandoned
completed-date: {YYYY-MM-DD}  # when status changed to completed/superseded/abandoned
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
