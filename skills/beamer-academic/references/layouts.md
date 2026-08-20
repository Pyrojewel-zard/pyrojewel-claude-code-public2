# Layout Library

Standard academic page layouts plus dedicated layouts for paper-reading and
paper-algorithm reproduction reports.
Each section contains the LaTeX skeleton and slot definitions for one layout type.

## Table of Contents

1. [cover](#cover) — 封面页
2. [toc](#toc) — 多级目录页
3. [section-divider](#section-divider) — 章节分隔页
4. [text-only](#text-only) — 纯文段页
5. [text-left-image-right](#text-left-image-right) — 左文右图
6. [image-left-text-right](#image-left-text-right) — 左图右文
7. [formula](#formula) — 公式推导页
8. [table](#table) — 数据表格页
9. [full-image](#full-image) — 满版图页
10. [conclusion-box](#conclusion-box) — 结论框页
11. [transition](#transition) — 过渡衔接页
12. [list](#list) — 列表页
13. [thanks](#thanks) — 致谢页
14. [statement](#statement) — 金句页
15. [stats](#stats) — 三个数
16. [hypothesis](#hypothesis) — 三列短句
17. [paper-reading-overview](#paper-reading-overview) — 单篇论文概览
18. [paper-reading-theory-figure](#paper-reading-theory-figure) — 理论/推导—论文图
19. [paper-reading-evidence](#paper-reading-evidence) — 证据—结果图
20. [paper-reading-discussion](#paper-reading-discussion) — QA/困惑点讨论
21. [workflow-overview](#workflow-overview) — 实现流程与当前状态
22. [paper-overview](#paper-overview) — 论文算法概览
23. [algorithm-derivation](#algorithm-derivation) — 算法推导
24. [paper-code-map](#paper-code-map) — 论文—代码对应
25. [reproduction-result](#reproduction-result) — 复现结果
26. [pole-zero-circuit](#pole-zero-circuit) — 极点—零点与等效电路
27. [method-comparison](#method-comparison) — 方法对照

---

## cover

```latex
% Layout: cover (封面页)
% 使用场景: 第一页，展示论文标题、答辩人、导师、专业、院校、日期
% 依赖: \setsupervisor, \setmajor 命令（由主题定义）
%
% Slots:
%   {{TITLE}}       - 论文标题（可含换行 \\）
%   {{AUTHOR}}      - 答辩人姓名
%   {{SUPERVISOR}}  - 导师姓名+职称
%   {{MAJOR}}       - 专业名称
%   {{INSTITUTE}}   - 院校名称
%   {{DATE}}        - 答辩日期

\begin{frame}[plain]
  \titlepage
\end{frame}
```

---

## toc

```latex
% Layout: toc (多级目录页)
% 使用场景: 第二页，展示全文章节结构大纲
%
% Slots:
%   {{CHAPTERS}} - 章节列表，格式为 tabbing 环境内容
%
% 示例填充:
%   \textbf{\color{accentcolor}1}\>\textbf{研究背景与科学问题}\\[1pt]
%   \>\>{\scriptsize\color{textgray}关键词1、关键词2、关键词3}\\[4pt]

\begin{frame}
  \frametitle{汇报提纲}
  \vskip0.05cm
  {\footnotesize
  \begin{tabbing}
  \hspace{0.55cm}\=\hspace{0.80cm}\=\hspace{8cm}\kill
  {{CHAPTERS}}
  \end{tabbing}
  }
\end{frame}
```

---

## paper-reading-overview

```latex
% Layout: paper-reading-overview (单篇论文概览)
% Profile: paper-reading; page 1 of at most 4
% The paper metadata stays in the subtitle layer; body is problem + one source figure.
%
% Slots:
%   {{PAPER_META}}       - 会议/年份｜论文主题｜作者或课题组
%   {{TITLE}}            - 本页内容标题
%   {{LEFT_TEXT}}        - 问题、贡献、范围（约100--140字）
%   {{SOURCE_FIGURE}}    - 论文原图或示意重绘
%   {{SOURCE_CAPTION}}   - 图号、来源类型和本页作用
%   {{NOTE_SOURCE}}      - 解读 / 原文 / provided-note 等来源标签
%   {{CLAIM_BOUNDARY}}   - 本页不声称的内容

\begin{frame}
  \frametitle{{{TITLE}}}
  \framesubtitle{{{PAPER_META}}}
  \begin{columns}[T, onlytextwidth]
    \column{0.40\textwidth}
    \vskip0.10cm
    \small
    {{LEFT_TEXT}}
    \vskip0.12cm
    \keybox{{{CLAIM_BOUNDARY}}}
    {\scriptsize\color{textgray}材料：{{NOTE_SOURCE}}}

    \column{0.60\textwidth}
    \vskip0.02cm
    \includegraphics[width=\linewidth, height=0.60\textheight, keepaspectratio]{{{SOURCE_FIGURE}}}
    \figcap{{{SOURCE_CAPTION}}}
  \end{columns}
\end{frame}
```

---

## paper-reading-theory-figure

```latex
% Layout: paper-reading-theory-figure (理论/推导—论文图)
% Profile: paper-reading; page 2 of at most 4
% Left: theory/intuition and <=2 equations. Right: one matching paper figure.
%
% Slots:
%   {{PAPER_META}}       - 会议/年份｜论文主题｜作者或课题组
%   {{TITLE}}            - 本页内容标题
%   {{THEORY_TEXT}}      - 理论直觉、假设和推导说明
%   {{EQUATIONS}}        - 0--2 个核心公式
%   {{FIGURE}}           - 电路/机制/方法图
%   {{SOURCE_CAPTION}}   - 图号、来源类型和本页作用
%   {{NOTE_SOURCE}}      - 解读 + 原文等来源标签

\begin{frame}
  \frametitle{{{TITLE}}}
  \framesubtitle{{{PAPER_META}}}
  \begin{columns}[T, onlytextwidth]
    \column{0.40\textwidth}
    \vskip0.08cm
    \small
    {{THEORY_TEXT}}
    \vskip0.10cm
    {{EQUATIONS}}
    \vskip0.08cm
    {\scriptsize\color{textgray}材料：{{NOTE_SOURCE}}}

    \column{0.60\textwidth}
    \vskip0.02cm
    \includegraphics[width=\linewidth, height=0.62\textheight, keepaspectratio]{{{FIGURE}}}
    \figcap{{{SOURCE_CAPTION}}}
  \end{columns}
\end{frame}
```

---

## paper-reading-evidence

```latex
% Layout: paper-reading-evidence (证据—结果图)
% Profile: paper-reading; page 3 of at most 4
% Left: interpretation and evidence strength. Right: one result figure.
%
% Slots:
%   {{PAPER_META}}       - 会议/年份｜论文主题｜作者或课题组
%   {{TITLE}}            - 本页内容标题
%   {{EVIDENCE_TEXT}}    - 指标、结果和证据强度
%   {{FIGURE}}           - 仿真/测量/论文结果图
%   {{SOURCE_CAPTION}}   - 图号、来源类型和本页作用
%   {{EVIDENCE_LEVEL}}   - 论文直接测到 / 作者解释 / 读者推演
%   {{NOTE_SOURCE}}      - 结果 + QA 等来源标签

\begin{frame}
  \frametitle{{{TITLE}}}
  \framesubtitle{{{PAPER_META}}}
  \begin{columns}[T, onlytextwidth]
    \column{0.40\textwidth}
    \vskip0.08cm
    \small
    {{EVIDENCE_TEXT}}
    \vskip0.12cm
    \keybox{证据等级：{{EVIDENCE_LEVEL}}}
    {\scriptsize\color{textgray}材料：{{NOTE_SOURCE}}}

    \column{0.60\textwidth}
    \vskip0.02cm
    \includegraphics[width=\linewidth, height=0.62\textheight, keepaspectratio]{{{FIGURE}}}
    \figcap{{{SOURCE_CAPTION}}}
  \end{columns}
\end{frame}
```

---

## paper-reading-discussion

```latex
% Layout: paper-reading-discussion (QA/困惑点讨论)
% Profile: paper-reading; page 4 only when the note has QA, doubts, or a boundary.
%
% Slots:
%   {{PAPER_META}}          - 会议/年份｜论文主题｜作者或课题组
%   {{TITLE}}               - 本页内容标题
%   {{TAKEAWAY_TEXT}}       - 读者自己的 takeaway / 判断
%   {{CLAIM_BOUNDARY}}      - 论文证据能支持到哪里
%   {{QA_OR_CONFUSIONS}}    - QA、困惑点、待验证问题
%   {{NOTE_SOURCE}}         - QA / 困惑点 / 深读问答来源标签

\begin{frame}
  \frametitle{{{TITLE}}}
  \framesubtitle{{{PAPER_META}}}
  \begin{columns}[T, onlytextwidth]
    \column{0.46\textwidth}
    \vskip0.10cm
    \small
    \textbf{我的判断}\par
    {{TAKEAWAY_TEXT}}
    \vskip0.12cm
    \keybox{{{CLAIM_BOUNDARY}}}

    \column{0.54\textwidth}
    \vskip0.10cm
    \small
    \textbf{QA / 困惑点}\par
    {{QA_OR_CONFUSIONS}}
    \vskip0.12cm
    {\scriptsize\color{textgray}材料：{{NOTE_SOURCE}}}
  \end{columns}
\end{frame}
```

---

## workflow-overview

```latex
% Layout: workflow-overview (实现流程与当前状态)
% Profile: implementation-report / reproduction / implementation-analysis;
% before code or status pages. The diagram is rendered by diagram-design from
% diagram/diagram-spec.yaml; never replace it with a code dump.
%
% Slots:
%   {{PAPER_META}}        - 会议/年份｜论文主题｜作者或课题组（可选）
%   {{TITLE}}             - 本页标题
%   {{WORKFLOW_FIGURE}}   - manifest.yaml 指定的 diagram/workflow.png
%   {{CURRENT_STATE}}     - 已完成、进行中、阻塞/未知
%   {{CLAIM_BOUNDARY}}    - 流程图不证明什么
%   {{NEXT_ACTION}}       - 下一步最小验证
%   {{REPORT_SOURCE}}     - manifest.yaml + implementation-report.md + diagram-spec.yaml

\begin{frame}
  \frametitle{{{TITLE}}}
  \framesubtitle{{{PAPER_META}}}
    \includegraphics[width=\linewidth, height=0.53\textheight, keepaspectratio]{{{WORKFLOW_FIGURE}}}
    \figcap{实现流程；由 diagram-design 绘制；来源：{{REPORT_SOURCE}}}
  \vskip0.04cm
  \begin{columns}[T, onlytextwidth]
    \column{0.32\textwidth}
    \scriptsize
    \textbf{当前状态}\par
    {{CURRENT_STATE}}
    \column{0.34\textwidth}
    \scriptsize
    \textbf{边界}\par
    {{CLAIM_BOUNDARY}}
    \column{0.34\textwidth}
    \scriptsize
    \textbf{下一步}\par
    {{NEXT_ACTION}}
  \end{columns}
\end{frame}
```

---

## paper-overview

```latex
% Layout: paper-overview (论文算法概览)
% Profile: reproduction; one paper unit, page 1 of 2--5
% Left: problem/contribution/scope. Right: one large source or schematic figure.
%
% Slots:
%   {{PAPER_ID}}          - 论文 ID 或 Zotero itemKey
%   {{CITATION}}          - 作者、年份、题目/期刊简写
%   {{LEFT_TEXT}}         - 一个论点，约100--150字
%   {{SOURCE_FIGURE}}     - 一张原图或示意重绘图
%   {{SOURCE_CAPTION}}    - 图号、来源类型和本页作用
%   {{CLAIM_BOUNDARY}}    - 本页不声称的内容

% repro-paper: {{PAPER_ID}}
% repro-role: overview
\begin{frame}
  \frametitle{{{CITATION}}：论文到底解决什么问题？}
  \begin{columns}[T, onlytextwidth]
    \column{0.40\textwidth}
    \vskip0.12cm
    \small
    {{LEFT_TEXT}}
    \vskip0.18cm
    \keybox{{{CLAIM_BOUNDARY}}}

    \column{0.60\textwidth}
    \vskip0.02cm
    \includegraphics[width=\linewidth, height=0.64\textheight, keepaspectratio]{{{SOURCE_FIGURE}}}
    \figcap{{{SOURCE_CAPTION}}}
  \end{columns}
\end{frame}
```

---

## algorithm-derivation

```latex
% Layout: algorithm-derivation (算法推导)
% Profile: reproduction; page 2 of 2--5
% Left: assumptions and derivation chain. Right: <=2 equations or one flow.
%
% Slots:
%   {{PAPER_ID}}                 - 论文 ID
%   {{EQUATION_OR_ALGORITHM}}    - 论文公式/算法编号
%   {{ASSUMPTIONS}}              - 可检验假设
%   {{DERIVATION_TEXT}}          - 推导链
%   {{EQUATIONS}}                - 一或两个核心公式
%   {{SOLVER_OBJECT}}            - 代码中实际构造/求解的对象
%   {{SOURCE_CAPTION}}           - 论文公式/图号或示意重绘

% repro-paper: {{PAPER_ID}}
% repro-role: algorithm-derivation
\begin{frame}
  \frametitle{算法推导：{{EQUATION_OR_ALGORITHM}}}
  \begin{columns}[T, onlytextwidth]
    \column{0.40\textwidth}
    \vskip0.12cm
    \small
    \textbf{假设}\par
    {{ASSUMPTIONS}}
    \vskip0.14cm
    \textbf{推导链}\par
    {{DERIVATION_TEXT}}
    \vskip0.14cm
    \textbf{实现对象}\par
    {{SOLVER_OBJECT}}

    \column{0.60\textwidth}
    \vskip0.03cm
    \begin{minipage}{\linewidth}
      \small
      {{EQUATIONS}}
    \end{minipage}
    \figcap{{{SOURCE_CAPTION}}}
  \end{columns}
\end{frame}
```

---

## paper-code-map

```latex
% Layout: paper-code-map (论文—代码对应)
% Profile: reproduction; page 3 of 2--5
% Left: paper steps/equation references. Right: exact file:function and short code.
%
% Slots:
%   {{PAPER_ID}}              - 论文 ID
%   {{PAPER_STEPS}}           - 论文算法步骤
%   {{EQUATION_REFS}}         - 公式/算法编号
%   {{CODE_PATH}}             - 仓库相对路径
%   {{CODE_FUNCTION}}         - 函数名/入口
%   {{CODE_EXCERPT}}          - 8--16行关键代码
%   {{PARAMETERS}}            - 参数映射
%   {{IMPLEMENTATION_STATUS}} - paper-faithful 等状态
%   {{IMPLEMENTATION_NOTE}}   - 当前实现边界
%   {{PLAN_STEP}}             - 对应计划步骤
%   {{INPUT_OUTPUT}}          - 输入 → 输出
%   {{EVIDENCE}}              - 测试/运行/图/none
%   {{NEXT_ACTION}}           - 下一步最小验证

% repro-paper: {{PAPER_ID}}
% repro-role: paper-code-map
\begin{frame}
  \frametitle{论文步骤如何落到代码}
  \begin{columns}[T, onlytextwidth]
    \column{0.40\textwidth}
    \vskip0.10cm
    \small
    \textbf{论文步骤 / 公式}\par
    {{PAPER_STEPS}}
    \vskip0.12cm
    \textbf{对应位置}\par
    {{EQUATION_REFS}}
    \vskip0.12cm
    \textbf{参数映射}\par
    {{PARAMETERS}}
    \vskip0.15cm
    \statuslabel{{{IMPLEMENTATION_STATUS}}}
    \par\smallskip
    {{IMPLEMENTATION_NOTE}}

    \column{0.60\textwidth}
    \vskip0.02cm
    \codeentry{{{CODE_FUNCTION}}}
    {\scriptsize\path{{{CODE_PATH}:{CODE_FUNCTION}}}}\par
    \vskip0.08cm
    {{CODE_EXCERPT}}
  \end{columns}
  \vskip0.06cm
  {\scriptsize
    \textbf{计划：}{{PLAN_STEP}}\quad
    \textbf{输入→输出：}{{INPUT_OUTPUT}}\quad
    \textbf{证据：}{{EVIDENCE}}\quad
    \textbf{下一步：}{{NEXT_ACTION}}\par}
\end{frame}
```

---

## reproduction-result

```latex
% Layout: reproduction-result (复现结果)
% Profile: reproduction; page 4 of 2--5
% Left: scope/metric/decision. Right: one measured or reproduced result figure.
%
% Slots:
%   {{PAPER_ID}}             - 论文 ID
%   {{RUN_ID}}               - run ID
%   {{DATASET_OR_SPLIT}}     - dataset/holdout/screening
%   {{FREQUENCY_BAND}}       - 频率范围和端口对象
%   {{METRIC}}               - 指标和数值
%   {{DECISION}}             - 当前判定
%   {{REPRODUCTION_FIGURE}}  - reproduction 目录中的图
%   {{REPRODUCTION_CAPTION}} - 数据与脚本来源
%   {{EVIDENCE_LEVEL}}       - 证据等级

% repro-paper: {{PAPER_ID}}
% repro-role: reproduction-result
\begin{frame}
  \frametitle{复现结果：论文方法在当前对象上是否成立？}
  \begin{columns}[T, onlytextwidth]
    \column{0.40\textwidth}
    \vskip0.10cm
    \small
    \textbf{运行范围}\par {{RUN_ID}}\\{{DATASET_OR_SPLIT}}
    \vskip0.12cm
    \textbf{频段/端口}\par {{FREQUENCY_BAND}}
    \vskip0.12cm
    \textbf{评价指标}\par {{METRIC}}
    \vskip0.12cm
    \keybox{{{{DECISION}}}}
    \vskip0.08cm
    {\scriptsize\color{textgray}证据等级：{{EVIDENCE_LEVEL}}}

    \column{0.60\textwidth}
    \vskip0.02cm
    \includegraphics[width=\linewidth, height=0.64\textheight, keepaspectratio]{{{REPRODUCTION_FIGURE}}}
    \figcap{{{REPRODUCTION_CAPTION}}}
  \end{columns}
\end{frame}
```

---

## pole-zero-circuit

```latex
% Layout: pole-zero-circuit (极点—零点与等效电路)
% Profile: reproduction; optional page 5
%
% Slots:
%   {{PAPER_ID}}             - 论文 ID
%   {{PHYSICAL_INTERPRETATION}} - 左侧物理解释
%   {{POLE_ZERO_TEXT}}       - 极点/零点和频段关系
%   {{POLE_ZERO_FIGURE}}     - 极点零点图
%   {{CIRCUIT_FIGURE}}       - 等效电路和 S 参数回代图
%   {{CIRCUIT_RETURN_ERROR}} - 回代误差/边界
%   {{NON_CLAIM}}            - 不把 residue 直接当元件的边界

% repro-paper: {{PAPER_ID}}
% repro-role: optional-boundary
\begin{frame}
  \frametitle{极点/零点如何回到感性器件的等效电路？}
  \begin{columns}[T, onlytextwidth]
    \column{0.40\textwidth}
    \small
    {{PHYSICAL_INTERPRETATION}}
    \vskip0.12cm
    {{POLE_ZERO_TEXT}}
    \vskip0.12cm
    \keybox{{{{NON_CLAIM}}}}

    \column{0.60\textwidth}
    \includegraphics[width=\linewidth, height=0.29\textheight, keepaspectratio]{{{POLE_ZERO_FIGURE}}}
    \figcap{极点/零点图；来源：当前拟合脚本}
    \vskip0.08cm
    \includegraphics[width=\linewidth, height=0.29\textheight, keepaspectratio]{{{CIRCUIT_FIGURE}}}
    \figcap{等效电路回代；误差：{{CIRCUIT_RETURN_ERROR}}}
  \end{columns}
\end{frame}
```

---

## method-comparison

```latex
% Layout: method-comparison (方法对照)
% Profile: reproduction; one presentation-level comparison after individual units.
%
% Slots:
%   {{METHODS}}       - 方法名称
%   {{FITTING_OBJECT}} - 拟合对象
%   {{CONSTRAINTS}}   - 极点/无源/连续性约束
%   {{COMPLEXITY}}    - 复杂度和数据需求
%   {{EVIDENCE}}      - 当前证据等级
%   {{DECISION}}      - 方法选择判断

\begin{frame}
  \frametitle{方法如何选择：拟合对象、约束与证据}
  \small
  \begin{center}
    \begin{tabular}{@{}p{0.18\textwidth}p{0.18\textwidth}p{0.22\textwidth}p{0.17\textwidth}p{0.16\textwidth}@{}}
      \toprule
      \textbf{方法} & \textbf{拟合对象} & \textbf{约束} & \textbf{复杂度} & \textbf{证据} \\
      \midrule
      {{METHODS}} \\
      \bottomrule
    \end{tabular}
  \end{center}
  \vskip0.18cm
  \keybox{{{DECISION}}}
\end{frame}
```

---

## section-divider

```latex
% Layout: section-divider (章节分隔页)
% 使用场景: legacy 模式的章节开头；reproduction 中仅作可选白底紧凑章节头
%
% Slots:
%   {{CHAPTER_NUMBER}} - 中文数字（一、二、三...）
%   {{CHAPTER_TITLE}}  - 章标题文字

\sectiondivider{{{CHAPTER_NUMBER}}}{{{CHAPTER_TITLE}}}
```

---

## text-only

```latex
% Layout: text-only (纯文段页)
% 使用场景: 2-3段连贯文字解释概念性内容
%
% Slots:
%   {{TITLE}}      - 页标题
%   {{CHAPNOTE}}   - 对应论文章节标注（可选，留空则不显示）
%   {{PARAGRAPHS}} - 2-3段正文，段间用 \vskip0.2cm 分隔
%
% 注意: 每段控制在80-120字，总字数不超过300字

\begin{frame}
  \frametitle{{{TITLE}}}
  {{CHAPNOTE_LINE}}
  \vskip0.15cm

  {{PARAGRAPHS}}
\end{frame}

% --- chapnote 使用说明 ---
% 如有 chapnote，{{CHAPNOTE_LINE}} 替换为:
%   \chapnote{对应论文 \S X.X}
% 如无，则删除该行
```

---

## text-left-image-right

```latex
% Layout: text-left-image-right (左文右图)
% 使用场景: 文字描述为主，配合一张可读的大图
%
% Slots:
%   {{TITLE}}       - 页标题
%   {{CHAPNOTE}}    - 对应论文章节标注（可选）
%   {{LEFT_TEXT}}   - 左侧文字（100-150字，可含一个公式）
%   {{IMAGE}}       - 右侧单张大图
%   {{CAPTION}}     - 图号、来源类型和本页作用
%
% reproduction 默认布局: 左40% 文字 | 右60% 图片

\begin{frame}
  \frametitle{{{TITLE}}}
  {{CHAPNOTE_LINE}}
  \begin{columns}[T, onlytextwidth]
    \column{0.40\textwidth}
    \vskip0.15cm
    {{LEFT_TEXT}}

    \column{0.60\textwidth}
    \vskip0.05cm
    \includegraphics[width=\linewidth, height=0.64\textheight, keepaspectratio]{{{IMAGE}}}
    \figcap{{{CAPTION}}}
  \end{columns}
\end{frame}
```

---

## image-left-text-right

```latex
% Layout: image-left-text-right (左图右文)
% 使用场景: 图/表是主体信息载体，右侧文字做数据解读
%
% Slots:
%   {{TITLE}}       - 页标题
%   {{CHAPNOTE}}    - 对应论文章节标注（可选）
%   {{LEFT_IMAGE}}  - 左侧图片（占40-62%宽度）
%   {{RIGHT_TEXT}}  - 右侧解读文字（100-150字）
%   {{STATS_TABLE}} - 可选的小型统计结果表
%
% 布局: 左40-62% 图片 | 右38-60% 文字+表

\begin{frame}
  \frametitle{{{TITLE}}}
  {{CHAPNOTE_LINE}}
  \vskip0.05cm
  \begin{columns}[T, onlytextwidth]
    \column{0.52\textwidth}
    \vskip0.1cm
    {{LEFT_IMAGE}}

    \column{0.48\textwidth}
    \vskip0.3cm
    \small
    {{RIGHT_TEXT}}

    {{STATS_TABLE}}
  \end{columns}
\end{frame}

% --- LEFT_IMAGE 示例 ---
%   \includegraphics[width=\linewidth, height=0.62\textheight, keepaspectratio]{image.png}
%   \figcap{图 X\;图说文字}
%
% --- STATS_TABLE 示例（可选）---
%   \vskip0.2cm
%   \begin{tabular}{@{}ll@{}}
%     \toprule
%     指标 & 数值 \\
%     \midrule
%     $R^{2}$ & $0.310$ \\
%     $P$ & $0.001$ \\
%     \bottomrule
%   \end{tabular}
```

---

## formula

```latex
% Layout: formula (公式推导页)
% 使用场景: 展示1-2个核心公式/模型定义
%
% Slots:
%   {{TITLE}}       - 页标题
%   {{CHAPNOTE}}    - 对应论文章节标注（可选）
%   {{INTRO_TEXT}}  - 公式引入文字（50-80字）
%   {{EQUATIONS}}   - LaTeX公式（displaymath环境）
%   {{EXPLANATION}} - 符号解释或结论文字（80-120字）
%
% 注意: 公式不超过2个/页，过多则拆分

\begin{frame}
  \frametitle{{{TITLE}}}
  {{CHAPNOTE_LINE}}
  \vskip0.1cm

  {{INTRO_TEXT}}

  \vskip0.1cm
  {{EQUATIONS}}
  \vskip0.1cm

  {{EXPLANATION}}
\end{frame}

% --- EQUATIONS 示例 ---
% 单公式:
%   \[
%     d_{ij} = \frac{\sum_{k=1}^{p} w_k \delta_{ijk} s_{ijk}}{\sum_{k=1}^{p} w_k \delta_{ijk}}
%   \]
%
% 双公式对比:
%   \[
%     \mathrm{BM}:\; dX_t = \sigma\, dW_t,\qquad
%     \mathrm{OU}:\; dX_t = \alpha(\theta - X_t)\,dt + \sigma\, dW_t.
%   \]
%
% --- EXPLANATION 示例 ---
%   \small
%   其中 $R_k$ 为连续性状取值范围，$\delta_{ijk}$ 为有效观测指示——
%   当任一样本缺失时该维度\alert{不参与距离计算}。
```

---

## table

```latex
% Layout: table (数据表格页)
% 使用场景: 展示实验结果、对比数据、多组统计量
%
% Slots:
%   {{TITLE}}      - 页标题
%   {{CHAPNOTE}}   - 对应论文章节标注（可选）
%   {{INTRO_TEXT}} - 表格说明文字（可选，50字以内）
%   {{TABLE}}      - booktabs 格式表格
%   {{CONCLUSION}} - 表下结论文字（80-120字）
%
% 注意: 表格行数3-8行，列数3-6列

\begin{frame}
  \frametitle{{{TITLE}}}
  {{CHAPNOTE_LINE}}
  \vskip0.1cm

  {{INTRO_TEXT}}

  \vskip0.15cm
  \begin{center}\small
  \setlength{\tabcolsep}{4pt}
  {{TABLE}}
  \end{center}

  \vskip0.2cm
  \small
  {{CONCLUSION}}
\end{frame}

% --- TABLE 示例 ---
%   \begin{tabular}{@{}lcccc@{}}
%     \toprule
%     \textbf{方法} & \textbf{精度} & \textbf{召回率} & \textbf{F1} & \textbf{$P$值} \\
%     \midrule
%     基线 & 0.72 & 0.68 & 0.70 & --- \\
%     \rowcolor{black!5}
%     \textbf{本文} & \textbf{0.89} & \textbf{0.85} & \textbf{0.87} & $0.003^*$ \\
%     \bottomrule
%   \end{tabular}
%
% 技巧:
%   - 用 \rowcolor{black!5} 高亮关键行
%   - 用 \alert{} 标注关键数值
%   - 用 \addlinespace[2pt] 增加行间距
```

---

## full-image

```latex
% Layout: full-image (满版图页)
% 使用场景: 图表信息量大，需要尽可能大地展示
%
% Slots:
%   {{TITLE}}      - 页标题
%   {{CHAPNOTE}}   - 对应论文章节标注（可选）
%   {{IMAGE_PATH}} - 图片文件路径
%   {{CAPTION}}    - 底部图说（一句话）
%
% 布局: 图片通过 tikz overlay 居中放大，占页面约70%面积

\begin{frame}
  \frametitle{{{TITLE}}}
  {{CHAPNOTE_LINE}}
  \begin{tikzpicture}[remember picture, overlay]
    \node[anchor=center] at ([yshift=-0.25cm]current page.center) {%
      \includegraphics[width=0.90\paperwidth, height=0.70\paperheight, keepaspectratio]{{{IMAGE_PATH}}}};
  \end{tikzpicture}
  \vskip-0.4cm
  \begin{flushleft}\scriptsize\itshape\color{textgray}
  {{CAPTION}}
  \end{flushleft}
\end{frame}

% --- 注意事项 ---
% 1. 图片通过 tikz overlay 定位，不受正常文本流影响
% 2. caption 放在左下角，用灰色小字
% 3. 如果图片有白色背景，效果最佳
% 4. 适合：时序图、散点图、热力图、多面板组合图
```

---

## conclusion-box

```latex
% Layout: conclusion-box (结论框页)
% 使用场景: 章/分析结束时总结核心发现，用高亮框突出关键结论
%
% Slots:
%   {{TITLE}}      - 页标题
%   {{CHAPNOTE}}   - 对应论文章节标注（可选）
%   {{BODY_TEXT}}  - 总结性正文（100-150字）
%   {{KEYBOX}}     - 高亮框内容（核心结论，50-80字）
%
% 视觉效果: 正文在上，keybox 在下方用浅灰底+细线框突出

\begin{frame}
  \frametitle{{{TITLE}}}
  {{CHAPNOTE_LINE}}
  \vskip0.2cm

  {{BODY_TEXT}}

  \vskip0.3cm

  \keybox{{{KEYBOX}}}
\end{frame}

% --- KEYBOX 内容示例 ---
%   \textbf{H2 成立}\,——\,Sinsk 事件邻域存在\alert{超出随机预期}的
%   形态空间结构性收缩，且收缩具有\alert{选择性过滤}特征。
%
% 主题里的 \keybox：浅底，左边一条主题色。
```

---

## transition

```latex
% Layout: transition (过渡衔接页)
% 使用场景: 两章之间的逻辑桥梁，承上启下
%
% Slots:
%   {{TITLE}}     - 页标题（如 "从H1到H2：为何...？"）
%   {{SUMMARY}}   - 上一章结论概括（50-80字）
%   {{QUESTIONS}} - 引出的问题/下一步方向（enumerate格式，2-3条）
%
% 结构: 先总结→再提问→引出下一章

\begin{frame}
  \frametitle{{{TITLE}}}
  \vskip0.2cm

  {{SUMMARY}}

  \vskip0.25cm

  {{QUESTIONS}}
\end{frame}

% --- SUMMARY 示例 ---
%   \alert{H1 已确认形态边界的先导地位}。沿这一线索，自然引出第二层问题：
%   既然形态多样性是丰富度变化的领先信号，那么\alert{是什么驱动了形态边界本身的变化}？
%
% --- QUESTIONS 示例 ---
%   \begin{enumerate}\setlength\itemsep{0.4em}
%     \item \textbf{短期外源冲击 (H2)}\,——\,环境扰动是否在形态边界上留下结构性变点？
%     \item \textbf{长期内在约束 (H3)}\,——\,演化轨迹为何能够回归而非持续恶化？
%   \end{enumerate}
```

---

## list

```latex
% Layout: list (列表页)
% 使用场景: 罗列3-5个并列要点（创新点、局限、展望、科研成果等）
%
% Slots:
%   {{TITLE}}      - 页标题
%   {{CHAPNOTE}}   - 对应论文章节标注（可选）
%   {{INTRO_TEXT}} - 引入文字（可选，50字以内）
%   {{ITEMS}}      - enumerate 列表内容
%
% 注意: 每条有简短解释，不是纯标题列表

\begin{frame}
  \frametitle{{{TITLE}}}
  {{CHAPNOTE_LINE}}
  \vskip0.15cm

  {{INTRO_TEXT}}

  \vskip0.2cm

  {{ITEMS}}
\end{frame}

% --- ITEMS 示例（enumerate 风格）---
%   \begin{enumerate}\setlength\itemsep{0.45em}
%     \item \textbf{属级数据整合与时间标尺统一}\,——\,以 \alert{272 属} 为基础，
%           构建对齐 ICS 标尺的出现-缺失矩阵;
%     \item \textbf{面向视角差异的形态表征 (VASM)}\,——\,将壳体几何分解为
%           视角无关核心层与视角特异层;
%     \item \textbf{多元时间序列方向性分析}\,——\,基于 VAR/Granger 与小波相干，
%           将经验叙事推进为\alert{可检验的统计命题};
%   \end{enumerate}
%
% --- ITEMS 示例（enumerate 风格，适合局限/展望）---
%   \begin{enumerate}\setlength\itemsep{0.4em}
%     \item 化石记录不完整，FAD/LAD 存在时间不确定性;
%     \item 主分析样本量有限 ($N=21$)，受小样本约束;
%     \item 分类学替代树以林奈层级近似系统发育关系。
%   \end{enumerate}
```

---

## thanks

```latex
% Layout: thanks (致谢页)
% 使用场景: 最后一页，感谢答辩委员会
%
% Slots:
%   {{GATE_IMAGE}}  - 校门/标志建筑图文件名（可选，无则不显示图片）
%   {{THANKS_TEXT}} - 致谢主标语（如 "恳请各位老师批评指正"）
%   {{AUTHOR_INFO}} - 作者简短信息（如 "XX大学 XX学院 | 姓名"）
%
% 两种模式:
%   - 有 gate_image: 显示校门图 + 致谢文字
%   - 无 gate_image: 简洁致谢页（纯文字居中）

\thanksframe[{{GATE_IMAGE}}]{{{THANKS_TEXT}}}{{{AUTHOR_INFO}}}
% 无图：\thanksframe{恳请各位老师批评指正}{XX大学 XX学院 | 姓名}
```

---

## statement

```latex
% 一页一句。章末、贡献、核心判断用。
\statementframe{{{SENTENCE}}}
```

---

## stats

```latex
\begin{frame}
  \frametitle{{{TITLE}}}
  {{CHAPNOTE_LINE}}
  {{INTRO}}
  \statrow{{{N1}}}{{{L1}}}{{{N2}}}{{{L2}}}{{{N3}}}{{{L3}}}
\end{frame}
```

---

## hypothesis

```latex
\begin{frame}
  \frametitle{{{TITLE}}}
  {{CHAPNOTE_LINE}}
  \hyporow{{{H1}}}{{{T1}}}{{{H2}}}{{{T2}}}{{{H3}}}{{{T3}}}
\end{frame}
```

---
