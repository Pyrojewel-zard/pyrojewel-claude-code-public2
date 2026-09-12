# pyrojewel-claude-code-public2

Personal Claude Code skill workspace, cleaned for public release.

This repository is not a generic framework dump. It is a curated working tree for recurring paper, knowledge, visualization, and EDA workflows.

1. Paper reading -> notes -> QA -> PPT
2. Academic figures, lectures, and paper-to-wiki handoffs
3. Zotero paper lookup and research-status writing
4. Cadence Virtuoso remote workflows

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
ljg-paper / ljg-read
-> pyrojewel-paper-river (optional)
-> ljg-qa (optional)
-> beamer-academic
```

`beamer-academic` is the active paper-reading and academic Beamer PDF entry.

Key docs:

- `references/flow-chain-1-paper-to-ppt.md`
- `references/flow-map.md`

### Other Maintained Skills

The repository also contains focused skills for `diagram-design`,
`evidence-to-lecture-handout`, `md-to-word-fidelity`,
`natural-fund-research-status-writing`, `paper-to-wiki`,
`vision-batch-read`, `workshop-talks-s5-lecture-pipeline`,
`wikiskill-evolve`, `zotero-lookup`, `zotero-manager`, and `virtuoso`.

The former research/experiment and Wiki bundles were intentionally removed
from this repository; their source repositories remain separate candidates for
future review rather than active local dependencies.

Key docs:

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
