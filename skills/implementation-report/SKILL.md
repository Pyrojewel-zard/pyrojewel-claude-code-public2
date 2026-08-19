---
name: implementation-report
description: Use when a project has planning files and code and the user needs an implementation-status report, a workflow diagram, a plan-to-code map, or a progress summary for a Beamer or group-meeting deck.
---

# Implementation Report

Produce a concise, evidence-aware report that connects the project plan to the
current code state. The output is reusable by `beamer-academic`, weekly reports,
and implementation reviews.

## Core rule

Read the plan before reading code. Treat planning files as the intended work and
the repository as the observed implementation. Do not turn a directory listing
or a code dump into a progress report.

## Workflow

### 1. Locate and read the plan

Read every existing file in this order:

1. `task_plan.md`
2. `findings.md`
3. `progress.md`
4. `outline.md` when the report is for a paper or presentation
5. `.planning/.active_plan`
6. `.planning/*/task_plan.md`, `.planning/*/findings.md`, and
   `.planning/*/progress.md`

Also read any path explicitly supplied by the user. Do not modify these source
files. If none exist, record `no_plan_found` and ask whether to reconstruct a
plan from the repository; never silently invent planned work.

Start the report with:

```text
目标 → 已完成 → 进行中 → 阻塞/未知 → 下一步
```

### 2. Inspect the implementation selectively

Use `rg --files` to inventory likely source files, then inspect only the files
that correspond to plan steps, entry points, tests, configs, and recent outputs.
For each plan step, locate the smallest useful implementation unit:

| Required field | Meaning |
|---|---|
| `plan_step` | Exact plan item or a clearly marked inferred item |
| `code_path` | Relative file path and line/function/symbol |
| `input_output` | What enters and leaves the unit |
| `status` | `complete`, `partial`, `blocked`, `not-started`, or `unknown` |
| `evidence` | Test, run, figure, log, or `none` |
| `next_action` | The smallest next verification or implementation step |

If a plan step has no code match, say `no implementation match`. If code exists
without a plan step, say `unplanned implementation` and do not call it complete.

### 3. Build the implementation chain

Write the causal path, not a file tree:

```text
research question → planned task → code entry → input/output → run or test
→ evidence → current boundary → next action
```

Every code excerpt or code reference must be attached to one node in this
chain. A code block may not appear without its plan step, status, and evidence.
Show at most 8--16 lines of code in a slide-facing report; link the full file.

### 4. Generate the workflow diagram

Use Mermaid as the semantic source for exact project workflows, plan-to-code
maps, dependency graphs, and feedback loops. Put the source in `workflow.mmd`,
then invoke the local `diagram-design` skill to redraw it as a slide-sized
editorial diagram. Mermaid's automatic coordinates and styling are not the
final visual output. Read `references/workflow-diagram-contract.md` and
`references/diagram-design-profile.md` before writing the diagram; also load
the selected upstream `diagram-design` type reference.

The default visual language is the supplied reference: white canvas, black or
dark-gray strokes, serif labels, rectangular modules, dashed grouping boxes,
orthogonal arrows, compact labels, and only the feedback loops that explain
iteration. Keep the diagram structural and legible at slide size.

Use `diagram-design`'s flowchart/process/data-flow type references and its
four dials: `format`, `size`, `detail`, and `audience`. For a Beamer handoff,
the canonical visual asset is `workflow.png` at `slide-16x9` (or `slide-4x3`)
with a stated detail level and audience. Keep `workflow.html` as the
self-contained visual source when generated, and optionally export SVG.
Use Graphviz or TikZ only when the local diagram skill cannot express the
required geometry. Use `imagegen` only for conceptual or physical-mechanism
illustrations where exact file names, formulas, code, and evidence are not
required. Label generated illustrations `AI示意图`; never use them as the
source of a code topology or experimental result.

### 5. Write the reusable outputs

Unless the user specifies another location, write the report bundle under
`materials/implementation-report/`:

- `manifest.yaml` — active-report pointer and bundle metadata
- `implementation-report.md` — status table, evidence boundary, and next actions
- `workflow.mmd` — editable Mermaid source
- `workflow.html` — self-contained diagram-design source
- `workflow.png` — canonical slide asset; optional `workflow.svg` may accompany it

Do not overwrite an existing report silently; use a versioned sibling and update
`manifest.yaml`, or ask which report is current. Keep source paths relative or
environment-based. The active pointer must follow this shape:

```yaml
report: implementation-report.md
workflow_source: workflow.mmd
visual_source: workflow.html
workflow_figure: workflow.png
diagram_skill: diagram-design
format: html+png
size: slide-16x9
detail: balanced
audience: mixed
status: draft
```

The Markdown report must contain:

```markdown
---
status: draft
report_type: implementation-report
plan_source: task_plan.md
diagram_source: workflow.mmd
diagram_engine: mermaid
visual_source: workflow.html
figure: workflow.png
---

# Implementation status

## One-sentence state

## Workflow

![Implementation workflow](workflow.png)

## Plan-to-code map

| Plan step | Code entry | Input → output | Status | Evidence | Next action |
|---|---|---|---|---|---|

## Current boundary

## Open questions and blockers

## Next verification
```

### 6. Handoff to Beamer

When `beamer-academic` consumes this report:

1. Read `manifest.yaml`, then follow its report/source/figure paths.
2. Put the workflow overview before code excerpts or code-status pages.
3. Keep code paired with its plan step, input/output, status, evidence, and next action.
4. Label unknown, inferred, and unverified claims explicitly.

Do not make `beamer-academic` re-analyze the project if this report bundle is
available and current.

## Quality checks

- The plan was read before code inspection.
- Every code reference maps to a plan step or is marked unplanned.
- Every status has evidence or explicitly says `none`/`unknown`.
- The workflow has a Mermaid source file, even when a rendered asset is also present.
- The diagram is readable in black and white and contains no decorative code dump.
- No generated image is presented as exact implementation or measured evidence.

## Common failure modes

| Failure | Correction |
|---|---|
| Starting from the code tree | Re-read the plan and rebuild the chain |
| Showing code before the workflow | Insert `workflow-overview` first |
| Calling a file “implemented” because it exists | Require a plan match plus evidence |
| Using imagegen for file names or formulas | Use Mermaid/TikZ and preserve exact text |
| Treating missing logs as failure | Mark `unknown` and define the next verification |

## Reference

- `references/workflow-diagram-contract.md` — Mermaid template, style, rendering, and validation rules
