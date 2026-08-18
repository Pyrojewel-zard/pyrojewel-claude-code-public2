#!/usr/bin/env python3
"""Validate the structural evidence contract of a reproduction Beamer deck.

The generator writes two comments immediately before each paper frame:

    % repro-paper: PAPER_ID
    % repro-role: paper-code-map

This validator deliberately checks source structure and file provenance. It does
not judge numerical accuracy; that remains the responsibility of the experiment
record and the page-level QA report.
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


REQUIRED_ROLES = {
    "overview",
    "algorithm-derivation",
    "paper-code-map",
    "reproduction-result",
}
ALLOWED_ROLES = REQUIRED_ROLES | {"optional-boundary", "pole-zero-circuit"}
PAPER_MARKER = re.compile(r"^\s*%\s*repro-paper:\s*([^\s%]+)\s*$")
ROLE_MARKER = re.compile(r"^\s*%\s*repro-role:\s*([^\s%]+)\s*$")
IMAGE_REF = re.compile(r"\\includegraphics(?:\[[^]]*\])?\{([^}]+)\}")
FIGURE_CALL = re.compile(r"\\(?:includegraphics|widewithsource|resultwithsource)\s*\{")
CODE_PATH = re.compile(r"\\(?:codeentry|path)\{[^{}]+:[^{}]+\}")
STATUS_LABEL = re.compile(
    r"\\statuslabel\{(?:paper-faithful|formula-mapped-minimal|project-extension|not-reproduced)\}"
)


@dataclass
class PageMarker:
    paper_id: str
    role: str = ""
    start_line: int = 0
    text: list[str] = field(default_factory=list)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Check page roles, code mapping, result figures, and source paths."
    )
    parser.add_argument("--tex", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--pdf", required=True, type=Path)
    return parser.parse_args()


def load_manifest(path: Path) -> dict[str, Any]:
    try:
        import yaml
    except ImportError as exc:  # pragma: no cover - environment diagnostic
        raise RuntimeError("PyYAML is required to read reproduction_manifest.yaml") from exc

    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        raise RuntimeError(f"cannot read manifest {path}: {exc}") from exc
    if not isinstance(data, dict) or not isinstance(data.get("papers"), list):
        raise RuntimeError("manifest must contain a top-level 'papers' list")
    return data


def parse_markers(tex_path: Path) -> list[PageMarker]:
    markers: list[PageMarker] = []
    current: PageMarker | None = None
    lines = tex_path.read_text(encoding="utf-8").splitlines()
    for line_number, line in enumerate(lines, start=1):
        paper_match = PAPER_MARKER.match(line)
        if paper_match:
            current = PageMarker(paper_id=paper_match.group(1), start_line=line_number)
            markers.append(current)
            continue
        role_match = ROLE_MARKER.match(line)
        if role_match and current is not None:
            current.role = role_match.group(1)
            continue
        if current is not None:
            current.text.append(line)
    return markers


def flatten_paths(value: Any, key: str = "", in_figures: bool = False) -> list[str]:
    """Return declared figure paths; code entries may point outside the deck."""
    paths: list[str] = []
    if isinstance(value, dict):
        for child_key, child_value in value.items():
            child_key_text = f"{key}.{child_key}" if key else str(child_key)
            child_in_figures = in_figures or child_key.lower() == "figures"
            paths.extend(flatten_paths(child_value, child_key_text, child_in_figures))
    elif isinstance(value, list):
        for child_value in value:
            paths.extend(flatten_paths(child_value, key, in_figures))
    elif isinstance(value, str) and in_figures:
        paths.append(value)
    return paths


def count_pdf_pages(pdf_path: Path) -> int:
    """Use pdfinfo when available; return zero if the PDF is not inspectable."""
    import shutil
    import subprocess

    if shutil.which("pdfinfo") is None:
        return 0
    result = subprocess.run(
        ["pdfinfo", str(pdf_path)], capture_output=True, text=True, check=False
    )
    match = re.search(r"^Pages:\s+(\d+)\s*$", result.stdout, flags=re.MULTILINE)
    return int(match.group(1)) if match else 0


def validate(tex_path: Path, manifest_path: Path, pdf_path: Path) -> list[str]:
    errors: list[str] = []
    if not tex_path.is_file():
        errors.append(f"TeX file not found: {tex_path}")
        return errors
    if not manifest_path.is_file():
        errors.append(f"manifest not found: {manifest_path}")
        return errors
    if not pdf_path.is_file():
        errors.append(f"PDF not found: {pdf_path}")
        return errors

    try:
        manifest = load_manifest(manifest_path)
    except RuntimeError as exc:
        errors.append(str(exc))
        return errors

    markers = parse_markers(tex_path)
    if not markers:
        errors.append("no '% repro-paper' markers found in TeX source")
        return errors

    manifest_papers = {
        str(entry.get("paper_id")): entry
        for entry in manifest["papers"]
        if isinstance(entry, dict) and entry.get("paper_id")
    }
    marker_papers: dict[str, list[PageMarker]] = {}
    for marker in markers:
        marker_papers.setdefault(marker.paper_id, []).append(marker)
        if marker.role not in ALLOWED_ROLES:
            errors.append(
                f"line {marker.start_line}: unknown role '{marker.role}' for {marker.paper_id}"
            )
        if not marker.role:
            errors.append(f"line {marker.start_line}: missing repro-role for {marker.paper_id}")

    for paper_id, pages in marker_papers.items():
        if paper_id not in manifest_papers:
            errors.append(f"{paper_id}: missing from manifest")
        if not 2 <= len(pages) <= 5:
            errors.append(f"{paper_id}: {len(pages)} marked pages, expected 2-5")
        roles = {page.role for page in pages}
        missing_roles = REQUIRED_ROLES - roles
        if missing_roles:
            errors.append(f"{paper_id}: missing roles {sorted(missing_roles)}")

        code_pages = [page for page in pages if page.role == "paper-code-map"]
        for page in code_pages:
            page_text = "\n".join(page.text)
            if not CODE_PATH.search(page_text):
                errors.append(f"{paper_id}: paper-code-map lacks a file:function code path")
            if not STATUS_LABEL.search(page_text):
                errors.append(f"{paper_id}: paper-code-map lacks an implementation status label")

        result_pages = [page for page in pages if page.role == "reproduction-result"]
        for page in result_pages:
            page_text = "\n".join(page.text)
            if not FIGURE_CALL.search(page_text):
                errors.append(
                    f"{paper_id}: reproduction-result lacks an image or result-figure macro"
                )

    unknown_manifest_papers = sorted(set(manifest_papers) - set(marker_papers))
    for paper_id in unknown_manifest_papers:
        errors.append(f"{paper_id}: manifest entry has no marked TeX pages")

    # This catches an old deck that embeds the former full-bleed divider directly.
    tex_text = tex_path.read_text(encoding="utf-8")
    if re.search(r"\\fill\s*\[accentcolor\].*current page", tex_text, flags=re.DOTALL):
        errors.append("TeX contains the old full-bleed accentcolor section divider")
    if re.search(r"background canvas.*accentcolor", tex_text, flags=re.DOTALL):
        errors.append("TeX contains a full-page accentcolor background")

    # Validate all declared figure/path entries against the manifest directory.
    for declared_path in flatten_paths(manifest):
        path = Path(declared_path)
        if not path.is_absolute():
            # Manifest paths are written relative to the presentation root,
            # while the manifest itself lives under materials/.
            path = tex_path.parent / path
        if not path.is_file():
            errors.append(f"manifest figure/path not found: {declared_path}")

    page_count = count_pdf_pages(pdf_path)
    if page_count == 0:
        errors.append("could not read PDF page count with pdfinfo")
    elif page_count < len(markers) + 1:
        errors.append(
            f"PDF has {page_count} pages but {len(markers)} paper pages plus cover/closing are marked"
        )
    return errors


def main() -> int:
    args = parse_args()
    try:
        errors = validate(args.tex, args.manifest, args.pdf)
    except (OSError, RuntimeError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 2
    if errors:
        print("FAIL: reproduction deck contract", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    page_count = count_pdf_pages(args.pdf)
    print(f"PASS: reproduction deck contract ({page_count} PDF pages)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
