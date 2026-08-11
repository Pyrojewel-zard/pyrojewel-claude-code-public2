---
name: pyrojewel-beamer-academic
version: 4.3
description: >
  学术 Beamer 幻灯片生成器。默认排版：高信息密度、圆角卡片 + 纯蓝标题条，深藏蓝+金色双色调。
  v4.3 增加页级信息预算、多图优先和密度回归检查；v4.2 的多样性排版命令继续兼容。
  支持 output_path 参数指定输出目录；未指定时默认输出到 Obsidian 周会文件夹（$OBSIDIAN_VAULT_ROOT/weekly/{YYYY}_W{WW}/）。
trigger:
  - "答辩PPT"
  - "答辩"
  - "beamer"
  - "学术 PPT"
  - "paper presentation"
  - "academic slides"
  - "beamer presentation"
  - "论文PPT"
  - "学术报告"
---

# pyrojewel-beamer-academic v4.3

基于 `beamerthemeAcademic.sty`（v3.2）的学术幻灯片生成技能。适用场景：博士/硕士答辩、组会报告、学术会议。默认排版：高信息密度、圆角卡片 + 纯蓝标题条。

**v4.3 高密度排版**：每页默认组织为“论点 + 证据 + 解释”，普通文字页目标 180--240 字；同一页优先承载两张或三张互相关联的图，单图页只用于完整流程、总框架或关键结果。每份综述/组会报告至少 6 页双图/多图，其中至少 2 页为三图或“1 大图 + 2 细节图”。

**v4.2 多样性排版**：主题新增 6 个排版命令，SKILL 强制要求同一份 PPT 内交替轮换页面类型（卡片 / 段落 / 双栏图文 / 全图 / 表格 / 流程 / 警示），禁止连续 ≥3 页使用同一种布局。第一页起即进入内容，章节切换用嵌入式 `\sectionbar` 而非整页过渡页。

**v4.1 两阶段流程**：先产出完整内容 Markdown（非大纲），用户确认后再生成 beamer。所有 LaTeX/编译产物/图片资产放入以 md 文件名命名的子目录。默认编译带北邮 logo（白色横版，headline 用）。文件名支持 type 标签前缀（论文调研 / autoModel / 组会 / 答辩）。

核心资源：
- 主题文件：`assets/beamerthemeAcademic.sty`（v3.2，含多样性排版命令与 `gridthreecap` 三图组件）
- 配置：`assets/config.yaml`
- 排版样式参考：`references/writing-style.md`（7+ 种页面 Pattern，生成时必读）

---

## 1. 工作流程（两阶段）

```
论文/研究材料 → [阶段一] 完整内容 MD → CHECKPOINT → [阶段二] Beamer 生成 → 编译输出
```

### 阶段一：完整内容 Markdown

1. **论文/研究材料** → 输入：论文 PDF / arXiv 链接 / 研究笔记
2. **结构提取** → 核心问题 / 方法 / 实验 / 结论
3. **完整内容撰写** → 输出：**完整论证内容的 Markdown 文档**（非大纲）

   撰写要求：
   - 每页对应一个 `##` 二级标题，标题为术语+限定条件
   - 普通页面 180--240 字完整论证文字，不是 bullet point 大纲；表格、公式和多图页按“可读信息量”核算，不机械补字
   - 每页先写清一个结论，再安排证据：至少一张图、一组数据或一个公式，随后补充证据解释或适用边界
   - 关联图优先同页组合：默认使用 `gridtwocap`、`gridfourcap`、`gridonextwo`、图+表格或图+公式；连续单图页最多 1 页
   - 多图页不得只堆图：每张图有“图中事实 + 本页作用”的短图注，页底有跨图结论
   - 方法页包含公式（LaTeX 数学模式）+ 图片引用标注
   - 实验页包含具体数据 + 对比分析文字
   - 结论页包含 takeaway + 局限性 + 未来方向

4. **确定类型标签**：
   - 根据内容来源和场景选择 type 标签：

   | type | 适用场景 | 示例文件名 |
   |------|---------|-----------|
   | `论文调研` | 论文阅读、文献调研、论文汇报 | `2026-06-10-论文调研-电感到变压器跨器件迁移.md` |
   | `autoModel` | 来源于 autoModel 项目的实验/架构工作 | `2026-06-09-autoModel-L2-Process-Aware实验架构修复与基线确认.md` |
   | `组会` | 周会组会报告、进展汇报 | `2026-06-09-组会-频响极点展开方法.md` |
   | `答辩` | 开题/中期/毕业答辩 | `2026-06-09-答辩-博士学位论文答辩.md` |
   | （无标签） | 其他通用场景 | `2026-06-09-频响极点展开方法.md` |

5. **确定输出路径**：
   - 用户提供 `output_path` → 使用该路径
   - 未提供 → 检测 `$OBSIDIAN_VAULT_ROOT`
     - 已设置 → `{OBSIDIAN_VAULT_ROOT}/weekly/{YYYY}_W{WW}/`
     - 未设置 → 当前工作目录，提示用户
   - 路径不存在 → `mkdir -p` 创建

6. **扫描已有文档，判断 append 还是新建**：
   - 列出 `{output_dir}` 下所有已有 `.md` 文件（`ls *.md`）
   - 逐个读取文件名和内容，用以下 3 条规则逐条匹配，**命中 ≥2 条 → append**，否则新建：

   | # | 匹配规则 | 检查方式 |
   |---|---------|---------|
   | A | type 标签相同 | 文件名中的 type 标签（论文调研/组会/autoModel/答辩）与本次一致 |
   | B | 核心术语重叠 ≥2 个 | 已有文档 `# 标题` + 前 3 个 `##` 标题中的术语（如 CFD-PE、极点展开、频响），与本次报告的核心术语做交集 |
   | C | 同一课题连续汇报 | 用户明确说"接上次/继续/后续/同一个课题"，或文件名时间 ≤14 天且内容凝练说明相似（编辑距离 < 一半） |

   - **append** → 在已有文档末尾追加 `---` 分隔线，然后追加本次内容（从 `##` 开始），不重复写 `# 标题`。文件名沿用已有文档。
   - **新建** → 按命名规则生成新文件：`{YYYY-MM-DD}-{type}-{内容凝练说明}.md`
   - 将匹配结果告知用户确认

7. **🔴 CHECKPOINT**：展示文件名决策（新建还是 append 到哪个文件），用户确认后再写入

8. **写入 MD 文件**：`{output_dir}/{文件名}.md`（新建或 append）

9. **🔴 CHECKPOINT**：展示完整 MD 内容给用户确认，未确认不进入阶段二

### 阶段二：Beamer 生成与编译

10. **创建 beamer 子目录**：
   - 目录名 = md 文件名（去掉 `.md` 后缀）
   - 路径：`{output_dir}/{文件名}/`
   - 示例：`{output_dir}/2026-06-09-组会-频响极点展开方法/`

11. **复制资产**：
    - `beamerthemeAcademic.sty` → `{beamer_dir}/`
    - **北邮 logo**（默认）→ `{beamer_dir}/materials/figures/`
      - `bupt-logo-white.png`：白色横版校名，headline 右上角
      - 来源：`{skill_assets}/`（`skills/pyrojewel-beamer-academic/assets/`）
    - 图片资产 → `{beamer_dir}/materials/figures/`
      - 来源：`{zotero_markdown_path}/{attachmentKey}/*.{jpeg,png,jpg}`
      - 来源：`{project}/notes/papers/images/{attachmentKey}/*.{jpeg,png,jpg}`

12. **LaTeX 生成** → `{beamer_dir}/{文件名}.tex`
    - 基于阶段一的完整 MD 内容转化为 beamer 页面
    - `\graphicspath{{materials/figures/}}`
    - **默认启用北邮 logo**：
      - `\sethorizseal{bupt-logo-white.png}` — headline 右上角白色校名
      - 用户可通过 `\sethorizseal{}` 清空或替换

13. **编译输出** → `{beamer_dir}/{文件名}.pdf`（`xelatex` 两次）

14. **CHECKPOINT**：编译后检查 `.log` 无 Error/Overfull，有问题先修；同时执行 §3.4 页面类型和 §3.5 信息密度检查，不达标回到第 12 步重写对应 frame

### 输出目录结构

```
{output_dir}/
├── 2026-06-09-组会-频响极点展开方法.md        ← 阶段一：完整内容 MD
└── 2026-06-09-组会-频响极点展开方法/           ← 阶段二：beamer 子目录
    ├── 2026-06-09-组会-频响极点展开方法.tex
    ├── 2026-06-09-组会-频响极点展开方法.pdf
    ├── beamerthemeAcademic.sty
    └── materials/figures/
        ├── bupt-logo-white.png              ← 北邮白色横版 logo（headline）
        ├── fig_result_a.jpeg
        └── ...
```

---

## 2. 设计原则

| 维度 | 风格 ✓ | 禁止 ✗ |
|------|-----------|--------|
| **信息密度** | 高优先，普通页 180--240 字；表格/公式/多图页按等价信息量 | 低密度，一句话占整页 |
| **证据结构** | 论点 + 论文证据 + 解释/边界 | 图片与文字各说各话 |
| **图文组合** | 默认双图/三图/主图+细节图 | 连续单图页 |
| **页面多样性** | 同一份 PPT 交替轮换 ≥5 种页面类型 | 连续 ≥3 页用同一种布局 |
| **视觉装饰** | 色块用于 banner / callout / sectionbar，克制 | 全屏色块内容页、花哨装饰 |
| **标题风格** | 术语 + 限定条件 | 诗意/口语化 |
| **数据呈现** | booktabs 表格 + 公式 + 图 | KPI 卡片、仪表盘 |
| **对比方式** | `\contentcardpair` 双卡片 / `\threecard` 三卡片 / booktabs 表格 | 深色背景三列卡片 |
| **配色方案** | 深藏蓝+金色双色调，金线点缀 | 浅色/荧光配色 |

---

## 3. 页面节奏与多样性轮换

### 3.1 整体节奏

```
内容页（类型 A）→ 内容页（类型 B）→ … → 结论与展望
```

- **内容页**：白底，普通页 180--240 字（中文），必须包含具体论证；表格、公式和多图页按信息量核算
- 第一页直接进入内容页，禁止封面页、致谢页；整页过渡页仅答辩场景可选用 `\sectiondivider`，组会/论文调研场景**禁止**整页过渡
- 章节切换：直接用 `\section{标题}`（headline 自动显示当前 section）；若需更强视觉分隔，在内容页顶部用嵌入式 `\sectionbar{章节标题}`，**不占整页**

### 3.2 页面类型轮换表（强制）

生成 beamer 前必须规划每页的页面类型，确保**同一份 PPT 内出现 ≥5 种不同类型**，且**不连续 ≥3 页使用同一类型**。可用页面类型：

| 代号 | 页面类型 | 典型命令组合 | 适用内容 |
|------|---------|-------------|---------|
| **A** | 卡片页 | `\contentcard` 单卡片 / `\contentcardpair` 双卡片 | 方法框架、核心定义、对比 |
| **B** | 段落页 | `\defenseframetitle` + 段落 + `\keybox` / `\infobox` | 论证、推导、背景陈述 |
| **C** | 双栏图文页 | `\begin{columns}` + 文字 + `\colimg` / `\safeimg` | 架构图+解读、流程图+说明 |
| **D** | 全图页 | `\fullimg` / `\topfig` / `\gridtwo` | 实验结果、波形、架构总览 |
| **E** | 多图网格页 | `\gridfour` / `\gridfourcap` / `\gridonextwo` | 多视角结果对比 |
| **K** | 图文证据页 | `\gridtwocap` / `\gridonextwo` + 解释段 | 主证据配局部细节和边界 |
| **L** | 图表组合页 | `columns` + 图 + `\cardtable` | 定性图和定量表共同支撑结论 |
| **F** | 表格页 | `\defenseframetitle` + `\cardtable` + booktabs | 数据对比、参数列表 |
| **G** | 公式页 | 段落 + `\[...\]` / `$...$` + `\summarybar` | 方法推导、损失函数 |
| **H** | 流程页 | `\stepline` 串联步骤 + `\sectionbar` | 方法流程、实验步骤 |
| **I** | 警示/结论页 | `\callout{note/tip/warn}` + `\quoteline` | 局限性、未来方向、风险 |
| **J** | 引言/动机页 | `\quoteline` + `\infobox` | 问题陈述、研究动机 |

### 3.3 6 页样板组合（参考）

一份 8-12 页的组会报告，建议按如下骨架轮换（实际按内容调整，但须保持多样性）：

```
P1  类型 J 引言/动机   — \quoteline 问题 + \infobox 动机
P2  类型 B 段落页      — 背景论证 + \keybox 核心结论
P3  类型 H 流程页      — \sectionbar 方法 + \stepline×3
P4  类型 G 公式页      — 方法推导 \[...\] + \summarybar
P5  类型 C 双栏图文    — \columns 文字 + \colimg 架构图
P6  类型 D 全图页      — \fullimg 主结果
P7  类型 E 多图网格    — \gridfourcap 四组对比
P8  类型 F 表格页      — \cardtable 定量对比
P9  类型 I 警示/结论   — \callout{warn} 局限 + \callout{tip} 未来
```

> 答辩场景可在 P1 前加 `\defensecover`，结尾加 `\thanksframe`；组会/论文调研场景不加封面与致谢页。

### 3.4 反单调检查（生成后必做）

生成全部 frame 后，逐页统计页面类型代号：
- 若出现 ≥5 种不同代号 → 通过
- 若 <5 种，或连续 ≥3 页同代号 → 回到阶段二重新分配页面类型，重写对应 frame

### 3.5 信息密度与图文组合检查（生成后必做）

逐页记录 `frame_id`、页面类型、正文/表格/公式、图片数、图注数和页底结论。

- 普通文字页：正文目标 180--240 字；必须有明确结论条或 `keybox/summarybar/callout`。
- 双图/多图页：图片数至少 2；每张图有图注；页内有一段跨图解释或总结。
- 三图页：至少 2 页；优先使用 `gridfourcap` 的三格变体或 `gridonextwo`。
- 综述/组会整份 PPT：至少 6 页双图或多图；连续单图页最多 1 页。
- 表格页：表格必须有表头、至少两行数据或明确的定量对照，并配一段结论。
- 任何页面不得以把正文压到 7.2pt 以下来通过密度检查；若出现 `Overfull \\vbox`、图注不可辨认或图文重叠，判定失败。

将检查结果附在阶段二产物旁或进度日志中，作为下一轮生成的回归依据。

---

## 4. 可用命令

### 4.1 内容卡片命令

| 命令 | 用途 |
|------|------|
| `\contentcard{标题}{内容}` | 内容卡片：蓝底标题条 + 灰蓝边框内容框 |
| `\contentcardpair{左标题}{左内容}{右标题}{右内容}` | 双卡片并排对比 |
| `\threecard{t1}{c1}{t2}{c2}{t3}{c3}` | 三卡片并排对比（三方法/方案） |
| `\cardtable{表格}` | 卡片内嵌 booktabs 表格（自动缩放） |
| `\summarybar{内容}` | 浅蓝底总结条（深蓝粗体） |
| `\goldbox{内容}` | 金色边框框（浅金填充） |
| `\kwd{关键词}` | 红色粗体关键词 |
| `\goldline` | 金色短横线（2cm，标题下方） |
| `\goldhairline` | 金色满宽发丝线 |
| `\golditem` | 金色方形 bullet |

### 4.2 排版命令

| 命令 | 用途 |
|------|------|
| `\keybox{内容}` | 结论高亮框（灰色细线框，浅灰底） |
| `\findingtitle{标题}` | 发现页标题（深蓝加粗） |
| `\hairline` | 灰色分隔线 |
| `\accentline` | 深蓝色短分隔线 |
| `\chapnote{文字}` | 章节小注（灰色斜体） |
| `\figcap{图说}` | 图说文字 |
| `\defenseframetitle{标题}` | 页标题（用于非卡片 frame） |
| `\defensesubhead{标题}` | 紧凑子标题 |

### 4.3 图片命令

| 命令 | 布局 | 上限高度 | 宽度 |
|------|------|---------|------|
| `\colimg{文件}` | 双栏文字+图 | 5.5cm | `\linewidth` |
| `\fullimg{文件}` | 单栏满宽图 | 6.5cm | `\textwidth` |
| `\safeimg[高度]{文件}` | 自定义 | 自定义 | `\linewidth` |

### 4.4 多图网格

| 命令 | 布局 | 适用场景 |
|------|------|---------|
| `\gridtwo{图1}{图2}` | 2×1 并排 | 对比实验 |
| `\gridtwocap{图1}{注1}{图2}{注2}` | 2×1 并排 + 图注 | 对比+说明 |
| `\gridthreecap{图1}{注1}{图2}{注2}{图3}{注3}` | 3×1 并排 + 图注 | 三阶段/三方法/三组证据 |
| `\gridfour{图1}{图2}{图3}{图4}` | 2×2 网格 | 多视角结果 |
| `\gridfourcap{f1}{c1}{f2}{c2}{f3}{c3}{f4}{c4}` | 2×2 网格 + 图注 | 4组对比 |
| `\gridonextwo{大图}{小图1}{小图2}` | 1大+2小 | 架构图+细节 |
| `\topfig{图片}{文字}` | 上图下文 | 结果图+解读 |

### 4.5 校徽

| 命令 | 用途 |
|------|------|
| `\sethorizseal{文件名}` | 设置横版校徽校名图（headline 右上角） |

**默认北邮 logo**（编译时自动复制到 `materials/figures/`）：

| 文件 | 用途 | 命令 |
|------|------|------|
| `bupt-logo-white.png` | 白色横版校名，headline 右上角 | `\sethorizseal{bupt-logo-white.png}` |

清空校徽：`\sethorizseal{}`。替换为其他学校 logo：将文件放入 `materials/figures/` 后修改对应命令。

### 4.6 多样性排版命令（v4.3 默认高密度）

用于打破"每页都是 contentcard"的单调，在同一份 PPT 内交替使用：

| 命令 | 用途 | 适用页面类型 |
|------|------|------------|
| `\infobox{标题}{内容}` | 信息条：左金色竖条 + 浅灰底（标题可空） | 段落页穿插、动机/背景 |
| `\quoteline{引言}` | 引言条：左金色粗竖线 + 斜体引文 | 问题陈述、研究动机 |
| `\stepline{编号}{文字}` | 流程步骤条：金色编号圆 + 文字 | 方法流程、实验步骤 |
| `\callout{note\|tip\|warn}{内容}` | 警示框：note 深蓝 / tip 绿 / warn 橙 | 局限性、建议、风险 |
| `\threecard{t1}{c1}{t2}{c2}{t3}{c3}` | 三卡片并排对比 | 三方法/方案对比 |
| `\sectionbar{章节标题}` | 嵌入式章节横条（不占整页） | 章节切换的视觉分隔 |

**用法要点**：
- `\infobox{标题}{内容}`：标题为空时写 `\infobox{}{内容}`，仅显示内容 + 金竖条
- `\callout`：第一个参数必须是 `note` / `tip` / `warn` 三者之一，决定边框与底色
- `\stepline`：每行一个步骤，编号建议用阿拉伯数字；多步骤连续调用即可
- `\sectionbar`：放在 frame 顶部，与正文同页，不替代 `\section{}`（headline 仍需 section）

---

## 5. 标题规则

### 必须满足

- 包含核心术语（CFD-PE、频响、极点展开等）
- 包含限定条件或方法限定（"基于…"、"面向…"）
- 可被文献检索匹配

### 格式模板

```
[方法/框架名]：[核心动作] + [对象] + [条件/目标]
```

**示例**：
- ✓ "CFD-PE：基于极点展开的频响特征提取方法"
- ✓ "Three-Force 框架：正则化、约束与平衡的协同优化"
- ✗ "一频多看，窄门自开"

---

## 6. LaTeX 反例黑名单

| ✗ 不要做 | ✓ 应该做 | 原因 |
|---------|---------|------|
| `\defensecover` / `\thanksframe`（组会/论文调研场景） | 直接进入内容页 | 组会无需封面致谢；答辩场景除外 |
| `\sectiondivider` 过渡页（组会/论文调研场景） | `\section{标题}` + 内容页，或顶部 `\sectionbar{}` | 整页过渡无实质内容；答辩可酌用 |
| 连续 ≥3 页 `\contentcard` 单卡片 | 交替 `\contentcard` / `\infobox` / 段落 / 双栏图文 | 视觉单调，违反多样性轮换 |
| 全程只用 1-2 种页面类型 | 按 §3.2 轮换表选 ≥5 种 | 排版单一 |
| `\includegraphics[width=\textwidth]{...}` | `\colimg{...}` 或 `\fullimg{...}` | 无高度校验导致 Overfull |
| 漏写 `\graphicspath` | preamble 加 `\graphicspath{{materials/figures/}{./}}` | `\sethorizseal` 找不到图，编译失败 |
| `\usepackage{ctex}` + `\usetheme{Academic}` | `\usepackage{xeCJK}` + 手动设字体 | ctex 与 beamer 主题冲突 |
| `\begin{frame}[plain]` + 手写蓝底 | 普通 frame + `\contentcard` / `\infobox` | 保持一致的排版风格 |
| 口语化副标题 | 术语限定条件副标题 | `\subtitle` 应补充方法限定 |
| `\accentslide` / `\darkslide` | 已移除 | v3.0 已移除 Swiss 命令 |
| `\kpinumber` / `\swisskpi` | `\cardtable` + booktabs | 数据用表格，不用 KPI 卡片 |

---

## 7. LaTeX 模板

模板演示 6 种页面类型轮换（J 引言 → H 流程 → G 公式 → C 双栏图文 → D 全图 → I 警示结论），生成时按内容调整但须保持 ≥5 种轮换：

```latex
\documentclass[aspectratio=169, 10pt]{beamer}

% --- CJK 字体（Linux — xeCJK，禁止 ctex） ---
\usepackage{xeCJK}
\setCJKmainfont{AR PL UMing CN}
\setCJKsansfont{AR PL UMing CN}

\usepackage{amsmath, amssymb}
\usepackage{booktabs}
\usepackage{tikz}
\usepackage{colortbl}

\usetheme{Academic}
\graphicspath{{materials/figures/}{./}}    % 必须设置，否则 sethorizseal 找不到图

% --- 北邮校徽（默认启用） ---
\sethorizseal{bupt-logo-white.png}                         % headline 白色横版

\title{基于CFD-PE的频响极点展开方法}
\subtitle{CFD-PE: Complex Frequency Domain Parameter Extraction}
\author{张三}
\institute{北京邮电大学 电子工程学院}
\date{2026年6月}

\begin{document}

\section{研究背景与科学问题}

% --- 类型 J：引言/动机页（quoteline + infobox） ---
\begin{frame}
  \defenseframetitle{研究动机}
  \quoteline{现有方法在复频域参数提取时存在极点耦合难以分离的问题，限制了高频段频响建模精度。}
  \infobox{核心问题}{能否在 10GHz 以上频段稳定分离并提取主导极点？}
\end{frame}

% --- 类型 B：段落页（段落 + keybox） ---
\begin{frame}
  \defenseframetitle{背景论证}
  \chapnote{对应论文 §1.2}
  CFD-PE 方法源于复频域极点展开理论……（180--240字论证段落）。
  \keybox{\textbf{核心结论}：极点分离是频响建模精度的瓶颈。}
\end{frame}

\section{方法设计}

% --- 类型 H：流程页（sectionbar + stepline） ---
\begin{frame}
  \sectionbar{方法流程}
  \stepline{1}{对频响数据做复频域拟合，提取主导极点。}
  \stepline{2}{按极点实部排序，分离实极点与共轭极点对。}
  \stepline{3}{对各极点单独展开，重构频响分量。}
\end{frame}

% --- 类型 G：公式页（段落 + 公式 + summarybar） ---
\begin{frame}
  \defenseframetitle{极点展开公式}
  设频响函数 $H(s)$ 的极点为 $p_k$，则其可展开为：
  \[
    H(s) = \sum_{k=1}^{N} \frac{r_k}{s - p_k},\qquad r_k = \lim_{s\to p_k}(s-p_k)H(s).
  \]
  \summarybar{关键：极点 $p_k$ 与留数 $r_k$ 共同决定频响特征。}
\end{frame}

% --- 类型 C：双栏图文页（columns + colimg） ---
\begin{frame}
  \defenseframetitle{方法架构}
  \begin{columns}[T]
    \begin{column}{0.48\textwidth}
      架构由拟合层、排序层、展开层三部分组成……（文字解读）。
    \end{column}
    \begin{column}{0.48\textwidth}
      \colimg{fig_architecture.jpeg}
      \figcap{图 1\quad CFD-PE 架构示意}
    \end{column}
  \end{columns}
\end{frame}

% --- 类型 D：全图页（fullimg） ---
\begin{frame}
  \defenseframetitle{主结果}
  \fullimg{fig_result_main.jpeg}
\end{frame}

% --- 类型 F：表格页（cardtable + booktabs） ---
\begin{frame}
  \defenseframetitle{定量对比}
  \cardtable{\begin{tabular}{lcc}
    \toprule
    \textbf{方法} & \textbf{误差(dB)} & \textbf{耗时(ms)} \\
    \midrule
    Baseline & 2.41 & 120 \\
    CFD-PE   & 0.83 & 95 \\
    \bottomrule
  \end{tabular}}
\end{frame}

% --- 类型 I：警示/结论页（callout） ---
\begin{frame}{结论与展望}
  \chapnote{CONCLUSION · LIMITATIONS · FUTURE WORK}
  \textbf{核心结论}：CFD-PE 将高频建模误差降低 65\%。
  \hairline
  \callout{warn}{\textbf{局限性}：极点数 $N$ 需人工设定，欠拟合场景需引入模型选择。}
  \callout{tip}{\textbf{未来方向}：探索自动极点数估计与稀疏正则化。}
\end{frame}

\end{document}
```

> 答辩场景：在 `\begin{document}` 后加 `\defensecover{北京邮电大学}{李四 教授}`，结尾加 `\thanksframe{恳请各位老师批评指正}{email@bupt.edu.cn}`。

---
```

---

## 8. 编译说明

```bash
# 在 beamer 子目录下编译
cd {output_dir}/{文件名}/
xelatex {文件名}.tex
xelatex {文件名}.tex

# 或使用 compile.sh
./scripts/compile.sh {文件名}.tex --full --output-dir {output_dir}/{文件名}/
```

---

## 9. 输出路径规范

### Precedence

| 优先级 | 来源 | 路径 |
|--------|------|------|
| 1 | 用户显式指定 | `output_path` 参数值 |
| 2 | Obsidian 周会默认 | `$OBSIDIAN_VAULT_ROOT/weekly/{YYYY}_W{WW}/` |
| 3 | 本地 fallback | 当前工作目录 |

### 文件命名

- MD 文件：`{YYYY-MM-DD}-{type}-{内容凝练说明}.md`（如 `2026-06-09-组会-频响极点展开方法.md`）
- Beamer 子目录：`{YYYY-MM-DD}-{type}-{内容凝练说明}/`（与 md 同名去后缀）
- Beamer tex/pdf：`{YYYY-MM-DD}-{type}-{内容凝练说明}.tex` / `.pdf`
- 无 type 时：`{YYYY-MM-DD}-{内容凝练说明}.md`（如 `2026-06-09-频响极点展开方法.md`）

### 周会文件夹命名

格式：`{YYYY}_W{WW}/`，使用 ISO 周（`date +%G_W%V`）。例如 `2026_W27/`。

### 环境变量

- `OBSIDIAN_VAULT_ROOT`：Obsidian vault 根路径（用于默认输出）
- `WEEKLY_MEETING_REL`：覆盖周会文件夹相对路径（默认 `weekly`）

### 图片资产来源

1. **Zotero Markdown 路径**：`{zotero_markdown_path}/{attachmentKey}/*.{jpeg,png,jpg}`（从 `.claude/settings.json` env 读取）
2. **论文笔记图片**：`{project}/notes/papers/images/{attachmentKey}/*.{jpeg,png,jpg}`
3. 复制到：`{beamer_dir}/materials/figures/`
4. tex 中引用：`\graphicspath{{materials/figures/}}`

---

## 10. 阶段一 MD 内容规范

阶段一产出的 Markdown 是**完整论证内容**，不是大纲。每个 `##` 节对应一页 slide。

### 格式模板

```markdown
# {报告标题}

> {一句话核心论点}

## {页面1标题：术语+限定条件}

{180--240字完整论证段落。包含问题定义、方法思路、关键公式。}

![图注](materials/figures/fig_xxx.jpeg)

## {页面2标题}

{180--240字完整论证段落。包含实验设置、数据对比、分析结论。}

| 方法 | 指标A | 指标B |
|------|-------|-------|
| Baseline | 0.85 | 0.72 |
| Ours | 0.92 | 0.81 |

## 结论与展望

**核心结论**：{一句话}

**局限性**：{2-3点}

**未来方向**：{2-3点}
```

### 内容要求

- 每个 `##` 节普通页 180--240 字完整段落，不是 bullet list；表格、公式和多图页按可读信息量核算
- 方法节包含 LaTeX 数学公式（`$...$` 或 `$$...$$`）
- 实验节包含具体数值 + 对比分析
- 图片用 `![图注](materials/figures/xxx.jpeg)` 标注位置
- 表格用 markdown table 标注数据结构

---

## 11. 编译失败模式与 Fallback

| 触发条件 | 一线修复 | 仍失败兜底 |
|---------|---------|-----------|
| `.log` 出现 `Font not found` | `apt install fonts-arphic-uming fonts-droid-fallback` | 改用 `\setCJKmainfont{Noto Sans CJK SC}` |
| `.log` 出现 `Package ctex Error` | 删除 `\usepackage{ctex}`，改用 `\usepackage{xeCJK}` + 手动设字体 | 检查 xelatex 是否在 PATH |
| `.log` 出现 `Overfull \vbox` | 换 `\colimg`/`\safeimg` 降低图片高度 | 减少该页文字量 20% |
| `.log` 出现 `Overfull \hbox`（<15pt，contentcard/pair/threecard） | 忽略，属 drop shadow 的固有微溢出，不影响渲染 | 若 >15pt 则缩短 banner 标题文字 |
| `.log` 出现 `File not found`（图片） | 检查 `\graphicspath` 和文件名大小写 | 用绝对路径 `\graphicspath{{/full/path/}}` |
| `.log` 出现 `Undefined control sequence`（infobox/quoteline/stepline/callout/threecard/sectionbar/gridthreecap） | 检查 .sty 版本为 v3.2+，旧版无这些命令 | 重新从 `assets/beamerthemeAcademic.sty` 复制 |
| `.log` 出现 `Missing \endcsname`（callout） | 检查 `\callout` 第一参数是否为 `note`/`tip`/`warn` 之一 | 改用默认 `\callout{note}{...}` |
| `.log` 出现 `There's no line here to end` | 检查 `\figcap` 后是否紧跟 `\\`，改用 `\par\vspace` | 升级 .sty 到 v3.2（已修复 gridfourcap/gridthreecap） |
| `.log` 出现 `Undefined control sequence`（其它） | 检查 .sty 版本为 v3.2+ | 确认 `\usepackage{colortbl}` |
| **STOP**: `.log` 存在 `Error` → 修复后再继续，不要忽略 | | |
