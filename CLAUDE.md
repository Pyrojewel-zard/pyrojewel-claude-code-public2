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

## Upstream Skill Dependencies

本项目的 skill 有一部分依赖外部 GitHub 仓库（fork 或直连）。需要在 upstream 更新后同步。权威来源：`references/skill-source-map.md`。

### 需要实时同步的 GitHub 清单（2026-08-11 更新）

实际磁盘路径均在 `/home/DataTransfer/Pyrojewel/code/02_claudeSkill/<repo>/`。

| # | 上游仓库 | 本地磁盘路径 | 实际 remote | 依赖的本地 skill | 同步方式 |
|---|---------|-------------|-------------|-----------------|---------|
| 1 | `wanshuiyin/Auto-claude-code-research-in-sleep` | `02_claudeSkill/Auto-claude-code-research-in-sleep/` | `git@github.com:wanshuiyin/Auto-claude-code-research-in-sleep.git`（直连上游，无 fork） | `analyze-results`, `experiment-plan`, `paper-compile`, `dse-loop`, `formula-derivation`, `novelty-check`, `idea-discovery`, `idea-creator`, `research-review`, `research-refine-pipeline`, `research-lit`, `auto-review-loop`, `experiment-bridge`, `experiment-audit`, `experiment-queue`, `run-experiment`, `monitor-experiment`, `ablation-planner`, `result-to-claim`, `research-pipeline`, `vast-gpu`, `training-check`, `serverless-modal`, `arxiv`, `render-html` | `git fetch` + 手动适配 |
| 2 | `lijigang/ljg-skills` | `02_claudeSkill/ljg-skills/` | origin `git@github.com:Pyrojewel-zard/ljg-skills.git` + upstream `https://github.com/lijigang/ljg-skills.git` | `pyrojewel-paper`, `pyrojewel-paper-river`, `pyrojewel-paper-qa` | `git fetch upstream && git merge upstream/main` → push origin |
| 3 | `Faust-Donf/beamer-academic` | `02_claudeSkill/beamer-academic/` | `git@github.com:Faust-Donf/beamer-academic.git`（直连上游） | `pyrojewel-beamer-academic` | `git pull` |
| 4 | `Arcadia-1/virtuoso-bridge-lite` | `02_claudeSkill/virtuoso/` | origin `git@github.com:Pyrojewel-zard/virtuoso-bridge-lite.git` + upstream `https://github.com/Arcadia-1/virtuoso-bridge-lite.git` | `virtuoso` | `git fetch upstream` → merge |

### 低频 / 参考来源（不强制实时同步）

| 仓库 | 本地磁盘路径 | 状态 | 说明 |
|------|-------------|------|------|
| `op7418/guizang-ppt-skill` | `02_claudeSkill/guizang-ppt-skill/` | reference-only | 仅被 `pyrojewel-beamer-academic` 吸收版式规则 |
| `sdyckjq-lab/llm-wiki-skill` | `02_claudeSkill/llm-wiki-skill/`（fork 自建，有 upstream） | 独立 wiki 线 | Karpathy wiki，与已剔除的 llm_wiki 不同 |
| `Imbad0202/academic-research-skills` | `02_claudeSkill/academic-research-skills/` | reference | 磁盘存在，但与本地 `benchmark-extractor` / `experiment-log-summarizer` **无来源关系** |

### 已剔除 / 无需同步

- `academic-skills` 来源 — 磁盘已无此仓库，`benchmark-extractor` / `experiment-log-summarizer` 来源不可核实（2026-08-11）
- `llm_wiki` 来源 7 个 wiki skill（`wiki-capture`/`inbox-prepare`/`wiki-compile`/`wiki-crystallize`/`wiki-lint`/`wiki-query`/`wiki-research`）— 本地自建
- `darwin-skill`（原标 skill_manager）— 本地自建
- ECC legacy 6 个（`deep-research`/`search-first`/`mle-workflow`/`verification-loop`/`continuous-learning-v2`/`scientific-thinking-literature-review`）— reference-only

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

### EDA / Virtuoso

- `virtuoso` — remote Cadence Virtuoso control via bridge (5 profiles: default/smic110/smic55/smic55v2/gf110)
- **Repo**: `/home/DataTransfer/Pyrojewel/code/02_claudeSkill/virtuoso/` | **Skills**: `skills/virtuoso/`

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
