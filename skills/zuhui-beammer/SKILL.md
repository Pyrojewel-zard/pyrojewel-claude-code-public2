---
name: zuhui-beammer
version: 1.0.0
description: >
  Use when creating ADC, mixed-signal, RF-circuit, or electronics group-meeting Beamer slides that should follow ADC_Calibration.pdf's white/red technical layout, source-aware evidence pages, equations, circuit diagrams, code excerpts, and raw-versus-calibrated plots.
trigger:
  - "zuhui-beammer"
  - "zuhui-beamer"
  - "ADC Calibration PPT"
  - "ADC标定PPT"
  - "ADC校准PPT"
  - "电路组会PPT"
  - "模拟电路汇报"
---

# zuhui-beammer

面向 ADC、混合信号和电路研究组会的 Beamer 技能。它在流程层派生自 `pyrojewel-beamer-academic`，但在 TeX 层使用独立的 `beamerthemeZuhuiBeammer.sty`，避免继承父主题的深藏蓝、金色、隐藏标题和圆角卡片。

## 何时使用

使用条件：用户要求 `zuhui-beammer`、ADC 标定/校准 PPT，或给出 `ADC_Calibration.pdf` 作为版式参考；内容包含电路图、公式、行为级代码、波形、传递函数、ENOB、误差或校准前后对比。

不要把它用于博士答辩、纯论文综述或需要父主题深蓝+金色视觉的场景；这些场景继续使用 `pyrojewel-beamer-academic`。

## 继承关系与硬边界

必须先读取并遵守 `pyrojewel-beamer-academic` 的：

- 两阶段流程：完整 Markdown → 用户确认 → Beamer → 编译；
- `page_manifest.tsv` 的证据字段：`takeaway`、`evidence`、`source_id/location`、`interpretation`、`boundary`、`evidence_status`；
- `reported`、`synthesized`、`project_result`、`unknown` 四种证据状态；
- 长篇阅读笔记的 `coverage_matrix.tsv`；
- 页面多样性、信息密度、内容/理论/PDF 三类 QA。

本 skill 只覆盖视觉和电路内容组织。不得复制父 skill 的大段正文，也不得把父主题的 `contentcard`、`defenseframetitle`、`sectionbar`、`summarybar` 当作本主题默认组件。

硬性禁止：

- 不加载或修改 `beamerthemeAcademic.sty`；
- 不把深蓝/金色横幅、圆角卡片、KPI 仪表盘当作 ADC 风格；
- 不把截图、代码或公式当作无来源装饰；
- 不以“时间紧”为由删除来源、单位、图例、边界和 PDF QA。

## ADC_Calibration.pdf 风格契约

参考文件：仓库根目录 `ADC_Calibration.pdf`。它是 16:9、白底、红线技术组会风格：左上标题，右上资料来源，标题下方红色粗线+浅红延伸线，底部浅红细线和页码。正文使用黑/深灰文字、红色方块项目符号和留白组织信息。

颜色只按语义使用：

| 语义 | 主题 token | 默认用途 |
|---|---|---|
| 主强调/误差/raw | `zuhui-red` | 红线、方块 bullet、误差、未校准曲线 |
| 校准后/改进 | `zuhui-green` | corrected、learned weight、改进结果 |
| 理想/参考 | `zuhui-blue` | ideal、oracle、辅助代码高亮 |
| 正文 | `zuhui-ink` | 公式、正文、轴标签 |
| 辅助 | `zuhui-gray` / `zuhui-grid` | 来源、图注、坐标网格 |

红色、绿色、蓝色同时出现时，必须配文字图例；不能让读者猜测 `vraw`、`vcorr`、`videal` 或 error 的含义。绿色不是通用“成功色”，只表示校准后/改进后证据。

完整色板、字号、页眉/页脚和图表规则见 `references/adc-style.md`。

## 工作流程

### 阶段一：完整内容 Markdown

1. 阅读输入论文、笔记、仿真日志和 `ADC_Calibration.pdf`；先提取每页的一个 takeaway。
2. 规划 7–12 页页面序列，至少覆盖“文献思想 → 物理/数学关系 → 行为级实现 → 仿真结果 → 局限/下一步”。
3. 为每个 `##` 页面写完整论证，不写只有 bullet 的大纲。普通文字页目标 180–240 字；公式、代码、表格、多图页按可读信息量核算。
4. 同目录生成 `page_manifest.tsv`。数字、公式、曲线、参数和比较必须有来源定位；无法定位就标 `unknown` 或删除。
5. 输入包含多篇论文/长笔记时，再生成 `coverage_matrix.tsv`，保证每个二级/三级小节都有页面映射。
6. 阶段一完成后停在 checkpoint：展示文件名决策、完整 Markdown、manifest 和 coverage matrix，得到确认后才写 TeX。

### 阶段二：Beamer 与编译

在阶段一 Markdown 同名子目录中创建：

```text
{report}/
├── {report}.tex
├── {report}.pdf
├── beamerthemeZuhuiBeammer.sty
├── materials/figures/
└── {report}-qa.md
```

复制本 skill 的 `assets/beamerthemeZuhuiBeammer.sty`，不要复制父主题。TeX 最小头部为：

```latex
\documentclass[aspectratio=169,10pt]{beamer}
\usepackage{xeCJK}
\setCJKmainfont{AR PL UMing CN}
\usepackage{amsmath,amssymb,booktabs,tikz}
\usepackage{beamerthemeZuhuiBeammer}
\graphicspath{{materials/figures/}{./}}
```

每张证据页用：

```latex
\begin{frame}
  \zuhuiframetitle{标题：术语 + 限定条件}{[1] 来源，section/figure/table/page}
  % 左文右图、公式、代码或结果图
\end{frame}
```

可用组件：

| 命令 | 用途 |
|---|---|
| `\zuhuiframetitle{title}{source}` | 左上标题、右上来源、红色标题线 |
| `\zuhuisectionbar{text}` | 红色方块+小节标题 |
| `\zuhuifigcap{text}` | 事实+本页作用的图注 |
| `\zuhuifigure[height]{file}` | 有高度上限的图片 |
| `\begin{zuhuicode}...` | Verilog-A/MATLAB/Python 可读代码块 |
| `\zuhuiresultlegend{raw}{corrected}{ideal}` | 固定语义的结果图例 |
| `\zuhuiconclusion{text}` | 页底红线式 takeaway |
| `\setzuhuiwatermark{text}` | 可选淡色水印；默认为空 |

编译两遍：

```bash
cd {report}/
xelatex -interaction=nonstopmode -halt-on-error {report}.tex
xelatex -interaction=nonstopmode -halt-on-error {report}.tex
```

## ADC 页面模式

生成前先列出页面类型和 takeaway；同一份 PPT 至少使用 5 种类型，连续不得 3 页同型。

### A. 极简封面

白底居中标题，顶部红线，底部浅红线；不加深色横幅。副标题说明对象/方法/条件。

### B. 文献思想 + 电路证据

左侧 2–4 条红方块 bullet，右侧原始电路图或重绘图。必须区分“图中事实”和“本页解释”，并在右上绑定论文来源。

### C. 电荷重分配 + 公式

左侧定义 `V_XN`、`V_CN`、bit weight、CDAC mismatch 与单位；右侧电路或 charge-flow 图。公式必须标注 `source_equation`、假设和有效范围。

### D. 行为级代码 + 递推

左侧写递推关系和输入/输出，右侧放受控行长的代码摘录。代码页必须说明语言、是否完整实现、变量单位和省略范围；不要把 IDE 截图当唯一证据。

### E. 双扰动/LMS 流程

用平面步骤条或 TikZ 流程图表示 `V^+`、`V^-`、误差构造和 weight update。每条箭头表达一个可解释的因果关系，不能只堆模块名。

### F. raw / corrected / ideal 结果

主图可为 transfer curve、DNL/INL、error 或 ENOB 收敛曲线；必须配 `\zuhuiresultlegend`。正文说明颜色对应的变量、实验设置和结论边界。

### G. 参数与定量结果

用 booktabs 表格列出 resolution、steps、radix、CDAC mismatch、perturbation magnitude、metric 和 baseline。数值必须带单位或量纲说明；表格后写一条比较结论。

### H. 局限与下一步

写清验证层级、未覆盖项和下一步实验。不使用“效果很好”“显著提升”等无数字形容词；若指标未报告，写“未报告”。

## ADC 证据契约

每页只保留一个主结论，并填写：

```text
page_id | takeaway | evidence | source_id/location | interpretation | boundary | evidence_status
```

对 ADC 结果额外核对：

- 分辨率、bit 数、radix、CDAC mismatch、扰动幅度、训练步数是否报告；
- `vraw`、`vcorr`、`videal`、error、ENOB、RMS/LSB 的变量与单位是否定义；
- 曲线是否有 legend，颜色是否跨页一致；
- “接近理想”“提升到 X bit”等句子是否能绑定图、表、日志或论文页码；
- 行为级代码是否与公式逐项对应，截取省略处是否标出；
- 物理关系、作者解释和汇报者推演是否分开标注。

## 页面与视觉 QA

生成 `{report}-qa.md`，逐页记录 `frame_id`、页面类型、图片数、图注数、source/location、takeaway 和失败修复。

必须运行：

```bash
pdfinfo {report}.pdf
pdftotext -layout {report}.pdf {report}.txt
pdftoppm -png -r 120 {report}.pdf qa/page
rg -n "LaTeX Error|Missing character|Overfull \\\\hbox|Overfull \\\\vbox" {report}.log
```

硬门：16:9；正文 ≥8pt；表格 ≥7.6pt；图注 ≥7pt；标题不超过两行；代码、公式、坐标轴和图例不裁切；没有未解释的 `Error` 或溢出。主题只允许其 `\hfuzz=0.8pt` 对 Beamer 输出 chrome 产生的亚 1pt 微溢出做解释性容差；正文、表格、代码和图片布局的溢出仍然失败。先改结构，再调图片高度，最后才调字号。

内容 QA、理论 QA、视觉 QA 三项必须分别写 `PASS` 或 `FAIL`。任何一项 FAIL 都不能交付 PDF。

## 反例与常见失败

| 失败 | 修复 |
|---|---|
| 直接加载 `beamerthemeAcademic.sty` | 使用独立 `beamerthemeZuhuiBeammer.sty` |
| 把 PDF 变成连续蓝/金卡片页 | 使用白底、红线、平面双栏和证据图 |
| 红色同时代表 raw、error、warning | 用变量名、线型和 legend 固定语义 |
| 代码/公式截图铺满一栏 | 代码用 `zuhuicode`，公式重排并定义符号 |
| 只有“校准后更好” | 给出 metric、baseline、source/location 和 boundary |
| 只检查 XeLaTeX 返回码 | 运行 `pdfinfo`、`pdftotext`、`pdftoppm` 和 log 检查 |

## 交付前清单

- [ ] 技能名、目录和触发词使用 `zuhui-beammer`；
- [ ] `beamerthemeZuhuiBeammer.sty` 独立存在，未加载父主题；
- [ ] 阶段一 Markdown、`page_manifest.tsv`、必要时 `coverage_matrix.tsv` 已确认；
- [ ] 页面至少 5 种类型，连续不超过 2 页同型；
- [ ] ADC 变量、单位、曲线 legend 和来源齐全；
- [ ] `zuhui-beammer/examples/minimal.tex` 可作为最小回归样例；
- [ ] 内容、理论、视觉 QA 均为 `PASS`；
- [ ] `bash skills/zuhui-beammer/examples/verification.sh`、`bash tools/verify-superpowers-index.sh` 和 `git diff --check` 通过。
