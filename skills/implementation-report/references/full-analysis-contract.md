# Full Analysis Handoff Contract

This contract keeps the specialist outputs composable and auditable. The
orchestrator may adapt filenames, but it must preserve the fields and status
semantics below.

## Phase statuses

Use one of:

`not-started` · `in-progress` · `complete` · `partial` · `blocked` · `unknown`

`complete` requires evidence. `unknown` means the required observation was not
available. `blocked` names the external or local condition preventing the
phase. Neither is a failure claim about the research itself.

## Evidence record

```yaml
evidence_id: E-001
kind: run | test | log | metric | figure | derivation | data-audit
source: "relative/path/or/section"
observation: "What was directly observed"
interpretation: "What it may mean; use unknown when not supported"
claim_boundary: "What this evidence does not establish"
status: observed | inferred | unverified
```

## Specialist handoffs

| Phase | Input | Required output | Completion gate |
|---|---|---|---|
| result analysis | raw run files and logs | raw table, metrics, deltas, findings, next tests | every finding has an observation and boundary |
| nature-data | inputs, derived data, code, run IDs, figures | data inventory and availability/FAIR audit | no invented identifier or access condition |
| formula derivation | target, assumptions, code variables, results | derivation package and status | invariant object and non-claims are explicit |
| nature-figure | audited source data and figure contract | Python source, exports, figure manifest, QA | source data and conclusion link are present |
| diagram-design | diagram brief and evidence map | HTML plus slide PNG, optional SVG, fidelity ledger | diagram is exact enough to review and readable |
| beamer-academic | manifest and all selected assets | `.tex`, compiled PDF, log, layout review | compile and page read-back are complete or blocked |

## Claim ladder

Do not promote a claim beyond its evidence level:

1. `implemented`: code path exists and is plan-matched;
2. `executed`: approved command ran and produced an artifact;
3. `measured`: result was read from the current run;
4. `reproducible`: repeated/configured evidence supports the result;
5. `theoretically-aligned`: the formula package explicitly connects the
   quantity and assumptions to the observation.

The report must say which level is supported for every headline result.

## Resume rule

`manifest.yaml` is the active pointer. On resume, read it first, verify the
listed artifacts still exist, and continue at the first incomplete phase. Never
discard an earlier partial result without recording why.
