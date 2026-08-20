# Figure and Layout Contract

This contract applies to every figure generated for an implementation report
and every figure inserted into its Beamer deck.

## Figure record

Each figure has a record in `figures/figure-manifest.yaml`:

```yaml
figure_id: F-001
filename: "figures/result-comparison.pdf"
script: "figures/plot_result_comparison.py"
source_data: "figures/source-data/result-table.csv"
claim: "The current run improves the primary metric under the stated split"
panel_role: validation
backend: python
dimensions: "183 mm x 120 mm"
exports: [svg, pdf, png, tiff]
statistics: "mean ± std over 5 seeds"
status: measured | explanatory | provisional | blocked
qa:
  source_traceable: true
  labels_readable: true
  aspect_ratio_preserved: true
  passed: false
```

`status: measured` is allowed only when the source data comes from the current
run and the result analysis supports the stated claim. Explanatory diagrams do
not support measured claims.

## Python-only visual path

Once Python is selected, use it for plotting, previewing, rasterization,
export, and visual QA. Do not use another language to produce a substitute
preview when a Python package is missing. Stop and report the dependency
blocker instead.

## Aspect-ratio rules

- Export figures with a declared final width/height.
- Keep editable text in SVG/PDF when possible.
- In Beamer, constrain both width and height with `keepaspectratio`.
- Do not stretch a plot to fill a column.
- If the natural ratio does not fit, change the layout or split the slide.
- Inspect the compiled page, not only the source `.tex`.

## Layout QA

For every generated slide, check:

- no missing or substituted figure;
- no crop of axes, legends, captions, or equations;
- no stretched image;
- readable labels at projected slide size;
- no text/image overlap or clipped content;
- balanced density and consistent panel alignment;
- figure source and claim label are present.

Record page, symptom, cause, fix, and iteration number in
`qa/layout-review.md`. A compilation success is not a layout pass.
