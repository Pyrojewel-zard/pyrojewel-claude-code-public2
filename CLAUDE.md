# Pyrojewel Claude Code

Personal Claude Code + Codex skill workspace, originally adapted from ECC and then extended around a few recurring research workflows.

## Key Docs

- `README.md` — public repo overview
- `SETUP.md` — local dependencies and environment variables
- `references/current-status-and-next-steps.md` — current flow status and next steps
- `references/skill-source-map.md` — adopted skill provenance and sync policy
- `references/flow-map.md` — flow/repo dependency map
- `references/ecc-framework-action-plan.md` — ECC hook/runtime action log

## Public Repo Notes

This repository is a sanitized public copy.

- Personal session state is not canonical project state
- Local learnings and generated outputs are intentionally excluded
- Machine-specific paths are replaced with placeholders or environment variables
- Adopted skills live in `skills/`; source provenance is tracked in `references/skill-source-map.md`

## Zotero Markdown Storage

Paper reading skills (`pyrojewel-paper`, `pyrojewel-paper-river`, `pyrojewel-beamer-academic`) read papers from the Zotero markdown export directory.

- **Path**: `{zotero_markdown_path}` (set in `.claude/settings.json` env)
- **Structure**: `{zotero_markdown_path}/{attachmentKey}/content.md` + `*_image*.jpeg` + `*.pdf`
- **How to use**: Provide an `attachmentKey` (e.g., `222T4HRB`) to `/pyrojewel-paper` — it will find `content.md` and images under that directory
- **Beamer images**: `/pyrojewel-beamer-academic` copies images from `{zotero_markdown_path}/{attachmentKey}/` into `materials/figures/`

## Session Lifecycle

```text
SessionStart -> PreToolUse -> PostToolUse -> Stop
     ^                                      |
     +----------- SESSION_CONTEXT ----------+
```

### Session Hook Boundary

- `session-start.js` / `session-end.js`
  - local context restoration only
- `session-knowledge-summary.js`
  - optional long-term archive hook
  - controlled by `OBSIDIAN_VAULT_ROOT`
- `evaluate-session.js`
  - extracts reusable local learnings into `.claude/learnings/`

### Hooks

| Event | Hook | Purpose |
|-------|------|---------|
| SessionStart | `session-start.js` | Restore local context from `SESSION_CONTEXT.md` |
| PreToolUse | `gateguard-fact-force.js` | Fact-forcing gate on first-time edits |
| PreToolUse | `config-protection.js` | Block edits to protected config files |
| PostToolUse | `post-edit-accumulator.js` | Accumulate `.py` files for batch format |
| PostToolUse | `ecc-context-monitor.js` | Loop detection, cost monitoring |
| PostToolUse | `cost-tracker.js` | Token/cost tracking |
| Stop | `stop-format-typecheck.js` | `ruff format` + `ruff check` on edited Python files |
| Stop | `session-end.js` | Update local `SESSION_CONTEXT.md` |
| Stop | `session-knowledge-summary.js` | Optional archive write to external vault |
| Stop | `evaluate-session.js` | Extract reusable learnings |
| Stop | `desktop-notify.js` | Desktop notification |
| PreCompact | `pre-compact.js` | Preserve context across compaction |

Protected files: `.env`, credentials, `pyproject.toml`, `setup.cfg`, `conda-lock.yml`, `.pre-commit-config.yaml`, `.claude/settings.json`

## Active Flow Skills

### Paper Flow

- `pyrojewel-paper`
- `pyrojewel-paper-river`
- `pyrojewel-paper-qa`
- `pyrojewel-paper-flow`
- `zotero-pdf-parse`
- `pyrojewel-beamer-academic`

### Idea / Experiment Flow

- `research-pipeline` — 全流程编排（idea → experiment → review → paper）
- `idea-discovery`
- `research-lit`
- `idea-creator`
- `novelty-check`
- `research-review`
- `research-refine-pipeline`
- `experiment-plan`
- `experiment-bridge`
- `experiment-queue` — 批量实验队列编排（OOM 重试、wave 过渡、crash-safe）
- `run-experiment` — 单次实验部署（local/SSH/Vast.ai/Modal）
- `monitor-experiment` — 实验进度监控
- `ablation-planner` — 消融实验规划
- `result-to-claim` — 结果→claim 门控
- `experiment-audit` — 实验诚信审计
- `auto-review-loop`
- `analyze-results`
- `dse-loop`
- `training-check` — 训练健康检查
- `vast-gpu` — Vast.ai GPU 管理
- `serverless-modal` — Modal serverless GPU
- `formula-derivation`
- `paper-compile`

### Meta / Maintenance

- `darwin-skill`

## Active Agents

Project agent role definitions live in `agents/`:

- `planner`
- `mle-reviewer`
- `pytorch-build-resolver`
- `code-explorer`
- `python-reviewer`

## Repo Structure

- `skills/` — adopted and adapted skills used by current flows
- `hooks/` and `.claude/hooks/` — local runtime hooks and support code
- `shared-references/` — shared prompt/reference material required by migrated skills
- `tools/` — helper scripts for research, audits, sync, and verification
- `references/` — flow maps, migration notes, source tracking, action plans
- `agents/` — agent role definitions

## Workflow Notes

- This repo is not a mirror of all source skill repositories.
- Source repos are tracked separately; only useful, adapted skills should be adopted locally.
- When source repos change, review `references/skill-source-map.md` first before syncing anything into `skills/`.
