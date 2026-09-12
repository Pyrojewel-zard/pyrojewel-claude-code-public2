#!/usr/bin/env python3
"""Render a compiled Beamer PDF for visual QA.

Creates page PNGs, a contact sheet when Pillow is available, pdfinfo/text dumps,
and a page-level layout-review Markdown skeleton.
"""

from __future__ import annotations

import argparse
import math
import shutil
import subprocess
from pathlib import Path


def run(cmd: list[str], *, stdout: Path | None = None) -> None:
    if not shutil.which(cmd[0]):
        raise RuntimeError(f"required command not found: {cmd[0]}")
    if stdout is None:
        subprocess.run(cmd, check=True)
    else:
        stdout.parent.mkdir(parents=True, exist_ok=True)
        with stdout.open("w", encoding="utf-8") as fh:
            subprocess.run(cmd, check=True, stdout=fh, stderr=subprocess.STDOUT, text=True)


def natural_page_key(path: Path) -> tuple[int, str]:
    digits = "".join(ch for ch in path.stem if ch.isdigit())
    return (int(digits or 0), path.name)


def build_contact_sheet(page_files: list[Path], out_file: Path, cols: int = 4) -> bool:
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        return False

    if not page_files:
        return False

    thumb_w = 480
    label_h = 30
    margin = 16
    thumbs: list[tuple[Image.Image, str]] = []
    max_h = 0
    for idx, page in enumerate(page_files, 1):
        image = Image.open(page).convert("RGB")
        ratio = thumb_w / image.width
        thumb_h = max(1, int(image.height * ratio))
        image = image.resize((thumb_w, thumb_h))
        max_h = max(max_h, thumb_h)
        thumbs.append((image, f"P{idx}"))

    rows = math.ceil(len(thumbs) / cols)
    sheet_w = margin + cols * (thumb_w + margin)
    sheet_h = margin + rows * (max_h + label_h + margin)
    sheet = Image.new("RGB", (sheet_w, sheet_h), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for i, (image, label) in enumerate(thumbs):
        row, col = divmod(i, cols)
        x = margin + col * (thumb_w + margin)
        y = margin + row * (max_h + label_h + margin)
        sheet.paste(image, (x, y))
        draw.text((x + 4, y + image.height + 6), label, fill="black", font=font)

    out_file.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_file)
    return True


def write_review_template(out_file: Path, pages: int) -> None:
    lines = [
        "# Beamer Layout Review",
        "",
        "Inspect `contact-sheet.png` first for rhythm, then each full page PNG for legibility.",
        "Final content QA, theory/evidence QA, and visual QA must all be PASS.",
        "",
        "| page | role | rhythm/hierarchy | equations | figure/labels | source/boundary | defect | fix | status |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    for idx in range(1, pages + 1):
        lines.append(f"| P{idx} |  | TODO | TODO | TODO | TODO |  |  | RECHECK |")
    lines += [
        "",
        "## Final gates",
        "",
        "- [ ] 16:9 page size",
        "- [ ] body text >= 8.0 pt",
        "- [ ] table text >= 7.6 pt",
        "- [ ] figure captions >= 7.0 pt",
        "- [ ] source/footer is one short line",
        "- [ ] frame titles <= 2 rendered lines",
        "- [ ] no cropped equation, axis, legend, caption, or image",
        "- [ ] no missing-image/safeimg placeholder in final output",
        "- [ ] dense source figures have readable internal labels",
        "- [ ] contact-sheet rhythm intentionally varies without arbitrary left/right reversal",
        "",
        "**Content QA:** TODO  ",
        "**Theory/evidence QA:** TODO  ",
        "**Visual QA:** TODO  ",
    ]
    out_file.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--out", type=Path, default=Path("qa"))
    parser.add_argument("--dpi", type=int, default=144)
    parser.add_argument("--cols", type=int, default=4)
    args = parser.parse_args()

    pdf = args.pdf.resolve()
    if not pdf.is_file():
        print(f"FAIL: PDF not found: {pdf}")
        return 1

    out = args.out.resolve()
    pages_dir = out / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)

    try:
        run(["pdfinfo", str(pdf)], stdout=out / "pdfinfo.txt")
        run(["pdftotext", "-layout", str(pdf), str(out / "extracted-text.txt")])
        prefix = pages_dir / "page"
        run(["pdftoppm", "-png", "-r", str(args.dpi), str(pdf), str(prefix)])
    except (RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"FAIL: {exc}")
        return 1

    page_files = sorted(pages_dir.glob("page-*.png"), key=natural_page_key)
    if not page_files:
        print("FAIL: pdftoppm produced no pages")
        return 1

    contact_ok = build_contact_sheet(page_files, out / "contact-sheet.png", cols=max(1, args.cols))
    write_review_template(out / "layout-review.md", len(page_files))

    print(f"PASS: rendered {len(page_files)} pages to {pages_dir}")
    if contact_ok:
        print(f"PASS: contact sheet -> {out / 'contact-sheet.png'}")
    else:
        print("WARN: Pillow unavailable; inspect page PNGs individually")
    print(f"REVIEW: fill {out / 'layout-review.md'} after visual inspection")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
