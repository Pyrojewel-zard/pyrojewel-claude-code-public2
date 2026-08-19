# pyrojewel-claude-code-public2

Personal Claude Code skill workspace, cleaned for public release.

This repository is not a generic framework dump. It is a curated working tree for a few recurring research flows:

1. Paper reading -> notes -> QA -> PPT
2. Idea discovery and literature review
3. Experiment planning and result analysis
4. ECC-style local hook/runtime support

## What Is In This Repo

- `skills/`
  - Public, adapted skills that are actually used in the target flows
- `hooks/` and `.claude/hooks/`
  - Local runtime hooks, session handling, guardrails, and fixtures
- `shared-references/`
  - Reused prompt/reference documents required by migrated skills
- `tools/`
  - Helper scripts used by research and skill workflows
- `references/`
  - Project maps, source tracking, migration notes, and current status
- `rules/`
  - Coding/review/testing rules used by the local workflow

## Main Flow Coverage

### Paper Flow

Core chain:

```text
zotero-pdf-parse
-> pyrojewel-paper
-> pyrojewel-paper-river
-> pyrojewel-paper-qa
-> implementation-report (when plan/code status is needed)
-> beamer-academic
```

For implementation or reproduction status, `implementation-report` first reads the planning files and current code, then emits a Markdown report plus editable Mermaid workflow source and a rendered diagram. `beamer-academic` consumes that bundle for the workflow overview page.

The workflow visual is redrawn by the adopted `diagram-design` skill: Mermaid is
the semantic source, while the slide asset is produced with explicit
`format/size/detail/audience` settings and a local monochrome paper-reading
profile.

For thesis-defense decks that require the evidence contract and Obsidian weekly
output, use `pyrojewel-beamer-academic` as the separate defense variant.

Key docs:

- `references/flow-chain-1-paper-to-ppt.md`
- `references/flow-map.md`

### Idea / Experiment Flow

Core chain:

```text
idea-discovery
-> research-lit
-> idea-creator
-> novelty-check
-> research-review
-> research-refine-pipeline
-> experiment-plan
```

Supporting skills already migrated include `auto-review-loop`, `experiment-bridge`, `experiment-audit`, `analyze-results`, `dse-loop`, and `paper-compile`.

Key docs:

- `references/idea-experiment-audit.md`
- `references/current-status-and-next-steps.md`

## Source Tracking

This repo keeps local adapted copies of selected skills. It does not mirror every upstream repository.

Use these docs to understand provenance and sync policy:

- `references/skill-source-map.md`
- `references/skills-extraction.md`
- `references/skill-map.md`

## Local Configuration

This public repo has been scrubbed of machine-specific paths and private session data.

Some skills still require local configuration through environment variables, for example:

- `ZOTERO_STORAGE`
- `MARKERPDF_SCRIPT`
- `MARKERPDF_ENV`
- `OBSIDIAN_VAULT_ROOT`
- `CLAUDE_SKILL_SOURCES_ROOT`

Repository placeholders such as `<configure-local-zotero-storage>` are intentional. Replace them with your own local setup before use.

## Privacy / Public Release Notes

The public version intentionally excludes:

- personal session state
- local learnings
- generated output artifacts
- temporary notes and screenshots
- machine-specific absolute paths

If you fork this repo, keep `.gitignore` conservative and avoid committing session files or generated outputs.

## Related Internal Docs

- `CLAUDE.md` — repo-specific agent guidance
- `references/current-status-and-next-steps.md` — high-level status
- `references/ecc-framework-action-plan.md` — ECC hook action log
