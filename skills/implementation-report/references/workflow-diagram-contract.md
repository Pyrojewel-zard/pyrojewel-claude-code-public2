# Direct Workflow Diagram Contract

This contract defines the diagram brief passed from `implementation-report` to
`diagram-design`. The brief is the semantic source of truth for a workflow
visual; no automatic graph renderer or Mermaid source is required.

## Purpose

The diagram explains the causal research/implementation path:

```text
research question → plan step → code entry → approved run → evidence
→ result/theory interpretation → current boundary → next verification
```

It does not prove that a step is complete. Completion comes from the status
table, run evidence, data audit, formula package, and figure manifest.

## Brief schema

Save the direct semantic brief as `diagram/diagram-spec.yaml`:

```yaml
schema: implementation-report/diagram-spec/v2
title: "Implementation and evidence workflow"
purpose: "Show how the planned task becomes verified evidence"
visual:
  type: process
  semantic_pattern: stage-framework
  format: html+png
  size: slide-16x9
  detail: balanced
  audience: mixed
  profile: paper-reading-workflow
nodes:
  - id: question
    label: "研究问题"
    role: input
    status: observed
    source: "plan-analysis.md#question"
  - id: implementation
    label: "代码实现"
    role: process
    status: partial
    source: "code-analysis.md#step-1"
  - id: evidence
    label: "运行证据"
    role: evidence
    status: unknown
    source: "result-analysis.md#evidence"
edges:
  - from: question
    to: implementation
    label: "计划约束"
  - from: implementation
    to: evidence
    label: "执行并记录"
groups:
  - id: verification
    label: "验证边界"
    members: [evidence]
fidelity_ledger:
  merged: []
  dropped: []
  inferred: []
```

Visible labels stay concise. Exact file paths, function names, line numbers,
evidence IDs, and unresolved items belong in `source` metadata and the report,
not in crowded boxes.

## Type and dial selection

Choose one dominant layout after reading the brief:

- `process` for ordered stages with handoffs;
- `data-flow` for data/source/result movement;
- `flowchart` for decisions, blockers, and feedback;
- `architecture` for code components and dependencies.

Default dials are `html+png`, `slide-16x9`, `balanced`, and `mixed`. If the
brief exceeds the selected type's complexity budget, split into an overview and
detail diagram and record the split in the fidelity ledger.

## Required checks

Before drawing, load the selected `diagram-design` type reference and follow
its style-guide onboarding gate. After drawing:

- confirm all nodes and status labels trace to report evidence;
- use orthogonal, independently traceable connectors;
- keep the diagram readable at slide size;
- preserve accessibility metadata and the selected profile;
- record every merge, drop, inference, or fallback;
- run the packaged self-check and any geometry check available in the local
  diagram skill.

Never use this diagram as a substitute for measured plots or a derivation.
