# ECC 框架完善执行单

**Created:** 2026-06-02
**Last Updated:** 2026-06-02T17:00:00Z
**Based on:** `references/hooks-extraction.md` (2026-06-02 audit), `references/agents-extraction.md`, `references/rules-extraction.md`

---

## 当前状态总览

| 维度 | 已可用 | 缺 fixture/校准 | 缺失 |
|------|--------|-----------------|------|
| Hooks (11) | 7 adapted + 4 copied | 5 需 fixture, 1 需校准 | 0 |
| Agents (5) | 5 installed in `agents/` | 需验证 runtime 可发现性 | 0 |
| Rules (3 groups) | python(6), common(3), zh(11) | common 缺 6 个未提取的 rule | 0 |
| Session lifecycle | 闭环运行中 | session-end 写入 SESSION_CONTEXT 无验证 | 0 |

## P0 — 框架稳定性（阻断后续 flow）

| # | 项 | 现状 | 行动 | 验证标准 |
|---|----|------|------|----------|
| P0-1 | `ecc-context-monitor.js` 阈值 | ✅ DONE: 校准为 Claude 4.x 定价 (notice=$2, warn=$5, critical=$15) | 校准 cost thresholds 为当前 model pricing | fixture 验证 cost log 输出合理 |
| P0-2 | `stop-format-typecheck.js` ruff 解析 | ✅ DONE: fixture 已写并通过 (3/3 pass) | 写 fixture 验证 ruff resolution: 有 .venv → 用 .venv，无 → 用全局 PATH | fixture pass |
| P0-3 | Session lifecycle 闭环 | ✅ DONE: integration fixture 22/22 pass; session-end 拆分短期/长期状态 | 为 session-start (注入) 和 session-end (写入+Obsidian sync) 写集成 fixture | fixture pass |

## P1 — 代码质量约束

| # | 项 | 现状 | 行动 | 验证标准 |
|---|----|------|------|----------|
| P1-1 | `gateguard-fact-force.js` Python import gate | ✅ DONE: fixture 4/4 pass (isolated state per test) | fixture: .py 文件首次修改触发 Python import warning | fixture pass |
| P1-2 | `config-protection.js` Python config paths | ✅ DONE: fixture 7/7 pass | fixture: 修改 pyproject.toml / ruff.toml 被拦截 | fixture pass |
| P1-3 | `post-edit-accumulator.js` .py accumulation | ✅ DONE: fixture 8/8 pass | fixture: 编辑 .py 文件后 accumulatedFiles 包含该文件 | fixture pass |
| P1-4 | Common rules 缺失 | ✅ DONE: 评估完成，结论见下方 | 评估提取 `development-workflow.md`, `git-workflow.md`, `testing.md`, `patterns.md`, `agents.md`, `hooks.md` | 决策文档记录 |

## P2 — 框架健壮性

| # | 项 | 现状 | 行动 | 验证标准 |
|---|----|------|------|----------|
| P2-1 | Agent runtime 可发现性 | ✅ DONE: 5 agents in `agents/` 目录，Claude Code 自动发现 | 验证 agents 目录被 Claude Code agent 系统识别 | 在会话中调用 planner agent 成功 |
| P2-2 | `cost-tracker.js` log path | ✅ DONE: 187 rows in ~/.claude/metrics/costs.jsonl, RATE_TABLE matches Claude 4.x | 确认 cost log 写入 `~/.claude/metrics/` | log 文件存在且格式正确 |
| P2-3 | `desktop-notify.js` Linux 命令 | ✅ DONE: WSL detection + PowerShell fallback + BurntToast tip verified | 测试 Linux 桌面通知 | 通知弹出 |
| P2-4 | `pre-compact.js` context preservation | ✅ DONE: compaction-log.txt + session annotation verified | 触发 compact 后检查关键 context 是否保留 | SESSION_CONTEXT 要素完整 |
| P2-5 | `evaluate-session.js` report path | ✅ DONE: .claude/learnings/ exists with 3 learning files | 确认 report 写入路径 | report 文件存在 |

---

## SESSION_CONTEXT 边界建议

**现状：** SESSION_CONTEXT.md 混合了短期会话态（当前命令、临时状态）和长期迁移状态（flow 进度、backlog）。

**建议：**

| 内容类型 | 放置 | 理由 |
|----------|------|------|
| 当前正在做什么 | SESSION_CONTEXT.md | 会话级，每次 Stop 覆写 |
| 会话临时状态/错误 | SESSION_CONTEXT.md | 会话级，下次恢复用 |
| Flow 进度/迁移决策 | `references/flow-map.md` | 长期稳定，跨会话持续 |
| Hook/agent adaptation 状态 | `references/*-extraction.md` | 长期参考，版本控制 |
| 执行单和 backlog | `references/ecc-framework-action-plan.md` (本文档) | 长期追踪，版本控制 |
| Learnings | SESSION_CONTEXT.md | 会话注入用，但避免膨胀（≤5 条） |

**规则：** SESSION_CONTEXT.md 只保留：Current State (2-3 行)、Active Threads (≤7 条)、Key Decisions、Pitfalls、Learnings (≤5 条)。长期内容全部外推到 `references/`。

---

## Common Rules 缺失评估结论

**背景：** 项目 `rules/common/` 只有 3 个 (coding-style, performance, security)。ECC 有 9 个。用户全局 `~/.claude/rules/zh/` 已有全部 10 个中文版。

| Rule | 行数 | 结论 | 理由 |
|------|------|------|------|
| `agents.md` | 51 | **skip** | 中文版全局已有；内容是 agent 编排表，项目级 `agents/` 目录已覆盖实际需求 |
| `code-review.md` | 124 | **adopt** | 中文版全局已有但不含 Python-specific 内容；项目级补充 Python code review 细节有价值 |
| `development-workflow.md` | 44 | **skip** | 中文版全局已有；内容引用 git-workflow，本项目的开发流程通过 session lifecycle hook 自动管理 |
| `git-workflow.md` | 24 | **skip** | 中文版全局已有；内容简洁（commit format + PR 流程），全局版本已覆盖 |
| `hooks.md` | 30 | **skip** | 中文版全局已有；内容是 hook 类型概述，项目级 hooks 已在 CLAUDE.md 详细记录 |
| `patterns.md` | 31 | **skip** | 中文版全局已有；内容泛化（骨架项目、仓储模式），Python-specific 版本已在 `rules/python/` |
| `testing.md` | 57 | **adopt** | 中文版全局已有但不含 pytest/ruff 内容；项目级补充 Python testing 细节有价值 |

**结论：** 仅 `code-review.md` 和 `testing.md` 值得补充到项目级 `rules/common/`（需要改编为 Python-focused 版本）。其余 4 个中文版全局已有，项目级不需要重复。

**断裂链接问题：** 3 个 `rules/python/` 文件引用了不存在的 `../common/` 文件：
- `rules/python/hooks.md` → `../common/hooks.md` (不存在)
- `rules/python/patterns.md` → `../common/patterns.md` (不存在)
- `rules/python/testing.md` → `../common/testing.md` (不存在)

如果 adopt `testing.md` 到 `rules/common/`，可修复其中 1 个。其余 2 个需更新链接指向全局 rules 或删除引用。

---

## SESSION_CONTEXT 边界执行项

**问题：** session-end hook 的 `update_session_context()` 把所有内容写入 SESSION_CONTEXT.md，没有区分短期/长期。长期 flow 状态膨胀后占满 200 行限制。

**执行项：**

| # | 执行 | 文件 |
|---|------|------|
| SC-1 | session-end.js 中 `update_session_context()` 拆分逻辑 | ✅ DONE: `[long]` 标记和 P0/P1/P2 条目 → references/session-long-term-state.md | `.claude/hooks/session-end.js` |
| SC-2 | SESSION_CONTEXT.md 长期条目迁移 | ✅ DONE | `.claude/SESSION_CONTEXT.md` |
| SC-3 | 新建 `references/session-long-term-state.md` 模板 | ✅ DONE | `references/session-long-term-state.md` |
