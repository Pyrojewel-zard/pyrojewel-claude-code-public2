---
name: pyrojewel-paper-qa
description: "论文阅读对齐拷打。基于pyrojewel-paper的分析结果，与用户自己的理解逐Q对齐——差异点、逼问、对齐结论。不是纠错，是深度理解。Trigger: '论文拷打', '对齐', 'QA对齐', 'paper qa', '拷打论文'。输入是paper-report的markdown文件。"
trigger:
  - "论文拷打"
  - "对齐"
  - "QA对齐"
  - "paper qa"
  - "拷打论文"
user_invocable: true
version: "1.0.0"
---

# pyrojewel-paper-qa: 对齐拷打

拿到pyrojewel-paper的分析后，和你自己读论文的理解对齐。不是纠错——是逼自己想清楚"我到底理解了没有"。

## 你不是

- 不是纠错工具（AI说错了我要纠正）——是验证理解的工具
- 不是摘要生成器——摘要不产生理解
- 不是FAQ——FAQ回答已知问题，拷打暴露未知问题

## 你是

从AI分析和人的理解的差异中，找到理解还没到位的地方，逼问到底，直到对齐。

## 核心逻辑

ljg-qa提取Q链的目的是"复现作者推理"——单向理解论文。
pyrojewel-paper-qa提取Q链的目的是"验证我的理解"——双向对撞：AI分析和人的理解互相拷问。

Q链的来源不是论文原文，而是pyrojewel-paper产出的paper-report。Q链就是拷打的弹药——每个Q我都需要能回答才算真懂了。

## Constants

- **OUTPUT_DIR** = `{project}/notes/papers/`
- **SOURCES_DIR** = `{OUTPUT_DIR}/sources/`

## 格式约束

- Markdown语法：`**bold**`双星号加粗
- 输出目录：`$OUTPUT_DIR`
- 文件命名：`{YYYYMMDDTHHMMSS}--qa-{short-title}.md`

### Markdown 文件头（YAML frontmatter）

```yaml
---
title: qa-{short-title}
date: {YYYY-MM-DD HH:MM}
tags: [qa, paper-alignment]
identifier: {YYYYMMDDTHHMMSS}
source: {paper-report文件路径}
paper: {论文标题}
---
```

## Workflow

### Step 1: 读取paper-report

读取用户指定的paper-report文件。提取AI分析的6个section：问题、翻译、核心概念、洞见、博导审稿、启发。

**前置检查**：
- paper-report文件不存在 → 提示用户先运行 `/pyrojewel-paper`，终止
- 原文备份（`$SOURCES_DIR/{attachmentKey}.md`）不存在 → 警告"无法对照原文，对齐可能不够深"，继续

### Step 2: 生成Q链

从paper-report提取5-10个拷问式Q。Q类型在对齐场景下的含义：

| Q类型 | 对齐含义 | 提取来源 |
|--------|---------|---------|
| 动作 | AI说方法X这样work——我理解它为什么work吗？ | 翻译section的方法描述 |
| 对比 | AI认为核心贡献是A——我认为是B，哪个对？ | 洞见+核心概念section |
| 因果 | AI的启发说可以迁移——具体怎么迁移？ | 启发section的迁移/混搭 |
| 边界 | AI没讨论的局限——我看到了什么AI没看到的？ | 博导审稿section |

Q链按论证依赖排序，不按章节顺序。详细Q设计见 `References/QuestionDesign.md`。

### Step 3: 逐Q交互对齐

对每个Q：

1. 展示Q + AI的判断（从paper-report提取）
2. 询问用户："你怎么看？"（等待用户输入）
3. 比较判断：
   - 一致 → ✅，简短记录
   - 用户补充了AI没看到的 → ✅，记录补充
   - 不同意AI → ⚠️/❌，进入逼问
4. 逼问（仅差异点）：
   - "为什么你的理解和AI不同？"
   - "哪个更有道理？依据是什么？"
   - "如果AI是对的意味着什么？如果你是对的意味着什么？"
5. 写对齐结论（四段：结论/形式化/步骤/边界）

**用户中断处理**：用户说"跳过"→标记⚠️跳过；用户说"够了"→保存当前进度，终止后续Q，直接进入Step 4。

### Step 4: 生成对齐总览

汇总所有Q的对齐状态表格：| Q | 状态 | 关键差异 |

### Step 5: 综合判断

基于所有QA写出综合判断：
- 这篇论文对我的研究意味着什么
- 哪些理解已对齐，哪些还需进一步阅读
- 与其他论文的交叉对比点

### Step 6: 写文件

获取时间戳，写入 `$OUTPUT_DIR/{timestamp}--qa-{short-title}.md`，报告路径。

## Q设计方法论

Q的四类（动/对/因/界）和A的四段结构（结论/形式化/步骤/边界）见 `References/QuestionDesign.md`。

## 红线

1. *Q切要害* — 每个Q不能用一句定义打发
2. *A四段齐* — 结论/形式化/步骤/边界，缺一不可
3. *Q链有方向* — Q之间有依赖，删一个后续会塌
4. *逼问诚实* — 不回避分歧，不强行对齐
5. *对齐结论可抄走* — 每个结论句脱离上下文还能被抄走
6. *状态标注准确* — ✅ 已对齐 / ⚠️ 需进一步阅读 / ❌ 根本性分歧，不虚标

## 输出

qa-report-X.md，结构：

```markdown
# 对齐QA：{论文标题}

## 论文信息
- 论文：{标题}
- AI分析来源：{paper-report路径}
- 原文备份：{sources/attachmentKey.md路径}

## Q1: {从paper-report提取的尖锐问题}

### AI的判断
{从paper-report中提取的相关分析}

### 你的理解
{用户交互输入——你怎么看？}

### 逼问
{如果AI和用户理解不同：为什么不同？哪个更有道理？}

### 对齐结论
*结论*：{一句话}
*形式化*：{一行可视关系}
*怎么想到的*：{论证步}
*边界*：{不成立条件}

### 状态
✅ 已对齐 / ⚠️ 需进一步阅读 / ❌ 根本性分歧

## Q2: ...

## 对齐总览

| Q | 状态 | 关键差异 |
|---|------|----------|
| Q1 | ✅ | 无差异 |
| Q2 | ⚠️ | AI认为核心是X，我认为是Y |
| Q3 | ❌ | 对方法适用范围有根本分歧 |

## 综合判断
{基于所有QA后的理解——这篇论文对我来说意味着什么}
```

## 验收

- *Q切要害*：每个Q不能用一句定义打发
- *A四段齐*：结论/形式化/步骤/边界
- *逼问有料*：差异点不是敷衍过去，是真正追到底
- *状态诚实*：✅/⚠️/❌ 标注符合实际理解程度
- *综合判断落地*：不是空泛感慨，是"这意味着我可以___"