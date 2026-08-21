# BUPT Branding Profile

This profile restores the useful BUPT identity layer from the historical
`pyrojewel-beamer-academic` skill without restoring its old dense-defense visual skin.

## Historical source

Recovered from Git history at commit `2b4e45988f4c8298a46ddcd25f2b5d5c0071ac88`:

- `skills/pyrojewel-beamer-academic/assets/bupt-logo-white.png`
- historical public API: `\sethorizseal{bupt-logo-white.png}`
- historical generation contract: copy the white horizontal BUPT mark into
  `materials/figures/` and keep `\graphicspath{{materials/figures/}{./}}`.

The old theme placed the white horizontal mark in a dark-blue headline. The
current implementation preserves only that identity behavior and uses a thin
accent strip so equation-centric / IEEE-Nature-style content remains dominant.

## When to activate

Activate automatically when any of the following is true:

1. `institution.name` is `北京邮电大学`, `BUPT`, or `Beijing University of Posts and Telecommunications`;
2. the user explicitly asks for 北邮/BUPT branding;
3. an existing deck already uses `\sethorizseal{bupt-logo-white.png}`.

Do not activate for a different institution unless explicitly requested.

## Required generated files

When BUPT branding is active, the deck directory must contain:

```text
presentation/
├── beamerthemeAcademic.sty
├── beamerthemeAcademicBUPT.sty
├── presentation.tex
└── materials/figures/
    └── bupt-logo-white.png
```

The logo file is a retained historical repository asset. Reuse it; do not
replace it with an arbitrary web logo unless the user explicitly asks.

## LaTeX header

Use:

```latex
\usepackage{beamerthemeAcademic}
\usepackage{beamerthemeAcademicBUPT}
\graphicspath{{materials/figures/}{./}}
\sethorizseal{bupt-logo-white.png}

\institute{北京邮电大学 电子工程学院}
```

`beamerthemeAcademicBUPT.sty` intentionally preserves the historical
`\sethorizseal{...}` API so older deck snippets remain compatible.

To disable the mark for one deck:

```latex
\sethorizseal{}
```

To change the short text at the left side of the brand strip:

```latex
\setbuptbrandtext{北京邮电大学 · 电子工程学院}
```

## Visual contract

- Keep the current white `beamer-academic` content area.
- The BUPT layer is a thin top identity strip, not a full defense banner.
- Do not add a second large BUPT logo inside ordinary content pages.
- Cover pages may remain plain/white; the headline branding is for normal frames.
- The logo must preserve aspect ratio and must not be stretched.
- BUPT branding does not override equation-centric layout, evidence sizing, or rendered visual QA.

## Compile / QA gate

If the BUPT overlay is loaded and `bupt-logo-white.png` is missing, compilation
must fail with a clear package error. A missing-logo placeholder is not an
acceptable final result.

After compilation, the normal rendered-QA loop still applies. On the contact
sheet verify:

- the identity strip does not consume excessive vertical space;
- the white horizontal logo remains legible;
- frame titles and equations are not pushed into a cramped content area;
- plain cover/section-reset frames are not unintentionally branded twice.
