# Setup

This repository is a public, sanitized copy of a local Claude Code skill workspace.

It will not run end-to-end without some local configuration.

## 1. Base Requirements

Recommended baseline:

- Ubuntu / WSL
- `git`
- `node`
- `python3`
- `rg` (`ripgrep`)

Optional but commonly needed:

- `gh` for GitHub operations
- `xelatex` for Beamer / paper slide compilation

Example:

```bash
sudo apt-get update
sudo apt-get install -y git nodejs npm python3 ripgrep gh texlive-xetex
```

## 2. Environment Variables

Some migrated skills expect local paths to external assets or sibling repos.

Set these in your shell profile or export them before use:

```bash
export CLAUDE_SKILL_SOURCES_ROOT="/path/to/your/source-skill-repos"
export ZOTERO_STORAGE="/path/to/your/zotero/storage"
export MARKERPDF_SCRIPT="/path/to/markerpdf_convert.py"
export MARKERPDF_ENV="/path/to/markerpdf/.env"
export OBSIDIAN_VAULT_ROOT="/path/to/your/obsidian/vault"
```

What they are used for:

- `CLAUDE_SKILL_SOURCES_ROOT`
  - used by `scripts/sync-sources.sh`
- `ZOTERO_STORAGE`
  - used by paper-reading skills and `zotero-pdf-parse`
- `MARKERPDF_SCRIPT`
  - used by `zotero-pdf-parse`
- `MARKERPDF_ENV`
  - used by local MarkerPDF runtime
- `OBSIDIAN_VAULT_ROOT`
  - used by `session-knowledge-summary.js` and wiki-related flows

## 3. Git Identity

If you plan to commit from this repo:

```bash
git config --global user.name "YourName"
git config --global user.email "you@example.com"
```

## 4. GitHub CLI Login

If you want to create repos or push through `gh`:

```bash
gh auth login
```

Or with a token:

```bash
gh auth login --with-token
```

## 5. What Is Intentionally Not Included

The public repo does not include:

- personal session history
- local learnings
- generated output artifacts
- private notes or screenshots
- real machine-specific paths

If a skill shows placeholders such as:

- `<configure-local-zotero-storage>`
- `<configure-local-markerpdf-script>`
- `<configure-local-markerpdf-env>`
- `<configure-local-obsidian-vault>`
- `<source-repos-root>`

replace them with your own local configuration.

## 6. Useful Entry Points

- `README.md`
- `CLAUDE.md`
- `references/current-status-and-next-steps.md`
- `references/skill-source-map.md`
- `references/flow-map.md`

