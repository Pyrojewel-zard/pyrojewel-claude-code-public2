# Agent Extraction Reference

All agents copied from ECC `agents/` on 2026-06-01.
ECC repo: `<source-repos-root>/ECC/`

## Extracted Agents

| Source File | Target File | Purpose | Adaptation Needed |
|-------------|-------------|---------|-------------------|
| `planner.md` | `agents/planner.md` | Decompose algorithm into implementation steps | No change |
| `mle-reviewer.md` | `agents/mle-reviewer.md` | Review ML code: data contracts, reproducibility | No change |
| `pytorch-build-resolver.md` | `agents/pytorch-build-resolver.md` | Fix tensor shape/CUDA/gradient errors | No change |
| `code-explorer.md` | `agents/code-explorer.md` | Deep codebase analysis | No change |
| `python-reviewer.md` | `agents/python-reviewer.md` | Python code review | No change |

## Adaptation TODO

- [ ] Review each agent for relevance to current workflow
- [ ] May add Python-specific subagents later

## 2026-06-02 Agent Audit

All 5 agents listed in `CLAUDE.md` are present in `agents/` directory. ECC source confirmed at `ECC/agents/`.

| Agent | ECC source | Target present | Decision |
|-------|------------|----------------|----------|
| `planner` | `ECC/agents/planner.md` | `agents/planner.md` | installed, no adaptation needed |
| `mle-reviewer` | `ECC/agents/mle-reviewer.md` | `agents/mle-reviewer.md` | installed, no adaptation needed |
| `pytorch-build-resolver` | `ECC/agents/pytorch-build-resolver.md` | `agents/pytorch-build-resolver.md` | installed, no adaptation needed |
| `code-explorer` | `ECC/agents/code-explorer.md` | `agents/code-explorer.md` | installed, no adaptation needed |
| `python-reviewer` | `ECC/agents/python-reviewer.md` | `agents/python-reviewer.md` | installed, no adaptation needed |

Note: ECC also has agents in `.kiro/agents/` (Kiro IDE format) and `.codex/agents/` (Codex format) — these are IDE-specific and not relevant to Claude Code agent installation.
