---
name: workshop-talks-s5-lecture-pipeline
description: Use when processing Workshop Talk videos into complete slide evidence, timestamp-aligned bilingual lecture scripts, and final A4 handout PDFs, especially when media/OCR must run on RFRLSERVER5 and compilation must run locally.
argument-hint: "[talk-number|talk-range|video-path] [--resume]"
allowed-tools: Bash(*), Read, Write, Edit, Grep, Glob, Skill
---

# Workshop Talks: S5 to A4 Handout

Use this skill to orchestrate one or more Workshop Talks. It coordinates the
project's S5 media pipeline and then invokes the evidence authoring skill. It
does not replace `evidence-to-lecture-handout`.

**REQUIRED SUB-SKILL:** Invoke `evidence-to-lecture-handout` for the final
page-aligned bilingual handout and XeLaTeX artifact.

## Non-negotiable contract

- Repository: `/home/DataTransfer/Pyrojewel/code/01_lab/summarize`.
- Video: `<repo>/video/Workshop Talk <N>_*.mp4`; resolve the actual filename.
- S5 staging: `/home/DataTransfer/s5-jobs/talk-NN/`.
- Accepted output: `<repo>/output/workshop-talks/talk-NN/`.
- S5 runs Whisper, ffmpeg, frame sampling, PaddleOCR, page OCR, PIP analysis,
  page-track, deduplication, representative-frame selection, and image-only
  `slides.pdf`. The local machine authors with Codex, renders Markdown, and
  compiles XeLaTeX.
- Use one Talk at a time by default. Parallelism is allowed only after a serial
  Talk passes all gates and each task has independent staging, locks, logs, and
  checkpoints.
- Existing handouts, authored notes, scripts, Markdown, TeX, and PDFs are failed
  outputs, not authoring inputs. Read only fresh handoff, complete source frames,
  OCR/page-track evidence, and timestamped Whisper evidence.

## Pipeline

### 1. Resolve and preflight

Create a per-Talk state record under staging and record the resolved video path.
Probe S5 before starting media work:

```bash
cd /home/DataTransfer/Pyrojewel/code/01_lab/summarize
python3 -m s5_remote.s5ctl --host RFRLSERVER5 \
  --whisper-s5-url http://10.161.120.16:8490 probe
```

`/health` and `/ready` must be healthy. A slow SSH session is not a reason to
run media locally. Reuse an existing valid S5 Whisper checkpoint only after
checking its timestamps and source signature; otherwise submit the worker:

```bash
python3 -m s5_remote.s5ctl submit "$VIDEO" \
  --work-dir "/home/DataTransfer/s5-jobs/talk-$NN" \
  --cli /home/DataTransfer/Pyrojewel/code/01_lab/summarize/dist/esm/cli.js \
  --detach
```

Use `status`, `retry`, and stage logs to resume. Never report a worker as
complete from a submitted process alone.

### 2. S5 slide gate

The production worker uses these settings: adjacent sample interval 5 seconds,
similarity threshold `0.98`, Paddle OCR page ROI `both`,
`--slides-pip-crop false`, and `--slides-llm-filter true`. PIP/camera masks are
analysis-only. Final slide images are complete uncropped representative frames.
Page-number OCR is an ordering signal; combine page number, OCR tokens, content
fingerprint, and timeline order. Keep same-number content variants and genuine
slides with small PIP overlays; remove only high-confidence camera-only,
participant-only, blank, or application-window frames.

Before handoff, run:

```bash
python3 scripts/validate_workshop_talk_outputs.py \
  --work-dir "/home/DataTransfer/s5-jobs/talk-$NN" --talk "$N" --stage slides
```

Do not author a handout if this gate fails. Preserve the failed manifest and
stage log.

### 3. Build a fresh lossless handoff

Run the project evidence preparer against the S5 staging directory:

```bash
python3 scripts/prepare_workshop_handout_evidence.py \
  --work-dir "/home/DataTransfer/s5-jobs/talk-$NN" \
  --output-dir "/home/DataTransfer/s5-jobs/talk-$NN/lecture-handout" \
  --talk "$N"
```

The handoff must contain complete frames, page time windows, OCR, page number,
mask metadata, and exact-once transcript assignment. It must have
`unassignedTranscript=[]`, `multiplyAssignedTranscript=[]`, and
`maskContract={"analysisOnly":true,"applied":false}`. A missing transcript is
an explicit `incomplete` state, not a prompt to fabricate lecture prose.

### 4. Codex authoring

For every slide, read the image together with its time-window transcript. Write
`authored-notes.json`, `authored-qna.json`, `lecture-script.en.md`, and
`lecture-script.zh.md` in the staging handout directory.

- `englishProcessed` is edited, readable lecture prose: repair ASR errors and
  filler, preserve every substantive claim, number, qualifier, transition,
  moderator utterance, Q&A item, and closing segment.
- `scriptZhMode` is `translation-of-english`; `scriptZh` is a complete Chinese
  translation plus light polish of that English record, not an independent
  summary.
- Codex background explanations, terminology help, and optional derivations
  belong only in `analysisZh` and `derivations`, with evidence labels. Do not
  use the `.env` LLM or vision API as the final report author.
- Do not copy raw ASR into the handout body. Keep it in `transcript-full.md`
  and handoff sources for audit.

Run the translation validator before rendering:

```bash
python3 scripts/validate_lecture_translation.py \
  "/home/DataTransfer/s5-jobs/talk-$NN/lecture-handout/authored-notes.json" \
  --qna "/home/DataTransfer/s5-jobs/talk-$NN/lecture-handout/authored-qna.json"
```

### 5. Final evidence skill and local PDF

After the validator passes, invoke `evidence-to-lecture-handout` with the fresh
`handoff.json`, authored notes, Q&A, and complete frame assets. It must render
`handout.md` and `handout/handout.tex`; the final document is A4 portrait and
contains full slide images, Chinese translation, processed English explanation,
separate Codex analysis/derivations, and Q&A. Do not use PIP crops.

Compile in a new local temporary directory on every attempt, with no old
`.aux`, `.toc`, `.out`, or partial PDF. Run XeLaTeX twice, then require:

```bash
pdfinfo handout.pdf | grep -E 'Pages:|Page size:.*(595.28|841.89)'
```

Copy the verified PDF back to the staging handout only after both passes have
finished. An xref/trailer error, missing image, hard LaTeX error, or stale-aux
failure keeps the Talk incomplete.

### 6. Audit and move

Run the full per-Talk validator and the translation audit. Check contact sheet,
opening/technical/formula/result/revisit/Q&A/closing pages, and all image paths.
Only after every gate passes, move the staging directory:

```bash
mv /home/DataTransfer/s5-jobs/talk-$NN \
  /home/DataTransfer/Pyrojewel/code/01_lab/summarize/output/workshop-talks/talk-$NN
```

Never copy, overwrite an existing accepted directory, or leave a second
authoritative tree. For a range, repeat this entire gate sequence serially and
write a summary table only after all Talks are individually accepted.

## Resume and failure rules

The worker manifest is the checkpoint source. Resume the first non-accepted
stage; do not rerun successful S5 stages merely to make a later handout look
fresh. Keep `logs/<stage>.log`, failed manifests, and audit JSONL. Any missing
evidence, semantic translation uncertainty, count mismatch, camera-only page,
or unreadable PDF is `incomplete` and must be reported with its exact stage.

## Verification reference

Use `references/acceptance-checklist.md` for the complete deterministic and
manual checklist. The RED pressure cases and their expected failure modes are
in `test-prompts.json`; do not weaken the gates to make a pressured batch look
complete.
