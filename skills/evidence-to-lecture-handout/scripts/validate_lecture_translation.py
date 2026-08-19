#!/usr/bin/env python3
"""Validate language-aware lecture/tutorial records before rendering a PDF."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


FORBIDDEN_ZH = (
    "与该页时间窗严格对齐的讲者说明包括",
    "完整代表帧中的关键信息为",
    "以上整理保持课件术语和数值原貌",
    "精确引用应回到本页原始时间戳证据",
    "本段先交代背景和问题",
    "本段没有需要保留的专有英文术语",
    "相关技术对象包括",
    "TRANSLATION-INCOMPLETE",
)


def note_language_mode(note: dict[str, Any]) -> str:
    mode = str(note.get("languageMode") or "bilingual").strip().lower()
    return mode if mode in {"zh-only", "bilingual"} else "bilingual"


def validate_note(note: dict[str, Any], language_mode: str | None = None) -> list[str]:
    slide = note.get("slide", "?")
    zh = str(note.get("scriptZh") or "").strip()
    en = str(note.get("englishProcessed") or "").strip()
    mode = language_mode or note_language_mode(note)
    errors: list[str] = []
    if not zh:
        errors.append(f"slide {slide}: empty Chinese lecture script")
    if mode == "bilingual" and not en:
        errors.append(f"slide {slide}: empty English lecture script")
    cjk = len(re.findall(r"[\u4e00-\u9fff]", zh))
    latin = len(re.findall(r"[A-Za-z]", zh))
    if cjk < 12:
        errors.append(f"slide {slide}: Chinese script has too little Chinese text ({cjk})")
    if latin > max(80, cjk * 0.7):
        errors.append(f"slide {slide}: Chinese script is dominated by Latin text (cjk={cjk}, latin={latin})")
    if mode == "bilingual" and len(en) >= 300 and len(zh) < max(80, len(en) * 0.18):
        errors.append(
            f"slide {slide}: Chinese script is too compressed for the English scope "
            f"(zh={len(zh)}, en={len(en)})"
        )
    for marker in FORBIDDEN_ZH:
        if marker in zh:
            errors.append(f"slide {slide}: evidence-template text leaked into Chinese script: {marker}")
    sentences = [sentence.strip() for sentence in re.split(r"[。！？]", zh) if len(sentence.strip()) >= 14]
    repeated = {sentence for sentence in sentences if sentences.count(sentence) >= 2}
    if repeated:
        errors.append(f"slide {slide}: repeated boilerplate sentence in Chinese script")
    if mode == "bilingual" and ("…" in en or "..." in en):
        errors.append(f"slide {slide}: English lecture script is truncated")
    if mode == "bilingual" and ("与该页时间窗" in en or "完整代表帧" in en):
        errors.append(f"slide {slide}: evidence-template text leaked into English script")
    if mode == "zh-only":
        if note.get("scriptZhMode") != "original-zh-edited":
            errors.append(f"slide {slide}: zh-only note must use scriptZhMode=original-zh-edited")
        if en:
            errors.append(f"slide {slide}: zh-only note must not contain English lecture script")
    elif note.get("scriptZhMode") not in {None, "translation-of-english"}:
        errors.append(f"slide {slide}: bilingual note must use scriptZhMode=translation-of-english")
    return errors


def validate_notes(path: Path) -> list[str]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, list):
        return [f"{path}: authored notes must be a JSON array"]
    errors: list[str] = []
    language_modes = {note_language_mode(note) for note in value if isinstance(note, dict)}
    if not language_modes:
        return [f"{path}: authored notes contain no note objects"]
    if len(language_modes) != 1:
        errors.append(f"{path}: mixed languageMode values: {sorted(language_modes)}")
    mode = next(iter(language_modes)) if len(language_modes) == 1 else "bilingual"
    for note in value:
        if not isinstance(note, dict):
            errors.append("authored note is not an object")
            continue
        errors.extend(validate_note(note, mode))
    return errors


def validate_qna(path: Path, language_mode: str = "bilingual") -> list[str]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, list):
        return [f"{path}: authored Q&A must be a JSON array"]
    errors: list[str] = []
    for item in value:
        qid = item.get("id", "?") if isinstance(item, dict) else "?"
        for field in ("questionZh", "answerZh"):
            text = str(item.get(field) or "") if isinstance(item, dict) else ""
            cjk = len(re.findall(r"[\u4e00-\u9fff]", text))
            latin = len(re.findall(r"[A-Za-z]", text))
            if cjk < 12 or latin > max(80, cjk * 0.7):
                errors.append(f"{qid}: {field} is not a Chinese lecture answer")
            if "本段按原始问答时间窗完整归档" in text:
                errors.append(f"{qid}: Q&A evidence template leaked into {field}")
        if language_mode == "bilingual" and isinstance(item, dict) and not str(item.get("englishProcessed") or "").strip():
            errors.append(f"{qid}: bilingual Q&A is missing English text")
        if language_mode == "zh-only" and isinstance(item, dict) and str(item.get("englishProcessed") or "").strip():
            errors.append(f"{qid}: zh-only Q&A must not contain English text")
        if language_mode == "bilingual" and isinstance(item, dict) and ("…" in str(item.get("englishProcessed") or "") or "..." in str(item.get("englishProcessed") or "")):
            errors.append(f"{qid}: English Q&A is truncated")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("notes", type=Path)
    parser.add_argument("--qna", type=Path)
    args = parser.parse_args()
    errors = validate_notes(args.notes)
    notes_value = json.loads(args.notes.read_text(encoding="utf-8"))
    mode = note_language_mode(notes_value[0]) if isinstance(notes_value, list) and notes_value and isinstance(notes_value[0], dict) else "bilingual"
    if args.qna:
        errors.extend(validate_qna(args.qna, mode))
    if errors:
        print("\n".join(errors))
        return 1
    print(f"OK: {args.notes}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
