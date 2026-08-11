# Skill 同步方案：四上游仓库 → pyrojewel_claude_code

**日期:** 2026-08-11
**前置:** 四仓库已完成 git pull/merge（详见 `upstream-sync-2026-08-11.md`）

---

## 0. 映射关系总览

| 上游仓库 | 上游 skill | 项目 skill | 迁移类型 | 本次有变更? |
|----------|-----------|-----------|---------|-----------|
| Auto-claude-code-research-in-sleep | `auto-review-loop` | `auto-review-loop` | 原样迁移 | ✅ +554行 |
| | `experiment-queue` | `experiment-queue` | 原样迁移 | ✅ SKILL.md + 脚本 |
| | `experiment-audit` | `experiment-audit` | 原样迁移 | ✅ 身份验证增强 |
| | `idea-creator` | `idea-creator` | 原样迁移 | ✅ 身份验证 + bundle |
| | `idea-discovery` | `idea-discovery` | 原样迁移 | ✅ evidence gate |
| | `research-lit` | `research-lit` | 原样迁移 | ✅ 静默跳过修复 |
| | `research-review` | `research-review` | 原样迁移 | ✅ 身份验证 + brief |
| | `shared-references/*` | `shared-references/*` | 路径适配迁移 | ✅ 4个文件 |
| ljg-skills | `ljg-paper` | `pyrojewel-paper` | 改编迁移(重命名) | ❌ 无新 commit，但方法论有差异 |
| | `ljg-qa` | `pyrojewel-paper-qa` | 改编迁移(重命名) | ❌ 无新 commit |
| beamer-academic | `beamer-academic` | `pyrojewel-beamer-academic` | 改编迁移(重命名) | ❌ 无新 commit |
| virtuoso-bridge-lite | `virtuoso` | `virtuoso` | 原样迁移 | ✅ API 统一 + references 重写 |

---

## 1. 统一适配规则

所有从 Auto-claude-code-research-in-sleep 同步的文件，必须执行以下适配：

1. **路径回退**：上游 `../shared-references/` → 本地 `shared-references/`（本地 `shared-references/` 在项目根目录，与 `skills/` 平级）
2. **REVIEWER_MODEL**：保留本地 `o3`（或按需升级到 `gpt-5.6-sol`，需用户确认 codex-cli 版本）
3. **trigger 字段**：保留本地中文 trigger 列表（上游已移除 trigger，改用 description 匹配）
4. **MCP 工具名**：确认本地 `gemini_review` vs `gemini-review` 的实际格式
5. **helper 链第 4 层**：`~/.aris/repo` 解析可安全同步——是新增 fallback 层，不影响已有 3 层

---

## 2. 逐 Skill 同步方案

### 2.1 Auto-claude-code-research-in-sleep 系列

#### `experiment-queue` — P0 直接同步

| 文件 | 方式 | 说明 |
|------|------|------|
| `scripts/queue_manager.py` | **直接覆盖** | 纯 bug fix：`_normalize_depends_on()`、`screen_exists()` 正则、`glob.glob()`、`failed_other` 状态 |
| `SKILL.md` | **适配后同步** | Bug fix：`depends_on` 改列表格式、`output_check`→`expected_output`、stale screen 处理改为 `failed_other→stuck`、依赖 terminal 定义修正。需回退 `shared-references/` 路径 |

**注意事项：** `expected_output` 字段更名需检查本地是否有其他脚本依赖旧名 `output_check`

#### `research-lit` — P0 选择合并

**只同步以下变更，保留本地 IEEE Xplore 优先模式和 `ieee` source：**
- 本地论文库静默跳过修复：三路径全部 miss 时输出 WARN
- helper 链第 4 层 `~/.aris/repo`

**不同步：** 本地的 IEEE Xplore 功能是项目独有，不能被覆盖

#### `experiment-audit` — P1 适配后同步

同步内容：
- manual backend 身份验证增强：`Reviewer-Model:` 响应头 + `executor_model`/`require_reviewer_model` config
- 对抗性 prompt 增强（"Start from the assumption that the evaluation is compromised"）

保留本地：路径、trigger、REVIEWER_MODEL

**需确认：** `ultra` effort 和 `gpt-5.6-sol` 是否本地 codex-cli 支持

#### `idea-creator` — P1 适配后同步

同步内容：
- manual backend 身份验证增强
- bundle 文件模式（`codex_brainstorm_bundle.md`，Codex 只收路径）
- "Lead every recommended idea with its method" 原则
- helper 链第 4 层

保留本地：路径、trigger、REVIEWER_MODEL

**需确认：** `upsert_idea` helper 是否本地 `research_wiki.py` 已支持

#### `idea-discovery` — P2 适配后同步

同步内容：
- `RESUMABLE = true` 和 per-stage evidence gate 机制
- artifact locator 表
- Phase 5 gate 检查（PASS/BLOCKED）
- IDEA_REPORT.md 新增 "Novelty Verification" 和 "External Critical Review" 章节
- 方向多样性机制（research-wiki Failed Ideas + iteration_log.py）

保留本地：路径、trigger、REVIEWER_MODEL

**需确认：**
- `idea_discovery_gate.py` helper 是否本地已安装
- `iteration_log.py` 是否本地可用
- `templates/RESEARCH_CONTRACT_TEMPLATE.md` 是否存在

#### `research-review` — P1 适配后同步

同步内容：
- manual backend 身份验证增强
- brief 文件模式（`RESEARCH_REVIEW_REQUEST.md`，Codex 只收路径）
- 对抗性 prompt 增强

保留本地：路径、trigger、REVIEWER_MODEL

**需确认：** `ultra` effort 支持

#### `auto-review-loop` — P2 适配后同步（最大变更）

同步内容：
- Copilot CLI native rubber-duck reviewer 协议（`copilot-native` backend）
- `REVIEWER_BACKEND = auto` 自动探测模式
- `review_gate.py` 停止门控
- `ACQUITTAL_LOG.jsonl` 追加日志
- `run_id` 机制
- manual backend 身份验证增强
- reviewer memory 改为始终更新 + SHA-256 追踪
- helper 链第 4 层

保留本地：路径、trigger、REVIEWER_MODEL

**需确认：** 是否需要 Copilot CLI native 功能。如果不需要，可只同步身份验证增强和 prompt 增强部分

#### `shared-references/` — P1 适配后同步

| 文件 | 变更量 | 方式 | 说明 |
|------|--------|------|------|
| `reviewer-routing.md` | +515 行 | **适配后同步** | 本地极度过时(218→733行)。新增 Copilot native 协议、分层 effort、能力回退链。保留本地 MCP 工具名/模型名 |
| `review-tracing.md` | +246 行 | **适配后同步** | 本地严重过时(145→391行)。新增身份追踪字段、capability fallback、memory-hash。保留路径适配 |
| `resumable-runs.md` | +5 行 | **适配后同步** | 新增 gates 机制和 `record_gate_result` API。保留模型名 |
| `integration-contract.md` | +17 行 | **适配后同步** | helper 链 3→4 层。保留路径适配 |

---

### 2.2 ljg-skills 系列（改编迁移，无新 commit）

#### `ljg-paper` → `pyrojewel-paper` — 合并部分内容

**当前状态：** 上游 134 行 vs 项目 525 行。项目在工程化方面远超上游（Zotero 集成、图片管理、QA 自检、博导审稿、title 凝练规范），但缺失上游最新的方法论。

**建议合并的上游内容（方法论增强，不替换结构）：**

1. **概念缺口账本**：承重链扫描 → 逐概念检验（区别/关系/案例）→ 按依赖顺序补齐。引入"核心概念"章节作为概念选择的系统化方法
2. **最小解释模型**：条件/输入 → 概念间作用关系 → 首个可观察变化 → 现象/结果，过三道闸（解释原现象/区分邻近情况/预测条件变化）
3. **表征选择表**：思想形状 → 优先表征（结构图/因果图/回路图/曲线/trade-off/矩阵/trace/公式/纯文字）
4. **贡献类型判断**：第一步判断论文类型（解释/方法/测量/资源/理论）
5. **ReadingGuide.md**：考虑引入或精华合并到 SKILL.md

**不合并：** 上游的四段结构（速读/解决什么/看见了什么/带走什么）——项目的多段结构更完整

**注意：** 以 `skills/ljg-paper/`（新版 134 行）为同步源，不要用 `.claude/skills/ljg-paper/`（旧版 64 行 org-mode）

#### `ljg-qa` → `pyrojewel-paper-qa` — 保持当前版本

**当前状态：** `QuestionDesign.md` 一字不差完全一致，项目已完整保留上游方法论并构建了对齐层。上游无新 commit。

**不同步。** 未来如果上游更新 `QuestionDesign.md`，需要同步。

---

### 2.3 beamer-academic 系列

#### `beamer-academic` → `pyrojewel-beamer-academic` — 保持当前版本

上游无新 commit。当前项目版本已做大幅改编（圆角卡片+纯蓝标题条双色调、infobox/quoteline/stepline 排版命令、Obsidian 输出路径集成）。无需同步。

---

### 2.4 virtuoso-bridge-lite 系列

#### `virtuoso` — P0 适配后同步

核心变更：API 统一为 `client.*` 风格（`edit()` → `create()`/`modify()`，模块级函数 → `client.maestro.*` 方法）

| 文件 | 方式 | 说明 |
|------|------|------|
| `SKILL.md` | **适配后同步** | 以上游为基准覆盖，手动回插两段本地独有内容：①Profile 配置段落（~21行，多工艺实例 default/smic110/smic55/smic55v2/gf110）②Deep Dives 段落（~24行，仓库导航+memory 交叉引用） |
| `references/simulation-flow.md` | **直接覆盖** | 完全重写，中文教程精简为英文 8 步流程，-261 行 |
| `references/troubleshooting.md` | **直接覆盖** | 完全重写，中文调试指南精简为英文分类速查，-219 行 |
| `references/maestro-python-api.md` | **直接覆盖** | API 统一 + 新增 waveform viewer lifecycle |
| `references/layout-python-api.md` | **直接覆盖** | `edit()` → `create()`/`modify()` |
| `references/layout-skill-api.md` | **直接覆盖** | 同上 |
| `references/schematic-python-api.md` | **直接覆盖** | 重大结构变更 + 新增 netlist import/export |
| `references/schematic-skill-api.md` | **直接覆盖** | `edit()` → `create()` |
| `references/maestro-skill-api.md` | **直接覆盖** | `maeGetSetup(?typeName "globalVar")` → `asiGetDesignVarList()` |
| `references/symbol-python-api.md` | **直接覆盖** | `edit()` → `create()`/`modify()` |
| `references/schematic-recreation.md` | **直接覆盖** | API 命名变更 |
| `references/digital-import-flow.md` | **直接覆盖** | `edit()` → `modify()` |
| 其余 8 个文件 | **不同步** | 无差异 |

**关键注意：** SKILL.md 中的 Profile 配置段落和 Deep Dives 段落是多工艺环境运行的基础，**必须保留**。simulation-flow.md 和 troubleshooting.md 从中文重写为英文，如需保留中文版建议先备份。

---

## 3. 优先级排序

### P0 — 立即执行（Bug Fix + API 变更）

1. `experiment-queue/scripts/queue_manager.py` — 直接覆盖
2. `experiment-queue/SKILL.md` — 适配后同步
3. `research-lit/SKILL.md` — 选择合并（WARN 提示 + helper 第 4 层）
4. `virtuoso/` 全部 references 文件 — 直接覆盖（11 个文件）
5. `virtuoso/SKILL.md` — 适配后同步（回插 Profile + Deep Dives）

### P1 — 推荐执行（安全增强 + 基础设施）

6. `shared-references/integration-contract.md` — 适配后同步（helper 第 4 层）
7. `shared-references/reviewer-routing.md` — 适配后同步（本地极度过时）
8. `shared-references/review-tracing.md` — 适配后同步（本地严重过时）
9. `experiment-audit/SKILL.md` — 适配后同步（身份验证增强）
10. `idea-creator/SKILL.md` — 适配后同步（身份验证 + bundle 模式）
11. `research-review/SKILL.md` — 适配后同步（身份验证 + brief 模式）

### P2 — 需评估后执行（方法增强，有依赖）

12. `idea-discovery/SKILL.md` — 适配后同步（evidence gate，依赖 helper 工具链）
13. `auto-review-loop/SKILL.md` — 适配后同步（Copilot native，+554 行）
14. `shared-references/resumable-runs.md` — 适配后同步（gates 机制）
15. `pyrojewel-paper` — 合并上游方法论（概念缺口账本 + 解释模型 + 表征选择表）

### 不执行

- `pyrojewel-paper-qa` — 已是最新，无需同步
- `pyrojewel-beamer-academic` — 上游无新 commit
- 新 skill（proof-orchestrator, kill-argument, rebuttal 等）— 不在当前 flow 中

---

## 4. 待确认事项

1. **REVIEWER_MODEL 升级**：是否从 `o3`/`gpt-5.5` 升级到上游的 `gpt-5.6-sol`？需确认 codex-cli 版本 ≥ 0.144.1（`ultra`/`max` effort 需要）
2. **Copilot CLI**：当前项目是否使用 Copilot CLI？决定 auto-review-loop 的 Copilot native 部分是否同步
3. **ARIS helper 工具链**：`idea_discovery_gate.py`、`run_state.py`、`iteration_log.py`、`review_gate.py`、`copilot_native_evidence.py` 是否在本地 `tools/` 中可用？
4. **MCP 工具名**：本地 `gemini_review` vs 上游 `gemini-review`（下划线 vs 连字符），哪个是实际安装的？
5. **virtuoso 中英文**：simulation-flow.md 和 troubleshooting.md 从中文重写为英文，是否接受？还是需要保留中文版备份？
6. **`render-html` skill**：skill-source-map.md 记录为 adopted，但 `skills/` 下无此目录。是否已被移除？
7. **`expected_output` 更名影响**：experiment-queue 的 `output_check`→`expected_output` 是否影响本地其他脚本？
8. **`upsert_idea` helper**：idea-creator 依赖的 `research_wiki.py upsert_idea` 命令是否本地已支持？
