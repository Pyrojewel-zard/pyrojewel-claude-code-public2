# 上游同步与合并分析报告

**日期:** 2026-08-11
**操作人:** Claude (automated)
**范围:** CLAUDE.md 记录的 4 个上游仓库

---

## 1. 同步结果总览

| # | 仓库 | remote 类型 | 同步方式 | 结果 | 新 commit 数 | 更新后 HEAD |
|---|------|------------|---------|------|-------------|-------------|
| 1 | `wanshuiyin/Auto-claude-code-research-in-sleep` | origin 直连上游 (SSH) | 临时 HTTPS remote → fetch + ff-only merge | ✅ 已更新 | **54** | `bab594e` |
| 2 | `lijigang/ljg-skills` | origin=fork, upstream=上游 (HTTPS) | `git fetch upstream` → 无新 commit | ✅ 已是最新 | **0** | `ead597e` (不变) |
| 3 | `Faust-Donf/beamer-academic` | origin 直连上游 (SSH) | 临时 HTTPS remote → fetch + pull | ✅ 已是最新 | **0** | `92f0fa9` (不变) |
| 4 | `Arcadia-1/virtuoso-bridge-lite` | origin=fork, upstream=上游 (HTTPS) | `git fetch upstream` + merge (解决冲突) | ✅ 已更新 | **15** | `5d52326` |

> **注:** Repo 1 和 Repo 3 原始 remote 为 SSH (`git@github.com:...`)，VM 内无 SSH key。已临时添加 HTTPS remote 进行 fetch（公开仓库无需认证）。
> Repo 4 merge 时在 `simulation-flow.md` 和 `troubleshooting.md` 有冲突，已用上游版本 (`--theirs`) 解决。本地 `AGENTS.md` 修改已 stash 保留。
> Repo 1 和 Repo 4 的 git 写操作在挂载盘上较慢，多次超时但最终均成功完成。

---

## 2. Repo 1: Auto-claude-code-research-in-sleep — 变更分析

### 2.1 与当前项目重叠的 skill 变更

以下 skill 在上游有变更，且当前项目已采用：

| Skill | 变更量 | 变更类型 | 需要合并? |
|-------|--------|---------|----------|
| `auto-review-loop` | +554 行 | **重大：方法/工作流增强** | ⚠️ 需评估 |
| `experiment-queue` (SKILL.md) | +24/-14 行 | **Bug 修复 + 方法增强** | ✅ 推荐 |
| `experiment-queue/scripts/queue_manager.py` | +43/-20 行 | **Bug 修复** | ✅ 推荐 |
| `experiment-audit` | +13/-6 行 | 依赖/配置修复 | ✅ 推荐 |
| `idea-discovery` | +50 行 | **方法增强（evidence gate）** | ⚠️ 需评估 |
| `idea-creator` | +13/-6 行 | 依赖/配置修复 | ✅ 推荐 |
| `research-review` | +13/-6 行 | 依赖/配置修复 | ✅ 推荐 |
| `research-lit` | +8/-2 行 | 方法修复（本地论文库警告） | ✅ 推荐 |
| `render-html` | +2/-2 行 | 参数格式修复 | ℹ️ 当前项目无此 skill 目录 |

### 2.2 各 skill 详细变更

#### `auto-review-loop` — ⚠️ 重大变更，需评估

**变更内容：**
- 新增 **Copilot CLI 原生 reviewer** 支持（`copilot-native` backend）
- 新增 `auto` reviewer 路由模式：首次调用时探测 Copilot CLI 绑定状态
- 新增 `copilot` 兼容模式：使用 `copilot --agent` 子进程 + 跨模型 profile
- manual backend 增加 `executor_model` + `require_reviewer_model` 身份验证
- reviewer routing 逻辑大幅扩展

**与当前项目的关系：**
- 当前项目的 `auto-review-loop` 已做 `REVIEWER_MODEL`(o3) + `shared-references` 路径适配
- 上游新增的 Copilot CLI 功能依赖 Copilot CLI 环境，当前项目未配置
- manual backend 的 `executor_model` 身份验证是对跨模型审查完整性的增强，与当前项目相关

**建议：** 合并 manual backend 身份验证部分（`executor_model` + `require_reviewer_model`），但 Copilot CLI 相关部分视环境配置决定是否吸收。需要人工 review 整体适配。

#### `experiment-queue` — ✅ 推荐合并

**SKILL.md 变更：**
- `output_check` → `expected_output` 字段重命名
- `depends_on` 必须为 LIST 格式（修复 bare string 导致 phase 永不 ready 的 bug）
- 依赖 wave 的"terminal"定义修正：`completed` **或** `stuck` 都算 terminal
- stale screen 处理改为 `failed_other` → `stuck`（而非原来的 `cleaned → pending`）
- 新增旧 state file 兼容说明

**queue_manager.py 变更：**
- `screen_exists()` 改用正则匹配（修复 grep 误匹配）
- `output_exists()` 改用 `glob.glob()`（修复 `ls | wc -l` 路径问题）
- 新增 `_normalize_depends_on()` 兼容 bare string 格式
- state file 加载时自动归一化 `depends_on` 字段
- 状态枚举新增 `failed_other`

**建议：** 直接合并，这些都是 bug fix 和健壮性改进。

#### `experiment-audit` / `idea-creator` / `research-review` — ✅ 推荐合并

三者的变更模式一致：
- manual backend config 增加 `executor_model` + `require_reviewer_model`
- 新增 manual response 必须以 `Reviewer-Model: <model-id>` 开头的身份验证规则
- `research-review` 额外补充：`model: gpt-5.6-sol` pin 是 Codex backend 专属，manual 不适用

**建议：** 合并。这些是跨模型审查完整性的增强，与当前项目的 `REVIEWER_MODEL` 适配不冲突。

#### `idea-discovery` — ⚠️ 需评估

**变更内容：**
- 新增 `RESUMABLE = true` 选项：per-stage evidence gate
- 依赖 `run_state.py` 和 `idea_discovery_gate.py` helper（通过 `.aris/tools/` → `tools/` → `$ARIS_REPO/tools/` → `~/.aris/repo/tools/` 解析）
- Phase 5 结束后运行 evidence gate，`BLOCKED` 结果写入报告
- `IDEA_REPORT.md` 新增 `Novelty Verification` 和 `External Critical Review` section

**与当前项目的关系：**
- 当前项目已做 `shared-references` 路径适配
- evidence gate 依赖 ARIS helper 工具链，当前项目可能未部署
- `RESUMABLE` 默认 `true`，如果不合并可能导致上游后续 skill 假设该 gate 存在

**建议：** 合并 skill 文档变更，但需确认 `idea_discovery_gate.py` 和 `run_state.py` 是否在当前项目的 `tools/` 中可用。

#### `research-lit` — ✅ 推荐合并

- 本地论文库（`papers/`, `literature/`, CLAUDE.md Paper Library）全部 miss 时输出 `WARN` 而非静默跳过
- 这是防止用户误以为 `— sources: all` 已覆盖本地论文的修复

#### `render-html` — ℹ️ 当前项目无此 skill 目录

- 仅 `argument-hint` 加引号（格式修复）
- skill-source-map.md 记录为 adopted，但磁盘 `skills/` 下无 `render-html/` 目录
- 需确认该 skill 是否已被移除或重命名

### 2.3 shared-references 变更

| 文件 | 变更量 | 需要合并? |
|------|--------|----------|
| `reviewer-routing.md` | +510 行 | ⚠️ 需评估（与 auto-review-loop Copilot 变更配套） |
| `review-tracing.md` | +214 行 | ⚠️ 需评估 |
| `resumable-runs.md` | +7/-3 行 | ✅ 推荐 |
| `integration-contract.md` | +2 行 | ✅ 推荐 |

### 2.4 新 skill（当前项目未采用）

| 新 Skill | 说明 | 是否接入? |
|----------|------|----------|
| `proof-orchestrator` | 数学证明编排 skill + references | ❌ 不接入（当前项目无此 flow） |
| `kill-argument` | 论文反驳/rebuttal skill | ❌ 不接入 |
| `paper-writing` | 论文写作 skill | ⚠️ 当前项目待迁 `paper-plan/paper-write/paper-figure`，需评估是否用这个 |
| `figure-spec` | 图表规格 skill | ❌ 暂不接入 |
| `integrity-forensics` | 实验完整性取证 | ❌ 暂不接入 |
| `interview-cheatsheet` | 面试速查 | ❌ 不相关 |
| `rebuttal` | rebuttal skill | ❌ 暂不接入 |
| `proof-checker` | 证明检查 | ❌ 不接入 |
| `research-wiki` | 研究 wiki | ❌ 与当前 wiki 线不同 |
| `semantic-scholar` | 学术搜索 | ❌ 暂不接入 |
| `system-profile` | 系统配置 | ❌ 不接入 |
| `web-debug-search` | Web 调试搜索 | ❌ 不接入 |

---

## 3. Repo 4: virtuoso-bridge-lite — 变更分析

### 3.1 skill 文件变更

| 文件 | 变更量 | 说明 |
|------|--------|------|
| `skills/virtuoso/SKILL.md` | +38/-38 行 | **API 重命名：方法变更** |
| `skills/virtuoso/references/simulation-flow.md` | -403 行 | 大幅精简 |
| `skills/virtuoso/references/troubleshooting.md` | -241 行 | 大幅精简 |
| `skills/virtuoso/references/maestro-python-api.md` | +169/-85 行 | **API 变更** |
| `skills/spectre/SKILL.md` | +6/-3 行 | 小修 |
| 其他 references | 小幅修改 | API 名称同步 |

### 3.2 核心变更：API 统一为 `client.*` 风格

上游将所有 API 调用从模块级函数改为 client 方法：

| 旧 API | 新 API |
|--------|--------|
| `from virtuoso_bridge.virtuoso.maestro import snapshot; snapshot(client)` | `client.maestro.snapshot()` |
| `from virtuoso_bridge.virtuoso.schematic import read_schematic; read_schematic(client, ...)` | `client.schematic.read(...)` |
| `client.schematic.edit(LIB, CELL)` | `client.schematic.create(LIB, CELL)` |
| `from virtuoso_bridge.virtuoso.maestro import open_gui_session; open_gui_session(client, ...)` | `client.maestro.open_gui_session(...)` |
| `close_gui_session(client, session)` | `client.maestro.close_gui_session(session)` |
| `open_session(client, LIB, CELL)` | `client.maestro.open_session(LIB, CELL)` |
| `close_session(client, session)` | `client.maestro.close_session(session)` |

**建议：** ✅ 推荐合并。这是 API 统一变更，当前项目的 virtuoso skill 需要同步更新以匹配上游 bridge 代码。如果不合并，SKILL.md 中的示例代码将与实际 bridge API 不匹配。

### 3.3 其他变更

- `src/virtuoso_bridge/` 下多个模块更新（maestro lifecycle/ops/writer, schematic editor, symbol editor, layout ops）
- 新增 Paramiko SSH session multiplexing 支持
- 新增 session-scoped corner netlist export
- 新增 parallel simulation work directory isolation
- 新增 X11 window discovery 测试
- `docs/` 下新增中文 README、Maestro 分析文档

---

## 4. Repo 2 & 3: ljg-skills / beamer-academic

无新 commit，已是最新状态。无需操作。

---

## 5. 合并优先级建议

### P0 — 立即合并（Bug Fix）

1. **`experiment-queue/SKILL.md` + `queue_manager.py`** — 修复 scheduler 杀健康 job、stale screen 误判、`depends_on` bare string bug
2. **`research-lit/SKILL.md`** — 本地论文库静默跳过修复

### P1 — 推荐合并（方法增强，需适配）

3. **`experiment-audit` / `idea-creator` / `research-review`** — manual backend 身份验证增强
4. **`research-lit/SKILL.md`** — `executor_model` + `require_reviewer_model`
5. **`virtuoso/SKILL.md` + references** — API 统一为 `client.*` 风格
6. **`shared-references/resumable-runs.md` + `integration-contract.md`** — 小幅更新

### P2 — 需人工评估后决定

7. **`auto-review-loop/SKILL.md`** — Copilot CLI 原生 reviewer 支持（+554 行），需确认是否使用 Copilot CLI
8. **`idea-discovery/SKILL.md`** — evidence gate 依赖 ARIS helper 工具链
9. **`shared-references/reviewer-routing.md` (+510 行) + `review-tracing.md` (+214 行)** — 与 auto-review-loop 配套
10. **`paper-writing/SKILL.md`** — 当前项目待迁论文写作链，需评估是否采用上游版本

### 不合并

- 新 skill（proof-orchestrator, kill-argument, rebuttal 等）— 不在当前 flow 中
- `render-html` — 当前项目无此 skill 目录（需确认状态）
- stats/docs/README 等非 skill 文件

---

## 6. 待确认事项

1. **`render-html` skill 状态** — skill-source-map.md 记录为 adopted，但 `skills/` 下无此目录。是否已被移除或重命名？
2. **Copilot CLI 环境** — 当前项目是否使用 Copilot CLI？决定 auto-review-loop 的 Copilot 部分是否合并。
3. **ARIS helper 工具链** — `idea_discovery_gate.py` 和 `run_state.py` 是否在当前项目 `tools/` 中？决定 idea-discovery evidence gate 是否可用。
4. **virtuoso bridge 代码同步** — 当前项目引用的 bridge 代码是否也需要同步更新（`src/virtuoso_bridge/`），还是仅更新 skill 文档？
