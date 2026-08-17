# ADC Calibration visual reference

Source: `ADC_Calibration.pdf` in the repository root. The PDF is a 7-page, 16:9 PowerPoint export used as a style reference, not as a source of new scientific claims.

## Layout tokens

| Element | Rule |
|---|---|
| Canvas | White, 16:9, generous margins |
| Title | Upper-left, black/near-black, about 15–16pt in the compiled deck |
| Source | Upper-right, gray, about 5–6pt; include author/year and page/figure/section when known |
| Rule | Red thick segment under the title followed by a thin pale-red continuation |
| Body | Black/dark-gray text; red square bullets; restrained bolding |
| Footer | Thin pale-red rule, page number, optional low-contrast watermark |
| Figures | White background, thin gray axes/grid, no decorative frame |

## Semantic color map

- `zuhui-red`: raw/mismatch/error and primary emphasis.
- `zuhui-green`: corrected/calibrated/learned result.
- `zuhui-blue`: ideal/oracle/reference or code syntax support.
- `zuhui-ink`: equations, body text, axes and labels.
- `zuhui-gray`: source notes, captions, secondary labels.

Color alone is never sufficient for a scientific distinction. Add a legend, line style, or direct label.

## Content rhythm

The supplied reference progresses from literature principle to behavior-level implementation and then to simulation evidence. A useful deck rhythm is:

```text
cover → literature principle → physical/equation mapping → code/behavioral model
      → calibration flow → raw/corrected result → parameter/metric boundary
```

The same logic transfers to other circuit topics: define the physical mismatch, map it to a measurable quantity, show the implementation, then show the calibrated metric.

## Figure rules

- Re-typeset equations when symbols are available; do not enlarge low-resolution screenshots.
- Keep plots large enough to read axes and legends; use at most one dominant plot plus two details on a page.
- Every plot caption states one fact visible in the plot and why it matters to the page takeaway.
- Use fixed variable names where possible: `vraw`, `vcorr`, `videal`, `ENOB`, `RMS error`, `LSB`.
- Put simulation settings beside the result, not in an unreferenced appendix paragraph.
