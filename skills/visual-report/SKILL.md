---
name: visual-report
description: >
  Convert conversation context, requirements, plans, project progress, execution logs,
  comparisons, and engineering or experimental results into a clear self-contained HTML
  visual report. Trigger on requests such as "visualize the above", "可视化上文",
  "盘点一下", "做成HTML", "把plan/进度/结果可视化", "生成dashboard/report".
  Designed for general models including Luna, DeepSeek, Claude, Codex, and similar agents.
license: MIT
metadata:
  version: "1.0"
---

# Visual Report

Turn complex working context into a compact, human-readable HTML artifact.

This skill is for information presentation, not web-app development.

The default deliverable is one self-contained HTML file with inline CSS and only minimal
JavaScript when interaction materially improves understanding.

## 1. Primary goal

A reader should be able to answer these questions quickly:

- What is this about?
- What has already happened?
- What has been decided?
- What is currently in progress?
- What is blocked or unresolved?
- What are the important results?
- What should happen next?

Optimize for comprehension speed, factual fidelity, and information hierarchy.

Do not optimize for flashy visual effects.

## 2. When to use

Use this skill when visual structure is more useful than another Markdown answer.

Typical inputs include:

### Conversation history

- chat recap
- requirement inventory
- decisions
- unresolved questions
- discussion timeline
- TODO extraction

### Plans

- implementation plan
- roadmap
- task breakdown
- milestones
- dependencies
- risk register

### Project status

- completed / in-progress / blocked work
- project inventory
- repository state
- teammate or agent execution state
- current milestone

### Execution results

- code changes
- files changed
- commands executed
- tests and validation
- generated artifacts
- failures and fixes

### Engineering and experiment results

- KPI summary
- baseline versus current
- ML training results
- EDA or simulation results
- benchmark results
- tables and plots
- anomalies and findings

### Comparisons

- option A versus B
- model / tool / architecture comparison
- trade-offs
- decision support

Do not invoke the skill simply because HTML is possible.

## 3. Source rules

### Current conversation first

When the user says something equivalent to:

- 可视化上文
- 把刚才讨论盘点一下
- 把上面的需求做成 HTML
- 把这个 plan 可视化

use the conversation context already available.

Do not ask the user to paste the same content again.

### File-backed context

When the request refers to plans, logs, repositories, experiment outputs, reports, or other files,
read the relevant sources first when tools are available.

When tool access is unavailable, use only information actually present in context.

### Never fabricate state

Never invent:

- completion percentages
- dates
- owners
- metrics
- test results
- milestones
- decisions
- blockers
- conclusions

If a value is unknown, leave it unknown or label it explicitly.

## 4. Semantic extraction model

Before writing HTML, organize source information conceptually into:

~~~yaml
title:
subtitle:
status:
updated_at:

summary:
  objective:
  current_state:
  key_message:

requirements: []

decisions:
  - decision:
    reason:
    evidence:

progress:
  completed: []
  in_progress: []
  blocked: []
  not_started: []

results:
  - metric:
    value:
    baseline:
    interpretation:

risks:
  - risk:
    impact:
    mitigation:

open_questions: []

next_actions:
  - action:
    owner:
    dependency:
    priority:

timeline:
  - time:
    event:

artifacts:
  - name:
    path:
    description:
~~~

This is an internal organization model. Do not force all fields into every report.

Keep these categories distinct:

- fact
- requirement
- decision
- assumption
- completed work
- work in progress
- blocked work
- open question
- risk
- result
- next action

If source statements conflict, surface the conflict instead of silently choosing one.

## 5. Automatic report-type routing

Choose one primary report type automatically.

| Input / intent | Primary report |
|---|---|
| Long discussion or chat history | Conversation Digest |
| Requirements + decisions + TODOs | Requirement Review |
| Plan / roadmap / task list | Implementation Plan |
| task_plan + progress + findings | Project Dashboard |
| Agent / coding execution output | Execution Report |
| Simulation / ML / benchmark data | Results Report |
| Multiple candidate approaches | Comparison Board |
| Mixed project context | Project Overview |

Use the user's explicit format when given.

Do not ask which layout the user wants unless the choice would materially change meaning.

## 6. Layout library

### A. Conversation Digest

Use for chat or meeting recap.

Recommended sections:

1. Header and purpose
2. Executive summary
3. Topic groups
4. Requirements
5. Decisions already made
6. Meaningful timeline
7. Open questions
8. Action items
9. Important paths, commands, parameters, or artifacts

Distinguish clearly between discussed, decided, and pending.

Do not turn every message into a timeline item. Merge repeated discussion.

### B. Requirement Review

Use when the source primarily describes what should be built.

Recommended sections:

1. Objective
2. Requirement groups
3. Must-have / should-have / optional
4. Constraints
5. Fixed decisions
6. Ambiguities
7. Acceptance criteria
8. Next implementation steps

Prefer grouped cards and matrices.

### C. Implementation Plan

Use for plans and roadmaps.

Recommended sections:

1. Goal
2. Starting point
3. Phases
4. Task breakdown
5. Dependencies
6. Milestones
7. Risks
8. Definition of done
9. Immediate next actions

Useful structures include phase cards, vertical roadmaps, dependency arrows, and task-status boards.

Do not create a Gantt chart unless real dates or estimates exist.

### D. Project Dashboard

Use for ongoing work.

First-screen summary should expose, when known:

- overall state
- completed work
- active work
- blockers
- remaining work
- current milestone

Then show:

1. Current objective
2. Progress by phase
3. Recently completed work
4. Active work
5. Blockers
6. Findings
7. Risks
8. Next actions
9. Relevant artifacts

Do not manufacture a percentage. Prefer counts or qualitative state.

### E. Execution Report

Use for coding, automation, or agent execution.

Recommended sections:

1. Task requested
2. What changed
3. Files changed
4. Commands / tools used
5. Tests / validation
6. Successful results
7. Failures / unresolved issues
8. Generated artifacts
9. Recommended next action

Preserve exact file paths, commands, commit hashes, identifiers, and important log excerpts.

### F. Results Report

Use for engineering, EDA, ML, benchmarking, or experiments.

Recommended sections:

1. Objective
2. Setup
3. Key metrics
4. Baseline versus current
5. Charts
6. Detailed observations
7. Failures / anomalies
8. Interpretation
9. Recommended next experiments

Only create charts from real numeric data.

Typical chart choices:

- line: frequency, epoch, time, ordered progression
- bar: discrete method/model comparison
- scatter: trade-off or correlation
- table: exact engineering values

Keep important raw values visible even when charts are present.

### G. Comparison Board

Use for alternatives.

Recommended sections:

1. Comparison objective
2. Evaluation dimensions
3. Side-by-side overview
4. Detailed comparison matrix
5. Trade-offs
6. Risks and caveats
7. Decision-relevant observations

Do not manufacture a winner when evidence does not justify one.

## 7. Planning-with-files integration

When a planning workspace exists, prefer the actual planning state.

Typical sources:

~~~text
.planning/
  task_plan.md
  progress.md
  findings.md
~~~

or an equivalent directory.

Procedure:

1. Read task_plan for intended work.
2. Read progress for actual execution state.
3. Read findings for discovered facts, decisions, and technical observations.
4. Reconcile plan versus reality.
5. Surface mismatches explicitly.
6. Write the report beside the planning files when appropriate.

Preferred output:

~~~text
.planning/<plan-name>/visual-report.html
~~~

The HTML is a view of planning state, not the source of truth.

Never overwrite the planning files merely to generate the report.

## 8. Visual design

Use a calm technical-report style.

Default properties:

- light neutral background
- white or slightly tinted cards
- dark readable text
- one restrained accent
- clear hierarchy
- generous whitespace
- compact tables
- subtle borders
- minimal shadows
- responsive layout
- printable layout

Avoid:

- marketing-site styling
- hero banners
- excessive gradients
- animated backgrounds
- decorative charts
- fake dashboard metrics
- unnecessary interactivity

Use Chinese labels for primarily Chinese source material and English labels for primarily English
source material.

### Status vocabulary

Use consistent labels such as:

- 已完成 / Completed
- 进行中 / In progress
- 阻塞 / Blocked
- 待处理 / Pending
- 未开始 / Not started
- 已决策 / Decision
- 风险 / Risk
- 待确认 / Open question

Do not rely on color alone; always include text.

### Typography

Prefer system fonts. Use monospace for commands, paths, hashes, identifiers, code, and precise
engineering values when helpful.

## 9. HTML implementation constraints

Default to one self-contained HTML file.

Requirements:

- semantic HTML5
- inline CSS
- UTF-8
- viewport meta tag
- responsive layout
- printable
- accessible contrast
- no build step
- no Node.js requirement
- no external CSS framework
- no external web fonts
- no CDN dependency by default

Use inline SVG for lightweight diagrams.

Use JavaScript only when it adds clear value, for example:

- collapsible detail sections
- simple filtering
- comparison tabs
- raw-log toggles

Do not use JavaScript for visual decoration.

Do not use React, Vue, Svelte, or another app framework unless the user explicitly asks for a web
application rather than a report.

## 10. Charts and diagrams

Every chart must answer a real question.

A chart should include the relevant title, axes, units, and legend.

Never turn non-numeric text into decorative charts.

Never invent values to fill a dashboard.

For small datasets, inline SVG is preferred.

For precise engineering comparisons, tables are often better than charts.

## 11. Long-source handling

Do not dump the entire source into the report.

Use progressive disclosure:

1. summary first
2. important details second
3. raw / low-priority details inside collapsible sections

For long chats:

- merge duplicate topics
- compress repeated reasoning
- preserve final decisions
- preserve unresolved disagreement
- preserve exact commands, paths, metrics, parameters, and configuration values that matter

The report should be substantially easier to scan than its source.

## 12. First-screen rule

The first viewport should usually contain:

- title
- one-sentence purpose
- current state
- three to six high-value facts

The reader should understand the situation before scrolling.

## 13. Output behavior

Unless the user asks otherwise:

1. Generate the HTML file.
2. Save it to a sensible local artifact path.
3. Report the exact path.
4. Give a short summary of what the page contains.
5. Preview/open it when the environment supports local HTML preview.

Do not paste the entire HTML source into chat unless the user explicitly requests source code or
the environment cannot create files.

Typical names:

~~~text
conversation-digest.html
requirement-review.html
implementation-plan.html
project-dashboard.html
execution-report.html
results-report.html
comparison-board.html
visual-report.html
~~~

## 14. Quality gate

Before finishing, verify:

### Factual

- objective is clear
- current state is clear
- decisions are separate from open questions
- completed and remaining work are distinguishable
- no unsupported facts are invented
- important technical values are preserved
- next actions are actionable

### Visual

- first screen is useful
- hierarchy is stronger than plain Markdown
- page works without interaction
- tables are used for precise comparison
- charts appear only when justified by data
- status is not encoded by color alone
- mobile width does not break

### Engineering

- self-contained HTML by default
- no unnecessary dependency
- no unnecessary JavaScript
- no fake completion percentage
- no fabricated timeline
- no fabricated metrics
- Chinese text renders correctly

## 15. Default execution procedure

### Step 1 — Determine source

Identify whether the source is current conversation, explicit user text, files, planning workspace,
execution logs, experiment data, or a mixture.

### Step 2 — Extract semantics

Extract objective, requirements, decisions, progress, results, blockers, risks, open questions,
next actions, and important technical references.

### Step 3 — Route to report type

Choose one dominant report type from Section 5.

Use a hybrid only when multiple information modes are genuinely co-primary.

### Step 4 — Design the first screen

Expose current state and high-value summary facts before detail.

### Step 5 — Render details

Use only the sections needed to represent the source faithfully.

### Step 6 — Validate

Check every claimed completion, number, date, and result against source evidence or a transparent
calculation.

### Step 7 — Save

Write the final self-contained HTML artifact.

## 16. Trigger examples

These requests should trigger the skill directly:

~~~text
把上面的聊天盘点一下，做成 HTML 可视化。
把刚才讨论的需求可视化。
把这个 plan 做成一个好看的静态 HTML。
读取 .planning 当前状态，生成 project dashboard。
把两个 agent 的执行结果做一个可视化总结。
把实验结果整理成 HTML report。
把当前项目进展做成一页可以快速浏览的 dashboard。
可视化一下现在完成了什么、还差什么、有什么 blocker。
~~~

Example interpretation:

User says:

~~~text
可视化上文需求
~~~

Then:

- source = current conversation
- choose Requirement Review or Project Overview
- extract requirements, fixed decisions, unresolved items, and next actions
- generate visual-report.html
- do not ask the user to repeat the requirements

## Final rule

A successful report is not the page with the most decoration.

A successful report is the artifact that lets a technical reader understand project state,
decisions, evidence, and next actions in the least time.
