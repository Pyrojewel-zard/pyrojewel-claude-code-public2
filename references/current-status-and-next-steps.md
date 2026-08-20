# Current Status and Next Steps

**Project:** `pyrojewel_claude_code`
**Last Updated:** 2026-08-19T23:35:00+08:00
**Purpose:** 统一记录当前 5 条主线的现状盘点、关键决策、下一步执行计划，供人工校对。

**Related map:** `references/skill-source-map.md` 作为当前项目 skill 落地与 upstream 跟踪的来源总表。

---

## 0. 完成情况摘要

截至 2026-06-23，当前项目已经完成的关键工作：

1. **来源治理框架已立住**
   - 已建立 [skill-source-map.md](skill-source-map.md) 作为来源、flow、owner、同步策略的唯一总表
   - 已明确 source repo 更新后的分析流程：先同步源，再按 map 判断是否吸收进当前项目

2. **论文阅读主线已统一到 ljg-skills**
   - 保留：`ljg-paper`、`ljg-read`、`ljg-qa`
   - 保留本地溯源适配：`pyrojewel-paper-river`
   - 已落地：`zotero-pdf-parse`
   - 保留：`beamer-academic`，负责论文阅读/组会 PPT 与 Beamer PDF 编译
   - 当前只差环境验证，不差链路设计

3. **ARIS 的 `idea-discovery` 主链已补齐**
   - 已落地：`idea-discovery`
   - 已落地：`research-lit`
   - 已落地：`idea-creator`
   - 已落地：`novelty-check`
   - 已落地：`research-review`
   - 已落地：`research-refine-pipeline`
   - 已落地：`experiment-plan`
   - 配套已落地：`arxiv`、`render-html`、`auto-review-loop`、`experiment-bridge`、`experiment-audit`

4. **实验分析主线已形成可用骨架**
   - 已落地：`analyze-results`、`dse-loop`、`formula-derivation`
   - 已落地：`experiment-log-summarizer`、`benchmark-extractor`
   - `run-experiment` / `monitor-experiment` 仍受 GPU 环境影响，但不影响 idea 主链完整性

5. **2026-06-23: research-pipeline 全链补齐** ✅
   - 新增 10 个实验 skills：`research-pipeline`、`experiment-queue`、`run-experiment`、`monitor-experiment`、`ablation-planner`、`result-to-claim`、`vast-gpu`、`training-check`、`serverless-modal`
   - 新增 6 个 tools：`experiment_queue/`、`iteration_log.py`、`install_aris_codex.sh`、`smart_update_codex.sh`、`generate_codex_claude_review_overrides.py`、`meta_opt/`
   - 所有 skills 的 `shared-references` 路径已适配为当前项目格式
   - `research-pipeline` 全流程已完整可用（idea-discovery → experiment-bridge → auto-review-loop → paper-writing）

6. **ECC 框架执行单已收尾**
   - hook / session lifecycle / fixture 主体工作已完成
   - 当前仅剩可选增强：Python-focused `code-review` / `testing` common rules

7. **wiki 线当前冻结**
   - 现有 `session -> Obsidian` 闭环可用
   - 本轮不继续施工，不影响当前主线推进

**当前总判断：**

- `research-pipeline` 全链已完整可用
- 论文主线当前卡环境验证，不再卡 skill 缺失
- ECC 已从主施工线退到完成态
- 后续增量重点转向：`paper-plan`、`paper-write`、`paper-figure` 论文写作链

---

## 1. 当前共识

本仓库当前不是做“全量 skill 仓库治理”，而是在做一件更具体的事：

从多个 source repo 持续同步和学习，把真正适配你日常研究 flow 的 skill 摘出来，做本地适配，然后整合进当前仓库。

当前 5 条主线：

1. 论文阅读 flow + PPT 输出
2. idea 调研
3. ECC 代码框架与代码质量约束
4. 实验相关 skills
5. wiki / Obsidian / 长期知识沉淀

---

## 2. 关键决策

### 2.1 Source repo 与本仓库的关系

- source repo 负责持续同步 upstream
- 本仓库不是镜像层，只吸收“对当前 flow 真有用”的 skill 和更新
- 接入标准不是“skill 文件存在”，而是：
  - 能在当前 runtime 跑
  - 依赖路径可配置或已适配
  - 在某条主 flow 里有明确位置

### 2.2 PPT 路线

- `beamer-academic` 是唯一活动的论文阅读/组会/复现 Beamer PDF skill
- `pyrojewel-beamer-academic` 与 `pyrojewel-academic-ppt` 已删除
- `guizang-ppt-skill` 提供版式灵感，不作为主输出路径

### 2.3 Codex 能力的口径

- `Codex MCP 未配置` 不再作为 idea / review / refine 线的硬阻塞
- 当前就是 Codex runtime，相关分析、review、refine、plan 能由当前 agent 承接
- 真正需要处理的是：
  - skill 中硬编码的 `REVIEWER_MODEL`
  - helper 脚本路径
  - `shared-references` 路径
  - GPU / remote / Gemini 这类真实环境依赖

### 2.4 Session 与长期状态边界

- `.claude/SESSION_CONTEXT.md` 只保留短期会话态
- `references/` 保存 flow 状态、迁移决策、执行单
- `wiki/` 保存长期知识

---

## 3. 主线现状盘点

## 3.1 主线 1：论文阅读 -> PPT 输出

**状态：** 编排骨架已成，入口已环境变量化，待环境补齐后做端到端验证。

**当前默认主链：**

```text
zotero-pdf-parse
-> ljg-paper / ljg-read
-> pyrojewel-paper-river
-> ljg-qa (optional)
-> beamer-academic
```

**已完成：**

- 重复的 `pyrojewel-paper`、`pyrojewel-deep-paper`、`pyrojewel-paper-flow`、`pyrojewel-paper-qa`、`pyrojewel-paper-to-beamer` 已删除
- `pyrojewel-beamer-academic` 与旧 `pyrojewel-academic-ppt` 已删除
- `pyrojewel-paper-river` 与 ljg-skills 源版本保持一致
- `zotero-pdf-parse` 已正式迁入当前项目 `skills/`，并完成环境变量适配
- 论文阅读主线的 source repo 归属、阶段顺序、输入输出关系已写清

**当前 blocker：**

1. 当前缺少可用于实测的 Zotero 库数据
2. `xelatex` 未安装，卡住 Phase 6 的 PDF 编译验证
3. 新的 ljg-skills → beamer-academic 链路还需要一次完整闭环实测

**我的判断：**

这是当前最接近“能直接变成日常工具”的主线，应作为业务 P0。

---

## 3.2 主线 2：idea 调研

**状态：** ✅ 全链已补齐。`idea-discovery` → `research-pipeline` 主链所需全部核心 skill 已齐备。

**默认链：**

```text
research-pipeline (全流程)
├── idea-discovery
│   ├── research-lit
│   ├── idea-creator
│   ├── novelty-check
│   └── research-review
├── research-refine-pipeline
│   └── experiment-plan
├── experiment-bridge
│   ├── run-experiment / experiment-queue
│   ├── monitor-experiment
│   ├── training-check
│   └── ablation-planner
├── auto-review-loop
│   ├── analyze-results
│   ├── result-to-claim
│   └── experiment-audit
└── (paper-writing — 可选)
```

**P0 已迁入：**

- `analyze-results`、`experiment-plan`、`paper-compile`
- `experiment-log-summarizer`、`benchmark-extractor`
- `dse-loop`、`formula-derivation`
- `novelty-check` Phase A+B

**P1 已迁入并适配：**

- `idea-discovery`、`research-lit`、`idea-creator`
- `research-review`、`research-refine-pipeline`
- `auto-review-loop`、`experiment-bridge`、`experiment-audit`

**2026-06-23 新增迁入：**

- `research-pipeline`（全流程编排器）
- `experiment-queue`（批量实验队列）
- `run-experiment`、`monitor-experiment`
- `ablation-planner`、`result-to-claim`
- `vast-gpu`、`training-check`、`serverless-modal`

**真实 blocker：**

1. GPU 环境未配置，仅影响 `run-experiment` / `monitor-experiment` / `vast-gpu` / `serverless-modal`
2. `paper-plan` / `paper-write` / `paper-figure` 论文写作链尚未迁入

**我的判断：**

这条线已经完整。`research-pipeline` 全流程可以跑通（从 idea 到 review），只差 GPU 环境和论文写作链。

---

## 3.3 主线 3：ECC 代码框架与代码质量约束

**状态：** P0/P1/P2 执行单已完成，进入可选增强阶段。

**已完成：**

- `ecc-context-monitor.js` 阈值已校准
- `stop-format-typecheck.js` 的 `ruff` fixture 已通过
- `gateguard-fact-force.js` 的 Python import gate fixture 已通过
- `config-protection.js` fixture 已通过
- `post-edit-accumulator.js` fixture 已通过
- `P2` 健壮性验证已完成：`cost-tracker`、`desktop-notify`、`pre-compact`、`evaluate-session`
- 长期状态与会话态的边界已经从文档层面明确

**未完成：**

1. 可选增强：把 `code-review.md` 与 `testing.md` 改编为 Python-focused 版本引入 `rules/common/`

**真实风险：**

- 长期状态文件中的 `Migration Status` 保留手动编辑，但 `Active Flows` 会在 Stop 时覆写

**我的判断：**

这条线仍然是所有 flow 的底座，但执行单已经收尾。后续只剩少量规则增强，不再是主施工线。

---

## 3.4 主线 4：实验相关 skills

**状态：** ✅ 全链已补齐。2026-06-23 批量迁入 10 个实验 skills + 6 个 tools，research-pipeline 全链完整可用。

**P0 直接可接：**

- `analyze-results`
- `experiment-plan`
- `paper-compile`
- `experiment-log-summarizer`
- `benchmark-extractor`
- `dse-loop`
- `formula-derivation`

**P1 已迁入并适配：**

- `auto-review-loop`
- `experiment-bridge`
- `experiment-audit`
- `research-review` / `research-refine` / `novelty-check`

**2026-06-23 新增：**

- `research-pipeline` — 全流程编排
- `experiment-queue` — 批量队列（OOM 重试/wave/crash-safe）
- `run-experiment` — 多环境部署
- `monitor-experiment` — 进度监控
- `ablation-planner` — 消融规划
- `result-to-claim` — 结果门控
- `vast-gpu` — Vast.ai 管理
- `training-check` — 训练健康检查
- `serverless-modal` — Modal serverless

**P2 需真实环境：**

- `run-experiment` / `monitor-experiment` — GPU 环境
- `vast-gpu` — vastai CLI + API key
- `serverless-modal` — Modal CLI + 账号
- `paper-illustration` / `paper-illustration-image2` — 尚未迁入

**我的判断：**

实验线已完整。research-pipeline 从 idea 到 review 全链可跑。

---

## 3.5 主线 5：wiki / Obsidian / 长期知识沉淀

**状态：** 已有可用闭环，当前阶段暂不作为执行重点。

**推荐主线：**

```text
session -> raw capture -> compile/crystallize -> query/reuse
```

**当前决策：**

- 主引擎：`llm-wiki-skill`
- 直接可先接：
  - `session-log-crystallizer`
  - `wiki-lint`
  - `wiki-query`

**当前 blocker：**

1. `wiki/` 目录不存在
2. `inbox/raw/` 目录不存在
3. page type schema 未定义
4. 3 个 wiki 仓库能力重叠，已选主引擎但尚未落契约

**当前处理原则：**

wiki 线暂不作为本轮施工重点。现有闭环先保持可用，后续只有在论文 / idea / 实验三条主线需要明确接入知识沉淀时再回头整理。

---

## 4. 现阶段优先级

### P0：立刻继续

1. ~~idea / experiment 继续迁核心 skill~~ ✅ 已完成（2026-06-23）
2. 论文阅读主线等待恢复环境验证
3. ECC 仅做可选规则增强

### P1：紧接着做

1. 迁 `paper-plan` / `paper-write` / `paper-figure` 论文写作链
2. 统一适配 ARIS 系列的 `REVIEWER_MODEL`（部分已完成）
3. 可选：引入 Python-focused `code-review` / `testing` common rules

### P2：等真实环境

1. GPU / remote 运行环境
2. Gemini API / illustration 能力
3. Vast.ai / Modal 账号配置

---

## 5. 我建议的下一步执行计划

### worker1

- ECC 执行单已完成
- 可选下一步：
  - 改编引入 `code-review.md`
  - 改编引入 `testing.md`

### worker2

- 已完成 `zotero-pdf-parse` 路径环境变量化
- 已完成 `zotero-pdf-parse` 正式迁入 `skills/`
- 下一步：
  - 安装 `xelatex`
  - 用现成 `content.md` 样例先跑通 `Phase 2 -> 4`
  - 再补 `Phase 1 -> 6` 整链验证

### worker3

- ✅ 已迁 `P0` 前 7 个核心 skill，并用 `novelty-check` 建好 P1 适配模板
- ✅ 已迁 `idea-discovery`、`research-lit`、`idea-creator`、`research-review`、`research-refine-pipeline`
- ✅ 已迁 `auto-review-loop`、`experiment-bridge`、`experiment-audit`
- ✅ 2026-06-23 批量迁入 10 个实验 skills + 6 个 tools，research-pipeline 全链补齐
- 下一步：
  - 迁 `paper-plan` / `paper-write` / `paper-figure` 论文写作链
  - 等 GPU 环境就绪后验证 `run-experiment` / `experiment-queue`

### worker4

- 当前不追加执行项
- 保留 wiki 线现状，等主线 1 / 2 / 4 真正需要知识沉淀联动时再继续

---

## 9. ECC 收尾结论

`references/ecc-framework-action-plan.md` 中的 P0 / P1 / P2 / SC 项已全部完成。

Common rules 评估结论：

- `adopt`: `code-review.md`, `testing.md`
- `skip`: `agents.md`, `development-workflow.md`, `git-workflow.md`, `hooks.md`, `patterns.md`

原因：

- 前两者对 Python review / pytest / ruff 细节仍有补充价值
- 后几者已被当前中文全局规则和本仓库现有约束覆盖

---

## 6. 需要你确认的点

请重点确认下面这些判断对不对：

1. 论文阅读主线是否应继续作为业务 P0
2. ECC 框架是否应继续作为工程 P0
3. idea / experiment 是否先迁 P0，再做统一适配，而不是先追全链闭环
4. wiki 线已有完好闭环，本轮先不处理
5. 论文阅读与 PPT 是否统一走 `ljg-skills` + `beamer-academic`

---

## 7. 用户确认结果

2026-06-02 确认如下：

1. 主线 1（论文阅读主线）继续作为业务 P0：**同意**
2. 主线 3（ECC 框架）继续作为工程 P0：**同意**
3. 主线 2 / 4（idea / experiment）先迁 P0，再做统一适配：**同意**
4. 主线 5（wiki）本身已有完好闭环：**本轮先不处理**
5. 论文阅读与 PPT 统一走 `ljg-skills` + `beamer-academic`：**同意**

后续执行以这 5 条确认结果为准。

---

## 8. 第三轮执行结果

### worker1

- 已完成：
  - `session-end.js` 短期/长期状态拆分
  - session lifecycle integration fixture（22/22 pass）
  - gateguard fixture isolation 修复
- 当前状态：ECC 主线的 P0 已基本完成

### worker2

- 已完成：
  - 论文主线改为 `ljg-paper` / `ljg-read` / `ljg-qa` + `beamer-academic`
  - 论文主线文档同步更新
- 当前状态：主线结构就绪，等待 `xelatex` 和样例输入完成端到端验证

### worker3

- 已完成：
  - 迁入 7 个 P0 实验/分析 skill
  - 迁入并适配 `novelty-check`
  - 复制 `shared-references/` 与 `tools/`
- 当前状态：P1 批量适配模板已建立，可继续迁核心 idea 链

### worker4

- 已完成：
  - wiki 规划文档补充“第三轮暂不处理”状态说明
- 当前状态：wiki 线冻结，待后续需要时再恢复施工
