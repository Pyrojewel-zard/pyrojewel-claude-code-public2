#!/usr/bin/env bash
# ============================================================
# pyrojewel-beamer-academic  —  Compile Script
# ============================================================
# Usage:
#   ./compile.sh [TEXFILE]              # Compile once
#   ./compile.sh [TEXFILE] --full       # Full build (2 passes for refs)
#   ./compile.sh [TEXFILE] --watch      # Recompile on change (requires fswatch)
#   ./compile.sh [TEXFILE] --output-dir DIR  # Output to specific directory
#
# If TEXFILE is omitted, looks for *.tex in current directory.

set -euo pipefail

# ---------- Parse arguments ----------
TEXFILE=""
FULL_BUILD=false
OUTPUT_DIR_ARG=""
INVOCATION_DIR="$(pwd)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --full)        FULL_BUILD=true; shift ;;
    --output-dir)
      if [[ -z "${2:-}" || "${2:-}" == -* ]]; then
        echo "ERROR: --output-dir requires a directory value"
        exit 1
      fi
      OUTPUT_DIR_ARG="$2"; shift 2 ;;
    --output-dir=*) OUTPUT_DIR_ARG="${1#--output-dir=}"; shift ;;
    -*)            echo "Unknown option: $1"; exit 1 ;;
    *)             TEXFILE="$1"; shift ;;
  esac
done

if [[ -z "$TEXFILE" ]]; then
  TEXFILE=$(ls ./*.tex 2>/dev/null | head -1)
fi

if [[ -z "$TEXFILE" || ! -f "$TEXFILE" ]]; then
  echo "ERROR: No .tex file found. Usage: $0 [file.tex] [--full] [--output-dir DIR]"
  exit 1
fi

BASENAME=$(basename "$TEXFILE" .tex)
DIRNAME=$(dirname "$TEXFILE")
TEX_SOURCE_DIR="$(cd "$DIRNAME" && pwd)"
TEX_SOURCE_FILE="$BASENAME.tex"

echo "=== Compiling: $TEXFILE ==="

# ---------- Resolve skill root and output directory ----------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

resolve_output_dir() {
  local explicit_dir="${1:-}"
  local fallback_dir="${2:-}"

  # Priority 1: explicit user path
  if [[ -n "$explicit_dir" ]]; then
    case "$explicit_dir" in
      /*) ;;
      *) explicit_dir="$INVOCATION_DIR/$explicit_dir" ;;
    esac
    mkdir -p "$explicit_dir"
    (cd "$explicit_dir" && pwd)
    return
  fi

  # Priority 2: OBSIDIAN_VAULT_ROOT weekly meeting folder
  if [[ -n "${OBSIDIAN_VAULT_ROOT:-}" && -d "$OBSIDIAN_VAULT_ROOT" ]]; then
    local weekly_rel="${WEEKLY_MEETING_REL:-weekly}"
    local iso_week
    iso_week=$(date +"%G_W%V")
    local target="$OBSIDIAN_VAULT_ROOT/$weekly_rel/$iso_week"
    mkdir -p "$target"
    echo "$target"
    return
  fi

  # Priority 3: local fallback
  mkdir -p "$fallback_dir"
  echo "WARNING: OBSIDIAN_VAULT_ROOT not set; output to $fallback_dir" >&2
  echo "$fallback_dir"
}

RESOLVED_OUTPUT_DIR=$(resolve_output_dir "$OUTPUT_DIR_ARG" "$TEX_SOURCE_DIR")
echo "  Output directory: $RESOLVED_OUTPUT_DIR"

# ---------- Copy assets ----------
if [[ ! -f "$RESOLVED_OUTPUT_DIR/beamerthemeAcademic.sty" ]]; then
  cp "$SKILL_ROOT/assets/beamerthemeAcademic.sty" "$RESOLVED_OUTPUT_DIR/"
  echo "  Copied beamerthemeAcademic.sty"
fi

# ---------- Detect CJK font platform ----------
detect_cjk_font_block() {
  local platform="${1:-auto}"

  if [[ "$platform" == "auto" ]]; then
    if [[ "$(uname)" == "Darwin" ]]; then
      platform="macos"
    else
      platform="linux"
    fi
  fi

  case "$platform" in
    macos)
      echo '\setCJKmainfont{Songti SC}[BoldFont=Heiti SC]\setCJKsansfont{Heiti SC}\setCJKmonofont{STFangsong}'
      ;;
    linux)
      if fc-list | grep -q "AR PL UMing CN"; then
        echo '\setCJKmainfont{AR PL UMing CN}\setCJKsansfont{AR PL UMing CN}\setCJKmonofont{Droid Sans Fallback}'
      else
        echo "WARNING: AR PL UMing CN not found, trying fallback" >&2
        if fc-list | grep -q "Droid Sans Fallback"; then
          echo '\setCJKmainfont{Droid Sans Fallback}\setCJKsansfont{Droid Sans Fallback}\setCJKmonofont{Droid Sans Fallback}'
        else
          echo "ERROR: No suitable CJK font found. Install: apt install fonts-arphic-uming fonts-droid-fallback" >&2
          exit 1
        fi
      fi
      ;;
    *)
      echo "ERROR: Unknown platform '$platform'" >&2
      exit 1
      ;;
  esac
}

# ---------- Compile ----------
compile_pass() {
  local pass_num=$1
  echo "  Pass $pass_num..."
  xelatex -interaction=nonstopmode \
    -halt-on-error \
    -output-directory="$RESOLVED_OUTPUT_DIR" \
    "$TEX_SOURCE_FILE" 2>&1 | tail -5
}

cd "$TEX_SOURCE_DIR"

# First pass
compile_pass 1

if $FULL_BUILD; then
  compile_pass 2
fi

# ---------- Verify ----------
if [[ -f "$RESOLVED_OUTPUT_DIR/${BASENAME}.pdf" ]]; then
  pdf_size=""
  pdf_size=$(stat -f%z "$RESOLVED_OUTPUT_DIR/${BASENAME}.pdf" 2>/dev/null || stat -c%s "$RESOLVED_OUTPUT_DIR/${BASENAME}.pdf" 2>/dev/null || echo "0")
  echo "=== SUCCESS: $RESOLVED_OUTPUT_DIR/${BASENAME}.pdf (${pdf_size} bytes) ==="
else
  echo "=== FAILED: PDF not generated ==="
  if [[ -f "$RESOLVED_OUTPUT_DIR/${BASENAME}.log" ]]; then
    echo "--- Last 20 lines of log ---"
    tail -20 "$RESOLVED_OUTPUT_DIR/${BASENAME}.log"
  fi
  exit 1
fi
