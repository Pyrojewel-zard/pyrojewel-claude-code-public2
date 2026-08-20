---
title: Beamer Output Path
date: 2026-06-04
status: completed
completed-date: 2026-06-05
---

# pyrojewel-beamer-academic Output Path 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 pyrojewel-beamer-academic 增加 output path 参数支持，默认输出到 Obsidian 周会文件夹，同时支持用户显式指定路径。不改变 LaTeX 视觉风格。

**Architecture:** SKILL.md 行为指令更新 + config.yaml 新增 output 节 + compile.sh 接受 `--output-dir` 参数。路径解析纯靠环境变量，不硬编码绝对路径。

**Tech Stack:** Claude Code skill (SKILL.md YAML frontmatter + 行为指令), Bash (compile.sh), YAML (config.yaml)

---

## File Structure

```
skills/pyrojewel-beamer-academic/
  SKILL.md                     ← 修改：新增 output path 行为规范 + precedence 规则
  assets/config.yaml           ← 修改：新增 output 节
  scripts/compile.sh           ← 修改：新增 --output-dir 参数 + 路径解析逻辑
  references/output-path.md    ← 新建：路径解析规则独立参考文档
```

---

## Constants & Conventions

环境变量（与 SETUP.md 一致，不硬编码绝对路径）：

```
OBSIDIAN_VAULT_ROOT = $OBSIDIAN_VAULT_ROOT   # Obsidian vault 根路径
WEEKLY_MEETING_REL  = 08-Daily/WeeklyMeetings # 周会文件夹相对路径（vault 内）
OUTPUT_DIR_FALLBACK = ./outputs               # 无 vault 时的本地 fallback
```

周会文件夹命名规则：

```
{OBSIDIAN_VAULT_ROOT}/{WEEKLY_MEETING_REL}/{YYYY}/W{WW}/
```

- `YYYY` = ISO 年（`date +%G`）
- `WW` = ISO 周号（`date +%V`）
- 示例：`/vault/08-Daily/WeeklyMeetings/2026/W23/`
- 路径不存在时自动 `mkdir -p`

---

## Output Path Precedence（核心规则）

```
1. 用户显式路径（最高优先）
   → 技能调用时用户提供 output_path 参数
   → 直接使用，不做二次解析

2. Obsidian 周会默认（中优先）
   → OBSIDIAN_VAULT_ROOT 已设置
   → 解析为 {OBSIDIAN_VAULT_ROOT}/{WEEKLY_MEETING_REL}/{YYYY}/W{WW}/
   → 路径不存在则创建

3. 本地 fallback（最低优先）
   → OBSIDIAN_VAULT_ROOT 未设置
   → 使用 {skill_root}/outputs/ 目录
   → 输出前提示用户："未检测到 OBSIDIAN_VAULT_ROOT，输出到本地 outputs/"

4. 阻断（极端情况）
   → 用户显式路径不可写（权限/磁盘满）
   → 报错并停止，不静默 fallback
```

---

## Task 1: 更新 SKILL.md — 增加 output path 行为规范

**Files:**
- Modify: `skills/pyrojewel-beamer-academic/SKILL.md`

- [ ] **Step 1: 在 frontmatter description 中补充 output path 提示**

在 `description` 字段末尾追加说明，表示支持 output_path 参数：

```yaml
description: >
  学术报告 Beamer 幻灯片生成器（组会/研讨会/会议/答辩，非商业演示）。双色调配色+横条frametitle+多图网格。
  支持 output_path 参数指定输出目录；未指定时默认输出到 Obsidian 周会文件夹。
```

- [ ] **Step 2: 在 Section 1 工作流程中增加输出路径决策步骤**

在步骤 6（编译输出）之前，插入路径决策步骤：

```markdown
5.5. **输出路径决策** → 确定 PDF/tex 输出目录
   - 用户提供 `output_path` → 使用该路径
   - 未提供 → 检测 `$OBSIDIAN_VAULT_ROOT`
     - 已设置 → `{OBSIDIAN_VAULT_ROOT}/08-Daily/WeeklyMeetings/{YYYY}/W{WW}/`
     - 未设置 → `{skill_root}/outputs/`，提示用户
   - 路径不存在 → `mkdir -p` 创建
```

- [ ] **Step 3: 在 Section 8 编译说明中补充 --output-dir 用法**

```markdown
## 8. 编译说明

```bash
# 默认输出（当前目录）
xelatex presentation.tex
xelatex presentation.tex

# 指定输出目录
./scripts/compile.sh presentation.tex --full --output-dir /path/to/output
```
```

- [ ] **Step 4: 新增 Section 10 — Output Path 规范**

```markdown
## 10. 输出路径规范

### Precedence

| 优先级 | 来源 | 路径 |
|--------|------|------|
| 1 | 用户显式指定 | `output_path` 参数值 |
| 2 | Obsidian 周会默认 | `$OBSIDIAN_VAULT_ROOT/08-Daily/WeeklyMeetings/{YYYY}/W{WW}/` |
| 3 | 本地 fallback | `{skill_root}/outputs/` |

### 周会文件夹命名

格式：`{YYYY}/W{WW}/`，使用 ISO 周（`date +%G-W%V`）。

示例：2026年第23周 → `2026/W23/`

### 环境变量

- `OBSIDIAN_VAULT_ROOT`：Obsidian vault 根路径（必需，用于默认输出）
- 未设置时降级到 `outputs/` 目录并提示用户

### 产出文件

输出目录下生成：
- `presentation.tex` — LaTeX 源码
- `presentation.pdf` — 编译后 PDF
- `beamerthemeAcademic.sty` — 主题文件（编译需要，自动复制）
- `materials/figures/` — 图片资产（如有）
```

---

## Task 2: 更新 config.yaml — 新增 output 节

**Files:**
- Modify: `skills/pyrojewel-beamer-academic/assets/config.yaml`

- [ ] **Step 1: 在 `figure_paths` 之后新增 `output` 节**

```yaml
# ---------- Output Path ----------
output:
  # Precedence: explicit user path > obsidian weekly > local fallback
  # When "default", uses OBSIDIAN_VAULT_ROOT-based weekly meeting folder
  path: "default"
  # Relative path inside OBSIDIAN_VAULT_ROOT for weekly meeting folders
  weekly_meeting_rel: "08-Daily/WeeklyMeetings"
  # Weekly folder format: {YYYY}/W{WW}/ using ISO week
  weekly_format: "%G/W%V"
  # Fallback directory when OBSIDIAN_VAULT_ROOT is not set
  fallback_dir: "outputs"
```

---

## Task 3: 更新 compile.sh — 支持 --output-dir

**Files:**
- Modify: `skills/pyrojewel-beamer-academic/scripts/compile.sh`

- [ ] **Step 1: 新增 --output-dir 参数解析**

在 `FULL_BUILD` 变量声明后新增：

```bash
OUTPUT_DIR=""

# Parse --output-dir
for arg in "$@"; do
  case "$arg" in
    --output-dir=*)
      OUTPUT_DIR="${arg#--output-dir=}"
      ;;
    --output-dir)
      # Next arg is the value (handled in next iteration via shift pattern)
      ;;
  esac
done
```

更简洁的方式——替换现有参数解析为循环：

```bash
TEXFILE=""
FULL_BUILD=false
OUTPUT_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --full)      FULL_BUILD=true; shift ;;
    --output-dir) OUTPUT_DIR="$2"; shift 2 ;;
    --output-dir=*) OUTPUT_DIR="${1#--output-dir=}"; shift ;;
    -*)          echo "Unknown option: $1"; exit 1 ;;
    *)           TEXFILE="$1"; shift ;;
  esac
done
```

- [ ] **Step 2: 新增 resolve_output_dir 函数**

在 `detect_cjk_font_block` 函数之后：

```bash
resolve_output_dir() {
  local explicit_dir="${1:-}"
  local skill_root="${2:-}"

  # Priority 1: explicit user path
  if [[ -n "$explicit_dir" ]]; then
    mkdir -p "$explicit_dir"
    echo "$explicit_dir"
    return
  fi

  # Priority 2: OBSIDIAN_VAULT_ROOT weekly meeting folder
  if [[ -n "${OBSIDIAN_VAULT_ROOT:-}" && -d "$OBSIDIAN_VAULT_ROOT" ]]; then
    local weekly_rel="08-Daily/WeeklyMeetings"
    local iso_week
    iso_week=$(date +"%G/W%V")
    local target="$OBSIDIAN_VAULT_ROOT/$weekly_rel/$iso_week"
    mkdir -p "$target"
    echo "$target"
    return
  fi

  # Priority 3: local fallback
  local fallback="$skill_root/outputs"
  mkdir -p "$fallback"
  echo "WARNING: OBSIDIAN_VAULT_ROOT not set; output to $fallback" >&2
  echo "$fallback"
}
```

- [ ] **Step 3: 修改 compile_pass 使用 --output-directory**

将 `compile_pass` 中的 `-output-directory="$DIRNAME"` 替换为使用解析后的输出目录：

```bash
RESOLVED_OUTPUT_DIR=$(resolve_output_dir "$OUTPUT_DIR" "$SKILL_ROOT")

compile_pass() {
  local pass_num=$1
  echo "  Pass $pass_num..."
  xelatex -interaction=nonstopmode \
    -halt-on-error \
    -output-directory="$RESOLVED_OUTPUT_DIR" \
    "$TEXFILE" 2>&1 | tail -5
}
```

- [ ] **Step 4: 更新 asset copy 和 verify 逻辑**

编译前将 .sty 复制到 `RESOLVED_OUTPUT_DIR`：

```bash
if [[ ! -f "$RESOLVED_OUTPUT_DIR/beamerthemeAcademic.sty" ]]; then
  cp "$SKILL_ROOT/assets/beamerthemeAcademic.sty" "$RESOLVED_OUTPUT_DIR/"
  echo "  Copied beamerthemeAcademic.sty"
fi
```

验证步骤中检查 `$RESOLVED_OUTPUT_DIR/${BASENAME}.pdf`：

```bash
if [[ -f "$RESOLVED_OUTPUT_DIR/${BASENAME}.pdf" ]]; then
  pdf_size=$(stat -c%s "$RESOLVED_OUTPUT_DIR/${BASENAME}.pdf" 2>/dev/null || echo "0")
  echo "=== SUCCESS: $RESOLVED_OUTPUT_DIR/${BASENAME}.pdf (${pdf_size} bytes) ==="
fi
```

---

## Task 4: 新建 references/output-path.md

**Files:**
- Create: `skills/pyrojewel-beamer-academic/references/output-path.md`

- [ ] **Step 1: 创建路径解析规则参考文档**

```markdown
# Output Path Resolution

## Precedence

1. **Explicit user path** — highest priority, used as-is
2. **Obsidian weekly meeting** — `$OBSIDIAN_VAULT_ROOT/08-Daily/WeeklyMeetings/{YYYY}/W{WW}/`
3. **Local fallback** — `{skill_root}/outputs/`

## Weekly Meeting Folder Convention

Format: `{YYYY}/W{WW}/` (ISO week)

Shell: `date +"%G/W%V"`

Example path: `$OBSIDIAN_VAULT_ROOT/08-Daily/WeeklyMeetings/2026/W23/`

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `OBSIDIAN_VAULT_ROOT` | No (default path needs it) | Obsidian vault root |
| `WEEKLY_MEETING_REL` | No | Override weekly meeting relative path (default: `08-Daily/WeeklyMeetings`) |

## Integration Points

- `compile.sh --output-dir <path>` — explicit output directory
- `config.yaml output.path` — default "default" means auto-resolve
- `SKILL.md Section 10` — behavior specification for Claude Code agent
- `pyrojewel-paper-flow Phase 6` — can pass `output_path` to beamer skill
```

---

## Task 5: 更新 pyrojewel-paper-flow Phase 6 — 传递 output_path

**Files:**
- Modify: `skills/pyrojewel-paper-flow/SKILL.md`

- [ ] **Step 1: 在 Phase 6 输出约定中补充 output_path 传递**

在 Phase 6 的输出约定部分，增加说明：

```markdown
**输出路径约定**：
- 如果 paper-flow 调用时用户指定了 `output_path`，传递给 `/pyrojewel-beamer-academic`
- 如果未指定，beamer skill 自行按 precedence 规则解析（默认 Obsidian 周会文件夹）
```

---

## Verification Steps

These verify the plan was implemented correctly without requiring a real private vault.

- [ ] **V1: SKILL.md Section 10 存在且 precedence 表完整**

```bash
grep -A 10 "输出路径规范" skills/pyrojewel-beamer-academic/SKILL.md
```

- [ ] **V2: config.yaml output 节存在且含 weekly_meeting_rel**

```bash
grep -A 8 "Output Path" skills/pyrojewel-beamer-academic/assets/config.yaml
```

- [ ] **V3: compile.sh 接受 --output-dir 参数**

```bash
skills/pyrojewel-beamer-academic/scripts/compile.sh --help 2>&1 || true
# 或
grep "output-dir" skills/pyrojewel-beamer-academic/scripts/compile.sh
```

- [ ] **V4: 路径解析逻辑不包含硬编码绝对路径**

```bash
grep -n "/home/\|/mnt/\|/Users/" skills/pyrojewel-beamer-academic/scripts/compile.sh
# 期望：无匹配
```

- [ ] **V5: 模拟 OBSIDIAN_VAULT_ROOT 未设置时 fallback**

```bash
unset OBSIDIAN_VAULT_ROOT
cd skills/pyrojewel-beamer-academic
bash -c 'source scripts/compile.sh 2>&1' || true
# 期望：WARNING 关于 OBSIDIAN_VAULT_ROOT not set
```

- [ ] **V6: 模拟 OBSIDIAN_VAULT_ROOT 设置时周会路径解析**

```bash
OBSIDIAN_VAULT_ROOT=/tmp/test_vault bash -c '
  source <(sed -n "/^resolve_output_dir/,/^}/p" skills/pyrojewel-beamer-academic/scripts/compile.sh)
  resolve_output_dir "" "$(pwd)"
'
# 期望：/tmp/test_vault/08-Daily/WeeklyMeetings/{YYYY}/W{WW}/
```

- [ ] **V7: 模拟显式路径优先级最高**

```bash
bash -c '
  source <(sed -n "/^resolve_output_dir/,/^}/p" skills/pyrojewel-beamer-academic/scripts/compile.sh)
  resolve_output_dir "/tmp/explicit" "$(pwd)"
'
# 期望：/tmp/explicit
```

- [ ] **V8: references/output-path.md 存在且内容完整**

```bash
test -f skills/pyrojewel-beamer-academic/references/output-path.md && echo "OK"
```

- [ ] **V9: paper-flow Phase 6 提及 output_path 传递**

```bash
grep "output_path" skills/pyrojewel-paper-flow/SKILL.md
```

---

## Risks & Blockers

| Risk | Impact | Mitigation |
|------|--------|-----------|
| `date +%G/%V` 在跨年周可能不符合用户预期（ISO 周规则） | Low — 极端日期路径略有偏差 | 文档注明使用 ISO 8601 周；用户可显式指定路径绕过 |
| `compile.sh` 改动可能影响现有直接调用方式 | Medium — 破坏向后兼容 | 保留原有参数格式，`--output-dir` 为可选参数，不传则行为不变（输出到 .tex 所在目录） |
| OBSIDIAN_VAULT_ROOT 路径存在但周会子路径结构不同 | Low — mkdir -p 创建了错误目录 | 仅在路径不存在时 mkdir；文档建议用户确认 vault 结构 |
| paper-flow 调用 beamer 时未传 output_path | Low — beamer 自行按 precedence 解析 | 这是预期行为，不需要传递也算正确 |

---

## Scope Summary

- **修改文件**：3（SKILL.md, config.yaml, compile.sh）
- **新建文件**：1（references/output-path.md）
- **联动更新**：1（pyrojewel-paper-flow/SKILL.md Phase 6）
- **不修改**：.ccb/**, LaTeX 样式文件, 图片资产, 主题 .sty
- **不硬编码**：绝对路径，使用环境变量和相对路径

## Recommended Next Worker Assignment

- **实现者**：任一可执行 superpowers:executing-plans 的 worker
- **优先级**：P1 — paper-flow 闭环需要此功能才能将 PPT 自动归档到周会文件夹
- **预估工作量**：5 个 task，每个 1-3 步，约 20-30 分钟
