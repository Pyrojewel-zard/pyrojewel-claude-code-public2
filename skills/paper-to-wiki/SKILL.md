---
name: paper-to-wiki
description: "将论文素材和调研文档同步到 llm-wiki 项目。图片平铺到 raw/assets/，文档按类型分入 raw/sources/{paper,notes,survey}/，自动修正图片引用为 ../../assets/，按白名单/黑名单过滤不允许入库的文件。触发：'迁移论文', 'paper-to-wiki', '搬论文到wiki', '导入idea', 'idea-to-wiki'。"
trigger:
  - "迁移论文"
  - "paper-to-wiki"
  - "搬论文到wiki"
  - "论文入库"
  - "ingest paper"
  - "导入idea"
  - "idea-to-wiki"
  - "迁移idea"
user_invocable: true
version: "5.1.0"
---

# paper-to-wiki: 论文素材与调研文档同步

把论文原文、阅读笔记、图片、调研文档同步到 llm-wiki 项目，修正图片引用，按白名单/黑名单过滤。

## 目录结构

```
{wiki}/raw/
├── assets/              ← 所有图片平铺（文件名唯一）
└── sources/
    ├── paper/           ← 论文原文 (Zotero attachmentKey.md)
    ├── notes/           ← 个人阅读笔记 (paper_Read/, raw/paper/*.md)
    └── survey/          ← 调研文档 (idea-stage/ 按方向子目录)
```

`{wiki}` = 含 `raw/` + `wiki/` 的 llm-wiki 项目根目录。

## 导入白名单（✅ 允许）

| source_type | 判断标准 | 目标 |
|------------|---------|------|
| paper | Zotero attachmentKey.md（8位字母数字.md）| `raw/sources/paper/` |
| notes | `paper_Read/` 下或含 `--paper-` 的 .md | `raw/sources/notes/` |
| notes | `raw/paper/` 下非 attachmentKey 的 .md | `raw/sources/notes/` |
| survey | IDEA_REPORT.md（子方向级别）| `raw/sources/survey/{direction}/` |
| survey | 文献综述/清单（FULL_REFERENCE_LIST, LITERATURE_LANDSCAPE 等）| `raw/sources/survey/` |
| survey | 新颖性卷宗（NOVELTY_DOSSIER, NOVELTY_CHECK, NOVELTY_REVIEW 等）| `raw/sources/survey/{direction}/` |
| survey | 方向调研报告（DIRECTION_*_SURVEY, DIRECTION_*_REPORT 等）| `raw/sources/survey/{direction}/` |
| survey | 逆向综合策略文档（INVERSE_STRATEGY, INVERSE_BASELINE 等）| `raw/sources/survey/{direction}/` |
| survey | reading_navigation_pack / zotero-reading-queue | `raw/sources/survey/` |
| survey | 技术提案（TECHNICAL_PROPOSAL 等）| `raw/sources/survey/{direction}/` |
| survey | 已被 wiki source 页引用的文件 | `raw/sources/survey/` |
| image | .jpeg / .png / .jpg | `raw/assets/` |

## 导入黑名单（❌ 禁止）

| 文件名模式 | 原因 |
|-----------|------|
| `EXPERIMENT_TRACKER.md` | 纯状态追踪，时效性极短 |
| `EXPERIMENT_PLAN.md` | 项目内部实验定义，高度绑定 |
| `FINAL_PROPOSAL.md` | 与 IDEA_REPORT 重复的阶段性提案 |
| `PHASE34_REVIEW_REPORT.md` | 与 NOVELTY_DOSSIER 重复 + 含 MCP 状态 |
| `*_2026????_??????.md`（有同名无时间戳版本时） | 时间戳备份副本，保留 canonical 版本 |
| `CLAUDE.md` | 项目配置文件，非知识素材 |
| `_SUPERSEDED.md` | 已废弃文档 |
| `paper-stage/` 整个目录 | 写作过程文件（草稿/实验协议/runbook），非调研素材 |
| 顶层 `IDEA_REPORT.md`（与子方向同名的） | 保留子方向版本 |
| `Thumbs.db` / `@eaDir/` | Synology 元数据 |
| 空图片目录 | 无实际图片 |

## 操作反例（不要做什么）

| # | 反模式 | 后果 | 正确做法 |
|---|--------|------|---------|
| 1 | 用 `mv` 移动源文件 | 源端文件丢失，无法重新同步 | 默认用 `cp`；用户明确说"移动"时才用 `mv` |
| 2 | 无差别全量搬入 idea-stage | paper-stage/、EXPERIMENT_TRACKER 等过程管理文件污染 wiki | 逐文件对照黑名单过滤 |
| 3 | 不重写图片引用就迁移 .md | 图片链接断裂，wiki 无法渲染 | 每个 .md 迁移前必须重写图片路径 |
| 4 | 不验证图片引用完整性 | 静默产生断裂引用，后续无法发现 | 迁移后全量验证 ../../assets/ 引用 |
| 5 | 在 `raw/sources/` 外创建文件 | 破坏 wiki 目录约定 | 只写 `raw/assets/` 和 `raw/sources/{paper,notes,survey}/` |
| 6 | 重复迁移同名文件 | 覆盖之前可能修改过的版本 | 目标已存在→比较内容→一致则跳过/不同则报告冲突 |
| 7 | 不解码 URL 编码（%20） | 文件名含 %20 导致图片引用断裂 | 重写时自动 decode URL 编码 |

## 路径重写规则

所有 .md 中的图片引用统一重写为 `../../assets/{filename}`：

| 原路径模式 | 新路径 | 正则 |
|-----------|-------|------|
| `images/{key}/xxx.jpeg` | `../../assets/xxx.jpeg` | `s|(!\[[^\]]*\]\()(?:\.\./)?images/[^/]+/([^\)]+)\)|\1../../assets/\2)|` |
| `../images/{key}/xxx.jpeg` | `../../assets/xxx.jpeg` | 同上（已含 ../ 前缀也匹配）|
| `xxx.jpeg`（裸文件名）| `../../assets/xxx.jpeg` | `s|(!\[[^\]]*\]\()([^\)]*\.(?:jpeg\|jpg\|png\|gif))\)|\1../../assets/\2)|` |
| `%20` 编码 | 解码为空格 | `from urllib.parse import unquote` |

重写后必须验证：`os.path.exists(raw/assets/{filename})`，报告 OK/broken 数。

## 执行流程

### 1. 定位

- 源项目：当前工作目录或用户指定
- Wiki 项目：用户指定，或向上查找含 `raw/` + `wiki/` 的目录
- **🔴 CHECKPOINT：定位后向用户确认源项目和 wiki 路径**

如果 wiki 根找不到 → **报错退出**："当前目录不在 llm-wiki 项目内，请指定 wiki 路径"

### 2. 扫描

按以下顺序扫描源路径（存在则处理，不存在则跳过）：

```
{project}/notes/papers/sources/*.md      → paper
{project}/notes/papers/images/{key}/     → assets
{project}/notes/papers/*.md              → notes
{project}/raw/paper/sources/*.md         → paper
{project}/raw/paper/images/{key}/        → assets
{project}/raw/paper/*.md                 → notes
{project}/idea-stage/**/*.md             → survey（按黑名单过滤）
{project}/autoModel/raw/paper/sources/*.md  → paper
{project}/autoModel/raw/paper/images/{key}/ → assets
{project}/autoModel/raw/paper/*.md       → notes
{project}/autoModel/paper_Read/**/*.md   → notes
{project}/autoModel/idea-stage/**/*.md   → survey（按黑名单过滤）
```

**扫描零文件 → 报错**："源项目下未找到任何 paper/notes/survey 素材，请检查项目路径"

### 3. 过滤

逐文件对照黑名单，分为"允许"和"跳过"两组。

**🔴 CHECKPOINT：向用户展示跳过列表，确认后再继续**

如果用户说"也迁移这些"→ 将该文件从跳过组移到允许组。

### 4. 去重

同一文件名在多个源路径存在时：
- 内容一致 → 只迁移一份，报告"去重"
- 内容不同 → **报告冲突，暂停该文件迁移**，让用户决定保留哪个

### 5. 迁移

1. `cp` 图片 → `raw/assets/`（平铺，跳过 Thumbs.db/@eaDir）
2. `cp` .md → 对应 `raw/sources/{type}/`
3. 重写所有图片引用（按上方正则）
4. 解码 URL 编码（%20 → 空格）

目标已存在时：
- 内容一致 → 跳过
- 内容不同 → **报告冲突，不覆盖**

### 6. 验证

全量检查所有 `../../assets/` 引用指向的文件是否存在。

**broken > 0 → 报告断裂清单 + 建议从 Zotero 补齐缺失图片**

### 7. 报告

```
同步完成：
  raw/assets/         : {N} 张图片
  raw/sources/paper/  : {M1} 个
  raw/sources/notes/  : {M2} 个 ({R} img refs rewritten)
  raw/sources/survey/ : {M3} 个
  跳过（黑名单）     : {列表}
  跳过（已存在）     : {列表}
  去重合并           : {列表}
  冲突（暂停）       : {列表}
  图片引用           : {OK} OK / {broken} broken
```

## 失败模式 Fallback 表

| 触发条件 | 一线修复 | 仍失败兜底 |
|---------|---------|-----------|
| wiki 根找不到 | 向上多查一层目录 | 报错退出，请用户指定 |
| 扫描零文件 | 检查是否在正确项目目录 | 报错退出，列出已扫描的路径 |
| 目标文件冲突 | 比较 md5sum | 报告两个源路径，用户选择 |
| 图片引用断裂 | 查 Zotero 同名图片补入 assets/ | 标注"需手动修正" |
| URL 编码未解码 | 重写时自动 unquote | 手动 sed 替换 %20 |
| 源文件为空（0 byte）| 跳过并报告 | 不迁移空文件 |

## 默认行为

- `cp`（复制），保留源文件。用户明确要求"移动"时用 `mv`
- 跳过空目录和 Synology 元数据
