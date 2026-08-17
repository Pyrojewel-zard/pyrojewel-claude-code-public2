# RED baseline: no `zuhui-beammer` skill

## Natural defaults

Without the new skill, the discoverable local Beamer skill is `pyrojewel-beamer-academic`. Its documented default is a high-density deep-navy/gold defense theme with rounded cards, blue title banners, gold separators, and a default BUPT logo.

## Failure modes to test

- The agent may preserve evidence and QA correctly but still choose the parent navy/gold visual language instead of the PDF's white/red language.
- A generic Beamer conversion may treat the ADC material as ordinary bullet pages and omit source labels, equation-to-circuit interpretation, or code readability constraints.
- Raw, corrected, ideal, and learned-weight curves may be colored without a semantic legend.
- A time-pressure request may tempt the agent to drop page-level source locations, boundaries, or PDF visual QA.

## Missing contracts

- No explicit rule for the red top rule, pale-red bottom divider, source block, or square red bullets.
- No ADC-specific patterns for charge redistribution, behavioral-model code, perturbation/LMS flow, or raw-vs-calibrated plots.
- No explicit prohibition against inheriting rounded navy/gold cards when the PDF reference is supplied.

## Clean-context pressure run

The clean-context agent independently converged on the same failure boundary: it recommended reusing the parent workflow but warned that directly loading `beamerthemeAcademic.sty` would leak navy headlines, hidden frame titles, `contentcard`, and defense-cover behavior. It also identified missing contracts for exact tokens, ADC variable naming (`vraw`, `videal`, `vcorr`), code rendering, and the required ADC parameter fields (`bit`, mismatch, radix, perturbation magnitude, and calibration metrics).

This is the RED result that the final skill must address.

## GREEN verification with the skill

The fresh-context application run selected the independent `beamerthemeZuhuiBeammer` theme, proposed eight ADC-specific page types, preserved the parent `page_manifest.tsv` contract, fixed the `vraw`/`vcorr`/`videal` color legend, and kept source locations for Lee84, code, formulas, curves, and simulation parameters. It explicitly rejected `beamerthemeAcademic.sty`, navy/gold cards, color-only semantics, unsupported “closer to ideal” claims, and compile-only verification.

The RED failure modes are therefore covered by the current skill wording and examples.
