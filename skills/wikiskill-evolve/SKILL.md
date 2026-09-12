---
name: wikiskill-evolve
description: "Use when evolving WikiSkill from agent traces, resolving Codex/CCB session identifiers to chat transcripts, or turning complete AI troubleshooting conversations into reusable knowledge and skills."
license: MIT
metadata:
  version: "1.0.0"
  platforms: [linux, macos, windows]
  hermes:
    tags: [wikiskill, evolution, skills, paper-implementation, hermes]
    homepage: https://github.com/ashutoshsinghpr7/wikiskill
---

# WikiSkill Evolve

Run Google's WikiSkill evolution loop (arXiv:2608.27454) — a faithful
implementation with Hermes as the reference backend. The agent evolves its own
skills: raw sessions → a maintainer distills failure patterns into a
persistent wiki → a proposer writes a candidate skill → a validation gate
accepts it **only if** `R_val > R_best` (git rollback otherwise).

## When to use

- You want an agent's own experience (traces) turned into reusable skills
- You want to test whether a candidate skill actually helps, with statistics
  instead of vibes
- You're running the paper's protocol on your own tasks
- You need to resolve a Codex/CCB session identifier before reading or
  summarizing the complete AI troubleshooting record

## Install

```bash
pip install wikiskill          # Python ≥ 3.10; works with Hermes, Claude Code
```

## Run the loop

```bash
wikiskill init myws                        # workspace + auto-graded bench
wikiskill evolve myws --iters 3            # train → maintain → propose → gate
wikiskill status myws                      # baseline, r_best, skill state
wikiskill compare wsA wsB --iters 5        # paired exact-binomial comparison
wikiskill transfer src dst                 # copy accepted skills to another ws
```

## Reading the output

- `runs/state.json` — `baseline` (S₀ on val), `r_best`, `next_iter`
- `wiki/log.md` — every maintenance/proposal/gate decision with evidence
- `wiki/patterns/` — distilled failure patterns (the raw material)
- `wiki/skill-impact.md` — rejected proposals stay visible (paper requirement)
- Gate verdicts: `ACCEPTED` (R_val > R_best, git commit), `REJECTED`
  (rolled back), `no_action` (proposer declined — a valid outcome)

## Backends

```bash
wikiskill init myws --backend claude       # Claude Code as the worker
wikiskill init myws --backend codex        # Codex as the worker
```

Hermes is the reference backend; the installed CLI also supports Claude Code,
Codex, and Copilot. Use `wikiskill --help` to confirm the local backend set.
All speak open SKILL.md, so evolved skills transfer.

## Honest-expectation notes

- Each iteration costs ~$0.09 on free-tier models (gemini-lite class) —
  turn budgets and `--max-turns` bound the spend
- A weak model may produce `no_action` iterations — that's the gate working,
  not a failure; skill accumulation needs a reasonably strong proposer
- The gate has rejected harmful skills in live runs — a rejection is a win

## Analyze a Codex/CCB chat record

When the user provides a session, thread, or conversation ID and wants the
complete troubleshooting process summarized, use this mode:

1. Resolve the exact identifier to exactly one transcript with the bundled
   resolver below.
2. Read or search that JSONL selectively. Keep it read-only evidence; never
   substitute a marker, index, or watcher log.
3. Summarize in this order: objective and symptoms → timeline of checks and
   observations → hypotheses and evidence → root cause → fix and verification
   → unresolved questions and reusable patterns.
4. If persistence is requested, write reusable findings to the WikiSkill
   `wiki/patterns/` layer. Keep raw transcripts immutable.

### Resolve the transcript

For the active cc-switch installation:

```bash
python3 "$HOME/.cc-switch/skills/wikiskill-evolve/scripts/find_codex_session_path.py" <session-id>
```

If the skill is installed elsewhere, use that installation's
`scripts/find_codex_session_path.py`. For non-default roots, repeat the
relevant option:

```bash
python3 "$HOME/.cc-switch/skills/wikiskill-evolve/scripts/find_codex_session_path.py" \
  <session-id> --root /path/to/codex-home --project-root /path/to/project
```

Use `--json` for a machine-readable `matches` array:

```bash
python3 "$HOME/.cc-switch/skills/wikiskill-evolve/scripts/find_codex_session_path.py" \
  <session-id> --json
```

Native Codex IDs are accepted only when a candidate starts with
`type=session_meta` and its payload ID equals the requested ID. CCB IDs are
resolved through binding metadata, project markers, or watcher state and are
then checked against an existing transcript. Return one path only: exit `0`
for one match, `1` for not found, and `2` for ambiguity. Never choose by
modification time, title, or filename suffix.

The resolver is read-only and inspects only the first native JSONL record for
identity validation. Do not report `session_index.jsonl`, CCB markers,
watcher audit logs, or diagnostic logs as the transcript.

## Import boundary

`wikiskill evolve` expects a benchmark workspace with `tasks.json`, graders,
and traces under `raw/traces/`. A standalone ChatGPT/Codex export is not a
benchmark task by itself. For summary-only work, use the mode above; for
evolution, preserve the export as a trace and add the required task metadata
before running `maintain` or `evolve`.
