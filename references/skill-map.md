# External Repository Map

`<source-repos-root>/` contains 22 Git repositories as of 2026-06-02.

## Relationship to This Repo (pyrojewel_claude_code)

| Repository | Type | Relationship | Notes |
|------------|------|--------------|-------|
| `ECC/` | Reference | **Primary source** | Hooks, skills, agents, rules extracted from here |
| `virtuoso/` | Reference | Secondary source | Alternative hook/skill patterns |
| `everything-claude-code/` | Reference | ECC fork | Can diff against ECC for custom patches |
| `oh-my-codex/` | Reference | Codex patterns | Codex-specific configurations |
| `claude-code-best-practice/` | Reference | Best practices | General Claude Code tips |
| `Auto-claude-code-research-in-sleep/` | Active | ARIS pipeline | Research pipeline used for literature survey |
| `academic-skills/` | Active | Academic skills | Paper writing, citation management |
| `nature-skills/` | Active | Domain skills | Nature journal specific |
| `cnki-skills/` | Active | Domain skills | CNKI database research |
| `ieee_skills/` | Active | Domain skills | IEEE database research |
| `ljg-skills/` | Active | Skill source | Fork of lijigang/ljg-skills |
| `beamer-academic/` | Active | Skill source | Fork of Faust-Donf/beamer-academic |
| `guizang-ppt-skill/` | Active | Skill source | HTML PPT generation; belongs to Flow 11 |
| `andrej-karpathy-skills/` | Reference | Coding philosophy | Karpathy's coding guidelines |
| `claude-obsidian/` | Active | Obsidian integration | Obsidian vault management |
| `llm-wiki-skill/` | Active | Knowledge management | LLM wiki compilation |
| `spec-kit/` | Reference | Spec-driven dev | Specification patterns |
| `graphify/` | Reference | Graph visualization | Knowledge graph tools |
| `graphiti/` | Reference | Graph memory | Temporal knowledge graph |
| `zotero-cli-cc/` | Active | Reference management | Zotero CLI for Claude Code |
| `skill_manager/` | Active | Skill source | Self-built, no upstream |
| `llm_wiki/` | Reference | Knowledge base | LLM wiki data |
| `pyrojewel_claude_code/` | **Self** | **This repo** | Personal configuration hub |

> **Note:** `llm_test/` was listed in prior maps but is absent from the current filesystem. Marked as removed.

## Git Remotes

| Repository | origin (fork) | upstream |
|------------|---------------|----------|
| `ECC` | `git@github.com:Pyrojewel-zard/ECC.git` | _(none)_ |
| `virtuoso` | `https://github.com/Pyrojewel-zard/virtuoso-bridge-lite.git` | `https://github.com/Arcadia-1/virtuoso-bridge-lite.git` |
| `guizang-ppt-skill` | `git@github.com:op7418/guizang-ppt-skill.git` | _(none)_ |
| `ljg-skills` | `git@github.com:Pyrojewel-zard/ljg-skills.git` | `https://github.com/lijigang/ljg-skills.git` |
| `beamer-academic` | `git@github.com:Pyrojewel-zard/beamer-academic.git` | `https://github.com/Faust-Donf/beamer-academic.git` |
| `skill_manager` | `git@github.com:Pyrojewel-zard/claude-skills-personal.git` | _(自建，无上游)_ |

All other repos are blocked by Git safe-directory checks. Remote URLs must be inspected manually or after adding safe.directory exceptions.

## Update Strategy

- **Forked repos** (ljg-skills, beamer-academic): `git fetch upstream && git merge upstream/main` (or master), then push to origin
- **Self-built repos** (skill_manager): `git pull origin` only
- **Reference repos** (ECC, virtuoso, etc.): `git pull` to stay current, read-only
- **This repo**: Continuously updated with adaptations and self-built skills

## Flow Ownership Matrix

| Flow | Primary repos | Supporting repos | Status | Next action |
|------|---------------|------------------|--------|-------------|
| Flow 1 调研→阅读→汇报→判断 | `pyrojewel_claude_code`, `ljg-skills`, `beamer-academic`, `zotero-cli-cc` | `ieee_skills`, `cnki-skills` | mostly self-contained | normalize Zotero/MarkerPDF paths and test PPT path |
| Flow 2 文献检索+综述 | `Auto-claude-code-research-in-sleep`, `academic-skills` | `zotero-cli-cc` | self-contained for arXiv/S2 path | migrate or document arxiv, semantic-scholar, survey skills |
| Flow 3 DSE参数探索 | `Auto-claude-code-research-in-sleep` | `andrej-karpathy-skills` | self-contained | verify local skill availability |
| Flow 4 实验→分析 | `Auto-claude-code-research-in-sleep`, `academic-skills` | `skill_manager` | self-contained | map analyze/formula/log skills to installed names |
| Flow 5 论文写作 | `Auto-claude-code-research-in-sleep`, `nature-skills`, `ljg-skills` | `beamer-academic` | partially blocked | separate Codex-MCP-dependent skills from runnable skills |
| Flow 6 周报+组会 | `academic-skills` | `claude-obsidian` | self-contained | migrate weekly update skill if useful |
| Flow 7 审稿回复 | `academic-skills`, `Auto-claude-code-research-in-sleep` | `nature-skills` | lightweight path runnable; ARIS path blocked | document which rebuttal skill is default |
| Flow 8 Idea发现 | `Auto-claude-code-research-in-sleep` | `llm-wiki-skill`, `graphiti` | blocked | list Codex MCP and helper-script requirements |
| Flow 9 数据库检索与全文抽取 | `cnki-skills`, `ieee_skills`, `zotero-cli-cc`, `skill_manager` | `claude-obsidian` | semi-self-contained | verify login/browser and MarkerPDF assumptions |
| Flow 10 知识库沉淀 | `claude-obsidian`, `llm-wiki-skill`, `llm_wiki` | `graphify`, `graphiti` | semi-self-contained | standardize filesystem-first vault writes |
| Flow 11 学术PPT与可视化汇报 | `beamer-academic`, `guizang-ppt-skill`, `pyrojewel_claude_code` | `nature-skills` | needs verification | test xelatex/HTML rendering paths |
| Cross-flow coding support | `ECC`, `andrej-karpathy-skills`, `claude-code-best-practice`, `oh-my-codex`, `spec-kit` | `virtuoso`, `everything-claude-code` | reference | extract only concrete rules/hooks when needed |

## 2026-06-02 Repository Coverage Audit

| Repository | Present locally | Remote status | Entry files found | Flow membership | Next action |
|------------|-----------------|---------------|-------------------|-----------------|-------------|
| `ECC/` | yes | origin `git@github.com:Pyrojewel-zard/ECC.git` | hooks/skills/rules/agents | session lifecycle, coding support | keep read-only; audit diffs periodically |
| `virtuoso/` | yes | origin Pyrojewel fork, upstream Arcadia-1 | 3 `skills/*/SKILL.md` | reference patterns | inspect for hook ideas only |
| `everything-claude-code/` | yes | safe-directory blocked | mirrors ECC source tree | ECC fork comparison | diff against `ECC/` only when needed |
| `oh-my-codex/` | yes | safe-directory blocked | 40+ `skills/*/SKILL.md` | Codex configuration | extract Codex-specific patterns selectively |
| `claude-code-best-practice/` | yes | safe-directory blocked | 4 `.claude/skills/*/SKILL.md` | best practices | keep as read-only reference |
| `Auto-claude-code-research-in-sleep/` | yes | safe-directory blocked | 141 `skills/*/SKILL.md` | Flow 2-5, 7-8, experiment bridge | inventory dependencies before migration |
| `academic-skills/` | yes | safe-directory blocked | 8 top-level `*/SKILL.md` | Flow 2, 4, 6, 7 | migrate self-contained skills first |
| `nature-skills/` | yes | safe-directory blocked | 9 `skills/*/SKILL.md` | Flow 5, 11 | map overlap with paper-writing skills |
| `cnki-skills/` | yes | safe-directory blocked | 10 `skills/*/SKILL.md` | Flow 9 | verify browser/login assumptions |
| `ieee_skills/` | yes | safe-directory blocked | 15 `skills/*/SKILL.md` | Flow 9 | verify browser/login assumptions |
| `ljg-skills/` | yes | safe-directory blocked | 22 `skills/*/SKILL.md` | Flow 1, 5, auxiliary thinking | migrate selected skills with path cleanup |
| `beamer-academic/` | yes | safe-directory blocked | `SKILL.md` | Flow 1, 11 | active Beamer/PDF route |
| `guizang-ppt-skill/` | yes | origin `git@github.com:op7418/guizang-ppt-skill.git` | `SKILL.md` | Flow 11 | add to main relationship table |
| `andrej-karpathy-skills/` | yes | safe-directory blocked | 1 `skills/*/SKILL.md` | coding support | keep as philosophy/reference |
| `claude-obsidian/` | yes | safe-directory blocked | 11 `skills/*/SKILL.md` | Flow 10 | standardize vault write path |
| `llm-wiki-skill/` | yes | safe-directory blocked | root `SKILL.md` + 2 dep skills | Flow 10 | map wiki lifecycle skills |
| `spec-kit/` | yes | safe-directory blocked | 1 `.github/skills/*/SKILL.md` | spec-driven planning | keep reference; no migration yet |
| `graphify/` | yes | safe-directory blocked | 1 `graphify/skill.md` | knowledge graph visualization | reference only |
| `graphiti/` | yes | safe-directory blocked | README/source tree | temporal graph memory | reference only |
| `zotero-cli-cc/` | yes | safe-directory blocked | `skill/zotero-cli-cc/SKILL.md` | Flow 1, 9 | reconcile with Zotero MCP skills |
| `skill_manager/` | yes | safe-directory blocked | 27 `skills/*/SKILL.md` | Flow 1, 9, coding support | migrate selected personal skills |
| `llm_wiki/` | yes | safe-directory blocked | 7 `skills/*/SKILL.md` | Flow 10 data/reference | read-only data/reference |
| `pyrojewel_claude_code/` | yes | no remote in audit | this repo | all flows | central adapted config hub |
| `llm_test/` | **no** | not present | none | testing support | removed from active map |

## Remaining Project Backlog

| Priority | Project group | Work item | Output file |
|----------|---------------|-----------|-------------|
| P0 | ECC-derived runtime | Finish `ecc-context-monitor` calibration and hook fixtures | `references/hooks-extraction.md` |
| P0 | Flow map | Keep `references/flow-map.md` aligned with Flow 9-11 additions | `references/flow-map.md` |
| P1 | Zotero/database | Normalize Zotero storage and MarkerPDF paths | `references/skills-extraction.md` |
| P1 | PPT | Test `beamer-academic` with paper-reading and reproduction inputs | `skills/beamer-academic/` docs |
| P2 | ARIS | Separate runnable skills from Codex-MCP-blocked skills | `references/flow-map.md` |
| P2 | Wiki/Obsidian | Decide filesystem-first sync contract | `references/flow-map.md` |
| P3 | Reference repos | Keep `virtuoso`, `graphify`, `graphiti`, `spec-kit` read-only until a concrete need appears | `references/skill-map.md` |
