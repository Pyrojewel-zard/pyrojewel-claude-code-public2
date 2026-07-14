# Output Path Resolution

## Precedence

1. **Explicit user path** — highest priority, used as-is
2. **Obsidian weekly folder** — `$OBSIDIAN_VAULT_ROOT/weekly/{YYYY}_W{WW}/`
3. **Local fallback** — `.tex` source-file directory

## Weekly Folder Convention

Format: `{YYYY}_W{WW}/` (ISO week, underscore separator)

Shell: `date +"%G_W%V"`

Example path: `$OBSIDIAN_VAULT_ROOT/weekly/2026_W27/`

## Weekly Append Mode (v2.6)

When outputting to the Obsidian weekly meeting directory, files use **Monday's date** as the filename instead of a fixed name:

```
{weekly_dir}/
  ├── {MONDAY}.md          ← weekly markdown (append-only)
  ├── {MONDAY}_beamer.tex  ← beamer source (regenerated each append)
  └── {MONDAY}_beamer.pdf  ← compiled beamer PDF
```

**Monday calculation**: `date -d "this Monday" +"%Y-%m-%d"`

**Markdown rules**:
- First append of the week → create with header `# 周会记录 — {MONDAY} 周（W{XX}）`
- Subsequent appends → add `## {timestamp}` block + content + `---` separator
- Never overwrite existing content

**Beamer rules**:
- Regenerate the full .tex from the accumulated markdown on every append
- Recompile via `compile.sh {MONDAY}_beamer.tex --full --output-dir {weekly_dir}`
- The beamer covers all topics accumulated so far in the week

**Helper script**: `scripts/weekly_append.sh "content" --compile`

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `OBSIDIAN_VAULT_ROOT` | No (default path needs it) | Obsidian vault root |
| `WEEKLY_MEETING_REL` | No | Override weekly folder relative path (default: `weekly`) |

## Integration Points

- `compile.sh --output-dir <path>` — explicit output directory
- `config.yaml output.path` — default "default" means auto-resolve
- `SKILL.md Section 10` — behavior specification for Claude Code agent
- `pyrojewel-paper-flow Phase 6` — can pass `output_path` to beamer skill

When `OBSIDIAN_VAULT_ROOT` is not set and no explicit output path is provided,
`compile.sh` writes the PDF/log next to the source `.tex` file. This preserves
direct compile-script behavior for local/manual use.
