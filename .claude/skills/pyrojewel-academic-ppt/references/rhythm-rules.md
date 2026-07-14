# 节奏规划指南（Rhythm Rules）

## 三种节奏类型

| 类型 | 定义 | 对应 Beamer | 典型 layout |
|------|------|------------|------------|
| **hero-dark** | 全屏深色背景，视觉冲击 | `[plain]` frame + accentcolor fill | cover, section-divider, statement, kpi-hero |
| **hero-light** | 全屏浅色背景，仪式感 | `[plain]` frame + white/paper fill | closing, statement(浅色变体) |
| **light** | 标准白底内容页 | 普通 frame | text-only, text-left-image-right, formula, table, list |
| **dark** | 深色内容页（呼吸） | frame + dark background | conclusion-box(dark变体) |

## 节奏规划表模板

在 Phase 2.5 中，为每一页规划节奏类型。格式：

```
| 页码 | 节奏类型 | Layout | 说明 |
|------|---------|--------|------|
| P1 | hero-dark | cover | 开场 |
| P2 | light | toc | 大纲 |
| P3 | hero-dark | section-divider | 第一章 |
| P4 | light | text-only | 背景介绍 |
| P5 | light | text-left-image-right | 方法+图 |
| P6 | light | formula | 核心公式 |
| P7 | hero-dark | statement | 关键论点 |
| ... | ... | ... | ... |
```

## 硬规则

1. **禁止连续 3+ 页同节奏类型**（3 页连 light = 视觉疲劳，3 页连 hero = 冲击钝化）
2. **每 4-5 页必须插入 1 个 hero 页**（section-divider / statement / kpi-hero / closing）
3. **30+ 页 deck 至少有 2 个 hero-dark + 1 个 hero-light**
4. **不能全是 light 正文页** — 必须有 dark 或 hero 页制造呼吸
5. **数据密集页（table, kpi-hero）后接呼吸页**（text-only, transition, statement）
6. **每章开头必须是 hero-dark（section-divider）**
7. **每章至少使用 3 种不同 layout**（避免章内视觉单调）

## 各 Layout 默认节奏类型

| Layout | 默认节奏 | 可选变体 |
|--------|---------|---------|
| cover | hero-dark | — |
| toc | light | — |
| section-divider | hero-dark | — |
| text-only | light | dark |
| text-left-image-right | light | dark |
| image-left-text-right | light | dark |
| formula | light | — |
| table | light | — |
| full-image | light | — |
| conclusion-box | light | dark |
| transition | light | — |
| list | light | — |
| thanks | hero-dark | — |
| statement | hero-dark | hero-light |
| kpi-hero | hero-dark | light |
| duo-compare | light | — |
| timeline | light | — |
| two-column-text | light | dark |
| three-cards | light | — |
| definition-grid | light | — |
| architecture | light | — |
| closing | hero-light | hero-dark |

## 8 页节奏模板（可直接套用）

| 页 | 节奏 | Layout | 备注 |
|---|------|--------|------|
| 1 | hero-dark | cover | 开场 |
| 2 | light | toc | 大纲 |
| 3 | hero-dark | section-divider | 第一章 |
| 4 | light | text-only | 背景 |
| 5 | light | formula | 核心方法 |
| 6 | dark | conclusion-box | 阶段结论 |
| 7 | hero-dark | statement | 关键论点 |
| 8 | light | table | 实验数据 |

## 自检方法

生成 .tex 后，用以下命令检查节奏：
```bash
# 提取所有 frame 的 layout 注释
grep -n "% Layout:" defense.tex

# 检查是否有连续 3+ 页同 layout
# (手动审查或用 validate-deck.py)
```
