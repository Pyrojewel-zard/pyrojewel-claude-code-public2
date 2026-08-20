---
title: zuhui-beammer design
date: 2026-08-15
status: completed
completed-date: 2026-08-15
---

# zuhui-beammer Design

## Goal

Create a standalone Beamer skill for circuit-oriented group meetings, derived from `pyrojewel-beamer-academic` and governed by the visual language observed in `ADC_Calibration.pdf`.

## Design

`zuhui-beammer` reuses the parent skill's evidence contract, two-stage Markdown-to-Beamer workflow, source traceability, and PDF QA. It adds an independent `beamerthemeZuhuiBeammer.sty` visual theme rather than loading or modifying the parent theme; this avoids inheriting the parent's hidden title, navy headline, and rounded-card semantics. The theme switches the visual system to a white canvas, red rule accents, square red bullets, source labels, compact two-column technical layouts, and restrained figure semantics.

The skill is intentionally named `zuhui-beammer` to match the requested trigger. `zuhui-beamer` remains an alias trigger for the common spelling. The new skill is an adapted local derivative, not an upstream mirror.

## PDF-derived visual contract

- 16:9 white canvas with black/dark-gray body text.
- Upper-left black title with a red rule segment beneath it; source citation occupies the upper-right region.
- Thin pale-red divider near the bottom, with page number and optional low-contrast watermark.
- Red square bullets for hierarchy; red highlights for error terms, method names, and key transitions.
- Blue/green/red curves may encode nominal, corrected, and measured results, but the legend must state the mapping.
- Equations, circuit diagrams, code excerpts, and plots are evidence objects; decorative cards and large dark banners are not defaults.

## Non-goals

- Do not replace, load, or mutate `pyrojewel-beamer-academic`'s TeX theme; reuse it only as the workflow/provenance parent.
- Do not claim exact source colors beyond the PDF-derived configurable tokens.
- Do not create a generic dashboard or KPI slide system.

## Verification

- Static checks validate frontmatter, trigger coverage, required inherited-contract phrases, style-token definitions, and example references.
- A minimal XeLaTeX example loads the independent `beamerthemeZuhuiBeammer.sty` when TeX dependencies are available.
- The final QA records whether the PDF reference was available, whether compilation ran, and any remaining environment limitation.
