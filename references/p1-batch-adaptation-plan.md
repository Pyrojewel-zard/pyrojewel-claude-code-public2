# P1 Batch Adaptation Plan — Codex Runtime Skills

统一适配方案，适用于所有含 `mcp__codex__codex` / `mcp__codex__codex-reply` 的 ARIS skill。

---

## 3 项统一适配

### 1. REVIEWER_MODEL 替换

**原值**：`gpt-5.5`（硬编码在所有含跨模型jury的skill中）
**目标值**：`o3`（Codex CLI v0.136 默认模型）

**批量操作**：每个 skill 的 SKILL.md/skill.md 中搜索 `REVIEWER_MODEL = \`gpt-5.5\`` → 替换为 `REVIEWER_MODEL = \`o3\``

**适用 skill 列表**：idea-creator, novelty-check, research-review, research-refine, research-refine-pipeline, auto-review-loop, experiment-audit, experiment-bridge, paper-plan, paper-write, ablation-planner, paper-claim-audit, citation-audit, slides-polish, rebuttal(ARIS版), paper-figure(Codex审稿步骤)

**注意**：部分 skill 在 prompt body 中也有 `model: REVIEWER_MODEL` 的调用模板，这些引用的是 Constants 中的变量，改 Constants 即可。但 `mcp__codex__codex:` 的 `config.model` 需确认是否也引用了 REVIEWER_MODEL 或硬编码了 `gpt-5.5`——需逐 skill 检查。

### 2. shared-references 路径适配

**原值**：`../shared-references/xxx.md`（ARIS 源仓库的相对路径）
**目标值**：`shared-references/xxx.md`（本项目内的相对路径）

**已落地**：28 个 shared-references 文件已复制到本项目 `shared-references/` 目录。

**批量操作**：每个 skill 中搜索 `../shared-references/` → 替换为 `shared-references/`

**适用 skill 列表**：所有含 `shared-references` 引用的 P1 skill（约15个）

### 3. Helper 脚本路径适配

**原值**：ARIS 源仓库中的 `tools/verify_papers.py`、`tools/research_wiki.py`、`tools/save_trace.sh` 等，通过 `shared-references/integration-contract.md` 的 resolve chain 定位。

**目标**：脚本已复制到本项目 `tools/` 目录（28个文件）。skill 中引用时直接使用 `tools/verify_papers.py` 或 `tools/save_trace.sh`。

**关键 resolve chain**：ARIS skill 通过 3 层 resolve 查找 helper：
1. `.aris/tools/xxx.py`（项目本地）
2. `tools/xxx.py`（仓库根目录）
3. `$ARIS_REPO/tools/xxx.py`（ARIS 源仓库）

**适配策略**：将 resolve chain 中的 `ARIS_REPO` 指向本项目自身，或简化为单层 resolve（直接从 `tools/` 取）。对 `integration-contract.md` 中涉及的 resolve chain 部分，建议简化但不删除原始 fallback 层——保持与 ARIS 上游的可对比性。

---

## 代表 skill 已完成适配

`novelty-check` 作为第一个 P1 代表 skill 已完成 3 项适配：
- REVIEWER_MODEL: gpt-5.5 → o3
- shared-references 路径: ../shared-references/ → shared-references/
- helper 脚本路径: 保持 resolve chain，tools/ 已在本项目可用

---

## 批量适配执行顺序

1. 对已复制的 `novelty-check/skill.md` 完成适配（已完成）
2. 下批复制并适配：`idea-creator`, `research-review`, `research-refine-pipeline`（idea 链核心 3 个）
3. 然后：`auto-review-loop`, `experiment-audit`, `experiment-bridge`（实验闭环 3 个）
4. 然后：`research-lit`（helper 链最重，需单独处理 10 个 fetch 脚本依赖）
5. 最后：`paper-plan`, `paper-write`（Flow 5 核心，与 idea 链适配逻辑相同）