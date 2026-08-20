---
title: Wiki Knowledge Line
date: 2026-06-02
status: abandoned
completed-date: 2026-06-05
---

# 主线 5：知识沉淀 — Wiki / Obsidian 知识存储整合

**认领人**: worker4
**日期**: 2026-06-02
**状态**: 规划完成，待 vault 契约确认后接入
**轮次备注**: 现有 session→Obsidian 闭环可用，第三轮暂不处理 wiki 施工

---

## 1. 角色/仓库盘点

当前有 **4 个知识相关仓库 + 3 个参考仓库**，功能重叠严重：

| 仓库 | 位置 | 核心能力 | 缺陷 | 角色 |
|------|------|----------|------|------|
| `claude-obsidian` | `<source-repos-root>/claude-obsidian/` | 11 skill，Obsidian vault 全闭环（scaffold/ingest/query/lint/save/autoresearch/canvas） | 依赖 Obsidian REST API 插件或 MCPVault；需 Obsidian 桌面端运行 | **候选主 vault 管理器**，但依赖重 |
| `llm-wiki-skill` | `<source-repos-root>/llm-wiki-skill/` | 10 workflow（init/ingest/batch-ingest/query/lint/status/digest/graph/delete/crystallize），纯文件系统，中文优化，数字山水图 | 无 Obsidian 集成；graph 依赖 jq+node | **候选主知识编译器**，文件系统友好 |
| `llm_wiki` | `<source-repos-root>/llm_wiki/` | 7 skill（capture→inbox-prepare→compile→crystallize→lint→query→research），早期版本 | 功能不如 llm-wiki-skill 完整 | **参考/备选**，pipeline 概念可借鉴 |
| `skill_manager` | `<source-repos-root>/skill_manager/` | wiki 系列 skill + session-log-crystallizer + zotero 集成 | 27+ skill 混杂，wiki skill 与 llm-wiki-skill 重叠 | **skill 仓库**，取 session-log-crystallizer |
| `graphiti` | 参考 | 时序知识图谱 + Neo4j/FalkorDB | 需数据库后端，不适合当前轻量场景 | 远期参考 |
| `graphify` | 参考 | AST+LLM 双 pass 知识图 | Python 包，71.5x token 缩减 | 远期参考 |
| `pyrojewel_claude_code` | **本仓库** | session-end→Obsidian 同步已工作；learnings→vault 已工作 | session-log-crystallize 缺失；raw→compile→query 链断裂 | **枢纽** |

**重叠问题**：3 个仓库（claude-obsidian、llm-wiki-skill、skill_manager）都有 wiki-ingest/wiki-compile/wiki-query/wiki-lint，功能高度重叠。需要选一个主引擎。

---

## 2. 知识沉淀主线定义

```
Session (工作)
  │
  ├─ 1. Raw Capture ─── session-end hook 自动写入
  │     输入：conversation transcript
  │     输出：vault/inbox/session_log/<project>/<date>-<id>-session.md
  │     当前状态：✅ 已工作
  │
  ├─ 2. Raw Capture ─── learnings hook 自动写入
  │     输入：session 观察（evaluate-session.js）
  │     输出：vault/inbox/continue_learning/<project>/<id>.md
  │     当前状态：⚠️ hook 存在但 learnings 生成逻辑偏弱（多为手动写入）
  │
  ├─ 3. Raw Capture ─── 手动 /skill 触发
  │     输入：URL / PDF / 文本 / Zotero 条目
  │     输出：vault/inbox/raw/<source-type>/<semantic-name>.md
  │     当前状态：❌ inbox/raw/ 目录不存在
  │
  ├─ 4. Compile / Crystallize ─── 从 inbox 到 wiki
  │     输入：inbox/ 下的 raw + session_log + learning
  │     输出：wiki/ 下的 typed pages（entity / topic / synthesis / claim）
  │     当前状态：❌ llm-wiki-skill 有完整能力但未接入本仓库
  │
  ├─ 5. Query / Reuse ─── 从 wiki 查询
  │     输入：自然语言问题
  │     输出：带引用的合成回答
  │     当前状态：❌ wiki 目录不存在，无可查询内容
  │
  └─ 6. Lint / Maintain ─── wiki 健康
  │     输入：wiki/ 目录
  │     输出：孤儿页、死链、缺失交叉引用报告
  │     当前状态：❌ 同上
```

**主线原则**：
- 文件系统优先，不依赖 Obsidian REST API 或 MCPVault
- vault 路径统一为 `<configure-local-obsidian-vault>/`
- 所有写入走直接 `fs.writeFileSync`（session-end hook 已验证可行）
- wiki 页面用纯 Markdown + YAML frontmatter（Obsidian 兼容但不需要 Obsidian 运行）

---

## 3. 接入优先级

### 现在可接入（不依赖外部契约）

| Skill | 来源 | 接入方式 | 作用 |
|-------|------|----------|------|
| **session-log-crystallizer** | skill_manager | 复制到 skills/，适配 vault 路径 | session_log → wiki/ synthesis page |
| **wiki-lint** | llm-wiki-skill | 复制核心逻辑，简化为纯 grep + shell 检查 | wiki 健康：死链、孤儿 |
| **wiki-query** | llm-wiki-skill | 复制核心逻辑，用 vault 内 grep | 查询已有 wiki 内容 |

### 等 vault 契约确定后再接

| Skill | 原因 | 契约依赖 |
|-------|------|----------|
| **wiki-ingest** (URL/PDF) | 需要 inbox/raw/ 目录结构和命名约定 | raw 目录结构 + 文件命名规则 |
| **wiki-compile** (crystallize) | 需要 wiki/ 目录结构和 page type schema | page type frontmatter schema + wiki/ 子目录规划 |
| **wiki-graph** | 需要 wiki/ 有足够内容才有意义 | wiki/ 至少 20+ 页面后 |
| **claude-obsidian 全套** | 需要 Obsidian REST API 或 MCPVault | Obsidian 插件安装 + MCP 配置 |

### Vault 契约需要定义什么

1. **目录结构**：inbox/raw/ vs inbox/session_log/ vs wiki/ 的层级和命名
2. **Page type schema**：entity / topic / synthesis / claim / source 的 frontmatter 字段
3. **Cross-referencing 规则**：`[[wiki-link]]` vs `@ref` 的统一
4. **Hot cache**：是否保留 wiki/hot.md 的概念

---

## 4. 三层边界

| 层 | 存储位置 | 内容 | 生命周期 | 写入者 |
|----|----------|------|----------|--------|
| **Session Context** | `.claude/SESSION_CONTEXT.md` | 当前工作状态、活跃线程、关键决策、陷阱 | 单次 session，Stop 时覆盖 | session-end hook |
| **References 文档** | `references/*.md` | 仓库映射、skill 提取记录、flow 定义 | 跨 session，手动维护 | 人 + AI |
| **长期知识** | `<configure-local-obsidian-vault>/wiki/` | 概念、实体、方法、洞见、引用关系 | 永久，增量增长 | wiki-compile / crystallize |

**边界规则**：
- SESSION_CONTEXT 只写"现在在做什么"，不写"学到了什么"
- learnings 只写触发-动作规则（confidence + trigger + action），不写概念性知识
- references 只写仓库结构和工作流定义，不写具体技术内容
- wiki 写一切可复用的知识：概念、方法、洞见、引用、比较

```
SESSION_CONTEXT ─── "what I'm doing right now" ─── volatile
.claude/learnings ─── "what to watch out for" ─── semi-volatile (confidence-weighted)
references/ ─── "how things are organized" ─── stable (manual)
vault/wiki/ ─── "what I know" ─── permanent (incremental)
```

---

## 5. 当前 Blockers / 依赖

| Blocker | 影响 | 解法 |
|---------|------|------|
| **wiki/ 目录不存在** | compile/crystallize/query 全链断裂 | 定义 vault 契约 → mkdir → init wiki |
| **inbox/raw/ 不存在** | URL/PDF ingest 无法落地 | vault 契约定义 raw 目录结构 |
| **3 个 wiki 仓库功能重叠** | 不知道用哪个做主引擎 | 选 llm-wiki-skill 作为主引擎（纯文件系统，中文优化） |
| **page type schema 未定义** | compile 输出格式不统一 | 从 llm-wiki-skill 的 frontmatter schema 复制，适配 vault |
| **evaluate-session.js learnings 生成弱** | 自动 learning 提取几乎不工作 | 后续：接入 session-log-crystallizer 作为替代 |
| **Obsidian REST API 未配置** | claude-obsidian 全套不可用 | 短期不依赖 Obsidian；纯文件系统写入即可 |

---

## 6. 推荐下一步

1. **定义 vault 契约**：目录结构 + page type schema + 命名规则（写入 `references/vault-contract.md`）
2. **接入 session-log-crystallizer**：从 skill_manager 复制，适配 vault 路径
3. **接入 wiki-lint**：从 llm-wiki-skill 复制简化版
4. **初始化 wiki 目录**：`mkdir -p <configure-local-obsidian-vault>/wiki/ <configure-local-obsidian-vault>/inbox/raw/`
5. **后续**：wiki-ingest 和 wiki-compile 在契约确定后接入