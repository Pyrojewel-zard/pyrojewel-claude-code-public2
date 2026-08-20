---
name: implementation-report
description: Use when a project has a plan, code, logs, experiment outputs, or implementation questions and the user needs an evidence-aware analysis, scientific visualizations, theory alignment, a workflow diagram, or a compiled academic report.
---

# Implementation Report

Use this skill as the single entry point for turning a planned implementation
into an evidence-backed research report and, when requested, a complete
visualized Beamer deliverable.

The skill owns orchestration, phase order, artifact contracts, provenance,
failure states, resumability, and compile/read-back QA. Specialist skills own
their domain methods and must be loaded at the phase where they are required.

## Modes

Select one mode from the request:

| Mode | Use when | Required output |
|---|---|---|
| `status-only` | The user asks for implementation status, plan-to-code mapping, or a progress report | Status report plus direct workflow diagram when a visual is useful |
| `full-analysis` | The user asks to run/read code, analyze results, derive theory, visualize evidence, or make slides | All phases below, including figures, data audit, theory package, diagram, Beamer, and layout QA |

If the request mentions execution, logs, metrics, results, formulas, figures,
visualization, or slides, use `full-analysis` unless the user explicitly asks
for a status-only report. If the user gives no mode and the repository already
contains a current run bundle, resume the incomplete phases instead of starting
over.

## Core rules

1. Read the plan before reading implementation code.
2. Treat the plan as intended work and the repository/run as observed work.
3. Never call a file's existence, a successful compile, or a non-crashing run
   measured evidence by itself.
4. Never invent data, identifiers, metrics, formulas, assumptions, citations,
   or completion status. Use `unknown`, `none`, or `blocked`.
5. Do not run destructive or expensive commands unless the plan explicitly
   names the command or the user authorizes it.
6. Keep observation, interpretation, and claim in separate fields.
7. Every generated figure must link to source data and a plotting script.
8. Every slide figure must preserve its natural aspect ratio.
9. A compiled PDF is provisional until its log and rendered pages are read
   back and layout defects are repaired.
10. Do not create a Mermaid source or require a Mermaid renderer. The workflow
    diagram is drawn directly by `diagram-design` from a structured brief.

## Required specialist skills

Load these skills only when the corresponding phase is reached, but treat them
as required for `full-analysis`:

- **REQUIRED SUB-SKILL:** `analyze-results` for structured numerical/result
  interpretation when the repository provides it.
- **REQUIRED SUB-SKILL:** `$nature-data` for dataset, source-data, code,
  version, FAIR, and data-availability traceability.
- **REQUIRED SUB-SKILL:** `$formula-derivation` for the theory line,
  assumptions, invariant object, derivation, and non-claims.
- **REQUIRED SUB-SKILL:** `$nature-figure` for all scientific figures. Use
  Python exclusively for drawing, previewing, exporting, and figure QA in this
  pipeline. If Python/R is not explicitly selected in the current request or
  project config, stop at its backend-selection gate and ask `Python or R?`.
- **REQUIRED SUB-SKILL:** `$diagram-design` for the workflow/process/architecture
  visual. It receives a direct structured brief, not an automatic renderer
  source.
- **REQUIRED SUB-SKILL:** `$beamer-academic` for slide composition, XeLaTeX
  compilation, and the final layout correction loop.

If a required sub-skill is unavailable, mark that phase `blocked`, preserve all
completed artifacts, and report the exact missing capability. Do not silently
replace a Nature figure with an ad-hoc chart or replace an exact workflow with
an AI illustration.

## Phase 0 — Establish the run contract

Before inspecting code, create or locate a versioned run directory and record:

- `run_id`, timestamp, git commit or `unknown`;
- selected mode and language;
- figure backend (`python` when selected by the user);
- target venue/report type if supplied;
- plan paths and explicit user-supplied paths;
- allowed run commands and resource limits;
- output directory and whether a previous run is being resumed.

Use `materials/implementation-report/<run-id>/` unless the user supplies an
output path. Never overwrite an existing run silently.

## Phase 1 — Read and normalize the plan

Read all existing planning inputs in this order:

1. `task_plan.md`
2. `findings.md`
3. `progress.md`
4. `outline.md` when presentation structure matters
5. `.planning/.active_plan`
6. `.planning/*/task_plan.md`, `.planning/*/findings.md`, and
   `.planning/*/progress.md`

Also read every path explicitly supplied by the user. Do not modify the source
planning files. Extract:

- research question and success criteria;
- exact plan steps and dependencies;
- expected inputs, outputs, commands, metrics, and figures;
- assumptions, known blockers, and next actions;
- planned theory objects or equations;
- intended presentation audience and size.

If no plan exists, write `plan_status: no_plan_found` and stop for user
direction. You may propose a reconstructed plan, but do not silently invent one.

Write `plan-analysis.md` with the original plan wording, normalized steps, and
an explicit `inferred` flag for anything not stated by the user.

## Phase 2 — Map code and run the approved implementation

Use `rg --files` to inventory likely source files, then inspect only entry
points, plan-matched modules, tests, configs, and recent outputs. For each plan
step record:

| Field | Required content |
|---|---|
| `plan_step` | Exact plan item or clearly marked inferred item |
| `code_entry` | Relative path plus function/class/symbol and line when available |
| `input_output` | Inputs, transformation, and produced artifacts |
| `status` | `complete`, `partial`, `blocked`, `not-started`, or `unknown` |
| `evidence` | Test/run/figure/log path, or `none` |
| `next_action` | Smallest next verification or implementation step |

Run only commands named by the plan or explicitly authorized by the user.
Capture the command, exit code, start/end time, environment versions, config
hashes, seed, stdout/stderr paths, and generated artifact paths. If a command
cannot run, preserve the exact error and mark the step `blocked`; do not infer
success from source inspection.

Write `code-analysis.md` and `logs/run-*.log` before proceeding.

## Phase 3 — Read and analyze results

Read the run outputs after execution, not before. Locate JSON, CSV, TSV, log,
checkpoint metadata, evaluation summaries, and existing plots. Keep raw results
unchanged and write normalized analysis to `result-analysis.md`.

When available, load `analyze-results` and require:

1. raw data table;
2. primary and secondary metrics;
3. mean ± standard deviation for repeated seeds;
4. baseline deltas and relevant uncertainty;
5. outlier or suspicious-result flags;
6. each finding split into observation, interpretation, implication, and next
   experiment;
7. a clear boundary between measured results and hypotheses.

For non-ML or non-tabular outputs, adapt the same contract to the domain:
frequency responses, circuit measurements, image metrics, runtime/memory,
trajectory data, or other structured evidence.

If no result file exists, write `result_status: no_result_found` and continue
only with phases that do not claim measured outcomes.

## Phase 4 — Audit data and provenance

Load `$nature-data` and create `data-availability.md`. Inventory every input and
output used by the analysis:

- raw dataset or measurement source;
- reused public data and citation;
- derived/processed data and transformation;
- source data behind every result figure;
- code entry point and version;
- configuration, seed, environment, and run ID;
- access restrictions, repository status, license, and unresolved identifiers.

Do not invent repository names, DOIs, accession numbers, licenses, embargoes,
ethics approvals, or access conditions. Use `unknown` and list the smallest
action needed to resolve it. Link each figure and claim to a data/provenance
record.

## Phase 5 — Align results with theory

Load `$formula-derivation` with the result-analysis, plan, relevant code
variables, existing formula notes, and an explicit target. Use a target inside
the run bundle, for example:

`materials/implementation-report/<run-id>/DERIVATION_PACKAGE.md`

The derivation must distinguish identity, proposition, approximation, and
interpretation. It must state the invariant object, assumptions, notation,
where code quantities correspond to the theory, and all boundaries/non-claims.
The allowed statuses are:

- `COHERENT AS STATED`;
- `COHERENT AFTER REFRAMING / EXTRA ASSUMPTION`;
- `NOT YET COHERENT`.

Write a short `theory-result-alignment.md` that maps derived quantities to
observed metrics. A blocked or reframed derivation is a valid output and must
not be polished into a false theorem claim.

## Phase 6 — Generate scientific figures with Python

Load `$nature-figure`. The figure contract is mandatory even when the user asks
only for a quick plot. Before writing a plot, define:

- one-sentence figure conclusion;
- evidence role of each panel;
- data/provenance record;
- statistics, `n`, uncertainty/error-bar definition;
- journal/report dimensions and export formats;
- image-integrity and review risks.

Use Python/matplotlib or the selected Python stack for every figure, preview,
export, and visual QA operation. Never use mock data to fill a missing result.
Prefer one hero panel plus subordinate evidence panels, restrained palettes,
direct labels where appropriate, editable SVG/PDF text, and high-resolution
TIFF/PNG when required.

Store plotting source and exports under `figures/`, with source data under
`figures/source-data/`. Record every figure in `figure-manifest.yaml` with its
claim, source data, script, dimensions, formats, and QA status.

Code topology, module dependencies, and plan-to-code handoffs are visualized by
`diagram-design`; measurable code/runtime quantities such as latency, memory,
throughput, convergence, or error distributions are visualized by
`nature-figure`. Do not turn source code or a terminal/editor screenshot into a
scientific result figure.

## Phase 7 — Draw the workflow directly with diagram-design

Build `diagram/diagram-spec.yaml` from the plan, code map, run evidence,
result-analysis, theory boundary, and next action. This is a compact semantic
brief, not a renderer dump. It must preserve exact file/function names in
metadata while keeping the visible diagram concise.

Load `$diagram-design`, select the nearest semantic pattern and visual type,
then load the matching type reference before drawing. Defaults for this
pipeline are:

```yaml
format: html+png
size: slide-16x9
detail: balanced
audience: mixed
```

Prefer `process`, `data-flow`, or `flowchart` according to the dominant
relationship. Use the project's diagram profile and obey its style-guide gate,
orthogonal connector rules, accessibility contract, complexity budget, and
fidelity ledger. Output:

- `diagram/workflow.html` — self-contained editable visual source;
- `diagram/workflow.png` — canonical slide asset;
- `diagram/workflow.svg` — optional vector asset;
- fidelity notes in `qa/diagram-review.md`.

Do not use Mermaid, a terminal screenshot, or image generation for exact code
topology, formulas, file names, measured results, or evidence.

## Phase 8 — Compose and compile Beamer

Load `$beamer-academic` with the run manifest. Use the implementation-analysis
profile when available; otherwise use the academic/reproduction layout registry
with the same artifact order:

1. workflow overview;
2. plan/code map;
3. run setup and evidence boundary;
4. result-analysis figures;
5. theory derivation and result alignment;
6. limitations and next verification.

Every figure must be included with bounded dimensions and natural aspect ratio,
for example:

```latex
\includegraphics[
  width=\linewidth,
  height=0.52\textheight,
  keepaspectratio
]{figures/result-comparison.pdf}
```

Use the manifest rather than rediscovering project state. Do not place code
walls or unlabelled generated illustrations on evidence pages.

## Phase 9 — Compile, read back, and repair layout

Run the configured XeLaTeX compiler. Then read back both the compiler output
and the rendered pages:

1. inspect log errors, missing assets, unresolved references, overfull/underfull
   boxes, font failures, and page count;
2. render pages to a temporary QA preview using the slide/PDF toolchain;
3. inspect image aspect ratio, cropping, clarity, caption placement, text
   overlap, clipped equations, and slide density;
4. write defects to `qa/layout-review.md` with page, symptom, cause, and fix;
5. modify only the smallest relevant TeX/layout/image constraint;
6. recompile and repeat, at most three repair iterations.

The final manifest must distinguish `compiled`, `layout_qa_passed`,
`layout_qa_partial`, and `blocked`. A successful compilation with unreadable
or distorted figures is not a pass.

## Output bundle

```text
materials/implementation-report/<run-id>/
├── manifest.yaml
├── implementation-report.md
├── plan-analysis.md
├── code-analysis.md
├── result-analysis.md
├── data-availability.md
├── DERIVATION_PACKAGE.md
├── theory-result-alignment.md
├── diagram/
│   ├── diagram-spec.yaml
│   ├── workflow.html
│   ├── workflow.png
│   └── workflow.svg
├── figures/
│   ├── figure-manifest.yaml
│   ├── plot_*.py
│   ├── *.svg
│   ├── *.pdf
│   ├── *.png
│   └── source-data/
├── slides/
│   ├── presentation.tex
│   ├── presentation.pdf
│   └── compile.log
├── logs/
└── qa/
    ├── diagram-review.md
    ├── figure-review.md
    ├── layout-review.md
    └── iteration-log.md
```

Minimum manifest shape:

```yaml
schema: implementation-report/v2
run_id: "<versioned-run-id>"
mode: full-analysis
status: draft
plan_status: read
figure_backend: python
artifacts:
  report: implementation-report.md
  plan_analysis: plan-analysis.md
  code_analysis: code-analysis.md
  result_analysis: result-analysis.md
  data_audit: data-availability.md
  derivation: DERIVATION_PACKAGE.md
  diagram_spec: diagram/diagram-spec.yaml
  diagram_html: diagram/workflow.html
  diagram_png: diagram/workflow.png
  figure_manifest: figures/figure-manifest.yaml
  slides_tex: slides/presentation.tex
  slides_pdf: slides/presentation.pdf
qa:
  figures: pending
  diagram: pending
  compilation: pending
  layout: pending
iteration: 0
```

## Status report structure

Start `implementation-report.md` with:

```text
目标 → 已完成 → 进行中 → 阻塞/未知 → 下一步
```

Then include:

```markdown
# Implementation and research report

## One-sentence state
## Plan and code boundary
## Execution and evidence
## Result analysis
## Data and provenance
## Theory-result alignment
## Visual artifacts
## Workflow diagram
## Slide and layout QA
## Open questions and blockers
## Next verification
```

Every claim in the report must link to a plan step, code entry, run artifact,
data record, formula step, figure, or explicit `unknown`/`none` evidence.

## Resumption and failure handling

Read `manifest.yaml` first when resuming. Continue from the first incomplete
phase, preserve prior artifacts, and append to `qa/iteration-log.md`.

- Missing plan: stop and ask whether to reconstruct one.
- Missing executable command: analyze statically and mark execution blocked.
- Missing results: do not generate measured-result figures.
- Missing data provenance: keep figures provisional and flag the audit.
- Failed derivation: keep the blocker package and do not overclaim.
- Missing Python/backend: stop before rendering figures.
- Missing diagram-design style profile: follow its onboarding gate.
- Missing XeLaTeX: deliver source and exact blocker; do not claim a PDF.

## Quality gate

- Plan was read before code.
- Run command and evidence are reproducible or explicitly bounded.
- Result observations are separated from interpretations and claims.
- Nature-data audit covers every figure and derived output.
- Formula package states assumptions and non-claims.
- Figures use the selected Python backend and have source-data links.
- Diagram is direct `diagram-design` output with no Mermaid dependency.
- All images preserve aspect ratio and remain legible at slide size.
- Compile log and rendered pages were read back.
- Layout repairs are recorded and did not exceed three iterations.
- Final manifest points only to existing, versioned artifacts.
