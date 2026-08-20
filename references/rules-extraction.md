# Rule Extraction Reference

All rules copied from ECC `rules/` on 2026-06-01.
ECC repo: `<source-repos-root>/ECC/`

## Extracted Rules

| Source | Target | Purpose |
|--------|--------|---------|
| `rules/python/*.md` | `rules/python/` | Python coding standards, pytest, ruff, typing |
| `rules/common/performance.md` | `rules/common/performance.md` | Model selection strategy |
| `rules/common/security.md` | `rules/common/security.md` | Security best practices |
| `rules/common/coding-style.md` | `rules/common/coding-style.md` | General coding style |
| `rules/zh/*.md` | `rules/zh/` | Chinese language rules |

## Rules NOT Extracted (and why)

| ECC Rule | Reason |
|----------|--------|
| `rules/typescript/` | No TypeScript work |
| `rules/web/` | No web frontend work |
| `rules/react/` | No React work |
| `rules/docker/` | Not using Docker directly |

## 2026-06-02 Rule Audit

| Rule group | Target files | Source checked | Status | Next action |
|------------|--------------|----------------|--------|-------------|
| Python | `rules/python/*.md` (6 files: coding-style, fastapi, hooks, patterns, security, testing) | yes (`ECC/rules/python/`) | copied | verify no TypeScript-only assumptions remain |
| Common | `rules/common/*.md` (3 files: coding-style, performance, security) | yes (`ECC/rules/common/`) | copied | verify model/performance guidance matches current setup |
| Chinese | `rules/zh/*.md` (11 files: README + 10 topic rules) | yes (`ECC/rules/zh/`) | copied | verify wording fits current workflow |

Note: ECC `rules/common/` has 9 files (agents, code-review, coding-style, development-workflow, git-workflow, hooks, patterns, performance, security, testing). Target only copied 3 (coding-style, performance, security). The remaining 6 common rules were not extracted — consider whether `development-workflow.md`, `git-workflow.md`, `patterns.md`, or `testing.md` would be useful.
