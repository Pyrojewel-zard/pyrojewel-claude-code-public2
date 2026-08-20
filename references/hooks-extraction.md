# Hook Extraction Reference

All hooks copied from ECC `scripts/hooks/` on 2026-06-01.
ECC repo: `<source-repos-root>/ECC/`

## Extracted Hooks

| Source File | Target File | Event | Adaptation Needed |
|-------------|-------------|-------|-------------------|
| `session-start.js` | `hooks/session-start.js` | SessionStart | DONE: removed instincts/learned injection, kept session summary + project detection |
| `session-end.js` | `hooks/session-end.js` | Stop | DONE: added Obsidian sync via `PJ_OBSIDIAN_VAULT` env var |
| `gateguard-fact-force.js` | `hooks/gateguard-fact-force.js` | PreToolUse | Add Python import check (ECC only checks JS imports) |
| `config-protection.js` | `hooks/config-protection.js` | PreToolUse | Add Python config files: pyproject.toml, setup.cfg, conda-lock.yml, .pre-commit-config.yaml |
| `post-edit-accumulator.js` | `hooks/post-edit-accumulator.js` | PostToolUse | DONE: changed JS/TS ext filter to `.pyi?$`, updated comments |
| `stop-format-typecheck.js` | `hooks/stop-format-typecheck.js` | Stop | DONE: replaced Biome/Prettier/tsc with `ruff format` + `ruff check`, updated `lib/resolve-formatter.js` |
| `ecc-context-monitor.js` | `hooks/ecc-context-monitor.js` | PostToolUse | Adjust cost thresholds for API pricing |
| `cost-tracker.js` | `hooks/cost-tracker.js` | PostToolUse | No change needed |
| `desktop-notify.js` | `hooks/desktop-notify.js` | Notification/Stop | Already in use, no change |
| `pre-compact.js` | `hooks/pre-compact.js` | PreCompact | No change needed |
| `evaluate-session.js` | `hooks/evaluate-session.js` | Stop | No change needed |

## Shared Dependency

| Source | Target | Notes |
|--------|--------|-------|
| `scripts/lib/` | `hooks/lib/` | Required by all hooks (utils, logger, constants) |

## Hooks NOT Extracted (and why)

| ECC Hook | Reason |
|----------|--------|
| `bash-dispatcher.js` | My Bash is mainly ssh + python, no tmux/git-push automation needed |
| `observe:continuous-learning.js` | Overkill; ARIS research-wiki covers knowledge capture |
| `quality-gate.js` | Covered by ruff format + check |
| `design-quality-check.js` | No frontend work |
| `console-warn.js` | Python doesn't need console.log checks |
| `governance-capture.js` | Too heavy for personal use |
| `check-console-log.js` | Same as console-warn |
| `suggest-compact.js` | Already deleted in prior cleanup |

## Adaptation TODO

- [x] `session-start.js`: Strip instincts/learned sections, keep session summary + project detection
- [x] `session-end.js`: Add Obsidian sync (write session file to Obsidian vault via PJ_OBSIDIAN_VAULT)
- [x] `stop-format-typecheck.js`: Replace Biome/Prettier/tsc with ruff format + ruff check
- [x] `post-edit-accumulator.js`: Change file extension filter from JS/TS to Python
- [x] `lib/resolve-formatter.js`: Replace Biome/Prettier detection with ruff (venv-aware binary resolution)
- [x] `gateguard-fact-force.js`: Added Python import check (different gate messages for .py files)
- [x] `config-protection.js`: Added Python config file patterns (pyproject.toml, setup.cfg, conda-lock.yml, ruff.toml, etc.) + path pattern matching
- [ ] `ecc-context-monitor.js`: Adjust cost thresholds

## 2026-06-02 ECC Hook Audit

| Target | Source checked | Runtime copy present | Adaptation status | Next action |
|--------|----------------|----------------------|-------------------|-------------|
| `hooks/session-start.js` | yes (`ECC/scripts/hooks/session-start.js`) | `.claude/hooks/session-start.js` | adapted | verify by running SessionStart fixture |
| `hooks/session-end.js` | yes (`ECC/scripts/hooks/session-end.js`) | `.claude/hooks/session-end.js` | adapted | verify Obsidian env fallback |
| `hooks/gateguard-fact-force.js` | yes (`ECC/scripts/hooks/gateguard-fact-force.js`) | `.claude/hooks/gateguard-fact-force.js` | adapted | add fixture for Python import warning |
| `hooks/config-protection.js` | yes (`ECC/scripts/hooks/config-protection.js`) | `.claude/hooks/config-protection.js` | adapted | add fixture for protected Python config paths |
| `hooks/post-edit-accumulator.js` | yes (`ECC/scripts/hooks/post-edit-accumulator.js`) | `.claude/hooks/post-edit-accumulator.js` | adapted | verify `.py` accumulation only |
| `hooks/stop-format-typecheck.js` | yes (`ECC/scripts/hooks/stop-format-typecheck.js`) | `.claude/hooks/stop-format-typecheck.js` | adapted | verify ruff resolution with and without `.venv` |
| `hooks/ecc-context-monitor.js` | yes (`ECC/scripts/hooks/ecc-context-monitor.js`) | `.claude/hooks/ecc-context-monitor.js` | pending | calibrate thresholds for current API pricing |
| `hooks/cost-tracker.js` | yes (`ECC/scripts/hooks/cost-tracker.js`) | `.claude/hooks/cost-tracker.js` | copied | verify cost log path |
| `hooks/desktop-notify.js` | yes (`ECC/scripts/hooks/desktop-notify.js`) | `.claude/hooks/desktop-notify.js` | copied | verify Linux notification command |
| `hooks/pre-compact.js` | yes (`ECC/scripts/hooks/pre-compact.js`) | `.claude/hooks/pre-compact.js` | copied | verify context preservation output |
| `hooks/evaluate-session.js` | yes (`ECC/scripts/hooks/evaluate-session.js`) | `.claude/hooks/evaluate-session.js` | copied | verify report path |

Additional target-only files (not in ECC `scripts/hooks/`):
- `hooks/lib/` — 30 shared dependency files copied from `ECC/scripts/lib/`, required by all hooks
