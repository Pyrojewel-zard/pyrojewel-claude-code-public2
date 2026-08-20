# Idea & Experiment Skill Audit — Worker3

主线2（idea-discovery）与主线4（实验相关）的 skill 筛选与接入优先级。

> **2026-06-02 修订**：Codex runtime（`mcp__codex__codex` / `mcp__codex__codex-reply`）已在当前环境配置并可用。
> ARIS shared-references（28个文件）和 tools/（verify_papers.py, research_wiki.py 等）均存在于源仓库。
> 真正的阻塞项是：helper脚本需适配路径、REVIEWER_MODEL需改为实际可用模型、GPU环境待配置。

---

## 主线2：Idea Discovery 默认 Skill 链

以 `idea-discovery`（ARIS）为核心编排器，默认链：

```
idea-discovery (编排器，6 Phase)
  ├─ Phase 1: research-lit ──── 多源文献检索
  ├─ Phase 2: idea-creator ─── 生成+过滤+pilot（含并行lens fan-out）
  ├─ Phase 3: novelty-check ── 多源+跨模型查新
  ├─ Phase 4: research-review ─ 外部审稿反馈
  └─ Phase 4.5: research-refine-pipeline → experiment-plan
```

### 各环节依赖与适配项

| 环节 | Skill | 依赖项 | 当前状态 | 适配工作 |
|------|-------|--------|---------|---------|
| 文献检索 | `research-lit` | 10个helper脚本(arxiv_fetch.py, semantic_scholar_fetch.py, deepxiv_fetch.py, exa_search.py, openalex_fetch.py, verify_papers.py, research_wiki.py等) + shared-refs/7文件 | ⚠️ 降级可用 | helper脚本需从ARIS tools/复制并适配路径；inline fallback(arxiv+S2)即用 |
| Idea生成 | `idea-creator` | `mcp__codex__codex`/`mcp__codex__codex-reply`（跨模型jury）+ research_wiki.py + verify_papers.py + shared-refs/8文件 | ✅ Codex runtime可用 | 适配：1) REVIEWER_MODEL gpt-5.5→实际可用模型；2) helper脚本路径适配；3) shared-refs相对路径改为绝对或统一 |
| 查新 | `novelty-check` | `mcp__codex__codex`(Phase C) + verify_papers.py | ✅ Codex runtime可用 | 适配：同上；Phase A+B零MCP即可运行 |
| 外部审稿 | `research-review` | `mcp__codex__codex`/`mcp__codex__codex-reply` + shared-refs/4文件 | ✅ Codex runtime可用 | 适配：REVIEWER_MODEL改为实际模型；shared-refs路径 |
| 方法精炼 | `research-refine-pipeline` | `mcp__codex__codex`/`mcp__codex__codex-reply`(7维评分) + shared-refs/3文件 | ✅ Codex runtime可用 | 适配：REVIEWER_MODEL；shared-refs路径 |
| 实验计划 | `experiment-plan` | 零MCP依赖（WebSearch/Bash/Read/Write） | ✅ 即用 | 零适配 |

**结论**：idea 全链的 Codex runtime 已就绪，不是 blocker。真正的适配项是：
1. `REVIEWER_MODEL = gpt-5.5` → 改为 Codex MCP 实际配置的模型名
2. helper脚本路径统一（从 ARIS tools/ → 本项目 tools/ 或 .aris/tools/）
3. `shared-references/` 相对路径（`../shared-references/`）→ 迁移时改为绝对或包内路径

### idea-discovery-robot（机器人领域变体）

依赖同 idea-discovery，额外加了 embodiment/benchmark/sim-first 约束。
**适配项同上**，无额外 blocker。

---

## 主线4：实验相关 Skill 接入优先级

### P0 — 直接可接（零适配或仅需路径修改）

| Skill | 来源 | 依赖 | 接入动作 |
|-------|------|------|---------|
| `analyze-results` | ARIS | 零 | 复制 SKILL.md→skill.md |
| `experiment-plan` | ARIS | 零 | 复制，零适配 |
| `paper-compile` | ARIS | latexmk+pdflatex+bibtex | 复制；验证本地 texlive |
| `experiment-log-summarizer` | academic-skills | 零 | 复制（中文输出） |
| `benchmark-extractor` | academic-skills | 零 | 复制 |
| `dse-loop` | ARIS | 零 | 复制，即用 |
| `formula-derivation` | ARIS | 零 | 复制 |
| `novelty-check` (Phase A+B) | ARIS | 零MCP | 复制；Phase C跨模型需Codex runtime适配 |
| `research-gap-finder` | academic-skills | 零 | 复制 |
| `survey-writer` | academic-skills | 零 | 复制 |
| `experiment-log-summarizer` | academic-skills | 零 | 复制 |

### P1 — 需要 Codex runtime 适配（helper脚本路径 + REVIEWER_MODEL）

| Skill | 来源 | 适配项 | 接入动作 |
|-------|------|--------|---------|
| `idea-discovery`（全链编排） | ARIS | REVIEWER_MODEL + shared-refs路径 + helper脚本部署 | 复制全链+适配3项后即可运行 |
| `idea-creator` | ARIS | REVIEWER_MODEL + wiki helper可选跳过 + shared-refs路径 | 复制+适配 |
| `novelty-check`（完整含Phase C） | ARIS | REVIEWER_MODEL + verify_papers.py路径 | 复制+适配 |
| `research-review` | ARIS | REVIEWER_MODEL + shared-refs路径 | 复制+适配 |
| `research-refine-pipeline` | ARIS | REVIEWER_MODEL + shared-refs路径 | 复制+适配 |
| `research-lit` | ARIS | 10个helper脚本部署 + shared-refs路径 | 复制+部署helper链 |
| `auto-review-loop` | ARIS | REVIEWER_MODEL + shared-refs路径 + save_trace.sh | 复制+适配 |
| `experiment-bridge` | ARIS | `mcp__codex__codex`(验证步骤) + shared-refs | 复制+适配 |
| `experiment-audit` | ARIS | `mcp__codex__codex`/`mcp__codex__codex-reply` + shared-refs | 复制+适配 |
| `ablation-planner` | ARIS | `mcp__codex__codex` + shared-refs | 复制+适配 |

### P2 — 需要真实环境（GPU/remote）

| Skill | 来源 | 缺失 | 接入动作 |
|-------|------|------|---------|
| `run-experiment` | ARIS | GPU环境(local/remote/vast/modal) + CLAUDE.md目标机器配置 | 配置GPU→复制+配置 |
| `monitor-experiment` | ARIS | 同run-experiment | 配置GPU→复制+配置 |
| `paper-illustration` | ARIS | Gemini API key + image2 MCP | 待Gemini API就绪 |
| `paper-illustration-image2` | ARIS | 同上 | 待Gemini API就绪 |

---

## 真实 Blocker 列表

| Blocker | 影响 | 解决方案 |
|---------|------|---------|
| `REVIEWER_MODEL = gpt-5.5` 硬编码 | idea链+review链全部受影响 | 改为 Codex MCP 实际可用模型名（查 settings.json） |
| helper脚本路径未统一 | research-lit, idea-creator, novelty-check | 从 ARIS tools/ 复制到本项目 tools/ 或 .aris/tools/，修改脚本中的硬编码路径 |
| `shared-references/` 相对引用 `../shared-references/` | 所有含Codex jury的skill | 迁移时改为包内路径或绝对路径 |
| `save_trace.sh` + `integration-contract.md` 路径 | auto-review-loop, experiment-audit, 所有review tracing skill | 同上，复制到本项目 |
| GPU环境未配置 | run-experiment, monitor-experiment | 配置CLAUDE.md中GPU信息 |

**已解决**：Codex MCP runtime（`mcp__codex__codex` / `mcp__codex__codex-reply`）已在环境配置并可用。

---

## 立即应开始迁移的 Skill

P0 前7个（analyze-results, experiment-plan, paper-compile, experiment-log-summarizer, benchmark-extractor, dse-loop, formula-derivation）零适配即可迁移。

P1 接下来应迁移 idea 链核心：先适配 REVIEWER_MODEL 和 shared-refs 路径，再批量接入 idea-creator → novelty-check → research-review → research-refine-pipeline → auto-review-loop。