---
name: plan-evolution-tracker
description: >
  Use when archiving completed plans, reviewing project evolution, or building a
  chronological decision/feature/asset ledger from docs/superpowers/plans.
  Not for writing new plans — use writing-plans for that. This skill extracts
  what matters for project memory: decisions, reasoning, incremental features,
  and output assets. Implementation step-by-step detail is archived, not tracked.
trigger:
  - "归档plan"
  - "plan归档"
  - "项目演进"
  - "evolution"
  - "plan archive"
  - "决策脉络"
  - "plan lifecycle"
  - "完成plan"
---

# Plan Evolution Tracker

项目演进不是按 implementation step 走的，是按**决策、功能增量、产出资产**走的。这个 skill 把 plan 从"执行清单"压缩成"演进记录"——保留对项目有长期价值的判断和产出，归档实现细节。

---

## 1. 核心区分

| 维度 | 保留（演进脉络） | 归档（执行细节） |
|------|-----------------|-----------------|
| **决策** | "选 X 不选 Y 的原因" | "cp fileA fileB 的命令" |
| **思路** | Architecture 3句话概述 | Task N Step M 的具体代码 |
| **功能** | "新增了 output_path precedence" | "compile.sh 第45行的 if 判断" |
| **资产** | 产出文件清单 + 路径 | 验证 grep 命令 |
| **阻塞** | blocker / risk 的结论 | 每步的 bash 输出 |
| **状态** | frontmatter status 变迁 | checkbox 勾选记录 |

**原则**：如果将来回头看这个 plan，你还需要的 → 保留。能从 git log / 文件内容反推的 → 归档。

---

## 2. 工作流程

归档分两阶段：确定性操作（脚本）+ LLM 操作（skill）。

```
plan 完成 / superseded / abandoned
  │
  ├─ Phase A: 确定性归档（tools/archive-superpowers-plan.sh）
  │   ├─ 更新 frontmatter: status + completed-date + superseded-by
  │   ├─ 移动 plan 到 archive/
  │   ├─ 更新 README.md 索引（移除 Active → 添加 Archived）
  │   └─ 运行 verify-superpowers-index.sh
  │
  └─ Phase B: LLM 演进摘要（本 skill）
      ├─ 读取 archive/ 中的 plan
      ├─ 提取决策、功能、资产、阻塞 → 生成 evolution card
      ├─ 追加 evolution card 到 references/evolution-log.md
      └─ 更新主线脉络索引表
```

Phase A 可独立执行，Phase B 需 LLM reasoning。

---

## 3. Evolution Card 格式

每个 plan 归档时产出一个 evolution card，追加到 `references/evolution-log.md`：

```markdown
## {date} — {title}

**主线：** {flow-slug}（如 `paper-flow`、`project-governance`、`wiki-knowledge`）

**状态变更：** active → {completed|superseded|abandoned}

**决策：**
- {decision}: {reasoning}（选择 X 不选 Y，因为…）

**功能增量：**
- {feature description}（{产出文件或路径}）

**产出资产：**
- {file_path} — {one-line description}

**关联提交：** {commit-sha}

**验证证据：** {key command + result}（如 `verify-superpowers-index.sh PASS`）

**阻塞/风险结论：**
- {resolved blocker or residual risk}

**后续动作：** {next plan / residual risk owner / none}

**plan 原文：** archive/{filename}
```

**字段规则：**
- **主线**：稳定 slug（非自由标题），与主线脉络索引表对应
- **状态变更**：简洁记录 frontmatter status 变迁
- **决策**：只记录非显而易见的选择。"用 bash 而不用 python" 要写原因，"按惯例用 YAML" 不用写
- **功能增量**：一行一个，注明对应产出。不要写"修改了 SKILL.md"，写"新增 Section 10 输出路径规范（SKILL.md:330）"
- **产出资产**：列出实际新增/修改的文件，附一行用途说明
- **关联提交**：实现该 plan 的 commit SHA（多 commit 用逗号分隔）
- **验证证据**：关键验证命令和结果，非完整 log
- **阻塞结论**：只写最终的结论，不写过程。resolved 的写怎么解决的，residual 的写风险等级
- **后续动作**：下一步 plan、residual risk 的负责方、或 `none`

---

## 4. 归档操作

### 4.1 状态变迁

| 原状态 | 目标状态 | 触发条件 | 操作 |
|--------|---------|---------|------|
| active | completed | plan 所有 task 已执行并验证 | 移 archive/，status 改 completed |
| active | superseded | 新 plan 替代旧 plan | 移 archive/，加 superseded-by 字段 |
| active | abandoned | 方向变更，不再执行 | 移 archive/，status 改 abandoned |
| draft | abandoned | 从未开始执行 | 移 archive/，status 改 abandoned |

### 4.2 归档步骤

**Phase A（确定性，脚本执行）：**
```bash
bash tools/archive-superpowers-plan.sh plans/{filename} --status {completed|superseded|abandoned} [--superseded-by {new-plan}]
```

脚本自动完成：frontmatter 更新、文件移动、README 索引更新、verify 运行。

**Phase B（LLM，本 skill 执行）：**
1. 读取 `archive/{filename}` 中的 plan
2. 提取决策、功能、资产、阻塞信息 → 生成 evolution card
3. 追加 evolution card 到 `references/evolution-log.md`
4. 更新主线脉络索引表

### 4.3 特殊场景

| 场景 | 处理 |
|------|------|
| plan 部分完成但不归档 | 保持 `status: active`，evolution card 注明"部分完成"和剩余 task |
| plan 被新 plan 拆分/合并 | 旧 plan `superseded-by` 指向所有新 plan（逗号分隔） |
| superseded 但仍有可复用结论 | evolution card 的"后续动作"中注明可复用部分 |
| plan 执行失败但产生重要阻塞结论 | `status: abandoned`，evolution card 详写阻塞结论 |
| 多 commit 实现同一 plan | 关联提交用逗号分隔所有 SHA |
| 归档后需反归档/恢复 active | 移回 `plans/`，frontmatter 改 `status: active`，删除 `completed-date`，更新 README |
| evolution-log 与 README 不一致 | 运行 `verify-superpowers-index.sh`，按报错修复 |

### 4.3 多 plan 合并演进

如果连续几个 plan 属于同一主线（如 paper-flow 系列），归档时在 evolution-log.md 中用主线标题合并：

```markdown
## 主线：论文阅读 → PPT

### 2026-06-01 — Pyrojewel Paper Flow
{evolution card}

### 2026-06-04 — Beamer Output Path
{evolution card}

> 演进脉络：paper-flow 编排骨架 → beamer 输出路径归档到周会文件夹 → paper-flow PPT 产出自包含归位
```

---

## 5. references/evolution-log.md 结构

```markdown
# Project Evolution Log

按时间倒序记录项目的决策、功能增量和产出资产变迁。
每个条目对应一个已完成/替代/废弃的 plan。

---

{evolution cards, 最近的在最上面}

---

## 主线脉络索引

| 主线 | 起点 plan | 当前状态 | 关键演进节点 |
|------|----------|---------|------------|
| 论文阅读 → PPT | 2026-06-01-paper-flow | 活跃 | output-path 归档(06-04) |
| ECC 框架 | 2026-06-02-ecc-adaptation | 完成 | P0/P1/P2 完成 |
| ... | ... | ... | ... |
```

---

## 6. 与其他 skill 的关系

- **writing-plans**：写新 plan 用这个 skill
- **plan-evolution-tracker**：plan 完成后用这个 skill 归档
- **darwin-skill**：优化 skill 质量，不负责演进追踪
- **workflow-output-policy**：定义 frontmatter 和命名规范，本 skill 遵循这些规范执行归档

---

## 7. 输入约定

| 输入 | 来源 | 必需 |
|------|------|------|
| plan 文件路径 | docs/superpowers/plans/*.md | 是 |
| 目标状态 | completed / superseded / abandoned | 是 |
| superseded-by | 新 plan 文件名 | 仅 superseded 时 |
| 主线归属 | 主线名称（用于合并演进） | 否，自动判断或询问 |

---

## 8. 验证

归档完成后，确认：

1. `bash tools/verify-superpowers-index.sh` — ALL CHECKS PASSED
2. `references/evolution-log.md` 包含新 evolution card
3. `docs/superpowers/archive/` 包含归档 plan
4. `docs/superpowers/README.md` Active 表无归档 plan，Archive 表有
5. evolution card 的决策/功能/资产字段非空
6. evolution-log.md 无硬编码绝对路径