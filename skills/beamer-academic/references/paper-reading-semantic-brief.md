# Paper-reading Semantic Brief

Use this reference only for `report_type: paper-reading`. It defines the
mandatory semantic bridge from an `ljg-read`-style reading note to the Beamer
`outline.md`. The deck generator must not summarize the paper again from
scratch when a usable reading note already exists.

## Pipeline

```text
paper / normalized note
  -> ljg-read semantics
  -> materials/notes/reading-brief.md
  -> outline.md
  -> fixed-axis Beamer layouts
  -> structural validator
  -> compile / visual QA
```

The brief is an intermediate reasoning artifact, not a second competing note.
It extracts presentation semantics from the existing reading record.

## Required frontmatter

```yaml
---
semantic_contract: ljg-read-v1
note_status: complete        # complete | in-progress | partial
note_source: ljg-read        # provided-note | ljg-paper | ljg-read | ljg-qa
layout_axis: argument-left-evidence-right
---
```

`note_status` must reflect the actual reading record. Do not mark a note complete
just because the paper itself was fully parsed.

## Required semantic fields

### 1. One-sentence anchor

Copy or normalize the reading note's `一句话摘要` into one sentence that answers:
what changed, for whom, and under what scope?

Store both the statement and its source anchor.

### 2. Argument spine

Convert the reading note's `结构地图` into 3--7 causal or argumentative nodes.
Keep arrows and dependency order. Do not replace the spine with a list of section
titles.

### 3. Skeleton claims

Use `[骨]` passages as the primary claim pool. For every selected claim record:

| field | meaning |
|---|---|
| `claim` | the precise proposition used on a slide |
| `author_wants_reader_to_accept` | the proposition the paper is trying to establish |
| `mechanism` | how the paper says the claim works |
| `assumptions` | conditions needed for the mechanism |
| `source_anchor` | section / paragraph / equation / note location |
| `figure_candidate` | paper figure that can carry the right column |

Do not promote `[筋]` transitions into standalone slide claims. `[肌]` passages
belong primarily in the evidence links below.

### 4. Evidence links

Map evidence to skeleton claims explicitly:

| field | meaning |
|---|---|
| `supports_claim` | which skeleton claim this evidence supports |
| `evidence` | measurement, simulation, ablation, derivation, example, etc. |
| `evidence_type` | paper-direct / author-interpretation / reader-inference |
| `source_anchor` | paper or note location |
| `figure_candidate` | preferred figure / structured composite |
| `supports_up_to` | strongest defensible conclusion |
| `does_not_prove` | explicit boundary |

A result figure without a `supports_claim` link is decorative and should not be
selected for a paper-reading slide.

### 5. Equation and circuit reasoning

When a selected skeleton claim depends on a circuit equation, small-signal model,
transfer function, noise expression, impedance relation, stability condition,
linearity relation, oscillator equation, or other RFIC derivation, extract an
explicit reasoning record. Do not copy a final equation without explaining it.

```yaml
equation_reasoning:
  - target_equation: "Eq. (7)"
    paper_anchor: "paper §III-B / Eq. (7)"
    circuit_anchor: "Fig. 4, M1-M2 and Ls feedback path"
    starting_point: "small-signal model / KCL / noise model / impedance relation"
    derivation_steps:
      - "starting relation"
      - "substitution or approximation"
      - "reduced expression"
    approximations:
      - "gm ro >> 1"
      - "parasitic C ignored below ..."
    variables:
      gm1: "M1 transconductance; controlled by bias/current and device size"
      Ls: "source degeneration inductance; sets real input impedance term"
    physical_meaning: "what physical RF mechanism the equation exposes"
    sensitivity_tradeoff: "which variable improves one metric while hurting another"
    design_implication: "what an RFIC designer would change because of this equation"
    provenance: "paper-derivation | reader-derived | mixed"
```

For every equation selected for a slide, the presentation must be able to answer
all of these questions:

1. **Where does it come from?** State the starting model or governing relation.
2. **What assumptions make it valid?** List the approximations instead of hiding them.
3. **What does each important variable correspond to in the circuit?** Map symbols to
   transistors, passives, bias, impedances, poles/zeros, noise sources, or signal paths.
4. **What physical mechanism does it reveal?** Explain gain, matching, NF, linearity,
   stability, phase noise, bandwidth, power, or coupling in circuit language.
5. **What trade-off/sensitivity does it imply?** Say what moves when a variable changes.
6. **What design decision follows?** Connect the equation back to sizing, biasing,
   matching, topology choice, or optimization constraints.

Keep provenance explicit. If the paper jumps from Eq. (3) to Eq. (6) and the
reading note reconstructs the missing algebra, label those intermediate steps as
reader-derived rather than pretending they are written in the paper.

### 6. Reading tension

Extract the strongest unresolved tension from `读前张力`, collision questions,
pressure tests, doubts, or counterarguments. Prefer one sharp tension over many
weak questions.

### 7. Reader trace

Record whether the note contains actual reader responses:

```yaml
reader_trace:
  available: true | false
  judgments: []
reader_one_liner:
  available: true | false
  text: ""
terminal_question: "..."
```

Never fabricate these fields. A generated summary is not a reader response.

### 8. Terminology

Reuse the note's terminology table and normalize only inconsistent translations.
Do not silently rename paper variables, model stages, or RF/EDA terms.

## Page mapping

The brief maps to pages as follows; four pages is a ceiling, not a target.

| role | semantic source | left argument | right evidence |
|---|---|---|---|
| `overview` | one-sentence anchor + argument spine | problem, contribution, scope, compact spine | overview/circuit/system figure |
| `theory-figure` | skeleton claim + equation/circuit reasoning | circuit context -> derivation chain -> physical meaning -> design implication | directly matching circuit/mechanism figure |
| `evidence` | evidence links | result interpretation + evidence strength + boundary | one readable result/simulation/measurement figure |
| `discussion` | reader trace or reading tension | judgment if real; otherwise tension/counterpoint | QA/confusion/boundary panel |

### Formula-priority rule

For RFIC paper reading, a central circuit derivation outranks a generic discussion
page. If one theory page cannot explain the essential derivation legibly, use two
`theory-figure` pages and remove the optional `discussion` page first. Keep the
total at four content pages or fewer.

A formula-heavy theory sequence should usually be split as:

```text
Theory A: circuit model -> starting equation -> key approximation
Theory B: reduced equation -> physical meaning -> sensitivity/trade-off -> design choice
```

Do not shrink equations or circuit figures merely to preserve the default four-role
sequence. The goal is understanding, not role completeness.

### Incomplete-note rule

If `note_status != complete` or `reader_trace.available == false`, the discussion
page MUST NOT be titled or written as `我的判断`, `读后一句话`, or another claim of
reader-authored judgment. Use a title such as `阅读张力与待验证问题` and present:

- the strongest tension;
- the strongest counterpoint already present in the note;
- what evidence would resolve it;
- the terminal/pending question if available.

If none of these exist, omit the discussion page.

## Compression rules

- Preserve causal links before preserving prose.
- Prefer one skeleton claim + one evidence chain over three shallow claims.
- For RFIC papers, preserve the **circuit derivation chain** before preserving AI
  architecture detail that is not necessary to understand the electrical mechanism.
- Every selected equation must have a circuit/physical interpretation and a design
  implication; equations are never decorative typography.
- Every selected figure must answer the left-column claim; otherwise choose a
  different figure or omit the page.
- Keep `原文`, `解读`, `QA`, `困惑点` provenance distinct.
- Never infer a measurement, reproduction, or reader judgment from an
  explanatory note.
