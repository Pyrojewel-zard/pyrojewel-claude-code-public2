---
title: Implementation Report Research Pipeline
date: 2026-08-19
status: completed
completed-date: 2026-08-19
---

# Implementation Report Research Pipeline

## Goal

Upgrade `implementation-report` from a plan-to-code status reporter into a
single entry point for implementation analysis, evidence-aware data
provenance, theory alignment, Python scientific figures, direct diagram
design, and Beamer generation with compile/read-back layout correction.

## Scope

The skill has two modes:

- `status-only`: preserve the existing plan → code → evidence report.
- `full-analysis`: run the complete plan → execution → results → theory →
  visualization → diagram → slides → compile QA loop.

Mermaid is removed from the implementation-report contract. `diagram-design`
receives a structured diagram brief derived from the plan and observed
evidence, then produces the final HTML/SVG/PNG diagram directly.

## Required sub-skill boundaries

`implementation-report` owns orchestration, phase gates, artifact naming,
provenance, failure states, and resumability. It does not duplicate specialist
methods.

- `analyze-results`: numerical/result interpretation when available.
- `nature-data`: dataset, source-data, code, version, and FAIR traceability.
- `formula-derivation`: assumptions, invariant object, derivation, and
  non-claims.
- `nature-figure`: Python-only publication figures and visual QA.
- `diagram-design`: exact workflow/process/architecture visual, no generated
  imagery for code topology or measured evidence.
- `beamer-academic`: slide composition, compilation, and final layout repair.

## End-to-end data flow

```text
plan inputs → code map → approved run → logs/results → evidence analysis
→ data/provenance audit → formula package → Python figures
→ diagram brief → direct diagram → Beamer source → compiled PDF
→ PDF/log/page QA → bounded layout repair → final manifest
```

## Hard gates

1. Read the plan before inspecting code.
2. Never invent missing data, metrics, identifiers, derivations, or completion
   evidence.
3. Do not run expensive or destructive commands without an explicit command in
   the plan or user authorization.
4. Use Python for all `nature-figure` drawing, previewing, exporting, and
   visual QA in this pipeline.
5. Do not present a generated illustration as code topology or measured data.
6. A Beamer deliverable is not final until the compiled output and log have
   been read back; repair layout defects for at most three iterations.

## Output contract

Each run is versioned under `materials/implementation-report/<run-id>/` and
contains a manifest, plan/code/result reports, data audit, derivation package,
diagram brief and exports, Python figure sources and exports, Beamer source and
PDF, logs, and QA notes. Relative paths are used throughout.

## Layout contract

Figures keep their natural aspect ratio and use bounded width/height with
`keepaspectratio` in Beamer. The pipeline checks missing assets, distorted
images, overfull boxes, clipped captions, unreadable labels, and page-level
overlap before declaring the bundle complete.
