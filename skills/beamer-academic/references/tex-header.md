# LaTeX File Header Template

Standard preamble for generated Beamer files. Fill placeholders from `config.yaml`.

Before generating the TeX header, resolve the institution brand profile:

- `institution.brand_profile: none` -> no branding overlay.
- `institution.brand_profile: bupt` -> activate the BUPT overlay.
- `institution.brand_profile: auto` -> activate BUPT when `institution.name` is
  `北京邮电大学`, `BUPT`, or `Beijing University of Posts and Telecommunications`.

When BUPT is active, copy these retained skill assets into the deck:

```text
assets/beamerthemeAcademicBUPT.sty -> ./beamerthemeAcademicBUPT.sty
assets/bupt-logo-white.png         -> ./materials/figures/bupt-logo-white.png
```

The BUPT path and behavior are documented in `references/bupt-branding.md`.

```latex
\documentclass[aspectratio={{ASPECT_RATIO}}, {{FONT_SIZE}}, t]{beamer}

% ---------- Theme ----------
\usepackage{beamerthemeAcademic}
{{BRANDING_PACKAGE}}
{{COLOR_COMMAND}}

% ---------- CJK Fonts (macOS) ----------
\usepackage{xeCJK}
\setCJKmainfont{{{CJK_MAIN}}}[BoldFont={{CJK_SANS}}, ItalicFont=Kaiti SC]
\setCJKsansfont{{{CJK_SANS}}}
\setCJKmonofont{{{CJK_MONO}}}
\setmainfont{Times New Roman}
\setsansfont{Helvetica}

% ---------- Packages ----------
\usepackage{amsmath, amssymb, amsfonts}
\usepackage{booktabs}
\usepackage{colortbl}
\usepackage{multirow}
\usepackage{array}
\usepackage{hyperref}
\usepackage{tikz}
\usepackage{listings}
\usepackage{pifont}
\usetikzlibrary{arrows.meta, positioning, calc}

% ---------- Paper-reading / reproduction profiles ----------
% paper-reading: \subtitle stores the paper meta line
% (venue/year｜topic｜author or group); each content frame may repeat it with
% \framesubtitle. Do not put the metadata into the body paragraph.
% implementation-report: workflow-overview consumes diagram/workflow.png named
% by manifest.yaml; diagram/diagram-spec.yaml is the semantic brief and
% diagram/workflow.html is the editable diagram-design source.
% Paper-reading uses argument-left / evidence-right as a semantic axis, but the
% actual column ratio is evidence-aware rather than mechanically fixed at 40/60.
% beamerthemeAcademic provides academiccode, \codeentry, \statuslabel, \paperstep.
\lstset{style=academiccode}
\newcommand{\reprocaption}[2]{%
  \figcap{#1；来源类型：#2}}

\setlength{\emergencystretch}{2em}
\graphicspath{{materials/figures/}{./}}
{{BRANDING_COMMANDS}}
\AtBeginSection[]{}

% ---------- Accent colors for hypotheses (optional) ----------
\definecolor{textgray}{RGB}{90, 90, 90}
\definecolor{lightline}{RGB}{200, 200, 200}

% ---------- Metadata ----------
\title[{{SHORT_TITLE}}]{{{FULL_TITLE}}}
\subtitle{{{PAPER_META}}}
\author[{{AUTHOR}}]{{{AUTHOR}}}
\institute[{{INSTITUTE}}]{{{INSTITUTE}} {{DEPARTMENT}}}
\date{{{DATE}}}
\setsupervisor{{{SUPERVISOR}}}
\setmajor{{{MAJOR}}}

\begin{document}
```

## Branding Placeholder Mapping

| resolved profile | `BRANDING_PACKAGE` | `BRANDING_COMMANDS` |
|---|---|---|
| none / generic | empty | empty |
| BUPT | `\usepackage{beamerthemeAcademicBUPT}` | `\sethorizseal{bupt-logo-white.png}` |

For BUPT, the historical public API is intentionally retained. Existing TeX
that already contains `\sethorizseal{bupt-logo-white.png}` remains valid.

## Color Command Mapping

| config.yaml `color_scheme` | LaTeX command |
|---------------------------|--------------|
| `blue` | `\useblue` |
| `red` | `\usered` |
| `green` | `\usegreen` |
| `purple` | `\usepurple` |
| `teal` | `\useteal` |

## Font Defaults by OS

| OS | CJK_MAIN | CJK_SANS | CJK_MONO |
|----|-----------|----------|----------|
| macOS | Songti SC | Heiti SC | STFangsong |
| Linux | Noto Serif CJK SC | Noto Sans CJK SC | Noto Sans Mono CJK SC |
