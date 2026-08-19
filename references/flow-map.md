# Research Workflow & Skill Flow Map

基于日常研究工作的自洽工作流盘点。每个flow标注自洽性、前置条件、调用skill链和日常频率。

---

## Flow 总览

| # | Flow | 自洽性 | 前置条件 | 日常频率 |
|---|------|--------|----------|----------|
| 1 | 调研→阅读→汇报→判断 | ✅ | Zotero MCP + 改路径 + xelatex | 开新方向时 |
| 2 | 文献检索+综述 | ✅ | 零 | 开新方向时 |
| 3 | DSE参数探索 | ✅ | 零 | 每周 |
| 4 | 实验→分析 | ✅ | 零 | 每次实验后 |
| 5 | 论文写作 | ⚠️ 半自洽 | paper-compile自洽；plan/write/review需Codex runtime适配（REVIEWER_MODEL+helper路径） | 投稿期 |
| 6 | 周报+组会 | ✅ | 零 | 每周 |
| 7 | 审稿回复 | ✅ | 零 | 投稿后 |
| 8 | Idea发现(AI轨道) | ⚠️ 适配后可自洽 | Codex runtime可用；需适配REVIEWER_MODEL+helper脚本路径+shared-refs路径 | — |
| 9 | 数据库检索与全文抽取 | ⚠️ 半自洽 | Zotero MCP + Chrome登录态 + MarkerPDF路径 | 开新方向/补全文时 |
| 10 | 知识库沉淀 | ⚠️ 半自洽 | Vault路径统一 | 每次session后 |
| 11 | 学术PPT与可视化汇报 | ⚠️ 半自洽 | xelatex或浏览器验证 | 组会/汇报前 |

### 双轨道结构

研究启动时，两条轨道并行运行：

```
轨道A（AI驱动）：/idea-discovery 全自动闭环
  research-lit → idea-creator → novelty-check → research-review → research-refine
  输出：候选idea + 新颖性评估 + 精炼方案
  （Codex runtime可用，需适配REVIEWER_MODEL+helper脚本路径+shared-refs路径）

轨道B（人驱动）：调研→阅读→汇报→判断（Flow 1）
  zotero search → pyrojewel-paper × N → pyrojewel-paper-river → pyrojewel-paper-qa → beamer-academic → 组会汇报
  输出：我的理解 + QA对齐 + 组会PPT + 我的判断
  （当前自洽，仅需Zotero MCP + 改路径 + xelatex）

交汇点：两条轨道的结果交汇于你的判断
  轨道B的深度理解 → 验证/推翻/修正轨道A的idea
  你自己读过、想过、讲过 → 才有底气说"AI推荐的idea对不对"
```

两条轨道不是上下游，而是独立的。论文阅读不是idea-discovery的子环节——
它是你独立建立理解的途径，组会PPT是你形成判断的过程。

---

## Flow 1：调研→阅读→汇报→判断 ✅

**场景**：开新研究方向时，从检索论文到深度阅读到组会汇报到形成判断

这是你做调研的完整闭环，与Flow 8(Idea发现)的AI轨道并行独立运行。

```
输入：研究方向关键词
  │
  ├─ Step 1: 论文检索
  │     zotero-semantic-search ─── 在Zotero库里语义搜索相关论文群
  │       依赖：Zotero MCP (semantic_search, search_library, get_item_details)
  │       环境变量：$ZOTERO_STORAGE (default: /mnt/c/Users/28956/Zotero/storage)
  │       输出：论文列表表（# | Title | Item Key | Attachment Key | PDF | MD | Images）
  │
  │     zotero-pdf-parse ────────── PDF → Markdown转换（无content.md时补充）
  │       依赖：Zotero MCP (get_item_details) + MarkerPDF脚本
  │       环境变量：$MARKERPDF_SCRIPT (default: /home/DataTransfer/Pyrojewel/01_lab/markerpdf_zotero/scripts/markerpdf_convert.py)
  │       环境变量：$MARKERPDF_ENV (default: /home/DataTransfer/Pyrojewel/01_lab/markerpdf_zotero/.env)
  │       输出：Zotero storage目录下的content.md + jpeg图片
  │
  │     可选补充：arxiv（arXiv搜索）+ semantic-scholar（S2搜索）
  │       扩展到Zotero库外的论文检索（Flow 2的skill可复用）
  │
  ├─ Step 2: 深度阅读（river + paper并行）
  │     │
  │     ├─ /pyrojewel-paper-river ──────── 溯源脉络（框架层）
  │     │     输入：最核心的那篇论文
  │     │     输出：
  │     │       ├─ 溯源地图（论文间的引用/批判关系，ASCII图）
  │     │       ├─ 问题演化叙事（每篇论文看到前人什么问题→用什么解法→留下什么新问题）
  │     │       ├─ 洞见（这条线背后真正在发生什么认知转变）
  │     │       ├─ 问题-解法总览（压缩一屏的ASCII图）
  │     │     10步：获取论文 → 提取批判链 → 递归溯源(最多5层)
  │     │           → 前沿延伸 → 构建演化线 → 正向费曼叙事
  │     │           → 画图 → 提炼洞见 → 红线检查 → 生成文件
  │     │     依赖：Zotero MCP + WebSearch（引用链追踪）
  │     │     硬编码路径：/mnt/c/Users/28956/Zotero/storage
  │     │
  │     ├─ /pyrojewel-paper × N ────────── 每篇论文的精读笔记（细节层）
  │     │     输入：river链上每篇论文（+自己额外关注的论文）
  │     │     输出（每篇）：
  │     │       ├─ 问题体验（具体例子让人亲历困境）
  │     │       ├─ 方法翻译（机制+设计选择的理由）
  │     │       ├─ 3核心概念（在该例子上落地）
  │     │       ├─ 1洞见（思想结晶）
  │     │       ├─ 博导审稿（选题/方法/实验/写作判断）
  │     │       ├─ 启发（迁移/混搭/反转三个视角）
  │     │     9步：获取内容 → 问题 → 翻译 → 核心概念 → 洞见
  │     │           → 顾问审 → 启发 → 红线 → 生成文件
  │     │     依赖：Zotero MCP + ieee-get-fulltext（IEEE论文时）
  │     │     硬编码路径：/mnt/c/Users/28956/Zotero/storage
  │     │
  │     └─ /ljg-plain ──────────── 白话理解（辅助，某概念读不懂时）
  │           输入：任何难理解的内容
  │           输出：12岁能懂的版本
  │           依赖：零（完全自包含）
  │
  ├─ Step 3: QA对齐（交互式，逐篇）
  │     /pyrojewel-paper-qa ────── 对每篇paper-report进行拷打对齐
  │     输入：paper-report-X.md
  │     输出：qa-report-X.md（差异点 + 逼问 + 对齐结论 + ✅/⚠️/❌状态）
  │     5-10个Q从paper-report的AI分析提取，逐Q与用户理解对齐
  │
  ├─ Step 4: 组会汇报PPT
  │     /implementation-report ────── 计划、代码现状和实现流程图材料包
  │       输入：planning 文件 + 当前代码状态
  │       输出：manifest.yaml + implementation-report.md + workflow.mmd + workflow.html/png
  │
  │     /beamer-academic ─────────── 生成组会/论文阅读/复现 Beamer PPT
  │     输入：river输出（框架）+ paper输出×N（细节）+ 可选 implementation-report bundle
  │     输出：presentation.tex + presentation.pdf + assets
  │     答辩变体：需要证据契约和 Obsidian 周会输出时改用 /pyrojewel-beamer-academic
  │
  │     PPT结构设计：
  │       ├─ 开场(1页)：调研方向说明
  │       ├─ 框架页（来自river）：
  │       │   ├─ 溯源地图(1页) —— 全景：这条线有哪些论文，谁批判谁
  │       │   ├─ 问题演化叙事(2-3页) —— 从最老到最新，每步转折一句话
  │       │   ├─ 洞见总结(1页) —— 这条线背后真正的认知转变
  │       ├─ 论文解读页（来自paper，每篇2-3页）：
  │       │   ├─ Paper_A(2页)：问题体验 + 方法翻译
  │       │   ├─ Paper_B(2页)：问题体验 + 方法翻译
  │       │   ├─ Paper_C(2-3页)：核心论文，加核心概念页
  │       │   ...
  │       ├─ 综合判断页(1-2页)：
  │       │   ├─ 各论文启发汇总
  │       │   ├─ 交叉对比（river的差异驱动叙事）
  │       │   ├─ 我的判断（方向是否值得继续）
  │       └─ 下一步计划(1页)
  │
  │     注：beamer-academic当前设计是从论文PDF/阅读笔记生成PPT，
  │         实现状态和流程图先由 implementation-report 整理，
  │         再由 beamer-academic 消费其 Markdown/图形材料
  │
  └─ Step 5: idea判断与提炼
        阅读自己产出的笔记 + 组会PPT后的思考
        形成对方向的独立判断
        交汇点：与轨道A(idea-discovery)的输出对比验证
```

**核心设计**：river产出框架，paper产出细节，两者合在一起才是完整的调研。
  river告诉你"这条线怎么演化的"，paper告诉你"每篇论文具体做了什么"。
  组会PPT是两者的合成——框架页来自river，细节页来自paper。

**自洽条件**：Zotero MCP就绪 + 修改3处硬编码路径 + xelatex就绪
**降级方案**：不用Zotero MCP时，直接给PDF文件路径或URL，pyrojewel-paper/pyrojewel-paper-river仍可工作
**并行关系**：此flow与Flow 8(Idea发现)并行独立运行，交汇于Step 4的判断

**主线文档**：[flow-chain-1-paper-to-ppt.md](./flow-chain-1-paper-to-ppt.md)

## Flow 2：文献检索+综述流 ✅

**场景**：开新研究方向时，系统检索文献、找研究空白、写综述

```
输入：研究方向关键词（如"RF circuit GNN layout optimization"）
  │
  ├─→ arxiv ──────────────────── arXiv搜索+下载+摘要
  │     依赖：零（有inline Python fallback，用urllib调arXiv API）
  │     输出：搜索结果表 + 下载PDF到papers/ + 可选wiki ingest
  │     7步：解析参数 → 搜索 → 获取详情 → 下载PDF → 摘要 → 更新wiki → 输出
  │
  ├─→ semantic-scholar ────────── S2搜索（有venue/citation/DOI信息）
  │     依赖：零（有inline Python fallback，用urllib调S2 API）
  │     可选：SEMANTIC_SCHOLAR_API_KEY环境变量（免费，提高速率限制）
  │     默认过滤：--fields-of-study "Computer Science,Engineering" → 需改为含EE/RF
  │     输出：结果表（venue/citation/DOI）+ 详细摘要 + 可选wiki ingest
  │
  ├─→ research-gap-finder ────── 找研究空白
  │     依赖：零（自包含，references/problem_framing_template.md + gap_analysis_template.md）
  │     输出：主题总结 / 现有工作覆盖 / 常见方法路线 / 当前瓶颈 / 争议点 / 研究空白 / 小问题切入点 / 实验验证想法 / 风险提示
  │
  └─→ survey-writer ──────────── 中文综述草稿
        依赖：零（自包含，references/comparison_dimensions.md + related_work_patterns.md + survey_template.md）
        输出：中文综述草稿（问题定义/方法分类/方法演进/代表工作对比/开放问题）
```

**自洽条件**：零外部依赖（arxiv/semantic-scholar有Python inline fallback）
**扩展**：接入Zotero MCP后，检索结果可直接入库

---

## Flow 3：DSE参数探索流 ✅

**场景**：电路参数扫描——增益、噪声系数、功耗随管子尺寸/偏置的变化

```
输入：仿真脚本 + 参数范围（可从源码自动推断）
  │
  └─→ dse-loop ───────────────── 设计空间探索闭环
        依赖：零（完全自包含，无MCP/模型依赖）
        4阶段：
          Phase 0: 解析任务+设置
            - 解析参数范围（可从源码推断缺失范围）
            - 创建dse_results/目录
            - 写解析脚本
            - 跑baseline
          Phase 1: 初始探索
            - Latin Hypercube Sampling或结构化扫描
            - 5-10个多样化采样点
            - 记录到dse_log.csv
          Phase 2: 定向搜索
            - 自适应策略选择：网格搜索/坐标下降/二分搜索/Pareto前沿
            - 根据参数数量和类型自动选择
          Phase 3: 精炼
            - 局部扰动 + 灵敏度分析 + 约束边界探索
          Phase 4: 报告
            - DSE_REPORT.md（最优配置/轨迹/灵敏度/建议）
            - dse_log.csv（每轮迭代记录）
            - DSE_STATE.json（恢复状态）
            - 可选matplotlib收敛/灵敏度图
        输出：dse_results/DSE_REPORT.md + dse_log.csv + DSE_STATE.json
```

**自洽条件**：零外部依赖
**领域适配**：默认EDA工具链（gem5/yosys/verilator/openroad等）是用户提供的，skill本身只负责参数扫描逻辑
**关键特性**：可从源码自动推断参数范围——对RF电路脚本特别有用

---

## Flow 4：实验→分析流 ✅

**场景**：跑完实验后，分析结果、推导公式、写中文总结

```
输入：实验结果文件（JSON/CSV/log）
  │
  ├─→ analyze-results ────────── 统计分析+对比表
  │     依赖：零（完全自包含）
  │     5步：定位结果 → 构建对比表 → 统计分析 → 生成洞察 → 更新文档
  │     输出：原始数据表 + 关键发现（编号列表）+ 建议下一步实验
  │
  ├─→ formula-derivation ─────── 公式推导辅助
  │     依赖：零（完全自包含）
  │     8步：收集上下文 → 冻结目标 → 选择不变量 → 规范化假设/符号 → 分类推导步骤 → 构建推导图 → 写推导文档 → 最终验证
  │     输出：DERIVATION_PACKAGE.md（目标/状态/不变量/假设/符号/策略/推导图/主推导/备注/边界/风险）
  │     状态标签：COHERENT AS STATED / COHERENT AFTER REFRAMING / NOT YET COHERENT
  │
  ├─→ experiment-log-summarizer ─ 中文实验日志总结
  │     依赖：零（自包含，references/experiment_template.md + error_analysis_template.md）
  │     输出：实验目标/改动/结果变化/可能原因/当前最优配置/失败实验总结/下一步建议/周报摘要
  │
  └─→ benchmark-extractor ────── benchmark信息提取
        依赖：零（自包含，references/extraction_schema.md + comparison_table_template.md）
        输出：论文标题/任务/数据集/指标/baseline/SOTA声明/代码/数据/评估设置/备注
        两种模式：中文说明版 / 结构化表格版
```

**自洽条件**：零外部依赖
**组合方式**：按需选用，不强制串联

## Flow 5：论文写作流 ⚠️ 半自洽

**场景**：投稿期写论文，从结构规划到逐节生成到审稿修改

```
输入：实验结果 + idea描述
  │
  ├─→ paper-plan ─────────────── 结构规划 ⚠️ 需Codex runtime适配(REVIEWER_MODEL+shared-refs)
  │     7步：提取声明+证据 → 确定论文类型+结构 → 逐节规划 → 配图规划 → 引用脚手架 → Codex交叉审稿 → 输出PAPER_PLAN.md
  │     依赖：mcp__codex__codex + shared-references/writing-principles.md等7个文件
  │     硬编码：REVIEWER_MODEL = gpt-5.5, TARGET_VENUE = ICLR
  │     输出：PAPER_PLAN.md（声明-证据矩阵/结构/配图计划/引用计划/审稿反馈）
  │
  ├─→ paper-write ────────────── 逐节生成LaTeX ⚠️ 需Codex runtime适配(REVIEWER_MODEL+shared-refs)
  │     8步：备份+清理 → 初始化项目 → 生成math_commands.tex → 逐节写 → 理论一致性检查 → 构建参考文献 → 科学写作质量5轮审计 → Codex交叉审稿
  │     依赖：mcp__codex__codex + bibtexparser + latexmk + WebSearch/WebFetch
  │     硬编码：REVIEWER_MODEL = gpt-5.5, TARGET_VENUE = ICLR, MAX_PAGES = 9
  │     输出：paper/目录（main.tex + references.bib + math_commands.tex + sections/*.tex）
  │
  ├─→ paper-compile ──────────── LaTeX编译排错 ✅ 自洽
  │     8步：验证前置条件 → 首次编译 → 错误诊断+自动修复 → 迭代修复(最多3轮) → 编译后检查 → 页数验证 → 陈旧文件检测 → 提交就绪检查
  │     依赖：latexmk + pdflatex + bibtex + pdfinfo + pdftotext + pdffonts
  │     输出：paper/main.pdf + 编译报告（状态/页数/错误/警告）
  │
  ├─→ paper-figure ───────────── 数据图表生成 ⚠️ Codex审稿可跳过
  │     7步：读取配图计划 → 设置绘图环境 → 自动选择图表类型 → 生成每个图 → 运行脚本 → 生成LaTeX片段 → Codex审稿
  │     依赖：matplotlib（必需）+ mcp__codex__codex（审稿可跳过）
  │     输出：figures/目录（paper_plot_style.py + gen_*.py + PDF/PNG + latex_includes.tex + TABLE_*.tex）
  │
  ├─→ auto-review-loop ───────── 多轮审稿修改闭环 ⚠️ 需Codex runtime适配(REVIEWER_MODEL+shared-refs+save_trace)
  │     循环：Review(Codex/手动审稿) → Parse Assessment(分数+判定) → Reviewer Memory Update → Debate Protocol → Human Checkpoint → Implement Fixes → Wait for Results → Document Round
  │     依赖：mcp__codex__codex 或 mcp__manual_review__review + shared-references/5个文件
  │     硬编码：REVIEWER_MODEL = gpt-5.5, MAX_ROUNDS = 4, POSITIVE_THRESHOLD: score>=6 AND verdict in {ready, almost}
  │     输出：review-stage/AUTO_REVIEW.md + REVIEW_STATE.json + CLAIMS_FROM_RESULTS.md
  │
  └─→ ljg-writes ─────────────── 写作引擎辅助表达 ✅ 自洽
        7步：摆出观点 → 第一刀(追问) → 第二刀(更深层) → 切到底 → 综合 → 打磨(口语检查/AI痕迹过滤/反风格检查/惊喜检查) → 中文重写
        依赖：零（完全自包含）
        输出：{project}/raw/paper/{timestamp}--{keyword}__write.md
```

**自洽部分**：paper-compile + ljg-writes + paper-figure（跳过Codex审稿）
**不自洽部分**：paper-plan / paper-write / auto-review-loop 需Codex runtime适配（REVIEWER_MODEL改为实际模型 + shared-refs路径统一）
**降级方案**：手动写outline → 手动写section → paper-compile编译 → ljg-writes辅助表达 → 手动审稿

## Flow 6：周报+组会流 ✅

**场景**：每周整理本周进展，生成周报和组会提纲

注：此flow与Flow 1的组会PPT不同。Flow 1是"调研汇报"（开新方向时的深度调研），
这里是"周报汇报"（日常进展的快速总结）。

**场景**：每周整理本周进展，生成周报和组会提纲

```
输入：本周读的论文 + 实验进展 + 调试记录 + 下周计划
  │
  └─→ weekly-lab-update ──────── 周报+组会提纲生成
        3步：
          Step 1: 按类别整理输入（论文阅读/实验进展/当前问题/下周计划）
          Step 2: 生成中文周报
          Step 3: 生成中文组会提纲 + 可选英文brief
        依赖：零（自包含，references/weekly_report_template.md + meeting_outline_template.md + english_brief_template.md）
        输出：中文周报 + 中文组会提纲 + 可选英文brief
```

**自洽条件**：零外部依赖
**组合**：可与Flow 4（experiment-log-summarizer）串联，先总结实验再生成周报

## Flow 7：审稿回复流 ✅

**场景**：收到审稿意见后，逐条分析并起草回复

```
输入：审稿意见（单审稿人或多审稿人）
  │
  └─→ review-rebuttal ────────── 审稿回复（academic-skills版，轻量）
        4步：
          Step 1: 拆分审稿意见，识别跨审稿人共同关注点
          Step 2: 分类关注点（使用分类法）
          Step 3: 应用语气准则
          Step 4: 生成回复框架+草稿
        依赖：零（自包含，references/rebuttal_template.md + review_taxonomy.md + tone_guidelines.md）
        输出：审稿意见拆分 / 关注点分类 / 必加实验点 / 需澄清点 / 回复策略 / 回复草稿 / 高风险表达警告
```

**自洽条件**：零外部依赖
**对比ARIS版rebuttal**：ARIS版更强大（Codex压力测试+自动实验+多轮迭代），需Codex runtime适配+shared-refs路径；academic-skills版即用，覆盖80%场景

## Flow 8：Idea发现流(AI轨道) ⚠️ 适配后可自洽

**场景**：系统化地从文献中发现研究空白、生成候选idea、验证新颖性、精炼到可执行方案

**当前状态**：Codex runtime已配置可用。需适配：REVIEWER_MODEL(gpt-5.5→实际模型) + helper脚本路径 + shared-refs路径。

```
设计目标流程：
  刷论文 → 发现gap → 生成idea → 验证新颖性 → 精炼方案

实际skill链及阻塞点：
  │
  ├─→ research-lit ──────────── 多源文献检索编排
  │     适配：Codex runtime可用；需部署helper脚本(arxiv_fetch.py等)到本地 + shared-refs路径
  │     注：arxiv/semantic-scholar有inline fallback，但research-lit编排层本身依赖helper链
  │
  ├─→ idea-creator ──────────── 生成候选研究方向
  │     适配：Codex runtime可用；需REVIEWER_MODEL改为实际模型 + research_wiki.py可选跳过 + verify_papers.py部署 + shared-refs路径
  │     硬编码：REVIEWER_MODEL = gpt-5.5, REVIEWER_BACKEND = codex
  │
  ├─→ novelty-check ─────────── 查新验证
  │     适配：Codex runtime可用；需REVIEWER_MODEL改为实际模型 + verify_papers.py部署 + shared-refs路径
  │     硬编码：REVIEWER_MODEL = gpt-5.5
  │     降级可能：Phase A+B（提取声明+多源搜索）可零MCP完成，Phase C需Codex runtime
  │
  ├─→ research-refine ───────── 迭代精炼idea
  │     适配：Codex runtime可用；需REVIEWER_MODEL改为实际模型 + shared-refs路径
  │     硬编码：REVIEWER_MODEL = gpt-5.5, SCORE_THRESHOLD = 9, MAX_ROUNDS = 5
  │
  ├─→ research-refine-pipeline ─ refine→experiment-plan串联
  │     阻塞：同research-refine + experiment-plan
  │
  └─→ research-review ────────── 外部审稿反馈
        适配：Codex runtime可用；需REVIEWER_MODEL改为实际模型 + shared-refs路径
        硬编码：REVIEWER_MODEL = gpt-5.5, REVIEWER_BACKEND = codex
```

**核心阻塞**：
1. **Codex MCP未配置** — 5个skill中4个硬依赖Codex做跨模型审稿
2. **shared-references/未迁移** — 7+个协议文件（integration-contract.md, review-tracing.md, citation-discipline.md等）
3. **research_wiki.py未部署** — idea-creator和research-lit的wiki集成硬依赖此脚本
4. **verify_papers.py未部署** — 反幻觉验证，缺失时降级为[UNVERIFIED]标签

**降级方案**：用Flow 2（arxiv+semantic-scholar+research-gap-finder）做半自动idea发现，手动串联novelty-check的Phase A+B

---

## Flow 9：数据库检索与全文抽取流 ⚠️

**场景**：CNKI/IEEE/Zotero 联合检索，补齐正式出版物全文和PDF解析。

```
输入：关键词 / DOI / Zotero item key
  │
  ├─→ cnki-research ─────────── 知网搜索、详情提取、PDF/CAJ下载
  │     依赖：Chrome DevTools MCP 或浏览器自动化；站点登录状态
  │     输出：检索结果、论文详情、下载文件
  │
  ├─→ ieee-research ─────────── IEEE Xplore检索、详情提取、全文/PDF获取
  │     依赖：Chrome DevTools MCP；机构访问或可访问PDF
  │     输出：检索结果、论文详情、PDF/全文
  │
  ├─→ zotero-manager ────────── Zotero库浏览、分类、标签、字段更新
  │     依赖：Zotero MCP / Zotero CLI
  │     输出：整理后的文献库条目和集合
  │
  └─→ zotero-pdf-parse ──────── PDF转Markdown
        依赖：MarkerPDF脚本和Zotero attachment key
        输出：content.md和图片资产
```

**自洽条件**：Zotero MCP 已配置；CNKI/IEEE 依赖浏览器会话和站点可访问性。
**阻塞点**：登录态、下载权限、MarkerPDF硬编码路径。

## Flow 10：知识库沉淀流 ⚠️

**场景**：把session、论文、实验和想法沉淀到Obsidian/wiki，支持后续查询和复用。

```
输入：session日志 / paper notes / experiment reports / raw inbox
  │
  ├─→ wiki-capture ──────────── 捕获原始内容，生成source packet
  │     依赖：零
  │     输出：source-packet YAML（raw_content + metadata + tags）
  │
  ├─→ inbox-prepare ─────────── 评估workspace状态，准备inbox
  │     依赖：workspace目录
  │     输出：workspace评估 + inbox准备就绪
  │
  ├─→ wiki-compile ──────────── source packet → compiled note
  │     依赖：wiki-capture 输出
  │     输出：compiled markdown（结构化笔记）
  │
  ├─→ wiki-crystallize ──────── compiled note → crystallized insight
  │     依赖：wiki-compile 输出
  │     输出：crystallized markdown（提炼洞见 + 去重 + 链接）
  │
  ├─→ wiki-lint ─────────────── 维护wiki质量（一致性、链接、标签）
  │     依赖：wiki目录
  │     输出：lint report + auto-fix
  │
  ├─→ wiki-query ────────────── wiki检索（关键词/语义/结构化）
  │     依赖：wiki目录 + 索引
  │     输出：query results
  │
  ├─→ wiki-research ─────────── 补充研究（查缺补漏）
  │     依赖：wiki-query 输出 + 外部搜索
  │     输出：补充笔记
  │
  ├─→ claude-obsidian ───────── Obsidian vault读写与同步（辅助）
  │     依赖：Vault路径 `/mnt/c/obsidian_wiki/` 或Obsidian API
  │     输出：vault内markdown文件
  │
  └─→ session lifecycle hooks ─ SESSION_CONTEXT.md → Obsidian inbox
        依赖：`PJ_OBSIDIAN_VAULT`或默认vault路径
        输出：session log和learning条目
```

**Pipeline 顺序**：capture → inbox-prepare → compile → crystallize → query（主链）；lint（维护）；research（补充）

**自洽条件**：filesystem写入可用。
**阻塞点**：Obsidian同步策略需要统一为文件写入优先，MCP只作交互补充。

## Flow 11：学术PPT与可视化汇报流 ⚠️

**场景**：把论文、调研报告或组会材料生成Beamer或HTML PPT。

```
输入：paper/report markdown + images
  │
  ├─→ implementation-report ── 计划/代码现状/流程图材料包（按需）
  │     依赖：planning 文件 + 当前代码
  │     输出：manifest.yaml + implementation-report.md + workflow.mmd + workflow.html/png
  │
  ├─→ diagram-design ───────── Mermaid/Draw.io → editorial diagram 重绘
  │     依赖：workflow.mmd + format/size/detail/audience 四个旋钮
  │     输出：slide-sized workflow.html + workflow.png
  │
  ├─→ pyrojewel-academic-ppt ── 论文/调研材料 → Beamer
  │     依赖：xelatex；本repo `.claude/skills/pyrojewel-academic-ppt`
  │     输出：presentation.tex + presentation.pdf + assets
  │
  ├─→ beamer-academic ───────── 组会/论文阅读/复现 Beamer skill
  │     依赖：xelatex；layout registry
  │     输出：paper-reading.tex 或 reproduction.tex + PDF
  │
  └─→ guizang-ppt-skill ─────── 横向翻页HTML PPT
        依赖：浏览器；静态HTML/JS/CSS
        输出：single HTML deck
```

**自洽条件**：Beamer路径需要xelatex；HTML路径需要浏览器验证。
**当前状态**：`pyrojewel-academic-ppt` 已在 `.claude/skills/` 新增，但仍需测试和文档完善。

---

## 依赖矩阵

> **Idea & Experiment skill 接入优先级详见** `references/idea-experiment-audit.md`

### MCP服务器依赖

| MCP服务器 | 需要的Flow | 配置状态 |
|-----------|-----------|----------|
| Zotero MCP | Flow 1 | ✅ 已配置（mcp__zotero-mcp__*） |
| Chrome DevTools MCP | Flow 1(IEEE全文), Flow 8(CNKI/IEEE) | ✅ 已配置（mcp__chrome-devtools__*） |
| Obsidian MCP | Flow 1(lit-reading可选) | ✅ 已配置（mcp__obsidian-mcp-tools__*） |
| Codex MCP | Flow 5, 8 | ✅ 已配置（mcp__codex__codex / mcp__codex__codex-reply） |
| Manual Review MCP | Flow 8(替代Codex) | ❌ 未配置（Codex backend已可用，manual为可选替代） |
| CNKI/IEEE browser session | Flow 9 | ⚠️ 依赖登录态 |
| MarkerPDF service/script | Flow 1, 9 | ⚠️ 路径待统一 |
| xelatex | Flow 1, 11 | ⚠️ 需本机验证 |
| Obsidian vault filesystem | Flow 10 | ✅ 默认路径 `/mnt/c/obsidian_wiki/` |

### ARIS工具链依赖

| 工具/脚本 | 需要的Flow | 位置 |
|-----------|-----------|------|
| research_wiki.py | Flow 9, 10 | ARIS skills/shared-references/ 或 tools/ |
| verify_papers.py | Flow 9 | 同上 |
| evidence_check.py | Flow 10(result-to-claim) | 同上 |
| figure_renderer.py | Flow 5(figure-spec) | 同上 |
| extract_paper_style.py | Flow 5(paper-plan/write/illustration) | 同上 |
| shared-references/*.md (15+文件) | Flow 5, 9, 10 | ARIS skills/shared-references/ |

### 硬编码模型名

| 模型名 | 出现位置 | 替代方案 |
|--------|---------|----------|
| gpt-5.5 | idea-creator, novelty-check, research-review, research-refine, paper-plan, paper-write, auto-review-loop, paper-figure, slides-polish, rebuttal(ARIS), experiment-audit, paper-claim-audit, citation-audit | 改为Codex MCP实际配置的模型 |
| gemini-3-pro-image-preview | paper-illustration | 改为实际可用的Gemini模型 |
| gemini-3-pro-preview | paper-illustration | 同上 |
| sonnet | lit-reading(subagent) | 改为可用模型 |

### 硬编码路径

| 路径 | 出现位置 | 改为 |
|------|---------|------|
| /mnt/c/Users/28956/Zotero/storage | pyrojewel-paper, pyrojewel-paper-river, zotero-semantic-search | 实际Zotero storage路径（已改为$ZOTERO_STORAGE常量） |
| /home/holmes/.cc-switch/skills/markerpdf-cli/scripts/markerpdf_convert.py | zotero-pdf-parse | 实际MarkerPDF脚本路径 |
| /home/DataTransfer/Pyrojewel/01_lab/markerpdf_zotero/.env | zotero-pdf-parse | 实际.env路径 |
| ~/.claude/PAI/USER/AI_WRITING_PATTERNS.md | pyrojewel-paper (已删除) | 已移除引用 |

---

## Skill → Flow 归属总表

| Skill | 来源 | Flow | 适配难度 |
|-------|------|------|----------|
| arxiv | ARIS | 2 | 即用 |
| semantic-scholar | ARIS | 2 | 即用(改fields-of-study) |
| research-gap-finder | academic | 2 | 即用 |
| survey-writer | academic | 2 | 即用 |
| zotero-semantic-search | skill_manager | 1 | 轻改(路径) |
| zotero-pdf-parse | skill_manager | 1 | 轻改(路径) |
| pyrojewel-paper | ljg | 1 | 轻改(路径+图片管理) |
| pyrojewel-paper-river | ljg | 1 | 轻改(路径+图片管理) |
| ljg-plain | ljg | 1(辅助) | 即用 |
| pyrojewel-paper-qa | ljg-qa改编 | 1(Step 3) | 即用(新skill) |
| pyrojewel-paper-flow | self-built | 1(编排) | 即用(新skill) |
| dse-loop | ARIS | 3 | 即用 |
| analyze-results | ARIS | 4 | 即用 |
| formula-derivation | ARIS | 4 | 即用 |
| experiment-log-summarizer | academic | 4 | 即用 |
| benchmark-extractor | academic | 4 | 即用 |
| paper-compile | ARIS | 5 | 即用 |
| paper-figure | ARIS | 5 | 中改(matplotlib+Codex可跳) |
| ljg-writes | ljg | 5 | 即用 |
| paper-plan | ARIS | 5 | 中改(REVIEWER_MODEL+shared-refs路径) |
| paper-write | ARIS | 5 | 中改(REVIEWER_MODEL+shared-refs路径) |
| auto-review-loop | ARIS | 5 | 中改(REVIEWER_MODEL+shared-refs+save_trace路径) |
| beamer-academic | beamer | 1(Step 3) | 即用(需xelatex) |
| weekly-lab-update | academic | 7 | 即用 |
| review-rebuttal | academic | 8 | 即用 |
| cnki-research | skill_manager | 9 | 中改(Chrome MCP) |
| ieee-lit-search | ARIS | 9 | 中改(Chrome MCP) |
| lit-reading | ARIS | 9 | 中改(Chrome+Obsidian MCP) |
| novelty-check | ARIS | 9 | 中改(REVIEWER_MODEL+verify_papers.py路径) |
| idea-creator | ARIS | 9 | 中改(REVIEWER_MODEL+helper脚本路径+shared-refs) |
| research-refine | ARIS | 9 | 中改(REVIEWER_MODEL+shared-refs路径) |
| research-refine-pipeline | ARIS | 9 | 中改(REVIEWER_MODEL+shared-refs路径) |
| research-review | ARIS | 9 | 中改(REVIEWER_MODEL+shared-refs路径) |
| research-lit | ARIS | 9 | 重改(ARIS基础设施) |
| research-wiki | ARIS | 9 | 阻塞(research_wiki.py硬依赖) |
| wiki-enrich | ARIS | 9 | 阻塞(research_wiki.py硬依赖) |
| karpathy-guidelines | karpathy | 跨flow(编码辅助) | 即用 |
| python-test-hygiene | skill_manager | 跨flow(测试辅助) | 即用 |
| experiment-plan | ARIS | 9→10衔接 | 轻改 |
| ablation-planner | ARIS | 10 | 中改(REVIEWER_MODEL+shared-refs路径) |
| result-to-claim | ARIS | 10 | 中改(REVIEWER_MODEL+helper脚本路径) |
| experiment-audit | ARIS | 10 | 中改(REVIEWER_MODEL+shared-refs+save_trace路径) |
| paper-illustration | ARIS | 5(特殊) | 特殊(Gemini API) |
| figure-spec | ARIS | 5(特殊) | 特殊(figure_renderer.py) |
| overleaf-sync | ARIS | 5(特殊) | 特殊(Overleaf Premium) |
| slides-polish | ARIS | 1(增强) | 中改(REVIEWER_MODEL+python-pptx+LibreOffice) |
| citation-audit | ARIS | 5(增强) | 中改(REVIEWER_MODEL+shared-refs路径) |
| paper-claim-audit | ARIS | 5(增强) | 中改(REVIEWER_MODEL+shared-refs路径) |
| rebuttal(ARIS版) | ARIS | 8(增强) | 中改(REVIEWER_MODEL+shared-refs路径) |
| paper-feishu-digest | academic | 按需 | 需脚本 |
| cnki-research | cnki-skills | 9 | 中改(Chrome MCP) |
| cnki-search | cnki-skills | 9 | 中改(Chrome MCP) |
| cnki-advanced-search | cnki-skills | 9 | 中改(Chrome MCP) |
| cnki-paper-detail | cnki-skills | 9 | 中改(Chrome MCP) |
| cnki-parse-results | cnki-skills | 9 | 中改(Chrome MCP) |
| cnki-navigate-pages | cnki-skills | 9 | 中改(Chrome MCP) |
| cnki-export | cnki-skills | 9 | 中改(Chrome MCP) |
| cnki-download | cnki-skills | 9 | 中改(Chrome MCP) |
| cnki-journal-search | cnki-skills | 9 | 中改(Chrome MCP) |
| cnki-journal-index | cnki-skills | 9 | 中改(Chrome MCP) |
| cnki-journal-toc | cnki-skills | 9 | 中改(Chrome MCP) |
| ieee-research | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-search | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-advanced-search | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-massive-search | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-get-fulltext | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-paper-detail | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-paper-fullcontent | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-paper-markdown | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-paper-classify | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-parse-results | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-navigate-pages | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-export | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-download | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-journal-browse | ieee_skills | 9 | 中改(Chrome MCP) |
| ieee-standards-search | ieee_skills | 9 | 中改(Chrome MCP) |
| zotero-cli-cc | zotero-cli-cc | 1, 9 | 轻改(与Zotero MCP协调) |
| claude-obsidian/wiki-ingest | claude-obsidian | 10 | 轻改(文件写入优先) |
| claude-obsidian/wiki-lint | claude-obsidian | 10 | 轻改(文件写入优先) |
| claude-obsidian/wiki-query | claude-obsidian | 10 | 轻改(文件写入优先) |
| claude-obsidian/wiki | claude-obsidian | 10 | 轻改(文件写入优先) |
| claude-obsidian/save | claude-obsidian | 10 | 即用 |
| claude-obsidian/obsidian-markdown | claude-obsidian | 10 | 即用 |
| claude-obsidian/canvas | claude-obsidian | 10 | 即用 |
| claude-obsidian/wiki-fold | claude-obsidian | 10 | 即用 |
| claude-obsidian/autoresearch | claude-obsidian | 10(辅助) | 即用 |
| claude-obsidian/defuddle | claude-obsidian | 10(辅助) | 即用 |
| claude-obsidian/obsidian-bases | claude-obsidian | 10(辅助) | 即用 |
| wiki-capture | llm_wiki | 10 | 即用(SKILL.md→skill.md) |
| inbox-prepare | llm_wiki | 10 | 即用(SKILL.md→skill.md) |
| wiki-compile | llm_wiki | 10 | 即用(SKILL.md→skill.md) |
| wiki-crystallize | llm_wiki | 10 | 即用(SKILL.md→skill.md) |
| wiki-lint | llm_wiki | 10 | 即用(SKILL.md→skill.md) |
| wiki-query | llm_wiki | 10 | 即用(SKILL.md→skill.md) |
| wiki-research | llm_wiki | 10 | 即用(SKILL.md→skill.md) |
| baoyu-url-to-markdown | llm-wiki-skill/deps | 10(辅助) | 即用 |
| youtube-transcript | llm-wiki-skill/deps | 10(辅助) | 即用 |
| implementation-report | local self-built | 1, 11 | 即用(先产出计划/代码状态/流程图材料包) |
| pyrojewel-beamer-academic | pyrojewel-beamer-academic | 1, 11 | 即用(答辩/Obsidian证据契约变体) |
| pyrojewel-academic-ppt | .claude/skills | 11 | 待统一(与pyrojewel-beamer-academic重叠) |
| beamer-academic | beamer-academic | 1, 11 | active(组会/论文阅读/复现) |
| guizang-ppt-skill | guizang-ppt-skill | 11 | 即用(需浏览器) |
| nature-paper2ppt | nature-skills | 11(备选) | 中改(与beamer重叠) |
| nature-figure | nature-skills | 11(辅助) | 中改(LaTeX+图片) |
| nature-polishing | nature-skills | 5(增强) | 中改(LaTeX) |
| nature-writing | nature-skills | 5(增强) | 中改(LaTeX) |
| nature-reader | nature-skills | 1(备选) | 中改 |
| nature-response | nature-skills | 7(备选) | 中改 |
| nature-citation | nature-skills | 5(辅助) | 中改 |
| nature-data | nature-skills | 4(辅助) | 中改 |
| nature-academic-search | nature-skills | 2(备选) | 中改 |
| alphaxiv | ARIS | 2(辅助) | 即用 |
| deepxiv | ARIS | 2(辅助) | 即用 |
| exa-search | ARIS | 2(辅助) | 即用 |
| openalex | ARIS | 2(辅助) | 即用 |
| gemini-search | ARIS | 2(辅助) | 即用 |
| paper-deep-note | academic | 1(辅助) | 即用 |
