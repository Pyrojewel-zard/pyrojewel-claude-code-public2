# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### ✨ 新增
- 主题 v1.5：去掉实心页眉，标题改下划线，底栏加进度条
- 封面改为校名 + 标题下单线；致谢去掉 THANK YOU 复读
- 结论框改为左边一条色；表格提供 `\headrow` / `\rowaccent`
- 新页型：`\statementframe`、`\statrow`、`\hyporow`
- 新增 `reproduction` 模式：每篇论文 2--5 页，覆盖算法推导、论文—代码对应和复现结果
- 新增 `paper-overview`、`algorithm-derivation`、`paper-code-map`、`reproduction-result`、`pole-zero-circuit`、`method-comparison` 版式
- 新增 `paper-reading` 模式：接收 `ljg-paper` / `ljg-read` / `ljg-qa` 阅读材料，单篇论文最多4页
- 新增 Markdown-first `outline.md` 确认门槛，以及 `paper-reading-overview`、`paper-reading-theory-figure`、`paper-reading-evidence`、`paper-reading-discussion` 版式
- 新增 `paper-reading-semantic-brief.md`：将 `ljg-read` 的一句话摘要、结构地图、`[骨]/[肌]/[筋]`、碰撞与复盘显式映射为 slide claims / evidence links / discussion tension
- 新增 `paper-reading-layout-policy.md`：固定 `argument-left-evidence-right` 空间语法，禁止 paper-reading 为制造节奏而左右翻转
- 新增 `validate_paper_reading_deck.py`：检查页数、role、provenance、evidence boundary、固定布局轴，以及未完成伴读伪造“我的判断/读后一句话”的回归
- 将计划/代码现状拆到 `implementation-report`；工作流由 `diagram-design` 根据 `diagram-spec.yaml` 直接绘制，本 skill 通过 `workflow-overview` 消费 manifest 指定的 PNG
- 增加 `implementation-analysis` profile，消费结果分析、数据审计、公式推导、Python 图表和编译后排版 QA
- 章节页改为白底紧凑强调线；主题增加 `listings`、`\codeentry`、`\statuslabel`、`\paperstep`
- 新增 `references/visual-qa-loop.md`：把 `pdftoppm` 栅格化读回升级为所有 academic Beamer 的最终交付门，而不再只针对 implementation-analysis；同时恢复正文 ≥8pt、表格 ≥7.6pt、图注 ≥7pt、标题 ≤2 行等可读性硬门
- 新增 `scripts/render_visual_qa.py`：自动生成逐页 PNG、contact sheet、`pdfinfo`、layout text 和 `qa/layout-review.md`，支持“整体节奏 → 逐页可读性”的双尺度视觉检查
- 新增 equation provenance：`paper-equation`、`reader-derived`、`rf-bridge/textbook-bridge`、`report-abstraction`，避免把 Friis / transducer gain 等解释性桥接公式伪装成原论文公式
- 新增 asset reproducibility gate：最终交付不得存在 `safeimg`/缺图占位；figure catalog 中选中的图片必须在干净 checkout/deliverable 中真实存在

### ♻️ Changed
- `paper-reading-contract.md` 改为两阶段语义门：`ljg-read note -> reading-brief.md -> outline.md -> LaTeX`，不再允许从阅读笔记直接做弱摘要填栏
- paper-reading 的通用 rhythm 规则改为栏内 composition 变化；`image-left-text-right` 在该 profile 中明确禁用
- RFIC `theory-figure` 页面新增强制 `circuit/equation insight`：公式必须解释起点模型、假设、变量到电路的映射、物理意义、trade-off 与设计选择，而不是只摘录最终表达式
- 公式是核心论证时允许使用两个 `theory-figure` 页面；优先移除可选 discussion 页，避免为了固定四角色而压缩关键电路推导
- paper-reading 双栏从固定约 40/60 改成按证据对象动态分配：结果图优先给右栏 58--65%，推导页只有在右图简单可读时才允许左栏超过 50%；稠密多 panel 原图优先裁切或拆页
- equation-centric 页面从“最多两条公式”的机械限制改成“一条 derivation spine”：通常 2--3 个 display-math block 可以属于同一推导链，但超过 3 个独立公式块默认拆页
- 长综述不再靠左右翻转制造节奏；每约 4--6 个内容页插入 section river、full-width source figure、comparison 或 synthesis 作为视觉 reset
- `compile.sh` 现在使用 `-halt-on-error` 两遍编译、检查常见 overflow/error，并在 Poppler/Python 可用时自动运行 rendered visual QA
- 最终视觉层级默认压成三层：frame title → main content → 一行 provenance/footer；避免 caption + note + boundary + source 在页底连续堆叠挤压主体

## [1.4.0] - 2026-05-22

### ✨ Added
- Phase 1.2: Material confirmation — present figure catalog in-conversation, let user mark priorities
- Phase 0.4: Language strategy — handle English thesis → Chinese PPT with terminology mapping
- Phase 5.1: Guided modification — offer 2-3 concrete choices instead of making user describe changes
- Phase 6: Speaker notes & rehearsal — per-page notes, time pacing table, beamer notes integration

## [1.3.0] - 2026-05-22

### ✨ Added
- Phase 2 rewritten as 3-pass in-conversation brainstorm (structure → per-chapter → final confirm)
- All confirmation happens in chat, never requires user to open .md files
- Each chapter gets individual attention with per-page layout table

### 🗑️ Removed
- File-based outline.md confirmation (replaced by in-conversation flow)

## [1.2.0] - 2026-05-21

### ✨ Added
- Phase 0: Support `.tex` (best) > `.docx` > `.pdf` input priority with quality warnings
- Phase 0: LaTeX environment detection for all OS (macOS/Ubuntu/Fedora/Arch/WSL)
- Phase 0: Overleaf fallback for users without local LaTeX
- Phase 4.2: Layout bug detection — overlap prevention rules and auto-fix table
- Mandatory outline approval with three-level structure (chapter → section → page)

## [1.1.0] - 2026-05-21

### ♻️ Changed
- Restructured to standard skill format with YAML frontmatter
- `layouts/*.tex` → `references/layouts.md` (single reference file)
- `theme/` → `assets/` (standard skill asset directory)
- SKILL.md rewritten in imperative form, under 500 lines

### ✨ Added
- `references/tex-header.md` — LaTeX preamble template
- `scripts/compile.sh` — compilation helper script

## [1.0.0] - 2026-05-21

### ✨ Added
- Initial release
- 13 professional page layouts (cover, toc, section-divider, text-only, text-left-image-right, image-left-text-right, formula, table, full-image, conclusion-box, transition, list, thanks)
- 5 color schemes (blue, red, green, purple, teal)
- Universal academic beamer theme (`beamerthemeAcademic.sty`)
- Full pipeline: material extraction → outline → content → compile → interactive edit
- Layout registry with selection rules (`_registry.yaml`)
- User configuration template (`config.yaml`)

[1.4.0]: https://github.com/Faust-Donf/beamer-academic/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Faust-Donf/beamer-academic/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Faust-Donf/beamer-academic/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Faust-Donf/beamer-academic/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Faust-Donf/beamer-academic/releases/tag/v1.0.0