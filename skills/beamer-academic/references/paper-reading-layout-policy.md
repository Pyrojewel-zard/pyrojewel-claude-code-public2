# Paper-reading Layout Policy

This policy overrides the generic rhythm rules whenever
`report_type: paper-reading` is active. It also applies to multi-paper academic
surveys when the user wants paper-by-paper theory/equation reading rather than a
generic AI-method overview.

Read `references/visual-qa-loop.md` together with this file. The spatial grammar
below is a semantic contract; the rendered-PDF QA loop is the final arbiter of
whether a chosen geometry is actually readable.

## Fixed semantic axis

All ordinary paper-reading content pages use the same semantic direction:

```text
LEFT  = argument / interpretation / claim / boundary
RIGHT = evidence / paper figure / result / QA evidence panel
```

Canonical marker:

```text
argument-left-evidence-right
```

Do not interpret this as a fixed 40/60 template for every page. Column ratio is
chosen by the information object:

| page role | typical left/right | condition |
|---|---:|---|
| overview | 38--44 / 56--62 | evidence figure should dominate |
| evidence | 35--42 / 58--65 | result labels/axes must remain readable |
| theory-figure, figure-heavy | 42--48 / 52--58 | source circuit/mechanism has small labels |
| theory-figure, derivation-heavy | 50--56 / 44--50 | only when the right figure is simple and remains legible |
| discussion | 42--50 / 50--58 | QA/boundary panel rather than decorative art |

A derivation page should almost never use a 60/40 or wider left column when the
right side contains a dense multi-panel paper figure. If both derivation and
source figure need more space, split the page.

## Never reverse columns for rhythm

The generic rule "adjacent pages use different composition patterns" means
variation **inside** the semantic columns. It never authorizes reversing the
columns.

For `paper-reading`:

- do not use `image-left-text-right`;
- do not place the primary paper/result figure on the left and explanation on
  the right;
- do not alternate column direction merely to make pages look different;
- do not use rows of tiny thumbnails as a substitute for one readable evidence
  object.

## Allowed rhythm variation

Keep the semantic axis fixed and vary the internal composition instead:

| page role | left-column rhythm | right-column rhythm |
|---|---|---|
| overview | anchor paragraph + mini argument spine | one large overview/circuit figure |
| theory-figure A | circuit context -> governing relation -> assumptions | one circuit/mechanism crop |
| theory-figure B | reduction -> useful expression -> physical meaning -> design implication | matching mechanism/result crop |
| evidence | metric/result paragraph + evidence-level box | one readable result figure |
| discussion | judgment OR reading tension + boundary | QA/confusion/evidence-needed panel |
| synthesis | compact comparison or representation map | one structured composite or full-width visual reset |

For long multi-paper surveys, create a visual reset roughly every 4--6 content
pages: section river, full-width source figure, comparison table, or synthesis
page. The reset should change information hierarchy, not semantic left/right
direction.

## Theory-page equation grammar

A `theory-figure` page is not an equation dump. Its visual reading order should
make the derivation inspectable during a group meeting:

```text
physical/circuit context
-> governing relation
-> one or two key reduction steps
-> highlighted useful expression
-> physical meaning / sensitivity / trade-off
-> design implication
```

Default capacity is one derivation spine and normally 2--3 displayed math blocks
when they belong to one chain. A compact `aligned` derivation counts as one
chain. More than three independent display-math blocks usually means the page
should be split.

Do not spend vertical space repeating the same equation in prose. Define only
the variables needed to understand the mechanism, and map them to the actual
transistor/passive/bias/signal path.

The right-side figure must show the circuit or mechanism needed to understand the
equation. When useful, annotate the figure with the same variable names used in
the derivation so the eye can move directly between equation and circuit.

If this cannot remain readable in one page, split into two `theory-figure` pages.
Remove an optional discussion page before shrinking equations, variable labels,
or circuit details below presentation readability.

## Equation provenance must be visible

Equation-heavy paper reading often mixes mathematics from different sources.
Mark the type in the page plan, caption, or source line:

- `paper-equation` — directly present in the source paper;
- `reader-derived` — algebra reconstructed between paper equation anchors;
- `rf-bridge` / `textbook-bridge` — standard RF/EM relation used to explain the
  paper, e.g. Friis, transducer gain, cascade IIP3, array factor;
- `report-abstraction` — a compact mathematical abstraction created for the
  presentation, e.g. constrained optimization around a workflow.

Do not visually imply that an `rf-bridge` or `report-abstraction` equation is
quoted from the paper.

## Evidence-first sizing

The right column is not decorative whitespace. A figure must remain readable at
normal presentation distance. If the figure cannot be read at the chosen width:

1. crop/re-extract the actual panel that supports the claim;
2. enlarge the right column;
3. use a full-width evidence page;
4. split the claim across pages if necessary;
5. never shrink the figure merely to preserve extra prose.

Dense multi-panel figures are especially dangerous: a high-resolution JPEG can
still be unreadable after it is rendered at 3--4 cm height.

### Two stacked paper figures

Two stacked source figures are allowed only when both are visually simple and
contain no small internal labels. Otherwise:

- crop the relevant subpanels into one structured composite; or
- use two pages.

Do not create 1.5--2 cm-high paper thumbnails just to show both method and result
on the same page.

For theory pages, equation readability is equally important: never reduce the
font size merely to keep an optional paragraph, AI architecture detail, or
discussion block on the same page.

## One dominant visual hierarchy

Every content page should have one dominant object after the frame title:

- derivation / useful equation;
- source circuit/mechanism figure;
- result plot;
- comparison table;
- structured QA/boundary panel.

Secondary objects support the dominant one. A page with a derivation, two paper
figures, a long note box, a boundary paragraph, and a multi-line source footer
has no visual hierarchy even if it technically fits.

Use only three vertical zones by default:

```text
frame title
main content area
one short provenance/footer line
```

A boundary can live inside the main argument area. Do not stack caption + note +
boundary + source as four independent footers.

## Title budget

For paper surveys, prefer:

```text
subtitle/kicker: venue + year + paper identity
frame title: one short mechanism or claim
```

Avoid titles that simultaneously contain venue, year, full paper title, method
name, and the takeaway. Prefer one rendered title line; two is the hard limit.

## No fake symmetry

If there is no useful right-side evidence object, do not invent one. For the
optional discussion page, a structured QA/boundary panel is acceptable. If even
that is absent, omit the page rather than creating a weak symmetric two-column
layout.

## Source and boundary placement

Each page must keep provenance and claim boundary visually secondary but
present. Recommended order on the left:

```text
claim / mechanism / interpretation
-> evidence-strength or boundary statement
```

Then use one short source line at the page bottom. The right-side caption names
what the figure shows; the footer identifies where it came from. Do not repeat
the same bibliographic sentence twice.

For `theory-figure`, use:

```text
claim
-> derivation spine
-> physical meaning / design implication
-> short equation provenance + validity boundary
```

## Presentation readability gates

Use the general hard gates from `references/visual-qa-loop.md`. In particular:

- body text >= 8.0 pt;
- equation notes >= 8.0 pt;
- table text >= 7.6 pt;
- figure captions >= 7.0 pt;
- source/footer >= 6.8 pt and one line;
- no missing-image or `safeimg` placeholder in the final deck.

If a page violates these gates, change the page structure before changing the
font size.

## Required TeX markers

Generated paper-reading frames must include these comments immediately before
the frame:

```tex
% paper-reading-role: overview
% paper-reading-axis: argument-left-evidence-right
% paper-reading-source: 解读+原文
% paper-reading-boundary: <short non-empty boundary>
% paper-reading-equation-provenance: paper-equation | reader-derived | rf-bridge | report-abstraction | n/a
```

Use the actual role/source/boundary/provenance on each page. The validator uses
these markers to catch regression back to arbitrary layouts and ambiguous
formula attribution.
