---
name: pyrojewel-academic-ppt
superseded_by: pyrojewel-beamer-academic
description: >
  [SUPERSEDED by pyrojewel-beamer-academic in skills/pyrojewel-beamer-academic/]
  This skill is retained for reference only. Use /pyrojewel-beamer-academic instead.
  Original: Generate high-quality academic presentation slides (LaTeX Beamer → PDF) from a paper reading note.
  Fuses beamer-academic's compilation pipeline and academic rigor with guizang-ppt-skill's Swiss International
  design system (IKB/Lemon/Lime/Orange color themes, inverse weight staircase, 22 layout content-shape matching,
  rhythm rules). Output is LaTeX source + compiled PDF via xelatex.
  Use when: (1) User wants to create academic slides from a paper reading note, (2) User mentions
  论文PPT, 学术报告PPT, paper presentation, 论文解读PPT, pyrojewel-academic-ppt,
  (3) User has a .md reading note and wants LaTeX Beamer output.
---

# Pyrojewel Academic PPT [SUPERSEDED]

> **This skill has been superseded by `pyrojewel-beamer-academic`** (located at `skills/pyrojewel-beamer-academic/`).
> Use `/pyrojewel-beamer-academic` for all new PPT generation.
> This file is retained for reference and will not receive further updates.

Generate publication-quality academic Beamer slides from a paper reading note, styled with Swiss International Typographic design, compiled to PDF via xelatex.

## Architecture

```
论文阅读笔记(.md) → 素材提取 → 大纲规划 → [用户确认] → LaTeX生成 → xelatex编译 → PDF
                                        ↑                        ↑
                                  交互式大纲              Swiss设计系统
                                  (beamer-academic)     (guizang-ppt-skill)
```

**编译链**: `.tex` + `.sty` → `xelatex × 2` → `.pdf`（保留 beamer-academic 的完整编译流程）

**视觉风格**: Swiss 国际主义设计系统（来自 guizang-ppt-skill），翻译为 LaTeX Beamer 主题

## When to Use vs Other Skills

| Skill | Output | Best For |
|-------|--------|----------|
| `beamer-academic` | LaTeX PDF | Thesis defense, formal committee presentation |
| `guizang-ppt-skill` | HTML deck | Product launch, industry talk, demo day |
| **`pyrojewel-academic-ppt`** | LaTeX PDF | **Paper reading presentation, group meeting, seminar** |

---

## Phase 0: Input & Environment

### 0.1 Locate Input

Priority:
1. User-specified `.md` reading note file
2. `.md` file in current directory matching `*paper*` or specific patterns
3. Ask user: "请提供论文阅读笔记的文件路径（支持 .md）"

### 0.2 Check LaTeX Environment

```bash
which xelatex
```

If missing, guide installation:

| OS | Command |
|----|---------|
| Ubuntu/Debian/WSL | `sudo apt install texlive-xetex texlive-lang-chinese texlive-fonts-recommended` |
| macOS | `brew install --cask mactex-no-gui` |

Fallback: deliver `.tex` + `.sty` + figures, suggest Overleaf.

### 0.3 Configuration

Ask user (or infer from reading note):

| Item | Default | Options |
|------|---------|---------|
| Accent color | IKB (Klein Blue) | IKB / Lemon / Lime / Orange |
| Duration | 15 min ≈ 10 pages | User specifies |
| Audience | 组会/seminar | seminar / conference / reading group |
| Language | Follow reading note | zh / en / bilingual |
| Aspect ratio | 16:9 | 16:9 / 4:3 |

### 0.4 Image Discovery

Extract all `![caption](path)` references. Verify each exists. Present figure catalog in conversation.

---

## Phase 1: Material Extraction

### 1.1 Parse Reading Note

| Source Section | Extract To | Content |
|---------------|-----------|---------|
| `# 问题` | `materials/problem.md` | Core problem |
| `# 翻译` | `materials/method.md` | Method + figures |
| `# 核心概念` | `materials/concepts.md` | Key concepts |
| `# 洞见` | `materials/insight.md` | Key insight |
| `# 博导审稿` | `materials/review.md` | Critical evaluation |
| `# 启发` | `materials/inspiration.md` | Takeaways |
| All `![](path)` | `materials/figures/` | Copy with semantic names |

### 1.2 Figure Preparation

Copy images to `materials/figures/` with naming: `fig_architecture.jpeg`, `fig_cfd-contour.jpeg`, etc.

### 1.3 Terminology Mapping (if bilingual)

Build mapping: English → 中文, stored in `materials/terms.md`.

---

## Phase 2: Outline Planning (Interactive, In-Conversation)

**All confirmation IN CHAT. Never ask user to open a file.**

### 2.1 Structure Principle

Paper reading presentation typically follows:

```
封面 → 问题引入 → 方法拆解 → 核心概念 → 实验结果 → 洞见与启发 → 收束
```

### 2.2 First Pass: Structure Proposal

Present outline in conversation with layout assignments:

> | 页码 | 版式 | 标题 | 内容要点 | 图片 |
> |------|------|------|----------|------|
> | P1 | cover | 一频多看，窄门自开 | 封面 | — |
> | P2 | statement | 频响拟合的两难 | 核心矛盾 | — |
> | P3 | text-left-image-right | 多特征辅助架构 | 架构图 | Fig.2 |
> | ... | ... | ... | ... | ... |

### 2.3 Layout Selection Rules

Follow beamer-academic's 13-layout system from `references/layouts.md`:

| Content Type | Recommended Layout |
|-------------|-------------------|
| Problem statement | text-only, statement |
| Architecture/system diagram | full-image, text-left-image-right |
| Core concept definition | text-only, conclusion-box |
| Method comparison | text-left-image-right |
| Experimental results (with data) | table, text-left-image-right |
| Ablation / counter-intuitive finding | text-only, table |
| Formula / key equation | formula |
| Key insight / takeaway | statement, conclusion-box |
| Image showcase | full-image, image-left-text-right |

### 2.4 Swiss Design Rules for Layout Selection

From guizang-ppt-skill's content-shape matching principle: **select layout based on content shape, not preference**.

| Content Shape | Must Use | Must NOT Use |
|--------------|----------|-------------|
| Has real quantitative data | table, text-with-table | statement, text-only |
| No data, pure qualitative | text-only, statement | table with fabricated numbers |
| 4 parallel items | enumerate/list | force into 3 or 6 |
| Single core image + interpretation | image-left-text-right | full-image (unless image is the star) |
| Before/After comparison | text-left-image-right with columns | single column |
| One hero insight | statement | bullet list |

### 2.5 Rhythm Planning

Follow beamer-academic's rhythm rules from `references/rhythm-rules.md`:

1. No 3+ consecutive pages with same layout
2. Every 4-5 pages must have hero page (section-divider / statement / full-image)
3. Each chapter must use ≥ 3 different layouts
4. Data-dense pages followed by breathing page

### 2.6 HARD GATE

**Do NOT proceed to Phase 3 until user explicitly confirms.**

---

## Phase 3: Content Generation

### 3.1 Copy Theme

Copy `assets/beamerthemeAcademic.sty` to current directory.

### 3.2 Generate .tex Header

Read `references/tex-header.md` for template. Fill from configuration.

Set accent color:
```latex
\useikb      % IKB Klein Blue (default for academic)
% \uselemon   % Lemon Yellow
% \uselime    % Lemon Green
% \useorange  % Safety Orange
```

### 3.3 Academic Writing Rules (CRITICAL)

**From beamer-academic's `references/writing-style.md`:**

**Anti-AI Writing:**

| Banned | Use Instead |
|--------|-------------|
| "深入探讨" / "全面分析" | Specific, factual titles |
| "值得注意的是" | Direct statement |
| `\begin{itemize}` spam | Paragraph-style with inline markers |
| "本研究具有重要的理论意义" | Concrete finding + data |

**6 Composition Patterns:**

1. **段落 + keybox**: Context → `\keybox{核心结论}`
2. **段落 + 公式 + 段落**: Context → display math → interpretation
3. **引言 + enumerate**: Short intro → `\enumerate` with `\textbf{term}——explanation`
4. **段落 + 表格 + 结论**: Context → booktabs table → takeaway
5. **columns(内联标记) + 图**: Left text with `$\bullet$` markers + right image
6. **满版图 + 底部一句话**: tikz overlay figure + `\figcap{}`

**Adjacent pages MUST use different composition patterns.**

**Content density:**

| Constraint | Value |
|-----------|-------|
| Text per page (text-only) | 150–200 chars Chinese |
| Text per page (with figure) | 100–150 chars Chinese |
| Equations per page | max 2 |
| `\alert{}` per page | 1–2 |

### 3.4 Swiss Typography in LaTeX

**From guizang-ppt-skill's Swiss design system, translated to Beamer:**

**Inverse weight staircase:**

| Size | Weight | Beamer Implementation |
|------|--------|----------------------|
| Hero display (48pt) | Light/Regular | `\fontsize{48pt}{56pt}\mdseries` |
| Chapter title (22pt) | Regular | `\fontsize{22pt}{28pt}\mdseries` |
| Frame title (14pt) | Regular | `\setbeamerfont{frametitle}{series=\mdseries}` |
| Body text | Regular | default |
| Small labels/meta | Bold | `\textbf{}` or `\bfseries` |

**Key rule**: `\frametitle` MUST use `\mdseries`, NEVER `\bfseries`. Large text = light weight.

**Chinese title sizing** (from Swiss sizing table):

| Title Form | Recommended Size |
|-----------|-----------------|
| ≤ 8 chars | `\fontsize{22pt}{28pt}` |
| 9-12 chars | `\fontsize{18pt}{24pt}` |
| 13-16 chars | `\fontsize{16pt}{20pt}` |
| 17+ chars | Rewrite title first |

**Minimum projection font sizes:**

| Text Type | Minimum |
|-----------|---------|
| Meta/chapnote | 7pt |
| Figure caption | 8pt |
| Body text | 9pt |

### 3.5 Swiss Color Rules in LaTeX

**Single accent color per deck:**

| Theme | Command | Accent Color | Accent-on |
|-------|---------|-------------|-----------|
| IKB (default) | `\useikb` | `#002FA7` | white |
| Lemon | `\uselemon` | `#FFD500` | black |
| Lime | `\uselime` | `#C5E803` | black |
| Orange | `\useorange` | `#FF6B35` | white |

**Hard rules:**
- One accent per deck, never mix
- No gradients, no shadows, no rounded corners on color blocks
- Grey scale is fixed: `swiss-paper`, `swiss-ink`, `swiss-grey-1/2/3`
- Use accent only for: KPI numbers, single card highlight, divider lines, `\alert{}`

### 3.6 Layout Skeletons

**Use beamer-academic's 13 layout definitions from `references/layouts.md`.** Each layout has a LaTeX frame skeleton with `{{SLOT}}` placeholders.

**Academic PPT adaptations** (for paper reading, not thesis defense):

| Layout | Adaptation for Paper Reading |
|--------|------------------------------|
| `cover` | Paper title + authors + venue (not student/supervisor) |
| `toc` | Reading note sections (not thesis chapters) |
| `section-divider` | Section divider with reading note section titles |
| `text-only` | Core concept explanation (paragraph-style, not bullets) |
| `text-left-image-right` | Method explanation + architecture diagram |
| `image-left-text-right` | Figure + data interpretation |
| `formula` | Key equation from the paper |
| `table` | Comparison table from results |
| `full-image` | Key paper figures (convergence curves, contour maps) |
| `conclusion-box` | Key insight / takeaway |
| `transition` | Between sections (e.g., method → results) |
| `list` | Innovation points, limitations, takeaways |
| `thanks` | Closing page with 3 takeaways (not thesis acknowledgment) |

### 3.7 Figure Handling

- Use `\includegraphics` with `keepaspectratio`
- `full-image` layout: tikz overlay for maximum figure size
- Two-column layouts: Beamer `columns` environment
- Sequential figure numbering: `图 1`, `图 2`, ... using `\figcap{图 N\;描述}`
- Image paths via `\graphicspath{{materials/figures/}{./}}`

### 3.8 Content Filling Per Page

For each page in the outline:
1. Load layout skeleton from `references/layouts.md`
2. Fill slots with paper reading note content
3. Apply writing rules (3.3)
4. Apply typography rules (3.4)
5. Apply color rules (3.5)

---

## Phase 4: Compilation & Verification

### 4.1 Compile

```bash
cd materials/..
xelatex -interaction=nonstopmode presentation.tex && xelatex -interaction=nonstopmode presentation.tex
```

On failure: read `.log`, fix common issues, retry up to 3 times.

### 4.2 Layout Bug Detection

Check `.log` for:

| Symptom | Fix |
|---------|-----|
| `Overfull \vbox` | Reduce text, split page |
| `Overfull \hbox` with image | Add `keepaspectratio`, reduce width |
| Image overlaps text | Check column widths sum ≤ 1.0 |
| tikz overlay covers text | Adjust yshift/xshift |

### 4.3 Academic Quality Checklist

**P0 (must pass):**

- [ ] Every `\begin{frame}` has `% Layout: <id>` comment with valid layout id
- [ ] No AI-flavored titles
- [ ] Adjacent pages use different composition patterns
- [ ] Figures numbered sequentially
- [ ] Data layouts contain real data
- [ ] Min font sizes respected (7pt meta, 8pt caption, 9pt body)
- [ ] Single accent color throughout
- [ ] `\frametitle` uses `\mdseries` (not `\bfseries`)

**P1 (should pass):**

- [ ] Terminology consistent
- [ ] No 3+ consecutive same-layout pages
- [ ] Every 4-5 pages has hero page
- [ ] `\keybox` uses `rounded corners=0pt`

---

## Phase 5: Interactive Editing

Present result:

> PDF 已生成：./presentation.pdf（共 XX 页，预计分享时长 XX 分钟）
> 说修改意见，或说"满意"结束。

Offer concrete choices for vague feedback (same as beamer-academic Phase 5).

---

## Phase 6: Darwin Skill Integration

After delivery, invoke `/darwin-skills` for style analysis and iteration.

---

## Reference Files

- `references/layouts.md` — 13 LaTeX layout skeletons (from beamer-academic)
- `references/tex-header.md` — LaTeX preamble template (from beamer-academic)
- `references/writing-style.md` — Academic writing patterns (from beamer-academic)
- `references/rhythm-rules.md` — Visual rhythm planning (from beamer-academic)
- `references/visual-checklist.md` — Quality checklist (from beamer-academic)
- `references/layout-registry.yaml` — Layout selection rules (from beamer-academic)

## Assets

- `assets/beamerthemeAcademic.sty` — Beamer theme (includes Swiss color system)
- `assets/config.yaml` — Configuration template

## Dependencies

- **beamer-academic** at `/home/DataTransfer/Pyrojewel/02_claudeSkill/beamer-academic/` — LaTeX templates, layout definitions, compilation pipeline, writing rules
- **guizang-ppt-skill** at `/home/DataTransfer/Pyrojewel/02_claudeSkill/guizang-ppt-skill/` — Swiss design system (color themes, typography rules, layout content-shape matching, rhythm principles)

## Skill Loading Order

1. Read this SKILL.md
2. Phase 0-1: Determine accent color → read `assets/beamerthemeAcademic.sty` for color definitions
3. Before coding: read `references/layouts.md` for layout skeletons
4. Read `references/writing-style.md` for composition patterns
5. Read `references/rhythm-rules.md` for rhythm planning
6. After generation: read `references/visual-checklist.md` for quality check
7. Compile with xelatex
