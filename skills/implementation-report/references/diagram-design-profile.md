# Diagram-design profile: paper-reading workflow

This is the local handoff profile for `diagram-design`. It keeps the upstream
skill's semantic/type selection, four dials, fidelity ledger, and orthogonal
connector rules, while matching the group's supplied workflow reference.

## Tokens

| Role | Value |
|---|---|
| paper/background | `#ffffff` |
| paper-2/container | `#ffffff` |
| ink/stroke | `#111111` |
| muted/secondary | `#666666` |
| rule/hairline | `#222222` |
| accent | disabled by default; use black for focal nodes |
| link | `#111111` |

## Typography

- Use a serif family for title, node labels, and annotations:
  `Times New Roman`, `Noto Serif CJK SC`, `Songti SC`, `serif`.
- Use a readable serif fallback for Chinese labels; never allow missing CJK
  glyphs to silently fall back to a decorative font.
- Use monospace only for exact file paths, function names, commands, or IDs in
  the accompanying report table—not as the default node font.

## Geometry and treatment

- White canvas, black rectangular modules, no shadows, no gradients, no glow.
- Dashed rectangular group boundaries for implementation scope or uncertainty.
- Orthogonal elbows with independently traceable paths; no diagonal connectors,
  overlapping paths, or shared attach points.
- Keep 1–2 focal nodes at most; in the default monochrome treatment, emphasis
  comes from position, line weight, or a short label rather than color.
- For `slide-16x9`, use a 1280×720 viewBox; for `slide-4x3`, use 1024×768.
- Default to `balanced`, split or simplify above the upstream node budget, and
  report every merge/drop in the fidelity ledger.

## Required output metadata

Record these alongside the generated HTML/PNG in `manifest.yaml`:

```yaml
diagram_skill: diagram-design
profile: paper-reading-workflow
format: html+png
size: slide-16x9
detail: balanced
audience: mixed
fidelity_ledger: implementation-report.md#fidelity-ledger
```
