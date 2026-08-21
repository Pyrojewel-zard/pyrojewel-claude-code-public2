# Paper-reading Contract

Use this contract for `report_type: paper-reading`. It is the mandatory bridge
between a normalized reading note and LaTeX generation. For a multi-paper
academic survey, reuse the same semantic/equation rules **per paper unit**, but
do not apply the single-paper four-page ceiling to the whole survey.

Read these three references before drafting `outline.md`:

1. `references/paper-reading-semantic-brief.md` — extracts `ljg-read` semantics;
2. `references/paper-reading-layout-policy.md` — fixes the spatial/equation grammar;
3. `references/visual-qa-loop.md` — defines the rendered-PDF readability gate.

The generation path is therefore:

```text
paper / normalized reading note
  -> materials/notes/reading-brief.md
  -> outline.md (review gate)
  -> paper-reading layouts
  -> validate_paper_reading_deck.py
  -> XeLaTeX
  -> render_visual_qa.py
  -> contact-sheet + page-level visual readback
  -> repair / re-render until PASS
```

Do not skip `reading-brief.md` when a usable `ljg-read` note exists. The purpose
of the brief is to preserve the note's argument structure rather than reduce it
to generic summary bullets.

For RFIC papers, understanding the circuit mechanism and the derivation that
supports it has higher presentation priority than generic AI-method description.
A central equation must be interpreted in circuit language, not merely copied.

## Required draft shape

```markdown
---
status: draft
report_type: paper-reading
paper_meta: "TMTT 2026｜噪声消除 LNA｜某组"
original_source: "materials/papers/paper.pdf"
reading_note: "materials/notes/paper-note.md"
reading_brief: "materials/notes/reading-brief.md"
note_source: "ljg-read"
note_status: "complete"        # complete | in-progress | partial
layout_axis: "argument-left-evidence-right"
---

# TMTT 2026｜噪声消除 LNA｜某组

## 核心判断

一句话说明论文改变了什么，并区分论文原文结论与阅读解读。

## 论证脊柱

把 reading brief 的 argument spine 压缩成 3--7 个有因果/依赖顺序的节点。
不要用论文 section 标题列表替代论证链。

## 页面方案（单篇论文通常最多 4 页）

| 页 | role | 标题 | anchor claim | 左侧论证 | circuit/equation insight | equation provenance | 右侧证据 | source anchor | provenance | evidence boundary | layout_axis | discussion_mode |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | overview | ... | 一句话锚点 | 问题+贡献+mini spine | - | n/a | 论文总览/电路图 | note/global-map + paper | 解读+原文 | ... | argument-left-evidence-right | - |
| 2 | theory-figure | ... | 一个 `[骨]` claim | circuit context + derivation chain | 起点 -> 假设 -> 化简 -> 物理意义 -> trade-off -> 设计选择 | paper-equation / reader-derived / rf-bridge / report-abstraction | 直接对应电路/机制图 | note/[骨] + paper Eq.X/Fig.X | 解读+原文 | ... | argument-left-evidence-right | - |
| 3 | evidence | ... | evidence supports claim X | 指标+证据强度+边界 | - | n/a | 一张结果/测量/仿真图 | note/[肌] + paper Fig.X | 原文+QA | ... | argument-left-evidence-right | - |
| 4 | discussion | ... | reader judgment OR reading tension | 判断/张力+边界 | - | n/a | QA/困惑/待验证面板 | note/collision-or-review | QA+困惑点 | ... | argument-left-evidence-right | reader-judgment / reading-tension |

## QA 与困惑点

- **QA**：问题 -> 笔记中的回答 -> 仍然成立的边界。
- **困惑点**：尚未解决的问题；不能写成论文已经证明的结论。
- **阅读张力**：当伴读尚未完成时，优先使用 reading brief 中的 strongest tension，
  而不是伪造 `我的判断`。

## 图件清单

| 图 | 路径 | 来源类型 | supports claim | 用于哪一页 | rendered legibility risk | 是否待补 |
|---|---|---|---|---|---|---|
| 图 1 | ... | paper-original / generated | claim-1 | P1 | dense labels / simple / none | no |
```

A final figure catalog is also an **asset manifest**: every path selected by the
outline must exist in the deliverable/repository checkout. A name in a Markdown
catalog does not count as an available figure.

## Semantic mapping rules

Use the `ljg-read` structure directly:

- `一句话摘要` -> overview anchor;
- `结构地图` -> argument spine;
- `[骨]` -> candidate slide claims;
- `[肌]` -> evidence links that support a `[骨]` claim;
- `[筋]` -> transitions only; never inflate into a standalone claim;
- `碰撞问题 / 压力测试 / 困惑点` -> discussion tension;
- `理解轨迹 / 读后一句话 / 终局问题` -> reader-authored discussion only when they actually exist.

A result figure without an explicit `supports claim` relation is decorative and
must not be selected merely to fill the right column.

## RFIC equation-interpretation rule

When the paper's key claim depends on a circuit equation or derivation, the
`theory-figure` row must fill both `circuit/equation insight` and
`equation provenance`. A vague entry such as `公式见论文`, `Eq. (x)`, `理论推导`,
or a bare final expression is insufficient.

The slide plan must explain this chain:

```text
circuit / small-signal model
  -> governing relation
  -> assumptions / approximations
  -> substitution or reduction
  -> final useful equation
  -> physical RF meaning
  -> sensitivity / trade-off
  -> design implication
```

At minimum, answer:

1. What circuit/model is the starting point?
2. Which assumptions make the derivation valid?
3. What do the important variables physically correspond to in the circuit?
4. Which RF mechanism does the equation expose: matching, gain, NF, linearity,
   stability, phase noise, bandwidth, power, coupling, etc.?
5. Which variable creates the main sensitivity/trade-off?
6. What device sizing, biasing, matching, topology, or optimization decision follows?

If intermediate algebra is reconstructed by the reading process rather than
shown by the paper, mark it `reader-derived` and preserve paper equation anchors
on both ends.

If standard RF/EM theory is introduced to explain a paper whose authors did not
write that equation, mark it `rf-bridge` or `textbook-bridge`. Examples include
Friis, transducer gain, cascade IIP3, and array factor.

If the slide writes a compact optimization or mathematical wrapper around an
engineering workflow, mark it `report-abstraction`.

### Formula-priority page allocation

Four content pages is a ceiling for one ordinary paper-reading unit, but roles
are not a quota. For RFIC group meetings, a central derivation has priority over
an optional discussion page. If one theory page cannot explain the mechanism
legibly, use a second `theory-figure` page and remove `discussion` first.

Recommended split:

```text
Theory A: circuit context -> starting equation -> approximation
Theory B: reduced equation -> physical meaning -> trade-off -> design choice
```

Do not compress equations, circuit figures, or variable definitions merely to
preserve overview/theory/evidence/discussion as exactly one page each.

For a multi-paper survey, each selected paper may contribute one or more pages
according to its load-bearing role. The deck-level page count follows the talk
time; the four-page ceiling is per paper unit, not per survey.

## Figure-first readability rule

Original paper figures are evidence, not decorative thumbnails. In the outline,
flag dense multi-panel figures and plots with small axes/legends. During TeX
layout:

1. crop/re-extract the exact panel used by the claim;
2. enlarge the evidence column when labels are small;
3. use a full-width evidence page when needed;
4. split two stacked paper figures if either becomes unreadable;
5. never preserve extra prose by shrinking the evidence below presentation readability.

The rendered PDF decides whether a figure is readable; native image resolution
alone is not evidence.

## Incomplete-note rule

If `note_status != complete`, or the reading note says the reader response is
pending, the optional discussion page must use `discussion_mode: reading-tension`.
It must not claim `我的判断`, `读后一句话`, or equivalent reader-authored
judgment. Use `阅读张力与待验证问题` or another factual title.

If no useful tension, QA, confusion, or boundary exists, remove P4. Four pages
is a ceiling, not a target.

## Fixed-axis override

For every ordinary paper-reading content page:

```text
LEFT  = argument / interpretation / claim / boundary
RIGHT = evidence / paper figure / result / QA evidence panel
```

The canonical axis is `argument-left-evidence-right`. This is a semantic rule,
not a cosmetic default. Generic rhythm rules must not reverse it. In particular,
`image-left-text-right` is forbidden in the paper-reading profile.

Vary rhythm inside the columns: paragraph+spine, circuit+derivation,
metric+evidence box, judgment/tension+QA panel. In long surveys, add full-width
section/synthesis resets instead of alternating column direction.

## Approval transition

Show the complete Markdown plan in the conversation. Do not generate `.tex` or
compile while `status: draft`. After the user approves, change only the status
to `approved`; then generate the deck from this file.

The plan must keep four provenance distinctions visible:

- `解读`: explanation produced by the reading note;
- `原文`: directly supported by the paper;
- `QA`: reader question and answer, not a new measurement;
- `困惑点`: unresolved doubt, missing evidence, or boundary.

If the note and original disagree, record the disagreement and preserve the
claim boundary rather than silently reconciling them.

## Required TeX markers

Immediately before every generated paper-reading frame, emit:

```tex
% paper-reading-role: overview
% paper-reading-axis: argument-left-evidence-right
% paper-reading-source: 解读+原文
% paper-reading-boundary: <short non-empty boundary>
% paper-reading-equation-provenance: paper-equation | reader-derived | rf-bridge | report-abstraction | n/a
```

Use the actual role/source/boundary/equation provenance for each page.

## Structural validation

After the outline is approved and after TeX generation, run:

```bash
python scripts/validate_paper_reading_deck.py \
  --outline outline.md \
  --tex presentation.tex
```

The validator checks:

- `report_type: paper-reading`, approved status, and explicit `note_status`;
- at most four content pages for the single-paper profile;
- valid paper-reading roles;
- fixed `argument-left-evidence-right` axis;
- non-empty provenance and evidence boundary;
- a non-empty `circuit/equation insight` and valid equation provenance for every
  `theory-figure` page;
- absence of fabricated `我的判断` / `读后一句话` for incomplete notes;
- required TeX markers and rejection of the old reversed layout.

A structural validator pass is necessary but not sufficient. Compile the PDF,
then run:

```bash
python scripts/render_visual_qa.py presentation.pdf --out qa
```

Inspect `qa/contact-sheet.png` for deck rhythm and every `qa/pages/*.png` for
figure/equation readability. Fill `qa/layout-review.md`, repair, and re-render.
Final content QA, theory/evidence QA, and visual QA must all be `PASS`.
