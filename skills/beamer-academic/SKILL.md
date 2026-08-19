---
name: beamer-academic
description: >
  Use when generating a paper-reading or academic Beamer deck for a conference,
  group meeting, or algorithm report, especially when the input includes a paper,
  ljg-paper/ljg-read notes, pyrojewel-deep-paper notes, QA, reader questions, or
  an implementation-report bundle with workflow/code-status artifacts.
  Also use for 开题/会议/conference talks; for thesis-defense work that needs the
  evidence contract and Obsidian weekly output, use pyrojewel-beamer-academic.
metadata:
  version: 1.6+pyrojewel.2
  trigger:
  - "beamer-academic"
  - "开题PPT"
  - "会议报告"
  - "conference PPT"
  - "conference talk slides"
  - "单篇论文组会PPT"
  - "论文精读PPT"
  - "阅读笔记排版"
  - "论文复现汇报"
  - "算法复现PPT"
  - "上游 beamer"
  - "原版 beamer"
  local_notes: |
    Local fork of upstream 788e125 (v1.5), with paper-reading and reproduction
    profiles plus local theme patches. See LOCAL-NOTES.md for patch and sync details.
    pyrojewel-beamer-academic owns defense-side triggers (答辩PPT / 答辩 / 论文PPT).
---

# Beamer Academic

Generate publication-quality Beamer slides from an academic paper in one automated pipeline.

## Pipeline Overview

```
论文 → 素材提取 → 大纲生成 → [用户确认] → 内容填充 → 编译 → [交互修改循环]
```

## Phase 0: Environment Check & Input Clarification

### 0.1 Locate Thesis File

Search current directory for thesis in priority order:
1. `.tex` (LaTeX source — best quality, figures/equations directly reusable)
2. `.docx` (Word — good for text extraction, figures embedded)
3. `.pdf` (PDF — acceptable but figure extraction may lose quality)

If multiple candidates found, ask user which one.
If none found, prompt: "请把论文文件放到当前目录（支持 .tex / .docx / .pdf）"

**Recommend .tex or .docx over PDF**: PDF figure extraction can produce low-quality raster images.
If user only has PDF, warn:
> 注意：PDF 提取的图片可能有质量损失。如果你有论文的 Word 或 LaTeX 源文件，建议优先使用。

### 0.2 Check LaTeX Environment

```bash
which xelatex
```

If missing, **recommend user to install** (this is a one-time setup, not optional):

> 你的系统还没有安装 LaTeX 环境。beamer PPT 需要 xelatex 编译，我来帮你装一下：

Then provide the command for user's OS and **offer to run it**:

| OS | Command |
|----|---------|
| macOS | `brew install --cask mactex-no-gui` (推荐，约3.5GB，装一次永久可用) |
| Ubuntu/Debian | `sudo apt install texlive-xetex texlive-lang-chinese texlive-fonts-recommended` |
| Fedora/RHEL | `sudo dnf install texlive-xetex texlive-xecjk` |
| Windows (WSL) | `sudo apt install texlive-xetex texlive-lang-chinese` |
| Arch | `sudo pacman -S texlive-xetex texlive-langchinese` |

Wait for installation to complete, verify with `which xelatex`, then proceed.

If user explicitly refuses to install (rare), fallback: deliver `.tex` + `.sty` + figures, suggest Overleaf.

### 0.3 Beamer Template (Ask User First)

Ask user about existing school beamer template:

> 你的学校/课题组有现成的 beamer 模板吗？（比如导师或师兄给过的 .sty 文件）
> - 有：请放到当前目录，我直接使用
> - 没有：我来帮你找或用内置通用模板

If user has a template: use it directly, skip the built-in theme.

If user has NO template:
1. Ask for school name
2. Search for existing public beamer templates for that school:
   - GitHub search: `{school name} beamer template`
   - Common sources: Overleaf Gallery, CTAN
3. If found: download and use (notify user which template)
4. If not found: use built-in `assets/beamerthemeAcademic.sty` with school logo
   - Ask: "你能提供学校 logo 图片吗？（放到当前目录即可）"
   - If no logo available: search online for the school's logo, or proceed without logo

### 0.4 Configuration

Check for `config.yaml` in current directory:
- Exists: read and use.
- Missing: ask user for basic info, then generate from template at `assets/config.yaml`.

Required user info (ask if not in config):
- Institution name and department
- Author name, supervisor, major
- Report type: `defense` | `proposal` | `conference` | `paper-reading` | `reproduction`
- Color preference: `blue` | `red` | `green` | `purple` | `teal`
- Time limit (minutes): affects page count and content density
- Language: thesis language vs. PPT language (e.g., 英文论文 → 中文PPT)
- **Chapnote preference**: "每页要不要显示'对应论文 §X.X'的标注？"（some users find it helpful for committee, others find it cluttered）

If the input is exactly one paper, one paper plus one reading note, or one
reading note with an identifiable paper, infer `report_type: paper-reading`
unless the user explicitly requests `defense`, `proposal`, `conference`, or
`reproduction`. Do not make the user edit `config.yaml` just to activate this
profile.

#### Reproduction profile

When `report_type: reproduction` is selected, or the user explicitly asks for
a paper-algorithm reproduction report, switch from thesis-chapter planning to
a paper-unit contract. Confirm the paper list, full-text/source status, code
entry points, datasets or run IDs, and evidence ceiling before drafting slides.
Each paper becomes a 2--5 page unit:

```text
overview              problem, contribution, source figure, and scope
algorithm-derivation  core equations, assumptions, and solver steps
paper-code-map        paper step/formula ↔ file:function ↔ implementation state
reproduction-result   measured validation, or explicitly labelled migration design when not reproduced
optional-boundary     equivalent circuit, failure case, or paper/project gap
```

The four non-optional roles are `overview`, `algorithm-derivation`,
`paper-code-map`, and `reproduction-result`. A fifth page is added only when it
clarifies physical interpretation or a material boundary. Do not force every
paper to five pages.

For this profile, the generated deck must use the fields documented in
`references/reproduction-contract.md`: `paper_id`, citation and Zotero keys,
source status, code entry, dataset/run, evidence level, and claim boundary.

#### Paper-reading profile: 组会论文单元

Use `report_type: paper-reading` when the task is to explain one paper for a
group meeting or paper-reading session. This profile is different from
`reproduction`: it does not require a code map or a measured reimplementation.
It combines the paper with one normalized reading note.

Input routing is explicit:

1. If the user provides a note from `/ljg-paper`, use it as the first-pass
   interpretation.
2. If the same note has a `pyrojewel-deep-paper` section appended, treat that
   append as the source for the reader's QA, doubts, and unresolved boundaries;
   do not create a second competing note. The rough-read and deep-read outputs
   are one shared note for this skill's input contract, not two slide sources.
3. If the user provides only a paper, first use `ljg-read` to read it and turn
   the resulting understanding into the normalized Markdown input before
   drafting slides. If the user asks for a saved paper note rather than an
   interactive companion read, use `/ljg-paper` first.
4. Record the actual source in the draft plan as `provided-note`, `ljg-paper`,
   `pyrojewel-deep-paper`, or `ljg-read`; never imply that a QA or measurement
   exists when it is absent.

The paper unit has at most **4 content pages per paper**, including an optional
`workflow-overview` page when an implementation-report bundle is included. A
shared deck cover does not count as a paper unit page; do not add a separate TOC
for one paper by default. Without a workflow page, the default four-page
contract is:

| Page | Role | Left side | Right side |
|------|------|-----------|------------|
| 1 | `overview` | problem, contribution, scope | paper overview/circuit figure |
| 2 | `theory-figure` | theory, mechanism, or short derivation | circuit/method figure |
| 3 | `evidence` | result interpretation and evidence strength | result/simulation/measurement figure |
| 4 | `discussion` | reader's takeaway and claim boundary | QA, confusion, or unresolved question |

Pages 2--3 default to the group's preferred geometry: theory or interpretation
on the left and one readable paper figure on the right. Page 4 is included only
when the note contains QA, doubts, or a meaningful boundary; otherwise it is a
compact conclusion page. Never pad a paper to four pages.

When `workflow-overview` is needed inside a paper-reading unit, it consumes one
of the four slots and must come before code/status content. Use at most three
paper-role pages in that case; merge the discussion into the evidence page or
omit it rather than creating a fifth page. The same counting rule applies to a
workflow page inserted into a reproduction unit's `pages_per_paper` range.

### Paper-reading Markdown gate

For `paper-reading`, Phase 2 must create `outline.md` as a reviewable Markdown
layout plan before any `.tex` generation. Show the plan in the conversation and
stop. The plan must contain paper metadata, note/original-source paths, page
roles, selected figures, the mapping of reading-note interpretation/QA/doubts,
and the evidence boundary for each claim. Generate LaTeX only after the user
explicitly approves the plan. A vague approval such as “继续” is sufficient
only after the complete plan has been shown; do not silently skip the gate.

### Implementation-report handoff

When the requested deck includes code status, an implementation plan, or a
reproduction workflow, use the `implementation-report` skill first. It owns
plan intake, code-state analysis, Mermaid source, and workflow rendering.

Expected bundle:

```text
materials/implementation-report/
├── manifest.yaml
├── implementation-report.md
├── workflow.mmd
├── workflow.html
└── workflow.png
```

`beamer-academic` follows `manifest.yaml` and consumes the canonical PNG;
`workflow.mmd` remains the semantic source and `workflow.html` the editable
diagram-design source. It must not independently reinterpret planning files or
replace the workflow with a code dump. If the bundle or manifest is missing,
ask for it or route the task to `implementation-report` before drafting the
slide outline.

### 0.5 Language Strategy

If thesis language ≠ PPT language, establish rules upfront:

> 你的论文是英文，PPT 要做中文版吗？
> 对于专业术语，我会：
> 1. 首次出现用"中文（English）"格式
> 2. 之后统一用中文
> 3. 公式/变量名保持英文不翻译
>
> 这样处理可以吗？

Build a **terminology mapping table** (stored in `materials/terms.md`):
```
| English | 中文 | 首次出现页 |
|---------|------|-----------|
| disparity | 形态多样性 | P4 |
| diversity | 分类丰富度 | P4 |
| Ornstein-Uhlenbeck | OU 过程 | P8 |
```

Ensure **术语一致性**: same concept uses same translation across all pages.

## Phase 1: Material Extraction

Create `materials/` directory. Extraction strategy depends on input format:

### From .tex source (best)
1. **Figures**: locate `\includegraphics` paths, copy originals → `materials/figures/`
2. **Tables**: extract `tabular`/`table` environments → `materials/tables/`
3. **Equations**: extract `equation`/`align`/`$$` blocks → `materials/equations.md`
4. **Structure**: parse `\chapter`/`\section` hierarchy → `materials/structure.md`

### From .docx
1. **Figures**: extract embedded images (python-docx or unzip) → `materials/figures/`
2. **Tables**: extract table contents → `materials/tables/`
3. **Equations**: extract OMML/LaTeX equations → `materials/equations.md`
4. **Structure**: parse heading hierarchy → `materials/structure.md`

### From .pdf (fallback)
1. **Figures**: use `pdfimages` or read PDF for embedded images → `materials/figures/`
   - ⚠️ Quality may degrade. Prefer vector (PDF/SVG) extraction when possible.
2. **Tables**: read and reconstruct → `materials/tables/`
3. **Equations**: read and convert to LaTeX → `materials/equations.md`
4. **Structure**: parse chapter/section from text → `materials/structure.md`

### 1.2 Material Confirmation (In-Conversation)

After extraction, present a **figure catalog** to user in conversation:

> ## 🖼️ 素材库（共提取 12 张图）
>
> | # | 文件名 | 来源 | 内容描述 |
> |---|--------|------|----------|
> | 1 | fig_001.png | 论文图1 | 地质年代柱状图 |
> | 2 | fig_002.png | 论文图4 | PCoA 碎石图 |
> | 3 | fig_003.png | 论文图8 | 形态空间散点图 |
> | ... | | | |
>
> **哪些图是你答辩必须展示的？** 可以说：
> - "1, 3, 5, 8 必须用"
> - "图7 不用了，跟图5 重复"
> - "全部都可能用到"

This ensures:
- Key figures won't be missed in layout assignment
- User has a mental model of available materials before the outline phase
- Low-quality or duplicate figures can be flagged early

## Phase 2: Brainstorm Outline (Interactive, In-Conversation)

**This phase determines the entire presentation structure through conversation with the user. All confirmation happens IN THE CHAT — never ask user to open a file.**

### 2.0 Chapter Structure Principle

**Follow the thesis's own structure as the PRIMARY basis for PPT chapters.**

- If thesis has explicit chapters (第一章...第四章): map directly to PPT chapters
- If thesis has no chapters (like a conference paper with sections): group related sections into 3-5 logical chapters for the PPT
- Do NOT invent arbitrary chapter divisions that don't match the thesis logic
- The PPT chapter structure should feel natural to someone who has read the thesis

#### 2.0R Reproduction unit principle

For `report_type: reproduction`, the paper list is the primary structure. Do not
insert a generic chapter divider before every paper. The first page of each paper
unit should already state the paper, algorithm question, and evidence boundary;
use a compact white section header only when the unit needs an explicit visual
marker. The unit order is `overview → algorithm-derivation → paper-code-map →
reproduction-result`, followed by the optional boundary page.

#### 2.0P Paper-reading unit principle

For `report_type: paper-reading`, the paper itself and its normalized reading
note are the primary structure. Do not build thesis-style chapters. Draft one
four-row Markdown plan using the roles `overview`, `theory-figure`, `evidence`,
and `discussion`; remove a row when the note has no material for it. Keep the
paper metadata in the title/subtitle layer, not inside the body paragraph.

### 2.1 First Pass: Structure Proposal

After reading the thesis, propose the high-level structure directly in conversation:

> ## 📐 PPT 结构提案
>
> 根据你的论文结构，我建议这样安排：
>
> **总页数**：42 页（约 20 分钟答辩）
>
> | 章 | 标题 | 页数 | 对应论文 | 说明 |
> |---|------|------|---------|------|
> | 一 | 研究背景与科学问题 | 8页 | 第1章 | 背景+命题+假设+创新点 |
> | 二 | 数据构建与描述性分析 | 7页 | 第2章 | 数据来源+特征工程+时序总览 |
> | 三 | 演化模式与驱动机制 | 15页 | 第3章 | H1+H2+H3 三个假设检验 |
> | 四 | 结论与展望 | 5页 | 第4章 | 主要结论+局限+展望+成果 |
>
> **你觉得这个结构可以吗？** 可以告诉我：
> - "第三章太长了，拆成两章"
> - "加一章文献综述"
> - "总页数控制在35页以内"

Wait for user to confirm or adjust. Loop until structure is approved.

For `paper-reading`, replace the multi-chapter proposal with this compact
Markdown proposal and wait for explicit approval:

```markdown
# TMTT 2026｜噪声消除 LNA｜某组

来源：`materials/notes/paper-note.md` + `materials/papers/paper.pdf`
来源类型：`ljg-paper` + `pyrojewel-deep-paper`

| 页 | 角色 | 标题 | 左侧 | 右侧 | 笔记来源 |
|---|---|---|---|---|---|
| 1 | overview | 为什么要做噪声消除 | 问题与贡献 | 论文电路图 | 解读 |
| 2 | theory-figure | 噪声抵消怎样成立 | 小推导与直觉 | 机制图 | 解读+原文 |
| 3 | evidence | 仿真/测量到底支持什么 | 指标与证据强度 | 结果图 | 结果+QA |
| 4 | discussion | 这篇论文还留下什么问题 | 我的判断与边界 | QA/困惑点 | 深读问答 |
```

The plan is the contract for content generation. If a figure is missing, mark
the right slot as `待补图` in Markdown and ask for it; do not replace it with a
full-page screenshot or invent a result.

### 2.2 Second Pass: Per-Section Detail

Once chapter structure is approved, expand each chapter **in conversation** (not in a file):

> ## 📋 第一章 详细安排（8页）
>
> | 页码 | 版式 | 标题 | 内容要点 |
> |------|------|------|----------|
> | P3 | 章节分隔 | 一、研究背景与科学问题 | — |
> | P4 | 左文右图 | 寒武纪辐射与软体动物的演化窗口 | 演化窗口介绍 + 地质年代图 |
> | P5 | 纯文段 | 经典命题：Disparity vs. Diversity | 形态多样性与丰富度争论 |
> | P6 | 纯文段 | 驱动机制之一：外源突变 | Sinsk 事件背景 |
> | P7 | 纯文段 | 驱动机制之二：系统发育约束 | OU 过程假说 |
> | P8 | 列表 | 现有研究的四点不足 | 4个gap |
> | P9 | 表格 | 研究目标与三个核心假设 | H1/H2/H3 表格 |
> | P10 | 列表 | 论文的主要创新 | 5个创新点 |
>
> **这章的安排可以吗？** 可以说：
> - "P5和P6合并成一页"
> - "P9加一列'若成立则说明'"
> - "ok，继续下一章"

Present **one chapter at a time**. Wait for approval before showing the next chapter.

### 2.3 Third Pass: Final Confirmation

After all chapters are individually approved, show a **complete summary** in conversation:

> ## ✅ 最终大纲确认
>
> | 章 | 页码范围 | 页数 | 版式分布 |
> |---|---------|------|----------|
> | 封面+目录 | P1–P2 | 2 | cover, toc |
> | 一 研究背景 | P3–P10 | 8 | 分隔×1, 左文右图×1, 纯文段×3, 列表×1, 表格×1, 列表×1 |
> | 二 数据构建 | P11–P17 | 7 | 分隔×1, ... |
> | 三 演化机制 | P18–P32 | 15 | 分隔×1, ... |
> | 四 结论展望 | P33–P37 | 5 | 分隔×1, ... |
> | 致谢 | P38 | 1 | thanks |
> | **合计** | | **38页** | |
>
> **确认后我将开始生成 beamer LaTeX 代码。确认吗？**

**HARD GATE: Do NOT proceed to Phase 3 until user explicitly confirms the final summary.**

### 2.4 Save to outline.md

For legacy multi-chapter decks, save `outline.md` only after final confirmation.
For `paper-reading`, write the draft `outline.md` before LaTeX generation so
the user can review the exact page plan; after approval, mark it
`status: approved` and use that same file as the Phase 3 contract. `outline.md`
is the only planning artifact that may unlock generation.

### Why In-Conversation Instead of File

- Users who don't know markdown can follow along naturally in chat
- Iterative refinement is faster (no "go check that file" round-trip)
- Each chapter gets individual attention

### Layout Selection Rules (used in 2.2 per-page assignment)

For `reproduction`, use this priority before the generic thesis rules:

1. `paper-overview` — problem/contribution plus one large source or schematic figure
2. `workflow-overview` — implementation-report workflow and current state; required before code pages when a code/plan bundle exists
3. `algorithm-derivation` — left narrative/assumptions, right formula or algorithm flow
4. `paper-code-map` — paper steps on the left, code entry and status on the right
5. `reproduction-result` — metrics and decision on the left, measured/reproduced figure on the right; a `not-reproduced` unit may use a clearly labelled migration-validation design figure
6. `pole-zero-circuit` — physical interpretation and equivalent-circuit return path
7. `method-comparison` — compare fitting methods only after each method has its own evidence

For `paper-reading`, use this priority before all generic rules:

1. `paper-reading-overview` — problem/contribution plus one source figure
2. `paper-reading-theory-figure` — theory or derivation on the left, mechanism/circuit figure on the right
3. `paper-reading-evidence` — evidence interpretation on the left, result figure on the right
4. `paper-reading-discussion` — reader takeaway and claim boundary on the left, QA/confusion panel on the right

The profile is capped at 4 content pages per paper. Do not add a generic
section divider or TOC to a one-paper unit unless the user requests it.

If an implementation-report bundle is supplied to a paper-reading deck, put
`workflow-overview` before any code or implementation-status content. The
workflow page is an integration prelude, not a replacement for the paper's
theory/evidence pages.

The default content geometry is 38--44% for the left explanation and 56--62%
for the right evidence. A right-side figure should be one readable figure or
one structured composite, not a row of tiny decorative thumbnails.

For other report types, retain the generic rules:

7. Each chapter start → `section-divider`
8. Core formula/model definition → `formula`
9. Multi-row data comparison → `table`
10. High-information figure (multi-panel, heatmap) → `full-image`
11. Text-primary with supporting figure → `text-left-image-right`
12. Figure-primary with interpretation → `image-left-text-right`
13. Pure concept/background → `text-only`
14. Chapter-end with clear conclusion → `conclusion-box`
15. Between chapters → `transition`
16. Parallel bullet points → `list`

### Rhythm Constraints

- No 3 consecutive pages with same layout
- Each chapter uses at least 3 different layouts
- Total: 35–50 pages (defense), 25–35 (proposal), 15–25 (conference),
  and at most 4 content pages per paper (paper-reading)

## Phase 3: Content Generation

1. Copy `assets/beamerthemeAcademic.sty` to current directory.
2. Generate `defense.tex` file header. Read `references/tex-header.md` for template.
3. For each page in `outline.md`:
   - Load layout skeleton from `references/layouts.md` (find section by layout id)
   - Fill slots with thesis content + extracted materials
4. Close with `\end{document}`.

For `paper-reading`, the generation order is strict: read the approved
`outline.md` → copy the paper figures → fill the four role layouts → compile.
Do not generate a `.tex` file while the plan is still `status: draft`.

### Critical: Section Divider and reproduction units

Legacy `defense`, `proposal`, and `conference` decks may use
`\sectiondivider{1}{章标题}`. In `reproduction`, the same macro is rendered as a
white-background compact header with a thin accent rule; it must not create a
full-page color field. The paper title and unit role should carry the section
identity, so a dedicated divider is optional. The table of contents appears at
most once when the selected report type needs it.

### Critical: Paper algorithm ↔ implementation ↔ result

Every reproduction paper unit must make the following correspondence explicit:

```text
paper equation/step → repository file:function and parameters → run/data → plotted result → boundary
```

The `paper-code-map` page must show the paper step or equation number, the exact
`file:function` entry, the implementation state (`paper-faithful`,
`formula-mapped-minimal`, `project-extension`, or `not-reproduced`), and a short
code excerpt. The `reproduction-result` page must name the frequency band,
split/holdout or sample scope, metric, and data/script source when a run exists.
For `not-reproduced`, it must instead state that no runner/holdout exists and
label the right-side figure as a migration-validation design. A paper figure is
source evidence; a generated schematic is labelled `示意重绘`; neither one is a
measured reproduction result.

When an implementation-report bundle exists, the first implementation page
must show its rendered workflow and current state. Code excerpts remain
secondary evidence and must carry the plan step, file/function, input/output,
status, evidence, and next action from the bundle.

### Critical: Reading note ↔ slide claim

Every `paper-reading` page must label which material it uses:

- `解读` — the normalized explanation from the reading note
- `原文` — directly supported by the paper
- `QA` — a question/answer from the note, not a new experimental result
- `困惑点` — the reader's unresolved doubt or boundary

Keep these separate. A reader's speculation belongs in `我的判断` or
`困惑点`, not in the paper's contribution. If the note and original disagree,
show the disagreement in the Markdown plan and preserve the claim boundary.

### Critical: TOC Page Format

The TOC page (P2) must use Chinese numbering with em-dash subtitles:
```latex
\begin{frame}
  \frametitle{汇报提纲}
  \vskip0.3cm
  {\footnotesize
  \begin{tabbing}
  \hspace{0.4cm}\=\hspace{0.6cm}\=\kill
  \textbf{\color{accentcolor}一}\>\textbf{研究动机}\,——\,为什么需要新的序列建模方案\\[8pt]
  \textbf{\color{accentcolor}二}\>\textbf{模型架构}\,——\,Transformer 的核心设计\\[8pt]
  \textbf{\color{accentcolor}三}\>\textbf{实验结果}\,——\,翻译质量与消融分析\\[8pt]
  \textbf{\color{accentcolor}四}\>\textbf{总结与展望}\,——\,贡献与未来方向\\
  \end{tabbing}
  }
\end{frame}
```

### Critical: Figure Extraction from PDF

**NEVER use full-page PDF screenshots as figures.** When source is PDF:

1. Use `pdfimages -all paper.pdf materials/figures/` to extract embedded vector/raster images
2. If `pdfimages` not available, use `mutool extract` or Python `PyMuPDF`
3. If only `pdftoppm` is available, crop the figure region ONLY:
   - First identify figure bounding box coordinates
   - Use Python PIL to crop the figure out of the page image
   - Remove surrounding text, page numbers, captions
4. **Quality check**: if extracted figure contains visible paper text around it, it's WRONG — re-crop
5. For well-known papers (Transformer, ResNet, etc.), consider re-drawing key diagrams with tikz

### Critical: Anti-AI Writing Style (NO Bullet List Abuse)

**The #1 sign of AI-generated slides is overuse of `\begin{itemize}` and uniform page structure.**

Core rules:
1. Each page COMBINES multiple elements (段落+keybox, 段落+公式+段落, 段落+表格+结论)
2. Adjacent pages MUST use different composition patterns
3. `\begin{itemize}` is BANNED. Only `\enumerate` with intro paragraph allowed
4. 80% of pages use paragraph-style writing, not bullet points
5. Use inline patterns: `$\bullet$ \textbf{term}`, `\alert{keyword}`, `\textbf{title}\,——\,explanation`

**Read `references/writing-style.md` for 6 concrete composition patterns with LaTeX code examples.**

### Content Quality Rules

| Constraint | Value |
|-----------|-------|
| Text per page (text-only) | 150–200 chars |
| Text per page (with figure) | 100–150 chars |
| Equations per page | max 2 |
| Table rows | 3–8 |
| `\alert{}` keywords per page | 1–2 |
| Page structure | COMBINE multiple elements (see writing-style.md) |
| `\itemize` | BANNED |

For `reproduction`, apply an additional capacity rule: each paper uses 2–5
pages, every page has one explicit claim, and the four required roles cannot be
replaced by a generic conclusion or transition page.

For `paper-reading`, apply an additional capacity rule: each paper has at most
four content pages, each row in `outline.md` has one page role and one primary
claim, and the fourth page is omitted when there is no QA, confusion, or useful
boundary to discuss.

### Section Divider (Legacy only)

Every chapter boundary in legacy thesis modes may use
`\sectiondivider{1}{章标题}`. In reproduction mode, do not insert a full-bleed
divider and do not use a transition page merely to separate papers.

### Anti-AI Title & Content Check

Before finalizing, check all titles and content. **Read `references/writing-style.md`** for the full red-flag list.

Quick check: "这个标题/段落像答辩学生写的还是 AI 写的？" 如果像 AI，改到像人。

### Figure & Table Numbering

All figures and tables in the presentation MUST be numbered sequentially:

- Figures: `图 1`, `图 2`, `图 3`... (using `\figcap{图 1\;描述文字}`)
- Tables: in frame title or above table, mark as `表 1`, `表 2`...

Example:
```latex
\figcap{图 1\;Transformer 编码器--解码器架构}
\figcap{图 2\;多头注意力并行投影机制}
```

Table title pattern:
```latex
\frametitle{机器翻译 BLEU 对比（表 2）}
% or inside the frame:
{\small\textbf{表 1}\;不同层类型的复杂度对比}
```

Numbering must be consistent throughout — do not skip or repeat numbers.

## Phase 4: Compilation & Layout Verification

### 4.1 Compile

```bash
xelatex -interaction=nonstopmode defense.tex && xelatex -interaction=nonstopmode defense.tex
```

On failure: read `defense.log`, fix common issues (missing image, font, overfull hbox), retry up to 3 times.

If user has no LaTeX environment, skip compilation and deliver `.tex` + `.sty` + `materials/figures/`.

### 4.2 Layout Bug Detection

After compilation, check `defense.log` for these common layout issues:

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Overfull \vbox` on frame | Content exceeds page height | Reduce text, split into 2 pages, or shrink font |
| `Overfull \hbox` with image | Image too wide for column | Add `keepaspectratio`, reduce `width` |
| Image overlaps text in columns | `\column` width sum > `\textwidth` | Ensure left + right column ≤ 1.0 |
| tikz overlay covers text | `[remember picture, overlay]` node position wrong | Adjust `yshift`/`xshift` values |
| Text runs below frame | Too many paragraphs | Cut to 150-200 chars or split page |

**Proactive overlap prevention** (apply during Phase 3 content generation):
- For `text-left-image-right`: left text ≤ 150 chars, image height ≤ `3.4cm` per image
- For `image-left-text-right`: right text ≤ 120 chars, image height ≤ `0.60\textheight`
- For `full-image`: use **only** tikz overlay positioning, no surrounding text except `\figcap`
- For `formula`: max 2 equations, with `\vskip0.1cm` spacing between
- Never put more than 3 `\vskip` commands in one frame (sign of overstuffing)

For a reproduction deck, run the structural validator before visual review:

```bash
python scripts/validate_reproduction_deck.py \
  --tex presentation.tex \
  --manifest materials/reproduction_manifest.yaml \
  --pdf presentation.pdf
```

The validator checks the four required roles per paper, the 2–5 page range,
the presence of a `file:function` code entry and implementation status, result
figure paths, and the absence of the old full-bleed divider contract. A clean
LaTeX log is necessary but does not replace this evidence check.

For a `paper-reading` deck, run a structural check before compilation:

```bash
rg -n "status: approved|paper-reading-(overview|theory-figure|evidence|discussion)" outline.md
```

Confirm that the paper has no more than four role rows, every page has a
source label, and any QA/confusion page is traceable to the supplied note.

**If overlap detected in compiled PDF** (user reports "P7图文重叠了"):
1. Identify the frame in `.tex`
2. Check: is text too long? Is image too tall? Are column widths correct?
3. Apply fix: reduce text / shrink image / split into 2 pages
4. Recompile and verify

## Phase 5: Interactive Editing (Guided Choices)

Present result:

> ✅ PDF 已生成：./defense.pdf（共 XX 页，预计答辩时长 XX 分钟）
> 说修改意见，或说"满意"结束。

### 5.1 Guided Modification (Never Let User Struggle to Express)

When user gives vague feedback, **offer concrete choices** instead of asking them to describe:

| User says | Respond with choices |
|-----------|---------------------|
| "这页不好看" | "你觉得是：A. 文字太密想拆成两页？B. 图太小想换成满版图？C. 想换个版式？" |
| "这里有点奇怪" | "我看到可能的问题：A. 图文重叠了 B. 文字太学术想简化 C. 想加个过渡说明？" |
| "第三章不太行" | "第三章目前15页。你想：A. 整体缩减（砍到10页）？B. 某几页太密拆开？C. 补一页总结？" |
| "改好看点" | "我可以：A. 加几页满版图让节奏更松 B. 关键结论用高亮框突出 C. 换个配色？" |

**Principle**: Always give 2–3 concrete options with preview of effect. User picks, not describes.

### 5.2 Modification Execution

| Type | Action |
|------|--------|
| Single page content edit | Edit corresponding `\begin{frame}...\end{frame}` |
| Add/remove page | Update outline.md, regenerate affected section |
| Global style change | Modify .sty or header |
| Layout switch | Replace frame with different layout skeleton |

After each edit, recompile and present again. Loop until user says done.

## Phase 6: Speaker Notes & Rehearsal Support (Optional)

After user confirms the slides are satisfactory, offer:

> 需要我帮你生成讲稿和配速建议吗？可以帮助你控制答辩节奏。

If user accepts, generate `notes.md`:

### 6.1 Per-Page Speaker Notes

```markdown
## P4 — 寒武纪辐射与软体动物的演化窗口
⏱️ 建议时长: 45秒

### 要点提词
- 演化窗口: 5.41亿年前，持续4000万年
- 软体动物门: 现代海洋第二大门类
- 272个属: 本文研究对象

### 讲稿参考
"首先介绍一下研究背景。寒武纪是海洋生态系统大规模重组的关键时期……"
```

### 6.2 Time Pacing Table

Present pacing summary in conversation:

> ## ⏱️ 时间配速建议（总计 20 分钟）
>
> | 章 | 页数 | 建议时长 | 每页均速 |
> |---|------|---------|---------|
> | 一 研究背景 | 8页 | 4分钟 | 30秒/页 |
> | 二 数据构建 | 7页 | 3.5分钟 | 30秒/页 |
> | 三 演化机制 | 15页 | 9分钟 | 36秒/页（重点章节，可以慢一些） |
> | 四 结论展望 | 5页 | 2.5分钟 | 30秒/页 |
> | 致谢+缓冲 | 1页 | 1分钟 | — |
>
> ⚠️ 第三章是重点，建议对关键结果页多花时间讲解。

### 6.3 Beamer Notes Integration (Optional)

If user wants notes embedded in PDF (for dual-screen presentation mode):

```latex
\setbeameroption{show notes on second screen=right}
```

Add `\note{}` blocks to each frame in `.tex` with the speaker notes content.

## Reference Files

- `references/layouts.md` — Standard and reproduction layout skeletons with slot definitions and LaTeX code
- `references/tex-header.md` — Standard .tex file preamble template
- `references/layout-registry.yaml` — Layout selection rules in structured format
- `references/reproduction-contract.md` — Paper-unit metadata, page roles, source labels, and claim boundaries
- `references/paper-reading-contract.md` — Markdown-first plan and approval gate for single-paper reading decks

## Assets

- `assets/beamerthemeAcademic.sty` — Beamer theme file (copied to user project)
- `assets/config.yaml` — Configuration template (copied to user project)
- `scripts/validate_reproduction_deck.py` — Structural and source checks for reproduction decks
