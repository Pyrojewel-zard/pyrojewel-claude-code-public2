# Writing Style Guide（高密度学术汇报）

## Density-first page contract

默认不是“把一句话放大到一页”，而是让每页完成一次小论证：

`结论/问题 → 论文证据 → 证据解释或边界`

- 普通文字页目标 180--240 字；方法、表格、公式和多图页按可读信息量核算。
- 连续单图页最多 1 页。单图必须是完整流程、总框架或关键主结果，否则应与相关图组成双图/三图页。
- 每份综述或组会报告至少 6 页双图/多图，其中至少 2 页为三图或“1 大图 + 2 细节图”。
- 多图页每张图都要有“图中事实 + 本页作用”图注，页底必须有跨图结论。
- 正文、图注和表格不得通过压到 7.2pt 以下来换取密度；可读性检查失败即回退重排。

## Title Rules

### 必须满足

- 包含核心术语和方法限定（"基于…"、"面向…"）
- 可被文献检索匹配
- 格式：`[方法/框架名]：[核心动作] + [对象] + [条件/目标]`

### 示例

- ✓ "CFD-PE：基于极点展开的频响特征提取方法"
- ✓ "Three-Force 框架：正则化、约束与平衡的协同优化"
- ✗ "一频多看，窄门自开"
- ✗ "极点在复频域展开成山峰"

### Anti-AI 检查

- ❌ "深入探讨..." / "全面分析..." / "系统研究..."
- ❌ "...的重要性" / "...的必要性"
- ❌ 过于宽泛："方法论" / "实验部分" / "结果与讨论"
- ✅ 具体、有信息量，像答辩学生会起的标题

## Content Patterns

### Pattern 1: 段落 + keybox

```latex
\begin{frame}
  \defenseframetitle{驱动机制之一：外源突变与 Sinsk 事件}
  \chapnote{对应论文 §1.1.2}

  Sinsk 事件 (约 513 Ma) 是寒武纪早期具有代表性的生物危机...

  \keybox{\textbf{核心问题}：这一外源环境冲击是否能在形态空间中留下\alert{可识别的结构性变点}?}
\end{frame}
```

### Pattern 2: 段落 + 公式 + 段落

```latex
\begin{frame}
  \defenseframetitle{驱动机制之二：系统发育约束}

  渐变假说关注系统内部约束在长时间尺度上的累积作用...

  \[
    \mathrm{BM}:\; dX_t = \sigma\, dW_t,\qquad
    \mathrm{OU}:\; dX_t = \alpha(\theta - X_t)\,dt + \sigma\, dW_t.
  \]

  OU 较 BM 多出向均值 $\theta$ 回复的项...
\end{frame}
```

### Pattern 3: 段落 + 表格 + 结论

```latex
\begin{frame}
  \defenseframetitle{研究目标与三个核心假设}

  本文围绕"\alert{丰富度根植于多样性}"提出三个假设：

  \begin{center}\small
  \begin{tabular}{@{}lll@{}}
    \toprule
    \textbf{编号} & \textbf{核心假设} & \textbf{检验方法} \\
    \midrule
    H1 & ... & ... \\
    \bottomrule
  \end{tabular}
  \end{center}

  \small 三者共同构成完整解释路径。
\end{frame}
```

### Pattern 4: contentcard（答辩专用卡片）

```latex
\begin{frame}
  \contentcard{方法框架：VASM 多层特征分解}
  {
    本文提出 VASM 框架，把特征向量分解为两层：

    \begin{itemize}
      \item \textbf{全局核心层}：任意视角可估算的无量纲指标...
      \item \textbf{视角特异层}：仅特定投影可见的卷曲扩张率...
    \end{itemize}
  }
\end{frame}
```

### Pattern 5: contentcardpair（双卡片并排对比）

```latex
\begin{frame}
  \contentcardpair
    {方法A}{方法A的描述...}
    {方法B}{方法B的描述...}
\end{frame}
```

### Pattern 6: 满版图 + 底部一句话

```latex
\begin{frame}
  \defenseframetitle{三类指标的时间序列}
  \begin{tikzpicture}[remember picture, overlay]
    \node[anchor=center] at ([yshift=-0.25cm]current page.center) {%
      \includegraphics[width=0.90\paperwidth, height=0.70\paperheight, keepaspectratio]{figure.png}};
  \end{tikzpicture}
  \vskip-0.4cm
  \begin{flushleft}\scriptsize\itshape\color{textgray}
  图说文字
  \end{flushleft}
\end{frame}
```

### Pattern 7: 文本 + 图（双栏）

```latex
\begin{frame}
  \defenseframetitle{方法架构}
  \begin{columns}[T]
    \begin{column}{0.48\textwidth}
      文字描述...
    \end{column}
    \begin{column}{0.48\textwidth}
      \colimg{fig_architecture.jpeg}
      \figcap{图 1\quad 架构示意图}
    \end{column}
  \end{columns}
\end{frame}
```

### Pattern 8: 引言/动机页（quoteline + infobox）— 类型 J

```latex
\begin{frame}
  \defenseframetitle{研究动机}
  \quoteline{现有方法在复频域参数提取时存在极点耦合难以分离的问题，限制了高频段建模精度。}
  \infobox{核心问题}{能否在 10GHz 以上频段稳定分离主导极点？}
\end{frame}
```

### Pattern 9: 流程页（sectionbar + stepline）— 类型 H

```latex
\begin{frame}
  \sectionbar{方法流程}
  \stepline{1}{对频响数据做复频域拟合，提取主导极点。}
  \stepline{2}{按极点实部排序，分离实极点与共轭极点对。}
  \stepline{3}{对各极点单独展开，重构频响分量。}
\end{frame}
```

### Pattern 10: 三卡片对比（threecard）— 类型 A 变体

```latex
\begin{frame}
  \defenseframetitle{三方法对比}
  \threecard
    {方法A}{简述与结果...}
    {方法B}{简述与结果...}
    {方法C}{简述与结果...}
\end{frame}
```

### Pattern 11: 警示/结论页（callout）— 类型 I

```latex
\begin{frame}{结论与展望}
  \textbf{核心结论}：CFD-PE 将建模误差降低 65\%。
  \hairline
  \callout{warn}{\textbf{局限性}：极点数需人工设定，欠拟合时需模型选择。}
  \callout{tip}{\textbf{未来方向}：自动极点数估计 + 稀疏正则化。}
\end{frame}
```

### Pattern 12: 公式页（段落 + 公式 + summarybar）— 类型 G

```latex
\begin{frame}
  \defenseframetitle{极点展开公式}
  设频响函数 $H(s)$ 的极点为 $p_k$，则：
  \[
    H(s) = \sum_{k=1}^{N} \frac{r_k}{s - p_k},\qquad r_k = \lim_{s\to p_k}(s-p_k)H(s).
  \]
  \summarybar{关键：极点 $p_k$ 与留数 $r_k$ 共同决定频响特征。}
\end{frame}
```

### Pattern 13: 信息条段落页（infobox）— 类型 B 轻量

```latex
\begin{frame}
  \defenseframetitle{背景补充}
  \infobox{}{CFD-PE 方法源于复频域极点展开理论，适用于宽带高频场景的频响建模。}
\end{frame}
```

## 多样性轮换规则（生成时强制）

同一份 PPT 内必须出现 ≥5 种不同 Pattern，且不连续 ≥3 页用同一 Pattern。生成全部 frame 后逐页核对 Pattern 编号，不达标则重分配。页面类型数量不能替代信息密度：多图页仍需图注和跨图解释。详见 `SKILL.md` §3.2-3.5。

## Dense evidence patterns

### Pattern 14: 双图对比 + 跨图结论

```latex
\begin{frame}
  \defenseframetitle{两条方法路线的共同约束}
  \gridtwocap{fig_a.jpeg}{左图：方法 A 的输入与响应。}{fig_b.jpeg}{右图：方法 B 的输出与验证。}
  \small 两张图分别展示表示空间与验证环节；共同结论是……
  \summarybar{图 A 解决搜索表达，图 B 解决物理回代，两者不能互相替代。}
\end{frame}
```

### Pattern 15: 主图 + 两个细节图

```latex
\begin{frame}
  \defenseframetitle{主流程与局部证据}
  \gridonextwo{fig_main.jpeg}{fig_detail_a.jpeg}{fig_detail_b.jpeg}
  \small 主图给出整体流程，两个细节图分别说明数据入口和验证出口；文字必须解释三者如何共同支撑本页结论。
\end{frame}
```

### Pattern 16: 图 + 定量表格

```latex
\begin{frame}
  \defenseframetitle{定性结构与定量边界}
  \begin{columns}[T]
    \begin{column}{0.47\textwidth}
      \safeimg[4.0cm]{fig_structure.jpeg}
      \figcap{结构图说明搜索空间。}
    \end{column}
    \begin{column}{0.49\textwidth}
      \cardtable{\begin{tabular}{lcc} ... \end{tabular}}
      \small 表格说明误差、数据量或验证层级，不能只放一个最终数字。
    \end{column}
  \end{columns}
\end{frame}
```

## 内容 Anti-AI 检查

- ❌ "值得注意的是..." / "需要指出的是..." / "总而言之..."
- ❌ "本研究具有重要的理论意义和实践价值"
- ❌ "综上所述" / "不难发现" / "显而易见"
- ✅ 直接陈述事实和数据，不加空洞评价
- ✅ 用论文本身的术语，不要"翻译腔"

## 答辩用语规范

- 致谢语：**必须**使用"恳请各位老师批评指正"
- 禁止英文致谢语 "Thank you! Questions?"
- 封面：必须使用 `\defensecover{校名}{导师姓名 职称}`
