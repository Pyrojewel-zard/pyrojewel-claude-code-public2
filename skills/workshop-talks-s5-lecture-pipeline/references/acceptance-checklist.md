# Workshop Talk Acceptance Checklist

Run this checklist per Talk before moving staging to the final output tree.

## S5 media evidence

- [ ] `/health` and `/ready` passed before the run.
- [ ] `manifest.json` is `complete`; failed stages have logs and a resumable checkpoint.
- [ ] Whisper source has non-empty segments, valid positive intervals, monotonic timestamps, and covers the media duration.
- [ ] `slides.json` is non-empty; timestamps are strictly increasing.
- [ ] Every final image exists, is PNG/JPG, has consistent full-frame dimensions, and is not from `review/pip/`.
- [ ] `slides.pdf` is image-only, readable, and has the same page count as `slides.json`.
- [ ] Page-track, OCR, page-number, deduplication, PIP/camera, contact-sheet, and `review/slide-content-audit.jsonl` evidence exist.
- [ ] `mask.analysisOnly=true` and `mask.applied=false` for final image assets.
- [ ] Contact-sheet inspection has no full-screen speaker, participant-only, blank, or application-window page.

## Handoff and authoring

- [ ] `handoff.json` is built from the current staging output, not an old handout.
- [ ] `unassignedTranscript=[]` and `multiplyAssignedTranscript=[]`.
- [ ] Every page has an image, time window, OCR evidence, and transcript references.
- [ ] Every page has `scriptZhMode=translation-of-english`.
- [ ] English prose is edited lecture speech, not raw ASR or a summary.
- [ ] Chinese prose translates the English prose at comparable fact density.
- [ ] `analysisZh` and `derivations` are visibly separate and do not hide translation omissions.
- [ ] Moderator, Q&A, and closing speech are retained when present; absent Q&A is explicitly recorded.
- [ ] `lecture-script.en.md` and `lecture-script.zh.md` cover the same pages and Q&A.

## Local handout

- [ ] `handout.md` exists and has one image-backed page unit per evidence page.
- [ ] `handout.tex` contains no raw transcript body or PIP crop asset.
- [ ] Two XeLaTeX passes ran in a fresh local directory.
- [ ] `pdfinfo` reads the final PDF, reports A4 portrait dimensions, and reports a positive page count.
- [ ] Logs contain no hard LaTeX error, missing image, xref/trailer, or stale-aux failure.
- [ ] `validate_workshop_talk_outputs.py --stage full` passes.
- [ ] `audit_workshop_translation.py` passes for the complete final root.

If any box is unchecked, status is `incomplete`; preserve the evidence and do
not move or report the Talk as accepted.
