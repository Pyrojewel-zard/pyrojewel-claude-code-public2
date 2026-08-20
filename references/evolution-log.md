# Project Evolution Log

按时间倒序记录项目的决策、功能增量和产出资产变迁。
每个条目对应一个已完成/替代/废弃的 plan。

---

## 2026-06-04 — Beamer Output Path

**决策：**
- precedence 设计：用户显式路径 > Obsidian 周会 > 本地 fallback，因为用户意图应优先于默认值
- 周会文件夹用 `{YYYY}/W{WW}/`（ISO 周），匹配学术周会组织习惯
- 路径用 `$OBSIDIAN_VAULT_ROOT` 环境变量（非硬编码），因为不同机器路径不同
- compile.sh 加 `--output-dir` 参数（非仅 config），因为一次性覆盖应简便
- fallback 改为 `.tex` 源文件目录（非 `outputs/`），保持直接调用 compile.sh 的向后兼容

**功能增量：**
- SKILL.md Section 10 输出路径规范（precedence 表 + 环境变量 + 产出文件）
- config.yaml output 节（path, weekly_meeting_rel, weekly_format, fallback_dir）
- compile.sh `--output-dir` 参数 + `resolve_output_dir` 函数
- pyrojewel-paper-flow Phase 6 output_path 传递约定

**产出资产：**
- `skills/pyrojewel-beamer-academic/SKILL.md` — 新增输出路径行为和 Section 10
- `skills/pyrojewel-beamer-academic/assets/config.yaml` — 新增 output 节
- `skills/pyrojewel-beamer-academic/scripts/compile.sh` — 重写参数解析 + resolve_output_dir
- `skills/pyrojewel-beamer-academic/references/output-path.md` — 路径解析参考文档
- `skills/pyrojewel-paper-flow/SKILL.md` — Phase 6 输出路径约定

**阻塞/风险结论：**
- Residual: ISO 周跨年边界日期可能非预期（低风险，用户可显式指定路径绕过）
- 向后兼容：未传 `--output-dir` 时输出到 `.tex` 源文件目录，保持直接调用行为不变

**plan 原文：** docs/superpowers/archive/2026-06-04-beamer-output-path.md

---

## 2026-06-04 — Superpowers Output Governance

**决策：**
- 索引用单一 `docs/superpowers/README.md`（非多目录各自索引），单入口更简
- status 用 YAML frontmatter 字段（非文件名后缀），可 grep 可机器校验
- 归档移 `archive/`（非删除），保留历史可追溯
- 验证脚本用 shell（非 Python），无额外依赖
- `docs/superpowers/` 定位为非规范协调产物（非 canonical project memory）

**功能增量：**
- Superpowers Output Index（README.md 活跃/归档两表）
- Workflow Output Policy（生命周期规范 + 命名规则 + 验证命令）
- verify-superpowers-index.sh（frontmatter + 索引覆盖 + 归档状态三重校验）
- AGENTS.md Generated Output Governance 节

**产出资产：**
- `docs/superpowers/README.md` — 索引文件
- `docs/superpowers/archive/.gitkeep` — 归档目录标记
- `references/workflow-output-policy.md` — 规范文档
- `tools/verify-superpowers-index.sh` — 验证脚本
- `AGENTS.md` — 项目 Agent 导向文件

**阻塞/风险结论：**
- Residual: 后续 Superpowers 运行可能不自动加 frontmatter；policy 文档和 verify 脚本已作为防护

**plan 原文：** docs/superpowers/archive/2026-06-04-superpowers-output-governance.md

---

## 2026-06-02 — Wiki Knowledge Line

**决策：**
- 主引擎选 `llm-wiki-skill`（非 `claude-obsidian`），因为文件系统优先，无 REST API 依赖
- 三层存储边界：SESSION_CONTEXT（易失）→ references/（稳定）→ vault/wiki/（永久）
- vault 契约未定义前不施工 wiki-ingest/wiki-compile，因为目录结构和 page schema 是前置条件

**功能增量：**
- 三层存储模型定义
- Vault 契约需求文档
- Skill 接入优先级（session-log-crystallizer, wiki-lint, wiki-query 为 P0）

**产出资产：**
- `references/flow-map.md` — Flow 10 定义更新
- `references/vault-contract.md` — （未创建，deferred）

**阻塞/风险结论：**
- Frozen: wiki 线暂不施工，待论文/idea/实验主线需要知识沉淀联动时再恢复

**plan 原文：** docs/superpowers/archive/2026-06-02-wiki-knowledge-line.md

---

## 2026-06-02 — Skill Map Completion

**决策：**
- Repo 数量确认为 22（非之前估计的 23），基于实际 Git audit
- 补充 `guizang-ppt-skill`（之前遗漏），因为它是活跃的 HTML PPT 源 repo
- 用 Flow Ownership Matrix（非扁平列表），展示 repo → flow 的服务关系

**功能增量：**
- Flow Ownership Matrix（11 条 flow → repo 分配）
- Remaining Project Backlog 分优先级表（P0-P3）

**产出资产：**
- `references/skill-map.md` — 完整的 repo → flow 矩阵

**阻塞/风险结论：**
- Residual: 需与 flow-map.md 保持同步更新

**plan 原文：** docs/superpowers/archive/2026-06-02-skill-map-completion.md

---

## 2026-06-02 — ECC Adaptation Inventory

**决策：**
- Hook 标记为"adapted"（非"copied"），因为本地有修改
- Agent 标记为"listed not installed"，因为目标 repo 无 `agents/` 目录
- 仅做文档审计（不做 hook 实现变更），因为目标是 inventory 不是施工

**功能增量：**
- Hook/Agent/Rule 三张审计表
- Hook fixture 覆盖 backlog 明确化

**产出资产：**
- `references/hooks-extraction.md` — Hook 适配状态表
- `references/agents-extraction.md` — Agent 清单
- `references/rules-extraction.md` — Rule 映射

**阻塞/风险结论：**
- Remaining: Hook fixture 覆盖（gateguard, config-protection, stop-format-typecheck, session hooks）

**plan 原文：** docs/superpowers/archive/2026-06-02-ecc-adaptation-inventory.md

---

## 2026-06-02 — Active Flow Inventory

**决策：**
- `references/flow-map.md` 作为 flow 级真值来源（非 CLAUDE.md），因为独立参考文件更可维护
- 文档先行（不做 skill 迁移），因为目标是 inventory 不是施工

**功能增量：**
- Flow 9（数据库检索与全文抽取）、Flow 10（知识库沉淀）、Flow 11（学术PPT与可视化汇报）定义
- Flow Ownership Matrix 初版

**产出资产：**
- `references/flow-map.md` — 完整 flow 定义（11 条 flow）
- `references/skills-extraction.md` — 活跃源 skill 审计

**阻塞/风险结论：**
- Resolution: 文档审计完成，无阻塞

**plan 原文：** docs/superpowers/archive/2026-06-02-active-flow-inventory.md

---

## 2026-06-01 — Pyrojewel Paper Flow

**决策：**
- ljg 系列改名 pyrojewel（非保留原名），因为本地适配需要所有权区分
- 图片资产管理用本地 `images/{attachmentKey}/`（非依赖 Zotero storage 路径），因为自包含笔记更便携
- QA 定位为"对齐拷打"（非"纠错提取"），目标是验证理解不是修正 AI
- darwin-skill 作为手动优化后步骤（非自动化），因为 skill 优化需要人判断质量

**功能增量：**
- pyrojewel-paper — 论文精读 + 图片资产管理
- pyrojewel-paper-river — 递归溯源（最多5层）
- pyrojewel-paper-qa — 交互式 QA 对齐（5-10 Q/篇）
- pyrojewel-paper-flow — 7-phase 编排入口
- darwin-skill — skill 自动优化

**产出资产：**
- `skills/pyrojewel-paper/` — 精读 skill
- `skills/pyrojewel-paper-river/` — 溯源 skill
- `skills/pyrojewel-paper-qa/` — QA 对齐 skill
- `skills/pyrojewel-paper-flow/SKILL.md` — 编排 skill
- `skills/darwin-skill/` — 优化 skill

**阻塞/风险结论：**
- Remaining: 核心子 skill (paper, paper-river, paper-qa) 需端到端验证
- Remaining: xelatex 安装后才能验证 Phase 6 PDF 编译

**plan 原文：** docs/superpowers/archive/2026-06-01-pyrojewel-paper-flow.md

---

## 主线脉络索引

| 主线 | 起点 plan | 当前状态 | 关键演进节点 |
|------|----------|---------|------------|
| 论文阅读 → PPT | 2026-06-01-paper-flow | 活跃 | output-path 归档到周会文件夹(06-04), fallback 改为源文件目录 |
| 项目治理与文档框架 | 2026-06-02-flow-inventory | 完成 | flow-map/skill-map 完善 → ECC 审计 → superpowers governance |
| Wiki/知识沉淀 | 2026-06-02-wiki-knowledge | 冻结 | 三层模型定义; vault 契约 deferred |