---
name: pyrojewel-paper-flow
description: >
  论文调研闭环编排器。串联 zotero-pdf-parse → pyrojewel-paper → pyrojewel-paper-river →
  pyrojewel-paper-qa → pyrojewel-beamer-academic，用户只需给一个起点就能拿到完整产出。
  触发词：论文阅读、文献调研、paper flow、读论文、论文溯源、论文拷打、对齐。
  即使用户只说"帮我读一下这篇论文"也应触发，因为完整的阅读包含溯源和对齐。
trigger:
  - "论文阅读"
  - "文献调研"
  - "paper flow"
  - "读论文"
  - "论文溯源"
---

论文调研不是碎片操作，是一条闭环。这个 skill 把 PDF 预处理→精读→溯源→对齐→PPT 串成一条链，用户只需给一个起点就能拿到完整产出。

## Constants

- **ZOTERO_MARKDOWN_PATH** = `{zotero_markdown_path}` (from .claude/settings.json env)
- **MARKERPDF_SCRIPT** = `$MARKERPDF_SCRIPT` (default: `/home/DataTransfer/Pyrojewel/01_lab/markerpdf_zotero/scripts/markerpdf_convert.py`)
- **MARKERPDF_ENV** = `$MARKERPDF_ENV` (default: `/home/DataTransfer/Pyrojewel/01_lab/markerpdf_zotero/.env`)
- **OUTPUT_DIR** = `{project}/notes/papers/`
- **IMAGES_DIR** = `{OUTPUT_DIR}/images/`
- **SOURCES_DIR** = `{OUTPUT_DIR}/sources/`

---

## 编排链总览

```
输入（PDF/DOI/arXiv ID/Zotero key/本地.md）
  │
  ├─ Phase 0: 入口分流 ── 判断执行哪条子路线
  │
  ├─ Phase 1: PDF预处理 ── /zotero-pdf-parse（无content.md时）
  │     输入: Zotero item key 或 PDF 路径
  │     输出: content.md + 图片资产（存入 $SOURCES_DIR + $IMAGES_DIR）
  │     条件: 仅当 content.md 不存在时执行；已有则跳过
  │
  ├─ Phase 2: 精读 ── /pyrojewel-paper
  │     输入: content.md 或论文原文
  │     输出: {ts}--paper-{short-title}.md（7-section 精读笔记）
  │     必经步骤，所有模式都执行
  │
  ├─ Phase 3: 溯源 ── /pyrojewel-paper-river（溯源/闭环模式）
  │     输入: Phase 2 的精读笔记（提取批判链）
  │     输出: {ts}--paper-river-{core-title}.md（溯源图谱）
  │     条件: 溯源模式或完整闭环时执行；单篇精读跳过
  │     递归: 对链上每篇新论文，回到 Phase 1 → Phase 2
  │
  ├─ Phase 4: QA对齐 ── /pyrojewel-paper-qa
  │     输入: Phase 2 的精读笔记
  │     输出: {ts}--qa-{short-title}.md（对齐报告 + ✅/⚠️/❌ 状态）
  │     交互式：逐 Q 与用户对齐，用户可中断
  │
  ├─ Phase 5: 汇总 ── research-map（闭环模式）
  │     输入: Phase 2 × N + Phase 3 + Phase 4 × N
  │     输出: research-map-{topic}.md（溯源树 + 对比表 + 洞见 + 下一步）
  │     条件: 仅完整闭环模式
  │
  └─ Phase 6: PPT ── /pyrojewel-beamer-academic（可选）
        输入: Phase 2 的精读笔记 + 图片资产
        输出: presentation.tex + presentation.pdf
        条件: 用户确认需要组会 PPT 时执行
```

---

## Phase 0: 入口分流

用户输入决定执行哪条路线，不要什么都跑：

| 用户说的 | 执行路线 | 跳过的 Phase |
|---------|---------|-------------|
| "读一下这篇论文" | 单篇精读 | 跳 Phase 1(若已有md), 3, 5, 6 |
| "论文溯源" / "论文脉络" | 溯源优先 | 跳 Phase 5, 6 |
| "文献调研" / "调研报告" | 完整闭环 | 无（全执行） |
| 给了 Zotero attachmentKey | 用 key 定位，跳过搜索 | — |
| 给了本地 markdown 路径 | 直接读取 | 跳 Phase 1 |
| 给了 IEEE 网页 URL | 用 WebFetch 获取 | 跳 Phase 1 |

**判断逻辑**：
- 有"溯源"/"脉络"/"river" → Phase 0→1→2→3→4
- 只有"读"/"精读"/"paper" → Phase 0→2→4
- 有"调研"/"调研报告"/"flow" → Phase 0→1→2→3→4→5→6
- 输入是 attachmentKey → Phase 1→2→4
- 输入是本地路径 → Phase 2→4（本地模式）

---

## Phase 1: PDF 预处理（zotero-pdf-parse 接入）

**位置**：精读前的必要入口。论文在 Zotero 库中但没有 content.md 时，必须先转成 markdown。

**调用**：`/zotero-pdf-parse`

**输入约定**：
- Zotero item key（从 Phase 0 搜索获得或用户直接给出）
- 或 PDF 文件路径

**输出约定**：
- `$ZOTERO_MARKDOWN_PATH/{attachmentKey}/content.md` — MarkerPDF 转换的 markdown
- `$ZOTERO_MARKDOWN_PATH/{attachmentKey}/*.jpeg` — 提取的图片资产

**后续衔接**：
- Phase 2 的 `/pyrojewel-paper` 读取此 content.md 作为论文全文输入
- 图片资产在 Phase 2 的资产管理步骤中复制到 `$IMAGES_DIR/{attachmentKey}/`

**跳过条件**：
- content.md 已存在 → 直接进入 Phase 2
- 用户给了本地 .md 路径 → 不需要 PDF 转换
- 用户给了 IEEE URL → WebFetch 直接获取 HTML 内容

**失败处理**：
- MarkerPDF 服务不可用 → 回退到 Zotero MCP `get_content`（截断版，警告用户）
- PDF 无法解析 → 终止，提示"需要可读的论文原文才能继续"

---

## Phase 2: 精读（pyrojewel-paper）

**调用**：`/pyrojewel-paper`

**输入约定**：
- Phase 1 产出的 content.md（Zotero 路径）
- 或用户提供的本地 .md 文件
- 或 IEEE/arXiv URL（pyrojewel-paper 内部处理获取）

**输出约定**：
- `{OUTPUT_DIR}/{ts}--paper-{short-title}.md` — 7-section 精读笔记
- `$IMAGES_DIR/{key}/*.jpeg` — 复制的图片资产
- `$SOURCES_DIR/{key}.md` — content.md 备份

**关键约束**（从 pyrojewel-paper 继承）：
- 图片引用使用相对路径 `images/{key}/xxx.jpeg`
- 每张图必须实际读图后再引用（一律用 vision-batch-read skill 批量并发读，淘汰 Read 逐张读）
- 博导审稿必须有明确判断（accept/borderline/reject）

**在溯源模式下的递归**：
- Phase 3 溯源到新论文时，对该论文执行 Phase 1→2
- 每篇新论文的资产按 key 分区，不冲突

---

## Phase 3: 溯源（pyrojewel-paper-river）

**调用**：`/pyrojewel-paper-river`

**输入约定**：
- Phase 2 产出的精读笔记（提取批判链和 References）
- 或用户直接指定的核心论文

**输出约定**：
- `{OUTPUT_DIR}/{ts}--paper-river-{core-title}.md` — 溯源图谱，包含：
  - ASCII 溯源树（谁批判谁→谁改进谁）
  - 每篇论文的一句话定位
  - 演化叙事（问题如何一步步被重新定义）

**递归规则**：
- 最多 5 层（到奠基论文为止）
- 每层只追最相关的那条线，不发散
- 找不到明确批判对象 → 停止
- **每递归一层后暂停**：展示当前链，问用户"继续溯源？还是够了？"

**递归时的资产处理**：
- 对每篇新论文：Phase 1（PDF预处理）→ Phase 2（精读）
- 不同论文的图片按 key 分区

**前沿延伸（可选）**：
- 反向搜索：目标论文之后有没有改进它的工作？
- 用 `semantic_search` 搜索 `{核心方法} improvement extension`

---

## Phase 4: QA 对齐（pyrojewel-paper-qa）

**调用**：`/pyrojewel-paper-qa`

**输入约定**：
- Phase 2 产出的精读笔记（paper-report-X.md）
- 可选：原始 content.md 备份（$SOURCES_DIR/{key}.md）

**输出约定**：
- `{OUTPUT_DIR}/{ts}--qa-{short-title}.md` — QA 对齐报告，包含：
  - 每个 Q 的 AI 判断 + 用户判断
  - 对齐状态：✅ 一致 / ⚠️ 补充 / ❌ 不同
  - 逼问记录
  - 对齐结论（四段：结论/形式化/步骤/边界）

**交互规则**：
- 逐 Q 展示，用户逐个回答
- "跳过" → ⚠️ 跳过该 Q
- "够了" → 保存进度，直接写总览
- 至少 5 个 Q，每个有状态标记

---

## Phase 5: 汇总 research-map

**条件**：仅完整闭环模式执行。

**输入**：Phase 2 × N + Phase 3 + Phase 4 × N 的所有产出

**输出**：`{OUTPUT_DIR}/research-map-{topic}.md`，包含：
- 溯源树（ASCII）
- 论文对比表格（方法/维度/精度/判决）
- 已对齐/待对齐理解点
- 关键洞见
- 下一步行动

---

## Phase 6: 可选 PPT（pyrojewel-beamer-academic）

**条件**：用户确认需要组会 PPT 时执行。

**调用**：`/pyrojewel-beamer-academic`

**输入约定**：
- Phase 2 产出的精读笔记（.md）
- 图片资产（$IMAGES_DIR/ 下的图片）
- Phase 3 的溯源图谱（如有，用于 PPT 框架页）
- Phase 4 的 QA 对齐结论（如有，用于综合判断页）

**输出约定**：
- `presentation.tex` — LaTeX Beamer 源码
- `presentation.pdf` — 编译后的 PDF
- `materials/figures/` — PPT 使用的图片

**输出路径约定**：
- 如果 paper-flow 调用时用户指定了 `output_path`，传递给 `/pyrojewel-beamer-academic`
- 如果未指定，beamer skill 自行按 precedence 规则解析（默认 Obsidian 周会文件夹）

**PPT 结构设计**：
- 开场(1页)：调研方向说明
- 框架页（来自 Phase 3 river）：
  - 溯源地图(1页)
  - 问题演化叙事(2-3页)
  - 洞见总结(1页)
- 论文解读页（来自 Phase 2 paper，每篇 2-3页）：
  - 问题体验 + 方法翻译
  - 核心论文加核心概念页
- 综合判断页(1-2页)：
  - 各论文启发汇总
  - 交叉对比（river 的差异驱动叙事）
  - 我的判断
- 下一步计划(1页)

**注意**：`/pyrojewel-beamer-academic` 是正式 PPT skill。原 `/beamer-academic` 和 `/pyrojewel-academic-ppt` 已被替代，不再调用。

---

## 文件结构

```
notes/papers/
├── {ts}--paper-{short-title}.md          ← Phase 2 精读报告
├── {ts}--paper-river-{core-title}.md     ← Phase 3 溯源报告（仅溯源模式）
├── {ts}--qa-{short-title}.md             ← Phase 4 QA对齐报告
├── research-map-{topic}.md               ← Phase 5 汇总地图
├── images/
│   ├── {key1}/                            ← 论文1图片
│   ├── {key2}/                            ← 论文2图片
│   └── ...
└── sources/
    ├── {key1}.md                           ← 论文1 content.md备份
    ├── {key2}.md                           ← 论文2 content.md备份
    └── ...
```

时间戳：`YYYYMMDDTHHmmss`

---

## 调用约定汇总

| Phase | Skill | 输入 | 输出 | 必经 |
|-------|-------|------|------|------|
| 1 | `/zotero-pdf-parse` | Zotero item key / PDF path | content.md + images | 仅无 content.md 时 |
| 2 | `/pyrojewel-paper` | content.md / URL / 本地.md | 精读笔记 + 图片资产 | 是 |
| 3 | `/pyrojewel-paper-river` | 精读笔记（批判链） | 溯源图谱 | 溯源/闭环模式 |
| 4 | `/pyrojewel-paper-qa` | 精读笔记 | QA对齐报告 | 是 |
| 5 | (内置) | 所有产出 | research-map | 闭环模式 |
| 6 | `/pyrojewel-beamer-academic` | 精读笔记 + 图片 + 溯源 | PPT (tex+pdf) | 用户确认时 |

---

## 验收标准

1. ✅ 至少一篇完整 7-section 精读报告
2. ✅ 图片引用使用相对路径且文件存在
3. ✅ 博导审稿有明确判断（accept/borderline/reject）
4. ✅ QA 对齐至少 5 个 Q，每个有状态标记
5. ✅ research-map 包含溯源树和对比表格（闭环模式）
6. ✅ PPT 编译成功且通过质量检查清单（Phase 6 执行时）
