# Skill Source Map

**Project:** `pyrojewel_claude_code`
**Last Updated:** 2026-08-18T00:00:00+08:00
**Purpose:** 维护当前项目内 skill 的来源、所属 flow、当前状态、同步策略，作为后续 upstream 更新分析的唯一总表。

---

## 1. 使用规则

- 这张表只记录“当前项目内已经落地或明确保留的 skill”。
- source repo 更新后，先看这张表里对应行，再决定是否需要同步到本项目。
- 如果某个 skill 只是参考，不应接入主 flow，也要在这里标成 `reference-only`，避免重复评估。
- 新 teammate 迁 skill 时，必须同时更新这张表。

状态约定：

- `active`：已接入当前 flow，后续持续维护
- `adopted`：已迁入当前项目，但尚未完成端到端验证
- `template-ready`：已有适配模板，下一轮可批量迁入
- `reference-only`：只做参考，不直接接入
- `superseded`：被新 skill 替代，保留历史意义

---

## 2. 当前项目 Skill 总表

| Skill | Local Path | Flow | Status | Source Repo | Source Path / Basis | Current Owner | Sync Strategy |
|------|------------|------|--------|-------------|---------------------|---------------|---------------|
| `pyrojewel-paper` | `skills/pyrojewel-paper/skill.md` | Flow 1 | `active` | `ljg-skills` | `ljg-paper` 改编 | worker2 | 跟踪上游结构性改动；本地输出协议优先 |
| `pyrojewel-paper-river` | `skills/pyrojewel-paper-river/skill.md` | Flow 1 | `active` | `ljg-skills` | `ljg-paper-river` 改编 | worker2 | 跟踪上游溯源方法；本地图片/路径策略优先 |
| `pyrojewel-paper-qa` | `skills/pyrojewel-paper-qa/skill.md` | Flow 1 | `active` | `ljg-skills` | `ljg-qa` 改编 | worker2 | 跟踪问题设计方法；本地对齐输出优先 |
| `pyrojewel-deep-paper` | `skills/pyrojewel-deep-paper/SKILL.md` | Flow 1 | `adopted` | `ljg-skills` | 改编 `ljg-read`(伴读碰撞) + `ljg-qa`(Q-A 链)，交互改为 Claude AskUserQuestion 多选批量提问；吃 ljg-paper 初读笔记+原文，深读结果追加进原笔记 | worker2 | 跟踪 ljg-read/ljg-qa 的方法论变化；AskUserQuestion 批量交互与「追加进原笔记」为本地铁律 |
| `pyrojewel-paper-flow` | `skills/pyrojewel-paper-flow/SKILL.md` | Flow 1 | `adopted` | self-built + local composition | 编排 `zotero-pdf-parse -> paper -> river -> qa -> beamer` | worker2 | 不看单一 upstream；按主链变化手工维护 |
| `pyrojewel-beamer-academic` | `skills/pyrojewel-beamer-academic/SKILL.md` | Flow 1 / 11 | `adopted` | `beamer-academic` + `guizang-ppt-skill` | 上游 beamer + 本地版式改造 | worker2 | 跟踪上游 LaTeX/模板更新；版式规则本地优先 |
| `zuhui-beammer` | ~~`skills/zuhui-beammer/`~~（已删除） | Flow 11 | `removed` | local derivative of `pyrojewel-beamer-academic` + `ADC_Calibration.pdf` | 2026-08-17 删除，改由 `beamer-academic` 承担该场景。上游 v1.5 完全没有、随之放弃的四项：`page_manifest.tsv` 证据契约、语义化配色（red/green/blue）、`zuhuicode` 代码块、`pdftoppm` 视觉 QA 硬门 | — | 不再维护；取回：`git checkout 0e128a2 -- skills/zuhui-beammer` |
| `analyze-results` | `skills/analyze-results/skill.md` | Flow 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 原样迁移 | worker3 | 看上游是否有方法/输出结构更新 |
| `experiment-plan` | `skills/experiment-plan/skill.md` | Flow 2 / 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 原样迁移 | worker3 | 跟踪 claim-driven planning 更新 |
| `paper-compile` | `skills/paper-compile/skill.md` | Flow 4 / 5 | `adopted` | `Auto-claude-code-research-in-sleep` | 原样迁移 | worker3 | 跟踪编译/修错流程更新 |
| `dse-loop` | `skills/dse-loop/skill.md` | Flow 3 / 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 原样迁移 | worker3 | 跟踪搜索策略更新 |
| `formula-derivation` | `skills/formula-derivation/skill.md` | Flow 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 原样迁移 | worker3 | 低频检查 |
| `experiment-log-summarizer` | `skills/experiment-log-summarizer/skill.md` | Flow 4 | `adopted` | unknown | 原标 academic-skills 已核实磁盘无此仓库（2026-08-11）；`academic-research-skills` 亦无此 skill，来源不可核实 | worker3 | 无需同步外部源，作为本地 skill 维护 |
| `benchmark-extractor` | `skills/benchmark-extractor/skill.md` | Flow 4 | `adopted` | unknown | 原标 academic-skills 已核实磁盘无此仓库（2026-08-11）；`academic-research-skills` 亦无此 skill，来源不可核实 | worker3 | 无需同步外部源，作为本地 skill 维护 |
| `novelty-check` | `skills/novelty-check/skill.md` | Flow 2 / 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 已做 `REVIEWER_MODEL` + `shared-references` 适配 | worker3 | 作为 P1 适配模板，优先跟踪 |
| `idea-discovery` | `skills/idea-discovery/skill.md` | Flow 2 | `adopted` | `Auto-claude-code-research-in-sleep` | 已做 `REVIEWER_MODEL`(o3) + `shared-references` 路径适配；编排器，串联 idea-creator/novelty-check/research-review/research-refine | worker3 | 跟踪编排逻辑和子 skill 调用变化 |
| `idea-creator` | `skills/idea-creator/skill.md` | Flow 2 | `adopted` | `Auto-claude-code-research-in-sleep` | 已做 `REVIEWER_MODEL`(o3) + `shared-references` 路径适配；helper resolve chain 保持 3 层 | worker3 | 跟踪 jury/fan-out 逻辑更新 |
| `research-review` | `skills/research-review/skill.md` | Flow 2 / 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 已做 `REVIEWER_MODEL`(o3) + `shared-references` 路径适配 | worker3 | 跟踪审稿 prompt/reviewer routing 更新 |
| `research-refine-pipeline` | `skills/research-refine-pipeline/skill.md` | Flow 2 | `adopted` | `Auto-claude-code-research-in-sleep` | 已做 `shared-references` 路径适配（无 REVIEWER_MODEL 常量） | worker3 | 跟踪 refine→experiment-plan 链更新 |
| `research-lit` | `skills/research-lit/skill.md` | Flow 2 | `adopted` | `Auto-claude-code-research-in-sleep` | 已迁入；shared-references 引用改为当前项目路径；helper/tool 解析链保留 | lead | 跟踪 helper 链和多源检索协议更新 |
| `auto-review-loop` | `skills/auto-review-loop/skill.md` | Flow 4 / 5 | `adopted` | `Auto-claude-code-research-in-sleep` | 已做 `REVIEWER_MODEL`(o3) + `shared-references` 路径适配；save_trace resolve chain 保持 | worker3 | 跟踪 reviewer difficulty/debate protocol 更新 |
| `experiment-bridge` | `skills/experiment-bridge/skill.md` | Flow 2 / 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 已做 `shared-references` 路径适配；无 REVIEWER_MODEL 常量 | worker3 | 跟踪 experiment→review 桥接逻辑更新 |
| `experiment-audit` | `skills/experiment-audit/skill.md` | Flow 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 已做 `shared-references` 路径适配；REVIEWER_BACKEND=codex 默认值无需改 | worker3 | 跟踪实验完整性审查标准更新 |
| `experiment-queue` | `skills/experiment-queue/SKILL.md` | Flow 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 2026-06-23 迁入；shared-references 路径已适配；含 scripts/queue_manager.py + build_manifest.py | worker3 | 跟踪队列编排/OOM重试/wave过渡逻辑更新 |
| `run-experiment` | `skills/run-experiment/SKILL.md` | Flow 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 2026-06-23 迁入；无 shared-references 依赖；需 GPU 环境 | worker3 | 跟踪多环境部署（local/SSH/Vast/Modal）逻辑更新 |
| `monitor-experiment` | `skills/monitor-experiment/SKILL.md` | Flow 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 2026-06-23 迁入；shared-references 路径已适配；需 GPU 环境 | worker3 | 跟踪 W&B/SSH/Modal 监控逻辑更新 |
| `ablation-planner` | `skills/ablation-planner/SKILL.md` | Flow 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 2026-06-23 迁入；无 shared-references 依赖；Codex 主导设计 | worker3 | 跟踪消融实验设计方法论更新 |
| `result-to-claim` | `skills/result-to-claim/SKILL.md` | Flow 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 2026-06-23 迁入；shared-references 路径已适配；含 evidence pre-check | worker3 | 跟踪 claim 门控逻辑和证据预检查更新 |
| `research-pipeline` | `skills/research-pipeline/SKILL.md` | Flow 2 / 4 / 5 | `adopted` | `Auto-claude-code-research-in-sleep` | 2026-06-23 迁入；shared-references 路径已适配；全流程编排器 | worker3 | 跟踪全流程编排逻辑和 resumable runs 更新 |
| `vast-gpu` | `skills/vast-gpu/SKILL.md` | Flow 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 2026-06-23 迁入；无 shared-references 依赖；需 vastai CLI | worker3 | 跟踪 Vast.ai API/定价/GPU 选择逻辑更新 |
| `training-check` | `skills/training-check/SKILL.md` | Flow 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 2026-06-23 迁入；shared-references 路径已适配；需 W&B | worker3 | 跟踪训练健康检查阈值和 Codex 判断逻辑更新 |
| `serverless-modal` | `skills/serverless-modal/SKILL.md` | Flow 4 | `adopted` | `Auto-claude-code-research-in-sleep` | 2026-06-23 迁入；无 shared-references 依赖；需 Modal CLI | worker3 | 跟踪 Modal API/GPU/Volume 配置更新 |
| `virtuoso` | `skills/virtuoso/SKILL.md` | RF/EDA | `adopted` | `virtuoso-bridge-lite` (upstream Arcadia-1) | 2026-07-13 迁入；含 profile 配置（default/smic110/smic55/smic55v2/gf110）+ references/ | lead | 跟踪 upstream bridge API 更新；本地 profile 配置优先保留 |
| `zotero-pdf-parse` | `skills/zotero-pdf-parse/skill.md` | Flow 1 / 9 | `adopted` | `skill_manager` (改编) | env var 替换 + 输出约定对齐 pyrojewel-paper-flow Phase 1 | worker2 | 高优先，跟踪 MarkerPDF 路径变化 |
| `wiki-capture` | `skills/wiki-capture/skill.md` | Flow 10 | `adopted` | local self-built | 本地自建 | worker2 | 不依赖外部上游 |
| `inbox-prepare` | `skills/inbox-prepare/skill.md` | Flow 10 | `adopted` | local self-built | 本地自建 | worker2 | 不依赖外部上游 |
| `wiki-compile` | `skills/wiki-compile/skill.md` | Flow 10 | `adopted` | local self-built | 本地自建 | worker2 | 不依赖外部上游 |
| `wiki-crystallize` | `skills/wiki-crystallize/skill.md` | Flow 10 | `adopted` | local self-built | 本地自建 | worker2 | 不依赖外部上游 |
| `wiki-lint` | `skills/wiki-lint/skill.md` | Flow 10 | `adopted` | local self-built | 本地自建 | worker2 | 不依赖外部上游 |
| `wiki-query` | `skills/wiki-query/skill.md` | Flow 10 | `adopted` | local self-built | 本地自建 | worker2 | 不依赖外部上游 |
| `wiki-research` | `skills/wiki-research/skill.md` | Flow 10 | `adopted` | local self-built | 本地自建 | worker2 | 不依赖外部上游 |
| `arxiv` | `skills/arxiv/skill.md` | Flow 2 support | `adopted` | `Auto-claude-code-research-in-sleep` | 已迁入；shared-references 引用改为当前项目路径 | lead | 跟踪下载/检索 helper 解析链 |
| `render-html` | `skills/render-html/skill.md` | Flow 2 support | `adopted` | `Auto-claude-code-research-in-sleep` | 已迁入；脚本与模板一并落地；shared-references 引用改为当前项目路径 | lead | 跟踪 HTML 渲染脚本与模板更新 |
| `pyrojewel-academic-ppt` | `.claude/skills/pyrojewel-academic-ppt/` | Flow 11 | `superseded` | local legacy | 被 `pyrojewel-beamer-academic` 替代 | worker2 | 不再同步 |
| `beamer-academic` | `skills/beamer-academic/SKILL.md` | Flow 11 | `active` | `beamer-academic` | 2026-08-17 从 upstream `788e125` (v1.5) 迁入，同日转为**维护中的本地 fork**（`1.5+pyrojewel.1`）。承接开题/会议/conference talk 及通用学术汇报。SKILL.md 正文仍与上游逐字节一致；主题已分叉 1 个 patch（[P1] 封面守卫 `\ifx...\empty` → `\ifdefempty`）。patch 日志与同步流程见 `skills/beamer-academic/LOCAL-NOTES.md` | lead | 从 commit 对象提取（**禁止 cp 工作区**，见 LOCAL-NOTES）；覆盖后重新施加 patch 日志并保留本地 frontmatter |
| `guizang-ppt-skill` | external repo only | Flow 11 | `reference-only` | `guizang-ppt-skill` | 版式规则来源 | worker2 | 只分析版式/渲染经验 |
| `scientific-thinking-literature-review` | `skills/scientific-thinking-literature-review/SKILL.md` | ECC legacy | `reference-only` | `ECC` | 历史导入 | worker1 | 默认不继续演化 |
| `deep-research` | `skills/deep-research/SKILL.md` | ECC legacy | `reference-only` | `ECC` | 历史导入 | worker1 | 仅作参考 |
| `search-first` | `skills/search-first/SKILL.md` | ECC legacy | `reference-only` | `ECC` | 历史导入 | worker1 | 仅作参考 |
| `mle-workflow` | `skills/mle-workflow/SKILL.md` | ECC legacy | `reference-only` | `ECC` | 历史导入 | worker1 | 后续可清理 |
| `verification-loop` | `skills/verification-loop/SKILL.md` | ECC legacy | `reference-only` | `ECC` | 历史导入 | worker1 | 仅作参考 |
| `continuous-learning-v2` | `skills/continuous-learning-v2/SKILL.md` | ECC legacy | `reference-only` | `ECC` | 历史导入 | worker1 | 与 wiki 线重叠，后续可清理 |
| `darwin-skill` | `skills/darwin-skill/skill.md` | Meta | `active` | local self-built | 本地自建，不依赖外部上游 | lead | 不再同步外部源 |

---

## 3. Source Repo Watch List

| Source Repo | Primary Flows | What To Watch | Check Trigger | Decision Output |
|------------|---------------|---------------|---------------|-----------------|
| `ljg-skills` | Flow 1 | `ljg-paper`, `ljg-paper-river`, `ljg-qa` 方法论变化 | 论文阅读主线有质量问题，或 upstream 有显著更新 | 是否同步到 `pyrojewel-paper*` |
| `beamer-academic` | Flow 1 / 11 | LaTeX 模板、编译脚本、字体/布局修复 | 需要更稳的编译链，或 upstream 新增关键版式 | 是否吸收到 `pyrojewel-beamer-academic` |
| `guizang-ppt-skill` | Flow 11 | 版式、结构密度、视觉层级规则 | PPT 版式需要增强 | 是否只吸收规则，不吸收动态渲染 |
| `skill_manager` | Flow 1 / 9 / Meta | `zotero-pdf-parse` | Flow 1 入口不稳，或 skill_manager 有实用更新 | 是否迁入/更新本地 skill |
| `Auto-claude-code-research-in-sleep` | Flow 2 / 4 / 5 | `idea-*`, `research-*`, `experiment-*`, `paper-*` | idea/experiment 主线要推进，或上游有方法改动 | 是否批量套模板适配 |
| ~~`academic-skills`~~（已核实不存在） | Flow 2 / 4 / 6 / 7 | ~~轻量零依赖学术 skill~~ | ~~需要低成本补充 flow~~ | 2026-08-11 核实：磁盘无 `academic-skills` 仓库，`academic-research-skills` 亦无相关 skill，条目移除 |
| `nature-skills` | Flow 5 / 11 | `nature-polishing`, `paper2ppt`, `figure` 等增强工具 | 写作或汇报线要增强 | 是否作为增强 skill 接入 |
| `ECC` | Flow 3 | hooks, agents, rules | 框架稳定化或上游 runtime 经验更新 | 是否吸收 hook/rule 改进 |
| `virtuoso-bridge-lite` | RF/EDA | `virtuoso` skill, bridge API, examples, references | upstream 发新 release 或新增 API | 是否同步到 `skills/virtuoso/` |

---

## 4. Sync Review Workflow

每次参考仓库更新后，按这个顺序处理：

1. 先同步 source repo 本身
2. 找出变更触及的 skill
3. 到本表定位这些 skill 对应哪条 flow、当前状态是什么
4. 判断该变更属于哪一类：
   - 方法/工作流增强
   - 依赖/路径修复
   - 输出格式变化
   - 无关的风格/营销更新
5. 只把前 3 类里“对当前 flow 有价值”的改动吸收进本项目
6. 更新本表中的：
   - `Status`
   - `Sync Strategy`
   - 如有必要，补 `Current Owner`

---

## 5. Immediate Follow-ups

1. ~~把 `zotero-pdf-parse` 正式迁入 `skills/`~~ ✅ 已完成
2. ~~继续迁 `idea-creator`、`research-review`、`research-refine-pipeline`~~ ✅ 已完成
3. ~~下一批：迁 `ablation-planner` + `paper-plan` / `paper-write`~~ ✅ 已完成（2026-06-23 迁入 10 个实验 skills + 6 个 tools，research-pipeline 全链补齐）
4. 等 `pyrojewel-paper-flow` 和 `pyrojewel-beamer-academic` 完成实测后，把它们的 `Status` 从 `adopted` 改成 `active`
5. 后续清理 ECC legacy skills，决定哪些继续保留、哪些仅保留文档引用
6. 下一批：迁 `paper-plan` / `paper-write` / `paper-figure` 等论文写作链 skills
7. ~~`virtuoso` skill 迁入 `skills/virtuoso/`~~ ✅ 已完成（2026-07-13 从 virtuoso-bridge-lite upstream 同步，含 profile 配置 + references）

---

## 6. Sync Log

### 2026-08-11 — 四仓库批量同步

**上游仓库更新：**

| 仓库 | 同步方式 | 结果 | 新 commit |
|------|---------|------|----------|
| `Auto-claude-code-research-in-sleep` | HTTPS fetch + ff-only merge → `bab594e` | ✅ | 54 |
| `ljg-skills` | `git fetch upstream` → 无新 commit | ✅ 已最新 | 0 |
| `beamer-academic` | HTTPS fetch + pull → 无新 commit | ✅ 已最新 | 0 |
| `virtuoso-bridge-lite` | `git fetch upstream` + merge（解决 2 个冲突）→ `5d52326` | ✅ | 15 |

**已同步到当前项目的 skill：**

| Skill | 变更类型 | 操作方式 |
|-------|---------|---------|
| `experiment-queue` (SKILL.md + queue_manager.py) | Scheduler bug fix | 直接覆盖脚本 + 适配路径 |
| `research-lit` | 静默跳过修复 | 选择合并（保留本地 IEEE 功能） |
| `virtuoso` (SKILL.md + 11 references) | API 统一为 `client.*` | 覆盖 + 回插本地 Profile/Deep Dives 段落 |
| `experiment-audit` | 身份验证增强 | 覆盖 + 保留 trigger/REVIEWER_MODEL |
| `idea-creator` | 身份验证 + bundle 模式 | 覆盖 + 保留 trigger/REVIEWER_MODEL |
| `research-review` | 身份验证 + brief 模式 | 覆盖 + 保留 trigger/REVIEWER_MODEL |
| `idea-discovery` | Evidence gate | 覆盖 + 保留 trigger/REVIEWER_MODEL |
| `auto-review-loop` | Copilot native 支持 | 覆盖 + 保留 trigger/REVIEWER_MODEL |
| `shared-references/` × 4 | helper 第4层 + 身份追踪 | 覆盖 + 路径回退 |
| `pyrojewel-paper` | 上游方法论合并 | 合并 3.5/3.6/5.5/5.6 节 |

**统一适配规则：** `../shared-references/` → `shared-references/` 路径回退；`REVIEWER_MODEL` 保留本地 `o3`；保留本地中文 trigger；保留本地独有段落。

**未同步：** `pyrojewel-paper-qa`（已最新）、`pyrojewel-beamer-academic`（上游无新 commit）。

**详细报告：** `references/upstream-sync-2026-08-11.md` + `references/skill-sync-plan-2026-08-11.md`

### 2026-08-12 — 日常同步（无 skill 变更）

**上游仓库更新：**

| 仓库 | 同步方式 | 结果 | 新 commit |
|------|---------|------|----------|
| `Auto-claude-code-research-in-sleep` | HTTPS fetch + manual merge（SSH key 缺失，临时切 HTTPS） | ✅ `e8887cc`→`e12e07c` | 3 |
| `ljg-skills` | `git fetch upstream` | ✅ 已最新 | 0 |
| `beamer-academic` | HTTPS pull | ✅ 已最新 | 0 |
| `virtuoso-bridge-lite` | `git fetch upstream` | ✅ 已最新 | 0 |

**新 commit 内容：** `Auto-claude-code-research-in-sleep` 3 个 commit 全部为 README.md / README_CN.md 文档更新（HERO sibling-project callout + Anti-Autoresearch pull-quote），不涉及任何 skill / shared-references / tools 文件。

**同步到当前项目的 skill：** 无（无 skill 文件变更）。

**push 状态：** 无需 commit/push（pyrojewel_claude_code 无变更）。

**备注：** 本次会话 VM 无 SSH key（`~/.ssh/` 不存在），origin SSH pull 不可用。`Auto-claude-code-research-in-sleep` 和 `beamer-academic` 通过临时切换 origin 为 HTTPS 完成拉取后恢复 SSH remote。`ljg-skills` 和 `virtuoso` 的 upstream 为 HTTPS，fetch 正常。挂载盘 git merge 受 `unlink` 权限限制，通过 `git show` + `cp` + `git update-ref` workaround 完成 HEAD 更新。

### 2026-08-12 — 手动试运行（含邮件链路验证）

**上游仓库更新：**

| 仓库 | 同步方式 | 结果 | 新 commit |
|------|---------|------|----------|
| `Auto-claude-code-research-in-sleep` | SSH fetch（直连上游） | ✅ 已最新 | 0 |
| `ljg-skills` | HTTPS fetch upstream（绕代理）+ merge → `3777618` | ✅ | 3（v1.17.85/v1.17.86） |
| `beamer-academic` | SSH fetch（直连上游） | ✅ 已最新 | 0 |
| `virtuoso-bridge-lite` | HTTPS fetch upstream（绕代理） | ✅ 已最新 | 0 |

**ljg-skills merge 处理：** 8 个文件冲突（ljg-book×3、ljg-paper×2、ljg-push×2、ljg-writes×1），全部为「本地 markdown migration」vs「上游 Org 版方法论更新」冲突。按规则保留本地 markdown 版本（`git checkout --ours`）。上游新增 `ljg-classic` skill（项目未采用，不接入）。fork 已 push（`dd4bd54..3777618`）。

**同步到当前项目的 skill：** 无直接覆盖。

**待评估（重要）：** `ljg-paper` 上游做了完整方法论重构（v1.17.85/86）——从「承重概念 + 四段结构」改为「x/R/f/E 回流链 + 单例驱动」，目标受众为 non-academics。本地 `pyrojewel-paper` 是面向研究者的高度本地化版本（Zotero/paper_overview 集成），按「本地输出协议优先」原则**未自动同步**，需人工评估是否吸收部分方法论。上游新版文件已备份（`git show upstream/master:skills/ljg-paper/{SKILL.md,ReadingGuide.md}` 可从 fork 随时取回）。

**push 状态：** pyrojewel_claude_code 本任务无变更（仅本次日志）。

**邮件链路：** SMTP 配置验证通过，测试邮件已发送到 2895687337@qq.com。定时任务 `daily-upstream-sync` 已更新为同步完成后自动发邮件汇报。

**备注：** 本 VM 环境变量带 `https_proxy=http://172.16.10.254:7897`（当前不可达），HTTPS 访问 GitHub 需绕代理（`env -u https_proxy ... git fetch`）。SSH（443 端口 via `~/.ssh/config`）可用。

### 2026-08-12 — ljg-paper 对齐 v1.17.86（fork 内完成）

**背景：** ljg-paper 上游 v1.17.85/86 做了方法论级重构（承重概念+四段结构 → x/R/f/E 回流链+内容驱动标题）。上一轮 merge 只把 ReadingGuide.md 自动合入新版，SKILL.md/template.md 因冲突仍为旧版，头身错位。

**本次操作（fork `Pyrojewel-zard/ljg-skills` @ `3210fa9`）：**

| 文件 | 处理 |
|------|------|
| `skills/ljg-paper/SKILL.md` | 对齐 v1.17.86 全量，markdown 适配（org→md），新增「阅读纪律：概念必须真正形成（精细阅读基线）」节 |
| `skills/ljg-paper/ReadingGuide.md` | v1.17.86 全量 + 插入「阅读纪律」节（概念缺口账本/依赖顺序补概念/最小模型三查/证据纪律） |
| `skills/ljg-paper/references/template.md` | 对齐新版内容驱动标题模板 + 保留精细阅读写作备忘 |

**精细阅读基线（来自 pyrojewel-paper 要求，融合进新框架）：**
- 概念缺口账本：承重概念必须通过区分/关系/案例三重检验，「假熟悉」仍算缺口
- 按依赖顺序补概念，不按出现顺序罗列
- 最小解释模型三查：解释原锚点 / 区分邻近情况 / 预测条件变化
- 证据纪律：区分「论文直接测到的/作者解释的/讲解者推演的」，用词匹配证据强度

**pyrojewel-claude_code 项目侧：** `pyrojewel-paper`（研究者向，Zotero/paper_overview 集成）本次不同步——其阅读协议已含概念缺口账本/三重检验/最小模型三查，是精细阅读基线的来源；新框架的叙事引擎与研究者向定位不符。fork 对齐版作为方法论参考保留，后续如需可选择性吸收证据纪律表述。

**push 状态：** ljg-skills fork 已 push（`3777618..3210fa9`）；pyrojewel-claude_code 本次仅此日志。

### 2026-08-13 — 日常同步（无变更）

**上游仓库更新：**

| 仓库 | 同步方式 | 结果 | 新 commit |
|------|---------|------|----------|
| `Auto-claude-code-research-in-sleep` | HTTPS fetch（绕代理，SSH key 缺失） | ✅ 已最新 `e12e07c` | 0 |
| `ljg-skills` | HTTPS fetch upstream（绕代理） | ✅ 已最新 `3210fa9` | 0 |
| `beamer-academic` | HTTPS fetch（绕代理） | ✅ 已最新 `92f0fa9` | 0 |
| `virtuoso-bridge-lite` | HTTPS fetch upstream（绕代理） | ✅ 已最新 `5d52326` | 0 |

**同步到当前项目的 skill：** 无（四仓库均无新 commit）。

**push 状态：** 无需 commit/push（pyrojewel_claude_code 无变更）。

**备注：** 本会话 VM 无 SSH key（`~/.ssh/` 不存在），所有 origin SSH 操作不可用。环境变量带 `https_proxy=http://172.16.10.254:7897`（当前不可达），HTTPS 访问 GitHub 需 `unset` 代理变量后直连。四仓库均通过 HTTPS 完成验证，无需 workaround。

### 2026-08-17 — 日常同步（无 skill 变更）

**上游仓库更新：**

| 仓库 | 同步方式 | 结果 | 新 commit |
|------|---------|------|----------|
| `Auto-claude-code-research-in-sleep` | HTTPS pull（origin 临时切 HTTPS，SSH key 缺失） | ✅ 已最新 `0c65f8b` | 0 |
| `ljg-skills` | `git fetch upstream` + merge（解决 11 个文件冲突，保留本地改编） | ✅ `35025c3`→`e496e28` | 13 |
| `beamer-academic` | HTTPS fetch + workaround（`git update-ref HEAD origin/main`，`unlink` 权限受限） | ✅ `92f0fa9`→`788e125` | 1 |
| `virtuoso-bridge-lite` | `git fetch upstream` + merge（自动合入，无冲突） | ✅ `5d52326`→`70b41f8` | 3 |

**ljg-skills merge 处理：** 11 个文件冲突（ljg-blind/ljg-book/ljg-paper/ljg-push/ljg-qa/ljg-roundtable/ljg-structure），全部为「本地 markdown 迁移 + 路径对齐」vs「上游 Org 版方法论更新」冲突。按规则保留本地改编（`git checkout --ours`）。上游新增 v1.17.87-v1.17.97 批量同步（ljg-paper 新增精细阅读基线/概念缺口账本，与本地 pyrojewel-paper 已有能力一致）。fork 未 push（SSH key 缺失）。

**beamer-academic 更新：** 主题 v1.5 顶对齐细线版（`assets/beamerthemeAcademic.sty` + SKILL.md 版式规则更新），章节分隔页从 outline 改为满版色+圆圈序号。本地 `pyrojewel-beamer-academic` 按「版式规则本地优先」原则未自动同步，需人工评估是否吸收部分风格变化。

**virtuoso 更新：** 3 个 commit 均为 README/docs 更新（移除 OOS Metrics badge + 流量统计），无 bridge API 或 SKILL.md 变更，无需同步。

**同步到当前项目的 skill：** 无（四仓库变更均不涉及当前项目已采用 skill 的文件变更）。

**push 状态：** 无需 commit/push（pyrojewel_claude_code 无变更）。

**备注：** 本会话 VM 无 SSH key（`~/.ssh/` 不存在），所有 origin SSH 操作不可用。`Auto-claude-code-research-in-sleep` 和 `beamer-academic` 通过临时切 origin 为 HTTPS 完成拉取。挂载盘 git 受 `unlink` 权限限制，`beamer-academic` 用 `git update-ref HEAD origin/main` workaround 更新 HEAD，`ljg-skills` 和 `virtuoso` 通过 `rm -f .git/*.lock` 清理遗留锁文件后再完成 merge。

### 2026-08-17 — beamer-academic v1.5 迁入为独立对照 skill

**动机：** 2026-08-17 日常同步发现 `beamer-academic` 上游发布 v1.5（顶对齐细线版）。评估后确认上游在主题工程、版式库（13 版式 registry）、反 AI 写作纪律上强于本地 `pyrojewel-beamer-academic`，但在证据可追溯性和语义化配色上完全空白——后两项恰是 `zuhui-beammer`（ADC 组会线）的核心。结论：**吸收而非替换**，先原样迁入作对照。

**落地：** `skills/beamer-academic/`（新建，`reference-only`）

| 项 | 处理 |
|---|---|
| 提取方式 | `git archive 788e125`（**不是** cp 工作区——工作区因挂载盘 unlink 权限停在 v1.0，HEAD 已是 v1.5） |
| SKILL.md | 正文 494 行与上游逐字节一致；仅 frontmatter 本地化 |
| 触发词 | 故意只保留显式指名（`beamer-academic`/`上游 beamer`/`原版 beamer`），**不占用** `beamer`/`答辩PPT`/`学术报告`——那些归 `pyrojewel-beamer-academic` |
| 保留文件 | `SKILL.md`、`assets/`、`references/`、`scripts/`、`docs/`、`examples/`、`LICENSE`、`CHANGELOG.md` |
| 丢弃文件 | `.github/`、`README.md`、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`.gitignore`（仓库治理，非 skill 内容） |
| 路径适配 | 无需——该 skill 不依赖 `shared-references/`，无 `REVIEWER_MODEL`，无机器绝对路径 |

**验证：** v1.5 标记齐全（`\beamer@centeredfalse`、`\hrule height 1.15pt`、`\statrow`/`\hyporow`/`\statementframe`/`\headrow`/`\setcoverlabels`/`\setlogo`）；主题 Latin-only 冒烟测试编译通过，6 页 453.54×255.12 pt = 16:9。`examples/transformer/defense.tex` 在本 VM 编译不过，因 `texlive-lang-chinese` 缺失（`ctexhook.sty`），非主题缺陷。

**⚠ 发现上游 bug（v1.5，本地未修）：** 封面三个守卫 `\ifx\themelogo\empty` / `\ifx\supervisor\empty` / `\ifx\major\empty`（sty 147/158/161 行）永远为假——`\newcommand` 生成 `\long` 宏而 `\empty` 非 `\long`，`\ifx` 比较含前缀的 meaning。后果：默认封面触发 `! LaTeX Error: File `' not found.`（`-halt-on-error` 下中断），且空的「指导教师」「专业」标签行照常打印。修复方案（已实测：错误 1→0，多余行消失）是改用主题已 `\RequirePackage` 的 etoolbox `\ifdefempty`。为保持与上游干净 diff，**本地暂不施加**；详见 `skills/beamer-academic/LOCAL-NOTES.md`。适合作为 upstream PR。

**后续待办：** ①主题层修复（`\beamer@centeredfalse` + `\hrule`）抄进 `zuhui-beammer`，并修其 `\setbeamertemplate{frametitle}{}` 被清空导致漏写 `\zuhuiframetitle` 就静默无标题的隐患；②`writing-style.md` 红旗清单吸收进另两个 skill，但 `itemize` 禁令不照搬到 7–12 页组会线；③反向把 `zuhui-beammer` 的 `page_manifest.tsv` 证据契约补进 `pyrojewel-beamer-academic`。

### 2026-08-17 — 删除 zuhui-beammer，beamer-academic 转正式维护

**决策：** 用户评估对比结论后决定简化 beamer 线——删掉 `zuhui-beammer`，把 `beamer-academic` 从 `reference-only` 转为正式维护的本地 fork，与 `pyrojewel-beamer-academic` 并存两条线。ADC 专属能力**不抢救**，靠 git 历史保留。

**变更：**

| 项 | 处理 |
|---|---|
| `skills/zuhui-beammer/` | `git rm -r` 删除（8 个文件）。状态改 `removed`。取回：`git checkout 0e128a2 -- skills/zuhui-beammer` |
| `skills/beamer-academic/` | `reference-only` → `active`，版本 `1.5-upstream` → `1.5+pyrojewel.1` |
| trigger 划分 | 本 skill 取 `beamer-academic`/`开题PPT`/`会议报告`/`conference PPT`；`pyrojewel-beamer-academic` 保留 `答辩PPT`/`答辩`/`论文PPT` |

**随之放弃的四项能力**（上游 v1.5 完全没有）：`page_manifest.tsv` 证据契约（含 `evidence_status` 四态）、语义化配色（red=raw / green=corrected / blue=ideal + 强制图例）、`zuhuicode` 代码块、`pdftoppm` 栅格化视觉 QA + 数值硬门。

**⚠ 施加本地 patch [P1]：** 转为维护版后修掉上游封面 bug。`assets/beamerthemeAcademic.sty` 147/158/161 行三个守卫 `\ifx\themelogo\empty` / `\ifx\supervisor\empty` / `\ifx\major\empty` 永远为假——`\newcommand` 生成 `\long` 宏而 `\empty` 非 `\long`，`\ifx` 比较含前缀 meaning。后果：默认封面报 `! LaTeX Error: File `' not found.`（`-halt-on-error` 下中断），且空的「指导教师」「专业」标签行照常打印。改用 etoolbox `\ifdefempty`（主题已 `\RequirePackage`）。

双向验证通过：未设 supervisor/major/logo 时 0 错误且标签行消失；`\setsupervisor{Prof X}\setmajor{EE}` 时正常打印。`examples/transformer/` 内的主题副本已同步。此 patch 适合提 upstream PR，合并后可撤。

**⚠ 遗留路由歧义：** `pyrojewel-beamer-academic` 的 trigger 仍持有 `beamer`、`学术 PPT`、`学术报告`、`academic slides`、`paper presentation`、`beamer presentation` 等通用词，与本 skill 有重叠。本次未擅自收窄其 trigger。暂靠两边 description 区分（要证据契约 + Obsidian 输出走 pyrojewel，其余走 beamer-academic），彻底解决需后续决定是否收窄。

**push 状态：** 待 push（VM 无 SSH key）。
