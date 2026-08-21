#!/usr/bin/env python3
"""Structural validator for paper-reading Beamer decks."""

import argparse
from pathlib import Path

AXIS = "argument-left-evidence-right"
ROLES = {"overview", "theory-figure", "evidence", "discussion", "workflow-overview"}
BAD_JUDGMENT = ("我的判断", "读后一句话", "reader-judgment", "reader_judgment")
EMPTY_VALUES = {"", "...", "-", "待补"}
VAGUE_EQUATION_INSIGHT = {
    "公式见论文",
    "理论推导",
    "公式推导",
    "eq. (x)",
    "eq.(x)",
    "equation",
    "derivation",
}
EQUATION_PROVENANCE = {
    "paper-equation",
    "reader-derived",
    "rf-bridge",
    "textbook-bridge",
    "report-abstraction",
    "n/a",
    "na",
}


def parse_meta(text):
    meta = {}
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return meta
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip().strip("\"'")
    return meta


def parse_table(text):
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if "|" not in line or "role" not in line.lower():
            continue
        headers = [x.strip() for x in line.strip().strip("|").split("|")]
        if not any(h in {"页", "page", "Page"} for h in headers):
            continue
        if i + 1 >= len(lines) or "---" not in lines[i + 1]:
            continue
        rows = []
        for row in lines[i + 2:]:
            if not row.strip().startswith("|"):
                break
            cells = [x.strip() for x in row.strip().strip("|").split("|")]
            if len(cells) == len(headers):
                rows.append(dict(zip(headers, cells)))
        return headers, rows
    return [], []


def pick(row, *names):
    normalized = {k.lower().replace(" ", "").replace("_", "-"): v for k, v in row.items()}
    for name in names:
        key = name.lower().replace(" ", "").replace("_", "-")
        if key in normalized:
            return normalized[key]
    return ""


def validate_outline(path):
    errors = []
    text = path.read_text(encoding="utf-8")
    meta = parse_meta(text)
    if meta.get("report_type") != "paper-reading":
        errors.append("report_type must be paper-reading")
    if meta.get("status") != "approved":
        errors.append("outline status must be approved")
    if meta.get("layout_axis") != AXIS:
        errors.append(f"layout_axis must be {AXIS}")
    note_status = meta.get("note_status", "")
    if not note_status:
        errors.append("note_status is required")

    headers, rows = parse_table(text)
    if not rows:
        errors.append("paper-reading page table not found")
        return errors, [], meta

    required_headers = [
        ("role", "角色"),
        ("title", "标题"),
        ("circuit/equation insight", "equation insight", "公式/电路理解", "公式理解"),
        ("equation provenance", "equation-provenance", "公式来源", "公式出处"),
        ("provenance", "source", "来源", "笔记来源"),
        ("evidence boundary", "evidence-boundary", "boundary", "证据边界"),
        ("layout_axis", "layout-axis", "axis", "布局轴"),
    ]
    for aliases in required_headers:
        if not any(pick({h: h for h in headers}, alias) for alias in aliases):
            errors.append("page table missing column: " + aliases[0])

    content_rows = [r for r in rows if pick(r, "role", "角色") != "workflow-overview"]
    if not 1 <= len(content_rows) <= 4:
        errors.append(f"paper-reading content pages must be 1-4, got {len(content_rows)}")

    seen_roles = []
    for row in rows:
        role = pick(row, "role", "角色")
        title = pick(row, "title", "标题")
        source = pick(row, "provenance", "source", "来源", "笔记来源")
        boundary = pick(row, "evidence boundary", "evidence-boundary", "boundary", "证据边界")
        axis = pick(row, "layout_axis", "layout-axis", "axis", "布局轴")
        mode = pick(row, "discussion_mode", "discussion-mode", "讨论模式")
        equation_insight = pick(
            row,
            "circuit/equation insight",
            "equation insight",
            "公式/电路理解",
            "公式理解",
        )
        equation_provenance = pick(
            row,
            "equation provenance",
            "equation-provenance",
            "公式来源",
            "公式出处",
        ).strip().lower()
        seen_roles.append(role)
        if role not in ROLES:
            errors.append(f"unknown role: {role}")
        if role != "workflow-overview" and axis != AXIS:
            errors.append(f"{role}: axis must be {AXIS}")
        if source in EMPTY_VALUES:
            errors.append(f"{role}: provenance/source is empty")
        if boundary in EMPTY_VALUES:
            errors.append(f"{role}: evidence boundary is empty")
        if not equation_provenance:
            errors.append(f"{role}: equation provenance is empty")
        elif equation_provenance not in EQUATION_PROVENANCE:
            errors.append(
                f"{role}: invalid equation provenance '{equation_provenance}'; "
                "use paper-equation, reader-derived, rf-bridge, textbook-bridge, "
                "report-abstraction, or n/a"
            )
        if role == "theory-figure":
            normalized_insight = equation_insight.strip().lower()
            if equation_insight in EMPTY_VALUES or normalized_insight in VAGUE_EQUATION_INSIGHT:
                errors.append(
                    "theory-figure: circuit/equation insight must explain derivation, "
                    "physical meaning, trade-off, and design implication"
                )
            if equation_provenance in {"n/a", "na"}:
                errors.append("theory-figure: equation provenance cannot be n/a")
        if role == "discussion" and note_status != "complete":
            joined = " ".join([title, mode, " ".join(row.values())])
            if any(token in joined for token in BAD_JUDGMENT):
                errors.append("incomplete note cannot claim reader-authored judgment; use reading-tension")

    if "overview" not in seen_roles:
        errors.append("overview role is required")
    if not ({"theory-figure", "evidence"} & set(seen_roles)):
        errors.append("theory-figure or evidence role is required")
    return errors, rows, meta


def validate_tex(path, rows):
    errors = []
    text = path.read_text(encoding="utf-8")
    if "image-left-text-right" in text:
        errors.append("forbidden reversed layout: image-left-text-right")
    expected = len([r for r in rows if pick(r, "role", "角色") != "workflow-overview"])
    blocks = text.split("% paper-reading-role:")[1:]
    if len(blocks) < expected:
        errors.append(f"TeX has {len(blocks)} marked paper-reading frames, expected at least {expected}")
    for index, block in enumerate(blocks[:expected], 1):
        header = block.split("\\begin{frame}", 1)[0]
        if f"% paper-reading-axis: {AXIS}" not in header:
            errors.append(f"TeX frame {index}: missing fixed axis marker")
        if "% paper-reading-source:" not in header:
            errors.append(f"TeX frame {index}: missing source marker")
        if "% paper-reading-boundary:" not in header:
            errors.append(f"TeX frame {index}: missing boundary marker")
        if "% paper-reading-equation-provenance:" not in header:
            errors.append(f"TeX frame {index}: missing equation provenance marker")
    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--outline", required=True, type=Path)
    parser.add_argument("--tex", type=Path)
    args = parser.parse_args()

    if not args.outline.is_file():
        print(f"FAIL: outline not found: {args.outline}")
        return 1
    errors, rows, _ = validate_outline(args.outline)
    if args.tex:
        if not args.tex.is_file():
            errors.append(f"TeX file not found: {args.tex}")
        elif rows:
            errors.extend(validate_tex(args.tex, rows))
    if errors:
        print("FAIL: paper-reading deck contract")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"PASS: paper-reading deck contract ({len(rows)} planned rows)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
