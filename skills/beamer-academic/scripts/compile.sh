#!/bin/bash
# Compile Beamer LaTeX to PDF, then prepare rendered visual-QA artifacts.
# Usage: bash scripts/compile.sh [filename]

set -euo pipefail

FILE="${1:-defense.tex}"
BASE="${FILE%.tex}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Compiling ${FILE}..."
xelatex -interaction=nonstopmode -halt-on-error "${FILE}"
xelatex -interaction=nonstopmode -halt-on-error "${FILE}"

if [ ! -f "${BASE}.pdf" ]; then
    echo "❌ Compilation failed. Check ${BASE}.log for errors."
    exit 1
fi

echo "✅ ${BASE}.pdf generated successfully"

if command -v rg >/dev/null 2>&1; then
    echo "Checking LaTeX layout warnings..."
    if rg -n "LaTeX Error|Missing character|Overfull \\\\hbox|Overfull \\\\vbox" "${BASE}.log"; then
        echo "⚠️  Layout/error patterns found above; visual QA cannot pass until explained or repaired."
    else
        echo "✅ No common LaTeX error/overflow patterns found"
    fi
fi

if command -v python3 >/dev/null 2>&1 \
   && command -v pdfinfo >/dev/null 2>&1 \
   && command -v pdftotext >/dev/null 2>&1 \
   && command -v pdftoppm >/dev/null 2>&1; then
    echo "Rendering PDF for visual QA..."
    python3 "${SCRIPT_DIR}/render_visual_qa.py" "${BASE}.pdf" --out qa
    echo "🔎 Inspect qa/contact-sheet.png and qa/pages/, then fill qa/layout-review.md."
else
    echo "⚠️  Poppler/Python visual-QA tools unavailable. Run the equivalent pdfinfo/pdftotext/pdftoppm checks manually before final delivery."
fi
