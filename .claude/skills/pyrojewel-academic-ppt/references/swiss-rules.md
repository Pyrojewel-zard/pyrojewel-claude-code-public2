# Swiss Design Rules for LaTeX Beamer Academic Presentations

Fused from guizang-ppt-skill's Swiss design system + beamer-academic's LaTeX compilation pipeline.
This is a **LaTeX adaptation** — Swiss principles translated to Beamer commands.

## Core Principles

1. **Single accent color** — one deck, one accent (IKB/Lemon/Lime/Orange)
2. **No serif fonts** — sans-serif only (default Beamer sans + Noto Sans SC for Chinese)
3. **No rounded corners** — `\tikz` boxes use `rounded corners=0pt`
4. **Inverse weight staircase** — larger text = lighter weight (`\mdseries`, never `\bfseries` for titles)
5. **Information-driven** — content hierarchy by size/weight/position, not decoration
6. **Flat colors only** — no gradients, no shadows, no bevel

## Typography

### Weight Staircase (Critical)

| Size Context | Weight | LaTeX Implementation |
|-------------|--------|---------------------|
| Hero display (`\fontsize{48pt}`) | Light/Regular | `\mdseries` |
| Chapter title (`\fontsize{22pt}`) | Regular | `\mdseries` |
| Frame title (14pt) | Regular | `\setbeamerfont{frametitle}{series=\mdseries}` |
| Body text | Regular | default |
| Labels, meta, kicker | Bold | `\bfseries` or `\textbf{}` |

**Hard rule**: `\frametitle` MUST be `\mdseries`. No `\bfseries` on large text.

### Chinese Title Sizing

| Title Form | Recommended |
|-----------|-------------|
| ≤ 8 chars | `\fontsize{22pt}{28pt}\selectfont` |
| 9-12 chars | `\fontsize{18pt}{24pt}\selectfont` |
| 13-16 chars | `\fontsize{16pt}{20pt}\selectfont` |
| 17+ chars | Rewrite the title first |

### Minimum Projection Font Sizes

| Text Type | Minimum |
|-----------|---------|
| Meta / chapnote / kicker | 7pt |
| Figure caption (`\figcap`) | 8pt |
| Body text | 9pt |
| Table entries | 8pt |

## Color

### Theme Selection (from beamerthemeAcademic.sty)

| If content is... | Command | Accent |
|------------------|---------|--------|
| Academic / research / data / engineering | `\useikb` | `#002FA7` Klein Blue |
| Young / active / consumer | `\uselemon` | `#FFD500` Lemon Yellow |
| Eco / future / emerging tech | `\uselime` | `#C5E803` Lemon Green |
| Industrial / warning / automotive | `\useorange` | `#FF6B35` Safety Orange |

### Color Rules

- One accent per deck, never mix
- Use accent only for: KPI numbers, single card highlight, divider lines, `\alert{}`
- No gradients, no shadows, no bevel
- Grey scale is fixed: `swiss-paper`, `swiss-ink`, `swiss-grey-1/2/3`

### Color Usage in LaTeX

```latex
% Accent color for emphasis
\textcolor{accent}{关键数字}

% Keybox (accent-filled box with white text)
\keybox{核心结论文字}

% Grey background block
\greybox{补充说明}

% Alert (Beamer's \alert redefined to accent color)
\alert{重点概念}
```

## Grid & Spacing

### Beamer Page Layout

- 16:9 aspect ratio: `\documentclass[aspectratio=169]{beamer}`
- Left margin for content: `\leftmargini` + custom spacing
- Use `\vfill` for vertical distribution
- Use Beamer `columns` environment for horizontal splits

### Spacing Tokens (from beamerthemeAcademic.sty)

| Token | Value | Use |
|-------|-------|-----|
| `\sp-xxs` | 3pt | Tight inline |
| `\sp-xs` | 5pt | Label gaps |
| `\sp-sm` | 8pt | Paragraph spacing |
| `\sp-md` | 12pt | Section gaps |
| `\sp-lg` | 18pt | Block top/bottom |
| `\sp-xl` | 28pt | Frame-level gaps |
| `\sp-xxl` | 42pt | Hero page spacing |

## Cards / Content Blocks

Four mutually exclusive block types (translated from guizang-ppt-skill's card system):

| Type | LaTeX Command | Use |
|------|--------------|-----|
| Accent block (accent bg, white text) | `\keybox{...}` | Single focus highlight / conclusion |
| Grey block (grey bg, dark text) | `\greybox{...}` | Neutral explanation blocks |
| Ink block (black bg, white text) | `\inkbox{...}` | Manifesto / inversion blocks |
| Outlined block (border only) | Custom tikz with `draw=accent` | Anchor points |

**Never mix** block types in the same visual group.

## Images

### Image Rules

- Images are evidence blocks, not decoration
- Straight edges, no rounded corners, no shadows
- `full-image` layout: tikz overlay for maximum figure size
- Two-column layouts: Beamer `columns` environment
- All figures numbered: `图 1`, `图 2`, ... using `\figcap{图 N\;描述}`

### Image Sizing

| Context | Width |
|---------|-------|
| `full-image` layout | `\paperwidth` (tikz overlay) |
| Left text + right image | `0.48\textwidth` in right column |
| Right text + left image | `0.48\textwidth` in left column |
| Inline small image | `0.3\textwidth` |

### Image Quality

- Use `\includegraphics[keepaspectratio]{...}`
- Vector formats preferred (PDF, EPS)
- Raster: ensure ≥ 150 DPI at projection size

## Layout Selection (Content-Shape Matching)

**From guizang-ppt-skill's S01-S22 system, mapped to beamer-academic's 13 layouts:**

| Swiss Layout | Content Shape | Beamer Layout |
|-------------|--------------|---------------|
| S01 Cover | Opening | cover |
| S03 Statement | Hero statement | statement |
| S04 Six Cells | 6 parallel items | list/enumerate |
| S05 Three Sub-cards | 3 parallel concepts | enumerate with columns |
| S06 KPI Tower | 3 KPI numbers | text-only with large numbers |
| S08 Duo Compare | Before/After | columns + table |
| S09 Closing | Takeaways | conclusion-box |
| S11 Timeline | Process/steps | enumerate |
| S13 Three Forces | 3 contrasting concepts | columns with 3 blocks |
| S15/S16 Grid | Multiple figures | full-image (multi) |
| S18 Why Now | Counter-intuitive | text-only + keybox |
| S20 Stacked Ledger | Data comparison | table |
| S22 Image Hero | Key figure | full-image / text-left-image-right |

**Hard rule**: Select layout based on content shape, not preference. Data pages = table layout. Image pages = image layout. Statement pages = statement layout.

## Animation (Beamer Equivalents)

| Swiss Animation | Beamer Equivalent |
|-----------------|------------------|
| Scale pop-in (numbers) | `\onslide<2->` |
| Node illuminate (timeline) | `\pause` or `\only<>` |
| Draw-on (SVG) | `\visible<2->{}` |
| Sequential reveal | `\item<2->` in enumerate |

Use sparingly. Academic presentations: max 2-3 overlay specs per page.

## Layout Diversity

- 7-8 page deck: at least 6 different layouts
- 10+ page deck: at least 8 different layouts
- No 3+ consecutive pages with same layout
- Every `\begin{frame}` must have `% Layout: <id>` comment
