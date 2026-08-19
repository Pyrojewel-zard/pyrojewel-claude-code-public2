# LaTeX File Header Template

Standard preamble for generated Beamer files. Fill placeholders from `config.yaml`.

```latex
\documentclass[aspectratio={{ASPECT_RATIO}}, {{FONT_SIZE}}]{beamer}

% ---------- Theme ----------
\usepackage{beamerthemeAcademic}

% ---------- CJK Fonts ----------
% IMPORTANT: Use xeCJK (not ctex) for XeLaTeX compatibility.
% TTC fonts (Noto Sans CJK SC) fail in XeLaTeX — use AR PL UMing CN on Linux.
\usepackage{xeCJK}
{{CJK_FONT_BLOCK}}

% ---------- Packages ----------
\usepackage{amsmath, amssymb, amsfonts}
\usepackage{booktabs}
\usepackage{colortbl}
\usepackage{multirow}
\usepackage{array}
\usepackage{hyperref}
\usepackage{tikz}
\usepackage{pifont}
\usetikzlibrary{arrows.meta, positioning, calc}

\setlength{\emergencystretch}{2em}
\graphicspath{{materials/figures/}{./}}
\AtBeginSection[]{}

% ---------- Metadata ----------
\title[{{SHORT_TITLE}}]{{{FULL_TITLE}}}
\author[{{AUTHOR}}]{{{AUTHOR}}}
\institute[{{INSTITUTE}}]{{{INSTITUTE}} {{DEPARTMENT}}}
\date{{{DATE}}}
\setsupervisor{{{SUPERVISOR}}}
\setmajor{{{MAJOR}}}

% ---------- 校徽（可选） ----------
{{SEAL_BLOCK}}

\begin{document}
```

## CJK Font Defaults by OS

**CRITICAL**: XeLaTeX cannot load TTC-bundled Noto CJK fonts. Use AR PL UMing CN on Linux.

| OS | CJK_FONT_BLOCK |
|----|-----------------|
| macOS | `\setCJKmainfont{Songti SC}[BoldFont=Heiti SC]\setCJKsansfont{Heiti SC}\setCJKmonofont{STFangsong}` |
| Linux | `\setCJKmainfont{AR PL UMing CN}\setCJKsansfont{AR PL UMing CN}\setCJKmonofont{Droid Sans Fallback}` |

## SEAL_BLOCK (校徽)

```latex
\setseal{bupt-logo-white.png}
\sethorizseal{北邮校名校徽编排 横版中英文.png}
```

## Defense Mode Color

The theme defaults to defense mode (深藏蓝+金色双色调). No color command needed — it's automatic.