# Superpowers

规范文档和实施计划的管理目录。

## 目录结构

```
docs/superpowers/
  README.md          ← 本文件（索引）
  plans/             ← 活跃计划
  archive/           ← 已归档计划
```

### Active Plans

| Plan | Date | Status | File |
|------|------|--------|------|
| zuhui-beammer implementation | 2026-08-15 | completed | [plans/2026-08-15-zuhui-beammer.md](plans/2026-08-15-zuhui-beammer.md) |

### Active Specs

| Spec | Date | Status | File |
|------|------|--------|------|
| zuhui-beammer design | 2026-08-15 | completed | [specs/2026-08-15-zuhui-beammer-design.md](specs/2026-08-15-zuhui-beammer-design.md) |

_No active plans._

### Archived Plans

| Plan | Date | Status | File |
|------|------|--------|------|
| Pyrojewel Paper Flow | 2026-06-01 | completed | [archive/2026-06-01-pyrojewel-paper-flow.md](archive/2026-06-01-pyrojewel-paper-flow.md) |
| Active Flow Inventory | 2026-06-02 | completed | [archive/2026-06-02-active-flow-inventory.md](archive/2026-06-02-active-flow-inventory.md) |
| ECC Adaptation Inventory | 2026-06-02 | completed | [archive/2026-06-02-ecc-adaptation-inventory.md](archive/2026-06-02-ecc-adaptation-inventory.md) |
| Skill Map Completion | 2026-06-02 | completed | [archive/2026-06-02-skill-map-completion.md](archive/2026-06-02-skill-map-completion.md) |
| Wiki Knowledge Line | 2026-06-02 | abandoned | [archive/2026-06-02-wiki-knowledge-line.md](archive/2026-06-02-wiki-knowledge-line.md) |
| Beamer Output Path | 2026-06-04 | completed | [archive/2026-06-04-beamer-output-path.md](archive/2026-06-04-beamer-output-path.md) |
| Superpowers Output Governance | 2026-06-04 | completed | [archive/2026-06-04-superpowers-output-governance.md](archive/2026-06-04-superpowers-output-governance.md) |

## 规范

- 计划文件必须有 YAML frontmatter（title, date, status）
- 归档操作通过 `tools/archive-superpowers-plan.sh` 执行
- 验证通过 `tools/verify-superpowers-index.sh` 执行
