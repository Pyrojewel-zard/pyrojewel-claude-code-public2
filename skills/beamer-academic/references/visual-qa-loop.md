# Beamer Rendered Visual QA Loop

This reference applies to every compiled `beamer-academic` deck, including
`paper-reading`, `conference`, `reproduction`, and `implementation-analysis`.
A clean XeLaTeX log is necessary but is **not** a visual pass.

## Why this loop exists

Academic Beamer commonly fails after compilation in ways the log cannot see:

- the original paper figure is technically present but its internal labels are unreadable;
- equations fit only because body text or tables were shrunk below presentation size;
- every page uses the same two-column geometry, so a long survey becomes visually flat;
- captions, provenance, boundary notes, and takeaways accumulate at the bottom and squeeze the main argument;
- a multi-panel source figure is compressed into a small column instead of being cropped to the panel actually used;
- missing figures are silently replaced by `safeimg` or another placeholder, so the deck is not reproducible from a clean checkout.

The final unit of QA is therefore the **rendered slide**, not the TeX source.

## Mandatory render artifacts

After two successful XeLaTeX passes, run:

```bash
python scripts/render_visual_qa.py presentation.pdf --out qa
```

The script should produce:

```text
qa/
├── pages/page-001.png
├── pages/page-002.png
├── ...
├── contact-sheet.png
├── pdfinfo.txt
├── extracted-text.txt
└── layout-review.md
```

If the helper is unavailable, use the equivalent commands manually:

```bash
pdfinfo presentation.pdf > qa/pdfinfo.txt
pdftotext -layout presentation.pdf qa/extracted-text.txt
pdftoppm -png -r 144 presentation.pdf qa/pages/page
```

## Two-scale visual readback

Inspect the deck at two scales.

### Pass A — contact sheet: rhythm and hierarchy

Look at all pages at once. Check:

- section/river/full-image pages actually create breathing points;
- no 5+ page run has effectively identical composition unless the user explicitly wants a repeated comparison matrix;
- title length and title baseline are visually consistent;
- information density does not oscillate between nearly empty and unreadably full pages;
- figure-dominant and equation-dominant pages are distributed intentionally;
- the semantic reading direction stays stable for profiles that require it.

For long paper surveys, keep the semantic axis stable but introduce a visual
reset roughly every 4--6 content pages with one of: section map, full-width
source figure, comparison table, or synthesis page. Do **not** create rhythm by
randomly flipping left/right columns.

### Pass B — full page: legibility and physical evidence

Open every rendered page at normal presentation scale. Check:

- equations, subscripts, superscripts, and variable definitions are readable;
- source-figure axis labels, legends, annotations, and device labels are readable;
- images preserve aspect ratio and are not stretched;
- the chosen panel is the panel needed for the argument;
- captions do not repeat the source footer;
- provenance and claim boundary remain visible but secondary;
- nothing overlaps the footer, title rule, or neighboring column;
- no placeholder or missing-image box remains.

A paper figure that cannot be read at its rendered size has failed even when the
image file itself is high resolution.

## Presentation hard gates

Use these as default lower bounds unless a user-provided institutional template
has stricter rules:

| element | default lower bound |
|---|---:|
| body text | 8.0 pt |
| equation annotations / key notes | 8.0 pt |
| table text | 7.6 pt |
| figure captions | 7.0 pt |
| source/footer text | 6.8 pt, one line only |
| frame title | at most 2 rendered lines; prefer 1 |

Do not solve a crowded page by violating these gates. Repair order is:

```text
1. remove secondary prose / duplicate captions
2. split the claim or derivation
3. crop/re-extract the figure to the actual evidence panel
4. change column ratio or page role
5. adjust local spacing
6. only then reduce font, never below the hard gate
```

For tables, if 7.6 pt is still too dense, split the table or convert it to a
smaller comparison rather than shrinking further.

## Equation-centric page grammar

An equation-centric slide has one **derivation spine**, not an equation dump.
Use this order when the mechanism is theoretical:

```text
physical/circuit context
-> governing relation
-> one or two reduction steps
-> highlighted useful expression
-> physical interpretation / sensitivity / design decision
```

Default capacity:

- 1 main claim;
- 1 derivation spine;
- 1 highlighted final/useful expression;
- normally 2--3 displayed math blocks total when they are one chain;
- 1 primary evidence figure or one structured crop/composite.

More than three independent display-math blocks usually means the page should
be split. A compact aligned derivation counts as one chain, not as many unrelated
formula decorations.

## Paper-figure legibility rules

Original paper figures are evidence, not thumbnails.

1. **Dense multi-panel figure**: crop to the panel(s) used by the claim or use a
   full-width evidence page. Do not squeeze the complete figure into a 35--40%
   column merely to prove it was cited.
2. **Two stacked source figures**: allowed only when both have simple geometry
   and no small internal labels. Otherwise split pages or build one deliberate
   composite crop.
3. **Circuit/mechanism figure**: variable names on the figure should match the
   symbols used in the derivation when possible.
4. **Result plot**: axes, legend, units, and compared methods must be readable at
   rendered size.
5. **Missing asset**: final QA fails. `safeimg`, blank placeholders, and
   `待补图` are allowed during drafting only.

## Provenance of equations

Equation-heavy academic decks often mix three kinds of mathematics. Make the
provenance explicit in the page plan or caption:

- `paper-equation` — directly present in the source paper;
- `reader-derived` — algebra reconstructed from paper anchors;
- `rf-bridge` / `textbook-bridge` — standard RF/EM theory used to explain why
  the paper mechanism matters, e.g. Friis, transducer gain, cascade IIP3;
- `report-abstraction` — a compact mathematical abstraction created for the
  presentation, such as a constrained optimization wrapper around a workflow.

Do not visually imply that a bridge or report abstraction is an equation quoted
from the paper.

## Title and footer budget

For paper surveys, prefer:

```text
kicker/subtitle: venue + year + paper identity
title: one short claim or mechanism
```

Avoid putting venue, year, full paper title, and the entire takeaway in one
frame title. Keep the bottom of the slide to one provenance line. If a boundary
needs more than one short line, move the detail into speaker notes or a dedicated
boundary/discussion page.

## Asset reproducibility gate

Before final PASS, verify that every referenced figure exists in the deliverable
or repository checkout. A catalog that names images is not enough.

At minimum, check the TeX references produced by `\includegraphics`, `\safeimg`,
custom paper-image macros, and `\graphicspath`. Missing assets fail QA even if a
fallback macro allows compilation.

## Required QA record

`qa/layout-review.md` must contain one row per page:

```markdown
| page | role | rhythm/hierarchy | equations | figure/labels | source/boundary | defect | fix | status |
|---|---|---|---|---|---|---|---|---|
| P1 | cover | PASS | n/a | PASS | PASS | - | - | PASS |
| P6 | theory-figure | PASS | PASS | FAIL: pole labels too small | PASS | figure unreadable | crop Fig. 1b and enlarge | RECHECK |
```

After every repair, re-render the affected pages and update the row. Final
`content QA`, `theory/evidence QA`, and `visual QA` must all be `PASS`.
