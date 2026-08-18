# Paper Reproduction Report Contract

This contract applies when `config.yaml` sets `report_type: reproduction`.
It separates three objects that are often accidentally merged in a slide deck:

1. what the paper states;
2. what the repository implements;
3. what the current run actually verifies.

## Paper-unit metadata

Each paper has one entry in `materials/reproduction_manifest.yaml`:

```yaml
papers:
  - paper_id: YJYIKZXP
    citation: "Gustavsen & Semlyen, 1999"
    itemKey: YJYIKZXP
    attachmentKey: KJERT98J
    source_status: "fulltext-verified"
    code_entry:
      path: "autoModel/scripts/equiv/run_a1_vf_baseline.py"
      function: "fit_vector_fitting"
    dataset_or_run_id: "RUN-EXAMPLE-001"
    evidence_level: "L2-diagnostic"
    claim_boundary: "classical VF response fit; not a complete circuit synthesis"
    figures:
      paper_originals:
        - "materials/figures/paper-originals/gustavsen1999-fig2.png"
      generated:
        - "materials/figures/generated/vf_pipeline.png"
      reproduction:
        - "materials/figures/reproduction/vf_sparam_fit.png"
```

`paper_id`, `citation`, `source_status`, `code_entry`, `dataset_or_run_id`,
`evidence_level`, and `claim_boundary` are mandatory. Zotero `itemKey` and
`attachmentKey` are mandatory when the paper is sourced from Zotero; an
unverified key must be written as `unknown`, never guessed.

## Required page roles

Each paper occupies 2–5 pages and must contain these four roles. The fifth role
is optional and should be used only when it adds physical interpretation or a
material limitation.

| Role | Left side | Right side | Required source label |
|---|---|---|---|
| `overview` | problem, contribution, assumptions, scope | one large paper figure or schematic | paper figure number or `示意重绘` |
| `algorithm-derivation` | derivation chain and variable meanings | up to two equations or algorithm flow | paper equation/algorithm number |
| `paper-code-map` | paper steps and equation references | `file:function`, parameters, short code excerpt, status | exact repository path |
| `reproduction-result` | frequency band, split, metric, decision | for connected methods: measured/reproduced S-parameter, error, pole, or circuit figure; for `not-reproduced`: explicitly labelled migration-validation design figure | dataset/run and plotting script, or `none` with a non-claim |
| `optional-boundary` | physical interpretation, failure, or difference | pole-zero/circuit/comparison figure | evidence level and non-claim |

The page source is recorded in the TeX file with comments immediately before
each frame:

```latex
% repro-paper: YJYIKZXP
% repro-role: paper-code-map
\begin{frame}{论文步骤如何落到代码}
  % ...
\end{frame}
```

## Implementation status vocabulary

- `paper-faithful`: the repository implements the paper algorithm at the stated
  scope and the correspondence has been checked against the full text.
- `formula-mapped-minimal`: the paper equation is implemented in a reduced or
  toy setting; do not present it as an end-to-end paper reproduction.
- `project-extension`: an explicit project addition such as warm-start,
  trust-region control, circuit synthesis, or a custom continuity heuristic.
- `not-reproduced`: the paper is analyzed but the algorithm or required evidence
  is not implemented.

## Figure and claim boundaries

Use three physically separate directories:

```text
materials/figures/paper-originals/  # extracted/cited paper figures
materials/figures/generated/        # Python/R/TikZ explanatory redraws
materials/figures/reproduction/     # plots from the current code/data/run
```

The caption must say which class the figure belongs to. A paper original is
source evidence, a generated figure is an explanation, and a reproduction
figure is the only class allowed to support a current-run result. A successful
compile or a non-divergent fit is not by itself evidence of physical validity.
