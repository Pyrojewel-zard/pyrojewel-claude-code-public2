#!/usr/bin/env python3
"""Audit every workshop handout before accepting bilingual lecture records."""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location(
    "validate_lecture_translation", SCRIPT_DIR / "validate_lecture_translation.py"
)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)

FORBIDDEN_BODY = (
    "### 时间窗与来源",
    "录音时间窗：",
    "PPT 页码：",
    "绑定 Whisper 片段：",
    "OCR 行数：",
    "Raw transcript evidence",
    "FACT-SLIDE",
    "来源与待核查",
)


def audit_handout(root: Path) -> dict[str, object]:
    notes_path = root / "authored-notes.json"
    qna_path = root / "authored-qna.json"
    notes = json.loads(notes_path.read_text(encoding="utf-8"))
    qna = json.loads(qna_path.read_text(encoding="utf-8"))
    errors = MODULE.validate_notes(notes_path)
    errors.extend(MODULE.validate_qna(qna_path))
    body_errors: list[str] = []
    for relative in ("handout.md", "handout/handout.tex", "lecture-script.zh.md", "lecture-script.en.md"):
        path = root / relative
        if not path.is_file():
            body_errors.append(f"missing {relative}")
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for marker in FORBIDDEN_BODY:
            if marker in text:
                body_errors.append(f"{relative}: forbidden marker {marker}")
    errors.extend(body_errors)
    pdf = root / "handout" / "handout.pdf"
    pdf_errors: list[str] = []
    if pdf.is_file():
        pdf_text = subprocess.run(["pdftotext", str(pdf), "-"], capture_output=True, text=True).stdout
        for marker in FORBIDDEN_BODY:
            if marker in pdf_text:
                pdf_errors.append(f"PDF: forbidden marker {marker}")
        info = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True)
        if info.returncode != 0:
            pdf_errors.append("PDF: pdfinfo failed; file may be incomplete or corrupt")
    errors.extend(pdf_errors)
    return {
        "talk": root.parent.name,
        "pages": len(notes),
        "qna": len(qna),
        "translationPass": not errors,
        "errors": errors,
        "pdfPresent": pdf.is_file(),
        "pdfErrors": pdf_errors,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path("output/workshop-talks"))
    parser.add_argument("--json", type=Path, default=Path("output/workshop-talks/translation-audit.json"))
    parser.add_argument("--markdown", type=Path, default=Path("output/workshop-talks/translation-audit.md"))
    args = parser.parse_args()
    results = [audit_handout(root) for root in sorted(args.root.glob("talk-*/lecture-handout"))]
    args.json.parent.mkdir(parents=True, exist_ok=True)
    args.json.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# Workshop 双语讲演录全量审计", "", "| Talk | 页数 | Q&A | 翻译校验 | PDF | 错误数 |", "|---|---:|---:|---|---|---:|"]
    for result in results:
        lines.append(
            f"| {result['talk']} | {result['pages']} | {result['qna']} | "
            f"{'PASS' if result['translationPass'] else 'FAIL'} | "
            f"{'present' if result['pdfPresent'] else 'missing'} | {len(result['errors'])} |"
        )
    args.markdown.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"talks": len(results), "passed": sum(bool(x["translationPass"]) for x in results), "json": str(args.json), "markdown": str(args.markdown)}, ensure_ascii=False))
    return 0 if all(bool(result["translationPass"]) for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
