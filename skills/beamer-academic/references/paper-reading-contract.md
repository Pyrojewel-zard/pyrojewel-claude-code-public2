# Paper-reading Contract

Use this contract only for `report_type: paper-reading`. It is the Markdown
review gate between reading and LaTeX generation.

## Required draft shape

```markdown
---
status: draft
report_type: paper-reading
paper_meta: "TMTT 2026｜噪声消除 LNA｜某组"
original_source: "materials/papers/paper.pdf"
reading_note: "materials/notes/paper-note.md"
note_source: "ljg-paper + pyrojewel-deep-paper"
---

# TMTT 2026｜噪声消除 LNA｜某组

## 核心判断

一句话说明论文改变了什么；区分论文原文结论和我的理解。

## 页面方案（最多 4 页）

| 页 | role | 标题 | 左侧内容 | 右侧图/面板 | note source | evidence boundary |
|---|---|---|---|---|---|---|
| 1 | overview | ... | 问题、贡献、范围 | 图/电路总览 | 解读+原文 | ... |
| 2 | theory-figure | ... | 理论/推导 | 机制图 | 解读+原文 | ... |
| 3 | evidence | ... | 结果与证据强度 | 仿真/测量图 | 结果+QA | ... |
| 4 | discussion | ... | 我的判断 | QA/困惑点 | 深读问答 | ... |

## QA 与困惑点

- **QA**：问题 → 笔记中的回答 → 仍然成立的边界
- **困惑点**：尚未解决的问题；不能写成论文已经证明的结论

## 图件清单

| 图 | 路径 | 来源类型 | 用于哪一页 | 是否待补 |
|---|---|---|---|---|
| 图 1 | ... | paper-original / generated | P1 | no |
```

## Approval transition

Show the complete Markdown plan in the conversation. Do not generate `.tex` or
compile while `status: draft`. After the user approves, change only the status
to `approved`; then generate the deck from this file.

The plan must keep four distinctions visible:

- `解读`: explanation produced by the reading note;
- `原文`: directly supported by the paper;
- `QA`: reader question and answer, not a new measurement;
- `困惑点`: unresolved doubt, missing evidence, or boundary.

If a page has no useful material, remove the row. Four pages is a ceiling, not
a target.
