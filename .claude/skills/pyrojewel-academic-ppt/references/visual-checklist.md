# 视觉质量检查清单（Visual Checklist）

生成 PPT 前通读一遍；生成后逐项自检。源自 guizang-ppt-skill 的 P0-P3 体系，适配 Beamer。

---

## P0 · 必须通过（任一失败 = deck 不合格）

### P0-1. Layout ID 注册校验
每个 `\begin{frame}` 前必须有 `% Layout: <id>` 注释，id 在 22 种注册 layout 中。
```bash
grep -c "% Layout:" defense.tex  # 应等于 frame 总数
```

### P0-2. 最小投影字号
- meta/kicker/标签 ≥ 7pt
- caption/figcap/图注 ≥ 8pt
- body 正文 ≥ 9pt
```bash
# 检查是否有低于 7pt 的字号
grep -E "\\\\fontsize\\{[1-6]pt" defense.tex
```

### P0-3. 逆字重阶梯
`\frametitle` 不得使用 `\bfseries`（大字用轻字重）。
```bash
grep "frametitle.*bfseries" defense.tex  # 应无结果
```

### P0-4. 直角规则
所有 TikZ 节点 `rounded corners` 必须为 `0pt` 或省略（默认 0）。
```bash
grep "rounded corners=[1-9]" defense.tex  # 应无结果
```

### P0-5. 节奏规则
无连续 3+ 页同 layout 类型。每 4-5 页有 hero 页。

### P0-6. 内容门控
- 数据 layout（table, kpi-hero）必须包含 `tabular` 或 `\kpinumber`
- 图片 layout（full-image, text-left-image-right, image-left-text-right）必须包含 `\includegraphics`
- 概念 layout（text-only, statement, transition）不得包含 `tabular`

### P0-7. 图片槽位
图片 layout 的 `\includegraphics` 路径不能为空占位符。

### P0-8. 图表编号连续
所有 `\figcap{图 N` 中的 N 必须从 1 开始连续递增，不跳不重。

---

## P1 · 应当通过（交付前修复）

### P1-1. 间距 token 使用
优先使用 `\spOne`~`\spEleven`，避免裸 `\vskip0.2cm`。
```bash
grep -E "\\\\vskip[0-9]" defense.tex | grep -v sp  # 检查裸 vskip
```

### P1-2. 标题左对齐
除 statement 和 cover 外，frametitle 左对齐，不居中。

### P1-3. Overlay 配方匹配
每个 layout 使用对应的 overlay animation recipe，而非通用 `\pause`。

### P1-4. alert 频率
每页 `\alert{}` 不超过 2 个。

### P1-5. 图表编号一致
图编号和表编号各自连续，不跳不重。

### P1-6. 章节多样性
每章至少使用 3 种不同 layout。

### P1-7. 单一 accent 色
一份 deck 只用一个 accent 色，不混搭。

---

## P2 · 建议通过（视觉打磨）

### P2-1. 发丝线使用
章节分隔用 `\hairline`（0.4pt），不用粗线。

### P2-2. chapnote 存在
内容密集页应有 `\chapnote{对应论文 §X.X}`。

### P2-3. conclusion-box 章末
每章末尾如有明确结论，使用 conclusion-box layout。

### P2-4. 深色页穿插
hero-dark 页与 light 页交替，制造呼吸感。

---

## P3 · 锦上添花

### P3-1. 统一图片比例
图片使用标准比例：4:3 / 16:10 / 1:1 / 16:9，不用原图奇葩比例。

### P3-2. 无 overfull 警告
编译日志中无 `Overfull \hbox` 或 `Overfull \vbox` 警告。

### P3-3. 页码一致
footline 中 `\insertframenumber/\inserttotalframenumber` 与实际帧数一致。

---

## 最终自检清单

```
预检（生成前）
  □ 已选定 9 种配色之一（5 academic + 4 Swiss）
  □ 已画出节奏规划表，满足硬规则
  □ 每页已分配 layout，内容门控无冲突

内容
  □ 标题无 AI 味（参考 writing-style.md）
  □ 每页 composition pattern 与相邻页不同
  □ 术语全文一致

排版
  □ frametitle 使用 \mdseries（非 \bfseries）
  □ 间距使用 token（\spOne~\spEleven）
  □ \keybox 直角（rounded corners=0pt）
  □ figcap ≥ 8pt, chapnote ≥ 7pt

视觉
  □ hero 页与 light 页交替
  □ 发丝线（0.3-0.4pt），无粗线
  □ 单一 accent 色

编译
  □ xelatex 编译无错误
  □ 无 overfull hbox/vbox
  □ PDF 页数与规划一致
```
