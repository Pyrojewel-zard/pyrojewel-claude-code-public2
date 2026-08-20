# Paper-reading Layout Policy

This policy overrides the generic rhythm rules whenever
`report_type: paper-reading` is active.

## Fixed semantic axis

All paper-reading content pages use the same semantic direction:

```text
LEFT  = argument / interpretation / claim / boundary
RIGHT = evidence / paper figure / result / QA evidence panel
```

Canonical marker:

```text
argument-left-evidence-right
```

Normal geometry is 40/60. The accepted range is 38--44% for the left column and
56--62% for the right column.

## Never reverse columns for rhythm

The generic rule "adjacent pages use different composition patterns" means
variation **inside** the semantic columns. It never authorizes reversing the
columns.

For `paper-reading`:

- do not use `image-left-text-right`;
- do not place the primary paper/result figure on the left and explanation on
  the right;
- do not alternate 40/60 and 60/40 merely to make pages look different;
- do not use rows of tiny thumbnails as a substitute for one readable evidence
  object.

## Allowed rhythm variation

Keep the semantic axis fixed and vary the internal composition instead:

| page role | left-column rhythm | right-column rhythm |
|---|---|---|
| overview | anchor paragraph + mini argument spine | one overview/circuit figure |
| theory-figure | mechanism paragraph + <=2 equations | one mechanism/circuit/method figure |
| evidence | metric/result paragraph + evidence-level box | one result figure or structured composite |
| discussion | judgment OR reading tension + boundary | QA/confusion/evidence-needed panel |

This provides visual rhythm without changing the reader's spatial grammar.

## Evidence-first sizing

The right column is not decorative whitespace. A figure must remain readable at
normal presentation distance. If the figure cannot be read at 56--62% width:

1. crop/re-extract the actual figure;
2. use a structured composite only when panels belong to one evidence chain;
3. split the claim across pages if necessary;
4. never shrink the figure just to preserve extra prose.

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
-> evidence-strength or boundary box
-> short provenance label
```

The right-side caption names the source figure and why it is shown.

## Required TeX markers

Generated paper-reading frames must include these comments immediately before
the frame:

```tex
% paper-reading-role: overview
% paper-reading-axis: argument-left-evidence-right
% paper-reading-source: 解读+原文
% paper-reading-boundary: <short non-empty boundary>
```

The validator uses these markers to catch regression back to arbitrary layouts.
